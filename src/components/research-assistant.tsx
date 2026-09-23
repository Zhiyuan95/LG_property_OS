'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ResearchAnswer } from '@/lib/public-data';
export function ResearchAssistant() {
  const path = usePathname();
  const [question, setQuestion] = useState(''),
    [answer, setAnswer] = useState<ResearchAnswer | null>(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  const regionId = path.match(/^\/discover\/regions\/([^/]+)$/)?.[1];
  const propertyId = path.match(/^\/discover\/property\/([^/]+)$/)?.[1];
  return (
    <>
      <p className="tag">OpenAI · Public evidence research</p>
      <p>
        Ask about the{' '}
        {regionId
          ? 'selected region'
          : propertyId
            ? 'selected demo property and its regional context'
            : 'Australian regions in the ABS dataset'}
        . Your question and public evidence are sent to OpenAI. Private notes and your API key are
        not included in the prompt.
      </p>
      {propertyId && (
        <p className="notice">
          This property is still a fictional demo. The assistant will label it as such.
        </p>
      )}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError('');
          setAnswer(null);
          try {
            const r = await fetch('/api/research', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ question, regionId, propertyId }),
            });
            const j = await r.json();
            if (!r.ok) throw new Error(j.error);
            setAnswer(j);
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Research failed.');
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          Your research question
          <textarea
            required
            maxLength={4000}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="比较 Brisbane 和 Perth 的区域数据，指出数据的局限和下一步应核实什么。"
          />
        </label>
        <button disabled={busy} className="primary">
          {busy ? 'Researching…' : 'Ask with ABS evidence'}
        </button>{' '}
        <Link href="/settings">Manage connection</Link>
      </form>
      {busy && <p role="status">Reading public evidence and waiting for OpenAI…</p>}
      {error && (
        <p className="notice" role="alert">
          {error}
        </p>
      )}
      {answer && (
        <article className="research-answer" aria-live="polite">
          <p className="small muted">
            {answer.model} · {new Date(answer.generatedAt).toLocaleString('en-AU')} ·{' '}
            {answer.inputTokens ?? '—'} input / {answer.outputTokens ?? '—'} output tokens
          </p>
          <div className="answer-text">{answer.answer}</div>
          {answer.openQuestions.length > 0 && (
            <>
              <h3>Open questions</h3>
              <ul>
                {answer.openQuestions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </>
          )}
          <h3>Evidence cited</h3>
          {answer.sources.length ? (
            <ul>
              {answer.sources.map((s) => (
                <li key={s.id}>
                  <a href={s.url} target="_blank" rel="noreferrer">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="small muted">
              No observation IDs were cited. Treat this as general research guidance, not a verified
              quantitative conclusion.
            </p>
          )}
          <details>
            <summary>Source limitations</summary>
            {answer.warnings.map((w) => (
              <p key={w}>{w}</p>
            ))}
          </details>
        </article>
      )}
    </>
  );
}
