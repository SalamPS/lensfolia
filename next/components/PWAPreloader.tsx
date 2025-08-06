'use client';

import { useEffect } from 'react';

export default function PWAPreloader() {
  useEffect(() => {
    // Pre-cache important pages when app loads
    const preloadPages = async () => {
      if ('serviceWorker' in navigator && 'caches' in window) {
        try {
          // Wait for service worker to be ready
          const registration = await navigator.serviceWorker.ready;
          
          if (registration.active) {
            // console.log('Pre-caching important pages and assets...');
            
            // Force cache important pages
            const pagesToCache = ['/', '/encyclopedia'];
            const cache = await caches.open('lensfolia-pages-v3');
            
            for (const page of pagesToCache) {
              try {
                // console.log('Caching page:', page);
                await cache.add(page);
              } catch (error) {
                console.warn('Failed to cache page:', page, error);
              }
            }
            
            // Force cache CSS files by triggering requests
            try {
              // console.log('Pre-caching CSS assets...');
              const staticCache = await caches.open('lensfolia-static-v3');
              
              // Get all CSS files from the current page
              const links = document.querySelectorAll('link[rel="stylesheet"]');
              for (const link of links) {
                try {
                  const href = link.getAttribute('href');
                  if (href && (href.includes('/_next/static/') || href.includes('.css'))) {
                    // console.log('Caching CSS:', href);
                    const response = await fetch(href);
                    if (response.ok) {
                      await staticCache.put(href, response);
                    }
                  }
                } catch (error) {
                  console.warn('Failed to cache CSS:', error);
                }
              }
              
              // Cache JS files as well
              const scripts = document.querySelectorAll('script[src]');
              for (const script of scripts) {
                try {
                  const src = script.getAttribute('src');
                  if (src && src.includes('/_next/static/')) {
                    // console.log('Caching JS:', src);
                    const response = await fetch(src);
                    if (response.ok) {
                      await staticCache.put(src, response);
                    }
                  }
                } catch (error) {
                  console.warn('Failed to cache JS:', error);
                }
              }
            } catch (error) {
              console.warn('Failed to pre-cache assets:', error);
            }
            
            // console.log('Pre-caching completed!');
          }
        } catch (error) {
          console.warn('Pre-caching failed:', error);
        }
      }
    };

    // Run preloading after a short delay to not block initial render
    const timer = setTimeout(preloadPages, 2000); // Increased delay for better asset discovery
    
    return () => clearTimeout(timer);
  }, []);

  return null; // This component doesn't render anything
}
