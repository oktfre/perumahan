'use strict';
const db = require('../db');

async function create(req, res, next) {
  try {
    const { nama_lengkap, nomor_hp, email, keterangan, pesan } = req.body;

    if (!nama_lengkap || !nomor_hp || !email || !keterangan || !pesan) {
      return res.status(422).json({ success: false, message: 'Semua field wajib diisi.' });
    }

    const { rows: [inquiry] } = await db.query(
      `INSERT INTO inquiries (nama_lengkap, nomor_hp, email, keterangan, pesan)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [nama_lengkap, nomor_hp, email, keterangan, pesan]
    );

    res.status(201).json({ success: true, message: 'Pesan berhasil dikirim. Kami akan menghubungi Anda segera.', data: inquiry });
  } catch (err) {
    next(err);
  }
}

async function getAll(req, res, next) {
  try {
    const { status, page = 1, limit = 20, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM inquiries WHERE 1=1';
    const params = [];

    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (nama_lengkap ILIKE $${params.length} OR email ILIKE $${params.length} OR nomor_hp ILIKE $${params.length})`;
      params.push(`%${search}%`);
      params.push(`%${search}%`);
    }

    const countQuery = `SELECT COUNT(*) as total FROM (${query}) sub`;
    const { rows: [{ total }] } = await db.query(countQuery, params);

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const { rows } = await db.query(query, params);

    res.json({
      success: true,
      pagination: { page: +page, limit: +limit, total: +total, total_pages: Math.ceil(+total / limit) },
      data: rows
    });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const { rows: [inquiry] } = await db.query(
      'SELECT * FROM inquiries WHERE id = $1',
      [+req.params.id]
    );

    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry tidak ditemukan.' });
    }

    // Mark as read
    if (inquiry.status === 'unread') {
      await db.query(
        'UPDATE inquiries SET status = $1, read_at = NOW() WHERE id = $2',
        ['read', +req.params.id]
      );
      inquiry.status = 'read';
      inquiry.read_at = new Date().toISOString();
    }

    res.json({ success: true, data: inquiry });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const id = +req.params.id;
    const { admin_notes, status } = req.body;

    let updateFields = [];
    let values = [];
    let paramIndex = 1;

    if (admin_notes !== undefined) {
      updateFields.push(`admin_notes = $${paramIndex++}`);
      values.push(admin_notes);
    }

    if (status !== undefined && ['unread', 'read', 'replied'].includes(status)) {
      updateFields.push(`status = $${paramIndex++}::inquiry_status`);
      values.push(status);

      if (status === 'replied') {
        updateFields.push(`replied_at = NOW()`);
      }
    }

    if (!updateFields.length) {
      return res.status(422).json({ success: false, message: 'Tidak ada field yang diupdate.' });
    }

    values.push(id);
    const { rowCount } = await db.query(
      `UPDATE inquiries SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`,
      values
    );

    if (!rowCount) {
      return res.status(404).json({ success: false, message: 'Inquiry tidak ditemukan.' });
    }

    res.json({ success: true, message: 'Inquiry berhasil diperbarui.' });
  } catch (err) {
    next(err);
  }
}

async function markAsRead(req, res, next) {
  try {
    const { rowCount } = await db.query(
      `UPDATE inquiries SET status = 'read', read_at = NOW() WHERE id = $1 AND status = 'unread'`,
      [+req.params.id]
    );

    if (!rowCount) {
      return res.status(404).json({ success: false, message: 'Inquiry tidak ditemukan atau sudah dibaca.' });
    }

    res.json({ success: true, message: 'Inquiry ditandai sudah dibaca.' });
  } catch (err) {
    next(err);
  }
}

async function getUnreadCount(req, res, next) {
  try {
    const { rows: [{ count }] } = await db.query(
      `SELECT COUNT(*) as count FROM inquiries WHERE status = 'unread'`
    );

    res.json({ success: true, unread_count: +count });
  } catch (err) {
    next(err);
  }
}

async function deleteInquiry(req, res, next) {
  try {
    const { rowCount } = await db.query(
      'DELETE FROM inquiries WHERE id = $1',
      [+req.params.id]
    );

    if (!rowCount) {
      return res.status(404).json({ success: false, message: 'Inquiry tidak ditemukan.' });
    }

    res.json({ success: true, message: 'Inquiry berhasil dihapus.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, getAll, getById, update, markAsRead, getUnreadCount, deleteInquiry };
