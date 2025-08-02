import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      return NextResponse.redirect(`${request.nextUrl.origin}?error=auth_failed`)
    }
  }

  // Redirect ke halaman utama setelah berhasil login
  return NextResponse.redirect(request.nextUrl.origin)
}
