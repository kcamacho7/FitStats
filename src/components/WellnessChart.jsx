import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-title">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="chart-tooltip-row">
          <span className="chart-tooltip-swatch" style={{ background: p.stroke }} />
          <span>{p.name}</span>
          <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  )
}

export default function WellnessChart({ data }) {
  const rows = data.wellness_diario

  return (
    <div className="chart-card chart-card-wide">
      <h3>Fitness (CTL), Fatiga (ATL) y Forma</h3>
      <p className="chart-sub">
        Datos desde {rows[0]?.fecha} (fecha de activación de la cuenta). Forma = CTL − ATL, comparte
        la misma escala de carga que las otras dos, por eso las tres van en un solo eje.
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={rows} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--gridline)" vertical={false} />
          <XAxis
            dataKey="fecha"
            tick={{ fill: 'var(--muted)', fontSize: 11 }}
            axisLine={{ stroke: 'var(--baseline)' }}
            tickLine={false}
            interval={20}
          />
          <YAxis
            tick={{ fill: 'var(--muted)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={30}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--baseline)' }} />
          <Legend
            wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }}
            formatter={(value) => <span style={{ color: 'var(--text-secondary)' }}>{value}</span>}
          />
          <ReferenceLine y={0} stroke="var(--baseline)" strokeDasharray="4 4" />
          <Line type="monotone" dataKey="ctl" name="Fitness (CTL)" stroke="var(--series-1)" strokeWidth={2} dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="atl" name="Fatiga (ATL)" stroke="var(--series-2)" strokeWidth={2} dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="form" name="Forma (CTL − ATL)" stroke="var(--series-3)" strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
