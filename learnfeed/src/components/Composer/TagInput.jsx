import { useState } from 'react'
import { normalizeTag } from '../../lib/utils'

const MAX_TAGS = 10

export default function TagInput({ tags, onChange, suggestions = [] }) {
  const [draft, setDraft] = useState('')

  function add(raw) {
    const t = normalizeTag(raw)
    if (t && !tags.includes(t) && tags.length < MAX_TAGS) onChange([...tags, t])
    setDraft('')
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault()
      if (draft.trim()) add(draft)
    } else if (e.key === 'Backspace' && !draft && tags.length) {
      onChange(tags.slice(0, -1))
    }
  }

  const q = normalizeTag(draft)
  const matches = suggestions.filter(s => !tags.includes(s) && (!q || s.startsWith(q))).slice(0, 8)

  return (
    <div>
      <div className="chip-input">
        {tags.map(t => (
          <span key={t} className="chip">
            #{t}
            <button type="button" className="chip-remove" aria-label={`Remove ${t}`} onClick={() => onChange(tags.filter(x => x !== t))}>×</button>
          </span>
        ))}
        <input
          className="chip-input-field"
          placeholder={tags.length ? '' : 'sql, 100daysofcode, databases…'}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => draft.trim() && add(draft)}
          disabled={tags.length >= MAX_TAGS}
        />
      </div>
      {matches.length > 0 && (
        <div className="tag-suggest">
          {matches.map(s => (
            <button type="button" key={s} className="tag tag-btn" onMouseDown={e => { e.preventDefault(); add(s) }}>#{s}</button>
          ))}
        </div>
      )}
    </div>
  )
}
