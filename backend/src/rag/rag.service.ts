import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { GeminiService } from '../gemini/gemini.service';
import { ChunkingService } from './chunking.service';
import { DocumentExtractionService } from './document-extraction.service';
import { EmbeddingService } from './embedding.service';
import { QdrantService } from './qdrant.service';

@Injectable()
export class RagService {
  constructor(
    private readonly extractionService: DocumentExtractionService,
    private readonly chunkingService: ChunkingService,
    private readonly embeddingService: EmbeddingService,
    private readonly qdrantService: QdrantService,
    private readonly geminiService: GeminiService,
  ) {}


  /**
   * Uploads a document to the RAG system.
   * @param file The file to upload.
   * @returns A promise that resolves to the upload result.
   */
  async uploadDocument(file: Express.Multer.File) {
    const extractedText = await this.extractionService.extractText(file);
    const chunks = this.chunkingService.chunkText(extractedText);
    const documentId = randomUUID();

    const vectors = await Promise.all(
      chunks.map((chunk) => this.embeddingService.embedText(chunk)),
    );

    await this.qdrantService.storeDocumentChunks(
      documentId,
      file.originalname,
      chunks.map((chunk, index) => ({
        text: chunk,
        vector: vectors[index],
      })),
    );
    return {
      documentId,
      filename: file.originalname,
      chunks: chunks.length,
      fileName: file.originalname,
      chunkCount: chunks.length,
      sizeBytes: file.size,
    };
  }


  /**
   * Queries the RAG system with a question.
   * @param question The question to ask.
   * @param topK The number of top results to return.
   * @param documentId The ID of the document to filter by.
   * @returns A promise that resolves to the query results.
   */
  async query(question: string, topK = 5, documentId?: string) {
    const { context, hits } = await this.retrieveContext(question, topK, documentId);
    const answer = await this.geminiService.generateText({
      model: 'gemini-3.8-flash',
      prompt: this.buildPrompt(question, context),
      systemInstruction: this.systemInstruction,
    });

    return {
      answer,
      sources: this.toSources(hits),
    };
  }

  async *queryStream(question: string, topK = 5, documentId?: string) {
    const { context, hits } = await this.retrieveContext(question, topK, documentId);
    const sources = this.toSources(hits);

    yield { type: 'sources' as const, sources };
    for await (const text of this.geminiService.generateTextStream({
      model: 'gemini-3.8-flash',
      prompt: this.buildPrompt(question, context),
      systemInstruction: this.systemInstruction,
    })) {
      yield { type: 'token' as const, text };
    }
    yield { type: 'done' as const };
  }

  private async retrieveContext(question: string, topK: number, documentId?: string) {
    if (!question?.trim()) {
      throw new Error('A question is required.');
    }

    const questionVector = await this.embeddingService.embedText(question);
    const hits = await this.qdrantService.searchSimilar(questionVector, topK, documentId);
    const context = hits
      .map((hit) => hit.payload?.text || '')
      .filter(Boolean)
      .join('\n\n');

    return { context, hits };
  }

  private buildPrompt(question: string, context: string) {
    return `Answer the user question using only the provided context. If the context does not contain the answer, say so clearly.\n\nContext:\n${context}\n\nQuestion:\n${question}`;
  }

  private readonly systemInstruction =
    'You are a helpful answer engine. Use the provided context only and cite the source file names when relevant.';

  private toSources(hits: Awaited<ReturnType<QdrantService['searchSimilar']>>) {
    return hits.map((hit) => ({
      id: hit.id,
      score: hit.score,
      fileName: hit.payload?.fileName,
      chunkIndex: hit.payload?.chunkIndex,
    }));
  }
}
