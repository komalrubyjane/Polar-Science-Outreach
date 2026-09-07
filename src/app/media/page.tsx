import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { safe } from '@/lib/safe';
import { PageHero } from '@/components/content/page-hero';
import { FilterBar } from '@/components/content/filter-bar';
import { MediaCard } from '@/components/content/cards';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/misc';
import { pageArgs, textWhere } from '@/lib/services/list-helpers';
import { MEDIA_TYPE_LABELS } from '@/lib/constants';
import { formatNumber } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Media Library',
  description:
    'Polar photos, video, audio, infographics and interactive stories — each with creator, licence and attribution. Search and filter by type and region.',
};

export const dynamic = 'force-dynamic';

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const get = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : (sp[k] as string | undefined));
  const page = Number(get('page') ?? '1') || 1;
  const { skip, take, pageSize } = pageArgs(page, 24);

  const where = {
    status: 'PUBLISHED' as const,
    ...(get('type') ? { type: get('type') as never } : {}),
    ...(get('regionId') ? { regionId: get('regionId') } : {}),
    ...(textWhere(get('q'), ['title', 'description', 'creator', 'locationName']) ?? {}),
  };

  const [items, total, regions] = await Promise.all([
    safe(
      () => prisma.media.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      [],
      'mediaList',
    ),
    safe(() => prisma.media.count({ where }), 0, 'mediaCount'),
    safe(() => prisma.region.findMany({ select: { id: true, name: true } }), [], 'mediaRegions'),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      <PageHero
        eyebrow="Media Library"
        title="Polar media"
        description="Photographs, video, audio, infographics and interactive stories. Every asset carries its creator, copyright, licence and attribution — reuse only within those terms."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Media' }]}
      />
      <div className="container-page py-10">
        <FilterBar
          searchPlaceholder="Search media titles, creators, locations…"
          fields={[
            {
              key: 'type',
              label: 'Media type',
              options: Object.entries(MEDIA_TYPE_LABELS).map(([value, label]) => ({ value, label })),
            },
            {
              key: 'regionId',
              label: 'Region',
              options: regions.map((r) => ({ value: r.id, label: r.name })),
            },
          ]}
        />
        <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">
          {formatNumber(total)} {total === 1 ? 'item' : 'items'}
        </p>
        {items.length ? (
          <>
            <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-4 [&>*]:break-inside-avoid">
              {items.map((m) => (
                <MediaCard key={m.id} data={m} />
              ))}
            </div>
            <Pagination page={page} pageCount={pageCount} />
          </>
        ) : (
          <EmptyState
            title="No media found"
            description="Try different filters, or seed the database to load a demo media set."
          />
        )}
      </div>
    </>
  );
}
