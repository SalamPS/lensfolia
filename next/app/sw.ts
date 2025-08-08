import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig, RuntimeCaching } from "serwist";
import { Serwist, StaleWhileRevalidate, CacheFirst, NetworkFirst } from "serwist";

// This declares the value of `injectionPoint` to TypeScript.
// `injectionPoint` is the string that will be replaced by the
// actual precache manifest. By default, this string is set to
// `"self.__SW_MANIFEST"`.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope & {
  __WB_DISABLE_DEV_LOGS: boolean;
};

// Detect environment
const isDevelopment = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';

if (isDevelopment) self.__WB_DISABLE_DEV_LOGS = true;

// Enhanced runtime caching for better offline support
const customRuntimeCaching: RuntimeCaching[] = [
  // Cache pages with network first (important for offline functionality)
  {
    matcher: ({ request, sameOrigin }) => 
      sameOrigin && 
      request.mode === 'navigate' && 
      request.method === 'GET',
    handler: new NetworkFirst({
      cacheName: "pages-cache",
      networkTimeoutSeconds: isDevelopment ? 1 : 3, // Shorter timeout in dev
      plugins: [
        {
          cacheWillUpdate: async ({ response }) => {
            return response.status === 200 ? response : null;
          },
        },
      ],
    }),
  },
  // Cache static assets with cache first
  {
    matcher: ({ request }) => 
      request.destination === 'style' ||
      request.destination === 'script' ||
      request.destination === 'image' ||
      request.destination === 'font',
    handler: new CacheFirst({
      cacheName: "static-assets",
      plugins: [
        {
          cacheKeyWillBeUsed: async ({ request }) => {
            // Add version to prevent stale cache
            return `${request.url}?v=${Date.now()}`;
          },
        },
      ],
    }),
  },
  // Cache API responses with network first strategy
  {
    matcher: ({ url, sameOrigin }) => 
      sameOrigin && url.pathname.startsWith('/api/'),
    handler: new NetworkFirst({
      cacheName: "api-cache",
      networkTimeoutSeconds: 5,
      plugins: [
        {
          cacheWillUpdate: async ({ response }) => {
            return response.status === 200 ? response : null;
          },
        },
      ],
    }),
  },
  // Cache images with cache first strategy
  {
    matcher: /\.(?:png|jpg|jpeg|gif|webp|svg|ico)$/,
    handler: new CacheFirst({
      cacheName: "images-cache",
      plugins: [
        {
          cacheKeyWillBeUsed: async ({ request }) => {
            return `${request.url}?version=1`;
          },
        },
      ],
    }),
  },
  // Cache Google Fonts
  {
    matcher: /^https:\/\/fonts\.(googleapis|gstatic)\.com/,
    handler: new StaleWhileRevalidate({
      cacheName: "google-fonts",
    }),
  },
  // Cache other external resources
  {
    matcher: /^https:\/\/.*\.(js|css|woff|woff2|ttf|eot)$/,
    handler: new StaleWhileRevalidate({
      cacheName: "external-resources",
    }),
  },
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  disableDevLogs: false, // Enable logs for debugging
  fallbacks: {
    entries: [
      {
        url: "/",
        matcher: ({ request }) => request.mode === 'navigate'
      }
    ]
  },
  runtimeCaching: [
    ...defaultCache,
    ...customRuntimeCaching,
  ],
});

// Add install event listener to cache critical pages
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    caches.open('pages-cache').then(cache => {
      console.log('📦 Precaching critical pages...');
      // Cache critical pages manually
      return cache.addAll([
        '/',
        '/detect',
        '/encyclopedia', 
        '/forum',
        '/bookmarks',
        '/manifest.webmanifest',
      ]).catch(err => {
        console.warn('⚠️ Failed to precache some pages:', err);
      });
    })
  );
});

// Add activate event for cleanup
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activated');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => {
            // Delete old caches if needed
            return cacheName.startsWith('old-') || cacheName.startsWith('v1-');
          })
          .map(cacheName => {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
});

// Custom fetch handler for development mode
if (isDevelopment) {
  self.addEventListener('fetch', (event) => {
    // Only handle navigation requests in development
    if (event.request.mode === 'navigate') {
      event.respondWith(
        fetch(event.request).catch(async () => {
          console.log('🔄 Development offline fallback for:', event.request.url);
          
          // Try to find cached page first
          const cache = await caches.open('pages-cache');
          let response = await cache.match(event.request);
          
          if (!response) {
            // Fallback to homepage
            response = await cache.match('/');
          }
          
          if (!response) {
            // Last resort: create a basic offline page
            return new Response(
              `<!DOCTYPE html>
              <html>
                <head>
                  <title>Offline - ReaksJS</title>
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                    .container { max-width: 400px; margin: 0 auto; }
                    .icon { font-size: 64px; margin-bottom: 20px; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="icon">🔌</div>
                    <h1>You're Offline</h1>
                    <p>Development mode offline fallback is active.</p>
                    <p>Please check your internet connection and try again.</p>
                    <button onclick="window.location.reload()">Retry</button>
                  </div>
                </body>
              </html>`,
              {
                headers: { 'Content-Type': 'text/html' }
              }
            );
          }
          
          return response;
        })
      );
    }
  });
}

serwist.addEventListeners();

// Push notification event handler
self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || '/logo-asset-white.svg',
      badge: data.badge || '/logo-asset-white.svg',
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '1',
        url: data.data?.url || '/',
        ...data.data
      }
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click event handler
self.addEventListener('notificationclick', function (event) {
  console.log('Notification click received.');
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Get the URL to open
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    self.clients.matchAll({
      type: 'window'
    }).then(function (clientList: readonly WindowClient[]) {
      // Try to find existing window with our app
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      
      // If no existing window, open a new one
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
      return null;
    })
  );
});
