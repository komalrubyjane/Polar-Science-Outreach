import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { safe } from '@/lib/safe';
import { PageHero } from '@/components/content/page-hero';
import { FilterBar } from '@/components/content/filter-bar';
import { ArticleCard } from '@/components/content/cards';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/misc';
import { pageArgs, textWhere } from '@/lib/services/list-helpers';
import { NEWS_CATEGORY_LABELS } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'News',
  description: 'Announcements and stories from the polar science community: research, climate, expeditions, policy, education, technology and biodiversity.',
};

export const dynamic = 'force-dynamic';

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const get = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : (sp[k] as string | undefined));
  const page = Number(get('page') ?? '1') || 1;
  const { skip, take, pageSize } = pageArgs(page, 12);

  const where = {
    status: 'PUBLISHED' as const,
    ...(get('category') ? { category: get('category') as never } : {}),
    ...(textWhere(get('q'), ['title', 'subtitle', 'body']) ?? {}),
  };

  const [items, total] = await Promise.all([
    safe(
      () =>
        prisma.newsArticle.findMany({
          where,
          skip,
          take,
          orderBy: { publishedAt: 'desc' },
          include: { author: { select: { name: true } } },
        }),
      [],
      'newsList',
    ),
    safe(() => prisma.newsArticle.count({ where }), 0, 'newsCount'),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const [featured, ...rest] = items;

  return (
    <>
      <PageHero
        imageSlot="news"
        eyebrow="News"
        title="Polar science newsroom"
        description="Curated announcements and stories. Each article lists its author, publication date and references."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'News' }]}
      />
      <div className="container-page py-10">
        <div className="mb-6 flex flex-wrap gap-2">
          {Object.entries(NEWS_CATEGORY_LABELS).map(([key, label]) => (
            <Link
              key={key}
              href={`/news?category=${key}`}
              className={`rounded-full border px-3 py-1 text-sm ${
                get('category') === key
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border hover:border-accent hover:text-accent'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        <FilterBar searchPlaceholder="Search news…" fields={[]} />

        {items.length ? (
          <>
            {featured && page === 1 && !get('q') && !get('category') ? (
              <Link
                href={`/news/${featured.slug}`}
                className="group mb-8 grid overflow-hidden rounded-xl border border-border bg-card md:grid-cols-2"
              >
                {featured.heroImageUrl ? (
                  <div className="aspect-[16/10] w-full overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={featured.heroImageUrl}
                      alt=""
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                ) : null}
                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                    {NEWS_CATEGORY_LABELS[featured.category]}
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-semibold group-hover:text-accent">
                    {featured.title}
                  </h2>
                  {featured.subtitle ? (
                    <p className="mt-2 text-muted-foreground">{featured.subtitle}</p>
                  ) : null}
                </div>
              </Link>
            ) : null}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {(page === 1 && !get('q') && !get('category') ? rest : items).map((n) => (
                <ArticleCard key={n.id} data={n} />
              ))}
            </div>
            <Pagination page={page} pageCount={pageCount} />
          </>
        ) : (
          <EmptyState title="No news articles yet" description="Seed the database to load demo articles." />
        )}
      </div>
    </>
  );
}
