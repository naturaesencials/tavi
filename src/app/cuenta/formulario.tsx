'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { cambiarContrasena, type EstadoClave } from './acciones'

const inicial: EstadoClave = { error: null, ok: false }

function Boton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-8 w-full rounded-sm bg-pino px-5 py-3.5 text-[0.95rem] font-medium tracking-wide text-hueso transition-colors hover:bg-pino-claro disabled:cursor-wait disabled:opacity-70"
    >
      {pending ? 'Guardando…' : 'Guardar contraseña'}
    </button>
  )
}

const campo =
  'mt-2 w-full border-b border-pino/25 bg-transparent pb-2 text-[1.05rem] text-tinta outline-none transition-colors focus:border-ocre'
const etiqueta =
  'block text-[0.7rem] font-bold uppercase tracking-[0.16em] text-pino-claro'

export default function FormularioClave() {
  const [estado, accion] = useFormState(cambiarContrasena, inicial)

  return (
    <form action={accion} className="mt-10 max-w-[23rem]">
      <label htmlFor="nueva" className={etiqueta}>
        Contraseña nueva
      </label>
      <input
        id="nueva"
        name="nueva"
        type="password"
        autoComplete="new-password"
        required
        minLength={10}
        className={campo}
      />

      <label htmlFor="repetida" className={`${etiqueta} mt-7`}>
        Repítela
      </label>
      <input
        id="repetida"
        name="repetida"
        type="password"
        autoComplete="new-password"
        required
        minLength={10}
        className={campo}
      />

      {estado.error && (
        <p
          role="alert"
          className="mt-6 border-l-2 border-rosa bg-rosa/20 px-3 py-2 text-[0.9rem] leading-snug text-tinta"
        >
          {estado.error}
        </p>
      )}
      {estado.ok && (
        <p
          role="status"
          className="mt-6 border-l-2 border-ocre bg-ocre/15 px-3 py-2 text-[0.9rem] leading-snug text-tinta"
        >
          Contraseña cambiada.
        </p>
      )}

      <Boton />
    </form>
  )
}
