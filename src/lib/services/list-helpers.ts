import 'server-only';

export function pageArgs(page = 1, pageSize = 12) {
  const p = Math.max(1, Math.floor(page) || 1);
  const s = Math.min(100, Math.max(1, Math.floor(pageSize) || 12));
  return { skip: (p - 1) * s, take: s, page: p, pageSize: s };
}

export function pageCount(total: number, pageSize: number) {
  return Math.max(1, Math.ceil(total / pageSize));
}

export const ilike = (q: string) => ({ contains: q.trim(), mode: 'insensitive' as const });

export function textWhere(q: string | undefined | null, fields: string[]) {
  if (!q || q.trim().length < 2) return undefined;
  return { OR: fields.map((f) => ({ [f]: ilike(q) })) };
}
