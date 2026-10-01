import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RagService } from './rag.service';

@Controller()
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Post('documents/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('A file upload is required.');
    }

    return this.ragService.uploadDocument(file);
  }

  @Post('rag/documents/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocumentAlias(@UploadedFile() file: Express.Multer.File) {
    return this.uploadDocument(file);
  }

  @Post('query')
  async query(@Body() body: { question?: string; documentId?: string; topK?: number }) {
    if (!body?.question) {
      throw new BadRequestException('A question is required.');
    }

    return this.ragService.query(body.question, body.topK ?? 5, body.documentId);
  }

  @Post('rag/query')
  async queryAlias(@Body() body: { question?: string; documentId?: string; topK?: number }) {
    return this.query(body);
  }
}
