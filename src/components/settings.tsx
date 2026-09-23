'use client';
import { useState } from 'react';
import { initialState, isUserState } from '@/lib/user-state';
import { useStore } from './store';
import { PageHeading } from './ui';
export function Settings() {
  const { state, ready, update } = useStore();
  const [message, setMessage] = useState(''),
    [reset, setReset] = useState(false);
  return (
    <>
      <PageHeading
        title="Settings"
        subtitle="Shape your Buy Box and keep control of your research data."
      />
      <div className="two-col">
        <section className="panel">
          <h2>Profile & Buy Box</h2>
          <form
            key={JSON.stringify(state.preferences)}
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const preferences = {
                name: String(f.get('name')).trim(),
                minPrice: Number(f.get('minPrice')),
                maxPrice: Number(f.get('maxPrice')),
                minYield: Number(f.get('minYield')),
              };
              if (!preferences.name || !isUserState({ ...state, preferences })) {
                setMessage(
                  'Check the name and price range. Minimum price must not exceed maximum.',
                );
                return;
              }
              update((s) => ({ ...s, preferences }));
              setMessage('Buy Box saved. Apply it in Discover.');
            }}
          >
            <label>
              Display name
              <input required maxLength={40} name="name" defaultValue={state.preferences.name} />
            </label>
            <div className="form-grid">
              <label>
                Minimum price (AUD)
                <input
                  required
                  type="number"
                  min="0"
                  step="1000"
                  name="minPrice"
                  defaultValue={state.preferences.minPrice}
                />
              </label>
              <label>
                Maximum price (AUD)
                <input
                  required
                  type="number"
                  min="0"
                  step="1000"
                  name="maxPrice"
                  defaultValue={state.preferences.maxPrice}
                />
              </label>
            </div>
            <label>
              Minimum gross yield (%)
              <input
                required
                type="number"
                min="0"
                max="100"
                step="0.1"
                name="minYield"
                defaultValue={state.preferences.minYield}
              />
            </label>
            <button disabled={!ready} className="primary">
              Save preferences
            </button>
          </form>
        </section>
        <section className="panel">
          <h2>Your workspace data</h2>
          <p>
            Watchlist stages, notes, checklist flags and preferences are stored in this browser.
            Export a backup before changing devices or clearing browser data.
          </p>
          <button
            disabled={!ready}
            onClick={() => {
              const url = URL.createObjectURL(
                new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }),
              );
              const a = document.createElement('a');
              a.href = url;
              a.download = 'property-os-backup.json';
              a.click();
              setTimeout(() => URL.revokeObjectURL(url), 1000);
              setMessage('Workspace backup exported.');
            }}
          >
            Export JSON backup ↓
          </button>
          <label>
            Restore backup (replaces local workspace)
            <input
              type="file"
              accept="application/json,.json"
              disabled={!ready}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const value: unknown = JSON.parse(await file.text());
                  if (!isUserState(value)) throw new Error();
                  update(() => value);
                  setMessage('Workspace restored.');
                } catch {
                  setMessage('Invalid backup. Your current workspace was preserved.');
                }
                e.target.value = '';
              }}
            />
          </label>
          <hr />
          {reset ? (
            <div className="notice">
              <p>Replace all local notes and decisions with the demo defaults?</p>
              <div className="inline">
                <button
                  onClick={() => {
                    update(() => structuredClone(initialState));
                    setReset(false);
                    setMessage('Demo workspace reset.');
                  }}
                >
                  Yes, reset workspace
                </button>
                <button onClick={() => setReset(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <button disabled={!ready} onClick={() => setReset(true)}>
              Reset demo workspace
            </button>
          )}
        </section>
      </div>
      <p role="status">{message}</p>
      <section className="panel">
        <h2>Data connections</h2>
        <p className="muted">
          Future integration points. No credentials or live connections are configured in this
          version.
        </p>
        {[
          'Domain / PropTrack — listings & transactions',
          'ABS — demographic indicators',
          'State & local government — hazards & planning',
          'PostgreSQL / PostGIS — durable records & spatial queries',
          'AI agent — sourced research & tool execution',
        ].map((s) => (
          <div className="risk-row" key={s}>
            <span>{s}</span>
            <span className="tag neutral">Not connected</span>
          </div>
        ))}
      </section>
    </>
  );
}
