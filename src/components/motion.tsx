'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ hook */

function useInView<T extends Element>(once = true) {
  const ref = React.useRef<T | null>(null);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          if (once) obs.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [once]);

  return { ref, inView };
}

/* ------------------------------------------------------------------ Reveal */

export function Reveal({
  children,
  className,
  as: Tag = 'div',
  delay = 0,
  variant = 'up',
}: {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  delay?: number;
  variant?: 'up' | 'clip' | 'fade';
}) {
  const { ref, inView } = useInView<HTMLElement>();
  return (
    <Tag
      ref={ref as never}
      className={cn(
        variant === 'clip' ? 'will-reveal clip-reveal' : 'will-reveal',
        variant === 'fade' && '[transform:none!important]',
        inView && 'is-revealed',
        className,
      )}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}

export const FadeIn = Reveal;

/* ------------------------------------------------------------------ Stagger */

export function Stagger({
  children,
  className,
  step = 70,
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  step?: number;
  as?: React.ElementType;
}) {
  const items = React.Children.toArray(children);
  return (
    <Tag className={className}>
      {items.map((child, i) => (
        <Reveal key={i} delay={i * step}>
          {child}
        </Reveal>
      ))}
    </Tag>
  );
}

/* ------------------------------------------------------------------ AnimatedNumber */

export function AnimatedNumber({
  value,
  duration = 1100,
  suffix = '',
  prefix = '',
  decimals = 0,
  className,
}: {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLSpanElement>();
  const [display, setDisplay] = React.useState(0);
  const reduced = React.useRef(false);

  React.useEffect(() => {
    reduced.current =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  React.useEffect(() => {
    if (!inView) return;
    if (reduced.current) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(value * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {prefix}
      {display.toLocaleString('en-GB', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ ParallaxImage wrapper */

export function Parallax({
  children,
  amount = 12,
  className,
}: {
  children: React.ReactNode;
  amount?: number;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
        el.style.setProperty('--py', `${(-p * amount).toFixed(2)}%`);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [amount]);

  return (
    <div ref={ref} className={cn('[&>*]:will-change-transform', className)}>
      <div style={{ transform: 'translate3d(0,var(--py,0),0)' }} className="h-full w-full">
        {children}
      </div>
    </div>
  );
}
