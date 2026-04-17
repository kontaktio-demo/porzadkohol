'use strict';

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

/**
 * Middleware: verifies JWT token from Authorization header.
 */
async function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';

  if (!token) {
    return res.status(401).json({ error: 'Brak tokenu autoryzacji.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.active) {
      return res.status(401).json({ error: 'Użytkownik nieaktywny lub nie istnieje.' });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Token nieprawidłowy lub wygasł.' });
  }
}

module.exports = authMiddleware;
