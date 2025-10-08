function AboutPage() {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>ℹ️ Sobre o FinFly</h1>

      <div className="card">
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
            💰
          </div>
          <h2>FinFly</h2>
          <p style={{ color: '#6c757d' }}>Controle Financeiro Pessoal</p>
        </div>

        <div style={{ display: 'grid', gap: '20px' }}>
          <div>
            <h3>📱 Sobre o App</h3>
            <p>
              O FinFly é um aplicativo de controle financeiro pessoal desenvolvido para 
              ajudar você a organizar suas finanças de forma simples e intuitiva.
            </p>
          </div>

          <div>
            <h3>🎯 Funcionalidades</h3>
            <ul style={{ paddingLeft: '20px' }}>
              <li>Controle de receitas e despesas</li>
              <li>Categorização automática</li>
              <li>Relatórios e gráficos</li>
              <li>Metas financeiras</li>
              <li>Backup na nuvem</li>
            </ul>
          </div>

          <div>
            <h3>📄 Termos Legais</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <a href="#" style={{ color: '#667eea', textDecoration: 'none' }}>
                📑 Termos de Uso
              </a>
              <a href="#" style={{ color: '#667eea', textDecoration: 'none' }}>
                🔒 Política de Privacidade
              </a>
              <a href="#" style={{ color: '#667eea', textDecoration: 'none' }}>
                📋 Licenças
              </a>
            </div>
          </div>

          <div style={{ 
            textAlign: 'center', 
            padding: '20px', 
            background: '#f8f9fa',
            borderRadius: '8px',
            marginTop: '20px'
          }}>
            <p style={{ margin: 0, color: '#6c757d' }}>
              <strong>Versão 1.0.0</strong><br />
              © 2025 FinFly. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutPage