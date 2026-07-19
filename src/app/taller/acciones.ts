'use server'

import { revalidatePath } from 'next/cache'
import tzLookup from 'tz-lookup'
import { createClient } from '@/lib/supabase/server'

export type Entrada = {
  ruta: string
  nombre_original: string
  medio: 'foto' | 'video'
  tomada_en: string | null
  fecha_inferida_de: 'exif' | 'nombre_archivo' | 'fecha_archivo' | 'manual' | null
  latitud: number | null
  longitud: number | null
  ancho: number | null
  alto: number | null
  duracion_s: number | null
  poster_ruta: string | null
  zona_del_navegador: string | null
}

// Nominatim pide identificarse y no admite ráfagas: se consulta de una en una
// y solo cuando hay coordenadas de verdad.
async function nombreDelLugar(lat: number, lon: number) {
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&zoom=14&accept-language=es&lat=${lat}&lon=${lon}`,
      { headers: { 'User-Agent': 'album-tavi/1.0' }, cache: 'force-cache' }
    )
    if (!r.ok) return null
    const d = await r.json()
    const a = d.address ?? {}
    const partes = [
      a.suburb ?? a.neighbourhood ?? null,
      a.city ?? a.town ?? a.village ?? null,
      a.state ?? null,
    ].filter(Boolean)
    return partes.length ? partes.join(', ') : (d.display_name ?? null)
  } catch {
    return null
  }
}

export async function registrarSubidas(entradas: Entrada[]) {
  const supabase = createClient()

  const filas = []
  for (const e of entradas) {
    let lugar: string | null = null
    let zona = e.zona_del_navegador ?? 'Europe/Madrid'
    if (e.latitud !== null && e.longitud !== null) {
      lugar = await nombreDelLugar(e.latitud, e.longitud)
      try {
        zona = tzLookup(e.latitud, e.longitud)
      } catch {
        // coordenadas raras: se queda la zona del navegador
      }
    }

    // El EXIF llega sin zona (sin la Z final): se ancla a la zona del sitio.
    // Las fechas de archivo sí son instantes reales y no se tocan.
    const tomada =
      e.tomada_en && !e.tomada_en.endsWith('Z')
        ? new Date(
            new Date(`${e.tomada_en}Z`).toLocaleString('sv-SE', {
              timeZone: 'UTC',
            }) + 'Z'
          ).toISOString()
        : e.tomada_en

    const sinFecha = !e.tomada_en
    const motivo = sinFecha
      ? e.medio === 'video'
        ? 'video_sin_fecha'
        : 'sin_fecha'
      : e.fecha_inferida_de === 'fecha_archivo'
        ? 'fecha_de_archivo'
        : e.latitud === null
          ? 'sin_gps'
          : null

    filas.push({
      ruta: e.ruta,
      nombre_original: e.nombre_original,
      medio: e.medio,
      tomada_en: tomada,
      zona_horaria: zona,
      fecha_inferida_de: e.fecha_inferida_de,
      latitud: e.latitud,
      longitud: e.longitud,
      lugar,
      ancho: e.ancho,
      alto: e.alto,
      duracion_s: e.duracion_s,
      poster_ruta: e.poster_ruta,
      necesita_revision: e.fecha_inferida_de !== 'exif',
      motivo_revision: motivo,
    })
  }

  const { error } = await supabase.from('fotos').insert(filas)
  if (error) return { error: error.message, guardadas: 0 }

  revalidatePath('/taller')
  return { error: null, guardadas: filas.length }
}

export async function actualizarFicha(
  id: string,
  cambios: {
    tomada_en?: string | null
    lugar?: string | null
    categoria?: string | null
    titulo?: string | null
    nota?: string | null
    zona_horaria?: string
    revisada?: boolean
  }
) {
  const supabase = createClient()

  const datos: Record<string, unknown> = { ...cambios }
  if ('tomada_en' in cambios && cambios.tomada_en) {
    datos.fecha_inferida_de = 'manual'
    datos.necesita_revision = false
  }
  if (cambios.revisada) datos.necesita_revision = false

  // Si la ficha ya está completa, se da por revisada sola: pedir además un
  // segundo botón era una trampa para el que la rellena.
  const completa =
    !!cambios.categoria &&
    !!cambios.lugar &&
    !!cambios.nota &&
    cambios.tomada_en !== null
  if (completa) {
    datos.revisada = true
    datos.necesita_revision = false
  }

  const { error } = await supabase.from('fotos').update(datos).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/taller')
  return { error: null }
}

export async function borrarFicha(id: string, ruta: string) {
  const supabase = createClient()
  await supabase.storage.from('fotos').remove([ruta])
  const { error } = await supabase.from('fotos').delete().eq('id', id)
  revalidatePath('/taller')
  return { error: error?.message ?? null }
}
