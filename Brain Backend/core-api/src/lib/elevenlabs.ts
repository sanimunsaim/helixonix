/**
 * ElevenLabs Client — Text-to-Speech / Audio Generation
 */

import { config } from '../config.js';

const BASE_URL = 'https://api.elevenlabs.io/v1';

export async function textToSpeech(params: {
  text: string;
  voiceId?: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
}): Promise<Buffer> {
  const voiceId = params.voiceId ?? 'EXAVITQu4vr4xnSDxMaL'; // Default: Bella
  const modelId = params.modelId ?? 'eleven_multilingual_v2';

  const response = await fetch(`${BASE_URL}/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': config.ELEVENLABS_API_KEY ?? '',
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text: params.text,
      model_id: modelId,
      voice_settings: {
        stability: params.stability ?? 0.5,
        similarity_boost: params.similarityBoost ?? 0.75,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`ElevenLabs API error: ${response.status} ${err}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function listVoices(): Promise<Array<{ voice_id: string; name: string }>> {
  const response = await fetch(`${BASE_URL}/voices`, {
    headers: { 'xi-api-key': config.ELEVENLABS_API_KEY ?? '' },
  });
  const data = await response.json() as { voices: Array<{ voice_id: string; name: string }> };
  return data.voices ?? [];
}

export async function pingElevenLabs(): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/user`, {
      headers: { 'xi-api-key': config.ELEVENLABS_API_KEY ?? '' },
    });
    return response.ok;
  } catch {
    return false;
  }
}
