import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [mode,     setMode]     = useState('signin') // 'signin' | 'signup'
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [info,     setInfo]     = useState('')
  const [loading,  setLoading]  = useState(false)

  const isSignup = mode === 'signup'

  async function submit(e) {
    e.preventDefault()
    if (!email.trim() || !password) { setError('Please enter your email and password.'); return }
    setError(''); setInfo('')
    setLoading(true)
    const result = isSignup
      ? await supabase.auth.signUp({ email: email.trim(), password })
      : await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setLoading(false)

    if (result.error) { setError(result.error.message); return }
    if (isSignup && result.data?.user?.identities?.length === 0) {
      setError('This email is already registered. Please sign in instead.')
    } else if (isSignup && !result.data?.session) {
      setInfo('Check your inbox to confirm your email, then sign in.')
    }
    // AuthProvider's onAuthStateChange handles the redirect.
  }

  return (
    <div className="auth-wrap">
      <div className="auth-pitch">
        <h1 className="hero-title">Learn in public.<br /><span>One post a day.</span></h1>
        <p className="hero-sub">
          Turn what you learn into posts. Group them into series like <em>100 Days of SQL</em>,
          read them back as a thread or scan them as a grid, and follow others on the same path.
        </p>
      </div>
      <form className="auth-card" onSubmit={submit}>
        <div className="auth-card-title">{isSignup ? 'Create account' : 'Sign in'}</div>
        {error && <div className="notice notice-error">{error}</div>}
        {info  && <div className="notice">{info}</div>}
        <div className="field-group">
          <label className="field-label" htmlFor="email">Email</label>
          <input id="email" type="email" className="field" placeholder="you@example.com" autoComplete="email"
            value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="field-group">
          <label className="field-label" htmlFor="password">Password</label>
          <input id="password" type="password" className="field" placeholder="••••••••"
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <div className="row mt16">
          <button type="submit" className="btn btn-solid" disabled={loading}>
            {loading ? '…' : isSignup ? 'Create account' : 'Sign in'}
          </button>
          <button type="button" className="btn" onClick={() => { setMode(isSignup ? 'signin' : 'signup'); setError(''); setInfo('') }}>
            {isSignup ? 'Back to sign in' : 'Create account'}
          </button>
        </div>
      </form>
    </div>
  )
}
