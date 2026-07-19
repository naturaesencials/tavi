import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { fechaCorta } from '@/lib/fechas'
import type { Album, Pagina } from '@/lib/tipos'

const ROTULO: Record<string, string> = {
  portada: 'Portada',
  embarazo: 'Antes',
  ciudad: 'Tu ciudad',
  nacimiento: 'Naciste',
  cumple: 'Cumpleaños',
}

export default async function IndiceAlbum({
  params,
}: {
  params: { slug: string }
}) {
  const supabase = createClient()

  const { data: album } = await supabase
    .from('albumes')
    .select('*')
    .eq('slug', params.slug)
    .single<Album>()

  if (!album) notFound()

  const { data: paginas } = await supabase
    .from('paginas')
    .select('*')
    .eq('album_id', album.id)
    .order('orden')
    .returns<Pagina[]>()

  const especiales = (paginas ?? []).filter((p) => p.tipo !== 'semana')
  const semanas = (paginas ?? []).filter((p) => p.tipo === 'semana')

  return (
    <main className="mx-auto min-h-dvh max-w-4xl px-6 py-14">
      <Link
        href="/"
        className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-pino/50 hover:text-ocre"
      >
        ← Álbumes
      </Link>

      <h1 className="mt-8 font-display text-[clamp(2.2rem,6vw,3.4rem)] leading-tight text-pino">
        {album.titulo}
      </h1>
      {album.subtitulo && (
        <p className="mt-3 text-pino/60">{album.subtitulo}</p>
      )}

      <div className="mt-12 flex flex-wrap gap-3">
        {especiales.map((p) => (
          <Link
            key={p.id}
            href={`/album/${album.slug}/${p.orden}`}
            className="border border-pino/20 bg-hueso-hondo/50 px-4 py-2.5 text-[0.85rem] font-medium text-pino transition-colors hover:border-ocre hover:text-ocre"
          >
            {ROTULO[p.tipo] ?? p.titulo}
          </Link>
        ))}
      </div>

      <h2 className="mt-14 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-pino-claro">
        Las 52 semanas
      </h2>

      <ol className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-2">
        {semanas.map((p) => (
          <li key={p.id}>
            <Link
              href={`/album/${album.slug}/${p.orden}`}
              className="block border border-pino/15 px-3 py-3 transition-colors hover:border-ocre hover:bg-hueso-hondo/40"
            >
              <span className="block font-display text-[1.4rem] leading-none text-pino">
                {p.numero_semana}
              </span>
              <span className="mt-1.5 block text-[0.68rem] tabular-nums text-pino/50">
                {p.fecha_inicio && fechaCorta(p.fecha_inicio)}
              </span>
              {p.nota_mundo && (
                <span
                  className="mt-2 block h-1 w-6 bg-ocre"
                  title="Tiene nota del mundo"
                />
              )}
            </Link>
          </li>
        ))}
      </ol>

      <p className="mt-6 text-[0.8rem] text-pino/50">
        La barra dorada marca las semanas que ya tienen algo del mundo contado.
      </p>
    </main>
  )
}
