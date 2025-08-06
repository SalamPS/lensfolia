"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export function OfflineTest() {
  const [isOnline, setIsOnline] = useState(true);
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const testOfflinePage = async () => {
    try {
      const response = await fetch('/', { 
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.ok) {
        setTestResults(prev => [...prev, `✅ Homepage accessible - Status: ${response.status}`]);
      } else {
        setTestResults(prev => [...prev, `❌ Homepage failed - Status: ${response.status}`]);
      }
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Homepage error: ${error}`]);
    }
  };

  const testOtherPages = async () => {
    const pages = ['/detect', '/encyclopedia', '/forum', '/bookmarks'];
    
    for (const page of pages) {
      try {
        const response = await fetch(page, { 
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (response.ok) {
          setTestResults(prev => [...prev, `✅ ${page} accessible - Status: ${response.status}`]);
        } else {
          setTestResults(prev => [...prev, `❌ ${page} failed - Status: ${response.status}`]);
        }
      } catch (error) {
        setTestResults(prev => [...prev, `❌ ${page} error: ${error}`]);
      }
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const forceReload = () => {
    window.location.reload();
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Offline Support Test</h2>
        <div className={`p-3 rounded-lg ${isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          Status: {isOnline ? '🟢 Online' : '🔴 Offline'}
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <Button onClick={testOfflinePage} className="w-full">
          Test Homepage Access
        </Button>
        
        <Button onClick={testOtherPages} className="w-full">
          Test All Pages Access
        </Button>
        
        <Button onClick={forceReload} variant="secondary" className="w-full">
          Force Reload (Test Offline Navigation)
        </Button>
        
        <Button onClick={clearResults} variant="outline" className="w-full">
          Clear Results
        </Button>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Test Results:</h3>
        {testResults.length === 0 ? (
          <p className="text-gray-500">No tests run yet</p>
        ) : (
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index} className="text-sm font-mono">
                {result}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <h4 className="font-semibold mb-2">How to test:</h4>
        <ol className="list-decimal list-inside space-y-1">
          <li>Make sure you&apos;re online and the app loads completely</li>
          <li>Open DevTools → Application → Service Workers (check if SW is active)</li>
          <li>Turn off your internet connection</li>
          <li>Click &quot;Force Reload&quot; or refresh the page manually</li>
          <li>If offline support works, you should see the cached page instead of browser&apos;s offline page</li>
        </ol>
      </div>
    </div>
  );
}
