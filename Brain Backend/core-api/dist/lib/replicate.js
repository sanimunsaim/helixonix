/**
 * Replicate API Client
 * Used for AI generation: image, video, audio, upscale, remove-bg
 */
import Replicate from 'replicate';
import { config } from '../config.js';
export const replicate = new Replicate({ auth: config.REPLICATE_API_KEY });
export const DEFAULT_MODEL_CONFIG = {
    text_to_image: {
        model: 'black-forest-labs/flux-schnell',
        creditCost: 1,
        concurrentLimit: 5,
        safetyLevel: 'moderate',
        enabled: true,
        estimatedSeconds: 10,
    },
    text_to_video: {
        model: 'minimax/video-01',
        creditCost: 10,
        concurrentLimit: 2,
        safetyLevel: 'moderate',
        enabled: true,
        estimatedSeconds: 90,
    },
    image_to_video: {
        model: 'stability-ai/stable-video-diffusion',
        creditCost: 8,
        concurrentLimit: 2,
        safetyLevel: 'moderate',
        enabled: true,
        estimatedSeconds: 60,
    },
    text_to_audio: {
        model: 'elevenlabs', // handled by ElevenLabs separately
        creditCost: 3,
        concurrentLimit: 5,
        safetyLevel: 'moderate',
        enabled: true,
        estimatedSeconds: 15,
    },
    upscale: {
        model: 'nightmareai/real-esrgan',
        creditCost: 2,
        concurrentLimit: 5,
        safetyLevel: 'strict',
        enabled: true,
        estimatedSeconds: 20,
    },
    remove_bg: {
        model: 'cjwbw/rembg',
        creditCost: 1,
        concurrentLimit: 10,
        safetyLevel: 'strict',
        enabled: true,
        estimatedSeconds: 5,
    },
    image_to_image: {
        model: 'black-forest-labs/flux-dev',
        creditCost: 2,
        concurrentLimit: 5,
        safetyLevel: 'moderate',
        enabled: true,
        estimatedSeconds: 20,
    },
};
/**
 * Run a Replicate model synchronously
 * Use only for short-running models (< 30s)
 */
export async function runModel(modelVersion, input) {
    return replicate.run(modelVersion, { input });
}
/**
 * Create a Replicate prediction (async polling pattern)
 * Use for long-running models (video generation)
 */
export async function createPrediction(modelVersion, input, webhookUrl) {
    const prediction = await replicate.predictions.create({
        version: modelVersion,
        input,
        ...(webhookUrl ? { webhook: webhookUrl, webhook_events_filter: ['completed', 'failed'] } : {}),
    });
    return prediction;
}
/**
 * Poll a prediction until complete or failed
 */
export async function pollPrediction(predictionId, onProgress) {
    let prediction = await replicate.predictions.get(predictionId);
    while (prediction.status !== 'succeeded' && prediction.status !== 'failed' && prediction.status !== 'canceled') {
        await new Promise((r) => setTimeout(r, 2000));
        prediction = await replicate.predictions.get(predictionId);
        if (onProgress && prediction.metrics?.predict_time !== undefined) {
            // Estimate progress from elapsed time
            onProgress(Math.min(90, Math.floor((prediction.metrics.predict_time / 30) * 100)));
        }
    }
    return {
        status: prediction.status === 'succeeded' ? 'succeeded' : 'failed',
        output: prediction.output,
        error: prediction.error,
    };
}
//# sourceMappingURL=replicate.js.map