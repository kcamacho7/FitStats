import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Spinner from './Spinner'

const FUNCTIONS_URL = 'https://ztawdtaymbrocphzenuo.supabase.co/functions/v1'

function StravaIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <polygon fill="#FC4C02" points="7.5,0.8 2.2,10.6 5.5,10.6 7.5,6.9 9.5,10.6 12.8,10.6" />
      <polygon fill="#FC4C02" points="10.6,10.6 9.2,13.2 7.9,10.6 5.1,10.6 9.2,17.8 13.4,10.6" />
    </svg>
  )
}

function IntervalsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <circle cx="9" cy="9" r="8" fill="none" stroke="var(--series-1)" strokeWidth="1.6" />
      <polyline
        points="3.5,9.5 6,9.5 7.2,6 9.5,12.5 10.8,9.5 14.5,9.5"
        fill="none"
        stroke="var(--series-1)"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Settings({ onClose, onSynced, avisoInicial }) {
  const [apiKey, setApiKey] = useState('')
  const [athleteId, setAthleteId] = useState('')
  const [estadoIntervals, setEstadoIntervals] = useState(null)
  const [estadoStrava, setEstadoStrava] = useState(avisoInicial ?? null)
  const [guardando, setGuardando] = useState(false)
  const [sincronizandoIntervals, setSincronizandoIntervals] = useState(false)
  const [conectandoStrava, setConectandoStrava] = useState(false)
  const [sincronizandoStrava, setSincronizandoStrava] = useState(false)

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
    setGuardando(true)
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
      setGuardando(false)
    }
  }

  const sincronizarIntervals = async () => {
    setSincronizandoIntervals(true)
    setEstadoIntervals(null)
    try {
      const data = await llamarFuncion('sincronizar-intervals')
      setEstadoIntervals({ tipo: 'ok', texto: data.mensaje || `Sincronizado: ${data.filas} fila(s) nueva(s).` })
      onSynced?.()
    } catch (err) {
      setEstadoIntervals({ tipo: 'error', texto: err.message })
    } finally {
      setSincronizandoIntervals(false)
    }
  }

  const conectarStrava = async () => {
    setConectandoStrava(true)
    setEstadoStrava(null)
    try {
      const data = await llamarFuncion('iniciar-conexion-strava')
      window.location.href = data.url
    } catch (err) {
      setEstadoStrava({ tipo: 'error', texto: err.message })
      setConectandoStrava(false)
    }
  }

  const sincronizarStrava = async () => {
    setSincronizandoStrava(true)
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
      setSincronizandoStrava(false)
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
          <h3 className="settings-section-title">
            <StravaIcon /> Strava
          </h3>
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
            <button
              type="button"
              className="login-btn"
              disabled={conectandoStrava || sincronizandoStrava}
              onClick={conectarStrava}
            >
              {conectandoStrava && <Spinner />}
              Conectar con Strava
            </button>
            <button
              type="button"
              className="login-btn login-btn-secondary"
              disabled={conectandoStrava || sincronizandoStrava}
              onClick={sincronizarStrava}
            >
              {sincronizandoStrava && <Spinner />}
              Sincronizar ahora
            </button>
          </div>
        </section>

        <section className="settings-section">
          <h3 className="settings-section-title">
            <IntervalsIcon /> intervals.icu
          </h3>
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
              <button type="submit" className="login-btn" disabled={guardando || sincronizandoIntervals}>
                {guardando && <Spinner />}
                Guardar credencial
              </button>
              <button
                type="button"
                className="login-btn login-btn-secondary"
                disabled={guardando || sincronizandoIntervals}
                onClick={sincronizarIntervals}
              >
                {sincronizandoIntervals && <Spinner />}
                Sincronizar ahora
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}
