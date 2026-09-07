import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Download, AlertTriangle } from 'lucide-react';
import { PageHero } from '@/components/content/page-hero';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataProvenance } from '@/components/ui/misc';
import { SourceBadge, DataFreshness } from '@/components/glass';
import { SeriesChart } from '@/components/charts/series-chart';
import { getSeriesById } from '@/lib/data-providers';
import { prisma } from '@/lib/db';
import { safe } from '@/lib/safe';
import { POLE_LABELS } from '@/lib/constants';
import type { NormalizedSeries } from '@/lib/data-providers/types';

export const dynamic = 'force-dynamic';

async function resolveSeries(slug: string): Promise<NormalizedSeries | null> {
  const provider = await getSeriesById(slug);
  if (provider) return provider;
  const dataset = await safe(
    () =>
      prisma.dataset.findFirst({
        where: { OR: [{ slug }, { id: slug }], status: 'PUBLISHED' },
        include: { versions: { orderBy: { releasedAt: 'desc' }, take: 1 } },
      }),
    null,
    'dataSeriesDataset',
  );
  if (!dataset) return null;
  const points = Array.isArray(dataset.versions[0]?.series)
    ? (dataset.versions[0]!.series as { t: string; value: number }[])
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
    license: dataset.license,
    isDemo: dataset.isDemo,
    lastUpdated: (dataset.lastUpdatedAt ?? dataset.updatedAt).toISOString().slice(0, 10),
    points,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = await resolveSeries(slug);
  if (!s) return { title: 'Dataset not found' };
  return { title: s.name, description: s.description.slice(0, 200) };
}

export default async function DataSeriesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const series = await resolveSeries(slug);
  if (!series) notFound();

  return (
    <>
      <PageHero
        eyebrow="Polar Data"
        title={series.name}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Polar Data', href: '/data' },
          { label: series.name },
        ]}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="accent">{POLE_LABELS[series.pole]}</Badge>
          <SourceBadge source={series.isDemo ? 'DEMO' : series.sourceKey} tone="auto" />
          {!series.unavailable ? (
            <DataFreshness lastUpdated={series.lastUpdated} />
          ) : null}
          <Badge variant="outline">Unit: {series.unit || 'n/a'}</Badge>
        </div>
      </PageHero>

      <div className="container-page grid gap-10 py-10 lg:grid-cols-[1fr_300px]">
        <div>
          {series.degraded ? (
            <div className="mb-4 flex items-start gap-2 rounded-card border border-warning/50 bg-warning/10 p-3 text-sm text-warning">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                {series.degraded.reason} Latest cached dataset from {series.degraded.cachedFrom}.
              </p>
            </div>
          ) : null}

          <p className="mb-6 text-muted-foreground">{series.description}</p>

          {series.unavailable ? (
            <div className="rounded-card border border-border bg-surface-muted/60 p-8 text-center">
              <AlertTriangle className="mx-auto mb-3 h-6 w-6 text-warning" />
              <p className="font-display text-lg">Data temporarily unavailable</p>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                {series.unavailable.reason} No fabricated values are shown. Source:{' '}
                {series.unavailable.source}. Last attempted{' '}
                {new Date(series.unavailable.attemptedAt).toLocaleString('en-GB')}.
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-card border border-border bg-surface p-4">
                <SeriesChart
                  points={series.points}
                  unit={series.unit}
                  label={series.name}
                  kind="area"
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm">
                  <a href={`/api/data/series/${series.id}?format=csv`}>
                    <Download className="h-4 w-4" /> Download CSV
                  </a>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <a href={`/api/data/series/${series.id}?format=json-file`}>
                    <Download className="h-4 w-4" /> Download JSON
                  </a>
                </Button>
              </div>
            </>
          )}
        </div>

        <aside className="space-y-5">
          <DataProvenance
            source={series.source}
            publisher={series.source}
            lastUpdated={series.lastUpdated || 'unknown'}
            license={series.license}
            methodology={series.methodology}
            citation={series.citation}
            sourceUrl={series.sourceUrl}
            isDemo={series.isDemo}
          />
          <div className="rounded-lg border border-border bg-card p-4 text-sm">
            <h3 className="mb-1 font-semibold">About this platform</h3>
            <p className="text-muted-foreground">
              This portal disseminates and visualises data; it is not necessarily the original
              producer. Always cite the upstream source listed above.
            </p>
            <Link href="/about/data-policy" className="mt-2 inline-block text-accent hover:underline">
              Read the data policy →
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
