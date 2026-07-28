import { useRef, useState } from 'react'

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

  const trackRef = useRef(null)
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: false })
  const [isDragging, setIsDragging] = useState(false)

  const onPointerDown = (e) => {
    const track = trackRef.current
    if (!track) return
    drag.current = {
      active: true,
      startX: e.clientX,
      startScroll: track.scrollLeft,
      moved: false,
    }
    setIsDragging(true)
    track.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e) => {
    if (!drag.current.active || !trackRef.current) return
    const delta = e.clientX - drag.current.startX
    if (Math.abs(delta) > 3) drag.current.moved = true
    trackRef.current.scrollLeft = drag.current.startScroll - delta
  }

  const endDrag = () => {
    drag.current.active = false
    setIsDragging(false)
  }

  // Evita que un drag se interprete como click en un hito (no hay links por ahora, pero deja la puerta abierta).
  const onClickCapture = (e) => {
    if (drag.current.moved) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  return (
    <section className="section">
      <h2>Línea de tiempo</h2>
      <p className="section-sub">
        Hitos reales extraídos del histórico de Strava, FTP y calendario de competencias. Arrastrá con el mouse para desplazarte.
      </p>
      <div
        ref={trackRef}
        className={`timeline-h-track${isDragging ? ' is-dragging' : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={onClickCapture}
      >
        <div className="timeline-h-line" />
        <ol className="timeline-h">
          {hitos.map((h) => {
            const esFutura = new Date(h.fecha) > hoy
            return (
              <li key={h.fecha + h.titulo} className={`timeline-h-item tipo-${h.tipo}${esFutura ? ' es-futuro' : ''}`}>
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
