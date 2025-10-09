const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDB, prismaMiddleware } = require('./config/database');

const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const summaryRoutes = require('./routes/summary');
const authMiddleware = require('./middlewares/auth');
const layoutRoutes = require('./routes/layout');

const app = express();

// Conectar ao banco de dados
connectDB();

// Middlewares
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://finfly.vercel.app',
    'https://finfly-git-main-joao-stks-projects.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(prismaMiddleware);

// ✅ ROTAS PÚBLICAS (sem auth)
app.use('/auth', authRoutes);

// ✅ MIDDLEWARE DE AUTENTICAÇÃO (aplica para todas as rotas abaixo)
app.use(authMiddleware);

// ✅ ROTAS PROTEGIDAS (todas abaixo do authMiddleware)
app.get('/transactions/export', async (req, res) => {
  try {
    const { type = 'csv', range = 'all', startDate, endDate } = req.query;
    const userId = req.user.id; // ✅ Agora req.user existe!

    console.log('✅ Usuário autenticado:', req.user.id, req.user.email);
    
    // ... resto do código da exportação
    const where = { userId: userId };
    
    const transactions = await req.prisma.transaction.findMany({
      where: where,
      orderBy: { date: 'desc' }
    });

    let data, contentType, filename;

    if (type === 'csv') {
      data = generateCSV(transactions);
      contentType = 'text/csv';
      filename = `finfly-export-${Date.now()}.csv`;
    } else if (type === 'json') {
      data = JSON.stringify({
        exportedAt: new Date().toISOString(),
        user: req.user,
        transactionCount: transactions.length,
        transactions: transactions
      }, null, 2);
      contentType = 'application/json';
      filename = `finfly-export-${Date.now()}.json`;
    } else {
      return res.status(400).json({ error: 'Tipo não suportado' });
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    return res.send(data);

  } catch (error) {
    console.error('Erro na exportação:', error);
    return res.status(500).json({ error: 'Erro ao exportar dados' });
  }
});

// Outras rotas protegidas
app.use('/transactions', transactionRoutes);
app.use('/summary', summaryRoutes);
app.use('/layout', layoutRoutes);

// Rota de saúde (pública - antes do authMiddleware)
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando!' });
});

// ... resto do código