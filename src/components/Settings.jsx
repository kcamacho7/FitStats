import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const FUNCTIONS_URL = 'https://ztawdtaymbrocphzenuo.supabase.co/functions/v1'

export default function Settings({ onClose, onSynced }) {
  const [apiKey, setApiKey] = useState('')
  const [athleteId, setAthleteId] = useState('')
  const [estado, setEstado] = useState(null) // { tipo: 'ok'|'error', texto }
  const [cargando, setCargando] = useState(false)

  const llamarFuncion = async (nombre, body) => {
    const { data: { session } } = await supabase.auth.getSession()
    const resp = await fetch(`${FUNCTIONS_URL}/${nombre}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(body ?? {}),
    })
    const data = await resp.json()
    if (!resp.ok) throw new Error(data.error || 'Error desconocido')
    return data
  }

  const guardarCredencial = async (e) => {
    e.preventDefault()
    setCargando(true)
    setEstado(null)
    try {
      await llamarFuncion('guardar-credencial', {
        servicio: 'intervals',
        api_key: apiKey,
        athlete_id: athleteId,
      })
      setEstado({ tipo: 'ok', texto: 'Credencial guardada.' })
      setApiKey('')
    } catch (err) {
      setEstado({ tipo: 'error', texto: err.message })
    } finally {
      setCargando(false)
    }
  }

  const sincronizarAhora = async () => {
    setCargando(true)
    setEstado(null)
    try {
      const data = await llamarFuncion('sincronizar-intervals')
      setEstado({ tipo: 'ok', texto: data.mensaje || `Sincronizado: ${data.filas} fila(s) nueva(s).` })
      onSynced?.()
    } catch (err) {
      setEstado({ tipo: 'error', texto: err.message })
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-card" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Configuración</h2>
          <button type="button" className="settings-close" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <p className="section-sub">
          Conectá tu cuenta para traer tu Fitness/Fatiga/Forma automáticamente. Tu API key se guarda cifrada — nunca
          queda visible en el navegador ni en la base de datos en texto plano.
        </p>

        <form onSubmit={guardarCredencial} className="login-form">
          <label className="login-label">
            API Key
            <input
              type="password"
              required
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="login-input"
              placeholder="Tu API key personal"
            />
          </label>
          <label className="login-label">
            Athlete ID
            <input
              type="text"
              required
              value={athleteId}
              onChange={(e) => setAthleteId(e.target.value)}
              className="login-input"
              placeholder="ej. i445730"
            />
          </label>

          {estado && (
            <p className={estado.tipo === 'error' ? 'error-text login-msg' : 'loading-text login-msg'}>
              {estado.texto}
            </p>
          )}

          <div className="settings-actions">
            <button type="submit" className="login-btn" disabled={cargando}>
              Guardar credencial
            </button>
            <button type="button" className="login-btn login-btn-secondary" disabled={cargando} onClick={sincronizarAhora}>
              Sincronizar ahora
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
