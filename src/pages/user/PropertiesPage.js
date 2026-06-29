import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import PropertyCard from "../../components/shared/PropertyCard";

const TYPES = ["Semua", "Rumah", "Villa", "Apartemen", "Kavling", "Ruko"];
const STATUSES = ["Semua", "available", "pre-booking", "sold"];
const STATUS_LABELS = { "Semua": "Semua Status", available: "Tersedia", "pre-booking": "Pre-Booking", sold: "Terjual" };

export default function PropertiesPage({ onNavigate }) {
  const { properties } = useApp();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("Semua");
  const [status, setStatus] = useState("Semua");
  const [sort, setSort] = useState("newest");

  const filtered = properties
    .filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.location.toLowerCase().includes(search.toLowerCase());
      const matchType = type === "Semua" || p.type === type;
      const matchStatus = status === "Semua" || p.status === status;
      return matchSearch && matchType && matchStatus;
    })
    .sort((a, b) => {
      if (sort === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      return 0;
    });

  return (
    <div className="page-properties">
      <div className="page-hero-small" style={{ background: "linear-gradient(135deg, #1a6b3a 0%, #0d3d22 100%)" }}>
        <h1>Daftar Properti</h1>
        <p>Temukan properti yang sesuai dengan kebutuhan dan impian Anda</p>
      </div>

      <div className="section-container">
        {/* Filter bar */}
        <div className="filter-bar">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              placeholder="Cari nama atau lokasi properti..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-selects">
            <select className="filter-select" value={type} onChange={e => setType(e.target.value)}>
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <select className="filter-select" value={status} onChange={e => setStatus(e.target.value)}>
              {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
            <select className="filter-select" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="newest">Terbaru</option>
              <option value="price-asc">Harga Terendah</option>
              <option value="price-desc">Harga Tertinggi</option>
            </select>
          </div>
        </div>

        <div className="results-info">
          Menampilkan <strong>{filtered.length}</strong> dari {properties.length} properti
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏠</div>
            <h3>Properti Tidak Ditemukan</h3>
            <p>Coba ubah filter pencarian Anda</p>
            <button className="btn btn-outline-green" onClick={() => { setSearch(""); setType("Semua"); setStatus("Semua"); }}>
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="property-grid">
            {filtered.map(p => (
              <PropertyCard key={p.id} property={p} onView={id => onNavigate("property-detail", id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
