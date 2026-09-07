import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/constants';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.longName,
    short_name: SITE.name,
    description: SITE.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#1E272E',
    theme_color: '#1E272E',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
  };
}
