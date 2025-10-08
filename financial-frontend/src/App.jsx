import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Navbar from './components/Navbar'
import './App.css'

// Import das novas páginas
import ProfilePage from './pages/Profile/ProfilePage'
import SettingsPage from './pages/Settings/SettingsPage'
import ExportPage from './pages/Export/ExportPage'
import AboutPage from './pages/About/AboutPage'

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
          {/* Rotas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Rotas Protegidas */}
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
          
          {/* Novas Rotas Protegidas */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/export" 
            element={
              <ProtectedRoute>
                <ExportPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/about" 
            element={
              <ProtectedRoute>
                <AboutPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Rota coringa para SPA - Redireciona para transactions se logado, login se não */}
          <Route 
            path="*" 
            element={
              user ? <Navigate to="/transactions" /> : <Navigate to="/login" />
            } 
          />
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