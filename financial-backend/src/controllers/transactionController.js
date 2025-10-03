const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Controller para criar uma nova transação
 */
const createTransaction = async (req, res) => {
  try {
    const { value, type, category, description, date } = req.body;
    const userId = req.user.userId;

    // Validar campos obrigatórios
    if (!value || !type || !category) {
      return res.status(400).json({ error: 'Valor, tipo e categoria são obrigatórios' });
    }

    // Validar tipo
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'Tipo deve ser "income" ou "expense"' });
    }

    // Validar valor positivo
    if (value <= 0) {
      return res.status(400).json({ error: 'Valor deve ser maior que zero' });
    }

    // Lista de categorias válidas
    const validCategories = {
      income: ['salary', 'freelance', 'investment', 'gift', 'others'],
      expense: ['food', 'transport', 'leisure', 'health', 'education', 'shopping', 'bills', 'others']
    };

    // Validar categoria
    if (!validCategories[type].includes(category)) {
      return res.status(400).json({ 
        error: `Categoria inválida. Categorias válidas para ${type}: ${validCategories[type].join(', ')}` 
      });
    }

    // Criar transação
    const transaction = await req.prisma.transaction.create({
      data: {
        value: parseFloat(value),
        type,
        category,
        description: description || '',
        date: date ? new Date(date) : new Date(),
        userId
      }
    });

    res.status(201).json({
      message: 'Transação criada com sucesso',
      transaction
    });
  } catch (error) {
    console.error('Erro ao criar transação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Controller para listar transações do usuário
 */
const getTransactions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, type, category, startDate, endDate } = req.query;

    // Construir filtros
    const where = { userId };
    
    if (type) where.type = type;
    if (category) where.category = category;
    
    // Filtro por data
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    // Calcular paginação
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Buscar transações
    const transactions = await req.prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      skip,
      take: parseInt(limit)
    });

    // Contar total de transações
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
    console.error('Erro ao buscar transações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Controller para deletar uma transação
 */
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Verificar se transação existe e pertence ao usuário
    const transaction = await req.prisma.transaction.findFirst({
      where: { 
        id: parseInt(id), 
        userId 
      }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    // Deletar transação
    await req.prisma.transaction.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Transação deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar transação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// EXPORT CORRETO - verifique se está assim
module.exports = { 
  createTransaction, 
  getTransactions, 
  deleteTransaction 
};