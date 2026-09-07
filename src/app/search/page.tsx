import type { Metadata } from 'next';
import Link from 'next/link';
import { safe } from '@/lib/safe';
import { globalSearch, type GlobalSearchGroup } from '@/lib/search';
import { track } from '@/lib/analytics';
import { PageHero } from '@/components/content/page-hero';
import { EmptyState } from '@/components/ui/misc';
import { truncate } from '@/lib/utils';

export const metadata: Metadata = { title: 'Search' };
export const dynamic = 'force-dynamic';

const GROUP_LABELS: Record<GlobalSearchGroup, string> = {
  research: 'Research',
  datasets: 'Datasets',
  media: 'Media',
  news: 'News',
  events: 'Events',
  education: 'Education',
  researchers: 'Researchers',
  institutions: 'Institutions',
  glossary: 'Glossary',
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = '' } = await searchParams;
  const query = q.trim();

  const result = query
    ? await safe(() => globalSearch(query, 12), null, 'globalSearchPage')
    : null;

  if (query) void track({ type: 'search', query, path: '/search' });

  return (
    <>
      <PageHero
        eyebrow="Search"
        title={query ? `Results for “${query}”` : 'Search the portal'}
        description={
          result
            ? `${result.total} result${result.total === 1 ? '' : 's'} across research, data, media, events, education, people and the glossary.`
            : 'Enter a query in the header search (⌘K) to search the whole platform.'
        }
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Search' }]}
      />
      <div className="container-page py-10">
        {!query ? (
          <EmptyState title="No query" description="Use the search box in the header to begin." />
        ) : !result || result.total === 0 ? (
          <EmptyState
            title={`Nothing found for “${query}”`}
            description="Try different or broader keywords."
          />
        ) : (
          <div className="space-y-10">
            {(Object.keys(result.groups) as GlobalSearchGroup[])
              .filter((g) => result.groups[g].length > 0)
              .map((g) => (
                <section key={g}>
                  <h2 className="mb-3 font-display text-xl font-semibold">
                    {GROUP_LABELS[g]}{' '}
                    <span className="text-sm font-normal text-muted-foreground">
                      ({result.groups[g].length})
                    </span>
                  </h2>
                  <ul className="divide-y divide-border rounded-xl border border-border bg-card">
                    {result.groups[g].map((hit) => (
                      <li key={hit.id}>
                        <Link href={hit.href} className="block px-4 py-3 hover:bg-secondary">
                          <p className="font-medium">{hit.title}</p>
                          {hit.description ? (
                            <p className="text-sm text-muted-foreground">
                              {truncate(hit.description, 160)}
                            </p>
                          ) : null}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            {query.length >= 2 ? (
              <p className="text-sm text-muted-foreground">
                Looking for papers specifically?{' '}
                <Link
                  href={`/repository?q=${encodeURIComponent(query)}`}
                  className="text-accent hover:underline"
                >
                  Search the full repository →
                </Link>
              </p>
            ) : null}
          </div>
        )}
      </div>
    </>
  );
}
