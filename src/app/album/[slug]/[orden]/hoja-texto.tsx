import { PAGINA } from '@/lib/maqueta'
import { papelDePliego, adornosDe, type Papel } from '@/lib/escenografia'
import { mm, Pagina, PapelRasgado, Dibujo } from './papeleria'
import type { FotoHoja } from './hoja'

/** Color del post-it: un tono cálido de nota adhesiva que contraste con el
 *  papel del pliego, no una variación del mismo color. */
function postit(papel: { acento: string }): { fondo: string; tinta: string } {
  // Amarillo clásico de post-it; si el acento ya tira a cálido, rosa.
  const calido = /^#[aAbBcCdD]/.test(papel.acento)
  return calido
    ? { fondo: '#F7C9D0', tinta: '#5A2E38' }
    : { fondo: '#FCE9A6', tinta: '#5A4A22' }
}

/* Cuerpo del cuento en milímetros de papel: 4,6 mm son unos 13 pt. Un niño
   de cinco años puede seguirlo con el dedo. */
const CUERPO = 4.6
const INTERLINEA = 1.62
const MARGEN_IZQ = 26
const MARGEN_DER = 18
const ANCHO_TEXTO = PAGINA.ancho - MARGEN_IZQ - MARGEN_DER

export default function HojaTexto({
  encabezado,
  titulo,
  subtitulo,
  texto,
  notaTitulo,
  nota,
  medidas,
  firma,
  fotos,
  numero,
  pliego,
  sangrado = false,
}: {
  encabezado: string
  titulo: string
  subtitulo: string
  texto: string | null
  notaTitulo: string | null
  nota: string | null
  /** Peso, talla y perímetro de la semana, ya formateados. */
  medidas: string | null
  firma: string | null
  /** Fotos sobrantes de la hoja de fotos, colocadas aquí como recortes. */
  fotos?: FotoHoja[]
  numero: number | null
  pliego: number
  sangrado?: boolean
}) {
  const papel: Papel = papelDePliego(pliego)
  const parrafos = (texto ?? '').split('\n\n').filter(Boolean)
  const [, adorno] = adornosDe(pliego)
  const anchoTexto = ANCHO_TEXTO

  // La capitular se saca de la primera letra y el resto del párrafo fluye a
  // su alrededor.
  const primero = parrafos[0] ?? ''
  const capitular = primero.charAt(0)
  const restoPrimero = primero.slice(1)

  return (
    <Pagina papel={papel} clave={`t${pliego}`} sangrado={sangrado} numero={numero}>
      <div style={{ position: 'absolute', left: mm(7), top: mm(9) }}>
        <PapelRasgado
          papel={papel}
          ancho={PAGINA.ancho - 14}
          alto={PAGINA.alto - 18}
          giro={0.5}
        />
      </div>

      <header
        style={{
          position: 'absolute',
          left: mm(MARGEN_IZQ),
          top: mm(26),
          width: mm(ANCHO_TEXTO),
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: mm(2.9),
            letterSpacing: mm(0.55),
            textTransform: 'uppercase',
            color: papel.suave,
          }}
        >
          {encabezado}
        </p>
        <h1
          style={{
            margin: `${mm(2)} 0 0`,
            fontSize: mm(9),
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
          style={{ display: 'block', width: mm(58), height: mm(2.4) }}
        >
          <path
            d="M1 2.7C26 1.2 60 1.1 99 2.2"
            fill="none"
            stroke={papel.acento}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        {subtitulo ? (
          <p style={{ margin: `${mm(1.5)} 0 0`, fontSize: mm(3.3), color: papel.suave }}>
            {subtitulo}
          </p>
        ) : null}
      </header>

      <div
        style={{
          position: 'absolute',
          left: mm(MARGEN_IZQ),
          top: mm(64),
          width: mm(anchoTexto),
        }}
      >
        {primero ? (
          <p
            style={{
              margin: `0 0 ${mm(3.5)}`,
              fontSize: mm(CUERPO),
              lineHeight: INTERLINEA,
              textAlign: 'justify',
              hyphens: 'auto',
            }}
          >
            <span
              style={{
                float: 'left',
                fontSize: mm(17),
                lineHeight: 0.82,
                fontStyle: 'italic',
                color: papel.acento,
                marginRight: mm(2.2),
                marginTop: mm(1),
              }}
            >
              {capitular}
            </span>
            {restoPrimero}
          </p>
        ) : null}

        {parrafos.slice(1).map((p, i) => (
          <p
            key={i}
            style={{
              margin: `0 0 ${mm(3.5)}`,
              fontSize: mm(CUERPO),
              lineHeight: INTERLINEA,
              textAlign: 'justify',
              hyphens: 'auto',
            }}
          >
            {p}
          </p>
        ))}

        {nota ? (
          <div
            style={{
              marginTop: mm(8),
              marginLeft: mm(4),
              width: mm(ANCHO_TEXTO - 14),
              transform: 'rotate(-1.4deg)',
              background: postit(papel).fondo,
              boxShadow: `${mm(0.6)} ${mm(1.4)} ${mm(2.4)} rgba(60,50,35,0.22)`,
              padding: `${mm(6)} ${mm(6)} ${mm(7)}`,
              boxSizing: 'border-box',
            }}
          >
            {/* La tira de cinta que lo pega por arriba. */}
            <div
              style={{
                position: 'absolute',
                top: mm(-3),
                left: '50%',
                width: mm(24),
                height: mm(6),
                transform: 'translateX(-50%) rotate(-3deg)',
                background: papel.acento,
                opacity: 0.5,
              }}
            />
            {notaTitulo ? (
              <h2
                style={{
                  margin: 0,
                  fontSize: mm(3.9),
                  fontWeight: 500,
                  fontStyle: 'italic',
                  color: postit(papel).tinta,
                }}
              >
                {notaTitulo}
              </h2>
            ) : null}
            <p
              style={{
                margin: `${mm(1.4)} 0 0`,
                fontSize: mm(3.8),
                lineHeight: 1.5,
                color: postit(papel).tinta,
              }}
            >
              {nota}
            </p>
          </div>
        ) : null}

        {medidas ? (
          <p style={{ margin: `${mm(6)} 0 0`, fontSize: mm(3.2), color: papel.suave }}>
            {medidas}
          </p>
        ) : null}
      </div>

      {/* Fotos traídas de la hoja de fotos: se centran en el hueco entre el
          final del texto y el pie de la hoja, ocupándolo de verdad, no
          pegadas al fondo. */}
      {fotos && fotos.length > 0
        ? (() => {
            const n = Math.min(fotos.length, 3)
            const calle = 7
            const anchoFila = PAGINA.ancho - MARGEN_IZQ - MARGEN_DER

            // Alto aproximado del texto, para saber dónde empieza el hueco.
            const carPorLinea = Math.floor(anchoTexto / (CUERPO * 0.5))
            const lineas = parrafos.reduce(
              (t, p) => t + Math.max(1, Math.ceil(p.length / carPorLinea)),
              0
            )
            const finTexto = 64 + lineas * (CUERPO * INTERLINEA) + 14
            // El hueco va desde ahí hasta la banda del pie (firma + número).
            const finHueco = PAGINA.alto - 34
            const altoHueco = Math.max(40, finHueco - finTexto)

            // Las fotos ocupan el hueco: alto justificado, con un techo
            // generoso para que se vean grandes, y centradas en él.
            const props = fotos.slice(0, n).map((im) =>
              im.ancho && im.alto ? im.ancho / im.alto : 1.35
            )
            const sumaProps = props.reduce((t, r) => t + r, 0)
            let alto = (anchoFila - calle * (n - 1)) / sumaProps
            alto = Math.min(alto, altoHueco - 14, 96)
            const anchoUsado =
              alto * sumaProps + calle * (n - 1)
            const centroHueco = finTexto + altoHueco / 2

            return (
              <div
                style={{
                  position: 'absolute',
                  left: mm(MARGEN_IZQ + (anchoFila - anchoUsado) / 2),
                  top: mm(centroHueco - alto / 2),
                  width: mm(anchoUsado),
                  display: 'flex',
                  gap: mm(calle),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {fotos.slice(0, n).map((im, i) => {
                  const fuente = im.medio === 'video' ? im.posterUrl : im.url
                  const anchoFoto = alto * props[i]
                  return (
                    <div
                      key={im.id}
                      style={{
                        width: mm(anchoFoto + 8),
                        transform: `rotate(${i % 2 === 0 ? -2.5 : 2.5}deg)`,
                        background: '#FFFDF8',
                        boxShadow: `${mm(0.8)} ${mm(1.2)} ${mm(2.6)} rgba(60,50,35,0.26)`,
                        padding: `${mm(4)} ${mm(4)} ${mm(9)}`,
                        boxSizing: 'border-box',
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          width: mm(anchoFoto),
                          height: mm(alto),
                          background: '#E6E9E2',
                          overflow: 'hidden',
                        }}
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
                    </div>
                  )
                })}
              </div>
            )
          })()
        : null}

      {firma ? (
        <div
          style={{
            position: 'absolute',
            right: mm(46),
            bottom: mm(28),
            transform: 'rotate(-3deg)',
            textAlign: 'center',
          }}
        >
          <p style={{ margin: 0, fontSize: mm(6.5), fontStyle: 'italic', color: papel.suave }}>
            {firma}
          </p>
          <svg
            viewBox="0 0 100 4"
            preserveAspectRatio="none"
            aria-hidden
            style={{ display: 'block', width: mm(22), height: mm(2) }}
          >
            <path
              d="M2 2.6C24 1.4 62 1.4 98 2.4"
              fill="none"
              stroke={papel.acento}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      ) : null}

      <div style={{ position: 'absolute', left: mm(9), bottom: mm(14) }}>
        <Dibujo adorno={adorno} papel={papel} tam={17} giro={5} opacidad={0.4} />
      </div>
    </Pagina>
  )
}
