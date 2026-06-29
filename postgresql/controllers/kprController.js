// ================================================================
//  controllers/kprController.js
//  Simulasi KPR + daftar bank — logika murni (tanpa query DB)
// ================================================================
'use strict';

const { BANKS } = require('../constants/staticData');

// ── Hitung cicilan bulanan
function calcCicilan(pokok, bungaTahunan, tenorTahun) {
  const r = bungaTahunan / 100 / 12;
  const n = tenorTahun * 12;
  if (!r) return pokok / n;
  return pokok * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

// ── Bangun tabel amortisasi
function buildAmortisasi(pokok, bungaTahunan, tenorTahun) {
  const r      = bungaTahunan / 100 / 12;
  const n      = tenorTahun * 12;
  const cicilan = calcCicilan(pokok, bungaTahunan, tenorTahun);
  let   sisa   = pokok;

  return Array.from({ length: n }, (_, i) => {
    const bunga  = sisa * r;
    const pokok_ = cicilan - bunga;
    sisa        -= pokok_;
    return {
      bulan:   i + 1,
      cicilan: Math.round(cicilan),
      bunga:   Math.round(bunga),
      pokok:   Math.round(pokok_),
      sisa:    Math.round(Math.max(0, sisa)),
    };
  });
}

// ────────────────────────────────────────────────────────────────
// POST /api/kpr/simulasi
// Body: { harga_juta, dp_persen, tenor_tahun, bunga_persen }
// ────────────────────────────────────────────────────────────────
async function simulasi(req, res) {
  const {
    harga_juta,
    dp_persen     = 20,
    tenor_tahun   = 20,
    bunga_persen  = 10.5,
    include_amort = false,   // set true untuk tabel amortisasi
  } = req.body;

  const harga      = parseFloat(harga_juta)    * 1_000_000;
  const dp         = harga * parseFloat(dp_persen) / 100;
  const pokok      = harga - dp;
  const bunga      = parseFloat(bunga_persen);
  const tenor      = parseInt(tenor_tahun, 10);

  const cicilan    = calcCicilan(pokok, bunga, tenor);
  const totalBayar = cicilan * tenor * 12;
  const totalBunga = totalBayar - pokok;

  const payload = {
    input: {
      harga_juta:   parseFloat(harga_juta),
      dp_persen:    parseFloat(dp_persen),
      tenor_tahun:  tenor,
      bunga_persen: bunga,
    },
    hasil: {
      harga:             Math.round(harga),
      dp:                Math.round(dp),
      pokok_pinjaman:    Math.round(pokok),
      cicilan_per_bulan: Math.round(cicilan),
      total_bayar:       Math.round(totalBayar),
      total_bunga:       Math.round(totalBunga),
      rasio_bunga_persen: parseFloat(((totalBunga / totalBayar) * 100).toFixed(2)),
      gaji_min_disarankan: Math.round(cicilan * 3),
    },
    perbandingan_bank: BANKS.map(b => {
      const c = calcCicilan(pokok, b.rate, Math.min(tenor, b.maxTenor));
      const t = c * Math.min(tenor, b.maxTenor) * 12;
      return {
        bank:             b.nama,
        rate:             b.rate,
        max_tenor:        b.maxTenor,
        min_dp_persen:    b.minDP,
        cicilan_per_bulan: Math.round(c),
        total_bunga:       Math.round(t - pokok),
        catatan:           b.catatan,
      };
    }),
  };

  if (include_amort) {
    payload.amortisasi = buildAmortisasi(pokok, bunga, tenor);
  }

  res.json({ success: true, data: payload });
}

// GET /api/kpr/banks
async function getBanks(req, res) {
  res.json({ success: true, total: BANKS.length, data: BANKS });
}

module.exports = { simulasi, getBanks };
