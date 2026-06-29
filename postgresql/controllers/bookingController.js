// ================================================================
//  controllers/bookingController.js
//  Booking / Pra-booking unit properti
// ================================================================
'use strict';

const { pool } = require('../db');

/**
 * Query gabungan booking + info properti (dipakai di getBooking & getBookingById)
 */
const SELECT_BOOKING_JOIN = `
  SELECT
    b.*,
    t.nama_properti,
    t.nomor_tipe,
    t.harga_jual_juta,
    t.unit_tersedia,
    t.status        AS status_unit,
    p.nama           AS nama_perumahan,
    p.lokasi          AS lokasi_perumahan
  FROM booking b
  JOIN tipe_unit t ON b.property_id = t.id
  JOIN perumahan p ON t.perumahan_id = p.id
`;

// ----------------------------------------------------------------
//  POST /booking  (USER — publik)
//  Buat booking baru untuk sebuah tipe unit.
// ----------------------------------------------------------------
exports.createBooking = async (req, res) => {
  const {
    property_id,
    nama_pembeli,
    email,
    no_hp,
    alamat,
    metode_pembayaran,
    bank,
    bukti_transfer,
    nominal_dp,
  } = req.body;

  if (!property_id || !nama_pembeli) {
    return res.status(400).json({
      success: false,
      error: 'property_id dan nama_pembeli wajib diisi',
    });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Lock baris tipe_unit supaya tidak ada race condition saat
    // dua pembeli mem-booking unit terakhir di waktu yang bersamaan.
    const unitRes = await client.query(
      `SELECT id, status, unit_tersedia, nama_properti
       FROM tipe_unit
       WHERE id = $1
       FOR UPDATE`,
      [property_id]
    );

    if (unitRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Tipe unit tidak ditemukan' });
    }

    const unit = unitRes.rows[0];

    if (unit.status === 'terjual') {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, error: 'Unit ini sudah terjual' });
    }

    if (unit.status === 'pra_booking') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: 'Unit terakhir tipe ini sedang menunggu konfirmasi pembeli lain',
      });
    }

    if (unit.unit_tersedia <= 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, error: 'Stok unit ini sudah habis' });
    }

    // Simpan booking
    const result = await client.query(
      `
      INSERT INTO booking
      (
        property_id, nama_pembeli, email, no_hp, alamat,
        metode_pembayaran, bank, nominal_dp, bukti_transfer
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
      `,
      [
        property_id,
        nama_pembeli,
        email || null,
        no_hp || null,
        alamat || null,
        metode_pembayaran || null,
        bank || null,
        nominal_dp || 1000000,
        bukti_transfer || null,
      ]
    );

    // Jika ini SATU-SATUNYA unit yang tersisa, tarik dari listing publik
    // (status jadi pra_booking) agar tidak di-booking ganda oleh orang lain.
    // Jika masih ada unit lain yang tersedia, status tipe TETAP 'tersedia'
    // supaya pembeli lain masih bisa booking unit yang lain dari tipe ini.
    if (unit.unit_tersedia <= 1) {
      await client.query(
        `UPDATE tipe_unit SET status = 'pra_booking' WHERE id = $1`,
        [property_id]
      );
    }

    await client.query('COMMIT');

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
};

// ----------------------------------------------------------------
//  GET /admin/booking  (ADMIN)
//  Daftar semua booking, terbaru di atas.
// ----------------------------------------------------------------
exports.getBooking = async (req, res) => {
  try {
    const { status } = req.query;
    let sql = SELECT_BOOKING_JOIN;
    const params = [];

    if (status) {
      params.push(status);
      sql += ` WHERE b.status = $${params.length}`;
    }
    sql += ' ORDER BY b.id DESC';

    const data = await pool.query(sql, params);
    res.json({ success: true, data: data.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ----------------------------------------------------------------
//  GET /admin/booking/:id  (ADMIN)
//  Detail satu booking.
// ----------------------------------------------------------------
exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await pool.query(`${SELECT_BOOKING_JOIN} WHERE b.id = $1`, [id]);

    if (data.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Booking tidak ditemukan' });
    }

    res.json({ success: true, data: data.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ----------------------------------------------------------------
//  PUT /admin/booking/:id/confirm  (ADMIN)
//  Konfirmasi DP valid -> unit resmi terjual, stok dikurangi 1.
// ----------------------------------------------------------------
exports.confirmBooking = async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const bookingRes = await client.query(
      'SELECT * FROM booking WHERE id = $1 FOR UPDATE',
      [id]
    );

    if (bookingRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Booking tidak ditemukan' });
    }

    const booking = bookingRes.rows[0];

    if (booking.status !== 'pra_booking') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: `Booking ini sudah berstatus '${booking.status}', tidak bisa dikonfirmasi lagi`,
      });
    }

    const unitRes = await client.query(
      'SELECT id, unit_tersedia FROM tipe_unit WHERE id = $1 FOR UPDATE',
      [booking.property_id]
    );

    if (unitRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Tipe unit terkait tidak ditemukan' });
    }

    const sisaUnit = Math.max(unitRes.rows[0].unit_tersedia - 1, 0);
    const statusBaru = sisaUnit === 0 ? 'terjual' : 'tersedia';

    await client.query(
      `UPDATE tipe_unit SET unit_tersedia = $1, status = $2 WHERE id = $3`,
      [sisaUnit, statusBaru, booking.property_id]
    );

    const updated = await client.query(
      `UPDATE booking SET status = 'terjual' WHERE id = $1 RETURNING *`,
      [id]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Rumah berhasil dijual',
      data: updated.rows[0],
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
};

// ----------------------------------------------------------------
//  PUT /admin/booking/:id/reject  (ADMIN)
//  Tolak booking (misal bukti transfer tidak valid) -> unit
//  dikembalikan ke status 'tersedia' agar bisa di-booking lagi.
// ----------------------------------------------------------------
exports.rejectBooking = async (req, res) => {
  const { id } = req.params;
  const { alasan } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const bookingRes = await client.query(
      'SELECT * FROM booking WHERE id = $1 FOR UPDATE',
      [id]
    );

    if (bookingRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Booking tidak ditemukan' });
    }

    const booking = bookingRes.rows[0];

    if (booking.status !== 'pra_booking') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: `Booking ini sudah berstatus '${booking.status}', tidak bisa ditolak`,
      });
    }

    // Kembalikan unit jadi 'tersedia' lagi jika sebelumnya ditarik
    // dari listing publik (kasus unit terakhir).
    await client.query(
      `UPDATE tipe_unit SET status = 'tersedia' WHERE id = $1 AND status = 'pra_booking'`,
      [booking.property_id]
    );

    const updated = await client.query(
      `UPDATE booking SET status = 'ditolak', catatan_admin = $2 WHERE id = $1 RETURNING *`,
      [id, alasan || null]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Booking ditolak, unit tersedia kembali',
      data: updated.rows[0],
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
};
