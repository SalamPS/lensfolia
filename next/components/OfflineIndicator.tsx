'use client';

import { WifiOff } from 'lucide-react';
import { useServiceWorker } from '@/hooks/useServiceWorker';

export default function OfflineIndicator() {
  const { isOffline } = useServiceWorker();

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-destructive text-destructive-foreground px-4 py-2 text-center text-sm z-50">
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="w-4 h-4" />
        <span>Anda sedang offline - Beberapa fitur mungkin tidak tersedia</span>
      </div>
    </div>
  );
}
