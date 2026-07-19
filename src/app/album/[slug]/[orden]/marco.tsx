import type { ReactNode } from 'react'

export type EstiloMarco = 'mano' | 'sello' | 'esquineras' | 'cinta'

const TRAZO = '#5A665C'

/** Número estable entre 0 y 1 a partir de un texto: el mismo id siempre da
 *  el mismo temblor, así que la página no cambia entre visitas ni al imprimir. */
function semilla(id: string, salto = 0) {
  let h = 2166136261 ^ salto
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 10000) / 10000
}

/** Elige marco imitando a un niño que va cambiando de idea, pero sin dejar
 *  que los recortes se coman documentos. */
// Ningún marco recorta la imagen: es un álbum de fotos y la foto manda.
const BARAJA: EstiloMarco[] = ['mano', 'esquineras', 'sello', 'cinta']

export function elegirMarco(
  _id: string,
  _categoria: string | null,
  _esPrincipal: boolean,
  indice = 0,
  clavePagina = ''
): EstiloMarco {
  // La página decide por dónde empieza la baraja y a partir de ahí se rota
  // foto a foto, como quien va gastando pegatinas distintas en vez de
  // repetir la misma cuatro veces.
  const arranque = Math.floor(semilla(clavePagina, 3) * BARAJA.length)
  return BARAJA[(arranque + indice) % BARAJA.length]
}

/** Rectángulo dibujado a pulso: cada lado se desvía un poco de la recta. */
function trazoAMano(id: string, salto: number) {
  const d = (n: number, amp = 2.6) => (semilla(id, salto + n) - 0.5) * amp
  const x0 = 1.6 + d(1)
  const y0 = 1.6 + d(2)
  const x1 = 98.4 + d(3)
  const y1 = 98.4 + d(4)
  return `M${x0} ${y0}
    C${25 + d(5, 8)} ${y0 + d(6)}, ${68 + d(7, 8)} ${y0 + d(8)}, ${x1} ${y0 + d(9)}
    C${x1 + d(10)} ${28 + d(11, 9)}, ${x1 + d(12)} ${70 + d(13, 9)}, ${x1 + d(14)} ${y1}
    C${72 + d(15, 8)} ${y1 + d(16)}, ${30 + d(17, 8)} ${y1 + d(18)}, ${x0 + d(19)} ${y1 + d(20)}
    C${x0 + d(21)} ${68 + d(22, 9)}, ${x0 + d(23)} ${26 + d(24, 9)}, ${x0} ${y0} Z`
}

function Esquineras() {
  const esquina = (
    estilo: React.CSSProperties,
    d: string
  ): ReactNode => (
    <svg
      viewBox="0 0 30 30"
      style={{ position: 'absolute', width: '13%', maxWidth: '30px', ...estilo }}
    >
      <path d={d} fill="none" stroke={TRAZO} strokeWidth="2.4" strokeLinejoin="round" />
    </svg>
  )
  return (
    <>
      {esquina({ top: '-4px', left: '-4px' }, 'M2 28L28 2H2z')}
      {esquina({ top: '-4px', right: '-4px' }, 'M28 28L2 2h26z')}
      {esquina({ bottom: '-4px', left: '-4px' }, 'M2 2l26 26H2z')}
      {esquina({ bottom: '-4px', right: '-4px' }, 'M28 2L2 28h26z')}
    </>
  )
}

function Cinta({ id }: { id: string }) {
  const g1 = -18 - semilla(id, 31) * 14
  const g2 = 160 + semilla(id, 32) * 16
  const tira = (estilo: React.CSSProperties, giro: number): ReactNode => (
    <span
      style={{
        position: 'absolute',
        width: '22%',
        maxWidth: '58px',
        height: '15px',
        border: `1.4px solid ${TRAZO}`,
        background: 'rgba(255,255,255,0.55)',
        transform: `rotate(${giro}deg)`,
        ...estilo,
      }}
    />
  )
  return (
    <>
      {tira({ top: '-7px', left: '-10px' }, g1)}
      {tira({ bottom: '-7px', right: '-10px' }, g2)}
    </>
  )
}

export default function Marco({
  id,
  estilo,
  children,
}: {
  id: string
  estilo: EstiloMarco
  children: ReactNode
}) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: estilo === 'mano' ? '3px' : undefined,
          overflow: 'hidden',
        }}
      >
        {children}
      </div>

      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          overflow: 'visible',
        }}
      >
        {estilo === 'mano' && (
          <>
            <path
              d={trazoAMano(id, 0)}
              fill="none"
              stroke={TRAZO}
              strokeWidth="1.8"
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
            />
            <path
              d={trazoAMano(id, 50)}
              fill="none"
              stroke={TRAZO}
              strokeWidth="0.8"
              opacity="0.5"
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
            />
          </>
        )}
        {estilo === 'sello' && (
          <rect
            x="1"
            y="1"
            width="98"
            height="98"
            fill="none"
            stroke={TRAZO}
            strokeWidth="1.6"
            strokeDasharray="0.6 4.2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>

      {estilo === 'esquineras' && <Esquineras />}
      {estilo === 'cinta' && <Cinta id={id} />}
    </div>
  )
}
