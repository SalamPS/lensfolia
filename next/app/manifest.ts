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
        src: '/pwa/LogoRounded_72_Asset 12.svg',
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
        src: '/pwa/LogoRounded_192_Asset.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'any'
      },
      {
        src: '/pwa/LogoRounded_512_Asset.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any'
      },
      {
        src: '/pwa/LogoRounded_192_Asset.ico',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'maskable'
      }
    ],
    screenshots: [
      {
        src: '/pwa/screenshot1.svg',
        sizes: '1080x1920',
        type: 'image/svg+xml',
      },
      {
        src: '/pwa/screenshot2.svg',
        sizes: '1920x1080',
        type: 'image/svg+xml',
      }
    ],
    categories: ['education', 'utilities', 'productivity'],
    lang: 'id',
    dir: 'ltr'
  }
}