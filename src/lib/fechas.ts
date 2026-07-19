const DIAS = [
  'domingo',
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
]
const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
]

// Las fechas vienen como 'YYYY-MM-DD'. Se parsean a mano para que no las
// desplace la zona horaria del servidor.
function partes(iso: string) {
  const [a, m, d] = iso.split('-').map(Number)
  return { a, m, d, diaSemana: new Date(Date.UTC(a, m - 1, d)).getUTCDay() }
}

export function fechaLarga(iso: string) {
  const { a, m, d, diaSemana } = partes(iso)
  return `${DIAS[diaSemana]} ${d} de ${MESES[m - 1]} de ${a}`
}

export function rango(desde: string, hasta: string) {
  const a = partes(desde)
  const b = partes(hasta)
  const inicio =
    a.m === b.m && a.a === b.a ? `${a.d}` : `${a.d} de ${MESES[a.m - 1]}`
  return `Del ${inicio} al ${b.d} de ${MESES[b.m - 1]} de ${b.a}`
}

export function fechaCorta(iso: string) {
  const { a, m, d } = partes(iso)
  return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${a}`
}

const DIAS_EN = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]
const MESES_EN = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

function partesEn(iso: string) {
  const [a, m, d] = iso.split('-').map(Number)
  return { a, m, d, diaSemana: new Date(Date.UTC(a, m - 1, d)).getUTCDay() }
}

export function fechaLargaEn(iso: string) {
  const { a, m, d, diaSemana } = partesEn(iso)
  return `${DIAS_EN[diaSemana]} ${d} ${MESES_EN[m - 1]} ${a}`
}

export function rangoEn(desde: string, hasta: string) {
  const a = partesEn(desde)
  const b = partesEn(hasta)
  const inicio = a.m === b.m && a.a === b.a ? `${a.d}` : `${a.d} ${MESES_EN[a.m - 1]}`
  return `${inicio} to ${b.d} ${MESES_EN[b.m - 1]} ${b.a}`
}
