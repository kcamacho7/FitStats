import { createClient } from '@supabase/supabase-js'

// Clave publicable (anon) — segura para exponer en un bundle público: el acceso
// real está controlado por las policies de Row Level Security en Supabase
// (solo SELECT habilitado, sin escritura desde el cliente).
const SUPABASE_URL = 'https://fch-1.tail1161b6.ts.net:10000'
const SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlLWZpdHN0YXRzIiwiaWF0IjoxNzM1Njg5NjAwLCJleHAiOjIwNTEyMjI0MDB9.XyeO6j8keYeows6As34BJ_NZSEYB_i8ZkfZtd7glD9k'

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
