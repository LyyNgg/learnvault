import { Link } from 'react-router-dom'

export default function PostGridTile({ post }) {
  const img = post.images[0]
  return (
    <Link to={`/p/${post.id}`} className={`grid-tile${img ? ' has-img' : ''}`} title={post.title}>
      {img
        ? <img src={img} alt="" loading="lazy" />
        : <span className="grid-tile-title">{post.title}</span>}
      {post.day_number && <span className="grid-tile-day">Day {post.day_number}</span>}
      <span className="grid-tile-overlay">
        <span className="grid-tile-overlay-title">{post.title}</span>
        <span>♥ {post.like_count}</span>
      </span>
    </Link>
  )
}
