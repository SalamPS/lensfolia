'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showOnlineMessage, setShowOnlineMessage] = useState(false);

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine);

    // Check if app is already installed
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || 
          ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true)) {
        setIsInstalled(true);
      }
    };
    checkInstalled();

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlineMessage(true);
      // Hide online message after 3 seconds
      setTimeout(() => setShowOnlineMessage(false), 3000);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for PWA install prompt (only show if not already installed)
    const handleBeforeInstallPrompt = (e: Event) => {
      if (!isInstalled) {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        // Delay showing prompt for better UX
        setTimeout(() => setShowInstallPrompt(true), 3000);
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      console.log('🎉 LensFolia PWA installed successfully!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      setIsInstalling(true);
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('🎉 User accepted the install prompt');
        setShowInstallPrompt(false);
        setDeferredPrompt(null);
      } else {
        console.log('❌ User dismissed the install prompt');
      }
    } catch (error) {
      console.error('Error during installation:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);
    setDeferredPrompt(null);
  };

  return (
    <>
      {/* Offline Indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-black px-4 py-2 text-center text-sm font-medium animate-pulse">
          📴 Anda sedang offline. Beberapa fitur mungkin tidak tersedia.
        </div>
      )}

      {/* Success message when back online */}
      {showOnlineMessage && isOnline && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-green-500 text-white px-4 py-2 text-center text-sm font-medium transform translate-y-0 transition-all duration-300 ease-in-out">
          ✅ Kembali online!
        </div>
      )}

      {/* Install PWA Prompt */}
      {showInstallPrompt && !isInstalled && (
        <div className="fixed bottom-4 left-4 right-4 z-50 bg-card border rounded-lg p-4 shadow-lg max-w-md mx-auto animate-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">📱 Install LensFolia</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Install aplikasi untuk akses lebih cepat dan fitur offline
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={dismissInstallPrompt}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            >
              ✕
            </Button>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={dismissInstallPrompt}
              className="flex-1"
              disabled={isInstalling}
            >
              Nanti
            </Button>
            <Button 
              size="sm" 
              onClick={handleInstallClick}
              className="flex-1"
              disabled={isInstalling}
            >
              {isInstalling ? '⏳ Installing...' : '📲 Install'}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
