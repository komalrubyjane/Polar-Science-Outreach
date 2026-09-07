import type { NormalizedSeries, SeriesPoint } from './types';

/**
 * Deterministic demo series generator.
 *
 * These are ILLUSTRATIVE shapes for populating the dashboard when no external
 * scientific API is configured. They are NOT measurements and every series
 * produced here carries `isDemo: true`. Do not cite these values.
 */

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function monthlySeries(opts: {
  seed: number;
  startYear: number;
  months: number;
  base: number;
  amplitude: number;
  seasonalPhase: number;
  trendPerYear: number;
  noise: number;
  min?: number;
  round?: number;
}): SeriesPoint[] {
  const rand = mulberry32(opts.seed);
  const points: SeriesPoint[] = [];
  for (let i = 0; i < opts.months; i++) {
    const year = opts.startYear + Math.floor(i / 12);
    const month = (i % 12) + 1;
    const yearsElapsed = i / 12;
    const seasonal =
      opts.amplitude * Math.sin(((month - opts.seasonalPhase) / 12) * 2 * Math.PI);
    const trend = opts.trendPerYear * yearsElapsed;
    const jitter = (rand() - 0.5) * 2 * opts.noise;
    let value = opts.base + seasonal + trend + jitter;
    if (opts.min != null) value = Math.max(opts.min, value);
    const factor = opts.round ?? 100;
    value = Math.round(value * factor) / factor;
    points.push({ t: `${year}-${String(month).padStart(2, '0')}`, value });
  }
  return points;
}

const NOW_ISO = () => new Date().toISOString().slice(0, 10);

export const DEMO_SERIES: Record<string, () => NormalizedSeries> = {
  'arctic-sea-ice-extent': () => ({
    id: 'arctic-sea-ice-extent',
    name: 'Arctic sea ice extent (demo)',
    unit: 'million km²',
    pole: 'ARCTIC',
    description:
      'Illustrative monthly Arctic sea ice extent with a seasonal cycle and a downward multi-year trend. Demo data for interface demonstration only.',
    methodology:
      'Synthetic series: seasonal sinusoid + linear trend + bounded noise. Not derived from satellite passive-microwave observations.',
    source: 'Demo dataset (generated)',
    sourceKey: 'DEMO' as const,
    cadence: 'demo' as const,
    license: 'CC0 1.0 (demo)',
    isDemo: true,
    lastUpdated: NOW_ISO(),
    points: monthlySeries({
      seed: 101,
      startYear: 2015,
      months: 128,
      base: 10.5,
      amplitude: 4.6,
      seasonalPhase: 9,
      trendPerYear: -0.06,
      noise: 0.22,
      min: 3.2,
    }),
  }),
  'antarctic-sea-ice-extent': () => ({
    id: 'antarctic-sea-ice-extent',
    name: 'Antarctic sea ice extent (demo)',
    unit: 'million km²',
    pole: 'ANTARCTIC',
    description:
      'Illustrative monthly Antarctic sea ice extent with a strong seasonal cycle. Demo data only.',
    methodology: 'Synthetic seasonal sinusoid + slight trend + bounded noise.',
    source: 'Demo dataset (generated)',
    sourceKey: 'DEMO' as const,
    cadence: 'demo' as const,
    license: 'CC0 1.0 (demo)',
    isDemo: true,
    lastUpdated: NOW_ISO(),
    points: monthlySeries({
      seed: 202,
      startYear: 2015,
      months: 128,
      base: 11.5,
      amplitude: 7.5,
      seasonalPhase: 3,
      trendPerYear: -0.04,
      noise: 0.3,
      min: 2.2,
    }),
  }),
  'arctic-temperature-anomaly': () => ({
    id: 'arctic-temperature-anomaly',
    name: 'Arctic near-surface temperature anomaly (demo)',
    unit: '°C vs 1981–2010 baseline',
    pole: 'ARCTIC',
    description:
      'Illustrative monthly Arctic temperature anomaly showing amplified warming. Demo data only.',
    methodology: 'Synthetic warming trend + seasonal variance + noise.',
    source: 'Demo dataset (generated)',
    sourceKey: 'DEMO' as const,
    cadence: 'demo' as const,
    license: 'CC0 1.0 (demo)',
    isDemo: true,
    lastUpdated: NOW_ISO(),
    points: monthlySeries({
      seed: 303,
      startYear: 2015,
      months: 128,
      base: 1.4,
      amplitude: 1.1,
      seasonalPhase: 1,
      trendPerYear: 0.08,
      noise: 0.5,
    }),
  }),
  'southern-ocean-sst': () => ({
    id: 'southern-ocean-sst',
    name: 'Southern Ocean sea-surface temperature (demo)',
    unit: '°C',
    pole: 'ANTARCTIC',
    description:
      'Illustrative Southern Ocean SST with a seasonal cycle and gentle trend. Demo data only.',
    methodology: 'Synthetic seasonal sinusoid + trend + noise.',
    source: 'Demo dataset (generated)',
    sourceKey: 'DEMO' as const,
    cadence: 'demo' as const,
    license: 'CC0 1.0 (demo)',
    isDemo: true,
    lastUpdated: NOW_ISO(),
    points: monthlySeries({
      seed: 404,
      startYear: 2015,
      months: 128,
      base: 3.1,
      amplitude: 2.3,
      seasonalPhase: 2,
      trendPerYear: 0.03,
      noise: 0.25,
      min: -1.8,
    }),
  }),
  'greenland-ice-mass': () => ({
    id: 'greenland-ice-mass',
    name: 'Greenland ice sheet mass change (demo)',
    unit: 'Gt relative to 2015',
    pole: 'ARCTIC',
    description:
      'Illustrative cumulative Greenland ice sheet mass anomaly showing net loss with a summer melt signal. Demo data only.',
    methodology: 'Synthetic negative trend + seasonal melt cycle + noise.',
    source: 'Demo dataset (generated)',
    sourceKey: 'DEMO' as const,
    cadence: 'demo' as const,
    license: 'CC0 1.0 (demo)',
    isDemo: true,
    lastUpdated: NOW_ISO(),
    points: monthlySeries({
      seed: 505,
      startYear: 2015,
      months: 128,
      base: 0,
      amplitude: 120,
      seasonalPhase: 7,
      trendPerYear: -255,
      noise: 40,
    }),
  }),
  'antarctic-snow-cover': () => ({
    id: 'antarctic-snow-cover',
    name: 'Antarctic Peninsula snow cover duration (demo)',
    unit: 'days per month',
    pole: 'ANTARCTIC',
    description:
      'Illustrative monthly snow-cover duration for the Antarctic Peninsula. Demo data only.',
    methodology: 'Synthetic seasonal cycle bounded to 0–31 days + noise.',
    source: 'Demo dataset (generated)',
    sourceKey: 'DEMO' as const,
    cadence: 'demo' as const,
    license: 'CC0 1.0 (demo)',
    isDemo: true,
    lastUpdated: NOW_ISO(),
    points: monthlySeries({
      seed: 606,
      startYear: 2018,
      months: 92,
      base: 16,
      amplitude: 13,
      seasonalPhase: 1,
      trendPerYear: -0.2,
      noise: 2.5,
      min: 0,
      round: 1,
    }).map((p) => ({ t: p.t, value: Math.min(31, Math.max(0, p.value)) })),
  }),
};

export function listDemoSeries() {
  return Object.values(DEMO_SERIES).map((f) => {
    const s = f();
    return { id: s.id, name: s.name };
  });
}
