import { Link } from 'react-router-dom'
import { excerpt, timeAgo } from '../lib/utils'
import Avatar from './Avatar'
import TagChips from './TagChips'
import LikeButton from './LikeButton'
import SeriesBadge from './SeriesBadge'

export default function PostCard({ post, liked, showAuthor = true }) {
  const a = post.author
  return (
    <article className="post-card">
      {showAuthor && a && (
        <header className="post-card-head">
          <Link to={`/u/${a.username}`} className="post-card-author">
            <Avatar profile={a} size={32} />
            <span>
              <span className="post-card-name">{a.display_name || a.username}</span>
              <span className="post-card-handle">@{a.username} · {timeAgo(post.created_at)}</span>
            </span>
          </Link>
          {post.visibility === 'private' && <span className="badge">Private</span>}
        </header>
      )}
      <SeriesBadge series={post.series} day={post.day_number} />
      <Link to={`/p/${post.id}`} className="post-card-link">
        <h2 className="post-card-title">{post.title}</h2>
        {post.body && <p className="post-card-excerpt">{excerpt(post.body)}</p>}
        {post.images[0] && (
          <div className="post-card-img">
            <img src={post.images[0]} alt="" loading="lazy" />
            {post.images.length > 1 && <span className="post-card-img-count">+{post.images.length - 1}</span>}
          </div>
        )}
      </Link>
      <footer className="post-card-foot">
        <TagChips tags={post.tags} />
        <span className="spacer" />
        {post.links.length > 0 && <span className="post-card-meta">🔗 {post.links.length}</span>}
        <LikeButton postId={post.id} initialLiked={liked} initialCount={post.like_count} />
      </footer>
    </article>
  )
}
