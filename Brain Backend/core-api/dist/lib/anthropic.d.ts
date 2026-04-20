/**
 * Anthropic Client — for embeddings and text analysis
 * Used for: semantic search vector embeddings, content moderation, HELIX-BRAIN commands
 */
import Anthropic from '@anthropic-ai/sdk';
export declare const anthropic: Anthropic;
/**
 * Generate text embedding for semantic search
 * Returns a 1024-dimensional vector
 */
export declare function generateEmbedding(text: string): Promise<number[]>;
/**
 * Analyze content for moderation signals
 */
export declare function analyzeContent(params: {
    title: string;
    description: string;
    tags: string[];
}): Promise<{
    safetyScore: number;
    copyrightRisk: number;
    qualityScore: number;
    recommendation: 'approve' | 'review' | 'reject';
    signals: string[];
}>;
/**
 * Simple text completion for HELIX-BRAIN internal reasoning
 */
export declare function complete(prompt: string, maxTokens?: number): Promise<string>;
//# sourceMappingURL=anthropic.d.ts.map