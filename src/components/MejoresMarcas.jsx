import { indicadorSecundario, nombreDeporte } from '../lib/deportes'

export default function MejoresMarcas({ data }) {
  const fondos = data.top_fondos
  const deportes = [...new Set(fondos.map((f) => f.deporte))].sort()
  const multiDeporte = deportes.length > 1

  return (
    <section className="section">
      <h2>Mejores marcas</h2>
      <p className="section-sub">
        Top {multiDeporte ? '8' : fondos.length} por distancia, en los {data.mesesConDatos} mes
        {data.mesesConDatos === 1 ? '' : 'es'} de datos disponibles{multiDeporte ? ', por tipo de actividad' : ''}.
      </p>
      {(multiDeporte ? deportes : [null]).map((deporte) => {
        const grupo = deporte ? fondos.filter((f) => f.deporte === deporte) : fondos
        return (
          <div key={deporte || 'todos'} style={{ marginTop: multiDeporte ? 20 : 0 }}>
            {multiDeporte && <h3>{nombreDeporte(deporte)}</h3>}
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Actividad</th>
                    <th className="num">Distancia</th>
                    <th className="num">Tiempo</th>
                    <th className="num">Ritmo/Velocidad</th>
                    <th className="num">Relative Effort</th>
                  </tr>
                </thead>
                <tbody>
                  {grupo.map((f) => {
                    const ind = indicadorSecundario(f.deporte, {
                      distancia_km: f.distance_km,
                      moving_time_min: f.moving_time_min,
                    })
                    return (
                      <tr key={f.start_local + f.name}>
                        <td>{f.start_local}</td>
                        <td className="wrap">{f.name}</td>
                        <td className="num">{f.distance_km} km</td>
                        <td className="num">{Math.round((f.moving_time_min / 60) * 10) / 10} h</td>
                        <td className="num">{ind ? ind.value : '—'}</td>
                        <td className="num">{f.relative_effort}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
    </section>
  )
}
