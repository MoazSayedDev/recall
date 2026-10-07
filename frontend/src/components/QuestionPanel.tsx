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
    <section className="panel question-panel">
      <div className="panel-heading">
        <span className="step">02</span>
        <div>
          <h2>Ask a question</h2>
          <p>Ask anything about your uploaded document.</p>
        </div>
      </div>

      <label className="field-label" htmlFor="question-input">
        Your question
      </label>
      <textarea
        id="question-input"
        value={question}
        onChange={(event) => onQuestionChange(event.target.value)}
        placeholder="Ask about the uploaded document..."
        rows={4}
      />

      <div className="question-actions">
        <span className="meta">{documentId ? 'Ready to search' : 'Upload a document to continue'}</span>
        <button className="primary-button" type="button" onClick={onAsk} disabled={!question.trim() || !documentId || isAsking}>
          {isAsking ? 'Thinking…' : 'Get answer  →'}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {answer && (
        <div className="result-box">
          <h3>Answer</h3>
          <p className="answer-text">{answer}{isAsking && <span className="cursor" />}</p>
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
