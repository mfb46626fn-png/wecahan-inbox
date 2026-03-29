import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createClient } from '@/lib/supabase/server'

export async function middleware(request: NextRequest) {
  // Update session
  const response = await updateSession(request)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const isAuthPage = request.nextUrl.pathname.startsWith('/login')

  // If user is not logged in and trying to access protected route
  if (!user && !isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // If user is logged in and trying to access login page
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/inbox', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public folder)
     * - api (api routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
}
