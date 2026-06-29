import { useState } from "react";
import { fmtM, calcKPR } from "../../utils/helpers";

const BADGE_COLOR = {
  Baru: "#B5844A",
  Terlaris: "#2C1F14",
  Promo: "#4A7C59",
  Eksklusif: "#6B4F8C",
};
const PLACEHOLDER =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=85";

function HomeCard({ prop: p, delay, onClick }) {
  const [h, setH] = useState(false);
  const img = p.gambar_utama || (p.gambar && p.gambar[0]?.url) || PLACEHOLDER;
  const harga = parseFloat(p.harga_jual_juta || 0) * 1_000_000;
  return (
    <div
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      onClick={onClick}
      style={{
        border: "1px solid var(--mist)",
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform .3s,box-shadow .3s",
        transform: h ? "translateY(-6px)" : "none",
        boxShadow: h ? "0 20px 60px rgba(44,31,20,.12)" : "none",
        animationDelay: `${delay}s`,
      }}
    >
      <div style={{ overflow: "hidden", position: "relative" }}>
        <div
          style={{
            height: 230,
            background: `url('${img}') center/cover no-repeat`,
            transition: "transform .5s",
            transform: h ? "scale(1.04)" : "scale(1)",
          }}
        />
        {p.badge && (
          <div
            style={{
              position: "absolute",
              top: "1rem",
              left: "1rem",
              background: BADGE_COLOR[p.badge] || "var(--espresso)",
              color: "#fff",
              fontSize: ".62rem",
              letterSpacing: ".1em",
              textTransform: "uppercase",
              padding: ".3rem .7rem",
            }}
          >
            {p.badge}
          </div>
        )}
        <div
          style={{
            position: "absolute",
            bottom: "1rem",
            right: "1rem",
            background: "var(--green)",
            color: "#fff",
            padding: ".35rem .8rem",
          }}
        >
          <div
            style={{
              fontSize: ".58rem",
              letterSpacing: ".08em",
              textTransform: "uppercase",
              opacity: 0.8,
            }}
          >
            DP
          </div>
          <div
            style={{
              fontFamily: "var(--serif)",
              fontSize: ".9rem",
              fontWeight: 500,
            }}
          >
            {fmtM(calcKPR(harga * 0.8, 10.5, 20))}
          </div>
        </div>
      </div>
      <div style={{ padding: "1.4rem" }}>
        <div
          style={{
            fontFamily: "var(--serif)",
            fontSize: "1.55rem",
            fontWeight: 500,
            color: "var(--espresso)",
            marginBottom: ".2rem",
          }}
        >
          {fmtM(harga)}
        </div>
        <div
          style={{
            fontSize: ".88rem",
            fontWeight: 500,
            color: "var(--text)",
            marginBottom: ".15rem",
          }}
        >
          {p.nama_properti || `${p.perumahan} Tipe ${p.nomor_tipe}`}
        </div>
        <div
          style={{
            fontSize: ".75rem",
            color: "var(--light)",
            marginBottom: "1rem",
          }}
        >
          📍 {p.lokasi}
        </div>
        <div
          style={{
            display: "flex",
            gap: "1.2rem",
            paddingTop: "1rem",
            borderTop: "1px solid var(--mist)",
          }}
        >
          {[
            ["🛏", `${p.kamar_tidur} KT`],
            ["🚿", `${p.kamar_mandi} KM`],
            ["📐", `${parseFloat(p.luas_tanah_m2 || 0).toFixed(0)}m²`],
          ].map(([ic, v]) => (
            <span
              key={v}
              style={{
                fontSize: ".75rem",
                color: "var(--light)",
                display: "flex",
                alignItems: "center",
                gap: ".25rem",
              }}
            >
              {ic} {v}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HomeCard;
