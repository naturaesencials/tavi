/** Prueba del motor de maquetación.
 *
 *  Se ejecuta con `npx tsx src/lib/maqueta.prueba.ts`. Cubre sobre todo los
 *  casos vacíos: la mayoría de las páginas del álbum todavía no tienen ni
 *  una foto, y fue justo eso lo que tiró la web en producción.
 */
import {
  maquetar,
  encajarFila,
  encajarFlotante,
  convieneFlotar,
  proporcion,
  techoDeResolucion,
  UTIL,
  ANCHO_MINIMO,
  PPP_MINIMO,
  type Pieza,
} from './maqueta'

let fallos = 0
function comprobar(nombre: string, condicion: boolean) {
  if (!condicion) {
    fallos++
    console.error(`  FALLA  ${nombre}`)
  } else {
    console.log(`  ok     ${nombre}`)
  }
}

const foto = (id: string, ancho: number, alto: number): Pieza => ({ id, ancho, alto })

console.log('\nPáginas sin fotos (52 de las 72 del álbum)')
{
  const m = maquetar([], UTIL.ancho, 200)
  comprobar('maquetar([]) no revienta', m.filas.length === 0 && m.altoTotal === 0)
  comprobar('encajarFila([]) no revienta', encajarFila([], UTIL.ancho).fotos.length === 0)
  comprobar('encajarFlotante(null) devuelve null', encajarFlotante(null, 500, UTIL.ancho, 200) === null)
  comprobar('no conviene flotar sin fotos', !convieneFlotar(0, 1500))
}

console.log('\nMedidas ausentes o absurdas')
{
  const sinMedidas: Pieza = { id: 'x', ancho: null, alto: null }
  comprobar('proporción por defecto', proporcion(sinMedidas) > 0)
  comprobar('techo por defecto', techoDeResolucion(sinMedidas) === UTIL.ancho)
  const m = maquetar([sinMedidas], UTIL.ancho, 200)
  comprobar('una foto sin medidas se coloca', m.filas.length === 1)
  const cero = maquetar([foto('c', 0, 0)], UTIL.ancho, 200)
  comprobar('alto cero no da NaN', Number.isFinite(cero.filas[0].fotos[0].ancho))
}

console.log('\nNitidez')
{
  const buena = maquetar([foto('b', 4032, 3024)], UTIL.ancho, 200)
  const f = buena.filas[0].fotos[0]
  comprobar('una foto suelta no se estira más allá de 300 ppp', f.pppFinal >= 299)
  comprobar('no queda marcada como limitada', !f.limitadaPorResolucion)

  const mala = maquetar([foto('m', 480, 848)], UTIL.ancho, 200)
  const g = mala.filas[0].fotos[0]
  comprobar('una foto pobre llega al mínimo legible', g.ancho >= ANCHO_MINIMO - 0.5)
  comprobar('y nunca baja de 200 ppp', g.pppFinal >= PPP_MINIMO - 1)
  comprobar('y queda marcada como limitada', g.limitadaPorResolucion)
}

console.log('\nNadie se recorta')
{
  const piezas = [foto('a', 1600, 1200), foto('b', 900, 1600), foto('c', 1200, 1600)]
  const m = maquetar(piezas, UTIL.ancho, 180)
  for (const fila of m.filas) {
    for (const enc of fila.fotos) {
      const original = piezas.find((p) => p.id === enc.id)!
      const propOriginal = original.ancho! / original.alto!
      const propColocada = enc.ancho / enc.alto
      comprobar(
        `${enc.id} conserva su proporción`,
        Math.abs(propOriginal - propColocada) < 0.01
      )
    }
  }
}

console.log('\nNada se sale de la página')
{
  const muchas = Array.from({ length: 8 }, (_, i) => foto(`f${i}`, 1200, 1600))
  const m = maquetar(muchas, UTIL.ancho, 150)
  comprobar('el alto respeta el disponible', m.altoTotal <= 150.5)
  for (const fila of m.filas) {
    const usado =
      fila.fotos.reduce((t, x) => t + x.ancho, 0) + 4 * (fila.fotos.length - 1)
    comprobar(`una fila de ${fila.fotos.length} cabe a lo ancho`, usado <= UTIL.ancho + 0.5)
  }
  comprobar('las que no caben se apartan', m.desbordadas.length > 0)
}

console.log(fallos === 0 ? '\nTodo correcto.\n' : `\n${fallos} fallos.\n`)
if (fallos > 0) process.exit(1)
