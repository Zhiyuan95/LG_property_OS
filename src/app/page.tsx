import { getRepository } from '@/lib/repository';
import { Overview } from '@/components/overview';
export default async function Page() {
  return <Overview data={await getRepository().snapshot()} />;
}
