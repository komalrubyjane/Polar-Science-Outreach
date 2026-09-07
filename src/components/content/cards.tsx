import Link from 'next/link';
import { CalendarDays, MapPin, FileText, Image as ImageIcon, Database, Compass, GraduationCap, Newspaper } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export function ResearchCard({ data }: { data: ResearchCardData }) {
  const authorNames = (data.authors ?? []).map((a) => a.researcher.fullName);
  return (
    <Card className="flex h-full flex-col hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary">{REPOSITORY_TYPE_LABELS[data.type] ?? data.type}</Badge>
          <Badge variant="accent">{POLE_LABELS[data.pole]}</Badge>
          {data.isDemo ? <Badge variant="demo">Demo</Badge> : null}
        </div>
        <CardTitle>
          <Link href={`/repository/${data.slug}`} className="hover:text-accent hover:underline">
            {data.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col pt-0">
        <p className="text-sm text-muted-foreground">{truncate(data.abstract, 180)}</p>
        <dl className="mt-4 space-y-1 text-xs text-muted-foreground">
          {authorNames.length ? (
            <div className="flex gap-1">
              <dt className="font-medium text-foreground">Authors:</dt>
              <dd>{authorNames.slice(0, 3).join(', ')}{authorNames.length > 3 ? ' et al.' : ''}</dd>
            </div>
          ) : null}
          {data.institution ? (
            <div className="flex gap-1">
              <dt className="font-medium text-foreground">Institution:</dt>
              <dd>{data.institution.name}</dd>
            </div>
          ) : null}
          <div className="flex gap-3">
            <span>{DISCIPLINE_LABELS[data.discipline] ?? data.discipline}</span>
            <span>{formatDate(data.publicationDate)}</span>
          </div>
        </dl>
        {data.keywords?.length ? (
          <div className="mt-3 flex flex-wrap gap-1">
            {data.keywords.slice(0, 4).map((k) => (
              <span key={k} className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                {k}
              </span>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

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
    <Card className="flex h-full flex-col hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <Database className="h-4 w-4 text-accent" />
          <Badge variant="accent">{POLE_LABELS[data.pole]}</Badge>
          {data.isDemo ? <Badge variant="demo">Demo dataset</Badge> : null}
        </div>
        <CardTitle>
          <Link href={`/data/${data.slug}`} className="hover:text-accent hover:underline">
            {data.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col pt-0">
        <p className="text-sm text-muted-foreground">{truncate(data.description, 160)}</p>
        <dl className="mt-4 space-y-1 text-xs text-muted-foreground">
          <div className="flex gap-1">
            <dt className="font-medium text-foreground">Source:</dt>
            <dd>{data.source}</dd>
          </div>
          {data.unit ? (
            <div className="flex gap-1">
              <dt className="font-medium text-foreground">Unit:</dt>
              <dd>{data.unit}</dd>
            </div>
          ) : null}
          <div>{DISCIPLINE_LABELS[data.discipline] ?? data.discipline}</div>
        </dl>
      </CardContent>
    </Card>
  );
}

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
  return (
    <Link
      href={`/media/${data.slug}`}
      className="group block overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {data.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.thumbnailUrl}
            alt={data.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageIcon className="h-8 w-8" />
          </div>
        )}
        <span className="absolute left-2 top-2 rounded bg-navy/80 px-1.5 py-0.5 text-[11px] font-medium text-white">
          {MEDIA_TYPE_LABELS[data.type] ?? data.type}
        </span>
        {data.isDemo ? (
          <span className="absolute right-2 top-2 rounded border border-dashed border-amber-300 bg-amber-500/80 px-1.5 py-0.5 text-[11px] font-medium text-white">
            Demo
          </span>
        ) : null}
      </div>
      <div className="p-4">
        <h3 className="font-display text-sm font-semibold leading-tight group-hover:text-accent">
          {data.title}
        </h3>
        {data.creator ? (
          <p className="mt-1 text-xs text-muted-foreground">© {data.creator} · {data.license}</p>
        ) : (
          <p className="mt-1 text-xs text-muted-foreground">{data.license}</p>
        )}
      </div>
    </Link>
  );
}

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
    <Card className="flex h-full flex-col hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary">{EVENT_TYPE_LABELS[data.type] ?? data.type}</Badge>
          <Badge variant="outline">{data.mode.replace('_', '-').toLowerCase()}</Badge>
          {data.registrationStatus === 'OPEN' ? (
            <Badge variant="success">Registration open</Badge>
          ) : data.registrationStatus === 'WAITLIST' ? (
            <Badge variant="warning">Waitlist</Badge>
          ) : data.registrationStatus === 'CLOSED' ? (
            <Badge variant="danger">Closed</Badge>
          ) : null}
        </div>
        <CardTitle>
          <Link href={`/events/${data.slug}`} className="hover:text-accent hover:underline">
            {data.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 text-sm text-muted-foreground">
        <p className="flex items-center gap-1.5">
          <CalendarDays className="h-4 w-4" /> {formatDate(data.startAt, { dateStyle: 'full' })}
        </p>
        {data.locationName ? (
          <p className="mt-1 flex items-center gap-1.5">
            <MapPin className="h-4 w-4" /> {data.locationName}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

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
    <Card className="flex h-full flex-col hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="mb-2 flex items-center gap-1.5">
          <Compass className="h-4 w-4 text-accent" />
          {data.region ? <Badge variant="accent">{data.region.name}</Badge> : null}
          {data.isDemo ? <Badge variant="demo">Demo</Badge> : null}
        </div>
        <CardTitle>
          <Link href={`/expeditions/${data.slug}`} className="hover:text-accent hover:underline">
            {data.name}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pt-0 text-sm text-muted-foreground">
        {data.summary ? <p>{truncate(data.summary, 150)}</p> : null}
        <p className="mt-3 text-xs">
          {data.vessel ? `${data.vessel} · ` : ''}
          {formatDate(data.startDate)} – {formatDate(data.endDate)}
        </p>
      </CardContent>
    </Card>
  );
}

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
    <Card className="flex h-full flex-col overflow-hidden hover:shadow-md">
      {data.heroImageUrl ? (
        <div className="aspect-[16/9] w-full overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data.heroImageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
        </div>
      ) : null}
      <CardHeader className="pb-3">
        <div className="mb-2 flex items-center gap-1.5">
          <Newspaper className="h-4 w-4 text-accent" />
          <Badge variant="secondary">{NEWS_CATEGORY_LABELS[data.category] ?? data.category}</Badge>
        </div>
        <CardTitle>
          <Link href={`/news/${data.slug}`} className="hover:text-accent hover:underline">
            {data.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pt-0 text-sm text-muted-foreground">
        {data.subtitle ? <p>{truncate(data.subtitle, 140)}</p> : null}
        <p className="mt-3 text-xs">
          {data.author?.name ? `${data.author.name} · ` : ''}
          {formatDate(data.publishedAt)}
        </p>
      </CardContent>
    </Card>
  );
}

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
    <Card className="flex h-full flex-col hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="mb-2 flex items-center gap-1.5">
          <GraduationCap className="h-4 w-4 text-accent" />
          <Badge variant="secondary">{EDUCATION_TYPE_LABELS[data.type] ?? data.type}</Badge>
        </div>
        <CardTitle>
          <Link href={`/education/${data.slug}`} className="hover:text-accent hover:underline">
            {data.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pt-0 text-sm text-muted-foreground">
        <p>{truncate(data.summary, 150)}</p>
        <p className="mt-3 text-xs">
          {data.ageGroup ? `${data.ageGroup}` : 'All ages'}
          {data.durationMin ? ` · ${data.durationMin} min` : ''}
        </p>
      </CardContent>
    </Card>
  );
}

export interface TopicCardData {
  slug: string;
  name: string;
  category: string;
  overview?: string | null;
}

export function TopicCard({ data }: { data: TopicCardData }) {
  return (
    <Link
      href={`/explore/${data.slug}`}
      className="group flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
    >
      <FileText className="mb-3 h-5 w-5 text-accent" />
      <h3 className="font-display font-semibold group-hover:text-accent">{data.name}</h3>
      {data.overview ? (
        <p className="mt-2 text-sm text-muted-foreground">{truncate(data.overview, 120)}</p>
      ) : null}
      <span className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {data.category}
      </span>
    </Link>
  );
}
