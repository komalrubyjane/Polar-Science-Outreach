import Link from 'next/link';
import { Snowflake } from 'lucide-react';
import { FOOTER_NAV, SITE } from '@/lib/constants';
import { NewsletterForm } from '@/components/newsletter-form';

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="container-page py-12">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Snowflake className="h-6 w-6 text-accent" />
              <span className="font-display text-base font-semibold">{SITE.name}</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              A dissemination platform for polar science. Content is curated from many
              producers; each record carries its own source and licence.
            </p>
            <div className="mt-5 max-w-xs">
              <NewsletterForm compact source="footer" />
            </div>
          </div>

          {FOOTER_NAV.map((col) => (
            <div key={col.heading}>
              <h3 className="text-sm font-semibold">{col.heading}</h3>
              <ul className="mt-3 space-y-2">
                {col.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {year} {SITE.name}. Demonstration platform — institutions, researchers and some
            datasets are fictional and clearly labelled.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/about/privacy" className="hover:text-foreground hover:underline">
              Privacy
            </Link>
            <Link href="/about/terms" className="hover:text-foreground hover:underline">
              Terms
            </Link>
            <Link href="/about/accessibility" className="hover:text-foreground hover:underline">
              Accessibility
            </Link>
            <Link href="/about/data-policy" className="hover:text-foreground hover:underline">
              Data Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
