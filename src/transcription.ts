import fs from 'fs';

import OpenAI from 'openai';

import { readEnvFile } from './env.js';
import { logger } from './logger.js';

export async function transcribeAudioMessage(localPath: string): Promise<string | null> {
  const apiKey = readEnvFile(['OPENAI_API_KEY']).OPENAI_API_KEY;
  if (!apiKey) {
    logger.warn('OPENAI_API_KEY not set — voice transcription disabled');
    return null;
  }
  try {
    const client = new OpenAI({ apiKey });
    const transcription = await client.audio.transcriptions.create({
      model: 'whisper-1',
      file: fs.createReadStream(localPath),
    });
    logger.info({ chars: transcription.text.length }, 'Transcribed voice message');
    return transcription.text;
  } catch (err) {
    logger.error({ err }, 'OpenAI transcription failed');
    return null;
  }
}
