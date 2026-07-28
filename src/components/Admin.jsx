import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Spinner from './Spinner'

const FUNCTIONS_URL = 'https://ztawdtaymbrocphzenuo.supabase.co/functions/v1'

export default function Admin({ onClose }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    let cancelado = false
    const cargar = async () => {
      setCargando(true)
      setError(null)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const resp = await fetch(`${FUNCTIONS_URL}/admin-stats`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({}),
        })
        const json = await resp.json()
        if (!resp.ok) throw new Error(json.error || 'Error desconocido')
        if (!cancelado) setData(json)
      } catch (err) {
        if (!cancelado) setError(err.message || 'No se pudo cargar la información')
      } finally {
        if (!cancelado) setCargando(false)
      }
    }
    cargar()
    return () => {
      cancelado = true
    }
  }, [])

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-card" style={{ maxWidth: 720 }} onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Administración</h2>
          <button type="button" className="settings-close" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        {cargando && (
          <p className="loading-text" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Spinner /> Cargando…
          </p>
        )}

        {error && <p className="error-text">{error}</p>}

        {data && (
          <>
            <div className="wellness-stats" style={{ marginBottom: 20 }}>
              <div className="stat-tile">
                <span className="stat-label">Usuarios</span>
                <span className="stat-value">{data.resumen.total_usuarios}</span>
              </div>
              <div className="stat-tile">
                <span className="stat-label">Logins hoy</span>
                <span className="stat-value">{data.resumen.logins_hoy}</span>
              </div>
              <div className="stat-tile">
                <span className="stat-label">Llamadas Strava hoy</span>
                <span className="stat-value">{data.resumen.llamadas_strava_hoy}</span>
              </div>
              <div className="stat-tile">
                <span className="stat-label">Llamadas Strava este mes</span>
                <span className="stat-value">{data.resumen.llamadas_strava_mes}</span>
              </div>
            </div>

            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Servicios</th>
                    <th>Creado</th>
                    <th>Último ingreso</th>
                    <th className="num">Logins</th>
                    <th className="num">Llamadas Strava</th>
                  </tr>
                </thead>
                <tbody>
                  {data.usuarios.map((u) => (
                    <tr key={u.id}>
                      <td>{u.nombre || u.email}</td>
                      <td>{u.servicios_conectados.length > 0 ? u.servicios_conectados.join(', ') : '—'}</td>
                      <td>{u.creado ? new Date(u.creado).toLocaleDateString('es-CR') : '—'}</td>
                      <td>{u.ultimo_login ? new Date(u.ultimo_login).toLocaleDateString('es-CR') : '—'}</td>
                      <td className="num">{u.logins}</td>
                      <td className="num">{u.llamadas_strava}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="chart-sub" style={{ marginTop: 12 }}>
              El límite de Strava (aprox. 100 solicitudes/15 min y 1000/día, por app, no por usuario) no es consultable
              en vivo desde la API — este conteo es un registro propio para tenerlo mapeado, no el valor oficial de
              Strava. Verificá el límite real en developers.strava.com si te acercás a estos números.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
