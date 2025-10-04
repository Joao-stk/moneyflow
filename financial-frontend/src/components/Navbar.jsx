import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav style={{
      background: '#343a40',
      padding: '1rem 0',
      marginBottom: '2rem'
    }}>
      <div className="container">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <Link 
              to="/transactions" 
              style={{ 
                color: 'white', 
                textDecoration: 'none', 
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}
            >
              Controle Financeiro
            </Link>
            
            {user && (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>
                    Dashboard
                </Link>
                <Link to="/transactions" style={{ color: 'white', textDecoration: 'none' }}>
                    Lançamentos
                </Link>
              </div>
            )}
          </div>

          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ color: 'white' }}>
                Olá, {user.name}
              </span>
              <button 
                onClick={handleLogout}
                className="btn btn-danger"
                style={{ padding: '5px 10px', fontSize: '14px' }}
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