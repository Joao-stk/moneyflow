const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');

/**
 * @route GET /export
 * @description Exportar dados do usuário
 * @access Private
 */
router.get('/', exportController.exportData);

module.exports = router;