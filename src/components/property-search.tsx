'use client';
import Link from 'next/link';
import { BuyBoxForm } from './buy-box-form';
import { useStore } from './store';
import { describeBuyBox } from '@/lib/buy-box';
import { PageHeading } from './ui';

export function PropertySearch() {
  const { state } = useStore();
  return (
    <>
      <PageHeading
        title="Property search"
        subtitle="Set your Buy Box, then search a connected listing source. Regional statistics do not contain homes for sale."
      />
      <div className="two-col search-workspace">
        <BuyBoxForm />
        <section className="panel">
          <h2>Search status</h2>
          <p className="tag amber">Listing source not connected</p>
          <p>
            No live property search has run. This is not a zero-match result: the app cannot query
            current listings yet.
          </p>
          <h3>Saved search criteria</h3>
          <p className="search-summary">{describeBuyBox(state.preferences)}</p>
          <h3>Manual scan</h3>
          <button disabled>Scan live listings · connection required</button>
          <p className="muted">
            Requires access to a listing provider, such as Domain. ABS and an OpenAI key do not
            provide a live listing feed.
          </p>
          <a
            href="https://developer.domain.com.au/docs/latest/apis/pkg_agents_listings/references/listings_detailedresidentialsearch/"
            target="_blank"
            rel="noreferrer"
          >
            Domain listing search access ↗
          </a>
          <h3>Automatic scan</h3>
          <p className="tag neutral">Not implemented</p>
          <p className="muted">
            There is no scheduled scan, price monitoring or notification service. Saving a Buy Box
            does not turn on background searches.
          </p>
          <hr />
          <h3>Search on a property website</h3>
          <p>
            Open the site and enter the criteria above manually. These links do not transfer
            filters, fetch results or add properties to this app.
          </p>
          <div className="inline">
            <a
              className="button"
              href="https://www.domain.com.au/sale/"
              target="_blank"
              rel="noreferrer"
            >
              Open Domain ↗
            </a>
            <a
              className="button"
              href="https://www.realestate.com.au/buy/"
              target="_blank"
              rel="noreferrer"
            >
              Open realestate.com.au ↗
            </a>
          </div>
          <p className="small">
            <Link href="/discover?view=demo">Explore fictional demo listings →</Link>
          </p>
        </section>
      </div>
    </>
  );
}
