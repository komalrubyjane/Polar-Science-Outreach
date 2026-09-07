import { cache } from 'react';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import type { SeriesPoint } from './types';

/**
 * NSIDC Sea Ice Index (Version 4) — real, public, no credentials required.
 *
 * We read the daily sea-ice-extent CSV published by NSIDC at NOAA@NSIDC and
 * aggregate it to monthly means for charting. Fetches are cached for 6 hours
 * (Next.js data cache) and deduplicated across the request.
 *
 * Source: https://nsidc.org/data/seaice_index  ·  https://nsidc.org/data/g02135
 * Citation: Fetterer, F., K. Knowles, W. N. Meier, M. Savoie, and A. K. Windnagel.
 *   Sea Ice Index, Version 4. Boulder, Colorado USA. NSIDC. doi:10.7265/N5K072F8
 */

const BASE = env.NSIDC_SEA_ICE_API_URL.replace(/\/$/, '');

export const NSIDC_META = {
  source: 'NSIDC Sea Ice Index, Version 4',
  sourceUrl: 'https://nsidc.org/data/seaice_index',
  license: 'Freely available (NSIDC / NOAA@NSIDC). Please cite.',
  citation:
    'Fetterer, F., K. Knowles, W. N. Meier, M. Savoie, and A. K. Windnagel. Sea Ice Index, Version 4. Boulder, Colorado USA. NSIDC. https://doi.org/10.7265/N5K072F8',
  methodology:
    'Passive-microwave satellite retrieval (NASA Team algorithm), daily sea-ice extent (area with ≥15% concentration). Values here are monthly means of the daily NSIDC product.',
} as const;

export interface NsidcResult {
  points: SeriesPoint[];
  /** ISO date of the most recent daily observation in the file. */
  lastObservation: string;
}

function csvUrl(hemisphere: 'north' | 'south'): string {
  const h = hemisphere === 'north' ? 'N' : 'S';
  return `${BASE}/${hemisphere}/daily/data/${h}_seaice_extent_daily_v4.0.csv`;
}

/** Fetch + parse + monthly-aggregate NSIDC daily sea-ice extent. */
export const fetchNsidcSeaIce = cache(
  async (
    hemisphere: "north" | "south",
    yearsBack = 9,
  ): Promise<NsidcResult> => {
  const url = csvUrl(hemisphere);
  const res = await fetch(url, {
    next: { revalidate: 60 * 60 * 6 },
    headers: { accept: 'text/csv' },
  });
  if (!res.ok) throw new Error(`NSIDC ${res.status} for ${url}`);
  const text = await res.text();

  const lines = text.split('\n');
  // Row 0 = column names, row 1 = units. Data starts at row 2.
  const cutoffYear = new Date().getUTCFullYear() - yearsBack;
  const monthly = new Map<string, { sum: number; n: number }>();
  let lastObservation = '';

  for (let i = 2; i < lines.length; i++) {
    const raw = lines[i]?.trim();
    if (!raw) continue;
    const cols = raw.split(',').map((c) => c.trim());
    const year = Number(cols[0]);
    const month = Number(cols[1]);
    const day = Number(cols[2]);
    const extent = Number(cols[3]);
    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(extent)) continue;
    if (extent <= 0) continue; // NSIDC uses -9999 / blank for missing
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (dateStr > lastObservation) lastObservation = dateStr;
    if (year < cutoffYear) continue;
    const key = `${year}-${String(month).padStart(2, '0')}`;
    const bucket = monthly.get(key) ?? { sum: 0, n: 0 };
    bucket.sum += extent;
    bucket.n += 1;
    monthly.set(key, bucket);
  }

  const points: SeriesPoint[] = [...monthly.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([t, { sum, n }]) => ({ t, value: Math.round((sum / n) * 100) / 100 }));

  if (points.length === 0) throw new Error('NSIDC CSV parsed to zero points');

  logger.info('NSIDC sea ice fetched', {
    hemisphere,
    points: points.length,
    lastObservation,
  });

    return { points, lastObservation };
  },
);
