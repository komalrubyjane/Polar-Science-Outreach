import Link from 'next/link';
import { FOOTER_NAV, SITE } from '@/lib/constants';
import { NewsletterForm } from '@/components/newsletter-form';

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative border-t border-polar-navy/10 bg-polar-glacier text-polar-navy">
      {/* soft transition from the last page section into the footer */}
      <div
        className="pointer-events-none absolute inset-x-0 -top-24 h-24 bg-gradient-to-b from-transparent to-polar-glacier"
        aria-hidden
      />
      <div className="editorial py-20 sm:py-28">
        <p className="display-2 max-w-5xl text-balance text-polar-navy">
          Understanding the poles
          <br />
          <span className="text-polar-ocean">means understanding our planet.</span>
        </p>

        <div className="mt-16 grid gap-12 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
          <div>
            <p className="metadata text-polar-navy/60">The Newsletter</p>
            <p className="mt-3 max-w-xs text-sm text-polar-navy/70">
              New research, data releases, expeditions and events — monthly. Double opt-in,
              unsubscribe anytime.
            </p>
            <div className="mt-5 max-w-sm [&_input]:border-polar-navy/20 [&_input]:bg-white [&_input]:text-polar-navy [&_input]:placeholder:text-polar-navy/40 [&_button]:bg-polar-ocean [&_button]:text-white [&_button]:hover:bg-polar-navy">
              <NewsletterForm compact source="footer" />
            </div>
          </div>

          {FOOTER_NAV.map((col) => (
            <div key={col.heading}>
              <p className="metadata text-polar-navy/60">{col.heading}</p>
              <ul className="mt-4 space-y-2.5">
                {col.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="link-reveal text-sm text-polar-navy/80 transition-colors hover:text-polar-navy"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 h-px w-full bg-polar-navy/15" />

        <div className="mt-6 flex flex-col gap-4 text-xs text-polar-navy/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {SITE.name}. A dissemination platform — demonstration institutions,
            researcher profiles and datasets are fictional and clearly labelled. Imagery via
            Unsplash.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            <Link href="/about/privacy" className="hover:text-polar-navy">
              Privacy
            </Link>
            <Link href="/about/terms" className="hover:text-polar-navy">
              Terms
            </Link>
            <Link href="/about/accessibility" className="hover:text-polar-navy">
              Accessibility
            </Link>
            <Link href="/about/data-policy" className="hover:text-polar-navy">
              Data Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
