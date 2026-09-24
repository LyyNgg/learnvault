import { useState } from 'react'
import { safeUrl, hostOf } from '../../lib/utils'

export default function LinksInput({ links, onChange }) {
  const [url,   setUrl]   = useState('')
  const [label, setLabel] = useState('')
  const [error, setError] = useState('')

  function add() {
    const clean = safeUrl(url)
    if (!clean) { setError('Enter a full http(s):// URL.'); return }
    onChange([...links, { url: clean, label: label.trim() }])
    setUrl(''); setLabel(''); setError('')
  }

  function onKey(e) { if (e.key === 'Enter') { e.preventDefault(); add() } }

  return (
    <div>
      {links.length > 0 && (
        <ul className="link-list">
          {links.map((l, i) => (
            <li key={i}>
              <span className="link-list-label">{l.label || hostOf(l.url)}</span>
              <span className="link-list-url">{l.url}</span>
              <button type="button" className="chip-remove" aria-label="Remove link" onClick={() => onChange(links.filter((_, j) => j !== i))}>×</button>
            </li>
          ))}
        </ul>
      )}
      <div className="link-add">
        <input className="field" placeholder="https://…" value={url} onChange={e => setUrl(e.target.value)} onKeyDown={onKey} />
        <input className="field" placeholder="Label (optional)" value={label} onChange={e => setLabel(e.target.value)} onKeyDown={onKey} />
        <button type="button" className="btn btn-sm" onClick={add} disabled={!url.trim()}>Add</button>
      </div>
      {error && <div className="field-error">{error}</div>}
    </div>
  )
}
