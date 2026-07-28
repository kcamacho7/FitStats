function estadoDe(row) {
  if (!row.ejecutado) return { label: 'Sin registro', cls: 'estado-critical' }
  if (row.pct_tiempo_ejecutado == null) return { label: 'Ejecutado', cls: 'estado-good' }
  if (row.pct_tiempo_ejecutado >= 90) return { label: 'Cumplido', cls: 'estado-good' }
  if (row.pct_tiempo_ejecutado >= 70) return { label: 'Parcial', cls: 'estado-warning' }
  return { label: 'Muy parcial', cls: 'estado-serious' }
}

export default function PlanVsActual({ data }) {
  const rows = [...data.plan_vs_actual].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

  return (
    <section className="section">
      <h2>Plan (TrainingPeaks) vs. ejecutado (Strava)</h2>
      <p className="section-sub">
        30-jun a 27-jul-2026. TSS planificado y Relative Effort real no son la misma métrica/escala — la comparación
        de tiempo es la más confiable.
      </p>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Sesión planificada</th>
              <th className="num">Plan (min)</th>
              <th className="num">Real (min)</th>
              <th className="num">% cumplido</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const estado = estadoDe(r)
              return (
                <tr key={r.fecha}>
                  <td>{r.fecha}</td>
                  <td>{r.workout_name || '—'}</td>
                  <td className="num">{r.planned_time_min ?? '—'}</td>
                  <td className="num">{r.actual_time_min ? Math.round(r.actual_time_min) : '—'}</td>
                  <td className="num">{r.pct_tiempo_ejecutado ? `${r.pct_tiempo_ejecutado}%` : '—'}</td>
                  <td>
                    <span className={`estado-badge ${estado.cls}`}>{estado.label}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
