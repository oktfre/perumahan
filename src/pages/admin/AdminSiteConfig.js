import React, { useState } from "react";
import { useApp } from "../../context/AppContext";

const SECTIONS = [
  { key: "general", label: "⚙️ Umum", icon: "⚙️" },
  { key: "hero", label: "🖼️ Hero / Banner", icon: "🖼️" },
  { key: "about", label: "📖 Tentang Kami", icon: "📖" },
  { key: "contact", label: "📞 Kontak", icon: "📞" },
  { key: "payment", label: "💳 Pembayaran", icon: "💳" },
  { key: "style", label: "🎨 Warna & Tema", icon: "🎨" },
];

export default function AdminSiteConfig() {
  const { siteConfig, updateSiteConfig } = useApp();
  const [activeSection, setActiveSection] = useState("general");
  const [form, setForm] = useState({ ...siteConfig });
  const [saved, setSaved] = useState(false);
  const [preview, setPreview] = useState(false);

  const handleChange = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }));
    setSaved(false);
  };

  const handleSave = () => {
    updateSiteConfig(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    if (!window.confirm("Reset semua pengaturan ke nilai awal?")) return;
    setForm({ ...siteConfig });
  };

  const F = ({ label, field, type = "text", placeholder, rows, hint }) => (
    <div className="form-group">
      <label className="config-label">{label}</label>
      {hint && <p className="form-hint">{hint}</p>}
      {rows ? (
        <textarea className="form-input" rows={rows} value={form[field] || ""}
          placeholder={placeholder} onChange={e => handleChange(field, e.target.value)} />
      ) : (
        <input type={type} className="form-input" value={form[field] || ""}
          placeholder={placeholder} onChange={e => handleChange(field, e.target.value)} />
      )}
    </div>
  );

  return (
    <div className="admin-site-config">
      {/* Saved toast */}
      {saved && (
        <div className="save-toast">✅ Perubahan berhasil disimpan! Tampilan website telah diperbarui.</div>
      )}

      <div className="config-layout">
        {/* Sidebar sections */}
        <div className="config-sidebar">
          <p className="config-sidebar-title">Bagian Website</p>
          {SECTIONS.map(s => (
            <button
              key={s.key}
              className={`config-nav-item ${activeSection === s.key ? "active" : ""}`}
              onClick={() => setActiveSection(s.key)}
            >
              <span>{s.icon}</span>
              <span>{s.label.replace(/.*\s/, "")}</span>
            </button>
          ))}
          <div style={{ marginTop: 16 }}>
            <button className="btn btn-ghost btn-block btn-sm" onClick={() => setPreview(p => !p)}>
              {preview ? "📝 Sembunyikan Preview" : "👁️ Tampilkan Preview"}
            </button>
          </div>
        </div>

        {/* Config form */}
        <div className="config-form-wrap">
          {/* GENERAL */}
          {activeSection === "general" && (
            <div className="config-section">
              <h3>⚙️ Pengaturan Umum</h3>
              <p className="config-desc">Pengaturan dasar nama dan identitas website</p>
              <F label="Nama Website / Brand" field="siteName" placeholder="RumahKu"
                hint="Nama ini akan muncul di navbar, footer, dan seluruh halaman" />
              <F label="Tagline" field="tagline" placeholder="Temukan Rumah Impian Anda"
                hint="Kalimat singkat yang mencerminkan bisnis Anda" />
              <F label="Teks Footer" field="footerText" placeholder="© 2025 RumahKu"
                hint="Teks hak cipta yang tampil di bagian bawah halaman" />
              <F label="No. WhatsApp (format: 628xxx)" field="whatsappNumber"
                hint="Digunakan untuk tombol WhatsApp di halaman properti" />
            </div>
          )}

          {/* HERO */}
          {activeSection === "hero" && (
            <div className="config-section">
              <h3>🖼️ Hero / Banner Utama</h3>
              <p className="config-desc">Konten yang tampil di bagian atas halaman beranda</p>
              <F label="Judul Hero (besar)" field="heroTitle"
                placeholder="Hunian Terbaik untuk Keluarga Anda"
                hint="Judul utama yang paling menonjol di beranda" />
              <F label="Sub-judul Hero" field="heroSubtitle"
                placeholder="Kami menyediakan pilihan properti terbaik..."
                rows={2}
                hint="Kalimat pendukung di bawah judul utama" />
              <F label="Teks Tombol Hero" field="heroButtonText"
                placeholder="Lihat Properti"
                hint="Teks pada tombol utama di hero section" />
              <div className="config-preview-box">
                <p className="preview-label">Preview Hero:</p>
                <div className="hero-preview" style={{ background: form.primaryColor || "#1a6b3a" }}>
                  <h2>{form.heroTitle || "Judul Hero"}</h2>
                  <p>{form.heroSubtitle || "Sub-judul hero..."}</p>
                  <button style={{ background: "#fff", color: form.primaryColor || "#1a6b3a", border: "none", borderRadius: 8, padding: "8px 18px", fontWeight: 700, cursor: "pointer" }}>
                    {form.heroButtonText || "Lihat Properti"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ABOUT */}
          {activeSection === "about" && (
            <div className="config-section">
              <h3>📖 Halaman Tentang Kami</h3>
              <p className="config-desc">Konten di section "Tentang Kami" pada beranda dan halaman About</p>
              <F label="Judul Tentang Kami" field="aboutTitle"
                placeholder="Tentang Kami"
                hint="Judul section tentang kami" />
              <F label="Teks Tentang Kami" field="aboutText"
                placeholder="Deskripsikan bisnis Anda..."
                rows={5}
                hint="Paragraf yang menjelaskan tentang perusahaan Anda" />
            </div>
          )}

          {/* CONTACT */}
          {activeSection === "contact" && (
            <div className="config-section">
              <h3>📞 Informasi Kontak</h3>
              <p className="config-desc">Informasi kontak yang ditampilkan di seluruh website</p>
              <F label="Nomor Telepon" field="contactPhone" placeholder="0812-3456-7890" />
              <F label="Alamat Email" field="contactEmail" placeholder="info@rumahku.id" />
              <F label="Alamat Kantor" field="contactAddress" placeholder="Jl. Properti No. 1, Jakarta" />
            </div>
          )}

          {/* PAYMENT */}
          {activeSection === "payment" && (
            <div className="config-section">
              <h3>💳 Pengaturan Pembayaran</h3>
              <p className="config-desc">Informasi rekening bank dan ketentuan DP untuk proses booking</p>
              <F label="Nama Bank" field="bankName" placeholder="Bank BCA"
                hint="Nama bank tujuan transfer DP" />
              <F label="Nomor Rekening" field="bankAccount" placeholder="1234567890"
                hint="No. rekening yang ditampilkan ke pembeli" />
              <F label="Nama Pemilik Rekening" field="bankOwner" placeholder="PT RumahKu Indonesia"
                hint="Nama sesuai rekening bank" />
              <div className="form-group">
                <label className="config-label">Persentase DP Minimum (%)</label>
                <p className="form-hint">Persentase minimum uang muka dari harga properti</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <input type="range" min={5} max={50} step={5}
                    value={form.dpMinPercent || 10}
                    onChange={e => handleChange("dpMinPercent", parseInt(e.target.value))}
                    style={{ flex: 1 }} />
                  <span className="dp-percent-display">{form.dpMinPercent || 10}%</span>
                </div>
              </div>
              <div className="config-preview-box">
                <p className="preview-label">Preview Info Rekening:</p>
                <div className="bank-info-box" style={{ margin: 0 }}>
                  <h4>💳 Informasi Rekening</h4>
                  <div className="bank-row"><span>Bank</span><strong>{form.bankName}</strong></div>
                  <div className="bank-row"><span>No. Rekening</span><strong className="bank-acc">{form.bankAccount}</strong></div>
                  <div className="bank-row"><span>Atas Nama</span><strong>{form.bankOwner}</strong></div>
                  <div className="bank-min-dp">Min. DP: <strong>{form.dpMinPercent}%</strong> dari harga properti</div>
                </div>
              </div>
            </div>
          )}

          {/* STYLE */}
          {activeSection === "style" && (
            <div className="config-section">
              <h3>🎨 Warna & Tema Website</h3>
              <p className="config-desc">Sesuaikan warna utama yang digunakan di seluruh tampilan website</p>
              <div className="color-grid">
                <div className="form-group">
                  <label className="config-label">Warna Utama (Primary)</label>
                  <p className="form-hint">Digunakan untuk tombol, navbar, dan elemen utama</p>
                  <div className="color-input-wrap">
                    <input type="color" className="color-picker" value={form.primaryColor || "#1a6b3a"}
                      onChange={e => handleChange("primaryColor", e.target.value)} />
                    <input type="text" className="form-input color-hex" value={form.primaryColor || "#1a6b3a"}
                      onChange={e => handleChange("primaryColor", e.target.value)} placeholder="#1a6b3a" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="config-label">Warna Aksen (Accent)</label>
                  <p className="form-hint">Digunakan untuk latar bagian tertentu dan highlight</p>
                  <div className="color-input-wrap">
                    <input type="color" className="color-picker" value={form.accentColor || "#e8f5e9"}
                      onChange={e => handleChange("accentColor", e.target.value)} />
                    <input type="text" className="form-input color-hex" value={form.accentColor || "#e8f5e9"}
                      onChange={e => handleChange("accentColor", e.target.value)} placeholder="#e8f5e9" />
                  </div>
                </div>
              </div>

              {/* Color presets */}
              <div className="form-group">
                <label className="config-label">Tema Warna Preset</label>
                <div className="color-presets">
                  {[
                    { name: "Hijau Alam", primary: "#1a6b3a", accent: "#e8f5e9" },
                    { name: "Biru Laut", primary: "#1e40af", accent: "#dbeafe" },
                    { name: "Merah Elegan", primary: "#9f1239", accent: "#ffe4e6" },
                    { name: "Ungu Royal", primary: "#5b21b6", accent: "#ede9fe" },
                    { name: "Oranye Cerah", primary: "#b45309", accent: "#fef3c7" },
                    { name: "Abu Premium", primary: "#374151", accent: "#f3f4f6" },
                  ].map((c, i) => (
                    <button
                      key={i}
                      className="color-preset-btn"
                      onClick={() => { handleChange("primaryColor", c.primary); handleChange("accentColor", c.accent); }}
                      title={c.name}
                    >
                      <div style={{ background: c.primary, width: 28, height: 28, borderRadius: "50%", border: "2px solid #fff", boxShadow: "0 0 0 1px #ccc" }} />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Live preview */}
              <div className="config-preview-box">
                <p className="preview-label">Preview Warna:</p>
                <div className="color-preview-bar">
                  <div style={{ background: form.primaryColor || "#1a6b3a", color: "#fff", padding: "10px 20px", borderRadius: 8, fontWeight: 700 }}>
                    Warna Utama — Tombol & Navbar
                  </div>
                  <div style={{ background: form.accentColor || "#e8f5e9", color: "#333", padding: "10px 20px", borderRadius: 8, border: "1px solid #e0e0e0" }}>
                    Warna Aksen — Latar Section
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save buttons */}
          <div className="config-actions">
            <button className="btn btn-ghost" onClick={handleReset}>↩️ Reset</button>
            <button className="btn btn-primary" onClick={handleSave}>
              💾 Simpan Perubahan
            </button>
          </div>
        </div>

        {/* Live preview panel */}
        {preview && (
          <div className="config-preview-panel">
            <p className="preview-label" style={{ marginBottom: 12 }}>🖥️ Preview Website</p>
            <div className="site-mini-preview">
              {/* Mini Navbar */}
              <div className="mini-nav" style={{ background: form.primaryColor || "#1a6b3a" }}>
                <span style={{ color: "#fff", fontWeight: 700 }}>🏠 {form.siteName || "RumahKu"}</span>
                <div style={{ display: "flex", gap: 8 }}>
                  {["Beranda", "Properti", "Kontak"].map(l => (
                    <span key={l} style={{ color: "rgba(255,255,255,0.8)", fontSize: 11 }}>{l}</span>
                  ))}
                </div>
              </div>
              {/* Mini Hero */}
              <div className="mini-hero" style={{ background: `linear-gradient(135deg, ${form.primaryColor || "#1a6b3a"} 0%, #0d3d22 100%)` }}>
                <div style={{ color: "#fff" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{form.heroTitle || "Judul Hero"}</div>
                  <div style={{ fontSize: 10, opacity: 0.85, marginBottom: 8 }}>{(form.heroSubtitle || "").slice(0, 60)}...</div>
                  <div style={{ background: "#fff", color: form.primaryColor, display: "inline-block", padding: "3px 10px", borderRadius: 4, fontSize: 10, fontWeight: 700 }}>
                    {form.heroButtonText || "Lihat Properti"}
                  </div>
                </div>
              </div>
              {/* Mini section */}
              <div className="mini-section" style={{ background: form.accentColor || "#e8f5e9", padding: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4 }}>{form.aboutTitle || "Tentang Kami"}</div>
                <div style={{ fontSize: 10, color: "#555" }}>{(form.aboutText || "").slice(0, 80)}...</div>
              </div>
              {/* Mini footer */}
              <div className="mini-footer" style={{ background: "#111", color: "#aaa", padding: "6px 10px", fontSize: 10 }}>
                {form.footerText || "© 2025 RumahKu"}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
