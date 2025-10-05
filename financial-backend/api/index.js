const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

// ✅ CONEXÃO COM BANCO REAL
let prisma;
try {
  const { PrismaClient } = require('@prisma/client');
  prisma = new PrismaClient();
  console.log('✅ Prisma Client connected to PostgreSQL');
} catch (error) {
  console.error('❌ Prisma Client failed:', error.message);
  process.exit(1);
}

// ✅ MIDDLEWARE PARA INJETAR PRISMA
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// ✅ HEALTH CHECK
app.get('/', (req, res) => {
  res.json({ 
    status: 'SUCCESS', 
    message: '🚀 MoneyFlow API Online',
    database: '✅ PostgreSQL Connected',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: '✅ Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// ✅ REGISTRO REAL COM BANCO
app.post('/auth/register', async (req, res) => {
  try {
    console.log('📝 Register attempt:', req.body.email);
    
    const { name, email, password } = req.body;
    
    // Validações
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });
    }

    // Verificar se usuário já existe
    const existingUser = await req.prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Usuário já cadastrado' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // Criar usuário no banco
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

    // Gerar token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ User registered successfully:', user.email);
    
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

// ✅ LOGIN REAL COM BANCO
app.post('/auth/login', async (req, res) => {
  try {
    console.log('🔐 Login attempt:', req.body.email);
    
    const { email, password } = req.body;

    // Validações
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Buscar usuário no banco
    const user = await req.prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
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

// ✅ MIDDLEWARE DE AUTENTICAÇÃO
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Token de acesso não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

// ✅ TRANSACTIONS ROUTES (REAIS)
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

app.post('/transactions', authMiddleware, async (req, res) => {
  try {
    const { value, type, category, description, date } = req.body;

    // Validações
    if (!value || !type || !category) {
      return res.status(400).json({ error: 'Valor, tipo e categoria são obrigatórios' });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'Tipo deve ser income ou expense' });
    }

    const validCategories = {
      income: ['salary', 'freelance', 'investment', 'gift', 'others'],
      expense: ['food', 'transport', 'leisure', 'health', 'education', 'shopping', 'bills', 'others']
    };

    if (!validCategories[type].includes(category)) {
      return res.status(400).json({ error: 'Categoria inválida' });
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

    console.log('✅ Transaction created:', transaction.id);
    
    res.status(201).json({
      message: 'Transação criada com sucesso',
      transaction
    });
  } catch (error) {
    console.error('❌ Erro ao criar transação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.delete('/transactions/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se a transação pertence ao usuário
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

    console.log('✅ Transaction deleted:', id);
    
    res.json({ message: 'Transação deletada com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao deletar transação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ✅ SUMMARY ROUTE (REAL)
app.get('/summary', authMiddleware, async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    // Calcular datas baseadas no período
    const now = new Date();
    let startDate, endDate;

    if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (period === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
    }

    const where = { 
      userId: req.user.userId,
      date: {
        gte: startDate,
        lte: endDate
      }
    };

    // Buscar transações
    const transactions = await req.prisma.transaction.findMany({
      where,
      select: {
        value: true,
        type: true
      }
    });

    // Calcular totais
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.value, 0);

    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.value, 0);

    const balance = totalIncome - totalExpense;

    // Calcular por categoria
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
        transactionCount: transactions.length,
        period
      },
      byCategory: transactionsByCategory
    });
  } catch (error) {
    console.error('❌ Erro ao buscar resumo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ✅ LAYOUT ROUTES (REAIS)
app.post('/layout', authMiddleware, async (req, res) => {
  try {
    const { layouts } = req.body;

    // Salvar cada tamanho de tela
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

// ✅ ERROR HANDLER
app.use((err, req, res, next) => {
  console.error('💥 GLOBAL ERROR:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

// ✅ 404 HANDLER
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Rota não encontrada',
    path: req.originalUrl 
  });
});

console.log('🚀 MoneyFlow Server started with REAL database');
module.exports = app;