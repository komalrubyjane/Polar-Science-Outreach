import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/misc';
import {
  Eyebrow,
  Hairline,
  SectionHeading,
  EditorialLink,
  MetaRow,
} from '@/components/editorial/primitives';
import { CinematicHero } from '@/components/editorial/cinematic-hero';
import { ScrollCue } from '@/components/editorial/scroll-cue';
import { Reveal, Stagger, AnimatedNumber } from '@/components/motion';
import { FloatingStat } from '@/components/glass';
import { SmartImage } from '@/components/editorial/smart-image';
import { Sparkline } from '@/components/editorial/sparkline';
import {
  MediaCard,
  EducationCard,
  ArticleCard,
} from '@/components/content/cards';
import { NewsletterForm } from '@/components/newsletter-form';
import {
  getFeaturedResearch,
  getLatestDiscoveries,
  getFeaturedMedia,
  getLatestNews,
  getEducationHighlights,
  getActiveExpeditions,
} from '@/lib/queries';
import { DEMO_SERIES } from '@/lib/data-providers/demo';
import { DEMO_COUNTS } from '@/lib/demo-data';
import { getEditorialImage } from '@/lib/images/provider';
import { formatDate } from '@/lib/utils';
import { DISCIPLINE_LABELS, POLE_LABELS, REPOSITORY_TYPE_LABELS } from '@/lib/constants';

export const metadata: Metadata = {
  description:
    'Explore the science, people, places and changing environments of the Arctic and Antarctic.',
};

export const revalidate = 300;

function seriesStat(id: keyof typeof DEMO_SERIES) {
  const s = DEMO_SERIES[id]();
  const values = s.points.map((p) => p.value);
  const first = values[0]!;
  const last = values[values.length - 1]!;
  const pct = first !== 0 ? ((last - first) / Math.abs(first)) * 100 : 0;
  return { series: s, values, last, pct };
}

