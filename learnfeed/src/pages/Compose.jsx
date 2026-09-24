import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getPost, savePost, deletePost, listSeries, listMyTags, nextDayNumber } from '../lib/api'
import Markdown from '../components/Markdown'
import TagInput from '../components/Composer/TagInput'
import LinksInput from '../components/Composer/LinksInput'
import ImagesInput from '../components/Composer/ImagesInput'
import SeriesPicker from '../components/Composer/SeriesPicker'

const EMPTY = { title: '', body: '', images: [], links: [], tags: [], series_id: null, day_number: '', visibility: 'public' }

export default function Compose() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [post,       setPost]       = useState(EMPTY)
  const [seriesList, setSeriesList] = useState([])
  const [tagSuggest, setTagSuggest] = useState([])
  const [tab,        setTab]        = useState('write')
  const [loading,    setLoading]    = useState(true)
  const [uploading,  setUploading]  = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState('')

  const set = patch => setPost(p => ({ ...p, ...patch }))

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [series, tags, existing] = await Promise.all([
          listSeries(user.id),
          listMyTags(user.id),
          id ? getPost(id) : null,
        ])
        if (cancelled) return
        setSeriesList(series)
        setTagSuggest(tags)
        if (id) {
          if (!existing || existing.user_id !== user.id) { setError('Post not found.'); return }
          setPost({ ...existing, day_number: existing.day_number ?? '' })
        } else {
          const sid = params.get('series')
          if (sid && series.some(s => s.id === sid)) {
            const day = parseInt(params.get('day'), 10) || await nextDayNumber(sid)
            if (!cancelled) set({ series_id: sid, day_number: day })
          }
        }
      } catch (e) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [id, user.id])

  async function pickSeries(sid) {
    set({ series_id: sid, day_number: '' })
    if (sid) {
      try { set({ day_number: await nextDayNumber(sid) }) } catch { /* leave blank */ }
    }
  }

  async function submit(e) {
    e.preventDefault()
    if (!post.title.trim()) { setError('Add a title.'); return }
    setSaving(true); setError('')
    try {
      const day = post.series_id && post.day_number ? parseInt(post.day_number, 10) : null
      const { id: savedId } = await savePost({ ...post, id, user_id: user.id, day_number: day })
      navigate(`/p/${savedId}`)
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  async function remove() {
    if (!window.confirm('Delete this post? This cannot be undone.')) return
    try {
      await deletePost(id)
      navigate(post.series_id ? `/s/${post.series_id}` : '/')
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <div className="loading-inline">Loading…</div>

  const selectedSeries = seriesList.find(s => s.id === post.series_id)

  return (
    <form className="narrow composer" onSubmit={submit}>
      <div className="sec-head">
        <h1 className="sec-title">{id ? 'Edit post' : 'New post'}</h1>
      </div>
      {error && <div className="notice notice-error mt12">{error}</div>}

      <div className="field-group mt16">
        <label className="field-label">Series</label>
        <SeriesPicker
          userId={user.id}
          seriesList={seriesList}
          value={post.series_id}
          onChange={pickSeries}
          onCreated={s => { setSeriesList(l => [s, ...l]); set({ series_id: s.id, day_number: 1 }) }}
        />
        {selectedSeries && (
          <div className="row mt8">
            <label className="field-label nowrap" htmlFor="day" style={{ margin: 0 }}>Day</label>
            <input id="day" className="field field-day" type="number" min="1"
              value={post.day_number} onChange={e => set({ day_number: e.target.value })} />
            {selectedSeries.goal_days && <span className="muted">of {selectedSeries.goal_days}</span>}
          </div>
        )}
      </div>

      <div className="field-group">
        <label className="field-label" htmlFor="title">Title</label>
        <input id="title" className="field field-title" maxLength={200} placeholder="What did you learn today?"
          value={post.title} onChange={e => set({ title: e.target.value })} />
      </div>

      <div className="field-group">
        <div className="md-tabs">
          <button type="button" className={tab === 'write' ? 'active' : ''} onClick={() => setTab('write')}>Write</button>
          <button type="button" className={tab === 'preview' ? 'active' : ''} onClick={() => setTab('preview')}>Preview</button>
          <span className="field-hint">Markdown supported</span>
        </div>
        {tab === 'write' ? (
          <textarea className="field field-body" rows={12}
            placeholder={'Explain it like you would to a friend.\n\n## Key idea\n- …\n\n```sql\nSELECT …\n```'}
            value={post.body} onChange={e => set({ body: e.target.value })} />
        ) : (
          <div className="md-preview">{post.body.trim() ? <Markdown>{post.body}</Markdown> : <span className="muted">Nothing to preview.</span>}</div>
        )}
      </div>

      <div className="field-group">
        <label className="field-label">Images</label>
        <ImagesInput userId={user.id} images={post.images} onChange={images => set({ images })} onBusy={setUploading} />
      </div>

      <div className="field-group">
        <label className="field-label">Sources &amp; links</label>
        <LinksInput links={post.links} onChange={links => set({ links })} />
      </div>

      <div className="field-group">
        <label className="field-label">Tags</label>
        <TagInput tags={post.tags} onChange={tags => set({ tags })} suggestions={tagSuggest} />
      </div>

      <div className="field-group">
        <label className="field-label">Who can see this</label>
        <div className="view-toggle">
          {['public', 'private'].map(v => (
            <button type="button" key={v} className={`view-toggle-btn${post.visibility === v ? ' active' : ''}`}
              aria-pressed={post.visibility === v} onClick={() => set({ visibility: v })}>
              {v === 'public' ? '🌍 Public' : '🔒 Only me'}
            </button>
          ))}
        </div>
      </div>

      <div className="row mt16">
        <button type="submit" className="btn btn-solid" disabled={saving || uploading}>
          {saving ? 'Saving…' : uploading ? 'Uploading…' : id ? 'Save changes' : 'Publish'}
        </button>
        <button type="button" className="btn" onClick={() => navigate(-1)}>Cancel</button>
        <span className="spacer" />
        {id && <button type="button" className="btn btn-danger" onClick={remove}>Delete</button>}
      </div>
    </form>
  )
}
