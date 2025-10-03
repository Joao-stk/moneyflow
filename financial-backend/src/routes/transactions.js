const express = require('express');
const { 
  createTransaction, 
  getTransactions, 
  deleteTransaction 
} = require('../controllers/transactionController');

const router = express.Router();

/**
 * @route POST /transactions
 * @description Criar nova transação
 * @access Private
 */
router.post('/', createTransaction);

/**
 * @route GET /transactions
 * @description Listar transações do usuário
 * @access Private
 */
router.get('/', getTransactions);

/**
 * @route DELETE /transactions/:id
 * @description Deletar transação
 * @access Private
 */
router.delete('/:id', deleteTransaction);

module.exports = router;