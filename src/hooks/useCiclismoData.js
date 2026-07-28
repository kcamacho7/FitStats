import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

// RLS ya filtra cada tabla por auth.uid() = user_id — no hace falta .eq('user_id', ...) explícito.
export function useCiclismoData(userId, refreshKey = 0) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) return
    let cancelado = false
    setData(null)
    setError(null)

    async function cargar() {
      try {
        const [perfilRes, hitosRes, volumenRes, fondosRes, carrerasRes, planRes, wellnessRes] = await Promise.all([
          supabase.from('perfil').select('*').eq('user_id', userId).maybeSingle(),
          supabase.from('hitos').select('*').order('fecha'),
          supabase.from('volumen_mensual').select('*').order('mes'),
          supabase.from('top_fondos').select('*').order('distance_km', { ascending: false }),
          supabase.from('carreras').select('*'),
          supabase.from('plan_vs_actual').select('*').order('fecha'),
          supabase.from('wellness_diario').select('*').order('fecha'),
        ])

        for (const r of [perfilRes, hitosRes, volumenRes, fondosRes, carrerasRes, planRes, wellnessRes]) {
          if (r.error) throw r.error
        }

        if (cancelado) return

        const p = perfilRes.data
        setData({
          tienePerfil: !!p,
          generado: p?.generado ?? null,
          rango_datos: p ? { inicio: p.rango_datos_inicio, fin: p.rango_datos_fin } : null,
          perfil: p
            ? {
                nombre: p.nombre,
                peso_kg: p.peso_kg,
                estatura_cm: p.estatura_cm,
                ftp_actual_w: p.ftp_actual_w,
                ftp_2025_w: p.ftp_2025_w,
                wkg_actual: p.wkg_actual,
                bicicleta: p.bicicleta,
                objetivo_actual: p.objetivo_actual,
              }
            : null,
          hitos: hitosRes.data,
          volumen_mensual: volumenRes.data,
          top_fondos: fondosRes.data,
          carreras: carrerasRes.data,
          plan_vs_actual: planRes.data,
          wellness_diario: wellnessRes.data,
        })
      } catch (e) {
        if (!cancelado) setError(e)
      }
    }

    cargar()
    return () => {
      cancelado = true
    }
  }, [userId, refreshKey])

  return { data, error, loading: !data && !error }
}
