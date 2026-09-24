import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import TopBar from './components/TopBar'
import Home from './pages/Home'
import Explore from './pages/Explore'
import Profile from './pages/Profile'
import SeriesPage from './pages/Series'
import PostPage from './pages/Post'
import TagPage from './pages/Tag'
import Compose from './pages/Compose'
import Settings from './pages/Settings'
import Login from './pages/Login'

// Signed in → must have a profile (username) before doing anything that writes.
function RequireProfile({ children }) {
  const { user, profile } = useAuth()
  if (!user)    return <Navigate to="/login" replace />
  if (!profile) return <Navigate to="/settings" replace />
  return children
}

export default function App() {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-title">Learn<span>Feed</span></div>
        <div className="loading-sub">Loading…</div>
      </div>
    )
  }

  // New accounts go straight to picking a username.
  if (user && !profile && location.pathname !== '/settings') {
    return <Navigate to="/settings" replace />
  }

  return (
    <div className="app">
      <TopBar />
      <main>
        <Routes>
          <Route path="/"           element={user ? <Home /> : <Navigate to="/explore" replace />} />
          <Route path="/explore"    element={<Explore />} />
          <Route path="/u/:username" element={<Profile />} />
          <Route path="/s/:id"      element={<SeriesPage />} />
          <Route path="/p/:id"      element={<PostPage />} />
          <Route path="/p/:id/edit" element={<RequireProfile><Compose /></RequireProfile>} />
          <Route path="/t/:tag"     element={<TagPage />} />
          <Route path="/new"        element={<RequireProfile><Compose /></RequireProfile>} />
          <Route path="/settings"   element={user ? <Settings /> : <Navigate to="/login" replace />} />
          <Route path="/login"      element={user ? <Navigate to="/" replace /> : <Login />} />
          <Route path="*"           element={<div className="empty">Page not found.</div>} />
        </Routes>
      </main>
    </div>
  )
}
