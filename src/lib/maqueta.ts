/** Geometría del álbum impreso.
 *
 *  Todo se calcula en milímetros reales de papel, no en porcentajes de
 *  ventana. La página deja de ser elástica: mide lo que mide una A4, y la
 *  pantalla se limita a enseñar esa página a escala. Lo que ves es lo que
 *  se imprime.
 */

export const PAGINA = {
  ancho: 210,
  alto: 297,
  sangrado: 3,
  margenExterior: 12,
  margenInterior: 16,
  margenSuperior: 14,
  margenInferior: 16,
} as const

/** Ancho y alto útiles: lo que queda de papel una vez quitados los márgenes. */
export const UTIL = {
  ancho: PAGINA.ancho - PAGINA.margenExterior - PAGINA.margenInterior,
  alto: PAGINA.alto - PAGINA.margenSuperior - PAGINA.margenInferior,
} as const

/** Resolución de imprenta. Por debajo de esto la foto se ve pastosa. */
export const PPP = 300

/** Suelo absoluto de resolución. Por debajo no se imprime nada. */
export const PPP_MINIMO = 200

/** Calle entre fotos de la misma fila y entre filas. */
export const CALLE = 4

/** Una foto nunca baja de aquí: más pequeña deja de ser una foto y pasa a
 *  ser un sello de correos. */
export const ANCHO_MINIMO = 45

export type Encaje = {
  id: string
  /** Milímetros reales sobre el papel. */
  ancho: number
  alto: number
  /** Ancho máximo que admite el archivo sin bajar de 300 ppp. */
  techo: number
  /** Cierto si el archivo impide que la foto crezca más. */
  limitadaPorResolucion: boolean
  /** Puntos por pulgada a los que acaba imprimiéndose. */
  pppFinal: number
}

export type Fila = {
  fotos: Encaje[]
  alto: number
  /** Aire sobrante a los lados cuando la resolución impide llenar el ancho. */
  sangriaLateral: number
}

export type Pieza = {
  id: string
  ancho: number | null
  alto: number | null
}

/** Proporción de una foto. Sin medidas conocidas se asume apaisada suave,
 *  que es lo que menos daño hace en una fila. */
export function proporcion(p: Pieza): number {
  if (!p.ancho || !p.alto || p.alto === 0) return 1.4
  return p.ancho / p.alto
}

/** Ancho máximo en milímetros al que se puede imprimir un archivo sin bajar
 *  de 300 ppp. Una foto de 1200 px no puede pasar de 101,6 mm. */
export function techoDeResolucion(p: Pieza): number {
  if (!p.ancho) return UTIL.ancho
  return (p.ancho / PPP) * 25.4
}

/** Ancho máximo que no se cruza jamás: por debajo de 200 ppp la foto se ve
 *  pastosa en papel y preferimos no imprimirla tan grande.
 *
 *  Es este el que limita la fila, no el de 300. Si no, una foto pequeña
 *  metida entre otras buenas encogía la fila entera y desperdiciaba las
 *  buenas. Ahora la floja apura hasta 200 ppp y las demás conservan tamaño;
 *  la floja queda marcada para que se vea en el panel. */
export function techoAbsoluto(p: Pieza): number {
  if (!p.ancho) return UTIL.ancho
  return (p.ancho / PPP_MINIMO) * 25.4
}

/** Reparte las fotos de una fila a lo ancho útil.
 *
 *  Todas comparten altura; el ancho de cada una sale de su propia
 *  proporción. Ninguna se recorta. Si alguna no aguanta el tamaño que le
 *  tocaría, se baja la altura de toda la fila hasta que la más floja quepa
 *  dentro de su techo, y la fila se centra dejando aire a los lados.
 */
