import { useState, useEffect } from 'react'
import { transactionsAPI } from '../services/api'

// Definição das categorias
const CATEGORIES = {
  expense: [
    { value: 'food', label: '🍕 Alimentação' },
    { value: 'transport', label: '🚗 Transporte' },
    { value: 'leisure', label: '🎮 Lazer' },
    { value: 'health', label: '🏥 Saúde' },
    { value: 'education', label: '📚 Educação' },
    { value: 'shopping', label: '🛍️ Compras' },
    { value: 'bills', label: '📄 Contas' },
    { value: 'others', label: '📦 Outros' }
  ],
  income: [
    { value: 'salary', label: '💰 Salário' },
    { value: 'freelance', label: '💼 Freelance' },
    { value: 'investment', label: '📈 Investimentos' },
    { value: 'gift', label: '🎁 Presente' },
    { value: 'others', label: '📦 Outros' }
  ]
}

// Função para obter data atual no formato YYYY-MM-DD
const getCurrentDate = () => {
  return new Date().toISOString().split('T')[0]
}

// Função para traduzir categoria
const getCategoryLabel = (category, type) => {
  const categories = CATEGORIES[type] || []
  const found = categories.find(cat => cat.value === category)
  return found ? found.label : category
}

function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    value: '',
    type: 'expense',
    category: 'food',
    description: '',
    date: getCurrentDate()
  })

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      const response = await transactionsAPI.getTransactions()
      setTransactions(response.data.transactions)
    } catch (error) {
      setError('Erro ao carregar transações')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name === 'type') {
      const defaultCategory = CATEGORIES[value][0].value
      setFormData({
        ...formData,
        type: value,
        category: defaultCategory
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const selectedDate = new Date(formData.date)
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    
    if (selectedDate > today) {
      setError('Não é possível lançar transações com data futura')
      return
    }
    
    try {
      await transactionsAPI.createTransaction(formData)
      setShowForm(false)
      setFormData({
        value: '',
        type: 'expense',
        category: 'food',
        description: '',
        date: getCurrentDate()
      })
      loadTransactions()
      setError('')
    } catch (error) {
      setError(error.response?.data?.error || 'Erro ao criar transação')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      try {
        await transactionsAPI.deleteTransaction(id)
        loadTransactions()
      } catch (error) {
        setError('Erro ao excluir transação')
      }
    }
  }

  if (loading) return <div className="loading">Carregando...</div>

  return (
    <div style={{ padding: '10px' }}>
      {/* Header Responsivo */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        flexDirection: window.innerWidth < 768 ? 'column' : 'row',
        gap: '15px'
      }}>
        <h1 style={{ 
          fontSize: window.innerWidth < 768 ? '1.5rem' : '2rem',
          margin: 0,
          textAlign: window.innerWidth < 768 ? 'center' : 'left'
        }}>
          Lançamentos Financeiros
        </h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
          style={{
            width: window.innerWidth < 768 ? '100%' : 'auto',
            padding: '12px 20px',
            fontSize: '1rem'
          }}
        >
          {showForm ? '✕ Cancelar' : '➕ Novo Lançamento'}
        </button>
      </div>

      {error && (
        <div className="error" style={{ 
          marginBottom: '15px',
          padding: '12px',
          fontSize: '0.9rem'
        }}>
          {error}
        </div>
      )}

      {/* Formulário Responsivo */}
      {showForm && (
        <div className="card" style={{ 
          marginBottom: '20px',
          padding: window.innerWidth < 768 ? '15px' : '20px'
        }}>
          <h3 style={{ 
            marginBottom: '20px',
            fontSize: window.innerWidth < 768 ? '1.3rem' : '1.5rem',
            textAlign: 'center'
          }}>
            Novo Lançamento
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr', 
              gap: '15px',
              marginBottom: '15px'
            }}>
              <div className="form-group">
                <label>Valor (R$):</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  name="value"
                  value={formData.value}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="0.00"
                  required
                  style={{ fontSize: '16px' }} // Evita zoom no iOS
                />
              </div>

              <div className="form-group">
                <label>Tipo:</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="form-control"
                  required
                  style={{ fontSize: '16px' }}
                >
                  <option value="expense">💸 Saída</option>
                  <option value="income">💰 Entrada</option>
                </select>
              </div>

              <div className="form-group">
                <label>Categoria:</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="form-control"
                  required
                  style={{ fontSize: '16px' }}
                >
                  {CATEGORIES[formData.type].map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Data:</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="form-control"
                  max={getCurrentDate()}
                  required
                  style={{ fontSize: '16px' }}
                />
                <small style={{ 
                  color: '#6c757d', 
                  fontSize: '0.8rem',
                  display: 'block',
                  marginTop: '5px'
                }}>
                  Máximo: {new Date().toLocaleDateString('pt-BR')}
                </small>
              </div>
            </div>

            <div className="form-group">
              <label>Descrição:</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-control"
                placeholder="Descrição opcional"
                maxLength="100"
                style={{ fontSize: '16px' }}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '15px',
                fontSize: '1.1rem',
                marginTop: '15px'
              }}
            >
              💾 Salvar Lançamento
            </button>
          </form>
        </div>
      )}

      {/* Lista de Transações Responsiva */}
      <div className="card" style={{ 
        padding: window.innerWidth < 768 ? '15px' : '20px'
      }}>
        <h3 style={{ 
          marginBottom: '20px',
          fontSize: window.innerWidth < 768 ? '1.3rem' : '1.5rem',
          textAlign: 'center'
        }}>
          Histórico de Lançamentos
        </h3>
        
        {transactions.length === 0 ? (
          <p style={{ 
            textAlign: 'center', 
            color: '#6c757d',
            padding: '40px 20px'
          }}>
            Nenhum lançamento cadastrado
          </p>
        ) : (
          <div>
            {/* Vista Mobile - Cards */}
            {window.innerWidth < 768 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {transactions.map((transaction) => (
                  <div 
                    key={transaction.id}
                    style={{
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      padding: '15px',
                      background: 'white'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '10px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          marginBottom: '5px'
                        }}>
                          {transaction.description || 'Sem descrição'}
                        </div>
                        <div style={{ 
                          fontSize: '0.85rem',
                          color: '#6c757d',
                          marginBottom: '3px'
                        }}>
                          {getCategoryLabel(transaction.category, transaction.type)}
                        </div>
                        <div style={{ 
                          fontSize: '0.8rem',
                          color: '#6c757d'
                        }}>
                          {new Date(transaction.date).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ 
                          fontSize: '1.1rem',
                          fontWeight: 'bold',
                          color: transaction.type === 'income' ? '#28a745' : '#dc3545',
                          marginBottom: '8px'
                        }}>
                          R$ {transaction.value.toFixed(2)}
                        </div>
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className="btn btn-danger"
                          style={{ 
                            padding: '6px 12px',
                            fontSize: '0.8rem'
                          }}
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{
                        fontSize: '0.8rem',
                        color: transaction.type === 'income' ? '#28a745' : '#dc3545',
                        fontWeight: 'bold',
                        background: transaction.type === 'income' ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)',
                        padding: '4px 8px',
                        borderRadius: '12px'
                      }}>
                        {transaction.type === 'income' ? '💰 Entrada' : '💸 Saída'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Vista Desktop - Tabela */}
            {window.innerWidth >= 768 && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.9rem' }}>Data</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.9rem' }}>Descrição</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.9rem' }}>Categoria</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.9rem' }}>Tipo</th>
                      <th style={{ padding: '12px', textAlign: 'right', fontSize: '0.9rem' }}>Valor</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '0.9rem' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                        <td style={{ padding: '12px', fontSize: '0.9rem' }}>
                          {new Date(transaction.date).toLocaleDateString('pt-BR')}
                        </td>
                        <td style={{ padding: '12px', fontSize: '0.9rem' }}>
                          {transaction.description || '-'}
                        </td>
                        <td style={{ padding: '12px', fontSize: '0.9rem' }}>
                          {getCategoryLabel(transaction.category, transaction.type)}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            color: transaction.type === 'income' ? '#28a745' : '#dc3545',
                            fontWeight: 'bold',
                            fontSize: '0.9rem'
                          }}>
                            {transaction.type === 'income' ? 'Entrada' : 'Saída'}
                          </span>
                        </td>
                        <td style={{ 
                          padding: '12px', 
                          textAlign: 'right',
                          color: transaction.type === 'income' ? '#28a745' : '#dc3545',
                          fontWeight: 'bold',
                          fontSize: '0.9rem'
                        }}>
                          R$ {transaction.value.toFixed(2)}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <button
                            onClick={() => handleDelete(transaction.id)}
                            className="btn btn-danger"
                            style={{ 
                              padding: '6px 12px', 
                              fontSize: '0.8rem' 
                            }}
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Botão Flutuante para Mobile */}
      {window.innerWidth < 768 && !showForm && (
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            fontSize: '1.5rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 1000
          }}
        >
          +
        </button>
      )}
    </div>
  )
}

export default Transactions