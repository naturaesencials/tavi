import Formulario from './formulario'

// La cinta métrica: el gesto que se repite cada semana en las fotos de la manta.
function CintaMetrica() {
  const marcas = Array.from({ length: 41 }, (_, i) => i)
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-y-0 left-0 hidden w-24 select-none border-r border-pino/15 md:block"
    >
      <div className="flex h-full flex-col justify-between py-10">
        {marcas.map((m) => {
          const larga = m % 5 === 0
          return (
            <div key={m} className="flex items-center gap-3 pl-5">
              <span
                className="block h-px bg-pino/40"
                style={{ width: larga ? 22 : 11 }}
              />
              {larga && (
                <span className="font-cuerpo text-[0.6rem] tabular-nums tracking-widest text-pino/40">
                  {90 - m}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function PaginaLogin({
  searchParams,
}: {
  searchParams: { siguiente?: string }
}) {
  const siguiente = searchParams.siguiente ?? '/'

  return (
    <main className="relative min-h-dvh bg-hueso">
      <CintaMetrica />

      <div className="mx-auto flex min-h-dvh max-w-5xl flex-col justify-center px-6 py-12 md:py-16 md:pl-40 md:pr-10">
        <header className="mb-10 md:mb-14">
          <p className="font-cuerpo text-[0.7rem] font-bold uppercase tracking-[0.24em] text-ocre">
            Archivo privado
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.2rem,7vw,4.4rem)] font-normal leading-[0.95] tracking-tight text-pino">
            El álbum
            <br />
            de Tavi
          </h1>
          <p className="mt-5 max-w-[26rem] font-cuerpo text-[0.95rem] leading-relaxed text-pino/70 md:text-[1rem]">
            Semana a semana, medida a medida. Aquí dentro está todo: el
            embarazo, el día que nació y cada manta con su fecha.
          </p>
        </header>

        <Formulario siguiente={siguiente} />
      </div>

      <footer className="pb-8 text-center font-cuerpo text-[0.72rem] uppercase tracking-[0.2em] text-pino/35">
        Solo por invitación
      </footer>
    </main>
  )
}