export function encajarFila(piezas: Pieza[], anchoDisponible: number): Fila {
  const props = piezas.map(proporcion)
  const sumaProps = props.reduce((t, r) => t + r, 0)
  const calles = CALLE * (piezas.length - 1)
  const anchoFotos = anchoDisponible - calles

  let alto = anchoFotos / sumaProps

  // Primero se respetan los 300 ppp de todas: ninguna crece por encima de lo
  // que su archivo aguanta con nitidez.
  const tope300 = Math.min(
    ...piezas.map((p, i) => techoDeResolucion(p) / props[i])
  )
  alto = Math.min(alto, tope300)

  // Si eso deja alguna foto por debajo del mínimo legible, es que una foto
  // pequeña está arrastrando a la fila. Solo entonces se sube la altura,
  // dejando que la floja baje de 300 ppp, y nunca por debajo de 200.
  const menor = Math.min(...props.map((r) => alto * r))
  if (menor < ANCHO_MINIMO) {
    const topeAbsoluto = Math.min(
      ...piezas.map((p, i) => techoAbsoluto(p) / props[i])
    )
    const necesario = ANCHO_MINIMO / Math.min(...props)
    alto = Math.min(anchoFotos / sumaProps, topeAbsoluto, necesario)
  }

  const fotos: Encaje[] = piezas.map((p, i) => {
    const ancho = alto * props[i]
    const pppFinal = p.ancho ? (p.ancho / ancho) * 25.4 : PPP
    return {
      id: p.id,
      ancho,
      alto,
      techo: techoDeResolucion(p),
      limitadaPorResolucion: pppFinal < PPP - 1,
      pppFinal,
    }
  })

  const usado = fotos.reduce((t, f) => t + f.ancho, 0) + calles
  return { fotos, alto, sangriaLateral: Math.max(0, anchoDisponible - usado) / 2 }
}

/** Decide cómo se agrupan las fotos en filas.
 *
 *  No hay plantillas fijas: el reparto sale del número de fotos y de su
 *  forma. Las verticales ocupan poco a lo ancho, así que caben más por
 *  fila; las apaisadas piden aire.
 */
export function repartirEnFilas(piezas: Pieza[]): Pieza[][] {
  const n = piezas.length
  if (n === 0) return []
  if (n === 1) return [piezas]

  // Con dos, mandan las formas: dos verticales conviven bien en una fila;
  // dos apaisadas apiladas se ven mucho mejor que dos apaisadas enanas.
  if (n === 2) {
    const apaisadas = piezas.filter((p) => proporcion(p) > 1.15).length
    return apaisadas === 2 ? [[piezas[0]], [piezas[1]]] : [piezas]
  }

  // A partir de tres, una manda y el resto acompañan. Se elige como
  // principal la más apaisada, que es la que mejor aprovecha el ancho.
  if (n === 3) {
    const orden = [...piezas].sort((a, b) => proporcion(b) - proporcion(a))
    return [[orden[0]], [orden[1], orden[2]]]
  }

  // Cuatro o más: filas de dos o tres según lo estrechas que sean.
  const filas: Pieza[][] = []
  let i = 0
  while (i < n) {
    const restantes = n - i
    const media =
      piezas.slice(i, i + 3).reduce((t, p) => t + proporcion(p), 0) /
      Math.min(3, restantes)
    // Fotos estrechas caben de tres en tres sin quedar minúsculas.
    let porFila = media < 1.05 ? 3 : 2
    if (restantes === 3) porFila = 3
    if (restantes < porFila) porFila = restantes
    filas.push(piezas.slice(i, i + porFila))
    i += porFila
  }
  return filas
}

/** Repartos posibles de una misma tanda de fotos.
 *
 *  No hay una respuesta correcta a priori: con seis verticales, dos filas de
 *  tres pueden ganar a tres filas de dos según el alto que haya dejado el
 *  texto. Se generan las opciones sensatas y decide quien mide.
 */
export function candidatos(piezas: Pieza[]): Pieza[][][] {
  const n = piezas.length
  if (n === 0) return []
  if (n === 1) return [[piezas]]

  const opciones: Pieza[][][] = [repartirEnFilas(piezas)]

  // Filas uniformes de 2, 3 y 4.
  for (const k of [2, 3, 4]) {
    if (k > n) break
    const filas: Pieza[][] = []
    for (let i = 0; i < n; i += k) filas.push(piezas.slice(i, i + k))
    opciones.push(filas)
  }

  // Una manda arriba y el resto se reparten debajo.
  if (n >= 3) {
    const resto = piezas.slice(1)
    const mitad = Math.ceil(resto.length / 2)
    opciones.push([[piezas[0]], resto])
    if (resto.length > 2) opciones.push([[piezas[0]], resto.slice(0, mitad), resto.slice(mitad)])
  }

  return opciones
}

export type Maqueta = {
  filas: Fila[]
  /** Alto total que ocupan las fotos, calles incluidas. */
  altoTotal: number
  /** Fotos que no caben en esta página sin bajar del mínimo legible. */
  desbordadas: string[]
  /** Fotos cuyo archivo impide que crezcan más. */
  limitadas: string[]
}

/** Monta la maqueta completa de una página.
 *
 *  Recibe el alto que el texto ha dejado libre y reparte las fotos en él.
 *  Si no caben por encima del mínimo legible, las últimas se devuelven como
 *  desbordadas para que la página se parta en dos en vez de encoger todo.
 */
