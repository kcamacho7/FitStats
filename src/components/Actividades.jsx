import { useState } from 'react'
import { indicadorSecundario, nombreDeporte } from '../lib/deportes'

const POR_PAGINA = 20

// intervals.icu entrega el GAP como velocidad; si el valor es chico (m/s) se convierte a
// ritmo min/km, y si viene grande se asume que ya son segundos por km.
function formatearGap(gap) {
  if (!gap || gap <= 0) return null
  const segPorKm = gap < 60 ? 1000 / gap : gap
  const min = Math.floor(segPorKm / 60)
  const seg = Math.round(segPorKm % 60)
  return `${min}:${String(seg).padStart(2, '0')} /km`
}

export default function Actividades({ data }) {
  const [visibles, setVisibles] = useState(POR_PAGINA)
  const actividades = data.actividades

  if (actividades.length === 0) return null

  const mostradas = actividades.slice(0, visibles)

  // VO2max no existe por actividad en Strava ni intervals.icu (verificado en vivo) — solo
  // como valor diario. Se muestra acá como referencia del día, cruzando por fecha con
  // wellness_diario, no como una medición de esa sesión puntual.
  const vo2maxPorFecha = new Map(
    (data.wellness_diario || [])
      .filter((w) => w.vo2max != null)
      .map((w) => [w.fecha, w.vo2max]),
  )

  // Cumplimiento: el compliance de intervals.icu requiere que la actividad tenga un workout
  // planificado asignado dentro de intervals (verificado en vivo — casi siempre null en la
  // práctica). Se reemplaza por el % ya calculado en Plan vs. ejecutado (actual/plan del día),
  // cruzando por fecha igual que VO2max — es un valor del día, no de esa sesión puntual.
  const cumplimientoPorFecha = new Map(
    (data.plan_vs_actual || [])
      .filter((r) => r.actual_time_min != null && r.planned_time_min)
      .map((r) => [r.fecha, Math.round((Number(r.actual_time_min) / Number(r.planned_time_min)) * 1000) / 10]),
  )

  return (
    <section className="section">
      <h2>Actividades recientes</h2>
      <p className="section-sub">
        Registro individual de cada actividad sincronizada desde Strava — las {actividades.length} más recientes.
        Decoupling (desacople cardíaco), EF (factor de eficiencia) y Ritmo GAP vienen de intervals.icu si está
        conectado. Cumplimiento es el % del día en Plan vs. ejecutado. VO2max es el valor de ese día (no existe por
        actividad en ninguna API), cuando tu dispositivo lo reporta.
      </p>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Actividad</th>
              <th>Deporte</th>
              <th className="num">Distancia</th>
              <th className="num">Tiempo</th>
              <th className="num">Elevación</th>
              <th className="num">Ritmo/Velocidad</th>
              <th className="num">Potencia</th>
              <th className="num">FC prom.</th>
              <th className="num">Relative Effort</th>
              <th className="num">Ritmo GAP</th>
              <th className="num">Decoupling</th>
              <th className="num">EF</th>
              <th className="num">Cumplimiento (día)</th>
              <th className="num">VO2max (día)</th>
            </tr>
          </thead>
          <tbody>
            {mostradas.map((a) => {
              const ind = indicadorSecundario(a.deporte, {
                distancia_km: a.distancia_km,
                moving_time_min: a.tiempo_movimiento_min,
              })
              return (
                <tr key={a.strava_id}>
                  <td>{a.start_local}</td>
                  <td className="wrap">{a.nombre || '—'}</td>
                  <td>{nombreDeporte(a.deporte)}</td>
                  <td className="num">{a.distancia_km != null ? `${a.distancia_km} km` : '—'}</td>
                  <td className="num">
                    {a.tiempo_movimiento_min != null ? `${Math.round((a.tiempo_movimiento_min / 60) * 10) / 10} h` : '—'}
                  </td>
                  <td className="num">{a.elevacion_m != null ? `${Math.round(a.elevacion_m)} m` : '—'}</td>
                  <td className="num">{ind ? ind.value : '—'}</td>
                  <td className="num">{a.potencia_prom_w != null ? `${Math.round(a.potencia_prom_w)} W` : '—'}</td>
                  <td className="num">{a.fc_prom != null ? Math.round(a.fc_prom) : '—'}</td>
                  <td className="num">{a.relative_effort ?? '—'}</td>
                  <td className="num">{formatearGap(a.ritmo_gap) ?? '—'}</td>
                  <td className="num">{a.decoupling != null ? `${a.decoupling}%` : '—'}</td>
                  <td className="num">{a.factor_eficiencia ?? '—'}</td>
                  <td className="num">
                    {cumplimientoPorFecha.has(a.start_local) ? `${cumplimientoPorFecha.get(a.start_local)}%` : '—'}
                  </td>
                  <td className="num">{vo2maxPorFecha.get(a.start_local) ?? '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {visibles < actividades.length && (
        <button
          type="button"
          className="login-btn login-btn-secondary"
          style={{ marginTop: 12 }}
          onClick={() => setVisibles((v) => v + POR_PAGINA)}
        >
          Mostrar más ({actividades.length - visibles} restantes)
        </button>
      )}
    </section>
  )
}
