export type Idioma = 'es' | 'en'

export function leerIdioma(v?: string | string[]): Idioma {
  return v === 'en' ? 'en' : 'es'
}

// Elige el campo en el idioma pedido y cae al español si falta la traducción.
export function elige(
  es: string | null | undefined,
  en: string | null | undefined,
  idioma: Idioma
) {
  if (idioma === 'en') return en ?? es ?? null
  return es ?? null
}

export const T = {
  es: {
    albumes: 'Álbumes',
    indice: 'Índice',
    anterior: 'Anterior',
    siguiente: 'Siguiente',
    semanas: 'Las 52 semanas',
    leyendaNota: 'La barra dorada marca las semanas que ya tienen algo del mundo contado.',
    cuaderno: 'Cuaderno de expedición',
    mapa: 'El mapa',
    primerDia: 'El primer día',
    antes: 'Antes del viaje',
    finAno: 'Fin del primer año',
    album: 'El álbum',
    parte: 'Parte del explorador',
    peso: 'Peso',
    talla: 'Talla',
    cabeza: 'Cabeza',
    mundo: 'Mientras tanto, en el mundo',
    sinMundo: 'Esta semana no tiene nota del mundo.',
    familia: 'Notas de la familia',
    sinFamilia: 'Los comentarios aparecerán aquí, firmados con el nombre de quien los escribe.',
    sinCuento: 'Aquí irá el cuento de esta semana.',
    hueco: 'hueco para foto',
    principal: 'Foto principal',
    segunda: 'Segunda foto',
    tercera: 'Tercera foto',
    manta: (n: number) => `La manta dice: ${n} semanas`,
    fotos: (n: number) => `${n} fotos`,
    aviso: 'Los huecos se rellenan al subir las fotos.',
    otroIdioma: 'English',
  },
  en: {
    albumes: 'Albums',
    indice: 'Contents',
    anterior: 'Previous',
    siguiente: 'Next',
    semanas: 'The 52 weeks',
    leyendaNota: 'The gold bar marks the weeks that already have something from the world.',
    cuaderno: 'Expedition notebook',
    mapa: 'The map',
    primerDia: 'The first day',
    antes: 'Before the journey',
    finAno: 'End of the first year',
    album: 'The album',
    parte: "Explorer's report",
    peso: 'Weight',
    talla: 'Length',
    cabeza: 'Head',
    mundo: 'Meanwhile, out in the world',
    sinMundo: 'This week has no note from the world.',
    familia: 'Family notes',
    sinFamilia: 'Comments will appear here, signed by whoever writes them.',
    sinCuento: "This week's story will go here.",
    hueco: 'space for a photo',
    principal: 'Main photo',
    segunda: 'Second photo',
    tercera: 'Third photo',
    manta: (n: number) => `The blanket says: ${n} weeks`,
    fotos: (n: number) => `${n} photos`,
    aviso: 'The gaps fill in as you upload the photos.',
    otroIdioma: 'Español',
  },
} as const
