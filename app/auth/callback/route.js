import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.exchangeCodeForSession(code)
    
    // Check if profile exists
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single()
      
      // Create profile if first time OAuth
      if (!profile) {
        await supabase.from('profiles').insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
          onboarding_completed: false
        })
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }
      
      if (!profile.onboarding_completed) {
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }
      
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }
  
  return NextResponse.redirect(new URL('/auth/login', request.url))
}