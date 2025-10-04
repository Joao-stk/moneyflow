import axios from 'axios'

const API_URL = 'http://localhost:3000'

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 segundos
})

// Interceptor para adicionar token automaticamente
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
}

export const summaryAPI = {
  getSummary: (params = {}) => 
    api.get('/summary', { params }), // Agora aceita parâmetros
};
// ... outras APIs

export const layoutAPI = {
  saveLayout: (layouts) => 
    api.post('/layout', { layouts }),
  
  getLayout: () => 
    api.get('/layout'),
};

export default api
