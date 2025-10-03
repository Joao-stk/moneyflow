const express = require('express');
const { register, login } = require('../controllers/authController');

const router = express.Router();

/**
 * @route POST /auth/register
 * @description Registrar novo usuário
 * @access Public
 */
router.post('/register', register);

/**
 * @route POST /auth/login
 * @description Fazer login
 * @access Public
 */
router.post('/login', login);

module.exports = router;