export type UploadResponse = {
  documentId: string;
  filename: string;
  chunks: number;
  fileName?: string;
  chunkCount?: number;
  sizeBytes?: number;
};

export type SourceItem = {
  id?: string | number;
  score?: number;
  fileName?: string;
  chunkIndex?: number;
  text?: string;
};

export type QueryResponse = {
  answer: string;
  sources: SourceItem[];
};
