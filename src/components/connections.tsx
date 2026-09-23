'use client';
import { useEffect, useState } from 'react';
export function Connections() {
  const [configured, setConfigured] = useState(false),
    [model, setModel] = useState('gpt-5-mini'),
    [key, setKey] = useState(''),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(''),
    [status, setStatus] = useState('Checking…');
  useEffect(() => {
    fetch('/api/connections', { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((j) => {
        setConfigured(j.openai.configured);
        setModel(j.openai.model);
        setStatus('Public endpoint configured');
      })
      .catch(() => setStatus('Could not read connection status'));
  }, []);
  return (
    <section className="panel">
      <h2>Data & AI connections</h2>
      <div className="risk-row">
        <span>ABS public regional statistics · Beta</span>
        <span className="tag">{status}</span>
      </div>
      <div className="risk-row">
        <span>Domain / PropTrack property listings</span>
        <span className="tag neutral">Not connected · demo listings only</span>
      </div>
      <div className="risk-row">
        <span>OpenAI Responses API</span>
        <span className={'tag ' + (configured ? '' : 'amber')}>
          {configured ? 'Key saved · verify with a question' : 'API key needed'}
        </span>
      </div>
      <p className="muted">
        Connect your own OpenAI project. The key is saved in this app’s local .env.local file on
        your computer, never in browser storage, source control or exported workspace backups.
      </p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setMessage('');
          try {
            const r = await fetch('/api/connections', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ apiKey: key.trim(), model: model.trim() }),
            });
            const j = await r.json();
            if (!r.ok) throw new Error(j.error);
            setKey('');
            setConfigured(j.openai.configured);
            setMessage(j.message);
          } catch (e) {
            setMessage(e instanceof Error ? e.message : 'Could not save connection.');
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="form-grid">
          <label>
            {configured ? 'Replace API key' : 'OpenAI API key'}
            <input
              required
              type="password"
              autoComplete="off"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="sk-…"
              maxLength={510}
            />
          </label>
          <label>
            Model ID
            <input
              required
              value={model}
              onChange={(e) => setModel(e.target.value)}
              maxLength={75}
            />
          </label>
        </div>
        <button disabled={busy} className="primary">
          {busy ? 'Saving…' : 'Save local connection'}
        </button>
        <p className="small muted">
          API usage is billed to your OpenAI project. This local app limits research to 20 requests
          per hour per running server. Saving a key does not make a paid model call.
        </p>
      </form>
      <p role="status">{message}</p>
      <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer">
        Create or manage an OpenAI API key ↗
      </a>
    </section>
  );
}
