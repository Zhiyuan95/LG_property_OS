import { getPublicSnapshot } from '@/lib/abs-client';
import { apiError } from '@/lib/local-api';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  try {
    return Response.json(
      await getPublicSnapshot(new URL(request.url).searchParams.get('refresh') === '1'),
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return apiError(
      'ABS data is unavailable. Please retry. No demo data has been substituted.',
      503,
    );
  }
}
