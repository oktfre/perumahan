// ================================================================
//  controllers/authController.js  —  PostgreSQL
//  Endpoints: login, me, logout, ganti-password, users (admin)
// ================================================================
'use strict';

const bcrypt = require('bcryptjs');
const db     = require('../db');
const { signToken } = require('../middleware/auth');

// ────────────────────────────────────────────────────────────────
// POST /api/auth/login
// Body: { email, password }
// ────────────────────────────────────────────────────────────────
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const { rows: [user] } = await db.query(
      `SELECT id, nama, email, password_hash, role, is_active
       FROM   users WHERE email = $1`,
      [email.toLowerCase().trim()]
    );

    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, message: 'Email atau password salah.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Email atau password salah.' });
    }

    // Update last_login
    await db.query(`UPDATE users SET last_login = NOW() WHERE id = $1`, [user.id]);

    const token = signToken({ id: user.id, role: user.role });

    res.json({
      success: true,
      message: `Selamat datang, ${user.nama}!`,
      token,
      user: { id: user.id, nama: user.nama, email: user.email, role: user.role },
    });
  } catch (err) { next(err); }
}

// ────────────────────────────────────────────────────────────────
// GET /api/auth/me  (requires verifyToken)
// ────────────────────────────────────────────────────────────────
async function me(req, res, next) {
  try {
    const { rows: [user] } = await db.query(
      `SELECT id, nama, email, role, last_login, created_at FROM users WHERE id = $1`,
      [req.user.id]
    );
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}

// ────────────────────────────────────────────────────────────────
// POST /api/auth/logout  — client hapus token; server bisa blacklist di sini
// ────────────────────────────────────────────────────────────────
async function logout(req, res) {
  // Jika memakai refresh_tokens, hapus di sini
  res.json({ success: true, message: 'Berhasil logout.' });
}

// ────────────────────────────────────────────────────────────────
// PUT /api/auth/ganti-password  (requires verifyToken)
// Body: { password_lama, password_baru }
// ────────────────────────────────────────────────────────────────
async function gantiPassword(req, res, next) {
  try {
    const { password_lama, password_baru } = req.body;

    const { rows: [user] } = await db.query(
      `SELECT password_hash FROM users WHERE id = $1`, [req.user.id]
    );

    const valid = await bcrypt.compare(password_lama, user.password_hash);
    if (!valid) {
      return res.status(400).json({ success: false, message: 'Password lama tidak sesuai.' });
    }

    const hash = await bcrypt.hash(password_baru, 12);
    await db.query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [hash, req.user.id]);

    res.json({ success: true, message: 'Password berhasil diperbarui.' });
  } catch (err) { next(err); }
}

// ────────────────────────────────────────────────────────────────
// GET /api/auth/users  (admin only)
// ────────────────────────────────────────────────────────────────
async function getUsers(req, res, next) {
  try {
    const { rows } = await db.query(
      `SELECT id, nama, email, role, is_active, last_login, created_at
       FROM   users ORDER BY created_at DESC`
    );
    res.json({ success: true, total: rows.length, data: rows });
  } catch (err) { next(err); }
}

// ────────────────────────────────────────────────────────────────
// POST /api/auth/users  (admin — tambah user/admin baru)
// Body: { nama, email, password, role }
// ────────────────────────────────────────────────────────────────
async function createUser(req, res, next) {
  try {
    const { nama, email, password, role = 'user' } = req.body;

    const hash = await bcrypt.hash(password, 12);
    const { rows: [user] } = await db.query(
      `INSERT INTO users (nama, email, password_hash, role)
       VALUES ($1, $2, $3, $4) RETURNING id, nama, email, role, created_at`,
      [nama.trim(), email.toLowerCase().trim(), hash, role]
    );

    res.status(201).json({ success: true, message: 'Akun berhasil dibuat.', data: user });
  } catch (err) { next(err); }
}

// ────────────────────────────────────────────────────────────────
// PATCH /api/auth/users/:id/status  (admin — aktif/nonaktif)
// Body: { is_active: true|false }
// ────────────────────────────────────────────────────────────────
async function toggleUserStatus(req, res, next) {
  try {
    const id        = parseInt(req.params.id, 10);
    const isActive  = Boolean(req.body.is_active);

    // Admin tidak bisa nonaktifkan diri sendiri
    if (id === req.user.id && !isActive) {
      return res.status(400).json({ success: false, message: 'Tidak bisa menonaktifkan akun sendiri.' });
    }

    const { rowCount } = await db.query(
      `UPDATE users SET is_active = $1 WHERE id = $2`, [isActive, id]
    );

    if (!rowCount) return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });

    res.json({ success: true, message: `Akun berhasil ${isActive ? 'diaktifkan' : 'dinonaktifkan'}.` });
  } catch (err) { next(err); }
}

// ────────────────────────────────────────────────────────────────
// DELETE /api/auth/users/:id  (admin)
// ────────────────────────────────────────────────────────────────
async function deleteUser(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Tidak bisa menghapus akun sendiri.' });
    }
    const { rowCount } = await db.query(`DELETE FROM users WHERE id = $1`, [id]);
    if (!rowCount) return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    res.json({ success: true, message: 'Akun berhasil dihapus.' });
  } catch (err) { next(err); }
}

module.exports = { login, me, logout, gantiPassword, getUsers, createUser, toggleUserStatus, deleteUser };
