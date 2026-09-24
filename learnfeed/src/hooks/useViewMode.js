import { useState } from 'react'

const KEY = 'learnfeed:view-mode'

function read(fallback) {
  try { return localStorage.getItem(KEY) || fallback } catch { return fallback }
}

// 'feed' | 'grid', remembered per browser.
export function useViewMode(fallback = 'feed') {
  const [mode, setModeState] = useState(() => read(fallback))
  function setMode(m) {
    setModeState(m)
    try { localStorage.setItem(KEY, m) } catch { /* private mode etc. */ }
  }
  return [mode, setMode]
}
