import 'server-only';
import { prisma } from '@/lib/db';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

export type AnalyticsType =
  | 'page_view'
  | 'search'
  | 'resource_view'
  | 'download'
  | 'media_view'
  | 'event_registration';

export interface AnalyticsInput {
  type: AnalyticsType;
  path?: string;
  query?: string;
  entityType?: string;
  entityId?: string;
  sessionId?: string;
  referrer?: string;
}

/**
 * Record an anonymous product-analytics event. No IP, no user id, no PII.
 * Disabled entirely when ANALYTICS_ENABLED=false. Never throws.
 */
export async function track(input: AnalyticsInput): Promise<void> {
  if (!env.ANALYTICS_ENABLED) return;
  try {
    await prisma.analyticsEvent.create({
      data: {
        type: input.type,
        path: input.path?.slice(0, 500),
        query: input.query?.slice(0, 200),
        entityType: input.entityType,
        entityId: input.entityId,
        sessionId: input.sessionId?.slice(0, 64),
        referrer: input.referrer?.slice(0, 300),
      },
    });
  } catch (err) {
    logger.warn('analytics write failed', {
      message: err instanceof Error ? err.message : String(err),
    });
  }
}

export interface AnalyticsSummary {
  totals: Record<AnalyticsType, number>;
  pageViewsByDay: { date: string; count: number }[];
  topSearches: { query: string; count: number }[];
  topResources: { entityType: string; entityId: string; count: number }[];
}

export async function analyticsSummary(days = 30): Promise<AnalyticsSummary> {
  const since = new Date(Date.now() - days * 86_400_000);

  const [grouped, byDay, searches, resources] = await Promise.all([
    prisma.analyticsEvent.groupBy({
      by: ['type'],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
    }),
    prisma.$queryRaw<{ date: string; count: bigint }[]>`
      SELECT to_char(date_trunc('day', "createdAt"), 'YYYY-MM-DD') AS date, COUNT(*)::bigint AS count
      FROM "AnalyticsEvent"
      WHERE "type" = 'page_view' AND "createdAt" >= ${since}
      GROUP BY 1 ORDER BY 1 ASC`,
    prisma.analyticsEvent.groupBy({
      by: ['query'],
      where: { type: 'search', query: { not: null }, createdAt: { gte: since } },
      _count: { _all: true },
      orderBy: { _count: { query: 'desc' } },
      take: 10,
    }),
    prisma.analyticsEvent.groupBy({
      by: ['entityType', 'entityId'],
      where: {
        type: { in: ['resource_view', 'media_view'] },
        entityId: { not: null },
        createdAt: { gte: since },
      },
      _count: { _all: true },
      orderBy: { _count: { entityId: 'desc' } },
      take: 10,
    }),
  ]);

  const totals = {
    page_view: 0,
    search: 0,
    resource_view: 0,
    download: 0,
    media_view: 0,
    event_registration: 0,
  } as Record<AnalyticsType, number>;
  for (const g of grouped) totals[g.type as AnalyticsType] = g._count._all;

  return {
    totals,
    pageViewsByDay: byDay.map((r) => ({ date: r.date, count: Number(r.count) })),
    topSearches: searches
      .filter((s) => s.query)
      .map((s) => ({ query: s.query as string, count: s._count._all })),
    topResources: resources
      .filter((r) => r.entityId)
      .map((r) => ({
        entityType: r.entityType ?? 'unknown',
        entityId: r.entityId as string,
        count: r._count._all,
      })),
  };
}