export function maquetar(
  piezas: Pieza[],
  anchoDisponible: number = UTIL.ancho,
  altoDisponible: number = UTIL.alto
): Maqueta {
  if (piezas.length === 0)
    return { filas: [], altoTotal: 0, desbordadas: [], limitadas: [] }

  let usadas = [...piezas]
  const desbordadas: string[] = []

  // Se prueban varios repartos y gana el que deja las fotos más grandes.
  // Solo cuando ninguno cabe se manda una foto a la página siguiente.
  for (;;) {
    let filas: Fila[] = []
    let altoTotal = 0
    let mejor = -1

    for (const reparto of candidatos(usadas)) {
      const f = reparto.map((r) => encajarFila(r, anchoDisponible))
      const alto = f.reduce((t, x) => t + x.alto, 0) + CALLE * Math.max(0, f.length - 1)
      const esc = alto > altoDisponible ? altoDisponible / alto : 1
      const menor = Math.min(...f.flatMap((x) => x.fotos.map((y) => y.ancho))) * esc
      if (menor > mejor) {
        mejor = menor
        filas = f
        altoTotal = alto
      }
    }

    // Primero se intenta reducir el conjunto entero conservando
    // proporciones. Partir la página es el último recurso, no el primero.
    const escala = altoTotal > altoDisponible ? altoDisponible / altoTotal : 1
    const anchoMinimo =
      Math.min(...filas.flatMap((f) => f.fotos.map((x) => x.ancho))) * escala

    if (anchoMinimo >= ANCHO_MINIMO || usadas.length === 1) {
      const finales = filas.map((f) => ({
        ...f,
        alto: f.alto * escala,
        sangriaLateral: f.sangriaLateral,
        fotos: f.fotos.map((x) => ({
          ...x,
          ancho: x.ancho * escala,
          alto: x.alto * escala,
          pppFinal: x.pppFinal / escala,
        })),
      }))
      return {
        filas: finales,
        altoTotal: altoTotal * escala,
        desbordadas,
        limitadas: finales.flatMap((f) =>
          f.fotos.filter((x) => x.limitadaPorResolucion).map((x) => x.id)
        ),
      }
    }

    desbordadas.unshift(usadas[usadas.length - 1].id)
    usadas = usadas.slice(0, -1)
  }
}

/** Caracteres que caben en un milímetro de línea, al cuerpo del álbum. */
const CAR_POR_MM = 1 / (4.4 * 0.5)
const ALTO_LINEA = 4.4 * 1.55

export type Flotante = {
  ancho: number
  alto: number
  /** Líneas de texto que caben al costado de la foto. */
  lineasAlLado: number
  altoTotal: number
}

/** Coloca una foto flotando y el texto envolviéndola: el texto arranca al
 *  costado de la foto y sigue a todo lo ancho por debajo.
 *
 *  La foto crece hasta el máximo que permita seguir cabiendo la página. Es
 *  al revés que apilar: al no tener que esperar a que la foto termine, el
 *  texto libera alto y la foto puede ser mayor, no menor.
 */
export function encajarFlotante(
  pieza: Pieza,
  caracteres: number,
  anchoDisponible: number,
  altoDisponible: number
): Flotante | null {
  const prop = proporcion(pieza)
  const maximo = Math.min(techoDeResolucion(pieza), anchoDisponible * 0.62)
  if (maximo < 60) return null // Una foto pequeña flotando queda ridícula.

  for (let ancho = maximo; ancho >= 55; ancho -= 2) {
    const alto = ancho / prop
    const anchoResto = anchoDisponible - ancho - CALLE
    // Una columna estrecha al costado da renglones cojos y muchos guiones.
    if (anchoResto < 55) continue

    const lineasAlLado = Math.floor(alto / ALTO_LINEA)
    const carAlLado = lineasAlLado * Math.floor(anchoResto * CAR_POR_MM)
    const carDebajo = Math.max(0, caracteres - carAlLado)
    const lineasDebajo = Math.ceil(carDebajo / Math.floor(anchoDisponible * CAR_POR_MM))
    const altoTotal = alto + lineasDebajo * ALTO_LINEA

    // Se recorre de mayor a menor: la primera que cabe es la mayor posible.
    if (altoTotal <= altoDisponible) return { ancho, alto, lineasAlLado, altoTotal }
  }
  return null
}

/** ¿Merece la pena flotar? Hace falta texto suficiente para que la foto no
 *  quede con un rabillo de palabras al lado y un hueco blanco debajo, que
 *  sería peor que apilar. Por debajo de unas cuarenta palabras, se apila. */
export function convieneFlotar(nFotos: number, caracteres: number): boolean {
  return nFotos >= 1 && caracteres >= 250
}
