import { T, type Idioma } from '@/lib/idioma'
import type { TipoPagina } from '@/lib/tipos'

export type FotoHoja = {
  id: string
  url: string | null
  posterUrl: string | null
  medio: 'foto' | 'video'
  titulo: string | null
  lugar: string | null
  ancho: number | null
  alto: number | null
  qr: string | null
  duracion: number | null
}

const PAPEL = '#FDF7E9'
const TINTA = '#2E3A34'
const SUAVE = '#6E7B71'

// Cada tramo del álbum tiene su color: se ve una página y se sabe en qué
// parte de la historia estás sin leer una palabra.
const ACENTO: Record<string, string> = {
  portada: '#E8663A',
  nombre: '#F0B429',
  embarazo: '#D9536F',
  origen: '#2E9E9E',
  hito: '#E8663A',
  viaje: '#4AA3D9',
  ciudad: '#62A85A',
  nacimiento: '#D9536F',
  semana: '#F0B429',
  cumple: '#E8663A',
}

function aclarar(hex: string, mezcla: number) {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  const m = (c: number) => Math.round(c + (253 - c) * mezcla)
  return `rgb(${m(r)}, ${m(g)}, ${m(b)})`
}

const proporcion = (im: FotoHoja) =>
  im.ancho && im.alto ? im.ancho / im.alto : 1.4

/** Reparte las fotos en filas que llenan el ancho sin recortar ninguna. */
function repartirEnFilas(imagenes: FotoHoja[], objetivo: number) {
  const filas: FotoHoja[][] = []
  let actual: FotoHoja[] = []
  let suma = 0
  for (const im of imagenes) {
    actual.push(im)
    suma += proporcion(im)
    if (suma >= objetivo) {
      filas.push(actual)
      actual = []
      suma = 0
    }
  }
  if (actual.length) filas.push(actual)
  return filas.map((f) => ({
    fotos: f,
    suma: f.reduce((tot, im) => tot + proporcion(im), 0),
  }))
}

function Cinta({ color }: { color: string }) {
  return (
    <span
      aria-hidden
      style={{
        position: 'absolute',
        top: '-9px',
        left: '28%',
        width: '52px',
        height: '18px',
        background: color,
        opacity: 0.45,
        borderRadius: '2px',
        transform: 'rotate(-4deg)',
        zIndex: 2,
      }}
    />
  )
}

function Codigo({ svg, acento }: { svg: string; acento: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: '#FFFFFF',
        border: `2px solid ${acento}`,
        borderRadius: '12px',
        padding: '6px 10px',
      }}
    >
      <span
        style={{ width: '44px', height: '44px', display: 'block' }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <span
        style={{
          fontSize: '0.6rem',
          lineHeight: 1.25,
          color: acento,
          fontWeight: 700,
          maxWidth: '80px',
        }}
      >
        Apunta aquí y verás el vídeo
      </span>
    </div>
  )
}

function Foto({
  im,
  acento,
  vacio,
  conCinta,
}: {
  im?: FotoHoja
  acento: string
  vacio: string
  conCinta?: boolean
}) {
  const fuente = im?.medio === 'video' ? im.posterUrl : im?.url
  return (
    <figure
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        margin: 0,
        background: '#FFFFFF',
        borderRadius: '12px',
        padding: '5px',
        boxShadow: '0 3px 10px rgba(90, 72, 45, 0.16)',
      }}
    >
      {conCinta && <Cinta color={acento} />}
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '8px',
          overflow: 'hidden',
          background: aclarar(acento, 0.86),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {fuente ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={fuente}
            alt={im?.titulo ?? ''}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span style={{ color: SUAVE, fontSize: '0.7rem' }}>{vacio}</span>
        )}
      </div>
      {im?.medio === 'video' && (
        <span
          style={{
            position: 'absolute',
            right: '9px',
            bottom: '9px',
            background: acento,
            color: '#FFF',
            fontSize: '0.55rem',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: '99px',
          }}
        >
          ▶ VÍDEO
        </span>
      )}
    </figure>
  )
}

