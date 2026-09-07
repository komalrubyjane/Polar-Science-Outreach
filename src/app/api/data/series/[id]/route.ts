import { NextResponse } from 'next/server';
import { handle, ok, fail } from '@/lib/api';
import { getSeriesById } from '@/lib/data-providers';
import { prisma } from '@/lib/db';
import { track } from '@/lib/analytics';
import type { NormalizedSeries } from '@/lib/data-providers/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function resolve(id: string): Promise<NormalizedSeries | null> {
  const fromProvider = await getSeriesById(id);
  if (fromProvider) return fromProvider;

  // Fall back to a DB dataset's latest version series.
  const dataset = await prisma.dataset
    .findFirst({
      where: { OR: [{ id }, { slug: id }], status: 'PUBLISHED' },
      include: { versions: { orderBy: { releasedAt: 'desc' }, take: 1 }, institution: true },
    })
    .catch(() => null);
  if (!dataset) return null;
  const version = dataset.versions[0];
  const points = Array.isArray(version?.series)
    ? (version!.series as { t: string; value: number }[])
    : [];
  return {
    id: dataset.slug,
    name: dataset.title,
    unit: dataset.unit ?? '',
    pole: dataset.pole,
    description: dataset.description,
    methodology: dataset.methodology ?? undefined,
    source: dataset.source,
    sourceKey: 'PORTAL' as const,
    cadence: 'historical' as const,
    sourceUrl: dataset.externalUrl ?? undefined,
    license: dataset.license,
    isDemo: dataset.isDemo,
    lastUpdated: (dataset.lastUpdatedAt ?? dataset.updatedAt).toISOString().slice(0, 10),
    points,
  };
}

export const GET = handle(async (req, ctx) => {
  const { id } = await ctx.params;
  const format = new URL(req.url).searchParams.get('format');
  const series = await resolve(id);
  if (!series) return fail(404, 'Series not found');

  void track({ type: 'resource_view', entityType: 'DataSeries', entityId: series.id });

  if (format === 'csv') {
    const header = `# ${series.name}\n# unit: ${series.unit}\n# source: ${series.source}\n# license: ${series.license}\n# demo: ${series.isDemo}\n# last_updated: ${series.lastUpdated}\nperiod,value\n`;
    const rows = series.points.map((p) => `${p.t},${p.value}`).join('\n');
    return new NextResponse(header + rows + '\n', {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${series.id}.csv"`,
      },
    });
  }

  if (format === 'json-file') {
    return new NextResponse(JSON.stringify(series, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${series.id}.json"`,
      },
    });
  }

  return ok(series);
});
