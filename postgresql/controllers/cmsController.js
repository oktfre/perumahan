// ================================================================
//  controllers/cmsController.js  —  PostgreSQL
//  GET /api/cms          → semua section (publik)
//  GET /api/cms/:section → satu section  (publik)
//  PUT /api/cms/:section → update        (admin only)
//  POST /api/cms/reset   → reset default (admin only)
// ================================================================
'use strict';

const db   = require('../db');
const path = require('path');
const fs   = require('fs');

// ── GET semua konten
async function getAll(req, res, next) {
  try {
    const { rows } = await db.query(
      `SELECT section, content, updated_at FROM site_content ORDER BY section`
    );
    // Susun sebagai objek { hero: {...}, stats: [...], ... }
    const result = {};
    for (const r of rows) result[r.section] = r.content;
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

// ── GET satu section
async function getSection(req, res, next) {
  try {
    const { section } = req.params;
    const { rows: [row] } = await db.query(
      `SELECT section, content, updated_at FROM site_content WHERE section = $1`,
      [section]
    );
    if (!row) return res.status(404).json({ success: false, message: `Section "${section}" tidak ditemukan.` });
    res.json({ success: true, data: row.content, updated_at: row.updated_at });
  } catch (err) { next(err); }
}

// ── PUT update satu section (admin)
async function updateSection(req, res, next) {
  try {
    const { section } = req.params;
    const content     = req.body;

    if (!content || typeof content !== 'object') {
      return res.status(422).json({ success: false, message: 'Body harus berupa JSON valid.' });
    }

    const { rows: [row] } = await db.query(
      `INSERT INTO site_content (section, content, updated_by, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (section) DO UPDATE
         SET content    = EXCLUDED.content,
             updated_by = EXCLUDED.updated_by,
             updated_at = NOW()
       RETURNING section, updated_at`,
      [section, JSON.stringify(content), req.user.id]
    );

    res.json({ success: true, message: `Section "${section}" berhasil diperbarui.`, data: row });
  } catch (err) { next(err); }
}

// ── POST reset ke default (admin) — jalankan ulang cms.sql
async function resetDefaults(req, res, next) {
  try {
    const sqlPath = path.join(__dirname, '../db/cms.sql');
    const sql     = fs.readFileSync(sqlPath, 'utf8');

    // Hapus kondisi ON CONFLICT DO NOTHING agar bisa overwrite
    const resetSql = sql
      .replace(/ON CONFLICT \(section\) DO NOTHING/gi,
               'ON CONFLICT (section) DO UPDATE SET content = EXCLUDED.content, updated_at = NOW()');

    const client = await db.getClient();
    try {
      await client.query(resetSql);
    } finally { client.release(); }

    res.json({ success: true, message: 'Semua konten berhasil direset ke default.' });
  } catch (err) { next(err); }
}

module.exports = { getAll, getSection, updateSection, resetDefaults };
