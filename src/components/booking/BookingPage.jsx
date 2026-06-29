import { useState, useEffect, useCallback } from "react";
import QRCode from "qrcode";
import { propertyApi, bookingApi } from "../../utils/api";
import { fmtM, toBase64 } from "../../utils/helpers";
import Btn from "../atoms/Btn";
import Tag from "../atoms/Tag";
import Footer from "../Footer";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=85";
const DP_NOMINAL = 1_000_000;

const BANK_ACCOUNTS = {
  BCA: { norek: "1234567890", nama: "PT Havenest Properti" },
  Mandiri: { norek: "9876543210", nama: "PT Havenest Properti" },
  BRI: { norek: "5566778899", nama: "PT Havenest Properti" },
};

const STEPS = [
  { key: "data", label: "Data Diri" },
  { key: "rumah", label: "Pilih Rumah" },
  { key: "bayar", label: "Pembayaran" },
  { key: "selesai", label: "Selesai" },
];

// ── Warna status unit ──────────────────────────────────────
const UNIT_STATUS = {
  tersedia:    { bg: "#4A7C59", color: "#fff", label: "Tersedia" },
  booked:      { bg: "#B5844A", color: "#fff", label: "Dipesan" },
  terjual:     { bg: "#A04040", color: "#fff", label: "Terjual" },
};

// ── Tombol unit seperti kursi bioskop ─────────────────────
function UnitSeat({ unit, isSelected, onClick }) {
  const status = unit.unit_status || "tersedia";
  const canPick = status === "tersedia";
  const st = UNIT_STATUS[status] || UNIT_STATUS.tersedia;
  return (
    <button
      title={`Blok ${unit.blok} No.${unit.nomor_unit} — ${st.label}${unit.luas_bangunan_m2 ? ` — ${unit.luas_bangunan_m2} m²` : ""}`}
      onClick={() => canPick && onClick(unit)}
      style={{
        width: 52,
        height: 52,
        border: isSelected
          ? "2.5px solid #fff"
          : canPick
          ? "1.5px solid rgba(255,255,255,.35)"
          : "1.5px solid rgba(255,255,255,.15)",
        borderRadius: 6,
        cursor: canPick ? "pointer" : "not-allowed",
        background: isSelected
          ? "#FFD700"
          : canPick
          ? "rgba(74,124,89,.85)"
          : status === "booked"
          ? "rgba(181,132,74,.7)"
          : "rgba(160,64,64,.7)",
        color: isSelected ? "#2C1F14" : "#fff",
        fontSize: ".58rem",
        fontWeight: 700,
        fontFamily: "var(--sans)",
        letterSpacing: ".02em",
        transition: "all .15s",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        boxShadow: isSelected ? "0 0 0 3px #B5844A" : "none",
        transform: isSelected ? "scale(1.08)" : "scale(1)",
      }}
    >
      <span style={{ fontSize: ".55rem", opacity: .8 }}>B{unit.blok}</span>
      <span style={{ fontSize: ".72rem" }}>{unit.nomor_unit}</span>
      {isSelected && <span style={{ fontSize: ".5rem" }}>✓</span>}
    </button>
  );
}

