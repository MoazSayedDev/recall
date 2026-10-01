import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class GeminiService {
  private readonly client: GoogleGenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is required');
    }

    this.client = new GoogleGenAI({ apiKey });
  }

  get models() {
    return this.client.models;
  }

  async generateText(options: {
    prompt: string;
    model?: string;
    systemInstruction?: string;
  }): Promise<string> {
    const model = options.model ?? 'gemini-2.0-flash';

    const response = await this.client.models.generateContent({
      model,
      contents: options.prompt,
      config: options.systemInstruction
        ? {
            systemInstruction: options.systemInstruction,
          }
        : undefined,
    });

    return response.text ?? '';
  }

  async embedText(text: string, outputDimensionality = 768): Promise<number[]> {
    const response = await this.client.models.embedContent({
      model: 'gemini-embedding-001',
      contents: text,
      config: {
        outputDimensionality,
      },
    });

    return response.embeddings?.[0]?.values ?? [];
  }
}
