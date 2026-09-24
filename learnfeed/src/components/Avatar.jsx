export default function Avatar({ profile, size = 36 }) {
  const name = profile?.display_name || profile?.username || '?'
  const style = { width: size, height: size, fontSize: Math.round(size * 0.42) }
  if (profile?.avatar_url) {
    return <img className="avatar" src={profile.avatar_url} alt="" style={style} />
  }
  return <span className="avatar avatar-initial" style={style} aria-hidden="true">{name[0].toUpperCase()}</span>
}
