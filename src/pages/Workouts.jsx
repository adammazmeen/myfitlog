import { Link } from 'react-router-dom'

const MOCK = [
  { id: '1', name: 'Leg Day' },
  { id: '2', name: 'Upper Body' },
]

export default function Workouts() {
  return (
    <div>
      <h2>Workouts</h2>
      <ul>
        {MOCK.map((w) => (
          <li key={w.id}>
            <Link to={`/workouts/${w.id}`}>{w.name}</Link>
          </li>
        ))}
      </ul>
      <Link to="/workouts/new">Create new workout</Link>
    </div>
  )
}
