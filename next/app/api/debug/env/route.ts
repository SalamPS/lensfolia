import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Hanya allow di development atau dengan secret key
  const isDev = process.env.NODE_ENV === 'development'
  const secret = request.nextUrl.searchParams.get('secret')
  const expectedSecret = process.env.DEBUG_SECRET || 'debug-2024'

  if (!isDev && secret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const envCheck = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing',
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ? '✅ Set' : '❌ Missing',
    VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY ? '✅ Set' : '❌ Missing',
    VAPID_EMAIL: process.env.VAPID_EMAIL ? '✅ Set' : '❌ Missing',
    
    // Show actual values for VAPID public key (safe to expose)
    VAPID_PUBLIC_KEY_VALUE: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'Not set',
    
    // Additional info
    timestamp: new Date().toISOString(),
    userAgent: request.headers.get('user-agent'),
    host: request.headers.get('host'),
    protocol: request.url.startsWith('https') ? 'https' : 'http'
  }

  return NextResponse.json({
    status: 'Environment Check',
    environment: envCheck,
    recommendations: {
      missingVars: Object.entries(envCheck)
        .filter(([key, value]) => value === '❌ Missing' && key !== 'timestamp' && key !== 'userAgent' && key !== 'host' && key !== 'protocol')
        .map(([key]) => key),
      securityNote: 'This endpoint should be disabled in production',
      nextSteps: [
        'Check .env.local file exists in root directory',
        'Verify environment variables in hosting provider',
        'Ensure build process includes environment variables'
      ]
    }
  })
}
