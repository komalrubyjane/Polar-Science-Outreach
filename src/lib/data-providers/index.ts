import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { DEMO_SERIES, listDemoSeries } from './demo';
import { fetchNsidcSeaIce, NSIDC_META } from './nsidc';
import type { DataProvider, NormalizedSeries, SourceKey } from './types';

export type { NormalizedSeries, SeriesPoint, DataProvider, SourceKey } from './types';

const DEMO_MODE = env.DEMO_MODE;

/** Human label for a provider key (used by <SourceBadge> tooltips). */
export const SOURCE_LABELS: Record<SourceKey, string> = {
  NSIDC: 'National Snow and Ice Data Center',
  NASA: 'NASA Earthdata',
  NOAA: 'NOAA',
  USAP: 'US Antarctic Program',
  DEMO: 'Demonstration data',
  PORTAL: 'Polar Science Portal',
};

/** Shape returned when a real source has genuinely no data to show. */
function unavailableSeries(
  base: NormalizedSeries,
  source: string,
  reason: string,
): NormalizedSeries {
  return {
    ...base,
    isDemo: false,
    points: [],
    unavailable: { reason, source, attemptedAt: new Date().toISOString() },
  };
}

/**
 * Base class for providers backed by a configurable JSON endpoint.
 * Priority: real endpoint → (DEMO_MODE ? demo w/ degraded note : unavailable).
 * NEVER fabricates values outside DEMO_MODE.
 */
abstract class BaseProvider implements DataProvider {
  abstract readonly key: string;
  abstract readonly label: string;
  protected abstract readonly endpoint: string;
  protected abstract readonly seriesIds: string[];
  protected abstract readonly sourceKey: SourceKey;

  async list() {
    return this.seriesIds
      .map((id) => {
        const demo = DEMO_SERIES[id]?.();
        return demo ? { id, name: this.displayName(demo.name) } : null;
      })
      .filter((s): s is { id: string; name: string } => Boolean(s));
  }

  protected displayName(demoName: string) {
    return demoName.replace(/ \(demo\)$/i, '');
  }

  /** Skeleton (name/unit/pole/etc) from the demo generator; values are replaced. */
  protected skeleton(id: string): NormalizedSeries | null {
    const demo = DEMO_SERIES[id]?.();
    if (!demo) return null;
    return {
      ...demo,
      name: this.displayName(demo.name),
      isDemo: false,
      sourceKey: this.sourceKey,
      cadence: 'near-real-time',
      source: SOURCE_LABELS[this.sourceKey],
      points: [],
    };
  }

  async get(id: string): Promise<NormalizedSeries | null> {
    if (!this.seriesIds.includes(id)) return null;
    const skel = this.skeleton(id);
    if (!skel) return null;

    if (this.endpoint) {
      try {
        const res = await fetch(`${this.endpoint}?series=${encodeURIComponent(id)}`, {
          next: { revalidate: 60 * 60 * 3 },
        });
        if (!res.ok) throw new Error(`upstream ${res.status}`);
        const json = (await res.json()) as Partial<NormalizedSeries>;
        if (!Array.isArray(json.points) || json.points.length === 0) {
          throw new Error('empty upstream payload');
        }
        return { ...skel, ...json, isDemo: false, sourceKey: this.sourceKey };
      } catch (err) {
        logger.warn('scientific provider fetch failed', {
          provider: this.key,
          id,
          message: err instanceof Error ? err.message : String(err),
        });
      }
    }

    if (DEMO_MODE) {
      const demo = DEMO_SERIES[id]!();
      return {
        ...demo,
        degraded: {
          reason: 'Live source unavailable — showing demonstration data (DEMO_MODE).',
          cachedFrom: demo.lastUpdated,
        },
      };
    }
    return unavailableSeries(
      skel,
      SOURCE_LABELS[this.sourceKey],
      this.endpoint
        ? 'The data source did not respond.'
        : 'No data source is configured for this series yet.',
    );
  }
}

/* ------------------------------------------------------------------ sea ice (real NSIDC) */

export class SeaIceProvider implements DataProvider {
  readonly key = 'sea-ice';
  readonly label = 'Sea Ice';
  private readonly ids = ['arctic-sea-ice-extent', 'antarctic-sea-ice-extent'];

  async list() {
    return [
      { id: 'arctic-sea-ice-extent', name: 'Arctic sea ice extent' },
      { id: 'antarctic-sea-ice-extent', name: 'Antarctic sea ice extent' },
    ];
  }

