import { Link, NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import Avatar from './Avatar'

export default function TopBar() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  async function signOut() {
    await supabase.auth.signOut()
    navigate('/explore')
  }

  return (
    <header className="topbar">
      <Link to="/" className="brand">Learn<span>Feed</span></Link>
      <nav className="topnav">
        {user && <NavLink to="/" end className="topnav-link">Home</NavLink>}
        <NavLink to="/explore" className="topnav-link">Explore</NavLink>
        {profile && <NavLink to={`/u/${profile.username}`} className="topnav-link">Profile</NavLink>}
      </nav>
      <div className="topbar-right">
        {user ? (
          <>
            {profile && <Link to="/new" className="btn btn-solid btn-sm">+ Post</Link>}
            <Link to="/settings" className="topbar-avatar" title="Settings">
              <Avatar profile={profile} size={28} />
            </Link>
            <button className="btn btn-sm btn-ghost" onClick={signOut}>Sign out</button>
          </>
        ) : (
          <Link to="/login" className="btn btn-solid btn-sm">Sign in</Link>
        )}
      </div>
    </header>
  )
}
