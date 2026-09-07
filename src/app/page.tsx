import Link from 'next/link';
import type { Metadata } from 'next';
import { Suspense } from 'react';
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
import { Reveal, Stagger } from '@/components/motion';
import { SmartImage } from '@/components/editorial/smart-image';
import {
  MediaCard,
  EducationCard,
  ArticleCard,
} from '@/components/content/cards';
import { NewsletterForm } from '@/components/newsletter-form';
import {
  HeroPanels,
  HeroPanelsSkeleton,
  LiveSnapshot,
  LiveSnapshotSkeleton,
  DataTeaser,
  DataTeaserSkeleton,
} from '@/components/home/polar-data';
import {
  getFeaturedResearch,
  getLatestDiscoveries,
  getFeaturedMedia,
  getLatestNews,
  getEducationHighlights,
  getActiveExpeditions,
} from '@/lib/queries';
import { getEditorialImage } from '@/lib/images/provider';
import { formatDate } from '@/lib/utils';
import { DISCIPLINE_LABELS, POLE_LABELS, REPOSITORY_TYPE_LABELS } from '@/lib/constants';

export const metadata: Metadata = {
  description:
    'Explore the science, people, places and changing environments of the Arctic and Antarctic.',
};

export const revalidate = 300;

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
          <Suspense fallback={<HeroPanelsSkeleton />}>
            <HeroPanels />
          </Suspense>
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

      </section>

      {/* ─────────────────────── LIVE POLAR SNAPSHOT ─────────────────────── */}
      <section className="border-t border-border bg-surface">
        <div className="editorial py-24 sm:py-32">
          <SectionHeading
            index="02"
            kicker="Live Polar Snapshot"
            title="Where things stand today"
            lead="Sea-ice figures are the latest monthly mean from the NSIDC Sea Ice Index (refreshed every six hours). Counts are live from this deployment's database."
          />
          <Suspense fallback={<LiveSnapshotSkeleton />}>
            <LiveSnapshot />
          </Suspense>
        </div>
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

      {/* ─────────────────────── 03 FEATURED RESEARCH ─────────────────────── */}
      <section className="editorial py-24 sm:py-36">
        <SectionHeading
          index="03"
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

      {/* ─────────────────────── 04 POLAR DATA (real NSIDC) ─────────────────────── */}
      <Suspense fallback={<DataTeaserSkeleton />}>
        <DataTeaser />
      </Suspense>

      {/* ─────────────────────── 04 MEDIA ─────────────────────── */}
      <section className="editorial py-24 sm:py-36">
        <SectionHeading
          index="05"
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
            index="06"
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
            index="07"
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
            index="08"
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
