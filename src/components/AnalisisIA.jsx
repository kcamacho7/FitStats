import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Spinner from './Spinner'

const FUNCTIONS_URL = 'https://ztawdtaymbrocphzenuo.supabase.co/functions/v1'
const COOLDOWN_DIAS = 7

function formatearFecha(fechaISO) {
  return new Date(fechaISO + 'T00:00:00').toLocaleDateString('es-CR', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function AnalisisIA({ data, onCambio }) {
  const [generando, setGenerando] = useState(false)
  const [error, setError] = useState(null)
  const analisis = data.analisis_ia || []
  const ultimo = analisis[0] ?? null
  const anteriores = analisis.slice(1)

  const proximoDisponible = ultimo ? new Date(ultimo.created_at) : null
  if (proximoDisponible) proximoDisponible.setDate(proximoDisponible.getDate() + COOLDOWN_DIAS)
  const enCooldown = proximoDisponible ? proximoDisponible.getTime() > Date.now() : false

  const generar = async () => {
    setGenerando(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const resp = await fetch(`${FUNCTIONS_URL}/generar-analisis-ia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({}),
      })
      const json = await resp.json()
      if (!resp.ok) throw new Error(json.error || 'Error desconocido')
      onCambio?.()
    } catch (err) {
      setError(err.message || 'No se pudo generar el análisis')
    } finally {
      setGenerando(false)
    }
  }

  return (
    <section className="section">
      <h2>Análisis de Claude</h2>
      <p className="section-sub">
        Generado por IA a partir de tus datos reales de entrenamiento. No reemplaza a tu entrenador — es una lectura
        objetiva para contrastar con él, no una instrucción de entrenamiento.
      </p>

      {ultimo ? (
        <div className="chart-card">
          <h3>
            {formatearFecha(ultimo.periodo_desde)} a {formatearFecha(ultimo.periodo_hasta)}
          </h3>
          <p className="chart-sub">Generado el {formatearFecha(ultimo.created_at.slice(0, 10))}</p>
          <p style={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>{ultimo.contenido}</p>
        </div>
      ) : (
        <p className="section-sub">Todavía no generaste ningún análisis.</p>
      )}

      {error && <p className="error-text login-msg">{error}</p>}

      <div className="settings-actions" style={{ marginTop: 16 }}>
        <button type="button" className="login-btn" disabled={generando || enCooldown} onClick={generar}>
          {generando && <Spinner />}
          Generar nuevo análisis
        </button>
        {enCooldown && (
          <span className="chart-sub" style={{ alignSelf: 'center' }}>
            Disponible el {formatearFecha(proximoDisponible.toISOString().slice(0, 10))}
          </span>
        )}
      </div>

      {anteriores.length > 0 && (
        <details style={{ marginTop: 16 }}>
          <summary className="chart-sub" style={{ cursor: 'pointer' }}>
            Ver análisis anteriores ({anteriores.length})
          </summary>
          {anteriores.map((a) => (
            <div key={a.id} className="chart-card" style={{ marginTop: 12 }}>
              <h3>
                {formatearFecha(a.periodo_desde)} a {formatearFecha(a.periodo_hasta)}
              </h3>
              <p style={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>{a.contenido}</p>
            </div>
          ))}
        </details>
      )}
    </section>
  )
}
