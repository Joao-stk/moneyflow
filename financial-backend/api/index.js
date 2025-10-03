// backend/api/index.js - VERSÃO SUPER SIMPLES
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ message: '✅ BACKEND FUNCIONANDO!' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Health Check OK' });
});

app.get('*', (req, res) => {
  res.json({ 
    message: 'Rota capturada', 
    path: req.path,
    method: req.method 
  });
});

module.exports = app;