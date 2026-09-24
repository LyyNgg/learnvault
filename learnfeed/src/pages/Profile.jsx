import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useViewMode } from '../hooks/useViewMode'
import { usePagedPosts } from '../hooks/usePagedPosts'
import { getProfileByUsername, getFollowCounts, listPosts, listSeries } from '../lib/api'
import Avatar from '../components/Avatar'
import FollowButton from '../components/FollowButton'
import ViewToggle from '../components/ViewToggle'
import PostList from '../components/PostList'
import SeriesCard from '../components/SeriesCard'

export default function Profile() {
  const { username } = useParams()
  const { user } = useAuth()
  const [mode, setMode] = useViewMode('grid')
  const [profile, setProfile] = useState(undefined)
  const [counts,  setCounts]  = useState({ followers: 0, following: 0 })
  const [series,  setSeries]  = useState([])
  const [tab,     setTab]     = useState('posts')

  useEffect(() => {
    let cancelled = false
    setProfile(undefined); setTab('posts')
    getProfileByUsername(username).then(async p => {
      if (cancelled) return
      setProfile(p)
      if (!p) return
      const [c, s] = await Promise.all([getFollowCounts(p.id), listSeries(p.id)])
      if (!cancelled) { setCounts(c); setSeries(s) }
    }).catch(() => !cancelled && setProfile(null))
    return () => { cancelled = true }
  }, [username])

  const feed = usePagedPosts(
    page => profile ? listPosts({ userId: profile.id, page }) : Promise.resolve(null),
    user?.id,
    `profile:${profile?.id}`,
  )

  if (profile === undefined) return <div className="loading-inline">Loading…</div>
  if (profile === null)      return <div className="empty">No one goes by @{username}.</div>

  const isMe = user?.id === profile.id

  return (
    <>
      <section className="profile-head">
        <Avatar profile={profile} size={84} />
        <div className="profile-info">
          <div className="profile-name-row">
            <h1 className="profile-name">{profile.display_name || profile.username}</h1>
            {isMe
              ? <Link to="/settings" className="btn btn-sm">Edit profile</Link>
              : <FollowButton targetId={profile.id} onChange={d => setCounts(c => ({ ...c, followers: c.followers + d }))} />}
          </div>
          <div className="profile-handle">@{profile.username}</div>
          <div className="profile-stats">
            <span><strong>{series.length}</strong> series</span>
            <span><strong>{counts.followers}</strong> followers</span>
            <span><strong>{counts.following}</strong> following</span>
          </div>
          {profile.bio && <p className="profile-bio">{profile.bio}</p>}
        </div>
      </section>

      <div className="tabs">
        <button className={tab === 'posts'  ? 'active' : ''} onClick={() => setTab('posts')}>Posts</button>
        <button className={tab === 'series' ? 'active' : ''} onClick={() => setTab('series')}>Series</button>
        <span className="spacer" />
        {tab === 'posts' && <ViewToggle mode={mode} onChange={setMode} />}
      </div>

      {tab === 'posts' ? (
        <PostList mode={mode} {...feed} showAuthor={false}
          empty={isMe ? <><Link to="/new">Write your first post</Link> to start your journey.</> : 'No posts yet.'} />
      ) : series.length ? (
        <div className="series-list">{series.map(s => <SeriesCard key={s.id} series={s} />)}</div>
      ) : (
        <div className="empty">
          {isMe ? <>No series yet. Start one like "100 Days of SQL" from the <Link to="/new">composer</Link>.</> : 'No series yet.'}
        </div>
      )}
    </>
  )
}
