import { Module } from '@nestjs/common';
import { GeminiModule } from '../gemini/gemini.module';
import { ChunkingService } from './chunking.service';
import { DocumentExtractionService } from './document-extraction.service';
import { EmbeddingService } from './embedding.service';
import { QdrantService } from './qdrant.service';
import { RagController } from './rag.controller';
import { RagService } from './rag.service';

@Module({
  imports: [GeminiModule],
  controllers: [RagController],
  providers: [
    RagService,
    ChunkingService,
    DocumentExtractionService,
    EmbeddingService,
    QdrantService,
  ],
  exports: [RagService],
})
export class RagModule {}
