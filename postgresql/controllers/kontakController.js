// ================================================================
//  controllers/kontakController.js
//  Form konsultasi — simpan ke memory log (extensible ke DB/email)
// ================================================================
'use strict';

const { TESTIMONIALS } = require('../constants/staticData');

// In-memory store sederhana (ganti dengan DB insert untuk production)
const inquiries = [];

// POST /api/kontak
async function submitKontak(req, res) {
  const { nama, phone, email = '', interest, pesan = '' } = req.body;

  const entry = {
    id:         inquiries.length + 1,
    nama:       nama.trim(),
    phone:      phone.trim(),
    email:      email.trim(),
    interest:   interest.trim(),
    pesan:      pesan.trim(),
    created_at: new Date().toISOString(),
    status:     'baru',
  };

  inquiries.push(entry);

  // Di sini bisa ditambah: kirim email, WhatsApp API, simpan ke DB, dsb.
  console.log(`[Kontak] Inquiry baru dari ${entry.nama} (${entry.phone})`);

  res.status(201).json({
    success: true,
    message: 'Terima kasih! Tim kami akan menghubungi Anda dalam 1×24 jam.',
    data:    { id: entry.id, nama: entry.nama },
  });
}

// GET /api/kontak  (admin)
async function getAll(req, res) {
  const { status } = req.query;
  const data = status
    ? inquiries.filter(i => i.status === status)
    : inquiries;

  res.json({ success: true, total: data.length, data });
}

// GET /api/testimonials
async function getTestimonials(req, res) {
  res.json({ success: true, total: TESTIMONIALS.length, data: TESTIMONIALS });
}

module.exports = { submitKontak, getAll, getTestimonials };
