import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useState, useEffect } from 'react'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

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

  // Fecha menu do usuário ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu-trigger') && !event.target.closest('.user-menu-dropdown')) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showUserMenu])

  const userMenuItems = [
    { path: '/profile', label: '👤 Meu Perfil', icon: '👤' },
    { path: '/settings', label: '⚙️ Configurações', icon: '⚙️' },
    { path: '/export', label: '📤 Exportar Dados', icon: '📤' },
    { path: '/about', label: 'ℹ️ Sobre', icon: 'ℹ️' }
  ]

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
              flexWrap: 'wrap',
              position: 'relative'
            }}>
              {/* Botão do Menu do Usuário */}
              <button 
                className="user-menu-trigger"
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'rgba(255,255,255,0.1)',
                  padding: isMobile ? '0.4rem 0.8rem' : '0.5rem 1rem',
                  borderRadius: '20px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: isMobile ? '0.8rem' : '0.9rem',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.2)'
                }}
                onMouseLeave={(e) => {
                  if (!showUserMenu) {
                    e.target.style.background = 'rgba(255,255,255,0.1)'
                  }
                }}
              >
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
                  <span>
                    Olá, {user.name.split(' ')[0]}
                  </span>
                )}
                <span style={{ 
                  fontSize: '0.8rem',
                  transition: 'transform 0.3s ease',
                  transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)'
                }}>
                  ▼
                </span>
              </button>

              {/* Menu Dropdown do Usuário */}
              {showUserMenu && (
                <div 
                  className="user-menu-dropdown"
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    background: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    border: '1px solid #e0e0e0',
                    minWidth: '200px',
                    zIndex: 1001,
                    marginTop: '0.5rem',
                    overflow: 'hidden'
                  }}
                >
                  {/* Header do Menu */}
                  <div style={{
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderBottom: '1px solid rgba(255,255,255,0.2)'
                  }}>
                    <div style={{ fontWeight: '600', fontSize: '1rem' }}>
                      {user.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                      {user.email}
                    </div>
                  </div>

                  {/* Itens do Menu */}
                  <div style={{ padding: '0.5rem 0' }}>
                    {userMenuItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.75rem 1rem',
                          color: '#333',
                          textDecoration: 'none',
                          transition: 'all 0.2s ease',
                          fontSize: '0.9rem',
                          borderLeft: '3px solid transparent'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#f8f9fa'
                          e.target.style.borderLeftColor = '#667eea'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'transparent'
                          e.target.style.borderLeftColor = 'transparent'
                        }}
                        onClick={() => setShowUserMenu(false)}
                      >
                        <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                        {item.label}
                      </Link>
                    ))}
                  </div>

                  {/* Divisor */}
                  <div style={{
                    height: '1px',
                    background: '#e0e0e0',
                    margin: '0.5rem 0'
                  }} />

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      background: 'none',
                      border: 'none',
                      color: '#dc3545',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontSize: '0.9rem',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#fff5f5'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent'
                    }}
                  >
                    <span style={{ fontSize: '1.1rem' }}>🚪</span>
                    Sair
                  </button>
                </div>
              )}

              {/* Botão Sair Separado - Apenas quando menu não está visível no mobile */}
              {isMobile && !showUserMenu && (
                <button 
                  onClick={handleLogout}
                  style={{ 
                    padding: '0.6rem',
                    fontSize: '1.1rem',
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontWeight: '500',
                    width: '40px',
                    height: '40px',
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
                  title="Sair"
                >
                  🚪
                </button>
              )}
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

              {/* Itens do Menu do Usuário no Mobile */}
              {userMenuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    color: 'white',
                    textDecoration: 'none',
                    padding: '1rem',
                    borderRadius: '8px',
                    background: isActive(item.path) ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                    border: isActive(item.path) ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.2)',
                    transition: 'all 0.3s ease',
                    fontWeight: isActive(item.path) ? '600' : '400',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}
                  onClick={handleMobileLinkClick}
                >
                  {item.icon} {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Overlay para fechar menu ao clicar fora */}
      {(showMobileMenu || showUserMenu) && (
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
          onClick={() => {
            setShowMobileMenu(false)
            setShowUserMenu(false)
          }}
        />
      )}
    </nav>
  )
}

export default Navbar