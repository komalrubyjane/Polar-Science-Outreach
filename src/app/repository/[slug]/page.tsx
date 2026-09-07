import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExternalLink, Download, Building2, MapPin } from 'lucide-react';
import { prisma } from '@/lib/db';
import { findDemo } from '@/lib/demo-data';
import { safe } from '@/lib/safe';
import { auth } from '@/auth';
import { incrementResearchView, getRelatedResearch } from '@/lib/services/research';
import { researchDetailInclude } from '@/lib/services/research';
import { buildCitations } from '@/lib/citations';
import { renderMarkdown } from '@/lib/markdown';
import { getStorage } from '@/lib/storage';
import { track } from '@/lib/analytics';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Breadcrumb, DataProvenance } from '@/components/ui/misc';
import { ResearchCard } from '@/components/content/cards';
import { BookmarkButton } from '@/components/content/bookmark-button';
import { CitationBox } from '@/components/content/citation-box';
import { formatDate, formatNumber, absoluteUrl } from '@/lib/utils';
import {
  DISCIPLINE_LABELS,
  POLE_LABELS,
  REPOSITORY_TYPE_LABELS,
  LICENSE_LABELS,
  SITE,
} from '@/lib/constants';

export const dynamic = 'force-dynamic';

async function getResearch(slug: string) {
  const real = await safe(
    () =>
      prisma.research.findFirst({
        where: { slug },
        include: researchDetailInclude,
      }),
    null,
    'researchDetail',
  );
  return real ?? (findDemo('research', slug) as unknown as typeof real);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const r = await getResearch(slug);
  if (!r) return { title: 'Research not found' };
  return {
    title: r.title,
    description: r.abstract.slice(0, 200),
    alternates: { canonical: `/repository/${r.slug}` },
    openGraph: {
      type: 'article',
      title: r.title,
      description: r.abstract.slice(0, 200),
      publishedTime: r.publishedAt?.toISOString(),
    },
  };
}

