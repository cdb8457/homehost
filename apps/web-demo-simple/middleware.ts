import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return req.cookies.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        req.cookies.set({
          name,
          value,
          ...options,
        })
        response = NextResponse.next({
          request: {
            headers: req.headers,
          },
        })
        response.cookies.set({
          name,
          value,
          ...options,
        })
      },
      remove(name: string, options: any) {
        req.cookies.set({
          name,
          value: '',
          ...options,
        })
        response = NextResponse.next({
          request: {
            headers: req.headers,
          },
        })
        response.cookies.set({
          name,
          value: '',
          ...options,
        })
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user && req.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  if (!user && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}