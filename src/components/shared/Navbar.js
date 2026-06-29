import React, { useState } from "react";
import { useApp } from "../../context/AppContext";

export default function Navbar({ onNavigate, currentPage }) {
  const { siteConfig, currentUser, logout } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { key: "home", label: "Beranda" },
    { key: "properties", label: "Properti" },
    { key: "about", label: "Tentang" },
    { key: "contact", label: "Kontak" },
  ];

  const handleLogout = () => {
    logout();
    onNavigate("home");
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <button className="nav-brand" onClick={() => onNavigate("home")}>
          <span className="brand-icon">🏠</span>
          <span className="brand-name">{siteConfig.siteName}</span>
        </button>

        {/* Desktop links */}
        <div className="nav-links desktop-only">
          {navLinks.map(l => (
            <button
              key={l.key}
              className={`nav-link ${currentPage === l.key ? "active" : ""}`}
              onClick={() => onNavigate(l.key)}
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="nav-actions desktop-only">
          {currentUser ? (
            <div className="user-menu">
              <span className="user-greeting">Halo, {currentUser.name.split(" ")[0]}</span>
              {currentUser.role === "admin" && (
                <button className="btn btn-outline" onClick={() => onNavigate("admin")}>
                  Dashboard Admin
                </button>
              )}
              <button className="btn btn-ghost" onClick={handleLogout}>Keluar</button>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={() => onNavigate("login")}>
              Masuk
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="hamburger mobile-only" onClick={() => setMenuOpen(m => !m)}>
          <span></span><span></span><span></span>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu">
          {navLinks.map(l => (
            <button key={l.key} className="mobile-link" onClick={() => { onNavigate(l.key); setMenuOpen(false); }}>
              {l.label}
            </button>
          ))}
          <div className="mobile-divider" />
          {currentUser ? (
            <>
              <span className="mobile-user">👤 {currentUser.name}</span>
              {currentUser.role === "admin" && (
                <button className="mobile-link" onClick={() => { onNavigate("admin"); setMenuOpen(false); }}>
                  Dashboard Admin
                </button>
              )}
              <button className="mobile-link danger" onClick={() => { handleLogout(); setMenuOpen(false); }}>
                Keluar
              </button>
            </>
          ) : (
            <button className="mobile-link highlight" onClick={() => { onNavigate("login"); setMenuOpen(false); }}>
              Masuk
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
