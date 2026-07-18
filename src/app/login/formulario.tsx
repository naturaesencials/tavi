'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { entrar, type EstadoLogin } from './actions'

const estadoInicial: EstadoLogin = { error: null }

function Boton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 w-full rounded-sm bg-pino px-5 py-3.5 font-cuerpo text-[0.95rem] font-medium tracking-wide text-hueso transition-colors hover:bg-pino-claro disabled:cursor-wait disabled:opacity-70"
    >
      {pending ? 'Entrando…' : 'Entrar'}
    </button>
  )
}

export default function Formulario({ siguiente }: { siguiente: string }) {
  const [estado, accion] = useFormState(entrar, estadoInicial)

  return (
    <form action={accion} className="w-full max-w-[23rem]">
      <input type="hidden" name="siguiente" value={siguiente} />

      <label
        htmlFor="email"
        className="block text-[0.7rem] font-bold uppercase tracking-[0.16em] text-pino-claro"
      >
        Correo
      </label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
        className="mt-2 w-full border-b border-pino/25 bg-transparent pb-2 text-[1.05rem] text-tinta outline-none transition-colors placeholder:text-pino/30 focus:border-ocre"
        placeholder="tu@correo.com"
      />

      <label
        htmlFor="password"
        className="mt-7 block text-[0.7rem] font-bold uppercase tracking-[0.16em] text-pino-claro"
      >
        Contraseña
      </label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        className="mt-2 w-full border-b border-pino/25 bg-transparent pb-2 text-[1.05rem] text-tinta outline-none transition-colors placeholder:text-pino/30 focus:border-ocre"
        placeholder="••••••••"
      />

      {estado.error && (
        <p
          role="alert"
          className="mt-6 border-l-2 border-rosa bg-rosa/20 px-3 py-2 text-[0.9rem] leading-snug text-tinta"
        >
          {estado.error}
        </p>
      )}

      <div className="mt-8">
        <Boton />
      </div>

      <p className="mt-6 text-[0.82rem] leading-relaxed text-pino/60">
        Las cuentas se crean a mano. Si necesitas acceso, pídeselo a quien lleva
        el álbum.
      </p>
    </form>
  )
}
