import { useEffect, useRef } from 'react'

const TIPO_LABEL = {
  inicio_datos: 'Datos',
  ftp: 'FTP',
  carrera: 'Carrera',
  proxima_carrera: 'Próxima carrera',
  volumen_bajo: 'Volumen',
  volumen_alto: 'Volumen',
}

const formatMesAno = (fechaISO) => {
  const texto = new Date(fechaISO).toLocaleDateString('es-CR', { month: 'short', year: 'numeric' })
  return texto.charAt(0).toUpperCase() + texto.slice(1).replace('.', '')
}

// Zona muerta central: quieta si el mouse está cerca del medio, para no scrollear por accidente
// al solo pasar por encima de una tarjeta del centro.
const ZONA_MUERTA = 0.12

export default function Timeline({ data }) {
  const hitos = [...data.hitos].sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
  const hoy = new Date('2026-07-27')

  const trackRef = useRef(null)
  const targetRatio = useRef(null) // -1..1, null = sin movimiento
  const rafId = useRef(null)

  const tick = () => {
    const track = trackRef.current
    if (track && targetRatio.current !== null) {
      const maxScroll = track.scrollWidth - track.clientWidth
      const velocidadMax = 14 // px por frame en el borde
      track.scrollLeft += targetRatio.current * velocidadMax
      if (track.scrollLeft < 0) track.scrollLeft = 0
      if (track.scrollLeft > maxScroll) track.scrollLeft = maxScroll
    }
    rafId.current = requestAnimationFrame(tick)
  }

  useEffect(() => {
    rafId.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId.current)
  }, [])

  const onMouseMove = (e) => {
    const track = trackRef.current
    if (!track) return
    const rect = track.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width // 0..1
    const centrado = (x - 0.5) * 2 // -1..1
    if (Math.abs(centrado) < ZONA_MUERTA) {
      targetRatio.current = null
      return
    }
    // Reescala para que justo después de la zona muerta ya empiece a moverse notoriamente
    const signo = Math.sign(centrado)
    const magnitud = (Math.abs(centrado) - ZONA_MUERTA) / (1 - ZONA_MUERTA)
    targetRatio.current = signo * magnitud
  }

  const onMouseLeave = () => {
    targetRatio.current = null
  }

  return (
    <section className="section">
      <h2>Línea de tiempo</h2>
      <p className="section-sub">
        Hitos reales extraídos del histórico de Strava, FTP y calendario de competencias. Movés el mouse hacia los bordes para desplazarte.
      </p>
      <div
        ref={trackRef}
        className="timeline-h-track"
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      >
        <div className="timeline-h-line" />
        <ol className="timeline-h">
          {hitos.map((h) => {
            const esFutura = new Date(h.fecha) > hoy
            return (
              <li key={h.fecha + h.titulo} className={`timeline-h-item tipo-${h.tipo}${esFutura ? ' es-futuro' : ''}`}>
                <div className="timeline-h-mesano">{formatMesAno(h.fecha)}</div>
                <div className="timeline-h-marker" />
                <div className="timeline-h-card">
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
      </div>
    </section>
  )
}
