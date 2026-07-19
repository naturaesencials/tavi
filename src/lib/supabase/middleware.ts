import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const RUTAS_PUBLICAS = ['/login', '/auth', '/v/']

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Sin configuración de Supabase no se puede validar sesión: se deja pasar
  // solo el login, que mostrará el aviso de configuración pendiente.
  if (!url || !anonKey) return response

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const esPublica = RUTAS_PUBLICAS.some((r) =>
    request.nextUrl.pathname.startsWith(r)
  )

  if (!user && !esPublica) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('siguiente', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (user && request.nextUrl.pathname === '/login') {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/'
    redirectUrl.search = ''
    return NextResponse.redirect(redirectUrl)
  }

  return response
}
