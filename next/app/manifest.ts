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
    id: '/',
    scope: '/',
    icons: [
      {
        src: '/pwa/LogoRounded_72_Asset.svg',
        sizes: '72x72',
        type: 'image/svg+xml',
        purpose: 'any'
      },
      {
        src: '/pwa/LogoRounded_144_Asset.svg',
        sizes: '144x144',
        type: 'image/svg+xml',
        purpose: 'any'
      },
      {
        src: '/pwa/LogoRounded_150_Asset.svg',
        sizes: '150x150',
        type: 'image/svg+xml',
        purpose: 'any'
      },
      {
        src: '/pwa/LogoRounded_192_Asset.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'any'
      },
    ],
    screenshots: [
      {
        src: '/pwa/screenshot1.svg',
        sizes: '267x150',
        type: 'image/svg+xml',
        form_factor: 'wide',
      },
      {
        src: '/pwa/screenshot2.svg',
        sizes: '84x150',
        type: 'image/svg+xml',
      },
    ],
    categories: ['education', 'utilities', 'productivity'],
    lang: 'id',
    dir: 'ltr'
  }
}