import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { safe } from '@/lib/safe';
import { PageHero } from '@/components/content/page-hero';
import { EmptyState } from '@/components/ui/misc';
import { GlossaryBrowser } from '@/components/glossary/glossary-browser';

export const metadata: Metadata = {
  title: 'Polar Glossary',
  description:
    'Plain-language definitions of polar science terms — from albedo to zooplankton — with alphabetical browsing and search.',
};

export const revalidate = 600;

export default async function GlossaryPage() {
  const terms = await safe(
    () =>
      prisma.glossaryTerm.findMany({
        orderBy: { term: 'asc' },
        include: { topic: { select: { name: true, slug: true } } },
      }),
    [],
    'glossary',
  );

  return (
    <>
      <PageHero
        imageSlot="glossary"
        eyebrow="Reference"
        title="Polar science glossary"
        description="Definitions written to be understandable without a science background. Many terms link to a related topic in the explorer."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Glossary' }]}
      />
      <div className="container-page py-10">
        {terms.length ? (
          <GlossaryBrowser terms={terms} />
        ) : (
          <EmptyState
            title="The glossary is empty"
            description="Run `npm run db:seed` to load an initial set of polar science terms."
          />
        )}
      </div>
    </>
  );
}
