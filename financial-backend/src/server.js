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
  origin: 'http://localhost:5173', // URL do seu frontend
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

// Rotas protegidas
app.use('/transactions', transactionRoutes);
app.use('/summary', summaryRoutes);
app.use('/layout', layoutRoutes);

// ✅ CORREÇÃO: Adicione a rota de exportação DENTRO do transactionsRoutes
// Ou crie uma rota separada:

// Rota de exportação - adicione esta rota específica
app.get('/transactions/export', async (req, res) => {
  try {
    const { type = 'csv', range = 'all', startDate, endDate } = req.query;
    const userId = req.user.id;

    console.log('Export request:', { type, range, userId });

    // Buscar transações do usuário
    const transactions = await req.prisma.transaction.findMany({
      where: { 
        userId: userId
      },
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
        user: req.user.email,
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
    
    return res.send(data);

  } catch (error) {
    console.error('Erro na exportação:', error);
    return res.status(500).json({ error: 'Erro ao exportar dados: ' + error.message });
  }
});

// Função para gerar CSV
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

// Rota de saúde
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando!' });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Rota não encontrada
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Rota não encontrada',
    path: req.originalUrl,
    availableEndpoints: [
      'GET /health',
      'POST /auth/register',
      'POST /auth/login',
      'GET /transactions',
      'POST /transactions', 
      'DELETE /transactions/:id',
      'GET /transactions/export', // ✅ AGORA DISPONÍVEL
      'GET /summary',
      'GET /layout',
      'POST /layout'
    ]
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Sistema de controle financeiro pessoal`);
  console.log(`🌐 CORS habilitado para: http://localhost:5173`);
  console.log(`📤 Rota de exportação disponível: GET /transactions/export`);
});