import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'
  const origin = requestUrl.origin
  
  // Handle email confirmation token
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Successful OAuth authentication - redirect to dashboard
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    })

    if (!error) {
      // Successful email verification - redirect to dashboard
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // If there's an error or no code/token, redirect to login with error
  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
}
