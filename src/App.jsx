import Hero from './components/Hero'
import Timeline from './components/Timeline'
import VolumeChart from './components/VolumeChart'
import EffortChart from './components/EffortChart'
import TopFondos from './components/TopFondos'
import RaceCards from './components/RaceCards'
import PlanVsActual from './components/PlanVsActual'
import WellnessStats from './components/WellnessStats'
import WellnessChart from './components/WellnessChart'
import { useCiclismoData } from './hooks/useCiclismoData'
import './App.css'

function App() {
  const { data, error, loading } = useCiclismoData()

  if (loading) {
    return (
      <div className="app-shell app-shell-center">
        <p className="loading-text">Cargando datos desde Supabase…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app-shell app-shell-center">
        <p className="loading-text error-text">
          No se pudo cargar la información ({error.message}). Revisá la consola o intentá de nuevo.
        </p>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <Hero data={data} />

      <main>
        <section className="section">
          <h2>Estado físico (intervals.icu)</h2>
          <p className="section-sub">
            Fitness/Fatiga/Forma calculados desde tu histórico de entrenamiento — lo más dinámico día a día. Sin
            datos de sueño, HRV o FC en reposo — tu cuenta no los tiene registrados todavía.
          </p>
          <WellnessStats data={data} />
          <WellnessChart data={data} />
        </section>

        <Timeline data={data} />

        <section className="section">
          <h2>Volumen y carga de entrenamiento</h2>
          <p className="section-sub">18 meses de datos reales de Strava, mes a mes.</p>
          <div className="chart-grid">
            <VolumeChart data={data} />
            <EffortChart data={data} />
          </div>
        </section>

        <RaceCards data={data} />
        <TopFondos data={data} />
        <PlanVsActual data={data} />
      </main>

      <footer className="app-footer">
        <p>
          Datos: Strava API + TrainingPeaks (Gmail), vía Supabase · Generado el{' '}
          {new Date(data.generado).toLocaleDateString('es-CR', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </footer>
    </div>
  )
}

export default App
