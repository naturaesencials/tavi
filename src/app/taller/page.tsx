import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Subidor from './subidor'
import Ficha, { type FichaDatos } from './ficha'

type FilaFoto = Omit<FichaDatos, 'url' | 'hora_local'> & {
  poster_ruta: string | null
}

// La hora se enseña con el reloj del sitio donde se hizo la foto.
function horaLocal(iso: string | null, zona: string) {
  if (!iso) return null
  try {
    return new Intl.DateTimeFormat('es-ES', {
      timeZone: zona,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return null
  }
}

export default async function Taller({
  searchParams,
}: {
  searchParams: { filtro?: string }
}) {
  const supabase = createClient()
  const filtro = searchParams.filtro ?? 'pendientes'

  let consulta = supabase
    .from('fotos')
    .select(
      'id, ruta, poster_ruta, nombre_original, medio, tomada_en, fecha_inferida_de, lugar, categoria, titulo, nota, revisada, duracion_s, ancho, alto, zona_horaria'
    )
    .order('tomada_en', { ascending: true, nullsFirst: false })

  if (filtro === 'pendientes') consulta = consulta.eq('revisada', false)
  if (filtro === 'sinfecha') consulta = consulta.is('tomada_en', null)

  const { data } = await consulta.returns<FilaFoto[]>()
  const filas = data ?? []

  const rutas = filas.map((f) => f.ruta)
  const { data: firmadas } = rutas.length
    ? await supabase.storage.from('fotos').createSignedUrls(rutas, 3600)
    : { data: [] }

  const url = new Map<string, string>()
  ;(firmadas ?? []).forEach((s) => {
    if (s.path && s.signedUrl) url.set(s.path, s.signedUrl)
  })

  const { count: totales } = await supabase
    .from('fotos')
    .select('id', { count: 'exact', head: true })
  const { count: pendientes } = await supabase
    .from('fotos')
    .select('id', { count: 'exact', head: true })
    .eq('revisada', false)
  const { count: sinFecha } = await supabase
    .from('fotos')
    .select('id', { count: 'exact', head: true })
    .is('tomada_en', null)

  const pestanas = [
    ['pendientes', `Por revisar (${pendientes ?? 0})`],
    ['sinfecha', `Sin fecha (${sinFecha ?? 0})`],
    ['todas', `Todas (${totales ?? 0})`],
  ]

  return (
    <main className="mx-auto min-h-dvh max-w-6xl px-6 py-12">
      <Link
        href="/"
        className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-pino/50 hover:text-ocre"
      >
        ← Álbumes
      </Link>

      <h1 className="mt-8 font-display text-[clamp(2rem,5vw,3rem)] leading-tight text-pino">
        El taller
      </h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-pino/70">
        Aquí subes los archivos y me dices qué es cada uno. Yo leo la fecha y las
        coordenadas de donde pueda, y lo que no salga, lo corriges tú. Con las
        notas que escribas redacto después el texto del álbum.
      </p>

      <div className="mt-10">
        <Subidor />
      </div>

      <nav className="mt-12 flex flex-wrap gap-2">
        {pestanas.map(([v, n]) => (
          <Link
            key={v}
            href={`/taller?filtro=${v}`}
            className={`border px-4 py-2 text-[0.83rem] transition-colors ${
              filtro === v
                ? 'border-ocre bg-ocre/15 text-pino'
                : 'border-pino/20 text-pino/70 hover:border-ocre'
            }`}
          >
            {n}
          </Link>
        ))}
      </nav>

      {filas.length === 0 ? (
        <p className="mt-10 text-pino/50">
          Nada por aquí todavía. Arrastra los archivos arriba.
        </p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filas.map((f) => (
            <Ficha
              key={f.id}
              d={{
                ...f,
                hora_local: horaLocal(f.tomada_en, f.zona_horaria),
                url: url.get(f.ruta) ?? null,
              }}
            />
          ))}
        </div>
      )}
    </main>
  )
}
