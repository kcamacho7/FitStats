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

  return (
    <section className="section">
      <h2>Actividades recientes</h2>
      <p className="section-sub">
        Registro individual de cada actividad sincronizada desde Strava — las {actividades.length} más recientes.
        Decoupling (desacople cardíaco), EF (factor de eficiencia), Ritmo GAP y Cumplimiento del plan vienen de
        intervals.icu si está conectado.
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
              <th className="num">Cumplimiento</th>
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
                  <td>{a.nombre || '—'}</td>
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
                  <td className="num">{a.compliance != null ? `${a.compliance}%` : '—'}</td>
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
