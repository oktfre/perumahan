import React from "react";
import { useApp } from "../../context/AppContext";

const MENU = [
  { key: "overview", icon: "📊", label: "Dashboard" },
  { key: "properties", icon: "🏠", label: "Properti" },
  { key: "bookings", icon: "📋", label: "Booking" },
  { key: "site-config", icon: "🎨", label: "Tampilan Website" },
];

export default function AdminSidebar({ activeMenu, onMenuChange, onLogout, onNavigate }) {
  const { getPendingBookings, siteConfig } = useApp();
  const pending = getPendingBookings().length;

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-brand">
        <button className="brand-btn" onClick={() => onNavigate("home")}>
          🏠 {siteConfig.siteName}
        </button>
        <span className="sidebar-role">Admin Panel</span>
      </div>

      <nav className="sidebar-nav">
        {MENU.map(m => (
          <button
            key={m.key}
            className={`sidebar-item ${activeMenu === m.key ? "active" : ""}`}
            onClick={() => onMenuChange(m.key)}
          >
            <span className="sidebar-icon">{m.icon}</span>
            <span className="sidebar-label">{m.label}</span>
            {m.key === "bookings" && pending > 0 && (
              <span className="sidebar-badge">{pending}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-item" onClick={() => onNavigate("home")}>
          <span className="sidebar-icon">🌐</span>
          <span className="sidebar-label">Lihat Website</span>
        </button>
        <button className="sidebar-item danger" onClick={onLogout}>
          <span className="sidebar-icon">🚪</span>
          <span className="sidebar-label">Keluar</span>
        </button>
      </div>
    </aside>
  );
}
