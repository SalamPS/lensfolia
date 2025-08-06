import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LensFolia - Deteksi Penyakit Tanaman',
    short_name: 'LensFolia',
    description: 'Deteksi Penyakit Tanaman Melalui Daun dalam Sekejap dengan AI menggunakan LensFolia!',
    start_url: '/',
    display: 'standalone',
    background_color: '#18181b',
    theme_color: '#f0fdfa',
    orientation: 'portrait',
    scope: '/',
    icons: [
      {
        src: '/logo-asset-black.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any'
      },
      {
        src: '/logo-asset-white.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any'
      },
      {
        src: '/LogoIcon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable'
      }
    ],
    categories: ['education', 'utilities', 'productivity'],
    lang: 'id',
    dir: 'ltr'
  }
}