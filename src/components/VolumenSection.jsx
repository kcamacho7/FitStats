import { useState } from 'react'
import VolumeChart from './VolumeChart'
import EffortChart from './EffortChart'
import VolumenPorDeporte from './VolumenPorDeporte'

function mesHace(n) {
  const d = new Date()
  d.setMonth(d.getMonth() - n)
  return d.toISOString().slice(0, 7)
}

export default function VolumenSection({ data }) {
  const [desde, setDesde] = useState(mesHace(11))
  const [hasta, setHasta] = useState(mesHace(0))

  if (data.volumen_mensual.length === 0) return null

  const volumenFiltrado = data.volumen_mensual.filter((r) => r.mes >= desde && r.mes <= hasta)
  const dataFiltrada = { ...data, volumen_mensual: volumenFiltrado }

  return (
    <section className="section">
      <h2>Volumen y carga de entrenamiento</h2>
      <p className="section-sub">
        {data.mesesConDatos} mes{data.mesesConDatos === 1 ? '' : 'es'} de historial disponible en total — por defecto
        se muestran los últimos 12 meses, ajustá el rango si querés ver otro período.
      </p>

      <div className="date-range-filter">
        <label className="login-label">
          Desde
          <input type="month" value={desde} onChange={(e) => setDesde(e.target.value)} className="login-input" />
        </label>
        <label className="login-label">
          Hasta
          <input type="month" value={hasta} onChange={(e) => setHasta(e.target.value)} className="login-input" />
        </label>
      </div>

      {volumenFiltrado.length === 0 ? (
        <p className="section-sub">No hay datos en el rango seleccionado.</p>
      ) : (
        <>
          <div className="chart-grid">
            <VolumeChart data={dataFiltrada} />
            <EffortChart data={dataFiltrada} />
          </div>
          <VolumenPorDeporte data={dataFiltrada} />
        </>
      )}
    </section>
  )
}
