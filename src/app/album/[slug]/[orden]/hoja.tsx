const KRAFT = '#EFE6CE'
const BORDE = '#C9B78E'
const TINTA = '#3C3020'
const SEPIA = '#6B5B3E'
const APAGADO = '#8C7A55'
const ROJO = '#C0512F'
const VERDE = '#2E6E5E'

import { T, type Idioma } from '@/lib/idioma'

export type FotoHoja = {
  id: string
  url: string | null
  posterUrl: string | null
  medio: 'foto' | 'video'
  titulo: string | null
  lugar: string | null
  ancho: number | null
  alto: number | null
}

function Hueco({
  ancho,
  alto,
  proporcion,
  giro,
  pie,
  vacio,
  foto,
}: {
  ancho: string
  alto: string
  proporcion?: number
  giro: number
  pie: string
  vacio: string
  foto?: FotoHoja
}) {
  const fuente = foto?.medio === 'video' ? foto.posterUrl : foto?.url
  return (
    <figure
      className="relative bg-white"
      style={{
        width: ancho,
        border: `1px solid ${BORDE}`,
        transform: `rotate(${giro}deg)`,
        padding: '2.5%',
      }}
    >
      <div
        style={{
          // Con una sola imagen se respeta su proporción real: recortarla
          // a un marco apaisado se comía media foto.
          height: proporcion ? undefined : alto,
          aspectRatio: proporcion ? String(proporcion) : undefined,
          background: '#D6D2C4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {fuente ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fuente}
              alt={foto?.titulo ?? ''}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {foto?.medio === 'video' && (
              <span
                style={{
                  position: 'absolute',
                  right: 6,
                  bottom: 6,
                  background: TINTA,
                  color: KRAFT,
                  fontSize: '0.6rem',
                  letterSpacing: '1px',
                  padding: '2px 6px',
                }}
              >
                VÍDEO
              </span>
            )}
          </>
        ) : (
          <span
            style={{
              color: '#8E8B7F',
              fontSize: '0.72rem',
              letterSpacing: '1px',
            }}
          >
            {vacio}
          </span>
        )}
      </div>
      <figcaption
        style={{
          marginTop: '4%',
          textAlign: 'center',
          color: SEPIA,
          fontSize: '0.72rem',
        }}
      >
        {foto?.titulo ?? pie}
      </figcaption>
      <span
        aria-hidden
        style={{
          position: 'absolute',
          display: foto ? 'block' : 'none',
          top: '-3%',
          left: '22%',
          width: '22%',
          height: '7%',
          background: '#DCCFA8',
          opacity: 0.85,
          transform: 'rotate(-3deg)',
        }}
      />
    </figure>
  )
}

