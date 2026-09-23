import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getRepository } from '@/lib/repository';
import { money } from '@/lib/finance';
import { PageHeading, PropertyCard } from '@/components/ui';
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const repo = getRepository();
  const s = await repo.suburb(id);
  if (!s) notFound();
  const data = await repo.snapshot();
  const rows = data.properties.filter((p) => p.suburbId === id);
  return (
    <>
      <Link className="back" href="/discover">
        ← Australia scanner
      </Link>
      <PageHeading
        eyebrow={`SUBURB INTELLIGENCE / ${s.state} ${s.postcode}`}
        title={s.name}
        subtitle="Understand the suburb before you shortlist a property."
      />
      <div className="notice">
        All indicators are illustrative fixtures as of 23 Sep 2026. No ABS or market provider
        connected.
      </div>
      <div className="stat-grid">
        {[
          ['Median price', money(s.median)],
          ['Vacancy rate', s.vacancy + '%'],
          ['12-month rent growth', '+' + s.rentGrowth + '%'],
          ['Population', s.population.toLocaleString('en-AU')],
        ].map(([k, v]) => (
          <div className="panel" key={k}>
            <p className="eyebrow">{k}</p>
            <strong className="stat">{v}</strong>
          </div>
        ))}
      </div>
      <div className="two-col">
        <section className="panel">
          <h2>Market context</h2>
          <p>
            This sample pairs rental demand indicators with an entry-price benchmark. A suburb
            median is not a valuation of a specific property.
          </p>
          <dl className="metrics">
            <div>
              <dt>Properties in sample</dt>
              <dd>{rows.length}</dd>
            </div>
            <div>
              <dt>Data confidence</dt>
              <dd>Illustrative</dd>
            </div>
          </dl>
        </section>
        <section className="panel">
          <h2>Research before deciding</h2>
          <ul>
            <li>Verify employment and population trends with ABS data.</li>
            <li>Review council approvals and future housing supply.</li>
            <li>Request recent comparable sales and rental evidence.</li>
            <li>Check hazards against each property's parcel.</li>
          </ul>
        </section>
      </div>
      <div className="section-head">
        <h2>Explore properties in {s.name}</h2>
        <span className="muted">{rows.length} sample homes</span>
      </div>
      {rows.map((p) => (
        <PropertyCard key={p.id} p={p} s={s} />
      ))}
    </>
  );
}
