const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Token recebido:', token);
  console.log('JWT_SECRET:', process.env.JWT_SECRET);

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    console.log('Erro no token:', err.message);
    return res.status(403).json({ error: 'Token inválido' });
  }
}

module.exports = authMiddleware;