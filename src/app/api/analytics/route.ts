import { handle, ok, enforceRateLimit, readJson } from '@/lib/api';
import { requirePermission } from '@/lib/auth/session';
import { z } from 'zod';
import { track, analyticsSummary, type AnalyticsType } from '@/lib/analytics';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ingestSchema = z.object({
  type: z.enum([
    'page_view',
    'search',
    'resource_view',
    'download',
    'media_view',
    'event_registration',
  ]),
  path: z.string().max(500).optional(),
  entityType: z.string().max(60).optional(),
  entityId: z.string().max(64).optional(),
  sessionId: z.string().max(64).optional(),
  referrer: z.string().max(300).optional(),
});

/** Public beacon endpoint used by the client-side page-view tracker. */
export const POST = handle(async (req) => {
  enforceRateLimit(req, 'analytics-ingest', { max: 240 });
  // Honour the opt-out cookie set by the consent banner.
  if (req.headers.get('cookie')?.includes('psp_analytics=0')) {
    return ok({ recorded: false, reason: 'opted_out' });
  }
  const body = ingestSchema.parse(await readJson(req));
  await track({ ...body, type: body.type as AnalyticsType });
  return ok({ recorded: true });
});

/** Admin/editor summary. */
export const GET = handle(async (req) => {
  await requirePermission('analytics:read');
  const days = Number(new URL(req.url).searchParams.get('days') ?? '30');
  const summary = await analyticsSummary(Number.isFinite(days) ? Math.min(365, Math.max(7, days)) : 30);
  return ok(summary);
});
