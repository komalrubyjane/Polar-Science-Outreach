import type { z } from 'zod';
import { prisma } from '@/lib/db';
import { handle, paginated, created, ok, fail, readJson, enforceRateLimit } from '@/lib/api';
import { getCurrentUser, requirePermission } from '@/lib/auth/session';
import { can, type Permission } from '@/lib/rbac';
import { pageArgs, textWhere } from '@/lib/services/list-helpers';
import { uniqueSlug } from '@/lib/utils';
import { recordAudit } from '@/lib/audit';

type PrismaDelegateName =
  | 'media'
  | 'event'
  | 'newsArticle'
  | 'educationResource'
  | 'expedition'
  | 'topic'
  | 'glossaryTerm'
  | 'researcher'
  | 'institution';

interface RestConfig<S extends z.ZodTypeAny> {
  model: PrismaDelegateName;
  entityName: string;
  createSchema: S;
  updateSchema: z.ZodTypeAny;
  managePermission: Permission;
  /** Field used to build the slug (default: title). */
  titleField?: string;
  searchFields: string[];
  /** Whitelisted equality filters read from the query string. */
  filters?: string[];
  listInclude?: unknown;
  detailInclude?: unknown;
  /** If true, non-editors only ever see PUBLISHED rows. */
  publishGate?: boolean;
  /** Map validated input → Prisma data (minus slug). */
  toCreateData: (input: z.infer<S>, userId: string) => Record<string, unknown>;
  toUpdateData: (input: Record<string, unknown>) => Record<string, unknown>;
}

function delegate(name: PrismaDelegateName) {
  return prisma[name] as unknown as {
    findMany: (a: unknown) => Promise<unknown[]>;
    count: (a: unknown) => Promise<number>;
    findFirst: (a: unknown) => Promise<unknown>;
    create: (a: unknown) => Promise<{ id: string }>;
    update: (a: unknown) => Promise<{ id: string }>;
    delete: (a: unknown) => Promise<unknown>;
  };
}

export function makeRestCollection<S extends z.ZodTypeAny>(cfg: RestConfig<S>) {
  const GET = handle(async (req) => {
    const p = new URL(req.url).searchParams;
    const { skip, take, page, pageSize } = pageArgs(
      Number(p.get('page') ?? 1),
      Number(p.get('pageSize') ?? 12),
    );
    const user = await getCurrentUser();
    const seeAll = p.get('all') === 'true' && can(user?.role, 'content:review');

    const where: Record<string, unknown> = {};
    if (cfg.publishGate && !seeAll) where.status = 'PUBLISHED';
    for (const f of cfg.filters ?? []) {
      const v = p.get(f);
      if (v) where[f] = v;
    }
    const search = textWhere(p.get('q'), cfg.searchFields);
    if (search) Object.assign(where, search);

    const d = delegate(cfg.model);
    const [items, total] = await Promise.all([
      d.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: cfg.listInclude }),
      d.count({ where }),
    ]);
    return paginated(items, { total, page, pageSize });
  });

  const POST = handle(async (req) => {
    const user = await requirePermission(cfg.managePermission);
    enforceRateLimit(req, `${cfg.model}-create:${user.id}`, { max: 40 });
    const input = cfg.createSchema.parse(await readJson(req)) as z.infer<S>;
    const titleValue = String(
      (input as Record<string, unknown>)[cfg.titleField ?? 'title'] ?? cfg.entityName,
    );
    const row = await delegate(cfg.model).create({
      data: { slug: uniqueSlug(titleValue), ...cfg.toCreateData(input, user.id) },
      include: cfg.detailInclude,
    });
    await recordAudit({
      actorId: user.id,
      action: `${cfg.model}.create`,
      entityType: cfg.entityName,
      entityId: row.id,
      req,
    });
    return created(row);
  });

  return { GET, POST };
}

export function makeRestItem<S extends z.ZodTypeAny>(cfg: RestConfig<S>) {
  const GET = handle(async (_req, ctx) => {
    const { id } = await ctx.params;
    const row = (await delegate(cfg.model).findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: cfg.detailInclude,
    })) as { status?: string } | null;
    if (!row) return fail(404, `${cfg.entityName} not found`);
    if (cfg.publishGate && row.status && row.status !== 'PUBLISHED') {
      const user = await getCurrentUser();
      if (!can(user?.role, 'content:review')) return fail(404, `${cfg.entityName} not found`);
    }
    return ok(row);
  });

  const PUT = handle(async (req, ctx) => {
    const { id } = await ctx.params;
    const user = await requirePermission(cfg.managePermission);
    const input = cfg.updateSchema.parse(await readJson(req)) as Record<string, unknown>;
    const row = await delegate(cfg.model)
      .update({ where: { id }, data: cfg.toUpdateData(input), include: cfg.detailInclude })
      .catch(() => null);
    if (!row) return fail(404, `${cfg.entityName} not found`);
    await recordAudit({
      actorId: user.id,
      action: `${cfg.model}.update`,
      entityType: cfg.entityName,
      entityId: row.id,
      req,
    });
    return ok(row);
  });

  const DELETE = handle(async (req, ctx) => {
    const { id } = await ctx.params;
    const user = await requirePermission(cfg.managePermission);
    await delegate(cfg.model)
      .delete({ where: { id } })
      .catch(() => {
        throw new Error('not found');
      });
    await recordAudit({
      actorId: user.id,
      action: `${cfg.model}.delete`,
      entityType: cfg.entityName,
      entityId: id,
      req,
    });
    return ok({ deleted: true });
  });

  return { GET, PUT, DELETE };
}
