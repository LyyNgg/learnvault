import { useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useViewMode } from '../hooks/useViewMode'
import { usePagedPosts } from '../hooks/usePagedPosts'
import { listPosts } from '../lib/api'
import ViewToggle from '../components/ViewToggle'
import PostList from '../components/PostList'

export default function TagPage() {
  const { tag } = useParams()
  const { user } = useAuth()
  const [mode, setMode] = useViewMode('grid')
  const feed = usePagedPosts(page => listPosts({ tag, publicOnly: true, page }), user?.id, `tag:${tag}`)

  return (
    <>
      <div className="sec-head">
        <h1 className="sec-title">#{tag}</h1>
        <ViewToggle mode={mode} onChange={setMode} />
      </div>
      <PostList mode={mode} {...feed} empty={`No public posts tagged #${tag} yet.`} />
    </>
  )
}
