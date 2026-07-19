import { T, type Idioma } from '@/lib/idioma'
import Fondo from './fondo'
import Marco, { elegirMarco } from './marco'

export type FotoHoja = {
  id: string
  url: string | null
  posterUrl: string | null
  medio: 'foto' | 'video'
  titulo: string | null
  lugar: string | null
  ancho: number | null
  alto: number | null
  categoria: string | null
  qr: string | null
  duracion: number | null
}

const PAPEL = '#FCF8F0'
const TINTA = '#28322C'
const SUAVE = '#7A8A80'
const RAYA = '#D8DCD4'

// El color ya no tiñe la página: solo marca el tramo en un filete y en el
// rótulo. Se reconoce la sección sin que la hoja se vuelva un cromo.
const ACENTO: Record<string, string> = {
  portada: '#C4623C',
  nombre: '#B98A20',
  embarazo: '#B85572',
  origen: '#2E8B8B',
  hito: '#C4623C',
  viaje: '#3E86B8',
  ciudad: '#578F52',
  nacimiento: '#B85572',
  semana: '#B98A20',
  cumple: '#C4623C',
}

const proporcion = (im: FotoHoja) =>
  im.ancho && im.alto ? im.ancho / im.alto : 1.4

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

function Imagen({
  im,
  esPrincipal,
  indice,
  clavePagina,
  vacio,
}: {
  im: FotoHoja
  esPrincipal: boolean
  indice: number
  clavePagina: string
  vacio: string
}) {
  const fuente = im.medio === 'video' ? im.posterUrl : im.url
  const estilo = elegirMarco(
    im.id,
    im.categoria,
    esPrincipal,
    indice,
    clavePagina
  )
  return (
    <Marco id={im.id} estilo={estilo}>
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#E6E9E2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {fuente ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={fuente}
            alt={im.titulo ?? ''}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span style={{ color: SUAVE, fontSize: '0.68rem' }}>{vacio}</span>
        )}
      </div>
    </Marco>
  )
}

