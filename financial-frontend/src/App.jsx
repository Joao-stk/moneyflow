import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Navbar from './components/Navbar'
import './App.css'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  const location = useLocation()
  
  if (!user) {
    // Salva a rota que o usuário tentou acessar
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  
  return children
}

function AppLayout() {
  const { user } = useAuth()
  const location = useLocation()
  
  // Não mostrar navbar nas páginas de auth
  const showNavbar = user && !['/login', '/register'].includes(location.pathname)

  return (
    <div className="App">
      {showNavbar && <Navbar />}
      <div className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/transactions" 
            element={
              <ProtectedRoute>
                <Transactions />
              </ProtectedRoute>
            } 
          />
          {/* Rota coringa para SPA */}
          <Route path="*" element={<Navigate to="/transactions" />} />
        </Routes>
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  )
}

export default App