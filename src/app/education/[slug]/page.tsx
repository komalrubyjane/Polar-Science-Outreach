import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock, Users, Download, Target } from 'lucide-react';
import { prisma } from '@/lib/db';
import { safe } from '@/lib/safe';
import { auth } from '@/auth';
import { getStorage } from '@/lib/storage';
import { track } from '@/lib/analytics';
import { renderMarkdown } from '@/lib/markdown';
import { PageHero } from '@/components/content/page-hero';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookmarkButton } from '@/components/content/bookmark-button';
import { EDUCATION_TYPE_LABELS } from '@/lib/constants';

export const dynamic = 'force-dynamic';

async function getResource(slug: string) {
  return safe(
    () =>
      prisma.educationResource.findFirst({
        where: { slug },
        include: {
          topic: { select: { name: true, slug: true } },
          attachment: { select: { key: true, isPublic: true, originalName: true } },
          quiz: { select: { slug: true, title: true } },
        },
      }),
    null,
    'eduDetail',
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const r = await getResource(slug);
  if (!r) return { title: 'Resource not found' };
  return { title: r.title, description: r.summary.slice(0, 200) };
}

export default async function EducationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resource = await getResource(slug);
  if (!resource) notFound();

  const session = await auth();
  if (
    resource.status !== 'PUBLISHED' &&
    !['EDITOR', 'ADMIN'].includes(session?.user?.role ?? '')
  ) {
    notFound();
  }

  void prisma.educationResource
    .update({ where: { id: resource.id }, data: { viewCount: { increment: 1 } } })
    .catch(() => undefined);
  void track({ type: 'resource_view', entityType: 'EducationResource', entityId: resource.id });

  const storage = getStorage();
  const attachmentUrl = resource.attachment
    ? storage.publicUrl(resource.attachment.key, resource.attachment.isPublic)
    : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: resource.title,
    description: resource.summary,
    learningResourceType: EDUCATION_TYPE_LABELS[resource.type],
    ...(resource.ageGroup ? { typicalAgeRange: resource.ageGroup } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHero
        eyebrow={EDUCATION_TYPE_LABELS[resource.type]}
        title={resource.title}
        description={resource.summary}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
          { label: resource.title },
        ]}
      >
        <div className="flex flex-wrap items-center gap-3">
          {resource.ageGroup ? (
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" /> {resource.ageGroup}
            </span>
          ) : null}
          {resource.durationMin ? (
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" /> {resource.durationMin} min
            </span>
          ) : null}
          {resource.topic ? (
            <Link href={`/explore/${resource.topic.slug}`}>
              <Badge variant="outline">{resource.topic.name}</Badge>
            </Link>
          ) : null}
        </div>
      </PageHero>

      <div className="container-page grid gap-10 py-10 lg:grid-cols-[1fr_280px]">
        <article>
          {resource.objectives.length ? (
            <section className="mb-8 rounded-xl border border-border bg-card p-5">
              <h2 className="mb-2 flex items-center gap-2 font-display text-lg font-semibold">
                <Target className="h-5 w-5 text-accent" /> Learning objectives
              </h2>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {resource.objectives.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
            </section>
          ) : null}

          <div
            className="prose-polar"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(resource.body) }}
          />

          {resource.materials.length ? (
            <section className="mt-8">
              <h2 className="mb-2 font-display text-lg font-semibold">Materials</h2>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {resource.materials.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {resource.assessment ? (
            <section className="mt-8">
              <h2 className="mb-2 font-display text-lg font-semibold">Assessment</h2>
              <div
                className="prose-polar"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(resource.assessment) }}
              />
            </section>
          ) : null}

          {resource.plainLanguage ? (
            <section className="mt-8 rounded-xl border border-accent/30 bg-accent/5 p-5">
              <h2 className="mb-2 font-display text-lg font-semibold">In plain language</h2>
              <div
                className="prose-polar"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(resource.plainLanguage) }}
              />
            </section>
          ) : null}
        </article>

        <aside className="space-y-4">
          <BookmarkButton entityType="EDUCATION" entityId={resource.id} />
          {attachmentUrl ? (
            <Button asChild className="w-full">
              <a href={attachmentUrl} download>
                <Download className="h-4 w-4" /> Download PDF
              </a>
            </Button>
          ) : null}
          {resource.quiz ? (
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-semibold">Linked quiz</p>
              <Link
                href={`/education/quizzes/${resource.quiz.slug}`}
                className="mt-1 block text-accent hover:underline"
              >
                {resource.quiz.title} →
              </Link>
            </div>
          ) : null}
        </aside>
      </div>
    </>
  );
}
