import axios from 'axios'

// ✅ URL CORRETA do backend no Vercel
const API_URL = import.meta.env.VITE_API_URL || 'https://finfly-nine.vercel.app'

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
})

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  register: (name, email, password) => 
    api.post('/auth/register', { name, email, password }),
}

export const transactionsAPI = {
  getTransactions: (params = {}) => 
    api.get('/transactions', { params }),
  
  createTransaction: (data) => 
    api.post('/transactions', data),
  
  deleteTransaction: (id) => 
    api.delete(`/transactions/${id}`),
  
  // ✅ FUNÇÃO CORRIGIDA PARA EXPORTAR DADOS
  exportData: async ({ type = 'csv', range = 'all', startDate, endDate }) => {
    try {
      const params = {
        type,
        range,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      }

      console.log('📤 Enviando requisição de exportação:', params)

      // ✅ CORREÇÃO: Use responseType 'blob' para todos os tipos
      const response = await api.get('/transactions/export', {
        params,
        responseType: 'blob' // ✅ SEMPRE use blob para downloads
      })

      console.log('✅ Resposta recebida, tipo:', response.data.type)

      // ✅ Para CSV/JSON, converta o blob para texto
      if (type === 'csv' || type === 'json') {
        const text = await blobToText(response.data)
        return text
      }

      // ✅ Para PDF, retorne o blob diretamente
      return response.data

    } catch (error) {
      console.error('❌ Erro na exportação:', error)
      
      // ✅ Tente extrair mensagem de erro do blob se for um erro do servidor
      if (error.response && error.response.data instanceof Blob) {
        try {
          const errorText = await blobToText(error.response.data)
          const errorData = JSON.parse(errorText)
          error.message = errorData.error || error.message
        } catch {
          // Se não conseguir parsear, mantém a mensagem original
        }
      }
      
      throw error
    }
  }
}

// ✅ Função auxiliar para converter blob para texto
function blobToText(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsText(blob)
  })
}

export const summaryAPI = {
  getSummary: (params = {}) => 
    api.get('/summary', { params }),
}

export const layoutAPI = {
  saveLayout: (layouts) => 
    api.post('/layout', { layouts }),
  
  getLayout: () => 
    api.get('/layout'),
}

export default api