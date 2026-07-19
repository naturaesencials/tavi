import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { fechaLarga, rango } from '@/lib/fechas'
import type { Album, Foto, Pagina } from '@/lib/tipos'
import Hoja from './hoja'

export default async function PaginaAlbum({
  params,
}: {
  params: { slug: string; orden: string }
}) {
  const orden = Number(params.orden)
  if (!Number.isInteger(orden)) notFound()

  const supabase = createClient()

  const { data: album } = await supabase
    .from('albumes')
    .select('*')
    .eq('slug', params.slug)
    .single<Album>()

  if (!album) notFound()

  const { data: pagina } = await supabase
    .from('paginas')
    .select('*')
    .eq('album_id', album.id)
    .eq('orden', orden)
    .single<Pagina>()

  if (!pagina) notFound()

  const { data: fotos } = await supabase
    .from('fotos')
    .select('*')
    .eq('pagina_id', pagina.id)
    .order('orden')
    .returns<Foto[]>()

  const { count: total } = await supabase
    .from('paginas')
    .select('id', { count: 'exact', head: true })
    .eq('album_id', album.id)

  const ultima = (total ?? 1) - 1

  const encabezado =
    pagina.tipo === 'semana'
      ? 'Cuaderno de expedición'
      : pagina.tipo === 'ciudad'
        ? 'El mapa'
        : pagina.tipo === 'nacimiento'
          ? 'El primer día'
          : pagina.tipo === 'embarazo'
            ? 'Antes del viaje'
            : pagina.tipo === 'cumple'
              ? 'Fin del primer año'
              : 'El álbum'

  const subtitulo =
    pagina.fecha_inicio && pagina.fecha_fin
      ? rango(pagina.fecha_inicio, pagina.fecha_fin)
      : pagina.fecha_inicio
        ? fechaLarga(pagina.fecha_inicio)
        : (album.subtitulo ?? '')

  return (
    <main className="mx-auto min-h-dvh max-w-5xl px-4 py-10">
      <nav className="mb-8 flex items-center justify-between gap-4">
        <Link
          href={`/album/${album.slug}`}
          className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-pino/50 hover:text-ocre"
        >
          ← Índice
        </Link>
        <div className="flex items-center gap-4 text-[0.85rem]">
          {orden > 0 && (
            <Link
              href={`/album/${album.slug}/${orden - 1}`}
              className="text-pino underline underline-offset-4 hover:text-ocre"
            >
              Anterior
            </Link>
          )}
          {orden < ultima && (
            <Link
              href={`/album/${album.slug}/${orden + 1}`}
              className="text-pino underline underline-offset-4 hover:text-ocre"
            >
              Siguiente
            </Link>
          )}
        </div>
      </nav>

      <Hoja
        encabezado={encabezado}
        titulo={pagina.titulo ?? album.titulo}
        subtitulo={subtitulo}
        texto={pagina.texto_cuento}
        notaTitulo={pagina.nota_mundo_titulo}
        nota={pagina.nota_mundo}
        pesoG={pagina.peso_g}
        tallaMm={pagina.talla_mm}
        cabezaMm={pagina.cabeza_mm}
        semana={pagina.numero_semana}
        fotos={(fotos ?? []).length}
        pie={album.titulo}
      />

      <p className="mt-6 text-center text-[0.8rem] text-pino/50">
        Los huecos se rellenan al subir las fotos. Las medidas y el texto se
        editan desde aquí en cuanto esté el editor.
      </p>
    </main>
  )
}
