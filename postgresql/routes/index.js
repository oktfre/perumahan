// ================================================================
//  routes/index.js  —  Semua route Havenest API  |  PostgreSQL
//  PUBLIC  → GET properti, KPR, testimonials, kontak (POST)
//  ADMIN   → semua CRUD + manajemen user
// ================================================================
'use strict';

const { Router } = require('express');
const { body, param } = require('express-validator');
const { handleValidation }           = require('../middleware/errorHandler');
const { verifyToken, requireAdmin }  = require('../middleware/auth');

const authCtrl       = require('../controllers/authController');
const perumahanCtrl  = require('../controllers/perumahanController');
const propertiesCtrl = require('../controllers/propertiesController');
const kprCtrl        = require('../controllers/kprController');
const kontakCtrl     = require('../controllers/kontakController');
const inquiriesCtrl  = require('../controllers/inquiriesController');
const bookingCtrl    = require('../controllers/bookingController');

const router     = Router();
const vId        = param('id').isInt({ min: 1 }).withMessage('ID harus angka positif');
const vNama      = body('nama').trim().notEmpty().withMessage('Nama wajib diisi').isLength({ max: 100 });
const vLokasi    = body('lokasi').trim().notEmpty().withMessage('Lokasi wajib diisi').isLength({ max: 200 });
const adminGuard = [verifyToken, requireAdmin];

// HEALTH
router.get('/health', (req, res) => res.json({
  success: true, service: 'Havenest API', db: 'PostgreSQL',
  env: process.env.NODE_ENV, uptime: `${Math.floor(process.uptime())}s`, ts: new Date().toISOString(),
}));

// ── AUTH
router.post('/auth/login', [
  body('email').isEmail().withMessage('Format email tidak valid'),
  body('password').notEmpty().withMessage('Password wajib diisi'),
  handleValidation,
], authCtrl.login);

router.get ('/auth/me',            verifyToken, authCtrl.me);
router.post('/auth/logout',        verifyToken, authCtrl.logout);

router.put('/auth/ganti-password', verifyToken, [
  body('password_lama').notEmpty(),
  body('password_baru').isLength({ min: 8 }).matches(/[A-Z]/).matches(/[0-9]/),
  handleValidation,
], authCtrl.gantiPassword);

router.get   ('/auth/users',            ...adminGuard, authCtrl.getUsers);
router.post  ('/auth/users',            ...adminGuard, [vNama, body('email').isEmail(), body('password').isLength({ min: 8 }), handleValidation], authCtrl.createUser);
router.patch ('/auth/users/:id/status', ...adminGuard, [vId, body('is_active').isBoolean(), handleValidation], authCtrl.toggleUserStatus);
router.delete('/auth/users/:id',        ...adminGuard, vId, handleValidation, authCtrl.deleteUser);

// ── PERUMAHAN — GET publik, mutasi admin
router.get('/perumahan',     perumahanCtrl.getAll);
router.get('/perumahan/:id', vId, handleValidation, perumahanCtrl.getById);
router.post  ('/perumahan',     ...adminGuard, vNama, vLokasi, handleValidation, perumahanCtrl.create);
router.put   ('/perumahan/:id', ...adminGuard, vId, vNama, vLokasi, handleValidation, perumahanCtrl.update);
router.delete('/perumahan/:id', ...adminGuard, vId, handleValidation, perumahanCtrl.remove);

// ── PROPERTIES — GET publik, mutasi admin
router.get('/properties',          propertiesCtrl.getAll);
router.get('/properties/tersedia', propertiesCtrl.getTersedia);
router.get('/properties/featured',  propertiesCtrl.getFeatured);
router.get('/properties/:id',      vId, handleValidation, propertiesCtrl.getById);

const vProperty = [
  body('luas_tanah_lebar_m').isFloat({ min: 1 }),
  body('luas_tanah_panjang_m').isFloat({ min: 1 }),
  body('lebar_jalan_m').isFloat({ min: 1 }),
  body('jumlah_kamar_tidur').isInt({ min: 1 }),
  body('jumlah_kamar_mandi').isInt({ min: 1 }),
  body('daya_listrik_watt').isInt({ min: 100 }),
  body('harga_jual_juta').isFloat({ min: 1 }),
  body('dp_awal_juta').isFloat({ min: 0 }),
];
router.post  ('/properties',          ...adminGuard, [body('perumahan_id').isInt({ min:1 }), body('nomor_tipe').isInt({ min:1 }), ...vProperty, handleValidation], propertiesCtrl.create);
router.put   ('/properties/:id',      ...adminGuard, [vId, ...vProperty, body('unit_tersedia').isInt({ min:0 }), handleValidation], propertiesCtrl.update);
router.patch ('/properties/:id/stok', ...adminGuard, vId, handleValidation, propertiesCtrl.updateStok);
router.delete('/properties/:id',      ...adminGuard, vId, handleValidation, propertiesCtrl.remove);

