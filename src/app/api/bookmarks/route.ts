import { prisma } from '@/lib/db';
import { handle, ok, created, readJson, badRequest } from '@/lib/api';
import { requireUser } from '@/lib/auth/session';
import { bookmarkSchema } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MODEL_FOR = {
  RESEARCH: 'research',
  DATASET: 'dataset',
  MEDIA: 'media',
  NEWS: 'newsArticle',
  EDUCATION: 'educationResource',
  EXPEDITION: 'expedition',
} as const;

export const GET = handle(async () => {
  const user = await requireUser();
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });
  return ok(bookmarks);
});

export const POST = handle(async (req) => {
  const user = await requireUser();
  const { entityType, entityId } = bookmarkSchema.parse(await readJson(req));

  // Verify the target exists before bookmarking.
  const model = MODEL_FOR[entityType];
  // @ts-expect-error dynamic model access is intentional here
  const exists = await prisma[model].findUnique({ where: { id: entityId }, select: { id: true } });
  if (!exists) badRequest('That item does not exist');

  const bookmark = await prisma.bookmark.upsert({
    where: { userId_entityType_entityId: { userId: user.id, entityType, entityId } },
    create: { userId: user.id, entityType, entityId },
    update: {},
  });
  return created(bookmark);
});

export const DELETE = handle(async (req) => {
  const user = await requireUser();
  const url = new URL(req.url);
  const entityType = url.searchParams.get('entityType');
  const entityId = url.searchParams.get('entityId');
  if (!entityType || !entityId) badRequest('entityType and entityId are required');
  await prisma.bookmark.deleteMany({
    where: { userId: user.id, entityType: entityType as never, entityId: entityId! },
  });
  return ok({ removed: true });
});
