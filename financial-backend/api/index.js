// 🔧 USE DATABASE_URL ORIGINAL DO NEON - SEM MODIFICAÇÕES
console.log('🔧 Database configuration:');
console.log('   DATABASE_URL present:', !!process.env.DATABASE_URL);
if (process.env.DATABASE_URL) {
  console.log('   URL preview:', process.env.DATABASE_URL.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
}

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// ✅ 1. CORS CONFIGURATION
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://finfly.vercel.app',
    'https://finfly-nine.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

app.use(express.json());

// ✅ 2. CONEXÃO COM BANCO - SIMPLES E FUNCIONAL
let prisma;
let isDatabaseConnected = false;

try {
  const { PrismaClient } = require('@prisma/client');
  prisma = new PrismaClient();
  
  // Teste simples de conexão
  prisma.$queryRaw`SELECT 1`
    .then(() => {
      isDatabaseConnected = true;
      console.log('✅ Prisma Client connected to PostgreSQL');
    })
    .catch(error => {
      console.error('❌ Prisma Client failed:', error.message);
      isDatabaseConnected = false;
    });
} catch (error) {
  console.error('❌ Prisma Client initialization failed:', error.message);
  isDatabaseConnected = false;
}

// ✅ 3. MIDDLEWARE PARA INJETAR PRISMA
app.use((req, res, next) => {
  if (!isDatabaseConnected) {
    return res.status(503).json({ error: 'Serviço de banco de dados indisponível' });
  }
  req.prisma = prisma;
  next();
});

// ✅ 4. ROTA RAIZ
app.get('/', (req, res) => {
  res.json({ 
    status: 'SUCCESS', 
    message: '🚀 Finfly API Online',
    database: isDatabaseConnected ? '✅ Connected' : '❌ Disconnected',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /',
      'GET /health',
      'POST /auth/register',
      'POST /auth/login',
      'GET /transactions (auth)',
      'POST /transactions (auth)',
      'DELETE /transactions/:id (auth)',
      'GET /summary (auth)',
      'GET /layout (auth)',
      'POST /layout (auth)'
    ]
  });
});

// ✅ 5. HEALTH CHECK
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: '✅ Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// ✅ 6. REGISTRO (COM SQL DIRETO)
app.post('/auth/register', async (req, res) => {
  try {
    console.log('📝 Register attempt:', req.body.email);
    
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    // ✅ SQL DIRETO - Verificar se usuário existe
    const existingUsers = await req.prisma.$queryRaw`
      SELECT * FROM "user" WHERE email = ${email}
    `;
    const existingUser = existingUsers[0] || null;

    if (existingUser) {
      return res.status(400).json({ error: 'Usuário já cadastrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // ✅ SQL DIRETO - Criar usuário
    const newUsers = await req.prisma.$queryRaw`
      INSERT INTO "user" (name, email, password, "createdAt", "updatedAt") 
      VALUES (${name}, ${email}, ${hashedPassword}, NOW(), NOW())
      RETURNING id, name, email, "createdAt"
    `;
    const user = newUsers[0];

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    console.log('✅ User registered:', user.email);
    
    res.status(201).json({
      message: 'Usuário criado com sucesso',
      token,
      user
    });

  } catch (error) {
    console.error('❌ Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ✅ 7. LOGIN (COM SQL DIRETO)
app.post('/auth/login', async (req, res) => {
  try {
    console.log('🔐 Login attempt:', req.body.email);
    
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // ✅ SQL DIRETO - Buscar usuário
    const users = await req.prisma.$queryRaw`
      SELECT * FROM "user" WHERE email = ${email}
    `;
    const user = users[0] || null;

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

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

// ✅ 8. MIDDLEWARE DE AUTENTICAÇÃO
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Token de acesso não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

// ✅ 9. TRANSACTIONS - GET
app.get('/transactions', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, type, category } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { userId: req.user.userId };
    if (type) where.type = type;
    if (category) where.category = category;

    const transactions = await req.prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      skip,
      take: parseInt(limit)
    });

    const total = await req.prisma.transaction.count({ where });

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ Erro ao buscar transações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ✅ 10. TRANSACTIONS - POST
app.post('/transactions', authMiddleware, async (req, res) => {
  try {
    const { value, type, category, description, date } = req.body;

    if (!value || !type || !category) {
      return res.status(400).json({ error: 'Valor, tipo e categoria são obrigatórios' });
    }

    const transaction = await req.prisma.transaction.create({
      data: {
        value: parseFloat(value),
        type,
        category,
        description: description || '',
        date: date ? new Date(date) : new Date(),
        userId: req.user.userId
      }
    });

    res.status(201).json({
      message: 'Transação criada com sucesso',
      transaction
    });
  } catch (error) {
    console.error('❌ Erro ao criar transação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ✅ 11. TRANSACTIONS - DELETE
app.delete('/transactions/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await req.prisma.transaction.findFirst({
      where: { 
        id: parseInt(id), 
        userId: req.user.userId 
      }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    await req.prisma.transaction.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Transação deletada com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao deletar transação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ✅ 12. SUMMARY
app.get('/summary', authMiddleware, async (req, res) => {
  try {
    const where = { userId: req.user.userId };

    const transactions = await req.prisma.transaction.findMany({
      where,
      select: {
        value: true,
        type: true
      }
    });

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.value, 0);

    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.value, 0);

    const balance = totalIncome - totalExpense;

    const transactionsByCategory = await req.prisma.transaction.groupBy({
      by: ['category', 'type'],
      where,
      _sum: {
        value: true
      },
      _count: {
        _all: true
      }
    });

    res.json({
      summary: {
        balance,
        totalIncome,
        totalExpense,
        transactionCount: transactions.length
      },
      byCategory: transactionsByCategory
    });
  } catch (error) {
    console.error('❌ Erro ao buscar resumo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ✅ 13. LAYOUT - POST
app.post('/layout', authMiddleware, async (req, res) => {
  try {
    const { layouts } = req.body;

    for (const [screenSize, layout] of Object.entries(layouts)) {
      await req.prisma.dashboardLayout.upsert({
        where: {
          userId_screenSize: {
            userId: req.user.userId,
            screenSize
          }
        },
        update: {
          layout: JSON.stringify(layout)
        },
        create: {
          layout: JSON.stringify(layout),
          screenSize,
          userId: req.user.userId
        }
      });
    }

    res.json({ message: 'Layout salvo com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao salvar layout:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ✅ 14. LAYOUT - GET
app.get('/layout', authMiddleware, async (req, res) => {
  try {
    const layouts = await req.prisma.dashboardLayout.findMany({
      where: { userId: req.user.userId },
      select: {
        screenSize: true,
        layout: true
      }
    });

    const formattedLayouts = {};
    layouts.forEach(item => {
      try {
        formattedLayouts[item.screenSize] = JSON.parse(item.layout);
      } catch (error) {
        formattedLayouts[item.screenSize] = [];
      }
    });

    res.json({ layouts: formattedLayouts });
  } catch (error) {
    console.error('❌ Erro ao carregar layout:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ✅ 15. ERROR HANDLER
app.use((err, req, res, next) => {
  console.error('💥 GLOBAL ERROR:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

// ✅ 16. 404 HANDLER
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Rota não encontrada',
    path: req.originalUrl,
    availableEndpoints: [
      'GET /',
      'GET /health',
      'POST /auth/register', 
      'POST /auth/login',
      'GET /transactions',
      'POST /transactions',
      'DELETE /transactions/:id',
      'GET /summary',
      'GET /layout',
      'POST /layout'
    ]
  });
});

console.log('🚀 Finfly Server started with ALL routes verified');
module.exports = app;