import { useState } from 'react'
import { transactionsAPI } from '../../services/api'

function ExportPage() {
  const [exportType, setExportType] = useState('csv')
  const [dateRange, setDateRange] = useState('all')
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const data = await transactionsAPI.exportData({
        type: exportType,
        range: dateRange
      })
      
      // Criar download
      const blob = new Blob([data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `finfly-export-${new Date().toISOString().split('T')[0]}.${exportType}`
      a.click()
      
      alert('Exportação realizada com sucesso!')
    } catch (error) {
      alert('Erro ao exportar dados: ' + error.message)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>📤 Exportar Dados</h1>

      <div className="card">
        <h3>Formato de Exportação</h3>
        
        <div className="form-group">
          <label>Tipo de Arquivo:</label>
          <select
            value={exportType}
            onChange={(e) => setExportType(e.target.value)}
            className="form-control"
          >
            <option value="csv">CSV (Excel, Google Sheets)</option>
            <option value="json">JSON (Backup completo)</option>
            <option value="pdf">PDF (Relatório)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Período:</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="form-control"
          >
            <option value="all">Todo o período</option>
            <option value="month">Este mês</option>
            <option value="year">Este ano</option>
            <option value="last3">Últimos 3 meses</option>
            <option value="custom">Personalizado</option>
          </select>
        </div>

        {dateRange === 'custom' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label>Data Inicial:</label>
              <input type="date" className="form-control" />
            </div>
            <div className="form-group">
              <label>Data Final:</label>
              <input type="date" className="form-control" />
            </div>
          </div>
        )}

        <div style={{ 
          background: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '8px',
          marginTop: '20px'
        }}>
          <h4>📊 Dados Incluídos:</h4>
          <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
            <li>Todas as transações</li>
            <li>Categorias e tags</li>
            <li>Metas e orçamentos</li>
            <li>Configurações do usuário</li>
          </ul>
        </div>

        <button 
          onClick={handleExport}
          disabled={isExporting}
          className="btn btn-primary"
          style={{ marginTop: '20px', width: '100%', padding: '15px' }}
        >
          {isExporting ? '⏳ Exportando...' : '📥 Exportar Dados'}
        </button>
      </div>
    </div>
  )
}

export default ExportPage