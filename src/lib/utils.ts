import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** URL-safe slug from arbitrary text. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 80);
}

/** Deterministic slug with a short random suffix to avoid collisions. */
export function uniqueSlug(input: string): string {
  const base = slugify(input) || 'item';
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base}-${suffix}`;
}

export function formatDate(
  date: Date | string | null | undefined,
  opts: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('en-GB', opts).format(d);
}

export function formatDateTime(date: Date | string | null | undefined): string {
  return formatDate(date, { dateStyle: 'medium', timeStyle: 'short' });
}

export function formatNumber(n: number | null | undefined): string {
  if (n == null) return '0';
  return new Intl.NumberFormat('en-GB').format(n);
}

export function truncate(text: string, max = 160): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

/** Convert an ENUM_VALUE into "Enum value" for display. */
export function humanizeEnum(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((w, i) => (i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ');
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

/** Parse a pagination query into safe numbers. */
export function parsePagination(
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>,
  { defaultPageSize = 12, maxPageSize = 100 } = {},
): { page: number; pageSize: number; skip: number } {
  const get = (k: string): string | undefined => {
    if (searchParams instanceof URLSearchParams) return searchParams.get(k) ?? undefined;
    const v = searchParams[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const page = Math.max(1, Number.parseInt(get('page') ?? '1', 10) || 1);
  const pageSize = clamp(
    Number.parseInt(get('pageSize') ?? String(defaultPageSize), 10) || defaultPageSize,
    1,
    maxPageSize,
  );
  return { page, pageSize, skip: (page - 1) * pageSize };
}

export function absoluteUrl(path: string): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
