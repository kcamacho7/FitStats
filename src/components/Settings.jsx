import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const FUNCTIONS_URL = 'https://ztawdtaymbrocphzenuo.supabase.co/functions/v1'

export default function Settings({ onClose, onSynced, avisoInicial }) {
  const [apiKey, setApiKey] = useState('')
  const [athleteId, setAthleteId] = useState('')
  const [estadoIntervals, setEstadoIntervals] = useState(null)
  const [estadoStrava, setEstadoStrava] = useState(avisoInicial ?? null)
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
    setEstadoIntervals(null)
    try {
      await llamarFuncion('guardar-credencial', {
        servicio: 'intervals',
        api_key: apiKey,
        athlete_id: athleteId,
      })
      setEstadoIntervals({ tipo: 'ok', texto: 'Credencial guardada.' })
      setApiKey('')
    } catch (err) {
      setEstadoIntervals({ tipo: 'error', texto: err.message })
    } finally {
      setCargando(false)
    }
  }

  const sincronizarIntervals = async () => {
    setCargando(true)
    setEstadoIntervals(null)
    try {
      const data = await llamarFuncion('sincronizar-intervals')
      setEstadoIntervals({ tipo: 'ok', texto: data.mensaje || `Sincronizado: ${data.filas} fila(s) nueva(s).` })
      onSynced?.()
    } catch (err) {
      setEstadoIntervals({ tipo: 'error', texto: err.message })
    } finally {
      setCargando(false)
    }
  }

  const conectarStrava = async () => {
    setCargando(true)
    setEstadoStrava(null)
    try {
      const data = await llamarFuncion('iniciar-conexion-strava')
      window.location.href = data.url
    } catch (err) {
      setEstadoStrava({ tipo: 'error', texto: err.message })
      setCargando(false)
    }
  }

  const sincronizarStrava = async () => {
    setCargando(true)
    setEstadoStrava(null)
    try {
      const data = await llamarFuncion('sincronizar-strava')
      setEstadoStrava({
        tipo: 'ok',
        texto: `Mes ${data.mes}: ${data.salidas} salidas, ${data.km} km, ${data.horas} h. ${data.fondosNuevos ? `${data.fondosNuevos} fondo(s) nuevo(s) en el top.` : ''}`,
      })
      onSynced?.()
    } catch (err) {
      setEstadoStrava({ tipo: 'error', texto: err.message })
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

        <section className="settings-section">
          <h3 className="settings-section-title">Strava</h3>
          <p className="section-sub">
            Conectá tu cuenta de Strava para traer volumen mensual y tus fondos más largos. El token queda cifrado,
            nunca visible en el navegador.
          </p>
          {estadoStrava && (
            <p className={estadoStrava.tipo === 'error' ? 'error-text login-msg' : 'loading-text login-msg'}>
              {estadoStrava.texto}
            </p>
          )}
          <div className="settings-actions">
            <button type="button" className="login-btn" disabled={cargando} onClick={conectarStrava}>
              Conectar con Strava
            </button>
            <button type="button" className="login-btn login-btn-secondary" disabled={cargando} onClick={sincronizarStrava}>
              Sincronizar ahora
            </button>
          </div>
        </section>

        <section className="settings-section">
          <h3 className="settings-section-title">intervals.icu</h3>
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

            {estadoIntervals && (
              <p className={estadoIntervals.tipo === 'error' ? 'error-text login-msg' : 'loading-text login-msg'}>
                {estadoIntervals.texto}
              </p>
            )}

            <div className="settings-actions">
              <button type="submit" className="login-btn" disabled={cargando}>
                Guardar credencial
              </button>
              <button type="button" className="login-btn login-btn-secondary" disabled={cargando} onClick={sincronizarIntervals}>
                Sincronizar ahora
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}
