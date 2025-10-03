const express = require('express');
const { getSummary } = require('../controllers/summaryController');

const router = express.Router();

/**
 * @route GET /summary
 * @description Obter resumo financeiro
 * @access Private
 */
router.get('/', getSummary);

module.exports = router;