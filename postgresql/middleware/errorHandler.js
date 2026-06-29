// ================================================================
//  middleware/errorHandler.js
// ================================================================
'use strict';

const { validationResult } = require('express-validator');

/** Kumpulkan error validasi express-validator dan kirim 422 */
function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validasi gagal',
      errors:  errors.array().map(e => ({ field: e.path, msg: e.msg })),
    });
  }
  next();
}

/** 404 — route tidak ditemukan */
function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Route tidak ditemukan: ${req.method} ${req.originalUrl}`,
  });
}

/** Global error handler */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const isDev = process.env.NODE_ENV !== 'production';

  // PostgreSQL error codes
  const pgErrors = {
    '23505': { status: 409, msg: 'Data sudah ada (duplikat).' },
    '23503': { status: 409, msg: 'Data terkait tidak ditemukan (foreign key).' },
    '23514': { status: 422, msg: 'Nilai tidak memenuhi constraint.' },
    '42P01': { status: 500, msg: 'Tabel tidak ditemukan — jalankan migrasi terlebih dahulu.' },
  };

  if (err.code && pgErrors[err.code]) {
    const { status, msg } = pgErrors[err.code];
    return res.status(status).json({ success: false, message: msg });
  }

  console.error('[Error]', err.message, isDev ? err.stack : '');

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan pada server.',
    ...(isDev && { stack: err.stack }),
  });
}

module.exports = { handleValidation, notFound, errorHandler };
