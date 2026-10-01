import type { SourceItem } from '../types/rag';

type QuestionPanelProps = {
  question: string;
  answer: string;
  sources: SourceItem[];
  isAsking: boolean;
  error: string;
  documentId: string;
  onQuestionChange: (value: string) => void;
  onAsk: () => Promise<void>;
};

export function QuestionPanel({
  question,
  answer,
  sources,
  isAsking,
  error,
  documentId,
  onQuestionChange,
  onAsk,
}: QuestionPanelProps) {
  return (
    <section className="panel">
      <h2>2. Ask a question</h2>

      <label className="field-label" htmlFor="question-input">
        Ask something about the document
      </label>
      <textarea
        id="question-input"
        value={question}
        onChange={(event) => onQuestionChange(event.target.value)}
        placeholder="Ask about the uploaded document..."
        rows={4}
      />

      <div className="actions">
        <button type="button" onClick={onAsk} disabled={!question.trim() || !documentId || isAsking}>
          {isAsking ? 'Asking...' : 'Ask'}
        </button>
      </div>

      {!documentId && <p className="meta">Upload a document before asking a question.</p>}
      {error && <p className="error">{error}</p>}

      {answer && (
        <div className="result-box">
          <h3>Answer</h3>
          <p>{answer}</p>
        </div>
      )}

      {sources.length > 0 && (
        <div className="result-box">
          <h3>Retrieved sources</h3>
          <ul className="source-list">
            {sources.map((source, index) => (
              <li key={`${source.id ?? index}-${index}`}>
                <p>
                  <strong>Chunk #{source.chunkIndex ?? index + 1}</strong>
                </p>
                <p>
                  <strong>Score:</strong> {source.score ?? 'n/a'}
                </p>
                <p>
                  <strong>File:</strong> {source.fileName ?? 'unknown'}
                </p>
                <p>{source.text}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
