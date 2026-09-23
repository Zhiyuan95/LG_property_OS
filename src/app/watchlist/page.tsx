import { getRepository } from '@/lib/repository';
import { Watchlist } from '@/components/watchlist';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string }>;
}) {
  const { stage } = await searchParams;
  return (
    <Watchlist
      key={stage ?? ''}
      data={await getRepository().snapshot()}
      initialStage={stage ?? 'All'}
    />
  );
}
