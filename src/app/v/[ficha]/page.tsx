import { createBrowserClient } from '@supabase/ssr'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

type Fila = {
  ruta: string
  titulo: string | null
  titulo_en: string | null
  duracion_s: number | null
}

// Sin sesión: se usa la clave pública, que solo puede llegar a los vídeos
// que tienen ficha, y únicamente acertando la ficha exacta.
function clientePublico() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export default async function VerVideo({
  params,
}: {
  params: { ficha: string }
}) {
  const supabase = clientePublico()

  const { data } = await supabase.rpc('video_por_ficha', {
    la_ficha: params.ficha,
  })

  const video = (data as Fila[] | null)?.[0]
  if (!video) notFound()

  const { data: firmada } = await supabase.storage
    .from('fotos')
    .createSignedUrl(video.ruta, 60 * 60)

  if (!firmada?.signedUrl) notFound()

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center px-5 py-10">
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-ocre">
        El álbum de Tavi
      </p>
      <h1 className="mt-3 font-display text-[clamp(1.6rem,5vw,2.4rem)] leading-tight text-pino">
        {video.titulo ?? 'Un vídeo del álbum'}
      </h1>

      <video
        src={firmada.signedUrl}
        controls
        autoPlay
        playsInline
        className="mt-7 w-full rounded-lg bg-black"
      />

      <p className="mt-5 text-[0.85rem] text-pino/55">
        Has llegado aquí escaneando el código del álbum impreso.
        {video.duracion_s
          ? ` Dura ${Math.round(video.duracion_s)} segundos.`
          : ''}
      </p>
    </main>
  )
}
