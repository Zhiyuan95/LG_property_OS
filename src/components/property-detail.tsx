'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { stages, type Dataset, type Property } from '@/lib/types';
import { money, grossYield } from '@/lib/finance';
import { useStore } from './store';
import { PageHeading } from './ui';
import { Financials } from './financials';
const tabs = ['Overview', 'Financials', 'Market', 'Risks', 'Research'];
export function PropertyDetail({
  data,
  property: p,
  tab: requested,
}: {
  data: Dataset;
  property: Property;
  tab: string;
}) {
  const router = useRouter();
  const tab = tabs.includes(requested) ? requested : 'Overview';
  const { state, ready, update, setStage } = useStore();
  const s = data.suburbs.find((s) => s.id === p.suburbId)!;
  const [note, setNote] = useState('');
  const events = [...data.events, ...state.events]
    .filter((e) => e.propertyId === p.id)
    .sort((a, b) => b.at.localeCompare(a.at));
  return (
    <>
      <Link className="back" href={'/discover/suburb/' + s.id}>
        ← {s.name} suburb intelligence
      </Link>
      <PageHeading
        eyebrow={`${s.name.toUpperCase()} · ${s.state} ${s.postcode}`}
        title={p.address}
        subtitle={`House · ${p.beds} bedrooms · ${p.land} m² · ${p.days} sample days on market`}
        action={
          <div className="inline">
            <span className="tag neutral">{p.status}</span>
            <label className="sr-only" htmlFor="stage">
              Pipeline stage
            </label>
            <select
              id="stage"
              disabled={!ready}
              value={state.stages[p.id] ?? ''}
              onChange={(e) =>
                setStage(
                  p.id,
                  e.target.value ? (e.target.value as (typeof stages)[number]) : undefined,
                )
              }
            >
              <option value="">Not saved</option>
              {stages.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        }
      />
      <div className="notice">
        Fictional property · Source: mock · Snapshot {p.provenance.asOf} · Confidence: illustrative
      </div>
      <div className="tabs" aria-label="Property sections">
        {tabs.map((t) => (
          <button
            key={t}
            aria-pressed={tab === t}
            onClick={() => router.replace(`/discover/property/${p.id}?tab=${t}`, { scroll: false })}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === 'Overview' && (
        <>
          <div className="stat-grid">
            {[
              ['Asking price', money(p.price)],
              ['Weekly rent', money(p.rent)],
              ['Gross yield', grossYield(p.price, p.rent).toFixed(2) + '%'],
              ['Sample match', p.score + '/100'],
            ].map(([k, v]) => (
              <div className="panel" key={k}>
                <p className="eyebrow">{k}</p>
                <strong className="stat">{v}</strong>
              </div>
            ))}
          </div>
          <div className="two-col">
            <section className="panel">
              <h2>Why this property?</h2>
              <ul>
                {p.why.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <h3>What could I be wrong about?</h3>
              <ul>
                {p.questions.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <p className="small muted">
                The score is a fixed sample value. A future scoring service should expose factors,
                weights, source dates and confidence.
              </p>
            </section>
            <section className="panel">
              <h2>Your next step</h2>
              <p>Validate the costs before moving to an offer.</p>
              <button
                className="primary"
                onClick={() => router.replace(`?tab=Financials`, { scroll: false })}
              >
                Review financials →
              </button>
              <p>
                <Link href={'/discover/suburb/' + s.id}>Explore {s.name} market ↗</Link>
              </p>
            </section>
          </div>
        </>
      )}
      {tab === 'Financials' && <Financials property={p} />}
      {tab === 'Market' && (
        <section className="panel">
          <h2>{s.name} at a glance</h2>
          <p className="muted">Suburb-level mock indicators · not a comparable-sales valuation</p>
          <dl className="metrics">
            <div>
              <dt>Illustrative median</dt>
              <dd>{money(s.median)}</dd>
            </div>
            <div>
              <dt>Vacancy rate</dt>
              <dd>{s.vacancy}%</dd>
            </div>
            <div>
              <dt>Annual rent growth</dt>
              <dd>{s.rentGrowth}%</dd>
            </div>
            <div>
              <dt>Asking vs median</dt>
              <dd>{((p.price / s.median - 1) * 100).toFixed(1)}%</dd>
            </div>
          </dl>
          <Link href={'/discover/suburb/' + s.id}>Open full suburb view →</Link>
        </section>
      )}
      {tab === 'Risks' && (
        <section className="panel">
          <h2>Risk checks</h2>
          <p>Unknown means unverified. No property has been cleared by a risk data provider.</p>
          {[
            'Flood overlay & overland flow',
            'Bushfire overlay',
            'Insurance availability & quote',
            'Crime & local amenity',
            'Planning, zoning & future supply',
            'Building condition & termite history',
          ].map((r) => (
            <div className="risk-row" key={r}>
              <div>
                <b>{r}</b>
                <p className="small muted">
                  Obtain address-specific evidence and record it in Research.
                </p>
              </div>
              <span className="tag amber">Not verified</span>
            </div>
          ))}
        </section>
      )}
      {tab === 'Research' && (
        <div className="two-col">
          <section className="panel">
            <h2>Due diligence</h2>
            <p className="muted">Your completion flags, stored on this browser.</p>
            {[
              'Request rental appraisal',
              'Get written insurance quote',
              'Check council hazard overlays',
              'Book building & pest inspection',
            ].map((text) => {
              const key = p.id + ':' + text;
              return (
                <label className="check checklist" key={key}>
                  <input
                    type="checkbox"
                    disabled={!ready}
                    checked={!!state.checks[key]}
                    onChange={(e) =>
                      update((s) => ({ ...s, checks: { ...s.checks, [key]: e.target.checked } }))
                    }
                  />
                  {text}
                </label>
              );
            })}
            <label>
              Research notes
              <textarea
                disabled={!ready}
                value={state.notes[p.id] ?? ''}
                onChange={(e) =>
                  update((s) => ({ ...s, notes: { ...s.notes, [p.id]: e.target.value } }))
                }
                placeholder="Add sources, links, questions and inspection notes…"
              />
            </label>
            <span className="small muted">Saved locally as you type.</span>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!note.trim()) return;
                update((s) => ({
                  ...s,
                  events: [
                    {
                      id: crypto.randomUUID(),
                      propertyId: p.id,
                      at: new Date().toISOString(),
                      kind: 'note',
                      text: note.trim(),
                    },
                    ...s.events,
                  ],
                }));
                setNote('');
              }}
            >
              <label>
                Add timeline entry
                <input required value={note} onChange={(e) => setNote(e.target.value)} />
              </label>
              <button disabled={!ready} className="primary">
                Add entry
              </button>
            </form>
          </section>
          <section className="panel">
            <h2>Property timeline</h2>
            {events.length === 0 ? (
              <p className="empty">No events yet. Add a research entry.</p>
            ) : (
              <ol className="timeline">
                {events.map((e) => (
                  <li key={e.id}>
                    <small>
                      {new Date(e.at).toLocaleDateString('en-AU', {
                        timeZone: 'Australia/Brisbane',
                      })}{' '}
                      · {e.kind}
                    </small>
                    <p>{e.text}</p>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      )}
    </>
  );
}
