import { useState, useEffect } from "react";
import { propertyApi } from "../../utils/api";
import { fmtM, calcKPR } from "../../utils/helpers";
import { useCms } from "../../context/CmsContext";
import Btn from "../atoms/Btn";
import Footer from "../Footer";
import KPRModal from "../kpr/KPRModal";

const PLACEHOLDER = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=85";
const BADGE_COLOR  = { Baru:"#B5844A", Terlaris:"#2C1F14", Promo:"#4A7C59", Eksklusif:"#6B4F8C" };

function DetailPage({ prop: propStatic, setPage, goBooking }) {
  const { content } = useCms();
  const cfg = content.detail;
  const [prop,     setProp]     = useState(propStatic);
  const [loading,  setLoading]  = useState(false);
  const [activeImg,setActiveImg]= useState(0);
  const [tab,      setTab]      = useState("deskripsi");
  const [showKPR,  setShowKPR]  = useState(false);

  // Kalau prop punya id, fetch data terbaru dari API
  useEffect(() => {
    if (!propStatic?.id) return;
    setLoading(true);
    propertyApi.getById(propStatic.id)
      .then(res => { if (res.data) setProp(normalizeFromApi(res.data)); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [propStatic?.id]);

  // Normalise API response ke format yang dipakai komponen
  function normalizeFromApi(d) {
    const gambar = (d.gambar || []).map(g => g.url).filter(Boolean);
    return {
      id:         d.id,
      name:       d.nama_properti || `${d.perumahan} Tipe ${d.nomor_tipe}`,
      location:   d.lokasi,
      price:      parseFloat(d.harga_jual_juta||0) * 1_000_000,
      badge:      d.badge,
      type:       d.tipe_properti || 'Rumah Tapak',
      status:     d.status === 'tersedia' ? 'Dijual' : 'Habis',
      beds:       d.kamar_tidur,
      baths:      d.kamar_mandi,
      area:       parseFloat(d.luas_tanah_m2||0),
      luas_bangunan: d.luas_bangunan_m2 || 36,
      floor:      d.jumlah_lantai || 2,
      year:       new Date().getFullYear(),
      desc:       d.deskripsi || '',
      facilities: Array.isArray(d.fasilitas) ? d.fasilitas : [],
      lat:        d.lat, lng: d.lng,
      img:        d.gambar_utama || gambar[0] || PLACEHOLDER,
      imgs:       gambar.length ? gambar : [PLACEHOLDER],
      gambarData: d.gambar || [],   // data lengkap (dengan caption)
    };
  }

  const imgs     = prop.imgs?.length ? prop.imgs : [prop.img || PLACEHOLDER];
  const gambarData = prop.gambarData || [];
  const hargaRp  = prop.price || parseFloat(prop.harga_jual_juta||0)*1_000_000;
  const kprProp  = { ...prop, price: hargaRp, name: prop.name };

  if (loading) {
    return (
      <div style={{ minHeight:"100vh", paddingTop:80, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ fontFamily:"var(--serif)", fontSize:"1.5rem", color:"var(--clay)", animation:"pulse 1.5s ease-in-out infinite" }}>Memuat detail properti…</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:"var(--white)", paddingTop:80 }} className="page-enter">

      {/* Breadcrumb */}
      <div style={{ padding:"1rem 4rem", borderBottom:"1px solid var(--mist)", display:"flex", alignItems:"center", gap:".6rem", fontSize:".78rem", color:"var(--light)", background:"var(--white)" }}>
        <button onClick={()=>setPage("home")} style={{ background:"none", border:"none", color:"var(--accent)", cursor:"pointer", fontFamily:"var(--sans)", fontSize:".78rem" }}>{cfg.breadcrumb_home}</button>
        <span>/</span>
        <button onClick={()=>{setPage("listing");window.scrollTo(0,0);}} style={{ background:"none", border:"none", color:"var(--accent)", cursor:"pointer", fontFamily:"var(--sans)", fontSize:".78rem" }}>{cfg.breadcrumb_listing}</button>
        <span>/</span>
        <span style={{ color:"var(--text)" }}>{prop.name}</span>
      </div>

      <div style={{ padding:"2.5rem 4rem" }}>

        {/* Judul + Harga */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"2rem", flexWrap:"wrap", gap:"1.5rem" }}>
          <div>
            <div style={{ display:"flex", gap:".6rem", marginBottom:".7rem", flexWrap:"wrap" }}>
              {prop.badge && <span style={{ background:BADGE_COLOR[prop.badge]||"var(--espresso)", color:"#fff", fontSize:".62rem", letterSpacing:".1em", textTransform:"uppercase", padding:".3rem .75rem" }}>{prop.badge}</span>}
              <span style={{ background:"var(--mist)", color:"var(--earth)", fontSize:".62rem", letterSpacing:".1em", textTransform:"uppercase", padding:".3rem .75rem" }}>{prop.type}</span>
              <span style={{ background:"rgba(74,124,89,.12)", color:"var(--green)", fontSize:".62rem", letterSpacing:".1em", textTransform:"uppercase", padding:".3rem .75rem", border:"1px solid rgba(74,124,89,.25)" }}>
                ● {prop.status || 'Dijual'}
              </span>
            </div>
            <h1 style={{ fontFamily:"var(--serif)", fontSize:"clamp(2rem,3.5vw,3rem)", fontWeight:300, color:"var(--espresso)", marginBottom:".4rem" }}>{prop.name}</h1>
            <div style={{ fontSize:".85rem", color:"var(--light)" }}>📍 {prop.location}</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontFamily:"var(--serif)", fontSize:"clamp(2.2rem,3.5vw,3rem)", fontWeight:500, color:"var(--espresso)", lineHeight:1 }}>{fmtM(hargaRp)}</div>
            <div style={{ fontSize:".72rem", color:"var(--light)", marginBottom:"1.2rem", marginTop:".3rem" }}>Harga jual</div>
            <div style={{ display:"flex", gap:".8rem", flexWrap:"wrap", justifyContent:"flex-end" }}>
              <Btn variant="ghost">{cfg.cta_hubungi}</Btn>
              <Btn variant="accent" onClick={()=>goBooking?.(prop)}>{cfg.cta_booking}</Btn>
              <Btn variant="kpr" onClick={()=>setShowKPR(true)}>{cfg.cta_kpr}</Btn>
            </div>
          </div>
        </div>

        {/* Galeri */}
        <div style={{ display:"grid", gridTemplateColumns:"3fr 1fr", gap:"1rem", marginBottom:"2rem" }}>
          <div style={{ overflow:"hidden", position:"relative" }}>
            <div style={{ height:450, background:`url('${imgs[activeImg]||PLACEHOLDER}') center/cover no-repeat`, transition:"opacity .35s" }} />
            {/* Caption */}
            {gambarData[activeImg]?.caption && (
              <div style={{ position:"absolute", bottom:0, left:0, right:0, background:"rgba(44,31,20,.7)", color:"var(--sand)", padding:".6rem 1rem", fontSize:".78rem", letterSpacing:".04em" }}>
                {gambarData[activeImg].caption}
              </div>
            )}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:"1rem", maxHeight:450, overflowY:"auto" }}>
            {imgs.map((img,i)=>(
              <div key={i} onClick={()=>setActiveImg(i)}
                style={{ flexShrink:0, position:"relative", cursor:"pointer" }}>
                <div style={{ height:130, background:`url('${img}') center/cover no-repeat`, border:`3px solid ${activeImg===i?"var(--accent)":"transparent"}`, transition:"border .2s,transform .2s", transform:activeImg===i?"scale(.97)":"scale(1)" }} />
                {gambarData[i]?.caption && (
                  <div style={{ position:"absolute", bottom:0, left:0, right:0, background:"rgba(44,31,20,.6)", color:"var(--sand)", padding:".25rem .5rem", fontSize:".65rem" }}>
                    {gambarData[i].caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Spesifikasi */}
        <div style={{ display:"flex", background:"var(--mist)", marginBottom:"2.5rem", flexWrap:"wrap" }}>
          {[["🛏","Kamar Tidur",prop.beds],["🚿","Kamar Mandi",prop.baths],["📐","Luas Tanah",`${prop.area} m²`],["🏗","Luas Bangunan",`${prop.luas_bangunan||36} m²`],["🏢","Lantai",prop.floor],["📅","Tahun",prop.year]].map(([ic,lbl,val])=>(
            <div key={lbl} style={{ flex:1, minWidth:100, padding:"1.3rem 1rem", borderRight:"1px solid var(--clay)", textAlign:"center" }}>
              <div style={{ fontSize:"1.4rem", marginBottom:".4rem" }}>{ic}</div>
              <div style={{ fontFamily:"var(--serif)", fontSize:"1.3rem", fontWeight:500, color:"var(--espresso)" }}>{val}</div>
              <div style={{ fontSize:".65rem", letterSpacing:".1em", textTransform:"uppercase", color:"var(--light)", marginTop:".15rem" }}>{lbl}</div>
            </div>
          ))}
        </div>

        {/* Tab + Sidebar */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:"3.5rem" }}>
          <div>
            {/* Tab nav */}
            <div style={{ display:"flex", borderBottom:"2px solid var(--mist)", marginBottom:"1.8rem" }}>
              {["deskripsi","fasilitas","lokasi"].map(t=>(
                <button key={t} onClick={()=>setTab(t)}
                  style={{ padding:".8rem 1.6rem", background:"none", border:"none", marginBottom:-2, borderBottom:tab===t?"2px solid var(--accent)":"2px solid transparent", fontFamily:"var(--sans)", fontSize:".78rem", fontWeight:500, letterSpacing:".08em", textTransform:"capitalize", color:tab===t?"var(--accent)":"var(--light)", cursor:"pointer", transition:"color .2s" }}>
                  {t.charAt(0).toUpperCase()+t.slice(1)}
                </button>
              ))}
            </div>

            {tab==="deskripsi"&&(
              <div style={{ animation:"fadeIn .3s ease" }}>
                <p style={{ fontSize:".92rem", lineHeight:1.85, color:"var(--text)", marginBottom:"1.8rem" }}>{prop.desc||"Deskripsi properti belum tersedia."}</p>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:".9rem" }}>
                  {[["Tipe Properti",prop.type],["Status",prop.status],["Luas Tanah",`${prop.area} m²`],["Luas Bangunan",`${prop.luas_bangunan||36} m²`],["Kamar Tidur",prop.beds],["Kamar Mandi",prop.baths]].map(([k,v])=>(
                    <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:".75rem 1rem", background:"var(--sand)", fontSize:".83rem" }}>
                      <span style={{ color:"var(--light)" }}>{k}</span>
                      <span style={{ fontWeight:500, color:"var(--espresso)" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab==="fasilitas"&&(
              <div style={{ animation:"fadeIn .3s ease", display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(175px,1fr))", gap:".8rem" }}>
                {(prop.facilities||[]).length===0
                  ? <div style={{ color:"var(--light)", gridColumn:"1/-1" }}>Informasi fasilitas belum tersedia.</div>
                  : (prop.facilities||[]).map(f=>(
                    <div key={f} style={{ display:"flex", alignItems:"center", gap:".7rem", padding:".9rem 1.1rem", background:"var(--sand)", fontSize:".84rem", color:"var(--text)" }}>
                      <span style={{ color:"var(--green)", fontWeight:700, fontSize:"1rem" }}>✓</span> {f}
                    </div>
                  ))
                }
              </div>
            )}

            {tab==="lokasi"&&(
              <div style={{ animation:"fadeIn .3s ease" }}>
                <div style={{ height:300, background:"linear-gradient(135deg,#e8e0d4,#d4cbbf)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
                  <div style={{ position:"absolute", inset:0, opacity:.12, backgroundImage:"repeating-linear-gradient(0deg,#8C6F5A 0,#8C6F5A 1px,transparent 1px,transparent 38px),repeating-linear-gradient(90deg,#8C6F5A 0,#8C6F5A 1px,transparent 1px,transparent 38px)" }} />
                  <div style={{ fontSize:"2.5rem", marginBottom:".6rem" }}>📍</div>
                  <div style={{ fontFamily:"var(--serif)", fontSize:"1.3rem", color:"var(--espresso)", marginBottom:".3rem" }}>{prop.location}</div>
                  {prop.lat&&prop.lng&&<div style={{ fontSize:".78rem", color:"var(--light)", marginBottom:"1.2rem" }}>Koordinat: {prop.lat}°, {prop.lng}°</div>}
                  {prop.lat&&prop.lng&&(
                    <a href={`https://maps.google.com/?q=${prop.lat},${prop.lng}`} target="_blank" rel="noreferrer"
                      style={{ padding:".65rem 1.6rem", background:"var(--espresso)", color:"var(--sand)", textDecoration:"none", fontSize:".78rem", letterSpacing:".08em", textTransform:"uppercase" }}>
                      Buka di Google Maps →
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Agen */}
          <div style={{ alignSelf:"start", display:"flex", flexDirection:"column", gap:"1rem" }}>
            <div style={{ background:"var(--sand)", padding:"1.8rem", border:"1px solid var(--mist)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"1rem", marginBottom:"1.4rem", paddingBottom:"1.4rem", borderBottom:"1px solid var(--mist)" }}>
                <div style={{ width:50, height:50, borderRadius:"50%", background:"var(--earth)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--serif)", fontSize:"1.4rem", color:"#fff", flexShrink:0 }}>A</div>
                <div>
                  <div style={{ fontSize:".9rem", fontWeight:600, color:"var(--espresso)" }}>{cfg.agent_name}</div>
                  <div style={{ fontSize:".74rem", color:"var(--light)" }}>{cfg.agent_title}</div>
                  <div style={{ fontSize:".7rem", color:"var(--accent)", marginTop:".1rem" }}>{cfg.agent_rating}</div>
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:".8rem" }}>
                <Btn variant="accent" full onClick={()=>goBooking?.(prop)} style={{ padding:".9rem" }}>{cfg.cta_booking}</Btn>
                <Btn full style={{ padding:".9rem" }} onClick={()=>window.open(`https://wa.me/${cfg.agent_whatsapp}`,"_blank")}>{cfg.cta_whatsapp}</Btn>
                <Btn variant="kpr" full onClick={()=>setShowKPR(true)} style={{ padding:".9rem" }}>{cfg.cta_kpr}</Btn>
              </div>
            </div>

            {/* KPR Teaser */}
            <div style={{ background:"var(--espresso)", padding:"1.5rem", border:"1px solid rgba(200,180,154,.15)" }}>
              <div style={{ fontSize:".65rem", letterSpacing:".12em", textTransform:"uppercase", color:"var(--clay)", marginBottom:".5rem" }}>{cfg.kpr_teaser_label}</div>
              <div style={{ fontFamily:"var(--serif)", fontSize:"2rem", color:"var(--accent)", fontWeight:500 }}>
                {fmtM(calcKPR(hargaRp*.8,10.5,20))}
                <span style={{ fontFamily:"var(--sans)", fontSize:".75rem", color:"var(--clay)" }}>/bln</span>
              </div>
              <div style={{ fontSize:".72rem", color:"var(--clay)", marginBottom:"1rem", marginTop:".3rem" }}>{cfg.kpr_teaser_note}</div>
              <button onClick={()=>setShowKPR(true)}
                style={{ background:"none", border:"none", color:"var(--accent)", fontSize:".72rem", letterSpacing:".08em", textTransform:"uppercase", cursor:"pointer", fontFamily:"var(--sans)", textDecoration:"underline" }}>
                Hitung ulang dengan detail saya →
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer setPage={setPage} />
      {showKPR && <KPRModal prop={kprProp} onClose={()=>setShowKPR(false)} />}
    </div>
  );
}

export default DetailPage;
