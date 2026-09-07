import type { Metadata } from 'next';
import Link from 'next/link';
import { Database, ArrowRight } from 'lucide-react';
import { PageHero } from '@/components/content/page-hero';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { listAllSeries, anyExternalProviderConfigured } from '@/lib/data-providers';
import { prisma } from '@/lib/db';
import { safe } from '@/lib/safe';
import { DatasetCard } from '@/components/content/cards';
import { demoDatasets } from '@/lib/demo-data';
import { AnimatedNumber } from '@/components/motion';
import { DEMO_SERIES } from '@/lib/data-providers/demo';

function metric(id: keyof typeof DEMO_SERIES) {
  const s = DEMO_SERIES[id]();
  return { name: s.name, unit: s.unit, last: s.points[s.points.length - 1]?.value ?? 0 };
}

export const metadata: Metadata = {
  title: 'Polar Data',
  description:
    'Visualisations of polar environmental data — sea ice, temperature, ocean and cryosphere indicators — each with source, unit, methodology and CSV/JSON download.',
};

export const revalidate = 3600;

export default async function DataPage() {
  const providers = await listAllSeries();
  const externalConfigured = anyExternalProviderConfigured();

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
  const datasetRows = datasets.length ? datasets : demoDatasets;

  return (
    <>
      <PageHero
        imageSlot="data"
        eyebrow="Polar Data"
        title="Read the changing pulse of Earth's frozen regions."
        description="Interactive time-series for key polar indicators. The portal is a dissemination platform: every series shows its source, unit, methodology and last-updated date."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Polar Data' }]}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            metric('arctic-sea-ice-extent'),
            metric('antarctic-sea-ice-extent'),
            metric('southern-ocean-sst'),
          ].map((m) => (
            <div key={m.name} className="glass rounded-2xl px-4 py-3 text-foreground">
              <p className="metadata">{m.name.replace(' (demo)', '')}</p>
              <p className="mt-1 font-display text-2xl font-medium">
                <AnimatedNumber value={m.last} decimals={1} suffix={` ${m.unit}`} />
              </p>
              <p className="mt-0.5 text-[0.7rem] text-warning">Demonstration dataset</p>
            </div>
          ))}
        </div>
      </PageHero>

      <div className="container-page py-10">
        {!externalConfigured ? (
          <div className="mb-8 rounded-lg border border-dashed border-warning/60 bg-warning/10 p-4 text-sm text-warning dark:text-warning">
            <strong>Demo data mode.</strong> No external scientific data provider is configured
            (see <code>NSIDC_SEA_ICE_API_URL</code> and related variables in{' '}
            <code>.env</code>). All series below are clearly-labelled demo datasets generated for
            interface demonstration — they are not measurements and must not be cited.
          </div>
        ) : null}

        <div className="space-y-10">
          {providers.map((p) => (
            <section key={p.provider}>
              <div className="mb-4 flex items-center gap-2">
                <Database className="h-5 w-5 text-accent" />
                <h2 className="font-display text-xl font-semibold">{p.label}</h2>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {p.series.map((s) => (
                  <Link key={s.id} href={`/data/${s.id}`}>
                    <Card className="h-full transition-shadow hover:shadow-md">
                      <CardHeader className="pb-2">
                        <div className="mb-1 flex items-center justify-between">
                          <Badge variant="demo">Demo</Badge>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <CardTitle className="text-base">{s.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs text-muted-foreground">
                        Open interactive chart with source, methodology and CSV / JSON download.
                      </CardContent>
                    </Card>
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
