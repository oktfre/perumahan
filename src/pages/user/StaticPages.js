import React from "react";
import { useApp } from "../../context/AppContext";

export function AboutPage({ onNavigate }) {
  const { siteConfig } = useApp();
  return (
    <div className="page-about">
      <div className="page-hero-small" style={{ background: "linear-gradient(135deg, #1a6b3a 0%, #0d3d22 100%)" }}>
        <h1>Tentang Kami</h1>
        <p>Kenali lebih jauh tentang {siteConfig.siteName}</p>
      </div>
      <div className="section-container">
        <div className="about-layout">
          <div className="about-text">
            <div className="section-label">SIAPA KAMI</div>
            <h2>{siteConfig.aboutTitle}</h2>
            <p>{siteConfig.aboutText}</p>
            <button className="btn btn-primary" style={{marginTop:16}} onClick={() => onNavigate("contact")}>Hubungi Kami</button>
          </div>
          <div className="about-img-wrap">
            <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80" alt="About" className="about-img" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ContactPage() {
  const { siteConfig } = useApp();
  return (
    <div className="page-contact">
      <div className="page-hero-small" style={{ background: "linear-gradient(135deg, #1a6b3a 0%, #0d3d22 100%)" }}>
        <h1>Hubungi Kami</h1>
        <p>Kami siap membantu Anda menemukan properti impian</p>
      </div>
      <div className="section-container">
        <div className="contact-grid">
          {[
            { icon: "📞", title: "Telepon", val: siteConfig.contactPhone, sub: "Senin-Sabtu, 08:00-17:00" },
            { icon: "✉️", title: "Email", val: siteConfig.contactEmail, sub: "Balasan dalam 24 jam" },
            { icon: "📍", title: "Alamat", val: siteConfig.contactAddress, sub: "Kunjungi kantor kami" },
          ].map((c, i) => (
            <div key={i} className="contact-card">
              <div className="contact-card-icon">{c.icon}</div>
              <h3>{c.title}</h3>
              <p className="contact-val">{c.val}</p>
              <p className="contact-sub">{c.sub}</p>
            </div>
          ))}
        </div>
        <div className="contact-wa">
          <h3>💬 Chat via WhatsApp</h3>
          <p>Cara tercepat untuk mendapat bantuan langsung dari tim kami</p>
          <a
            href={`https://wa.me/${siteConfig.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp"
            style={{ display: "inline-block", marginTop: 16 }}
          >
            Buka WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
