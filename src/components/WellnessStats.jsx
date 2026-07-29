function interpretarForma(form) {
  if (form > 5) return { texto: 'Fresco / con margen de carga', cls: 'estado-good' }
  if (form >= -10) return { texto: 'Equilibrado', cls: 'estado-warning' }
  return { texto: 'Fatiga acumulada alta', cls: 'estado-serious' }
}

function masRecienteConCampo(rows, campo) {
  for (let i = rows.length - 1; i >= 0; i--) {
    if (rows[i][campo] != null) return rows[i]
  }
  return null
}

export default function WellnessStats({ data }) {
  const rows = data.wellness_diario
  const ultimo = rows[rows.length - 1]
  const forma = interpretarForma(ultimo.form)

  const sueno = masRecienteConCampo(rows, 'sleep_hours')
  const fcReposo = masRecienteConCampo(rows, 'resting_hr')
  const hrv = masRecienteConCampo(rows, 'hrv')

  return (
    <div className="wellness-stats">
      <div className="stat-tile">
        <span className="stat-label">Fitness (CTL)</span>
        <span className="stat-value">{ultimo.ctl}</span>
        <span className="stat-delta">al {ultimo.fecha}</span>
      </div>
      <div className="stat-tile">
        <span className="stat-label">Fatiga (ATL)</span>
        <span className="stat-value">{ultimo.atl}</span>
        <span className="stat-delta">al {ultimo.fecha}</span>
      </div>
      <div className="stat-tile">
        <span className="stat-label">Forma (CTL − ATL)</span>
        <span className="stat-value">{ultimo.form}</span>
        <span className={`estado-badge ${forma.cls}`}>{forma.texto}</span>
      </div>
      {ultimo.eftp_w != null && (
        <div className="stat-tile">
          <span className="stat-label">eFTP estimado</span>
          <span className="stat-value">
            {ultimo.eftp_w}<span className="stat-unit">W</span>
          </span>
          <span className="stat-delta">Estimado por curva de potencia — distinto de un test real, no lo reemplaza</span>
        </div>
      )}
      {sueno && (
        <div className="stat-tile">
          <span className="stat-label">Sueño</span>
          <span className="stat-value">
            {sueno.sleep_hours}<span className="stat-unit">h</span>
          </span>
          <span className="stat-delta">
            {sueno.sleep_score != null ? `Calidad ${sueno.sleep_score}/100 · ` : ''}al {sueno.fecha}
          </span>
        </div>
      )}
      {fcReposo && (
        <div className="stat-tile">
          <span className="stat-label">FC en reposo</span>
          <span className="stat-value">
            {fcReposo.resting_hr}<span className="stat-unit">bpm</span>
          </span>
          <span className="stat-delta">al {fcReposo.fecha}</span>
        </div>
      )}
      {hrv && (
        <div className="stat-tile">
          <span className="stat-label">HRV</span>
          <span className="stat-value">{hrv.hrv}</span>
          <span className="stat-delta">al {hrv.fecha}</span>
        </div>
      )}
    </div>
  )
}
