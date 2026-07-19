import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { salir } from './login/actions'
import type { Album } from '@/lib/tipos'

export default async function Inicio() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: albumes } = await supabase
    .from('albumes')
    .select('*')
    .order('orden')
    .returns<Album[]>()

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center px-6 py-20">
      <p className="font-cuerpo text-[0.7rem] font-bold uppercase tracking-[0.24em] text-ocre">
        Dentro
      </p>
      <h1 className="mt-4 font-display text-[clamp(2.2rem,6vw,3.4rem)] leading-tight text-pino">
        Los álbumes
      </h1>
      <ul className="mt-8 space-y-3">
        {(albumes ?? []).map((a) => (
          <li key={a.id}>
            <Link
              href={`/album/${a.slug}`}
              className="block border border-pino/20 px-5 py-4 transition-colors hover:border-ocre"
            >
              <span className="block font-display text-[1.5rem] leading-tight text-pino">
                {a.titulo}
              </span>
              {a.subtitulo && (
                <span className="mt-1 block text-[0.85rem] text-pino/60">
                  {a.subtitulo}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-10 flex items-center gap-5 border-t border-pino/15 pt-6">
        <span className="font-cuerpo text-[0.85rem] text-pino/60">
          {user?.email ?? 'sin sesión'}
        </span>
        <Link
          href="/cuenta"
          className="font-cuerpo text-[0.85rem] font-medium text-pino underline underline-offset-4 hover:text-ocre"
        >
          Tu cuenta
        </Link>
        <form action={salir}>
          <button
            type="submit"
            className="font-cuerpo text-[0.85rem] font-medium text-pino underline underline-offset-4 hover:text-ocre"
          >
            Salir
          </button>
        </form>
      </div>
    </main>
  )
}
