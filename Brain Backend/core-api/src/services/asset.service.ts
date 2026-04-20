/**
 * Asset Service — CRUD, upload flow, download access
 */

import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../lib/db.js';
import { assets, assetPurchases, users } from '../schemas/db/index.js';
import { getSignedUploadUrl, getSignedDownloadUrl, getPublicUrl, R2Keys, ALLOWED_ASSET_TYPES } from '../lib/r2.js';
import { redis, RedisKeys, incrementDownloadCount } from '../lib/redis.js';
import { publishEvent, notifyUser } from '../lib/events.js';
import { writeAuditLog } from '../lib/audit.js';
import { AppError, ErrorCodes } from '../types/index.js';
import { Queue } from 'bullmq';
import { bullmqConnection } from '../lib/redis.js';
import crypto from 'node:crypto';

const thumbnailQueue = new Queue('thumbnail-generation', { connection: bullmqConnection });
const watermarkQueue = new Queue('watermark-generation', { connection: bullmqConnection });
const moderationQueue = new Queue('moderation-scan', { connection: bullmqConnection });
const searchIndexQueue = new Queue('search-indexing', { connection: bullmqConnection });
const vectorEmbedQueue = new Queue('vector-embedding', { connection: bullmqConnection });

// ── Upload Flow ───────────────────────────────────────────────────────────────

export async function requestUploadUrl(params: {
  sellerId: string;
  filename: string;
  contentType: string;
  fileSize: number;
}) {
  if (!ALLOWED_ASSET_TYPES.has(params.contentType)) {
    throw new AppError(ErrorCodes.VALIDATION_ERROR, `File type ${params.contentType} is not allowed`, 422);
  }

  const maxBytes = parseInt(process.env.MAX_UPLOAD_SIZE_MB ?? '500') * 1024 * 1024;
  if (params.fileSize > maxBytes) {
    throw new AppError(ErrorCodes.VALIDATION_ERROR, `File size exceeds ${process.env.MAX_UPLOAD_SIZE_MB}MB limit`, 422);
  }

  const assetId = crypto.randomUUID();
  const ext = params.filename.split('.').pop() ?? 'bin';
  const key = R2Keys.original(assetId, `original.${ext}`);

  const uploadUrl = await getSignedUploadUrl({ key, contentType: params.contentType, maxSizeBytes: params.fileSize });

  return { uploadUrl, assetId, key, expiresAt: new Date(Date.now() + 15 * 60 * 1000) };
}

export async function completeUpload(params: {
  assetId: string;
  sellerId: string;
  title: string;
  description?: string;
  type: string;
  category: string;
  subcategory?: string;
  tags: string[];
  licenseType: string;
  isFree: boolean;
  price: number;
  extendedPrice?: number;
  originalKey: string;
  contentType: string;
  fileSize: number;
}) {
  const slug = `${params.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${params.assetId.slice(0, 8)}`;

  const [asset] = await db.insert(assets).values({
    id: params.assetId,
    sellerId: params.sellerId,
    title: params.title,
    slug,
    description: params.description,
    type: params.type as any,
    category: params.category,
    subcategory: params.subcategory,
    tags: params.tags,
    licenseType: params.licenseType as any,
    isFree: params.isFree,
    price: params.isFree ? 0 : params.price,
    extendedPrice: params.extendedPrice,
    originalKey: params.originalKey,
    fileMimeType: params.contentType,
    fileSize: params.fileSize,
    status: 'pending_review',
  }).returning();

  // Enqueue processing jobs
  await Promise.all([
    thumbnailQueue.add('generate-thumbnail', { assetId: asset.id, fileKey: params.originalKey }),
    watermarkQueue.add('generate-watermark', { assetId: asset.id, fileKey: params.originalKey }),
    moderationQueue.add('scan-asset', { assetId: asset.id, fileKeys: [params.originalKey] }),
  ]);

  await publishEvent('asset.uploaded', { assetId: asset.id, sellerId: params.sellerId });
  await writeAuditLog({ action: 'asset.upload', actorId: params.sellerId, targetId: asset.id, targetType: 'asset' });

  return asset;
}

// ── Download Flow ─────────────────────────────────────────────────────────────

