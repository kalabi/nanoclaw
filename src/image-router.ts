import OpenAI from 'openai';

import { readEnvFile } from './env.js';
import { logger } from './logger.js';

const IMAGE_GEN_PATTERNS = [
  /нарисуй/i,
  /сгенерируй\s+(картинку|изображение|фото)/i,
  /создай\s+(картинку|изображение)/i,
  /\bdraw\b/i,
  /\bgenerate\s+(an?\s+)?(image|picture|photo)\b/i,
  /\bcreate\s+(an?\s+)?(image|picture|photo)\b/i,
  /\bimagine\b/i,
];

export function isImageGenerationRequest(content: string): boolean {
  return IMAGE_GEN_PATTERNS.some((p) => p.test(content));
}

export async function generateImage(prompt: string): Promise<string | null> {
  const apiKey = readEnvFile(['OPENAI_API_KEY']).OPENAI_API_KEY;
  if (!apiKey) {
    logger.warn('OPENAI_API_KEY not set — image generation disabled');
    return null;
  }
  try {
    const client = new OpenAI({ apiKey });
    const response = await client.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
    });
    const url = response.data?.[0]?.url ?? null;
    logger.info({ prompt: prompt.slice(0, 80) }, 'DALL-E image generated');
    return url;
  } catch (err) {
    logger.error({ err }, 'DALL-E generation failed');
    return null;
  }
}
