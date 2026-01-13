import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function NavBar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const linkStyle = ({ isActive }) => ({
    marginRight: 12,
    textDecoration: 'none',
    color: isActive ? '#1e88e5' : '#222',
  })

  async function handleLogout() {
    try {
      await logout()
      navigate('/')
    } catch (err) {
      console.warn('logout failed', err)
    }
  }

  return (
    <nav style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
      <NavLink to="/" style={linkStyle} end>
        Home
      </NavLink>
      {user && (
        <>
          <NavLink to="/dashboard" style={linkStyle}>
            Dashboard
          </NavLink>
          <NavLink to="/workouts" style={linkStyle}>
            Workouts
          </NavLink>
          <NavLink to="/workouts/new" style={linkStyle}>
            New Workout
          </NavLink>
          <NavLink to="/progress" style={linkStyle}>
            Progress
          </NavLink>
        </>
      )}
      <NavLink to="/about" style={linkStyle}>
        About
      </NavLink>

      <span style={{ float: 'right' }}>
        {user ? (
          <button onClick={handleLogout} style={{ marginLeft: 12 }}>
            Logout
          </button>
        ) : (
          <>
            <NavLink to="/login" style={linkStyle}>
              Login
            </NavLink>
            <NavLink to="/register" style={linkStyle}>
              Register
            </NavLink>
          </>
        )}
      </span>
    </nav>
  )
}
