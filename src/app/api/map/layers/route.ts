import { prisma } from '@/lib/db';
import { handle, ok } from '@/lib/api';
import { safe } from '@/lib/safe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Feature {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] };
  properties: Record<string, unknown>;
}

function fc(features: Feature[]) {
  return { type: 'FeatureCollection' as const, features };
}

/**
 * GET /api/map/layers?pole=ARCTIC|ANTARCTIC
 * Returns GeoJSON FeatureCollections keyed by layer, plus an accessible list.
 */
export const GET = handle(async (req) => {
  const pole = new URL(req.url).searchParams.get('pole');
  const poleWhere = pole ? { pole: pole as never } : {};

  const [stations, expeditionPts, observations, projects, protectedAreas] = await Promise.all([
    safe(
      () =>
        prisma.researchStation.findMany({
          where: poleWhere,
          select: {
            id: true, slug: true, name: true, country: true, status: true, pole: true,
            latitude: true, longitude: true, establishedYear: true,
          },
        }),
      [],
      'map.stations',
    ),
    safe(
      () =>
        prisma.expeditionUpdate.findMany({
          where: {
            latitude: { not: null },
            longitude: { not: null },
            expedition: { status: 'PUBLISHED', ...(pole ? { region: { pole: pole as never } } : {}) },
          },
          select: {
            id: true, title: true, postedAt: true, latitude: true, longitude: true,
            expedition: { select: { name: true, slug: true } },
          },
          orderBy: { postedAt: 'desc' },
          take: 300,
        }),
      [],
      'map.expeditionPts',
    ),
    safe(
      () =>
        prisma.location.findMany({
          where: { kind: 'OBSERVATION_SITE', ...(pole ? { region: { pole: pole as never } } : {}) },
          select: { id: true, name: true, latitude: true, longitude: true, description: true },
        }),
      [],
      'map.observations',
    ),
    safe(
      () =>
        prisma.location.findMany({
          where: { kind: 'RESEARCH_PROJECT', ...(pole ? { region: { pole: pole as never } } : {}) },
          select: { id: true, name: true, latitude: true, longitude: true, description: true },
        }),
      [],
      'map.projects',
    ),
    safe(
      () =>
        prisma.location.findMany({
          where: { kind: 'PROTECTED_AREA', ...(pole ? { region: { pole: pole as never } } : {}) },
          select: { id: true, name: true, latitude: true, longitude: true, description: true },
        }),
      [],
      'map.protected',
    ),
  ]);

  const toPoint = (
    lng: number,
    lat: number,
    properties: Record<string, unknown>,
  ): Feature => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [lng, lat] },
    properties,
  });

  const layers = {
    stations: fc(
      stations.map((s) =>
        toPoint(s.longitude, s.latitude, {
          layer: 'stations',
          id: s.id,
          name: s.name,
          country: s.country,
          status: s.status,
          pole: s.pole,
          establishedYear: s.establishedYear,
          href: `/map?station=${s.slug}`,
        }),
      ),
    ),
    expeditions: fc(
      expeditionPts
        .filter((e) => e.latitude != null && e.longitude != null)
        .map((e) =>
          toPoint(e.longitude as number, e.latitude as number, {
            layer: 'expeditions',
            id: e.id,
            name: `${e.expedition.name}: ${e.title}`,
            date: e.postedAt,
            href: `/expeditions/${e.expedition.slug}`,
          }),
        ),
    ),
    observations: fc(
      observations.map((o) =>
        toPoint(o.longitude, o.latitude, {
          layer: 'observations',
          id: o.id,
          name: o.name,
          description: o.description,
        }),
      ),
    ),
    projects: fc(
      projects.map((o) =>
        toPoint(o.longitude, o.latitude, {
          layer: 'projects',
          id: o.id,
          name: o.name,
          description: o.description,
        }),
      ),
    ),
    protectedAreas: fc(
      protectedAreas.map((o) =>
        toPoint(o.longitude, o.latitude, {
          layer: 'protectedAreas',
          id: o.id,
          name: o.name,
          description: o.description,
        }),
      ),
    ),
  };

  const list = Object.values(layers)
    .flatMap((l) => l.features)
    .map((f) => ({
      name: f.properties.name,
      layer: f.properties.layer,
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0],
      href: f.properties.href ?? null,
    }));

  return ok({ layers, list, count: list.length });
});
