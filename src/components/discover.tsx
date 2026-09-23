'use client';
import { useState } from 'react';
import Link from 'next/link';
import type { Dataset } from '@/lib/types';
import { grossYield, money } from '@/lib/finance';
import { useStore } from './store';
import { PageHeading } from './ui';
import { AustraliaMap } from './australia-map';
import { matchesBuyBox } from '@/lib/buy-box';
export function Discover({ data, query }: { data: Dataset; query: string }) {
  const { state, ready, setStage } = useStore();
  const [q, setQ] = useState(query),
    [region, setRegion] = useState('All'),
    [sort, setSort] = useState('score'),
    [buybox, setBuybox] = useState(true),
    [view, setView] = useState('list');
  const rows = data.properties
    .filter((p) => {
      const s = data.suburbs.find((s) => s.id === p.suburbId)!;
      return (
        `${p.address} ${s.name} ${s.state}`.toLowerCase().includes(q.toLowerCase()) &&
        (region === 'All' || s.state === region) &&
        (!buybox || matchesBuyBox(p, s, state.preferences))
      );
    })
    .sort((a, b) =>
      sort === 'price'
        ? a.price - b.price
        : sort === 'yield'
          ? grossYield(b.price, b.rent) - grossYield(a.price, a.rent)
          : b.score - a.score,
    );
  return (
    <>
      <PageHeading
        eyebrow="DISCOVER / AUSTRALIA"
        title="Demo listings · fictional properties"
        subtitle="Test the research workflow only. These addresses, prices and statuses are not verified listings."
      />
      <div className="notice">
        Demo dataset · {data.properties.length} fictional listings across {data.suburbs.length}{' '}
        suburbs. No live listing feed.
      </div>
      <section className="panel">
        <p>
          <Link href="/discover#buy-box">Edit the full Buy Box →</Link>
        </p>
        <div className="filters">
          <label>
            Suburb or address
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search sample listings"
            />
          </label>
          <label>
            State
            <select value={region} onChange={(e) => setRegion(e.target.value)}>
              {['All', 'NT', 'WA', 'QLD', 'SA', 'NSW', 'VIC', 'TAS', 'ACT'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            Sort by
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="score">Sample match score</option>
              <option value="price">Price: low to high</option>
              <option value="yield">Gross yield: high to low</option>
            </select>
          </label>
          <label className="check">
            <input type="checkbox" checked={buybox} onChange={(e) => setBuybox(e.target.checked)} />
            Apply saved Buy Box to demo data
          </label>
        </div>
        <div className="section-head">
          <span className="muted">{rows.length} results</span>
          <div className="segmented">
            {['list', 'map'].map((v) => (
              <button key={v} aria-pressed={view === v} onClick={() => setView(v)}>
                {v === 'list' ? 'List' : 'Map'}
              </button>
            ))}
          </div>
        </div>
        {rows.length === 0 ? (
          <div className="empty">
            <h2>No matching sample listings</h2>
            <p>
              Unknown bathrooms, parking or garage values cannot pass an active minimum. Edit your
              Buy Box or turn it off to explore the fixtures.
            </p>
            <button
              onClick={() => {
                setQ('');
                setRegion('All');
                setBuybox(false);
              }}
            >
              Reset filters
            </button>
          </div>
        ) : view === 'map' ? (
          <AustraliaMap
            data={{
              ...data,
              properties: rows,
              suburbs: data.suburbs.filter((s) => rows.some((p) => p.suburbId === s.id)),
            }}
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Property / suburb</th>
                  <th>Type / beds / baths / parking</th>
                  <th>Asking price</th>
                  <th>Gross yield</th>
                  <th>Score*</th>
                  <th>Status</th>
                  <th>Watchlist</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => {
                  const s = data.suburbs.find((s) => s.id === p.suburbId)!;
                  return (
                    <tr key={p.id}>
                      <td>
                        <Link className="property-title" href={'/discover/property/' + p.id}>
                          {p.address}
                        </Link>
                        <Link className="suburb-link" href={'/discover/suburb/' + s.id}>
                          {s.name}, {s.state} ↗
                        </Link>
                      </td>
                      <td>
                        {p.propertyType ?? 'Unknown'} · {p.beds} beds · {p.baths ?? '?'} baths ·{' '}
                        {p.carSpaces ?? '?'} parking
                      </td>
                      <td className="mono">{money(p.price)}</td>
                      <td className="mono">{grossYield(p.price, p.rent).toFixed(2)}%</td>
                      <td>
                        <span className="score">{p.score}</span>
                      </td>
                      <td>{p.status}</td>
                      <td>
                        <button
                          disabled={!ready}
                          onClick={() =>
                            setStage(p.id, state.stages[p.id] ? undefined : 'Watching')
                          }
                        >
                          {state.stages[p.id] ? '✓ Saved' : '+ Watch'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="small muted">
          *Scores are illustrative editorial fixtures, not a calculated valuation or investment
          recommendation.
        </p>
      </section>
    </>
  );
}
