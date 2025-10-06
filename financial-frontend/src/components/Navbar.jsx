import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Verifica se a rota está ativa
  const isActive = (path) => location.pathname === path

  return (
    <nav style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '1rem 0',
      marginBottom: '2rem',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      borderBottom: '1px solid rgba(255,255,255,0.1)'
    }}>
      <div className="container">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          {/* Logo e Nome */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '2rem',
            flexWrap: 'wrap'
          }}>
            <Link 
              to="/dashboard" 
              style={{ 
                color: 'white', 
                textDecoration: 'none', 
                fontSize: '1.5rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px'
              }}>
                💰
              </div>
              FinFly
            </Link>
            
            {/* Menu de Navegação */}
            {user && (
              <div style={{ 
                display: 'flex', 
                gap: '0.5rem',
                flexWrap: 'wrap'
              }}>
                <Link 
                  to="/dashboard" 
                  style={{ 
                    color: 'white', 
                    textDecoration: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    background: isActive('/dashboard') ? 'rgba(255,255,255,0.2)' : 'transparent',
                    border: isActive('/dashboard') ? '1px solid rgba(255,255,255,0.3)' : '1px solid transparent',
                    transition: 'all 0.3s ease',
                    fontWeight: isActive('/dashboard') ? '600' : '400'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive('/dashboard')) {
                      e.target.style.background = 'rgba(255,255,255,0.1)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive('/dashboard')) {
                      e.target.style.background = 'transparent'
                    }
                  }}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/transactions" 
                  style={{ 
                    color: 'white', 
                    textDecoration: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    background: isActive('/transactions') ? 'rgba(255,255,255,0.2)' : 'transparent',
                    border: isActive('/transactions') ? '1px solid rgba(255,255,255,0.3)' : '1px solid transparent',
                    transition: 'all 0.3s ease',
                    fontWeight: isActive('/transactions') ? '600' : '400'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive('/transactions')) {
                      e.target.style.background = 'rgba(255,255,255,0.1)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive('/transactions')) {
                      e.target.style.background = 'transparent'
                    }
                  }}
                >
                  Lançamentos
                </Link>
              </div>
            )}
          </div>

          {/* Área do Usuário */}
          {user && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255,255,255,0.1)',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span style={{ 
                  color: 'white', 
                  fontWeight: '500',
                  fontSize: '0.9rem'
                }}>
                  Olá, {user.name.split(' ')[0]}
                </span>
              </div>
              
              <button 
                onClick={handleLogout}
                style={{ 
                  padding: '0.5rem 1rem',
                  fontSize: '0.9rem',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.2)'
                  e.target.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.1)'
                  e.target.style.transform = 'translateY(0px)'
                }}
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar