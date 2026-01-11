import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import NavBar from './components/NavBar'
import Home from './pages/Home'
import Workouts from './pages/Workouts'
import WorkoutDetail from './pages/WorkoutDetail'
import NewWorkout from './pages/NewWorkout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ProgressPhotos from './pages/ProgressPhotos'
import About from './pages/About'

export default function App() {
  return (
    <div className="App">
      <NavBar />
      <main style={{ padding: 16 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/progress" element={<ProgressPhotos />} />
          <Route path="/about" element={<About />} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/workouts/new" element={<NewWorkout />} />
          <Route path="/workouts/:id" element={<WorkoutDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
