import { useState } from 'react'
import logo from '../assets/logo-icon.png'
import Spinner from './Spinner'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
    </svg>
  )
}

export default function Login({ onSignIn, onSignUp, onSignInWithGoogle }) {
  const [modo, setModo] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mensaje, setMensaje] = useState(null)
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [cargandoGoogle, setCargandoGoogle] = useState(false)

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

  const onGoogle = async () => {
    setCargandoGoogle(true)
    await onSignInWithGoogle()
  }

  return (
    <div className="app-shell app-shell-center">
      <div className="login-card">
        <img src={logo} alt="FitStats" className="login-logo" />
        <h1 className="login-title">{modo === 'signin' ? 'Iniciar sesión' : 'Crear cuenta'}</h1>
        <p className="login-sub">Tu evolución como atleta, en un solo lugar.</p>

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
            {cargando && <Spinner />}
            {cargando ? 'Un momento…' : modo === 'signin' ? 'Entrar' : 'Crear cuenta'}
          </button>
        </form>

        <div className="login-divider">o</div>

        <button
          type="button"
          className="login-btn login-btn-secondary login-btn-google"
          disabled={cargando || cargandoGoogle}
          onClick={onGoogle}
        >
          {cargandoGoogle ? <Spinner /> : <GoogleIcon />}
          Continuar con Google
        </button>

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
