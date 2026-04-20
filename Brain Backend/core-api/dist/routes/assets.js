/**
 * Routes — Assets
 * GET/POST /assets, upload-url, upload-complete, download, approve, reject
 */
import { z } from 'zod';
import { verifyJwt } from '../middleware/auth.js';
import { requireSeller, requireAdmin } from '../middleware/rbac.js';
import { requestUploadUrl, completeUpload, getDownloadUrl, approveAsset, rejectAsset, getAssetById } from '../services/asset.service.js';
import { db } from '../lib/db.js';
import { assets } from '../schemas/db/index.js';
import { eq, desc } from 'drizzle-orm';
const uploadUrlSchema = z.object({
    filename: z.string().min(1),
    content_type: z.string().min(1),
    file_size: z.number().positive().max(500 * 1024 * 1024),
});
const completeUploadSchema = z.object({
    asset_id: z.string().uuid(),
    original_key: z.string().min(1),
    title: z.string().min(3).max(255),
    description: z.string().max(5000).optional(),
    type: z.enum(['image', 'video', 'audio', 'template', 'vector', 'font', 'ui_kit', 'other']),
    category: z.string().min(1),
    subcategory: z.string().optional(),
    tags: z.array(z.string()).max(20),
    license_type: z.enum(['free', 'standard', 'extended']),
    is_free: z.boolean(),
    price: z.number().min(0),
    extended_price: z.number().min(0).optional(),
    content_type: z.string(),
    file_size: z.number().positive(),
});
export async function assetRoutes(app) {
    // ── Request signed upload URL ─────────────────────────────────────────────
    app.post('/upload-url', { preHandler: [verifyJwt, requireSeller] }, async (request, reply) => {
        const body = uploadUrlSchema.parse(request.body);
        const result = await requestUploadUrl({
            sellerId: request.user.userId,
            filename: body.filename,
            contentType: body.content_type,
            fileSize: body.file_size,
        });
        return reply.send({ success: true, data: result });
    });
    // ── Notify upload complete + create asset record ──────────────────────────
    app.post('/upload-complete', { preHandler: [verifyJwt, requireSeller] }, async (request, reply) => {
        const body = completeUploadSchema.parse(request.body);
        const asset = await completeUpload({
            assetId: body.asset_id,
            sellerId: request.user.userId,
            title: body.title,
            description: body.description,
            type: body.type,
            category: body.category,
            subcategory: body.subcategory,
            tags: body.tags,
            licenseType: body.license_type,
            isFree: body.is_free,
            price: body.price,
            extendedPrice: body.extended_price,
            originalKey: body.original_key,
            contentType: body.content_type,
            fileSize: body.file_size,
        });
        return reply.status(201).send({ success: true, data: asset });
    });
    // ── Get asset by ID ───────────────────────────────────────────────────────
    app.get('/:id', async (request, reply) => {
        const { id } = request.params;
        const asset = await getAssetById(id);
        return reply.send({ success: true, data: asset });
    });
    // ── Download asset ────────────────────────────────────────────────────────
    app.get('/:id/download', { preHandler: [verifyJwt] }, async (request, reply) => {
        const { id } = request.params;
        const { license } = request.query;
        const result = await getDownloadUrl({ assetId: id, userId: request.user.userId, licenseType: license ?? 'standard' });
        return reply.send({ success: true, data: result });
    });
    // ── List seller's own assets ──────────────────────────────────────────────
    app.get('/my', { preHandler: [verifyJwt, requireSeller] }, async (request, reply) => {
        const { page = '1' } = request.query;
        const p = Math.max(1, parseInt(page, 10));
        const myAssets = await db.select().from(assets)
            .where(eq(assets.sellerId, request.user.userId))
            .orderBy(desc(assets.createdAt))
            .limit(24).offset((p - 1) * 24);
        return reply.send({ success: true, data: myAssets });
    });
    // ── Admin: Approve asset ──────────────────────────────────────────────────
    app.patch('/:id/approve', { preHandler: [verifyJwt, requireAdmin] }, async (request, reply) => {
        const { id } = request.params;
        const asset = await approveAsset(id, request.user.userId);
        return reply.send({ success: true, data: asset });
    });
    // ── Admin: Reject asset ───────────────────────────────────────────────────
    app.patch('/:id/reject', { preHandler: [verifyJwt, requireAdmin] }, async (request, reply) => {
        const { id } = request.params;
        const { reason } = z.object({ reason: z.string().min(5) }).parse(request.body);
        const asset = await rejectAsset(id, request.user.userId, reason);
        return reply.send({ success: true, data: asset });
    });
}
//# sourceMappingURL=assets.js.map