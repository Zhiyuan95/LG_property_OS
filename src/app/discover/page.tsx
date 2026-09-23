import { getRepository } from '@/lib/repository';
import { Discover } from '@/components/discover';
import { PublicMarket } from '@/components/public-market';
import { PageHeading } from '@/components/ui';
import Link from 'next/link';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; view?: string }>;
}) {
  const { q, view } = await searchParams;
  const demo = view === 'demo' || q !== undefined;
  return (
    <>
      <div className="data-mode">
        <Link className={!demo ? 'button primary' : 'button'} href="/discover">
          Public regional data
        </Link>
        <Link className={demo ? 'button primary' : 'button'} href="/discover?view=demo">
          Demo property listings
        </Link>
      </div>
      {demo ? (
        <Discover key={q ?? ''} data={await getRepository().snapshot()} query={q ?? ''} />
      ) : (
        <>
          <PageHeading
            eyebrow="DISCOVER / AUSTRALIA"
            title="Start with regional evidence"
            subtitle="Public ABS housing statistics with observation dates, units and source quality notes."
          />
          <PublicMarket />
        </>
      )}
    </>
  );
}
