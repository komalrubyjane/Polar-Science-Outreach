import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { safe } from '@/lib/safe';
import { PageHero } from '@/components/content/page-hero';
import { ResearchCard, MediaCard, EducationCard } from '@/components/content/cards';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/misc';
import { renderMarkdown } from '@/lib/markdown';
import { DISCIPLINE_LABELS, POLE_LABELS } from '@/lib/constants';

export const dynamic = 'force-dynamic';

async function getTopic(slug: string) {
  return safe(
    () =>
      prisma.topic.findUnique({
        where: { slug },
        include: {
          parent: { select: { name: true, slug: true } },
          children: { select: { name: true, slug: true } },
          research: {
            where: { research: { status: 'PUBLISHED' } },
            take: 6,
            include: {
              research: {
                include: {
                  institution: { select: { name: true } },
                  authors: {
                    orderBy: { authorOrder: 'asc' },
                    include: { researcher: { select: { fullName: true } } },
                  },
                },
              },
            },
          },
          media: {
            where: { media: { status: 'PUBLISHED' } },
            take: 8,
            include: { media: true },
          },
          education: { where: { status: 'PUBLISHED' }, take: 3 },
          glossary: { take: 8 },
        },
      }),
    null,
    'topicDetail',
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const t = await getTopic(slug);
  if (!t) return { title: 'Topic not found' };
  return {
    title: t.name,
    description: t.overview?.slice(0, 200) ?? `Polar science topic: ${t.name}`,
    alternates: { canonical: `/explore/${t.slug}` },
  };
}

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = await getTopic(slug);
  if (!topic) notFound();

  return (
    <>
      <PageHero
        eyebrow={topic.category}
        title={topic.name}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Explore', href: '/explore' },
          { label: topic.name },
        ]}
      >
        <div className="flex flex-wrap gap-1.5">
          {topic.discipline ? (
            <Badge variant="secondary">{DISCIPLINE_LABELS[topic.discipline]}</Badge>
          ) : null}
          {topic.pole ? <Badge variant="accent">{POLE_LABELS[topic.pole]}</Badge> : null}
          {topic.parent ? (
            <Link href={`/explore/${topic.parent.slug}`}>
              <Badge variant="outline">↑ {topic.parent.name}</Badge>
            </Link>
          ) : null}
        </div>
      </PageHero>

      <div className="container-page grid gap-10 py-10 lg:grid-cols-[1fr_280px]">
        <div className="space-y-12">
          {topic.overview ? (
            <section>
              <h2 className="mb-2 font-display text-xl font-semibold">Overview</h2>
              <div
                className="prose-polar"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(topic.overview) }}
              />
            </section>
          ) : null}

          {topic.keyConcepts.length ? (
            <section>
              <h2 className="mb-3 font-display text-xl font-semibold">Key concepts</h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {topic.keyConcepts.map((c) => (
                  <li key={c} className="rounded-lg border border-border bg-card px-3 py-2 text-sm">
                    {c}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section>
            <h2 className="mb-4 font-display text-xl font-semibold">Research</h2>
            {topic.research.length ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {topic.research.map((r) => (
                  <ResearchCard key={r.research.id} data={r.research} />
                ))}
              </div>
            ) : (
              <EmptyState title="No research linked to this topic yet" />
            )}
            <Link
              href={`/repository?q=${encodeURIComponent(topic.name)}`}
              className="mt-4 inline-block text-sm text-accent hover:underline"
            >
              Search the repository for “{topic.name}” →
            </Link>
          </section>

          {topic.media.length ? (
            <section>
              <h2 className="mb-4 font-display text-xl font-semibold">Media</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {topic.media.map((m) => (
                  <MediaCard key={m.media.id} data={m.media} />
                ))}
              </div>
            </section>
          ) : null}

          {topic.education.length ? (
            <section>
              <h2 className="mb-4 font-display text-xl font-semibold">Educational resources</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {topic.education.map((e) => (
                  <EducationCard key={e.id} data={e} />
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="space-y-6">
          {topic.children.length ? (
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="mb-2 text-sm font-semibold">Sub-topics</h3>
              <ul className="space-y-1 text-sm">
                {topic.children.map((c) => (
                  <li key={c.slug}>
                    <Link href={`/explore/${c.slug}`} className="text-accent hover:underline">
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {topic.glossary.length ? (
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="mb-2 text-sm font-semibold">Glossary terms</h3>
              <ul className="space-y-2 text-sm">
                {topic.glossary.map((g) => (
                  <li key={g.id}>
                    <Link href={`/glossary#${g.slug}`} className="font-medium hover:text-accent">
                      {g.term}
                    </Link>
                    <p className="text-xs text-muted-foreground">{g.definition.slice(0, 90)}…</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>
    </>
  );
}
