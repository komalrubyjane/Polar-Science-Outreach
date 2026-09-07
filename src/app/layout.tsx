import type { Metadata, Viewport } from 'next';
import { Inter, Sora } from 'next/font/google';
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

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const sora = Sora({ subsets: ['latin'], variable: '--font-display', display: 'swap' });

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
    { media: '(prefers-color-scheme: light)', color: '#0b1f3a' },
    { media: '(prefers-color-scheme: dark)', color: '#0a1a2a' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${sora.variable}`}>
      <body className="min-h-dvh font-sans">
        <Providers>
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <div className="flex min-h-dvh flex-col">
            <SiteHeader />
            <main id="main-content" className="flex-1">
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
