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

/** Trocea el texto para que haya al menos un bloque por foto emparejada,
 *  partiendo por frases cuando no hay párrafos suficientes. */
function trocear(parrafos: string[], minimo: number) {
  const trozos = [...parrafos]
  while (trozos.length < minimo) {
    let i = 0
    for (let j = 1; j < trozos.length; j++)
      if (trozos[j].length > trozos[i].length) i = j
    const frases = trozos[i].match(/[^.!?]+[.!?]+\s*/g)
    if (!frases || frases.length < 2) break
    const mitad = Math.ceil(frases.length / 2)
    trozos.splice(
      i,
      1,
      frases.slice(0, mitad).join('').trim(),
      frases.slice(mitad).join('').trim()
    )
  }
  return trozos
}

type Banda =
  | { clase: 'pareja'; fotos: FotoHoja[]; texto: string; ladoFoto: 'izq' | 'der' }
  | { clase: 'fotos'; fotos: FotoHoja[] }
  | { clase: 'texto'; texto: string }

/** Empareja fotos con trozos de historia alternando el lado, como en una
 *  revista. Las fotos que no entran en pareja bajan a una tira horizontal,
 *  que ocupa mucha menos altura que otra pareja. */
function componer(
  imagenes: FotoHoja[],
  trozos: string[],
  parejas: number
): Banda[] {
  const bandas: Banda[] = []
  const n = Math.min(parejas, imagenes.length, trozos.length)

  for (let i = 0; i < n; i++)
    bandas.push({
      clase: 'pareja',
      fotos: [imagenes[i]],
      texto: trozos[i],
      ladoFoto: i % 2 === 0 ? 'izq' : 'der',
    })

  const resto = imagenes.slice(n)
  if (resto.length) {
    const porTira = resto.length > 4 ? Math.ceil(resto.length / 2) : resto.length
    for (let i = 0; i < resto.length; i += porTira)
      bandas.push({ clase: 'fotos', fotos: resto.slice(i, i + porTira) })
  }

  for (let i = n; i < trozos.length; i++)
    bandas.push({ clase: 'texto', texto: trozos[i] })

  return bandas
}

/** Ancho de una tira suelta: una foto vertical sola no debe comerse media
 *  página solo porque le sobre sitio a lo ancho. */
const anchoTira = (suma: number) => Math.min(1, suma / 2.4)

/** Altura estimada de la composición, en anchos de columna. Permite elegir el
 *  cuerpo de letra y el tamaño de foto más generosos que quepan en la hoja. */
