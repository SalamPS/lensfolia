'use client';

import { useEffect } from 'react';

export default function PWAPreloader() {
  useEffect(() => {
    // Pre-cache important pages when app loads
    const preloadPages = async () => {
      if ('serviceWorker' in navigator && 'caches' in window) {
        try {
          // Check if we're in development
          const isDevelopment = window.location.hostname === 'localhost' || 
                               window.location.hostname.includes('127.0.0.1');
          
          if (isDevelopment) {
            console.log('Skipping aggressive pre-caching in development mode');
            return;
          }
          
          // Wait for service worker to be ready
          const registration = await navigator.serviceWorker.ready;
          
          if (registration.active) {
            console.log('Pre-caching important pages...');
            
            // Force cache important pages
            const pagesToCache = ['/', '/encyclopedia'];
            const cache = await caches.open('lensfolia-pages-v4');
            
            for (const page of pagesToCache) {
              try {
                console.log('Caching page:', page);
                await cache.add(page);
              } catch (error) {
                console.warn('Failed to cache page:', page, error);
              }
            }
            
            console.log('Pre-caching completed!');
          }
        } catch (error) {
          console.warn('Pre-caching failed:', error);
        }
      }
    };

    // Run preloading after a short delay to not block initial render
    const timer = setTimeout(preloadPages, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  return null; // This component doesn't render anything
}