export default function Hoja({
  idioma,
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
  fotos,
  imagenes,
  pie,
  esSemana,
}: {
  idioma: Idioma
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
  fotos: number
  imagenes: FotoHoja[]
  pie: string
  esSemana: boolean
}) {
  const t = T[idioma]
  const medida = (v: number | null, div: number, unidad: string) =>
    v === null ? '—' : `${(v / div).toLocaleString('es-ES')} ${unidad}`

  return (
    <article
      className="relative mx-auto w-full font-display"
      style={{
        maxWidth: '52rem',
        aspectRatio: '210 / 297',
        background: KRAFT,
        border: `1px solid ${BORDE}`,
        color: TINTA,
        padding: '5% 6%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <span
        aria-hidden
        style={{
          position: 'absolute',
          insetBlock: 0,
          left: '4.5%',
          width: '1px',
          background: ROJO,
          opacity: 0.4,
        }}
      />

      <header style={{ borderBottom: `1px solid ${APAGADO}`, paddingBottom: '2%' }}>
        <p
          style={{
            color: APAGADO,
            fontSize: '0.7rem',
            letterSpacing: '3px',
            textTransform: 'uppercase',
          }}
        >
          {encabezado}
        </p>
        <h1 style={{ fontSize: 'clamp(1.8rem,4.6vw,2.8rem)', marginTop: '1.5%' }}>
          {titulo}
        </h1>
        <p style={{ color: SEPIA, fontSize: '0.9rem', marginTop: '1%' }}>
          {subtitulo}
        </p>
      </header>

      {imagenes.length > 3 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '3%',
            marginTop: '4%',
          }}
        >
          {imagenes.slice(0, 6).map((im, i) => (
            <Hueco
              key={im.id}
              ancho="100%"
              alto="7.6rem"
              giro={i % 2 === 0 ? -1 : 1}
              pie=""
              vacio={t.hueco}
              foto={im}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: imagenes.length > 1 ? '1.9fr 1fr' : '1fr',
            gap: '4%',
            marginTop: '4%',
          }}
        >
          <Hueco
            ancho="100%"
            alto="14rem"
            proporcion={
              imagenes.length === 1 &&
              imagenes[0]?.ancho &&
              imagenes[0]?.alto
                ? imagenes[0].ancho / imagenes[0].alto
                : undefined
            }
            giro={-1.2}
            vacio={t.hueco}
            pie={semana ? t.manta(semana) : t.principal}
            foto={imagenes[0]}
          />
          {imagenes.length > 1 && (
            <div style={{ display: 'grid', gap: '10%' }}>
              <Hueco
                ancho="100%"
                alto="5.4rem"
                giro={1}
                pie={t.segunda}
                vacio={t.hueco}
                foto={imagenes[1]}
              />
              {imagenes.length > 2 && (
                <Hueco
                  ancho="100%"
                  alto="5.4rem"
                  giro={-0.8}
                  pie={t.tercera}
                  vacio={t.hueco}
                  foto={imagenes[2]}
                />
              )}
            </div>
          )}
        </div>
      )}

      {esSemana && (
      <section
        style={{
          marginTop: '4%',
          background: '#E3D6B2',
          border: `1px solid ${BORDE}`,
          padding: '2% 3%',
        }}
      >
        <p
          style={{
            color: APAGADO,
            fontSize: '0.66rem',
            letterSpacing: '2px',
            textTransform: 'uppercase',
          }}
        >
          {t.parte}
        </p>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6%',
            marginTop: '1.5%',
            fontSize: '1rem',
          }}
        >
          <span>
            {t.peso} {medida(pesoG, 1000, 'kg')}
          </span>
          <span>
            {t.talla} {medida(tallaMm, 10, 'cm')}
          </span>
          <span>
            {t.cabeza} {medida(cabezaMm, 10, 'cm')}
          </span>
        </div>
      </section>
      )}

      <section style={{ marginTop: '4%', flex: 1 }}>
        {texto ? (
          <div
            style={{
              // El cuerpo se aprieta según crece el texto: una hoja A4 no da
              // de sí y es preferible letra algo menor a que se desborde.
              fontSize: esSemana
                ? '0.95rem'
                : texto.length > 1500
                  ? '0.8rem'
                  : texto.length > 1100
                    ? '0.85rem'
                    : '0.9rem',
              lineHeight: 1.6,
              color: '#4A3B28',
            }}
          >
            {texto.split('\n\n').map((parrafo, i) => (
              <p key={i} style={{ marginTop: i === 0 ? 0 : '0.7em' }}>
                {parrafo}
              </p>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '0.95rem', color: APAGADO, fontStyle: 'italic' }}>
            {t.sinCuento}
          </p>
        )}
      </section>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: esSemana ? '1fr 1fr' : '1fr',
          gap: '4%',
          marginTop: '3%',
        }}
      >
        {esSemana && (
        <div style={{ border: `1px dashed ${ROJO}`, padding: '3%' }}>
          <p
            style={{
              color: ROJO,
              fontSize: '0.64rem',
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            {t.mundo}
          </p>
          {nota ? (
            <>
              <p style={{ marginTop: '3%', fontSize: '0.9rem' }}>{notaTitulo}</p>
              <p
                style={{
                  marginTop: '2%',
                  fontSize: '0.8rem',
                  lineHeight: 1.55,
                  color: '#4A3B28',
                }}
              >
                {nota}
              </p>
            </>
          ) : (
            <p
              style={{
                marginTop: '3%',
                fontSize: '0.82rem',
                color: APAGADO,
                fontStyle: 'italic',
              }}
            >
              {t.sinMundo}
            </p>
          )}
        </div>
        )}

        <div style={{ border: `1px dashed ${VERDE}`, padding: '3%' }}>
          <p
            style={{
              color: VERDE,
              fontSize: '0.64rem',
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            {t.familia}
          </p>
          <p
            style={{
              marginTop: '3%',
              fontSize: '0.82rem',
              color: APAGADO,
              fontStyle: 'italic',
            }}
          >
            {t.sinFamilia}
          </p>
        </div>
      </div>

      <footer
        style={{
          marginTop: '3%',
          display: 'flex',
          justifyContent: 'space-between',
          color: APAGADO,
          fontSize: '0.7rem',
        }}
      >
        <span>
          {pie} · Portland, {idioma === 'en' ? 'Oregon' : 'Oregón'}
        </span>
        <span>{semana ? `${semana} / 52` : t.fotos(fotos)}</span>
      </footer>
    </article>
  )
}
