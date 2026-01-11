import { NavLink } from 'react-router-dom'

export default function NavBar() {
  const linkStyle = ({ isActive }) => ({
    marginRight: 12,
    textDecoration: 'none',
    color: isActive ? '#1e88e5' : '#222',
  })

  return (
    <nav style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
      <NavLink to="/" style={linkStyle} end>
        Home
      </NavLink>
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
      <NavLink to="/about" style={linkStyle}>
        About
      </NavLink>
      <NavLink to="/login" style={linkStyle}>
        Login
      </NavLink>
      <NavLink to="/register" style={linkStyle}>
        Register
      </NavLink>
    </nav>
  )
}
