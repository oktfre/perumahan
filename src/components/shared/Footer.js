import React from "react";
import { useApp } from "../../context/AppContext";

export default function Footer({ onNavigate }) {
  const { siteConfig } = useApp();
  return (
    <footer className="footer" style={{ background: "#111" }}>
      <div className="footer-container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">🏠 {siteConfig.siteName}</div>
            <p className="footer-tagline">{siteConfig.tagline}</p>
            <p className="footer-text">{siteConfig.aboutText?.slice(0, 120)}...</p>
          </div>
          <div>
            <h4 className="footer-heading">Navigasi</h4>
            <div className="footer-links">
              {[["Beranda","home"],["Properti","properties"],["Tentang Kami","about"],["Kontak","contact"]].map(([l,k]) => (
                <button key={k} className="footer-link" onClick={() => onNavigate(k)}>{l}</button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="footer-heading">Kontak</h4>
            <div className="footer-contacts">
              <p>📞 {siteConfig.contactPhone}</p>
              <p>✉️ {siteConfig.contactEmail}</p>
              <p>📍 {siteConfig.contactAddress}</p>
            </div>
          </div>
          <div>
            <h4 className="footer-heading">Rekening Pembayaran</h4>
            <div className="footer-bank">
              <p>{siteConfig.bankName}</p>
              <p className="bank-num">{siteConfig.bankAccount}</p>
              <p>{siteConfig.bankOwner}</p>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>{siteConfig.footerText}</p>
          <p style={{ fontSize: 12, color: "#555", marginTop: 4 }}>Platform Properti Terpercaya Indonesia</p>
        </div>
      </div>
    </footer>
  );
}
