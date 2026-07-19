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
