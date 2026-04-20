/**
 * Cloudflare R2 — S3-compatible storage client
 * Provides signed upload/download URLs and direct operations
 */
import { S3Client } from '@aws-sdk/client-s3';
export declare const r2Client: S3Client;
export declare const R2Keys: {
    original: (assetId: string, filename: string) => string;
    preview: (assetId: string, n: number, ext: string) => string;
    thumbnail: (assetId: string) => string;
    watermarked: (assetId: string, ext: string) => string;
    aiOutput: (userId: string, jobId: string, n: number, ext: string) => string;
    delivery: (orderId: string, filename: string) => string;
    userAvatar: (userId: string) => string;
    sellerBanner: (sellerId: string) => string;
};
export declare function getPublicUrl(key: string): string;
export declare function getSignedUploadUrl(params: {
    key: string;
    contentType: string;
    maxSizeBytes?: number;
}): Promise<string>;
export declare function getSignedDownloadUrl(key: string, filename?: string): Promise<string>;
export declare function deleteObject(key: string): Promise<void>;
export declare function uploadBuffer(params: {
    key: string;
    buffer: Buffer;
    contentType: string;
}): Promise<string>;
export declare const ALLOWED_ASSET_TYPES: Set<string>;
export declare function getFileExtension(mimeType: string): string;
//# sourceMappingURL=r2.d.ts.map