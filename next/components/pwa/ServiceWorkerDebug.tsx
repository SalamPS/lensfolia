"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface CacheInfo {
  name: string;
  size: number;
  urls: string[];
}

export function ServiceWorkerDebug() {
  const [swStatus, setSWStatus] = useState<string>("Checking...");
  const [cacheInfo, setCacheInfo] = useState<CacheInfo[]>([]);
  const [swLogs, setSWLogs] = useState<string[]>([]);

  const checkServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          if (registration.active) {
            setSWStatus(`✅ Service Worker Active - Version: ${registration.active.scriptURL}`);
          } else if (registration.installing) {
            setSWStatus("⏳ Service Worker Installing...");
          } else if (registration.waiting) {
            setSWStatus("⏸️ Service Worker Waiting...");
          }
        } else {
          setSWStatus("❌ No Service Worker registered");
        }
      } catch (error) {
        setSWStatus(`❌ Error checking SW: ${error}`);
      }
    } else {
      setSWStatus("❌ Service Worker not supported");
    }
  };

  const checkCaches = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        const cacheInfos: CacheInfo[] = [];
        
        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName);
          const requests = await cache.keys();
          cacheInfos.push({
            name: cacheName,
            size: requests.length,
            urls: requests.slice(0, 5).map(req => req.url) // Show first 5 URLs
          });
        }
        
        setCacheInfo(cacheInfos);
      } catch (error) {
        setSWLogs(prev => [...prev, `Cache check error: ${error}`]);
      }
    }
  };

  const clearCaches = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          await caches.delete(cacheName);
        }
        setSWLogs(prev => [...prev, "🗑️ All caches cleared"]);
        await checkCaches();
      } catch (error) {
        setSWLogs(prev => [...prev, `Clear cache error: ${error}`]);
      }
    }
  };

  const testOfflineNavigation = () => {
    setSWLogs(prev => [...prev, "🔄 Testing offline navigation - Turn off your internet and reload the page"]);
  };

  const sendMessageToSW = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration?.active) {
        registration.active.postMessage({
          type: 'CACHE_TEST',
          payload: 'Test message from client'
        });
        setSWLogs(prev => [...prev, "📤 Message sent to Service Worker"]);
      }
    }
  };

  useEffect(() => {
    checkServiceWorker();
    checkCaches();

    // Listen for SW messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        setSWLogs(prev => [...prev, `📥 SW Message: ${JSON.stringify(event.data)}`]);
      });
    }

    const interval = setInterval(() => {
      checkServiceWorker();
      checkCaches();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Service Worker Debug Panel</h2>
      
      {/* Service Worker Status */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="font-semibold mb-2">Service Worker Status</h3>
        <p className={`font-mono text-sm ${swStatus.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
          {swStatus}
        </p>
      </div>

      {/* Cache Information */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="font-semibold mb-2">Cache Information</h3>
        {cacheInfo.length === 0 ? (
          <p className="text-gray-500">No caches found</p>
        ) : (
          <div className="space-y-3">
            {cacheInfo.map((cache, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-medium">{cache.name}</h4>
                <p className="text-sm text-gray-600">Items: {cache.size}</p>
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-blue-600">Show URLs</summary>
                  <ul className="mt-2 text-xs space-y-1">
                    {cache.urls.map((url, idx) => (
                      <li key={idx} className="truncate">{url}</li>
                    ))}
                    {cache.size > 5 && (
                      <li className="text-gray-500">... and {cache.size - 5} more</li>
                    )}
                  </ul>
                </details>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Button onClick={checkServiceWorker} size="sm">
          Check SW
        </Button>
        <Button onClick={checkCaches} size="sm">
          Check Caches
        </Button>
        <Button onClick={sendMessageToSW} size="sm">
          Test SW Message
        </Button>
        <Button onClick={clearCaches} variant="destructive" size="sm">
          Clear Caches
        </Button>
      </div>

      {/* Test Section */}
      <div className="bg-yellow-50 p-4 rounded-lg shadow mb-6">
        <h3 className="font-semibold mb-2">Offline Test</h3>
        <p className="text-sm text-gray-700 mb-3">
          To test offline functionality: Make sure caches are populated, then turn off internet and reload.
        </p>
        <Button onClick={testOfflineNavigation} className="w-full">
          Test Offline Navigation
        </Button>
      </div>

      {/* Logs */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">Debug Logs</h3>
          <Button 
            onClick={() => setSWLogs([])} 
            variant="outline" 
            size="sm"
          >
            Clear Logs
          </Button>
        </div>
        
        <div className="max-h-64 overflow-y-auto space-y-1">
          {swLogs.length === 0 ? (
            <p className="text-gray-500 text-sm">No logs yet</p>
          ) : (
            swLogs.map((log, index) => (
              <div key={index} className="text-sm font-mono bg-white p-2 rounded">
                [{new Date().toLocaleTimeString()}] {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
