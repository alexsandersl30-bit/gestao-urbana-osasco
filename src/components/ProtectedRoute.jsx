import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { canAccessRoute } from '../utils/roles'
import Loading from './Loading'

export default function ProtectedRoute({ children, gestorOnly }) {
  const { user, perfil, loading } = useAuth()

  if (loading) return <Loading />
  if (!user) return <Navigate to="/login" replace />

  const path = window.location.pathname
  if (gestorOnly || !canAccessRoute(perfil, path)) {
    return <Navigate to="/" replace />
  }

  return children
}
