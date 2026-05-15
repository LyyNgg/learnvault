import { useRef, useState } from 'react'

const TEMPLATE = `question,answer,tag,confidence
"How would you improve Spotify's discovery feature?","Start by defining the goal, then segment users by listening behaviour…","Product Sense","ok"
"DAU dropped 10% WoW. Walk me through your diagnosis.","","Metrics","weak"
`

const VALID_CONF = new Set(['weak', 'ok', 'strong'])

function parseCSV(text) {
  const rows = []
  let current = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const ch   = text[i]
    const next = text[i + 1]

    if (inQuotes) {
      if (ch === '"' && next === '"') { field += '"'; i++ }
      else if (ch === '"')            { inQuotes = false }
      else                            { field += ch }
    } else {
      if      (ch === '"')                        { inQuotes = true }
      else if (ch === ',')                        { current.push(field); field = '' }
      else if (ch === '\r' && next === '\n')      { current.push(field); field = ''; rows.push(current); current = []; i++ }
      else if (ch === '\n')                       { current.push(field); field = ''; rows.push(current); current = [] }
      else                                        { field += ch }
    }
  }
  if (field || current.length) { current.push(field); rows.push(current) }

  return rows.filter(r => r.some(f => f.trim()))
}

function rowsToEntries(rows) {
  if (rows.length < 2) return { entries: [], skipped: 0 }

  // Normalise header names
  const headers = rows[0].map(h => h.trim().toLowerCase())
  const col = name => headers.indexOf(name)

  const qIdx    = col('question')
  const aIdx    = col('answer')
  const tagIdx  = col('tag')
  const confIdx = col('confidence')

  if (qIdx === -1) return { entries: [], skipped: rows.length - 1, error: 'No "question" column found.' }

  const entries = []
  let skipped   = 0

  for (const row of rows.slice(1)) {
    const question = (row[qIdx] || '').trim()
    if (!question) { skipped++; continue }

    const rawConf  = (row[confIdx] || '').trim().toLowerCase()
    entries.push({
      question,
      answer:     (aIdx    !== -1 ? row[aIdx]    : '').trim(),
      tag:        (tagIdx  !== -1 ? row[tagIdx]  : '').trim(),
      confidence: VALID_CONF.has(rawConf) ? rawConf : 'ok',
    })
  }

  return { entries, skipped }
}

export default function CsvImport({ onImport }) {
  const inputRef           = useRef()
  const [status, setStatus] = useState(null) // { type, message }
  const [loading, setLoading] = useState(false)

  function downloadTemplate() {
    const url = URL.createObjectURL(new Blob([TEMPLATE], { type: 'text/csv' }))
    const a   = document.createElement('a')
    a.href    = url
    a.download = 'learnvault-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    e.target.value = ''

    const text = await file.text()
    const { entries, skipped, error } = rowsToEntries(parseCSV(text))

    if (error) { setStatus({ type: 'error', message: error }); return }
    if (!entries.length) {
      setStatus({ type: 'error', message: `No valid rows found${skipped ? ` (${skipped} skipped — missing question)` : ''}.` })
      return
    }

    setLoading(true)
    const result = await onImport(entries)
    setLoading(false)

    if (result.error) {
      setStatus({ type: 'error', message: result.error })
    } else {
      const msg = `Imported ${result.count} entr${result.count === 1 ? 'y' : 'ies'}` +
        (skipped ? `, skipped ${skipped} (missing question)` : '') + '.'
      setStatus({ type: 'ok', message: msg })
      setTimeout(() => setStatus(null), 4000)
    }
  }

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button className="btn btn-sm" onClick={() => inputRef.current?.click()} disabled={loading}>
          {loading ? '…' : '↑ Import CSV'}
        </button>
        <button
          onClick={downloadTemplate}
          style={{ fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--faded)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'var(--font-mono)' }}
        >
          Download template
        </button>
        <input ref={inputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFile} />
      </div>
      {status && (
        <div style={{
          fontSize: 11, padding: '4px 8px',
          color:      status.type === 'ok' ? 'var(--green)' : 'var(--stamp)',
          border:     `1px solid ${status.type === 'ok' ? 'var(--green)' : 'var(--stamp)'}`,
          background: status.type === 'ok' ? '#2D6A4F11' : '#8B250011',
        }}>
          {status.message}
        </div>
      )}
    </div>
  )
}
