export default function TopFondos({ data }) {
  const fondos = data.top_fondos

  return (
    <section className="section">
      <h2>Fondos más largos registrados</h2>
      <p className="section-sub">Top {fondos.length} salidas por distancia, en los 18 meses de datos disponibles.</p>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Actividad</th>
              <th className="num">Distancia</th>
              <th className="num">Tiempo</th>
              <th className="num">Relative Effort</th>
            </tr>
          </thead>
          <tbody>
            {fondos.map((f) => (
              <tr key={f.start_local + f.name}>
                <td>{f.start_local}</td>
                <td>{f.name}</td>
                <td className="num">{f.distance_km} km</td>
                <td className="num">{Math.round(f.moving_time_min / 60 * 10) / 10} h</td>
                <td className="num">{f.relative_effort}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
