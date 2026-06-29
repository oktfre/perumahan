// ================================================================
//  context/CmsContext.jsx
//  Menyediakan konten website yang bisa diedit admin.
//  Urutan prioritas: API → localStorage → DEFAULT_CONTENT
// ================================================================
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

// ── Konten default (fallback jika API belum tersedia)
export const DEFAULT_CONTENT = {
  hero: {
    tag:         'Properti Premium Indonesia',
    title1:      'Temukan Rumah',
    title2:      'Impian',
    title3:      'Anda Bersama Kami',
    description: 'Koleksi hunian eksklusif dengan desain arsitektur modern, lokasi strategis, dan lingkungan premium yang dirancang untuk kehidupan berkualitas tinggi.',
    btn1:        'Jelajahi Properti',
    btn2:        '▶ Video Tour',
    image:       'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=85',
    price_label: 'Harga cash',
    price_value: 'Rp 190 Jt',
    dp_value:    'Rp 1 Jt',
    dp_label:    'DP',
  },
  stats: [
    { value: '1.200+', label: 'Properti' },
    { value: '850+',   label: 'Keluarga Bahagia' },
    { value: '12+',    label: 'Tahun Pengalaman' },
  ],
  why: {
    tag:   'Keunggulan Kami',
    title: 'Mengapa Memilih Havenest?',
    items: [
      { no: '01', title: 'Konsultasi Personal',    desc: 'Agen berpengalaman kami mendampingi Anda dari konsultasi awal hingga serah terima kunci tanpa biaya tambahan.' },
      { no: '02', title: 'Properti Terverifikasi', desc: 'Setiap listing melalui verifikasi ketat — legalitas, kondisi bangunan, dan keamanan investasi terjamin.' },
      { no: '03', title: 'Kemudahan KPR',          desc: 'Bermitra dengan 15+ bank terkemuka, kami bantu proses KPR dengan bunga kompetitif dan persetujuan cepat.' },
    ],
  },
  cta: {
    tag:         'Mulai Sekarang',
    title:       'Siap Menemukan Rumah Impian Anda?',
    description: 'Konsultasikan kebutuhan properti Anda bersama agen kami hari ini. Gratis, tanpa komitmen apapun.',
    btn1:        'Konsultasi Sekarang',
    btn2:        'Lihat Properti',
  },
  marquee: ['Rumah Tapak','Villa Mewah','Townhouse','Investasi Properti','KPR Mudah','Lokasi Premium','Bandung','Lembang','Dago'],
  testimonials: [
    { inisial: 'A', nama: 'Andika Pratama',   lokasi: 'Pembeli, The Olive Residence',    teks: 'Proses pembelian sangat lancar. Tim Havenest sangat profesional dan membantu kami mendapatkan properti sesuai anggaran dengan cepat sekali.' },
    { inisial: 'R', nama: 'Rina Kusumawati',  lokasi: 'Pembeli, Serene Hills Cluster A', teks: 'Agen kami benar-benar memahami kebutuhan keluarga dan tidak pernah terburu-buru. Pengalaman membeli rumah yang menyenangkan.' },
    { inisial: 'B', nama: 'Budi Hartono',     lokasi: 'Investor, Ivory Grand House',     teks: 'Investasi terbaik yang pernah saya lakukan. Havenest membantu saya menemukan properti dengan potensi nilai sangat baik di lokasi premium.' },
  ],

  // ── Navbar ──────────────────────────────────────────────────
  navbar: {
    logo_main:    'HAVEN',
    logo_accent:  'EST',
    link_home:    'Beranda',
    link_listing: 'Properti',
    link_booking: 'Booking',
    link_about:   'Tentang',
    link_contact: 'Kontak',
    cta_label:    'Konsultasi Gratis',
  },

  // ── Footer ──────────────────────────────────────────────────
  footer: {
    logo_main:   'HAVEN',
    logo_accent: 'EST',
    description: 'Platform Property premium Pontianak yang mengutamakan keamanan, kualitas, dan kepuasan pelanggan sejak 2017.',
    columns: [
      { title: 'Properti',   links: ['Rumah Tapak', 'Subsidi', 'Type 36+', 'Investasi'] },
      { title: 'Perusahaan', links: ['Tentang Kami', 'Marketing', 'Karir', 'Blog'] },
      { title: 'Dukungan',   links: ['Panduan KPR', 'FAQ', 'Kebijakan Privasi', 'Syarat & Ketentuan'] },
    ],
    copyright: '© 2026 PT. Jasmine Prima Property. Semua hak dilindungi.',
    tagline:   'Dibuat dengan ❤ untuk keluarga Bahagia',
  },

  // ── Halaman Listing (Daftar Properti) ────────────────────────
  listing: {
    tag:                'Semua Properti',
    title:              'Daftar Properti',
    search_placeholder: 'Cari nama atau lokasi…',
    empty_title:        'Properti tidak ditemukan',
    empty_subtitle:     'Coba ubah kata kunci atau filter',
  },

  // ── Halaman Detail Properti ───────────────────────────────────
  detail: {
    breadcrumb_home:    'Beranda',
    breadcrumb_listing: 'Properti',
    cta_hubungi:        '📞 Hubungi Agen',
    cta_kpr:            '💰 Simulasi KPR',
    cta_booking:        '🏠 Booking Sekarang',
    cta_whatsapp:       '📞 Hubungi via WhatsApp',
    agent_name:         'Agus Santoso',
    agent_title:        'Senior Property Agent',
    agent_rating:       '⭐ 4.9 (128 ulasan)',
    agent_whatsapp:     '6281234567890',
    kpr_teaser_label:   'Estimasi Cicilan KPR',
    kpr_teaser_note:    'DP 20% · Tenor 20 thn · Bunga 10.5%',
  },

  // ── Halaman Kontak ────────────────────────────────────────────
  contact: {
    tag:              'Hubungi Kami',
    title:            'Konsultasi Gratis',
    subtitle:         'Ceritakan kebutuhan properti Anda dan agen kami akan menghubungi dalam 1x24 jam.',
    alamat:           'Jl. Raya Dago No. 88,\nBandung, Jawa Barat 40135',
    telepon:          '(022) 1234-5678',
    email:            'hello@havenest.id',
    jam_operasional:  'Senin–Sabtu: 08.00–16.00',
    respon_label:     'Respon Cepat',
    respon_value:     '< 1 Jam',
    respon_desc:      'Rata-rata waktu respon agen kami di hari kerja',
    success_title:    'Pesan Terkirim!',
    success_desc:     'Tim kami akan menghubungi Anda dalam 1x24 jam. Terima kasih telah mempercayai Havenest.',
  },
};