// ── REKAP & KPR — publik
router.get ('/rekap',        propertiesCtrl.getRekap);
router.get ('/kpr/banks',    kprCtrl.getBanks);
router.post('/kpr/simulasi', [body('harga_juta').isFloat({ min: 1 }), handleValidation], kprCtrl.simulasi);

// ── KONTAK — POST publik, GET admin
router.post('/kontak', [
  body('nama').trim().notEmpty(),
  body('phone').trim().notEmpty().matches(/^[0-9+\-\s]{8,20}$/),
  body('email').optional({ checkFalsy: true }).isEmail(),
  body('interest').trim().notEmpty(),
  handleValidation,
], kontakCtrl.submitKontak);
router.get('/kontak',       ...adminGuard, kontakCtrl.getAll);
router.get('/testimonials',              kontakCtrl.getTestimonials);

// ── INQUIRIES (Konsultasi Gratis) — POST publik, CRUD admin
router.post('/inquiries', [
  body('nama_lengkap').trim().notEmpty().withMessage('Nama lengkap wajib diisi').isLength({ max: 150 }),
  body('nomor_hp').trim().notEmpty().withMessage('Nomor HP wajib diisi').isLength({ max: 20 }),
  body('email').isEmail().withMessage('Email tidak valid'),
  body('keterangan').trim().notEmpty().withMessage('Keterangan wajib diisi').isLength({ max: 100 }),
  body('pesan').trim().notEmpty().withMessage('Pesan wajib diisi'),
  handleValidation,
], inquiriesCtrl.create);

router.get('/inquiries',                         ...adminGuard, inquiriesCtrl.getAll);
router.get('/inquiries/unread-count',            ...adminGuard, inquiriesCtrl.getUnreadCount);
router.get('/inquiries/:id',                     ...adminGuard, vId, handleValidation, inquiriesCtrl.getById);
router.put('/inquiries/:id',                     ...adminGuard, vId, handleValidation, inquiriesCtrl.update);
router.patch('/inquiries/:id/mark-read',         ...adminGuard, vId, handleValidation, inquiriesCtrl.markAsRead);
router.delete('/inquiries/:id',                  ...adminGuard, vId, handleValidation, inquiriesCtrl.deleteInquiry);


// ── BOOKING (Pra-booking unit) — POST publik, CRUD/konfirmasi admin
router.post('/booking', [
  body('property_id').isInt({ min: 1 }).withMessage('property_id wajib diisi'),
  body('nama_pembeli').trim().notEmpty().withMessage('Nama pembeli wajib diisi').isLength({ max: 100 }),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Format email tidak valid'),
  body('no_hp').optional({ checkFalsy: true }).isLength({ max: 20 }),
  body('metode_pembayaran').optional({ checkFalsy: true }).isLength({ max: 50 }),
  body('bank').optional({ checkFalsy: true }).isLength({ max: 50 }),
  handleValidation,
], bookingCtrl.createBooking);

router.get ('/admin/booking',             ...adminGuard, bookingCtrl.getBooking);
router.get ('/admin/booking/:id',         ...adminGuard, vId, handleValidation, bookingCtrl.getBookingById);
router.put ('/admin/booking/:id/confirm', ...adminGuard, vId, handleValidation, bookingCtrl.confirmBooking);
router.put ('/admin/booking/:id/reject',  ...adminGuard, vId, handleValidation, bookingCtrl.rejectBooking);


// ── CMS (ditambahkan otomatis)
const cmsCtrl = require('../controllers/cmsController');
router.get ('/cms',           cmsCtrl.getAll);
router.get ('/cms/:section',  cmsCtrl.getSection);
router.put ('/cms/:section',  ...adminGuard, cmsCtrl.updateSection);
router.post('/cms/reset',     ...adminGuard, cmsCtrl.resetDefaults);


module.exports = router;
// ── IMAGE routes (admin)
router.post  ('/properties/:id/images',            ...adminGuard, propertiesCtrl.addImage);
router.patch ('/properties/images/:imgId',         ...adminGuard, propertiesCtrl.updateImage);
router.delete('/properties/images/:imgId',         ...adminGuard, propertiesCtrl.deleteImage);
router.put   ('/properties/images/:imgId/primary', ...adminGuard, propertiesCtrl.setPrimary);
