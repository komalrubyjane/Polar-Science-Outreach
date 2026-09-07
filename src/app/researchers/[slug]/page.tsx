import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExternalLink, Mail } from 'lucide-react';
import { prisma } from '@/lib/db';
import { safe } from '@/lib/safe';
import { PageHero } from '@/components/content/page-hero';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/misc';
import { DISCIPLINE_LABELS, POLE_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

async function getResearcher(slug: string) {
  return safe(
    () =>
      prisma.researcher.findUnique({
        where: { slug },
        include: {
          institution: { select: { name: true, slug: true, country: true } },
          authorships: {
            include: {
              research: {
                select: {
                  id: true, slug: true, title: true, publishedAt: true, status: true,
                  discipline: true, pole: true,
                },
              },
            },
          },
          expeditions: {
            include: { expedition: { select: { id: true, slug: true, name: true, startDate: true } } },
          },
        },
      }),
    null,
    'researcherDetail',
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const r = await getResearcher(slug);
  if (!r) return { title: 'Researcher not found' };
  return {
    title: r.fullName,
    description: r.bio?.slice(0, 200) ?? `Polar researcher profile: ${r.fullName}`,
  };
}

export default async function ResearcherPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const researcher = await getResearcher(slug);
  if (!researcher) notFound();

  const published = researcher.authorships
    .map((a) => a.research)
    .filter((r) => r.status === 'PUBLISHED')
    .sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0));

  return (
    <>
      <PageHero
        eyebrow="Researcher"
        title={researcher.fullName}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Researchers', href: '/researchers' },
          { label: researcher.fullName },
        ]}
      >
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {researcher.title ? <span>{researcher.title}</span> : null}
          {researcher.institution ? (
            <Link href={`/institutions/${researcher.institution.slug}`} className="hover:text-accent">
              {researcher.institution.name}
            </Link>
          ) : null}
          {researcher.isDemo ? <Badge variant="demo">Demo profile</Badge> : null}
        </div>
      </PageHero>

      <div className="container-page grid gap-10 py-10 lg:grid-cols-[1fr_280px]">
        <div className="space-y-10">
          {researcher.bio ? (
            <section>
              <h2 className="mb-2 font-display text-xl font-semibold">Biography</h2>
              <p className="leading-relaxed text-foreground/90">{researcher.bio}</p>
            </section>
          ) : null}

          <section>
            <h2 className="mb-4 font-display text-xl font-semibold">
              Publications ({published.length})
            </h2>
            {published.length ? (
              <ul className="space-y-3">
                {published.map((r) => (
                  <li key={r.id} className="rounded-lg border border-border bg-card p-4">
                    <Link
                      href={`/repository/${r.slug}`}
                      className="font-medium hover:text-accent hover:underline"
                    >
                      {r.title}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {DISCIPLINE_LABELS[r.discipline]} · {POLE_LABELS[r.pole]} ·{' '}
                      {formatDate(r.publishedAt)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No published research linked to this profile" />
            )}
          </section>

          {researcher.expeditions.length ? (
            <section>
              <h2 className="mb-4 font-display text-xl font-semibold">Expeditions</h2>
              <ul className="space-y-2">
                {researcher.expeditions.map((e) => (
                  <li key={e.expedition.id}>
                    <Link
                      href={`/expeditions/${e.expedition.slug}`}
                      className="text-accent hover:underline"
                    >
                      {e.expedition.name}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {' '}
                      — {e.role} · {formatDate(e.expedition.startDate)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="space-y-5">
          <div className="rounded-xl border border-border bg-card p-4 text-sm">
            <h3 className="mb-2 font-semibold">Research areas</h3>
            <div className="flex flex-wrap gap-1">
              {researcher.researchAreas.map((a) => (
                <Badge key={a} variant="secondary">
                  {DISCIPLINE_LABELS[a]}
                </Badge>
              ))}
              {researcher.researchAreas.length === 0 ? (
                <span className="text-muted-foreground">Not specified</span>
              ) : null}
            </div>
            {researcher.primaryPole ? (
              <p className="mt-3 text-muted-foreground">
                Primary region: {POLE_LABELS[researcher.primaryPole]}
              </p>
            ) : null}
          </div>

          <div className="rounded-xl border border-border bg-card p-4 text-sm">
            <h3 className="mb-2 font-semibold">Links</h3>
            <ul className="space-y-1">
              {researcher.orcid ? (
                <li>
                  <a
                    href={`https://orcid.org/${researcher.orcid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-accent hover:underline"
                  >
                    ORCID <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              ) : null}
              {researcher.websiteUrl ? (
                <li>
                  <a
                    href={researcher.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-accent hover:underline"
                  >
                    Website <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              ) : null}
              {researcher.email ? (
                <li>
                  <a
                    href={`mailto:${researcher.email}`}
                    className="inline-flex items-center gap-1 text-accent hover:underline"
                  >
                    <Mail className="h-3 w-3" /> Email
                  </a>
                </li>
              ) : null}
              {!researcher.orcid && !researcher.websiteUrl && !researcher.email ? (
                <li className="text-muted-foreground">No public links</li>
              ) : null}
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
