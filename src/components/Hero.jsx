import { Line, LineChart, ResponsiveContainer, Tooltip, YAxis } from 'recharts'

function MiniTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-title">{label}</div>
      <div className="chart-tooltip-row">
        <span className="chart-tooltip-swatch" style={{ background: 'var(--series-1)' }} />
        <span>Fitness (CTL)</span>
        <strong>{payload[0].value}</strong>
      </div>
    </div>
  )
}

function diasHasta(fechaISO) {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const objetivo = new Date(fechaISO + 'T00:00:00')
  return Math.ceil((objetivo - hoy) / (1000 * 60 * 60 * 24))
}

export default function Hero({ data }) {
  const { perfil } = data
  const proximo = [...data.carreras]
    .filter((c) => diasHasta(c.proxima_edicion) >= 0)
    .sort((a, b) => new Date(a.proxima_edicion) - new Date(b.proxima_edicion))[0]

  const tieneFtp = perfil.ftp_actual_w != null
  const tieneWkg = perfil.wkg_actual != null

  const eftpReciente = !tieneFtp
    ? [...data.wellness_diario].filter((w) => w.eftp_w != null).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0]
    : null

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
            {perfil.ftp_anterior_w != null && (
              <span className={`stat-delta ${perfil.ftp_actual_w >= perfil.ftp_anterior_w ? 'stat-delta-up' : ''}`}>
                {perfil.ftp_actual_w >= perfil.ftp_anterior_w ? '+' : ''}
                {perfil.ftp_actual_w - perfil.ftp_anterior_w} W vs. test anterior ({perfil.ftp_anterior_w}W ·{' '}
                {perfil.ftp_anterior_fecha})
              </span>
            )}
          </div>
        )}
        {eftpReciente && (
          <div className="stat-tile">
            <span className="stat-label">FTP estimado</span>
            <span className="stat-value">
              {eftpReciente.eftp_w}<span className="stat-unit">W</span>
            </span>
            <span className="stat-delta">
              eFTP de intervals.icu ({eftpReciente.fecha}), no una prueba real — cargá tu FTP en Configuración si
              tenés uno.
            </span>
          </div>
        )}
        {tieneWkg && (
          <div className="stat-tile">
            <span className="stat-label">Relación potencia/peso</span>
            <span className="stat-value">
              {perfil.wkg_actual}<span className="stat-unit">W/kg</span>
            </span>
            <span className="stat-delta">
              {perfil.peso_kg} kg{perfil.peso_bici_kg ? ` · ${perfil.peso_bici_kg} kg bici` : ''}
            </span>
          </div>
        )}
        {proximo && (
          <div className="stat-tile">
            <span className="stat-label">Próximo objetivo</span>
            <span className="stat-value stat-value-sm">{proximo.carrera}</span>
            <span className="stat-delta">
              {diasHasta(proximo.proxima_edicion)} días · {proximo.proxima_edicion}
            </span>
            {ctlReciente.length > 1 && (
              <div className="hero-goal-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ctlReciente} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                    <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                    <Tooltip content={<MiniTooltip />} cursor={{ stroke: 'var(--baseline)' }} />
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
