export default function UserBar({ email, onSignOut }) {
  return (
    <div className="user-bar">
      <span>{email}</span>
      <button className="btn btn-sm" onClick={onSignOut}>Sign Out</button>
    </div>
  )
}
