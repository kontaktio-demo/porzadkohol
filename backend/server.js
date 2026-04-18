'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');

// Validate critical env vars early
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('✗ FATAL: JWT_SECRET must be set and at least 32 characters long.');
  process.exit(1);
}

// This import also validates SUPABASE_URL / SUPABASE_SERVICE_KEY
const supabase = require('./db');

const authRoutes = require('./routes/auth');
const offerRoutes = require('./routes/offers');
const imageRoutes = require('./routes/images');

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    if (allowedOrigins.length === 0) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('CORS: origin not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Zbyt wiele żądań. Spróbuj ponownie za chwilę.' },
});
app.use('/api/', apiLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { error: 'Zbyt wiele prób logowania. Spróbuj ponownie za 15 minut.' },
});
app.use('/api/auth/login', authLimiter);

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('short'));
}

app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '7d',
  immutable: true,
}));

app.use('/api/auth', authRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/images', imageRoutes);

app.get('/api/health', async (_req, res) => {
  // Quick Supabase connectivity check
  let dbOk = false;
  try {
    const { error } = await supabase.from('users').select('id').limit(1);
    dbOk = !error;
  } catch { /* ignore */ }

  res.json({
    status: dbOk ? 'ok' : 'degraded',
    database: dbOk ? 'connected' : 'error',
    timestamp: new Date().toISOString(),
  });
});

// Root
app.get('/', (_req, res) => {
  res.json({
    name: 'MWW Backend API',
    version: '1.0.0',
    database: 'Supabase (PostgreSQL)',
    endpoints: {
      health: '/api/health',
      offers: '/api/offers',
      auth: '/api/auth/login',
      images: '/api/images/upload',
    },
  });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Nie znaleziono zasobu.' });
});

app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message || err);
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({ error: 'Origin nie jest dozwolony (CORS).' });
  }
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Wewnętrzny błąd serwera.'
      : err.message,
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✓ MWW Backend running on port ${PORT} (Supabase)`);
});

module.exports = app;
