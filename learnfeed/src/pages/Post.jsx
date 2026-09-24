import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getPost, getLikedPostIds, listSeriesPosts } from '../lib/api'
import { hostOf, safeUrl, timeAgo } from '../lib/utils'
import Avatar from '../components/Avatar'
import Markdown from '../components/Markdown'
import TagChips from '../components/TagChips'
import LikeButton from '../components/LikeButton'
import SeriesBadge from '../components/SeriesBadge'

export default function PostPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [post,    setPost]    = useState(null)
  const [liked,   setLiked]   = useState(false)
  const [nav,     setNav]     = useState({ prev: null, next: null })
  const [active,  setActive]  = useState(0)
  const [status,  setStatus]  = useState('loading') // loading | ok | missing | error

  useEffect(() => {
    let cancelled = false
    setStatus('loading'); setActive(0); setNav({ prev: null, next: null })
    ;(async () => {
      try {
        const p = await getPost(id)
        if (cancelled) return
        if (!p) { setStatus('missing'); return }
        setPost(p)
        setStatus('ok')
        const likedIds = await getLikedPostIds(user?.id, [p.id])
        if (!cancelled) setLiked(likedIds.has(p.id))
        if (p.series_id) {
          const siblings = await listSeriesPosts(p.series_id)
          const i = siblings.findIndex(s => s.id === p.id)
          if (!cancelled && i >= 0) setNav({ prev: siblings[i - 1] || null, next: siblings[i + 1] || null })
        }
      } catch {
        if (!cancelled) setStatus('error')
      }
    })()
    return () => { cancelled = true }
  }, [id, user?.id])

  if (status === 'loading') return <div className="loading-inline">Loading…</div>
  if (status === 'missing') return <div className="empty">This post doesn't exist or is private.</div>
  if (status === 'error')   return <div className="notice notice-error">Could not load this post.</div>

  const a = post.author
  const isOwner = user?.id === post.user_id

  return (
    <article className="post-detail">
      <header className="post-card-head">
        <Link to={`/u/${a.username}`} className="post-card-author">
          <Avatar profile={a} size={40} />
          <span>
            <span className="post-card-name">{a.display_name || a.username}</span>
            <span className="post-card-handle">@{a.username} · {timeAgo(post.created_at)}</span>
          </span>
        </Link>
        {post.visibility === 'private' && <span className="badge">Private</span>}
        {isOwner && <Link to={`/p/${post.id}/edit`} className="btn btn-sm">Edit</Link>}
      </header>

      <SeriesBadge series={post.series} day={post.day_number} />
      <h1 className="post-detail-title">{post.title}</h1>

      {post.images.length > 0 && (
        <div className="gallery">
          <img className="gallery-main" src={post.images[active]} alt="" />
          {post.images.length > 1 && (
            <div className="gallery-thumbs">
              {post.images.map((src, i) => (
                <button key={src} className={i === active ? 'active' : ''} onClick={() => setActive(i)} aria-label={`Image ${i + 1}`}>
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {post.body && <Markdown>{post.body}</Markdown>}

      {post.links.length > 0 && (
        <section className="post-links">
          <div className="sub-head">Sources</div>
          <ul>
            {post.links.map((l, i) => {
              const href = safeUrl(l.url)
              if (!href) return null
              return (
                <li key={i}>
                  <a href={href} target="_blank" rel="noopener noreferrer">{l.label || hostOf(href)}</a>
                  <span className="muted"> — {hostOf(href)}</span>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <footer className="post-card-foot post-detail-foot">
        <TagChips tags={post.tags} />
        <span className="spacer" />
        <LikeButton key={`${post.id}-${liked}`} postId={post.id} initialLiked={liked} initialCount={post.like_count} />
      </footer>

      {(nav.prev || nav.next) && (
        <nav className="series-nav">
          {nav.prev ? (
            <Link to={`/p/${nav.prev.id}`} className="series-nav-link">
              <span className="field-label">← {nav.prev.day_number ? `Day ${nav.prev.day_number}` : 'Previous'}</span>
              <span>{nav.prev.title}</span>
            </Link>
          ) : <span />}
          {nav.next && (
            <Link to={`/p/${nav.next.id}`} className="series-nav-link next">
              <span className="field-label">{nav.next.day_number ? `Day ${nav.next.day_number}` : 'Next'} →</span>
              <span>{nav.next.title}</span>
            </Link>
          )}
        </nav>
      )}
    </article>
  )
}
