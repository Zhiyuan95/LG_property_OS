'use client';
import Link from 'next/link';
import type { Dataset } from '@/lib/types';
import { money } from '@/lib/finance';
import { useStore } from './store';
import { PageHeading, PropertyCard } from './ui';
export function Portfolio({ data }: { data: Dataset }) {
  const { state } = useStore();
  const owned = data.properties.filter((p) => state.stages[p.id] === 'Purchased');
  return (
    <>
      <PageHeading
        title="Your portfolio"
        subtitle="Properties you mark as Purchased appear here."
      />
      <div className="notice">
        Demo tracking only. Figures below use sample asking prices and rents, not actual acquisition
        values or live valuations.
      </div>
      {owned.length ? (
        <>
          <div className="stat-grid">
            <div className="panel">
              <p className="eyebrow">PROPERTIES</p>
              <strong className="stat">{owned.length}</strong>
            </div>
            <div className="panel">
              <p className="eyebrow">SAMPLE ASKING TOTAL</p>
              <strong className="stat">{money(owned.reduce((s, p) => s + p.price, 0))}</strong>
            </div>
            <div className="panel">
              <p className="eyebrow">SAMPLE WEEKLY RENT</p>
              <strong className="stat">{money(owned.reduce((s, p) => s + p.rent, 0))}</strong>
            </div>
          </div>
          {owned.map((p) => (
            <PropertyCard key={p.id} p={p} s={data.suburbs.find((s) => s.id === p.suburbId)!} />
          ))}
        </>
      ) : (
        <div className="panel empty spacious">
          <div className="empty-symbol">⌂</div>
          <h2>A place for what you own</h2>
          <p>
            When your research leads to a purchase, move the property
            <br />
            to Purchased in your Watchlist to start tracking it here.
          </p>
          <Link className="button primary" href="/watchlist">
            Go to watchlist →
          </Link>
        </div>
      )}
    </>
  );
}
