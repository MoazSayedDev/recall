import { useState } from 'react';
import { apiFetch, apiFetchSse } from './api/client';
import { QuestionPanel } from './components/QuestionPanel';
import { UploadPanel } from './components/UploadPanel';
import type { QueryResponse, UploadResponse } from './types/rag';

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [documentId, setDocumentId] = useState('');
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState<QueryResponse['sources']>([]);
  const [queryError, setQueryError] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    setFile(nextFile);
    setUploadError('');
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadError('Please select a PDF or TXT file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploading(true);
      setUploadError('');

      const result = await apiFetch<UploadResponse>('/documents/upload', {
        method: 'POST',
        body: formData,
      });

      setUploadResult(result);
      setDocumentId(result.documentId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed.';
      setUploadError(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAsk = async () => {
    if (!question.trim()) {
      setQueryError('Please enter a question.');
      return;
    }

    if (!documentId) {
      setQueryError('Please upload a document before asking a question.');
      return;
    }

    try {
      setIsAsking(true);
      setQueryError('');

      setAnswer('');
      setSources([]);
      await apiFetchSse<{
        type: 'sources' | 'token' | 'done';
        sources?: QueryResponse['sources'];
        text?: string;
      }>(
        '/query/stream',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question,
            documentId,
          }),
        },
        (event) => {
          if (event.type === 'sources') {
            setSources(event.sources || []);
          } else if (event.type === 'token') {
            setAnswer((current) => current + (event.text || ''));
          }
        },
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to ask the question.';
      setQueryError(message);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <main className="page">
      <div className="container">
        <header className="hero">
          <div className="brand-mark">R</div>
          <div>
            <p className="eyebrow">RECALL</p>
            <h1>Ask your documents</h1>
            <p className="hero-copy">Upload a file, then get a clear answer grounded in its content.</p>
          </div>
        </header>

        <div className="workspace">
          <UploadPanel
            file={file}
            uploadResult={uploadResult}
            isUploading={isUploading}
            error={uploadError}
            onFileChange={handleFileChange}
            onUpload={handleUpload}
          />

          <QuestionPanel
            question={question}
            answer={answer}
            sources={sources}
            isAsking={isAsking}
            error={queryError}
            documentId={documentId}
            onQuestionChange={setQuestion}
            onAsk={handleAsk}
          />
        </div>

        <footer>Private workspace · Your answers are based only on the uploaded document</footer>
      </div>
    </main>
  );
}

export default App;