function FilaFotos({
  fila,
  objetivo,
  primera,
  desde,
  clavePagina,
  vacio,
}: {
  fila: { fotos: FotoHoja[]; suma: number }
  objetivo: number
  primera: boolean
  desde: number
  clavePagina: string
  vacio: string
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '11px',
        aspectRatio: String(fila.suma),
        width: `${Math.min(1, fila.suma / objetivo) * 100}%`,
        minHeight: 0,
      }}
    >
      {fila.fotos.map((im, i) => (
        <div key={im.id} style={{ flex: `${proporcion(im)} 1 0` }}>
          <Imagen
            im={im}
            esPrincipal={primera && i === 0}
            indice={desde + i}
            clavePagina={clavePagina}
            vacio={vacio}
          />
        </div>
      ))}
    </div>
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
}) {
  const t = T[idioma]
  const acento = ACENTO[tipo] ?? '#C4623C'
  const medida = (v: number | null, div: number, u: string) =>
    v === null ? '—' : `${(v / div).toLocaleString('es-ES')} ${u}`

  const parrafos = (texto ?? '').split('\n\n').filter(Boolean)
  const largo = (texto ?? '').length
  const objetivo = largo > 1200 ? 3.6 : largo > 600 ? 2.9 : 2.3
  const filas = repartirEnFilas(imagenes, objetivo)
  const qrs = imagenes.filter((im) => im.medio === 'video' && im.qr)

  const cuerpo =
    largo > 1700
      ? '0.72rem'
      : largo > 1300
        ? '0.77rem'
        : largo > 900
          ? '0.82rem'
          : largo > 500
            ? '0.86rem'
            : '0.95rem'

  // El texto se cuela entre las filas de fotos: una foto, un trozo de
  // historia, otra foto. Lo que sobra baja al final a dos columnas.
  const bloques: { clase: 'fotos' | 'texto'; i: number }[] = []
  const total = Math.max(filas.length, parrafos.length)
  for (let i = 0; i < total; i++) {
    if (i < filas.length) bloques.push({ clase: 'fotos', i })
    if (i < parrafos.length) bloques.push({ clase: 'texto', i })
  }

  const columnas = largo > 900 ? 3 : largo > 380 ? 2 : 1

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
        padding: '4.4% 5% 3.2%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 2px 16px rgba(90,80,60,0.13)',
      }}
    >
      <Fondo clave={titulo} tipo={tipo} texto={texto} />

      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 0,
        }}
      >
        <header style={{ flexShrink: 0 }}>
          <p
            style={{
              fontSize: '0.6rem',
              letterSpacing: '3.2px',
              color: SUAVE,
              textTransform: 'uppercase',
            }}
          >
            {encabezado}
          </p>
          <div
            style={{
              height: '1.6px',
              background: acento,
              marginTop: '0.7%',
            }}
          />
          <h1
            style={{
              fontSize: 'clamp(1.4rem,4vw,2.35rem)',
              lineHeight: 1.06,
              marginTop: '1.6%',
              fontWeight: 400,
            }}
          >
            {titulo}
          </h1>
          <div
            style={{
              height: '1px',
              background: RAYA,
              marginTop: '1.4%',
            }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '10px',
              marginTop: '1%',
              fontSize: '0.6rem',
              letterSpacing: '1.4px',
              color: SUAVE,
              textTransform: 'uppercase',
            }}
          >
            <span>{subtitulo}</span>
            <span>{lugarPie}</span>
          </div>
        </header>

        <div
          style={{
            marginTop: '3%',
            display: 'flex',
            flexDirection: 'column',
            gap: '2.4%',
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          {bloques.map((b) =>
            b.clase === 'fotos' ? (
              <FilaFotos
                key={`f${b.i}`}
                fila={filas[b.i]}
                objetivo={objetivo}
                primera={b.i === 0}
                desde={filas
                  .slice(0, b.i)
                  .reduce((n, f) => n + f.fotos.length, 0)}
                clavePagina={titulo}
                vacio={t.hueco}
              />
            ) : (
              <p
                key={`t${b.i}`}
                style={{
                  fontSize: cuerpo,
                  lineHeight: 1.55,
                  columnCount: parrafos[b.i].length > 260 ? columnas : 1,
                  columnGap: '18px',
                  margin: 0,
                }}
              >
                {parrafos[b.i]}
              </p>
            )
          )}

          {parrafos.length === 0 && imagenes.length === 0 && (
            <p style={{ fontSize: '0.88rem', color: SUAVE, fontStyle: 'italic' }}>
              {t.sinCuento}
            </p>
          )}
        </div>

        {esSemana && (
          <section
            style={{
              flexShrink: 0,
              marginTop: '2%',
              borderTop: `1px solid ${RAYA}`,
              borderBottom: `1px solid ${RAYA}`,
              padding: '1.6% 0',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '7%',
              fontSize: '0.8rem',
            }}
          >
            <span
              style={{
                width: '100%',
                fontSize: '0.58rem',
                letterSpacing: '2px',
                color: acento,
                textTransform: 'uppercase',
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

        {nota && (
          <section
            style={{
              flexShrink: 0,
              marginTop: '2%',
              borderLeft: `2px solid ${acento}`,
              paddingLeft: '2.2%',
            }}
          >
            <p
              style={{
                fontSize: '0.56rem',
                letterSpacing: '1.8px',
                color: acento,
                textTransform: 'uppercase',
              }}
            >
              {t.mundo}
            </p>
            <p style={{ fontSize: '0.78rem', marginTop: '0.6%' }}>{notaTitulo}</p>
            <p
              style={{
                fontSize: '0.71rem',
                lineHeight: 1.5,
                marginTop: '0.5%',
                columnCount: 2,
                columnGap: '16px',
              }}
            >
              {nota}
            </p>
          </section>
        )}

        <footer
          style={{
            flexShrink: 0,
            marginTop: 'auto',
            paddingTop: '2%',
            borderTop: `1px solid ${RAYA}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            fontSize: '0.62rem',
            color: SUAVE,
          }}
        >
          {qrs.length > 0 ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              {qrs.slice(0, 2).map((im) => (
                <div
                  key={im.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    border: `1.3px solid ${acento}`,
                    borderRadius: '3px',
                    padding: '4px 7px',
                  }}
                >
                  <span
                    style={{ width: '30px', height: '30px', display: 'block' }}
                    dangerouslySetInnerHTML={{ __html: im.qr! }}
                  />
                  <span
                    style={{
                      fontSize: '0.54rem',
                      lineHeight: 1.2,
                      color: acento,
                      maxWidth: '72px',
                    }}
                  >
                    Apunta aquí y verás el vídeo
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <span>{pie}</span>
          )}
          <span>
            {semana ? `${t.semanas} · ${semana}/52` : t.fotos(imagenes.length)}
          </span>
        </footer>
      </div>
    </article>
  )
}
