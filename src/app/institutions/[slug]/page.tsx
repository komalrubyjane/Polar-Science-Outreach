import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Globe, Building2 } from 'lucide-react';
import { prisma } from '@/lib/db';
import { findDemo } from '@/lib/demo-data';
import { safe } from '@/lib/safe';
import { PageHero } from '@/components/content/page-hero';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/misc';
import { ResearchCard, ExpeditionCard } from '@/components/content/cards';
import { DISCIPLINE_LABELS } from '@/lib/constants';

export const dynamic = 'force-dynamic';

async function getInstitution(slug: string) {
  const real = await safe(
    () =>
      prisma.institution.findUnique({
        where: { slug },
        include: {
          researchers: {
            select: { id: true, slug: true, fullName: true, title: true },
            orderBy: { fullName: 'asc' },
          },
          research: {
            where: { status: 'PUBLISHED' },
            orderBy: { publishedAt: 'desc' },
            take: 9,
            include: {
              authors: {
                orderBy: { authorOrder: 'asc' },
                include: { researcher: { select: { fullName: true } } },
              },
              institution: { select: { name: true } },
            },
          },
          expeditions: {
            where: { status: 'PUBLISHED' },
            orderBy: { startDate: 'desc' },
            take: 6,
            include: { region: { select: { name: true } } },
          },
        },
      }),
    null,
    'institutionDetail',
  );
  return real ?? (findDemo('institutions', slug) as unknown as typeof real);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const i = await getInstitution(slug);
  if (!i) return { title: 'Institution not found' };
  return {
    title: i.name,
    description: i.description?.slice(0, 200) ?? `Polar research institution: ${i.name}`,
  };
}

export default async function InstitutionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const institution = await getInstitution(slug);
  if (!institution) notFound();

  return (
    <>
      <PageHero
        eyebrow="Institution"
        title={institution.name}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Institutions', href: '/institutions' },
          { label: institution.name },
        ]}
      >
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Building2 className="h-4 w-4" />
          {institution.country ?? 'International'}
          {institution.acronym ? <Badge variant="outline">{institution.acronym}</Badge> : null}
          {institution.isDemo ? <Badge variant="demo">Demo institution</Badge> : null}
          {institution.website ? (
            <a
              href={institution.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-accent hover:underline"
            >
              <Globe className="h-3 w-3" /> Website
            </a>
          ) : null}
        </div>
      </PageHero>

      <div className="container-page space-y-12 py-10">
        {institution.description ? (
          <p className="max-w-3xl leading-relaxed text-foreground/90">{institution.description}</p>
        ) : null}

        {institution.researchAreas.length ? (
          <div className="flex flex-wrap gap-1.5">
            {institution.researchAreas.map((a) => (
              <Badge key={a} variant="secondary">
                {DISCIPLINE_LABELS[a]}
              </Badge>
            ))}
          </div>
        ) : null}

        <section>
          <h2 className="mb-4 font-display text-xl font-semibold">
            Researchers ({institution.researchers.length})
          </h2>
          {institution.researchers.length ? (
            <div className="flex flex-wrap gap-2">
              {institution.researchers.map((r) => (
                <Link
                  key={r.id}
                  href={`/researchers/${r.slug}`}
                  className="rounded-full border border-border px-3 py-1 text-sm hover:border-accent hover:text-accent"
                >
                  {r.fullName}
                  {r.title ? <span className="text-muted-foreground"> · {r.title}</span> : null}
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="No researchers listed" />
          )}
        </section>

        <section>
          <h2 className="mb-4 font-display text-xl font-semibold">Recent publications</h2>
          {institution.research.length ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {institution.research.map((r) => (
                <ResearchCard key={r.id} data={r} />
              ))}
            </div>
          ) : (
            <EmptyState title="No publications linked yet" />
          )}
        </section>

        {institution.expeditions.length ? (
          <section>
            <h2 className="mb-4 font-display text-xl font-semibold">Expeditions</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {institution.expeditions.map((e) => (
                <ExpeditionCard key={e.id} data={e} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
}
