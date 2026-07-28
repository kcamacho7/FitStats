const TIPO_LABEL = {
  inicio_datos: 'Datos',
  ftp: 'FTP',
  carrera: 'Carrera',
  proxima_carrera: 'Próxima carrera',
  volumen_bajo: 'Volumen',
  volumen_alto: 'Volumen',
}

export default function Timeline({ data }) {
  const hitos = [...data.hitos].sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
  const hoy = new Date('2026-07-27')

  return (
    <section className="section">
      <h2>Línea de tiempo</h2>
      <p className="section-sub">Hitos reales extraídos del histórico de Strava, FTP y calendario de competencias.</p>
      <ol className="timeline">
        {hitos.map((h) => {
          const esFutura = new Date(h.fecha) > hoy
          return (
            <li key={h.fecha + h.titulo} className={`timeline-item tipo-${h.tipo}${esFutura ? ' es-futuro' : ''}`}>
              <div className="timeline-marker" />
              <div className="timeline-body">
                <div className="timeline-meta">
                  <span className="timeline-tag">{TIPO_LABEL[h.tipo] || h.tipo}</span>
                  <span className="timeline-fecha">{h.fecha}</span>
                </div>
                <h3>{h.titulo}</h3>
                <p>{h.detalle}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
