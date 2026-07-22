/** Composición de la hoja de fotos del scrapbook.
 *
 *  Sustituye a las filas justificadas: aquí las fotos van giradas, se pisan
 *  unas a otras y llevan marco de copia revelada. Lo que no cambia son las
 *  tres garantías que ya estaban probadas: ninguna foto se recorta, ninguna
 *  se estira por encima de lo que aguanta su archivo, y nada se sale de la
 *  hoja.
 */

import { techoDeResolucion, proporcion, ANCHO_MINIMO, type Pieza } from './maqueta'
import { deLaBolsa } from './escenografia'

/** Marco blanco alrededor de la foto, al estilo de una copia revelada. */
export const MARCO = { lados: 4, arriba: 4, abajo: 11 } as const

/** Aire que se deja al borde de la hoja. Es mayor que en una maqueta recta
 *  porque al girar una foto sus esquinas se acercan al canto del papel. */
export const AIRE = 10

/** Banda superior reservada a la cabecera (encabezado, título, filete).
 *  Ninguna foto puede entrar aquí: es lo que tapaba los títulos. */
export const BANDA_CABECERA = 42

/** Banda inferior reservada al número de página y a los dibujos del pie. */
export const BANDA_PIE = 16

export type Hueco = {
  /** Centro, en fracción del área útil. */
  cx: number
  cy: number
  /** Ancho deseado, en fracción del ancho útil. */
  w: number
  /** Giro en grados. */
  giro: number
}

export type Composicion = {
  nombre: string
  huecos: Hueco[]
  /** Dónde va el recorte cosido con la nota manuscrita. */
  nota: Hueco
}

/* Composiciones dibujadas a mano, no generadas: el desorden de un scrapbook
   es un desorden compuesto. Hay varias por cada número de fotos para que a
   lo largo del álbum no se repita la misma disposición. */
const COMPOSICIONES: Record<number, Composicion[]> = {
  1: [
    {
      nombre: 'una-centrada',
      huecos: [{ cx: 0.5, cy: 0.4, w: 0.8, giro: -3 }],
      nota: { cx: 0.44, cy: 0.86, w: 0.62, giro: -2 },
    },
    {
      nombre: 'una-alta',
      huecos: [{ cx: 0.47, cy: 0.42, w: 0.72, giro: 2.5 }],
      nota: { cx: 0.56, cy: 0.88, w: 0.56, giro: 3 },
    },
  ],
  2: [
    {
      nombre: 'dos-escalera',
      huecos: [
        { cx: 0.34, cy: 0.28, w: 0.56, giro: -4 },
        { cx: 0.66, cy: 0.62, w: 0.54, giro: 3.5 },
      ],
      nota: { cx: 0.32, cy: 0.9, w: 0.52, giro: -2.5 },
    },
    {
      nombre: 'dos-enfrentadas',
      huecos: [
        { cx: 0.31, cy: 0.36, w: 0.52, giro: 3.5 },
        { cx: 0.7, cy: 0.4, w: 0.48, giro: -4.5 },
      ],
      nota: { cx: 0.5, cy: 0.86, w: 0.62, giro: 1.5 },
    },
  ],
  3: [
    {
      nombre: 'tres-abanico',
      huecos: [
        { cx: 0.32, cy: 0.26, w: 0.5, giro: -4.5 },
        { cx: 0.71, cy: 0.4, w: 0.44, giro: 4 },
        { cx: 0.37, cy: 0.68, w: 0.48, giro: 5 },
      ],
      nota: { cx: 0.72, cy: 0.86, w: 0.46, giro: -3 },
    },
    {
      nombre: 'tres-columna',
      huecos: [
        { cx: 0.63, cy: 0.22, w: 0.48, giro: 3 },
        { cx: 0.33, cy: 0.5, w: 0.5, giro: -3.5 },
        { cx: 0.64, cy: 0.76, w: 0.46, giro: 4.5 },
      ],
      nota: { cx: 0.31, cy: 0.88, w: 0.46, giro: -2 },
    },
  ],
  4: [
    {
      nombre: 'cuatro-molino',
      huecos: [
        { cx: 0.31, cy: 0.22, w: 0.44, giro: -4 },
        { cx: 0.71, cy: 0.3, w: 0.42, giro: 3.5 },
        { cx: 0.3, cy: 0.62, w: 0.42, giro: 5 },
        { cx: 0.7, cy: 0.72, w: 0.44, giro: -3 },
      ],
      nota: { cx: 0.5, cy: 0.93, w: 0.44, giro: -2 },
    },
    {
      nombre: 'cuatro-cascada',
      huecos: [
        { cx: 0.34, cy: 0.2, w: 0.46, giro: 3 },
        { cx: 0.69, cy: 0.4, w: 0.4, giro: -4.5 },
        { cx: 0.32, cy: 0.6, w: 0.4, giro: -2.5 },
        { cx: 0.64, cy: 0.82, w: 0.42, giro: 4.5 },
      ],
      nota: { cx: 0.3, cy: 0.92, w: 0.4, giro: 2.5 },
    },
  ],
  5: [
    {
      nombre: 'cinco-racimo',
      huecos: [
        { cx: 0.31, cy: 0.2, w: 0.4, giro: -3.5 },
        { cx: 0.7, cy: 0.26, w: 0.38, giro: 4.5 },
        { cx: 0.29, cy: 0.52, w: 0.38, giro: 4 },
        { cx: 0.68, cy: 0.6, w: 0.4, giro: -4 },
        { cx: 0.44, cy: 0.84, w: 0.42, giro: 2.5 },
      ],
      nota: { cx: 0.76, cy: 0.9, w: 0.36, giro: -3 },
    },
  ],
}

