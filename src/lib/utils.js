export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

export function nowISO() {
  return new Date().toISOString()
}

export function deriveOverall(rounds) {
  if (!rounds.length)                          return 'active'
  if (rounds.some(r => r.outcome === 'fail'))  return 'fail'
  if (rounds.every(r => r.outcome === 'pass')) return 'pass'
  return 'pending'
}

export function normalizeEntry(row) {
  return {
    id:           row.id,
    question:     row.question     || '',
    answer:       row.answer       || '',
    tag:          row.tag          || '',
    confidence:   row.confidence   || 'ok',
    created_at:   row.created_at,
    updated_at:   row.updated_at,
    review_count: row.review_count || 0,
    next_review:  row.next_review  || null,
  }
}

export function normalizeRound(row) {
  return {
    id:               row.id,
    application_id:   row.application_id,
    num:              row.num              || 1,
    type:             row.type             || '',
    date:             row.date             || '',
    interviewer:      row.interviewer      || '',
    interviewer_role: row.interviewer_role || '',
    outcome:          row.outcome          || 'pending',
    went_wrong:       row.went_wrong       || '',
    lessons:          row.lessons          || '',
    tags:             row.tags             || [],
    questions_asked:  row.questions_asked  || [],
  }
}
