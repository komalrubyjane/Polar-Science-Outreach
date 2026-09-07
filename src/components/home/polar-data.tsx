import Link from 'next/link';
import { getPolarSnapshot } from '@/lib/queries';
import { SeaIceProvider } from '@/lib/data-providers';
import { safe } from '@/lib/safe';
import { AnimatedNumber } from '@/components/motion';
import { FloatingStat, SourceBadge, DataFreshness } from '@/components/glass';
import { Sparkline } from '@/components/editorial/sparkline';
import { SectionHeading, EditorialLink } from '@/components/editorial/primitives';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/utils';

/* ---- Hero floating glass panels (real NSIDC sea ice) ---- */

export async function HeroPanels() {
  const snap = await getPolarSnapshot();
  const arctic = snap.arcticSeaIce;
  return (
    <>
      <FloatingStat label="Region" value="78° N" sub="Arctic Ocean" />
      <FloatingStat
        label="Arctic sea ice"
        value={
          arctic.unavailable || arctic.value == null ? (
            'Unavailable'
          ) : (
            <AnimatedNumber value={arctic.value} decimals={2} suffix={` ${arctic.unit}`} />
          )
        }
        sub={arctic.unavailable ? 'NSIDC — no response' : `NSIDC · ${arctic.lastUpdated ?? ''}`}
        className="[animation-delay:1.2s]"
      />
      <FloatingStat
        label="Research stations"
        value={<AnimatedNumber value={snap.researchStations} />}
        sub="Catalogued"
        className="[animation-delay:2.4s]"
      />
    </>
  );
}

export function HeroPanelsSkeleton() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <div key={i} className="glass-dark h-20 w-44 rounded-2xl">
          <div className="skeleton m-3 h-3 w-16 rounded" />
          <div className="skeleton mx-3 h-5 w-28 rounded" />
        </div>
      ))}
    </>
  );
}

/* ---- Live polar snapshot strip (section, real numbers) ---- */

export async function LiveSnapshot() {
  const snap = await getPolarSnapshot();
  const cards: {
    label: string;
    value: React.ReactNode;
    sub: string;
    fresh?: string | null;
  }[] = [
    {
      label: 'Arctic sea ice extent',
      value: snap.arcticSeaIce.unavailable ? (
        <span className="text-warning">Unavailable</span>
      ) : (
        <AnimatedNumber value={snap.arcticSeaIce.value ?? 0} decimals={2} suffix=" M km²" />
      ),
      sub: snap.arcticSeaIce.source,
      fresh: snap.arcticSeaIce.lastUpdated,
    },
    {
      label: 'Antarctic sea ice extent',
      value: snap.antarcticSeaIce.unavailable ? (
        <span className="text-warning">Unavailable</span>
      ) : (
        <AnimatedNumber value={snap.antarcticSeaIce.value ?? 0} decimals={2} suffix=" M km²" />
      ),
      sub: snap.antarcticSeaIce.source,
      fresh: snap.antarcticSeaIce.lastUpdated,
    },
    {
      label: 'Datasets available',
      value: <AnimatedNumber value={snap.datasetsAvailable} />,
      sub: 'Polar Science Portal catalogue',
    },
    {
      label: 'Research stations',
      value: <AnimatedNumber value={snap.researchStations} />,
      sub: 'Catalogued locations',
    },
    {
      label: 'Publications · 90 days',
      value: <AnimatedNumber value={snap.recentPublications} />,
      sub: 'Knowledge repository',
    },
    {
      label: 'Active expeditions',
      value: <AnimatedNumber value={snap.activeExpeditions} />,
      sub: 'Field campaigns underway',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((c) => (
        <div key={c.label} className="card-ios p-6">
          <p className="metadata">{c.label}</p>
          <p className="mt-3 font-display text-3xl font-medium tracking-tight sm:text-4xl">
            {c.value}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <SourceBadge source={c.sub} />
            {c.fresh !== undefined ? <DataFreshness lastUpdated={c.fresh} /> : null}
          </div>
        </div>
      ))}
    </div>
  );
}

export function LiveSnapshotSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="card-ios p-6">
          <div className="skeleton h-3 w-32 rounded" />
          <div className="skeleton mt-4 h-9 w-40 rounded" />
          <div className="skeleton mt-4 h-4 w-24 rounded" />
        </div>
      ))}
    </div>
  );
}

