import { prisma } from '@/lib/db';
import { handle, ok, readJson } from '@/lib/api';
import { requireUser } from '@/lib/auth/session';
import { profileUpdateSchema } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = handle(async () => {
  const session = await requireUser();
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true, name: true, email: true, bio: true, organization: true, role: true,
      createdAt: true, image: true,
      _count: {
        select: { bookmarks: true, downloads: true, eventRegistrations: true, submissions: true },
      },
    },
  });
  return ok(user);
});

export const PUT = handle(async (req) => {
  const session = await requireUser();
  const input = profileUpdateSchema.parse(await readJson(req));
  const user = await prisma.user.update({
    where: { id: session.id },
    data: {
      name: input.name,
      bio: input.bio || null,
      organization: input.organization || null,
    },
    select: { id: true, name: true, bio: true, organization: true },
  });
  return ok(user);
});
