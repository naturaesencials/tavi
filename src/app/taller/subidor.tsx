'use client'

import { useCallback, useRef, useState } from 'react'
import exifr from 'exifr'
import { createClient } from '@/lib/supabase/client'
import { registrarSubidas, type Entrada } from './acciones'

type Estado = { hechos: number; total: number; mensaje: string }

const VIDEO = /\.(mp4|mov|m4v|webm)$/i

function extension(nombre: string) {
  const m = nombre.match(/\.([a-z0-9]+)$/i)
  return (m ? m[1] : 'jpg').toLowerCase()
}

// Los servicios de mensajería borran el EXIF pero dejan la fecha en el nombre.
function fechaDelNombre(nombre: string): string | null {
  const m = nombre.match(/(20\d{2})[-_]?(\d{2})[-_]?(\d{2})/)
  if (!m) return null
  const [, a, mes, d] = m
  const iso = `${a}-${mes}-${d}T12:00:00.000Z`
  return Number.isNaN(Date.parse(iso)) ? null : iso
}

async function medirImagen(f: File) {
  return new Promise<{ ancho: number | null; alto: number | null }>((res) => {
    const url = URL.createObjectURL(f)
    const img = new Image()
    img.onload = () => {
      res({ ancho: img.naturalWidth, alto: img.naturalHeight })
      URL.revokeObjectURL(url)
    }
    img.onerror = () => {
      res({ ancho: null, alto: null })
      URL.revokeObjectURL(url)
    }
    img.src = url
  })
}

// Del vídeo se saca un fotograma a un tercio de la duración: casi siempre
// tiene ya movimiento y todavía no ha terminado la escena.
async function fotogramaDeVideo(f: File) {
  return new Promise<{
    blob: Blob | null
    duracion: number | null
    ancho: number | null
    alto: number | null
  }>((res) => {
    const url = URL.createObjectURL(f)
    const v = document.createElement('video')
    v.preload = 'metadata'
    v.muted = true
    v.playsInline = true

    const fallar = () => {
      res({ blob: null, duracion: null, ancho: null, alto: null })
      URL.revokeObjectURL(url)
    }

    v.onloadedmetadata = () => {
      const t = Math.min(Math.max(v.duration / 3, 0.1), v.duration - 0.05)
      v.currentTime = Number.isFinite(t) ? t : 0.1
    }
    v.onseeked = () => {
      const c = document.createElement('canvas')
      c.width = v.videoWidth
      c.height = v.videoHeight
      const ctx = c.getContext('2d')
      if (!ctx) return fallar()
      ctx.drawImage(v, 0, 0)
      c.toBlob(
        (blob) => {
          res({
            blob,
            duracion: v.duration,
            ancho: v.videoWidth,
            alto: v.videoHeight,
          })
          URL.revokeObjectURL(url)
        },
        'image/jpeg',
        0.9
      )
    }
    v.onerror = fallar
    v.src = url
  })
}

