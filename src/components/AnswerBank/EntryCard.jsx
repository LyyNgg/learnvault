import { useState, useEffect, useRef } from 'react'
import ConfToggle from './ConfToggle'

export default function EntryCard({ entry, isOpen, isEditing, onToggle, onStartEdit, onCancelEdit, onSaveEdit, onDelete, onUpdateConf }) {
  const [editConf, setEditConf] = useState(entry.confidence)
  const [saving,   setSaving]   = useState(false)
  const qRef   = useRef()
  const aRef   = useRef()
  const tagRef = useRef()

  useEffect(() => {
    if (isEditing) setEditConf(entry.confidence)
  }, [isEditing, entry.confidence])

  async function handleSave() {
    const q = qRef.current?.value.trim()
    if (!q) { qRef.current?.focus(); return }
    setSaving(true)
    await onSaveEdit({ question: q, answer: aRef.current?.value.trim() || '', tag: tagRef.current?.value.trim() || '', confidence: editConf })
    setSaving(false)
  }

  const dotConf = isEditing ? editConf : entry.confidence

  return (
    <div className={`ab-card${isOpen ? ' open' : ''}${isEditing ? ' editing' : ''}`}>
      <div
        className={`ab-card-header${isEditing ? ' no-collapse' : ''}`}
        onClick={isEditing ? undefined : onToggle}
      >
        <span className="ab-card-q">{entry.question}</span>
        <div className="ab-card-header-meta">
          {entry.tag && <span className="tag">{entry.tag}</span>}
          <span className={`conf-dot ${dotConf}`} />
          {isEditing && <span className="ab-card-editing-label">✎ Editing…</span>}
          <span className="ab-card-chevron">▾</span>
        </div>
      </div>

      {isOpen && !isEditing && (
        <div className="ab-card-body">
          {entry.answer
            ? <div className="ab-card-answer">{entry.answer}</div>
            : <div className="ab-card-no-answer">No answer yet.</div>
          }
          <div className="ab-card-footer">
            <ConfToggle value={entry.confidence} onChange={onUpdateConf} />
            <div className="ab-card-footer-spacer" />
            <button className="btn btn-sm" onClick={onStartEdit}>Edit</button>
            <button className="btn btn-sm btn-wrong" onClick={onDelete}>Delete</button>
          </div>
        </div>
      )}

      {isOpen && isEditing && (
        <div className="ab-card-body">
          <div style={{ padding: 0 }}>
            <div className="field-group">
              <label className="field-label">Question *</label>
              <textarea className="field" ref={qRef} rows={2} defaultValue={entry.question} />
            </div>
            <div className="field-group">
              <label className="field-label">Answer</label>
              <textarea className="field" ref={aRef} rows={4} defaultValue={entry.answer} />
            </div>
            <div className="form-2col">
              <div className="field-group">
                <label className="field-label">Domain Tag</label>
                <input type="text" className="field" ref={tagRef} defaultValue={entry.tag} maxLength={40} />
              </div>
              <div className="field-group">
                <label className="field-label">Confidence</label>
                <ConfToggle value={editConf} onChange={setEditConf} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button className="btn btn-solid btn-sm" onClick={handleSave} disabled={saving}>
                {saving ? '…' : 'Save Changes'}
              </button>
              <button className="btn btn-sm" onClick={onCancelEdit}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
