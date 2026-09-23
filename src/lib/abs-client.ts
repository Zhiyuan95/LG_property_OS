import 'server-only';
import { parseAbs } from './abs-parser';
import { absDatasetUrl, type PublicSnapshot } from './public-data';
const TTL = 6 * 60 * 60 * 1000;
let cache: PublicSnapshot | undefined;
let pending: Promise<PublicSnapshot> | undefined;
let lastAttempt = 0;
/** Bounded upstream query, in-process cache and request coalescing. No mock fallback. */
export async function getPublicSnapshot(refresh = false): Promise<PublicSnapshot> {
  const now = Date.now();
  if (cache && now - Date.parse(cache.fetchedAt) < TTL && (!refresh || now - lastAttempt < 60000))
    return cache;
  if (pending) return pending;
  if (!cache && lastAttempt && now - lastAttempt < 10000)
    throw new Error('ABS is temporarily unavailable. Retry shortly.');
  lastAttempt = now;
  pending = (async () => {
    try {
      const response = await fetch(absDatasetUrl, {
        cache: 'no-store',
        headers: { Accept: 'application/vnd.sdmx.data+json' },
        signal: AbortSignal.timeout(20000),
      });
      if (!response.ok) throw new Error('ABS upstream request failed');
      const body = await response.text();
      if (body.length > 2_000_000) throw new Error('ABS response exceeds size limit');
      cache = parseAbs(JSON.parse(body), new Date().toISOString());
      return cache;
    } catch {
      if (cache && now - Date.parse(cache.fetchedAt) < 7 * 24 * 60 * 60 * 1000)
        return {
          ...cache,
          stale: true,
          warnings: [
            ...cache.warnings,
            'Refresh failed. Showing the last successful snapshot; check its retrieval time.',
          ],
        };
      throw new Error(
        'ABS could not be reached or returned an unsupported response. No sample values have been substituted.',
      );
    } finally {
      pending = undefined;
    }
  })();
  return pending;
}
