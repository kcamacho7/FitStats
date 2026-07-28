import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Spinner from './Spinner'

export default function CompletarPerfil({ user, nombreSugeridoInicial, onListo }) {
  const [nombre, setNombre] = useState(nombreSugeridoInicial || '')
  const [error, setError] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setGuardando(true)
    try {
      const { error } = await supabase.from('perfil').insert({ user_id: user.id, nombre })
      if (error) throw error
      onListo?.()
    } catch (err) {
      setError(err.message || 'No se pudo guardar el perfil')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="app-shell-center onboarding">
      <div className="login-card">
        <h1 className="login-title">¡Bienvenido!</h1>
        <p className="login-sub">Contanos tu nombre para armar tu dashboard. Los objetivos los agregás cuando quieras, más adelante.</p>

        <form onSubmit={onSubmit} className="login-form">
          <label className="login-label">
            Nombre
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="login-input"
              placeholder="Tu nombre"
            />
          </label>

          {error && <p className="error-text login-msg">{error}</p>}

          <button type="submit" className="login-btn" disabled={guardando}>
            {guardando && <Spinner />}
            Continuar
          </button>
        </form>
      </div>
    </div>
  )
}