export default async function ResearchDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const research = await getResearch(slug);
  if (!research) notFound();

  const session = await auth();
  const isStaff = ['EDITOR', 'ADMIN'].includes(session?.user?.role ?? '');
  const owns = session?.user?.id === research.createdById;
  if (research.status !== 'PUBLISHED' && !isStaff && !owns) notFound();

  void incrementResearchView(research.id);
  void track({ type: 'resource_view', entityType: 'Research', entityId: research.id });

  const bookmarked = session?.user?.id
    ? await safe(
        () =>
          prisma.bookmark
            .findUnique({
              where: {
                userId_entityType_entityId: {
                  userId: session!.user!.id,
                  entityType: 'RESEARCH',
                  entityId: research.id,
                },
              },
            })
            .then(Boolean),
        false,
        'bookmarkCheck',
      )
    : false;

  const related = await safe(
    () => getRelatedResearch(research.id, research.discipline, research.pole),
    [],
    'relatedResearch',
  );

  const storage = getStorage();
  const citations = buildCitations({
    title: research.title,
    authors: research.authors.map((a) => ({ fullName: a.researcher.fullName })),
    year: research.publicationDate?.getFullYear() ?? research.publishedAt?.getFullYear() ?? null,
    institution: research.institution?.name ?? null,
    doi: research.doi,
    url: research.externalUrl ?? absoluteUrl(`/repository/${research.slug}`),
    slug: research.slug,
    siteName: SITE.name,
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    headline: research.title,
    abstract: research.abstract,
    inLanguage: research.language,
    datePublished: research.publishedAt?.toISOString(),
    author: research.authors.map((a) => ({ '@type': 'Person', name: a.researcher.fullName })),
    ...(research.institution
      ? { publisher: { '@type': 'Organization', name: research.institution.name } }
      : {}),
    ...(research.doi ? { identifier: `https://doi.org/${research.doi}` } : {}),
  };

  return (
    <div className="container-page py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Repository', href: '/repository' },
          { label: research.title },
        ]}
      />

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <article>
          <div className="mb-3 flex flex-wrap gap-1.5">
            <Badge variant="secondary">
              {REPOSITORY_TYPE_LABELS[research.type] ?? research.type}
            </Badge>
            <Badge variant="accent">{POLE_LABELS[research.pole]}</Badge>
            <Badge variant="outline">{DISCIPLINE_LABELS[research.discipline]}</Badge>
            {research.status !== 'PUBLISHED' ? (
              <Badge variant="warning">{research.status}</Badge>
            ) : null}
            {research.isDemo ? <Badge variant="demo">Demo content</Badge> : null}
          </div>

          <h1 className="font-display text-3xl font-bold tracking-tight">{research.title}</h1>

          {research.authors.length ? (
            <p className="mt-3 text-muted-foreground">
              {research.authors.map((a, i) => (
                <span key={a.id}>
                  {i > 0 ? ', ' : ''}
                  <Link
                    href={`/researchers/${a.researcher.slug}`}
                    className="hover:text-accent hover:underline"
                  >
                    {a.researcher.fullName}
                  </Link>
                  {a.isCorresponding ? ' *' : ''}
                </span>
              ))}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <BookmarkButton
              entityType="RESEARCH"
              entityId={research.id}
              initialBookmarked={bookmarked}
            />
            {research.files.length > 0 ? (
              <Button asChild variant="default">
                <a href={storage.publicUrl(research.files[0]!.key, research.files[0]!.isPublic)}>
                  <Download className="h-4 w-4" /> Download ({research.files[0]!.mimeType.split('/')[1]})
                </a>
              </Button>
            ) : null}
            {research.externalUrl ? (
              <Button asChild variant="outline">
                <a href={research.externalUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" /> Publisher / external
                </a>
              </Button>
            ) : null}
            {research.doi ? (
              <Button asChild variant="outline">
                <a href={`https://doi.org/${research.doi}`} target="_blank" rel="noopener noreferrer">
                  DOI: {research.doi}
                </a>
              </Button>
            ) : null}
          </div>

          <section className="mt-8">
            <h2 className="font-display text-xl font-semibold">Abstract</h2>
            <p className="mt-2 leading-relaxed text-foreground/90">{research.abstract}</p>
          </section>

          {research.description ? (
            <section className="mt-8">
              <h2 className="font-display text-xl font-semibold">Details</h2>
              <div
                className="prose-polar mt-2"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(research.description) }}
              />
            </section>
          ) : null}

          {research.keywords.length ? (
            <section className="mt-8">
              <h2 className="mb-2 font-display text-lg font-semibold">Keywords</h2>
              <div className="flex flex-wrap gap-1.5">
                {research.keywords.map((k) => (
                  <Link
                    key={k}
                    href={`/repository?q=${encodeURIComponent(k)}`}
                    className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground hover:text-accent"
                  >
                    {k}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {research.topics.length ? (
            <section className="mt-6">
              <h2 className="mb-2 font-display text-lg font-semibold">Related topics</h2>
              <div className="flex flex-wrap gap-1.5">
                {research.topics.map((t) => (
                  <Link
                    key={t.topic.slug}
                    href={`/explore/${t.topic.slug}`}
                    className="rounded-full border border-border px-3 py-1 text-xs hover:border-accent hover:text-accent"
                  >
                    {t.topic.name}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {research.relatedDatasets.length ? (
            <section className="mt-8">
              <h2 className="mb-2 font-display text-lg font-semibold">Related datasets</h2>
              <ul className="space-y-1">
                {research.relatedDatasets.map((d) => (
                  <li key={d.dataset.id}>
                    <Link href={`/data/${d.dataset.slug}`} className="text-accent hover:underline">
                      {d.dataset.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {research.relatedMedia.length ? (
            <section className="mt-8">
              <h2 className="mb-2 font-display text-lg font-semibold">Related media</h2>
              <ul className="space-y-1">
                {research.relatedMedia.map((m) => (
                  <li key={m.media.id}>
                    <Link href={`/media/${m.media.slug}`} className="text-accent hover:underline">
                      {m.media.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="mt-10">
            <h2 className="mb-3 font-display text-xl font-semibold">Cite this record</h2>
            <CitationBox citations={citations} slug={research.slug} />
          </section>
        </article>

        <aside className="space-y-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Publication information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="Type" value={REPOSITORY_TYPE_LABELS[research.type] ?? research.type} />
              <Row label="Discipline" value={DISCIPLINE_LABELS[research.discipline]} />
              <Row label="Polar region" value={POLE_LABELS[research.pole]} />
              <Row label="Published" value={formatDate(research.publicationDate)} />
              <Row label="Language" value={research.language.toUpperCase()} />
              <Row label="Licence" value={LICENSE_LABELS[research.license] ?? research.license} />
              <Row label="Views" value={formatNumber(research.viewCount)} />
              {research.isbn ? <Row label="ISBN" value={research.isbn} /> : null}
            </CardContent>
          </Card>

          {research.institution ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Building2 className="h-4 w-4" /> Institution
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="font-medium">{research.institution.name}</p>
                {research.institution.country ? (
                  <p className="text-muted-foreground">{research.institution.country}</p>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          {research.latitude != null && research.longitude != null ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="h-4 w-4" /> Study location
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {research.latitude.toFixed(3)}°, {research.longitude.toFixed(3)}°
                <br />
                <Link
                  href={`/map?lat=${research.latitude}&lng=${research.longitude}`}
                  className="text-accent hover:underline"
                >
                  View on polar map
                </Link>
              </CardContent>
            </Card>
          ) : null}

          <DataProvenance
            source={research.institution?.name ?? 'Contributing author(s)'}
            publisher={research.institution?.name ?? null}
            lastUpdated={formatDate(research.updatedAt)}
            license={LICENSE_LABELS[research.license] ?? research.license}
            isDemo={research.isDemo}
          />
        </aside>
      </div>

      {related.length ? (
        <section className="mt-14">
          <h2 className="mb-6 font-display text-2xl font-semibold">Related research</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => (
              <ResearchCard key={r.id} data={r} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
