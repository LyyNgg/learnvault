import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { normalizeRound, deriveOverall } from '../../lib/utils'
import AppCard from './AppCard'

export default function SessionLog({ bankEntries, userId }) {
  const [applications, setApplications] = useState([])
  const [openIds,      setOpenIds]      = useState(new Set())
  const [showAdd,      setShowAdd]      = useState(false)
  const [company,      setCompany]      = useState('')
  const [role,         setRole]         = useState('')
  const [applied,      setApplied]      = useState('')
  const [saving,       setSaving]       = useState(false)

  useEffect(() => {
    async function load() {
      const [appsRes, roundsRes] = await Promise.all([
        supabase.from('applications').select('*').order('created_at', { ascending: false }),
        supabase.from('rounds').select('*').order('num'),
      ])
      const rounds = roundsRes.data || []
      setApplications((appsRes.data || []).map(app => ({
        ...app,
        applied: app.applied || '',
        role:    app.role    || '',
        rounds:  rounds.filter(r => r.application_id === app.id).map(normalizeRound),
      })))
    }
    load()
  }, [])

  function toggleOpen(id) {
    setOpenIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function syncOverall(appId, rounds) {
    const overall = deriveOverall(rounds)
    await supabase.from('applications').update({ overall }).eq('id', appId)
    return overall
  }

  async function saveApp() {
    if (!company.trim()) return
    setSaving(true)
    const { data, error } = await supabase.from('applications').insert({
      user_id: userId, company: company.trim(),
      role: role.trim(), applied: applied || null, overall: 'active',
    }).select().single()
    setSaving(false)
    if (error) { alert(error.message); return }
    const app = { ...data, applied: data.applied || '', role: data.role || '', rounds: [] }
    setApplications(prev => [app, ...prev])
    setOpenIds(prev => new Set([...prev, app.id]))
    setCompany(''); setRole(''); setApplied(''); setShowAdd(false)
  }

  async function deleteApp(appId) {
    const { error } = await supabase.from('applications').delete().eq('id', appId)
    if (error) { alert(error.message); return }
    setApplications(prev => prev.filter(a => a.id !== appId))
    setOpenIds(prev => { const next = new Set(prev); next.delete(appId); return next })
  }

  async function addRound(appId, values) {
    const app = applications.find(a => a.id === appId)
    if (!app) return
    const { data, error } = await supabase.from('rounds').insert({
      application_id: appId, user_id: userId,
      num: app.rounds.length + 1, ...values,
    }).select().single()
    if (error) { alert(error.message); return }
    const round = normalizeRound(data)
    const newRounds = [...app.rounds, round]
    const overall = await syncOverall(appId, newRounds)
    setApplications(prev => prev.map(a =>
      a.id === appId ? { ...a, rounds: newRounds, overall } : a
    ))
  }

  async function editRound(appId, roundId, values) {
    const { error } = await supabase.from('rounds').update(values).eq('id', roundId)
    if (error) { alert(error.message); return }
    let newRounds
    setApplications(prev => prev.map(a => {
      if (a.id !== appId) return a
      newRounds = a.rounds.map(r => r.id === roundId ? { ...r, ...values } : r)
      return { ...a, rounds: newRounds }
    }))
    const overall = await syncOverall(appId, newRounds)
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, overall } : a))
  }

  async function deleteRound(appId, roundId) {
    const { error } = await supabase.from('rounds').delete().eq('id', roundId)
    if (error) { alert(error.message); return }
    let newRounds
    setApplications(prev => prev.map(a => {
      if (a.id !== appId) return a
      newRounds = a.rounds.filter(r => r.id !== roundId).map((r, i) => ({ ...r, num: i + 1 }))
      return { ...a, rounds: newRounds }
    }))
    await Promise.all(newRounds.map(r => supabase.from('rounds').update({ num: r.num }).eq('id', r.id)))
    const overall = await syncOverall(appId, newRounds)
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, overall } : a))
  }

  async function updateOutcome(appId, roundId, outcome) {
    const { error } = await supabase.from('rounds').update({ outcome }).eq('id', roundId)
    if (error) { alert(error.message); return }
    let newRounds
    setApplications(prev => prev.map(a => {
      if (a.id !== appId) return a
      newRounds = a.rounds.map(r => r.id === roundId ? { ...r, outcome } : r)
      return { ...a, rounds: newRounds }
    }))
    const overall = await syncOverall(appId, newRounds)
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, overall } : a))
  }

  const totalRounds = applications.reduce((s, a) => s + a.rounds.length, 0)

  return (
    <section>
      <div className="sec-head">
        <span className="sec-title">Session Log</span>
        <span className="sec-count">{applications.length} co · {totalRounds} rounds</span>
      </div>

      <div style={{ marginTop: 16 }}>
        <button className="btn btn-solid btn-sm" onClick={() => setShowAdd(v => !v)}>
          + New Application
        </button>
      </div>

      {showAdd && (
        <div className="sl-add-form">
          <div className="form-2col">
            <div className="field-group">
              <label className="field-label">Company *</label>
              <input type="text" className="field" placeholder="e.g. Grab" value={company} onChange={e => setCompany(e.target.value)} />
            </div>
            <div className="field-group">
              <label className="field-label">Role</label>
              <input type="text" className="field" placeholder="e.g. Product Manager, Fintech" value={role} onChange={e => setRole(e.target.value)} />
            </div>
            <div className="field-group">
              <label className="field-label">Applied Date</label>
              <input type="date" className="field" value={applied} onChange={e => setApplied(e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn btn-solid btn-sm" onClick={saveApp} disabled={saving || !company.trim()}>
              {saving ? '…' : 'Save Application'}
            </button>
            <button className="btn btn-sm" onClick={() => { setShowAdd(false); setCompany(''); setRole(''); setApplied('') }}>Cancel</button>
          </div>
        </div>
      )}

      <div className="sl-list">
        {applications.map(app => (
          <AppCard
            key={app.id}
            app={app}
            isOpen={openIds.has(app.id)}
            bankEntries={bankEntries}
            onToggle={() => toggleOpen(app.id)}
            onDelete={() => deleteApp(app.id)}
            onAddRound={values => addRound(app.id, values)}
            onEditRound={(roundId, values) => editRound(app.id, roundId, values)}
            onDeleteRound={roundId => deleteRound(app.id, roundId)}
            onUpdateOutcome={(roundId, outcome) => updateOutcome(app.id, roundId, outcome)}
          />
        ))}
      </div>
    </section>
  )
}
