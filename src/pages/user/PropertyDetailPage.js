import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { formatRupiah, formatDate } from "../../utils/helpers";
import StatusBadge from "../../components/shared/StatusBadge";

export default function PropertyDetailPage({ propertyId, onNavigate }) {
  const { getPropertyById, siteConfig } = useApp();
  const property = getPropertyById(propertyId);
  const [activeImg, setActiveImg] = useState(0);

  if (!property) {
    return (
      <div className="section-container" style={{ textAlign: "center", padding: "80px 20px" }}>
        <div style={{ fontSize: 64 }}>🏠</div>
        <h2>Properti Tidak Ditemukan</h2>
        <button className="btn btn-primary" onClick={() => onNavigate("properties")}>Kembali</button>
      </div>
    );
  }

  const imgs = property.images?.length > 0 ? property.images : ["https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80"];
  const minDP = Math.round(property.price * (siteConfig.dpMinPercent / 100));

  return (
    <div className="page-detail">
      {/* Back */}
      <div className="detail-back">
        <div className="section-container">
          <button className="btn-back" onClick={() => onNavigate("properties")}>
            ← Kembali ke Daftar Properti
          </button>
        </div>
      </div>

      <div className="section-container">
        <div className="detail-layout">
          {/* Left: Images + Info */}
          <div className="detail-left">
            {/* Image Gallery */}
            <div className="gallery">
              <img src={imgs[activeImg]} alt={property.name} className="gallery-main" />
              {imgs.length > 1 && (
                <div className="gallery-thumbs">
                  {imgs.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt=""
                      className={`gallery-thumb ${activeImg === i ? "active" : ""}`}
                      onClick={() => setActiveImg(i)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Title + Status */}
            <div className="detail-header">
              <div className="detail-meta">
                <span className="detail-type">{property.type}</span>
                <StatusBadge status={property.status} />
              </div>
              <h1 className="detail-title">{property.name}</h1>
              <p className="detail-location">📍 {property.address}</p>
            </div>

            {/* Specs */}
            <div className="detail-specs-grid">
              {[
                property.bedrooms > 0 && { icon: "🛏", label: "Kamar Tidur", val: `${property.bedrooms} Kamar` },
                property.bathrooms > 0 && { icon: "🚿", label: "Kamar Mandi", val: `${property.bathrooms} Kamar` },
                property.landArea > 0 && { icon: "📐", label: "Luas Tanah", val: `${property.landArea} m²` },
                property.buildingArea > 0 && { icon: "🏗", label: "Luas Bangunan", val: `${property.buildingArea} m²` },
              ].filter(Boolean).map((s, i) => (
                <div key={i} className="spec-item">
                  <span className="spec-icon">{s.icon}</span>
                  <div>
                    <div className="spec-label">{s.label}</div>
                    <div className="spec-val">{s.val}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="detail-section">
              <h3>Deskripsi Properti</h3>
              <p>{property.description}</p>
            </div>

            {/* Facilities */}
            {property.facilities?.length > 0 && (
              <div className="detail-section">
                <h3>Fasilitas</h3>
                <div className="facilities-grid">
                  {property.facilities.map((f, i) => (
                    <div key={i} className="facility-item">✅ {f}</div>
                  ))}
                </div>
              </div>
            )}

            <div className="detail-section">
              <p className="detail-date">Ditambahkan: {formatDate(property.createdAt)}</p>
            </div>
          </div>

          {/* Right: Price + Booking */}
          <div className="detail-right">
            <div className="price-card">
              <div className="price-label">Harga Properti</div>
              <div className="price-value">{formatRupiah(property.price)}</div>
              <div className="price-dp">
                Min. DP ({siteConfig.dpMinPercent}%): <strong>{formatRupiah(minDP)}</strong>
              </div>
              <div className="price-status">
                Status: <StatusBadge status={property.status} />
              </div>

              {property.status === "available" ? (
                <button
                  className="btn btn-primary btn-block"
                  onClick={() => onNavigate("booking", property.id)}
                  style={{ marginTop: 16 }}
                >
                  🏷️ Booking Sekarang
                </button>
              ) : property.status === "pre-booking" ? (
                <div className="booking-notice warning">
                  <strong>⏳ Sedang Dalam Proses Booking</strong>
                  <p>Properti ini sedang dalam verifikasi transaksi oleh admin.</p>
                </div>
              ) : (
                <div className="booking-notice sold">
                  <strong>🔴 Properti Telah Terjual</strong>
                  <p>Maaf, properti ini sudah tidak tersedia.</p>
                </div>
              )}

              <div className="contact-box">
                <h4>💬 Butuh Bantuan?</h4>
                <p>Hubungi agen kami untuk info lebih lanjut</p>
                <a
                  href={`https://wa.me/${siteConfig.whatsappNumber}?text=Halo, saya tertarik dengan properti ${property.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp"
                >
                  WhatsApp Sekarang
                </a>
                <div className="contact-info">
                  <div>📞 {siteConfig.contactPhone}</div>
                  <div>✉️ {siteConfig.contactEmail}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
