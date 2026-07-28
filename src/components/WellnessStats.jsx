function interpretarForma(form) {
  if (form > 5) return { texto: 'Fresco / con margen de carga', cls: 'estado-good' }
  if (form >= -10) return { texto: 'Equilibrado', cls: 'estado-warning' }
  return { texto: 'Fatiga acumulada alta', cls: 'estado-serious' }
}

export default function WellnessStats({ data }) {
  const rows = data.wellness_diario
  const ultimo = rows[rows.length - 1]
  const forma = interpretarForma(ultimo.form)

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
    </div>
  )
}
