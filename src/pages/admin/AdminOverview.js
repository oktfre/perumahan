import React from "react";
import { useApp } from "../../context/AppContext";
import { formatRupiah, formatDateTime } from "../../utils/helpers";
import StatusBadge from "../../components/shared/StatusBadge";

export default function AdminOverview({ onMenuChange }) {
  const { properties, bookings, getPendingBookings } = useApp();

  const stats = {
    total: properties.length,
    available: properties.filter(p => p.status === "available").length,
    preBooking: properties.filter(p => p.status === "pre-booking").length,
    sold: properties.filter(p => p.status === "sold").length,
    pendingBookings: getPendingBookings().length,
    totalBookings: bookings.length,
  };

  const recentBookings = [...bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  return (
    <div className="admin-overview">
      <div className="stats-grid">
        {[
          { label: "Total Properti", val: stats.total, icon: "🏠", color: "#1a6b3a", bg: "#dcfce7" },
          { label: "Tersedia", val: stats.available, icon: "✅", color: "#16a34a", bg: "#dcfce7" },
          { label: "Pre-Booking", val: stats.preBooking, icon: "⏳", color: "#d97706", bg: "#fef3c7" },
          { label: "Terjual", val: stats.sold, icon: "🔴", color: "#dc2626", bg: "#fee2e2" },
          { label: "Booking Pending", val: stats.pendingBookings, icon: "📋", color: "#7c3aed", bg: "#ede9fe" },
          { label: "Total Booking", val: stats.totalBookings, icon: "📊", color: "#0891b2", bg: "#cffafe" },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ borderTop: `4px solid ${s.color}` }}>
            <div className="stat-card-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div className="stat-card-val">{s.val}</div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="admin-section">
        <h3>Aksi Cepat</h3>
        <div className="quick-actions">
          <button className="quick-action" onClick={() => onMenuChange("properties")}>
            <span>➕</span> Tambah Properti
          </button>
          <button className="quick-action highlight" onClick={() => onMenuChange("bookings")}>
            <span>📋</span> Lihat Booking {stats.pendingBookings > 0 && <span className="qa-badge">{stats.pendingBookings}</span>}
          </button>
          <button className="quick-action" onClick={() => onMenuChange("site-config")}>
            <span>🎨</span> Edit Tampilan
          </button>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="admin-section">
        <div className="section-row">
          <h3>Booking Terbaru</h3>
          <button className="link-btn" onClick={() => onMenuChange("bookings")}>Lihat Semua →</button>
        </div>
        {recentBookings.length === 0 ? (
          <div className="empty-table">Belum ada booking.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Pembeli</th>
                  <th>Properti</th>
                  <th>DP</th>
                  <th>Status</th>
                  <th>Waktu</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map(b => {
                  const prop = properties.find(p => p.id === b.propertyId);
                  return (
                    <tr key={b.id}>
                      <td><strong>{b.buyerName}</strong><br /><small>{b.buyerPhone}</small></td>
                      <td>{prop?.name || "-"}</td>
                      <td>{formatRupiah(b.dpAmount)}</td>
                      <td><StatusBadge status={b.status} /></td>
                      <td><small>{formatDateTime(b.createdAt)}</small></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
