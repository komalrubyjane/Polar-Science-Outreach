import type { Metadata } from 'next';
import { PageHero } from '@/components/content/page-hero';
import { MapExplorer } from '@/components/maps/map-explorer';
import type { MapFeature } from '@/components/maps/polar-map';
import { prisma } from '@/lib/db';
import { safe } from '@/lib/safe';

export const metadata: Metadata = {
  title: 'Polar Map',
  description:
    'Interactive map of Arctic and Antarctic research stations, expeditions, observation sites, research projects and protected areas. Includes an accessible location list.',
};

export const revalidate = 300;

export default async function MapPage() {
  const [stations, expeditionPts, locations] = await Promise.all([
    safe(
      () =>
        prisma.researchStation.findMany({
          select: {
            id: true, slug: true, name: true, country: true, status: true,
            latitude: true, longitude: true,
          },
        }),
      [],
      'map.stations',
    ),
    safe(
      () =>
        prisma.expeditionUpdate.findMany({
          where: { latitude: { not: null }, longitude: { not: null }, expedition: { status: 'PUBLISHED' } },
          select: {
            id: true, title: true, latitude: true, longitude: true,
            expedition: { select: { name: true, slug: true } },
          },
          take: 300,
        }),
      [],
      'map.expeditions',
    ),
    safe(
      () =>
        prisma.location.findMany({
          where: { kind: { in: ['OBSERVATION_SITE', 'RESEARCH_PROJECT', 'PROTECTED_AREA'] } },
          select: { id: true, name: true, kind: true, latitude: true, longitude: true, description: true },
        }),
      [],
      'map.locations',
    ),
  ]);

  const kindLayer: Record<string, string> = {
    OBSERVATION_SITE: 'observations',
    RESEARCH_PROJECT: 'projects',
    PROTECTED_AREA: 'protectedAreas',
  };

  const features: MapFeature[] = [
    ...stations.map((s) => ({
      id: s.id,
      name: s.name,
      layer: 'stations',
      lat: s.latitude,
      lng: s.longitude,
      href: `/institutions?station=${s.slug}`,
      description: [s.country, s.status].filter(Boolean).join(' · '),
    })),
    ...expeditionPts
      .filter((e) => e.latitude != null && e.longitude != null)
      .map((e) => ({
        id: e.id,
        name: `${e.expedition.name}: ${e.title}`,
        layer: 'expeditions',
        lat: e.latitude as number,
        lng: e.longitude as number,
        href: `/expeditions/${e.expedition.slug}`,
        description: null,
      })),
    ...locations.map((l) => ({
      id: l.id,
      name: l.name,
      layer: kindLayer[l.kind] ?? 'observations',
      lat: l.latitude,
      lng: l.longitude,
      href: null,
      description: l.description,
    })),
  ];

  return (
    <>
      <PageHero
        eyebrow="Polar Map"
        title="Interactive polar map"
        description="Toggle layers, switch between Arctic and Antarctic views, and search locations. An accessible table alternative lists every visible location."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Polar Map' }]}
      />
      <div className="container-page py-10">
        <MapExplorer features={features} />
        <p className="mt-4 text-xs text-muted-foreground">
          Base map © OpenStreetMap contributors. Architecture supports WMS/WFS, GeoJSON overlays
          and polar-projection basemaps — see <code>docs/architecture.md</code>. Marker positions
          for demo content are illustrative.
        </p>
      </div>
    </>
  );
}
