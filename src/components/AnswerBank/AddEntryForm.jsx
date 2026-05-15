import { useState } from 'react'
import ConfToggle from './ConfToggle'

export default function AddEntryForm({ onSave, onCancel }) {
  const [question,   setQuestion]   = useState('')
  const [answer,     setAnswer]     = useState('')
  const [tag,        setTag]        = useState('')
  const [confidence, setConfidence] = useState('ok')
  const [saving,     setSaving]     = useState(false)

  async function handleSave() {
    if (!question.trim()) return
    setSaving(true)
    await onSave({ question: question.trim(), answer: answer.trim(), tag: tag.trim(), confidence })
    setSaving(false)
  }

  return (
    <div className="ab-add-form">
      <div className="form-2col">
        <div className="field-group" style={{ gridColumn: '1/-1' }}>
          <label className="field-label">Question *</label>
          <textarea
            className="field" rows={2}
            placeholder="e.g. How would you improve Spotify's discovery feature?"
            value={question} onChange={e => setQuestion(e.target.value)}
          />
        </div>
        <div className="field-group" style={{ gridColumn: '1/-1' }}>
          <label className="field-label">Answer</label>
          <textarea className="field" rows={4} placeholder="Your drafted answer…" value={answer} onChange={e => setAnswer(e.target.value)} />
        </div>
        <div className="field-group">
          <label className="field-label">Domain Tag</label>
          <input type="text" className="field" maxLength={40} placeholder="e.g. Product Sense" value={tag} onChange={e => setTag(e.target.value)} />
        </div>
        <div className="field-group">
          <label className="field-label">Confidence</label>
          <ConfToggle value={confidence} onChange={setConfidence} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button className="btn btn-solid btn-sm" onClick={handleSave} disabled={saving || !question.trim()}>
          {saving ? '…' : 'Save Entry'}
        </button>
        <button className="btn btn-sm" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}
