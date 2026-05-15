import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { normalizeEntry } from './lib/utils'
import LoadingScreen from './components/LoadingScreen'
import AuthScreen from './components/auth/AuthScreen'
import Masthead from './components/layout/Masthead'
import Nav from './components/layout/Nav'
import UserBar from './components/layout/UserBar'
import AnswerBank from './components/AnswerBank'
import SessionLog from './components/SessionLog'
import Flashcards from './components/Flashcards'

export default function App() {
  const [user,         setUser]         = useState(undefined) // undefined = checking
  const [bankEntries,  setBankEntries]  = useState([])
  const [tab,          setTab]          = useState('answer-bank')

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (!u) setBankEntries([])
    })
    return () => subscription.unsubscribe()
  }, [])

  // Load entries once after login so SessionLog's question picker is pre-populated
  useEffect(() => {
    if (!user) return
    supabase.from('entries').select('*').order('created_at')
      .then(({ data }) => setBankEntries((data || []).map(normalizeEntry)))
  }, [user?.id])

  async function signOut() {
    await supabase.auth.signOut()
  }

  if (user === undefined) return <LoadingScreen />
  if (!user)              return <AuthScreen />

  return (
    <div className="app">
      <UserBar email={user.email} onSignOut={signOut} />
      <Masthead />
      <Nav tab={tab} onTabChange={setTab} />
      {tab === 'answer-bank' && (
        <AnswerBank entries={bankEntries} setEntries={setBankEntries} userId={user.id} />
      )}
      {tab === 'session-log' && (
        <SessionLog bankEntries={bankEntries} userId={user.id} />
      )}
      {tab === 'flashcards' && (
        <Flashcards />
      )}
    </div>
  )
}
