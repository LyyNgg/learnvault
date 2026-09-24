import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useViewMode } from '../hooks/useViewMode'
import { usePagedPosts } from '../hooks/usePagedPosts'
import { listPosts, getFollowingIds } from '../lib/api'
import ViewToggle from '../components/ViewToggle'
import PostList from '../components/PostList'

export default function Home() {
  const { user } = useAuth()
  const [mode, setMode] = useViewMode()

  const feed = usePagedPosts(async page => {
    const following = await getFollowingIds(user.id)
    return listPosts({ userIds: [user.id, ...following], page })
  }, user.id, `home:${user.id}`)

  return (
    <>
      <div className="sec-head">
        <h1 className="sec-title">Your feed</h1>
        <ViewToggle mode={mode} onChange={setMode} />
      </div>
      <PostList
        mode={mode}
        {...feed}
        empty={<>
          Nothing here yet. <Link to="/new">Write your first post</Link> or <Link to="/explore">find people to follow</Link>.
        </>}
      />
    </>
  )
}
