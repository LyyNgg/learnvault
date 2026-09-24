import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useViewMode } from '../hooks/useViewMode'
import { usePagedPosts } from '../hooks/usePagedPosts'
import { listPosts } from '../lib/api'
import { normalizeTag } from '../lib/utils'
import ViewToggle from '../components/ViewToggle'
import PostList from '../components/PostList'

export default function Explore() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useViewMode('grid')
  const [tag,  setTag]  = useState('')

  const feed = usePagedPosts(page => listPosts({ publicOnly: true, page }), user?.id, 'explore')

  function search(e) {
    e.preventDefault()
    const t = normalizeTag(tag)
    if (t) navigate(`/t/${encodeURIComponent(t)}`)
  }

  return (
    <>
      <div className="sec-head">
        <h1 className="sec-title">Explore</h1>
        <ViewToggle mode={mode} onChange={setMode} />
      </div>
      <form className="tag-search" onSubmit={search}>
        <span>#</span>
        <input className="field" placeholder="Find a tag: sql, spanish, guitar…" value={tag} onChange={e => setTag(e.target.value)} />
        <button className="btn btn-sm" type="submit">Go</button>
      </form>
      <PostList mode={mode} {...feed} empty="No public posts yet. Be the first!" />
    </>
  )
}
