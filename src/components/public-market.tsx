'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { money } from '@/lib/finance';
import { type PublicObservation, type PublicSnapshot } from '@/lib/public-data';
export function PublicMarket({
  regionId,
  compact = false,
}: {
  regionId?: string;
  compact?: boolean;
}) {
  const [snapshot, setSnapshot] = useState<PublicSnapshot | null>(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(true),
    [query, setQuery] = useState('');
  async function load(refresh = false) {
    setBusy(true);
    setError('');
    try {
      const r = await fetch('/api/regions' + (refresh ? '?refresh=1' : ''), { cache: 'no-store' });
      const json = await r.json();
      if (!r.ok) throw new Error(json.error);
      setSnapshot(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load ABS data.');
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  const regions = snapshot
    ? Array.from(new Map(snapshot.observations.map((o) => [o.regionId, o.region])))
        .sort((a, b) => a[1].localeCompare(b[1]))
        .filter(
          ([id, name]) =>
            (!regionId || id === regionId) && name.toLowerCase().includes(query.toLowerCase()),
        )
    : [];
  const shown = compact ? regions.slice(0, 4) : regions;
  const value = (id: string, m: string) =>
    snapshot?.observations.find(
      (o) => o.regionId === id && o.measureId === m && o.period === snapshot.latestPeriod,
    );
  function formatted(o: PublicObservation | undefined) {
    return o?.value == null
      ? 'Not available'
      : o.unit === 'AUD'
        ? money(o.value)
        : o.value.toLocaleString('en-AU');
  }
  return (
    <section className="panel public-market">
      <div className="section-head">
        <div>
          <p className="eyebrow">PUBLIC REGIONAL DATA</p>
          <h2>
            {regionId
              ? (regions[0]?.[1] ?? 'Regional market context')
              : 'Regional housing statistics'}
          </h2>
        </div>
        <div className="inline">
          <span className="tag">ABS API · Beta</span>
          <button disabled={busy} onClick={() => void load(true)}>
            {busy ? 'Loading…' : 'Refresh'}
          </button>
        </div>
      </div>
      <p className="muted">
        Official-source API observations · capital-city regions and rest of state. These are not
        individual listings or suburb valuations.
      </p>
      {error && (
        <p role="alert" className="notice">
          {error}
        </p>
      )}
      {!snapshot && busy && <p role="status">Fetching public data from ABS…</p>}
      {snapshot && (
        <>
          <div className="source-meta">
            <span>
              Latest period: <b>{snapshot.latestPeriod}</b>
            </span>
            <span>Retrieved: {new Date(snapshot.fetchedAt).toLocaleString('en-AU')}</span>
            <span>{snapshot.stale ? 'Stale snapshot' : 'Cached for up to 6 hours'}</span>
          </div>
          <details className="source-warning" open={regionId !== undefined}>
            <summary>Source quality notes · {snapshot.warnings.length} notices</summary>
            {snapshot.warnings.map((w) => (
              <p key={w}>{w}</p>
            ))}
          </details>
          {!compact && !regionId && (
            <label>
              Find a region
              <input
                placeholder="Brisbane, Perth, Rest of Qld…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
          )}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Region</th>
                  <th>House transfer median</th>
                  <th>Attached dwelling median</th>
                  <th>House transfers</th>
                  <th>Quality</th>
                </tr>
              </thead>
              <tbody>
                {shown.map(([id, name]) => (
                  <tr key={id}>
                    <td>
                      <Link href={'/discover/regions/' + id}>{name} ↗</Link>
                    </td>
                    <td className="mono">{formatted(value(id, '3'))}</td>
                    <td className="mono">{formatted(value(id, '4'))}</td>
                    <td className="mono">{formatted(value(id, '1'))}</td>
                    <td>
                      <span
                        className="tag amber"
                        title={value(id, '3')?.status ?? 'See source metadata'}
                      >
                        {value(id, '3')?.status?.includes('preliminary')
                          ? 'Preliminary'
                          : value(id, '3')?.status?.includes('revised')
                            ? 'Revised'
                            : 'See metadata'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {shown.length === 0 && <p className="empty">No matching public region.</p>}
          {regionId && (
            <>
              <h3 className="history-title">House transfer median · available quarters</h3>
              <div className="quarter-history">
                {snapshot.observations
                  .filter((o) => o.regionId === regionId && o.measureId === '3')
                  .sort((a, b) => a.period.localeCompare(b.period))
                  .map((o) => (
                    <div key={o.id}>
                      <span>{o.period}</span>
                      <strong>{formatted(o)}</strong>
                      <small>{o.status ?? 'Status not supplied'}</small>
                    </div>
                  ))}
              </div>
              <p className="small muted">
                Changes in transaction mix affect these medians. Do not interpret quarter-to-quarter
                movement as property capital growth.
              </p>
            </>
          )}
          <div className="section-head source-links">
            <a href={snapshot.sourceUrl} target="_blank" rel="noreferrer">
              Open source data ↗
            </a>
            <a
              href="https://www.abs.gov.au/statistics/economy/price-indexes-and-inflation/total-value-dwellings/latest-release"
              target="_blank"
              rel="noreferrer"
            >
              Cross-check ABS release ↗
            </a>
            {compact && <Link href="/discover?view=regions">Explore all regions →</Link>}
          </div>
        </>
      )}
    </section>
  );
}
