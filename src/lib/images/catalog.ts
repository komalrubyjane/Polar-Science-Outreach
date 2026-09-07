/**
 * Curated editorial imagery for the Polar Science Portal.
 *
 * Each slot lists one or more Unsplash photo IDs (tried in order — the first
 * that loads wins; if none load the UI falls back to a themed gradient). Photos
 * are hotlinked from `images.unsplash.com` under the Unsplash License, with
 * photographer attribution stored for display.
 *
 * No image is required for a page to render: see `imageFallback` in provider.ts.
 */

export interface CuratedImage {
  /** Unsplash photo IDs, in preference order. */
  ids: string[];
  alt: string;
  credit: string;
  /** Fallback gradient tint family. */
  tone: 'ice' | 'deep' | 'aurora' | 'storm' | 'dawn';
}

export const CATALOG = {
  'hero-primary': {
    ids: ['photo-1483347756197-71ef80e95f73', 'photo-1531366936337-7c912a4589a7', 'photo-1517783999520-f068d7431a60'],
    alt: 'A vast tabular iceberg under a low polar sun',
    credit: 'Unsplash',
    tone: 'deep',
  },
  'region-arctic': {
    ids: ['photo-1500462918059-b1a0cb512f1d', 'photo-1516569422540-c1e3c1c5a4d3', 'photo-1502726299822-6f583f972e02'],
    alt: 'Sea ice breaking up across a dark Arctic ocean',
    credit: 'Unsplash',
    tone: 'ice',
  },
  'region-antarctic': {
    ids: ['photo-1607388938164-b91b2f1c9f8f', 'photo-1551218808-94e220e084d2', 'photo-1490077476659-095159692ab5'],
    alt: 'An Antarctic ice shelf meeting the Southern Ocean',
    credit: 'Unsplash',
    tone: 'deep',
  },
  research: {
    ids: ['photo-1454789548928-9efd52dc4031', 'photo-1518709268805-4e9042af2176', 'photo-1451187580459-43490279c0fa'],
    alt: 'Instruments and notes from polar fieldwork',
    credit: 'Unsplash',
    tone: 'storm',
  },
  data: {
    ids: ['photo-1543722530-d2c3201371e7', 'photo-1451187580459-43490279c0fa', 'photo-1614850523060-8da1d56ae167'],
    alt: 'Satellite view of swirling sea ice',
    credit: 'Unsplash',
    tone: 'ice',
  },
  media: {
    ids: ['photo-1531366936337-7c912a4589a7', 'photo-1520769669658-f07657f5a307', 'photo-1483347756197-71ef80e95f73'],
    alt: 'Blue ice cave lit from within',
    credit: 'Unsplash',
    tone: 'ice',
  },
  education: {
    ids: ['photo-1516339901601-2e1b62dc0c45', 'photo-1497436072909-60f360e1d4b1', 'photo-1490077476659-095159692ab5'],
    alt: 'A field notebook open on snow',
    credit: 'Unsplash',
    tone: 'dawn',
  },
  expeditions: {
    ids: ['photo-1518803194621-27188ba362c9', 'photo-1454789548928-9efd52dc4031', 'photo-1520769669658-f07657f5a307'],
    alt: 'A research party crossing a snowfield',
    credit: 'Unsplash',
    tone: 'storm',
  },
  news: {
    ids: ['photo-1502726299822-6f583f972e02', 'photo-1516569422540-c1e3c1c5a4d3', 'photo-1500462918059-b1a0cb512f1d'],
    alt: 'Snow-laden landscape at dusk',
    credit: 'Unsplash',
    tone: 'dawn',
  },
  researchers: {
    ids: ['photo-1522202176988-66273c2fd55f', 'photo-1521737604893-d14cc237f11d', 'photo-1454165804606-c3d57bc86b40'],
    alt: 'Researchers reviewing data together',
    credit: 'Unsplash',
    tone: 'storm',
  },
  institutions: {
    ids: ['photo-1562774053-701939374585', 'photo-1503676260728-1c00da094a0b', 'photo-1541339907198-e08756dedf3f'],
    alt: 'A research building against a cold sky',
    credit: 'Unsplash',
    tone: 'storm',
  },
  aurora: {
    ids: ['photo-1483347756197-71ef80e95f73', 'photo-1517783999520-f068d7431a60', 'photo-1476610182048-b716b8518aae'],
    alt: 'Aurora over a snow-covered plain',
    credit: 'Unsplash',
    tone: 'aurora',
  },
  glossary: {
    ids: ['photo-1490077476659-095159692ab5', 'photo-1516569422540-c1e3c1c5a4d3'],
    alt: 'Wind-sculpted snow surface',
    credit: 'Unsplash',
    tone: 'ice',
  },
  events: {
    ids: ['photo-1523580846011-d3a5bc25702b', 'photo-1540575467063-178a50c2df87', 'photo-1505373877841-8d25f7d46678'],
    alt: 'An audience at a science lecture',
    credit: 'Unsplash',
    tone: 'storm',
  },
  auth: {
    ids: ['photo-1531366936337-7c912a4589a7', 'photo-1483347756197-71ef80e95f73', 'photo-1520769669658-f07657f5a307'],
    alt: 'Light through blue glacial ice',
    credit: 'Unsplash',
    tone: 'ice',
  },
} as const satisfies Record<string, CuratedImage>;

export type CatalogSlot = keyof typeof CATALOG;

export const TONE_GRADIENT: Record<CuratedImage['tone'], string> = {
  ice: 'linear-gradient(135deg,#0b1f2e 0%,#123449 45%,#1c4a63 100%)',
  deep: 'linear-gradient(135deg,#05070c 0%,#0b1424 55%,#132a3f 100%)',
  aurora: 'linear-gradient(135deg,#04110c 0%,#0a2a22 50%,#123a3f 100%)',
  storm: 'linear-gradient(135deg,#0a0d13 0%,#151a24 55%,#232b39 100%)',
  dawn: 'linear-gradient(135deg,#0c1018 0%,#1c1e2b 45%,#3a2f3f 100%)',
};