  async get(id: string): Promise<NormalizedSeries | null> {
    if (!this.ids.includes(id)) return null;
    const arctic = id === 'arctic-sea-ice-extent';
    const hemisphere = arctic ? 'north' : 'south';

    const skeleton: NormalizedSeries = {
      id,
      name: `${arctic ? 'Arctic' : 'Antarctic'} sea ice extent`,
      unit: 'million km²',
      pole: arctic ? 'ARCTIC' : 'ANTARCTIC',
      description: `Monthly-mean ${arctic ? 'Arctic' : 'Antarctic'} sea-ice extent (area of ocean with at least 15% ice concentration), aggregated from the NSIDC daily Sea Ice Index.`,
      methodology: NSIDC_META.methodology,
      source: NSIDC_META.source,
      sourceKey: 'NSIDC',
      sourceUrl: NSIDC_META.sourceUrl,
      license: NSIDC_META.license,
      citation: NSIDC_META.citation,
      isDemo: false,
      cadence: 'near-real-time',
      lastUpdated: '',
      points: [],
    };

    try {
      const { points, lastObservation } = await fetchNsidcSeaIce(hemisphere);
      return { ...skeleton, points, lastUpdated: lastObservation };
    } catch (err) {
      logger.warn('NSIDC sea ice fetch failed', {
        id,
        message: err instanceof Error ? err.message : String(err),
      });
      if (DEMO_MODE) {
        const demo = DEMO_SERIES[id]!();
        return {
          ...demo,
          degraded: {
            reason: 'NSIDC did not respond — showing demonstration data (DEMO_MODE).',
            cachedFrom: demo.lastUpdated,
          },
        };
      }
      return unavailableSeries(
        skeleton,
        NSIDC_META.source,
        'NSIDC did not respond. No cached observation is available yet.',
      );
    }
  }
}

/* ------------------------------------------------------------------ other domains */

export class ClimateProvider extends BaseProvider {
  readonly key = 'climate';
  readonly label = 'Climate & Atmosphere';
  protected readonly endpoint = env.CLIMATE_DATA_API_URL || env.NASA_EARTHDATA_API_URL;
  protected readonly seriesIds = ['arctic-temperature-anomaly', 'antarctic-snow-cover'];
  protected readonly sourceKey: SourceKey = 'NASA';
}

export class OceanProvider extends BaseProvider {
  readonly key = 'ocean';
  readonly label = 'Ocean';
  protected readonly endpoint = env.OCEAN_DATA_API_URL || env.NOAA_API_URL;
  protected readonly seriesIds = ['southern-ocean-sst'];
  protected readonly sourceKey: SourceKey = 'NOAA';
}

export class CryosphereProvider extends BaseProvider {
  readonly key = 'cryosphere';
  readonly label = 'Ice Sheets & Glaciers';
  protected readonly endpoint = env.NASA_EARTHDATA_API_URL;
  protected readonly seriesIds = ['greenland-ice-mass'];
  protected readonly sourceKey: SourceKey = 'NASA';
}

const PROVIDERS: DataProvider[] = [
  new SeaIceProvider(),
  new ClimateProvider(),
  new OceanProvider(),
  new CryosphereProvider(),
];

export function getProviders(): DataProvider[] {
  return PROVIDERS;
}

export async function getSeriesById(id: string): Promise<NormalizedSeries | null> {
  for (const provider of PROVIDERS) {
    const series = await provider.get(id);
    if (series) return series;
  }
  return null;
}

export async function listAllSeries(): Promise<
  { provider: string; label: string; series: { id: string; name: string }[] }[]
> {
  return Promise.all(
    PROVIDERS.map(async (p) => ({
      provider: p.key,
      label: p.label,
      series: await p.list(),
    })),
  );
}

/** Sea ice is always real (public NSIDC, no key). Other domains need config. */
export function realDataStatus() {
  return {
    seaIce: true,
    climate: Boolean(env.CLIMATE_DATA_API_URL || env.NASA_EARTHDATA_API_URL),
    ocean: Boolean(env.OCEAN_DATA_API_URL || env.NOAA_API_URL),
    cryosphere: Boolean(env.NASA_EARTHDATA_API_URL),
    demoMode: DEMO_MODE,
  };
}

/** @deprecated kept for callers; sea ice is always live now. */
export function anyExternalProviderConfigured(): boolean {
  return true;
}

export { listDemoSeries };
