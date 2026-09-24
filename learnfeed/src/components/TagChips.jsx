import { Link } from 'react-router-dom'

export default function TagChips({ tags }) {
  if (!tags?.length) return null
  return (
    <div className="tag-row">
      {tags.map(t => <Link key={t} to={`/t/${encodeURIComponent(t)}`} className="tag">#{t}</Link>)}
    </div>
  )
}
