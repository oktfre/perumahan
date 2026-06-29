// ================================================================
//  constants/staticData.js
//  Data statis yang tidak disimpan di database
// ================================================================

const BANKS = [
  {
    id:       'btn',
    nama:     'BTN',
    logo:     '🏗',
    rate:     10.25,
    maxTenor: 30,
    minDP:    10,
    color:    '#1A5276',
    catatan:  'Spesialis KPR terpercaya',
  },
  {
    id:       'bca',
    nama:     'BCA',
    logo:     '🏦',
    rate:     10.5,
    maxTenor: 30,
    minDP:    10,
    color:    '#005BAA',
    catatan:  'Proses cepat 5 hari kerja',
  },
  {
    id:       'bri',
    nama:     'BRI',
    logo:     '🏛',
    rate:     10.75,
    maxTenor: 30,
    minDP:    10,
    color:    '#00529B',
    catatan:  'Khusus ASN/PNS bunga 9.5%',
  },
  {
    id:       'bni',
    nama:     'BNI',
    logo:     '🏩',
    rate:     10.9,
    maxTenor: 25,
    minDP:    15,
    color:    '#FF6600',
    catatan:  'Cicilan tetap 3 tahun pertama',
  },
  {
    id:       'mandiri',
    nama:     'Mandiri',
    logo:     '🏢',
    rate:     11.0,
    maxTenor: 30,
    minDP:    15,
    color:    '#003D7C',
    catatan:  'Gratis biaya provisi bulan ini',
  },
  {
    id:       'cimb',
    nama:     'CIMB Niaga',
    logo:     '🔴',
    rate:     11.25,
    maxTenor: 25,
    minDP:    20,
    color:    '#D40000',
    catatan:  'Diskon rate nasabah prioritas',
  },
];

const TESTIMONIALS = [
  {
    inisial: 'A',
    nama:    'Andika Pratama',
    lokasi:  'Pembeli, The Olive Residence',
    teks:    'Proses pembelian sangat lancar. Tim Havenest sangat profesional dan membantu kami mendapatkan properti sesuai anggaran dengan cepat sekali.',
  },
  {
    inisial: 'R',
    nama:    'Rina Kusumawati',
    lokasi:  'Pembeli, Serene Hills Cluster A',
    teks:    'Agen kami benar-benar memahami kebutuhan keluarga dan tidak pernah terburu-buru. Pengalaman membeli rumah yang menyenangkan.',
  },
  {
    inisial: 'B',
    nama:    'Budi Hartono',
    lokasi:  'Investor, Ivory Grand House',
    teks:    'Investasi terbaik yang pernah saya lakukan. Havenest membantu saya menemukan properti dengan potensi nilai sangat baik di lokasi premium.',
  },
];

module.exports = { BANKS, TESTIMONIALS };
