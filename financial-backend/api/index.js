const express = require('express');
const cors = require('cors');

const app = express();

// ✅ CONFIGURAÇÃO CORS ROBUSTA
const corsOptions = {
  origin: [
    'https://moneyflow-jb3b.vercel.app',
    'https://moneyflow-frontend.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  optionsSuccessStatus: 200
};

// Aplica CORS para TODAS as rotas
app.use(cors(corsOptions));

// ✅ MIDDLEWARE MANUAL para garantir CORS
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://moneyflow-jb3b.vercel.app',
    'https://moneyflow-frontend.vercel.app',
    'http://localhost:5173'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  
  // ✅ RESPONDE IMEDIATAMENTE para OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

app.use(express.json());

// Error handling para inicialização
let prisma;
try {
  const { PrismaClient } = require('@prisma/client');
  prisma = new PrismaClient();
  console.log('✅ Prisma Client loaded successfully');
} catch (error) {
  console.error('❌ Prisma Client failed:', error.message);
}

// Middleware para injetar prisma
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// Health checks
app.get('/', (req, res) => {
  res.json({ 
    status: 'SUCCESS', 
    message: '🚀 MoneyFlow Backend Online',
    database: prisma ? '✅ Connected' : '❌ Disconnected',
    cors: '✅ Configured'
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: '✅ Health Check Passed',
    timestamp: new Date().toISOString()
  });
});

// ✅ ROTA ESPECÍFICA para OPTIONS do /auth/login
app.options('/auth/login', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://moneyflow-jb3b.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(200).end();
});

// ✅ ROTA ESPECÍFICA para OPTIONS do /auth/register
app.options('/auth/register', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://moneyflow-jb3b.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(200).end();
});

// Auth routes
app.post('/auth/register', async (req, res) => {
  try {
    console.log('📝 Register attempt:', req.body.email);
    
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    const existingUser = await req.prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Usuário já cadastrado' });
    }

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await req.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });

    console.log('✅ User registered:', user.email);
    
    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user
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

    const user = await req.prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const bcrypt = require('bcryptjs');
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    console.log('✅ Login successful:', user.email);
    
    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Rota não encontrada',
    path: req.originalUrl 
  });
});

console.log('🔄 Server started with CORS configured');
module.exports = app;