import data from '../data/timeline.json'

function diasHasta(fechaISO) {
  const hoy = new Date('2026-07-27')
  const objetivo = new Date(fechaISO)
  const diff = Math.ceil((objetivo - hoy) / (1000 * 60 * 60 * 24))
  return diff
}

export default function Hero() {
  const { perfil } = data
  const proxima = data.carreras.find((c) => diasHasta(c.proxima_edicion) >= 0)

  return (
    <header className="hero">
      <div className="hero-kicker">{perfil.bicicleta.modelo}</div>
      <h1>Evolución de {perfil.nombre.split(' ')[0]}</h1>
      <p className="hero-sub">
        Seguimiento real de rendimiento — datos de Strava desde {data.rango_datos.inicio} hasta{' '}
        {data.rango_datos.fin}.
      </p>

      <div className="stat-row">
        <div className="stat-tile">
          <span className="stat-label">FTP actual</span>
          <span className="stat-value">
            {perfil.ftp_actual_w}<span className="stat-unit">W</span>
          </span>
          <span className="stat-delta stat-delta-up">
            +{perfil.ftp_actual_w - perfil.ftp_2025_w} W vs. 2025 ({perfil.ftp_2025_w}W)
          </span>
        </div>
        <div className="stat-tile">
          <span className="stat-label">Relación potencia/peso</span>
          <span className="stat-value">
            {perfil.wkg_actual}<span className="stat-unit">W/kg</span>
          </span>
          <span className="stat-delta">{perfil.peso_kg} kg · {perfil.bicicleta.peso_kg} kg bici</span>
        </div>
        {proxima && (
          <div className="stat-tile">
            <span className="stat-label">Próximo objetivo</span>
            <span className="stat-value stat-value-sm">{proxima.carrera}</span>
            <span className="stat-delta">
              {diasHasta(proxima.proxima_edicion)} días · {proxima.proxima_edicion}
            </span>
          </div>
        )}
      </div>

      <div className="bici-specs">
        <span>{perfil.bicicleta.cuadro}</span>
        <span className="dot">·</span>
        <span>{perfil.bicicleta.transmision}</span>
        <span className="dot">·</span>
        <span>{perfil.bicicleta.ruedas}</span>
      </div>
    </header>
  )
}
