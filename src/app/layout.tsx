import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk, Instrument_Serif } from 'next/font/google';
import './globals.css';
import { SITE } from '@/lib/constants';
import { env } from '@/lib/env';
import { Providers } from '@/components/providers';
import { SiteHeader } from '@/components/navigation/site-header';
import { SiteFooter } from '@/components/navigation/site-footer';
import { Toaster } from '@/components/ui/toaster';
import { CookieConsent } from '@/components/cookie-consent';
import { AnalyticsTracker } from '@/components/analytics-tracker';
import { Suspense } from 'react';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});
const display = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});
const serif = Instrument_Serif({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  weight: '400',
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    'polar science',
    'Arctic',
    'Antarctic',
    'sea ice',
    'glaciology',
    'climate',
    'polar research',
    'science outreach',
  ],
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    url: env.NEXT_PUBLIC_APP_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#1E272E' },
  ],
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'dark light',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${display.variable} ${serif.variable}`}
    >
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        <Providers>
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <div className="flex min-h-dvh flex-col">
            <SiteHeader />
            <main id="main-content" className="flex-1 pt-[var(--header-h)]">
              {children}
            </main>
            <SiteFooter />
          </div>
          <Toaster />
          <CookieConsent />
          <Suspense fallback={null}>
            <AnalyticsTracker />
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
