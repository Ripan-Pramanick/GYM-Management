import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {

  console.log(`[Proxy] Route Hit: ${request.nextUrl.pathname}`);

  let supabaseResponse = NextResponse.next({
    request,
  })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

 
    console.log("[Proxy] Fetching User from Supabase...");
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.log("[Proxy] Supabase Auth Error:", userError.message);
    } else if (user) {
      console.log("[Proxy] User found:", user.id);
    }

    const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register')
    const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard')
    const isMemberRoute = request.nextUrl.pathname.startsWith('/member')


    if (!user && (isDashboardRoute || isMemberRoute)) {
      console.log("[Proxy] Redirecting to /login");
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (user && isAuthRoute) {
      console.log("[Proxy] Fetching Profile Role for Auth Route...");
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      
      if (profile?.role === 'member') {
        return NextResponse.redirect(new URL('/member', request.url))
      } else {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    if (user && isDashboardRoute) {
      console.log("[Proxy] Fetching Profile Role for Dashboard Route...");
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role === 'member') {
        return NextResponse.redirect(new URL('/member', request.url))
      }
    }

  } catch (error) {
   
    console.error("[Proxy] CRITICAL ERROR:", error);
  }

  console.log("[Proxy] Passing to next response...");
  return supabaseResponse
}

export const config = {
  matcher: [
    /* 
     * Ignore static assets to prevent infinite loops & database overload:
     * _next/static, _next/image, favicon, local images, videos, and static files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|videos|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4)$).*)',
  ],
}