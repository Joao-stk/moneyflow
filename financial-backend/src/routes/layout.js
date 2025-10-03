const express = require('express');
const { saveLayout, getLayout } = require('../controllers/layoutController');

const router = express.Router();

/**
 * @route POST /layout
 * @description Salvar layout do dashboard
 * @access Private
 */
router.post('/', saveLayout);

/**
 * @route GET /layout
 * @description Carregar layout do dashboard
 * @access Private
 */
router.get('/', getLayout);

module.exports = router;