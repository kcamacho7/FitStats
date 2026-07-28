import { useEffect, useState } from 'react'
import Hero from './components/Hero'
import Timeline from './components/Timeline'
import VolumeChart from './components/VolumeChart'
import EffortChart from './components/EffortChart'
import VolumenPorDeporte from './components/VolumenPorDeporte'
import TopFondos from './components/TopFondos'
import RaceCards from './components/RaceCards'
import PlanVsActual from './components/PlanVsActual'
import WellnessStats from './components/WellnessStats'
import WellnessChart from './components/WellnessChart'
import Login from './components/Login'
import Settings from './components/Settings'
import CompletarPerfil from './components/CompletarPerfil'
import Admin from './components/Admin'
import TopbarMenu from './components/TopbarMenu'
import { useAuth, nombreSugerido } from './hooks/useAuth'
import { useCiclismoData } from './hooks/useCiclismoData'
import { supabase } from './lib/supabaseClient'
import logoIcon from './assets/logo-icon.png'
import './App.css'

const FUNCTIONS_URL = 'https://ztawdtaymbrocphzenuo.supabase.co/functions/v1'
const ADMIN_USER_ID = '2e46f380-ad94-4d76-9571-822804e6049a'

function App() {
  const { session, loading: authLoading, user, signIn, signUp, signInWithGoogle, signOut } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)
  const [mostrarConfig, setMostrarConfig] = useState(false)
  const [mostrarAdmin, setMostrarAdmin] = useState(false)
  const [avisoStrava, setAvisoStrava] = useState(null)
  const { data, error, loading } = useCiclismoData(user?.id, refreshKey)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const strava = params.get('strava')
    if (strava === 'conectado') {
      setAvisoStrava({ tipo: 'ok', texto: 'Strava conectado. Abrí Configuración y tocá "Sincronizar ahora" para traer tus datos.' })
      setMostrarConfig(true)
    } else if (strava === 'error') {
      setAvisoStrava({ tipo: 'error', texto: `No se pudo conectar Strava (${params.get('msg') || 'error desconocido'}).` })
      setMostrarConfig(true)
    }
    if (strava) {
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  // Como el sistema tiene pocos usuarios, en vez de un refresco programado en la nube
  // se sincroniza Strava/intervals.icu cada vez que el usuario entra a la app.
  useEffect(() => {
    if (!user) return
    let cancelado = false

    const sincronizarAlIngresar = async () => {
      const { data: { session: s } } = await supabase.auth.getSession()
      if (!s) return
      const llamar = (nombre) =>
        fetch(`${FUNCTIONS_URL}/${nombre}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${s.access_token}` },
          body: JSON.stringify({}),
        }).catch(() => null)

      supabase.from('eventos_uso').insert({ user_id: user.id, tipo: 'login' }).then(() => {})
      await Promise.all([llamar('sincronizar-strava'), llamar('sincronizar-intervals')])
      if (!cancelado) setRefreshKey((k) => k + 1)
    }

    sincronizarAlIngresar()
    return () => {
      cancelado = true
    }
  }, [user?.id])

  if (authLoading) {
    return (
      <div className="app-shell app-shell-center">
        <p className="loading-text">Cargando…</p>
      </div>
    )
  }

  if (!session) {
    return <Login onSignIn={signIn} onSignUp={signUp} onSignInWithGoogle={signInWithGoogle} />
  }

  return (
    <div className="app-shell">
      <div className="topbar">
        <div className="topbar-brand">
          <img src={logoIcon} alt="FitStats" className="topbar-logo" />
          <span className="topbar-brand-name">FitStats</span>
        </div>
        <div className="topbar-right">
          <TopbarMenu
            email={user.email}
            isAdmin={user.id === ADMIN_USER_ID}
            onOpenAdmin={() => setMostrarAdmin(true)}
            onOpenConfig={() => setMostrarConfig(true)}
            onSignOut={signOut}
          />
        </div>
      </div>

      {loading && (
        <div className="app-shell-center">
          <p className="loading-text">Cargando tus datos…</p>
        </div>
      )}

      {error && (
        <div className="app-shell-center">
          <p className="loading-text error-text">
            No se pudo cargar la información ({error.message}).
          </p>
        </div>
      )}

      {!loading && !error && data && !data.tienePerfil && (
        <CompletarPerfil
          user={user}
          nombreSugeridoInicial={nombreSugerido(user)}
          onListo={() => setRefreshKey((k) => k + 1)}
        />
      )}

      {!loading && !error && data && data.tienePerfil && (
        <>
          <Hero data={data} />

          <main>
            <section className="section">
              <h2>Estado físico</h2>
              {data.wellness_diario.length > 0 ? (
                <>
                  <p className="section-sub">
                    Fitness/Fatiga/Forma calculados desde tu histórico de entrenamiento — lo más dinámico día a día.
                    Sin datos de sueño, HRV o FC en reposo si tu cuenta no los tiene registrados todavía.
                  </p>
                  <WellnessStats data={data} />
                  <WellnessChart data={data} />
                </>
              ) : (
                <p className="section-sub">
                  Todavía no hay datos de Fitness/Fatiga. Andá a <strong>Configuración</strong> y conectá Strava o
                  intervals.icu para empezar a verlos acá.
                </p>
              )}
            </section>

            {data.hitos.length > 0 && <Timeline data={data} />}

            {data.volumen_mensual.length > 0 && (
              <section className="section">
                <h2>Volumen y carga de entrenamiento</h2>
                <p className="section-sub">18 meses de datos reales, mes a mes.</p>
                <div className="chart-grid">
                  <VolumeChart data={data} />
                  <EffortChart data={data} />
                </div>
                <VolumenPorDeporte data={data} />
              </section>
            )}

            <RaceCards data={data} userId={user.id} onCambio={() => setRefreshKey((k) => k + 1)} />
            {data.top_fondos.length > 0 && <TopFondos data={data} />}
            {data.plan_vs_actual.length > 0 && <PlanVsActual data={data} />}
          </main>

          <footer className="app-footer">
            <p>
              Datos actualizados automáticamente · Generado el{' '}
              {new Date(data.generado).toLocaleDateString('es-CR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </footer>
        </>
      )}

      {mostrarConfig && (
        <Settings
          onClose={() => setMostrarConfig(false)}
          onSynced={() => setRefreshKey((k) => k + 1)}
          avisoInicial={avisoStrava}
        />
      )}

      {mostrarAdmin && user.id === ADMIN_USER_ID && <Admin onClose={() => setMostrarAdmin(false)} />}
    </div>
  )
}

export default App
