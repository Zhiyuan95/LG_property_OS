import { notFound } from 'next/navigation';
import { getRepository } from '@/lib/repository';
import { PropertyDetail } from '@/components/property-detail';
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const repo = getRepository();
  const property = await repo.property(id);
  if (!property) notFound();
  return (
    <PropertyDetail
      key={id}
      property={property}
      data={await repo.snapshot()}
      tab={(await searchParams).tab ?? 'Overview'}
    />
  );
}
