-- ================================================================
--  MIGRASI: Tabel site_content (CMS)
--  Jalankan setelah schema.sql dan users.sql  |  PostgreSQL 14+
-- ================================================================

CREATE TABLE IF NOT EXISTS site_content (
    section     VARCHAR(60)  NOT NULL PRIMARY KEY,
    content     JSONB        NOT NULL DEFAULT '{}',
    updated_by  INT          REFERENCES users(id) ON DELETE SET NULL,
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  site_content         IS 'Konten halaman website yang bisa diedit admin';
COMMENT ON COLUMN site_content.section IS 'Kunci section: hero | stats | why | cta | marquee | testimonials';
COMMENT ON COLUMN site_content.content IS 'JSON bebas sesuai kebutuhan section';

CREATE INDEX IF NOT EXISTS idx_sc_section ON site_content(section);

-- ── Seed: konten default semua section
INSERT INTO site_content (section, content) VALUES

('hero', '{
  "tag":         "Properti Premium Indonesia",
  "title1":      "Temukan Rumah",
  "title2":      "Impian",
  "title3":      "Anda Bersama Kami",
  "description": "Koleksi hunian eksklusif dengan desain arsitektur modern, lokasi strategis, dan lingkungan premium yang dirancang untuk kehidupan berkualitas tinggi.",
  "btn1":        "Jelajahi Properti",
  "btn2":        "▶ Video Tour"
}'),

('stats', '[
  {"value": "1.200+", "label": "Properti"},
  {"value": "850+",   "label": "Keluarga Bahagia"},
  {"value": "12+",    "label": "Tahun Pengalaman"}
]'),

('why', '{
  "tag":   "Keunggulan Kami",
  "title": "Mengapa Memilih Havenest?",
  "items": [
    {"no": "01", "title": "Konsultasi Personal",    "desc": "Agen berpengalaman kami mendampingi Anda dari konsultasi awal hingga serah terima kunci tanpa biaya tambahan."},
    {"no": "02", "title": "Properti Terverifikasi", "desc": "Setiap listing melalui verifikasi ketat — legalitas, kondisi bangunan, dan keamanan investasi terjamin."},
    {"no": "03", "title": "Kemudahan KPR",          "desc": "Bermitra dengan 15+ bank terkemuka, kami bantu proses KPR dengan bunga kompetitif dan persetujuan cepat."}
  ]
}'),

('cta', '{
  "tag":         "Mulai Sekarang",
  "title":       "Siap Menemukan Rumah Impian Anda?",
  "description": "Konsultasikan kebutuhan properti Anda bersama agen kami hari ini. Gratis, tanpa komitmen apapun.",
  "btn1":        "Konsultasi Sekarang",
  "btn2":        "Lihat Properti"
}'),

('marquee', '["Rumah Tapak","Villa Mewah","Townhouse","Investasi Properti","KPR Mudah","Lokasi Premium","Bandung","Lembang","Dago"]'),

('testimonials', '[
  {"inisial": "A", "nama": "Andika Pratama",   "lokasi": "Pembeli, The Olive Residence",    "teks": "Proses pembelian sangat lancar. Tim Havenest sangat profesional dan membantu kami mendapatkan properti sesuai anggaran dengan cepat sekali."},
  {"inisial": "R", "nama": "Rina Kusumawati",  "lokasi": "Pembeli, Serene Hills Cluster A", "teks": "Agen kami benar-benar memahami kebutuhan keluarga dan tidak pernah terburu-buru. Pengalaman membeli rumah yang menyenangkan."},
  {"inisial": "B", "nama": "Budi Hartono",     "lokasi": "Investor, Ivory Grand House",     "teks": "Investasi terbaik yang pernah saya lakukan. Havenest membantu saya menemukan properti dengan potensi nilai sangat baik di lokasi premium."}
]')

ON CONFLICT (section) DO NOTHING;
