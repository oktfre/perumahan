# Migrasi Database — luas_bangunan_m2

## Error yang diperbaiki
```
column t.luas_bangunan_m2 does not exist
```
Terjadi karena database lama masih punya `jumlah_garasi`, bukan `luas_bangunan_m2`.

## Cara Menjalankan Migrasi (pilih salah satu)

### Cara 1 — Otomatis saat start server (DIREKOMENDASIKAN)
Server sekarang sudah otomatis menjalankan migrasi saat pertama kali start:
```bash
cd postgresql
npm run dev
# atau
npm start
```
Output yang diharapkan:
```
[DB] ✅ Koneksi PostgreSQL berhasil.
[DB] ✅ Migrasi kolom berhasil (luas_bangunan_m2, blok, nomor_unit, unit_status).
[Server] 🚀 Havenest API berjalan di http://localhost:3000
```

### Cara 2 — Script migrasi manual
```bash
cd postgresql
npm run migrate
```

### Cara 3 — SQL langsung via psql
```bash
psql -U postgres -d perumahan -c "
  ALTER TABLE tipe_unit ADD COLUMN IF NOT EXISTS luas_bangunan_m2 NUMERIC(8,2) DEFAULT 36;
  UPDATE tipe_unit SET luas_bangunan_m2 = 36 WHERE luas_bangunan_m2 IS NULL;
  ALTER TABLE tipe_unit ADD COLUMN IF NOT EXISTS blok VARCHAR(10) DEFAULT 'A';
  ALTER TABLE tipe_unit ADD COLUMN IF NOT EXISTS nomor_unit VARCHAR(10) DEFAULT '01';
  ALTER TABLE tipe_unit ADD COLUMN IF NOT EXISTS unit_status VARCHAR(20) DEFAULT 'tersedia';
"
```

## Kolom Baru yang Ditambahkan

| Kolom | Tipe | Default | Keterangan |
|---|---|---|---|
| `luas_bangunan_m2` | NUMERIC(8,2) | 36 | Menggantikan `jumlah_garasi` |
| `blok` | VARCHAR(10) | 'A' | Blok kavling (A, B, dst) |
| `nomor_unit` | VARCHAR(10) | '01' | Nomor unit dalam blok |
| `unit_status` | VARCHAR(20) | 'tersedia' | tersedia / booked / terjual |

## Catatan
- Kolom `jumlah_garasi` lama **tidak dihapus** agar aman, bisa hapus manual jika sudah yakin.
- Migrasi bersifat idempotent (aman dijalankan berkali-kali).
