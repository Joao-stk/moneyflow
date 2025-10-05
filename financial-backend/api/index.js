const express = require('express');

const app = express();

// ✅ CORS CONFIGURATION
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://moneyflow-jb3b.vercel.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

app.use(express.json());

// ✅ HEALTH CHECK E ROTA RAIZ
app.get('/', (req, res) => {
  res.json({ 
    status: 'SUCCESS', 
    message: '🚀 MoneyFlow API Online',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: [
      '/health',
      '/auth/login',
      '/auth/register',
      '/transactions',
      '/summary',
      '/layout'
    ]
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: '✅ Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// ✅ AUTH ROUTES
app.post('/auth/register', async (req, res) => {
  try {
    console.log('📝 Register attempt:', req.body.email);
    
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    // Mock response - usuário criado com sucesso
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { userId: Date.now(), email: email },
      process.env.JWT_SECRET || 'fallback-secret-123',
      { expiresIn: '24h' }
    );

    console.log('✅ User registered:', email);
    
    res.status(201).json({
      message: 'Usuário criado com sucesso',
      token,
      user: {
        id: Date.now(),
        name: name,
        email: email,
        createdAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    console.log('🔐 Login attempt:', req.body.email);
    
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    console.log('📧 Processing login for:', email);

    // ✅ MOCK LOGIN - funciona com qualquer email/senha para teste
    // Na versão final, substitua por verificação real no banco
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { userId: 1, email: email },
      process.env.JWT_SECRET || 'fallback-secret-123',
      { expiresIn: '24h' }
    );

    console.log('✅ Login successful:', email);
    
    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: 1,
        name: 'Usuário Demo',
        email: email
      }
    });

  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ✅ MIDDLEWARE DE AUTENTICAÇÃO SIMPLES
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Token de acesso não fornecido' });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-123');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

// ✅ TRANSACTIONS ROUTES (PROTEGIDAS)
app.get('/transactions', authMiddleware, (req, res) => {
  console.log('📊 Fetching transactions for user:', req.user.userId);
  
  // Mock data - substitua por dados reais do banco depois
  res.json({
    transactions: [
      {
        id: 1,
        value: 150.50,
        type: 'income',
        category: 'salary',
        description: 'Salário',
        date: new Date().toISOString()
      },
      {
        id: 2,
        value: 45.00,
        type: 'expense', 
        category: 'food',
        description: 'Almoço',
        date: new Date().toISOString()
      }
    ],
    pagination: {
      page: 1,
      limit: 10,
      total: 2,
      pages: 1
    }
  });
});

app.post('/transactions', authMiddleware, (req, res) => {
  console.log('➕ Creating transaction:', req.body);
  
  // Mock response - transação criada
  res.status(201).json({
    message: 'Transação criada com sucesso',
    transaction: {
      id: Date.now(),
      ...req.body,
      date: new Date().toISOString()
    }
  });
});

app.delete('/transactions/:id', authMiddleware, (req, res) => {
  console.log('🗑️ Deleting transaction:', req.params.id);
  
  res.json({ message: 'Transação deletada com sucesso' });
});

// ✅ SUMMARY ROUTE (PROTEGIDA)
app.get('/summary', authMiddleware, (req, res) => {
  console.log('📈 Fetching summary for user:', req.user.userId);
  
  // Mock data - substitua por cálculo real depois
  res.json({
    summary: {
      balance: 105.50,
      totalIncome: 150.50,
      totalExpense: 45.00,
      transactionCount: 2
    },
    byCategory: [
      { category: 'salary', type: 'income', _sum: { value: 150.50 }, _count: { _all: 1 } },
      { category: 'food', type: 'expense', _sum: { value: 45.00 }, _count: { _all: 1 } }
    ]
  });
});

// ✅ LAYOUT ROUTES (PROTEGIDAS)
app.post('/layout', authMiddleware, (req, res) => {
  console.log('💾 Saving layout for user:', req.user.userId);
  
  res.json({ message: 'Layout salvo com sucesso' });
});

app.get('/layout', authMiddleware, (req, res) => {
  console.log('📋 Loading layout for user:', req.user.userId);
  
  // Mock empty layout
  res.json({ layouts: {} });
});

// ✅ 404 HANDLER - Mantenha no final
app.use('*', (req, res) => {
  console.log('❌ Route not found:', req.originalUrl);
  res.status(404).json({ 
    error: 'Rota não encontrada',
    path: req.originalUrl,
    availableEndpoints: [
      'GET /',
      'GET /health', 
      'POST /auth/login',
      'POST /auth/register',
      'GET /transactions (auth)',
      'POST /transactions (auth)',
      'DELETE /transactions/:id (auth)',
      'GET /summary (auth)',
      'GET /layout (auth)',
      'POST /layout (auth)'
    ]
  });
});

console.log('🚀 MoneyFlow Server started with all routes');
module.exports = app;