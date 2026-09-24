export default function SeriesProgress({ done, goal, streak, compact }) {
  const pct = goal ? Math.min(100, Math.round((done / goal) * 100)) : null
  return (
    <div className={`series-progress${compact ? ' compact' : ''}`}>
      <div className="series-progress-stats">
        <span><strong>{done}</strong>{goal ? ` / ${goal} days` : ` post${done === 1 ? '' : 's'}`}</span>
        {pct !== null && <span>{pct}%</span>}
        {streak > 0 && <span className="streak">🔥 {streak}-day streak</span>}
      </div>
      {pct !== null && (
        <div className="progress-bar-wrap" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  )
}
