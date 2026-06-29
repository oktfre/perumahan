export const fmt = (n) => {
  if (!n && n !== 0) return "—";
  if (n >= 1e9) return `Rp ${(n / 1e9).toFixed(2).replace(/\.?0+$/, "")} M`;
  if (n >= 1e6) return `Rp ${(n / 1e6).toFixed(0)} Jt`;
  return "Rp " + Math.round(n).toLocaleString("id-ID");
};

export const fmtFull = (n) => "Rp " + Math.round(n).toLocaleString("id-ID");

// Alias — banyak komponen (ListingCards, DetailPage, KPRModal, HomeCard, HomePage)
// memanggil fmtM/fmtRp tapi fungsinya belum pernah didefinisikan di file ini.
export const fmtM = fmt;
export const fmtRp = fmtFull;

export const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
};

export const fmtDateTime = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

export const calcKPR = (pokok, rate, tenor) => {
  const r = rate / 100 / 12, n = tenor * 12;
  if (r === 0) return pokok / n;
  return pokok * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
};

// Tabel amortisasi bulanan — dipakai KPRModal. Logikanya identik dengan
// backend (controllers/kprController.js → buildAmortisasi).
export const buildAmort = (pokok, rate, tenor) => {
  const r = rate / 100 / 12;
  const n = tenor * 12;
  const cicilan = calcKPR(pokok, rate, tenor);
  let sisa = pokok;
  return Array.from({ length: n }, (_, i) => {
    const bunga = sisa * r;
    const pokok_ = cicilan - bunga;
    sisa -= pokok_;
    return {
      bulan: i + 1,
      cicilan: Math.round(cicilan),
      bunga: Math.round(bunga),
      pokok: Math.round(pokok_),
      sisa: Math.round(Math.max(0, sisa)),
    };
  });
};

export const BADGE_COLORS = {
  Baru: "#B5844A", Terlaris: "#2C1F14", Promo: "#4A7C59", Eksklusif: "#6B4F8C",
};

export const BOOKING_STATUS_COLORS = {
  pending: { bg: "#FFF9F0", border: "#F59E0B", text: "#92400E", label: "⏳ Pre-Booking" },
  approved: { bg: "#F0FFF4", border: "#4A7C59", text: "#2d5a3d", label: "✅ Terjual" },
  rejected: { bg: "#FFF0F0", border: "#A04040", text: "#7f1d1d", label: "❌ Ditolak" },
  null: { bg: "#F5F0E8", border: "#C8B49A", text: "#8C6F5A", label: "Tersedia" },
  // ── Status asli dari enum status_booking backend (PostgreSQL)
  pra_booking: { bg: "#FFF9F0", border: "#F59E0B", text: "#92400E", label: "⏳ Pra-Booking" },
  terjual:     { bg: "#F0FFF4", border: "#4A7C59", text: "#2d5a3d", label: "✅ Terjual" },
  ditolak:     { bg: "#FFF0F0", border: "#A04040", text: "#7f1d1d", label: "❌ Ditolak" },
};

export const toBase64 = (file) => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload = e => res(e.target.result);
  r.onerror = rej;
  r.readAsDataURL(file);
});

export const BANKS = [
  { id: "btn", name: "BTN", logo: "🏗", rate: 10.25, maxTenor: 30, minDP: 10, color: "#1A5276", note: "Spesialis KPR, proses mudah" },
  { id: "bca", name: "BCA", logo: "🏦", rate: 10.5, maxTenor: 30, minDP: 10, color: "#005BAA", note: "Proses cepat 5 hari kerja" },
  { id: "bri", name: "BRI", logo: "🏛", rate: 10.75, maxTenor: 30, minDP: 10, color: "#00529B", note: "Khusus ASN/PNS bunga 9.5%" },
  { id: "bni", name: "BNI", logo: "🏩", rate: 10.9, maxTenor: 25, minDP: 15, color: "#FF6600", note: "Cicilan tetap 3 tahun pertama" },
  { id: "mandiri", name: "Mandiri", logo: "🏢", rate: 11.0, maxTenor: 30, minDP: 15, color: "#003D7C", note: "Gratis biaya provisi bulan ini" },
  { id: "cimb", name: "CIMB Niaga", logo: "🔴", rate: 11.25, maxTenor: 25, minDP: 20, color: "#D40000", note: "Diskon rate nasabah prioritas" },
];
