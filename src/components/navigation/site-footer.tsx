import Link from 'next/link';
import { FOOTER_NAV, SITE } from '@/lib/constants';
import { NewsletterForm } from '@/components/newsletter-form';
import { Hairline } from '@/components/editorial/primitives';

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-surface">
      <div className="editorial py-20 sm:py-28">
        <p className="display-2 max-w-5xl text-balance">
          Understanding the poles
          <br />
          <span className="text-muted-foreground">means understanding our planet.</span>
        </p>

        <div className="mt-16 grid gap-12 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
          <div>
            <p className="metadata">The Newsletter</p>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              New research, data releases, expeditions and events — monthly. Double opt-in,
              unsubscribe anytime.
            </p>
            <div className="mt-5 max-w-sm">
              <NewsletterForm compact source="footer" />
            </div>
          </div>

          {FOOTER_NAV.map((col) => (
            <div key={col.heading}>
              <p className="metadata">{col.heading}</p>
              <ul className="mt-4 space-y-2.5">
                {col.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="link-reveal text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Hairline className="mt-16" />

        <div className="mt-6 flex flex-col gap-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {SITE.name}. A dissemination platform — demonstration institutions,
            researcher profiles and datasets are fictional and clearly labelled. Imagery via
            Unsplash.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            <Link href="/about/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/about/terms" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="/about/accessibility" className="hover:text-foreground">
              Accessibility
            </Link>
            <Link href="/about/data-policy" className="hover:text-foreground">
              Data Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
