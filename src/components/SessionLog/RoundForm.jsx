import { useState } from 'react'

const ROUND_TYPES = [
  'Recruiter Screen','HM Interview','Product Case','Technical Screen',
  'Peer Interview','Executive Round','Take-Home','Final Round','Offer Call',
]

export default function RoundForm({ round, bankEntries, onSave, onCancel }) {
  const r = round || {}
  const [type,      setType]      = useState(r.type      || '')
  const [date,      setDate]      = useState(r.date      || '')
  const [interviewer,setInterviewer] = useState(r.interviewer || '')
  const [iRole,     setIRole]     = useState(r.interviewer_role || '')
  const [outcome,   setOutcome]   = useState(r.outcome   || 'pending')
  const [wentWrong, setWentWrong] = useState(r.went_wrong || '')
  const [lessons,   setLessons]   = useState(r.lessons   || '')
  const [tags,      setTags]      = useState((r.tags     || []).join(', '))
  const [qIds,      setQIds]      = useState(r.questions_asked || [])
  const [saving,    setSaving]    = useState(false)

  function addQ(e) {
    const id = e.target.value
    if (!id) return
    setQIds(prev => prev.includes(id) ? prev : [...prev, id])
    e.target.value = ''
  }

  function removeQ(id) { setQIds(prev => prev.filter(q => q !== id)) }

  async function handleSave() {
    if (!type) return
    setSaving(true)
    await onSave({
      type, date: date || null,
      interviewer: interviewer.trim(),
      interviewer_role: iRole.trim(),
      outcome,
      went_wrong: wentWrong.trim(),
      lessons: lessons.trim(),
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      questions_asked: qIds,
    })
    setSaving(false)
  }

  const available = bankEntries.filter(e => !qIds.includes(e.id))

  return (
    <div className="round-form">
      <div className="form-2col">
        <div className="field-group">
          <label className="field-label">Round Type *</label>
          <select className="field" value={type} onChange={e => setType(e.target.value)}>
            <option value="">— Select —</option>
            {ROUND_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="field-group">
          <label className="field-label">Date</label>
          <input type="date" className="field" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div className="field-group">
          <label className="field-label">Interviewer</label>
          <input type="text" className="field" placeholder="Name" value={interviewer} onChange={e => setInterviewer(e.target.value)} />
        </div>
        <div className="field-group">
          <label className="field-label">Their Role</label>
          <input type="text" className="field" placeholder="e.g. Hiring Manager" value={iRole} onChange={e => setIRole(e.target.value)} />
        </div>
        <div className="field-group">
          <label className="field-label">Outcome</label>
          <select className="field" value={outcome} onChange={e => setOutcome(e.target.value)}>
            <option value="pending">Pending</option>
            <option value="pass">Passed</option>
            <option value="fail">Failed</option>
          </select>
        </div>
        <div className="field-group">
          <label className="field-label">Tags (comma-separated)</label>
          <input type="text" className="field" placeholder="Product Sense, Metrics" value={tags} onChange={e => setTags(e.target.value)} />
        </div>
        <div className="field-group" style={{ gridColumn: '1/-1' }}>
          <label className="field-label">What Went Wrong</label>
          <textarea className="field" rows={2} value={wentWrong} onChange={e => setWentWrong(e.target.value)} />
        </div>
        <div className="field-group" style={{ gridColumn: '1/-1' }}>
          <label className="field-label">Lessons Learned</label>
          <textarea className="field" rows={2} value={lessons} onChange={e => setLessons(e.target.value)} />
        </div>
        <div className="field-group" style={{ gridColumn: '1/-1' }}>
          <label className="field-label">Questions Asked</label>
          {!bankEntries.length
            ? <div className="muted" style={{ fontSize: 12 }}>No questions in your Answer Bank yet — add some there first.</div>
            : !available.length
            ? <select className="field" disabled><option>— All questions added —</option></select>
            : <select className="field" onChange={addQ} defaultValue="">
                <option value="">— Select a question —</option>
                {available.map(e => {
                  const label = `[${e.tag || 'No Tag'}] ${e.question}`.slice(0, 72)
                  return <option key={e.id} value={e.id}>{label}</option>
                })}
              </select>
          }
          {qIds.length > 0 && (
            <div className="q-chips">
              {qIds.map(id => {
                const entry = bankEntries.find(e => e.id === id)
                if (!entry) return null
                const label = (entry.tag ? `[${entry.tag}] ` : '') + entry.question.slice(0, 60) + (entry.question.length > 60 ? '…' : '')
                return (
                  <span key={id} className="chip">
                    {label}
                    <button className="chip-remove" onClick={() => removeQ(id)}>×</button>
                  </span>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button className="btn btn-solid btn-sm" onClick={handleSave} disabled={saving || !type}>
          {saving ? '…' : round ? 'Save Changes' : 'Add Round'}
        </button>
        <button className="btn btn-sm" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}
