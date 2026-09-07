'use client';

import * as React from 'react';
import Image, { type ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

type BaseProps = Omit<ImageProps, 'src' | 'alt' | 'onError'>;

export interface SmartImageProps extends BaseProps {
  /** Ordered candidate URLs; the first that loads is shown. */
  candidates: string[];
  alt: string;
  /** CSS background (gradient) shown while loading and if every candidate fails. */
  fallback?: string;
  /** Wrapper className (the image itself fills it via `fill`). */
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  sizes?: string;
}

/**
 * Cinematic image with a graceful fallback chain:
 *   candidate[0] → candidate[1] → … → gradient fallback.
 * Never renders a broken image. Uses `next/image` with `fill`, so the parent
 * must be positioned and sized (aspect ratio recommended) to avoid layout shift.
 */
export function SmartImage({
  candidates,
  alt,
  fallback = 'linear-gradient(135deg,#061D31 0%,#183B56 100%)',
  className,
  imgClassName,
  priority,
  sizes = '100vw',
  ...rest
}: SmartImageProps) {
  const list = candidates.filter(Boolean);
  const [idx, setIdx] = React.useState(0);
  const [loaded, setLoaded] = React.useState(false);
  const exhausted = idx >= list.length;

  return (
    <span
      className={cn('relative block h-full w-full overflow-hidden bg-surface-muted', className)}
      style={{ backgroundImage: fallback, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      {!exhausted ? (
        <Image
          key={list[idx]}
          src={list[idx]!}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className={cn(
            'object-cover transition-opacity duration-700 ease-editorial',
            loaded ? 'opacity-100' : 'opacity-0',
            imgClassName,
          )}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setLoaded(false);
            setIdx((i) => i + 1);
          }}
          {...rest}
        />
      ) : null}
    </span>
  );
}
