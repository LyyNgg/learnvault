import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { isFollowing, setFollow } from '../lib/api'

export default function FollowButton({ targetId, onChange }) {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [following, setFollowing] = useState(false)
  const [busy,      setBusy]      = useState(false)

  useEffect(() => {
    if (!user || user.id === targetId) return
    isFollowing(user.id, targetId).then(setFollowing).catch(() => {})
  }, [user?.id, targetId])

  if (user && user.id === targetId) return null

  async function toggle() {
    if (!user)    { navigate('/login'); return }
    if (!profile) { navigate('/settings'); return }
    const next = !following
    setBusy(true)
    try {
      await setFollow(user.id, targetId, next)
      setFollowing(next)
      onChange?.(next ? 1 : -1)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button className={`btn btn-sm ${following ? '' : 'btn-solid'}`} onClick={toggle} disabled={busy}>
      {following ? 'Following' : 'Follow'}
    </button>
  )
}
