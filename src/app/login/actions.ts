'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type EstadoLogin = { error: string | null }

export async function entrar(
  _prev: EstadoLogin,
  formData: FormData
): Promise<EstadoLogin> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const siguiente = String(formData.get('siguiente') ?? '/') || '/'

  if (!email || !password) {
    return { error: 'Escribe el correo y la contraseña.' }
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return {
      error:
        'El álbum todavía no está conectado a su base de datos. Falta configurar las variables de entorno.',
    }
  }

  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.message.toLowerCase().includes('invalid login')) {
      return { error: 'Ese correo y esa contraseña no coinciden.' }
    }
    if (error.message.toLowerCase().includes('email not confirmed')) {
      return { error: 'Esta cuenta aún no está confirmada.' }
    }
    return { error: 'No se ha podido entrar. Inténtalo de nuevo.' }
  }

  revalidatePath('/', 'layout')
  redirect(siguiente.startsWith('/') ? siguiente : '/')
}

export async function salir() {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
