import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { indicadorSecundario } from '../lib/deportes'
import Spinner from './Spinner'

const FUNCTIONS_URL = 'https://ztawdtaymbrocphzenuo.supabase.co/functions/v1'

function valorO(valor, sufijo = '') {
  return valor != null ? `${valor}${sufijo}` : '—'
}

const hoy = () => new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString().slice(0, 10)

function delta(actual, referencia, sufijo = '', invertido = false) {
  if (actual == null || referencia == null) return null
  const diff = Math.round((actual - referencia) * 10) / 10
  if (diff === 0) return null
  const mejora = invertido ? diff < 0 : diff > 0
  const signo = diff > 0 ? '+' : ''
  return { texto: `${signo}${diff}${sufijo} vs. referencia`, mejora }
}

export default function RaceCards({ data, onCambio }) {
  const [carrera, setCarrera] = useState('')
  const [proximaEdicion, setProximaEdicion] = useState('')
  const [fecha2025, setFecha2025] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [borrandoId, setBorrandoId] = useState(null)
  const [buscandoId, setBuscandoId] = useState(null)
  const [error, setError] = useState(null)

  const agregar = async (e) => {
    e.preventDefault()
    setError(null)
    setGuardando(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const resp = await fetch(`${FUNCTIONS_URL}/agregar-carrera`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ carrera, proxima_edicion: proximaEdicion, fecha_2025: fecha2025 }),
      })
      const json = await resp.json()
      if (!resp.ok) throw new Error(json.error || 'Error desconocido')
      setCarrera('')
      setProximaEdicion('')
      setFecha2025('')
      onCambio?.()
    } catch (err) {
      setError(err.message || 'No se pudo agregar la competencia')
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async (id) => {
    setBorrandoId(id)
    try {
      await supabase.from('carreras').delete().eq('id', id)
      onCambio?.()
    } finally {
      setBorrandoId(null)
    }
  }

  const buscarResultado = async (id) => {
    setBuscandoId(id)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const resp = await fetch(`${FUNCTIONS_URL}/actualizar-resultado-carrera`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ carrera_id: id }),
      })
      const json = await resp.json()
      if (!resp.ok) throw new Error(json.error || 'Error desconocido')
      onCambio?.()
    } catch (err) {
      setError(err.message || 'No se pudo buscar el resultado')
    } finally {
      setBuscandoId(null)
    }
  }

  return (
    <section className="section">
      <h2>Líneas base de competencias</h2>
      <p className="section-sub">
        Métricas de referencia de cada competencia — para ciclismo, potencia y %FTP; para otros deportes, distancia,
        tiempo y ritmo/velocidad.
      </p>
      <div className="race-grid">
        {data.carreras.map((c) => {
          const ind = indicadorSecundario(c.deporte, { distancia_km: c.distancia_km, moving_time_min: c.tiempo_min })
          const pctFtp =
            c.potencia_prom_w != null && c.ftp_real_vigente_w
              ? Math.round((Number(c.potencia_prom_w) / Number(c.ftp_real_vigente_w)) * 1000) / 10
              : null
          const celdas = [
            { label: 'Edición 2025', value: valorO(c.fecha_2025) },
            { label: 'Distancia', value: valorO(c.distancia_km, ' km') },
            {
              label: 'Tiempo',
              value: c.tiempo_min != null ? `${Math.round((c.tiempo_min / 60) * 10) / 10} h` : '—',
            },
            {
              label: 'FC promedio',
              value: <>{valorO(c.fc_prom)} <span className="unit">bpm</span></>,
            },
            ...(c.potencia_prom_w != null
              ? [{ label: 'Potencia promedio', value: <>{c.potencia_prom_w} <span className="unit">W</span></> }]
              : []),
            ...(pctFtp != null
              ? [{ label: '% FTP real', value: `${pctFtp}%`, accent: true }]
              : []),
            ...(ind ? [{ label: ind.label, value: ind.value }] : []),
          ]

          const tieneActual = c.distancia_km_actual != null
          const pctFtpActual =
            c.potencia_prom_w_actual != null && c.ftp_real_vigente_w_actual
              ? Math.round((Number(c.potencia_prom_w_actual) / Number(c.ftp_real_vigente_w_actual)) * 1000) / 10
              : null
          const indActual = tieneActual
            ? indicadorSecundario(c.deporte, { distancia_km: c.distancia_km_actual, moving_time_min: c.tiempo_min_actual })
            : null
          const deltaTiempo = tieneActual
            ? delta(c.tiempo_min_actual, c.tiempo_min, ' min', true)
            : null
          const celdasActual = tieneActual
            ? [
                { label: `Edición ${c.proxima_edicion}`, value: valorO(c.proxima_edicion) },
                { label: 'Distancia', value: valorO(c.distancia_km_actual, ' km') },
                {
                  label: 'Tiempo',
                  value: c.tiempo_min_actual != null ? `${Math.round((c.tiempo_min_actual / 60) * 10) / 10} h` : '—',
                },
                ...(deltaTiempo
                  ? [{ label: 'Diferencia', value: deltaTiempo.texto, accent: true, mejora: deltaTiempo.mejora }]
                  : []),
                {
                  label: 'FC promedio',
                  value: <>{valorO(c.fc_prom_actual)} <span className="unit">bpm</span></>,
                },
                ...(c.potencia_prom_w_actual != null
                  ? [{ label: 'Potencia promedio', value: <>{c.potencia_prom_w_actual} <span className="unit">W</span></> }]
                  : []),
                ...(pctFtpActual != null
                  ? [{ label: '% FTP real', value: `${pctFtpActual}%`, accent: true }]
                  : []),
                ...(indActual ? [{ label: indActual.label, value: indActual.value }] : []),
              ]
            : []
          const puedeBuscarResultado = !tieneActual && c.proxima_edicion <= hoy()

          return (
            <article key={c.id} className="race-card">
              <header>
                <h3>{c.carrera}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="race-badge">Próxima: {c.proxima_edicion}</span>
                  <button
                    type="button"
                    className="settings-close"
                    onClick={() => eliminar(c.id)}
                    disabled={borrandoId === c.id}
                    aria-label="Eliminar competencia"
                  >
                    {borrandoId === c.id ? <Spinner /> : '✕'}
                  </button>
                </div>
              </header>
              <div className="race-stats">
                {celdas.map((celda) => (
                  <div key={celda.label}>
                    <span className="race-stat-label">{celda.label}</span>
                    <span className={`race-stat-value ${celda.accent ? 'race-stat-accent' : ''}`}>{celda.value}</span>
                  </div>
                ))}
              </div>

              {tieneActual && (
                <div className="race-stats" style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-color, #333)' }}>
                  {celdasActual.map((celda) => (
                    <div key={celda.label}>
                      <span className="race-stat-label">{celda.label}</span>
                      <span
                        className={`race-stat-value ${celda.accent ? 'race-stat-accent' : ''}`}
                        style={celda.mejora === true ? { color: 'var(--good-color, #4caf50)' } : celda.mejora === false ? { color: 'var(--warning-color, #e57373)' } : undefined}
                      >
                        {celda.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {puedeBuscarResultado && (
                <button
                  type="button"
                  className="login-btn login-btn-secondary"
                  style={{ marginTop: 12 }}
                  disabled={buscandoId === c.id}
                  onClick={() => buscarResultado(c.id)}
                >
                  {buscandoId === c.id && <Spinner />}
                  Buscar resultado en Strava
                </button>
              )}
            </article>
          )
        })}
      </div>

      <form onSubmit={agregar} className="login-form objetivo-form" style={{ marginTop: 20 }}>
        <label className="login-label">
          Nombre de la competencia
          <input
            type="text"
            required
            value={carrera}
            onChange={(e) => setCarrera(e.target.value)}
            className="login-input"
            placeholder="ej. Gran Fondo Guanacaste"
          />
        </label>
        <label className="login-label">
          Fecha de la nueva edición
          <input
            type="date"
            required
            value={proximaEdicion}
            onChange={(e) => setProximaEdicion(e.target.value)}
            className="login-input"
          />
        </label>
        <label className="login-label">
          Fecha de la edición de referencia (para buscarla en Strava)
          <input
            type="date"
            required
            value={fecha2025}
            onChange={(e) => setFecha2025(e.target.value)}
            className="login-input"
          />
        </label>

        {error && <p className="error-text login-msg">{error}</p>}

        <button type="submit" className="login-btn" disabled={guardando} style={{ alignSelf: 'flex-start' }}>
          {guardando && <Spinner />}
          Agregar competencia
        </button>
      </form>
    </section>
  )
}
