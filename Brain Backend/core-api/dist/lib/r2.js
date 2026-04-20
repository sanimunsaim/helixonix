/**
 * Cloudflare R2 — S3-compatible storage client
 * Provides signed upload/download URLs and direct operations
 */
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../config.js';
export const r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${config.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: config.R2_ACCESS_KEY_ID,
        secretAccessKey: config.R2_SECRET_ACCESS_KEY,
    },
});
const BUCKET = config.R2_BUCKET_NAME;
const CDN_URL = config.R2_PUBLIC_URL;
// ── Key Builders ─────────────────────────────────────────────────────────────
export const R2Keys = {
    original: (assetId, filename) => `originals/${assetId}/${filename}`,
    preview: (assetId, n, ext) => `previews/${assetId}/preview_${n}.${ext}`,
    thumbnail: (assetId) => `thumbnails/${assetId}/thumb.webp`,
    watermarked: (assetId, ext) => `watermarked/${assetId}/watermarked.${ext}`,
    aiOutput: (userId, jobId, n, ext) => `ai-outputs/${userId}/${jobId}/${n}.${ext}`,
    delivery: (orderId, filename) => `delivery/${orderId}/${filename}`,
    userAvatar: (userId) => `avatars/users/${userId}/avatar.webp`,
    sellerBanner: (sellerId) => `avatars/sellers/${sellerId}/banner.webp`,
};
// ── Public CDN URL (no signing needed for thumbnails/previews) ────────────────
export function getPublicUrl(key) {
    return `${CDN_URL}/${key}`;
}
// ── Signed Upload URL (PUT) — expires in 15 minutes ──────────────────────────
export async function getSignedUploadUrl(params) {
    const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: params.key,
        ContentType: params.contentType,
        ...(params.maxSizeBytes ? { ContentLength: params.maxSizeBytes } : {}),
    });
    return getSignedUrl(r2Client, command, { expiresIn: 900 }); // 15 minutes
}
// ── Signed Download URL (GET) — expires in 30 minutes ────────────────────────
export async function getSignedDownloadUrl(key, filename) {
    const command = new GetObjectCommand({
        Bucket: BUCKET,
        Key: key,
        ...(filename ? { ResponseContentDisposition: `attachment; filename="${filename}"` } : {}),
    });
    return getSignedUrl(r2Client, command, { expiresIn: 1800 }); // 30 minutes
}
// ── Delete Object ─────────────────────────────────────────────────────────────
export async function deleteObject(key) {
    await r2Client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}
// ── Upload Buffer Directly (for server-side operations like thumbnails) ───────
export async function uploadBuffer(params) {
    await r2Client.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: params.key,
        Body: params.buffer,
        ContentType: params.contentType,
    }));
    return params.key;
}
// ── Allowed MIME types ────────────────────────────────────────────────────────
export const ALLOWED_ASSET_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'video/mp4',
    'video/webm',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'application/zip',
    'application/x-zip-compressed',
    'application/pdf',
    'application/octet-stream',
]);
export function getFileExtension(mimeType) {
    const map = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif',
        'image/svg+xml': 'svg',
        'video/mp4': 'mp4',
        'video/webm': 'webm',
        'audio/mpeg': 'mp3',
        'audio/wav': 'wav',
        'audio/ogg': 'ogg',
        'application/zip': 'zip',
        'application/pdf': 'pdf',
    };
    return map[mimeType] ?? 'bin';
}
//# sourceMappingURL=r2.js.map