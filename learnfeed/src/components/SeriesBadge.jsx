import { Link } from 'react-router-dom'

export default function SeriesBadge({ series, day }) {
  if (!series) return null
  return (
    <Link to={`/s/${series.id}`} className="series-badge" onClick={e => e.stopPropagation()}>
      <span className="series-badge-title">{series.title}</span>
      {day && <span className="series-badge-day">Day {day}{series.goal_days ? ` / ${series.goal_days}` : ''}</span>}
    </Link>
  )
}
