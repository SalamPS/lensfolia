import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const redirectTo = searchParams.get('redirect_to')
  
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      return NextResponse.redirect(`${request.nextUrl.origin}?error=auth_failed`)
    }
  }

  // Redirect ke halaman yang diminta atau ke halaman utama jika tidak ada
  const finalRedirectUrl = redirectTo 
    ? `${request.nextUrl.origin}${decodeURIComponent(redirectTo)}`
    : request.nextUrl.origin
    
  return NextResponse.redirect(finalRedirectUrl)
}
