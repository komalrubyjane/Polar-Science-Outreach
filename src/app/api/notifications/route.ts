import { z } from 'zod';
import { prisma } from '@/lib/db';
import { handle, ok, readJson } from '@/lib/api';
import { requireUser } from '@/lib/auth/session';
import { markNotificationsRead } from '@/lib/notifications';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = handle(async () => {
  const user = await requireUser();
  const [items, unread] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
    }),
    prisma.notification.count({ where: { userId: user.id, readAt: null } }),
  ]);
  return ok({ items, unread });
});

export const POST = handle(async (req) => {
  const user = await requireUser();
  const { ids } = z
    .object({ ids: z.array(z.string()).optional() })
    .parse(await readJson(req).catch(() => ({})));
  const count = await markNotificationsRead(user.id, ids);
  return ok({ marked: count });
});
