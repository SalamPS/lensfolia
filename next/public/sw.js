const CACHE_NAME = 'lensfolia-v3';
const STATIC_CACHE = 'lensfolia-static-v3';
const PAGES_CACHE = 'lensfolia-pages-v3';

// Static assets to cache immediately
const staticAssets = [
  '/manifest.json',
  '/favicon.ico',
  '/logo-asset-black.svg',
  '/logo-asset-white.svg',
  '/LogoIcon.svg',
  '/hero-image.webp',
  '/hero-image-0.webp',
  '/not-found.svg',
  '/sparkle.svg',
  '/spotlight.svg',
];

// CSS and JS patterns to cache
const assetPatterns = [
  /_next\/static\/css\/.*/,
  /_next\/static\/chunks\/.*/,
  /_next\/static\/js\/.*/,
  /globals\.css/,
];

// Pages to pre-cache (will be cached when first visited)
const importantPages = [
  '/',
  '/encyclopedia',
  '/offline',
];

// Install service worker and cache resources
self.addEventListener('install', (event) => {
  // console.log('Service Worker installing...');
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        // console.log('Caching static assets');
        return cache.addAll(staticAssets);
      }),
      // Pre-cache important pages
      caches.open(PAGES_CACHE).then(async (cache) => {
        // console.log('Pre-caching important pages');
        // Cache offline page immediately
        await cache.add('/offline');
        // Note: Home and encyclopedia will be cached on first visit
      }),
      // Pre-cache common CSS/JS patterns
      caches.open(STATIC_CACHE).then(async () => {
        try {
          // Try to cache common Next.js assets
          // console.log('Pre-caching Next.js assets');
          // These will be attempted but may fail on first install - that's OK
        } catch {
          // console.log('Could not pre-cache Next.js assets (normal on first install)');
        }
      }),
    ])
  );
  // Force activation of new service worker
  self.skipWaiting();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle different types of requests
  if (request.destination === 'document') {
    // For HTML pages
    event.respondWith(handlePageRequest(request));
  } else if (request.destination === 'script' || request.destination === 'style' || 
             assetPatterns.some(pattern => pattern.test(url.pathname))) {
    // For JS/CSS assets - cache first strategy with aggressive caching
    event.respondWith(handleAssetRequest(request));
  } else if (request.destination === 'image') {
    // For images - cache first strategy
    event.respondWith(handleImageRequest(request));
  } else {
    // For other requests - network first with cache fallback
    event.respondWith(handleOtherRequest(request));
  }
});

// Handle page requests (HTML documents)
async function handlePageRequest(request) {
  const url = new URL(request.url);
  
  // For important pages, use stale-while-revalidate strategy
  if (importantPages.includes(url.pathname)) {
    try {
      // Try to get from cache first
      const cache = await caches.open(PAGES_CACHE);
      const cachedResponse = await cache.match(request);
      
      // Start network request (don't wait for it)
      const networkPromise = fetch(request).then(async (networkResponse) => {
        if (networkResponse.status === 200) {
          // Cache the new response
          await cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      }).catch(() => null);
      
      // If we have cached version, return it immediately
      // Update cache in background (fire and forget)
      if (cachedResponse) {
        // console.log('Serving from cache:', url.pathname);
        networkPromise.catch(() => console.log('Background update failed'));
        return cachedResponse;
      }
      
      // No cache, wait for network
      const networkResponse = await networkPromise;
      if (networkResponse) {
        return networkResponse;
      }
      
      // Network failed and no cache, show offline page
      return await cache.match('/offline') || new Response('Offline', { status: 503 });
      
    // } catch (error) {
    } catch {
      // console.log('Error handling page request:', error);
      const cache = await caches.open(PAGES_CACHE);
      return await cache.match('/offline') || new Response('Offline', { status: 503 });
    }
  }
  
  // For other pages, network first
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch {
    // Show offline page for any other failed requests
    const cache = await caches.open(PAGES_CACHE);
    return await cache.match('/offline') || new Response('Offline', { status: 503 });
  }
}

// Handle asset requests (JS/CSS) - More aggressive caching for Tailwind
async function handleAssetRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  const url = new URL(request.url);
  
  // For CSS and JS files, try cache first (aggressive caching)
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // console.log('Serving asset from cache:', url.pathname);
    return cachedResponse;
  }
  
  try {
    // console.log('Fetching and caching asset:', url.pathname);
    const networkResponse = await fetch(request);
    
    if (networkResponse.status === 200) {
      // Clone and cache the response
      const responseClone = networkResponse.clone();
      
      // Cache with long expiration for static assets
      await cache.put(request, responseClone);
      // console.log('Cached asset:', url.pathname);
    }
    
    return networkResponse;
  } catch (error) {
    console.warn('Failed to fetch asset:', url.pathname, error);
    return new Response('Asset not available offline', { 
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Handle image requests
async function handleImageRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch {
    // Return a placeholder or nothing for missing images
    return new Response('', { status: 503 });
  }
}

// Handle other requests (API calls, etc.)
async function handleOtherRequest(request) {
  try {
    return await fetch(request);
  } catch {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Service unavailable', { status: 503 });
  }
}

// Update service worker
self.addEventListener('activate', (event) => {
  // console.log('Service Worker activating...');
  const cacheWhitelist = [CACHE_NAME, STATIC_CACHE, PAGES_CACHE];
  event.waitUntil(
    Promise.all([
      // Clean old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheWhitelist.includes(cacheName)) {
              // console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Claim all clients
      self.clients.claim()
    ])
  );
});

// Handle push notifications (if needed later)
self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || '/LogoIcon.svg',
      badge: '/LogoIcon.svg',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2',
      },
    };
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

self.addEventListener('notificationclick', function (event) {
  // console.log('Notification click received.');
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
