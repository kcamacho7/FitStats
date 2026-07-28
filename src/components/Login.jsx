import { useState } from 'react'

export default function Login({ onSignIn, onSignUp }) {
  const [modo, setModo] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mensaje, setMensaje] = useState(null)
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setMensaje(null)
    setCargando(true)
    try {
      if (modo === 'signin') {
        const { error } = await onSignIn(email, password)
        if (error) throw error
      } else {
        const { error } = await onSignUp(email, password)
        if (error) throw error
        setMensaje('Cuenta creada. Revisá tu correo si hace falta confirmarla, o iniciá sesión directo.')
      }
    } catch (err) {
      setError(err.message || 'Ocurrió un error')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="app-shell app-shell-center">
      <div className="login-card">
        <div className="hero-kicker">FITSTATS</div>
        <h1 className="login-title">{modo === 'signin' ? 'Iniciar sesión' : 'Crear cuenta'}</h1>
        <p className="login-sub">Tu evolución como ciclista, en un solo lugar.</p>

        <form onSubmit={onSubmit} className="login-form">
          <label className="login-label">
            Correo
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              autoComplete="email"
            />
          </label>
          <label className="login-label">
            Contraseña
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              autoComplete={modo === 'signin' ? 'current-password' : 'new-password'}
            />
          </label>

          {error && <p className="error-text login-msg">{error}</p>}
          {mensaje && <p className="loading-text login-msg">{mensaje}</p>}

          <button type="submit" className="login-btn" disabled={cargando}>
            {cargando ? 'Un momento…' : modo === 'signin' ? 'Entrar' : 'Crear cuenta'}
          </button>
        </form>

        <button
          type="button"
          className="login-switch"
          onClick={() => {
            setModo(modo === 'signin' ? 'signup' : 'signin')
            setError(null)
            setMensaje(null)
          }}
        >
          {modo === 'signin' ? '¿No tenés cuenta? Creá una' : '¿Ya tenés cuenta? Iniciá sesión'}
        </button>
      </div>
    </div>
  )
}
