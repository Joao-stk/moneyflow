const express = require('express');
const cors = require('cors');

const app = express();

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
    message: 'MoneyFlow Backend Online! 🚀',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: '✅ Health Check Passed',
    version: '1.0.0'
  });
});

// Rota catch-all para debugging
app.get('*', (req, res) => {
  res.json({ 
    message: 'Rota capturada pelo Express',
    path: req.path,
    method: req.method,
    query: req.query,
    timestamp: new Date().toISOString()
  });
});

module.exports = app;
EOF
