import { useState } from 'react'
import { transactionsAPI } from '../../services/api'

function ExportPage() {
  const [exportType, setExportType] = useState('csv')
  const [dateRange, setDateRange] = useState('all')
  const [isExporting, setIsExporting] = useState(false)
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  const handleExport = async () => {
    setIsExporting(true)
    try {
      console.log('📤 Iniciando exportação...', { exportType, dateRange })

      // ✅ CORREÇÃO: Agora response JÁ é os dados processados
      const data = await transactionsAPI.exportData({
        type: exportType,
        range: dateRange,
        startDate: customStartDate,
        endDate: customEndDate
      })

      console.log('✅ Dados recebidos:', typeof data, data)

      let blob, filename, blobType

      if (exportType === 'csv') {
        // ✅ Para CSV, data já é uma string
        blob = new Blob([data], { type: 'text/csv; charset=utf-8' })
        filename = `finfly-export-${new Date().toISOString().split('T')[0]}.csv`
      } else if (exportType === 'json') {
        // ✅ Para JSON, data já é uma string JSON
        blob = new Blob([data], { type: 'application/json; charset=utf-8' })
        filename = `finfly-export-${new Date().toISOString().split('T')[0]}.json`
      }

      // Criar download
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      console.log('✅ Download criado:', filename)
      alert('✅ Exportação realizada com sucesso!')
      
    } catch (error) {
      console.error('❌ Erro ao exportar:', error)
      alert('❌ Erro ao exportar dados: ' + (error.response?.data?.error || error.message || 'Tente novamente'))
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
              <input 
                type="date" 
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="form-control" 
              />
            </div>
            <div className="form-group">
              <label>Data Final:</label>
              <input 
                type="date" 
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="form-control" 
              />
            </div>
          </div>
        )}

        <div style={{ 
          background: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '8px',
          marginTop: '20px',
          fontSize: '0.9rem'
        }}>
          <h4>📊 Dados Incluídos:</h4>
          <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
            <li>Todas as transações</li>
            <li>Categorias e tags</li>
            <li>Datas e valores</li>
            <li>Tipos (Receita/Despesa)</li>
          </ul>
        </div>

        <button 
          onClick={handleExport}
          disabled={isExporting}
          className="btn btn-primary"
          style={{ 
            marginTop: '20px', 
            width: '100%', 
            padding: '15px',
            fontSize: '1.1rem'
          }}
        >
          {isExporting ? '⏳ Exportando...' : '📥 Exportar Dados'}
        </button>

        {/* ✅ Botão de debug temporário */}
        <button 
          onClick={async () => {
            try {
              const response = await transactionsAPI.exportData({ type: 'csv', range: 'all' })
              console.log('🔍 Debug - Tipo de dados:', typeof response)
              console.log('🔍 Debug - Primeiros 100 caracteres:', response.substring(0, 100))
              console.log('🔍 Debug - Dados completos:', response)
            } catch (error) {
              console.error('🔍 Debug - Erro:', error)
            }
          }}
          style={{ 
            marginTop: '10px', 
            padding: '10px',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🔍 Debug Export
        </button>
      </div>
    </div>
  )
}

export default ExportPage