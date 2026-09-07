import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { safe } from '@/lib/safe';
import { PageHero } from '@/components/content/page-hero';
import { FilterBar } from '@/components/content/filter-bar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/misc';
import { pageArgs, textWhere } from '@/lib/services/list-helpers';
import { DISCIPLINE_LABELS, POLE_LABELS } from '@/lib/constants';
import { truncate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Researcher Directory',
  description: 'Polar researchers — their institutions, research areas, publications and expeditions.',
};

export const dynamic = 'force-dynamic';

export default async function ResearchersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const get = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : (sp[k] as string | undefined));
  const page = Number(get('page') ?? '1') || 1;
  const { skip, take, pageSize } = pageArgs(page, 18);

  const where = {
    ...(get('primaryPole') ? { primaryPole: get('primaryPole') as never } : {}),
    ...(get('institutionId') ? { institutionId: get('institutionId') } : {}),
    ...(textWhere(get('q'), ['fullName', 'bio', 'title']) ?? {}),
  };

  const [items, total, institutions] = await Promise.all([
    safe(
      () =>
        prisma.researcher.findMany({
          where,
          skip,
          take,
          orderBy: { fullName: 'asc' },
          include: {
            institution: { select: { name: true } },
            _count: { select: { authorships: true, expeditions: true } },
          },
        }),
      [],
      'researchersList',
    ),
    safe(() => prisma.researcher.count({ where }), 0, 'researchersCount'),
    safe(
      () => prisma.institution.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
      [],
      'researchersInstitutions',
    ),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      <PageHero
        eyebrow="Directory"
        title="Researcher directory"
        description="Profiles of polar researchers. Demonstration profiles are fictional and clearly labelled — no invented findings are attributed to real people."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Researchers' }]}
      />
      <div className="container-page py-10">
        <FilterBar
          searchPlaceholder="Search researchers…"
          fields={[
            {
              key: 'primaryPole',
              label: 'Primary region',
              options: Object.entries(POLE_LABELS).map(([value, label]) => ({ value, label })),
            },
            {
              key: 'institutionId',
              label: 'Institution',
              options: institutions.map((i) => ({ value: i.id, label: i.name })),
            },
          ]}
        />
        {items.length ? (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((r) => (
                <Link key={r.id} href={`/researchers/${r.slug}`}>
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                          {r.fullName.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-display font-semibold">{r.fullName}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {r.title ? `${r.title} · ` : ''}
                            {r.institution?.name ?? 'Independent'}
                          </p>
                        </div>
                      </div>
                      {r.bio ? (
                        <p className="mt-3 text-sm text-muted-foreground">{truncate(r.bio, 110)}</p>
                      ) : null}
                      <div className="mt-3 flex flex-wrap gap-1">
                        {r.primaryPole ? (
                          <Badge variant="accent">{POLE_LABELS[r.primaryPole]}</Badge>
                        ) : null}
                        {r.researchAreas.slice(0, 2).map((a) => (
                          <Badge key={a} variant="secondary">
                            {DISCIPLINE_LABELS[a]}
                          </Badge>
                        ))}
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground">
                        {r._count.authorships} publications · {r._count.expeditions} expeditions
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <Pagination page={page} pageCount={pageCount} />
          </>
        ) : (
          <EmptyState title="No researchers found" description="Seed the database to load demo researcher profiles." />
        )}
      </div>
    </>
  );
}
