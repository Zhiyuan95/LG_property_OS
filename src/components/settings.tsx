'use client';
import { useState } from 'react';
import { initialState, isUserState } from '@/lib/user-state';
import { useStore } from './store';
import { PageHeading } from './ui';
import { Connections } from './connections';
import { BuyBoxForm } from './buy-box-form';
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
        <BuyBoxForm profile />
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
      <Connections />
    </>
  );
}
