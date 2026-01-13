import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { logout } = useAuth()

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Dashboard</h2>
        <div>
          <Link to="/progress" style={{ marginRight: 12 }}>
            Progress
          </Link>
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      <section style={{ marginTop: 16 }}>
        <Link to="/workouts/new">
          <button style={{ padding: '8px 12px' }}>Add Workout</button>
        </Link>
      </section>

      <section style={{ marginTop: 24 }}>
        <h3>Recent Workouts</h3>
        <ul>
          <li>Leg Day — 2025-12-01</li>
          <li>Upper Body — 2025-11-27</li>
        </ul>
      </section>
    </div>
  )
}
