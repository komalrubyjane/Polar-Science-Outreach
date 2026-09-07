import type { Metadata } from 'next';
import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { prisma } from '@/lib/db';
import { safe } from '@/lib/safe';
import { PageHero } from '@/components/content/page-hero';
import { FilterBar } from '@/components/content/filter-bar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/misc';
import { pageArgs, textWhere } from '@/lib/services/list-helpers';
import { DISCIPLINE_LABELS } from '@/lib/constants';
import { truncate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Institution Directory',
  description: 'Research institutions active in polar science, with their countries, research areas, researchers and publications.',
};

export const dynamic = 'force-dynamic';

export default async function InstitutionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const get = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : (sp[k] as string | undefined));
  const page = Number(get('page') ?? '1') || 1;
  const { skip, take, pageSize } = pageArgs(page, 18);

  const where = {
    ...(get('country') ? { country: get('country') } : {}),
    ...(textWhere(get('q'), ['name', 'description', 'country']) ?? {}),
  };

  const [items, total, countries] = await Promise.all([
    safe(
      () =>
        prisma.institution.findMany({
          where,
          skip,
          take,
          orderBy: { name: 'asc' },
          include: { _count: { select: { researchers: true, research: true, expeditions: true } } },
        }),
      [],
      'instList',
    ),
    safe(() => prisma.institution.count({ where }), 0, 'instCount'),
    safe(
      () =>
        prisma.institution.findMany({
          where: { country: { not: null } },
          select: { country: true },
          distinct: ['country'],
        }),
      [],
      'instCountries',
    ),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      <PageHero
        eyebrow="Directory"
        title="Institution directory"
        description="Universities, institutes and agencies contributing polar research. Demonstration institutions are fictional and clearly labelled."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Institutions' }]}
      />
      <div className="container-page py-10">
        <FilterBar
          searchPlaceholder="Search institutions…"
          fields={[
            {
              key: 'country',
              label: 'Country',
              options: countries
                .filter((c) => c.country)
                .map((c) => ({ value: c.country as string, label: c.country as string })),
            },
          ]}
        />
        {items.length ? (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((i) => (
                <Link key={i.id} href={`/institutions/${i.slug}`}>
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                        <div className="min-w-0">
                          <p className="font-display font-semibold">
                            {i.name}
                            {i.acronym ? (
                              <span className="text-muted-foreground"> ({i.acronym})</span>
                            ) : null}
                          </p>
                          <p className="text-xs text-muted-foreground">{i.country ?? '—'}</p>
                        </div>
                      </div>
                      {i.description ? (
                        <p className="mt-3 text-sm text-muted-foreground">
                          {truncate(i.description, 110)}
                        </p>
                      ) : null}
                      <div className="mt-3 flex flex-wrap gap-1">
                        {i.researchAreas.slice(0, 3).map((a) => (
                          <Badge key={a} variant="secondary">
                            {DISCIPLINE_LABELS[a]}
                          </Badge>
                        ))}
                        {i.isDemo ? <Badge variant="demo">Demo</Badge> : null}
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground">
                        {i._count.researchers} researchers · {i._count.research} publications ·{' '}
                        {i._count.expeditions} expeditions
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <Pagination page={page} pageCount={pageCount} />
          </>
        ) : (
          <EmptyState title="No institutions found" description="Seed the database to load demo institutions." />
        )}
      </div>
    </>
  );
}
