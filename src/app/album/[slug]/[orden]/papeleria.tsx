import type { Papel, Cinta, Adorno } from '@/lib/escenografia'

/** Piezas de papelería. Todas son SVG, así que se imprimen a la resolución
 *  de la imprenta y no pixelan por mucho que se amplíen. */

export const mm = (n: number) => `calc(${n} * var(--mm))`

/** Trama impresa del papel de fondo. Va a sangre. */
export function Trama({ papel, clave }: { papel: Papel; clave: string }) {
  const id = `trama-${clave}`
  return (
    <svg
      aria-hidden
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      <defs>
        <pattern id={id} width="34" height="34" patternUnits="userSpaceOnUse">
          <path
            d="M8 8h6M11 5v6"
            stroke={papel.trama}
            strokeWidth="1.1"
            fill="none"
            opacity="0.6"
          />
          <circle cx="26" cy="24" r="2.2" fill={papel.trama} opacity="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={papel.fondo} />
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}

/** Papel rasgado que se superpone al fondo y sostiene el contenido. El borde
 *  se dibuja irregular a propósito: cortado con regla parecería una caja. */
export function PapelRasgado({
  papel,
  ancho,
  alto,
  giro = -0.6,
}: {
  papel: Papel
  ancho: number
  alto: number
  giro?: number
}) {
  const dientes = 26
  let izq = `M6 4`
  for (let i = 1; i <= dientes; i++) {
    const y = (alto - 8) * (i / dientes) + 4
    const x = 6 + (i % 2 === 0 ? 3.2 : -2.4) + (i % 3 === 0 ? 1.4 : 0)
    izq += ` L${x.toFixed(1)} ${y.toFixed(1)}`
  }
  const d = `${izq} L${ancho - 5} ${alto - 4} L${ancho - 6} 5 Z`
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${ancho} ${alto}`}
      style={{
        position: 'absolute',
        width: mm(ancho),
        height: mm(alto),
        transform: `rotate(${giro}deg)`,
      }}
    >
      <path d={d} fill="rgba(0,0,0,0.10)" transform="translate(2.5,3)" />
      <path d={d} fill={papel.hoja} />
    </svg>
  )
}

/** Cinta adhesiva. Cada estampado sale de una bolsa distinta por página. */
export function CintaAdhesiva({
  tipo,
  papel,
  ancho = 26,
  giro = -10,
}: {
  tipo: Cinta
  papel: Papel
  ancho?: number
  giro?: number
}) {
  const alto = 7.5
  const color =
    tipo === 'lisa' ? papel.acento : tipo === 'ondas' ? papel.suave : papel.acento
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${ancho} ${alto}`}
      style={{
        position: 'absolute',
        width: mm(ancho),
        height: mm(alto),
        transform: `rotate(${giro}deg)`,
      }}
    >
      <rect width={ancho} height={alto} fill={color} opacity="0.72" />
      {tipo === 'rayas' &&
        Array.from({ length: Math.floor(ancho / 3) }, (_, i) => (
          <path
            key={i}
            d={`M${i * 3 + 1} 0 L${i * 3 + 1} ${alto}`}
            stroke={papel.hoja}
            strokeWidth="1.1"
            opacity="0.6"
          />
        ))}
      {tipo === 'topos' &&
        Array.from({ length: Math.floor(ancho / 5) }, (_, i) => (
          <circle
            key={i}
            cx={i * 5 + 2.5}
            cy={alto / 2}
            r="1.3"
            fill={papel.hoja}
            opacity="0.7"
          />
        ))}
      {tipo === 'cuadros' && (
        <>
          <path
            d={`M0 ${alto / 2} H${ancho}`}
            stroke={papel.hoja}
            strokeWidth="1"
            opacity="0.55"
          />
          {Array.from({ length: Math.floor(ancho / 4) }, (_, i) => (
            <path
              key={i}
              d={`M${i * 4 + 2} 0 V${alto}`}
              stroke={papel.hoja}
              strokeWidth="1"
              opacity="0.55"
            />
          ))}
        </>
      )}
      {tipo === 'ondas' && (
        <path
          d={Array.from(
            { length: Math.ceil(ancho / 4) },
            (_, i) => `M${i * 4} ${alto / 2} q2 -2 4 0`
          ).join(' ')}
          stroke={papel.hoja}
          strokeWidth="1.1"
          fill="none"
          opacity="0.65"
        />
      )}
    </svg>
  )
}

