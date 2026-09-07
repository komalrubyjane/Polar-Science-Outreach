import 'server-only';
import { logger } from '@/lib/logger';

/**
 * Optional Unsplash search provider. Only active when UNSPLASH_ACCESS_KEY is set.
 * The key is read server-side only and is never exposed to the client.
 *
 * The portal never depends on this at request time — curated imagery in
 * `catalog.ts` is always available. This is for editors browsing imagery.
 */

const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY ?? '';

export const unsplashEnabled = Boolean(ACCESS_KEY);

export interface RemoteImage {
  id: string;
  url: string;
  thumb: string;
  alt: string;
  credit: string;
  creditUrl: string;
}

export async function searchImages(query: string, perPage = 12): Promise<RemoteImage[]> {
  if (!unsplashEnabled) return [];
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape&content_filter=high`,
      {
        headers: { Authorization: `Client-ID ${ACCESS_KEY}` },
        next: { revalidate: 60 * 60 * 24 },
      },
    );
    if (!res.ok) throw new Error(`unsplash ${res.status}`);
    const json = (await res.json()) as {
      results: Array<{
        id: string;
        urls: { regular: string; thumb: string };
        alt_description: string | null;
        user: { name: string; links: { html: string } };
      }>;
    };
    return json.results.map((r) => ({
      id: r.id,
      url: r.urls.regular,
      thumb: r.urls.thumb,
      alt: r.alt_description ?? query,
      credit: r.user.name,
      creditUrl: `${r.user.links.html}?utm_source=polar_science_portal&utm_medium=referral`,
    }));
  } catch (err) {
    logger.warn('unsplash search failed', {
      message: err instanceof Error ? err.message : String(err),
    });
    return [];
  }
}
