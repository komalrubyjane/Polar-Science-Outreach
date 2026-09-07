import Link from 'next/link';
import { FOOTER_NAV, SITE } from '@/lib/constants';
import { NewsletterForm } from '@/components/newsletter-form';

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative bg-polar-night text-polar-text-light">
      {/* soft transition from the last page section into the dark footer */}
      <div
        className="pointer-events-none absolute inset-x-0 -top-24 h-24 bg-gradient-to-b from-transparent to-polar-night"
        aria-hidden
      />
      <div className="editorial py-20 sm:py-28">
        <p className="display-2 max-w-5xl text-balance text-white">
          Understanding the poles
          <br />
          <span className="text-polar-glacier">means understanding our planet.</span>
        </p>

        <div className="mt-16 grid gap-12 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
          <div>
            <p className="metadata text-polar-text-muted">The Newsletter</p>
            <p className="mt-3 max-w-xs text-sm text-polar-text-muted">
              New research, data releases, expeditions and events — monthly. Double opt-in,
              unsubscribe anytime.
            </p>
            <div className="mt-5 max-w-sm [&_input]:border-white/25 [&_input]:bg-white/5 [&_input]:text-white [&_input]:placeholder:text-white/40 [&_button]:bg-white [&_button]:text-polar-navy [&_button]:hover:bg-polar-glacier">
              <NewsletterForm compact source="footer" />
            </div>
          </div>

          {FOOTER_NAV.map((col) => (
            <div key={col.heading}>
              <p className="metadata text-polar-text-muted">{col.heading}</p>
              <ul className="mt-4 space-y-2.5">
                {col.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="link-reveal text-sm text-polar-pale-ice transition-colors hover:text-white"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 h-px w-full bg-white/[0.14]" />

        <div className="mt-6 flex flex-col gap-4 text-xs text-polar-text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {SITE.name}. A dissemination platform — demonstration institutions,
            researcher profiles and datasets are fictional and clearly labelled. Imagery via
            Unsplash.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            <Link href="/about/privacy" className="hover:text-white">
              Privacy
            </Link>
            <Link href="/about/terms" className="hover:text-white">
              Terms
            </Link>
            <Link href="/about/accessibility" className="hover:text-white">
              Accessibility
            </Link>
            <Link href="/about/data-policy" className="hover:text-white">
              Data Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
