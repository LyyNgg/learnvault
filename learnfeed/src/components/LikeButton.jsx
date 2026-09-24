import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { setLike } from '../lib/api'

export default function LikeButton({ postId, initialLiked, initialCount }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [busy,  setBusy]  = useState(false)

  async function toggle(e) {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { navigate('/login'); return }
    if (busy) return
    const next = !liked
    setLiked(next)
    setCount(c => c + (next ? 1 : -1))
    setBusy(true)
    try {
      await setLike(user.id, postId, next)
    } catch {
      setLiked(!next)
      setCount(c => c + (next ? -1 : 1))
    } finally {
      setBusy(false)
    }
  }

  return (
    <button className={`like-btn${liked ? ' liked' : ''}`} onClick={toggle} aria-pressed={liked} aria-label={liked ? 'Unlike' : 'Like'}>
      {liked ? '♥' : '♡'} <span>{count}</span>
    </button>
  )
}
