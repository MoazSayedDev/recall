import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class GeminiService {
  private readonly client: GoogleGenAI;
  private readonly maxRetries = 5;

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

  private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt === this.maxRetries) {
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
      }
    }

    throw lastError instanceof Error ? lastError : new Error('Gemini request failed after 5 attempts');
  }

  async *generateTextStream(options: {
    prompt: string;
    model?: string;
    systemInstruction?: string;
  }): AsyncGenerator<string> {
    const model = options.model ?? 'gemini-2.0-flash';
    const stream = await this.withRetry(() =>
      this.client.models.generateContentStream({
        model,
        contents: options.prompt,
        config: options.systemInstruction
          ? {
              systemInstruction: options.systemInstruction,
            }
          : undefined,
      }),
    );

    for await (const chunk of stream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  }

  async embedText(text: string, outputDimensionality = 768): Promise<number[]> {
    const response = await this.withRetry(() =>
      this.client.models.embedContent({
        model: 'gemini-embedding-001',
        contents: text,
        config: {
          outputDimensionality,
        },
      }),
    );

    return response.embeddings?.[0]?.values ?? [];
  }
}
