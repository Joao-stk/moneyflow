const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDB, prismaMiddleware } = require('./config/database');

const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const summaryRoutes = require('./routes/summary');
const authMiddleware = require('./middlewares/auth');
const layoutRoutes = require('./routes/layout');
const exportRoutes = require('./routes/export'); // ✅ NOVA IMPORT

const app = express();

// Conectar ao banco de dados
connectDB();

// Middlewares - CORS PRIMEIRO
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://finfly.vercel.app',
    'https://finfly-git-main-joao-stks-projects.vercel.app',
    'https://finfly-git-develop-joao-stks-projects.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// ✅ ADICIONE PARA PREFLIGHT
app.options('*', cors());

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
app.use('/export', exportRoutes); // ✅ NOVA ROTA

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
      'GET /summary',
      'GET /layout',
      'POST /layout',
      'GET /export' // ✅ ADICIONADA
    ]
  });
});

// Export para Vercel
module.exports = app;

// Para desenvolvimento local
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📊 Sistema de controle financeiro pessoal`);
    console.log(`🌐 CORS habilitado`);
    console.log(`📤 Rota de exportação: GET /export`);
  });
}