export default function Subidor() {
  const [estado, setEstado] = useState<Estado | null>(null)
  const entrada = useRef<HTMLInputElement>(null)

  const procesar = useCallback(async (lista: FileList) => {
    const archivos = Array.from(lista)
    const supabase = createClient()
    const entradas: Entrada[] = []

    setEstado({ hechos: 0, total: archivos.length, mensaje: 'Leyendo…' })

    for (let i = 0; i < archivos.length; i++) {
      const f = archivos[i]
      if (f.name.startsWith('.') || f.name.startsWith('._')) continue

      const esVideo = VIDEO.test(f.name)
      const ext = extension(f.name)
      const id = crypto.randomUUID()
      const ruta = `primer-ano/${id}.${ext}`

      let tomada: string | null = null
      let origen: Entrada['fecha_inferida_de'] = null
      let lat: number | null = null
      let lon: number | null = null
      let ancho: number | null = null
      let alto: number | null = null
      let duracion: number | null = null
      let poster: string | null = null

      if (!esVideo) {
        try {
          const ex = await exifr.parse(f, { gps: true })
          if (ex?.DateTimeOriginal) {
            // El EXIF no lleva zona: son las horas del reloj del sitio donde
            // se disparó. Se mandan tal cual y el servidor las interpreta con
            // la zona que corresponda a las coordenadas.
            const d = new Date(ex.DateTimeOriginal)
            const dd = (n: number) => String(n).padStart(2, '0')
            tomada = `${d.getFullYear()}-${dd(d.getMonth() + 1)}-${dd(
              d.getDate()
            )}T${dd(d.getHours())}:${dd(d.getMinutes())}:${dd(d.getSeconds())}`
            origen = 'exif'
          }
          if (typeof ex?.latitude === 'number') {
            lat = ex.latitude
            lon = ex.longitude
          }
        } catch {
          // sin EXIF legible: se sigue con las otras fuentes
        }
        const m = await medirImagen(f)
        ancho = m.ancho
        alto = m.alto
      } else {
        const fr = await fotogramaDeVideo(f)
        duracion = fr.duracion
        ancho = fr.ancho
        alto = fr.alto
        if (fr.blob) {
          poster = `primer-ano/${id}-poster.jpg`
          await supabase.storage
            .from('fotos')
            .upload(poster, fr.blob, { contentType: 'image/jpeg' })
        }
      }

      if (!tomada) {
        const porNombre = fechaDelNombre(f.name)
        if (porNombre) {
          tomada = porNombre
          origen = 'nombre_archivo'
        } else if (f.lastModified) {
          tomada = new Date(f.lastModified).toISOString()
          origen = 'fecha_archivo'
        }
      }

      const { error } = await supabase.storage
        .from('fotos')
        .upload(ruta, f, { contentType: f.type || undefined })

      if (!error) {
        entradas.push({
          zona_del_navegador: Intl.DateTimeFormat().resolvedOptions().timeZone,
          ruta,
          nombre_original: f.name,
          medio: esVideo ? 'video' : 'foto',
          tomada_en: tomada,
          fecha_inferida_de: origen,
          latitud: lat,
          longitud: lon,
          ancho,
          alto,
          duracion_s: duracion,
          poster_ruta: poster,
        })
      }

      setEstado({
        hechos: i + 1,
        total: archivos.length,
        mensaje: `${f.name.slice(0, 30)}…`,
      })
    }

    setEstado({
      hechos: archivos.length,
      total: archivos.length,
      mensaje: 'Ordenando…',
    })
    const r = await registrarSubidas(entradas)
    setEstado(null)
    if (r.error) alert(`No se pudieron guardar: ${r.error}`)
  }, [])

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        if (e.dataTransfer.files.length) procesar(e.dataTransfer.files)
      }}
      className="border border-dashed border-pino/35 bg-hueso-hondo/30 px-6 py-10 text-center"
    >
      <p className="font-display text-[1.35rem] text-pino">
        Arrastra aquí las fotos y los vídeos
      </p>
      <p className="mx-auto mt-3 max-w-md text-[0.87rem] leading-relaxed text-pino/65">
        Arrástralos desde el Finder, no desde el ZIP: así el navegador conserva
        la fecha de cada archivo y puedo fecharlos aunque hayan perdido el EXIF.
      </p>

      <button
        type="button"
        onClick={() => entrada.current?.click()}
        disabled={!!estado}
        className="mt-6 bg-pino px-5 py-3 text-[0.9rem] font-medium text-hueso transition-colors hover:bg-pino-claro disabled:opacity-60"
      >
        {estado ? 'Subiendo…' : 'O elígelos a mano'}
      </button>

      <input
        ref={entrada}
        type="file"
        multiple
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => e.target.files && procesar(e.target.files)}
      />

      {estado && (
        <div className="mx-auto mt-6 max-w-sm">
          <div className="h-1 w-full bg-pino/15">
            <div
              className="h-1 bg-ocre transition-all"
              style={{ width: `${(estado.hechos / estado.total) * 100}%` }}
            />
          </div>
          <p className="mt-2 text-[0.8rem] tabular-nums text-pino/60">
            {estado.hechos} de {estado.total} · {estado.mensaje}
          </p>
        </div>
      )}
    </div>
  )
}
