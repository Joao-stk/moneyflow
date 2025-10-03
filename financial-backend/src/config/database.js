const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Função para conectar ao banco de dados
const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Conectado ao banco de dados SQLite');
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco de dados:', error);
    process.exit(1);
  }
};

// Middleware para injetar prisma no request
const prismaMiddleware = (req, res, next) => {
  req.prisma = prisma;
  next();
};

module.exports = { prisma, connectDB, prismaMiddleware };