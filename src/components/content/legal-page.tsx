import { PageHero } from '@/components/content/page-hero';

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <PageHero
        eyebrow="About"
        title={title}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'About', href: '/about' },
          { label: title },
        ]}
      />
      <div className="container-page max-w-3xl py-10">
        {updated ? (
          <p className="mb-6 text-sm text-muted-foreground">Last updated: {updated}</p>
        ) : null}
        <div className="prose-polar">{children}</div>
      </div>
    </>
  );
}
