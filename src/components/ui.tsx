import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Property, Suburb } from '@/lib/types';
import { grossYield, money } from '@/lib/finance';
export function PageHeading({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
export function PropertyCard({ p, s, rank }: { p: Property; s: Suburb; rank?: number }) {
  return (
    <article className="property-card">
      {rank && <span className="rank">{rank}</span>}
      <div className="card-body">
        <div className="section-head">
          <div>
            <Link className="property-title" href={'/discover/property/' + p.id}>
              {p.address}, {s.name} {s.state}
            </Link>
            <p className="muted">
              House · {p.beds} bed · {p.land} m² · {grossYield(p.price, p.rent).toFixed(2)}% gross
              yield
            </p>
          </div>
          <div className="price">
            <strong>{money(p.price)}</strong>
            <span className="tag">
              {p.score >= 82 ? 'Strong' : 'Fair'} sample match · {p.score}
            </span>
          </div>
        </div>
        <div className="reasons">
          <div>
            <h3>Why now</h3>
            <ul>
              {p.why.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>What could I be wrong about?</h3>
            <ul className="muted">
              {p.questions.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </article>
  );
}
