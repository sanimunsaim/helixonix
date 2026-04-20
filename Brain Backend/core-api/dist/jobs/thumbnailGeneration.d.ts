/**
 * BullMQ Worker — Thumbnail & Watermark Generation
 * Uses sharp for image processing, uploads result to R2
 */
import { Worker } from 'bullmq';
interface ThumbnailJobData {
    assetId: string;
    fileKey: string;
}
interface WatermarkJobData {
    assetId: string;
    fileKey: string;
}
export declare function startThumbnailWorker(): Worker<ThumbnailJobData, any, string>;
export declare function startWatermarkWorker(): Worker<WatermarkJobData, any, string>;
export {};
//# sourceMappingURL=thumbnailGeneration.d.ts.map