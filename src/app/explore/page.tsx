import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { safe } from '@/lib/safe';
import { PageHero } from '@/components/content/page-hero';
import { TopicCard } from '@/components/content/cards';
import { EmptyState } from '@/components/ui/misc';
import { EXPLORER_CATEGORIES, DISCIPLINE_LABELS } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Explore Polar Science',
  description:
    'Browse polar science by theme: climate & atmosphere, ice & glaciers, ocean, biodiversity, geology, human dimensions and polar technology.',
};

export const revalidate = 600;

export default async function ExplorePage() {
  const topics = await safe(
    () =>
      prisma.topic.findMany({
        orderBy: { name: 'asc' },
        include: {
          _count: { select: { research: true, media: true } },
        },
      }),
    [],
    'exploreTopics',
  );

  const byCategory = new Map<string, typeof topics>();
  for (const t of topics) {
    const list = byCategory.get(t.category) ?? [];
    list.push(t);
    byCategory.set(t.category, list);
  }

  return (
    <>
      <PageHero
        imageSlot="region-antarctic"
        eyebrow="Explore Polar Science"
        title="Polar science, by theme"
        description="Seven thematic areas, each gathering overviews, key concepts, research, data, media and educational resources. Start with a theme, then follow the links into the repository and media library."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Explore' }]}
      />

      <div className="container-page py-10">
        {topics.length === 0 ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {EXPLORER_CATEGORIES.map((c) => (
                <div key={c.slug} className="rounded-xl border border-border bg-card p-6">
                  <h2 className="font-display text-lg font-semibold">{c.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{c.blurb}</p>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {c.topics.map((slug) => (
                      <li
                        key={slug}
                        className="rounded-full border border-dashed border-border px-2.5 py-0.5 text-xs text-muted-foreground"
                      >
                        {slug.replace(/-/g, ' ')}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <EmptyState
                title="Topics not seeded yet"
                description="Run `npm run db:seed` to populate the topic tree. The structure above shows what will be created."
              />
            </div>
          </>
        ) : (
          <div className="space-y-12">
            {[...byCategory.entries()].map(([category, list]) => (
              <section key={category}>
                <h2 className="mb-4 font-display text-xl font-semibold">{category}</h2>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((t) => (
                    <TopicCard key={t.id} data={t} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        <section className="mt-14 rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold">Browse the repository by discipline</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(DISCIPLINE_LABELS).map(([key, label]) => (
              <Link
                key={key}
                href={`/repository?discipline=${key}`}
                className="rounded-full border border-border px-3 py-1 text-sm hover:border-accent hover:text-accent"
              >
                {label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
