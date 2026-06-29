-- ================================================================
--  DATABASE LENGKAP — HAVENEST / PERUMAHAN  |  PostgreSQL 14+
--  File gabungan dari: schema.sql + users.sql + cms.sql +
--                       properties_ext.sql + inquiries.sql + booking
--  Dibuat      : 2026
--
--  Cara pakai (database baru / fresh install):
--    psql -U postgres -c "CREATE DATABASE perumahan;"
--    psql -U postgres -d perumahan -f db/database_lengkap.sql
--
--  Berisi:
--    1. perumahan, tipe_unit, opsi_angsuran (+ views)
--    2. users, refresh_tokens
--    3. site_content 
--    4. property_images (+ kolom tambahan tipe_unit)
--    5. inquiries
--    6. booking 
-- ================================================================

-- ----------------------------------------------------------------
--  0. RESET (jalankan ulang aman)
-- ----------------------------------------------------------------
DROP TABLE IF EXISTS booking         CASCADE;
DROP TABLE IF EXISTS property_images CASCADE;
DROP TABLE IF EXISTS inquiries       CASCADE;
DROP TABLE IF EXISTS site_content    CASCADE;
DROP TABLE IF EXISTS refresh_tokens  CASCADE;
DROP TABLE IF EXISTS users           CASCADE;
DROP TABLE IF EXISTS opsi_angsuran   CASCADE;
DROP TABLE IF EXISTS tipe_unit       CASCADE;
DROP TABLE IF EXISTS perumahan       CASCADE;
DROP TYPE  IF EXISTS status_unit;
DROP TYPE  IF EXISTS status_booking;
DROP TYPE  IF EXISTS inquiry_status;
DROP FUNCTION IF EXISTS fn_set_updated_at CASCADE;
DROP FUNCTION IF EXISTS fn_enforce_single_primary CASCADE;

-- ----------------------------------------------------------------
--  1. ENUM TYPE
-- ----------------------------------------------------------------
CREATE TYPE status_unit AS ENUM ('tersedia', 'pra_booking', 'terjual');

