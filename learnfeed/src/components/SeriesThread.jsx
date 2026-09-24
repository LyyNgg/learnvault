import { Link } from 'react-router-dom'
import { timeAgo } from '../lib/utils'
import Markdown from './Markdown'
import TagChips from './TagChips'
import LikeButton from './LikeButton'

// Chronological "story" of a series: a vertical line connecting each day.
export default function SeriesThread({ posts, liked }) {
  return (
    <ol className="thread">
      {posts.map((p, i) => (
        <li key={p.id} className="thread-item">
          <div className="thread-rail">
            <span className="thread-dot">{p.day_number ?? '•'}</span>
            {i < posts.length - 1 && <span className="thread-line" />}
          </div>
          <article className="thread-card">
            <div className="thread-meta">
              {p.day_number ? `Day ${p.day_number}` : 'Post'} · {timeAgo(p.created_at)}
              {p.visibility === 'private' && <span className="badge">Private</span>}
            </div>
            <Link to={`/p/${p.id}`} className="thread-title">{p.title}</Link>
            {p.images[0] && <Link to={`/p/${p.id}`}><img className="thread-img" src={p.images[0]} alt="" loading="lazy" /></Link>}
            {p.body && <Markdown>{p.body}</Markdown>}
            <div className="post-card-foot">
              <TagChips tags={p.tags} />
              <span className="spacer" />
              <LikeButton postId={p.id} initialLiked={liked.has(p.id)} initialCount={p.like_count} />
            </div>
          </article>
        </li>
      ))}
    </ol>
  )
}
