import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      return NextResponse.json(
        { user: null, error: error.message },
        { status: 401 }
      )
    }

    return NextResponse.json({ user, error: null })
  } catch {
    return NextResponse.json(
      { user: null, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
