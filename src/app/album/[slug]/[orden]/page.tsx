import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { fechaLarga, fechaLargaEn, rango, rangoEn } from '@/lib/fechas'
import { elige, leerIdioma, T } from '@/lib/idioma'
import type { Album, Foto, Pagina } from '@/lib/tipos'
import Hoja from './hoja'

export default async function PaginaAlbum({
  params,
  searchParams,
}: {
  params: { slug: string; orden: string }
  searchParams: { idioma?: string }
}) {
  const idioma = leerIdioma(searchParams.idioma)
  const t = T[idioma]
  const otro = idioma === 'es' ? 'en' : 'es'
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
      ? t.cuaderno
      : pagina.tipo === 'nombre'
        ? t.nombre
        : pagina.tipo === 'hito'
          ? t.hito
          : pagina.tipo === 'viaje'
            ? t.viaje
            : pagina.tipo === 'ciudad'
              ? t.mapa
              : pagina.tipo === 'nacimiento'
                ? t.primerDia
                : pagina.tipo === 'embarazo'
                  ? t.antes
                  : pagina.tipo === 'cumple'
                    ? t.finAno
                    : t.album

  const subtitulo =
    pagina.fecha_inicio && pagina.fecha_fin
      ? idioma === 'en'
        ? rangoEn(pagina.fecha_inicio, pagina.fecha_fin)
        : rango(pagina.fecha_inicio, pagina.fecha_fin)
      : pagina.fecha_inicio
        ? idioma === 'en'
          ? fechaLargaEn(pagina.fecha_inicio)
          : fechaLarga(pagina.fecha_inicio)
        : (elige(album.subtitulo, album.subtitulo_en, idioma) ?? '')

  return (
    <main className="mx-auto min-h-dvh max-w-5xl px-4 py-10">
      <nav className="mb-8 flex items-center justify-between gap-4">
        <Link
          href={`/album/${album.slug}?idioma=${idioma}`}
          className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-pino/50 hover:text-ocre"
        >
          ← {t.indice}
        </Link>
        <div className="flex items-center gap-4 text-[0.85rem]">
          <Link
            href={`/album/${album.slug}/${orden}?idioma=${otro}`}
            className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-ocre hover:text-pino"
          >
            {t.otroIdioma}
          </Link>
          {orden > 0 && (
            <Link
              href={`/album/${album.slug}/${orden - 1}?idioma=${idioma}`}
              className="text-pino underline underline-offset-4 hover:text-ocre"
            >
              {t.anterior}
            </Link>
          )}
          {orden < ultima && (
            <Link
              href={`/album/${album.slug}/${orden + 1}?idioma=${idioma}`}
              className="text-pino underline underline-offset-4 hover:text-ocre"
            >
              {t.siguiente}
            </Link>
          )}
        </div>
      </nav>

      <Hoja
        encabezado={encabezado}
        idioma={idioma}
        esSemana={pagina.tipo === 'semana'}
        titulo={
          elige(pagina.titulo, pagina.titulo_en, idioma) ??
          elige(album.titulo, album.titulo_en, idioma) ??
          ''
        }
        subtitulo={subtitulo}
        texto={elige(pagina.texto_cuento, pagina.texto_cuento_en, idioma)}
        notaTitulo={elige(
          pagina.nota_mundo_titulo,
          pagina.nota_mundo_titulo_en,
          idioma
        )}
        nota={elige(pagina.nota_mundo, pagina.nota_mundo_en, idioma)}
        pesoG={pagina.peso_g}
        tallaMm={pagina.talla_mm}
        cabezaMm={pagina.cabeza_mm}
        semana={pagina.numero_semana}
        fotos={(fotos ?? []).length}
        pie={elige(album.titulo, album.titulo_en, idioma) ?? ''}
      />

      <p className="mt-6 text-center text-[0.8rem] text-pino/50">
        {t.aviso}
      </p>
    </main>
  )
}
