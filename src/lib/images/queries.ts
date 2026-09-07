import type { CatalogSlot } from './catalog';

/**
 * Search-term mapping for each editorial image slot. Used by the (optional)
 * Unsplash provider when a key is configured; otherwise the curated photo IDs
 * in `catalog.ts` are used directly (no request at render time).
 */
export const IMAGE_QUERIES: Record<CatalogSlot, string> = {
  'hero-primary': 'Antarctica glacier aerial ice',
  'region-arctic': 'Arctic sea ice ocean satellite',
  'region-antarctic': 'Antarctic ice shelf Southern Ocean',
  research: 'polar scientist research Antarctica fieldwork',
  data: 'sea ice satellite view swirl',
  media: 'blue glacier ice cave',
  education: 'field notebook snow science',
  expeditions: 'Antarctic expedition research party snowfield',
  news: 'polar landscape dusk snow',
  researchers: 'scientists reviewing data laboratory',
  institutions: 'research building cold sky',
  aurora: 'aurora borealis snow plain',
  glossary: 'wind-sculpted snow surface',
  events: 'science conference lecture audience',
  auth: 'light through glacial blue ice',
};
