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
    date: new Date().toISOString().split('T')[0]
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
    
    // Se mudou o tipo, reset a categoria para a primeira da lista
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
    try {
      await transactionsAPI.createTransaction(formData)
      setShowForm(false)
      setFormData({
        value: '',
        type: 'expense',
        category: 'food',
        description: '',
        date: new Date().toISOString().split('T')[0]
      })
      loadTransactions() // Recarregar lista
      setError('') // Limpar erros anteriores
    } catch (error) {
      setError(error.response?.data?.error || 'Erro ao criar transação')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      try {
        await transactionsAPI.deleteTransaction(id)
        loadTransactions() // Recarregar lista
      } catch (error) {
        setError('Erro ao excluir transação')
      }
    }
  }

  if (loading) return <div className="loading">Carregando...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Lançamentos Financeiros</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancelar' : 'Novo Lançamento'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {showForm && (
        <div className="card">
          <h3>Novo Lançamento</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
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
                  required
                />
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
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Salvar Lançamento
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <h3>Histórico de Lançamentos</h3>
        {transactions.length === 0 ? (
          <p className="text-center">Nenhum lançamento cadastrado</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Data</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Descrição</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Categoria</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Tipo</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Valor</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '10px' }}>
                      {new Date(transaction.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td style={{ padding: '10px' }}>{transaction.description || '-'}</td>
                    <td style={{ padding: '10px' }}>
                      {getCategoryLabel(transaction.category, transaction.type)}
                    </td>
                    <td style={{ padding: '10px' }}>
                      <span style={{
                        color: transaction.type === 'income' ? '#28a745' : '#dc3545',
                        fontWeight: 'bold'
                      }}>
                        {transaction.type === 'income' ? 'Entrada' : 'Saída'}
                      </span>
                    </td>
                    <td style={{ 
                      padding: '10px', 
                      textAlign: 'right',
                      color: transaction.type === 'income' ? '#28a745' : '#dc3545',
                      fontWeight: 'bold'
                    }}>
                      R$ {transaction.value.toFixed(2)}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="btn btn-danger"
                        style={{ padding: '5px 10px', fontSize: '12px' }}
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
    </div>
  )
}

export default Transactions