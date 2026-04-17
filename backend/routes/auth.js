'use strict';

const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '24h';

/**
 * POST /api/auth/login
 * Body: { username, password }
 * Returns: { token, user }
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Podaj nazwę użytkownika i hasło.' });
    }

    const user = await User.findOne({ username: username.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Nieprawidłowa nazwa użytkownika lub hasło.' });
    }

    if (!user.active) {
      return res.status(403).json({ message: 'Konto jest dezaktywowane.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Nieprawidłowa nazwa użytkownika lub hasło.' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Błąd serwera.' });
  }
});

/**
 * GET /api/auth/verify
 * Headers: Authorization: Bearer <token>
 * Returns: { valid: true, user }
 */
router.get('/verify', auth, (req, res) => {
  res.json({
    valid: true,
    user: {
      id: req.user._id,
      username: req.user.username,
      role: req.user.role,
    },
  });
});

/**
 * POST /api/auth/change-password
 * Body: { currentPassword, newPassword }
 */
router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Podaj aktualne i nowe hasło.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Nowe hasło musi mieć minimum 6 znaków.' });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Aktualne hasło jest nieprawidłowe.' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Hasło zostało zmienione.' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Błąd serwera.' });
  }
});

module.exports = router;
