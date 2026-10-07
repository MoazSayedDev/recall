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
      <div className="panel-heading">
        <span className="step">01</span>
        <div>
          <h2>Upload a document</h2>
          <p>PDF or TXT files up to your workspace limit.</p>
        </div>
      </div>

      <label className="file-picker">
        <span className="upload-icon">↑</span>
        <strong>{file ? 'Change document' : 'Choose a document'}</strong>
        <small>{file ? file.name : 'Drop a PDF or TXT file here, or browse'}</small>
        <input type="file" accept=".pdf,.txt" onChange={onFileChange} />
      </label>

      <button className="primary-button full-button" type="button" onClick={onUpload} disabled={!file || isUploading}>
        {isUploading ? 'Uploading…' : 'Upload document'}
      </button>

      {error && <p className="error">{error}</p>}

      {uploadResult && (
        <div className="result-box">
          <div className="success-line"><span>✓</span> Document ready</div>
          <p className="file-name">{uploadResult.filename}</p>
          <p className="meta">{uploadResult.chunks} searchable chunks created</p>
        </div>
      )}
    </section>
  );
}
