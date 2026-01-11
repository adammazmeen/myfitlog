import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import NavBar from './components/NavBar'
import Home from './pages/Home'
import Workouts from './pages/Workouts'
import WorkoutDetail from './pages/WorkoutDetail'
import NewWorkout from './pages/NewWorkout'

export default function App() {
  return (
    <div className="App">
      <NavBar />
      <main style={{ padding: 16 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/workouts/new" element={<NewWorkout />} />
          <Route path="/workouts/:id" element={<WorkoutDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
