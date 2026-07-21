import { T, type Idioma } from '@/lib/idioma'
import Fondo from './fondo'
import Marco, { elegirMarco } from './marco'
import {
  PAGINA,
  UTIL,
  CALLE,
  maquetar,
  techoDeResolucion,
  encajarFlotante,
  convieneFlotar,
  type Pieza,
} from '@/lib/maqueta'

export type FotoHoja = {
  id: string
  url: string | null
  posterUrl: string | null
  medio: 'foto' | 'video'
  titulo: string | null
  lugar: string | null
  ancho: number | null
  alto: number | null
  fecha: string | null
  categoria: string | null
  qr: string | null
  duracion: number | null
}

const PAPEL = '#FDF8EE'
const TINTA = '#2F3E38'
const SUAVE = '#7C8A82'

/** Color de cada tramo del álbum. Tiñe el fondo de línea, el subrayado del
 *  título, el círculo del número de página y el marco de la foto destacada. */
const TRAMOS = {
  antes: '#6E8C6A',
  naces: '#D9614A',
  otono: '#C9962B',
  invierno: '#5D8CA8',
  primavera: '#5F9E63',
  verano: '#B85C3C',
} as const

function colorDeTramo(tipo: string, semana: number | null): string {
  if (tipo === 'nacimiento' || tipo === 'ciudad') return TRAMOS.naces
  if (semana === null) return tipo === 'cumple' ? TRAMOS.verano : TRAMOS.antes
  if (semana <= 13) return TRAMOS.otono
  if (semana <= 26) return TRAMOS.invierno
  if (semana <= 39) return TRAMOS.primavera
  return TRAMOS.verano
}

/* Tipografía en milímetros de papel, no en rem de pantalla. 4,4 mm son unos
   12,5 pt: lo que un niño puede seguir con el dedo. */
const CUERPO = 4.4
const INTERLINEA = 1.55
const LINEA = CUERPO * INTERLINEA

/** Alto que ocupará un texto. Estimación por caracteres: no hace falta ser
 *  exacto, solo no pasarse, porque el sobrante se lo quedan las fotos. */
function altoDeTexto(parrafos: string[], ancho: number): number {
  const porLinea = Math.floor(ancho / (CUERPO * 0.5))
  return parrafos.reduce(
    (t, p) => t + Math.max(1, Math.ceil(p.length / porLinea)) * LINEA + 2.5,
    0
  )
}

const mm = (n: number) => `calc(${n} * var(--mm))`

/** Una foto con su marco y su pie, al tamaño exacto que le ha asignado el
 *  motor. El hueco tiene ya la proporción de la foto, así que `contain` no
 *  recorta nada: solo garantiza que jamás se recorte aunque los metadatos
 *  de tamaño vinieran mal. */
function Foto({
  im,
  ancho,
  alto,
  esPrincipal,
  indice,
  clave,
}: {
  im: FotoHoja
  ancho: number
  alto: number
  esPrincipal: boolean
  indice: number
  clave: string
}) {
  const fuente = im.medio === 'video' ? im.posterUrl : im.url
  return (
    <>
      <div style={{ width: mm(ancho), height: mm(alto) }}>
        <Marco
          id={im.id}
          estilo={elegirMarco(im.id, im.categoria, esPrincipal, indice, clave)}
        >
          <div
            data-foto
            style={{ width: '100%', height: '100%', background: '#E6E9E2' }}
          >
            {fuente ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={fuente}
                alt={im.titulo ?? ''}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            ) : null}
          </div>
        </Marco>
      </div>
      {im.titulo ? (
        <figcaption
          style={{
            marginTop: mm(1.2),
            fontSize: mm(2.6),
            lineHeight: 1.3,
            color: SUAVE,
          }}
        >
          {im.titulo}
        </figcaption>
      ) : null}
    </>
  )
}