export default async function HomePage() {
  const [featured, discoveries, media, news, education, expeditions] = await Promise.all([
    getFeaturedResearch(1),
    getLatestDiscoveries(3),
    getFeaturedMedia(5),
    getLatestNews(4),
    getEducationHighlights(3),
    getActiveExpeditions(1),
  ]);

  const hero = getEditorialImage('hero-primary', 2400);
  const arctic = getEditorialImage('region-arctic', 1600);
  const antarctic = getEditorialImage('region-antarctic', 1600);

  const seaIce = seriesStat('arctic-sea-ice-extent');
  const lead = featured[0];
  const expedition = expeditions[0];

  return (
    <>
      {/* ─────────────────────────── HERO ─────────────────────────── */}
      <CinematicHero
        candidates={hero.candidates}
        fallback={hero.fallback}
        alt={hero.alt}
        panels={
          <>
            <FloatingStat label="Region" value="78° N" sub="Arctic Ocean" />
            <FloatingStat
              label="Sea ice extent"
              value={<AnimatedNumber value={seaIce.last} decimals={1} suffix=" M km²" />}
              sub="Demonstration dataset"
              className="[animation-delay:1.2s]"
            />
            <FloatingStat
              label="Research stations"
              value={<AnimatedNumber value={8} />}
              sub="Catalogued"
              className="[animation-delay:2.4s]"
            />
          </>
        }
      >
        <div className="max-w-5xl">
          <Stagger>
            <Eyebrow className="text-white/70">Polar Science Portal</Eyebrow>
            <h1 className="display-hero mt-6 text-white">
              Earth&apos;s
              <br />
              frozen
              <br />
              <span className="text-white/70">frontier</span>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-white/80 sm:text-xl">
              Explore the science, people, places and changing environments of the Arctic and
              Antarctic.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Button
                asChild
                size="lg"
                className="hover-arrow bg-polar-snow text-polar-deep-ocean hover:bg-white"
              >
                <Link href="/explore">
                  Explore the Polar World <ArrowRight />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/45 text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/data">View Data</Link>
              </Button>
            </div>
          </Stagger>
        </div>

        <div className="mt-16 flex items-end justify-between gap-6">
          <ScrollCue />
          <div className="text-right text-white/70">
            <p className="font-display text-2xl font-medium text-white">78° N</p>
            <p className="metadata text-white/60">Arctic Ocean</p>
          </div>
        </div>
      </CinematicHero>

      {/* ─────────────────────── 01 INTRODUCTION ─────────────────────── */}
      <section className="editorial py-24 sm:py-36">
        <Reveal>
          <Hairline />
          <div className="mt-8 grid gap-10 md:grid-cols-12">
            <div className="md:col-span-7">
              <Eyebrow accent>
                <span className="tabular-nums">01</span>
                <span className="opacity-40">/</span> The Polar World
              </Eyebrow>
              <p className="display-1 mt-6 text-balance">
                Two frozen regions.
                <br />
                <span className="text-muted-foreground">One rapidly changing planet.</span>
              </p>
            </div>
            <div className="md:col-span-5 md:pt-4">
              <p className="text-lg leading-relaxed text-muted-foreground">
                The Arctic — an ocean ringed by land — and the Antarctic — a continent ringed by
                ocean — together regulate global climate, sea level and ocean circulation. Both
                are warming faster than the planet as a whole.
              </p>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                This portal gathers research, data, imagery and field journals from across the
                polar science community and makes them discoverable, citable and understandable.
              </p>
              <div className="mt-8">
                <EditorialLink href="/about">About the portal</EditorialLink>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-border bg-border sm:grid-cols-4">
          {[
            ['Research records', DEMO_COUNTS.research, '+'],
            ['Researchers', DEMO_COUNTS.researchers, '+'],
            ['Datasets', DEMO_COUNTS.datasets, '+'],
            ['Institutions', DEMO_COUNTS.institutions, ''],
          ].map(([label, n, suffix]) => (
            <div key={label as string} className="bg-surface p-6">
              <p className="font-display text-3xl font-medium sm:text-4xl">
                <AnimatedNumber value={n as number} suffix={suffix as string} />
              </p>
              <p className="metadata mt-2">{label as string}</p>
            </div>
          ))}
        </Reveal>
      </section>

      {/* ─────────────────────── POLAR REGIONS ─────────────────────── */}
      <section className="border-y border-border">
        <div className="grid md:grid-cols-2">
          <RegionPanel
            name="Arctic"
            coord="66° 33′ N"
            blurb="A sea-ice-covered ocean surrounded by North America, Europe and Asia. Home to four million people, including many Indigenous nations."
            href="/explore?pole=ARCTIC"
            image={arctic}
          />
          <RegionPanel
            name="Antarctic"
            coord="66° 33′ S"
            blurb="A continent larger than Europe, buried under ice up to 4.8 km thick, governed by the Antarctic Treaty and dedicated to peace and science."
            href="/explore?pole=ANTARCTIC"
            image={antarctic}
            className="border-t border-border md:border-l md:border-t-0"
          />
        </div>
      </section>

      {/* ─────────────────────── 02 FEATURED RESEARCH ─────────────────────── */}
      <section className="editorial py-24 sm:py-36">
        <SectionHeading
          index="02"
          kicker="Latest Research"
          title="From the knowledge repository"
          action={<EditorialLink href="/repository">All research</EditorialLink>}
        />

        {lead ? (
          <Reveal>
            <Link
              href={`/repository/${lead.slug}`}
              className="group grid gap-8 lg:grid-cols-2 lg:gap-14"
            >
              <div className="relative aspect-[16/11] w-full overflow-hidden border border-border">
                <SmartImage
                  candidates={getEditorialImage('research', 1400).candidates}
                  fallback={getEditorialImage('research', 1400).fallback}
                  alt=""
                  sizes="(max-width:1024px) 100vw, 50vw"
                  className="h-full w-full"
                  imgClassName="transition-transform [transition-duration:1100ms] ease-editorial group-hover:scale-[1.04]"
                />
              </div>
              <div className="flex flex-col justify-center">
                <MetaRow
                  items={[
                    REPOSITORY_TYPE_LABELS[lead.type] ?? lead.type,
                    DISCIPLINE_LABELS[lead.discipline],
                    POLE_LABELS[lead.pole],
                    formatDate(lead.publicationDate, { year: 'numeric' }),
                  ]}
                />
                <h3 className="display-3 mt-5 text-balance transition-colors group-hover:text-accent">
                  {lead.title}
                </h3>
                <p className="mt-4 max-w-xl text-muted-foreground">{lead.abstract.slice(0, 260)}…</p>
                <p className="mt-6 metadata">
                  {lead.authors?.map((a) => a.researcher.fullName).slice(0, 3).join(', ') ||
                    lead.institution?.name}
                </p>
                <span className="hover-arrow mt-8 inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.14em] text-accent">
                  Read research <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </Reveal>
        ) : (
          <EmptyState
            title="No research yet"
            description="Seed the database (npm run db:seed) to populate the repository."
          />
        )}

        {discoveries.length ? (
          <div className="mt-20 grid gap-px border border-border bg-border sm:grid-cols-3">
            {discoveries.map((r) => (
              <Link
                key={r.id}
                href={`/repository/${r.slug}`}
                className="group flex flex-col bg-surface p-6 transition-colors hover:bg-surface-muted/50"
              >
                <MetaRow items={[DISCIPLINE_LABELS[r.discipline], POLE_LABELS[r.pole]]} />
                <h4 className="mt-3 flex-1 font-display text-base font-medium leading-snug tracking-tight transition-colors group-hover:text-accent">
                  {r.title}
                </h4>
                <p className="mt-4 metadata">{formatDate(r.publicationDate, { dateStyle: 'medium' })}</p>
              </Link>
            ))}
          </div>
        ) : null}
      </section>

      {/* ─────────────────────── 03 DATA ─────────────────────── */}
      <section className="bg-polar-navy text-polar-text-light [&_.hairline]:bg-white/15 [&_.eyebrow]:text-polar-glacier">
        <div className="editorial py-24 sm:py-36">
          <SectionHeading
            index="03"
            kicker="Polar Data"
            title={<span className="text-white">The ice is moving.</span>}
            lead={
              <span className="text-polar-text-muted">
                Interactive time-series for the polar environment. Every series carries its
                source, unit and methodology.
              </span>
            }
            action={
              <EditorialLink href="/data" className="text-polar-glacier hover:text-white">
                Full data
              </EditorialLink>
            }
          />

          <Reveal className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <p className="metadata text-polar-text-muted">
                Arctic sea ice extent — latest demo value
              </p>
              <p className="mt-4 font-display text-6xl font-medium tracking-tight text-white sm:text-7xl">
                {seaIce.last}
                <span className="ml-2 align-top text-2xl text-polar-text-muted">M km²</span>
              </p>
              <p className="mt-3 text-sm">
                <span className={seaIce.pct < 0 ? 'text-polar-glacier' : 'text-warning'}>
                  {seaIce.pct > 0 ? '+' : ''}
                  {seaIce.pct.toFixed(1)}%
                </span>{' '}
                <span className="text-polar-text-muted">across the demo record</span>
              </p>
              <div className="mt-8 inline-flex border border-dashed border-white/25 bg-white/5 px-3 py-2 text-xs font-medium text-polar-glacier">
                Demo dataset — illustrative values, not a live measurement.
              </div>
              <div className="mt-8 flex gap-3">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-white/30 text-white hover:bg-white/10 hover:text-white"
                >
                  <a href={`/api/data/series/${seaIce.series.id}?format=csv`}>CSV</a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-white/30 text-white hover:bg-white/10 hover:text-white"
                >
                  <a href={`/api/data/series/${seaIce.series.id}?format=json-file`}>JSON</a>
                </Button>
              </div>
            </div>
            <div className="flex flex-col justify-end text-polar-glacier">
              <div className="h-56 w-full">
                <Sparkline points={seaIce.values} strokeClassName="stroke-polar-glacier text-polar-glacier" />
              </div>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1">
                {['Sea Ice', 'Climate', 'Ocean', 'Cryosphere'].map((t) => (
                  <Link
                    key={t}
                    href="/data"
                    className="metadata text-polar-text-muted transition-colors hover:text-white"
                  >
                    {t}
                  </Link>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─────────────────────── 04 MEDIA ─────────────────────── */}
      <section className="editorial py-24 sm:py-36">
        <SectionHeading
          index="04"
          kicker="Polar Media"
          title="A visual archive"
          action={<EditorialLink href="/media">Media library</EditorialLink>}
        />
        {media.length ? (
          <div className="grid gap-4 md:grid-cols-3 md:grid-rows-2">
            <div className="md:col-span-2 md:row-span-2">
              <MediaCard data={media[0]!} />
            </div>
            {media.slice(1, 5).map((m) => (
              <MediaCard key={m.id} data={m} />
            ))}
          </div>
        ) : (
          <EmptyState title="The media library is empty" />
        )}
      </section>

      {/* ─────────────────────── 05 EDUCATION ─────────────────────── */}
      <section className="border-y border-border bg-surface">
        <div className="editorial py-24 sm:py-36">
          <SectionHeading
            index="05"
            kicker="Education & Outreach"
            title="Understand the poles"
            lead="Plain-language explainers, classroom lesson plans, interactive models and quizzes — no account required."
            action={<EditorialLink href="/education">Explore learning</EditorialLink>}
          />
          <div className="mb-10 flex flex-wrap gap-x-6 gap-y-2">
            {[
              ['Explainers', '/education?type=EXPLAINER'],
              ['Lesson plans', '/education?type=LESSON_PLAN'],
              ['Activities', '/education/activities'],
              ['Quizzes', '/education/quizzes'],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="metadata text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </Link>
            ))}
          </div>
          {education.length ? (
            <div className="grid gap-6 md:grid-cols-3">
              {education.map((e) => (
                <EducationCard key={e.id} data={e} />
              ))}
            </div>
          ) : (
            <EmptyState title="No education resources yet" />
          )}
        </div>
      </section>

      {/* ─────────────────────── 06 EXPEDITIONS ─────────────────────── */}
      {expedition ? (
        <section className="editorial py-24 sm:py-36">
          <SectionHeading
            index="06"
            kicker="In The Field"
            title="Expedition journals"
            action={<EditorialLink href="/expeditions">All expeditions</EditorialLink>}
          />
          <Reveal>
            <Link
              href={`/expeditions/${expedition.slug}`}
              className="group relative block aspect-[21/9] w-full overflow-hidden border border-border"
            >
              <SmartImage
                candidates={getEditorialImage('expeditions', 2000).candidates}
                fallback={getEditorialImage('expeditions', 2000).fallback}
                alt=""
                sizes="100vw"
                className="h-full w-full"
                imgClassName="transition-transform [transition-duration:1200ms] ease-editorial group-hover:scale-[1.03]"
              />
              <div className="cinematic-overlay absolute inset-0" />
              <div className="absolute inset-0 flex flex-col justify-end p-8 text-white sm:p-14">
                <MetaRow
                  items={[
                    expedition.region?.name ?? 'Polar region',
                    formatDate(expedition.startDate, { year: 'numeric' }),
                    expedition.vessel ?? undefined,
                  ]}
                  className="text-white/70"
                />
                <h3 className="display-2 mt-4 max-w-3xl text-white">{expedition.name}</h3>
                {expedition.summary ? (
                  <p className="mt-4 max-w-xl text-white/80">{expedition.summary}</p>
                ) : null}
                <span className="hover-arrow mt-8 inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.14em]">
                  Follow the journal <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </Reveal>
        </section>
      ) : null}

      {/* ─────────────────────── 07 NEWS ─────────────────────── */}
      <section className="border-t border-border bg-surface">
        <div className="editorial py-24 sm:py-36">
          <SectionHeading
            index="07"
            kicker="News"
            title="From the community"
            action={<EditorialLink href="/news">Newsroom</EditorialLink>}
          />
          {news.length ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {news.map((n) => (
                <ArticleCard key={n.id} data={n} />
              ))}
            </div>
          ) : (
            <EmptyState title="No news articles yet" />
          )}
        </div>
      </section>

      {/* ─────────────────────── NEWSLETTER ─────────────────────── */}
      <section className="editorial py-24 sm:py-32">
        <div className="grid gap-10 bg-polar-navy p-8 text-polar-text-light sm:p-14 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div>
            <Eyebrow className="text-polar-glacier">
              <span className="h-px w-6 bg-current" aria-hidden />
              The Newsletter
            </Eyebrow>
            <p className="display-3 mt-4 text-balance text-white">
              Polar science in your inbox, once a month.
            </p>
            <p className="mt-4 max-w-md text-polar-text-muted">
              New research, data releases, expeditions and events. Double opt-in; unsubscribe
              anytime.
            </p>
          </div>
          <div className="[&_input]:border-white/25 [&_input]:bg-white/5 [&_input]:text-white [&_input]:placeholder:text-white/40 [&_button]:bg-white [&_button]:text-polar-navy [&_button]:hover:bg-polar-glacier">
            <NewsletterForm source="homepage" />
          </div>
        </div>
      </section>
    </>
  );
}

