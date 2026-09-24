import { Link } from 'react-router-dom'
import PostGridTile from './PostGridTile'

// For challenges with a goal: one cell per day, filled cells link to that day's post.
// Without a goal it's simply the grid of posts.
export default function SeriesGrid({ series, posts, canPost }) {
  if (!series.goal_days) {
    return <div className="post-grid">{posts.map(p => <PostGridTile key={p.id} post={p} />)}</div>
  }

  const byDay = new Map()
  posts.forEach(p => { if (p.day_number && !byDay.has(p.day_number)) byDay.set(p.day_number, p) })
  const nextDay = Array.from({ length: series.goal_days }, (_, i) => i + 1).find(d => !byDay.has(d))
  const extras = posts.filter(p => !p.day_number || p.day_number > series.goal_days)

  return (
    <>
      <div className="day-grid">
        {Array.from({ length: series.goal_days }, (_, i) => {
          const day = i + 1
          const post = byDay.get(day)
          if (post) {
            return (
              <Link key={day} to={`/p/${post.id}`} className={`day-cell done${post.images[0] ? ' has-img' : ''}`} title={`Day ${day}: ${post.title}`}>
                {post.images[0] && <img src={post.images[0]} alt="" loading="lazy" />}
                <span className="day-cell-num">{day}</span>
                <span className="day-cell-title">{post.title}</span>
              </Link>
            )
          }
          if (canPost && day === nextDay) {
            return (
              <Link key={day} to={`/new?series=${series.id}&day=${day}`} className="day-cell next" title={`Post day ${day}`}>
                <span className="day-cell-num">{day}</span>
                <span className="day-cell-plus">+</span>
              </Link>
            )
          }
          return <div key={day} className="day-cell todo"><span className="day-cell-num">{day}</span></div>
        })}
      </div>
      {extras.length > 0 && (
        <>
          <div className="sub-head">Other posts in this series</div>
          <div className="post-grid">{extras.map(p => <PostGridTile key={p.id} post={p} />)}</div>
        </>
      )}
    </>
  )
}
