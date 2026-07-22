import { componer, AIRE, MARCO } from '@/lib/composicion'
import { PAGINA, type Pieza } from '@/lib/maqueta'
import {
  papelDePliego,
  deLaBolsa,
  adornosDe,
  CINTAS,
  type Papel,
} from '@/lib/escenografia'
import type { FotoHoja } from './hoja'
import {
  mm,
  Pagina,
  PapelRasgado,
  CintaAdhesiva,
  EsquinasMontaje,
  SelloFecha,
  Dibujo,
} from './papeleria'

export default function HojaFotos({
  encabezado,
  titulo,
  sello,
  nota,
  imagenes,
  numero,
  pliego,
  sangrado = false,
}: {
  encabezado: string
  titulo: string
  /** Dos líneas cortas para el sello de fecha, o null si no hay fecha. */
  sello: [string, string] | null
  /** Apunte manuscrito breve, el que va en el recorte cosido. */
  nota: string | null
  imagenes: FotoHoja[]
  numero: number | null
  /** Índice del pliego: decide el color del papel. Las dos hojas del mismo
   *  pliego comparten número, y por tanto papel. */
  pliego: number
  sangrado?: boolean
}) {
  const papel: Papel = papelDePliego(pliego)
  const util = { ancho: PAGINA.ancho - AIRE * 2, alto: PAGINA.alto - AIRE * 2 }

  const piezas: Pieza[] = imagenes.map((im) => ({
    id: im.id,
    ancho: im.ancho,
    alto: im.alto,
  }))
  const comp = componer(piezas, util.ancho, util.alto, pliego)
  const porId = new Map(imagenes.map((im) => [im.id, im]))
  const [adornoA, adornoB] = adornosDe(pliego)

  return (
    <Pagina papel={papel} clave={`f${pliego}`} sangrado={sangrado} numero={numero}>
      <div style={{ position: 'absolute', left: mm(6), top: mm(8) }}>
        <PapelRasgado
          papel={papel}
          ancho={PAGINA.ancho - 12}
          alto={PAGINA.alto - 16}
          giro={-0.7}
        />
      </div>

      <header
        style={{
          position: 'absolute',
          left: mm(AIRE + 6),
          top: mm(AIRE + 12),
          width: mm(util.ancho - 40),
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: mm(3),
            letterSpacing: mm(0.4),
            textTransform: 'uppercase',
            color: papel.suave,
            maxWidth: mm(util.ancho - 44),
            lineHeight: 1.25,
            wordBreak: 'normal',
            overflowWrap: 'break-word',
          }}
        >
          {encabezado}
        </p>
        <h1
          style={{
            margin: `${mm(1.5)} 0 0`,
            fontSize: mm(9.5),
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
          style={{ display: 'block', width: mm(60), height: mm(2.4) }}
        >
          <path
            d="M1 2.7C24 1.2 58 1.1 99 2.2"
            fill="none"
            stroke={papel.acento}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </header>

      {sello ? (
        <div style={{ position: 'absolute', right: mm(AIRE + 2), top: mm(AIRE + 14) }}>
          <SelloFecha linea1={sello[0]} linea2={sello[1]} papel={papel} />
        </div>
      ) : null}

      {/* Las fotos. Cada una lleva su sombra, así se ve cuál está encima de
          cuál: sin eso, girarlas solo parece un error de alineación. */}
      {comp.fotos.map((f, i) => {
        const im = porId.get(f.id)
        if (!im) return null
        const fuente = im.medio === 'video' ? im.posterUrl : im.url
        const conCinta = i % 2 === 0
        const conEsquinas = i === 1
        return (
          <div
            key={f.id}
            style={{
              position: 'absolute',
              left: mm(AIRE + f.x),
              top: mm(AIRE + f.y),
              width: mm(f.anchoMarco),
              height: mm(f.altoMarco),
              transform: `rotate(${f.giro}deg)`,
              background: '#FFFDF8',
              boxShadow: `${mm(1)} ${mm(1.4)} ${mm(2.6)} rgba(60,50,35,0.28)`,
              padding: `${mm(MARCO.arriba)} ${mm(MARCO.lados)} ${mm(MARCO.abajo)}`,
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                width: mm(f.ancho),
                height: mm(f.alto),
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
            {im.titulo ? (
              <p
                style={{
                  margin: `${mm(2)} 0 0`,
                  fontSize: mm(3.1),
                  fontStyle: 'italic',
                  lineHeight: 1.2,
                  textAlign: 'center',
                  color: papel.suave,
                }}
              >
                {im.titulo}
              </p>
            ) : null}
            {conEsquinas ? (
              <EsquinasMontaje
                ancho={f.anchoMarco}
                alto={f.altoMarco}
                papel={papel}
              />
            ) : null}
            {conCinta ? (
              <div
                style={{
                  position: 'absolute',
                  left: mm(-6),
                  top: mm(-4),
                }}
              >
                <CintaAdhesiva
                  tipo={deLaBolsa(CINTAS, pliego + i, 4)}
                  papel={papel}
                  giro={i % 4 === 0 ? -14 : 12}
                />
              </div>
            ) : null}
          </div>
        )
      })}

      {/* El apunte manuscrito, sobre un recorte cosido a máquina. */}
      {nota ? (
        <div
          style={{
            position: 'absolute',
            left: mm(AIRE + comp.nota.x),
            top: mm(AIRE + comp.nota.y),
            width: mm(comp.nota.ancho),
            transform: `rotate(${comp.nota.giro}deg)`,
            background: papel.fondo,
            boxShadow: `${mm(0.8)} ${mm(1)} ${mm(2)} rgba(60,50,35,0.2)`,
            padding: mm(5),
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: mm(2),
              border: `${mm(0.4)} dashed ${papel.acento}`,
              opacity: 0.75,
            }}
          />
          <p
            style={{
              margin: 0,
              position: 'relative',
              fontSize: mm(4),
              fontStyle: 'italic',
              lineHeight: 1.45,
            }}
          >
            {nota}
          </p>
        </div>
      ) : null}

      <div style={{ position: 'absolute', left: mm(AIRE - 2), bottom: mm(12) }}>
        <Dibujo adorno={adornoA} papel={papel} tam={24} giro={-4} />
      </div>
      <div style={{ position: 'absolute', left: mm(AIRE + 26), bottom: mm(16) }}>
        <Dibujo adorno={adornoB} papel={papel} tam={14} giro={8} opacidad={0.4} />
      </div>
    </Pagina>
  )
}
