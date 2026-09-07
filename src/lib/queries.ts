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
  demoEnabled,
} from '@/lib/demo-data';
import { SeaIceProvider } from '@/lib/data-providers';

const PUBLISHED = { status: 'PUBLISHED' as const };

/** Real rows if any; a slice of demo content only when DEMO_MODE is on. */
function orDemo<A, B>(real: A[], demo: B[], take: number): (A | B)[] {
  if (real.length) return real;
  return demoEnabled() ? demo.slice(0, take) : real;
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

export interface SnapshotMetric {
  value: number | null;
  unit: string;
  lastUpdated: string | null;
  source: string;
  unavailable: boolean;
}

export interface PolarSnapshot {
  arcticSeaIce: SnapshotMetric;
  antarcticSeaIce: SnapshotMetric;
  researchStations: number;
  activeExpeditions: number;
  recentPublications: number;
  datasetsAvailable: number;
  generatedAt: string;
}

/**
 * Homepage "Live Polar Snapshot". Sea-ice figures are REAL — the latest monthly
 * mean from the NSIDC Sea Ice Index (cached 6h). Counts are from the database.
 * Nothing here is fabricated; missing values surface as `unavailable`.
 */
export async function getPolarSnapshot(): Promise<PolarSnapshot> {
  const provider = new SeaIceProvider();

  const [arcticSeries, antarcticSeries, stations, expeditions, pubs, datasets] =
    await Promise.all([
      safe(() => provider.get('arctic-sea-ice-extent'), null, 'snapshotArcticIce'),
      safe(() => provider.get('antarctic-sea-ice-extent'), null, 'snapshotAntarcticIce'),
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
      safe(() => prisma.dataset.count({ where: PUBLISHED }), 0, 'datasetCount'),
    ]);

  const toMetric = (s: Awaited<ReturnType<typeof provider.get>>): SnapshotMetric => {
    const last = s?.points.at(-1);
    return {
      value: last?.value ?? null,
      unit: s?.unit ?? 'million km²',
      lastUpdated: s?.lastUpdated || null,
      source: s?.source ?? 'NSIDC Sea Ice Index',
      unavailable: !last,
    };
  };

  return {
    arcticSeaIce: toMetric(arcticSeries),
    antarcticSeaIce: toMetric(antarcticSeries),
    researchStations: stations,
    activeExpeditions: expeditions,
    recentPublications: pubs,
    datasetsAvailable: datasets,
    generatedAt: new Date().toISOString(),
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
