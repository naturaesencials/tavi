/** Escenografía del scrapbook: papeles, cintas, adornos.
 *
 *  Todo se elige a partir del número de página, nunca al azar en tiempo de
 *  ejecución. Así la página 31 tiene siempre el mismo papel y la misma cinta
 *  en la pantalla, en el PDF y en el papel impreso.
 */

export type Papel = {
  nombre: string
  /** Color del papel de fondo, a sangre. */
  fondo: string
  /** Trama impresa sobre el fondo. */
  trama: string
  /** Papel rasgado que se superpone y sostiene el contenido. */
  hoja: string
  /** Color de acento: subrayados, número de página, capitular, cinta. */
  acento: string
  /** Tinta del texto. */
  tinta: string
  /** Tinta secundaria: pies de foto, rótulos pequeños. */
  suave: string
}

/** Un papel por pliego. Las dos hojas de un mismo pliego —la de fotos y la
 *  de texto— comparten papel; el pliego siguiente cambia. Se permiten
 *  repeticiones al dar la vuelta a la lista. */
export const PAPELES: Papel[] = [
  {
    nombre: 'lino',
    fondo: '#EFE4CE',
    trama: '#D3BE99',
    hoja: '#FDF9F0',
    acento: '#B8623C',
    tinta: '#3B342A',
    suave: '#9A8C72',
  },
  {
    nombre: 'salvia',
    fondo: '#DCE4D6',
    trama: '#B4C4AB',
    hoja: '#FAFCF6',
    acento: '#5F7D52',
    tinta: '#31382C',
    suave: '#8B9A82',
  },
  {
    nombre: 'niebla',
    fondo: '#D9E2E8',
    trama: '#AFC2CE',
    hoja: '#F8FBFD',
    acento: '#3F6E88',
    tinta: '#2C3941',
    suave: '#829099',
  },
  {
    nombre: 'arcilla',
    fondo: '#EEDDD2',
    trama: '#D3B49F',
    hoja: '#FEF7F1',
    acento: '#A85838',
    tinta: '#3E3129',
    suave: '#9C8579',
  },
  {
    nombre: 'trigo',
    fondo: '#F0E7C9',
    trama: '#D5C48D',
    hoja: '#FEFAEC',
    acento: '#9A7B2A',
    tinta: '#3A3524',
    suave: '#968C6A',
  },
  {
    nombre: 'lavanda',
    fondo: '#E1DCE8',
    trama: '#BFB6D0',
    hoja: '#FAF8FD',
    acento: '#6A5A87',
    tinta: '#332E3D',
    suave: '#8B8398',
  },
  {
    nombre: 'menta',
    fondo: '#D8E6E0',
    trama: '#AECBC0',
    hoja: '#F6FCFA',
    acento: '#3F7F6C',
    tinta: '#2B3A34',
    suave: '#7E948C',
  },
  {
    nombre: 'rosa palo',
    fondo: '#EFDCDA',
    trama: '#D5AEAB',
    hoja: '#FEF6F5',
    acento: '#A45050',
    tinta: '#3D2E2E',
    suave: '#9B8180',
  },
]

/** El papel de un pliego. Las dos hojas del mismo pliego comparten índice. */
export function papelDePliego(pliego: number): Papel {
  const i = ((pliego % PAPELES.length) + PAPELES.length) % PAPELES.length
  return PAPELES[i]
}

/* ------------------------------------------------------------------ */

/** Generador reproducible. La misma semilla da siempre la misma página. */
export function semillaDe(texto: string): number {
  let h = 2166136261
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function generador(semilla: number): () => number {
  let s = semilla || 1
  return () => {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    s >>>= 0
    return s / 4294967296
  }
}

/** Reparte una lista de opciones a lo largo de las páginas sin que ninguna
 *  vuelva a salir hasta que hayan salido todas las demás. Es el sistema de
 *  bolsa: se barajan, se van gastando, y solo al vaciarse se rebaraja. */
export function deLaBolsa<T>(opciones: T[], pagina: number, sal = 0): T {
  const n = opciones.length
  if (n === 0) throw new Error('bolsa vacía')
  const ronda = Math.floor(pagina / n)
  const azar = generador(semillaDe(`${ronda}:${sal}`))
  const orden = opciones.map((_, i) => i)
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1))
    ;[orden[i], orden[j]] = [orden[j], orden[i]]
  }
  return opciones[orden[pagina % n]]
}

/* ------------------------------------------------------------------ */

export type Cinta = 'rayas' | 'topos' | 'lisa' | 'cuadros' | 'ondas'

export const CINTAS: Cinta[] = ['rayas', 'topos', 'lisa', 'cuadros', 'ondas']

export type Adorno =
  | 'tienda'
  | 'globo'
  | 'estrella'
  | 'barco'
  | 'sol'
  | 'casa'
  | 'pez'
  | 'bici'
  | 'nube'
  | 'gato'
  | 'cometa'
  | 'hoja'
  | 'pajaro'
  | 'tren'
  | 'luna'
  | 'flor'

export const ADORNOS: Adorno[] = [
  'tienda',
  'globo',
  'estrella',
  'barco',
  'sol',
  'casa',
  'pez',
  'bici',
  'nube',
  'gato',
  'cometa',
  'hoja',
  'pajaro',
  'tren',
  'luna',
  'flor',
]

/** Los dos adornos de una hoja, distintos entre sí. */
export function adornosDe(pagina: number): [Adorno, Adorno] {
  const a = deLaBolsa(ADORNOS, pagina, 1)
  let b = deLaBolsa(ADORNOS, pagina + 7, 2)
  if (b === a) b = ADORNOS[(ADORNOS.indexOf(a) + 5) % ADORNOS.length]
  return [a, b]
}
