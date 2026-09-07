import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { DEMO_SERIES, listDemoSeries } from './demo';
import type { DataProvider, NormalizedSeries } from './types';

export type { NormalizedSeries, SeriesPoint, DataProvider } from './types';

/**
 * Base class: tries a configured external endpoint, and on any failure falls
 * back to the matching demo series — flagged as degraded, never fabricated.
 */
abstract class BaseProvider implements DataProvider {
  abstract readonly key: string;
  abstract readonly label: string;
  protected abstract readonly endpoint: string;
  protected abstract readonly demoIds: string[];

  async list() {
    return this.demoIds
      .map((id) => DEMO_SERIES[id]?.())
      .filter((s): s is NormalizedSeries => Boolean(s))
      .map((s) => ({ id: s.id, name: s.name }));
  }

  async get(id: string): Promise<NormalizedSeries | null> {
    const demo = DEMO_SERIES[id];
    if (!this.demoIds.includes(id) || !demo) return null;

    if (!this.endpoint) {
      return demo();
    }

    try {
      const res = await fetch(`${this.endpoint}?series=${encodeURIComponent(id)}`, {
        next: { revalidate: 3600 },
      });
      if (!res.ok) throw new Error(`upstream ${res.status}`);
      const json = (await res.json()) as Partial<NormalizedSeries>;
      if (!Array.isArray(json.points) || json.points.length === 0) {
        throw new Error('empty upstream payload');
      }
      return { ...demo(), ...json, isDemo: false } as NormalizedSeries;
    } catch (err) {
      logger.warn('data provider fell back to demo series', {
        provider: this.key,
        id,
        message: err instanceof Error ? err.message : String(err),
      });
      const base = demo();
      return {
        ...base,
        degraded: {
          reason: 'Live data source unavailable; showing the latest cached demo dataset.',
          cachedFrom: base.lastUpdated,
        },
      };
    }
  }
}

export class SeaIceProvider extends BaseProvider {
  readonly key = 'sea-ice';
  readonly label = 'Sea Ice';
  protected readonly endpoint = env.NSIDC_SEA_ICE_API_URL;
  protected readonly demoIds = ['arctic-sea-ice-extent', 'antarctic-sea-ice-extent'];
}

export class ClimateProvider extends BaseProvider {
  readonly key = 'climate';
  readonly label = 'Climate & Atmosphere';
  protected readonly endpoint = env.CLIMATE_DATA_API_URL;
  protected readonly demoIds = ['arctic-temperature-anomaly', 'antarctic-snow-cover'];
}

export class OceanProvider extends BaseProvider {
  readonly key = 'ocean';
  readonly label = 'Ocean';
  protected readonly endpoint = env.OCEAN_DATA_API_URL;
  protected readonly demoIds = ['southern-ocean-sst'];
}

export class CryosphereProvider extends BaseProvider {
  readonly key = 'cryosphere';
  readonly label = 'Ice Sheets & Glaciers';
  protected readonly endpoint = '';
  protected readonly demoIds = ['greenland-ice-mass'];
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

export function anyExternalProviderConfigured(): boolean {
  return Boolean(
    env.NSIDC_SEA_ICE_API_URL || env.CLIMATE_DATA_API_URL || env.OCEAN_DATA_API_URL,
  );
}

export { listDemoSeries };
