import { useState } from "react";
import { fmtM, calcKPR } from "../../utils/helpers";

const BADGE_COLOR = { Baru:"#B5844A", Terlaris:"#2C1F14", Promo:"#4A7C59", Eksklusif:"#6B4F8C" };
const PLACEHOLDER = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=85";
const price = p => parseFloat(p.harga_jual_juta||0)*1_000_000;
const cicilan = p => fmtM(calcKPR(price(p)*0.8, 10.5, 20));

export function ListingCard({ prop:p, delay, onClick }) {
  const [h,setH]=useState(false);
  const img = p.gambar_utama || (p.gambar&&p.gambar[0]?.url) || PLACEHOLDER;
  return (
    <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} onClick={onClick}
      style={{ border:"1px solid var(--mist)", overflow:"hidden", cursor:"pointer", background:"var(--white)",
        transition:"transform .3s,box-shadow .3s", transform:h?"translateY(-5px)":"none",
        boxShadow:h?"0 18px 55px rgba(44,31,20,.11)":"none",
        animation:"fadeUp .45s ease both", animationDelay:`${delay}s` }}>
      <div style={{ overflow:"hidden", position:"relative" }}>
        <div style={{ height:220, background:`url('${img}') center/cover no-repeat`, transition:"transform .5s", transform:h?"scale(1.05)":"scale(1)" }} />
        {p.badge && <div style={{ position:"absolute", top:"1rem", left:"1rem", background:BADGE_COLOR[p.badge]||"var(--espresso)", color:"#fff", fontSize:".62rem", letterSpacing:".1em", textTransform:"uppercase", padding:".3rem .7rem" }}>{p.badge}</div>}
        <div style={{ position:"absolute", top:"1rem", right:"1rem", background:"var(--white)", color:"var(--earth)", fontSize:".62rem", letterSpacing:".1em", textTransform:"uppercase", padding:".3rem .7rem" }}>{p.tipe_properti||"Rumah Tapak"}</div>
      </div>
      <div style={{ padding:"1.4rem" }}>
        <div style={{ fontFamily:"var(--serif)", fontSize:"1.55rem", fontWeight:500, color:"var(--espresso)", marginBottom:".2rem" }}>{fmtM(price(p))}</div>
        <div style={{ fontSize:".88rem", fontWeight:500, color:"var(--text)", marginBottom:".15rem" }}>{p.nama_properti||`${p.perumahan} Tipe ${p.nomor_tipe}`}</div>
        <div style={{ fontSize:".75rem", color:"var(--light)", marginBottom:"1rem" }}>📍 {p.lokasi}</div>
        <div style={{ display:"flex", gap:"1rem", paddingTop:"1rem", borderTop:"1px solid var(--mist)", flexWrap:"wrap" }}>
          {[["🛏",`${p.kamar_tidur} KT`],["🚿",`${p.kamar_mandi} KM`],["📐",`${parseFloat(p.luas_tanah_m2||0).toFixed(0)}m²`],["🏗",`${p.luas_bangunan_m2||36} m²`]].map(([ic,v])=>(
            <span key={v} style={{ fontSize:".74rem", color:"var(--light)", display:"flex", alignItems:"center", gap:".22rem" }}>{ic} {v}</span>
          ))}
        </div>
        <div style={{ marginTop:".9rem", padding:".6rem .8rem", background:"var(--sand)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:".68rem", color:"var(--light)", letterSpacing:".08em", textTransform:"uppercase" }}>Cicilan mulai</span>
          <span style={{ fontFamily:"var(--serif)", fontSize:"1rem", color:"var(--green)", fontWeight:500 }}>{cicilan(p)}/bln</span>
        </div>
        <div style={{ marginTop:".5rem", padding:".4rem .8rem", background: p.status==="tersedia"?"rgba(74,124,89,.08)":"rgba(160,64,64,.08)", display:"flex", justifyContent:"center" }}>
          <span style={{ fontSize:".65rem", letterSpacing:".1em", textTransform:"uppercase", color:p.status==="tersedia"?"var(--green)":"var(--red)" }}>
            {p.status==="tersedia"?`● ${p.unit_tersedia} unit tersedia`:"● Sold Out"}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ListingRow({ prop:p, delay, onClick }) {
  const [h,setH]=useState(false);
  const img = p.gambar_utama || (p.gambar&&p.gambar[0]?.url) || PLACEHOLDER;
  return (
    <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} onClick={onClick}
      style={{ background:"var(--white)", border:`1px solid ${h?"var(--clay)":"var(--mist)"}`, display:"flex", overflow:"hidden", cursor:"pointer",
        transition:"box-shadow .25s,border-color .25s", boxShadow:h?"0 6px 28px rgba(44,31,20,.08)":"none",
        animation:"fadeUp .45s ease both", animationDelay:`${delay}s` }}>
      <div style={{ width:220, flexShrink:0, overflow:"hidden", position:"relative" }}>
        <div style={{ height:"100%", minHeight:140, background:`url('${img}') center/cover no-repeat`, transition:"transform .4s", transform:h?"scale(1.05)":"scale(1)" }} />
        {p.badge && <div style={{ position:"absolute", top:".7rem", left:".7rem", background:BADGE_COLOR[p.badge], color:"#fff", fontSize:".6rem", letterSpacing:".1em", textTransform:"uppercase", padding:".25rem .6rem" }}>{p.badge}</div>}
      </div>
      <div style={{ flex:1, padding:"1.3rem 1.8rem", display:"flex", flexDirection:"column", justifyContent:"center" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:"1rem" }}>
          <div>
            <div style={{ fontFamily:"var(--serif)", fontSize:"1.5rem", fontWeight:500, color:"var(--espresso)" }}>{fmtM(price(p))}</div>
            <div style={{ fontSize:".9rem", fontWeight:500, color:"var(--text)" }}>{p.nama_properti||`${p.perumahan} Tipe ${p.nomor_tipe}`}</div>
            <div style={{ fontSize:".75rem", color:"var(--light)", marginTop:".15rem" }}>📍 {p.lokasi} · {p.tipe_properti||"Rumah Tapak"}</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:".62rem", color:"var(--light)", textTransform:"uppercase", letterSpacing:".08em" }}>Cicilan mulai</div>
            <div style={{ fontFamily:"var(--serif)", fontSize:"1.1rem", color:"var(--green)", fontWeight:500 }}>{cicilan(p)}<span style={{ fontSize:".7rem", color:"var(--light)", fontFamily:"var(--sans)" }}>/bln</span></div>
            <div style={{ marginTop:".3rem", fontSize:".65rem", color:p.status==="tersedia"?"var(--green)":"var(--red)", letterSpacing:".08em", textTransform:"uppercase" }}>
              {p.status==="tersedia"?`${p.unit_tersedia} unit tersedia`:"Sold Out"}
            </div>
          </div>
        </div>
        <div style={{ display:"flex", gap:"1.5rem", marginTop:".9rem", flexWrap:"wrap" }}>
          {[["🛏",`${p.kamar_tidur} KT`],["🚿",`${p.kamar_mandi} KM`],["📐",`${parseFloat(p.luas_tanah_m2||0).toFixed(0)} m²`],["🏗",`${p.luas_bangunan_m2||36} m² Bangunan`],["🏢",`${p.jumlah_lantai||2} Lantai`]].map(([ic,v])=>(
            <span key={v} style={{ fontSize:".76rem", color:"var(--light)", display:"flex", alignItems:"center", gap:".28rem" }}>{ic} {v}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
