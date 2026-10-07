import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
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

  @Post('query')
  async query(@Body() body: { question?: string; documentId?: string; topK?: number }) {
    if (!body?.question) {
      throw new BadRequestException('A question is required.');
    }

    return this.ragService.query(body.question, body.topK ?? 5, body.documentId);
  }

  @Post('query/stream')
  async streamQuery(
    @Body() body: { question?: string; documentId?: string; topK?: number },
    @Res() response: Response,
  ) {
    if (!body?.question) {
      throw new BadRequestException('A question is required.');
    }

    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Connection', 'keep-alive');
    response.flushHeaders();

    try {
      for await (const event of this.ragService.queryStream(
        body.question,
        body.topK ?? 5,
        body.documentId,
      )) {
        response.write(`data: ${JSON.stringify(event)}\n\n`);
      }
      response.end();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to stream the answer.';
      response.write(`event: error\ndata: ${JSON.stringify({ message })}\n\n`);
      response.end();
    }
  }
}
