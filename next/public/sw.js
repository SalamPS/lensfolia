const CACHE_NAME = 'lensfolia-v4';
const STATIC_CACHE = 'lensfolia-static-v4';
const PAGES_CACHE = 'lensfolia-pages-v4';

// Check if we're in development mode
const isDevelopment = self.location.hostname === 'localhost' || 
                     self.location.hostname.includes('127.0.0.1') ||
                     self.location.port === '3000' ||
                     self.location.port === '3001';

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

// Pages to pre-cache (will be cached when first visited)
const importantPages = [
  '/',
  '/encyclopedia',
  '/offline',
];

// Install service worker and cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...', isDevelopment ? '(Development Mode)' : '(Production Mode)');
  
  if (isDevelopment) {
    // In development, cache less aggressively
    event.waitUntil(
      caches.open(PAGES_CACHE).then(async (cache) => {
        console.log('Pre-caching offline page only (dev mode)');
        await cache.add('/offline');
      })
    );
  } else {
    // In production, cache everything
    event.waitUntil(
      Promise.all([
        // Cache static assets
        caches.open(STATIC_CACHE).then((cache) => {
          console.log('Caching static assets');
          return cache.addAll(staticAssets);
        }),
        // Pre-cache important pages
        caches.open(PAGES_CACHE).then(async (cache) => {
          console.log('Pre-caching important pages');
          await cache.add('/offline');
        }),
      ])
    );
  }
  
  // Force activation of new service worker
  self.skipWaiting();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Skip chrome-extension and other non-standard protocols
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  // Skip Next.js internal requests during development
  if (url.pathname.startsWith('/_next/webpack-hmr') || 
      url.pathname.startsWith('/_next/static/webpack/') ||
      url.search.includes('_rsc') ||
      url.pathname.includes('__nextjs_launch-editor')) {
    return;
  }

  // Handle different types of requests
  if (request.destination === 'document') {
    // For HTML pages
    event.respondWith(handlePageRequest(request));
  } else if (request.destination === 'script' || request.destination === 'style') {
    // For JS/CSS assets - be more careful in dev mode
    event.respondWith(handleAssetRequest(request));
  } else if (request.destination === 'image') {
    // For images - cache first strategy
    event.respondWith(handleImageRequest(request));
  } else {
    // For other requests (API calls, fonts, etc.) - network first with cache fallback
    event.respondWith(handleOtherRequest(request));
  }
});

// Handle page requests (HTML documents)
async function handlePageRequest(request) {
  const url = new URL(request.url);
  
  // In development mode, always prioritize network
  if (url.hostname === 'localhost' || url.hostname.includes('127.0.0.1')) {
    try {
      const networkResponse = await fetch(request);
      
      // Cache successful responses for offline fallback
      if (networkResponse.status === 200 && importantPages.includes(url.pathname)) {
        const cache = await caches.open(PAGES_CACHE);
        cache.put(request, networkResponse.clone());
      }
      
      return networkResponse;
    } catch {
      // Fallback to cache only if network completely fails
      if (importantPages.includes(url.pathname)) {
        const cache = await caches.open(PAGES_CACHE);
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          console.log('Serving from cache (network failed):', url.pathname);
          return cachedResponse;
        }
      }
      
      // Show offline page
      const cache = await caches.open(PAGES_CACHE);
      return await cache.match('/offline') || new Response('Offline', { status: 503 });
    }
  }
  
  // For production, use stale-while-revalidate strategy
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
      if (cachedResponse) {
        console.log('Serving from cache:', url.pathname);
        // Update cache in background (fire and forget)
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
      
    } catch (error) {
      console.log('Error handling page request:', error);
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

// Handle asset requests (JS/CSS)
async function handleAssetRequest(request) {
  const url = new URL(request.url);
  
  // In development mode, always prioritize network for CSS/JS
  // to avoid FOUC and ensure HMR works
  if (url.hostname === 'localhost' || url.hostname.includes('127.0.0.1')) {
    try {
      // Network first for development
      const networkResponse = await fetch(request);
      
      // Only cache successful responses that are not dev-specific
      if (networkResponse.status === 200 && 
          !url.pathname.includes('webpack') && 
          !url.pathname.includes('hmr')) {
        const cache = await caches.open(STATIC_CACHE);
        cache.put(request, networkResponse.clone());
      }
      
      return networkResponse;
    } catch {
      // Fallback to cache if network fails
      const cache = await caches.open(STATIC_CACHE);
      const cachedResponse = await cache.match(request);
      return cachedResponse || new Response('Asset not available', { status: 503 });
    }
  }
  
  // For production, cache first
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
    return new Response('Asset not available offline', { status: 503 });
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
  const url = new URL(request.url);
  
  // Allow external API calls (Supabase, GitHub avatars, etc.)
  const allowedDomains = [
    'ucofsfjumfhpuhnptaro.supabase.co',
    'avatars.githubusercontent.com',
		'lh3.googleusercontent.com',
    'a-z-animals.com',
    's3.amazonaws.com',
    'tse2.mm.bing.net'
  ];
  
  // If it's an external API call to allowed domains, pass through
  if (allowedDomains.some(domain => url.hostname.includes(domain))) {
    try {
      return await fetch(request);
    } catch (error) {
      console.log('External API call failed:', url.href, error);
      return new Response(JSON.stringify({ error: 'Service unavailable' }), { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  // For other requests, try cache first then network
  try {
    return await fetch(request);
  } catch {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Service unavailable', { status: 503 });
  }
}

// Update service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  const cacheWhitelist = [CACHE_NAME, STATIC_CACHE, PAGES_CACHE];
  event.waitUntil(
    Promise.all([
      // Clean old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheWhitelist.includes(cacheName)) {
              console.log('Deleting old cache:', cacheName);
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
  console.log('Notification click received.');
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