export type Colocada = {
  id: string
  /** Medidas de la foto, sin marco, en milímetros. */
  ancho: number
  alto: number
  /** Medidas del marco blanco que la rodea. */
  anchoMarco: number
  altoMarco: number
  /** Esquina superior izquierda del marco, antes de girar. */
  x: number
  y: number
  giro: number
  pppFinal: number
  limitadaPorResolucion: boolean
}

export type Composicion2 = {
  fotos: Colocada[]
  nota: { x: number; y: number; ancho: number; giro: number }
  nombre: string
  /** Fotos que no cabían en la hoja y pasan a la siguiente. */
  desbordadas: string[]
}

/** Caja que ocupa un rectángulo girado. Al girar, una foto necesita más
 *  sitio del que mide: es lo que obliga a dejar más aire en los bordes. */
function cajaGirada(ancho: number, alto: number, giro: number) {
  const r = (Math.abs(giro) * Math.PI) / 180
  return {
    ancho: ancho * Math.cos(r) + alto * Math.sin(r),
    alto: ancho * Math.sin(r) + alto * Math.cos(r),
  }
}

/** Coloca las fotos de una hoja. */
export function componer(
  piezas: Pieza[],
  anchoUtil: number,
  altoUtil: number,
  pagina: number
): Composicion2 {
  const vacia: Composicion2 = {
    fotos: [],
    nota: { x: 0, y: 0, ancho: 0, giro: 0 },
    nombre: 'vacia',
    desbordadas: [],
  }
  if (piezas.length === 0) return vacia

  /* El cuadrante seguro: todo lo que va entre la cabecera y el pie. Las
     coordenadas de las composiciones (cx, cy en fracción) se miden DENTRO de
     este rectángulo, nunca sobre la hoja entera. Es lo que impide de raíz
     que una foto suba a tapar el título o baje sobre el número. */
  const zona = {
    x0: 0,
    y0: BANDA_CABECERA,
    ancho: anchoUtil,
    alto: altoUtil - BANDA_CABECERA - BANDA_PIE,
  }

  // Cuántas fotos caben con dignidad depende de su forma: las cuadradas
  // toleran hasta cinco; las alargadas, cuatro, porque piden más sitio y al
  // solaparse tanto dejan de leerse.
  const maxFotos = cupoPorForma(piezas)
  const cabenAqui = piezas.slice(0, maxFotos)
  const desbordadas = piezas.slice(maxFotos).map((p) => p.id)

  const opciones = COMPOSICIONES[cabenAqui.length] ?? COMPOSICIONES[6]
  const comp = deLaBolsa(opciones, pagina, 3)

  // La foto de mejor resolución va al hueco más grande, para que el orden de
  // subida no decida cuál manda.
  const porCalidad = [...cabenAqui].sort(
    (a, b) => techoDeResolucion(b) - techoDeResolucion(a)
  )
  const huecos = [...comp.huecos]
    .map((h, i) => ({ h, i }))
    .sort((a, b) => b.h.w - a.h.w)

  const fotos: Colocada[] = []

  huecos.forEach(({ h }, orden) => {
    const p = porCalidad[orden]
    if (!p) return
    const prop = proporcion(p)

    // Ancho de la foto: lo que pide el hueco, pero nunca más de lo que su
    // archivo aguanta con nitidez.
    let ancho = Math.min(h.w * zona.ancho, techoDeResolucion(p))
    let alto = ancho / prop

    // Con marco incluido, la foto girada tiene que caber en el cuadrante.
    for (let intento = 0; intento < 60; intento++) {
      const caja = cajaGirada(
        ancho + MARCO.lados * 2,
        alto + MARCO.arriba + MARCO.abajo,
        h.giro
      )
      if (caja.ancho <= zona.ancho && caja.alto <= zona.alto) break
      ancho *= 0.95
      alto = ancho / prop
    }

    const anchoMarco = ancho + MARCO.lados * 2
    const altoMarco = alto + MARCO.arriba + MARCO.abajo
    const caja = cajaGirada(anchoMarco, altoMarco, h.giro)

    // El centro que pide la composición, sujeto para que la caja girada no
    // cruce ningún lado del cuadrante seguro.
    const cx = Math.min(
      Math.max(h.cx * zona.ancho, caja.ancho / 2),
      zona.ancho - caja.ancho / 2
    )
    const cy = Math.min(
      Math.max(h.cy * zona.alto, caja.alto / 2),
      zona.alto - caja.alto / 2
    )

    fotos.push({
      id: p.id,
      ancho,
      alto,
      anchoMarco,
      altoMarco,
      x: zona.x0 + cx - anchoMarco / 2,
      y: zona.y0 + cy - altoMarco / 2,
      giro: h.giro,
      pppFinal: p.ancho ? (p.ancho / ancho) * 25.4 : 300,
      limitadaPorResolucion:
        ancho < ANCHO_MINIMO || ((p.ancho ?? 0) / ancho) * 25.4 < 299,
    })
  })

  // La nota también vive dentro del cuadrante, en su banda inferior.
  const anchoNota = comp.nota.w * zona.ancho
  const cyNota = Math.min(comp.nota.cy, 0.96)
  return {
    fotos,
    nota: {
      x:
        zona.x0 +
        Math.min(Math.max(comp.nota.cx * zona.ancho - anchoNota / 2, 0), zona.ancho - anchoNota),
      y: zona.y0 + cyNota * zona.alto,
      ancho: anchoNota,
      giro: comp.nota.giro,
    },
    nombre: comp.nombre,
    desbordadas,
  }
}

/** Cupo de fotos por hoja según su forma predominante.
 *
 *  Regla del usuario: cuadradas hasta cinco; verticales u horizontales,
 *  cuatro como mucho, para que no tengan que solaparse tanto y sigan
 *  leyéndose. */
function cupoPorForma(piezas: Pieza[]): number {
  const props = piezas.map(proporcion)
  const cuadradas = props.filter((r) => r >= 0.85 && r <= 1.18).length
  const mayoriaCuadrada = cuadradas >= Math.ceil(piezas.length / 2)
  return mayoriaCuadrada ? 5 : 4
}
