const TRAZO = '#CBD3CA'

type Dibujo = { d: string; ancho: number }

// Cada dibujo cabe en una caja de 100×100 y se coloca escalado. Todos son de
// pocos trazos, como los haría un niño.
const DIBUJOS: Record<string, Dibujo> = {
  sol: {
    ancho: 100,
    d: 'M50 30a20 20 0 1 1 0 40a20 20 0 1 1 0-40M50 18v-9M50 91v-9M80 50h9M11 50h9M71 29l7-7M22 78l7-7M71 71l7 7M22 22l7 7',
  },
  nube: {
    ancho: 120,
    d: 'M26 68c-11 0-19-8-19-17s8-17 19-16c3-12 13-19 23-14 7-8 20-7 24 4 12-1 20 8 18 19-2 10-10 15-21 15z',
  },
  cohete: {
    ancho: 80,
    d: 'M50 8c14 14 20 32 20 50l-14 12H44L30 58c0-18 6-36 20-50zM30 62L14 76l14 4M70 62l16 14-14 4M44 88l6 12 6-12M50 40a6 6 0 1 1 0-12a6 6 0 1 1 0 12',
  },
  estrella: {
    ancho: 46,
    d: 'M50 10l11 26 28 3-21 19 6 28-24-14-24 14 6-28-21-19 28-3z',
  },
  barco: {
    ancho: 110,
    d: 'M50 14l32 46H50zM50 14L18 60h32zM8 66h84l-14 22H22zM6 96q12-8 24 0t24 0 24 0',
  },
  olas: {
    ancho: 130,
    d: 'M4 34q14-11 28 0t28 0 28 0 28 0M4 58q14-11 28 0t28 0 28 0 28 0M4 82q14-11 28 0t28 0 28 0 28 0',
  },
  avion: {
    ancho: 120,
    d: 'M10 58l82-26-12 22 14 26-30-14-18 18-4-16z',
  },
  globo: {
    ancho: 80,
    d: 'M50 10c17 0 30 14 30 31 0 15-14 27-22 33H42c-8-6-22-18-22-33 0-17 13-31 30-31M32 40h36M50 10v64M42 78h16l-3 16H45z',
  },
  montana: {
    ancho: 130,
    d: 'M6 84L38 30l18 26 14-18 34 46zM38 30l10 16H28zM70 38l8 10H62z',
  },
  corazon: {
    ancho: 70,
    d: 'M50 88C24 68 12 54 12 38c0-13 10-22 21-22 7 0 13 4 17 10 4-6 10-10 17-10 11 0 21 9 21 22 0 16-12 30-38 50z',
  },
  cuna: {
    ancho: 120,
    d: 'M12 44h76v34a10 10 0 0 1-10 10H22a10 10 0 0 1-10-10zM12 44v-8M28 44V22M44 44V22M60 44V22M76 44V22M88 44v-8M4 94l16-6M96 94l-16-6',
  },
  casa: {
    ancho: 90,
    d: 'M12 50L50 16l38 34M20 50v40h60V50M42 90V66h16v24',
  },
  pajaro: {
    ancho: 70,
    d: 'M8 56q16-20 32-4 16-16 32 4M20 50q10-10 20-2',
  },
  cometa: {
    ancho: 74,
    d: 'M50 8L86 44 50 90 14 44zM50 8v82M14 44h72M50 90q-8 12 4 18t2 12',
  },
  luna: {
    ancho: 62,
    d: 'M62 62A34 34 0 1 1 38 14a26 26 0 0 0 24 48z',
  },
  arbol: {
    ancho: 78,
    d: 'M50 10L22 54h56zM50 32L28 72h44zM44 72h12v20H44z',
  },
}

const TEMAS: Record<string, string[]> = {
  portada: ['sol', 'estrella', 'nube', 'pajaro'],
  nombre: ['estrella', 'luna', 'sol', 'cometa'],
  embarazo: ['corazon', 'luna', 'estrella', 'nube'],
  origen: ['arbol', 'montana', 'pajaro', 'estrella'],
  hito: ['corazon', 'estrella', 'nube', 'sol'],
  viaje: ['avion', 'nube', 'globo', 'estrella'],
  ciudad: ['montana', 'arbol', 'casa', 'olas'],
  nacimiento: ['cuna', 'corazon', 'estrella', 'luna'],
  semana: ['sol', 'nube', 'estrella', 'pajaro'],
  cumple: ['globo', 'estrella', 'sol', 'cometa'],
}

