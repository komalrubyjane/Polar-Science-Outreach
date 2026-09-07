import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { safe } from '@/lib/safe';
import { auth } from '@/auth';
import { renderMarkdown, readingTime } from '@/lib/markdown';
import { track } from '@/lib/analytics';
import { PageHero } from '@/components/content/page-hero';
import { Badge } from '@/components/ui/badge';
import { ArticleCard } from '@/components/content/cards';
import { BookmarkButton } from '@/components/content/bookmark-button';
import { formatDate } from '@/lib/utils';
import { NEWS_CATEGORY_LABELS } from '@/lib/constants';

export const dynamic = 'force-dynamic';

async function getArticle(slug: string) {
  return safe(
    () =>
      prisma.newsArticle.findFirst({
        where: { slug },
        include: {
          author: { select: { name: true } },
          tags: { include: { tag: true } },
        },
      }),
    null,
    'newsDetail',
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = await getArticle(slug);
  if (!a) return { title: 'Article not found' };
  return {
    title: a.title,
    description: a.subtitle ?? a.body.slice(0, 200),
    openGraph: {
      type: 'article',
      title: a.title,
      description: a.subtitle ?? undefined,
      publishedTime: a.publishedAt?.toISOString(),
      images: a.heroImageUrl ? [a.heroImageUrl] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const session = await auth();
  if (
    article.status !== 'PUBLISHED' &&
    !['EDITOR', 'ADMIN'].includes(session?.user?.role ?? '')
  ) {
    notFound();
  }

  void prisma.newsArticle
    .update({ where: { id: article.id }, data: { viewCount: { increment: 1 } } })
    .catch(() => undefined);
  void track({ type: 'resource_view', entityType: 'NewsArticle', entityId: article.id });

  const related = await safe(
    () =>
      prisma.newsArticle.findMany({
        where: { status: 'PUBLISHED', category: article.category, id: { not: article.id } },
        orderBy: { publishedAt: 'desc' },
        take: 3,
        include: { author: { select: { name: true } } },
      }),
    [],
    'newsRelated',
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.subtitle ?? undefined,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: article.author?.name
      ? { '@type': 'Person', name: article.author.name }
      : { '@type': 'Organization', name: 'Polar Science Portal' },
    image: article.heroImageUrl ? [article.heroImageUrl] : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHero
        eyebrow={NEWS_CATEGORY_LABELS[article.category]}
        title={article.title}
        description={article.subtitle ?? undefined}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'News', href: '/news' },
          { label: article.title },
        ]}
      >
        <p className="text-sm text-muted-foreground">
          {article.author?.name ? `By ${article.author.name} · ` : ''}
          {formatDate(article.publishedAt)} · {readingTime(article.body)} min read
        </p>
      </PageHero>

      <div className="container-page max-w-3xl py-10">
        {article.heroImageUrl ? (
          <div className="mb-8 aspect-[16/9] w-full overflow-hidden rounded-xl border border-border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={article.heroImageUrl} alt="" className="h-full w-full object-cover" />
          </div>
        ) : null}

        <div className="mb-6">
          <BookmarkButton entityType="NEWS" entityId={article.id} size="sm" />
        </div>

        <div
          className="prose-polar"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(article.body) }}
        />

        {article.references.length ? (
          <section className="mt-10 border-t border-border pt-6">
            <h2 className="mb-2 font-display text-lg font-semibold">References</h2>
            <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
              {article.references.map((r, i) => (
                <li key={i}>
                  {/^https?:\/\//.test(r) ? (
                    <a href={r} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                      {r}
                    </a>
                  ) : (
                    r
                  )}
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {article.tags.length ? (
          <div className="mt-6 flex flex-wrap gap-1.5">
            {article.tags.map((t) => (
              <Badge key={t.tag.id} variant="secondary">
                {t.tag.label}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>

      {related.length ? (
        <div className="container-page pb-14">
          <h2 className="mb-6 font-display text-2xl font-semibold">More in {NEWS_CATEGORY_LABELS[article.category]}</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {related.map((n) => (
              <ArticleCard key={n.id} data={n} />
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
