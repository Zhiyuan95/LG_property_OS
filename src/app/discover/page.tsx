import { getRepository } from '@/lib/repository';
import { Discover } from '@/components/discover';
export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return <Discover key={q ?? ''} data={await getRepository().snapshot()} query={q ?? ''} />;
}
