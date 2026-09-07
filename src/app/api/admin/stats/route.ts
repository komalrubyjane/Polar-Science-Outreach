import { prisma } from '@/lib/db';
import { handle, ok } from '@/lib/api';
import { requirePermission } from '@/lib/auth/session';
import { safe } from '@/lib/safe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = handle(async () => {
  await requirePermission('admin:access');

  const data = await safe(
    async () => {
      const [
        users,
        research,
        datasets,
        media,
        articles,
        events,
        expeditions,
        pendingSubmissions,
        userGrowth,
        repoGrowth,
        byDiscipline,
        topResearch,
        downloads,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.research.count(),
        prisma.dataset.count(),
        prisma.media.count(),
        prisma.newsArticle.count(),
        prisma.event.count(),
        prisma.expedition.count(),
        prisma.submission.count({ where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } } }),
        prisma.$queryRaw<{ month: string; count: bigint }[]>`
          SELECT to_char(date_trunc('month', "createdAt"), 'YYYY-MM') AS month, COUNT(*)::bigint AS count
          FROM "User" WHERE "createdAt" >= now() - interval '12 months'
          GROUP BY 1 ORDER BY 1`,
        prisma.$queryRaw<{ month: string; count: bigint }[]>`
          SELECT to_char(date_trunc('month', "createdAt"), 'YYYY-MM') AS month, COUNT(*)::bigint AS count
          FROM "Research" WHERE "createdAt" >= now() - interval '12 months'
          GROUP BY 1 ORDER BY 1`,
        prisma.research.groupBy({ by: ['discipline'], _count: { _all: true } }),
        prisma.research.findMany({
          where: { status: 'PUBLISHED' },
          orderBy: { viewCount: 'desc' },
          take: 8,
          select: { id: true, slug: true, title: true, viewCount: true, downloadCount: true },
        }),
        prisma.download.count(),
      ]);

      return {
        cards: {
          users,
          research,
          datasets,
          media,
          articles,
          events,
          expeditions,
          pendingSubmissions,
          downloads,
        },
        userGrowth: userGrowth.map((r) => ({ month: r.month, count: Number(r.count) })),
        repoGrowth: repoGrowth.map((r) => ({ month: r.month, count: Number(r.count) })),
        byDiscipline: byDiscipline.map((d) => ({
          discipline: d.discipline,
          count: d._count._all,
        })),
        topResearch,
      };
    },
    {
      cards: {
        users: 0, research: 0, datasets: 0, media: 0, articles: 0,
        events: 0, expeditions: 0, pendingSubmissions: 0, downloads: 0,
      },
      userGrowth: [],
      repoGrowth: [],
      byDiscipline: [],
      topResearch: [],
    },
    'adminStats',
  );

  return ok(data);
});
