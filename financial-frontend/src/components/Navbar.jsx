import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useState, useEffect } from 'react'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  // Detecta se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Verifica se a rota está ativa
  const isActive = (path) => location.pathname === path

  // Fecha menu mobile ao clicar em um link
  const handleMobileLinkClick = () => {
    setShowMobileMenu(false)
  }

  return (
    <nav style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: isMobile ? '0.8rem 0' : '1rem 0',
      marginBottom: '2rem',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      position: 'relative'
    }}>
      <div className="container">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: isMobile ? '0.5rem' : '1rem'
        }}>
          {/* Logo e Hamburger Menu */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: isMobile ? '1rem' : '2rem',
            flexWrap: 'wrap'
          }}>
            {/* Hamburger Menu para Mobile */}
            {user && isMobile && (
              <button 
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.1)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'none'
                }}
              >
                ☰
              </button>
            )}
            
            <Link 
              to="/dashboard" 
              style={{ 
                color: 'white', 
                textDecoration: 'none', 
                fontSize: isMobile ? '1.3rem' : '1.5rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onClick={handleMobileLinkClick}
            >
              <div style={{
                width: isMobile ? '28px' : '32px',
                height: isMobile ? '28px' : '32px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: isMobile ? '16px' : '18px'
              }}>
                💰
              </div>
              FinFly
            </Link>
            
            {/* Menu de Navegação - Desktop */}
            {user && !isMobile && (
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
                    fontWeight: isActive('/dashboard') ? '600' : '400',
                    fontSize: '0.9rem'
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
                  📊 Dashboard
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
                    fontWeight: isActive('/transactions') ? '600' : '400',
                    fontSize: '0.9rem'
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
                  💰 Lançamentos
                </Link>
              </div>
            )}
          </div>

          {/* Área do Usuário */}
          {user && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: isMobile ? '0.5rem' : '1rem',
              flexWrap: 'wrap'
            }}>
              {/* Informações do usuário - Esconder nome no mobile muito pequeno */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255,255,255,0.1)',
                padding: isMobile ? '0.4rem 0.8rem' : '0.5rem 1rem',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <div style={{
                  width: isMobile ? '28px' : '32px',
                  height: isMobile ? '28px' : '32px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isMobile ? '12px' : '14px',
                  fontWeight: 'bold'
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                {(!isMobile || window.innerWidth > 400) && (
                  <span style={{ 
                    color: 'white', 
                    fontWeight: '500',
                    fontSize: isMobile ? '0.8rem' : '0.9rem'
                  }}>
                    Olá, {user.name.split(' ')[0]}
                  </span>
                )}
              </div>
              
              {/* Botão Sair - Ícone no mobile */}
              <button 
                onClick={handleLogout}
                style={{ 
                  padding: isMobile ? '0.6rem' : '0.5rem 1rem',
                  fontSize: isMobile ? '1.1rem' : '0.9rem',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: isMobile ? '50%' : '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontWeight: '500',
                  width: isMobile ? '40px' : 'auto',
                  height: isMobile ? '40px' : 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.2)'
                  e.target.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.1)'
                  e.target.style.transform = 'translateY(0px)'
                }}
                title={isMobile ? "Sair" : ""}
              >
                {isMobile ? '🚪' : 'Sair'}
              </button>
            </div>
          )}
        </div>

        {/* Menu Mobile Dropdown */}
        {user && isMobile && showMobileMenu && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            zIndex: 1000,
            padding: '1rem'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <Link 
                to="/dashboard" 
                style={{ 
                  color: 'white', 
                  textDecoration: 'none',
                  padding: '1rem',
                  borderRadius: '8px',
                  background: isActive('/dashboard') ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                  border: isActive('/dashboard') ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.2)',
                  transition: 'all 0.3s ease',
                  fontWeight: isActive('/dashboard') ? '600' : '400',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
                onClick={handleMobileLinkClick}
              >
                📊 Dashboard
              </Link>
              <Link 
                to="/transactions" 
                style={{ 
                  color: 'white', 
                  textDecoration: 'none',
                  padding: '1rem',
                  borderRadius: '8px',
                  background: isActive('/transactions') ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                  border: isActive('/transactions') ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.2)',
                  transition: 'all 0.3s ease',
                  fontWeight: isActive('/transactions') ? '600' : '400',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
                onClick={handleMobileLinkClick}
              >
                💰 Lançamentos
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Overlay para fechar menu ao clicar fora */}
      {showMobileMenu && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.3)',
            zIndex: 999
          }}
          onClick={() => setShowMobileMenu(false)}
        />
      )}
    </nav>
  )
}

export default Navbar