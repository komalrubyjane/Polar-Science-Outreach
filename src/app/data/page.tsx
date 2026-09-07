import type { Metadata } from 'next';
import Link from 'next/link';
import { Database, ArrowUpRight } from 'lucide-react';
import { PageHero } from '@/components/content/page-hero';
import { SourceBadge, DataFreshness } from '@/components/glass';
import { AnimatedNumber } from '@/components/motion';
import {
  getProviders,
  realDataStatus,
  SOURCE_LABELS,
  type NormalizedSeries,
} from '@/lib/data-providers';
import { prisma } from '@/lib/db';
import { safe } from '@/lib/safe';
import { DatasetCard } from '@/components/content/cards';
import { demoDatasets, demoEnabled } from '@/lib/demo-data';

export const metadata: Metadata = {
  title: 'Polar Data',
  description:
    'Real polar environmental time-series — NSIDC sea ice and related indicators — each with source, unit, methodology, citation and CSV/JSON download.',
};

// Cache the page for 30 minutes; NSIDC data itself is cached 6h in the provider.
export const revalidate = 1800;

export default async function DataPage() {
  const status = realDataStatus();

  // Resolve every series once (deduped by Next's data cache).
  const providerSeries = await Promise.all(
    getProviders().map(async (p) => {
      const list = await p.list();
      const resolved = await Promise.all(
        list.map((s) => safe(() => p.get(s.id), null, `data-${s.id}`)),
      );
      return {
        provider: p.key,
        label: p.label,
        series: resolved.filter((s): s is NormalizedSeries => Boolean(s)),
      };
    }),
  );

  const datasets = await safe(
    () =>
      prisma.dataset.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
        take: 12,
      }),
    [],
    'dataDatasets',
  );
  const datasetRows = datasets.length ? datasets : demoEnabled() ? demoDatasets : [];

  const headline = providerSeries
    .flatMap((p) => p.series)
    .filter((s) => s.sourceKey === 'NSIDC' && !s.unavailable)
    .slice(0, 3);

  return (
    <>
      <PageHero
        imageSlot="data"
        eyebrow="Polar Data"
        title="Read the changing pulse of Earth's frozen regions."
        description="Real monthly sea-ice extent from the NSIDC Sea Ice Index, refreshed every six hours. Every series shows its source, unit, methodology, citation and last observation."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Polar Data' }]}
      >
        {headline.length ? (
          <div className="grid gap-3 sm:grid-cols-3">
            {headline.map((s) => {
              const last = s.points.at(-1)!;
              return (
                <div key={s.id} className="glass rounded-2xl px-4 py-3 text-foreground">
                  <p className="metadata">{s.name}</p>
                  <p className="mt-1 font-display text-2xl font-medium">
                    <AnimatedNumber value={last.value} decimals={2} suffix={` ${s.unit}`} />
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <SourceBadge source="NSIDC" tone="light" />
                    <DataFreshness lastUpdated={s.lastUpdated} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </PageHero>

      <div className="container-page py-10">
        {!status.climate || !status.ocean ? (
          <div className="mb-8 rounded-card border border-border bg-surface-muted/60 p-4 text-sm text-muted-foreground">
            <strong className="text-foreground">Real data status.</strong> Sea ice is live from
            NSIDC. Climate, ocean and cryosphere providers are not yet connected
            {demoEnabled() ? ' — demonstration series are shown for those (DEMO_MODE).' : ' — those series show an "unavailable" state until a source is configured.'}
          </div>
        ) : null}

        <div className="space-y-10">
          {providerSeries.map((p) => (
            <section key={p.provider}>
              <div className="mb-4 flex items-center gap-2">
                <Database className="h-5 w-5 text-accent" />
                <h2 className="font-display text-xl font-semibold">{p.label}</h2>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {p.series.map((s) => (
                  <Link key={s.id} href={`/data/${s.id}`} className="card-ios group p-6">
                    <div className="mb-3 flex items-center justify-between">
                      <SourceBadge
                        source={s.isDemo ? 'DEMO' : s.sourceKey}
                        tone={s.isDemo ? 'auto' : 'auto'}
                      />
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </div>
                    <p className="font-display text-base font-medium tracking-tight group-hover:text-accent">
                      {s.name}
                    </p>
                    {s.unavailable ? (
                      <p className="mt-2 text-xs text-warning">
                        Data temporarily unavailable — {SOURCE_LABELS[s.sourceKey]}
                      </p>
                    ) : (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {s.points.length} points · {s.unit} ·{' '}
                        <DataFreshness lastUpdated={s.lastUpdated} className="inline" />
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        {datasetRows.length ? (
          <section className="mt-14">
            <h2 className="mb-4 font-display text-xl font-semibold">Catalogued datasets</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {datasetRows.map((d) => (
                <DatasetCard key={d.id} data={d} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
}
