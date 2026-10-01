import type { ChangeEvent } from 'react';
import type { UploadResponse } from '../types/rag';

type UploadPanelProps = {
  file: File | null;
  uploadResult: UploadResponse | null;
  isUploading: boolean;
  error: string;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => Promise<void>;
};

export function UploadPanel({
  file,
  uploadResult,
  isUploading,
  error,
  onFileChange,
  onUpload,
}: UploadPanelProps) {
  return (
    <section className="panel">
      <h2>1. Document upload</h2>

      <label className="file-picker">
        <span>Select PDF or TXT</span>
        <input type="file" accept=".pdf,.txt" onChange={onFileChange} />
      </label>

      <div className="actions">
        <button type="button" onClick={onUpload} disabled={!file || isUploading}>
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>

      {file && <p className="meta">Selected file: {file.name}</p>}

      {error && <p className="error">{error}</p>}

      {uploadResult && (
        <div className="result-box">
          <p>
            <strong>Uploaded:</strong> {uploadResult.filename}
          </p>
          <p>
            <strong>Chunks:</strong> {uploadResult.chunks}
          </p>
          <p>
            <strong>Document ID:</strong> {uploadResult.documentId}
          </p>
        </div>
      )}
    </section>
  );
}
