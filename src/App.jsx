import Hero from './components/Hero'
import Timeline from './components/Timeline'
import VolumeChart from './components/VolumeChart'
import EffortChart from './components/EffortChart'
import TopFondos from './components/TopFondos'
import RaceCards from './components/RaceCards'
import PlanVsActual from './components/PlanVsActual'
import './App.css'

function App() {
  return (
    <div className="app-shell">
      <Hero />

      <main>
        <Timeline />

        <section className="section">
          <h2>Volumen y carga de entrenamiento</h2>
          <p className="section-sub">18 meses de datos reales de Strava, mes a mes.</p>
          <div className="chart-grid">
            <VolumeChart />
            <EffortChart />
          </div>
        </section>

        <RaceCards />
        <TopFondos />
        <PlanVsActual />
      </main>

      <footer className="app-footer">
        <p>
          Datos: Strava API + TrainingPeaks (Gmail) · Generado {import.meta.env.DEV ? 'en desarrollo' : ''} el{' '}
          {new Date('2026-07-27').toLocaleDateString('es-CR', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </footer>
    </div>
  )
}

export default App