function altura(
  bandas: Banda[],
  fuente: number,
  anchoFoto: number,
  hueco: number
) {
  const linea = fuente * 1.68
  let total = 0
  for (const b of bandas) {
    if (b.clase === 'fotos') {
      const suma = b.fotos.reduce((t, im) => t + proporcion(im), 0)
      total += anchoTira(suma) / suma
    } else if (b.clase === 'texto') {
      const porLinea = 1 / (fuente * 0.47)
      total += Math.ceil(b.texto.length / porLinea) * linea
    } else {
      const anchoTexto = 1 - anchoFoto - 0.045
      const porLinea = anchoTexto / (fuente * 0.47)
      const hTexto = Math.ceil(b.texto.length / porLinea) * linea
      const hFoto = anchoFoto / proporcion(b.fotos[0])
      total += Math.max(hTexto, hFoto)
    }
  }
  return total + hueco * Math.max(0, bandas.length - 1)
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
        data-foto
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

  const qrs = imagenes.filter((im) => im.medio === 'video' && im.qr)

  // Presupuesto de altura del cuerpo, en anchos de columna. Lo que se llevan
  // cabecera, pie, medidas y nota se descuenta de aquí.
  let disponible = 1.2
  if (esSemana) disponible -= 0.11
  if (nota) disponible -= 0.15
  if (qrs.length) disponible -= 0.07

  const parrafos = (texto ?? '').split('\n\n').filter(Boolean)

  // Se prueban composiciones de más generosa a más apretada y se toma la
  // primera que entra: primero muchas parejas, luego fotos grandes, luego
  // letra grande. Lo que no cabe en pareja baja a una tira horizontal.
  const FUENTES = [0.03, 0.0282, 0.0265, 0.025, 0.0235, 0.022, 0.0206, 0.0192, 0.0178]
  const ANCHOS = [0.58, 0.54, 0.5, 0.46, 0.42, 0.38]
  const HUECO = 0.035
  const maxParejas = Math.min(3, imagenes.length)

  let bandas = componer(imagenes, parrafos, 0)
  let fuenteRel = FUENTES[FUENTES.length - 1]
  let anchoFoto = 0.42
  let mejor = -1

  for (let par = maxParejas; par >= 0; par--) {
    const trozos = trocear(parrafos, Math.max(par, 1))
    const cand = componer(imagenes, trozos, par)
    for (const an of ANCHOS) {
      for (const fu of FUENTES) {
        const h = altura(cand, fu, an, HUECO)
        if (h > disponible) continue
        // Se premia llenar la hoja y, a igualdad, tener más parejas de foto
        // y texto, que es la estructura que se busca.
        const nota = h + par * 0.06
        if (nota > mejor) {
          mejor = nota
          bandas = cand
          anchoFoto = an
          fuenteRel = fu
        }
      }
    }
  }

  // De fracción de columna a rem: la columna mide 46,8rem de ancho máximo.
  const cuerpoRem = `${(fuenteRel * 46.8).toFixed(2)}rem`


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
            marginTop: '3.2%',
            display: 'flex',
            flexDirection: 'column',
            gap: `${HUECO * 100}%`,
            flex: 1,
            minHeight: 0,
            justifyContent: 'space-between',
          }}
        >
          {bandas.map((b, i) => {
            const desde = bandas
              .slice(0, i)
              .reduce(
                (n, x) => n + (x.clase === 'texto' ? 0 : x.fotos.length),
                0
              )

            if (b.clase === 'texto')
              return (
                <p
                  key={`t${i}`}
                  style={{
                    fontSize: cuerpoRem,
                    lineHeight: 1.68,
                    textAlign: 'justify',
                    hyphens: 'auto',
                    margin: 0,
                  }}
                >
                  {b.texto}
                </p>
              )

            if (b.clase === 'fotos')
              return (
                <div
                  key={`f${i}`}
                  style={{
                    display: 'flex',
                    gap: '3%',
                    alignItems: 'flex-start',
                    width: `${anchoTira(b.fotos.reduce((t, im) => t + proporcion(im), 0)) * 100}%`,
                    alignSelf: i % 2 === 1 ? 'flex-end' : 'flex-start',
                  }}
                >
                  {b.fotos.map((im, j) => (
                    <div
                      key={im.id}
                      style={{
                        flex: `${proporcion(im)} 1 0`,
                        aspectRatio: String(proporcion(im)),
                      }}
                    >
                      <Imagen
                        im={im}
                        esPrincipal={false}
                        indice={desde + j}
                        clavePagina={titulo}
                        vacio={t.hueco}
                      />
                    </div>
                  ))}
                </div>
              )

            const columna = (
              <div
                style={{
                  width: `${anchoFoto * 100}%`,
                  flexShrink: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4%',
                }}
              >
                {b.fotos.map((im, j) => (
                  <div key={im.id} style={{ aspectRatio: String(proporcion(im)) }}>
                    <Imagen
                      im={im}
                      esPrincipal={i === 0 && j === 0}
                      indice={desde + j}
                      clavePagina={titulo}
                      vacio={t.hueco}
                    />
                  </div>
                ))}
              </div>
            )

            const cuerpoTexto = (
              <p
                style={{
                  flex: 1,
                  fontSize: cuerpoRem,
                  lineHeight: 1.68,
                  textAlign: 'justify',
                  hyphens: 'auto',
                  margin: 0,
                  alignSelf: 'center',
                }}
              >
                {b.texto}
              </p>
            )

            return (
              <div
                key={`p${i}`}
                style={{ display: 'flex', gap: '4.5%', alignItems: 'center' }}
              >
                {b.ladoFoto === 'izq' ? columna : cuerpoTexto}
                {b.ladoFoto === 'izq' ? cuerpoTexto : columna}
              </div>
            )
          })}

          {bandas.length === 0 && (
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
