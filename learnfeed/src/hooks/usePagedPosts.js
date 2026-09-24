import { useEffect, useState, useCallback } from 'react'
import { PAGE_SIZE, getLikedPostIds } from '../lib/api'

// Loads posts page by page via `fetchPage(page)`, and tracks which ones the viewer liked.
// `key` resets the list whenever the query changes (e.g. a different tag or profile).
export function usePagedPosts(fetchPage, viewerId, key) {
  const [posts,   setPosts]   = useState([])
  const [liked,   setLiked]   = useState(new Set())
  const [page,    setPage]    = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  const load = useCallback(async (p, replace) => {
    setLoading(true)
    setError('')
    try {
      const batch = await fetchPage(p)
      if (batch === null) { setPosts([]); setHasMore(false); return }
      const likedIds = await getLikedPostIds(viewerId, batch.map(x => x.id))
      setPosts(prev => replace ? batch : [...prev, ...batch])
      setLiked(prev => replace ? likedIds : new Set([...prev, ...likedIds]))
      setHasMore(batch.length === PAGE_SIZE)
      setPage(p)
    } catch (e) {
      setError(e.message || 'Could not load posts.')
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, viewerId])

  useEffect(() => { load(0, true) }, [load])

  return {
    posts, liked, loading, error, hasMore,
    loadMore: () => load(page + 1, false),
    removePost: id => setPosts(ps => ps.filter(p => p.id !== id)),
  }
}
