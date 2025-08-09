export async function checkServiceWorkerStatus() {
  const checks = {
    serviceWorkerSupport: 'serviceWorker' in navigator,
    pushSupport: 'PushManager' in window,
    notificationSupport: 'Notification' in window,
    serviceWorkerRegistered: false,
    activeServiceWorker: false,
    pushSubscribed: false,
    notificationPermission: Notification.permission,
    swRegistration: null as ServiceWorkerRegistration | null,
    pushSubscription: null as PushSubscription | null,
    errors: [] as string[]
  }

  try {
    // Check service worker registration
    if (checks.serviceWorkerSupport) {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        checks.serviceWorkerRegistered = true
        checks.swRegistration = registration
        checks.activeServiceWorker = !!registration.active
        
        // Check push subscription
        if (checks.pushSupport) {
          const subscription = await registration.pushManager.getSubscription()
          checks.pushSubscribed = !!subscription
          checks.pushSubscription = subscription
        }
      } else {
        checks.errors.push('Service Worker not registered')
      }
    }
  } catch (error) {
    checks.errors.push(`Service Worker error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  return checks
}

export async function testServiceWorkerFiles() {
  const files = [
    '/sw.js',
    '/swe-worker-ab00d3c7d2d59769.js'
  ]
  
  const results = []
  
  for (const file of files) {
    try {
      const response = await fetch(file)
      results.push({
        file,
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        accessible: response.ok
      })
    } catch (error) {
      results.push({
        file,
        status: 0,
        statusText: 'Network Error',
        contentType: null,
        accessible: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
  
  return results
}

export async function testEnvironmentAPI() {
  try {
    const response = await fetch('/api/debug/env?secret=debug-2024')
    if (response.ok) {
      return await response.json()
    } else {
      return {
        error: `API returned ${response.status}: ${response.statusText}`
      }
    }
  } catch (error) {
    return {
      error: `Failed to fetch environment API: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

export function generateDiagnosticReport(
  swStatus: Awaited<ReturnType<typeof checkServiceWorkerStatus>>, 
  swFiles: Awaited<ReturnType<typeof testServiceWorkerFiles>>, 
  envAPI: Awaited<ReturnType<typeof testEnvironmentAPI>>
) {
  const report = {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    protocol: window.location.protocol,
    
    // Service Worker Status
    serviceWorker: {
      supported: swStatus.serviceWorkerSupport,
      registered: swStatus.serviceWorkerRegistered,
      active: swStatus.activeServiceWorker,
      errors: swStatus.errors
    },
    
    // Push API Status
    pushAPI: {
      supported: swStatus.pushSupport,
      subscribed: swStatus.pushSubscribed,
      permission: swStatus.notificationPermission
    },
    
    // File Accessibility
    files: swFiles,
    
    // Environment Variables
    environment: envAPI,
    
    // Recommendations
    recommendations: [] as string[]
  }
  
  // Generate recommendations
  if (!report.serviceWorker.supported) {
    report.recommendations.push('❌ Browser tidak support Service Worker')
  }
  
  if (!report.pushAPI.supported) {
    report.recommendations.push('❌ Browser tidak support Push API')
  }
  
  if (report.protocol !== 'https:' && window.location.hostname !== 'localhost') {
    report.recommendations.push('❌ HTTPS diperlukan untuk Push Notifications (kecuali localhost)')
  }
  
  if (!report.serviceWorker.registered) {
    report.recommendations.push('❌ Service Worker belum ter-register')
  }
  
  if (!report.serviceWorker.active) {
    report.recommendations.push('⚠️ Service Worker terdaftar tapi tidak aktif')
  }
  
  if (report.pushAPI.permission === 'denied') {
    report.recommendations.push('❌ Notification permission ditolak - reset di browser settings')
  } else if (report.pushAPI.permission === 'default') {
    report.recommendations.push('⚠️ Notification permission belum diminta')
  }
  
  const inaccessibleFiles = report.files.filter((f) => !f.accessible)
  if (inaccessibleFiles.length > 0) {
    report.recommendations.push(`❌ File tidak dapat diakses: ${inaccessibleFiles.map((f) => f.file).join(', ')}`)
  }
  
  if (envAPI.error) {
    report.recommendations.push('❌ Environment API error - check server configuration')
  } else if (envAPI.recommendations?.missingVars?.length > 0) {
    report.recommendations.push(`❌ Environment variables missing: ${envAPI.recommendations.missingVars.join(', ')}`)
  }
  
  if (report.recommendations.length === 0) {
    report.recommendations.push('✅ Semua checks passed! Push notifications should work.')
  }
  
  return report
}
