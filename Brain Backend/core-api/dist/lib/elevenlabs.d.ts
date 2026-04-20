/**
 * ElevenLabs Client — Text-to-Speech / Audio Generation
 */
export declare function textToSpeech(params: {
    text: string;
    voiceId?: string;
    modelId?: string;
    stability?: number;
    similarityBoost?: number;
}): Promise<Buffer>;
export declare function listVoices(): Promise<Array<{
    voice_id: string;
    name: string;
}>>;
export declare function pingElevenLabs(): Promise<boolean>;
//# sourceMappingURL=elevenlabs.d.ts.map