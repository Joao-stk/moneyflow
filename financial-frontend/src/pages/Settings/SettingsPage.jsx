import { useState } from 'react'

function SettingsPage() {
  const [settings, setSettings] = useState({
    currency: 'BRL',
    dateFormat: 'DD/MM/YYYY',
    language: 'pt-BR',
    notifications: true,
    weeklyReport: true,
    monthlyReport: false
  })

  const handleSave = async () => {
    // Salvar configurações no backend
    console.log('Salvando configurações:', settings)
    alert('Configurações salvas com sucesso!')
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>⚙️ Configurações</h1>

      <div className="card">
        <h3>🌎 Preferências Gerais</h3>
        
        <div className="form-group">
          <label>Moeda:</label>
          <select
            value={settings.currency}
            onChange={(e) => setSettings({...settings, currency: e.target.value})}
            className="form-control"
          >
            <option value="BRL">Real Brasileiro (R$)</option>
            <option value="USD">Dólar Americano (US$)</option>
            <option value="EUR">Euro (€)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Formato de Data:</label>
          <select
            value={settings.dateFormat}
            onChange={(e) => setSettings({...settings, dateFormat: e.target.value})}
            className="form-control"
          >
            <option value="DD/MM/YYYY">DD/MM/AAAA</option>
            <option value="MM/DD/YYYY">MM/DD/AAAA</option>
            <option value="YYYY-MM-DD">AAAA-MM-DD</option>
          </select>
        </div>

        <div className="form-group">
          <label>Idioma:</label>
          <select
            value={settings.language}
            onChange={(e) => setSettings({...settings, language: e.target.value})}
            className="form-control"
          >
            <option value="pt-BR">Português Brasileiro</option>
            <option value="en-US">English</option>
            <option value="es-ES">Español</option>
          </select>
        </div>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <h3>🔔 Notificações</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
            />
            Notificações de alertas
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              checked={settings.weeklyReport}
              onChange={(e) => setSettings({...settings, weeklyReport: e.target.checked})}
            />
            Relatório semanal
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              checked={settings.monthlyReport}
              onChange={(e) => setSettings({...settings, monthlyReport: e.target.checked})}
            />
            Relatório mensal
          </label>
        </div>
      </div>

      <button 
        onClick={handleSave}
        className="btn btn-primary"
        style={{ marginTop: '20px', width: '100%', padding: '15px' }}
      >
        💾 Salvar Configurações
      </button>
    </div>
  )
}

export default SettingsPage