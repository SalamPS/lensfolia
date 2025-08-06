'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function PWAStatus() {
  const [isServiceWorkerActive, setIsServiceWorkerActive] = useState(false);
  const [cacheInfo, setCacheInfo] = useState<{
    count: number;
    size: string;
    caches: string[];
  } | null>(null);

  const updateCacheInfo = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        let totalSize = 0;
        let totalEntries = 0;

        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName);
          const requests = await cache.keys();
          totalEntries += requests.length;
          
          // Rough size estimation
          for (const request of requests.slice(0, 10)) { // Limit to avoid performance issues
            try {
              const response = await cache.match(request);
              if (response) {
                const blob = await response.blob();
                totalSize += blob.size;
              }
            } catch {
              // Ignore individual request errors
            }
          }
        }

        setCacheInfo({
          count: totalEntries,
          size: formatBytes(totalSize),
          caches: cacheNames
        });
      } catch (error) {
        console.warn('Failed to get cache info:', error);
      }
    }
  };

  useEffect(() => {
    // Check service worker status
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.active) {
          setIsServiceWorkerActive(true);
          console.log('✅ Service Worker is active and ready');
        }
      });

      // Listen for service worker updates
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('SW Message:', event.data);
        if (event.data.type === 'CACHE_UPDATED') {
          updateCacheInfo();
        }
      });
    }

    // Initial cache info
    updateCacheInfo();

    // Update cache info every 5 seconds
    const interval = setInterval(updateCacheInfo, 5000);
    
    return () => clearInterval(interval);
  }, [updateCacheInfo]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const clearCache = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
        setCacheInfo({ count: 0, size: '0 Bytes', caches: [] });
        console.log('🧹 All caches cleared');
        
        // Reload to get fresh content
        window.location.reload();
      } catch (error) {
        console.error('Failed to clear caches:', error);
      }
    }
  };

  const forceRefreshSW = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.unregister();
        window.location.reload();
      }
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-30 bg-card border rounded-lg p-3 shadow-lg text-xs max-w-72">
      <div className="mb-2">
        <h4 className="font-semibold text-sm mb-1">PWA Status</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isServiceWorkerActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span>Service Worker: {isServiceWorkerActive ? 'Active' : 'Inactive'}</span>
          </div>
          
          {cacheInfo && (
            <div className="text-muted-foreground">
              <div>Cached files: {cacheInfo.count}</div>
              <div>Cache size: {cacheInfo.size}</div>
              <div>Caches: {cacheInfo.caches.length}</div>
              <div className="text-xs opacity-70">
                {cacheInfo.caches.join(', ')}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-1">
        <Button 
          onClick={clearCache} 
          variant="outline" 
          size="sm" 
          className="w-full h-7 text-xs"
        >
          Clear Cache
        </Button>
        <Button 
          onClick={forceRefreshSW} 
          variant="ghost" 
          size="sm" 
          className="w-full h-7 text-xs"
        >
          Refresh SW
        </Button>
      </div>
    </div>
  );
}
