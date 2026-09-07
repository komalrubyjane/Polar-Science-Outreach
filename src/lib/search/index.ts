import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';

/**
 * Search abstraction.
 *
 * The default implementation uses PostgreSQL full-text search
 * (`to_tsvector` / `plainto_tsquery` / `ts_rank`) with an ILIKE fallback for
 * short / prefix queries. It needs no extensions; optional GIN indexes in
 * `prisma/sql/fulltext.sql` speed it up at scale.
 *
 * To migrate to Elasticsearch / OpenSearch / Meilisearch later, implement the
 * same `SearchProvider` surface and swap the export.
 */

export interface RepositorySearchParams {
  q?: string;
  pole?: 'ARCTIC' | 'ANTARCTIC' | 'BIPOLAR';
  discipline?: string;
  type?: string;
  institutionId?: string;
  language?: string;
  license?: string;
  yearFrom?: number;
  yearTo?: number;
  sort?: 'relevance' | 'newest' | 'oldest' | 'most_viewed';
  page?: number;
  pageSize?: number;
  /** Restrict to published records (public) or allow any (admin). */
  includeUnpublished?: boolean;
}

export interface RepositorySearchResult {
  ids: string[];
  total: number;
  page: number;
  pageSize: number;
}

function sanitizeTerm(q: string | undefined): string {
  return (q ?? '').trim().slice(0, 200);
}

export async function searchRepository(
  params: RepositorySearchParams,
): Promise<RepositorySearchResult> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 12));
  const offset = (page - 1) * pageSize;
  const term = sanitizeTerm(params.q);

  const conditions: Prisma.Sql[] = [];

  if (!params.includeUnpublished) {
    conditions.push(Prisma.sql`r."status" = 'PUBLISHED'`);
  }
  if (params.pole) conditions.push(Prisma.sql`r."pole" = ${params.pole}::"Pole"`);
  if (params.discipline)
    conditions.push(Prisma.sql`r."discipline" = ${params.discipline}::"Discipline"`);
  if (params.type)
    conditions.push(Prisma.sql`r."type" = ${params.type}::"RepositoryType"`);
  if (params.institutionId)
    conditions.push(Prisma.sql`r."institutionId" = ${params.institutionId}`);
  if (params.language) conditions.push(Prisma.sql`r."language" = ${params.language}`);
  if (params.license)
    conditions.push(Prisma.sql`r."license" = ${params.license}::"LicenseType"`);
  if (params.yearFrom)
    conditions.push(
      Prisma.sql`r."publicationDate" >= ${new Date(`${params.yearFrom}-01-01`)}`,
    );
  if (params.yearTo)
    conditions.push(
      Prisma.sql`r."publicationDate" <= ${new Date(`${params.yearTo}-12-31`)}`,
    );

  const hasTerm = term.length >= 2;
  const docExpr = Prisma.sql`
    setweight(to_tsvector('english', coalesce(r."title", '')), 'A') ||
    setweight(to_tsvector('english', array_to_string(r."keywords", ' ')), 'B') ||
    setweight(to_tsvector('english', coalesce(r."abstract", '')), 'C') ||
    setweight(to_tsvector('english', coalesce(r."description", '')), 'D')`;

  if (hasTerm) {
    conditions.push(Prisma.sql`(
      ${docExpr} @@ plainto_tsquery('english', ${term})
      OR r."title" ILIKE ${'%' + term + '%'}
      OR array_to_string(r."keywords", ' ') ILIKE ${'%' + term + '%'}
    )`);
  }

  const whereSql =
    conditions.length > 0
      ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
      : Prisma.empty;

  let orderSql: Prisma.Sql;
  switch (params.sort ?? (hasTerm ? 'relevance' : 'newest')) {
    case 'oldest':
      orderSql = Prisma.sql`ORDER BY r."publicationDate" ASC NULLS LAST, r."createdAt" ASC`;
      break;
    case 'most_viewed':
      orderSql = Prisma.sql`ORDER BY r."viewCount" DESC, r."publicationDate" DESC NULLS LAST`;
      break;
    case 'relevance':
      orderSql = hasTerm
        ? Prisma.sql`ORDER BY ts_rank(${docExpr}, plainto_tsquery('english', ${term})) DESC, r."publicationDate" DESC NULLS LAST`
        : Prisma.sql`ORDER BY r."publicationDate" DESC NULLS LAST, r."createdAt" DESC`;
      break;
    default:
      orderSql = Prisma.sql`ORDER BY r."publicationDate" DESC NULLS LAST, r."createdAt" DESC`;
  }

  const rows = await prisma.$queryRaw<{ id: string }[]>(Prisma.sql`
    SELECT r."id"
    FROM "Research" r
    ${whereSql}
    ${orderSql}
    LIMIT ${pageSize} OFFSET ${offset}
  `);

  const countRows = await prisma.$queryRaw<{ count: bigint }[]>(Prisma.sql`
    SELECT COUNT(*)::bigint AS count FROM "Research" r ${whereSql}
  `);

  return {
    ids: rows.map((r) => r.id),
    total: Number(countRows[0]?.count ?? 0n),
    page,
    pageSize,
  };
}

