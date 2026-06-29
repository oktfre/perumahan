import React from "react";
import { useApp } from "../../context/AppContext";
import PropertyCard from "../../components/shared/PropertyCard";

export default function HomePage({ onNavigate }) {
  const { siteConfig, properties } = useApp();
  const featured = properties.filter(p => p.featured && p.status !== "sold").slice(0, 3);

  return (
    <div className="page-home">
      {/* Hero */}
      <section className="hero" style={{ background: `linear-gradient(135deg, ${siteConfig.primaryColor} 0%, #0d3d22 100%)` }}>
        <div className="hero-content">
          <div className="hero-badge">🏆 Platform Properti Terpercaya</div>
          <h1 className="hero-title">{siteConfig.heroTitle}</h1>
          <p className="hero-sub">{siteConfig.heroSubtitle}</p>
          <div className="hero-actions">
            <button className="btn btn-hero-primary" onClick={() => onNavigate("properties")}>
              {siteConfig.heroButtonText}
            </button>
            <button className="btn btn-hero-outline" onClick={() => onNavigate("contact")}>
              Hubungi Kami
            </button>
          </div>
          <div className="hero-stats">
            <div className="stat"><strong>{properties.length}+</strong><span>Properti</span></div>
            <div className="stat-div" />
            <div className="stat"><strong>{properties.filter(p=>p.status==="sold").length}+</strong><span>Terjual</span></div>
            <div className="stat-div" />
            <div className="stat"><strong>5⭐</strong><span>Rating</span></div>
          </div>
        </div>
        <div className="hero-visual">
          <img
            src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=700&q=80"
            alt="Properti"
            className="hero-img"
          />
          <div className="hero-card-float">
            <div className="float-icon">✅</div>
            <div>
              <strong>Transaksi Aman</strong>
              <p>Terverifikasi & Terpercaya</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="section">
        <div className="section-container">
          <div className="section-header">
            <div className="section-label">PROPERTI PILIHAN</div>
            <h2 className="section-title">Hunian Unggulan Kami</h2>
            <p className="section-sub">Pilihan properti terbaik yang telah dikurasi oleh tim ahli kami</p>
          </div>
          <div className="property-grid">
            {featured.length === 0 ? (
              <p className="empty-text">Belum ada properti unggulan.</p>
            ) : featured.map(p => (
              <PropertyCard key={p.id} property={p} onView={id => onNavigate("property-detail", id)} />
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <button className="btn btn-outline-green" onClick={() => onNavigate("properties")}>
              Lihat Semua Properti →
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section section-alt">
        <div className="section-container">
          <div className="section-header">
            <div className="section-label">KEUNGGULAN KAMI</div>
            <h2 className="section-title">Mengapa Pilih {siteConfig.siteName}?</h2>
          </div>
          <div className="features-grid">
            {[
              { icon: "🔒", title: "Transaksi Aman", desc: "Setiap transaksi dijamin keamanannya dengan sistem verifikasi berlapis" },
              { icon: "📋", title: "Proses Mudah", desc: "Booking cukup dari genggaman tangan Anda, tanpa ribet dan berbelit" },
              { icon: "👨‍💼", title: "Tim Profesional", desc: "Tim agen berpengalaman siap membantu Anda menemukan hunian ideal" },
              { icon: "💰", title: "Harga Terbaik", desc: "Garansi harga terbaik dengan pilihan cicilan yang fleksibel" },
            ].map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Book */}
      <section className="section">
        <div className="section-container">
          <div className="section-header">
            <div className="section-label">CARA BOOKING</div>
            <h2 className="section-title">Cara Booking Properti</h2>
          </div>
          <div className="steps-row">
            {[
              { num: "01", title: "Pilih Properti", desc: "Temukan properti impian Anda dari koleksi kami" },
              { num: "02", title: "Isi Data Booking", desc: "Lengkapi data diri dan informasi booking Anda" },
              { num: "03", title: "Upload Bukti DP", desc: "Upload bukti transfer uang muka (DP) Anda" },
              { num: "04", title: "Menunggu Konfirmasi", desc: "Admin kami akan memverifikasi pembayaran Anda" },
              { num: "05", title: "Status Diperbarui", desc: "Properti resmi tercatat atas nama Anda" },
            ].map((s, i) => (
              <div key={i} className="step-item">
                <div className="step-num">{s.num}</div>
                <div className="step-line" style={{ display: i === 4 ? "none" : "" }} />
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="section section-alt" id="about">
        <div className="section-container about-layout">
          <div className="about-text">
            <div className="section-label">TENTANG KAMI</div>
            <h2 className="section-title">{siteConfig.aboutTitle}</h2>
            <p>{siteConfig.aboutText}</p>
            <button className="btn btn-primary" style={{marginTop:16}} onClick={() => onNavigate("contact")}>
              Hubungi Kami
            </button>
          </div>
          <div className="about-img-wrap">
            <img
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80"
              alt="About"
              className="about-img"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section" style={{ background: siteConfig.primaryColor }}>
        <div className="section-container" style={{ textAlign: "center" }}>
          <h2 style={{ color: "#fff", fontSize: 28, marginBottom: 12 }}>
            Siap Menemukan Rumah Impian Anda?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.85)", marginBottom: 28 }}>
            Hubungi kami sekarang dan dapatkan konsultasi gratis dari tim ahli kami
          </p>
          <button className="btn btn-hero-primary" onClick={() => onNavigate("properties")}>
            Mulai Cari Properti
          </button>
        </div>
      </section>
    </div>
  );
}
