'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

function sessionId(): string {
  try {
    let id = sessionStorage.getItem('psp.sid');
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem('psp.sid', id);
    }
    return id;
  } catch {
    return 'anon';
  }
}

/** Fire-and-forget page-view beacon. Respects the analytics opt-out cookie server-side. */
export function AnalyticsTracker() {
  const pathname = usePathname();
  useEffect(() => {
    const payload = JSON.stringify({
      type: 'page_view',
      path: pathname,
      sessionId: sessionId(),
      referrer: document.referrer || undefined,
    });
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => undefined);
  }, [pathname]);
  return null;
}