/** Autocomplete suggestions for the repository search box. */
export async function repositorySuggestions(q: string, limit = 6): Promise<string[]> {
  const term = sanitizeTerm(q);
  if (term.length < 2) return [];
  const rows = await prisma.research.findMany({
    where: { status: 'PUBLISHED', title: { contains: term, mode: 'insensitive' } },
    select: { title: true },
    take: limit,
    orderBy: { viewCount: 'desc' },
  });
  return rows.map((r) => r.title);
}

// ---------------------------------------------------------------------------
// Global search across all content types
// ---------------------------------------------------------------------------

export type GlobalSearchGroup =
  | 'research'
  | 'datasets'
  | 'media'
  | 'news'
  | 'events'
  | 'education'
  | 'researchers'
  | 'institutions'
  | 'glossary';

export interface GlobalSearchHit {
  group: GlobalSearchGroup;
  id: string;
  title: string;
  description: string | null;
  href: string;
}

export async function globalSearch(
  qRaw: string,
  perGroup = 5,
): Promise<{ query: string; total: number; groups: Record<GlobalSearchGroup, GlobalSearchHit[]> }> {
  const q = sanitizeTerm(qRaw);
  const like = { contains: q, mode: 'insensitive' as const };
  const empty: Record<GlobalSearchGroup, GlobalSearchHit[]> = {
    research: [],
    datasets: [],
    media: [],
    news: [],
    events: [],
    education: [],
    researchers: [],
    institutions: [],
    glossary: [],
  };

  if (q.length < 2) return { query: q, total: 0, groups: empty };

  const [research, datasets, media, news, education, researchers, institutions, glossary] =
    await Promise.all([
      prisma.research.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [{ title: like }, { abstract: like }, { keywords: { has: q } }],
        },
        select: { id: true, slug: true, title: true, abstract: true },
        take: perGroup,
        orderBy: { viewCount: 'desc' },
      }),
      prisma.dataset.findMany({
        where: { status: 'PUBLISHED', OR: [{ title: like }, { description: like }] },
        select: { id: true, slug: true, title: true, description: true },
        take: perGroup,
      }),
      prisma.media.findMany({
        where: { status: 'PUBLISHED', OR: [{ title: like }, { description: like }] },
        select: { id: true, slug: true, title: true, description: true },
        take: perGroup,
      }),
      prisma.newsArticle.findMany({
        where: { status: 'PUBLISHED', OR: [{ title: like }, { subtitle: like }] },
        select: { id: true, slug: true, title: true, subtitle: true },
        take: perGroup,
      }),
      prisma.educationResource.findMany({
        where: { status: 'PUBLISHED', OR: [{ title: like }, { summary: like }] },
        select: { id: true, slug: true, title: true, summary: true },
        take: perGroup,
      }),
      prisma.researcher.findMany({
        where: { OR: [{ fullName: like }, { bio: like }] },
        select: { id: true, slug: true, fullName: true, title: true },
        take: perGroup,
      }),
      prisma.institution.findMany({
        where: { OR: [{ name: like }, { description: like }] },
        select: { id: true, slug: true, name: true, description: true },
        take: perGroup,
      }),
      prisma.glossaryTerm.findMany({
        where: { OR: [{ term: like }, { definition: like }] },
        select: { id: true, slug: true, term: true, definition: true },
        take: perGroup,
      }),
    ]);

  const events = await prisma.event.findMany({
    where: { status: 'PUBLISHED', OR: [{ title: like }, { description: like }] },
    select: { id: true, slug: true, title: true, description: true },
    take: perGroup,
  });

  const groups: Record<GlobalSearchGroup, GlobalSearchHit[]> = {
    research: research.map((r) => ({
      group: 'research',
      id: r.id,
      title: r.title,
      description: r.abstract,
      href: `/repository/${r.slug}`,
    })),
    datasets: datasets.map((d) => ({
      group: 'datasets',
      id: d.id,
      title: d.title,
      description: d.description,
      href: `/data/${d.slug}`,
    })),
    media: media.map((m) => ({
      group: 'media',
      id: m.id,
      title: m.title,
      description: m.description,
      href: `/media/${m.slug}`,
    })),
    news: news.map((n) => ({
      group: 'news',
      id: n.id,
      title: n.title,
      description: n.subtitle,
      href: `/news/${n.slug}`,
    })),
    events: events.map((e) => ({
      group: 'events',
      id: e.id,
      title: e.title,
      description: e.description,
      href: `/events/${e.slug}`,
    })),
    education: education.map((e) => ({
      group: 'education',
      id: e.id,
      title: e.title,
      description: e.summary,
      href: `/education/${e.slug}`,
    })),
    researchers: researchers.map((r) => ({
      group: 'researchers',
      id: r.id,
      title: r.fullName,
      description: r.title,
      href: `/researchers/${r.slug}`,
    })),
    institutions: institutions.map((i) => ({
      group: 'institutions',
      id: i.id,
      title: i.name,
      description: i.description,
      href: `/institutions/${i.slug}`,
    })),
    glossary: glossary.map((g) => ({
      group: 'glossary',
      id: g.id,
      title: g.term,
      description: g.definition,
      href: `/glossary#${g.slug}`,
    })),
  };

  const total = Object.values(groups).reduce((n, g) => n + g.length, 0);
  return { query: q, total, groups };
}
