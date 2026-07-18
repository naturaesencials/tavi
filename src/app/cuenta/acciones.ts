'use server'

import { createClient } from '@/lib/supabase/server'

export type EstadoClave = { error: string | null; ok: boolean }

export async function cambiarContrasena(
  _prev: EstadoClave,
  formData: FormData
): Promise<EstadoClave> {
  const nueva = String(formData.get('nueva') ?? '')
  const repetida = String(formData.get('repetida') ?? '')

  if (nueva.length < 10) {
    return { error: 'La contraseña necesita al menos 10 caracteres.', ok: false }
  }
  if (nueva !== repetida) {
    return { error: 'Las dos contraseñas no coinciden.', ok: false }
  }

  const supabase = createClient()
  const { error } = await supabase.auth.updateUser({ password: nueva })

  if (error) {
    return { error: 'No se ha podido cambiar. Inténtalo de nuevo.', ok: false }
  }
  return { error: null, ok: true }
}
