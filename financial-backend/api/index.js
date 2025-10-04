const express = require('express');
const cors = require('cors');

const app = express();

// Error handling para inicialização
let prisma;
try {
  const { PrismaClient } = require('@prisma/client');
  prisma = new PrismaClient();
  console.log('✅ Prisma Client loaded successfully');
} catch (error) {
  console.error('❌ Prisma Client failed:', error.message);
}

// Middlewares
app.use(cors({
  origin: [
    'https://moneyflow-frontend.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true
}));

app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'SUCCESS', 
    message: '🚀 MoneyFlow Backend Online',
    database: prisma ? '✅ Connected' : '❌ Disconnected',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: '✅ Health Check Passed'
  });
});

// Rota que testa o banco
app.get('/test-db', async (req, res) => {
  if (!prisma) {
    return res.status(500).json({ 
      error: 'Database not available'
    });
  }

  try {
    const userCount = await prisma.user.count();
    res.json({ 
      database: '✅ Working', 
      userCount,
      message: 'Database connection successful' 
    });
  } catch (error) {
    res.status(500).json({ 
      database: '❌ Error', 
      error: error.message
    });
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

module.exports = app;
