const express = require('express')
const router = express.Router()
const exportController = require('../controllers/exportController')
const authMiddleware = require('../middlewares/authMiddleware')

// Rota para exportar dados - requer autenticação
router.get('/export', authMiddleware, exportController.exportData)

module.exports = router