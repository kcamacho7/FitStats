import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

// Google entrega el nombre en user_metadata.full_name/name; el signup manual guarda full_name.
export function nombreSugerido(user) {
  const meta = user?.user_metadata || {}
  return meta.full_name || meta.name || ''
}

export function useAuth() {
  const [session, setSession] = useState(undefined) // undefined = todavía no se sabe, null = sin sesión

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password })
  const signUp = (email, password, nombre) =>
    supabase.auth.signUp({ email, password, options: { data: { full_name: nombre } } })
  const signInWithGoogle = () =>
    supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + window.location.pathname } })
  const signOut = () => supabase.auth.signOut()

  return {
    session,
    loading: session === undefined,
    user: session?.user ?? null,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  }
}
