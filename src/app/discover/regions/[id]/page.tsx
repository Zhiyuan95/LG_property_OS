import Link from 'next/link';
import { PublicMarket } from '@/components/public-market';
import { PageHeading } from '@/components/ui';
import { notFound } from 'next/navigation';
const regions = [
  '1GSYD',
  '1RNSW',
  '2GMEL',
  '2RVIC',
  '3GBRI',
  '3RQLD',
  '4GADE',
  '4RSAU',
  '5GPER',
  '5RWAU',
  '6GHOB',
  '6RTAS',
  '7GDAR',
  '7RNTE',
  '8ACTE',
];
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!regions.includes(id)) notFound();
  return (
    <>
      <Link className="back" href="/discover">
        ← Australia scanner
      </Link>
      <PageHeading
        eyebrow="DISCOVER / PUBLIC REGION"
        title="Regional evidence"
        subtitle="Understand the geography, observation period and source quality before drawing conclusions."
      />
      <PublicMarket regionId={id} />
      <section className="panel">
        <h2>Research this region</h2>
        <p>
          Open Ask AI to analyse this region’s available quarters. The assistant receives these
          public observations and source limitations.
        </p>
        <p className="muted">
          Suburb demographics, rental vacancy, parcel hazards and live property listings are not
          supplied by this dataset.
        </p>
      </section>
    </>
  );
}