/** Esquinas de montaje, de las de pegar en el álbum de toda la vida. */
export function EsquinasMontaje({
  ancho,
  alto,
  papel,
}: {
  ancho: number
  alto: number
  papel: Papel
}) {
  const l = 7
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${ancho} ${alto}`}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      <g fill={papel.suave} opacity="0.85">
        <path d={`M0 0 h${l} L0 ${l} Z`} />
        <path d={`M${ancho} 0 h-${l} L${ancho} ${l} Z`} />
        <path d={`M0 ${alto} h${l} L0 ${alto - l} Z`} />
        <path d={`M${ancho} ${alto} h-${l} L${ancho} ${alto - l} Z`} />
      </g>
    </svg>
  )
}

/** Sello de fecha, como el de la oficina de correos. */
export function SelloFecha({
  linea1,
  linea2,
  papel,
  giro = -9,
}: {
  linea1: string
  linea2: string
  papel: Papel
  giro?: number
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 60 60"
      style={{
        position: 'absolute',
        width: mm(26),
        height: mm(26),
        transform: `rotate(${giro}deg)`,
      }}
    >
      <circle
        cx="30"
        cy="30"
        r="27"
        fill="none"
        stroke={papel.suave}
        strokeWidth="2.2"
        opacity="0.85"
      />
      <circle
        cx="30"
        cy="30"
        r="22"
        fill="none"
        stroke={papel.suave}
        strokeWidth="1"
        opacity="0.7"
      />
      <text
        x="30"
        y="27"
        textAnchor="middle"
        fontSize="10"
        fill={papel.suave}
        fontFamily="Georgia, serif"
      >
        {linea1}
      </text>
      <text
        x="30"
        y="40"
        textAnchor="middle"
        fontSize="10"
        fill={papel.suave}
        fontFamily="Georgia, serif"
      >
        {linea2}
      </text>
    </svg>
  )
}

const TRAZOS: Record<Adorno, string> = {
  tienda: 'M6 46l18-26 18 26M24 20v26M14 46l10-14 10 14M2 46h44',
  globo: 'M24 8c9 0 15 7 15 15s-9 20-15 26c-6-6-15-16-15-26S15 8 24 8zM20 49h8l-4 5z',
  estrella: 'M24 8l5 14 15 1-11 10 3 15-12-8-12 8 3-15-11-10 15-1z',
  barco: 'M6 38h36l-6 10H12zM24 36V8L10 32z',
  sol: 'M24 14a10 10 0 100 20 10 10 0 100-20M24 4v6M24 38v6M4 24h6M38 24h6M10 10l4 4M34 34l4 4M38 10l-4 4M14 34l-4 4',
  casa: 'M8 24v22h32V24M4 24L24 6l20 18M20 46V32h8v14',
  pez: 'M8 26c8-10 22-10 30 0-8 10-22 10-30 0M38 26l8-7v14zM16 22h.5',
  bici: 'M12 36a8 8 0 1016 0 8 8 0 10-16 0M28 36a8 8 0 1016 0 8 8 0 10-16 0M20 36l8-16h8M28 20l8 16M14 20h8',
  nube: 'M12 36c-5 0-9-4-9-8s4-8 9-8c1-6 7-10 13-8 4-6 13-4 15 3 6 0 10 6 8 12s-7 9-13 9z',
  gato: 'M16 20l-3-10 9 4M32 20l3-10-9 4M14 24a10 10 0 1020 0 10 10 0 10-20 0M8 30h6M34 30h6M18 34c3 3 9 3 12 0',
  cometa: 'M24 6l14 16-14 16-14-16zM24 6v32M10 22h28M24 38c2 6-2 8 0 12s-2 6 0 8',
  hoja: 'M24 46C10 36 8 18 24 6c16 12 14 30 0 40zM24 46V12',
  pajaro: 'M8 30c8-10 20-10 26-2 4-4 10-4 12 2-8 4-14 10-22 10-8 0-14-4-16-10zM34 26l6-4-2 8',
  tren: 'M8 34h28V18H8zM36 26h8v8h-8zM12 40a3 3 0 106 0 3 3 0 10-6 0M28 40a3 3 0 106 0 3 3 0 10-6 0M14 22h6v6h-6z',
  luna: 'M30 8a18 18 0 100 32 22 22 0 010-32z',
  flor: 'M24 22a6 6 0 100 12 6 6 0 100-12M24 8c6 0 8 8 4 14M24 8c-6 0-8 8-4 14M10 30c-2-6 6-10 10-4M38 30c2-6-6-10-10-4M24 34v12M20 42c4-4 8-2 8 2',
}

export function Dibujo({
  adorno,
  papel,
  tam = 20,
  giro = 0,
  opacidad = 0.55,
}: {
  adorno: Adorno
  papel: Papel
  tam?: number
  giro?: number
  opacidad?: number
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 48 52"
      style={{
        position: 'absolute',
        width: mm(tam),
        height: mm(tam * 1.08),
        transform: `rotate(${giro}deg)`,
      }}
    >
      <path
        d={TRAZOS[adorno]}
        fill="none"
        stroke={papel.tinta}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={opacidad}
      />
    </svg>
  )
}

import { PAGINA } from '@/lib/maqueta'

/** Armazón de la hoja: el papel físico.
 *
 *  La variable --mm es la clave de todo. En pantalla vale lo que dé el ancho
 *  disponible; al imprimir vale un milímetro de verdad. Así la pantalla y el
 *  papel son exactamente la misma página.
 */
export function Pagina({
  papel,
  clave,
  sangrado,
  numero,
  children,
}: {
  papel: Papel
  clave: string
  sangrado: boolean
  numero: number | null
  children: React.ReactNode
}) {
  const s = sangrado ? PAGINA.sangrado : 0
  const anchoPapel = PAGINA.ancho + s * 2
  const altoPapel = PAGINA.alto + s * 2

  return (
    <div
      className="hoja-envoltura"
      style={{
        containerType: 'inline-size',
        width: '100%',
        maxWidth: `${anchoPapel}mm`,
        margin: '0 auto',
      }}
    >
      <article
        className="hoja"
        style={
          {
            '--mm': `calc(100cqi / ${anchoPapel})`,
            position: 'relative',
            width: mm(anchoPapel),
            height: mm(altoPapel),
            overflow: 'hidden',
            color: papel.tinta,
            boxShadow: '0 2px 18px rgba(80,70,50,0.18)',
          } as React.CSSProperties
        }
      >
        <Trama papel={papel} clave={clave} />
        <div
          style={{
            position: 'absolute',
            left: mm(s),
            top: mm(s),
            width: mm(PAGINA.ancho),
            height: mm(PAGINA.alto),
          }}
        >
          {children}
          {numero !== null ? (
            <div
              style={{
                position: 'absolute',
                right: mm(14),
                bottom: mm(12),
                width: mm(11),
                height: mm(11),
                borderRadius: '50%',
                background: papel.acento,
                color: papel.hoja,
                fontSize: mm(4.4),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {numero}
            </div>
          ) : null}
        </div>
      </article>
    </div>
  )
}

/** Etiqueta con el código QR de un vídeo.
 *
 *  Va sobre papel claro y con margen propio: un QR necesita zona de silencio
 *  alrededor, y aquí el fondo es papel estampado. El tamaño no es decorativo:
 *  el código tiene 33 módulos, así que por debajo de unos 18 mm impresos el
 *  móvil deja de leerlo con fiabilidad. Se dibuja a 20 mm.
 */
export function EtiquetaQR({
  svg,
  papel,
  texto = 'vídeo',
  giro = -4,
}: {
  svg: string
  papel: Papel
  texto?: string
  giro?: number
}) {
  const LADO = 20
  const AIRE_QR = 3
  return (
    <div
      style={{
        width: mm(LADO + AIRE_QR * 2),
        transform: `rotate(${giro}deg)`,
        background: '#FFFDF8',
        boxShadow: `${mm(0.5)} ${mm(0.8)} ${mm(1.6)} rgba(60,50,35,0.24)`,
        padding: `${mm(AIRE_QR)} ${mm(AIRE_QR)} ${mm(1.5)}`,
        boxSizing: 'border-box',
        textAlign: 'center',
      }}
    >
      <div
        style={{ width: mm(LADO), height: mm(LADO) }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <span
        style={{
          display: 'block',
          marginTop: mm(1),
          fontSize: mm(2.4),
          fontStyle: 'italic',
          color: papel.suave,
        }}
      >
        {texto}
      </span>
    </div>
  )
}
