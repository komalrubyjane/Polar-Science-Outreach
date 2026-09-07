import { describe, it, expect } from 'vitest';
import { rateLimit } from '@/lib/rate-limit';

describe('rateLimit', () => {
  it('allows requests up to the limit then blocks', () => {
    const id = `test-${Math.random()}`;
    const opts = { max: 3, windowSeconds: 60 };
    expect(rateLimit(id, opts).ok).toBe(true);
    expect(rateLimit(id, opts).ok).toBe(true);
    expect(rateLimit(id, opts).ok).toBe(true);
    const blocked = rateLimit(id, opts);
    expect(blocked.ok).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('tracks separate identifiers independently', () => {
    const a = `a-${Math.random()}`;
    const b = `b-${Math.random()}`;
    const opts = { max: 1, windowSeconds: 60 };
    expect(rateLimit(a, opts).ok).toBe(true);
    expect(rateLimit(b, opts).ok).toBe(true);
    expect(rateLimit(a, opts).ok).toBe(false);
  });

  it('reports decreasing remaining allowance', () => {
    const id = `rem-${Math.random()}`;
    const opts = { max: 5, windowSeconds: 60 };
    expect(rateLimit(id, opts).remaining).toBe(4);
    expect(rateLimit(id, opts).remaining).toBe(3);
  });
});
