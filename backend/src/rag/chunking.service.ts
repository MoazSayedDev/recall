import { Injectable } from '@nestjs/common';

@Injectable()
export class ChunkingService {
  chunkText(
    text: string,
    options: { maxChars?: number; overlapChars?: number } = {},
  ): string[] {
    const maxChars = options.maxChars ?? 1200;
    const overlapChars = options.overlapChars ?? 150;
    const normalized = text.replace(/\s+/g, ' ').trim();

    if (!normalized) {
      return [];
    }

    const chunks: string[] = [];
    let start = 0;

    while (start < normalized.length) {
      const end = Math.min(start + maxChars, normalized.length);
      const slice = normalized.slice(start, end).trim();

      if (slice.length > 0) {
        chunks.push(slice);
      }

      if (end >= normalized.length) {
        break;
      }

      start += maxChars - overlapChars;
    }

    return chunks;
  }
}
