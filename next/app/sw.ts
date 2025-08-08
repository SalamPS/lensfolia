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

// Detect environment - improved detection
const isDevelopment = 
  self.location.hostname === 'localhost' || 
  self.location.hostname === '127.0.0.1' ||
  self.location.hostname.includes('localhost') ||
  self.location.port === '3000';

// Disable dev logs appropriately
self.__WB_DISABLE_DEV_LOGS = !isDevelopment;

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
      networkTimeoutSeconds: isDevelopment ? 2 : 5,
      plugins: [
        {
          cacheWillUpdate: async ({ response }) => {
            return response.status === 200 ? response : null;
          },
        },
      ],
    }),
  },
  // Cache static assets with cache first - simplified
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
          cacheWillUpdate: async ({ response }) => {
            return response.status === 200 ? response : null;
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
      networkTimeoutSeconds: 8,
      plugins: [
        {
          cacheWillUpdate: async ({ response }) => {
            return response.status === 200 ? response : null;
          },
        },
      ],
    }),
  },
  // Cache images with cache first strategy - simplified
  {
    matcher: /\.(?:png|jpg|jpeg|gif|webp|svg|ico)$/,
    handler: new CacheFirst({
      cacheName: "images-cache",
      plugins: [
        {
          cacheWillUpdate: async ({ response }) => {
            return response.status === 200 ? response : null;
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
  navigationPreload: !isDevelopment, // Disable in development
  disableDevLogs: !isDevelopment,
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

// Enhanced install event listener with better error handling
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open('pages-cache');
        console.log('📦 Attempting to precache critical pages...');
        
        // Precache critical pages one by one with error handling
        const criticalPages = [
          '/',
          '/detect',
          '/encyclopedia', 
          '/forum',
          '/bookmarks',
        ];
        
        const manifestPage = '/manifest.webmanifest';
        
        // Cache critical pages
        for (const page of criticalPages) {
          try {
            await cache.add(page);
            console.log('✅ Cached:', page);
          } catch (err) {
            console.warn('⚠️ Failed to cache page:', page, err);
          }
        }
        
        // Try to cache manifest separately
        try {
          await cache.add(manifestPage);
          console.log('✅ Cached manifest');
        } catch (err) {
          console.warn('⚠️ Failed to cache manifest:', err);
        }
        
        console.log('📦 Manual precaching completed');
        
      } catch (error) {
        console.error('❌ Install event failed:', error);
        // Don't throw error to prevent installation failure
      }
    })()
  );
});

// Enhanced activate event for cleanup with better error handling
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activating...');
  
  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys();
        
        // Clean up old caches
        const cacheCleanupPromises = cacheNames
          .filter(cacheName => {
            // Delete old caches and problematic ones
            return cacheName.startsWith('old-') || 
                   cacheName.startsWith('v1-') ||
                   cacheName.includes('workbox') ||
                   cacheName.includes('serwist-precache');
          })
          .map(async cacheName => {
            try {
              console.log('🗑️ Deleting old cache:', cacheName);
              await caches.delete(cacheName);
              return true;
            } catch (err) {
              console.warn('⚠️ Failed to delete cache:', cacheName, err);
              return false;
            }
          });
        
        await Promise.allSettled(cacheCleanupPromises);
        
        // Claim clients for immediate control
        if (self.clients && self.clients.claim) {
          await self.clients.claim();
        }
        
        console.log('✅ Service Worker activated successfully');
        
      } catch (error) {
        console.error('❌ Activation failed:', error);
      }
    })()
  );
});

// Improved custom fetch handler for development mode
if (isDevelopment) {
  self.addEventListener('fetch', (event) => {
    // Only handle navigation requests in development
    if (event.request.mode === 'navigate') {
      event.respondWith(
        (async () => {
          try {
            // Try network first
            const response = await fetch(event.request);
            return response;
          } catch {
            console.log('🔄 Development offline fallback for:', event.request.url);
            
            try {
              // Try to find cached page first
              const cache = await caches.open('pages-cache');
              let cachedResponse = await cache.match(event.request);
              
              if (!cachedResponse) {
                // Fallback to homepage
                cachedResponse = await cache.match('/');
              }
              
              if (cachedResponse) {
                return cachedResponse;
              }
            } catch (cacheError) {
              console.warn('⚠️ Cache access failed:', cacheError);
            }
            
            // Last resort: create a basic offline page
            return new Response(
              `<!DOCTYPE html>
              <html>
                <head>
                  <title>Offline - LensFolia</title>
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <style>
                    body { 
                      font-family: Arial, sans-serif; 
                      text-align: center; 
                      padding: 50px;
                      background: #f5f5f5;
                    }
                    .container { 
                      max-width: 400px; 
                      margin: 0 auto;
                      background: white;
                      padding: 40px;
                      border-radius: 8px;
                      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    .icon { font-size: 64px; margin-bottom: 20px; }
                    button {
                      background: #007bff;
                      color: white;
                      border: none;
                      padding: 12px 24px;
                      border-radius: 6px;
                      cursor: pointer;
                      font-size: 16px;
                    }
                    button:hover { background: #0056b3; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="icon">🌱</div>
                    <h1>You're Offline</h1>
                    <p>LensFolia development mode is active.</p>
                    <p>Please check your internet connection and try again.</p>
                    <button onclick="window.location.reload()">Retry</button>
                  </div>
                </body>
              </html>`,
              {
                headers: { 'Content-Type': 'text/html' },
                status: 200
              }
            );
          }
        })()
      );
    }
  });
}

serwist.addEventListeners();

// Enhanced push notification event handler
self.addEventListener('push', function (event) {
  if (event.data) {
    try {
      const data = event.data.json();
      const options = {
        body: data.body,
        icon: data.icon || '/logo-asset-white.svg',
        badge: data.badge || '/logo-asset-white.svg',
        tag: data.tag || 'default',
        renotify: true,
        data: {
          dateOfArrival: Date.now(),
          primaryKey: Date.now().toString(),
          url: data.data?.url || '/',
          ...data.data
        },
        actions: data.actions || []
      };

      event.waitUntil(
        self.registration.showNotification(data.title, options)
      );
    } catch (error) {
      console.error('❌ Push notification error:', error);
    }
  }
});

// Enhanced notification click event handler
self.addEventListener('notificationclick', function (event) {
  console.log('🔔 Notification click received.');
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Get the URL to open
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    (async () => {
      try {
        const clientList = await self.clients.matchAll({
          type: 'window',
          includeUncontrolled: true
        });
        
        // Try to find existing window with our app
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            if ('navigate' in client) {
              await client.navigate(urlToOpen);
            }
            return client.focus();
          }
        }
        
        // If no existing window, open a new one
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
        
      } catch (error) {
        console.error('❌ Notification click error:', error);
        // Fallback: try to open window anyway
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      }
      
      return null;
    })()
  );
});
