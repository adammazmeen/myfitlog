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
import { RequireAuth, RedirectIfAuth } from './components/AuthGuard'

export default function App() {
  return (
    <div className="App">
      <NavBar />
      <main style={{ padding: 16 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<RedirectIfAuth><Login /></RedirectIfAuth>} />
          <Route path="/register" element={<RedirectIfAuth><Register /></RedirectIfAuth>} />
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/progress" element={<RequireAuth><ProgressPhotos /></RequireAuth>} />
          <Route path="/about" element={<About />} />
          <Route path="/workouts" element={<RequireAuth><Workouts /></RequireAuth>} />
          <Route path="/workouts/new" element={<RequireAuth><NewWorkout /></RequireAuth>} />
          <Route path="/workouts/:id" element={<RequireAuth><WorkoutDetail /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
