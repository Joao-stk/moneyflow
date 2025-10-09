const exportController = {
  exportData: async (req, res) => {
    try {
      const { type = 'json', range = 'all', startDate, endDate } = req.query;
      const userId = req.user.id;

      console.log('📤 Export request from user:', userId, { type, range });

      // Buscar transações do usuário
      const where = { userId: userId };

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

      const transactions = await req.prisma.transaction.findMany({
        where: where,
        orderBy: { date: 'desc' }
      });

      console.log(`📊 User ${userId} has ${transactions.length} transactions for export`);

      let data, contentType, filename;

      if (type === 'json') {
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
        return res.status(400).json({ error: 'Tipo não suportado. Use json.' });
      }

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      console.log(`✅ Export completed: ${filename}`);
      return res.send(data);

    } catch (error) {
      console.error('❌ Erro na exportação:', error);
      return res.status(500).json({ error: 'Erro ao exportar dados: ' + error.message });
    }
  }
};

module.exports = exportController;