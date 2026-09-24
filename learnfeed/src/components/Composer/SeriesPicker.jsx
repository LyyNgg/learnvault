import { useState } from 'react'
import { createSeries } from '../../lib/api'

export default function SeriesPicker({ userId, seriesList, value, onChange, onCreated }) {
  const [creating, setCreating] = useState(false)
  const [title,    setTitle]    = useState('')
  const [goal,     setGoal]     = useState('')
  const [busy,     setBusy]     = useState(false)
  const [error,    setError]    = useState('')

  async function create() {
    if (!title.trim()) { setError('Give the series a title.'); return }
    const goalNum = goal ? parseInt(goal, 10) : null
    if (goal && (!goalNum || goalNum < 1 || goalNum > 1000)) { setError('Goal must be 1–1000 days.'); return }
    setBusy(true); setError('')
    try {
      const s = await createSeries({ user_id: userId, title, goal_days: goalNum })
      onCreated(s)
      setCreating(false); setTitle(''); setGoal('')
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  if (creating) {
    return (
      <div className="series-new">
        <div className="form-2col">
          <input className="field" placeholder="e.g. 100 Days of SQL" value={title} onChange={e => setTitle(e.target.value)} autoFocus />
          <input className="field" type="number" min="1" max="1000" placeholder="Goal in days (optional)" value={goal} onChange={e => setGoal(e.target.value)} />
        </div>
        {error && <div className="field-error">{error}</div>}
        <div className="row mt8">
          <button type="button" className="btn btn-solid btn-sm" onClick={create} disabled={busy}>{busy ? '…' : 'Create series'}</button>
          <button type="button" className="btn btn-sm" onClick={() => setCreating(false)}>Cancel</button>
        </div>
      </div>
    )
  }

  return (
    <div className="row">
      <select className="field" value={value || ''} onChange={e => onChange(e.target.value || null)}>
        <option value="">No series</option>
        {seriesList.map(s => (
          <option key={s.id} value={s.id}>{s.title}{s.goal_days ? ` (${s.goal_days} days)` : ''}</option>
        ))}
      </select>
      <button type="button" className="btn btn-sm nowrap" onClick={() => setCreating(true)}>+ New series</button>
    </div>
  )
}
