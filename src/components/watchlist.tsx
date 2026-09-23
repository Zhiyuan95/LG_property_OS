'use client';
import Link from 'next/link';
import { useState } from 'react';
import { stages, type Dataset, type Stage } from '@/lib/types';
import { money } from '@/lib/finance';
import { useStore } from './store';
import { PageHeading } from './ui';
export function Watchlist({ data, initialStage }: { data: Dataset; initialStage: string }) {
  const { state, ready, setStage } = useStore();
  const [filter, setFilter] = useState(
    stages.includes(initialStage as Stage) ? initialStage : 'All',
  );
  const saved = data.properties.filter(
    (p) => state.stages[p.id] && (filter === 'All' || state.stages[p.id] === filter),
  );
  const events = [...data.events, ...state.events]
    .filter((e) => state.stages[e.propertyId])
    .sort((a, b) => b.at.localeCompare(a.at));
  return (
    <>
      <PageHeading
        title="Watchlist & timeline"
        subtitle="Keep decisions, open questions and changes in one place."
        action={
          <Link className="button primary" href="/discover">
            Discover properties ↗
          </Link>
        }
      />
      <div className="stage-filters">
        {['All', ...stages].map((s) => (
          <button key={s} aria-pressed={filter === s} onClick={() => setFilter(s)}>
            {s}{' '}
            <span>
              {s === 'All'
                ? Object.keys(state.stages).length
                : Object.values(state.stages).filter((v) => v === s).length}
            </span>
          </button>
        ))}
      </div>
      <div className="watch-layout">
        <section>
          {saved.length === 0 ? (
            <div className="panel empty">
              <h2>No properties here yet</h2>
              <p>Save a property or move one into this stage.</p>
              <Link href="/discover">Explore sample listings →</Link>
            </div>
          ) : (
            saved.map((p) => (
              <article className="panel watch-card" key={p.id}>
                <div className="section-head">
                  <div>
                    <Link className="property-title" href={'/discover/property/' + p.id}>
                      {p.address}
                    </Link>
                    <p className="muted">
                      {data.suburbs.find((s) => s.id === p.suburbId)?.name} · {money(p.price)}
                    </p>
                  </div>
                  <label>
                    <span className="sr-only">Stage for {p.address}</span>
                    <select
                      disabled={!ready}
                      value={state.stages[p.id]}
                      onChange={(e) => setStage(p.id, e.target.value as Stage)}
                    >
                      {stages.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="section-head">
                  <Link href={'/discover/property/' + p.id + '?tab=Research'}>
                    Notes & checklist →
                  </Link>
                  <button
                    className="text-button"
                    disabled={!ready}
                    onClick={() => setStage(p.id, undefined)}
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))
          )}
        </section>
        <section className="panel">
          <h2>Latest activity</h2>
          <p className="small muted">Market sample events + your saved actions</p>
          <ol className="timeline">
            {events.slice(0, 20).map((e) => (
              <li key={e.id}>
                <small>
                  {new Date(e.at).toLocaleDateString('en-AU', { timeZone: 'Australia/Brisbane' })}
                </small>
                <Link href={'/discover/property/' + e.propertyId + '?tab=Research'}>
                  {data.properties.find((p) => p.id === e.propertyId)?.address}
                </Link>
                <p>{e.text}</p>
              </li>
            ))}
          </ol>
          {events.length === 0 && <p>No saved-property activity yet.</p>}
        </section>
      </div>
    </>
  );
}
