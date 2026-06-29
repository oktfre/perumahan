// ================================================================
//  server.js  —  Havenest API  |  PostgreSQL
// ================================================================
'use strict';

require('dotenv').config();

const express     = require('express');
const helmet      = require('helmet');
const cors        = require('cors');
const morgan      = require('morgan');
const compression = require('compression');
const rateLimit   = require('express-rate-limit');

const routes                    = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { pool }                  = require('./db');

const app  = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// ── CORS
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',').map(o => o.trim());

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: Origin tidak diizinkan — ${origin}`));
  },
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

// ── Middleware global
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Rate limiting
app.use('/api', rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  max:      parseInt(process.env.RATE_LIMIT_MAX       || '200',    10),
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: 'Terlalu banyak request, coba lagi nanti.' },
}));

// ── Routes
app.use('/api', routes);

// ── Root
app.get('/', (req, res) => {
  res.json({
    service: 'Havenest API',
    db:      'PostgreSQL',
    version: '1.0.0',
    docs:    `http://localhost:${PORT}/api/health`,
    endpoints: {
      health:       'GET  /api/health',
      perumahan:    'GET  /api/perumahan',
      properties:   'GET  /api/properties',
      tersedia:     'GET  /api/properties/tersedia',
      rekap:        'GET  /api/rekap',
      kpr_banks:    'GET  /api/kpr/banks',
      kpr_simulasi: 'POST /api/kpr/simulasi',
      kontak:       'POST /api/kontak',
      testimonials: 'GET  /api/testimonials',
    },
  });
});

// ── 404 & error handler
app.use(notFound);
app.use(errorHandler);

// ── Graceful shutdown
async function shutdown(signal) {
  console.log(`\n[Server] ${signal} diterima — menutup server…`);
  await pool.end();
  console.log('[DB] Pool PostgreSQL ditutup.');
  process.exit(0);
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

// ── Auto-migrasi: pastikan kolom terbaru ada ────────────────
async function runMigrations() {
  const client = await pool.connect();
  try {
    // Tambah luas_bangunan_m2 jika belum ada
    await client.query(`
      ALTER TABLE tipe_unit
        ADD COLUMN IF NOT EXISTS luas_bangunan_m2 NUMERIC(8,2) DEFAULT 36
    `);
    // Isi nilai default untuk baris yang NULL
    await client.query(`
      UPDATE tipe_unit SET luas_bangunan_m2 = 36 WHERE luas_bangunan_m2 IS NULL
    `);
    // Tambah blok & nomor_unit jika belum ada (untuk fitur pilih unit)
    await client.query(`
      ALTER TABLE tipe_unit
        ADD COLUMN IF NOT EXISTS blok VARCHAR(10) DEFAULT 'A',
        ADD COLUMN IF NOT EXISTS nomor_unit VARCHAR(10) DEFAULT '01',
        ADD COLUMN IF NOT EXISTS unit_status VARCHAR(20) DEFAULT 'tersedia'
    `);
    console.log('[DB] ✅ Migrasi kolom berhasil (luas_bangunan_m2, blok, nomor_unit, unit_status).');
  } catch (err) {
    // Jangan crash server, cukup log warning
    console.warn('[DB] ⚠️  Migrasi dilewati (mungkin sudah ada):', err.message);
  } finally {
    client.release();
  }
}

// ── Start
async function start() {
  try {
    // Tes koneksi DB sebelum listen
    await pool.query('SELECT 1');
    console.log('[DB] ✅ Koneksi PostgreSQL berhasil.');

    // Jalankan migrasi otomatis
    await runMigrations();

    app.listen(PORT, () => {
      console.log(`[Server] 🚀 Havenest API (PostgreSQL) berjalan di http://localhost:${PORT}`);
      console.log(`[Server] ENV: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('[DB] ❌ Gagal terhubung ke PostgreSQL:', err.message);
    console.error('[DB] Pastikan PostgreSQL berjalan dan .env sudah benar.');
    process.exit(1);
  }
}

start();
