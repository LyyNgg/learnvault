import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { normalizeEntry, nowISO } from '../../lib/utils'
import AddEntryForm from './AddEntryForm'
import EntryCard from './EntryCard'

export default function AnswerBank({ entries, setEntries, userId }) {
  const [showAdd,    setShowAdd]    = useState(false)
  const [openIds,    setOpenIds]    = useState(new Set())
  const [editingId,  setEditingId]  = useState(null)

  function toggleOpen(id) {
    if (editingId === id) return
    setOpenIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function startEdit(id) {
    setShowAdd(false)
    setEditingId(id)
    setOpenIds(prev => new Set([...prev, id]))
  }

  function cancelEdit() { setEditingId(null) }

  async function handleSaveAdd(values) {
    const { data, error } = await supabase
      .from('entries')
      .insert({ user_id: userId, ...values })
      .select().single()
    if (error) { alert(error.message); return }
    setEntries(prev => [...prev, normalizeEntry(data)])
    setShowAdd(false)
  }

  async function handleSaveEdit(id, values) {
    const updates = { ...values, updated_at: nowISO() }
    const { error } = await supabase.from('entries').update(updates).eq('id', id)
    if (error) { alert(error.message); return }
    setEntries(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e))
    setEditingId(null)
  }

  async function handleDelete(id) {
    const { error } = await supabase.from('entries').delete().eq('id', id)
    if (error) { alert(error.message); return }
    setEntries(prev => prev.filter(e => e.id !== id))
    setOpenIds(prev => { const next = new Set(prev); next.delete(id); return next })
  }

  async function handleUpdateConf(id, confidence) {
    const updated_at = nowISO()
    const { error } = await supabase.from('entries').update({ confidence, updated_at }).eq('id', id)
    if (error) { alert(error.message); return }
    setEntries(prev => prev.map(e => e.id === id ? { ...e, confidence, updated_at } : e))
  }

  return (
    <section>
      <div className="sec-head">
        <span className="sec-title">Answer Bank</span>
        <span className="sec-count">{entries.length} {entries.length === 1 ? 'item' : 'items'}</span>
      </div>

      <div style={{ marginTop: 16 }}>
        <button
          className="btn btn-solid btn-sm"
          onClick={() => { setShowAdd(v => !v); if (!showAdd) cancelEdit() }}
        >
          + Add Q&amp;A
        </button>
      </div>

      {showAdd && (
        <AddEntryForm
          onSave={handleSaveAdd}
          onCancel={() => setShowAdd(false)}
        />
      )}

      <div className="ab-list">
        {entries.map(entry => (
          <EntryCard
            key={entry.id}
            entry={entry}
            isOpen={openIds.has(entry.id)}
            isEditing={editingId === entry.id}
            onToggle={() => toggleOpen(entry.id)}
            onStartEdit={() => startEdit(entry.id)}
            onCancelEdit={cancelEdit}
            onSaveEdit={values => handleSaveEdit(entry.id, values)}
            onDelete={() => handleDelete(entry.id)}
            onUpdateConf={conf => handleUpdateConf(entry.id, conf)}
          />
        ))}
      </div>
    </section>
  )
}
