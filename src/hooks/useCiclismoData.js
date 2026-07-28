import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useCiclismoData() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelado = false

    async function cargar() {
      try {
        const [perfilRes, hitosRes, volumenRes, fondosRes, carrerasRes, planRes] = await Promise.all([
          supabase.from('perfil').select('*').eq('id', 1).single(),
          supabase.from('hitos').select('*').order('fecha'),
          supabase.from('volumen_mensual').select('*').order('mes'),
          supabase.from('top_fondos').select('*').order('distance_km', { ascending: false }),
          supabase.from('carreras').select('*'),
          supabase.from('plan_vs_actual').select('*').order('fecha'),
        ])

        for (const r of [perfilRes, hitosRes, volumenRes, fondosRes, carrerasRes, planRes]) {
          if (r.error) throw r.error
        }

        if (cancelado) return

        const p = perfilRes.data
        setData({
          generado: p.generado,
          rango_datos: { inicio: p.rango_datos_inicio, fin: p.rango_datos_fin },
          perfil: {
            nombre: p.nombre,
            peso_kg: p.peso_kg,
            estatura_cm: p.estatura_cm,
            ftp_actual_w: p.ftp_actual_w,
            ftp_2025_w: p.ftp_2025_w,
            wkg_actual: p.wkg_actual,
            bicicleta: p.bicicleta,
            objetivo_actual: p.objetivo_actual,
          },
          hitos: hitosRes.data,
          volumen_mensual: volumenRes.data,
          top_fondos: fondosRes.data,
          carreras: carrerasRes.data,
          plan_vs_actual: planRes.data,
        })
      } catch (e) {
        if (!cancelado) setError(e)
      }
    }

    cargar()
    return () => {
      cancelado = true
    }
  }, [])

  return { data, error, loading: !data && !error }
}
