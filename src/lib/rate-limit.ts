import { env } from './env';

/**
 * In-memory fixed-window rate limiter.
 *
 * Adequate for a single-instance deployment and for local development. For
 * horizontally-scaled production, swap the `store` implementation for Redis
 * (Upstash / ioredis) — the `rateLimit` signature stays the same.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const store = new Map<string, Bucket>();

// Opportunistic cleanup so the map does not grow unbounded.
let lastSweep = Date.now();
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of store) {
    if (bucket.resetAt <= now) store.delete(key);
  }
}

export interface RateLimitResult {
  ok: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}

export function rateLimit(
  identifier: string,
  {
    max = env.RATE_LIMIT_MAX,
    windowSeconds = env.RATE_LIMIT_WINDOW_SECONDS,
  }: { max?: number; windowSeconds?: number } = {},
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const windowMs = windowSeconds * 1000;
  const existing = store.get(identifier);

  if (!existing || existing.resetAt <= now) {
    const bucket: Bucket = { count: 1, resetAt: now + windowMs };
    store.set(identifier, bucket);
    return {
      ok: true,
      limit: max,
      remaining: max - 1,
      resetAt: bucket.resetAt,
      retryAfterSeconds: 0,
    };
  }

  existing.count += 1;
  const remaining = Math.max(0, max - existing.count);
  const ok = existing.count <= max;
  return {
    ok,
    limit: max,
    remaining,
    resetAt: existing.resetAt,
    retryAfterSeconds: ok ? 0 : Math.ceil((existing.resetAt - now) / 1000),
  };
}

/** Extract a best-effort client identifier from a request. */
export function clientKey(req: Request, scope = 'global'): string {
  const fwd = req.headers.get('x-forwarded-for');
  const ip = fwd?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
  return `${scope}:${ip}`;
}
