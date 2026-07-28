import data from '../data/timeline.json'

export default function RaceCards() {
  return (
    <section className="section">
      <h2>Líneas base de competencias</h2>
      <p className="section-sub">
        FTP real vigente en cada carrera de 2025: <strong>229 W</strong> (no 260 W — ese valor estaba fijado
        manualmente para presionar entrenamientos, nunca fue el FTP real). Estas son las referencias contra las
        que comparar las ediciones 2026.
      </p>
      <div className="race-grid">
        {data.carreras.map((c) => (
          <article key={c.carrera} className="race-card">
            <header>
              <h3>{c.carrera}</h3>
              <span className="race-badge">Próxima: {c.proxima_edicion}</span>
            </header>
            <div className="race-stats">
              <div>
                <span className="race-stat-label">Edición 2025</span>
                <span className="race-stat-value">{c.fecha_2025}</span>
              </div>
              <div>
                <span className="race-stat-label">Distancia</span>
                <span className="race-stat-value">{c.distancia_km} km</span>
              </div>
              <div>
                <span className="race-stat-label">Tiempo</span>
                <span className="race-stat-value">{Math.round(c.tiempo_min / 60 * 10) / 10} h</span>
              </div>
              <div>
                <span className="race-stat-label">FC promedio</span>
                <span className="race-stat-value">{c.fc_prom} <span className="unit">bpm</span></span>
              </div>
              <div>
                <span className="race-stat-label">Potencia promedio</span>
                <span className="race-stat-value">{c.potencia_prom_w} <span className="unit">W</span></span>
              </div>
              <div>
                <span className="race-stat-label">% FTP real</span>
                <span className="race-stat-value race-stat-accent">{c.pct_ftp_prom}%</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
