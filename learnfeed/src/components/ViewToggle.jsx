export default function ViewToggle({ mode, onChange, labels = { feed: 'Feed', grid: 'Grid' } }) {
  return (
    <div className="view-toggle" role="group" aria-label="View mode">
      {['feed', 'grid'].map(m => (
        <button
          key={m}
          className={`view-toggle-btn${mode === m ? ' active' : ''}`}
          aria-pressed={mode === m}
          onClick={() => onChange(m)}
        >
          {m === 'feed' ? '☰' : '▦'} {labels[m]}
        </button>
      ))}
    </div>
  )
}
