// ================================================================
//  db/seed-admin.js  —  Buat akun admin default (PostgreSQL)
//  Cara pakai: node db/seed-admin.js
//  Kredensial default:
//    email   : admin@havenest.id
//    password: Admin@123  (ganti segera setelah deploy!)
// ================================================================
'use strict';

require('dotenv').config();
const bcrypt   = require('bcryptjs');
const { pool } = require('./index');

const DEFAULT_ADMIN = {
  nama:     'Super Admin',
  email:    process.env.ADMIN_EMAIL    || 'admin@havenest.id',
  password: process.env.ADMIN_PASSWORD || 'Admin@123',
  role:     'admin',
};

async function seed() {
  const client = await pool.connect();
  try {
    // Pastikan tabel users sudah ada (dibuat lewat database_lengkap.sql)
    const tabelCek = await client.query(
      `SELECT 1 FROM information_schema.tables WHERE table_name = 'users'`
    );
    if (tabelCek.rows.length === 0) {
      console.error('[Seed] ❌ Tabel "users" belum ada. Jalankan db/database_lengkap.sql dulu.');
      process.exit(1);
    }

    // Cek apakah admin sudah ada
    const { rows } = await client.query(
      'SELECT id FROM users WHERE email = $1', [DEFAULT_ADMIN.email]
    );

    if (rows.length) {
      console.log(`[Seed] Admin "${DEFAULT_ADMIN.email}" sudah ada — dilewati.`);
      return;
    }

    const hash = await bcrypt.hash(DEFAULT_ADMIN.password, 12);
    await client.query(
      `INSERT INTO users (nama, email, password_hash, role)
       VALUES ($1, $2, $3, $4)`,
      [DEFAULT_ADMIN.nama, DEFAULT_ADMIN.email, hash, DEFAULT_ADMIN.role]
    );

    console.log('╔══════════════════════════════════════╗');
    console.log('║  ✅  Admin berhasil dibuat            ║');
    console.log(`║  📧  Email    : ${DEFAULT_ADMIN.email.padEnd(22)}║`);
    console.log(`║  🔑  Password : ${DEFAULT_ADMIN.password.padEnd(22)}║`);
    console.log('║  ⚠️   Ganti password setelah login!   ║');
    console.log('╚══════════════════════════════════════╝');
  } catch (err) {
    console.error('[Seed] ❌ Gagal:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
