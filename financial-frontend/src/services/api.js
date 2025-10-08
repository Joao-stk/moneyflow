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
  
  // ✅ NOVA FUNÇÃO PARA EXPORTAR DADOS
  exportData: ({ type = 'csv', range = 'all', startDate, endDate }) => {
    const params = {
      type,
      range,
      ...(startDate && { startDate }),
      ...(endDate && { endDate })
    }

    // Configuração especial para receber blob (PDF) ou texto (CSV/JSON)
    const config = {
      params,
      responseType: type === 'pdf' ? 'blob' : 'text'
    }

    return api.get('/transactions/export', config)
  }
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