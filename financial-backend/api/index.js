const express = require('express');

const app = express();

// ✅ CORS SIMPLES E FUNCIONAL
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

// Health check
app.get('/health', (req, res) => {
  console.log('✅ Health check called');
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// ✅ LOGIN COM TRATAMENTO DE ERRO MELHOR
app.post('/auth/login', async (req, res) => {
  try {
    console.log('🔐 Login attempt received');
    console.log('Request body:', req.body);
    
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    console.log('📧 Processing login for:', email);

    // ✅ VERIFICAÇÃO SIMPLES DE CREDENCIAIS (TEMPORÁRIO)
    // Vamos fazer um login mock primeiro para testar
    if (email === 'test@test.com' && password === '123456') {
      console.log('✅ Mock login successful');
      
      // Gerar token JWT
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { userId: 1, email: email },
        process.env.JWT_SECRET || 'fallback-secret-123',
        { expiresIn: '24h' }
      );

      return res.json({
        message: 'Login realizado com sucesso',
        token,
        user: {
          id: 1,
          name: 'Usuário Teste',
          email: email
        }
      });
    }

    console.log('❌ Invalid credentials for:', email);
    return res.status(401).json({ error: 'Credenciais inválidas' });

  } catch (error) {
    console.error('💥 ERROR in /auth/login:', error);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message,
      details: 'Check server logs for more information'
    });
  }
});

// ✅ REGISTER SIMPLIFICADO
app.post('/auth/register', async (req, res) => {
  try {
    console.log('📝 Register attempt received');
    console.log('Request body:', req.body);
    
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    console.log('✅ Mock user creation for:', email);
    
    // Mock response - usuário criado com sucesso
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { userId: 2, email: email },
      process.env.JWT_SECRET || 'fallback-secret-123',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      token,
      user: {
        id: 2,
        name: name,
        email: email,
        createdAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('💥 ERROR in /auth/register:', error);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// ✅ ROTA DE TESTE DO BANCO (se quiser testar depois)
app.get('/test-db', async (req, res) => {
  try {
    console.log('🔄 Testing database connection...');
    
    // Tenta carregar o Prisma
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Tenta contar usuários
    const userCount = await prisma.user.count();
    
    console.log('✅ Database test successful, user count:', userCount);
    
    res.json({ 
      database: '✅ Connected', 
      userCount,
      message: 'Database connection successful' 
    });
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    res.status(500).json({ 
      database: '❌ Error', 
      error: error.message,
      message: 'Database connection failed' 
    });
  }
});

// Error handler global
app.use((err, req, res, next) => {
  console.error('💥 GLOBAL ERROR:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log('❌ Route not found:', req.originalUrl);
  res.status(404).json({ 
    error: 'Rota não encontrada',
    path: req.originalUrl 
  });
});

console.log('🚀 Server started with enhanced error logging');
module.exports = app;