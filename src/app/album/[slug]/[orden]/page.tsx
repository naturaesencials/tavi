import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { fechaLarga, fechaLargaEn, rango, rangoEn } from '@/lib/fechas'
import { elige, leerIdioma, T } from '@/lib/idioma'
import type { Album, Foto, Pagina } from '@/lib/tipos'
import QRCode from 'qrcode'
import { type FotoHoja } from './hoja'
import { cupoPorForma as cupoDeHoja } from '@/lib/composicion'
import HojaFotos from './hoja-fotos'
import HojaTexto from './hoja-texto'

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
    .returns<(Foto & { medio: 'foto' | 'video'; poster_ruta: string | null; titulo_en: string | null })[]>()

  // Un enlace firmado por archivo: el bucket es privado y no se sirve solo.
  const rutas = (fotos ?? []).flatMap((f) =>
    [f.ruta, f.poster_ruta].filter(Boolean as unknown as (x: unknown) => x is string)
  )
  const { data: firmadas } = rutas.length
    ? await supabase.storage.from('fotos').createSignedUrls(rutas, 3600)
    : { data: [] }
  const enlace = new Map<string, string>()
  ;(firmadas ?? []).forEach((s) => {
    if (s.path && s.signedUrl) enlace.set(s.path, s.signedUrl)
  })

  const base =
    process.env.NEXT_PUBLIC_URL_PUBLICA ?? 'https://tavi-phi.vercel.app'

  // Un A4 con texto no admite más de tres fotos si han de verse bien. Lo que
  // pase de ahí continúa en otra hoja de la misma página.

  const imagenes: FotoHoja[] = await Promise.all(
    (fotos ?? []).map(async (f) => {
      const ficha = (f as unknown as { ficha_publica: string | null })
        .ficha_publica
      const qr =
        f.medio === 'video' && ficha
          ? await QRCode.toString(`${base}/v/${ficha}`, {
              type: 'svg',
              margin: 0,
              errorCorrectionLevel: 'M',
              color: { dark: '#2E3A34', light: '#0000' },
            })
          : null
      return {
        id: f.id,
        url: enlace.get(f.ruta) ?? null,
        posterUrl: f.poster_ruta ? (enlace.get(f.poster_ruta) ?? null) : null,
        medio: f.medio,
        titulo: elige(f.titulo, f.titulo_en, idioma),
        lugar: f.lugar,
        categoria: (f as unknown as { categoria: string | null }).categoria,
        fecha: f.tomada_en
          ? new Intl.DateTimeFormat(idioma === 'en' ? 'en-GB' : 'es-ES', {
              timeZone:
                (f as unknown as { zona_horaria: string }).zona_horaria ??
                'Europe/Madrid',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }).format(new Date(f.tomada_en))
          : null,
        ancho: (f as unknown as { ancho: number | null }).ancho,
        alto: (f as unknown as { alto: number | null }).alto,
        duracion: (f as unknown as { duracion_s: number | null }).duracion_s,
        qr,
      }
    })
  )

  const { count: total } = await supabase
    .from('paginas')
    .select('id', { count: 'exact', head: true })
    .eq('album_id', album.id)

  const ultima = (total ?? 1) - 1

  const encabezado =
    pagina.tipo === 'semana'
      ? t.cuaderno
      : pagina.tipo === 'origen'
        ? t.origen
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

  const cuento = elige(pagina.texto_cuento, pagina.texto_cuento_en, idioma) ?? ''

  /* El álbum es un scrapbook: cada página se parte en dos hojas. La de fotos
     lleva las copias giradas y un apunte breve; la del cuento lleva el texto
     largo, que en un scrapbook no cabría entre las fotos. Las páginas sin
     fotos siguen siendo una sola hoja. */
  /* Cuántas fotos entran en una hoja lo decide el motor según su forma:
     3 verticales, 4 horizontales, 5 cuadradas. Se agrupan respetando ese
     cupo en vez de un número fijo. */
  const gruposFotos: FotoHoja[][] = []
  {
    let resto = [...imagenes]
    while (resto.length > 0) {
      const cupo = cupoDeHoja(
        resto.map((im) => ({ id: im.id, ancho: im.ancho, alto: im.alto }))
      )
      gruposFotos.push(resto.slice(0, cupo))
      resto = resto.slice(cupo)
    }
  }

  /* Si sobra una hoja de fotos con muy pocas (una o dos) y el cuento es
     corto, esas fotos se llevan a la hoja de texto como recortes al margen,
     en vez de dejar una hoja casi vacía. Es lo que pediste: combinar las
     fotos que faltan en la página del texto cuando hay hueco. */
  let fotosEnTexto: FotoHoja[] = []
  if (
    gruposFotos.length >= 2 &&
    gruposFotos[gruposFotos.length - 1].length <= 2 &&
    cuento.length < 900
  ) {
    fotosEnTexto = gruposFotos.pop() ?? []
  }

  const hojasDeFotos = gruposFotos.length

  // El apunte manuscrito de la hoja de fotos: la primera frase del cuento.
  const apunte =
    cuento.trim().split(/(?<=[.!?])\s+/)[0]?.slice(0, 160) || null

  const medidas =
    pagina.tipo === 'semana'
      ? `${t.peso}: ${pagina.peso_g === null ? '—' : `${(pagina.peso_g / 1000).toLocaleString('es-ES')} kg`} · ` +
        `${t.talla}: ${pagina.talla_mm === null ? '—' : `${(pagina.talla_mm / 10).toLocaleString('es-ES')} cm`} · ` +
        `${t.cabeza}: ${pagina.cabeza_mm === null ? '—' : `${(pagina.cabeza_mm / 10).toLocaleString('es-ES')} cm`}`
      : null

  const sello: [string, string] | null = pagina.fecha_inicio
    ? [
        new Date(pagina.fecha_inicio)
          .toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
          .replace('.', '')
          .toUpperCase(),
        String(new Date(pagina.fecha_inicio).getFullYear()),
      ]
    : null

  const tituloPagina =
    elige(pagina.titulo, pagina.titulo_en, idioma) ??
    elige(album.titulo, album.titulo_en, idioma) ??
    ''

  // El pliego decide el color del papel: las hojas de una misma página lo
  // comparten, y la página siguiente estrena color.
  const pliego = orden

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

      {Array.from({ length: hojasDeFotos }, (_, i) => (
        <HojaFotos
          key={`f${i}`}
          encabezado={encabezado}
          titulo={
            tituloPagina + (i > 0 ? (idioma === 'en' ? ' (continues)' : ' (sigue)') : '')
          }
          sello={i === 0 ? sello : null}
          nota={i === 0 ? apunte : null}
          imagenes={gruposFotos[i]}
          numero={pagina.numero_semana}
          pliego={pliego}
        />
      ))}

      <HojaTexto
        encabezado={encabezado}
        titulo={tituloPagina}
        subtitulo={subtitulo}
        texto={cuento || null}
        notaTitulo={elige(pagina.nota_mundo_titulo, pagina.nota_mundo_titulo_en, idioma)}
        nota={elige(pagina.nota_mundo, pagina.nota_mundo_en, idioma)}
        medidas={medidas}
        firma={idioma === 'en' ? 'dad' : 'papá'}
        fotos={fotosEnTexto}
        numero={pagina.numero_semana}
        pliego={pliego}
      />

      <p className="mt-6 text-center text-[0.8rem] text-pino/50">
        {t.aviso}
      </p>
    </main>
  )
}
