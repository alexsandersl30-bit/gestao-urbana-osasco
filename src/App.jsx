import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Loading from './components/Loading'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import PontosViciados from './pages/PontosViciados'
import Cacambas from './pages/Cacambas'
import Varricao from './pages/Varricao'
import Ecopontos from './pages/Ecopontos'
import Protocolos156 from './pages/Protocolos156'
import Usuarios from './pages/Usuarios'

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Loading />
  if (user) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="pontos-viciados" element={<PontosViciados />} />
            <Route path="cacambas" element={<Cacambas />} />
            <Route path="varricao" element={<Varricao />} />
            <Route path="ecopontos" element={<Ecopontos />} />
            <Route path="protocolos-156" element={<Protocolos156 />} />
            <Route path="protocolos" element={<Navigate to="/protocolos-156" replace />} />
            <Route
              path="usuarios"
              element={
                <ProtectedRoute gestorOnly>
                  <Usuarios />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
