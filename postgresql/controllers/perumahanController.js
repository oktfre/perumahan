// ================================================================
//  controllers/perumahanController.js  —  PostgreSQL
// ================================================================
'use strict';

const db = require('../db');

// GET /api/perumahan
async function getAll(req, res, next) {
  try {
    const { rows } = await db.query(`
      SELECT
        p.id, p.nama, p.lokasi,
        COUNT(t.id)                         AS total_tipe,
        COALESCE(SUM(t.unit_tersedia), 0)   AS total_unit_tersedia,
        MIN(t.harga_jual_juta)              AS harga_terendah_juta,
        MAX(t.harga_jual_juta)              AS harga_tertinggi_juta,
        p.created_at, p.updated_at
      FROM  perumahan p
      LEFT  JOIN tipe_unit t ON t.perumahan_id = p.id
      GROUP BY p.id
      ORDER BY p.nama
    `);

    res.json({ success: true, total: rows.length, data: rows });
  } catch (err) { next(err); }
}

// GET /api/perumahan/:id
async function getById(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);

    const { rows: [perumahan] } = await db.query(
      `SELECT id, nama, lokasi, created_at, updated_at FROM perumahan WHERE id = $1`,
      [id]
    );

    if (!perumahan) {
      return res.status(404).json({ success: false, message: 'Perumahan tidak ditemukan.' });
    }

    const { rows: units } = await db.query(`
      SELECT
        t.id, t.nomor_tipe,
        t.luas_tanah_lebar_m, t.luas_tanah_panjang_m, t.luas_tanah_m2,
        t.lebar_jalan_m, t.jumlah_kamar_tidur, t.jumlah_kamar_mandi,
        t.sumber_air, t.daya_listrik_watt,
        t.harga_jual_juta, t.dp_awal_juta,
        t.unit_tersedia, t.status,
        STRING_AGG(a.tenor_tahun::TEXT, ', ' ORDER BY a.tenor_tahun) AS opsi_tenor
      FROM  tipe_unit     t
      JOIN  opsi_angsuran a ON a.tipe_unit_id = t.id
      WHERE t.perumahan_id = $1
      GROUP BY t.id
      ORDER BY t.nomor_tipe
    `, [id]);

    res.json({ success: true, data: { ...perumahan, unit: units } });
  } catch (err) { next(err); }
}

// POST /api/perumahan
async function create(req, res, next) {
  try {
    const { nama, lokasi } = req.body;

    const { rows: [row] } = await db.query(
      `INSERT INTO perumahan (nama, lokasi) VALUES ($1, $2) RETURNING *`,
      [nama.trim(), lokasi.trim()]
    );

    res.status(201).json({ success: true, message: 'Perumahan berhasil ditambahkan.', data: row });
  } catch (err) { next(err); }
}

// PUT /api/perumahan/:id
async function update(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const { nama, lokasi } = req.body;

    const { rows: [row] } = await db.query(
      `UPDATE perumahan SET nama = $1, lokasi = $2 WHERE id = $3 RETURNING *`,
      [nama.trim(), lokasi.trim(), id]
    );

    if (!row) return res.status(404).json({ success: false, message: 'Perumahan tidak ditemukan.' });

    res.json({ success: true, message: 'Perumahan berhasil diperbarui.', data: row });
  } catch (err) { next(err); }
}

// DELETE /api/perumahan/:id
async function remove(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const { rowCount } = await db.query(`DELETE FROM perumahan WHERE id = $1`, [id]);

    if (!rowCount) return res.status(404).json({ success: false, message: 'Perumahan tidak ditemukan.' });

    res.json({ success: true, message: 'Perumahan berhasil dihapus.' });
  } catch (err) { next(err); }
}

module.exports = { getAll, getById, create, update, remove };
