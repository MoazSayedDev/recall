import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class AppService {
  private readonly gemini = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  getHello(): string {
    return 'Hello World!';
  }

  async ai(){
    const interaction = await this.gemini.interactions.create({
      model: 'gemini-3.8-flash',
      input: 'Explain how AI works in a few words',
    });

    return interaction.output_text;
  }
}