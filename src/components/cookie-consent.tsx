'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const KEY = 'psp.consent.v1';

/**
 * Minimal consent banner. The portal only stores a first-party analytics
 * preference; no third-party trackers are loaded. Choice is kept in
 * localStorage and mirrored to a cookie so the server can honour opt-out.
 */
export function CookieConsent() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setVisible(true);
    } catch {
      /* storage blocked — do not nag */
    }
  }, []);

  const decide = (analytics: boolean) => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ analytics, at: Date.now() }));
      document.cookie = `psp_analytics=${analytics ? '1' : '0'}; path=/; max-age=15552000; samesite=lax`;
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] border-t border-border bg-card/95 p-4 backdrop-blur">
      <div className="container-page flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          We use a single first-party cookie for anonymous usage analytics to improve the
          portal. No third-party trackers.{' '}
          <Link href="/about/privacy" className="text-accent hover:underline">
            Privacy policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={() => decide(false)}>
            Decline analytics
          </Button>
          <Button size="sm" onClick={() => decide(true)}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
