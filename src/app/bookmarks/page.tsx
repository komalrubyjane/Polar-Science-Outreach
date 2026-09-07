import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { safe } from '@/lib/safe';
import { getCurrentUser } from '@/lib/auth/session';
import { PageHero } from '@/components/content/page-hero';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/misc';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = { title: 'Your bookmarks' };
export const dynamic = 'force-dynamic';

const TYPES = [
  { key: 'RESEARCH', label: 'Research', base: '/repository', model: 'research' as const },
  { key: 'DATASET', label: 'Datasets', base: '/data', model: 'dataset' as const },
  { key: 'MEDIA', label: 'Media', base: '/media', model: 'media' as const },
  { key: 'NEWS', label: 'News', base: '/news', model: 'newsArticle' as const },
  { key: 'EDUCATION', label: 'Education', base: '/education', model: 'educationResource' as const },
  { key: 'EXPEDITION', label: 'Expeditions', base: '/expeditions', model: 'expedition' as const },
];

export default async function BookmarksPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?callbackUrl=/bookmarks');

  const bookmarks = await safe(
    () =>
      prisma.bookmark.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      }),
    [],
    'bookmarksList',
  );

  const resolved: Record<
    string,
    { id: string; slug: string; title: string; createdAt: Date }[]
  > = {};

  for (const t of TYPES) {
    const ids = bookmarks.filter((b) => b.entityType === t.key).map((b) => b.entityId);
    if (ids.length === 0) {
      resolved[t.key] = [];
      continue;
    }
    const rows = await safe(
      () =>
        // @ts-expect-error dynamic delegate access
        prisma[t.model].findMany({
          where: { id: { in: ids } },
          select: { id: true, slug: true, title: true, name: true },
        }) as Promise<{ id: string; slug: string; title?: string; name?: string }[]>,
      [],
      `bookmarks.${t.model}`,
    );
    const map = new Map(bookmarks.map((b) => [b.entityId, b.createdAt]));
    resolved[t.key] = rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title ?? r.name ?? 'Untitled',
      createdAt: map.get(r.id) ?? new Date(),
    }));
  }

  const total = bookmarks.length;

  return (
    <>
      <PageHero
        eyebrow="Account"
        title="Your bookmarks"
        description={`${total} saved ${total === 1 ? 'item' : 'items'} across the portal.`}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Bookmarks' }]}
      />
      <div className="container-page py-10">
        {total === 0 ? (
          <EmptyState
            title="No bookmarks yet"
            description="Use the Save button on any research record, dataset, media item, article, education resource or expedition."
          />
        ) : (
          <Tabs defaultValue={TYPES.find((t) => resolved[t.key]?.length)?.key ?? 'RESEARCH'}>
            <TabsList className="flex-wrap">
              {TYPES.map((t) => (
                <TabsTrigger key={t.key} value={t.key}>
                  {t.label} ({resolved[t.key]?.length ?? 0})
                </TabsTrigger>
              ))}
            </TabsList>
            {TYPES.map((t) => (
              <TabsContent key={t.key} value={t.key}>
                {resolved[t.key]?.length ? (
                  <ul className="divide-y divide-border rounded-xl border border-border bg-card">
                    {resolved[t.key]!.map((i) => (
                      <li
                        key={i.id}
                        className="flex items-center justify-between px-4 py-3"
                      >
                        <Link href={`${t.base}/${i.slug}`} className="font-medium hover:text-accent">
                          {i.title}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          saved {formatDate(i.createdAt)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Nothing saved in this category.</p>
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </>
  );
}
