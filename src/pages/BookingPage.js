import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../utils/useApi";
import { fmt, fmtFull, toBase64 } from "../utils/helpers";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root { --sand:#F5F0E8;--clay:#C8B49A;--earth:#8C6F5A;--espresso:#2C1F14;--white:#FDFCFA;--mist:#EAE5DC;--accent:#B5844A;--text:#3A2E25;--light:#7A7065;--green:#4A7C59;--red:#A04040;--serif:'Cormorant Garamond',serif;--sans:'DM Sans',sans-serif; }
  body { font-family: var(--sans); background: var(--white); color: var(--text); }
  input,select,textarea,button { font-family: var(--sans); }
  input:focus,select:focus,textarea:focus { outline: none; box-shadow: 0 0 0 2px rgba(181,132,74,.25); }
  @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes checkmark{0%{stroke-dashoffset:100}100%{stroke-dashoffset:0}}
`;

const Inp = ({ label, value, onChange, type="text", placeholder="", required=false, error="", rows=null, prefix="" }) => (
  <div style={{ display:"flex", flexDirection:"column", gap:".35rem" }}>
    <label style={{ fontSize:".72rem", fontWeight:600, letterSpacing:".1em", textTransform:"uppercase", color:"var(--earth)" }}>
      {label}{required && <span style={{ color:"var(--accent)" }}> *</span>}
    </label>
    <div style={{ position:"relative" }}>
      {prefix && <span style={{ position:"absolute", left:"1rem", top:"50%", transform:"translateY(-50%)", fontSize:".85rem", color:"var(--light)", fontWeight:500 }}>{prefix}</span>}
      {rows
        ? <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows}
            style={{ width:"100%", padding:".8rem 1rem", border:`1.5px solid ${error?"var(--red)":"var(--mist)"}`, background:"var(--white)", color:"var(--text)", fontSize:".88rem", resize:"vertical", transition:"border .15s" }} />
        : <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
            style={{ width:"100%", padding:".8rem 1rem", paddingLeft:prefix?"2.5rem":"1rem", border:`1.5px solid ${error?"var(--red)":"var(--mist)"}`, background:"var(--white)", color:"var(--text)", fontSize:".88rem", transition:"border .15s" }} />
      }
    </div>
    {error && <span style={{ fontSize:".72rem", color:"var(--red)" }}>⚠ {error}</span>}
  </div>
);

const Btn = ({ children, variant="primary", onClick, disabled=false, full=false, style={} }) => {
  const [h,setH] = useState(false);
  const map = {
    primary: { bg: h&&!disabled ? "var(--accent)" : "var(--espresso)", color:"var(--sand)" },
    ghost:   { bg: h&&!disabled ? "var(--mist)" : "transparent",      color:"var(--earth)", border:"1.5px solid var(--clay)" },
    success: { bg: h&&!disabled ? "#3d6b4a" : "var(--green)",         color:"#fff" },
    danger:  { bg: h&&!disabled ? "#8b3030" : "var(--red)",           color:"#fff" },
  };
  const v = map[variant]||map.primary;
  return (
    <button onClick={disabled?undefined:onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} disabled={disabled}
      style={{ fontFamily:"var(--sans)", fontSize:".82rem", fontWeight:500, letterSpacing:".07em", textTransform:"uppercase",
        border:v.border||"none", cursor:disabled?"not-allowed":"pointer", padding:".85rem 1.8rem",
        transition:"all .2s", opacity:disabled?.5:1, background:v.bg, color:v.color,
        transform:h&&!disabled?"translateY(-1px)":"none", width:full?"100%":"auto", ...style }}>{children}</button>
  );
};

const StepDot = ({ num, label, active, done }) => (
  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:".4rem" }}>
    <div style={{ width:36, height:36, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
      background: done ? "var(--green)" : active ? "var(--accent)" : "var(--mist)",
      color: done||active ? "#fff" : "var(--light)", fontFamily:"var(--serif)", fontSize:"1rem", fontWeight:500,
      border: active ? "3px solid rgba(181,132,74,.3)" : "none", transition:"all .3s" }}>
      {done ? "✓" : num}
    </div>
    <div style={{ fontSize:".65rem", letterSpacing:".1em", textTransform:"uppercase",
      color: active ? "var(--accent)" : done ? "var(--green)" : "var(--light)", fontWeight: active||done ? 600 : 400 }}>
      {label}
    </div>
  </div>
);

export default function BookingPage() {
  const navigate = useNavigate();
  const { propertyId } = useParams();
  const [step, setStep] = useState(1);  // 1=Data Pembeli, 2=Bukti DP, 3=Sukses
  const [property, setProperty] = useState(null);
  const [siteConfig, setSiteConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

  const [form, setForm] = useState({
    buyer_name:"", buyer_phone:"", buyer_email:"", buyer_address:"", buyer_ktp:"", notes:""
  });
  const [dpAmount, setDpAmount] = useState("");
  const [dpFile, setDpFile] = useState(null);
  const [dpPreview, setDpPreview] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    Promise.all([
      api.properties.getById(propertyId),
      api.siteConfig.get(),
    ]).then(([propRes, cfgRes]) => {
      setProperty(propRes.data);
      setSiteConfig(cfgRes.data);
    }).catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, [propertyId]);

  useEffect(() => { document.title = property ? `Booking — ${property.name}` : "Booking Properti"; }, [property]);

  const minDP = property && siteConfig
    ? Math.round(property.price * (siteConfig.dp_min_percent || 10) / 100)
    : 0;
  const dpMinPercent = siteConfig?.dp_min_percent || 10;

  const setF = (k, v) => { setForm(f=>({...f,[k]:v})); setErrors(e=>({...e,[k]:""})); };

  const validateStep1 = () => {
    const e = {};
    if (!form.buyer_name.trim())   e.buyer_name  = "Nama lengkap wajib diisi";
    if (!form.buyer_phone.trim())  e.buyer_phone = "No. HP wajib diisi";
    if (!form.buyer_email.trim())  e.buyer_email = "Email wajib diisi";
    if (!form.buyer_address.trim()) e.buyer_address = "Alamat wajib diisi";
    if (!form.buyer_ktp.trim())    e.buyer_ktp   = "No. KTP wajib diisi";
    else if (form.buyer_ktp.replace(/\D/g,"").length !== 16) e.buyer_ktp = "No. KTP harus 16 digit";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    const dpNum = parseInt(dpAmount.replace(/\D/g,"")) || 0;
    if (!dpAmount)        e.dp_amount = "Jumlah DP wajib diisi";
    else if (dpNum < minDP) e.dp_amount = `DP minimal ${fmtFull(minDP)} (${dpMinPercent}%)`;
    if (!dpFile)          e.dp_proof  = "Bukti transfer wajib diupload";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setErrors(prev=>({...prev, dp_proof:"File maksimal 5 MB"})); return; }
    const b64 = await toBase64(file);
    setDpFile(file);
    setDpPreview(b64);
    setErrors(prev=>({...prev, dp_proof:""}));
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    setSubmitting(true);
    try {
      const dpNum = parseInt(dpAmount.replace(/\D/g,""));
      const payload = {
        property_id:      property.id,
        property_name:    property.name,
        ...form,
        dp_amount:        dpNum,
        dp_proof_url:     dpPreview,
        dp_proof_filename: dpFile.name,
      };
      const res = await api.bookings.create(payload);
      setBookingResult(res.data);
      setStep(3);
    } catch (err) {
      alert("Gagal mengajukan booking: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDpInput = (raw) => {
    const num = raw.replace(/\D/g,"");
    setDpAmount(num ? parseInt(num).toLocaleString("id-ID") : "");
    setErrors(prev=>({...prev, dp_amount:""}));
  };

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--white)" }}>
      <style>{CSS}</style>
      <div style={{ textAlign:"center", color:"var(--light)" }}>
        <div style={{ fontFamily:"var(--serif)", fontSize:"2rem", marginBottom:".8rem" }}>HAVEN<span style={{ color:"var(--accent)" }}>EST</span></div>
        <div>Memuat data properti...</div>
      </div>
    </div>
  );

  if (!property) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--white)" }}>
      <style>{CSS}</style>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>🏠</div>
        <h2 style={{ fontFamily:"var(--serif)", color:"var(--espresso)" }}>Properti tidak ditemukan</h2>
        <button onClick={()=>navigate("/properti")} style={{ marginTop:"1.5rem", padding:".7rem 1.5rem", background:"var(--espresso)", color:"var(--sand)", border:"none", cursor:"pointer", fontFamily:"var(--sans)", fontSize:".85rem" }}>← Kembali ke Properti</button>
      </div>
    </div>
  );

  if (property.status === "Terjual" || property.booking_status === "pending") return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--white)", padding:"2rem" }}>
      <style>{CSS}</style>
      <div style={{ textAlign:"center", maxWidth:420 }}>
        <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>{property.status==="Terjual" ? "🔴" : "⏳"}</div>
        <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.8rem", color:"var(--espresso)", marginBottom:".5rem" }}>
          {property.status==="Terjual" ? "Properti Telah Terjual" : "Sedang Dalam Proses Booking"}
        </h2>
        <p style={{ color:"var(--light)", marginBottom:"2rem" }}>
          {property.status==="Terjual"
            ? "Maaf, properti ini sudah tidak tersedia untuk dibooking."
            : "Properti ini sedang dalam proses verifikasi booking oleh admin."}
        </p>
        <Btn onClick={()=>navigate("/properti")}>← Lihat Properti Lain</Btn>
      </div>
    </div>
  );

  // ── STEP 3: SUCCESS ────────────────────────────────────────────
  if (step === 3) return (
    <div style={{ minHeight:"100vh", background:"var(--white)", display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem" }}>
      <style>{CSS}</style>
      <div style={{ maxWidth:600, width:"100%", textAlign:"center", animation:"fadeUp .5s ease" }}>
        <div style={{ width:80, height:80, borderRadius:"50%", background:"rgba(74,124,89,.1)", border:"3px solid var(--green)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1.5rem", fontSize:"2.5rem" }}>✅</div>
        <div style={{ fontFamily:"var(--serif)", fontSize:"clamp(1.8rem,3vw,2.4rem)", fontWeight:300, color:"var(--espresso)", marginBottom:".5rem" }}>Booking Berhasil Diajukan!</div>
        <p style={{ color:"var(--light)", marginBottom:"2.5rem", lineHeight:1.7 }}>Pengajuan booking Anda telah kami terima. Admin akan memverifikasi bukti DP dalam 1×24 jam kerja.</p>
        <div style={{ background:"var(--sand)", border:"1px solid var(--mist)", padding:"1.8rem 2rem", textAlign:"left", marginBottom:"2rem" }}>
          <div style={{ fontSize:".72rem", fontWeight:600, letterSpacing:".12em", textTransform:"uppercase", color:"var(--earth)", marginBottom:"1rem" }}>Detail Booking</div>
          {[
            ["ID Booking",   bookingResult?.id || "—"],
            ["Properti",     property.name],
            ["Nama Pembeli", form.buyer_name],
            ["Jumlah DP",    fmtFull(parseInt(dpAmount.replace(/\D/g,"")))],
            ["Status",       "⏳ Menunggu Verifikasi Admin"],
          ].map(([k,v]) => (
            <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:".6rem 0", borderBottom:"1px solid var(--mist)" }}>
              <span style={{ fontSize:".8rem", color:"var(--light)" }}>{k}</span>
              <span style={{ fontSize:".82rem", fontWeight:500, color: k==="Status" ? "#92400e" : "var(--espresso)" }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ background:"rgba(74,124,89,.08)", border:"1px solid rgba(74,124,89,.2)", padding:"1.2rem 1.5rem", textAlign:"left", marginBottom:"2rem" }}>
          <div style={{ fontSize:".78rem", fontWeight:600, color:"var(--green)", marginBottom:".6rem" }}>📌 Langkah Selanjutnya</div>
          <ul style={{ paddingLeft:"1.2rem", display:"flex", flexDirection:"column", gap:".4rem" }}>
            {["Tunggu konfirmasi dari admin via WhatsApp atau email", "Jika DP terverifikasi, status properti akan berubah menjadi Terjual", `Pertanyaan? Hubungi ${siteConfig?.contact_phone||"kami"}`].map(t=>(
              <li key={t} style={{ fontSize:".8rem", color:"var(--text)", lineHeight:1.6 }}>{t}</li>
            ))}
          </ul>
        </div>
        <div style={{ display:"flex", gap:"1rem", justifyContent:"center", flexWrap:"wrap" }}>
          <Btn onClick={()=>navigate("/properti")}>← Lihat Properti Lain</Btn>
          <Btn variant="ghost" onClick={()=>navigate("/")}>Kembali ke Beranda</Btn>
        </div>
      </div>
    </div>
  );

  // ── LAYOUT ─────────────────────────────────────────────────────
  const propImg = property.imgs?.[0] || property.img || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80";

  return (
    <div style={{ minHeight:"100vh", background:"var(--white)" }}>
      <style>{CSS}</style>

      {/* Header */}
      <div style={{ background:"var(--espresso)", padding:"1.2rem 3rem", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <button onClick={()=>navigate(`/properti/${propertyId}`)} style={{ background:"none", border:"none", color:"var(--clay)", cursor:"pointer", fontSize:".82rem", fontFamily:"var(--sans)", letterSpacing:".06em", display:"flex", alignItems:"center", gap:".5rem" }}>← Kembali ke Detail</button>
        <div style={{ fontFamily:"var(--serif)", fontSize:"1.2rem", color:"var(--sand)", letterSpacing:".08em" }}>HAVEN<span style={{ color:"var(--accent)" }}>EST</span> · Booking</div>
        <div style={{ width:120 }} />
      </div>

      {/* Step indicator */}
      <div style={{ background:"var(--sand)", borderBottom:"1px solid var(--mist)", padding:"1.5rem 3rem" }}>
        <div style={{ maxWidth:560, margin:"0 auto", display:"flex", alignItems:"center", gap:0 }}>
          {[["1","Data Pembeli"],["2","Bukti DP"],["3","Selesai"]].map(([num,label],i) => (
            <>
              <StepDot key={num} num={num} label={label} active={step===i+1} done={step>i+1} />
              {i < 2 && <div key={"line-"+i} style={{ flex:1, height:2, background:step>i+1?"var(--green)":"var(--mist)", transition:"background .4s", margin:"0 .5rem", marginBottom:"1.5rem" }} />}
            </>
          ))}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 360px", gap:"3rem", padding:"2.5rem 3rem", maxWidth:1100, margin:"0 auto" }}>
        {/* ── LEFT: FORM ────────────────────────────────────────── */}
        <div>
          {/* STEP 1 */}
          {step === 1 && (
            <div style={{ animation:"fadeIn .35s ease" }}>
              <div style={{ marginBottom:"2rem" }}>
                <div style={{ fontFamily:"var(--serif)", fontSize:"1.8rem", fontWeight:300, color:"var(--espresso)", marginBottom:".3rem" }}>Data Pembeli</div>
                <p style={{ fontSize:".85rem", color:"var(--light)" }}>Isi data diri Anda dengan lengkap dan sesuai KTP</p>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:"1.2rem" }}>
                <Inp label="Nama Lengkap" value={form.buyer_name} onChange={v=>setF("buyer_name",v)} placeholder="Sesuai KTP" required error={errors.buyer_name}/>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
                  <Inp label="No. HP / WhatsApp" value={form.buyer_phone} onChange={v=>setF("buyer_phone",v)} placeholder="08xxxxxxxxxx" required error={errors.buyer_phone}/>
                  <Inp label="Email" value={form.buyer_email} onChange={v=>setF("buyer_email",v)} type="email" placeholder="email@contoh.com" required error={errors.buyer_email}/>
                </div>
                <Inp label="No. KTP (16 digit)" value={form.buyer_ktp}
                  onChange={v=>setF("buyer_ktp",v.replace(/\D/g,"").slice(0,16))}
                  placeholder="3271XXXXXXXXXXXX" required error={errors.buyer_ktp}/>
                <Inp label="Alamat Lengkap" value={form.buyer_address} onChange={v=>setF("buyer_address",v)} rows={3} placeholder="Alamat tempat tinggal saat ini" required error={errors.buyer_address}/>
                <Inp label="Catatan Tambahan (opsional)" value={form.notes} onChange={v=>setF("notes",v)} rows={2} placeholder="Pertanyaan atau informasi tambahan..."/>
              </div>
              <div style={{ marginTop:"2rem", display:"flex", justifyContent:"flex-end" }}>
                <Btn onClick={()=>validateStep1()&&setStep(2)} style={{ padding:".9rem 2.5rem" }}>Lanjut ke Pembayaran DP →</Btn>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div style={{ animation:"fadeIn .35s ease" }}>
              <button onClick={()=>setStep(1)} style={{ background:"none", border:"none", color:"var(--light)", fontSize:".8rem", cursor:"pointer", marginBottom:"1.5rem", display:"flex", alignItems:"center", gap:".4rem", fontFamily:"var(--sans)" }}>← Kembali ke Data Pembeli</button>
              <div style={{ marginBottom:"1.5rem" }}>
                <div style={{ fontFamily:"var(--serif)", fontSize:"1.8rem", fontWeight:300, color:"var(--espresso)", marginBottom:".3rem" }}>Bukti Pembayaran DP</div>
                <p style={{ fontSize:".85rem", color:"var(--light)" }}>Transfer DP ke rekening kami, lalu upload bukti transfernya</p>
              </div>

              {/* Bank info */}
              <div style={{ background:"var(--espresso)", padding:"1.5rem 1.8rem", marginBottom:"1.5rem" }}>
                <div style={{ fontSize:".72rem", fontWeight:600, letterSpacing:".12em", textTransform:"uppercase", color:"var(--clay)", marginBottom:"1rem" }}>💳 Informasi Rekening</div>
                <div style={{ display:"grid", gap:".5rem" }}>
                  {[["Bank",siteConfig?.bank_name||"Bank BCA"],["No. Rekening",siteConfig?.bank_account||"1234567890"],["Atas Nama",siteConfig?.bank_owner||"PT Havenest Prima"]].map(([k,v])=>(
                    <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:".5rem 0", borderBottom:"1px solid rgba(200,180,154,.15)" }}>
                      <span style={{ fontSize:".78rem", color:"var(--clay)" }}>{k}</span>
                      <span style={{ fontFamily:"var(--serif)", fontSize:"1rem", color:k==="No. Rekening"?"var(--accent)":"var(--sand)", letterSpacing:k==="No. Rekening"?"2px":"normal", fontWeight:k==="No. Rekening"?600:400 }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop:"1rem", background:"rgba(181,132,74,.15)", border:"1px solid rgba(181,132,74,.3)", padding:".75rem 1rem" }}>
                  <span style={{ fontSize:".78rem", color:"var(--sand)" }}>Minimal DP: </span>
                  <span style={{ fontFamily:"var(--serif)", fontSize:"1.1rem", color:"var(--accent)", fontWeight:600 }}>{fmtFull(minDP)}</span>
                  <span style={{ fontSize:".75rem", color:"var(--clay)" }}> ({dpMinPercent}% dari {fmt(property.price)})</span>
                </div>
              </div>

              {/* DP Amount */}
              <div style={{ marginBottom:"1.2rem" }}>
                <label style={{ fontSize:".72rem", fontWeight:600, letterSpacing:".1em", textTransform:"uppercase", color:"var(--earth)", display:"block", marginBottom:".4rem" }}>
                  Jumlah DP yang Ditransfer (Rp) <span style={{ color:"var(--accent)" }}>*</span>
                </label>
                <div style={{ position:"relative" }}>
                  <span style={{ position:"absolute", left:"1rem", top:"50%", transform:"translateY(-50%)", fontSize:".85rem", color:"var(--light)", fontWeight:500 }}>Rp</span>
                  <input value={dpAmount} onChange={e=>formatDpInput(e.target.value)}
                    placeholder="Contoh: 320.000.000"
                    style={{ width:"100%", padding:".8rem 1rem .8rem 2.8rem", border:`1.5px solid ${errors.dp_amount?"var(--red)":"var(--mist)"}`, background:"var(--white)", color:"var(--text)", fontSize:".95rem", fontFamily:"var(--sans)" }}/>
                </div>
                {errors.dp_amount && <span style={{ fontSize:".72rem", color:"var(--red)" }}>⚠ {errors.dp_amount}</span>}
                {dpAmount && !errors.dp_amount && (
                  <div style={{ fontSize:".78rem", color:"var(--green)", marginTop:".3rem" }}>
                    = {fmtFull(parseInt(dpAmount.replace(/\D/g,"")))} ✓
                  </div>
                )}
              </div>

              {/* Upload zone */}
              <div style={{ marginBottom:"1.2rem" }}>
                <label style={{ fontSize:".72rem", fontWeight:600, letterSpacing:".1em", textTransform:"uppercase", color:"var(--earth)", display:"block", marginBottom:".4rem" }}>
                  Bukti Transfer <span style={{ color:"var(--accent)" }}>*</span>
                </label>
                <div style={{ border:`2px dashed ${errors.dp_proof?"var(--red)":dpPreview?"var(--green)":"var(--clay)"}`, background:"var(--sand)", padding:"1.5rem", textAlign:"center", transition:"all .2s" }}>
                  {dpPreview ? (
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:".8rem" }}>
                      <img src={dpPreview} alt="Bukti DP" style={{ maxHeight:220, maxWidth:"100%", objectFit:"contain", border:"1px solid var(--mist)" }}/>
                      <div style={{ fontSize:".8rem", color:"var(--green)", fontWeight:500 }}>✓ {dpFile?.name}</div>
                      <button onClick={()=>{setDpFile(null);setDpPreview(null);}} style={{ background:"none", border:"1px solid var(--clay)", color:"var(--light)", padding:".4rem 1rem", fontSize:".75rem", cursor:"pointer", fontFamily:"var(--sans)" }}>✕ Ganti File</button>
                    </div>
                  ) : (
                    <label htmlFor="dp-upload" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:".5rem", cursor:"pointer" }}>
                      <div style={{ fontSize:"2.5rem" }}>📤</div>
                      <div style={{ fontSize:".9rem", fontWeight:500, color:"var(--espresso)" }}>Klik untuk upload bukti transfer</div>
                      <div style={{ fontSize:".78rem", color:"var(--light)" }}>PNG, JPG, PDF — maks. 5 MB</div>
                      <div style={{ marginTop:".5rem", padding:".5rem 1.2rem", background:"var(--espresso)", color:"var(--sand)", fontSize:".75rem", letterSpacing:".08em", textTransform:"uppercase" }}>Pilih File</div>
                    </label>
                  )}
                  <input id="dp-upload" type="file" accept="image/*,.pdf" onChange={handleFileChange} style={{ display:"none" }}/>
                </div>
                {errors.dp_proof && <span style={{ fontSize:".72rem", color:"var(--red)" }}>⚠ {errors.dp_proof}</span>}
              </div>

              <div style={{ background:"rgba(181,132,74,.08)", border:"1px solid rgba(181,132,74,.2)", padding:"1rem 1.2rem", marginBottom:"1.5rem" }}>
                <div style={{ fontSize:".78rem", color:"var(--earth)", lineHeight:1.7 }}>
                  <strong>⚠ Perhatian:</strong> Pastikan bukti transfer jelas terbaca dan sesuai dengan jumlah DP yang diinput. Admin akan memverifikasi dalam 1×24 jam kerja.
                </div>
              </div>

              <div style={{ display:"flex", justifyContent:"flex-end" }}>
                <Btn onClick={handleSubmit} disabled={submitting} variant="success" style={{ padding:".9rem 2.5rem" }}>
                  {submitting ? "⏳ Memproses..." : "✅ Ajukan Booking"}
                </Btn>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: SUMMARY ──────────────────────────────────────── */}
        <div style={{ position:"sticky", top:"2rem", alignSelf:"start" }}>
          <div style={{ border:"1px solid var(--mist)", overflow:"hidden" }}>
            <div style={{ height:200, background:`url('${propImg}') center/cover no-repeat` }}/>
            <div style={{ padding:"1.5rem" }}>
              <div style={{ display:"flex", gap:".5rem", marginBottom:".8rem", flexWrap:"wrap" }}>
                <span style={{ background:"var(--espresso)", color:"var(--sand)", fontSize:".62rem", letterSpacing:".1em", textTransform:"uppercase", padding:".25rem .6rem" }}>{property.badge}</span>
                <span style={{ background:"var(--mist)", color:"var(--earth)", fontSize:".62rem", letterSpacing:".1em", textTransform:"uppercase", padding:".25rem .6rem" }}>{property.type}</span>
              </div>
              <div style={{ fontFamily:"var(--serif)", fontSize:"1.7rem", fontWeight:500, color:"var(--espresso)", marginBottom:".2rem" }}>{fmt(property.price)}</div>
              <div style={{ fontSize:".9rem", fontWeight:500, color:"var(--text)", marginBottom:".2rem" }}>{property.name}</div>
              <div style={{ fontSize:".78rem", color:"var(--light)" }}>📍 {property.location}</div>
              <div style={{ display:"flex", gap:"1rem", marginTop:"1rem", paddingTop:"1rem", borderTop:"1px solid var(--mist)", flexWrap:"wrap" }}>
                {[["🛏",`${property.beds} KT`],["🚿",`${property.baths} KM`],["📐",`${property.area} m²`]].map(([ic,v])=>(
                  <span key={v} style={{ fontSize:".75rem", color:"var(--light)", display:"flex", alignItems:"center", gap:".25rem" }}>{ic} {v}</span>
                ))}
              </div>
            </div>
            <div style={{ background:"var(--sand)", padding:"1.2rem 1.5rem", borderTop:"1px solid var(--mist)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:".5rem" }}>
                <span style={{ fontSize:".78rem", color:"var(--light)" }}>Harga Properti</span>
                <span style={{ fontSize:".85rem", fontWeight:500, color:"var(--espresso)" }}>{fmt(property.price)}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", padding:".7rem .8rem", background:"rgba(181,132,74,.12)", border:"1px solid rgba(181,132,74,.2)" }}>
                <span style={{ fontSize:".78rem", color:"var(--earth)", fontWeight:600 }}>Minimal DP ({dpMinPercent}%)</span>
                <span style={{ fontFamily:"var(--serif)", fontSize:"1rem", color:"var(--accent)", fontWeight:600 }}>{fmtFull(minDP)}</span>
              </div>
            </div>
          </div>

          {/* Progress recap */}
          <div style={{ marginTop:"1.2rem", border:"1px solid var(--mist)", padding:"1.2rem" }}>
            <div style={{ fontSize:".72rem", fontWeight:600, letterSpacing:".1em", textTransform:"uppercase", color:"var(--earth)", marginBottom:".8rem" }}>Progress Booking</div>
            {[
              { step:1, label:"Data Pembeli", done: step>1, active: step===1, preview: step>1 ? form.buyer_name : null },
              { step:2, label:"Bukti DP",     done: step>2, active: step===2, preview: step>2 ? fmtFull(parseInt(dpAmount.replace(/\D/g,"")||"0")) : null },
              { step:3, label:"Selesai",       done: step>3, active: step===3 },
            ].map(({step:s,label,done,active,preview}) => (
              <div key={s} style={{ display:"flex", alignItems:"center", gap:".8rem", padding:".55rem 0", borderBottom:"1px solid var(--mist)" }}>
                <div style={{ width:22, height:22, borderRadius:"50%", background:done?"var(--green)":active?"var(--accent)":"var(--mist)", color:done||active?"#fff":"var(--light)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:".68rem", fontWeight:700, flexShrink:0 }}>{done?"✓":s}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:".78rem", fontWeight: active||done ? 600 : 400, color: active?"var(--accent)":done?"var(--green)":"var(--light)" }}>{label}</div>
                  {preview && <div style={{ fontSize:".72rem", color:"var(--light)", marginTop:".1rem" }}>{preview}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
