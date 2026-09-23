import { getRepository } from '@/lib/repository';
import { Portfolio } from '@/components/portfolio';
export default async function Page() {
  return <Portfolio data={await getRepository().snapshot()} />;
}