/* ---- Section 03: editorial data teaser (real Arctic sea ice series) ---- */

export async function DataTeaser() {
  const provider = new SeaIceProvider();
  const series = await safe(
    () => provider.get('arctic-sea-ice-extent'),
    null,
    'homeDataTeaser',
  );
  const values = series?.points.map((p) => p.value) ?? [];
  const last = values.at(-1);
  const first = values[0];
  const pct = first && last ? ((last - first) / Math.abs(first)) * 100 : 0;
  const unavailable = !series || series.unavailable || values.length < 2;

  return (
    <section className="border-y border-polar-navy/10 bg-polar-glacier text-polar-navy [&_.eyebrow]:text-polar-ocean [&_.hairline]:bg-polar-navy/15">
      <div className="editorial py-24 sm:py-36">
        <SectionHeading
          index="04"
          kicker="Polar Data"
          title={<span className="text-polar-navy">The ice is moving.</span>}
          lead={
            <span className="text-polar-navy/70">
              Real monthly sea-ice extent from the NSIDC Sea Ice Index, refreshed every six
              hours. Every series carries its source, unit and citation.
            </span>
          }
          action={
            <EditorialLink href="/data" className="text-polar-ocean hover:text-polar-navy">
              Full data
            </EditorialLink>
          }
        />

        {unavailable ? (
          <div className="glass max-w-lg rounded-card p-6">
            <p className="font-display text-lg text-polar-navy">Data temporarily unavailable</p>
            <p className="mt-2 text-sm text-polar-navy/70">
              The NSIDC Sea Ice Index did not respond. No fabricated values are shown. Try the{' '}
              <Link href="/data" className="text-polar-ocean underline">
                full data page
              </Link>{' '}
              again shortly.
            </p>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <p className="metadata text-polar-navy/60">
                Arctic sea ice extent — latest monthly mean
              </p>
              <p className="mt-4 font-display text-6xl font-medium tracking-tight text-polar-navy sm:text-7xl">
                <AnimatedNumber value={last!} decimals={2} />
                <span className="ml-2 align-top text-2xl text-polar-navy/60">M km²</span>
              </p>
              <p className="mt-3 text-sm">
                <span className={pct < 0 ? 'text-polar-ocean' : 'text-warning'}>
                  {pct > 0 ? '+' : ''}
                  {pct.toFixed(1)}%
                </span>{' '}
                <span className="text-polar-navy/60">across the last ~9 years</span>
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <SourceBadge source="NSIDC Sea Ice Index v4" />
                <DataFreshness lastUpdated={series!.lastUpdated} className="text-polar-ocean" />
              </div>
              <div className="mt-8 flex gap-3">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-polar-navy/30 text-polar-navy hover:bg-polar-navy/10 hover:text-polar-navy"
                >
                  <a href={`/api/data/series/${series!.id}?format=csv`}>CSV</a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-polar-navy/30 text-polar-navy hover:bg-polar-navy/10 hover:text-polar-navy"
                >
                  <a href={`/api/data/series/${series!.id}?format=json-file`}>JSON</a>
                </Button>
              </div>
            </div>
            <div className="flex flex-col justify-end text-polar-ocean">
              <div className="h-56 w-full">
                <Sparkline
                  points={values}
                  strokeClassName="stroke-polar-ocean text-polar-ocean"
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1">
                {['Sea Ice', 'Climate', 'Ocean', 'Cryosphere'].map((t) => (
                  <Link
                    key={t}
                    href="/data"
                    className="metadata text-polar-navy/60 transition-colors hover:text-polar-navy"
                  >
                    {t}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export function DataTeaserSkeleton() {
  return (
    <section className="border-y border-polar-navy/10 bg-polar-glacier">
      <div className="editorial py-24 sm:py-36">
        <div className="skeleton h-4 w-40 rounded" />
        <div className="skeleton mt-6 h-14 w-2/3 max-w-xl rounded" />
        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <div className="skeleton h-40 rounded-card" />
          <div className="skeleton h-56 rounded-card" />
        </div>
      </div>
    </section>
  );
}

export { formatNumber };
