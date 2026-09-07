import { handle, ok, enforceRateLimit } from '@/lib/api';
import { globalSearch } from '@/lib/search';
import { track } from '@/lib/analytics';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = handle(async (req) => {
  enforceRateLimit(req, 'search', { max: 120 });
  const url = new URL(req.url);
  const q = (url.searchParams.get('q') ?? '').trim();
  const result = await globalSearch(q);
  if (q.length >= 2) {
    void track({ type: 'search', query: q, path: '/api/search' });
  }
  return ok(result);
});
