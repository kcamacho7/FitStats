import { useState } from 'react'

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="6.2" r="2.6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3.4 15.2c1-2.6 3.2-4 5.6-4s4.6 1.4 5.6 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

export default function TopbarMenu({ email, isAdmin, onOpenAdmin, onOpenConfig, onSignOut }) {
  const [abierto, setAbierto] = useState(false)

  const cerrarYEjecutar = (fn) => {
    setAbierto(false)
    fn()
  }

  return (
    <div className="topbar-menu">
      <button
        type="button"
        className="topbar-menu-btn"
        onClick={() => setAbierto((a) => !a)}
        aria-expanded={abierto}
        aria-label="Menú de usuario"
      >
        <MenuIcon />
      </button>

      {abierto && (
        <>
          <div className="topbar-menu-catcher" onClick={() => setAbierto(false)} />
          <div className="topbar-menu-panel">
            <div className="topbar-menu-email">{email}</div>
            {isAdmin && (
              <button type="button" className="topbar-menu-item" onClick={() => cerrarYEjecutar(onOpenAdmin)}>
                Administración
              </button>
            )}
            <button type="button" className="topbar-menu-item" onClick={() => cerrarYEjecutar(onOpenConfig)}>
              Configuración
            </button>
            <button
              type="button"
              className="topbar-menu-item topbar-menu-item-danger"
              onClick={() => cerrarYEjecutar(onSignOut)}
            >
              Cerrar sesión
            </button>
          </div>
        </>
      )}
    </div>
  )
}
