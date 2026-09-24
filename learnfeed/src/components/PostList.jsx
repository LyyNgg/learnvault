import PostCard from './PostCard'
import PostGridTile from './PostGridTile'

export default function PostList({ mode, posts, liked, loading, error, hasMore, loadMore, empty, showAuthor = true }) {
  if (error) return <div className="notice notice-error">{error}</div>
  if (!loading && !posts.length) return <div className="empty">{empty}</div>

  return (
    <>
      {mode === 'grid' ? (
        <div className="post-grid">
          {posts.map(p => <PostGridTile key={p.id} post={p} />)}
        </div>
      ) : (
        <div className="post-feed">
          {posts.map(p => <PostCard key={p.id} post={p} liked={liked.has(p.id)} showAuthor={showAuthor} />)}
        </div>
      )}
      {loading && <div className="loading-inline">Loading…</div>}
      {!loading && hasMore && (
        <div className="load-more"><button className="btn" onClick={loadMore}>Load more</button></div>
      )}
    </>
  )
}
