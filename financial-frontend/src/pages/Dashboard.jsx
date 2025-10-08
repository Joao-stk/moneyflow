import { useState, useEffect } from 'react'
import { summaryAPI, layoutAPI } from '../services/api'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import { Responsive, WidthProvider } from 'react-grid-layout'

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const ResponsiveGridLayout = WidthProvider(Responsive)

// Layouts padrão
const defaultLayouts = {
  lg: [
    { i: 'summary-cards', x: 0, y: 0, w: 12, h: 2, minH: 2 },
    { i: 'bar-chart', x: 0, y: 2, w: 6, h: 4, minH: 3 },
    { i: 'expense-chart', x: 6, y: 2, w: 6, h: 4, minH: 3 },
    { i: 'income-chart', x: 0, y: 6, w: 6, h: 4, minH: 3 },
    { i: 'category-table', x: 6, y: 6, w: 6, h: 4, minH: 3 },
    { i: 'stats', x: 0, y: 10, w: 12, h: 2, minH: 2 },
  ],
  md: [
    { i: 'summary-cards', x: 0, y: 0, w: 8, h: 2 },
    { i: 'bar-chart', x: 0, y: 2, w: 8, h: 4 },
    { i: 'expense-chart', x: 0, y: 6, w: 8, h: 4 },
    { i: 'income-chart', x: 0, y: 10, w: 8, h: 4 },
    { i: 'category-table', x: 0, y: 14, w: 8, h: 4 },
    { i: 'stats', x: 0, y: 18, w: 8, h: 2 },
  ],
  sm: [
    { i: 'summary-cards', x: 0, y: 0, w: 4, h: 2 },
    { i: 'bar-chart', x: 0, y: 2, w: 4, h: 4 },
    { i: 'expense-chart', x: 0, y: 6, w: 4, h: 4 },
    { i: 'income-chart', x: 0, y: 10, w: 4, h: 4 },
    { i: 'category-table', x: 0, y: 14, w: 4, h: 4 },
    { i: 'stats', x: 0, y: 18, w: 4, h: 2 },
  ]
}

// Configurações dos gráficos com tooltips melhorados
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12,
      displayColors: true,
      callbacks: {
        label: function(context) {
          const value = context.raw;
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
          
          return [
            `Valor: R$ ${value.toFixed(2)}`,
            `Percentual: ${percentage}%`
          ];
        },
        title: function(tooltipItems) {
          return tooltipItems[0].label;
        }
      }
    }
  },
}

// Configurações específicas para gráficos de pizza
const doughnutOptions = {
  ...chartOptions,
  plugins: {
    ...chartOptions.plugins,
    tooltip: {
      ...chartOptions.plugins.tooltip,
      callbacks: {
        label: function(context) {
          const value = context.raw;
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
          
          return [
            `${context.label}: R$ ${value.toFixed(2)}`,
            `Representa ${percentage}% do total`
          ];
        }
      }
    }
  }
}

// Função para obter o primeiro dia do mês atual
const getFirstDayOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

// Função para obter o último dia do mês atual
const getLastDayOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0);
}

// Função para formatar data para YYYY-MM-DD
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
}

