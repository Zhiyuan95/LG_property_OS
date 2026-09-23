import { apiError, requireLocalMutation, readSmallJson } from '@/lib/local-api';
import { research, ResearchError } from '@/lib/research';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  try {
    requireLocalMutation(request);
  } catch {
    return apiError('Send research requests from this local app only.', 403);
  }
  let raw: unknown;
  try {
    raw = await readSmallJson(request);
  } catch {
    return apiError('Invalid question request.', 400);
  }
  const b = raw as Record<string, unknown> | null;
  if (
    !b ||
    typeof b.question !== 'string' ||
    !b.question.trim() ||
    b.question.length > 4000 ||
    [b.regionId, b.propertyId].some(
      (v) => v !== undefined && (typeof v !== 'string' || !/^[A-Za-z0-9_-]{1,60}$/.test(v)),
    )
  )
    return apiError('Enter a question of 1–4,000 characters and a valid context.', 400);
  try {
    return Response.json(
      await research(
        b.question.trim(),
        b.regionId as string | undefined,
        b.propertyId as string | undefined,
      ),
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (e) {
    return e instanceof ResearchError
      ? apiError(e.message, e.status)
      : apiError('Research is temporarily unavailable.', 500);
  }
}