function RegionPanel({
  name,
  coord,
  blurb,
  href,
  image,
  className,
}: {
  name: string;
  coord: string;
  blurb: string;
  href: string;
  image: { candidates: string[]; fallback: string; alt: string };
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group relative flex min-h-[70svh] flex-col justify-end overflow-hidden p-8 text-white sm:p-14 ${className ?? ''}`}
    >
      <div className="absolute inset-0 -z-10">
        <SmartImage
          candidates={image.candidates}
          fallback={image.fallback}
          alt=""
          sizes="(max-width:768px) 100vw, 50vw"
          className="h-full w-full"
          imgClassName="transition-transform [transition-duration:1400ms] ease-editorial group-hover:scale-[1.06]"
        />
      </div>
      <div className="cinematic-overlay absolute inset-0 -z-10 transition-opacity duration-500 group-hover:opacity-90" />
      <p className="metadata text-white/70">{coord}</p>
      <h3 className="display-1 mt-3 text-white">{name}</h3>
      <p className="mt-4 max-w-md translate-y-2 text-white/80 opacity-0 transition-all duration-500 ease-editorial group-hover:translate-y-0 group-hover:opacity-100">
        {blurb}
      </p>
      <span className="hover-arrow mt-8 inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.14em]">
        Explore the {name} <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
}
