import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LensFolia',
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
        src: '/LogoIcon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      // Add these when you have proper PWA icons
      // {
      //   src: '/pwa/icon-192x192.png',
      //   sizes: '192x192',
      //   type: 'image/png',
      // },
      // {
      //   src: '/pwa/icon-512x512.png',
      //   sizes: '512x512',
      //   type: 'image/png',
      // },
    ],
    // screenshots: [
    //   {
    //     form_factor: "wide",
    //     src: "/pwa/ss-wide.png",
    //     sizes: "1980x1080"
    //   },
    //   {
    //     form_factor: "narrow",
    //     src: "/pwa/ss-narrow.png",
    //     sizes: "413x769"
    //   },
    // ],
    categories: ['productivity', 'utilities'],
    lang: 'id',
    dir: 'ltr',
  }
}