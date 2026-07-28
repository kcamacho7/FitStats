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
