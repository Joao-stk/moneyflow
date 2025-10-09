const jwt = require('jsonwebtoken');

/**
 * Middleware para validar token JWT
 */
const authMiddleware = (req, res, next) => {
  console.log('🔐 Auth Middleware - Headers:', req.headers);
  
  const authHeader = req.headers.authorization;
  console.log('🔐 Auth Header:', authHeader);
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ Token não fornecido ou formato inválido');
    return res.status(401).json({ error: 'Token de acesso não fornecido' });
  }

  const token = authHeader.split(' ')[1];
  console.log('🔐 Token recebido:', token ? 'PRESENTE' : 'AUSENTE');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token válido - User:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.log('❌ Token inválido:', error.message);
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};
module.exports = authMiddleware;