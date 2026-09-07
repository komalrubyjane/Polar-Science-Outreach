import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { safe } from '@/lib/safe';
import { PageHero } from '@/components/content/page-hero';
import { FilterBar } from '@/components/content/filter-bar';
import { ExpeditionCard } from '@/components/content/cards';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/misc';
import { pageArgs, textWhere } from '@/lib/services/list-helpers';

export const metadata: Metadata = {
  title: 'Expeditions',
  description:
    'Polar field campaigns and research cruises — objectives, routes, teams, publications and live expedition journals.',
};

export const dynamic = 'force-dynamic';

export default async function ExpeditionsPage({
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
    ...(get('regionId') ? { regionId: get('regionId') } : {}),
    ...(textWhere(get('q'), ['name', 'summary', 'objectives', 'vessel']) ?? {}),
  };

  const [items, total, regions] = await Promise.all([
    safe(
      () =>
        prisma.expedition.findMany({
          where,
          skip,
          take,
          orderBy: { startDate: 'desc' },
          include: { region: { select: { name: true } } },
        }),
      [],
      'expList',
    ),
    safe(() => prisma.expedition.count({ where }), 0, 'expCount'),
    safe(() => prisma.region.findMany({ select: { id: true, name: true } }), [], 'expRegions'),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      <PageHero
        eyebrow="Expeditions"
        title="Polar field campaigns"
        description="Research cruises and field expeditions to the Arctic and Antarctic. Each has objectives, a route map, team, publications and a day-by-day journal."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Expeditions' }]}
      />
      <div className="container-page py-10">
        <FilterBar
          searchPlaceholder="Search expeditions…"
          fields={[
            {
              key: 'regionId',
              label: 'Region',
              options: regions.map((r) => ({ value: r.id, label: r.name })),
            },
          ]}
        />
        {items.length ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((e) => (
                <ExpeditionCard key={e.id} data={e} />
              ))}
            </div>
            <Pagination page={page} pageCount={pageCount} />
          </>
        ) : (
          <EmptyState title="No expeditions published yet" description="Seed the database to load demo expeditions." />
        )}
      </div>
    </>
  );
}
