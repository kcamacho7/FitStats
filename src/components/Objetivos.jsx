import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Spinner from './Spinner'

const FUNCTIONS_URL = 'https://ztawdtaymbrocphzenuo.supabase.co/functions/v1'

function diasHasta(fechaISO) {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const objetivo = new Date(fechaISO + 'T00:00:00')
  return Math.ceil((objetivo - hoy) / (1000 * 60 * 60 * 24))
}

export default function Objetivos({ data, userId, onCambio }) {
  const [nombre, setNombre] = useState('')
  const [fecha, setFecha] = useState('')
  const [yaCorrida, setYaCorrida] = useState(false)
  const [fechaAnterior, setFechaAnterior] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [borrandoId, setBorrandoId] = useState(null)
  const [error, setError] = useState(null)

  const objetivos = [...data.objetivos].sort((a, b) => new Date(a.fecha) - new Date(b.fecha))

  const agregar = async (e) => {
    e.preventDefault()
    setError(null)
    setGuardando(true)
    try {
      if (yaCorrida && fechaAnterior) {
        const { data: { session } } = await supabase.auth.getSession()
        const resp = await fetch(`${FUNCTIONS_URL}/agregar-objetivo`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({ nombre, fecha, fecha_edicion_anterior: fechaAnterior }),
        })
        const json = await resp.json()
        if (!resp.ok) throw new Error(json.error || 'Error desconocido')
      } else {
        const { error } = await supabase.from('objetivos').insert({ user_id: userId, nombre, fecha })
        if (error) throw error
      }
      setNombre('')
      setFecha('')
      setYaCorrida(false)
      setFechaAnterior('')
      onCambio?.()
    } catch (err) {
      setError(err.message || 'No se pudo agregar el objetivo')
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async (id) => {
    setBorrandoId(id)
    try {
      await supabase.from('objetivos').delete().eq('id', id)
      onCambio?.()
    } finally {
      setBorrandoId(null)
    }
  }

  return (
    <section className="section">
      <h2>Mis objetivos</h2>
      <p className="section-sub">
        Agregá cualquier evento o meta con fecha. Si ya corriste esa misma prueba antes, decime cuándo y busco esa
        edición en tus datos de Strava como referencia.
      </p>

      {objetivos.length > 0 && (
        <div className="objetivos-lista">
          {objetivos.map((o) => {
            const dias = diasHasta(o.fecha)
            return (
              <div key={o.id} className="objetivo-card">
                <div className="objetivo-card-header">
                  <div>
                    <h3>{o.nombre}</h3>
                    <span className="timeline-fecha">
                      {o.fecha} · {dias >= 0 ? `en ${dias} día(s)` : `hace ${-dias} día(s)`}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="settings-close"
                    onClick={() => eliminar(o.id)}
                    disabled={borrandoId === o.id}
                    aria-label="Eliminar objetivo"
                  >
                    {borrandoId === o.id ? <Spinner /> : '✕'}
                  </button>
                </div>
                {o.fecha_edicion_anterior && (
                  <div className="objetivo-referencia">
                    {o.referencia_nota && <p className="chart-sub">{o.referencia_nota}</p>}
                    {o.distancia_km != null && (
                      <div className="race-stats">
                        <div>
                          <span className="race-stat-label">Distancia</span>
                          <span className="race-stat-value">{o.distancia_km} km</span>
                        </div>
                        <div>
                          <span className="race-stat-label">Tiempo</span>
                          <span className="race-stat-value">{Math.round((o.tiempo_min / 60) * 10) / 10} h</span>
                        </div>
                        {o.fc_prom != null && (
                          <div>
                            <span className="race-stat-label">FC promedio</span>
                            <span className="race-stat-value">{o.fc_prom} <span className="unit">bpm</span></span>
                          </div>
                        )}
                        {o.potencia_prom_w != null && (
                          <div>
                            <span className="race-stat-label">Potencia promedio</span>
                            <span className="race-stat-value">{o.potencia_prom_w} <span className="unit">W</span></span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <form onSubmit={agregar} className="login-form objetivo-form">
        <label className="login-label">
          Nombre del objetivo
          <input
            type="text"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="login-input"
            placeholder="ej. Medio Maratón de San José"
          />
        </label>
        <label className="login-label">
          Fecha
          <input type="date" required value={fecha} onChange={(e) => setFecha(e.target.value)} className="login-input" />
        </label>

        <label className="login-check">
          <input type="checkbox" checked={yaCorrida} onChange={(e) => setYaCorrida(e.target.checked)} />
          Ya corrí esta misma prueba antes
        </label>

        {yaCorrida && (
          <label className="login-label">
            Fecha de esa edición anterior
            <input
              type="date"
              value={fechaAnterior}
              onChange={(e) => setFechaAnterior(e.target.value)}
              className="login-input"
            />
          </label>
        )}

        {error && <p className="error-text login-msg">{error}</p>}

        <button type="submit" className="login-btn" disabled={guardando} style={{ alignSelf: 'flex-start' }}>
          {guardando && <Spinner />}
          Agregar objetivo
        </button>
      </form>
    </section>
  )
}
