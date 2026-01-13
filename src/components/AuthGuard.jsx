import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

export function RedirectIfAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div>Loading...</div>
  if (user) return <Navigate to="/dashboard" replace />
  return children
}
