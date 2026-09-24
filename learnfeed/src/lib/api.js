// All Supabase queries live here so pages stay about presentation.
// Embeds use explicit FK hints because `likes` / `follows` also link profiles to posts.
import { supabase } from './supabase'
import { normalizePost, normalizeSeries } from './utils'

export const PAGE_SIZE = 12

const AUTHOR = 'author:profiles!posts_user_id_fkey(id, username, display_name, avatar_url)'
const POST_SELECT =
  `*, ${AUTHOR}, series:series!posts_series_id_fkey(id, title, goal_days), likes!likes_post_id_fkey(count)`
const SERIES_SELECT =
  '*, author:profiles!series_user_id_fkey(id, username, display_name, avatar_url), posts!posts_series_id_fkey(count)'

function unwrap({ data, error }) {
  if (error) throw error
  return data
}

// ── Profiles ────────────────────────────────────────────────────────────────
export async function getProfile(id) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

export async function getProfileByUsername(username) {
  const { data, error } = await supabase.from('profiles').select('*').eq('username', username).maybeSingle()
  if (error) throw error
  return data
}

export async function saveProfile(profile) {
  return unwrap(await supabase.from('profiles').upsert(profile).select().single())
}

// ── Posts ───────────────────────────────────────────────────────────────────
// Generic, paginated post list. Filters: userIds, userId, tag, publicOnly.
export async function listPosts({ userIds, userId, tag, publicOnly, page = 0 } = {}) {
  let q = supabase.from('posts').select(POST_SELECT).order('created_at', { ascending: false })
  if (userIds)    q = q.in('user_id', userIds)
  if (userId)     q = q.eq('user_id', userId)
  if (tag)        q = q.contains('tags', [tag])
  if (publicOnly) q = q.eq('visibility', 'public')
  q = q.range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1)
  return unwrap(await q).map(normalizePost)
}

export async function listSeriesPosts(seriesId) {
  const data = unwrap(await supabase.from('posts').select(POST_SELECT)
    .eq('series_id', seriesId)
    .order('day_number', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true }))
  return data.map(normalizePost)
}

export async function getPost(id) {
  const { data, error } = await supabase.from('posts').select(POST_SELECT).eq('id', id).maybeSingle()
  if (error) throw error
  return data && normalizePost(data)
}

export async function savePost(post) {
  const row = {
    user_id:    post.user_id,
    series_id:  post.series_id || null,
    day_number: post.day_number || null,
    title:      post.title.trim(),
    body:       post.body,
    images:     post.images,
    links:      post.links,
    tags:       post.tags,
    visibility: post.visibility,
  }
  const q = post.id
    ? supabase.from('posts').update(row).eq('id', post.id)
    : supabase.from('posts').insert(row)
  return unwrap(await q.select('id').single())
}

export async function deletePost(id) {
  unwrap(await supabase.from('posts').delete().eq('id', id))
}

export async function nextDayNumber(seriesId) {
  const data = unwrap(await supabase.from('posts').select('day_number')
    .eq('series_id', seriesId).order('day_number', { ascending: false, nullsFirst: false }).limit(1))
  return (data[0]?.day_number || 0) + 1
}

export async function listMyTags(userId) {
  const data = unwrap(await supabase.from('posts').select('tags').eq('user_id', userId).limit(500))
  const counts = {}
  data.forEach(r => r.tags.forEach(t => { counts[t] = (counts[t] || 0) + 1 }))
  return Object.keys(counts).sort((a, b) => counts[b] - counts[a])
}

// ── Series ──────────────────────────────────────────────────────────────────
export async function listSeries(userId) {
  const data = unwrap(await supabase.from('series').select(SERIES_SELECT)
    .eq('user_id', userId).order('created_at', { ascending: false }))
  return data.map(normalizeSeries)
}

export async function getSeries(id) {
  const { data, error } = await supabase.from('series').select(SERIES_SELECT).eq('id', id).maybeSingle()
  if (error) throw error
  return data && normalizeSeries(data)
}

export async function createSeries(s) {
  return normalizeSeries(unwrap(await supabase.from('series').insert({
    user_id:     s.user_id,
    title:       s.title.trim(),
    description: s.description || '',
    goal_days:   s.goal_days || null,
    visibility:  s.visibility || 'public',
  }).select().single()))
}

export async function updateSeries(id, patch) {
  return unwrap(await supabase.from('series').update(patch).eq('id', id).select().single())
}

export async function deleteSeries(id) {
  unwrap(await supabase.from('series').delete().eq('id', id))
}

// ── Follows ─────────────────────────────────────────────────────────────────
export async function getFollowingIds(userId) {
  const data = unwrap(await supabase.from('follows').select('following_id').eq('follower_id', userId))
  return data.map(r => r.following_id)
}

export async function getFollowCounts(userId) {
  const [followers, following] = await Promise.all([
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId),
  ])
  if (followers.error) throw followers.error
  if (following.error) throw following.error
  return { followers: followers.count || 0, following: following.count || 0 }
}

export async function isFollowing(followerId, followingId) {
  const data = unwrap(await supabase.from('follows').select('follower_id')
    .eq('follower_id', followerId).eq('following_id', followingId))
  return data.length > 0
}

export async function setFollow(followerId, followingId, on) {
  const q = on
    ? supabase.from('follows').insert({ follower_id: followerId, following_id: followingId })
    : supabase.from('follows').delete().eq('follower_id', followerId).eq('following_id', followingId)
  unwrap(await q)
}

// ── Likes ───────────────────────────────────────────────────────────────────
export async function getLikedPostIds(userId, postIds) {
  if (!userId || !postIds.length) return new Set()
  const data = unwrap(await supabase.from('likes').select('post_id').eq('user_id', userId).in('post_id', postIds))
  return new Set(data.map(r => r.post_id))
}

export async function setLike(userId, postId, on) {
  const q = on
    ? supabase.from('likes').insert({ user_id: userId, post_id: postId })
    : supabase.from('likes').delete().eq('user_id', userId).eq('post_id', postId)
  unwrap(await q)
}
