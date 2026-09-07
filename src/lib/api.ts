import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AuthenticationError, AuthorizationError } from './rbac';
import { logger } from './logger';
import { rateLimit, clientKey, type RateLimitResult } from './rate-limit';

/** Standard success envelope. */
export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, init);
}

export function created<T>(data: T) {
  return NextResponse.json({ data }, { status: 201 });
}

export function paginated<T>(
  items: T[],
  meta: { total: number; page: number; pageSize: number },
) {
  return NextResponse.json({
    data: items,
    meta: {
      ...meta,
      pageCount: Math.max(1, Math.ceil(meta.total / meta.pageSize)),
    },
  });
}

export function fail(status: number, message: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: { message, ...extra } }, { status });
}

/**
 * Wrap a route handler with consistent error translation. Unknown errors are
 * logged with a reference id and never leak internals to the client.
 */
export function handle(
  fn: (req: Request, ctx: { params: Promise<Record<string, string>> }) => Promise<Response>,
) {
  return async (req: Request, ctx: { params: Promise<Record<string, string>> }) => {
    try {
      return await fn(req, ctx);
    } catch (err) {
      if (err instanceof ZodError) {
        return fail(422, 'Validation failed', {
          issues: err.issues.map((i) => ({
            path: i.path.join('.'),
            message: i.message,
          })),
        });
      }
      if (err instanceof AuthenticationError) return fail(401, err.message);
      if (err instanceof AuthorizationError) return fail(403, err.message);
      if (err instanceof HttpError) return fail(err.status, err.message, err.extra);

      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          return fail(409, 'A record with these unique values already exists');
        }
        if (err.code === 'P2025') return fail(404, 'Resource not found');
      }

      const ref = Math.random().toString(36).slice(2, 10);
      logger.error('Unhandled API error', {
        ref,
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      });
      return fail(500, `Internal server error (ref: ${ref})`);
    }
  };
}

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly extra?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export function notFound(message = 'Resource not found'): never {
  throw new HttpError(404, message);
}

export function badRequest(message: string, extra?: Record<string, unknown>): never {
  throw new HttpError(400, message, extra);
}

/** Enforce a rate limit inside a handler; throws 429 when exceeded. */
export function enforceRateLimit(req: Request, scope: string, opts?: { max?: number }): RateLimitResult {
  const result = rateLimit(clientKey(req, scope), opts);
  if (!result.ok) {
    throw new HttpError(429, 'Too many requests. Please slow down.', {
      retryAfterSeconds: result.retryAfterSeconds,
    });
  }
  return result;
}

/** Parse JSON body defensively. */
export async function readJson<T = unknown>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw new HttpError(400, 'Request body must be valid JSON');
  }
}
