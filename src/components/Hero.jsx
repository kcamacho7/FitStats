import { Line, LineChart, ResponsiveContainer } from 'recharts'

function diasHasta(fechaISO) {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const objetivo = new Date(fechaISO + 'T00:00:00')
  return Math.ceil((objetivo - hoy) / (1000 * 60 * 60 * 24))
}

export default function Hero({ data }) {
  const { perfil } = data
  const proximo = [...data.objetivos]
    .filter((o) => diasHasta(o.fecha) >= 0)
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))[0]

  const tieneFtp = perfil.ftp_actual_w != null
  const tieneWkg = perfil.wkg_actual != null

  const dosMesesAtras = new Date()
  dosMesesAtras.setDate(dosMesesAtras.getDate() - 60)
  const ctlReciente = data.wellness_diario.filter((w) => new Date(w.fecha) >= dosMesesAtras)

  return (
    <header className="hero">
      <h1>Evolución de {perfil.nombre.split(' ')[0]}</h1>
      <p className="hero-sub">
        Seguimiento real de rendimiento — datos desde {data.rango_datos?.inicio ?? '—'} hasta{' '}
        {data.rango_datos?.fin ?? '—'}.
      </p>

      <div className="stat-row">
        {tieneFtp && (
          <div className="stat-tile">
            <span className="stat-label">FTP actual</span>
            <span className="stat-value">
              {perfil.ftp_actual_w}<span className="stat-unit">W</span>
            </span>
            {perfil.ftp_2025_w != null && (
              <span className="stat-delta stat-delta-up">
                +{perfil.ftp_actual_w - perfil.ftp_2025_w} W vs. 2025 ({perfil.ftp_2025_w}W)
              </span>
            )}
          </div>
        )}
        {tieneWkg && (
          <div className="stat-tile">
            <span className="stat-label">Relación potencia/peso</span>
            <span className="stat-value">
              {perfil.wkg_actual}<span className="stat-unit">W/kg</span>
            </span>
            <span className="stat-delta">
              {perfil.peso_kg} kg{perfil.bicicleta?.peso_kg ? ` · ${perfil.bicicleta.peso_kg} kg bici` : ''}
            </span>
          </div>
        )}
        {proximo && (
          <div className="stat-tile">
            <span className="stat-label">Próximo objetivo</span>
            <span className="stat-value stat-value-sm">{proximo.nombre}</span>
            <span className="stat-delta">
              {diasHasta(proximo.fecha)} días · {proximo.fecha}
            </span>
            {ctlReciente.length > 1 && (
              <div className="hero-goal-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ctlReciente}>
                    <Line
                      type="monotone"
                      dataKey="ctl"
                      stroke="var(--series-1)"
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
