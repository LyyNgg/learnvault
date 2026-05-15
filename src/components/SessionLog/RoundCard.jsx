import RoundForm from './RoundForm'

function Badge({ outcome }) {
  const map = { pass: ['pass','Passed'], fail: ['fail','Failed'], pending: ['pending','Pending'] }
  const [cls, label] = map[outcome] || ['pending','Pending']
  return <span className={`badge badge-${cls}`}>{label}</span>
}

export default function RoundCard({ round, isEditing, isLast, bankEntries, onStartEdit, onCancelEdit, onSaveEdit, onDelete, onUpdateOutcome }) {
  const dotClass = isEditing ? 'editing' : round.outcome

  return (
    <div className="round-row">
      <div className="round-connector">
        <div className={`round-dot ${dotClass}`} />
        {!isLast && <div className="round-line" />}
      </div>

      <div className={`round-card${isEditing ? ' editing' : ''}`}>
        <div className="round-card-head">
          <span className="round-num">Round {round.num}</span>
          <span className="round-type">{round.type}</span>
          {round.date && <span className="round-date">{round.date}</span>}
        </div>

        {isEditing
          ? <RoundForm round={round} bankEntries={bankEntries} onSave={onSaveEdit} onCancel={onCancelEdit} />
          : <>
              <div className="round-card-body">
                <div className="round-col-grid">
                  <div>
                    <div className="round-col-label">Interviewer</div>
                    <div className="round-col-val">
                      {round.interviewer || <em>—</em>}
                      {round.interviewer_role && <span style={{ color: 'var(--faded)', fontSize: 11 }}> ({round.interviewer_role})</span>}
                    </div>
                  </div>
                  <div>
                    <div className="round-col-label">Outcome</div>
                    <div className="round-col-val"><Badge outcome={round.outcome} /></div>
                  </div>
                  {round.went_wrong && (
                    <div>
                      <div className="round-col-label">What Went Wrong</div>
                      <div className="round-col-val">{round.went_wrong}</div>
                    </div>
                  )}
                  {round.lessons && (
                    <div>
                      <div className="round-col-label">Lessons</div>
                      <div className="round-col-val">{round.lessons}</div>
                    </div>
                  )}
                </div>

                {round.tags.length > 0 && (
                  <div className="round-tags">
                    {round.tags.map(t => <span key={t} className="pill">{t}</span>)}
                  </div>
                )}

                {round.questions_asked.length > 0 && (
                  <div className="round-qs">
                    <div className="round-qs-label">Questions asked in this round</div>
                    {round.questions_asked.map(qid => {
                      const entry = bankEntries.find(e => e.id === qid)
                      return (
                        <div key={qid} className="round-qs-item">
                          {entry
                            ? <>{entry.question} {entry.tag && <span className="tag">{entry.tag}</span>}</>
                            : <em className="muted">Question removed from Answer Bank</em>
                          }
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="round-card-footer">
                <button className={`btn btn-sm${round.outcome === 'pass' ? ' btn-right' : ''}`} onClick={() => onUpdateOutcome('pass')}>Passed</button>
                <button className={`btn btn-sm${round.outcome === 'pending' ? ' btn-accent' : ''}`} onClick={() => onUpdateOutcome('pending')}>Pending</button>
                <button className={`btn btn-sm${round.outcome === 'fail' ? ' btn-wrong' : ''}`} onClick={() => onUpdateOutcome('fail')}>Failed</button>
                <div className="round-card-footer-spacer" />
                <button className="btn btn-sm" onClick={onStartEdit}>Edit</button>
                <button className="btn btn-sm btn-wrong" onClick={onDelete}>Delete</button>
              </div>
            </>
        }
      </div>
    </div>
  )
}
