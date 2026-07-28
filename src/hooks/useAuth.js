import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

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
  const signUp = (email, password) => supabase.auth.signUp({ email, password })
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
