import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { deportesDistintos, filtrarPorDeporte, nombreDeporte } from '../lib/deportes'

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-title">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="chart-tooltip-row">
          <span className="chart-tooltip-swatch" style={{ background: p.fill }} />
          <span>{p.name}</span>
          <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  )
}

export default function VolumenPorDeporte({ data }) {
  const deportes = deportesDistintos(data.volumen_mensual)
  if (deportes.length <= 1) return null

  return (
    <div className="chart-grid" style={{ marginTop: 20 }}>
      {deportes.map((deporte) => (
        <div key={deporte} className="chart-card">
          <h3>{nombreDeporte(deporte)}</h3>
          <p className="chart-sub">Horas por mes, solo actividades de este tipo.</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={filtrarPorDeporte(data.volumen_mensual, deporte)} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--gridline)" vertical={false} />
              <XAxis
                dataKey="mes"
                tick={{ fill: 'var(--muted)', fontSize: 11 }}
                axisLine={{ stroke: 'var(--baseline)' }}
                tickLine={false}
                interval={1}
              />
              <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="horas" name="Horas" fill="var(--series-1)" radius={[4, 4, 0, 0]} maxBarSize={22} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  )
}
