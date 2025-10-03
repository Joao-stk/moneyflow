/**
 * Controller para obter resumo financeiro do usuário
 */
const getSummary = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { period = 'month' } = req.query; // 'month' ou 'year'

    // Calcular datas baseadas no período
    const now = new Date();
    let startDate, endDate;

    if (period === 'month') {
      // Este mês
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (period === 'year') {
      // Este ano
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
    } else {
      // Todos os dados (sem filtro)
      startDate = null;
      endDate = null;
    }

    // Construir filtro de data
    const where = { userId };
    
    if (startDate && endDate) {
      where.date = {
        gte: startDate,
        lte: endDate
      };
    }

    console.log(`Filtrando por período: ${period}`, {
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString()
    });

    // Buscar todas as transações do usuário no período
    const transactions = await req.prisma.transaction.findMany({
      where,
      select: {
        value: true,
        type: true,
        date: true
      }
    });

    console.log(`Transações encontradas: ${transactions.length}`);

    // Calcular totais
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.value, 0);

    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.value, 0);

    const balance = totalIncome - totalExpense;

    // Calcular totais por categoria
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
        period,
        periodRange: {
          start: startDate,
          end: endDate
        }
      },
      byCategory: transactionsByCategory
    });
  } catch (error) {
    console.error('Erro ao buscar resumo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = { getSummary };