const TABS = [
  { id: 'answer-bank', icon: '📋', label: 'Answer Bank' },
  { id: 'session-log', icon: '🗒️', label: 'Session Log' },
  { id: 'flashcards',  icon: '🃏', label: 'Flashcards'  },
]

export default function Nav({ tab, onTabChange }) {
  return (
    <nav className="nav">
      {TABS.map(t => (
        <button
          key={t.id}
          className={`nav-tab${tab === t.id ? ' active' : ''}`}
          onClick={() => onTabChange(t.id)}
        >
          <span className="nav-tab-icon">{t.icon}</span> {t.label}
        </button>
      ))}
    </nav>
  )
}
