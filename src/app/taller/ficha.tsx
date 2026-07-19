'use client'

import { useState, useTransition } from 'react'
import { actualizarFicha, borrarFicha } from './acciones'

export type FichaDatos = {
  id: string
  ruta: string
  url: string | null
  nombre_original: string | null
  medio: 'foto' | 'video'
  tomada_en: string | null
  fecha_inferida_de: string | null
  lugar: string | null
  categoria: string | null
  titulo: string | null
  nota: string | null
  revisada: boolean
  duracion_s: number | null
  ancho: number | null
  alto: number | null
  zona_horaria: string
  hora_local: string | null
}

const CATEGORIAS = [
  ['ecografia', 'Ecografía'],
  ['test', 'Test de embarazo'],
  ['jessica', 'Jessica'],
  ['proceso', 'El proceso'],
  ['viaje', 'El viaje'],
  ['tavi', 'Tavi'],
  ['familia', 'Familia'],
  ['otro', 'Otro'],
]

const ZONAS = [
  ['Europe/Madrid', 'Marbella / España'],
  ['America/Los_Angeles', 'Portland / San Diego'],
  ['America/New_York', 'Nueva York'],
]

const ORIGEN: Record<string, string> = {
  exif: 'fecha de la cámara',
  nombre_archivo: 'fecha del nombre',
  fecha_archivo: 'fecha del archivo',
  manual: 'la pusiste tú',
}

function aInput(iso: string | null) {
  return iso ? iso.slice(0, 10) : ''
}

export default function Ficha({ d }: { d: FichaDatos }) {
  const [fecha, setFecha] = useState(aInput(d.tomada_en))
  const [lugar, setLugar] = useState(d.lugar ?? '')
  const [categoria, setCategoria] = useState(d.categoria ?? '')
  const [titulo, setTitulo] = useState(d.titulo ?? '')
  const [nota, setNota] = useState(d.nota ?? '')
  const [zona, setZona] = useState(d.zona_horaria)
  const [revisada, setRevisada] = useState(d.revisada)
  const [guardado, setGuardado] = useState(false)
  const [pendiente, empezar] = useTransition()

  const fiable = d.fecha_inferida_de === 'exif' || d.fecha_inferida_de === 'manual'

  function guardar(marcarRevisada = false) {
    empezar(async () => {
      const r = await actualizarFicha(d.id, {
        tomada_en: fecha ? `${fecha}T12:00:00.000Z` : null,
        lugar: lugar.trim() || null,
        categoria: categoria || null,
        zona_horaria: zona,
        titulo: titulo.trim() || null,
        nota: nota.trim() || null,
        revisada: marcarRevisada ? true : revisada,
      })
      if (!r.error) {
        if (marcarRevisada) setRevisada(true)
        setGuardado(true)
        setTimeout(() => setGuardado(false), 2000)
      }
    })
  }

  const campo =
    'w-full border-b border-pino/25 bg-transparent pb-1 text-[0.9rem] text-tinta outline-none focus:border-ocre'

  return (
    <article
      className={`border p-4 ${
        revisada ? 'border-pino/15 opacity-70' : 'border-pino/30'
      }`}
    >
      <div className="relative bg-hueso-hondo">
        {d.url ? (
          d.medio === 'video' ? (
            <video
              src={d.url}
              controls
              playsInline
              className="max-h-64 w-full object-contain"
            />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={d.url}
              alt={d.nombre_original ?? ''}
              className="max-h-64 w-full object-contain"
            />
          )
        ) : (
          <div className="flex h-40 items-center justify-center text-[0.8rem] text-pino/40">
            sin vista previa
          </div>
        )}
        {d.medio === 'video' && (
          <span className="absolute right-2 top-2 bg-pino px-2 py-0.5 text-[0.65rem] uppercase tracking-widest text-hueso">
            vídeo {d.duracion_s ? `${Math.round(d.duracion_s)}s` : ''}
          </span>
        )}
      </div>

      <p className="mt-3 truncate text-[0.7rem] text-pino/45">
        {d.nombre_original} · {d.ancho}×{d.alto}
      </p>

      <label className="mt-4 block text-[0.65rem] font-bold uppercase tracking-[0.14em] text-pino-claro">
        Fecha
      </label>
      <input
        type="date"
        value={fecha}
        onChange={(e) => setFecha(e.target.value)}
        className={campo}
      />
      <p
        className={`mt-1 text-[0.68rem] ${fiable ? 'text-pino/45' : 'text-ocre'}`}
      >
        {d.hora_local ? `${d.hora_local} · ` : ''}
        {d.fecha_inferida_de
          ? ORIGEN[d.fecha_inferida_de]
          : 'sin fecha de ningún sitio'}
      </p>

      <label className="mt-4 block text-[0.65rem] font-bold uppercase tracking-[0.14em] text-pino-claro">
        Reloj con el que se lee
      </label>
      <select
        value={zona}
        onChange={(e) => setZona(e.target.value)}
        className={`${campo} cursor-pointer`}
      >
        {ZONAS.map(([v, n]) => (
          <option key={v} value={v}>
            {n}
          </option>
        ))}
      </select>

      <label className="mt-4 block text-[0.65rem] font-bold uppercase tracking-[0.14em] text-pino-claro">
        Lugar
      </label>
      <input
        value={lugar}
        onChange={(e) => setLugar(e.target.value)}
        placeholder="Portland, Oregón"
        className={campo}
      />

      <label className="mt-4 block text-[0.65rem] font-bold uppercase tracking-[0.14em] text-pino-claro">
        Qué es
      </label>
      <select
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
        className={`${campo} cursor-pointer`}
      >
        <option value="">— sin decidir —</option>
        {CATEGORIAS.map(([v, n]) => (
          <option key={v} value={v}>
            {n}
          </option>
        ))}
      </select>

      <label className="mt-4 block text-[0.65rem] font-bold uppercase tracking-[0.14em] text-pino-claro">
        Título
      </label>
      <input
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        placeholder="Se pondrá uno solo si lo dejas vacío"
        className={campo}
      />

      <label className="mt-4 block text-[0.65rem] font-bold uppercase tracking-[0.14em] text-pino-claro">
        Cuéntame la historia
      </label>
      <textarea
        value={nota}
        onChange={(e) => setNota(e.target.value)}
        rows={3}
        placeholder="Lo que recuerdes. Con esto escribo el texto del álbum."
        className="mt-1 w-full resize-y border border-pino/20 bg-transparent p-2 text-[0.85rem] leading-snug text-tinta outline-none focus:border-ocre"
      />

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => guardar(false)}
          disabled={pendiente}
          className="bg-pino px-3 py-2 text-[0.8rem] font-medium text-hueso hover:bg-pino-claro disabled:opacity-60"
        >
          Guardar
        </button>
        <button
          type="button"
          onClick={() => guardar(true)}
          disabled={pendiente}
          className="border border-pino/30 px-3 py-2 text-[0.8rem] text-pino hover:border-ocre hover:text-ocre disabled:opacity-60"
        >
          Guardar y dar por revisada
        </button>
        <button
          type="button"
          onClick={() => {
            if (confirm('¿Borrar este archivo del álbum?'))
              empezar(async () => {
                await borrarFicha(d.id, d.ruta)
              })
          }}
          className="ml-auto text-[0.78rem] text-pino/40 underline underline-offset-4 hover:text-ocre"
        >
          Borrar
        </button>
        {guardado && (
          <span role="status" className="text-[0.78rem] text-pino-claro">
            guardado
          </span>
        )}
      </div>
    </article>
  )
}
