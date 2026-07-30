# FitStats

Plataforma web multiusuario de seguimiento de rendimiento deportivo (ciclismo, running,
natación y otros deportes registrados en Strava). Cada usuario conecta sus propias
fuentes (Strava vía OAuth, intervals.icu vía API key) y ve su dashboard: estado físico
(Fitness/Fatiga/Forma, sueño, HRV, FC en reposo), volumen y carga por deporte, mejores
marcas, líneas base de competencias, actividades individuales, plan vs. ejecutado, y un
análisis generado por IA ("FitStats IA") sobre su propia evolución.

## Stack

- **Frontend:** React + Vite, sin router (una sola página con secciones), CSS plano
  (`App.css`), desplegado en GitHub Pages.
- **Backend:** Supabase (Postgres + Auth + Edge Functions en Deno + Vault para
  credenciales cifradas). Row Level Security en todas las tablas de usuario.
- **Integraciones externas:** Strava API (OAuth), intervals.icu API (API key),
  Anthropic API (análisis de IA y lectura de capturas del plan de entrenamiento),
  Gmail (parser de TrainingPeaks, solo para el usuario Kenneth vía conector interno).

## Requisitos

- Node.js 20+
- Una cuenta de Supabase con acceso al proyecto (`ztawdtaymbrocphzenuo`) o uno propio
  con el mismo esquema.

## Instalación y desarrollo local

```bash
npm install
npm run dev       # http://localhost:5173
```

No hace falta un archivo `.env`: la URL de Supabase y la clave publicable (`anon` /
`publishable`) están hardcodeadas en `src/lib/supabaseClient.js` a propósito — son
seguras de exponer porque el control de acceso real lo hace Row Level Security en la
base de datos, no el cliente.

## Comandos

```bash
npm run lint      # oxlint — corre también en CI antes de cada build/deploy
npm run build      # build de producción a dist/
npm run preview    # sirve el build de producción localmente
```

## Estructura

```
src/
  components/   # una sección del dashboard por componente (Actividades, PlanVsActual, ...)
  hooks/        # useCiclismoData.js — única fuente de datos, un fetch por tabla de Supabase
  lib/          # supabaseClient.js, helpers de dominio (deportes.js)
```

Las Edge Functions (`sincronizar-strava`, `sincronizar-intervals`,
`generar-analisis-ia`, `calcular-resumen-periodico`, `actualizar-plan-ejecutado`,
`procesar-plan-captura`, etc.) viven únicamente en Supabase — no hay una carpeta
`supabase/functions/` en este repo, se administran directo en el proyecto de Supabase.

## Autenticación

Email/contraseña o Google, vía Supabase Auth. Tras el login, `App.jsx` sincroniza
Strava e intervals.icu para el usuario en cada sesión antes de mostrar el dashboard.

## Despliegue

Push a `main` dispara `.github/workflows/deploy.yml`: `npm ci` → `npm run lint` →
`npm run build` → publica `dist/` en GitHub Pages
(`base: '/FitStats/'` en `vite.config.js`).

## Credenciales y esquema de base de datos

Documentados en `CREDENCIALES.md`, en la raíz del proyecto padre (fuera de esta
carpeta `app/`) — nunca en este repo público.