// Palabras del texto que traen su propio dibujo: si la página habla de un
// telescopio, al fondo hay un cohete.
const PALABRAS: [RegExp, string][] = [
  [/telescopio|cohete|espacio|galaxia|asteroide|estrellas/i, 'cohete'],
  [/volc[áa]n|montaña|monte hood/i, 'montana'],
  [/r[íi]o|mar|agua|lluvia|llov/i, 'olas'],
  [/barco|puente/i, 'barco'],
  [/avi[óo]n|vol[ée]|aterric|viaje/i, 'avion'],
  [/cuna|dormi/i, 'cuna'],
  [/coraz[óo]n|latido/i, 'corazon'],
  [/bosque|[áa]rbol/i, 'arbol'],
  [/casa|hogar/i, 'casa'],
  [/juegos|nieve|hielo/i, 'montana'],
  [/cumplea/i, 'globo'],
]

function semilla(clave: string, salto: number) {
  let h = 2166136261 ^ salto
  for (let i = 0; i < clave.length; i++) {
    h ^= clave.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 10000) / 10000
}

/** Dibujos grandes para las páginas sin fotografías: en vez de una plancha
 *  de texto, la escena que cuenta la página, dibujada a línea. */
export function Ilustracion({
  clave,
  tipo,
  texto,
  altura,
}: {
  clave: string
  tipo: string
  texto: string | null
  altura: string
}) {
  const base = TEMAS[tipo] ?? TEMAS.semana
  const porTexto = texto
    ? PALABRAS.filter(([re]) => re.test(texto)).map(([, n]) => n)
    : []
  const elegidos = Array.from(new Set([...porTexto, ...base])).slice(0, 3)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        gap: '4%',
        height: altura,
      }}
    >
      {elegidos.map((nombre, i) => {
        const dib = DIBUJOS[nombre]
        if (!dib) return null
        const giro = (semilla(clave + nombre, i + 9) - 0.5) * 16
        const escala = i === 0 ? 1 : 0.74
        return (
          <svg
            key={nombre}
            viewBox="0 0 100 100"
            style={{
              height: `${escala * 100}%`,
              transform: `rotate(${giro}deg)`,
              overflow: 'visible',
            }}
            aria-hidden
          >
            <path
              d={dib.d}
              fill="none"
              stroke="#A9B5AB"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )
      })}
    </div>
  )
}

export default function Fondo({
  clave,
  tipo,
  texto,
  color,
  opacidad = 0.2,
}: {
  clave: string
  tipo: string
  texto: string | null
  /** Color del tramo. El fondo se tiñe con él en vez de ir siempre gris. */
  color?: string
  /** Fracción de tinta. 0,2 es lo acordado para papel. */
  opacidad?: number
}) {
  const base = TEMAS[tipo] ?? TEMAS.semana
  const porTexto = texto
    ? PALABRAS.filter(([re]) => re.test(texto)).map(([, n]) => n)
    : []

  const elegidos = Array.from(new Set([...porTexto, ...base])).slice(0, 5)

  // Coordenadas en milímetros de A4. Márgenes y esquinas: nunca el centro,
  // que es donde va el contenido.
  const sitios = [
    { x: 168, y: 16 },
    { x: 8, y: 78 },
    { x: 172, y: 146 },
    { x: 6, y: 210 },
    { x: 158, y: 252 },
  ]

  return (
    <svg
      viewBox="0 0 210 297"
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      {elegidos.map((nombre, i) => {
        const dib = DIBUJOS[nombre]
        if (!dib) return null
        const sitio = sitios[i]
        const escala = 0.26 + semilla(clave + nombre, i) * 0.12
        const giro = (semilla(clave + nombre, i + 40) - 0.5) * 24
        return (
          <g
            key={nombre}
            transform={`translate(${sitio.x} ${sitio.y}) rotate(${giro}) scale(${escala})`}
            opacity={opacidad}
          >
            <path
              d={dib.d}
              fill="none"
              stroke={color ?? TRAZO}
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        )
      })}
    </svg>
  )
}
