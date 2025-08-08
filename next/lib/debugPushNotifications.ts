// Debug script untuk check push notification support di production
// Tambahkan ini ke test-push page untuk debugging

import { 
  checkServiceWorkerStatus, 
  testServiceWorkerFiles, 
  testEnvironmentAPI,
  generateDiagnosticReport 
} from './serviceWorkerDiagnostics'

export async function debugPushNotifications() {
  console.log('🔍 Starting Push Notification Debug...')
  console.log('=====================================')
  
  try {
    // Run all diagnostic checks
    console.log('⏳ Running diagnostic checks...')
    
    const [swStatus, swFiles, envAPI] = await Promise.all([
      checkServiceWorkerStatus(),
      testServiceWorkerFiles(),
      testEnvironmentAPI()
    ])
    
    // Generate comprehensive report
    const report = generateDiagnosticReport(swStatus, swFiles, envAPI)
    
    // Display results in console
    console.log('📊 DIAGNOSTIC REPORT')
    console.log('====================')
    console.log(`🕐 Timestamp: ${report.timestamp}`)
    console.log(`🌐 URL: ${report.url}`)
    console.log(`🔒 Protocol: ${report.protocol}`)
    console.log('')
    
    console.log('🔧 SERVICE WORKER STATUS:')
    console.log(`   Supported: ${report.serviceWorker.supported ? '✅' : '❌'}`)
    console.log(`   Registered: ${report.serviceWorker.registered ? '✅' : '❌'}`)
    console.log(`   Active: ${report.serviceWorker.active ? '✅' : '❌'}`)
    if (report.serviceWorker.errors.length > 0) {
      console.log(`   Errors: ${report.serviceWorker.errors.join(', ')}`)
    }
    console.log('')
    
    console.log('📱 PUSH API STATUS:')
    console.log(`   Supported: ${report.pushAPI.supported ? '✅' : '❌'}`)
    console.log(`   Subscribed: ${report.pushAPI.subscribed ? '✅' : '❌'}`)
    console.log(`   Permission: ${report.pushAPI.permission} ${
      report.pushAPI.permission === 'granted' ? '✅' : 
      report.pushAPI.permission === 'denied' ? '❌' : '⚠️'
    }`)
    console.log('')
    
    console.log('📁 FILE ACCESSIBILITY:')
    report.files.forEach(file => {
      console.log(`   ${file.file}: ${file.accessible ? '✅' : '❌'} (${file.status} ${file.statusText})`)
      if (file.contentType) {
        console.log(`     Content-Type: ${file.contentType}`)
      }
    })
    console.log('')
    
    console.log('🔑 ENVIRONMENT VARIABLES:')
    if ('environment' in report.environment) {
      const env = report.environment.environment
      Object.entries(env).forEach(([key, value]) => {
        if (key !== 'timestamp' && key !== 'userAgent' && key !== 'host' && key !== 'protocol') {
          console.log(`   ${key}: ${value}`)
        }
      })
    } else if (report.environment.error) {
      console.log(`   ❌ Error: ${report.environment.error}`)
    }
    console.log('')
    
    console.log('💡 RECOMMENDATIONS:')
    report.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`)
    })
    console.log('')
    
    console.log('📋 Full Report Object:')
    console.log(report)
    
    // Save report to session storage for further analysis
    try {
      sessionStorage.setItem('pushDebugReport', JSON.stringify(report, null, 2))
      console.log('💾 Report saved to sessionStorage as "pushDebugReport"')
    } catch {
      console.log('⚠️ Could not save to sessionStorage')
    }
    
    console.log('=====================================')
    console.log('✅ Debug complete! Check the console output above.')
    
    return report
    
  } catch (error) {
    console.error('❌ Debug failed:', error)
    const errorReport = {
      error: true,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }
    
    console.log('💾 Error Report:', errorReport)
    return errorReport
  }
}
