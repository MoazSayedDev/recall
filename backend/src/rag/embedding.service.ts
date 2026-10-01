import { Injectable } from '@nestjs/common';
import { GeminiService } from '../gemini/gemini.service';

@Injectable()
export class EmbeddingService {
  constructor(private readonly geminiService: GeminiService) {}

  async embedText(text: string): Promise<number[]> {
    return this.geminiService.embedText(text, 768);
  }
}
