import { useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Spinner from './Spinner'

const FUNCTIONS_URL = 'https://ztawdtaymbrocphzenuo.supabase.co/functions/v1'
const MAX_LADO = 1280

function estadoDe(row) {
  if (!row.ejecutado) return { label: 'Sin registro', cls: 'estado-critical' }
  if (row.pct_tiempo_ejecutado == null) return { label: 'Ejecutado', cls: 'estado-good' }
  if (row.pct_tiempo_ejecutado >= 90) return { label: 'Cumplido', cls: 'estado-good' }
  if (row.pct_tiempo_ejecutado >= 70) return { label: 'Parcial', cls: 'estado-warning' }
  return { label: 'Muy parcial', cls: 'estado-serious' }
}

function comprimirImagen(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const escala = Math.min(1, MAX_LADO / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * escala)
      canvas.height = Math.round(img.height * escala)
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.82)
      resolve(dataUrl.split(',')[1])
    }
    img.onerror = reject
    img.src = url
  })
}

export default function PlanVsActual({ data, onCambio }) {
  const inputRef = useRef(null)
  const [procesando, setProcesando] = useState(false)
  const [estado, setEstado] = useState(null)

  const rows = [...data.plan_vs_actual].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  const fechas = rows.map((r) => r.fecha).filter(Boolean)
  const desde = fechas.length > 0 ? fechas[fechas.length - 1] : null
  const hasta = fechas.length > 0 ? fechas[0] : null

  const subirCaptura = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setProcesando(true)
    setEstado(null)
    try {
      const imagenBase64 = await comprimirImagen(file)
      const { data: { session } } = await supabase.auth.getSession()
      const resp = await fetch(`${FUNCTIONS_URL}/procesar-plan-captura`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ imagen_base64: imagenBase64, mime_type: 'image/jpeg' }),
      })
      const json = await resp.json()
      if (!resp.ok) throw new Error(json.error || 'Error desconocido')
      setEstado({
        tipo: 'ok',
        texto: json.mensaje || `Se detectaron ${json.sesiones} sesión(es), ${json.guardadas} guardada(s).`,
      })
      onCambio?.()
    } catch (err) {
      setEstado({ tipo: 'error', texto: err.message || 'No se pudo procesar la imagen' })
    } finally {
      setProcesando(false)
    }
  }

  return (
    <section className="section">
      <h2>Plan vs. ejecutado</h2>
      <p className="section-sub">
        {desde && hasta ? `${desde} a ${hasta}. ` : ''}TSS planificado y Relative Effort real no son la misma
        métrica/escala — la comparación de tiempo es la más confiable.
      </p>

      <div className="settings-actions" style={{ marginBottom: 16 }}>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={subirCaptura}
          style={{ display: 'none' }}
        />
        <button
          type="button"
          className="login-btn login-btn-secondary"
          disabled={procesando}
          onClick={() => inputRef.current?.click()}
        >
          {procesando && <Spinner />}
          Subir captura del plan
        </button>
      </div>
      {estado && (
        <p className={estado.tipo === 'error' ? 'error-text login-msg' : 'loading-text login-msg'}>{estado.texto}</p>
      )}

      {rows.length > 0 && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Sesión planificada</th>
                <th className="num">Plan (min)</th>
                <th className="num">Real (min)</th>
                <th className="num">% cumplido</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const estadoFila = estadoDe(r)
                return (
                  <tr key={r.fecha}>
                    <td>{r.fecha}</td>
                    <td>{r.workout_name || '—'}</td>
                    <td className="num">{r.planned_time_min ?? '—'}</td>
                    <td className="num">{r.actual_time_min ? Math.round(r.actual_time_min) : '—'}</td>
                    <td className="num">{r.pct_tiempo_ejecutado ? `${r.pct_tiempo_ejecutado}%` : '—'}</td>
                    <td>
                      <span className={`estado-badge ${estadoFila.cls}`}>{estadoFila.label}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
