import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { safe } from '@/lib/safe';
import { searchRepository } from '@/lib/search';
import { PageHero } from '@/components/content/page-hero';
import { FilterBar } from '@/components/content/filter-bar';
import { ResearchCard } from '@/components/content/cards';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/misc';
import { track } from '@/lib/analytics';
import {
  DISCIPLINE_LABELS,
  POLE_LABELS,
  REPOSITORY_TYPE_LABELS,
  LICENSE_LABELS,
} from '@/lib/constants';
import { formatNumber } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Knowledge Repository',
  description:
    'Search polar research papers, reports, datasets, theses and policy documents. Full-text search with filters for region, discipline, year, institution and licence.',
};

export const dynamic = 'force-dynamic';

interface SearchParams {
  [key: string]: string | string[] | undefined;
}

export default async function RepositoryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const get = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : (sp[k] as string | undefined));

  const q = get('q');
  const page = Number(get('page') ?? '1') || 1;

  const { ids, total, pageSize } = await safe(
    () =>
      searchRepository({
        q,
        pole: (get('pole') as never) || undefined,
        discipline: get('discipline') || undefined,
        type: get('type') || undefined,
        license: get('license') || undefined,
        yearFrom: get('yearFrom') ? Number(get('yearFrom')) : undefined,
        yearTo: get('yearTo') ? Number(get('yearTo')) : undefined,
        sort: (get('sort') as never) || undefined,
        page,
        pageSize: 12,
      }),
    { ids: [], total: 0, page, pageSize: 12 },
    'repositorySearch',
  );

  const rows = await safe(
    () =>
      prisma.research.findMany({
        where: { id: { in: ids } },
        include: {
          institution: { select: { name: true } },
          authors: {
            orderBy: { authorOrder: 'asc' },
            include: { researcher: { select: { fullName: true } } },
          },
        },
      }),
    [],
    'repositoryHydrate',
  );
  const ordered = ids.map((id) => rows.find((r) => r.id === id)).filter(Boolean);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  if (q) void track({ type: 'search', query: q, path: '/repository' });

  const yearNow = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => String(yearNow - i));

  return (
    <>
      <PageHero
        eyebrow="Knowledge Repository"
        title="Search the polar science repository"
        description="A dissemination catalogue of research papers, reports, datasets, theses, conference and policy documents. Each record links to its source, licence and citation."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Repository' }]}
      />

      <div className="container-page py-10">
        <FilterBar
          searchPlaceholder="Search titles, abstracts, authors, keywords…"
          sortOptions={[
            { value: 'relevance', label: 'Relevance' },
            { value: 'newest', label: 'Newest' },
            { value: 'oldest', label: 'Oldest' },
            { value: 'most_viewed', label: 'Most viewed' },
          ]}
          fields={[
            {
              key: 'pole',
              label: 'Polar region',
              options: Object.entries(POLE_LABELS).map(([value, label]) => ({ value, label })),
            },
            {
              key: 'discipline',
              label: 'Discipline',
              options: Object.entries(DISCIPLINE_LABELS).map(([value, label]) => ({ value, label })),
            },
            {
              key: 'type',
              label: 'Content type',
              options: Object.entries(REPOSITORY_TYPE_LABELS).map(([value, label]) => ({
                value,
                label,
              })),
            },
            {
              key: 'license',
              label: 'Licence',
              options: Object.entries(LICENSE_LABELS).map(([value, label]) => ({ value, label })),
            },
            {
              key: 'yearFrom',
              label: 'Year from',
              options: years.map((y) => ({ value: y, label: y })),
            },
            {
              key: 'yearTo',
              label: 'Year to',
              options: years.map((y) => ({ value: y, label: y })),
            },
          ]}
        />

        <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">
          {formatNumber(total)} {total === 1 ? 'result' : 'results'}
          {q ? ` for “${q}”` : ''}
        </p>

        {ordered.length ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {ordered.map((r) => (
                <ResearchCard key={r!.id} data={r!} />
              ))}
            </div>
            <Pagination page={page} pageCount={pageCount} />
          </>
        ) : (
          <EmptyState
            title="No matching records"
            description={
              q
                ? 'Try broader keywords, or clear some filters.'
                : 'The repository has no published records yet. Run `npm run db:seed` to load demo content.'
            }
          />
        )}
      </div>
    </>
  );
}
