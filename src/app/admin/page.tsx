import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Users,
  FileText,
  Database,
  Image as ImageIcon,
  Newspaper,
  CalendarDays,
  Compass,
  Inbox,
  Download,
} from 'lucide-react';
import { prisma } from '@/lib/db';
import { safe } from '@/lib/safe';
import { analyticsSummary } from '@/lib/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GrowthChart, CategoryBarChart } from '@/components/admin/dashboard-charts';
import { DISCIPLINE_LABELS } from '@/lib/constants';
import { formatNumber } from '@/lib/utils';

export const metadata: Metadata = { title: 'Admin dashboard' };
export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const stats = await safe(
    async () => {
      const [
        users, research, datasets, media, articles, events, expeditions,
        pendingSubmissions, downloads, userGrowth, repoGrowth, byDiscipline, topResearch,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.research.count(),
        prisma.dataset.count(),
        prisma.media.count(),
        prisma.newsArticle.count(),
        prisma.event.count(),
        prisma.expedition.count(),
        prisma.submission.count({ where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } } }),
        prisma.download.count(),
        prisma.$queryRaw<{ month: string; count: bigint }[]>`
          SELECT to_char(date_trunc('month', "createdAt"), 'YYYY-MM') AS month, COUNT(*)::bigint AS count
          FROM "User" WHERE "createdAt" >= now() - interval '12 months' GROUP BY 1 ORDER BY 1`,
        prisma.$queryRaw<{ month: string; count: bigint }[]>`
          SELECT to_char(date_trunc('month', "createdAt"), 'YYYY-MM') AS month, COUNT(*)::bigint AS count
          FROM "Research" WHERE "createdAt" >= now() - interval '12 months' GROUP BY 1 ORDER BY 1`,
        prisma.research.groupBy({ by: ['discipline'], _count: { _all: true } }),
        prisma.research.findMany({
          where: { status: 'PUBLISHED' },
          orderBy: { viewCount: 'desc' },
          take: 8,
          select: { id: true, slug: true, title: true, viewCount: true, downloadCount: true },
        }),
      ]);
      return {
        cards: { users, research, datasets, media, articles, events, expeditions, pendingSubmissions, downloads },
        userGrowth: userGrowth.map((r) => ({ month: r.month, count: Number(r.count) })),
        repoGrowth: repoGrowth.map((r) => ({ month: r.month, count: Number(r.count) })),
        byDiscipline: byDiscipline
          .map((d) => ({ label: DISCIPLINE_LABELS[d.discipline] ?? d.discipline, count: d._count._all }))
          .sort((a, b) => b.count - a.count),
        topResearch,
      };
    },
    {
      cards: { users: 0, research: 0, datasets: 0, media: 0, articles: 0, events: 0, expeditions: 0, pendingSubmissions: 0, downloads: 0 },
      userGrowth: [], repoGrowth: [], byDiscipline: [], topResearch: [],
    },
    'adminDashboard',
  );

  const analytics = await safe(() => analyticsSummary(30), null, 'adminDashAnalytics');

  const cards = [
    { label: 'Users', value: stats.cards.users, icon: Users, href: '/admin/users' },
    { label: 'Research records', value: stats.cards.research, icon: FileText, href: '/admin/content?type=research' },
    { label: 'Datasets', value: stats.cards.datasets, icon: Database, href: '/admin/content?type=datasets' },
    { label: 'Media assets', value: stats.cards.media, icon: ImageIcon, href: '/admin/content?type=media' },
    { label: 'Articles', value: stats.cards.articles, icon: Newspaper, href: '/admin/content?type=news' },
    { label: 'Events', value: stats.cards.events, icon: CalendarDays, href: '/admin/content?type=events' },
    { label: 'Expeditions', value: stats.cards.expeditions, icon: Compass, href: '/admin/content?type=expeditions' },
    { label: 'Pending submissions', value: stats.cards.pendingSubmissions, icon: Inbox, href: '/admin/submissions' },
    { label: 'Downloads', value: stats.cards.downloads, icon: Download, href: '/admin/analytics' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Live figures from this deployment&apos;s database. Empty until content is seeded or created.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} href={c.href}>
            <div className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md">
              <c.icon className="mb-2 h-5 w-5 text-accent" />
              <p className="font-display text-2xl font-semibold">{formatNumber(c.value)}</p>
              <p className="text-sm text-muted-foreground">{c.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">User growth (12 months)</CardTitle>
          </CardHeader>
          <CardContent>
            <GrowthChart data={stats.userGrowth} color="#3D5A6B" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Repository growth (12 months)</CardTitle>
          </CardHeader>
          <CardContent>
            <GrowthChart data={stats.repoGrowth} color="#708794" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Research by discipline</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryBarChart data={stats.byDiscipline} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Most viewed research</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topResearch.length ? (
              <ol className="space-y-2 text-sm">
                {stats.topResearch.map((r, i) => (
                  <li key={r.id} className="flex items-center justify-between gap-3">
                    <Link href={`/repository/${r.slug}`} className="truncate hover:text-accent">
                      {i + 1}. {r.title}
                    </Link>
                    <span className="shrink-0 text-muted-foreground">
                      {formatNumber(r.viewCount)} views · {formatNumber(r.downloadCount)} dl
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">No research yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {analytics ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Last 30 days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3 lg:grid-cols-6">
              {Object.entries(analytics.totals).map(([k, v]) => (
                <div key={k} className="rounded-lg bg-muted/50 p-3">
                  <p className="font-display text-xl font-semibold">{formatNumber(v)}</p>
                  <p className="text-xs capitalize text-muted-foreground">{k.replace(/_/g, ' ')}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
