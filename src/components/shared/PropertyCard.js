import React from "react";
import { formatRupiah, statusLabel } from "../../utils/helpers";

export default function PropertyCard({ property, onView, compact }) {
  const st = statusLabel(property.status);
  const img = property.images?.[0] || "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80";

  return (
    <div className={`property-card ${compact ? "compact" : ""}`}>
      <div className="card-image-wrap">
        <img src={img} alt={property.name} className="card-image" />
        <span className="card-badge" style={{ background: st.bg, color: st.color }}>
          {st.label}
        </span>
        {property.featured && <span className="card-featured">⭐ Unggulan</span>}
        <span className="card-type">{property.type}</span>
      </div>
      <div className="card-body">
        <h3 className="card-title">{property.name}</h3>
        <p className="card-location">📍 {property.location}</p>
        <div className="card-specs">
          {property.bedrooms > 0 && <span>🛏 {property.bedrooms} KT</span>}
          {property.bathrooms > 0 && <span>🚿 {property.bathrooms} KM</span>}
          {property.landArea > 0 && <span>📐 {property.landArea} m²</span>}
          {property.buildingArea > 0 && <span>🏗 {property.buildingArea} m²</span>}
        </div>
        <div className="card-footer">
          <div className="card-price">{formatRupiah(property.price)}</div>
          <button className="btn btn-primary btn-sm" onClick={() => onView(property.id)}>
            Lihat Detail
          </button>
        </div>
      </div>
    </div>
  );
}