export async function getDownloadUrl(params: { assetId: string; userId: string; licenseType: string }) {
  const asset = await db.query.assets.findFirst({ where: eq(assets.id, params.assetId) });
  if (!asset || asset.status !== 'approved') {
    throw new AppError(ErrorCodes.NOT_FOUND, 'Asset not found', 404);
  }

  const isFreeAsset = asset.isFree;
  let fileKey: string;
  let filename: string;

  if (isFreeAsset) {
    // Return watermarked version for free downloads
    fileKey = asset.watermarkedKey ?? asset.originalKey ?? '';
    filename = `${asset.slug}-watermarked.${asset.fileExtension ?? 'file'}`;
  } else {
    // Verify ownership
    const purchase = await db.query.assetPurchases.findFirst({
      where: and(eq(assetPurchases.assetId, params.assetId), eq(assetPurchases.buyerId, params.userId)),
    });
    if (!purchase) {
      throw new AppError(ErrorCodes.ASSET_NOT_OWNED, 'You have not purchased this asset', 403);
    }
    fileKey = asset.originalKey ?? '';
    filename = `${asset.slug}.${asset.fileExtension ?? 'file'}`;

    // Update download record
    await db.update(assetPurchases)
      .set({ downloadCount: sql`${assetPurchases.downloadCount} + 1`, lastDownloadedAt: new Date() })
      .where(and(eq(assetPurchases.assetId, params.assetId), eq(assetPurchases.buyerId, params.userId)));
  }

  if (!fileKey) throw new AppError(ErrorCodes.NOT_FOUND, 'Asset file not available', 404);

  await incrementDownloadCount(params.assetId);
  await writeAuditLog({ action: 'asset.download', actorId: params.userId, targetId: params.assetId, targetType: 'asset' });

  const downloadUrl = await getSignedDownloadUrl(fileKey, filename);
  return { downloadUrl, expiresAt: new Date(Date.now() + 30 * 60 * 1000), filename };
}

// ── Approve / Reject (Admin) ──────────────────────────────────────────────────

export async function approveAsset(assetId: string, adminId: string) {
  const [asset] = await db.update(assets)
    .set({ status: 'approved', approvedAt: new Date(), approvedBy: adminId })
    .where(eq(assets.id, assetId))
    .returning();

  if (!asset) throw new AppError(ErrorCodes.NOT_FOUND, 'Asset not found', 404);

  await Promise.all([
    searchIndexQueue.add('index-asset', { entityType: 'asset', entityId: assetId, operation: 'upsert' }),
    vectorEmbedQueue.add('embed-asset', { assetId, textContent: `${asset.title} ${asset.description ?? ''} ${(asset.tags as string[]).join(' ')}` }),
    notifyUser(asset.sellerId, 'asset:status', { assetId, newStatus: 'approved' }),
    publishEvent('asset.approved', { assetId, sellerId: asset.sellerId }),
    writeAuditLog({ action: 'asset.approve', actorId: adminId, targetId: assetId, targetType: 'asset' }),
  ]);

  return asset;
}

export async function rejectAsset(assetId: string, adminId: string, reason: string) {
  const [asset] = await db.update(assets)
    .set({ status: 'rejected', rejectionReason: reason })
    .where(eq(assets.id, assetId))
    .returning();

  if (!asset) throw new AppError(ErrorCodes.NOT_FOUND, 'Asset not found', 404);

  await Promise.all([
    notifyUser(asset.sellerId, 'asset:status', { assetId, newStatus: 'rejected', reason }),
    publishEvent('asset.rejected', { assetId, sellerId: asset.sellerId }),
    writeAuditLog({ action: 'asset.reject', actorId: adminId, targetId: assetId, targetType: 'asset', metadata: { reason } }),
  ]);

  return asset;
}

// ── Public Asset Query ────────────────────────────────────────────────────────

export async function getAssetById(assetId: string) {
  const asset = await db.query.assets.findFirst({
    where: and(eq(assets.id, assetId), eq(assets.status, 'approved')),
    with: { seller: { columns: { id: true, username: true, displayName: true, avatarUrl: true, sellerLevel: true, avgRating: true } } },
  } as any);
  if (!asset) throw new AppError(ErrorCodes.NOT_FOUND, 'Asset not found', 404);

  // Increment view count via Redis
  await redis.incr(`view:count:${assetId}`);

  return asset;
}
