import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { indicadorSecundario } from '../lib/deportes'
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
        Métricas de referencia de cada competencia — para ciclismo, potencia y %FTP; para otros deportes, distancia,
        tiempo y ritmo/velocidad.
      </p>
      <div className="race-grid">
        {data.carreras.map((c) => {
          const ind = indicadorSecundario(c.deporte, { distancia_km: c.distancia_km, moving_time_min: c.tiempo_min })
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
            ...(c.pct_ftp_prom != null
              ? [{ label: '% FTP real', value: `${c.pct_ftp_prom}%`, accent: true }]
              : []),
            ...(ind ? [{ label: ind.label, value: ind.value }] : []),
          ]

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
