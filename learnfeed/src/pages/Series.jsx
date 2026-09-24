import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useViewMode } from '../hooks/useViewMode'
import { getSeries, listSeriesPosts, getLikedPostIds, updateSeries, deleteSeries } from '../lib/api'
import { computeStreak } from '../lib/utils'
import Avatar from '../components/Avatar'
import ViewToggle from '../components/ViewToggle'
import SeriesProgress from '../components/SeriesProgress'
import SeriesGrid from '../components/SeriesGrid'
import SeriesThread from '../components/SeriesThread'

export default function SeriesPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useViewMode('grid')
  const [series,  setSeries]  = useState(null)
  const [posts,   setPosts]   = useState([])
  const [liked,   setLiked]   = useState(new Set())
  const [status,  setStatus]  = useState('loading')
  const [editing, setEditing] = useState(false)
  const [draft,   setDraft]   = useState({})

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    ;(async () => {
      try {
        const s = await getSeries(id)
        if (cancelled) return
        if (!s) { setStatus('missing'); return }
        const ps = await listSeriesPosts(id)
        const likedIds = await getLikedPostIds(user?.id, ps.map(p => p.id))
        if (cancelled) return
        setSeries(s); setPosts(ps); setLiked(likedIds); setStatus('ok')
      } catch {
        if (!cancelled) setStatus('error')
      }
    })()
    return () => { cancelled = true }
  }, [id, user?.id])

  if (status === 'loading') return <div className="loading-inline">Loading…</div>
  if (status === 'missing') return <div className="empty">This series doesn't exist or is private.</div>
  if (status === 'error')   return <div className="notice notice-error">Could not load this series.</div>

  const isOwner = user?.id === series.user_id
  const a = series.author

  function startEdit() {
    setDraft({ title: series.title, description: series.description, goal_days: series.goal_days ?? '', visibility: series.visibility })
    setEditing(true)
  }

  async function saveEdit(e) {
    e.preventDefault()
    const goal = draft.goal_days ? parseInt(draft.goal_days, 10) : null
    const patch = { title: draft.title.trim(), description: draft.description.trim(), goal_days: goal, visibility: draft.visibility }
    if (!patch.title) return
    try {
      await updateSeries(series.id, patch)
      setSeries(s => ({ ...s, ...patch }))
      setEditing(false)
    } catch (err) {
      alert(err.message)
    }
  }

  async function remove() {
    if (!window.confirm('Delete this series? Its posts are kept, just no longer grouped.')) return
    await deleteSeries(series.id)
    navigate(`/u/${a.username}`)
  }

  return (
    <>
      <section className="series-head">
        <Link to={`/u/${a.username}`} className="post-card-author">
          <Avatar profile={a} size={28} />
          <span className="post-card-handle">@{a.username}</span>
        </Link>

        {editing ? (
          <form onSubmit={saveEdit} className="series-edit">
            <input className="field field-title" value={draft.title} maxLength={120} onChange={e => setDraft(d => ({ ...d, title: e.target.value }))} />
            <textarea className="field mt8" rows={2} placeholder="What is this series about?" value={draft.description}
              onChange={e => setDraft(d => ({ ...d, description: e.target.value }))} />
            <div className="form-2col mt8">
              <input className="field" type="number" min="1" max="1000" placeholder="Goal in days" value={draft.goal_days}
                onChange={e => setDraft(d => ({ ...d, goal_days: e.target.value }))} />
              <select className="field" value={draft.visibility} onChange={e => setDraft(d => ({ ...d, visibility: e.target.value }))}>
                <option value="public">Public</option>
                <option value="private">Only me</option>
              </select>
            </div>
            <div className="row mt8">
              <button className="btn btn-solid btn-sm" type="submit">Save</button>
              <button className="btn btn-sm" type="button" onClick={() => setEditing(false)}>Cancel</button>
              <span className="spacer" />
              <button className="btn btn-sm btn-danger" type="button" onClick={remove}>Delete series</button>
            </div>
          </form>
        ) : (
          <>
            <h1 className="series-title">{series.title}</h1>
            {series.description && <p className="series-desc">{series.description}</p>}
          </>
        )}

        <SeriesProgress done={posts.length} goal={series.goal_days} streak={computeStreak(posts)} />

        <div className="row mt12">
          {isOwner && !editing && (
            <>
              <Link to={`/new?series=${series.id}`} className="btn btn-solid btn-sm">+ Add day</Link>
              <button className="btn btn-sm" onClick={startEdit}>Edit</button>
            </>
          )}
          <span className="spacer" />
          <ViewToggle mode={mode} onChange={setMode} labels={{ feed: 'Thread', grid: 'Grid' }} />
        </div>
      </section>

      {!posts.length && !(isOwner && series.goal_days && mode === 'grid') ? (
        <div className="empty">
          {isOwner ? <><Link to={`/new?series=${series.id}`}>Post day 1</Link> to kick things off.</> : 'No posts in this series yet.'}
        </div>
      ) : mode === 'grid' ? (
        <SeriesGrid series={series} posts={posts} canPost={isOwner} />
      ) : (
        <SeriesThread posts={posts} liked={liked} />
      )}
    </>
  )
}
