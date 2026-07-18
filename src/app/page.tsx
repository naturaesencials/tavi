import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { salir } from './login/actions'

export default async function Inicio() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center px-6 py-20">
      <p className="font-cuerpo text-[0.7rem] font-bold uppercase tracking-[0.24em] text-ocre">
        Dentro
      </p>
      <h1 className="mt-4 font-display text-[clamp(2.2rem,6vw,3.4rem)] leading-tight text-pino">
        Los álbumes
      </h1>
      <p className="mt-5 max-w-lg font-cuerpo leading-relaxed text-pino/70">
        Todavía no hay ningún álbum. El siguiente paso es la subida de fotos con
        lectura de fecha y lugar.
      </p>

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
