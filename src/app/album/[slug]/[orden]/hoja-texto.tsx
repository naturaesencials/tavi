import { PAGINA } from '@/lib/maqueta'
import { papelDePliego, adornosDe, type Papel } from '@/lib/escenografia'
import { mm, Pagina, PapelRasgado, Dibujo } from './papeleria'

/* Cuerpo del cuento en milímetros de papel: 4,6 mm son unos 13 pt. Un niño
   de cinco años puede seguirlo con el dedo. */
const CUERPO = 4.6
const INTERLINEA = 1.62
const LINEA = CUERPO * INTERLINEA
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
  numero: number | null
  pliego: number
  sangrado?: boolean
}) {
  const papel: Papel = papelDePliego(pliego)
  const parrafos = (texto ?? '').split('\n\n').filter(Boolean)
  const [, adorno] = adornosDe(pliego)

  // La capitular se saca de la primera letra y el resto del párrafo fluye a
  // su alrededor.
  const primero = parrafos[0] ?? ''
  const capitular = primero.charAt(0)
  const restoPrimero = primero.slice(1)

  // Renglón a lápiz. Se dibuja de fondo, como en un cuaderno.
  const renglones = Math.floor((PAGINA.alto - 120) / LINEA)

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
          top: mm(20),
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

      {/* Renglón a lápiz de fondo. */}
      <svg
        aria-hidden
        viewBox={`0 0 ${PAGINA.ancho} ${PAGINA.alto}`}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        {Array.from({ length: renglones }, (_, i) => {
          const y = 62 + i * LINEA
          return (
            <path
              key={i}
              d={`M${MARGEN_IZQ} ${y} H${PAGINA.ancho - MARGEN_DER}`}
              stroke={papel.trama}
              strokeWidth="0.25"
              opacity="0.7"
            />
          )
        })}
      </svg>

      <div
        style={{
          position: 'absolute',
          left: mm(MARGEN_IZQ),
          top: mm(58),
          width: mm(ANCHO_TEXTO),
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
          <aside
            style={{
              marginTop: mm(6),
              borderLeft: `${mm(1.2)} solid ${papel.acento}`,
              paddingLeft: mm(5),
            }}
          >
            {notaTitulo ? (
              <h2
                style={{
                  margin: 0,
                  fontSize: mm(3.8),
                  fontWeight: 500,
                  fontStyle: 'italic',
                  color: papel.acento,
                }}
              >
                {notaTitulo}
              </h2>
            ) : null}
            <p
              style={{
                margin: `${mm(1.2)} 0 0`,
                fontSize: mm(3.7),
                lineHeight: 1.5,
              }}
            >
              {nota}
            </p>
          </aside>
        ) : null}

        {medidas ? (
          <p style={{ margin: `${mm(6)} 0 0`, fontSize: mm(3.2), color: papel.suave }}>
            {medidas}
          </p>
        ) : null}
      </div>

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
