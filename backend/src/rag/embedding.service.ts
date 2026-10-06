import { Injectable } from '@nestjs/common';
import { GeminiService } from '../gemini/gemini.service';

@Injectable()
export class EmbeddingService {
  constructor(private readonly geminiService: GeminiService) {}
  
  /**
   * Embeds the given text into a vector.
   * @param text The text to embed.
   * @returns A promise that resolves to the embedded vector.
   */
  async embedText(text: string): Promise<number[]> {
    return this.geminiService.embedText(text, 768);
  }
}
