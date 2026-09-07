import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { safe } from '@/lib/safe';
import { PageHero } from '@/components/content/page-hero';
import { FilterBar } from '@/components/content/filter-bar';
import { EventCard } from '@/components/content/cards';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/misc';
import { demoFallback, demoEvents } from '@/lib/demo-data';
import { pageArgs, textWhere } from '@/lib/services/list-helpers';
import { EVENT_TYPE_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Events',
  description:
    'Polar science conferences, webinars, workshops, school programmes, exhibitions and public lectures. Browse upcoming and past events.',
};

export const dynamic = 'force-dynamic';

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const get = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : (sp[k] as string | undefined));
  const page = Number(get('page') ?? '1') || 1;
  const when = get('when') ?? 'upcoming';
  const { skip, take, pageSize } = pageArgs(page, 12);

  const where = {
    status: 'PUBLISHED' as const,
    ...(get('type') ? { type: get('type') as never } : {}),
    ...(when === 'past'
      ? { startAt: { lt: new Date() } }
      : when === 'upcoming'
        ? { startAt: { gte: new Date() } }
        : {}),
    ...(textWhere(get('q'), ['title', 'description', 'organizer', 'locationName']) ?? {}),
  };

  const [items, total] = await Promise.all([
    safe(
      () =>
        prisma.event.findMany({
          where,
          skip,
          take,
          orderBy: { startAt: when === 'past' ? 'desc' : 'asc' },
        }),
      [],
      'eventsList',
    ),
    safe(() => prisma.event.count({ where }), 0, 'eventsCount'),
  ]);
  const active = Boolean(get('q') || get('type') || get('when') || page > 1);
  const { items: shown, isDemo } = demoFallback(items, demoEvents, { active });
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  const grouped = new Map<string, typeof items>();
  for (const e of items) {
    const key = formatDate(e.startAt, { month: 'long', year: 'numeric' });
    const list = grouped.get(key) ?? [];
    list.push(e);
    grouped.set(key, list);
  }

  return (
    <>
      <PageHero
        imageSlot="events"
        eyebrow="Events"
        title="Polar science events"
        description="Conferences, webinars, workshops, school programmes, exhibitions and public lectures from across the polar community."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Events' }]}
      />
      <div className="container-page py-10">
        <FilterBar
          searchPlaceholder="Search events…"
          sortParam="when"
          sortOptions={[
            { value: 'upcoming', label: 'Upcoming' },
            { value: 'past', label: 'Past' },
            { value: 'all', label: 'All dates' },
          ]}
          fields={[
            {
              key: 'type',
              label: 'Event type',
              options: Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => ({ value, label })),
            },
          ]}
        />

        {shown.length ? (
          <>
            {[...grouped.entries()].map(([month, list]) => (
              <section key={month} className="mb-10">
                <h2 className="mb-4 font-display text-lg font-semibold text-muted-foreground">
                  {month}
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {list.map((e) => (
                    <EventCard key={e.id} data={e} />
                  ))}
                </div>
              </section>
            ))}
            {!isDemo ? <Pagination page={page} pageCount={pageCount} /> : null}
          </>
        ) : (
          <EmptyState
            title={when === 'past' ? 'No past events' : 'No upcoming events'}
            description="Seed the database to load demo events, or check back later."
          />
        )}
      </div>
    </>
  );
}
