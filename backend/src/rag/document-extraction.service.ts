import { Injectable } from '@nestjs/common';
import pdfParse from 'pdf-parse';

@Injectable()
export class DocumentExtractionService {

  /**
   * Extracts text from a document.
   * @param file The file to extract text from.
   * @returns A promise that resolves to the extracted text.
   */
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

  /**
   * Extracts text from a PDF file.
   * @param buffer The buffer containing the PDF file.
   * @returns A promise that resolves to the extracted text.
   */
  private async extractPdfText(buffer: Buffer): Promise<string> {
    const result = await pdfParse(buffer);
    return result.text.replace(/\s+/g, ' ').trim();
  }
}
