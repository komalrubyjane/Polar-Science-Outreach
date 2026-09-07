'use client';

import * as React from 'react';
import { SmartImage } from './smart-image';
import { cn } from '@/lib/utils';

/**
 * Full-viewport cinematic hero: fixed-feel background image with subtle parallax,
 * a heavy cinematic overlay, film grain, and overlaid content. Renders the
 * `#site-hero-sentinel` element the site header watches to stay transparent.
 */
export function CinematicHero({
  candidates,
  fallback,
  alt,
  children,
  panels,
  align = 'end',
  minH = '100svh',
  overlayClassName,
}: {
  candidates: string[];
  fallback: string;
  alt: string;
  children: React.ReactNode;
  /** Floating glass panels shown over the image (desktop only). */
  panels?: React.ReactNode;
  align?: 'center' | 'end';
  minH?: string;
  overlayClassName?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const imgWrapRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = imgWrapRef.current;
    const host = ref.current;
    if (!el || !host) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = host.getBoundingClientRect();
        const progress = Math.min(1, Math.max(0, -rect.top / rect.height));
        el.style.transform = `translate3d(0, ${progress * 14}%, 0) scale(1.08)`;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={ref}
      className="grain relative isolate -mt-[var(--header-h)] flex w-full flex-col overflow-hidden bg-navy"
      style={{ minHeight: minH }}
    >
      <div
        ref={imgWrapRef}
        className="absolute inset-0 -z-10 will-change-transform"
        style={{ transform: 'scale(1.08)' }}
      >
        <SmartImage
          candidates={candidates}
          fallback={fallback}
          alt={alt}
          priority
          sizes="100vw"
          className="h-full w-full"
        />
      </div>
      <div className={cn('cinematic-overlay absolute inset-0 -z-10', overlayClassName)} aria-hidden />

      {panels ? (
        <div className="pointer-events-none absolute right-8 top-1/2 z-10 hidden -translate-y-1/2 flex-col items-end gap-3 xl:flex">
          {panels}
        </div>
      ) : null}

      <div
        className={cn(
          'editorial relative flex flex-1 flex-col pb-16 pt-[calc(var(--header-h)+2rem)] text-white sm:pb-20',
          align === 'center' ? 'justify-center' : 'justify-end',
        )}
      >
        {children}
      </div>

      <div id="site-hero-sentinel" className="pointer-events-none absolute bottom-24 h-px w-px" aria-hidden />
    </section>
  );
}
