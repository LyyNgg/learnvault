import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { getProfile } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(undefined) // undefined = still checking
  const [profile, setProfileState] = useState(null)  // null = signed in but no profile yet
  const [loadedFor, setLoadedFor]   = useState(null)  // user id the current `profile` belongs to

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const setProfile = useCallback(p => {
    setProfileState(p)
    setLoadedFor(p?.id ?? null)
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!user) { setProfileState(null); setLoadedFor(null); return }
    let p = null
    try { p = await getProfile(user.id) } catch { /* treat as no profile */ }
    setProfileState(p)
    setLoadedFor(user.id)
  }, [user?.id])

  useEffect(() => { if (user !== undefined) refreshProfile() }, [refreshProfile])

  // Until the profile for *this* user has been fetched, we don't know whether to onboard.
  const loading = user === undefined || (user && loadedFor !== user.id)

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile, setProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
