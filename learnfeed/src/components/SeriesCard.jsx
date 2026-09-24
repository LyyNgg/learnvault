import { Link } from 'react-router-dom'
import SeriesProgress from './SeriesProgress'

export default function SeriesCard({ series }) {
  return (
    <Link to={`/s/${series.id}`} className="series-card">
      <div className="series-card-title">{series.title}</div>
      {series.description && <div className="series-card-desc">{series.description}</div>}
      <SeriesProgress done={series.post_count} goal={series.goal_days} compact />
      {series.visibility === 'private' && <span className="badge mt8">Private</span>}
    </Link>
  )
}
