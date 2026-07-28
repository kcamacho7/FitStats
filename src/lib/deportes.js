const NOMBRE_DEPORTE = {
  Ride: 'Ciclismo',
  VirtualRide: 'Ciclismo (rodillo)',
  EBikeRide: 'Ciclismo eléctrico',
  Run: 'Running',
  TrailRun: 'Trail running',
  Walk: 'Caminata',
  Hike: 'Hiking',
  Swim: 'Natación',
  WeightTraining: 'Pesas',
  Workout: 'Entrenamiento',
  Yoga: 'Yoga',
  Otro: 'Otro',
}

export function nombreDeporte(tipo) {
  return NOMBRE_DEPORTE[tipo] || tipo
}

export function deportesDistintos(volumenMensual) {
  return [...new Set(volumenMensual.map((r) => r.deporte))].sort()
}

export function consolidarPorMes(volumenMensual) {
  const porMes = new Map()
  for (const r of volumenMensual) {
    const acc = porMes.get(r.mes) || { mes: r.mes, salidas: 0, km: 0, horas: 0, relative_effort: 0 }
    acc.salidas += r.salidas
    acc.km += Number(r.km)
    acc.horas += Number(r.horas)
    acc.relative_effort += Number(r.relative_effort)
    porMes.set(r.mes, acc)
  }
  return [...porMes.values()].sort((a, b) => a.mes.localeCompare(b.mes))
}

export function filtrarPorDeporte(volumenMensual, deporte) {
  return volumenMensual
    .filter((r) => r.deporte === deporte)
    .slice()
    .sort((a, b) => a.mes.localeCompare(b.mes))
}

const RIDE_TIPOS = new Set(['Ride', 'VirtualRide', 'EBikeRide'])
const PASO_TIPOS = new Set(['Run', 'TrailRun', 'Walk', 'Hike'])

function formatearMinSeg(minutosDecimal) {
  const totalSeg = Math.round(minutosDecimal * 60)
  const min = Math.floor(totalSeg / 60)
  const seg = totalSeg % 60
  return `${min}:${String(seg).padStart(2, '0')}`
}

// Indicador secundario según el deporte, calculado solo con datos que ya guardamos
// (distancia y tiempo) — sin pedir nada nuevo a Strava. Devuelve null si el deporte
// no tiene un indicador de ritmo/velocidad relevante (pesas, yoga, etc.).
export function indicadorSecundario(deporte, { distancia_km, moving_time_min }) {
  if (!distancia_km || !moving_time_min) return null

  if (RIDE_TIPOS.has(deporte)) {
    const velocidad = distancia_km / (moving_time_min / 60)
    return { label: 'Velocidad promedio', value: `${Math.round(velocidad * 10) / 10} km/h` }
  }
  if (PASO_TIPOS.has(deporte)) {
    const ritmo = moving_time_min / distancia_km
    return { label: 'Ritmo', value: `${formatearMinSeg(ritmo)} /km` }
  }
  if (deporte === 'Swim') {
    const ritmo100 = moving_time_min / (distancia_km * 10)
    return { label: 'Ritmo', value: `${formatearMinSeg(ritmo100)} /100m` }
  }
  return null
}
