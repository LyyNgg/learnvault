import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import Masthead from '../layout/Masthead'

export default function AuthScreen() {
  const [mode, setMode]       = useState('signin') // 'signin' | 'signup'
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const isSignup = mode === 'signup'

  function toggleMode() {
    setMode(m => m === 'signin' ? 'signup' : 'signin')
    setError('')
  }

  async function submit() {
    if (!email.trim() || !password) { setError('Please enter your email and password.'); return }
    setError('')
    setLoading(true)

    const result = isSignup
      ? await supabase.auth.signUp({ email: email.trim(), password })
      : await supabase.auth.signInWithPassword({ email: email.trim(), password })

    setLoading(false)

    if (result.error) {
      setError(result.error.message)
      return
    }
    if (isSignup && result.data?.user?.identities?.length === 0) {
      setError('This email is already registered. Please sign in instead.')
    }
    // onAuthStateChange in App handles the rest
  }

  function onKey(e) { if (e.key === 'Enter') submit() }

  return (
    <div className="app">
      <Masthead />
      <div className="auth-card">
        <div className="auth-card-title">{isSignup ? 'Create Account' : 'Sign In'}</div>
        {error && <div className="auth-error">{error}</div>}
        <div className="field-group">
          <label className="field-label">Email</label>
          <input
            type="email" className="field" placeholder="you@example.com"
            value={email} onChange={e => setEmail(e.target.value)} onKeyDown={onKey}
          />
        </div>
        <div className="field-group">
          <label className="field-label">Password</label>
          <input
            type="password" className="field" placeholder="••••••••"
            value={password} onChange={e => setPassword(e.target.value)} onKeyDown={onKey}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button className="btn btn-solid" onClick={submit} disabled={loading}>
            {loading ? '…' : isSignup ? 'Create Account' : 'Sign In'}
          </button>
          <button className="btn" onClick={toggleMode}>
            {isSignup ? 'Back to sign in' : 'Create account'}
          </button>
        </div>
        <div className="auth-hint">
          {isSignup
            ? 'Tip: disable "Confirm email" in Supabase → Authentication → Email for instant access.'
            : 'Don\'t have an account? Click "Create account" to register.'}
        </div>
      </div>
    </div>
  )
}
