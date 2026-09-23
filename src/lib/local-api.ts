/** This phase intentionally serves one local user. Reject public-host or cross-origin mutations. */
export function requireLocalMutation(request: Request): void {
  const url = new URL(request.url),
    origin = request.headers.get('origin');
  // Next can normalize request.url to localhost even when the browser uses 127.0.0.1.
  // Validate the actual Host header; never trust X-Forwarded-Host for this local-only app.
  const host = request.headers.get('host') ?? url.host;
  const expected = new URL(`${url.protocol}//${host}`);
  if (
    !['127.0.0.1', 'localhost', '[::1]'].includes(expected.hostname) ||
    expected.username ||
    expected.password ||
    expected.host !== host ||
    expected.pathname !== '/' ||
    expected.search ||
    expected.hash ||
    origin !== expected.origin
  )
    throw new Error('LOCAL_ORIGIN_REQUIRED');
  if (!request.headers.get('content-type')?.startsWith('application/json'))
    throw new Error('JSON_REQUIRED');
}
export async function readSmallJson(request: Request, limit = 10000): Promise<unknown> {
  if (Number(request.headers.get('content-length')) > limit) throw new Error('BODY_TOO_LARGE');
  const reader = request.body?.getReader();
  if (!reader) throw new Error('BODY_REQUIRED');
  let size = 0;
  const chunks: Uint8Array[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > limit) {
      await reader.cancel();
      throw new Error('BODY_TOO_LARGE');
    }
    chunks.push(value);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
}
export function apiError(message: string, status: number) {
  return Response.json({ error: message }, { status, headers: { 'Cache-Control': 'no-store' } });
}
