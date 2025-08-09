'use client';

import { useEffect } from 'react';

export default function PWAInstaller() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator
    ) {
      // Service worker is automatically registered by Serwist in Next.js
      // We just need to listen for events
      
      const handleSerwistReady = () => {
        if (window.serwist) {
          // Listen for updates
          window.serwist.addEventListener('waiting', () => {
            console.log('🔄 New app version is available');
            
            // Show update notification or automatically update
            if (confirm('New version available! Update now?')) {
              window.serwist.messageSkipWaiting();
            }
          });

          // Listen for controlling
          window.serwist.addEventListener('controlling', () => {
            console.log('🚀 App updated successfully');
            // Reload the page to load the new version
            window.location.reload();
          });
        }
      };

      // Check if serwist is already available
      if (window.serwist) {
        handleSerwistReady();
      } else {
        // Wait for serwist to be available
        const checkSerwist = setInterval(() => {
          if (window.serwist) {
            handleSerwistReady();
            clearInterval(checkSerwist);
          }
        }, 100);

        // Cleanup interval after 5 seconds
        setTimeout(() => clearInterval(checkSerwist), 5000);
      }
    }
  }, []);

  return null;
}
