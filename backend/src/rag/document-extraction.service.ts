import { Injectable } from '@nestjs/common';
import pdfParse from 'pdf-parse';

@Injectable()
export class DocumentExtractionService {
  async extractText(file: Express.Multer.File): Promise<string> {
    const filename = file.originalname.toLowerCase();

    if (filename.endsWith('.pdf')) {
      return this.extractPdfText(file.buffer);
    }

    if (filename.endsWith('.txt') || filename.endsWith('.md') || filename.endsWith('.csv')) {
      return file.buffer.toString('utf-8');
    }

    throw new Error('Unsupported file type. Upload a PDF or text file.');
  }

  private async extractPdfText(buffer: Buffer): Promise<string> {
    const result = await pdfParse(buffer);
    return result.text.replace(/\s+/g, ' ').trim();
  }
}