// ── Legenda warna ─────────────────────────────────────────
function Legend() {
  const items = [
    { color: "rgba(74,124,89,.85)", border: "1.5px solid rgba(255,255,255,.35)", label: "Tersedia" },
    { color: "#FFD700", border: "2.5px solid #fff", label: "Dipilih" },
    { color: "rgba(181,132,74,.7)", border: "1.5px solid rgba(255,255,255,.15)", label: "Dipesan" },
    { color: "rgba(160,64,64,.7)", border: "1.5px solid rgba(255,255,255,.15)", label: "Terjual" },
  ];
  return (
    <div style={{ display: "flex", gap: "1.2rem", flexWrap: "wrap", alignItems: "center", marginBottom: "1.2rem" }}>
      {items.map((i) => (
        <div key={i.label} style={{ display: "flex", alignItems: "center", gap: ".4rem" }}>
          <div style={{ width: 16, height: 16, borderRadius: 3, background: i.color, border: i.border }} />
          <span style={{ fontSize: ".72rem", color: "var(--light)" }}>{i.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Denah blok — layout seperti bioskop ──────────────────
function HouseMap({ unitsByBlok, selectedUnit, onSelect }) {
  const blocks = Object.keys(unitsByBlok).sort();
  return (
    <div
      style={{
        background: "var(--espresso)",
        borderRadius: 8,
        padding: "1.5rem 1.5rem 2rem",
        marginBottom: "1.5rem",
        overflowX: "auto",
      }}
    >
      {/* Judul / papan depan */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "1.8rem",
          paddingBottom: ".9rem",
          borderBottom: "2px solid rgba(255,255,255,.12)",
        }}
      >
        <div
          style={{
            display: "inline-block",
            background: "rgba(255,255,255,.12)",
            color: "var(--clay)",
            padding: ".4rem 2.5rem",
            fontSize: ".72rem",
            letterSpacing: ".15em",
            textTransform: "uppercase",
            borderRadius: 4,
          }}
        >
          🏠 Peta Kavling Perumahan
        </div>
      </div>

      {/* Blok-blok rumah */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem", alignItems: "flex-start" }}>
        {blocks.map((blok) => {
          const units = unitsByBlok[blok];
          return (
            <div key={blok}>
              {/* Label blok */}
              <div
                style={{
                  fontSize: ".62rem",
                  letterSpacing: ".15em",
                  textTransform: "uppercase",
                  color: "var(--clay)",
                  marginBottom: ".7rem",
                  fontWeight: 700,
                }}
              >
                ▌ Blok {blok}
              </div>
              {/* Jalan / gang */}
              <div
                style={{
                  background: "rgba(255,255,255,.06)",
                  borderRadius: 4,
                  border: "1px solid rgba(255,255,255,.08)",
                  padding: "1rem 1rem .8rem",
                }}
              >
                <div style={{ display: "flex", flexWrap: "wrap", gap: ".55rem" }}>
                  {units.map((unit) => (
                    <UnitSeat
                      key={unit.id}
                      unit={unit}
                      isSelected={selectedUnit?.id === unit.id}
                      onClick={onSelect}
                    />
                  ))}
                </div>
                {/* Jalan / trotoar di bawah blok */}
                <div
                  style={{
                    marginTop: ".8rem",
                    paddingTop: ".5rem",
                    borderTop: "2px dashed rgba(255,255,255,.1)",
                    fontSize: ".58rem",
                    color: "rgba(255,255,255,.3)",
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                  }}
                >
                  ── Jalan Blok {blok} ──
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Jalan utama */}
      <div
        style={{
          marginTop: "1.5rem",
          textAlign: "center",
          borderTop: "3px solid rgba(255,255,255,.15)",
          paddingTop: ".8rem",
          fontSize: ".65rem",
          color: "rgba(255,255,255,.3)",
          letterSpacing: ".12em",
          textTransform: "uppercase",
        }}
      >
        ═══ Jalan Utama / Akses Masuk ═══
      </div>
    </div>
  );
}

// ── Field input ────────────────────────────────────────────
function FInput({ label, value, onChange, placeholder, type = "text", required = false }) {
  return (
    <div>
      <label style={{ fontSize: ".75rem", fontWeight: 500, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--earth)", display: "block", marginBottom: ".5rem" }}>
        {label}{required && <span style={{ color: "var(--accent)" }}> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width: "100%", padding: ".75rem 1rem", border: "1px solid var(--mist)", background: "var(--white)", color: "var(--text)", fontSize: ".88rem" }}
      />
    </div>
  );
}

function FTextarea({ label, value, onChange, placeholder, required = false }) {
  return (
    <div>
      <label style={{ fontSize: ".75rem", fontWeight: 500, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--earth)", display: "block", marginBottom: ".5rem" }}>
        {label}{required && <span style={{ color: "var(--accent)" }}> *</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder={placeholder}
        style={{ width: "100%", padding: ".75rem 1rem", border: "1px solid var(--mist)", background: "var(--white)", color: "var(--text)", fontFamily: "var(--sans)", fontSize: ".88rem", resize: "vertical" }}
      />
    </div>
  );
}

// ── Step indicator ─────────────────────────────────────────
function StepBar({ current }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: "2.5rem", maxWidth: 580 }}>
      {STEPS.map((s, i) => (
        <div key={s.key} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "none" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: ".4rem" }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--serif)", fontSize: ".85rem", flexShrink: 0,
              background: i <= current ? "var(--accent)" : "var(--mist)",
              color: i <= current ? "#fff" : "var(--light)",
              transition: "background .25s",
            }}>
              {i < current ? "✓" : i + 1}
            </div>
            <div style={{ fontSize: ".62rem", letterSpacing: ".06em", textTransform: "uppercase", color: i <= current ? "var(--accent)" : "var(--light)", whiteSpace: "nowrap" }}>
              {s.label}
            </div>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{ flex: 1, height: 2, background: i < current ? "var(--accent)" : "var(--mist)", margin: "0 .5rem", marginBottom: "1.1rem", transition: "background .25s" }} />
          )}
        </div>
      ))}
    </div>
  );
}

const EMPTY_FORM = {
  nama_pembeli: "",
  email: "",
  no_hp: "",
  alamat: "",
  property_id: null,
  unit_id: null,
  metode_pembayaran: "",
  bank: "",
  bukti_transfer: "",
};

// ── Buat data unit dummy jika API tidak mengembalikan unit ─
function buildDummyUnits(properties) {
  // Kelompokkan property ke blok berdasarkan perumahan atau blok dari nama
  const grouped = {};
  properties.forEach((p, idx) => {
    // Tentukan blok: ambil dari field blok jika ada, atau buat A/B bergantian
    const blok = p.blok || (idx % 2 === 0 ? "A" : "B");
    if (!grouped[blok]) grouped[blok] = [];
    grouped[blok].push({
      id: p.id,
      blok: blok,
      nomor_unit: p.nomor_unit || String(grouped[blok].length + 1).padStart(2, "0"),
      unit_status: p.unit_tersedia > 0 ? "tersedia" : "terjual",
      luas_bangunan_m2: p.luas_bangunan_m2 || 36,
      harga_jual_juta: p.harga_jual_juta,
      nama_properti: p.nama_properti || p.nama,
      lokasi: p.lokasi,
      gambar_utama: p.gambar_utama,
      perumahan: p.perumahan,
      nomor_tipe: p.nomor_tipe,
      _raw: p,
    });
  });
  return grouped;
}

function BookingPage({ setPage, presetProperty }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [properties, setProperties] = useState([]);
  const [unitsByBlok, setUnitsByBlok] = useState({});
  const [loadingProps, setLoadingProps] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedProp, setSelectedProp] = useState(presetProperty || null);
  const [previewImg, setPreviewImg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Muat daftar rumah tersedia
  const loadProperties = useCallback(() => {
    setLoadingProps(true);
    propertyApi
      .getTersedia("limit=50")
      .then((res) => {
        const data = res.data || [];
        setProperties(data);
        // Kelompokkan ke blok untuk tampilan bioskop
        setUnitsByBlok(buildDummyUnits(data));
      })
      .catch(() => {
        setProperties([]);
        setUnitsByBlok({});
      })
      .finally(() => setLoadingProps(false));
  }, []);

  useEffect(() => { loadProperties(); }, [loadProperties]);

  useEffect(() => {
    if (presetProperty) {
      setSelectedProp(presetProperty);
      set("property_id", presetProperty.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetProperty]);

  const pickUnit = (unit) => {
    setSelectedUnit(unit);
    setSelectedProp(unit._raw || unit);
    set("property_id", unit._raw?.id || unit.id);
    set("unit_id", unit.id);
  };

  // Generate QR code
  useEffect(() => {
    if (form.metode_pembayaran !== "QRIS") return;
    const payload = [
      "HAVENEST-DP-PAYMENT",
      `unit:${selectedProp?.nama_properti || selectedProp?.id || "-"}`,
      `nominal:Rp${DP_NOMINAL.toLocaleString("id-ID")}`,
      `merchant:PT Havenest Properti`,
      `ref:${Date.now()}`,
    ].join("\n");
    QRCode.toDataURL(payload, { width: 220, margin: 1, color: { dark: "#2C1F14", light: "#FFFFFF" } })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(""));
  }, [form.metode_pembayaran, selectedProp]);

  const handleFile = async (file) => {
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      setError("Ukuran file maksimal 3MB.");
      return;
    }
    setError("");
    const base64 = await toBase64(file);
    set("bukti_transfer", base64);
    setPreviewImg(base64);
  };

  const canNext = {
    0: form.nama_pembeli.trim() && form.no_hp.trim() && form.alamat.trim(),
    1: !!form.property_id,
    2:
      form.metode_pembayaran &&
      (form.metode_pembayaran === "QRIS" || form.bank) &&
      form.bukti_transfer,
  };

  const next = () => { if (!canNext[step]) return; setStep((s) => Math.min(s + 1, STEPS.length - 1)); };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    if (!canNext[2]) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await bookingApi.create({
        property_id: form.property_id,
        unit_id: form.unit_id,
        nama_pembeli: form.nama_pembeli,
        email: form.email || undefined,
        no_hp: form.no_hp,
        alamat: form.alamat,
        metode_pembayaran: form.metode_pembayaran,
        bank: form.bank || undefined,
        bukti_transfer: form.bukti_transfer,
      });
      setResult(res.data || res);
      setStep(3);
    } catch (err) {
      setError(err.message || "Gagal membuat booking. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetAll = () => {
    setForm(EMPTY_FORM);
    setSelectedProp(null);
    setSelectedUnit(null);
    setPreviewImg("");
    setResult(null);
    setStep(0);
    loadProperties();
  };

  // Hitung ringkasan unit
  const totalUnits = properties.length;
  const tersediaCount = properties.filter(p => p.unit_tersedia > 0).length;
  const bookedCount = 0; // dari data booking jika ada
  const terjualCount = totalUnits - tersediaCount;

  return (
    <div style={{ minHeight: "100vh", paddingTop: 80 }} className="page-enter">
      {/* Hero */}
      <div style={{ background: "var(--espresso)", padding: "3.5rem 5rem 4rem" }}>
        <Tag label="Booking Online" light />
        <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.2rem,4vw,3rem)", fontWeight: 300, color: "var(--sand)", marginBottom: ".8rem" }}>
          Booking Rumah Impian Anda
        </h1>
        <p style={{ fontSize: ".92rem", color: "var(--clay)", maxWidth: 540, lineHeight: 1.75 }}>
          Amankan unit pilihan Anda dengan DP {fmtM(DP_NOMINAL)}. Proses cepat — tim kami akan memverifikasi pembayaran dalam 1×24 jam.
        </p>
      </div>

      <div style={{ padding: "3rem 5rem 5rem", maxWidth: 860, margin: "0 auto" }}>
        {step < 3 && <StepBar current={step} />}

        {error && (
          <div style={{ background: "rgba(160,64,64,.1)", border: "1px solid rgba(160,64,64,.3)", color: "#A04040", padding: ".75rem 1rem", marginBottom: "1.5rem", fontSize: ".85rem" }}>
            ❌ {error}
          </div>
        )}

        {/* ── STEP 0: Data Diri ── */}
        {step === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <FInput label="Nama Lengkap" value={form.nama_pembeli} onChange={(v) => set("nama_pembeli", v)} placeholder="Budi Santoso" required />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              <FInput label="Nomor HP / WhatsApp" value={form.no_hp} onChange={(v) => set("no_hp", v)} placeholder="08xxxxxxxxxx" type="tel" required />
              <FInput label="Email" value={form.email} onChange={(v) => set("email", v)} placeholder="email@anda.com" type="email" />
            </div>
            <FTextarea label="Alamat Lengkap" value={form.alamat} onChange={(v) => set("alamat", v)} placeholder="Jl. Contoh No. 1, Kota..." required />
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
              <Btn onClick={next} disabled={!canNext[0]}>Lanjut: Pilih Rumah →</Btn>
            </div>
          </div>
        )}

        {/* ── STEP 1: Pilih Rumah (tampilan seperti bioskop) ── */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom: "1.2rem" }}>
              <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.3rem", fontWeight: 400, color: "var(--espresso)", marginBottom: ".4rem" }}>
                Pilih Unit Rumah
              </h3>
              <p style={{ fontSize: ".85rem", color: "var(--light)", marginBottom: "1rem" }}>
                Klik unit yang ingin Anda pesan. Warna menunjukkan ketersediaan unit.
              </p>

              {/* Ringkasan ketersediaan */}
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                {[
                  { label: "Total Unit", val: totalUnits, color: "var(--espresso)" },
                  { label: "Tersedia", val: tersediaCount, color: "#4A7C59" },
                  { label: "Terjual", val: terjualCount, color: "#A04040" },
                ].map(s => (
                  <div key={s.label} style={{ background: "var(--sand)", border: "1px solid var(--mist)", borderRadius: 6, padding: ".6rem 1.2rem", textAlign: "center" }}>
                    <div style={{ fontSize: "1.3rem", fontWeight: 700, color: s.color, fontFamily: "var(--serif)" }}>{s.val}</div>
                    <div style={{ fontSize: ".65rem", color: "var(--light)", textTransform: "uppercase", letterSpacing: ".08em" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <Legend />
            </div>

            {loadingProps ? (
              <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--light)" }}>Memuat denah kavling…</div>
            ) : Object.keys(unitsByBlok).length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--light)" }}>Belum ada unit tersedia saat ini.</div>
            ) : (
              <HouseMap
                unitsByBlok={unitsByBlok}
                selectedUnit={selectedUnit}
                onSelect={pickUnit}
              />
            )}

            {/* Panel info unit yang dipilih */}
            {selectedUnit && (
              <div
                style={{
                  background: "rgba(181,132,74,.08)",
                  border: "2px solid var(--accent)",
                  borderRadius: 8,
                  padding: "1rem 1.4rem",
                  marginBottom: "1.5rem",
                  display: "flex",
                  gap: "1rem",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    flexShrink: 0,
                    borderRadius: 6,
                    background: `url('${selectedUnit.gambar_utama || PLACEHOLDER}') center/cover no-repeat`,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "var(--serif)", fontSize: "1rem", color: "var(--espresso)", marginBottom: ".2rem" }}>
                    ✅ Blok {selectedUnit.blok} — Unit {selectedUnit.nomor_unit}
                  </div>
                  <div style={{ fontSize: ".78rem", color: "var(--light)", marginBottom: ".2rem" }}>
                    {selectedUnit.nama_properti || `${selectedUnit.perumahan} Tipe ${selectedUnit.nomor_tipe}`}
                  </div>
                  <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    {selectedUnit.luas_bangunan_m2 && (
                      <span style={{ fontSize: ".75rem", color: "var(--earth)" }}>🏗 Luas Bangunan: <strong>{selectedUnit.luas_bangunan_m2} m²</strong></span>
                    )}
                    {selectedUnit.harga_jual_juta && (
                      <span style={{ fontSize: ".75rem", color: "var(--accent)", fontFamily: "var(--serif)" }}>
                        {fmtM(parseFloat(selectedUnit.harga_jual_juta) * 1_000_000)}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedUnit(null); setSelectedProp(null); set("property_id", null); set("unit_id", null); }}
                  style={{ background: "none", border: "none", fontSize: "1rem", cursor: "pointer", color: "var(--light)", flexShrink: 0 }}
                  title="Batal pilih"
                >
                  ✕
                </button>
              </div>
            )}

            {!loadingProps && Object.keys(unitsByBlok).length > 0 && !form.property_id && (
              <div style={{ color: "var(--accent)", fontSize: ".82rem", marginBottom: "1rem" }}>
                ⚠️ Pilih salah satu unit di peta di atas untuk melanjutkan.
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Btn variant="ghost" onClick={back}>← Kembali</Btn>
              <Btn onClick={next} disabled={!canNext[1]}>Lanjut: Pembayaran →</Btn>
            </div>
          </div>
        )}

        {/* ── STEP 2: Pembayaran ── */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.8rem" }}>
            {selectedUnit && (
              <div style={{ background: "var(--sand)", padding: "1rem 1.2rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: 6, border: "1px solid var(--mist)" }}>
                <div>
                  <div style={{ fontSize: ".68rem", letterSpacing: ".08em", textTransform: "uppercase", color: "var(--light)" }}>Unit dipilih</div>
                  <div style={{ fontFamily: "var(--serif)", fontSize: "1.05rem", color: "var(--espresso)" }}>
                    Blok {selectedUnit.blok} — Unit {selectedUnit.nomor_unit}
                  </div>
                  <div style={{ fontSize: ".75rem", color: "var(--light)" }}>
                    {selectedUnit.nama_properti || `${selectedUnit.perumahan} Tipe ${selectedUnit.nomor_tipe}`}
                  </div>
                  {selectedUnit.luas_bangunan_m2 && (
                    <div style={{ fontSize: ".73rem", color: "var(--earth)", marginTop: ".2rem" }}>
                      🏗 Luas Bangunan: <strong>{selectedUnit.luas_bangunan_m2} m²</strong>
                    </div>
                  )}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: ".68rem", letterSpacing: ".08em", textTransform: "uppercase", color: "var(--light)" }}>DP yang harus dibayar</div>
                  <div style={{ fontFamily: "var(--serif)", fontSize: "1.3rem", color: "var(--accent)" }}>{fmtM(DP_NOMINAL)}</div>
                </div>
              </div>
            )}

            {/* Pilih metode pembayaran */}
            <div>
              <label style={{ fontSize: ".75rem", fontWeight: 500, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--earth)", display: "block", marginBottom: ".7rem" }}>
                Metode Pembayaran <span style={{ color: "var(--accent)" }}>*</span>
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: ".8rem" }}>
                {[
                  { key: "QRIS", icon: "📱", label: "QRIS" },
                  { key: "Transfer Bank", icon: "🏦", label: "Transfer Bank" },
                  { key: "Virtual Account", icon: "🧾", label: "Virtual Account" },
                ].map((m) => (
                  <button
                    key={m.key}
                    onClick={() => { set("metode_pembayaran", m.key); set("bank", ""); }}
                    style={{
                      padding: "1.1rem .8rem",
                      border: form.metode_pembayaran === m.key ? "2px solid var(--accent)" : "1px solid var(--mist)",
                      background: form.metode_pembayaran === m.key ? "rgba(181,132,74,.06)" : "var(--white)",
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "all .15s",
                    }}
                  >
                    <div style={{ fontSize: "1.6rem", marginBottom: ".4rem" }}>{m.icon}</div>
                    <div style={{ fontSize: ".78rem", fontWeight: 500, color: "var(--text)" }}>{m.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Pilih bank */}
            {(form.metode_pembayaran === "Transfer Bank" || form.metode_pembayaran === "Virtual Account") && (
              <div>
                <label style={{ fontSize: ".75rem", fontWeight: 500, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--earth)", display: "block", marginBottom: ".7rem" }}>
                  Pilih Bank <span style={{ color: "var(--accent)" }}>*</span>
                </label>
                <div style={{ display: "flex", gap: ".8rem" }}>
                  {["BCA", "Mandiri", "BRI"].map((b) => (
                    <button
                      key={b}
                      onClick={() => set("bank", b)}
                      style={{
                        flex: 1, padding: ".8rem",
                        border: form.bank === b ? "2px solid var(--accent)" : "1px solid var(--mist)",
                        background: form.bank === b ? "rgba(181,132,74,.06)" : "var(--white)",
                        cursor: "pointer", fontSize: ".85rem", fontWeight: 500, color: "var(--text)",
                      }}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Info rekening QRIS */}
            {form.metode_pembayaran === "QRIS" && (
              <div style={{ background: "var(--espresso)", padding: "2rem", textAlign: "center" }}>
                <div style={{ width: 220, height: 220, margin: "0 auto 1rem", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 8 }}>
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="QR Code pembayaran" style={{ width: "100%", height: "100%" }} />
                  ) : (
                    <div style={{ fontSize: ".75rem", color: "var(--light)" }}>Membuat QR…</div>
                  )}
                </div>
                <div style={{ color: "var(--sand)", fontSize: ".88rem", marginBottom: ".3rem" }}>Scan QRIS di atas untuk membayar</div>
                <div style={{ fontFamily: "var(--serif)", fontSize: "1.4rem", color: "var(--accent)" }}>{fmtM(DP_NOMINAL)}</div>
                <div style={{ color: "var(--clay)", fontSize: ".75rem", marginTop: ".3rem" }}>a.n. PT Havenest Properti</div>
              </div>
            )}
            {form.metode_pembayaran === "Transfer Bank" && form.bank && (
              <div style={{ background: "var(--espresso)", padding: "1.6rem 2rem" }}>
                <div style={{ color: "var(--clay)", fontSize: ".68rem", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: ".5rem" }}>Transfer ke rekening</div>
                <div style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", color: "var(--sand)", marginBottom: ".2rem" }}>{form.bank} — {BANK_ACCOUNTS[form.bank].norek}</div>
                <div style={{ color: "var(--clay)", fontSize: ".85rem", marginBottom: "1rem" }}>a.n. {BANK_ACCOUNTS[form.bank].nama}</div>
                <div style={{ fontFamily: "var(--serif)", fontSize: "1.4rem", color: "var(--accent)" }}>Nominal: {fmtM(DP_NOMINAL)}</div>
              </div>
            )}
            {form.metode_pembayaran === "Virtual Account" && form.bank && (
              <div style={{ background: "var(--espresso)", padding: "1.6rem 2rem" }}>
                <div style={{ color: "var(--clay)", fontSize: ".68rem", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: ".5rem" }}>Nomor Virtual Account {form.bank}</div>
                <div style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", color: "var(--sand)", letterSpacing: ".05em", marginBottom: "1rem" }}>
                  8808{form.bank === "BCA" ? "01" : form.bank === "Mandiri" ? "02" : "03"}{String(selectedProp?.id || 0).padStart(6, "0")}
                </div>
                <div style={{ fontFamily: "var(--serif)", fontSize: "1.4rem", color: "var(--accent)" }}>Nominal: {fmtM(DP_NOMINAL)}</div>
              </div>
            )}

            {/* Upload bukti transfer */}
            <div>
              <label style={{ fontSize: ".75rem", fontWeight: 500, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--earth)", display: "block", marginBottom: ".5rem" }}>
                Upload Bukti Transfer <span style={{ color: "var(--accent)" }}>*</span>
              </label>
              <label style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: ".7rem",
                border: "1.5px dashed var(--clay)", padding: previewImg ? ".8rem" : "2rem", cursor: "pointer",
                background: "var(--sand)",
              }}>
                {previewImg ? (
                  <img src={previewImg} alt="Preview bukti transfer" style={{ maxHeight: 140, objectFit: "contain" }} />
                ) : (
                  <span style={{ color: "var(--light)", fontSize: ".85rem" }}>📎 Klik untuk pilih foto/screenshot bukti transfer (maks. 3MB)</span>
                )}
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files?.[0])} />
              </label>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Btn variant="ghost" onClick={back}>← Kembali</Btn>
              <Btn onClick={submit} disabled={!canNext[2] || submitting}>
                {submitting ? "Mengirim…" : "Kirim Booking →"}
              </Btn>
            </div>
          </div>
        )}

        {/* ── STEP 3: Selesai ── */}
        {step === 3 && result && (
          <div style={{ textAlign: "center", padding: "2rem 0" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1.5rem" }}>✅</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: "2rem", color: "var(--espresso)", marginBottom: "1rem" }}>
              Booking Berhasil Dibuat!
            </div>
            <div style={{ fontSize: ".9rem", color: "var(--light)", marginBottom: "2rem", lineHeight: 1.7, maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
              Booking Anda untuk{" "}
              <strong>
                Blok {selectedUnit?.blok} — Unit {selectedUnit?.nomor_unit}
              </strong>{" "}
              ({selectedUnit?.nama_properti || "unit pilihan"}) berstatus{" "}
              <span style={{ color: "var(--accent)", fontWeight: 600 }}>Pra-Booking</span> — menunggu verifikasi
              admin atas pembayaran DP {fmtM(DP_NOMINAL)} Anda. Kami akan menghubungi Anda di{" "}
              <strong>{form.no_hp}</strong> dalam 1×24 jam.
            </div>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <Btn variant="ghost" onClick={resetAll}>Booking Unit Lain</Btn>
              <Btn onClick={() => setPage("home")}>Kembali ke Beranda</Btn>
            </div>
          </div>
        )}
      </div>

      <Footer setPage={setPage} />
    </div>
  );
}

export default BookingPage;
