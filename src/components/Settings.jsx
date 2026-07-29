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

export default function Settings({ onClose, onSynced, avisoInicial, userId, perfil }) {
  const [apiKey, setApiKey] = useState('')
  const [athleteId, setAthleteId] = useState('')
  const [estadoIntervals, setEstadoIntervals] = useState(null)
  const [estadoStrava, setEstadoStrava] = useState(avisoInicial ?? null)
  const [guardando, setGuardando] = useState(false)
  const [sincronizandoIntervals, setSincronizandoIntervals] = useState(false)
  const [conectandoStrava, setConectandoStrava] = useState(false)
  const [sincronizandoStrava, setSincronizandoStrava] = useState(false)
  const [trayendoHistorico, setTrayendoHistorico] = useState(false)

  const [pesoKg, setPesoKg] = useState(perfil?.peso_kg ?? '')
  const [estaturaCm, setEstaturaCm] = useState(perfil?.estatura_cm ?? '')
  const [pesoBiciKg, setPesoBiciKg] = useState(perfil?.peso_bici_kg ?? '')
  const [ftpNuevoW, setFtpNuevoW] = useState('')
  const [ftpFecha, setFtpFecha] = useState(new Date().toISOString().slice(0, 10))
  const [guardandoFisico, setGuardandoFisico] = useState(false)
  const [estadoFisico, setEstadoFisico] = useState(null)

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
      const rango = data.primeraVez
        ? `Histórico completo (${data.meses.length} mes(es))`
        : data.meses?.[0] || 'Este mes'
      setEstadoStrava({
        tipo: 'ok',
        texto: `${rango}: ${data.salidas} salidas, ${data.km} km, ${data.horas} h. ${data.fondosNuevos ? `${data.fondosNuevos} marca(s) nueva(s) en el top.` : ''}`,
      })
      onSynced?.()
    } catch (err) {
      setEstadoStrava({ tipo: 'error', texto: err.message })
    } finally {
      setSincronizandoStrava(false)
    }
  }

  const traerHistoricoStrava = async () => {
    setTrayendoHistorico(true)
    setEstadoStrava(null)
    try {
      const data = await llamarFuncion('sincronizar-strava', { forzar_historico: true })
      setEstadoStrava({
        tipo: 'ok',
        texto: `Histórico completo (${data.meses.length} mes(es)): ${data.salidas} salidas, ${data.km} km, ${data.horas} h. ${data.fondosNuevos ? `${data.fondosNuevos} marca(s) en el top.` : ''}`,
      })
      onSynced?.()
    } catch (err) {
      setEstadoStrava({ tipo: 'error', texto: err.message })
    } finally {
      setTrayendoHistorico(false)
    }
  }

  const guardarDatosFisicos = async (e) => {
    e.preventDefault()
    setGuardandoFisico(true)
    setEstadoFisico(null)
    try {
      const { error } = await supabase
        .from('perfil')
        .update({
          peso_kg: pesoKg === '' ? null : Number(pesoKg),
          estatura_cm: estaturaCm === '' ? null : Number(estaturaCm),
          peso_bici_kg: pesoBiciKg === '' ? null : Number(pesoBiciKg),
        })
        .eq('user_id', userId)
      if (error) throw error

      // El FTP no vive en el perfil: cada test es una fila del historial (base normalizada).
      if (ftpNuevoW !== '') {
        const { error: ftpError } = await supabase
          .from('ftp_historial')
          .upsert({ user_id: userId, fecha: ftpFecha, ftp_w: Number(ftpNuevoW) }, { onConflict: 'user_id,fecha' })
        if (ftpError) throw ftpError
        setFtpNuevoW('')
      }

      setEstadoFisico({ tipo: 'ok', texto: 'Datos guardados.' })
      onSynced?.()
    } catch (err) {
      setEstadoFisico({ tipo: 'error', texto: err.message })
    } finally {
      setGuardandoFisico(false)
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
          <h3 className="settings-section-title">Datos físicos</h3>
          <p className="section-sub">
            Peso, estatura y FTP real (de una prueba) para calcular tu W/kg y comparar tu potencia contra tu FTP en
            competencias. Si no cargás un FTP acá, en el Hero se muestra el eFTP estimado por intervals.icu (si tu
            cuenta lo tiene) como referencia, aclarando que es un estimado y no una prueba real.
          </p>
          <form onSubmit={guardarDatosFisicos} className="login-form">
            <label className="login-label">
              Peso (kg)
              <input
                type="number"
                step="0.1"
                min="0"
                value={pesoKg}
                onChange={(e) => setPesoKg(e.target.value)}
                className="login-input"
              />
            </label>
            <label className="login-label">
              Estatura (cm)
              <input
                type="number"
                step="1"
                min="0"
                value={estaturaCm}
                onChange={(e) => setEstaturaCm(e.target.value)}
                className="login-input"
              />
            </label>
            <label className="login-label">
              Peso de la bici (kg) — opcional
              <input
                type="number"
                step="0.1"
                min="0"
                value={pesoBiciKg}
                onChange={(e) => setPesoBiciKg(e.target.value)}
                className="login-input"
              />
            </label>
            <label className="login-label">
              Registrar nuevo test de FTP (W) — de una prueba real, no un estimado
              {perfil?.ftp_actual_w != null && (
                <span className="chart-sub">
                  Último registrado: {perfil.ftp_actual_w} W ({perfil.ftp_actual_fecha})
                </span>
              )}
              <input
                type="number"
                step="1"
                min="0"
                value={ftpNuevoW}
                onChange={(e) => setFtpNuevoW(e.target.value)}
                className="login-input"
                placeholder="Dejalo vacío si no hay test nuevo"
              />
            </label>
            {ftpNuevoW !== '' && (
              <label className="login-label">
                Fecha del test
                <input
                  type="date"
                  value={ftpFecha}
                  onChange={(e) => setFtpFecha(e.target.value)}
                  className="login-input"
                />
              </label>
            )}

            {estadoFisico && (
              <p className={estadoFisico.tipo === 'error' ? 'error-text login-msg' : 'loading-text login-msg'}>
                {estadoFisico.texto}
              </p>
            )}

            <button type="submit" className="login-btn" disabled={guardandoFisico} style={{ alignSelf: 'flex-start' }}>
              {guardandoFisico && <Spinner />}
              Guardar
            </button>
          </form>
        </section>

        <section className="settings-section">
          <h3 className="settings-section-title">
            <StravaIcon /> Strava
          </h3>
          <p className="section-sub">
            Conectá tu cuenta de Strava para traer volumen mensual y tus mejores marcas por deporte. El token queda cifrado,
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
              disabled={conectandoStrava || sincronizandoStrava || trayendoHistorico}
              onClick={sincronizarStrava}
            >
              {sincronizandoStrava && <Spinner />}
              Sincronizar ahora
            </button>
            <button
              type="button"
              className="login-btn login-btn-secondary"
              disabled={conectandoStrava || sincronizandoStrava || trayendoHistorico}
              onClick={traerHistoricoStrava}
            >
              {trayendoHistorico && <Spinner />}
              Traer historial completo
            </button>
          </div>
          <p className="chart-sub" style={{ marginTop: 8 }}>
            Usá "Traer historial completo" si notás que faltan meses o salidas viejas — vuelve a traer todo desde
            Strava sin duplicar nada.
          </p>
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
