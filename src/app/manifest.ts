import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Bharat Sentinel',
    short_name: 'Sentinel',
    description: 'A high-velocity, professional Indian news portal.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F9FAFB',
    theme_color: '#CC0000',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