const LS_KEY = 'havenest_cms';

const CmsContext = createContext(null);

export function CmsProvider({ children }) {
  const [content,  setContent]  = useState(() => {
    try {
      const stored = localStorage.getItem(LS_KEY);
      return stored ? { ...DEFAULT_CONTENT, ...JSON.parse(stored) } : DEFAULT_CONTENT;
    } catch { return DEFAULT_CONTENT; }
  });
  const [synced, setSynced] = useState(false);

  // Sinkronisasi dari API saat pertama load
  useEffect(() => {
    api.get('/cms')
      .then(res => {
        if (res.data && Object.keys(res.data).length) {
          const merged = { ...DEFAULT_CONTENT, ...res.data };
          setContent(merged);
          localStorage.setItem(LS_KEY, JSON.stringify(merged));
        }
        setSynced(true);
      })
      .catch(() => setSynced(true));   // gagal → pakai localStorage/default
  }, []);

  // Update satu section (admin) + simpan ke API + localStorage
  const updateSection = useCallback(async (section, data) => {
    try {
      await api.put(`/cms/${section}`, data);
    } catch {
      // Jika API gagal, tetap update lokal saja
    }
    setContent(prev => {
      const next = { ...prev, [section]: data };
      localStorage.setItem(LS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // Reset semua ke default
  const resetAll = useCallback(async () => {
    try { await api.post('/cms/reset', {}); } catch { /* abaikan */ }
    setContent(DEFAULT_CONTENT);
    localStorage.setItem(LS_KEY, JSON.stringify(DEFAULT_CONTENT));
  }, []);

  return (
    <CmsContext.Provider value={{ content, updateSection, resetAll, synced }}>
      {children}
    </CmsContext.Provider>
  );
}

export const useCms = () => {
  const ctx = useContext(CmsContext);
  if (!ctx) throw new Error('useCms harus dipakai di dalam CmsProvider');
  return ctx;
};
