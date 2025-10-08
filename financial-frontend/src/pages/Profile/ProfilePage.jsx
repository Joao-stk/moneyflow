import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await updateProfile(formData)
      setIsEditing(false)
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>👤 Meu Perfil</h1>
      
      <div className="card">
        {!isEditing ? (
          // Vista de visualização
          <div>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                color: 'white',
                margin: '0 auto 15px'
              }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <h2>{user?.name}</h2>
              <p style={{ color: '#6c757d' }}>{user?.email}</p>
            </div>

            <div style={{ display: 'grid', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #e0e0e0' }}>
                <span>Nome:</span>
                <strong>{user?.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #e0e0e0' }}>
                <span>Email:</span>
                <strong>{user?.email}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                <span>Membro desde:</span>
                <strong>{new Date(user?.createdAt).toLocaleDateString('pt-BR')}</strong>
              </div>
            </div>

            <button 
              onClick={() => setIsEditing(true)}
              className="btn btn-primary"
              style={{ marginTop: '20px', width: '100%' }}
            >
              ✏️ Editar Perfil
            </button>
          </div>
        ) : (
          // Vista de edição
          <form onSubmit={handleSubmit}>
            <h3>Editar Perfil</h3>
            
            <div className="form-group">
              <label>Nome:</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label>Telefone:</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="form-control"
                placeholder="(11) 99999-9999"
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button type="submit" className="btn btn-primary">
                💾 Salvar
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setIsEditing(false)}
              >
                ❌ Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default ProfilePage