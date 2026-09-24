export function normalizePost(row) {
  return {
    id:         row.id,
    user_id:    row.user_id,
    series_id:  row.series_id  || null,
    day_number: row.day_number || null,
    title:      row.title      || '',
    body:       row.body       || '',
    images:     row.images     || [],
    links:      Array.isArray(row.links) ? row.links : [],
    tags:       row.tags       || [],
    visibility: row.visibility || 'public',
    created_at: row.created_at,
    updated_at: row.updated_at,
    author:     row.author     || null,
    series:     row.series     || null,
    like_count: row.likes?.[0]?.count ?? 0,
  }
}

export function normalizeSeries(row) {
  return {
    id:          row.id,
    user_id:     row.user_id,
    title:       row.title       || '',
    description: row.description || '',
    cover_url:   row.cover_url   || '',
    goal_days:   row.goal_days   || null,
    start_date:  row.start_date,
    visibility:  row.visibility  || 'public',
    created_at:  row.created_at,
    author:      row.author      || null,
    post_count:  row.posts?.[0]?.count ?? 0,
  }
}

// "#Machine Learning " → "machine-learning"
export function normalizeTag(raw) {
  return raw.trim().toLowerCase().replace(/^#+/, '').replace(/\s+/g, '-').replace(/[^a-z0-9\-_]/g, '').slice(0, 30)
}

export function isValidUsername(u) {
  return /^[a-z0-9_]{3,20}$/.test(u)
}

// Only allow http(s) links in user-supplied URLs.
export function safeUrl(raw) {
  try {
    const u = new URL(raw.trim())
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : null
  } catch {
    return null
  }
}

export function hostOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return url }
}

export function excerpt(md, len = 220) {
  const text = md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > len ? text.slice(0, len).trimEnd() + '…' : text
}

export function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60)         return 'just now'
  if (s < 3600)       return `${Math.floor(s / 60)}m`
  if (s < 86400)      return `${Math.floor(s / 3600)}h`
  if (s < 86400 * 7)  return `${Math.floor(s / 86400)}d`
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function dayKey(d) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

// Consecutive calendar days with at least one post, ending today (or yesterday,
// so the streak isn't "broken" before you've had a chance to post today).
export function computeStreak(posts) {
  const days = new Set(posts.map(p => dayKey(new Date(p.created_at))))
  const cursor = new Date()
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1)
  let streak = 0
  while (days.has(dayKey(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}
