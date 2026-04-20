/**
 * Replicate API Client
 * Used for AI generation: image, video, audio, upscale, remove-bg
 */
import Replicate from 'replicate';
export declare const replicate: Replicate;
export type ToolType = 'text_to_image' | 'text_to_video' | 'image_to_video' | 'text_to_audio' | 'upscale' | 'remove_bg' | 'image_to_image';
export interface ModelConfig {
    model: string;
    creditCost: number;
    concurrentLimit: number;
    safetyLevel: 'strict' | 'moderate' | 'permissive';
    enabled: boolean;
    estimatedSeconds: number;
}
export declare const DEFAULT_MODEL_CONFIG: Record<ToolType, ModelConfig>;
/**
 * Run a Replicate model synchronously
 * Use only for short-running models (< 30s)
 */
export declare function runModel(modelVersion: string, input: Record<string, unknown>): Promise<unknown>;
/**
 * Create a Replicate prediction (async polling pattern)
 * Use for long-running models (video generation)
 */
export declare function createPrediction(modelVersion: string, input: Record<string, unknown>, webhookUrl?: string): Promise<{
    id: string;
    status: string;
    urls: {
        get: string;
    };
}>;
/**
 * Poll a prediction until complete or failed
 */
export declare function pollPrediction(predictionId: string, onProgress?: (progress: number) => void): Promise<{
    status: 'succeeded' | 'failed';
    output: unknown;
    error?: string;
}>;
//# sourceMappingURL=replicate.d.ts.map