-- ----------------------------------------------------------------
--  2. TABEL: perumahan
--     Master data nama & lokasi kompleks
-- ----------------------------------------------------------------
CREATE TABLE perumahan (
    id         SERIAL       PRIMARY KEY,
    nama       VARCHAR(100) NOT NULL,
    lokasi     VARCHAR(200) NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  perumahan        IS 'Master data kompleks perumahan';
COMMENT ON COLUMN perumahan.id     IS 'Primary key auto-increment';
COMMENT ON COLUMN perumahan.nama   IS 'Nama kompleks, contoh: Jasmine Residence';
COMMENT ON COLUMN perumahan.lokasi IS 'Nama jalan / alamat kompleks';

-- ----------------------------------------------------------------
--  3. TABEL: tipe_unit
--     Spesifikasi setiap tipe rumah dalam satu kompleks
-- ----------------------------------------------------------------
CREATE TABLE tipe_unit (
    id                   SERIAL        PRIMARY KEY,
    perumahan_id         INT           NOT NULL
                                           REFERENCES perumahan(id) ON DELETE CASCADE ON UPDATE CASCADE,
    nomor_tipe           SMALLINT      NOT NULL,
    luas_tanah_lebar_m   NUMERIC(5,2)  NOT NULL,
    luas_tanah_panjang_m NUMERIC(5,2)  NOT NULL,
    luas_tanah_m2        NUMERIC(8,2)  GENERATED ALWAYS AS
                                           (luas_tanah_lebar_m * luas_tanah_panjang_m) STORED,
    lebar_jalan_m        NUMERIC(4,1)  NOT NULL,
    jumlah_kamar_tidur   SMALLINT      NOT NULL  CHECK (jumlah_kamar_tidur  > 0),
    jumlah_kamar_mandi   SMALLINT      NOT NULL  CHECK (jumlah_kamar_mandi  > 0),
    sumber_air           VARCHAR(50)   NOT NULL  DEFAULT 'Sumur Bor',
    daya_listrik_watt    INT           NOT NULL  CHECK (daya_listrik_watt   > 0),
    harga_jual_juta      NUMERIC(10,2) NOT NULL  CHECK (harga_jual_juta     > 0),
    dp_awal_juta         NUMERIC(10,2) NOT NULL  CHECK (dp_awal_juta        >= 0),
    unit_tersedia        INT           NOT NULL  DEFAULT 0 CHECK (unit_tersedia >= 0),
    status               status_unit   NOT NULL  DEFAULT 'tersedia',
    created_at           TIMESTAMPTZ   NOT NULL  DEFAULT NOW(),
    updated_at           TIMESTAMPTZ   NOT NULL  DEFAULT NOW(),

    CONSTRAINT uq_tipe_per_komplek UNIQUE (perumahan_id, nomor_tipe)
);

COMMENT ON TABLE  tipe_unit                       IS 'Tipe rumah per kompleks perumahan';
COMMENT ON COLUMN tipe_unit.nomor_tipe            IS 'Nomor tipe dalam satu kompleks (1, 2, 3, …)';
COMMENT ON COLUMN tipe_unit.luas_tanah_lebar_m    IS 'Lebar tanah (meter)';
COMMENT ON COLUMN tipe_unit.luas_tanah_panjang_m  IS 'Panjang tanah (meter)';
COMMENT ON COLUMN tipe_unit.luas_tanah_m2         IS 'Luas tanah total — dihitung otomatis (m²)';
COMMENT ON COLUMN tipe_unit.lebar_jalan_m         IS 'Lebar jalan depan rumah (meter)';
COMMENT ON COLUMN tipe_unit.harga_jual_juta       IS 'Harga jual dalam jutaan Rupiah';
COMMENT ON COLUMN tipe_unit.dp_awal_juta          IS 'Uang muka awal dalam jutaan Rupiah';
COMMENT ON COLUMN tipe_unit.unit_tersedia         IS 'Jumlah unit; 0 = terjual';
COMMENT ON COLUMN tipe_unit.status                IS 'tersedia | pra_booking | terjual';

-- ----------------------------------------------------------------
--  4. TABEL: opsi_angsuran
--     Pilihan tenor KPR per tipe unit
-- ----------------------------------------------------------------
CREATE TABLE opsi_angsuran (
    id           SERIAL   PRIMARY KEY,
    tipe_unit_id INT      NOT NULL
                              REFERENCES tipe_unit(id) ON DELETE CASCADE ON UPDATE CASCADE,
    tenor_tahun  SMALLINT NOT NULL CHECK (tenor_tahun > 0),

    CONSTRAINT uq_tenor_per_tipe UNIQUE (tipe_unit_id, tenor_tahun)
);

COMMENT ON TABLE  opsi_angsuran             IS 'Pilihan tenor angsuran KPR per tipe unit';
COMMENT ON COLUMN opsi_angsuran.tenor_tahun IS 'Lama angsuran dalam tahun (10 / 15 / 20)';

-- ----------------------------------------------------------------
--  5. INDEX
-- ----------------------------------------------------------------
CREATE INDEX idx_tu_perumahan ON tipe_unit(perumahan_id);
CREATE INDEX idx_tu_status    ON tipe_unit(status);
CREATE INDEX idx_tu_harga     ON tipe_unit(harga_jual_juta);
CREATE INDEX idx_tu_kt        ON tipe_unit(jumlah_kamar_tidur);
CREATE INDEX idx_oa_tipe      ON opsi_angsuran(tipe_unit_id);

-- ----------------------------------------------------------------
--  6. TRIGGER: auto-update kolom updated_at
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_perumahan_updated_at
    BEFORE UPDATE ON perumahan
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_tipe_unit_updated_at
    BEFORE UPDATE ON tipe_unit
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ----------------------------------------------------------------
--  7. DATA: perumahan
-- ----------------------------------------------------------------
INSERT INTO perumahan (id, nama, lokasi) VALUES
    (1, 'Jasmine Residence', 'Jl. Perdamaian'),
    (2, 'Perintis Asri',     'Jl. Perintis');

-- Sinkronkan sequence agar INSERT berikutnya tidak bentrok
SELECT setval(pg_get_serial_sequence('perumahan', 'id'), MAX(id)) FROM perumahan;

-- ----------------------------------------------------------------
--  8. DATA: tipe_unit
-- ----------------------------------------------------------------
INSERT INTO tipe_unit
    (perumahan_id, nomor_tipe,
     luas_tanah_lebar_m, luas_tanah_panjang_m, lebar_jalan_m,
     jumlah_kamar_tidur, jumlah_kamar_mandi,
     sumber_air, daya_listrik_watt,
     harga_jual_juta, dp_awal_juta,
     unit_tersedia, status)
VALUES
    -- ── Jasmine Residence ────────────────────────────────────
    -- Tipe 1 | 7×19 m | jalan 5 m | 1KT | terjual
    (1, 1,  7.00, 19.00, 5.0, 1, 1, 'Sumur Bor', 1300, 185.00, 1.00,  0, 'terjual'),
    -- Tipe 2 | 7.5×19 m | jalan 5 m | 2KT | terjual
    (1, 2,  7.50, 19.00, 5.0, 2, 1, 'Sumur Bor', 1300, 190.00, 1.00,  0, 'terjual'),
    -- Tipe 3 | 7×19 m | jalan 6 m | 2KT | 7 unit
    (1, 3,  7.00, 19.00, 6.0, 2, 1, 'Sumur Bor', 1300, 190.00, 1.00,  7, 'tersedia'),
    -- Tipe 5 | 7×21 m | jalan 6 m | 2KT | 45 unit
    (1, 5,  7.00, 21.00, 6.0, 2, 1, 'Sumur Bor', 1300, 190.00, 1.00, 45, 'tersedia'),

    -- ── Perintis Asri ────────────────────────────────────────
    -- Tipe 1 | 8×12 m | jalan 5 m | 1KT | terjual
    (2, 1,  8.00, 12.00, 5.0, 1, 1, 'Sumur Bor', 1300, 180.00, 1.00,  0, 'terjual'),
    -- Tipe 2 | 8×12.5 m | jalan 5 m | 1KT | terjual
    (2, 2,  8.00, 12.50, 5.0, 1, 1, 'Sumur Bor', 1300, 180.00, 1.00,  0, 'terjual'),
    -- Tipe 3 | 8×14 m | jalan 5 m | 1KT | terjual
    (2, 3,  8.00, 14.00, 5.0, 1, 1, 'Sumur Bor', 1300, 180.00, 1.00,  0, 'terjual'),
    -- Tipe 4 | 7×19 m | jalan 5 m | 1KT | terjual
    (2, 4,  7.00, 19.00, 5.0, 1, 1, 'Sumur Bor', 1300, 180.00, 1.00,  0, 'terjual'),
    -- Tipe 5 | 8×12 m | jalan 5 m | 2KT | 1 unit
    (2, 5,  8.00, 12.00, 5.0, 2, 1, 'Sumur Bor', 1300, 180.00, 1.00,  1, 'tersedia'),
    -- Tipe 6 | 8×12 m | jalan 5 m | 2KT | 60 unit
    (2, 6,  8.00, 12.00, 5.0, 2, 1, 'Sumur Bor', 1300, 180.00, 1.00, 60, 'tersedia');

SELECT setval(pg_get_serial_sequence('tipe_unit', 'id'), MAX(id)) FROM tipe_unit;

-- ----------------------------------------------------------------
--  9. DATA: opsi_angsuran
--     Semua tipe menawarkan tenor 10, 15, 20 tahun
-- ----------------------------------------------------------------
INSERT INTO opsi_angsuran (tipe_unit_id, tenor_tahun)
SELECT t.id, tenor.tahun
FROM   tipe_unit t
CROSS  JOIN (VALUES (10),(15),(20)) AS tenor(tahun);

-- ----------------------------------------------------------------
-- 10. VIEW: v_unit_lengkap
--     Ringkasan lengkap per tipe, tenor dijadikan satu string
-- ----------------------------------------------------------------
CREATE OR REPLACE VIEW v_unit_lengkap AS
SELECT
    p.id                                                             AS perumahan_id,
    p.nama                                                           AS perumahan,
    p.lokasi,
    t.id                                                             AS tipe_unit_id,
    t.nomor_tipe,
    CONCAT(t.luas_tanah_lebar_m, ' x ', t.luas_tanah_panjang_m, ' m') AS luas_tanah,
    t.luas_tanah_m2,
    CONCAT(t.lebar_jalan_m, ' m')                                   AS lebar_jalan,
    t.jumlah_kamar_tidur                                             AS kamar_tidur,
    t.jumlah_kamar_mandi                                             AS kamar_mandi,
    t.sumber_air,
    t.daya_listrik_watt,
    t.harga_jual_juta,
    t.dp_awal_juta,
    t.unit_tersedia,
    t.status,
    STRING_AGG(a.tenor_tahun::TEXT, ', ' ORDER BY a.tenor_tahun)    AS opsi_tenor_tahun
FROM   perumahan     p
JOIN   tipe_unit     t ON t.perumahan_id  = p.id
JOIN   opsi_angsuran a ON a.tipe_unit_id  = t.id
GROUP  BY
    p.id, p.nama, p.lokasi,
    t.id, t.nomor_tipe,
    t.luas_tanah_lebar_m, t.luas_tanah_panjang_m, t.luas_tanah_m2,
    t.lebar_jalan_m, t.jumlah_kamar_tidur, t.jumlah_kamar_mandi,
    t.sumber_air, t.daya_listrik_watt,
    t.harga_jual_juta, t.dp_awal_juta, t.unit_tersedia, t.status
ORDER  BY p.nama, t.nomor_tipe;

-- ----------------------------------------------------------------
-- 11. VIEW: v_unit_tersedia  (hanya yang belum terjual)
-- ----------------------------------------------------------------
CREATE OR REPLACE VIEW v_unit_tersedia AS
SELECT * FROM v_unit_lengkap WHERE status = 'tersedia';

-- ----------------------------------------------------------------
-- 12. VIEW: v_rekap_stok  (ringkasan stok per kompleks)
-- ----------------------------------------------------------------
CREATE OR REPLACE VIEW v_rekap_stok AS
SELECT
    p.nama                              AS perumahan,
    p.lokasi,
    COUNT(t.id)                         AS total_tipe,
    SUM(t.unit_tersedia)                AS total_unit_tersedia,
    COUNT(*) FILTER (WHERE t.status = 'terjual')  AS tipe_sold_out,  -- nama kolom dipertahankan utk kompatibilitas frontend
    MIN(t.harga_jual_juta)              AS harga_terendah_juta,
    MAX(t.harga_jual_juta)              AS harga_tertinggi_juta
FROM   perumahan p
JOIN   tipe_unit t ON t.perumahan_id = p.id
GROUP  BY p.id, p.nama, p.lokasi
ORDER  BY p.nama;

-- ================================================================
--  REFERENSI QUERY SIAP PAKAI
-- ================================================================

-- A. Tampilkan semua unit yang masih tersedia
-- SELECT * FROM v_unit_tersedia;

-- B. Cari rumah ≥ 2KT, harga ≤ 195 juta
-- SELECT perumahan, nomor_tipe, luas_tanah, harga_jual_juta, unit_tersedia
-- FROM   v_unit_tersedia
-- WHERE  kamar_tidur >= 2 AND harga_jual_juta <= 195;

-- C. Rekap stok per kompleks
-- SELECT * FROM v_rekap_stok;

-- D. Estimasi cicilan 20 tahun bunga 10.5%
--    [cicilan = pokok * (r*(1+r)^n) / ((1+r)^n - 1)]
-- SELECT
--     perumahan, nomor_tipe, harga_jual_juta,
--     ROUND(
--         (harga_jual_juta * 1e6 * 0.8)
--         * (0.105/12 * POWER(1 + 0.105/12, 240))
--         / (POWER(1 + 0.105/12, 240) - 1)
--     / 1e6, 3) AS estimasi_cicilan_juta_per_bulan
-- FROM v_unit_tersedia;

-- E. Tambah tipe baru (Jasmine Residence Tipe 6)
-- INSERT INTO tipe_unit
--     (perumahan_id, nomor_tipe, luas_tanah_lebar_m, luas_tanah_panjang_m,
--      lebar_jalan_m, jumlah_kamar_tidur, jumlah_kamar_mandi,
--      sumber_air, daya_listrik_watt, harga_jual_juta, dp_awal_juta,
--      unit_tersedia, status)
-- VALUES (1, 6, 8.0, 20.0, 6.0, 3, 2, 'Sumur Bor', 2200, 250.00, 5.00, 20, 'tersedia')
-- RETURNING id;
--
-- INSERT INTO opsi_angsuran (tipe_unit_id, tenor_tahun)
-- SELECT currval(pg_get_serial_sequence('tipe_unit','id')), t
-- FROM   unnest(ARRAY[10,15,20]) t;

-- F. Update unit terjual
-- UPDATE tipe_unit
-- SET    status = 'terjual', unit_tersedia = 0
-- WHERE  perumahan_id = 1 AND nomor_tipe = 3;

-- G. Kurangi stok saat terjual
-- UPDATE tipe_unit
-- SET    unit_tersedia = unit_tersedia - 1,
--        status        = CASE WHEN unit_tersedia - 1 = 0 THEN 'terjual' ELSE status END
-- WHERE  id = :tipe_unit_id AND unit_tersedia > 0;

-- ==============================================================================
--  MIGRASI: Tabel users + refresh_tokens
-- ==============================================================================

-- ================================================================
--  MIGRASI: Tabel users + update routes auth
--  Jalankan SETELAH schema.sql utama
--  PostgreSQL 14+
-- ================================================================

-- ── Tabel users
CREATE TABLE IF NOT EXISTS users (
    id            SERIAL        PRIMARY KEY,
    nama          VARCHAR(100)  NOT NULL,
    email         VARCHAR(150)  NOT NULL UNIQUE,
    password_hash VARCHAR(255)  NOT NULL,
    role          VARCHAR(20)   NOT NULL DEFAULT 'user'
                                    CHECK (role IN ('user', 'admin')),
    is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
    last_login    TIMESTAMPTZ,
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  users            IS 'Akun pengguna — user & admin';
COMMENT ON COLUMN users.role       IS 'user = hanya lihat | admin = CRUD penuh';
COMMENT ON COLUMN users.is_active  IS 'false = akun dinonaktifkan';

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role  ON users(role);

-- ── Trigger updated_at untuk users
DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ── Tabel refresh_tokens (opsional — untuk invalidate token)
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id         SERIAL       PRIMARY KEY,
    user_id    INT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ  NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rt_user ON refresh_tokens(user_id);

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

-- ================================================================
--  MIGRASI: Ekstensi tipe_unit + tabel property_images
--  Jalankan: psql -d perumahan -f db/properties_ext.sql
--  PostgreSQL 14+
-- ================================================================

-- ── 1. Tambah kolom baru ke tipe_unit
ALTER TABLE tipe_unit
  ADD COLUMN IF NOT EXISTS nama_properti  VARCHAR(200),
  ADD COLUMN IF NOT EXISTS badge          VARCHAR(30),
  ADD COLUMN IF NOT EXISTS tipe_properti  VARCHAR(50)  DEFAULT 'Rumah Tapak',
  ADD COLUMN IF NOT EXISTS deskripsi      TEXT,
  ADD COLUMN IF NOT EXISTS fasilitas      JSONB        NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS lat            NUMERIC(10,6),
  ADD COLUMN IF NOT EXISTS lng            NUMERIC(10,6),
  ADD COLUMN IF NOT EXISTS jumlah_lantai  SMALLINT     DEFAULT 1,
  ADD COLUMN IF NOT EXISTS luas_bangunan_m2 NUMERIC(8,2) DEFAULT 36;

-- ── 2. Tabel gambar properti
CREATE TABLE IF NOT EXISTS property_images (
    id            SERIAL        PRIMARY KEY,
    tipe_unit_id  INT           NOT NULL
                                    REFERENCES tipe_unit(id) ON DELETE CASCADE,
    url           VARCHAR(500)  NOT NULL,
    caption       VARCHAR(200)  NOT NULL DEFAULT '',
    sort_order    SMALLINT      NOT NULL DEFAULT 0,
    is_primary    BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  property_images            IS 'Gambar per tipe unit properti';
COMMENT ON COLUMN property_images.url        IS 'URL gambar (Unsplash, CDN, dsb.)';
COMMENT ON COLUMN property_images.caption    IS 'Keterangan gambar';
COMMENT ON COLUMN property_images.is_primary IS 'Satu gambar utama per unit';

CREATE INDEX IF NOT EXISTS idx_pi_unit    ON property_images(tipe_unit_id);
CREATE INDEX IF NOT EXISTS idx_pi_primary ON property_images(tipe_unit_id, is_primary);

-- ── 3. Trigger: pastikan max 1 is_primary per tipe_unit
CREATE OR REPLACE FUNCTION fn_enforce_single_primary()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.is_primary = TRUE THEN
        UPDATE property_images
           SET is_primary = FALSE
         WHERE tipe_unit_id = NEW.tipe_unit_id
           AND id <> NEW.id;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_single_primary ON property_images;
CREATE TRIGGER trg_single_primary
    AFTER INSERT OR UPDATE OF is_primary ON property_images
    FOR EACH ROW WHEN (NEW.is_primary = TRUE)
    EXECUTE FUNCTION fn_enforce_single_primary();

-- ================================================================
--  4. SEED: Update kolom baru untuk 10 record yang sudah ada
-- ================================================================

-- Jasmine Residence — Tipe 1 (id=1, 133m², 1KT, Rp185Jt, sold_out)
UPDATE tipe_unit SET
  nama_properti = 'Jasmine Tipe 1 — Unit Starter',
  badge         = NULL,
  tipe_properti = 'Rumah Tapak',
  deskripsi     = 'Unit perdana Jasmine Residence dengan desain kompak dan fungsional. Cocok untuk pasangan muda yang menginginkan hunian nyaman di kawasan strategis Jl. Perdamaian.',
  fasilitas     = '["CCTV 24 Jam","Keamanan 24 Jam","Water Heater","Taman"]',
  lat = -6.9344, lng = 107.5965,
  jumlah_lantai = 2, luas_bangunan_m2 = 36
WHERE id = 1;

-- Jasmine Residence — Tipe 2 (id=2, 142.5m², 2KT, Rp190Jt, sold_out)
UPDATE tipe_unit SET
  nama_properti = 'Jasmine Tipe 2 — Unit Plus',
  badge         = NULL,
  tipe_properti = 'Rumah Tapak',
  deskripsi     = 'Unit yang lebih lebar dengan tambahan kamar tidur kedua. Desain modern minimalis dengan pencahayaan alami yang optimal di setiap ruangan.',
  fasilitas     = '["CCTV 24 Jam","Keamanan 24 Jam","Water Heater","Taman","Carport"]',
  lat = -6.9344, lng = 107.5968,
  jumlah_lantai = 2, luas_bangunan_m2 = 36
WHERE id = 2;

-- Jasmine Residence — Tipe 3 (id=3, 133m², 2KT, Rp190Jt, 7 unit)
UPDATE tipe_unit SET
  nama_properti = 'Jasmine Tipe 3 — Corner Unit',
  badge         = 'Baru',
  tipe_properti = 'Rumah Tapak',
  deskripsi     = 'Unit pojok dengan lebar jalan 6 meter, memberikan privasi lebih dan sirkulasi udara yang baik. Tersisa 7 unit — segera dapatkan sebelum kehabisan!',
  fasilitas     = '["CCTV 24 Jam","Keamanan 24 Jam","Water Heater","Taman","Carport","Ruang Keluarga Luas"]',
  lat = -6.9347, lng = 107.5965,
  jumlah_lantai = 2, luas_bangunan_m2 = 36
WHERE id = 3;

-- Jasmine Residence — Tipe 5 (id=4, 147m², 2KT, Rp190Jt, 45 unit)
UPDATE tipe_unit SET
  nama_properti = 'Jasmine Tipe 5 — Premium Corner',
  badge         = 'Terlaris',
  tipe_properti = 'Rumah Tapak',
  deskripsi     = 'Unit terluas di Jasmine Residence dengan panjang 21 meter. Memiliki halaman belakang lebih lega, jalan depan 6 meter, dan desain eksterior premium. Unit terlaris!',
  fasilitas     = '["CCTV 24 Jam","Keamanan 24 Jam","Water Heater","Taman Belakang","Carport","Ruang Keluarga Luas","Dapur Modern"]',
  lat = -6.9350, lng = 107.5970,
  jumlah_lantai = 2, luas_bangunan_m2 = 36
WHERE id = 4;

-- Perintis Asri — Tipe 1 (id=5, 96m², 1KT, Rp180Jt, sold_out)
UPDATE tipe_unit SET
  nama_properti = 'Perintis Asri Tipe 1 — Starter',
  badge         = NULL,
  tipe_properti = 'Rumah Tapak',
  deskripsi     = 'Tipe hunian entry-level Perintis Asri. Desain efisien dengan material berkualitas. Telah habis terjual — daftarkan untuk unit berikutnya.',
  fasilitas     = '["CCTV 24 Jam","Keamanan 24 Jam","Water Heater"]',
  lat = -6.9180, lng = 107.6450,
  jumlah_lantai = 2, luas_bangunan_m2 = 36
WHERE id = 5;

-- Perintis Asri — Tipe 2 (id=6, 100m², 1KT, Rp180Jt, sold_out)
UPDATE tipe_unit SET
  nama_properti = 'Perintis Asri Tipe 2 — Plus',
  badge         = NULL,
  tipe_properti = 'Rumah Tapak',
  deskripsi     = 'Sedikit lebih luas dari Tipe 1 dengan panjang 12.5 meter. Ruang tamu yang nyaman dan kamar tidur yang просторн. Unit sudah habis terjual.',
  fasilitas     = '["CCTV 24 Jam","Keamanan 24 Jam","Water Heater","Carport"]',
  lat = -6.9182, lng = 107.6452,
  jumlah_lantai = 2, luas_bangunan_m2 = 36
WHERE id = 6;

-- Perintis Asri — Tipe 3 (id=7, 112m², 1KT, Rp180Jt, sold_out)
UPDATE tipe_unit SET
  nama_properti = 'Perintis Asri Tipe 3 — Deluxe',
  badge         = NULL,
  tipe_properti = 'Rumah Tapak',
  deskripsi     = 'Tipe dengan luas tanah paling besar di kelompok 1 kamar tidur. Ruang serba guna bisa difungsikan sebagai kamar anak atau home office.',
  fasilitas     = '["CCTV 24 Jam","Keamanan 24 Jam","Water Heater","Carport","Ruang Serbaguna"]',
  lat = -6.9185, lng = 107.6455,
  jumlah_lantai = 2, luas_bangunan_m2 = 36
WHERE id = 7;

-- Perintis Asri — Tipe 4 (id=8, 133m², 1KT, Rp180Jt, sold_out)
UPDATE tipe_unit SET
  nama_properti = 'Perintis Asri Tipe 4 — Large',
  badge         = NULL,
  tipe_properti = 'Rumah Tapak',
  deskripsi     = 'Unit terluas dengan 1 kamar tidur. Lahan 7x19 meter memberikan ruang ekstra di depan dan belakang rumah. Sangat sesuai untuk renovasi ke depannya.',
  fasilitas     = '["CCTV 24 Jam","Keamanan 24 Jam","Water Heater","Carport","Halaman Depan Luas"]',
  lat = -6.9188, lng = 107.6458,
  jumlah_lantai = 2, luas_bangunan_m2 = 36
WHERE id = 8;

-- Perintis Asri — Tipe 5 (id=9, 96m², 2KT, Rp180Jt, 1 unit)
UPDATE tipe_unit SET
  nama_properti = 'Perintis Asri Tipe 5 — Keluarga',
  badge         = 'Promo',
  tipe_properti = 'Rumah Tapak',
  deskripsi     = 'Unit 2 kamar tidur terjangkau — harga sama seperti tipe 1 kamar tetapi dengan ruang lebih! Tersisa 1 unit terakhir, segera hubungi agen kami.',
  fasilitas     = '["CCTV 24 Jam","Keamanan 24 Jam","Water Heater","Carport","Taman Kecil"]',
  lat = -6.9190, lng = 107.6460,
  jumlah_lantai = 2, luas_bangunan_m2 = 36
WHERE id = 9;

-- Perintis Asri — Tipe 6 (id=10, 96m², 2KT, Rp180Jt, 60 unit)
UPDATE tipe_unit SET
  nama_properti = 'Perintis Asri Tipe 6 — Grand Family',
  badge         = 'Terlaris',
  tipe_properti = 'Rumah Tapak',
  deskripsi     = 'Unit keluarga terpopuler di Perintis Asri. Dengan 60 unit tersedia, pilihan cluster dan posisi masih sangat banyak. Harga terbaik untuk 2 kamar tidur di kawasan ini.',
  fasilitas     = '["CCTV 24 Jam","Keamanan 24 Jam","Water Heater","Carport","Taman Komunal","Playground","Jogging Track"]',
  lat = -6.9192, lng = 107.6462,
  jumlah_lantai = 2, luas_bangunan_m2 = 36
WHERE id = 10;

-- ================================================================
--  5. SEED: Gambar untuk setiap tipe unit
-- ================================================================
INSERT INTO property_images (tipe_unit_id, url, caption, sort_order, is_primary) VALUES
-- ID 1 — Jasmine Tipe 1
(1, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=85', 'Tampak Depan', 0, TRUE),
(1, 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=900&q=85', 'Ruang Tamu', 1, FALSE),
(1, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&q=85', 'Dapur', 2, FALSE),

-- ID 2 — Jasmine Tipe 2
(2, 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900&q=85', 'Tampak Depan', 0, TRUE),
(2, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900&q=85', 'Ruang Keluarga', 1, FALSE),

-- ID 3 — Jasmine Tipe 3 (Corner)
(3, 'https://images.unsplash.com/photo-1598228723793-52759bba239c?w=900&q=85', 'Tampak Depan', 0, TRUE),
(3, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=85', 'Area Samping', 1, FALSE),
(3, 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=900&q=85', 'Kamar Tidur Utama', 2, FALSE),

-- ID 4 — Jasmine Tipe 5 (Premium)
(4, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=85', 'Tampak Depan Premium', 0, TRUE),
(4, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900&q=85', 'Ruang Tamu Luas', 1, FALSE),
(4, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&q=85', 'Halaman Belakang', 2, FALSE),
(4, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&q=85', 'Dapur Modern', 3, FALSE),

-- ID 5 — Perintis Tipe 1
(5, 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=900&q=85', 'Tampak Depan', 0, TRUE),
(5, 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=900&q=85', 'Interior', 1, FALSE),

-- ID 6 — Perintis Tipe 2
(6, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=85', 'Tampak Depan', 0, TRUE),
(6, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=85', 'Ruang Dalam', 1, FALSE),

-- ID 7 — Perintis Tipe 3
(7, 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=900&q=85', 'Tampak Depan', 0, TRUE),
(7, 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=900&q=85', 'Ruang Tamu', 1, FALSE),

-- ID 8 — Perintis Tipe 4
(8, 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=900&q=85', 'Tampak Depan', 0, TRUE),
(8, 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=900&q=85', 'Ruang Dalam', 1, FALSE),

-- ID 9 — Perintis Tipe 5 (Promo)
(9, 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900&q=85', 'Tampak Depan', 0, TRUE),
(9, 'https://images.unsplash.com/photo-1598228723793-52759bba239c?w=900&q=85', 'Ruang Keluarga', 1, FALSE),
(9, 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=900&q=85', 'Kamar Tidur', 2, FALSE),

-- ID 10 — Perintis Tipe 6 (Terlaris)
(10, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=85', 'Tampak Depan', 0, TRUE),
(10, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=85', 'Area Parkir', 1, FALSE),
(10, 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=900&q=85', 'Kamar Tidur Utama', 2, FALSE),
(10, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&q=85', 'Dapur', 3, FALSE)

ON CONFLICT DO NOTHING;

-- ================================================================
--  MIGRASI: Tabel inquiries (Kontak & Konsultasi)
--  Jalankan: psql -d perumahan -f db/inquiries.sql
--  PostgreSQL 14+
-- ================================================================

-- ── 1. ENUM TYPE untuk status inquiry
CREATE TYPE inquiry_status AS ENUM ('unread', 'read', 'replied');

-- ── 2. TABEL: inquiries
CREATE TABLE IF NOT EXISTS inquiries (
    id                SERIAL        PRIMARY KEY,
    nama_lengkap      VARCHAR(150)  NOT NULL,
    nomor_hp          VARCHAR(20)   NOT NULL,
    email             VARCHAR(150)  NOT NULL,
    keterangan        VARCHAR(100)  NOT NULL,
    pesan             TEXT          NOT NULL,
    status            inquiry_status NOT NULL DEFAULT 'unread',
    created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    read_at           TIMESTAMPTZ   NULL,
    replied_at        TIMESTAMPTZ   NULL,
    admin_notes       TEXT          NULL
);

COMMENT ON TABLE  inquiries                 IS 'Pesan kontak & konsultasi dari user';
COMMENT ON COLUMN inquiries.nama_lengkap    IS 'Nama lengkap pengirim';
COMMENT ON COLUMN inquiries.nomor_hp        IS 'Nomor HP / WhatsApp';
COMMENT ON COLUMN inquiries.email           IS 'Email pengirim';
COMMENT ON COLUMN inquiries.keterangan      IS 'Kategori/topik inquiry';
COMMENT ON COLUMN inquiries.pesan           IS 'Isi pesan';
COMMENT ON COLUMN inquiries.status          IS 'unread | read | replied';
COMMENT ON COLUMN inquiries.read_at         IS 'Waktu dibaca admin';
COMMENT ON COLUMN inquiries.replied_at      IS 'Waktu admin membalas';
COMMENT ON COLUMN inquiries.admin_notes     IS 'Catatan/respons admin';

-- ── 3. INDEX
CREATE INDEX IF NOT EXISTS idx_inq_status   ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inq_created  ON inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inq_email    ON inquiries(email);

-- ================================================================

-- ================================================================
--  MIGRASI: Tabel booking (Pra-booking / Reservasi Unit)
--  Bagian dari db/database_lengkap.sql  |  PostgreSQL 14+
-- ================================================================

-- ── 1. ENUM TYPE untuk status booking
CREATE TYPE status_booking AS ENUM
(
    'pra_booking',
    'ditolak',
    'terjual'
);

-- ── 2. TABEL: booking
CREATE TABLE booking (
    id                SERIAL          PRIMARY KEY,
    property_id       INT             NOT NULL,
    nama_pembeli      VARCHAR(100)    NOT NULL,
    email             VARCHAR(100),
    no_hp             VARCHAR(20),
    alamat            TEXT,
    metode_pembayaran VARCHAR(50),
    bank              VARCHAR(50),
    nominal_dp        INT             DEFAULT 1000000 CHECK (nominal_dp >= 0),
    bukti_transfer    TEXT,
    status            status_booking  NOT NULL DEFAULT 'pra_booking',
    catatan_admin     TEXT,
    created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_property
        FOREIGN KEY (property_id)
        REFERENCES tipe_unit(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

COMMENT ON TABLE  booking                   IS 'Booking / reservasi unit oleh calon pembeli';
COMMENT ON COLUMN booking.property_id       IS 'Relasi ke tipe_unit(id)';
COMMENT ON COLUMN booking.nominal_dp        IS 'Nominal DP yang ditransfer (Rupiah)';
COMMENT ON COLUMN booking.bukti_transfer    IS 'URL/path file bukti transfer';
COMMENT ON COLUMN booking.status            IS 'pra_booking | ditolak | terjual';
COMMENT ON COLUMN booking.catatan_admin     IS 'Catatan admin saat konfirmasi/tolak booking';

-- ── 3. INDEX
CREATE INDEX idx_booking_property ON booking(property_id);
CREATE INDEX idx_booking_status   ON booking(status);
CREATE INDEX idx_booking_created  ON booking(created_at DESC);

-- ── 4. TRIGGER updated_at (memakai fn_set_updated_at yang sudah ada)
DROP TRIGGER IF EXISTS trg_booking_updated_at ON booking;
CREATE TRIGGER trg_booking_updated_at
    BEFORE UPDATE ON booking
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ================================================================
