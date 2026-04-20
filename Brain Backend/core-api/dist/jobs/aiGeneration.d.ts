/**
 * BullMQ Worker — AI Generation
 * Processes AI generation jobs: calls Replicate/ElevenLabs, uploads to R2, notifies via Redis
 */
import { Worker } from 'bullmq';
import { type ToolType } from '../lib/replicate.js';
interface AiJobData {
    jobId: string;
    userId: string;
    toolType: ToolType;
    parameters: Record<string, unknown>;
    creditCost: number;
}
export declare function startAiGenerationWorker(): Worker<AiJobData, any, string>;
export {};
//# sourceMappingURL=aiGeneration.d.ts.map