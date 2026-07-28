import { createClient } from '@supabase/supabase-js'

// Clave publicable (anon) — segura para exponer en un bundle público: el acceso
// real está controlado por las policies de Row Level Security en Supabase
// (solo SELECT habilitado, sin escritura desde el cliente).
const SUPABASE_URL = 'https://ztawdtaymbrocphzenuo.supabase.co'
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_cGpahv0sNo43C1oHyxpWcQ_iJC5ryZY'

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
