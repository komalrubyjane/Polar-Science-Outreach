'use client';

/**
 * Route-change template. Next re-mounts this on every navigation, so the
 * `.page-enter` class replays a short fade-and-rise for each new page.
 * Motion is CSS-only and disabled under `prefers-reduced-motion` (see
 * globals.css). No JS, no layout cost.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
