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
        const [perfilRes, hitosRes, volumenRes, fondosRes, carrerasRes, planRes, wellnessRes, actividadesRes, ftpRes] = await Promise.all([
          supabase.from('perfil').select('*').eq('user_id', userId).maybeSingle(),
          supabase.from('hitos').select('*').order('fecha'),
          supabase.from('volumen_mensual').select('*').order('mes'),
          supabase.from('top_fondos').select('*').order('distance_km', { ascending: false }),
          supabase.from('carreras').select('*').order('proxima_edicion'),
          supabase.from('plan_vs_actual').select('*').order('fecha'),
          supabase.from('wellness_diario').select('*').order('fecha'),
          supabase.from('actividades').select('*').order('start_local', { ascending: false }).limit(200),
          supabase.from('ftp_historial').select('*').order('fecha', { ascending: false }),
        ])

        for (const r of [perfilRes, hitosRes, volumenRes, fondosRes, carrerasRes, planRes, wellnessRes, actividadesRes, ftpRes]) {
          if (r.error) throw r.error
        }

        if (cancelado) return

        const p = perfilRes.data

        // La base está normalizada: los valores derivados (forma, W/kg, FTP vigente, rango
        // de fechas) se calculan acá en vivo, no existen como columnas.
        const wellness = (wellnessRes.data || []).map((w) => ({
          ...w,
          form: w.ctl != null && w.atl != null ? Math.round((Number(w.ctl) - Number(w.atl)) * 10) / 10 : null,
        }))

        const ftpHistorial = ftpRes.data || []
        const ftpActual = ftpHistorial[0] ?? null
        const ftpAnterior = ftpHistorial[1] ?? null
        const wkg =
          ftpActual && p?.peso_kg ? Math.round((Number(ftpActual.ftp_w) / Number(p.peso_kg)) * 100) / 100 : null

        const meses = [...new Set((volumenRes.data || []).map((r) => r.mes))].sort()
        const mesesConDatos = meses.length
        const fechasWellness = wellness.map((w) => w.fecha).filter(Boolean)
        const fechasActividades = (actividadesRes.data || []).map((a) => a.start_local).filter(Boolean)
        const todasFechas = [...fechasWellness, ...fechasActividades]
        const inicio = meses.length > 0 ? `${meses[0]}-01` : null
        const fin = todasFechas.length > 0 ? todasFechas.reduce((a, b) => (b > a ? b : a)) : null

        setData({
          tienePerfil: !!p,
          generado: fin,
          rango_datos: inicio ? { inicio, fin } : null,
          mesesConDatos,
          perfil: p
            ? {
                nombre: p.nombre,
                peso_kg: p.peso_kg,
                estatura_cm: p.estatura_cm,
                peso_bici_kg: p.peso_bici_kg,
                ftp_actual_w: ftpActual ? Number(ftpActual.ftp_w) : null,
                ftp_actual_fecha: ftpActual?.fecha ?? null,
                ftp_anterior_w: ftpAnterior ? Number(ftpAnterior.ftp_w) : null,
                ftp_anterior_fecha: ftpAnterior?.fecha ?? null,
                wkg_actual: wkg,
              }
            : null,
          ftp_historial: ftpHistorial,
          hitos: hitosRes.data,
          volumen_mensual: volumenRes.data,
          top_fondos: fondosRes.data,
          carreras: carrerasRes.data,
          plan_vs_actual: planRes.data,
          wellness_diario: wellness,
          actividades: actividadesRes.data,
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
