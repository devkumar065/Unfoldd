import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  const path = request.nextUrl.pathname

  // ── ADMIN ROUTES ──────────────────────────
  if (path.startsWith('/admin')) {
    // Allow access to login page without session
    if (path === '/admin/login') {
      if (session) {
        // If already logged in, check if admin
        const { data: adminUser } = await supabase
          .from('admin_users')
          .select('id')
          .eq('id', session.user.id)
          .single()
        
        if (adminUser) return NextResponse.redirect(new URL('/admin', request.url))
      }
      return res
    }

    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    
        // Check admin_users table
    
        const { data: adminUser, error: adminError } = await supabase
    
          .from('admin_users')
    
          .select('id, role, permissions')
    
          .eq('id', session.user.id)
    
          .maybeSingle() // Use maybeSingle to avoid 406/error if not found
    
        
    
            if (adminError || !adminUser) {
    
        
    
              // Not an admin or error — redirect to dashboard with debug info
    
        
    
              if (adminError) console.error('[MIDDLEWARE ERROR]:', adminError)
    
        
    
              const errorMsg = adminError ? 'db_error' : 'not_found'
    
        
    
              return NextResponse.redirect(
    
        
    
                new URL(`/dashboard?admin_error=${errorMsg}&uid=${session.user.id}`, request.url)
    
        
    
              )
    
        
    
            }
    
    // Check specific permission for route
    if (path.startsWith('/admin/analytics') && !adminUser.permissions?.can_view_analytics) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    
    if (path.startsWith('/admin/integrations') && adminUser.role !== 'superadmin') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    
    return res
  }

  // ── STUDENT ROUTES ────────────────────────
  const protectedRoutes = [
    '/dashboard', '/missions', '/exam',
    '/portfolio/edit', '/resume', 
    '/internships', '/settings', '/skills',
    '/notifications'
  ]
  
  const isProtected = protectedRoutes.some(r => path.startsWith(r))
  
  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // ── COMPANY ROUTES ────────────────────────
  if (path.startsWith('/company') && path !== '/company/register' && path !== '/company/login') {
    if (!session) {
      return NextResponse.redirect(new URL('/company/login', request.url))
    }
  }

  // ── AUTH REDIRECT ─────────────────────────
  if (session && (path === '/auth/login' || path === '/auth/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|models|api).*)',
  ]
}