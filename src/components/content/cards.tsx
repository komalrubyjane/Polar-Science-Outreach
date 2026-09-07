import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MetaRow } from '@/components/editorial/primitives';
import { SmartImage } from '@/components/editorial/smart-image';
import { getEditorialImage, pickSlot, imageFallback } from '@/lib/images/provider';
import type { CatalogSlot } from '@/lib/images/catalog';
import { formatDate, truncate } from '@/lib/utils';
import {
  DISCIPLINE_LABELS,
  POLE_LABELS,
  MEDIA_TYPE_LABELS,
  EVENT_TYPE_LABELS,
  NEWS_CATEGORY_LABELS,
  EDUCATION_TYPE_LABELS,
  REPOSITORY_TYPE_LABELS,
} from '@/lib/constants';

/* ------------------------------------------------------------------ shared */

function CardShell({
  href,
  slot,
  seed,
  imageSrc,
  alt,
  aspect = 'aspect-[4/3]',
  badges,
  children,
}: {
  href: string;
  slot?: CatalogSlot;
  seed: string;
  imageSrc?: string | null;
  alt: string;
  aspect?: string;
  badges?: React.ReactNode;
  children: React.ReactNode;
}) {
  const editorial = slot ? getEditorialImage(slot, 900) : null;
  const candidates = imageSrc
    ? [imageSrc, ...(editorial?.candidates ?? [])]
    : (editorial?.candidates ?? []);
  return (
    <Link
      href={href}
      className="card-ios group flex h-full flex-col overflow-hidden"
    >
      <div className={`relative ${aspect} w-full overflow-hidden`}>
        <SmartImage
          candidates={candidates}
          fallback={editorial?.fallback ?? imageFallback(seed)}
          alt={alt}
          sizes="(max-width:768px) 100vw, 33vw"
          className="h-full w-full"
          imgClassName="transition-transform [transition-duration:900ms] ease-editorial group-hover:scale-[1.04]"
        />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/45 to-transparent" aria-hidden />
        {badges ? <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">{badges}</div> : null}
        <ArrowUpRight className="absolute right-3 top-3 h-4 w-4 -translate-y-1 text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100" />
      </div>
      <div className="flex flex-1 flex-col p-5">{children}</div>
    </Link>
  );
}

/* ------------------------------------------------------------------ research */

export interface ResearchCardData {
  slug: string;
  title: string;
  abstract: string;
  type: string;
  discipline: string;
  pole: string;
  publicationDate: Date | string | null;
  isDemo?: boolean;
  institution?: { name: string } | null;
  authors?: { researcher: { fullName: string } }[];
  keywords?: string[];
  viewCount?: number;
}

const RESEARCH_SLOTS: CatalogSlot[] = ['research', 'data', 'expeditions', 'region-arctic', 'region-antarctic'];

export function ResearchCard({ data }: { data: ResearchCardData }) {
  const authorNames = (data.authors ?? []).map((a) => a.researcher.fullName);
  return (
    <CardShell
      href={`/repository/${data.slug}`}
      slot={pickSlot(data.slug, RESEARCH_SLOTS)}
      seed={data.slug}
      alt=""
      badges={
        <>
          <Badge variant="accent">{POLE_LABELS[data.pole]}</Badge>
          {data.isDemo ? <Badge variant="demo">Demo</Badge> : null}
        </>
      }
    >
      <MetaRow
        items={[
          REPOSITORY_TYPE_LABELS[data.type] ?? data.type,
          DISCIPLINE_LABELS[data.discipline],
          formatDate(data.publicationDate, { year: 'numeric' }),
        ]}
      />
      <h3 className="mt-3 font-display text-lg font-medium leading-snug tracking-tight transition-colors group-hover:text-accent">
        {data.title}
      </h3>
      <p className="mt-2 flex-1 text-sm text-muted-foreground">{truncate(data.abstract, 150)}</p>
      <p className="mt-4 metadata">
        {authorNames.length
          ? `${authorNames.slice(0, 2).join(', ')}${authorNames.length > 2 ? ' et al.' : ''}`
          : data.institution?.name ?? '—'}
      </p>
    </CardShell>
  );
}

/* ------------------------------------------------------------------ dataset */

export interface DatasetCardData {
  slug: string;
  title: string;
  description: string;
  discipline: string;
  pole: string;
  source: string;
  unit?: string | null;
  isDemo?: boolean;
  lastUpdatedAt?: Date | string | null;
}

export function DatasetCard({ data }: { data: DatasetCardData }) {
  return (
    <CardShell
      href={`/data/${data.slug}`}
      slot="data"
      seed={data.slug}
      alt=""
      badges={
        <>
          <Badge variant="accent">{POLE_LABELS[data.pole]}</Badge>
          {data.isDemo ? <Badge variant="demo">Demo dataset</Badge> : null}
        </>
      }
    >
      <MetaRow items={[DISCIPLINE_LABELS[data.discipline], data.unit ?? undefined]} />
      <h3 className="mt-3 font-display text-lg font-medium leading-snug tracking-tight transition-colors group-hover:text-accent">
        {data.title}
      </h3>
      <p className="mt-2 flex-1 text-sm text-muted-foreground">{truncate(data.description, 140)}</p>
      <p className="mt-4 metadata">Source — {data.source}</p>
    </CardShell>
  );
}

/* ------------------------------------------------------------------ media */

export interface MediaCardData {
  slug: string;
  title: string;
  type: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  creator?: string | null;
  license: string;
  isDemo?: boolean;
}

export function MediaCard({ data }: { data: MediaCardData }) {
  const editorial = getEditorialImage('media', 900);
  const candidates = data.thumbnailUrl
    ? [data.thumbnailUrl, ...editorial.candidates]
    : editorial.candidates;
  return (
    <Link
      href={`/media/${data.slug}`}
      className="card-ios group relative block overflow-hidden"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <SmartImage
          candidates={candidates}
          fallback={editorial.fallback}
          alt={data.title}
          sizes="(max-width:768px) 50vw, 25vw"
          className="h-full w-full"
          imgClassName="transition-transform [transition-duration:900ms] ease-editorial group-hover:scale-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20 opacity-70 transition-opacity duration-300 group-hover:opacity-90" />
        <span className="absolute left-3 top-3 metadata text-white/80">
          {MEDIA_TYPE_LABELS[data.type] ?? data.type}
        </span>
        {data.isDemo ? (
          <span className="absolute right-3 top-3">
            <Badge variant="demo">Demo</Badge>
          </span>
        ) : null}
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3 className="font-display text-sm font-medium leading-snug text-white">{data.title}</h3>
          <p className="mt-1 text-[0.68rem] uppercase tracking-[0.12em] text-white/60">
            {data.creator ? `${data.creator} — ` : ''}
            {data.license}
          </p>
        </div>
      </div>
    </Link>
  );
}

/* ------------------------------------------------------------------ event */

export interface EventCardData {
  slug: string;
  title: string;
  type: string;
  mode: string;
  startAt: Date | string;
  locationName?: string | null;
  registrationStatus: string;
  isDemo?: boolean;
}

export function EventCard({ data }: { data: EventCardData }) {
  return (
    <CardShell
      href={`/events/${data.slug}`}
      slot="events"
      seed={data.slug}
      alt=""
      badges={
        data.registrationStatus === 'OPEN' ? (
          <Badge variant="success">Registration open</Badge>
        ) : data.registrationStatus === 'WAITLIST' ? (
          <Badge variant="warning">Waitlist</Badge>
        ) : data.registrationStatus === 'CLOSED' ? (
          <Badge variant="danger">Closed</Badge>
        ) : null
      }
    >
      <MetaRow
        items={[
          EVENT_TYPE_LABELS[data.type] ?? data.type,
          data.mode.replace('_', '-').toLowerCase(),
        ]}
      />
      <h3 className="mt-3 font-display text-lg font-medium leading-snug tracking-tight transition-colors group-hover:text-accent">
        {data.title}
      </h3>
      <p className="mt-3 flex-1 text-sm text-muted-foreground">
        {formatDate(data.startAt, { dateStyle: 'full' })}
        {data.locationName ? ` · ${data.locationName}` : ''}
      </p>
    </CardShell>
  );
}

/* ------------------------------------------------------------------ expedition */

export interface ExpeditionCardData {
  slug: string;
  name: string;
  summary?: string | null;
  vessel?: string | null;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  region?: { name: string } | null;
  isDemo?: boolean;
}

export function ExpeditionCard({ data }: { data: ExpeditionCardData }) {
  return (
    <CardShell
      href={`/expeditions/${data.slug}`}
      slot="expeditions"
      seed={data.slug}
      alt=""
      aspect="aspect-[3/2]"
      badges={
        <>
          {data.region ? <Badge variant="accent">{data.region.name}</Badge> : null}
          {data.isDemo ? <Badge variant="demo">Demo</Badge> : null}
        </>
      }
    >
      <MetaRow
        items={[
          data.vessel ?? undefined,
          `${formatDate(data.startDate, { year: 'numeric', month: 'short' })} – ${formatDate(data.endDate, { year: 'numeric', month: 'short' })}`,
        ]}
      />
      <h3 className="mt-3 font-display text-lg font-medium leading-snug tracking-tight transition-colors group-hover:text-accent">
        {data.name}
      </h3>
      {data.summary ? (
        <p className="mt-2 flex-1 text-sm text-muted-foreground">{truncate(data.summary, 130)}</p>
      ) : null}
    </CardShell>
  );
}

/* ------------------------------------------------------------------ article */

export interface ArticleCardData {
  slug: string;
  title: string;
  subtitle?: string | null;
  category: string;
  heroImageUrl?: string | null;
  publishedAt: Date | string | null;
  author?: { name: string | null } | null;
}

export function ArticleCard({ data }: { data: ArticleCardData }) {
  return (
    <CardShell
      href={`/news/${data.slug}`}
      slot="news"
      seed={data.slug}
      imageSrc={data.heroImageUrl}
      alt=""
      aspect="aspect-[16/10]"
      badges={<Badge variant="outline">{NEWS_CATEGORY_LABELS[data.category] ?? data.category}</Badge>}
    >
      <MetaRow
        items={[
          data.author?.name ?? undefined,
          formatDate(data.publishedAt, { dateStyle: 'medium' }),
        ]}
      />
      <h3 className="mt-3 font-display text-lg font-medium leading-snug tracking-tight transition-colors group-hover:text-accent">
        {data.title}
      </h3>
      {data.subtitle ? (
        <p className="mt-2 flex-1 text-sm text-muted-foreground">{truncate(data.subtitle, 130)}</p>
      ) : null}
    </CardShell>
  );
}

/* ------------------------------------------------------------------ education */

export interface EducationCardData {
  slug: string;
  title: string;
  summary: string;
  type: string;
  ageGroup?: string | null;
  durationMin?: number | null;
}

export function EducationCard({ data }: { data: EducationCardData }) {
  return (
    <CardShell
      href={`/education/${data.slug}`}
      slot="education"
      seed={data.slug}
      alt=""
      aspect="aspect-[3/2]"
      badges={<Badge variant="outline">{EDUCATION_TYPE_LABELS[data.type] ?? data.type}</Badge>}
    >
      <MetaRow
        items={[
          data.ageGroup ?? 'All ages',
          data.durationMin ? `${data.durationMin} min` : undefined,
        ]}
      />
      <h3 className="mt-3 font-display text-lg font-medium leading-snug tracking-tight transition-colors group-hover:text-accent">
        {data.title}
      </h3>
      <p className="mt-2 flex-1 text-sm text-muted-foreground">{truncate(data.summary, 130)}</p>
    </CardShell>
  );
}

/* ------------------------------------------------------------------ topic */

export interface TopicCardData {
  slug: string;
  name: string;
  category: string;
  overview?: string | null;
}

const TOPIC_SLOTS: CatalogSlot[] = ['region-arctic', 'region-antarctic', 'data', 'media', 'aurora', 'glossary'];

export function TopicCard({ data }: { data: TopicCardData }) {
  return (
    <Link
      href={`/explore/${data.slug}`}
      className="card-ios group flex flex-col justify-between overflow-hidden p-6"
    >
      <div
        className="mb-6 h-24 w-full opacity-80 transition-opacity group-hover:opacity-100"
        style={{
          backgroundImage: getEditorialImage(pickSlot(data.slug, TOPIC_SLOTS)).fallback,
        }}
        aria-hidden
      />
      <div>
        <p className="metadata">{data.category}</p>
        <h3 className="mt-2 font-display text-xl font-medium tracking-tight transition-colors group-hover:text-accent">
          {data.name}
        </h3>
        {data.overview ? (
          <p className="mt-3 text-sm text-muted-foreground">{truncate(data.overview, 110)}</p>
        ) : null}
      </div>
    </Link>
  );
}
