import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getProfileByUsername, saveProfile } from '../lib/api'
import { uploadImage } from '../lib/storage'
import { isValidUsername } from '../lib/utils'
import Avatar from '../components/Avatar'

export default function Settings() {
  const { user, profile, setProfile } = useAuth()
  const navigate = useNavigate()
  const onboarding = !profile

  const [username,    setUsername]    = useState(profile?.username     || '')
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [bio,         setBio]         = useState(profile?.bio          || '')
  const [avatarUrl,   setAvatarUrl]   = useState(profile?.avatar_url   || '')
  const [error,       setError]       = useState('')
  const [saved,       setSaved]       = useState(false)
  const [busy,        setBusy]        = useState(false)

  async function onAvatar(e) {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    setBusy(true); setError('')
    try { setAvatarUrl(await uploadImage(user.id, f)) }
    catch (err) { setError(err.message) }
    finally { setBusy(false) }
  }

  async function save(e) {
    e.preventDefault()
    const u = username.trim().toLowerCase()
    if (!isValidUsername(u)) { setError('Username must be 3–20 characters: a–z, 0–9 or _.'); return }
    setBusy(true); setError(''); setSaved(false)
    try {
      if (u !== profile?.username) {
        const taken = await getProfileByUsername(u)
        if (taken && taken.id !== user.id) { setError('That username is taken.'); return }
      }
      const p = await saveProfile({ id: user.id, username: u, display_name: displayName.trim(), bio: bio.trim(), avatar_url: avatarUrl })
      setProfile(p)
      if (onboarding) navigate('/new')
      else setSaved(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="narrow" onSubmit={save}>
      <div className="sec-head">
        <h1 className="sec-title">{onboarding ? 'Pick your handle' : 'Profile settings'}</h1>
      </div>
      {onboarding && <p className="muted mt12">This is how people will find and follow your learning journey.</p>}
      {error && <div className="notice notice-error mt12">{error}</div>}
      {saved && <div className="notice mt12">Saved.</div>}

      <div className="settings-avatar mt16">
        <Avatar profile={{ username, display_name: displayName, avatar_url: avatarUrl }} size={64} />
        <label className="btn btn-sm">
          {avatarUrl ? 'Change photo' : 'Upload photo'}
          <input type="file" accept="image/*" hidden onChange={onAvatar} />
        </label>
      </div>

      <div className="field-group mt16">
        <label className="field-label" htmlFor="username">Username</label>
        <div className="prefixed">
          <span>@</span>
          <input id="username" className="field" value={username} maxLength={20}
            onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} />
        </div>
      </div>
      <div className="field-group">
        <label className="field-label" htmlFor="display">Display name</label>
        <input id="display" className="field" value={displayName} maxLength={60} onChange={e => setDisplayName(e.target.value)} />
      </div>
      <div className="field-group">
        <label className="field-label" htmlFor="bio">Bio</label>
        <textarea id="bio" className="field" rows={3} maxLength={280} value={bio}
          placeholder="What are you learning right now?" onChange={e => setBio(e.target.value)} />
      </div>
      <button type="submit" className="btn btn-solid" disabled={busy}>{busy ? '…' : onboarding ? 'Continue' : 'Save'}</button>
    </form>
  )
}
