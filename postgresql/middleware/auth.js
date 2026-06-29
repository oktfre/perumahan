// ================================================================
//  middleware/auth.js  —  JWT authentication & role guard
// ================================================================
'use strict';

const jwt = require('jsonwebtoken');
const db  = require('../db');

const JWT_SECRET  = process.env.JWT_SECRET  || 'havenest_secret_ganti_di_production';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '8h';
const JWT_REFRESH = process.env.JWT_REFRESH || '7d';

// ── Buat access token
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

// ── Buat refresh token
function signRefresh(payload) {
  return jwt.sign(payload, JWT_SECRET + '_refresh', { expiresIn: JWT_REFRESH });
}

// ── Middleware: verifikasi Bearer token
async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token tidak ditemukan. Silakan login.' });
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET);

    // Cek user masih aktif di DB (anti revoke)
    const { rows: [user] } = await db.query(
      'SELECT id, nama, email, role, is_active FROM users WHERE id = $1',
      [decoded.id]
    );

    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, message: 'Akun tidak ditemukan atau tidak aktif.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token kadaluarsa. Silakan login kembali.', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ success: false, message: 'Token tidak valid.' });
  }
}

// ── Middleware: hanya admin
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Tidak terautentikasi.' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Akses ditolak. Hanya admin yang diizinkan.' });
  }
  next();
}

// ── Middleware: login opsional (tidak error jika tidak ada token)
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) return next();

    const token   = authHeader.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    const { rows: [user] } = await db.query(
      'SELECT id, nama, email, role, is_active FROM users WHERE id = $1',
      [decoded.id]
    );
    if (user && user.is_active) req.user = user;
  } catch (_) { /* abaikan error */ }
  next();
}

module.exports = { signToken, signRefresh, verifyToken, requireAdmin, optionalAuth };
