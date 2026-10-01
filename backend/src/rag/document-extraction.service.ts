import { Injectable } from '@nestjs/common';
import { PDFDocumentProxy } from 'pdfjs-dist';

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
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const data = new Uint8Array(buffer);
    const pdf = await pdfjsLib.getDocument({ data }).promise;
    const pages: string[] = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: any) => ('str' in item ? item.str : ''))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (pageText) {
        pages.push(pageText);
      }
    }

    return pages.join('\n\n');
  }
}
