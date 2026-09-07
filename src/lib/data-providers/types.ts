/**
 * Scientific data provider abstraction.
 *
 * Every provider returns a `NormalizedSeries` so the UI never couples to an
 * upstream API's shape. When no external endpoint is configured, providers
 * serve clearly-labelled demo data (`isDemo: true`). Providers NEVER fabricate
 * values and present them as live measurements — demo output is always flagged.
 */

export interface SeriesPoint {
  /** ISO date or `YYYY-MM` period label. */
  t: string;
  value: number;
}

export interface NormalizedSeries {
  id: string;
  name: string;
  unit: string;
  pole: 'ARCTIC' | 'ANTARCTIC' | 'BIPOLAR';
  description: string;
  methodology?: string;
  source: string;
  sourceUrl?: string;
  license: string;
  isDemo: boolean;
  /** When the underlying data was last refreshed by the source. */
  lastUpdated: string;
  /** Set when live fetch failed and cached / demo data is being shown. */
  degraded?: { reason: string; cachedFrom: string };
  points: SeriesPoint[];
}

export interface DataProvider {
  readonly key: string;
  readonly label: string;
  list(): Promise<{ id: string; name: string }[]>;
  get(id: string): Promise<NormalizedSeries | null>;
}