function Garabato({ acento }: { acento: string }) {
  return (
    <svg aria-hidden viewBox="0 0 120 26" style={{ width: '110px' }}>
      <path
        d="M2 20C20 4 40 26 58 12S96 2 118 16"
        fill="none"
        stroke={acento}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="1 8"
      />
      <path
        d="M104 0l2.2 4.8L111 7l-4.8 2.2L104 14l-2.2-4.8L97 7l4.8-2.2z"
        fill={acento}
      />
    </svg>
  )
}

export default function Hoja({
  idioma,
  tipo,
  encabezado,
  titulo,
  subtitulo,
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
}: {
  idioma: Idioma
  tipo: TipoPagina
  encabezado: string
  titulo: string
  subtitulo: string
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
}) {
  const t = T[idioma]
  const acento = ACENTO[tipo] ?? '#E8663A'
  const medida = (v: number | null, div: number, u: string) =>
    v === null ? '—' : `${(v / div).toLocaleString('es-ES')} ${u}`

  const largo = (texto ?? '').length
  // Con mucho texto las fotos se agrupan en filas más apaisadas para dejarle
  // sitio; con poco, se les da aire.
  const objetivo = largo > 1200 ? 3.6 : largo > 600 ? 2.9 : 2.2
  const unica = imagenes.length === 1 ? imagenes[0] : undefined
  const filas = unica ? [] : repartirEnFilas(imagenes, objetivo)
  const qrs = imagenes.filter((im) => im.medio === 'video' && im.qr)

  const cuerpo =
    largo > 1500
      ? '0.78rem'
      : largo > 1100
        ? '0.85rem'
        : largo > 600
          ? '0.92rem'
          : '1rem'

  const vertical = unica ? proporcion(unica) < 1 : false

  // Una hoja A4 no se estira. Según lo que tenga que convivir con las fotos
  // (medidas, texto largo, recuadros, códigos), el bloque de imágenes recibe
  // más o menos altura, y dentro de ese techo se reparten sin recortarse.
  const extras =
    (esSemana ? 1 : 0) + (nota ? 1 : 0) + (qrs.length ? 1 : 0)
  const techo =
    extras >= 2
      ? '30%'
      : extras === 1
        ? '38%'
        : largo > 1200
          ? '34%'
          : largo > 600
            ? '46%'
            : '58%'

  return (
    <article
      className="font-display"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '52rem',
        margin: '0 auto',
        aspectRatio: '210 / 297',
        background: PAPEL,
        color: TINTA,
        padding: '4.5% 5.5% 3.5%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '5px',
        boxShadow: '0 2px 18px rgba(90,72,45,0.14)',
        overflow: 'hidden',
      }}
    >
      <span
        aria-hidden
        style={{
          position: 'absolute',
          insetInline: 0,
          top: 0,
          height: '9px',
          background: acento,
        }}
      />

      <header style={{ paddingTop: '0.8%' }}>
        <p
          style={{
            color: acento,
            fontSize: '0.66rem',
            fontWeight: 700,
            letterSpacing: '2.5px',
            textTransform: 'uppercase',
          }}
        >
          {encabezado}
        </p>
        <h1
          style={{
            fontSize: 'clamp(1.5rem,4.2vw,2.5rem)',
            lineHeight: 1.05,
            marginTop: '1.2%',
          }}
        >
          {titulo}
        </h1>
        {subtitulo && (
          <p style={{ color: SUAVE, fontSize: '0.84rem', marginTop: '1%' }}>
            {subtitulo}
          </p>
        )}
      </header>

      {imagenes.length > 0 && (
        <div
          style={{
            marginTop: '3.4%',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            maxHeight: techo,
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {unica ? (
            <div
              style={{
                aspectRatio: String(proporcion(unica)),
                alignSelf: 'center',
                minHeight: 0,
                maxWidth: '100%',
                width: vertical ? (largo > 900 ? '40%' : '52%') : '100%',
              }}
            >
              <Foto im={unica} acento={acento} vacio={t.hueco} conCinta />
            </div>
          ) : (
            filas.map((fila, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: '10px',
                  aspectRatio: String(fila.suma),
                  minHeight: 0,
                  // La última fila no se estira a todo el ancho: se queda con
                  // la anchura que le toca para que todas las filas tengan la
                  // misma altura y ninguna foto engorde de más.
                  width: `${Math.min(1, fila.suma / objetivo) * 100}%`,
                }}
              >
                {fila.fotos.map((im) => (
                  <div
                    key={im.id}
                    style={{ flex: `${proporcion(im)} 1 0`, position: 'relative' }}
                  >
                    <Foto
                      im={im}
                      acento={acento}
                      vacio={t.hueco}
                      conCinta={i === 0}
                    />
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}

      {esSemana && (
        <section
          style={{
            marginTop: '3.4%',
            background: aclarar(acento, 0.84),
            borderRadius: '14px',
            padding: '2.4% 3.4%',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6%',
            alignItems: 'baseline',
            fontSize: '0.95rem',
          }}
        >
          <span
            style={{
              color: acento,
              fontSize: '0.62rem',
              fontWeight: 700,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              width: '100%',
            }}
          >
            {t.parte}
          </span>
          <span>
            {t.peso} {medida(pesoG, 1000, 'kg')}
          </span>
          <span>
            {t.talla} {medida(tallaMm, 10, 'cm')}
          </span>
          <span>
            {t.cabeza} {medida(cabezaMm, 10, 'cm')}
          </span>
        </section>
      )}

      <section style={{ marginTop: '3.4%', flex: 1, minHeight: 0 }}>
        {texto ? (
          <div style={{ fontSize: cuerpo, lineHeight: 1.58 }}>
            {texto.split('\n\n').map((parrafo, i) => (
              <p key={i} style={{ marginTop: i === 0 ? 0 : '0.65em' }}>
                {parrafo}
              </p>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '0.9rem', color: SUAVE, fontStyle: 'italic' }}>
            {t.sinCuento}
          </p>
        )}
      </section>

      {qrs.length > 0 && (
        <div
          style={{
            marginTop: '2%',
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          {qrs.map((im) => (
            <Codigo key={im.id} svg={im.qr!} acento={acento} />
          ))}
        </div>
      )}

      {(esSemana || nota) && (
        <div
          style={{
            marginTop: '2.4%',
            display: 'grid',
            gridTemplateColumns: nota && esSemana ? '1fr 1fr' : '1fr',
            gap: '3%',
          }}
        >
          {nota && (
            <div
              style={{
                background: aclarar('#4AA3D9', 0.87),
                borderRadius: '14px',
                padding: '3%',
              }}
            >
              <p
                style={{
                  color: '#2E7FB0',
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  letterSpacing: '1.8px',
                  textTransform: 'uppercase',
                }}
              >
                {t.mundo}
              </p>
              <p style={{ marginTop: '3%', fontSize: '0.84rem' }}>
                {notaTitulo}
              </p>
              <p
                style={{ marginTop: '2%', fontSize: '0.76rem', lineHeight: 1.5 }}
              >
                {nota}
              </p>
            </div>
          )}
          {esSemana && (
            <div
              style={{
                background: aclarar('#62A85A', 0.88),
                borderRadius: '14px',
                padding: '3%',
              }}
            >
              <p
                style={{
                  color: '#48853F',
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  letterSpacing: '1.8px',
                  textTransform: 'uppercase',
                }}
              >
                {t.familia}
              </p>
              <p
                style={{
                  marginTop: '3%',
                  fontSize: '0.78rem',
                  color: SUAVE,
                  fontStyle: 'italic',
                }}
              >
                {t.sinFamilia}
              </p>
            </div>
          )}
        </div>
      )}

      <footer
        style={{
          marginTop: 'auto',
          paddingTop: '2.4%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          color: SUAVE,
          fontSize: '0.68rem',
        }}
      >
        <span>{pie}</span>
        <Garabato acento={acento} />
        <span
          style={{
            background: acento,
            color: '#FFF',
            fontWeight: 700,
            borderRadius: '99px',
            padding: '3px 12px',
            whiteSpace: 'nowrap',
          }}
        >
          {semana ? `${semana} / 52` : t.fotos(imagenes.length)}
        </span>
      </footer>
    </article>
  )
}
