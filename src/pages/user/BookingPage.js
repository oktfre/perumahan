import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { formatRupiah, fileToDataURL } from "../../utils/helpers";

export default function BookingPage({ propertyId, onNavigate }) {
  const { getPropertyById, siteConfig, createBooking, currentUser } = useApp();
  const property = getPropertyById(propertyId);

  const [step, setStep] = useState(1); // 1=form, 2=upload DP, 3=sukses
  const [form, setForm] = useState({
    buyerName: currentUser?.name || "",
    buyerPhone: "",
    buyerEmail: currentUser?.email || "",
    buyerAddress: "",
    buyerKTP: "",
    notes: "",
  });
  const [dpAmount, setDpAmount] = useState("");
  const [dpFile, setDpFile] = useState(null);
  const [dpPreview, setDpPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

  if (!property) return <div className="section-container" style={{padding:"60px 20px",textAlign:"center"}}><h2>Properti tidak ditemukan</h2></div>;
  if (property.status !== "available") {
    return (
      <div className="section-container" style={{ padding: "60px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 64 }}>⚠️</div>
        <h2>Properti Tidak Tersedia untuk Booking</h2>
        <p>Properti ini sedang dalam proses booking atau sudah terjual.</p>
        <button className="btn btn-primary" onClick={() => onNavigate("property-detail", property.id)}>
          Kembali ke Detail
        </button>
      </div>
    );
  }

  const minDP = Math.round(property.price * (siteConfig.dpMinPercent / 100));

  const validateStep1 = () => {
    const e = {};
    if (!form.buyerName.trim()) e.buyerName = "Nama wajib diisi";
    if (!form.buyerPhone.trim()) e.buyerPhone = "No. HP wajib diisi";
    if (!form.buyerEmail.trim()) e.buyerEmail = "Email wajib diisi";
    if (!form.buyerAddress.trim()) e.buyerAddress = "Alamat wajib diisi";
    if (!form.buyerKTP.trim()) e.buyerKTP = "No. KTP wajib diisi";
    if (form.buyerKTP && form.buyerKTP.length !== 16) e.buyerKTP = "No. KTP harus 16 digit";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    const dp = parseInt(dpAmount.replace(/\D/g, ""));
    if (!dpAmount) e.dpAmount = "Jumlah DP wajib diisi";
    else if (dp < minDP) e.dpAmount = `DP minimal ${formatRupiah(minDP)}`;
    if (!dpFile) e.dpFile = "Bukti transfer wajib diupload";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setErrors(prev => ({ ...prev, dpFile: "Ukuran file maksimal 5MB" })); return; }
    const dataUrl = await fileToDataURL(file);
    setDpFile(file);
    setDpPreview(dataUrl);
    setErrors(prev => ({ ...prev, dpFile: null }));
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    setSubmitting(true);
    // Simulate upload delay
    await new Promise(r => setTimeout(r, 800));
    const dp = parseInt(dpAmount.replace(/\D/g, ""));
    const result = createBooking({
      propertyId: property.id,
      ...form,
      dpAmount: dp,
      dpProofUrl: dpPreview,
      dpProofFileName: dpFile.name,
    });
    setBookingResult(result);
    setStep(3);
    setSubmitting(false);
  };

  const handleFormChange = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const formatDPInput = (val) => {
    const num = val.replace(/\D/g, "");
    setDpAmount(num ? parseInt(num).toLocaleString("id-ID") : "");
  };

  // ── STEP 3: SUKSES ──────────────────────────────────────────
  if (step === 3) {
    return (
      <div className="booking-success">
        <div className="success-card">
          <div className="success-icon">✅</div>
          <h2>Booking Berhasil Diajukan!</h2>
          <p>Pengajuan booking Anda telah kami terima. Admin akan memverifikasi bukti pembayaran DP Anda dalam 1×24 jam kerja.</p>

          <div className="success-detail">
            <div className="success-row"><span>ID Booking</span><strong>{bookingResult?.id}</strong></div>
            <div className="success-row"><span>Properti</span><strong>{property.name}</strong></div>
            <div className="success-row"><span>Nama Pembeli</span><strong>{form.buyerName}</strong></div>
            <div className="success-row"><span>Jumlah DP</span><strong>{formatRupiah(parseInt(dpAmount.replace(/\D/g, "")))}</strong></div>
            <div className="success-row"><span>Status</span><strong style={{ color: "#d97706" }}>⏳ Menunggu Verifikasi</strong></div>
          </div>

          <div className="success-note">
            <strong>📌 Yang perlu Anda lakukan selanjutnya:</strong>
            <ul>
              <li>Tunggu konfirmasi dari admin melalui WhatsApp atau email</li>
              <li>Jika DP sudah terverifikasi, status properti akan berubah menjadi "Terjual"</li>
              <li>Jika ada pertanyaan, hubungi kami di {siteConfig.contactPhone}</li>
            </ul>
          </div>

          <div className="success-actions">
            <button className="btn btn-primary" onClick={() => onNavigate("properties")}>
              Lihat Properti Lain
            </button>
            <button className="btn btn-outline-green" onClick={() => onNavigate("home")}>
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-booking">
      <div className="page-hero-small" style={{ background: "linear-gradient(135deg, #1a6b3a 0%, #0d3d22 100%)" }}>
        <h1>Form Booking Properti</h1>
        <p>Lengkapi data di bawah untuk mengajukan booking</p>
      </div>

      <div className="section-container">
        <div className="booking-layout">
          {/* Left: Form */}
          <div className="booking-form-wrap">
            {/* Step indicator */}
            <div className="step-indicator">
              <div className={`step-dot ${step >= 1 ? "active" : ""}`}>
                <span>1</span>
                <label>Data Diri</label>
              </div>
              <div className="step-line-h" />
              <div className={`step-dot ${step >= 2 ? "active" : ""}`}>
                <span>2</span>
                <label>Bukti DP</label>
              </div>
            </div>

            {/* STEP 1: Data Pembeli */}
            {step === 1 && (
              <div className="booking-form">
                <h3>Data Pembeli</h3>
                <p className="form-subtitle">Isi data diri Anda dengan lengkap dan benar</p>

                <div className="form-group">
                  <label>Nama Lengkap *</label>
                  <input
                    className={`form-input ${errors.buyerName ? "error" : ""}`}
                    value={form.buyerName}
                    onChange={e => handleFormChange("buyerName", e.target.value)}
                    placeholder="Sesuai KTP"
                  />
                  {errors.buyerName && <span className="error-msg">{errors.buyerName}</span>}
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>No. HP / WhatsApp *</label>
                    <input
                      className={`form-input ${errors.buyerPhone ? "error" : ""}`}
                      value={form.buyerPhone}
                      onChange={e => handleFormChange("buyerPhone", e.target.value)}
                      placeholder="08xxxxxxxxxx"
                    />
                    {errors.buyerPhone && <span className="error-msg">{errors.buyerPhone}</span>}
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      className={`form-input ${errors.buyerEmail ? "error" : ""}`}
                      value={form.buyerEmail}
                      onChange={e => handleFormChange("buyerEmail", e.target.value)}
                      placeholder="email@contoh.com"
                    />
                    {errors.buyerEmail && <span className="error-msg">{errors.buyerEmail}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label>No. KTP *</label>
                  <input
                    className={`form-input ${errors.buyerKTP ? "error" : ""}`}
                    value={form.buyerKTP}
                    onChange={e => handleFormChange("buyerKTP", e.target.value.replace(/\D/g, "").slice(0, 16))}
                    placeholder="16 digit No. KTP"
                    maxLength={16}
                  />
                  {errors.buyerKTP && <span className="error-msg">{errors.buyerKTP}</span>}
                </div>

                <div className="form-group">
                  <label>Alamat Lengkap *</label>
                  <textarea
                    className={`form-input ${errors.buyerAddress ? "error" : ""}`}
                    value={form.buyerAddress}
                    onChange={e => handleFormChange("buyerAddress", e.target.value)}
                    placeholder="Alamat tempat tinggal Anda saat ini"
                    rows={3}
                  />
                  {errors.buyerAddress && <span className="error-msg">{errors.buyerAddress}</span>}
                </div>

                <div className="form-group">
                  <label>Catatan Tambahan (opsional)</label>
                  <textarea
                    className="form-input"
                    value={form.notes}
                    onChange={e => handleFormChange("notes", e.target.value)}
                    placeholder="Pertanyaan atau informasi tambahan..."
                    rows={2}
                  />
                </div>

                <button className="btn btn-primary btn-block" onClick={() => validateStep1() && setStep(2)}>
                  Lanjut ke Pembayaran DP →
                </button>
              </div>
            )}

            {/* STEP 2: Upload Bukti DP */}
            {step === 2 && (
              <div className="booking-form">
                <button className="btn-back-small" onClick={() => setStep(1)}>← Kembali</button>
                <h3>Pembayaran Uang Muka (DP)</h3>
                <p className="form-subtitle">Transfer DP ke rekening kami, lalu upload bukti transfernya</p>

                <div className="bank-info-box">
                  <h4>💳 Informasi Rekening</h4>
                  <div className="bank-row"><span>Bank</span><strong>{siteConfig.bankName}</strong></div>
                  <div className="bank-row"><span>No. Rekening</span><strong className="bank-acc">{siteConfig.bankAccount}</strong></div>
                  <div className="bank-row"><span>Atas Nama</span><strong>{siteConfig.bankOwner}</strong></div>
                  <div className="bank-min-dp">Min. DP: <strong>{formatRupiah(minDP)}</strong> ({siteConfig.dpMinPercent}% dari harga)</div>
                </div>

                <div className="form-group">
                  <label>Jumlah DP yang Ditransfer (Rp) *</label>
                  <input
                    className={`form-input ${errors.dpAmount ? "error" : ""}`}
                    value={dpAmount}
                    onChange={e => formatDPInput(e.target.value)}
                    placeholder="Masukan jumlah DP"
                  />
                  {errors.dpAmount && <span className="error-msg">{errors.dpAmount}</span>}
                </div>

                <div className="form-group">
                  <label>Upload Bukti Transfer *</label>
                  <div className={`upload-zone ${errors.dpFile ? "error" : ""}`}>
                    {dpPreview ? (
                      <div className="upload-preview">
                        <img src={dpPreview} alt="Bukti transfer" />
                        <button className="upload-remove" onClick={() => { setDpFile(null); setDpPreview(null); }}>✕ Hapus</button>
                        <p className="upload-filename">{dpFile?.name}</p>
                      </div>
                    ) : (
                      <label className="upload-label" htmlFor="dp-file">
                        <div className="upload-icon">📤</div>
                        <strong>Klik atau seret file di sini</strong>
                        <p>PNG, JPG, PDF (maks. 5MB)</p>
                        <span className="upload-btn">Pilih File</span>
                      </label>
                    )}
                    <input
                      id="dp-file"
                      type="file"
                      accept="image/*,.pdf"
                      className="upload-input-hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                  {errors.dpFile && <span className="error-msg">{errors.dpFile}</span>}
                </div>

                <div className="terms-note">
                  <strong>⚠️ Perhatian:</strong> Pastikan bukti transfer yang Anda upload jelas terbaca.
                  Admin akan memverifikasi dalam 1×24 jam kerja.
                </div>

                <button
                  className="btn btn-primary btn-block"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? "⏳ Memproses..." : "✅ Ajukan Booking"}
                </button>
              </div>
            )}
          </div>

          {/* Right: Property Summary */}
          <div className="booking-summary">
            <div className="summary-card">
              <img
                src={property.images?.[0] || "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80"}
                alt={property.name}
                className="summary-img"
              />
              <div className="summary-body">
                <h4>{property.name}</h4>
                <p className="summary-location">📍 {property.location}</p>
                <div className="summary-specs">
                  {property.bedrooms > 0 && <span>🛏 {property.bedrooms} KT</span>}
                  {property.bathrooms > 0 && <span>🚿 {property.bathrooms} KM</span>}
                  {property.landArea > 0 && <span>📐 {property.landArea}m²</span>}
                </div>
                <div className="summary-divider" />
                <div className="summary-price-row">
                  <span>Harga</span>
                  <strong>{formatRupiah(property.price)}</strong>
                </div>
                <div className="summary-price-row highlight">
                  <span>Min. DP ({siteConfig.dpMinPercent}%)</span>
                  <strong>{formatRupiah(minDP)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
