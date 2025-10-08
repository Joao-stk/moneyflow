const { Transaction } = require('../config/database') // Ajuste conforme seu modelo

const exportController = {
  exportData: async (req, res) => {
    try {
      const { type = 'csv', range = 'all', startDate, endDate } = req.query
      const userId = req.user.id

      // Buscar transações do banco
      const transactions = await getTransactionsFromDB(userId, { range, startDate, endDate })

      let data, contentType, filename

      switch (type) {
        case 'csv':
          data = generateCSV(transactions)
          contentType = 'text/csv'
          filename = `finfly-${userId}-${Date.now()}.csv`
          break

        case 'json':
          data = JSON.stringify({
            exportedAt: new Date().toISOString(),
            user: req.user.email,
            transactions: transactions
          }, null, 2)
          contentType = 'application/json'
          filename = `finfly-${userId}-${Date.now()}.json`
          break

        case 'pdf':
          // Para PDF você pode usar uma biblioteca como pdfkit
          data = await generatePDF(transactions)
          contentType = 'application/pdf'
          filename = `finfly-${userId}-${Date.now()}.pdf`
          break

        default:
          return res.status(400).json({ error: 'Tipo de exportação não suportado' })
      }

      // Configurar headers para download
      res.setHeader('Content-Type', contentType)
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
      res.setHeader('Cache-Control', 'no-cache')

      return res.send(data)

    } catch (error) {
      console.error('Erro na exportação:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }
}

// Função para buscar transações do banco
async function getTransactionsFromDB(userId, filters) {
  const where = { userId }
  
  // Aplicar filtros de data
  if (filters.range === 'month') {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    
    where.date = {
      gte: startOfMonth
    }
  } else if (filters.range === 'year') {
    const startOfYear = new Date(new Date().getFullYear(), 0, 1)
    where.date = {
      gte: startOfYear
    }
  } else if (filters.range === 'last3') {
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
    
    where.date = {
      gte: threeMonthsAgo
    }
  } else if (filters.range === 'custom' && filters.startDate && filters.endDate) {
    where.date = {
      gte: new Date(filters.startDate),
      lte: new Date(filters.endDate)
    }
  }

  // Ajuste conforme seu modelo do Sequelize/Prisma
  return await Transaction.findAll({
    where,
    order: [['date', 'DESC']]
  })
}

// Função para gerar CSV
function generateCSV(transactions) {
  const headers = 'Data,Descrição,Categoria,Tipo,Valor\n'
  
  const rows = transactions.map(tx => {
    const date = new Date(tx.date).toLocaleDateString('pt-BR')
    const description = `"${tx.description?.replace(/"/g, '""') || ''}"` // Escapar aspas
    const category = tx.category
    const type = tx.type === 'income' ? 'Receita' : 'Despesa'
    const value = tx.value.toFixed(2).replace('.', ',')
    
    return `${date},${description},${category},${type},${value}`
  }).join('\n')

  return headers + rows
}

// Função para gerar PDF (implementação básica)
async function generatePDF(transactions) {
  // Se quiser implementar PDF, instale: npm install pdfkit
  const PDFDocument = require('pdfkit')
  const doc = new PDFDocument()
  
  let buffers = []
  doc.on('data', buffers.push.bind(buffers))
  
  return new Promise((resolve) => {
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers)
      resolve(pdfData)
    })

    // Conteúdo do PDF
    doc.fontSize(20).text('Relatório FinFly', 100, 100)
    doc.fontSize(12).text(`Exportado em: ${new Date().toLocaleDateString('pt-BR')}`, 100, 130)
    
    let y = 180
    transactions.forEach((tx, index) => {
      if (y > 700) {
        doc.addPage()
        y = 100
      }
      
      const type = tx.type === 'income' ? '💰 Receita' : '💸 Despesa'
      doc.text(`${new Date(tx.date).toLocaleDateString('pt-BR')} - ${tx.description || 'Sem descrição'}`, 100, y)
      doc.text(`${type} - R$ ${tx.value.toFixed(2)}`, 100, y + 15)
      y += 40
    })

    doc.end()
  })
}

module.exports = exportController