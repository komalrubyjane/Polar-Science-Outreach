import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { safe } from '@/lib/safe';
import { ContentTable, type ContentRow } from '@/components/admin/content-table';

export const metadata: Metadata = { title: 'Content management' };
export const dynamic = 'force-dynamic';

const TYPES = [
  { key: 'research', label: 'Research', api: '/api/research', base: '/repository' },
  { key: 'datasets', label: 'Datasets', api: '/api/datasets', base: '/data' },
  { key: 'media', label: 'Media', api: '/api/media', base: '/media' },
  { key: 'news', label: 'News', api: '/api/news', base: '/news' },
  { key: 'events', label: 'Events', api: '/api/events', base: '/events' },
  { key: 'expeditions', label: 'Expeditions', api: '/api/expeditions', base: '/expeditions' },
  { key: 'education', label: 'Education', api: '/api/education', base: '/education' },
  { key: 'topics', label: 'Topics', api: '/api/topics', base: '/explore' },
  { key: 'glossary', label: 'Glossary', api: '/api/glossary', base: '/glossary' },
  { key: 'researchers', label: 'Researchers', api: '/api/researchers', base: '/researchers' },
  { key: 'institutions', label: 'Institutions', api: '/api/institutions', base: '/institutions' },
] as const;

async function loadRows(type: string): Promise<ContentRow[]> {
  const common = { orderBy: { createdAt: 'desc' as const }, take: 100 };
  switch (type) {
    case 'datasets':
      return safe(
        () =>
          prisma.dataset.findMany({
            ...common,
            select: { id: true, title: true, slug: true, status: true, createdAt: true, isDemo: true },
          }),
        [],
        'content.datasets',
      );
    case 'media':
      return safe(
        () =>
          prisma.media.findMany({
            ...common,
            select: { id: true, title: true, slug: true, status: true, createdAt: true, isDemo: true },
          }),
        [],
        'content.media',
      );
    case 'news':
      return safe(
        () =>
          prisma.newsArticle.findMany({
            ...common,
            select: { id: true, title: true, slug: true, status: true, createdAt: true, isDemo: true },
          }),
        [],
        'content.news',
      );
    case 'events':
      return safe(
        () =>
          prisma.event.findMany({
            ...common,
            select: { id: true, title: true, slug: true, status: true, createdAt: true, isDemo: true },
          }),
        [],
        'content.events',
      );
    case 'expeditions':
      return safe(
        () =>
          prisma.expedition
            .findMany({
              ...common,
              select: { id: true, name: true, slug: true, status: true, createdAt: true, isDemo: true },
            })
            .then((rows) => rows.map((r) => ({ ...r, title: r.name }))),
        [],
        'content.expeditions',
      );
    case 'education':
      return safe(
        () =>
          prisma.educationResource.findMany({
            ...common,
            select: { id: true, title: true, slug: true, status: true, createdAt: true, isDemo: true },
          }),
        [],
        'content.education',
      );
    case 'topics':
      return safe(
        () =>
          prisma.topic
            .findMany({
              ...common,
              select: { id: true, name: true, slug: true, createdAt: true },
            })
            .then((rows) => rows.map((r) => ({ ...r, title: r.name, status: null, isDemo: false }))),
        [],
        'content.topics',
      );
    case 'glossary':
      return safe(
        () =>
          prisma.glossaryTerm
            .findMany({
              ...common,
              select: { id: true, term: true, slug: true, createdAt: true },
            })
            .then((rows) => rows.map((r) => ({ ...r, title: r.term, status: null, isDemo: false }))),
        [],
        'content.glossary',
      );
    case 'researchers':
      return safe(
        () =>
          prisma.researcher
            .findMany({
              ...common,
              select: { id: true, fullName: true, slug: true, createdAt: true, isDemo: true },
            })
            .then((rows) => rows.map((r) => ({ ...r, title: r.fullName, status: null }))),
        [],
        'content.researchers',
      );
    case 'institutions':
      return safe(
        () =>
          prisma.institution
            .findMany({
              ...common,
              select: { id: true, name: true, slug: true, createdAt: true, isDemo: true },
            })
            .then((rows) => rows.map((r) => ({ ...r, title: r.name, status: null }))),
        [],
        'content.institutions',
      );
    default:
      return safe(
        () =>
          prisma.research.findMany({
            ...common,
            select: { id: true, title: true, slug: true, status: true, createdAt: true, isDemo: true },
          }),
        [],
        'content.research',
      );
  }
}

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const type = (await searchParams).type ?? 'research';
  const config = TYPES.find((t) => t.key === type) ?? TYPES[0];
  const rows = await loadRows(config.key);

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-semibold">Content management</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        Publish, archive or delete records. Create new research via the{' '}
        <Link href="/submit" className="text-accent hover:underline">
          submission workflow
        </Link>
        ; other types are created through their API (see <code>docs/api.md</code>).
      </p>

      <div className="mb-6 flex flex-wrap gap-1.5">
        {TYPES.map((t) => (
          <Link
            key={t.key}
            href={`/admin/content?type=${t.key}`}
            className={`rounded-full border px-3 py-1 text-sm ${
              t.key === config.key
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-border hover:border-accent hover:text-accent'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <ContentTable
        rows={rows.map((r) => ({
          id: r.id,
          title: r.title,
          slug: r.slug ?? '',
          status: r.status ?? null,
          isDemo: Boolean(r.isDemo),
          createdAt: typeof r.createdAt === 'string' ? r.createdAt : r.createdAt.toISOString(),
        }))}
        apiBase={config.api}
        publicBase={config.base}
        hasStatus={['research', 'datasets', 'media', 'news', 'events', 'expeditions', 'education'].includes(
          config.key,
        )}
      />
    </div>
  );
}
