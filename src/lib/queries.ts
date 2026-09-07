import 'server-only';
import { prisma } from '@/lib/db';
import { safe } from '@/lib/safe';
import {
  demoResearch,
  demoMedia,
  demoNews,
  demoEducation,
  demoEvents,
  demoExpeditions,
} from '@/lib/demo-data';

const PUBLISHED = { status: 'PUBLISHED' as const };

/** Real rows if any, else a slice of demo content so the homepage is never bare. */
function orDemo<A, B>(real: A[], demo: B[], take: number): (A | B)[] {
  return real.length ? real : demo.slice(0, take);
}

const researchInclude = {
  institution: { select: { name: true } },
  authors: {
    orderBy: { authorOrder: 'asc' as const },
    include: { researcher: { select: { fullName: true } } },
  },
};

export async function getFeaturedResearch(take = 6) {
  const real = await safe(
    () =>
      prisma.research.findMany({
        where: PUBLISHED,
        orderBy: [{ viewCount: 'desc' }, { publishedAt: 'desc' }],
        take,
        include: researchInclude,
      }),
    [],
    'featuredResearch',
  );
  return orDemo(real, demoResearch, take);
}

export async function getLatestDiscoveries(take = 8) {
  const real = await safe(
    () =>
      prisma.research.findMany({
        where: PUBLISHED,
        orderBy: { publishedAt: 'desc' },
        take,
        include: researchInclude,
      }),
    [],
    'latestDiscoveries',
  );
  return orDemo(real, demoResearch.slice(2), take);
}

export async function getFeaturedMedia(take = 8) {
  const real = await safe(
    () =>
      prisma.media.findMany({ where: PUBLISHED, orderBy: { createdAt: 'desc' }, take }),
    [],
    'featuredMedia',
  );
  return orDemo(real, demoMedia, take);
}

export async function getUpcomingEvents(take = 4) {
  const real = await safe(
    () =>
      prisma.event.findMany({
        where: { ...PUBLISHED, startAt: { gte: new Date() } },
        orderBy: { startAt: 'asc' },
        take,
      }),
    [],
    'upcomingEvents',
  );
  return orDemo(
    real,
    demoEvents.filter((e) => e.startAt.getTime() >= Date.now()),
    take,
  );
}

export async function getLatestNews(take = 3) {
  const real = await safe(
    () =>
      prisma.newsArticle.findMany({
        where: PUBLISHED,
        orderBy: { publishedAt: 'desc' },
        take,
        include: { author: { select: { name: true } } },
      }),
    [],
    'latestNews',
  );
  return orDemo(real, demoNews, take);
}

export async function getEducationHighlights(take = 3) {
  const real = await safe(
    () =>
      prisma.educationResource.findMany({
        where: PUBLISHED,
        orderBy: { createdAt: 'desc' },
        take,
      }),
    [],
    'educationHighlights',
  );
  return orDemo(real, demoEducation, take);
}

export async function getActiveExpeditions(take = 3) {
  const real = await safe(
    () =>
      prisma.expedition.findMany({
        where: PUBLISHED,
        orderBy: { startDate: 'desc' },
        take,
        include: { region: { select: { name: true } } },
      }),
    [],
    'activeExpeditions',
  );
  return orDemo(real, demoExpeditions, take);
}

export interface PolarSnapshot {
  seaIceArcticExtent: number | null;
  seaIceAntarcticExtent: number | null;
  arcticTempAnomaly: number | null;
  researchStations: number;
  activeExpeditions: number;
  recentPublications: number;
  generatedAt: string;
  isDemo: boolean;
}

/**
 * Homepage "Live Polar Snapshot". Counts come from the database; the physical
 * metrics come from the demo data providers and are explicitly flagged as demo.
 */
export async function getPolarSnapshot(): Promise<PolarSnapshot> {
  const { DEMO_SERIES } = await import('@/lib/data-providers/demo');
  const arctic = DEMO_SERIES['arctic-sea-ice-extent']?.();
  const antarctic = DEMO_SERIES['antarctic-sea-ice-extent']?.();
  const temp = DEMO_SERIES['arctic-temperature-anomaly']?.();
  const last = (arr: { value: number }[] | undefined): number | null =>
    arr && arr.length ? arr[arr.length - 1]!.value : null;

  const [stations, expeditions, pubs] = await Promise.all([
    safe(() => prisma.researchStation.count(), 0, 'stationCount'),
    safe(
      () =>
        prisma.expedition.count({
          where: { status: 'PUBLISHED', endDate: { gte: new Date() } },
        }),
      0,
      'expeditionCount',
    ),
    safe(
      () =>
        prisma.research.count({
          where: {
            status: 'PUBLISHED',
            publishedAt: { gte: new Date(Date.now() - 90 * 86_400_000) },
          },
        }),
      0,
      'pubCount',
    ),
  ]);

  return {
    seaIceArcticExtent: last(arctic?.points),
    seaIceAntarcticExtent: last(antarctic?.points),
    arcticTempAnomaly: last(temp?.points),
    researchStations: stations || 8,
    activeExpeditions: expeditions || 3,
    recentPublications: pubs || 6,
    generatedAt: new Date().toISOString(),
    isDemo: true,
  };
}

export async function getPlatformCounts() {
  return safe(
    async () => {
      const [research, datasets, media, news, events, expeditions, education, users] =
        await Promise.all([
          prisma.research.count({ where: PUBLISHED }),
          prisma.dataset.count({ where: PUBLISHED }),
          prisma.media.count({ where: PUBLISHED }),
          prisma.newsArticle.count({ where: PUBLISHED }),
          prisma.event.count({ where: PUBLISHED }),
          prisma.expedition.count({ where: PUBLISHED }),
          prisma.educationResource.count({ where: PUBLISHED }),
          prisma.user.count(),
        ]);
      return { research, datasets, media, news, events, expeditions, education, users };
    },
    {
      research: 0,
      datasets: 0,
      media: 0,
      news: 0,
      events: 0,
      expeditions: 0,
      education: 0,
      users: 0,
    },
    'platformCounts',
  );
}
