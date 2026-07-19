export type Album = {
  id: string
  slug: string
  titulo: string
  subtitulo: string | null
  diseno: 'expedicion' | 'cuento'
  fecha_inicio: string | null
  fecha_fin: string | null
}

export type TipoPagina =
  | 'portada'
  | 'embarazo'
  | 'ciudad'
  | 'nacimiento'
  | 'semana'
  | 'cumple'

export type Pagina = {
  id: string
  album_id: string
  orden: number
  tipo: TipoPagina
  numero_semana: number | null
  fecha_inicio: string | null
  fecha_fin: string | null
  titulo: string | null
  texto_cuento: string | null
  nota_mundo_titulo: string | null
  nota_mundo: string | null
  peso_g: number | null
  talla_mm: number | null
  cabeza_mm: number | null
}

export type Foto = {
  id: string
  pagina_id: string | null
  ruta: string
  titulo: string | null
  titulo_automatico: boolean
  tomada_en: string | null
  lugar: string | null
  necesita_revision: boolean
  orden: number
}
