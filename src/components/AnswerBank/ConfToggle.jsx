const LEVELS = [
  { value: 'weak',   label: 'Weak'  },
  { value: 'ok',     label: 'Okay'  },
  { value: 'strong', label: 'Strong'},
]

export default function ConfToggle({ value, onChange }) {
  return (
    <div className="conf-toggle">
      {LEVELS.map(l => (
        <button
          key={l.value}
          className={`conf-btn${value === l.value ? ` active-${l.value}` : ''}`}
          onClick={() => onChange(l.value)}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}
