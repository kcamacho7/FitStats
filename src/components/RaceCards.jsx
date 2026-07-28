import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Spinner from './Spinner'

const FUNCTIONS_URL = 'https://ztawdtaymbrocphzenuo.supabase.co/functions/v1'

function valorO(valor, sufijo = '') {
  return valor != null ? `${valor}${sufijo}` : '—'
}

export default function RaceCards({ data, userId, onCambio }) {
  const [carrera, setCarrera] = useState('')
  const [proximaEdicion, setProximaEdicion] = useState('')
  const [fecha2025, setFecha2025] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [borrandoId, setBorrandoId] = useState(null)
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

  return (
    <section className="section">
      <h2>Líneas base de competencias</h2>
      <p className="section-sub">
        Comparación de potencia promedio contra tu FTP vigente en cada competencia — la referencia contra la que
        medir el progreso en cada edición.
      </p>
      <div className="race-grid">
        {data.carreras.map((c) => (
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
              <div>
                <span className="race-stat-label">Edición 2025</span>
                <span className="race-stat-value">{valorO(c.fecha_2025)}</span>
              </div>
              <div>
                <span className="race-stat-label">Distancia</span>
                <span className="race-stat-value">{valorO(c.distancia_km, ' km')}</span>
              </div>
              <div>
                <span className="race-stat-label">Tiempo</span>
                <span className="race-stat-value">
                  {c.tiempo_min != null ? `${Math.round((c.tiempo_min / 60) * 10) / 10} h` : '—'}
                </span>
              </div>
              <div>
                <span className="race-stat-label">FC promedio</span>
                <span className="race-stat-value">{valorO(c.fc_prom)} <span className="unit">bpm</span></span>
              </div>
              <div>
                <span className="race-stat-label">Potencia promedio</span>
                <span className="race-stat-value">{valorO(c.potencia_prom_w)} <span className="unit">W</span></span>
              </div>
              <div>
                <span className="race-stat-label">% FTP real</span>
                <span className="race-stat-value race-stat-accent">{valorO(c.pct_ftp_prom, '%')}</span>
              </div>
            </div>
          </article>
        ))}
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
