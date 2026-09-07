import type { MetadataRoute } from 'next';
import { env } from '@/lib/env';
import { prisma } from '@/lib/db';
import { safe } from '@/lib/safe';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  const now = new Date();

  const staticPaths = [
    '',
    '/explore',
    '/repository',
    '/data',
    '/map',
    '/media',
    '/education',
    '/education/quizzes',
    '/education/activities',
    '/expeditions',
    '/events',
    '/news',
    '/about',
    '/about/contact',
    '/about/data-policy',
    '/about/privacy',
    '/about/terms',
    '/about/accessibility',
    '/glossary',
    '/researchers',
    '/institutions',
  ].map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: p === '' ? 1 : 0.7,
  }));

  const [research, media, news, events, expeditions, education, topics] = await Promise.all([
    safe(
      () =>
        prisma.research.findMany({
          where: { status: 'PUBLISHED' },
          select: { slug: true, updatedAt: true },
          take: 5000,
        }),
      [],
      'sitemap.research',
    ),
    safe(
      () =>
        prisma.media.findMany({
          where: { status: 'PUBLISHED' },
          select: { slug: true, updatedAt: true },
          take: 5000,
        }),
      [],
      'sitemap.media',
    ),
    safe(
      () =>
        prisma.newsArticle.findMany({
          where: { status: 'PUBLISHED' },
          select: { slug: true, updatedAt: true },
          take: 5000,
        }),
      [],
      'sitemap.news',
    ),
    safe(
      () =>
        prisma.event.findMany({
          where: { status: 'PUBLISHED' },
          select: { slug: true, updatedAt: true },
          take: 5000,
        }),
      [],
      'sitemap.events',
    ),
    safe(
      () =>
        prisma.expedition.findMany({
          where: { status: 'PUBLISHED' },
          select: { slug: true, updatedAt: true },
          take: 5000,
        }),
      [],
      'sitemap.expeditions',
    ),
    safe(
      () =>
        prisma.educationResource.findMany({
          where: { status: 'PUBLISHED' },
          select: { slug: true, updatedAt: true },
          take: 5000,
        }),
      [],
      'sitemap.education',
    ),
    safe(
      () => prisma.topic.findMany({ select: { slug: true, updatedAt: true }, take: 5000 }),
      [],
      'sitemap.topics',
    ),
  ]);

  const dynamicEntries: MetadataRoute.Sitemap = [
    ...research.map((r) => ({ url: `${base}/repository/${r.slug}`, lastModified: r.updatedAt })),
    ...media.map((m) => ({ url: `${base}/media/${m.slug}`, lastModified: m.updatedAt })),
    ...news.map((n) => ({ url: `${base}/news/${n.slug}`, lastModified: n.updatedAt })),
    ...events.map((e) => ({ url: `${base}/events/${e.slug}`, lastModified: e.updatedAt })),
    ...expeditions.map((e) => ({ url: `${base}/expeditions/${e.slug}`, lastModified: e.updatedAt })),
    ...education.map((e) => ({ url: `${base}/education/${e.slug}`, lastModified: e.updatedAt })),
    ...topics.map((t) => ({ url: `${base}/explore/${t.slug}`, lastModified: t.updatedAt })),
  ];

  return [...staticPaths, ...dynamicEntries];
}
