'use client';
import Link from 'next/link';
import { ArrowUpRight, SlidersHorizontal, Search } from 'lucide-react';
import type { Dataset } from '@/lib/types';
import { useStore } from './store';
import { PageHeading, PropertyCard } from './ui';
import { AustraliaMap } from './australia-map';
import { PublicMarket } from './public-market';
import { describeBuyBox } from '@/lib/buy-box';
export function Overview({ data }: { data: Dataset }) {
  const { state } = useStore();
  const pref = state.preferences;
  const resume = data.properties.find((p) => state.stages[p.id] === 'Researching');
  return (
    <>
      <PageHeading
        title={`Good morning, ${pref.name}`}
        subtitle="Your research, in focus. A sample snapshot of what changed and what’s next."
        action={
          <div className="inline">
            <Link className="button" href="/discover">
              <Search size={16} />
              Discover
            </Link>
            <Link className="button primary" href="/watchlist">
              Open watchlist <ArrowUpRight size={16} />
            </Link>
          </div>
        }
      />
      <div className="buybox">
        <span className="eyebrow">YOUR BUY BOX</span>
        <span>{describeBuyBox(pref)}</span>
        <Link href="/settings">
          <SlidersHorizontal size={14} /> Edit
        </Link>
      </div>
      <section className="panel">
        <h2>Search for a property</h2>
        <p>
          Your Buy Box is saved locally. A live listing provider is not connected, so there are no
          verified property matches or automated alerts.
        </p>
        <Link className="button primary" href="/discover">
          Open property search & Buy Box →
        </Link>
      </section>
      <PublicMarket compact />
      <details className="panel demo-workspace">
        <summary>Explore the fictional demo workspace · not real opportunities</summary>
        <div className="overview-grid">
          <section className="panel">
            <div className="section-head">
              <h2>Demo activity</h2>
              <span className="tag amber">3 sample updates</span>
            </div>
            {[
              {
                id: 'smith',
                title: '12 Smith St, Muirhead — price cut to $720k',
                body: 'Second cut in 31 days. Revisit the numbers and your open questions.',
                cta: 'Continue research',
              },
              {
                id: 'lake',
                title: '44 Lake Dr, Baldivis — under offer',
                body: 'Sample listing status changed. Explore other homes in the suburb.',
                cta: 'Review listing',
              },
              {
                id: 'wattle',
                title: '27 Wattle Cres — inspection candidate',
                body: 'Prepare your checklist: roof, termite history, rental appraisal.',
                cta: 'Open research',
              },
            ].map((a, i) => (
              <div className="attention-row" key={a.id}>
                <i className={'dot dot-' + i} />
                <div>
                  <b>{a.title}</b>
                  <p>{a.body}</p>
                </div>
                <Link
                  className="button compact"
                  href={'/discover/property/' + a.id + (i === 2 ? '?tab=Research' : '')}
                >
                  {a.cta}
                </Link>
              </div>
            ))}
          </section>
          <section className="panel">
            <div className="section-head">
              <h2>Demo pipeline</h2>
              <Link href="/watchlist">Open ↗</Link>
            </div>
            <div className="pipeline-counts">
              {(['Watching', 'Researching', 'Inspect', 'Offer'] as const).map((s) => (
                <Link
                  href={'/watchlist?stage=' + s}
                  className={s === 'Researching' ? 'dark' : ''}
                  key={s}
                >
                  <strong>{Object.values(state.stages).filter((v) => v === s).length}</strong>
                  <span>{s}</span>
                </Link>
              ))}
            </div>
            <div className="tint">
              <p className="eyebrow">CONTINUE RESEARCH</p>
              {resume ? (
                <>
                  <Link
                    className="property-title"
                    href={'/discover/property/' + resume.id + '?tab=Financials'}
                  >
                    {resume.address}
                  </Link>
                  <p className="small">Review your assumptions before the next step.</p>
                  <div className="question">
                    ! <span>Insurance quote</span>
                    <small>to verify</small>
                  </div>
                  <div className="question">
                    ! <span>Building & pest report</span>
                    <small>to verify</small>
                  </div>
                </>
              ) : (
                <Link href="/discover">Find your next property →</Link>
              )}
            </div>
          </section>
        </div>
        <AustraliaMap data={data} />
        <section className="opportunities">
          <div className="section-head">
            <h2>Demo property opportunities</h2>
            <Link href="/discover?view=demo">All {data.properties.length} sample listings ↗</Link>
          </div>
          {data.properties.slice(0, 3).map((p, i) => (
            <PropertyCard
              key={p.id}
              p={p}
              s={data.suburbs.find((s) => s.id === p.suburbId)!}
              rank={i + 1}
            />
          ))}
        </section>
      </details>
    </>
  );
}