export default function Hoja({
  idioma,
  tipo,
  encabezado,
  titulo,
  subtitulo,
  lugarPie,
  texto,
  notaTitulo,
  nota,
  pesoG,
  tallaMm,
  cabezaMm,
  semana,
  imagenes,
  pie,
  esSemana,
  sangrado = false,
}: {
  idioma: Idioma
  tipo: string
  encabezado: string
  titulo: string
  subtitulo: string
  lugarPie: string
  texto: string | null
  notaTitulo: string | null
  nota: string | null
  pesoG: number | null
  tallaMm: number | null
  cabezaMm: number | null
  semana: number | null
  imagenes: FotoHoja[]
  pie: string
  esSemana: boolean
  /** Añade 3 mm de papel por cada lado para que la imprenta recorte. */
  sangrado?: boolean
}) {
  const t = T[idioma]
  const acento = colorDeTramo(tipo, semana)
  const medida = (v: number | null, div: number, u: string) =>
    v === null ? '—' : `${(v / div).toLocaleString('es-ES')} ${u}`

  const parrafos = (texto ?? '').split('\n\n').filter(Boolean)
  const qrs = imagenes.filter((im) => im.medio === 'video' && im.qr)

  /* Presupuesto vertical, en milímetros. La cabecera y el pie son fijos; el
     texto se mide; lo que sobra es de las fotos. Antes esto iba en
     porcentajes y por eso nada tenía un tamaño real. */
  const ALTO_CABECERA = 26
  const ALTO_PIE = 10
  const altoNota = nota ? altoDeTexto([nota], UTIL.ancho - 12) + 10 : 0
  const altoMedidas = esSemana ? 9 : 0
  const altoTextos = altoDeTexto(parrafos, UTIL.ancho)

  const altoFotos = Math.max(
    0,
    UTIL.alto - ALTO_CABECERA - ALTO_PIE - altoNota - altoMedidas - altoTextos - 6
  )

  const piezas: Pieza[] = imagenes.map((im) => ({
    id: im.id,
    ancho: im.ancho,
    alto: im.alto,
  }))
  const maqueta = maquetar(piezas, UTIL.ancho, altoFotos)
  const porId = new Map(imagenes.map((im) => [im.id, im]))

  /* Si hay texto suficiente, la foto principal flota y el texto la rodea:
     arranca a su costado y sigue a todo lo ancho por debajo. Las demás fotos
     bajan a filas debajo. Da más juego que apilar y, al liberar alto, deja
     que la foto principal sea mayor, no menor. */
  const caracteres = (texto ?? '').length
  const altoCuerpo = Math.max(
    0,
    UTIL.alto - ALTO_CABECERA - ALTO_PIE - altoNota - altoMedidas
  )
  /* La principal es la de mayor techo de resolución, no la primera: da igual
     el orden de subida, manda cuál aguanta salir grande. */
  const iPrincipal = piezas.reduce(
    (mejor, p, i) =>
      techoDeResolucion(p) > techoDeResolucion(piezas[mejor]) ? i : mejor,
    0
  )
  // Ojo: la mayoría de las páginas todavía no tienen ni una foto. Aquí no
  // puede darse por hecho que exista una principal.
  const principal = piezas.length > 0 ? piezas[iPrincipal] : null
  const resto = piezas.filter((_, i) => i !== iPrincipal)

  const candidata =
    principal && convieneFlotar(piezas.length, caracteres)
      ? encajarFlotante(principal, caracteres, UTIL.ancho, altoCuerpo)
      : null

  /* Flotar no siempre gana. Con poco texto, la columna del costado obliga a
     dejar la foto a media página y sobra papel en blanco debajo; apilada
     puede ir a todo el ancho. Se queda la que deje la foto más grande. */
  const anchoApilada = principal
    ? Math.min(techoDeResolucion(principal), UTIL.ancho)
    : 0
  const flotante =
    candidata && anchoApilada <= candidata.ancho * 1.35 ? candidata : null

  // Lo que sobra de fotos y de alto, una vez colocada la que flota.
  const maquetaResto = maquetar(
    flotante ? resto : [],
    UTIL.ancho,
    flotante ? Math.max(0, altoCuerpo - flotante.altoTotal - CALLE) : 0
  )

  // Se alterna el lado para que el álbum tenga ritmo y no todas las páginas
  // empiecen igual.
  const flotaDerecha = semana !== null && semana % 2 === 1
  const claveMarco = `${tipo}-${semana ?? titulo}`

  /* Subtítulo y lugar pueden traer el mismo dato: en las páginas sin fecha
     propia ambos caen al subtítulo del álbum. Sin esto salía repetido. */
  const linea = Array.from(
    new Set([subtitulo, lugarPie].map((v) => v?.trim()).filter(Boolean))
  ).join(' · ')

  const estiloParrafo: React.CSSProperties = {
    margin: `0 0 ${mm(2.5)}`,
    fontSize: mm(CUERPO),
    lineHeight: INTERLINEA,
    textAlign: 'justify',
    hyphens: 'auto',
  }
  const estiloFila: React.CSSProperties = {
    display: 'flex',
    gap: mm(CALLE),
    marginBottom: mm(CALLE),
    justifyContent: 'center',
  }

  /* Se intercala: una fila de fotos, un párrafo, otra fila, otro párrafo.
     Un ladrillo de texto de 300 palabras al pie es mucho para un niño. */
  const bloques: Array<
    { tipo: 'fotos'; indice: number } | { tipo: 'texto'; texto: string }
  > = []
  const total = Math.max(maqueta.filas.length, parrafos.length)
  for (let i = 0; i < total; i++) {
    if (i < maqueta.filas.length) bloques.push({ tipo: 'fotos', indice: i })
    if (i < parrafos.length) bloques.push({ tipo: 'texto', texto: parrafos[i] })
  }

  const anchoPapel = PAGINA.ancho + (sangrado ? PAGINA.sangrado * 2 : 0)
  const altoPapel = PAGINA.alto + (sangrado ? PAGINA.sangrado * 2 : 0)
  const desplazamiento = sangrado ? PAGINA.sangrado : 0

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
            /* La clave de todo: un milímetro de papel. En pantalla vale lo
               que dé el ancho disponible; al imprimir vale un milímetro de
               verdad. Así la pantalla y el papel son la misma página. */
            '--mm': `calc(100cqi / ${anchoPapel})`,
            position: 'relative',
            width: mm(anchoPapel),
            height: mm(altoPapel),
            background: PAPEL,
            color: TINTA,
            overflow: 'hidden',
            boxShadow: '0 2px 16px rgba(90,80,60,0.13)',
          } as React.CSSProperties
        }
      >
        <div
          style={{
            position: 'absolute',
            left: mm(desplazamiento),
            top: mm(desplazamiento),
            width: mm(PAGINA.ancho),
            height: mm(PAGINA.alto),
          }}
        >
          <Fondo
            clave={`${tipo}-${semana ?? titulo}`}
            tipo={tipo}
            texto={texto}
            color={acento}
            opacidad={0.2}
          />
        </div>

        <div
          style={{
            position: 'absolute',
            left: mm(desplazamiento + PAGINA.margenInterior),
            top: mm(desplazamiento + PAGINA.margenSuperior),
            width: mm(UTIL.ancho),
            height: mm(UTIL.alto),
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <header style={{ height: mm(ALTO_CABECERA), flexShrink: 0 }}>
            <p
              style={{
                margin: 0,
                fontSize: mm(2.9),
                letterSpacing: mm(0.22),
                textTransform: 'uppercase',
                color: SUAVE,
              }}
            >
              {encabezado}
            </p>
            <h1
              style={{
                margin: mm(1.5) + ' 0 0',
                fontSize: mm(10),
                fontStyle: 'italic',
                fontWeight: 400,
                lineHeight: 1.05,
              }}
            >
              {titulo}
            </h1>
            <svg
              viewBox="0 0 100 4"
              preserveAspectRatio="none"
              aria-hidden
              style={{ display: 'block', width: mm(52), height: mm(2.2) }}
            >
              <path
                d="M1 2.6C22 1.2 52 1.1 99 2.1"
                fill="none"
                stroke={acento}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <p style={{ margin: mm(1) + ' 0 0', fontSize: mm(3.3), color: SUAVE }}>
              {linea}
            </p>
          </header>

          <div style={{ flex: 1, minHeight: 0 }}>
            {flotante ? (
              <>
                <div>
                  <figure
                    style={{
                      margin: 0,
                      float: flotaDerecha ? 'right' : 'left',
                      [flotaDerecha ? 'marginLeft' : 'marginRight']: mm(CALLE),
                      marginBottom: mm(CALLE),
                    }}
                  >
                    <Foto
                      im={imagenes[iPrincipal]}
                      ancho={flotante.ancho}
                      alto={flotante.alto}
                      esPrincipal
                      indice={0}
                      clave={claveMarco}
                    />
                  </figure>
                  {parrafos.map((t, i) => (
                    <p key={`fl${i}`} style={estiloParrafo}>
                      {t}
                    </p>
                  ))}
                  <div style={{ clear: 'both' }} />
                </div>
                {maquetaResto.filas.map((fila, i) => (
                  <div key={`r${i}`} style={estiloFila}>
                    {fila.fotos.map((enc, j) => {
                      const im = porId.get(enc.id)
                      if (!im) return null
                      return (
                        <figure key={enc.id} style={{ margin: 0, flexShrink: 0 }}>
                          <Foto
                            im={im}
                            ancho={enc.ancho}
                            alto={enc.alto}
                            esPrincipal={false}
                            indice={j + 1}
                            clave={claveMarco}
                          />
                        </figure>
                      )
                    })}
                  </div>
                ))}
              </>
            ) : (
              bloques.map((b, i) =>
                b.tipo === 'fotos' ? (
                  <div key={`f${i}`} style={estiloFila}>
                    {maqueta.filas[b.indice].fotos.map((enc, j) => {
                      const im = porId.get(enc.id)
                      if (!im) return null
                      return (
                        <figure key={enc.id} style={{ margin: 0, flexShrink: 0 }}>
                          <Foto
                            im={im}
                            ancho={enc.ancho}
                            alto={enc.alto}
                            esPrincipal={b.indice === 0 && j === 0}
                            indice={j}
                            clave={claveMarco}
                          />
                        </figure>
                      )
                    })}
                  </div>
                ) : (
                  <p key={`t${i}`} style={estiloParrafo}>
                    {b.texto}
                  </p>
                )
              )
            )}

            {parrafos.length === 0 && imagenes.length === 0 ? (
              <p style={{ fontSize: mm(CUERPO), color: SUAVE }}>{t.sinCuento}</p>
            ) : null}
          </div>

          {esSemana ? (
            <p
              style={{
                margin: 0,
                fontSize: mm(3),
                color: SUAVE,
                flexShrink: 0,
              }}
            >
              {t.peso}: {medida(pesoG, 1000, 'kg')} · {t.talla}:{' '}
              {medida(tallaMm, 10, 'cm')} · {t.cabeza}: {medida(cabezaMm, 10, 'cm')}
            </p>
          ) : null}

          {nota ? (
            <aside
              style={{
                flexShrink: 0,
                marginTop: mm(3),
                borderLeft: `${mm(1)} solid ${acento}`,
                paddingLeft: mm(4),
              }}
            >
              {notaTitulo ? (
                <h2
                  style={{
                    margin: 0,
                    fontSize: mm(3.6),
                    fontWeight: 500,
                    color: acento,
                  }}
                >
                  {notaTitulo}
                </h2>
              ) : null}
              <p
                style={{
                  margin: mm(1) + ' 0 0',
                  fontSize: mm(3.5),
                  lineHeight: 1.5,
                }}
              >
                {nota}
              </p>
            </aside>
          ) : null}

          <footer
            style={{
              flexShrink: 0,
              height: mm(ALTO_PIE),
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: mm(4),
            }}
          >
            <span
              style={{
                width: mm(9),
                height: mm(9),
                borderRadius: '50%',
                background: acento,
                color: PAPEL,
                fontSize: mm(3.6),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {semana ?? ''}
            </span>
            <span style={{ fontSize: mm(2.7), color: SUAVE }}>{pie}</span>
            {qrs.length ? (
              <span style={{ display: 'flex', gap: mm(2), flexShrink: 0 }}>
                {qrs.slice(0, 2).map((im) => (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    key={im.id}
                    src={im.qr!}
                    alt=""
                    style={{ width: mm(11), height: mm(11), display: 'block' }}
                  />
                ))}
              </span>
            ) : null}
          </footer>
        </div>
      </article>
    </div>
  )
}
