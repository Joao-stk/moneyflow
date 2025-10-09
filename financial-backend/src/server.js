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

// Middlewares - CORS PRIMEIRO
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

// Injeta prisma em todas as rotas
app.use(prismaMiddleware);

// Rotas públicas
app.use('/auth', authRoutes);

// Middleware de autenticação para rotas protegidas
app.use(authMiddleware);

// ✅✅✅ APENAS ESTA ROTA ESPECÍFICA - COLE APENAS ESTA PARTE ✅✅✅
app.get('/transactions/export', async (req, res) => {
  try {
    const { type = 'csv', range = 'all', startDate, endDate } = req.query;
    const userId = req.user.id;

    console.log('📤 Export request from user:', userId, { type, range });

    // ✅ FILTRO SEGURO - apenas pelo userId
    const where = { 
      userId: userId
    };

    // Aplicar filtros de data
    if (range === 'month') {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      where.date = { gte: startOfMonth };
    } else if (range === 'year') {
      const startOfYear = new Date(new Date().getFullYear(), 0, 1);
      where.date = { gte: startOfYear };
    } else if (range === 'last3') {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      where.date = { gte: threeMonthsAgo };
    } else if (range === 'custom' && startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    console.log('🔐 Query filter:', JSON.stringify(where, null, 2));

    // Buscar transações do usuário
    const transactions = await req.prisma.transaction.findMany({
      where: where,
      orderBy: { date: 'desc' }
    });

    console.log(`📊 User ${userId} has ${transactions.length} transactions for export`);

    let data, contentType, filename;

    if (type === 'csv') {
      data = generateCSV(transactions);
      contentType = 'text/csv';
      filename = `finfly-export-${Date.now()}.csv`;
    } else if (type === 'json') {
      data = JSON.stringify({
        exportedAt: new Date().toISOString(),
        user: {
          id: userId,
          email: req.user.email
        },
        transactionCount: transactions.length,
        transactions: transactions
      }, null, 2);
      contentType = 'application/json';
      filename = `finfly-export-${Date.now()}.json`;
    } else {
      return res.status(400).json({ error: 'Tipo não suportado. Use csv ou json.' });
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    console.log(`✅ Export completed for user ${userId}: ${filename}`);
    return res.send(data);

  } catch (error) {
    console.error('❌ Erro na exportação:', error);
    return res.status(500).json({ error: 'Erro ao exportar dados: ' + error.message });
  }
});

// ✅✅✅ FIM DA PARTE PARA COLE - MANTENHA O RESTO DO SEU CÓDIGO ✅✅✅

// ✅ MANTENHA SUAS ROTAS EXISTENTES
app.use('/transactions', transactionRoutes);
app.use('/summary', summaryRoutes);
app.use('/layout', layoutRoutes);

// ✅ MANTENHA SUA ROTA DE SAÚDE
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando!' });
});

// ✅ MANTENHA SEU MIDDLEWARE DE ERROS
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// ✅ MANTENHA SUA ROTA NÃO ENCONTRADA
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Rota não encontrada',
    path: req.originalUrl,
    availableEndpoints: [
      'GET /health',
      'POST /auth/register',
      'POST /auth/login',
      'GET /transactions/export', // ✅ ADICIONADA AQUI
      'GET /transactions',
      'POST /transactions', 
      'DELETE /transactions/:id',
      'GET /summary',
      'GET /layout',
      'POST /layout'
    ]
  });
});

// ✅ MANTENHA SUA FUNÇÃO generateCSV (se já existir, não duplique)
function generateCSV(transactions) {
  const headers = 'Data,Descrição,Categoria,Tipo,Valor\n';
  
  const rows = transactions.map(tx => {
    const date = new Date(tx.date).toLocaleDateString('pt-BR');
    const description = `"${tx.description || ''}"`;
    const category = tx.category;
    const type = tx.type === 'income' ? 'Receita' : 'Despesa';
    const value = tx.value.toFixed(2).replace('.', ',');
    
    return `${date},${description},${category},${type},${value}`;
  }).join('\n');

  return headers + rows;
}

// ✅ MANTENHA SEU EXPORT PARA VERCEL
module.exports = app;

// ✅ MANTENHA SEU SERVIDOR LOCAL
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📊 Sistema de controle financeiro pessoal`);
    console.log(`🔐 SEGURANÇA: Filtro por userId implementado`);
    console.log(`🌐 CORS habilitado`);
    console.log(`📤 Rota de exportação disponível: GET /transactions/export`);
  });
}