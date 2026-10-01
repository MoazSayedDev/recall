import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QdrantClient } from '@qdrant/js-client-rest';

@Injectable()
export class QdrantService implements OnModuleInit {
  private readonly client: QdrantClient;
  private readonly collectionName = 'recall_documents';
  private readonly vectorSize = 768;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>('QDRANT_URL');
    const apiKey = this.configService.get<string>('QDRANT_API_KEY');

    if (!url) {
      throw new Error('QDRANT_URL is required');
    }

    this.client = new QdrantClient({
      url,
      ...(apiKey ? { apiKey } : {}),
    });
  }

  async onModuleInit() {
    await this.ensureCollection();
  }

  async ensureCollection() {
    try {
      await this.client.getCollection(this.collectionName);
      return;
    } catch {
      await this.client.createCollection(this.collectionName, {
        vectors: {
          size: this.vectorSize,
          distance: 'Cosine',
        },
      });
    }
  }

  async storeDocumentChunks(
    documentId: string,
    fileName: string,
    chunks: Array<{ text: string; vector: number[] }>,
  ) {
    await this.ensureCollection();

    const points = chunks.map((chunk, index) => ({
      id: `${documentId}-${index}`,
      vector: chunk.vector,
      payload: {
        documentId,
        fileName,
        chunkIndex: index,
        text: chunk.text,
      },
    }));

    await this.client.upsert(this.collectionName, {
      wait: true,
      points,
    });

    return { inserted: points.length };
  }

  async searchSimilar(questionVector: number[], topK = 5, documentId?: string) {
    await this.ensureCollection();

    const results = await this.client.search(this.collectionName, {
      vector: questionVector,
      limit: topK,
      with_payload: true,
      with_vector: false,
      ...(documentId
        ? {
            filter: {
              must: [
                {
                  key: 'documentId',
                  match: { value: documentId },
                },
              ],
            },
          }
        : {}),
    });

    return results.map((result) => ({
      id: result.id,
      score: result.score,
      payload: result.payload,
    }));
  }
}
