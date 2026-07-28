import { nombreDeporte } from '../lib/deportes'

export default function FiltroDeporte({ deportesDisponibles, seleccionados, onCambiar }) {
  if (deportesDisponibles.length <= 1) return null

  const toggle = (deporte) => {
    if (seleccionados.includes(deporte)) {
      onCambiar(seleccionados.filter((d) => d !== deporte))
    } else {
      onCambiar([...seleccionados, deporte])
    }
  }

  const todos = seleccionados.length === 0

  return (
    <div className="filtro-deporte">
      <span className="filtro-deporte-label">Filtrar por deporte:</span>
      <div className="filtro-deporte-chips">
        <button
          type="button"
          className={`filtro-deporte-chip ${todos ? 'is-activo' : ''}`}
          onClick={() => onCambiar([])}
        >
          Todos
        </button>
        {deportesDisponibles.map((deporte) => (
          <button
            key={deporte}
            type="button"
            className={`filtro-deporte-chip ${seleccionados.includes(deporte) ? 'is-activo' : ''}`}
            onClick={() => toggle(deporte)}
          >
            {nombreDeporte(deporte)}
          </button>
        ))}
      </div>
    </div>
  )
}
