import Link from 'next/link'
import FormularioClave from './formulario'

export default function Cuenta() {
  return (
    <main className="mx-auto min-h-dvh max-w-3xl px-6 py-16">
      <Link
        href="/"
        className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-pino/50 hover:text-ocre"
      >
        ← Álbumes
      </Link>
      <h1 className="mt-8 font-display text-[clamp(2rem,5vw,2.8rem)] leading-tight text-pino">
        Tu cuenta
      </h1>
      <p className="mt-4 max-w-lg leading-relaxed text-pino/70">
        Cambia aquí la contraseña con la que entras al álbum.
      </p>
      <FormularioClave />
    </main>
  )
}
