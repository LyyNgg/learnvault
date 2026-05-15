import { useState } from 'react'
import RoundCard from './RoundCard'
import RoundForm from './RoundForm'

function Badge({ overall }) {
  const map = { active: ['active','In Progress'], pass: ['pass','Passed'], fail: ['fail','Failed'], pending: ['pending','Pending'] }
  const [cls, label] = map[overall] || ['pending','Pending']
  return <span className={`badge badge-${cls}`}>{label}</span>
}

export default function AppCard({ app, isOpen, bankEntries, onToggle, onDelete, onAddRound, onEditRound, onDeleteRound, onUpdateOutcome }) {
  const [editingRoundId, setEditingRoundId] = useState(null)
  const [showAddRound,   setShowAddRound]   = useState(false)

  const passCount = app.rounds.filter(r => r.outcome === 'pass').length
  const failCount = app.rounds.filter(r => r.outcome === 'fail').length
  const pendCount = app.rounds.filter(r => r.outcome === 'pending').length

  function startEdit(id) { setShowAddRound(false); setEditingRoundId(id) }
  function cancelEdit()  { setEditingRoundId(null) }
  function showAdd()     { setEditingRoundId(null); setShowAddRound(true) }
  function cancelAdd()   { setShowAddRound(false) }

  async function handleSaveEdit(values) {
    await onEditRound(editingRoundId, values)
    setEditingRoundId(null)
  }

  async function handleAddRound(values) {
    await onAddRound(values)
    setShowAddRound(false)
  }

  return (
    <div className={`app-card${isOpen ? ' open' : ''}`}>
      <div className="app-card-header" onClick={onToggle}>
        <div className="app-card-company">
          <div className="app-card-company-name">{app.company}</div>
          {app.role && <div className="app-card-company-role">{app.role}</div>}
        </div>
        <div className="app-card-meta">
          <span className="pill">{app.rounds.length} {app.rounds.length === 1 ? 'round' : 'rounds'}</span>
          <Badge overall={app.overall} />
          <span className="app-card-chevron">▾</span>
        </div>
      </div>

      {isOpen && (
        <div className="app-card-body">
          <div className="app-stats">
            {app.applied && <span>Applied: <span className="app-stat-val">{app.applied}</span></span>}
            <span>Rounds: <span className="app-stat-val">{app.rounds.length}</span></span>
            {passCount > 0 && <span className="app-stat-val" style={{ color: 'var(--green)' }}>✓ {passCount} passed</span>}
            {failCount > 0 && <span className="app-stat-val" style={{ color: 'var(--stamp)' }}>✕ {failCount} failed</span>}
            {pendCount > 0 && <span className="app-stat-val" style={{ color: 'var(--yellow)' }}>◌ {pendCount} pending</span>}
          </div>

          {app.rounds.length > 0 && (
            <div className="round-timeline">
              {app.rounds.map((round, i) => (
                <RoundCard
                  key={round.id}
                  round={round}
                  isEditing={editingRoundId === round.id}
                  isLast={i === app.rounds.length - 1}
                  bankEntries={bankEntries}
                  onStartEdit={() => startEdit(round.id)}
                  onCancelEdit={cancelEdit}
                  onSaveEdit={handleSaveEdit}
                  onDelete={() => onDeleteRound(round.id)}
                  onUpdateOutcome={outcome => onUpdateOutcome(round.id, outcome)}
                />
              ))}
            </div>
          )}

          {showAddRound
            ? <div style={{ borderTop: '1px solid var(--border)' }}>
                <RoundForm bankEntries={bankEntries} onSave={handleAddRound} onCancel={cancelAdd} />
              </div>
            : <div className="add-round-bar">
                <span className="add-round-hint">Round {app.rounds.length + 1}</span>
                <button className="btn btn-sm" onClick={showAdd}>+ Add Round</button>
              </div>
          }

          <div className="app-card-footer">
            <button className="btn btn-sm btn-wrong" onClick={onDelete}>Delete App</button>
          </div>
        </div>
      )}
    </div>
  )
}