function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [layoutLoading, setLayoutLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [timeRange, setTimeRange] = useState('month')
  const [isEditing, setIsEditing] = useState(false)
  const [currentLayouts, setCurrentLayouts] = useState(defaultLayouts)
  const [startDate, setStartDate] = useState(formatDate(getFirstDayOfMonth()))
  const [endDate, setEndDate] = useState(formatDate(getLastDayOfMonth()))

  useEffect(() => {
    loadSummary()
    loadLayout()
  }, [timeRange, startDate, endDate])

  // Carregar layout do banco - CORRIGIDO para não mostrar erro se não existir
  const loadLayout = async () => {
    try {
      console.log('Carregando layout...')
      const response = await layoutAPI.getLayout()
      console.log('Resposta do layout:', response.data)
      
      // Verifica se existe layout salvo e se não está vazio
      if (response.data.layouts && 
          Object.keys(response.data.layouts).length > 0 &&
          Object.values(response.data.layouts).some(layout => layout && layout.length > 0)) {
        setCurrentLayouts(response.data.layouts)
        console.log('Layout carregado do banco:', response.data.layouts)
      } else {
        setCurrentLayouts(defaultLayouts)
        console.log('Usando layout padrão - nenhum layout salvo encontrado')
      }
    } catch (error) {
      console.error('Erro ao carregar layout:', error)
      // Não mostra erro para o usuário - usa layout padrão silenciosamente
      setCurrentLayouts(defaultLayouts)
    } finally {
      setLayoutLoading(false)
    }
  }

  // Salvar layout no banco
  const saveLayoutToDB = async (newLayouts) => {
    try {
      console.log('Salvando layout no banco:', newLayouts)
      const response = await layoutAPI.saveLayout(newLayouts)
      console.log('Layout salvo com sucesso:', response.data)
      setSuccess('Layout personalizado salvo com sucesso!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Erro ao salvar layout:', error)
      // Não mostra erro para o usuário - o layout já foi salvo localmente
      console.log('Layout salvo localmente, mas não foi possível salvar no servidor')
    }
  }

  // Carregar resumo com filtro de período
  const loadSummary = async () => {
    try {
      setLoading(true)
      console.log(`Carregando resumo para período: ${timeRange}`)
      
      let params = {}
      
      if (timeRange === 'custom') {
        // Para período personalizado, usar startDate e endDate
        params = {
          period: 'custom',
          startDate: startDate,
          endDate: endDate
        }
      } else {
        // Para período pré-definido
        params = {
          period: timeRange
        }
      }
      
      const response = await summaryAPI.getSummary(params)
      
      console.log('Resposta do resumo:', response.data)
      setSummary(response.data)
      setError('')
    } catch (error) {
      console.error('Erro ao carregar resumo:', error)
      setError('Erro ao carregar dados financeiros')
    } finally {
      setLoading(false)
    }
  }

  // Função para formatar o período atual
  const getPeriodText = () => {
    if (!summary) return ''
    
    if (timeRange === 'month') {
      const now = new Date()
      return now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    } else if (timeRange === 'year') {
      const now = new Date()
      return now.getFullYear().toString()
    } else if (timeRange === 'custom') {
      const start = new Date(startDate)
      const end = new Date(endDate)
      return `${start.toLocaleDateString('pt-BR')} a ${end.toLocaleDateString('pt-BR')}`
    }
    return 'Todos os períodos'
  }

  // Função para resetar para o mês atual
  const resetToCurrentMonth = () => {
    setStartDate(formatDate(getFirstDayOfMonth()))
    setEndDate(formatDate(getLastDayOfMonth()))
    setTimeRange('month')
  }

  // Função chamada quando o layout muda
  const onLayoutChange = (layout, allLayouts) => {
    setCurrentLayouts(allLayouts)
  }

  // Função chamada quando para de editar
  const handleStopEditing = () => {
    setIsEditing(false)
    // Salvar no banco quando parar de editar
    saveLayoutToDB(currentLayouts)
  }

  // Preparar dados para o gráfico de barras (Entradas vs Saídas)
  const getBarChartData = () => {
    if (!summary) return null

    const total = summary.summary.totalIncome + summary.summary.totalExpense
    const incomePercentage = total > 0 ? (summary.summary.totalIncome / total * 100).toFixed(1) : 0
    const expensePercentage = total > 0 ? (summary.summary.totalExpense / total * 100).toFixed(1) : 0

    return {
      labels: [
        `Entradas (${incomePercentage}%)`, 
        `Saídas (${expensePercentage}%)`
      ],
      datasets: [
        {
          label: 'Valores (R$)',
          data: [summary.summary.totalIncome, summary.summary.totalExpense],
          backgroundColor: [
            'rgba(40, 167, 69, 0.8)',
            'rgba(220, 53, 69, 0.8)',
          ],
          borderColor: [
            'rgb(40, 167, 69)',
            'rgb(220, 53, 69)',
          ],
          borderWidth: 2,
        },
      ],
    }
  }

  // Preparar dados para o gráfico de pizza (Categorias de Despesas)
  const getExpenseChartData = () => {
    if (!summary?.byCategory) return null

    const expenseCategories = summary.byCategory.filter(item => item.type === 'expense')
    
    if (expenseCategories.length === 0) return null

    const totalExpenses = expenseCategories.reduce((sum, item) => sum + item._sum.value, 0)

    const backgroundColors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
      '#9966FF', '#FF9F40', '#C9CBCF', '#FF6384'
    ]

    return {
      labels: expenseCategories.map(item => {
        const categoryLabels = {
          food: '🍕 Alimentação',
          transport: '🚗 Transporte',
          leisure: '🎮 Lazer',
          health: '🏥 Saúde',
          education: '📚 Educação',
          shopping: '🛍️ Compras',
          bills: '📄 Contas',
          others: '📦 Outros'
        }
        const percentage = totalExpenses > 0 ? ((item._sum.value / totalExpenses) * 100).toFixed(1) : 0
        return `${categoryLabels[item.category] || item.category} (${percentage}%)`
      }),
      datasets: [
        {
          data: expenseCategories.map(item => item._sum.value),
          backgroundColor: backgroundColors.slice(0, expenseCategories.length),
          borderColor: backgroundColors.slice(0, expenseCategories.length).map(color => color.replace('0.8', '1')),
          borderWidth: 2,
        },
      ],
    }
  }

  // Preparar dados para o gráfico de pizza (Categorias de Receitas)
  const getIncomeChartData = () => {
    if (!summary?.byCategory) return null

    const incomeCategories = summary.byCategory.filter(item => item.type === 'income')
    
    if (incomeCategories.length === 0) return null

    const totalIncome = incomeCategories.reduce((sum, item) => sum + item._sum.value, 0)

    const backgroundColors = [
      '#28a745', '#17a2b8', '#6f42c1', '#20c997', '#fd7e14'
    ]

    return {
      labels: incomeCategories.map(item => {
        const categoryLabels = {
          salary: '💰 Salário',
          freelance: '💼 Freelance',
          investment: '📈 Investimentos',
          gift: '🎁 Presente',
          others: '📦 Outros'
        }
        const percentage = totalIncome > 0 ? ((item._sum.value / totalIncome) * 100).toFixed(1) : 0
        return `${categoryLabels[item.category] || item.category} (${percentage}%)`
      }),
      datasets: [
        {
          data: incomeCategories.map(item => item._sum.value),
          backgroundColor: backgroundColors.slice(0, incomeCategories.length),
          borderColor: backgroundColors.slice(0, incomeCategories.length).map(color => color.replace('0.8', '1')),
          borderWidth: 2,
        },
      ],
    }
  }

  // Estilos para os cards do grid
  const gridItemStyle = {
    background: 'white',
    borderRadius: '8px',
    padding: '15px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    border: isEditing ? '2px dashed #007bff' : '1px solid #e0e0e0'
  }

  if (loading || layoutLoading) return <div className="loading">Carregando dashboard...</div>

  return (
    <div style={{ padding: '10px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div>
          <h1>Dashboard Financeiro</h1>
          {summary && (
            <p style={{ 
              color: '#6c757d', 
              margin: '5px 0 0 0',
              fontSize: '0.9rem'
            }}>
              Período: <strong>{getPeriodText()}</strong>
              {summary.summary.transactionCount > 0 && (
                <span style={{ marginLeft: '15px' }}>
                  • {summary.summary.transactionCount} transação{summary.summary.transactionCount !== 1 ? 's' : ''}
                </span>
              )}
            </p>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="form-control"
            style={{ width: 'auto' }}
          >
            <option value="month">Este Mês</option>
            <option value="year">Este Ano</option>
            <option value="custom">Período Personalizado</option>
          </select>
          
          {/* Filtros de data para período personalizado */}
          {timeRange === 'custom' && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="form-control"
                style={{ width: 'auto' }}
              />
              <span>até</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="form-control"
                style={{ width: 'auto' }}
              />
              <button 
                onClick={resetToCurrentMonth}
                className="btn btn-outline-secondary"
                style={{ whiteSpace: 'nowrap' }}
                title="Voltar para mês atual"
              >
                📅 Mês Atual
              </button>
            </div>
          )}
          
          <button 
            onClick={() => isEditing ? handleStopEditing() : setIsEditing(true)}
            className={`btn ${isEditing ? 'btn-success' : 'btn-primary'}`}
            style={{ whiteSpace: 'nowrap' }}
          >
            {isEditing ? '✅ Salvar Layout' : '✏️ Editar Layout'}
          </button>

          {/* Botão para recarregar dados */}
          <button 
            onClick={loadSummary}
            className="btn btn-outline-secondary"
            style={{ whiteSpace: 'nowrap' }}
            title="Recarregar dados"
          >
            🔄
          </button>
        </div>
      </div>

      {error && (
        <div className="error" style={{ marginBottom: '15px' }}>
          {error}
          <button 
            onClick={() => setError('')}
            style={{ marginLeft: '10px', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}

      {success && (
        <div className="success" style={{ marginBottom: '15px' }}>
          {success}
        </div>
      )}

      {/* Mensagem quando não há dados */}
      {summary && summary.summary.transactionCount === 0 && (
        <div className="card" style={{ 
          textAlign: 'center', 
          padding: '40px 20px',
          background: '#f8f9fa'
        }}>
          <h3 style={{ color: '#6c757d', marginBottom: '10px' }}>
            📊 Nenhum dado encontrado
          </h3>
          <p style={{ color: '#6c757d', marginBottom: '20px' }}>
            {timeRange === 'month' 
              ? 'Não há transações para este mês.' 
              : timeRange === 'year'
              ? 'Não há transações para este ano.'
              : 'Não há transações para o período selecionado.'
            }
          </p>
          <button 
            onClick={() => window.location.href = '/transactions'}
            className="btn btn-primary"
          >
            ➕ Criar Primeira Transação
          </button>
        </div>
      )}

      {summary && summary.summary.transactionCount > 0 && (
        <ResponsiveGridLayout
          className="layout"
          layouts={currentLayouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768 }}
          cols={{ lg: 12, md: 8, sm: 4 }}
          rowHeight={100}
          isDraggable={isEditing}
          isResizable={isEditing}
          margin={[20, 20]}
          containerPadding={[0, 0]}
          onLayoutChange={onLayoutChange}
        >
          {/* Cards de Resumo */}
          <div key="summary-cards" style={gridItemStyle}>
            <h3 style={{ marginBottom: '15px', textAlign: 'center' }}>
              Resumo {timeRange === 'month' ? 'Mensal' : timeRange === 'year' ? 'Anual' : 'do Período'}
            </h3>
            {summary && (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                gap: '15px',
                height: '100%'
              }}>
                <div style={{ textAlign: 'center', padding: '10px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>Saldo</div>
                  <div style={{ 
                    fontSize: '1.3rem',
                    fontWeight: 'bold',
                    color: summary.summary.balance >= 0 ? '#28a745' : '#dc3545'
                  }}>
                    R$ {summary.summary.balance.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#6c757d', marginTop: '5px' }}>
                    {timeRange === 'month' ? 'este mês' : timeRange === 'year' ? 'este ano' : 'no período'}
                  </div>
                </div>

                <div style={{ textAlign: 'center', padding: '10px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>Entradas</div>
                  <div style={{ 
                    fontSize: '1.3rem',
                    fontWeight: 'bold',
                    color: '#28a745'
                  }}>
                    R$ {summary.summary.totalIncome.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#6c757d', marginTop: '5px' }}>
                    {timeRange === 'month' ? 'este mês' : timeRange === 'year' ? 'este ano' : 'no período'}
                  </div>
                </div>

                <div style={{ textAlign: 'center', padding: '10px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>Saídas</div>
                  <div style={{ 
                    fontSize: '1.3rem',
                    fontWeight: 'bold',
                    color: '#dc3545'
                  }}>
                    R$ {summary.summary.totalExpense.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#6c757d', marginTop: '5px' }}>
                    {timeRange === 'month' ? 'este mês' : timeRange === 'year' ? 'este ano' : 'no período'}
                  </div>
                </div>

                <div style={{ textAlign: 'center', padding: '10px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>Transações</div>
                  <div style={{ 
                    fontSize: '1.3rem',
                    fontWeight: 'bold',
                    color: '#6c757d'
                  }}>
                    {summary.summary.transactionCount}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#6c757d', marginTop: '5px' }}>
                    {timeRange === 'month' ? 'este mês' : timeRange === 'year' ? 'este ano' : 'no período'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Gráfico de Barras */}
          <div key="bar-chart" style={gridItemStyle}>
            <h4 style={{ textAlign: 'center', marginBottom: '15px' }}>Entradas vs Saídas</h4>
            <div style={{ height: 'calc(100% - 40px)' }}>
              {getBarChartData() ? (
                <Bar 
                  data={getBarChartData()} 
                  options={chartOptions} 
                />
              ) : (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%',
                  color: '#6c757d'
                }}>
                  Nenhum dado disponível
                </div>
              )}
            </div>
          </div>

          {/* Gráfico de Despesas */}
          <div key="expense-chart" style={gridItemStyle}>
            <h4 style={{ textAlign: 'center', marginBottom: '15px' }}>Despesas por Categoria</h4>
            <div style={{ height: 'calc(100% - 40px)' }}>
              {getExpenseChartData() ? (
                <Doughnut 
                  data={getExpenseChartData()} 
                  options={doughnutOptions} 
                />
              ) : (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%',
                  color: '#6c757d'
                }}>
                  Nenhuma despesa
                </div>
              )}
            </div>
          </div>

          {/* Gráfico de Receitas */}
          <div key="income-chart" style={gridItemStyle}>
            <h4 style={{ textAlign: 'center', marginBottom: '15px' }}>Receitas por Categoria</h4>
            <div style={{ height: 'calc(100% - 40px)' }}>
              {getIncomeChartData() ? (
                <Doughnut 
                  data={getIncomeChartData()} 
                  options={doughnutOptions} 
                />
              ) : (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%',
                  color: '#6c757d'
                }}>
                  Nenhuma receita
                </div>
              )}
            </div>
          </div>

          {/* Tabela de Categorias */}
          <div key="category-table" style={gridItemStyle}>
            <h4 style={{ textAlign: 'center', marginBottom: '15px' }}>Detalhes por Categoria</h4>
            <div style={{ height: 'calc(100% - 40px)', overflowY: 'auto' }}>
              {summary?.byCategory && summary.byCategory.length > 0 ? (
                <div style={{ display: 'grid', gap: '8px' }}>
                  {summary.byCategory.map((item, index) => {
                    const categoryLabels = {
                      food: '🍕 Alimentação',
                      transport: '🚗 Transporte',
                      leisure: '🎮 Lazer',
                      health: '🏥 Saúde',
                      education: '📚 Educação',
                      shopping: '🛍️ Compras',
                      bills: '📄 Contas',
                      others: '📦 Outros',
                      salary: '💰 Salário',
                      freelance: '💼 Freelance',
                      investment: '📈 Investimentos',
                      gift: '🎁 Presente'
                    }
                    
                    const total = item.type === 'income' 
                      ? summary.summary.totalIncome 
                      : summary.summary.totalExpense
                    const percentage = total > 0 ? ((item._sum.value / total) * 100).toFixed(1) : 0

                    return (
                      <div key={index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px',
                        background: '#f8f9fa',
                        borderRadius: '5px',
                        fontSize: '0.9rem'
                      }}>
                        <span>
                          {categoryLabels[item.category] || item.category}
                        </span>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{
                            color: item.type === 'income' ? '#28a745' : '#dc3545',
                            fontWeight: 'bold',
                            fontSize: '0.8rem'
                          }}>
                            R$ {item._sum.value.toFixed(2)}
                          </div>
                          <div style={{
                            color: '#6c757d',
                            fontSize: '0.7rem'
                          }}>
                            {percentage}% do total
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%',
                  color: '#6c757d',
                  fontSize: '0.9rem'
                }}>
                  Nenhuma categoria
                </div>
              )}
            </div>
          </div>

          {/* Estatísticas */}
          <div key="stats" style={gridItemStyle}>
            <h4 style={{ textAlign: 'center', marginBottom: '15px' }}>Estatísticas</h4>
            {summary && (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                gap: '10px',
                fontSize: '0.8rem'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div>Margem</div>
                  <div style={{ fontWeight: 'bold', color: '#28a745' }}>
                    {((summary.summary.balance / summary.summary.totalIncome) * 100 || 0).toFixed(1)}%
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div>Economia</div>
                  <div style={{ fontWeight: 'bold', color: '#17a2b8' }}>
                    {((summary.summary.balance / summary.summary.totalIncome) * 100 || 0).toFixed(1)}%
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div>Média</div>
                  <div style={{ fontWeight: 'bold', color: '#6c757d' }}>
                    R$ {((summary.summary.totalIncome + summary.summary.totalExpense) / summary.summary.transactionCount || 0).toFixed(2)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </ResponsiveGridLayout>
      )}

      {isEditing && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: '#17a2b8',
          color: 'white',
          padding: '10px 15px',
          borderRadius: '5px',
          fontSize: '0.9rem',
          zIndex: 1000
        }}>
          ⚡ Modo Edição: Arraste e redimensione os gráficos
        </div>
      )}
    </div>
  )
}

export default Dashboard