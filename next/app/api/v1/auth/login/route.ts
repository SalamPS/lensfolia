import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { provider, redirectUrl } = await request.json()
    
    if (!provider || !['google', 'github'].includes(provider)) {
      return NextResponse.json(
        { error: 'Provider tidak valid' },
        { status: 400 }
      )
    }

    // Encode redirect URL untuk menyimpannya dalam state parameter
    const encodedRedirectUrl = encodeURIComponent(redirectUrl || '/')

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as 'google' | 'github',
      options: {
        redirectTo: `${request.nextUrl.origin}/api/v1/auth/callback?redirect_to=${encodedRedirectUrl}`
      }
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: data.url })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
