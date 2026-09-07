import { CATALOG, TONE_GRADIENT, type CatalogSlot, type CuratedImage } from './catalog';

export interface EditorialImage {
  /** Ordered candidate URLs — try each until one loads. */
  candidates: string[];
  alt: string;
  credit: string;
  /** CSS gradient shown while loading and as the final fallback. */
  fallback: string;
  tone: CuratedImage['tone'];
}

function unsplashUrl(id: string, width: number, quality = 70): string {
  const base = id.startsWith('photo-') ? id : `photo-${id}`;
  return `https://images.unsplash.com/${base}?auto=format&fit=crop&w=${width}&q=${quality}`;
}

/**
 * Resolve a curated editorial image slot to candidate URLs + a gradient
 * fallback. Purely local — no network call, safe in any render context.
 */
export function getEditorialImage(
  slot: CatalogSlot,
  width = 1600,
): EditorialImage {
  const entry = CATALOG[slot];
  return {
    candidates: entry.ids.map((id) => unsplashUrl(id, width)),
    alt: entry.alt,
    credit: entry.credit,
    fallback: TONE_GRADIENT[entry.tone],
    tone: entry.tone,
  };
}

/** Deterministically pick a slot for a list item so a grid varies but is stable. */
export function pickSlot(seed: string, slots: CatalogSlot[]): CatalogSlot {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return slots[Math.abs(h) % slots.length]!;
}

/** Final-resort gradient for any image, keyed by an arbitrary string. */
export function imageFallback(seed = ''): string {
  const tones = Object.values(TONE_GRADIENT);
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return tones[Math.abs(h) % tones.length]!;
}

export { TONE_GRADIENT };
export type { CatalogSlot };
