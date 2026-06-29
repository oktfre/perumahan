import { useState, useEffect, useCallback } from "react";
import { useNavigate, Routes, Route, useLocation } from "react-router-dom";
import { api } from "../../utils/useApi";
import { fmt, fmtFull, fmtDate, fmtDateTime } from "../../utils/helpers";

// ── CSS ───────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root { --sand:#F5F0E8;--clay:#C8B49A;--earth:#8C6F5A;--espresso:#2C1F14;--white:#FDFCFA;--mist:#EAE5DC;--accent:#B5844A;--text:#3A2E25;--light:#7A7065;--green:#4A7C59;--red:#A04040;--serif:'Cormorant Garamond',serif;--sans:'DM Sans',sans-serif; }
  body { font-family: var(--sans); background: #F0EBE3; color: var(--text); }
  input,select,textarea,button { font-family: var(--sans); }
  input:focus,select:focus,textarea:focus { outline:none; box-shadow:0 0 0 2px rgba(181,132,74,.25); }
  input[type=range]{-webkit-appearance:none;width:100%;height:4px;background:var(--mist);border-radius:2px;outline:none;}
  input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:var(--accent);cursor:pointer;border:3px solid var(--white);}
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes backdropIn{from{opacity:0}to{opacity:1}}
  @keyframes slideUp2{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
  .admin-modal-bd{position:fixed;inset:0;z-index:1000;background:rgba(44,31,20,.6);backdrop-filter:blur(6px);animation:backdropIn .25s ease;display:flex;align-items:center;justify-content:center;padding:1.5rem;}
  .admin-modal{background:var(--white);width:100%;max-width:640px;max-height:90vh;overflow-y:auto;animation:slideUp2 .3s cubic-bezier(.16,1,.3,1);}
  .admin-modal-lg{max-width:900px;}
  ::-webkit-scrollbar{width:6px;height:6px;}
  ::-webkit-scrollbar-track{background:var(--mist);}
  ::-webkit-scrollbar-thumb{background:var(--clay);border-radius:3px;}
`;

// ── ATOMS ─────────────────────────────────────────────────
const Btn = ({ children, variant="primary", onClick, disabled=false, full=false, style={}, size="md" }) => {
  const [h,setH]=useState(false);
  const map={
    primary:{ bg:h&&!disabled?"var(--accent)":"var(--espresso)", color:"var(--sand)" },
    ghost:  { bg:h&&!disabled?"var(--mist)":"transparent", color:"var(--earth)", border:"1.5px solid var(--clay)" },
    success:{ bg:h&&!disabled?"#3d6b4a":"var(--green)", color:"#fff" },
    danger: { bg:h&&!disabled?"#8b3030":"var(--red)", color:"#fff" },
    warning:{ bg:h&&!disabled?"#b07d1e":"#c8960f", color:"#fff" },
    link:   { bg:"transparent", color:h?"var(--accent)":"var(--light)", border:"none" },
  };
  const v=map[variant]||map.primary;
  const pd=size==="sm"?".4rem .9rem":size==="xs"?".3rem .6rem":".7rem 1.5rem";
  const fs=size==="sm"?".72rem":size==="xs"?".65rem":".8rem";
  return <button onClick={disabled?undefined:onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} disabled={disabled} style={{ fontFamily:"var(--sans)",fontSize:fs,fontWeight:500,letterSpacing:".06em",textTransform:"uppercase",border:v.border||"none",cursor:disabled?"not-allowed":"pointer",padding:pd,transition:"all .18s",opacity:disabled?.5:1,background:v.bg,color:v.color,width:full?"100%":"auto",...style }}>{children}</button>;
};

const Tag=({label})=>(<div style={{display:"flex",alignItems:"center",gap:".45rem",fontSize:".65rem",letterSpacing:".14em",textTransform:"uppercase",color:"var(--accent)",marginBottom:".4rem"}}><span style={{width:14,height:1,background:"var(--accent)",display:"block"}}/>{label}</div>);

const Badge=({status})=>{
  const map={pending:{bg:"#FEF9EC",color:"#92400E",label:"⏳ Pending"},approved:{bg:"#ECFDF5",color:"#065F46",label:"✅ Disetujui"},rejected:{bg:"#FEF2F2",color:"#7F1D1D",label:"❌ Ditolak"},read:{bg:"#F0F9FF",color:"#0C4A6E",label:"📖 Dibaca"},unread:{bg:"#FFF7ED",color:"#92400E",label:"🔔 Belum Dibaca"}};
  const s=map[status]||{bg:"var(--mist)",color:"var(--light)",label:status};
  return <span style={{display:"inline-block",padding:".25rem .7rem",background:s.bg,color:s.color,fontSize:".68rem",fontWeight:600,letterSpacing:".06em"}}>{s.label}</span>;
};

const Inp=({label,value,onChange,type="text",placeholder="",error="",rows=null,options=null,required=false})=>(
  <div style={{display:"flex",flexDirection:"column",gap:".35rem"}}>
    <label style={{fontSize:".72rem",fontWeight:600,letterSpacing:".08em",textTransform:"uppercase",color:"var(--earth)"}}>{label}{required&&<span style={{color:"var(--accent)"}}> *</span>}</label>
    {options?<select value={value} onChange={e=>onChange(e.target.value)} style={{padding:".7rem .9rem",border:`1px solid ${error?"var(--red)":"var(--mist)"}`,background:"var(--white)",color:"var(--text)",fontSize:".88rem"}}><option value="">— Pilih {label} —</option>{options.map(o=><option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}</select>
    :rows?<textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{padding:".7rem .9rem",border:`1px solid ${error?"var(--red)":"var(--mist)"}`,background:"var(--white)",color:"var(--text)",fontSize:".88rem",resize:"vertical"}}/>
    :<input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{padding:".7rem .9rem",border:`1px solid ${error?"var(--red)":"var(--mist)"}`,background:"var(--white)",color:"var(--text)",fontSize:".88rem"}}/>}
    {error&&<span style={{fontSize:".7rem",color:"var(--red)"}}>⚠ {error}</span>}
  </div>
);

const SectionCard=({title,children,action})=>(
  <div style={{background:"var(--white)",border:"1px solid var(--mist)",marginBottom:"1.5rem",animation:"fadeUp .4s ease"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"1rem 1.5rem",borderBottom:"1px solid var(--mist)"}}>
      <div style={{fontSize:".78rem",fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:"var(--earth)"}}>{title}</div>
      {action}
    </div>
    {children}
  </div>
);

// ── OVERVIEW ──────────────────────────────────────────────
function Overview({onNav}){
  const [data,setData]=useState({properties:[],bookings:[],inquiries:[]});
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    Promise.all([
      api.properties.getAll().then(r=>r.data||[]),
      api.bookings.getAll().then(r=>r.data||[]),
      api.inquiries.getAll().then(r=>r.data||[]),
    ]).then(([p,b,i])=>setData({properties:p,bookings:b,inquiries:i})).finally(()=>setLoading(false));
  },[]);

  if(loading)return<div style={{textAlign:"center",padding:"3rem",color:"var(--light)"}}>Memuat data...</div>;

  const {properties:pp,bookings:bb,inquiries:ii}=data;
  const stats=[
    {label:"Total Properti",val:pp.length,ic:"🏠",color:"var(--espresso)",sub:"Semua listing"},
    {label:"Tersedia",val:pp.filter(p=>p.status==="Dijual"&&!p.booking_status).length,ic:"✅",color:"var(--green)",sub:"Siap dibeli"},
    {label:"Pre-Booking",val:pp.filter(p=>p.booking_status==="pending").length,ic:"⏳",color:"#B07D1E",sub:"Menunggu verifikasi"},
    {label:"Terjual",val:pp.filter(p=>p.status==="Terjual").length,ic:"🔴",color:"var(--red)",sub:"Sudah terjual"},
    {label:"Total Booking",val:bb.length,ic:"📋",color:"#6B4F8C",sub:`${bb.filter(b=>b.status==="pending").length} pending`},
    {label:"Inquiry Baru",val:ii.filter(i=>i.status==="unread").length,ic:"💌",color:"var(--accent)",sub:`${ii.length} total inquiry`},
  ];
  const pendingBookings=bb.filter(b=>b.status==="pending").slice(0,5);
  const recentInquiries=ii.slice(0,5);

  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"1rem",marginBottom:"1.5rem"}}>
        {stats.map(s=>(
          <div key={s.label} onClick={()=>{}} style={{background:"var(--white)",border:"1px solid var(--mist)",padding:"1.3rem 1.5rem",cursor:"pointer",animation:"fadeUp .4s ease",transition:"box-shadow .2s"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:".5rem"}}>
              <div style={{fontSize:".7rem",fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:"var(--light)"}}>{s.label}</div>
              <span style={{fontSize:"1.3rem"}}>{s.ic}</span>
            </div>
            <div style={{fontFamily:"var(--serif)",fontSize:"2rem",fontWeight:500,color:s.color,lineHeight:1}}>{s.val}</div>
            <div style={{fontSize:".72rem",color:"var(--light)",marginTop:".35rem"}}>{s.sub}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1.5rem"}}>
        <SectionCard title="Booking Pending" action={<Btn size="sm" variant="ghost" onClick={()=>onNav("bookings")}>Lihat Semua →</Btn>}>
          {pendingBookings.length===0?<div style={{padding:"2rem",textAlign:"center",color:"var(--light)",fontSize:".85rem"}}>Tidak ada booking pending</div>:(
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <tbody>{pendingBookings.map(b=>(
                <tr key={b.id} style={{borderBottom:"1px solid var(--mist)"}}>
                  <td style={{padding:".75rem 1.5rem"}}><div style={{fontSize:".85rem",fontWeight:500,color:"var(--text)"}}>{b.buyer_name}</div><div style={{fontSize:".72rem",color:"var(--light)"}}>{b.property_name}</div></td>
                  <td style={{padding:".75rem 1rem",textAlign:"right"}}><div style={{fontFamily:"var(--serif)",fontSize:".95rem",color:"var(--accent)"}}>{fmt(b.dp_amount)}</div><div style={{fontSize:".7rem",color:"var(--light)"}}>{fmtDate(b.created_at)}</div></td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </SectionCard>
        <SectionCard title="Inquiry Terbaru" action={<Btn size="sm" variant="ghost" onClick={()=>onNav("inquiries")}>Lihat Semua →</Btn>}>
          {recentInquiries.length===0?<div style={{padding:"2rem",textAlign:"center",color:"var(--light)",fontSize:".85rem"}}>Belum ada inquiry</div>:(
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <tbody>{recentInquiries.map(i=>(
                <tr key={i.id} style={{borderBottom:"1px solid var(--mist)"}}>
                  <td style={{padding:".75rem 1.5rem"}}><div style={{display:"flex",alignItems:"center",gap:".5rem"}}>{i.status==="unread"&&<span style={{width:7,height:7,borderRadius:"50%",background:"var(--accent)",display:"block",flexShrink:0}}/>}<span style={{fontSize:".85rem",fontWeight:500,color:"var(--text)"}}>{i.nama_lengkap}</span></div><div style={{fontSize:".72rem",color:"var(--light)",marginTop:".1rem"}}>{i.keterangan||"Umum"}</div></td>
                  <td style={{padding:".75rem 1rem",textAlign:"right",fontSize:".72rem",color:"var(--light)"}}>{fmtDate(i.created_at)}</td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

// ── BOOKINGS ADMIN ────────────────────────────────────────
function AdminBookings(){
  const [bookings,setBookings]=useState([]);
  const [loading,setLoading]=useState(true);
  const [filter,setFilter]=useState("all");
  const [selected,setSelected]=useState(null);
  const [adminNote,setAdminNote]=useState("");
  const [processing,setProcessing]=useState(false);
  const [imgZoom,setImgZoom]=useState(false);

  const load=useCallback(async()=>{
    setLoading(true);
    try{const q=filter!=="all"?`status=${filter}`:"";const res=await api.bookings.getAll(q);setBookings(res.data||[]);}
    catch(e){console.error(e);}finally{setLoading(false);}
  },[filter]);

  useEffect(()=>{load();},[load]);

  const openDetail=async(b)=>{
    setSelected(b);setAdminNote(b.admin_note||"");
    if(b.status==="unread"){/* mark if needed */}
  };

  const handleApprove=async()=>{
    if(!window.confirm("Konfirmasi: DP telah diterima dan properti akan ditandai TERJUAL?"))return;
    setProcessing(true);
    try{await api.bookings.approve(selected.id,adminNote);await load();setSelected(null);}
    catch(e){alert("Gagal: "+e.message);}finally{setProcessing(false);}
  };

  const handleReject=async()=>{
    if(!adminNote.trim()){alert("Isi alasan penolakan.");return;}
    if(!window.confirm("Tolak booking ini?"))return;
    setProcessing(true);
    try{await api.bookings.reject(selected.id,adminNote);await load();setSelected(null);}
    catch(e){alert("Gagal: "+e.message);}finally{setProcessing(false);}
  };

  const pendingCount=bookings.filter(b=>b.status==="pending").length;

  return(
    <div>
      {pendingCount>0&&<div style={{background:"#FEF9EC",border:"1px solid #FDE68A",padding:".9rem 1.5rem",marginBottom:"1rem",fontSize:".85rem",color:"#92400E"}}>⚠ Terdapat <strong>{pendingCount} booking</strong> yang menunggu verifikasi DP Anda!</div>}
      <SectionCard title="Manajemen Booking" action={
        <div style={{display:"flex",gap:".6rem",flexWrap:"wrap"}}>
          {[["all","Semua"],["pending","Pending"],["approved","Disetujui"],["rejected","Ditolak"]].map(([v,l])=>(
            <Btn key={v} size="sm" variant={filter===v?"primary":"ghost"} onClick={()=>setFilter(v)}>{l}</Btn>
          ))}
        </div>
      }>
        {loading?<div style={{padding:"3rem",textAlign:"center",color:"var(--light)"}}>Memuat...</div>:(
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:".83rem"}}>
              <thead><tr style={{borderBottom:"2px solid var(--mist)",background:"var(--sand)"}}>
                {["Pembeli","Properti","Jumlah DP","Bukti DP","Status","Waktu","Aksi"].map(h=><th key={h} style={{padding:".75rem 1.2rem",textAlign:"left",fontSize:".68rem",fontWeight:600,letterSpacing:".08em",textTransform:"uppercase",color:"var(--light)",whiteSpace:"nowrap"}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {bookings.length===0?<tr><td colSpan={7} style={{padding:"3rem",textAlign:"center",color:"var(--light)"}}>Tidak ada data booking</td></tr>
                :bookings.map(b=>(
                  <tr key={b.id} style={{borderBottom:"1px solid var(--mist)",background:b.status==="pending"?"#FFFBEB":"var(--white)"}}>
                    <td style={{padding:".8rem 1.2rem"}}><div style={{fontWeight:500,color:"var(--espresso)"}}>{b.buyer_name}</div><div style={{fontSize:".72rem",color:"var(--light)"}}>{b.buyer_phone}</div><div style={{fontSize:".7rem",color:"var(--light)"}}>{b.buyer_email}</div></td>
                    <td style={{padding:".8rem 1.2rem",fontSize:".82rem",color:"var(--text)"}}>{b.property_name||"—"}</td>
                    <td style={{padding:".8rem 1.2rem"}}><span style={{fontFamily:"var(--serif)",fontSize:".95rem",color:"var(--accent)",fontWeight:500}}>{fmt(b.dp_amount)}</span></td>
                    <td style={{padding:".8rem 1.2rem"}}>
                      {b.dp_proof_url
                        ?<img src={b.dp_proof_url} alt="bukti" onClick={()=>{setSelected(b);setImgZoom(true);}} style={{width:56,height:44,objectFit:"cover",border:"1px solid var(--mist)",cursor:"zoom-in"}}/>
                        :<span style={{fontSize:".72rem",color:"var(--light)"}}>Tidak ada</span>}
                    </td>
                    <td style={{padding:".8rem 1.2rem"}}><Badge status={b.status}/></td>
                    <td style={{padding:".8rem 1.2rem",fontSize:".75rem",color:"var(--light)",whiteSpace:"nowrap"}}>{fmtDateTime(b.created_at)}</td>
                    <td style={{padding:".8rem 1.2rem"}}><Btn size="sm" variant={b.status==="pending"?"warning":"ghost"} onClick={()=>openDetail(b)}>{b.status==="pending"?"🔍 Verifikasi":"👁 Detail"}</Btn></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Detail/Verifikasi Modal */}
      {selected&&!imgZoom&&(
        <div className="admin-modal-bd" onClick={e=>e.target===e.currentTarget&&setSelected(null)}>
          <div className="admin-modal admin-modal-lg">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"1.3rem 1.8rem",borderBottom:"1px solid var(--mist)",background:"var(--espresso)"}}>
              <div style={{fontFamily:"var(--serif)",fontSize:"1.3rem",color:"var(--sand)"}}>Detail Booking — <Badge status={selected.status}/></div>
              <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",color:"var(--clay)",cursor:"pointer",fontSize:"1.2rem",lineHeight:1}}>✕</button>
            </div>
            <div style={{padding:"1.8rem",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"2rem"}}>
              {/* Left */}
              <div style={{display:"flex",flexDirection:"column",gap:"1.2rem"}}>
                <div>
                  <div style={{fontSize:".72rem",fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:"var(--earth)",marginBottom:".8rem"}}>📋 Informasi Pembeli</div>
                  {[["Nama Lengkap",selected.buyer_name],["No. HP",selected.buyer_phone],["Email",selected.buyer_email],["No. KTP",selected.buyer_ktp],["Alamat",selected.buyer_address]].map(([k,v])=>(
                    <div key={k} style={{display:"flex",justifyContent:"space-between",padding:".5rem 0",borderBottom:"1px solid var(--mist)",gap:"1rem"}}>
                      <span style={{fontSize:".78rem",color:"var(--light)",flexShrink:0}}>{k}</span>
                      <span style={{fontSize:".82rem",color:"var(--espresso)",textAlign:"right",wordBreak:"break-all"}}>{v||"—"}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{fontSize:".72rem",fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:"var(--earth)",marginBottom:".8rem"}}>🏠 Properti</div>
                  {[["Nama",selected.property_name],["ID Booking",selected.id],["Waktu Booking",fmtDateTime(selected.created_at)]].map(([k,v])=>(
                    <div key={k} style={{display:"flex",justifyContent:"space-between",padding:".5rem 0",borderBottom:"1px solid var(--mist)",gap:"1rem"}}>
                      <span style={{fontSize:".78rem",color:"var(--light)",flexShrink:0}}>{k}</span>
                      <span style={{fontSize:".82rem",color:"var(--espresso)",textAlign:"right",wordBreak:"break-all"}}>{v||"—"}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{fontSize:".72rem",fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:"var(--earth)",marginBottom:".8rem"}}>💰 Pembayaran DP</div>
                  <div style={{background:"var(--sand)",border:"1px solid var(--mist)",padding:"1rem 1.2rem",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:".8rem",color:"var(--light)"}}>Jumlah DP Ditransfer</span>
                    <span style={{fontFamily:"var(--serif)",fontSize:"1.5rem",color:"var(--accent)",fontWeight:500}}>{fmtFull(selected.dp_amount)}</span>
                  </div>
                  {selected.notes&&<div style={{marginTop:".8rem",background:"var(--mist)",padding:".8rem 1rem",fontSize:".82rem",color:"var(--text)"}}><strong>Catatan pembeli:</strong> {selected.notes}</div>}
                </div>
              </div>
              {/* Right */}
              <div>
                <div style={{fontSize:".72rem",fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:"var(--earth)",marginBottom:".8rem"}}>📄 Bukti Transfer DP</div>
                {selected.dp_proof_url?(
                  <div style={{textAlign:"center"}}>
                    <img src={selected.dp_proof_url} alt="Bukti DP" onClick={()=>setImgZoom(true)} style={{maxWidth:"100%",maxHeight:280,objectFit:"contain",border:"1px solid var(--mist)",cursor:"zoom-in"}}/>
                    <div style={{fontSize:".72rem",color:"var(--light)",marginTop:".5rem"}}>{selected.dp_proof_filename}</div>
                    <Btn size="sm" variant="ghost" onClick={()=>setImgZoom(true)} style={{marginTop:".5rem"}}>🔍 Perbesar</Btn>
                  </div>
                ):<div style={{textAlign:"center",padding:"3rem",background:"var(--mist)",color:"var(--light)"}}>Tidak ada bukti diupload</div>}
                {selected.status==="pending"&&(
                  <div style={{marginTop:"1.5rem"}}>
                    <div style={{fontSize:".72rem",fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:"var(--earth)",marginBottom:".8rem"}}>✅ Verifikasi DP</div>
                    <Inp label="Catatan Admin" value={adminNote} onChange={setAdminNote} rows={3} placeholder="Catatan (wajib jika menolak)..."/>
                    <div style={{display:"flex",flexDirection:"column",gap:".7rem",marginTop:"1rem"}}>
                      <Btn variant="success" full onClick={handleApprove} disabled={processing}>{processing?"⏳ Memproses...":"✅ Setujui — Tandai Properti TERJUAL"}</Btn>
                      <Btn variant="danger" full onClick={handleReject} disabled={processing}>{processing?"⏳ Memproses...":"❌ Tolak Booking"}</Btn>
                    </div>
                    <div style={{marginTop:".8rem",fontSize:".75rem",color:"var(--light)",lineHeight:1.6,background:"rgba(181,132,74,.08)",padding:".7rem .9rem",border:"1px solid rgba(181,132,74,.2)"}}>⚠ Menyetujui akan otomatis mengubah status properti menjadi <strong>Terjual</strong>. Menolak akan mengembalikan properti ke status <strong>Tersedia</strong>.</div>
                  </div>
                )}
                {selected.status!=="pending"&&selected.admin_note&&(
                  <div style={{marginTop:"1.2rem",background:"var(--sand)",border:"1px solid var(--mist)",padding:"1rem"}}>
                    <div style={{fontSize:".7rem",fontWeight:600,letterSpacing:".08em",textTransform:"uppercase",color:"var(--earth)",marginBottom:".4rem"}}>Catatan Admin</div>
                    <div style={{fontSize:".85rem",color:"var(--text)"}}>{selected.admin_note}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {imgZoom&&selected?.dp_proof_url&&(
        <div onClick={()=>setImgZoom(false)} style={{position:"fixed",inset:0,zIndex:2000,background:"rgba(0,0,0,.88)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"zoom-out"}}>
          <img src={selected.dp_proof_url} alt="Full" style={{maxWidth:"95vw",maxHeight:"88vh",objectFit:"contain"}}/>
          <Btn variant="ghost" onClick={()=>setImgZoom(false)} style={{marginTop:"1.2rem",color:"#fff",borderColor:"rgba(255,255,255,.3)"}}>✕ Tutup</Btn>
        </div>
      )}
    </div>
  );
}

// ── INQUIRIES ADMIN ───────────────────────────────────────
function AdminInquiries(){
  const [inquiries,setInquiries]=useState([]);
  const [loading,setLoading]=useState(true);
  const [filter,setFilter]=useState("all");
  const [search,setSearch]=useState("");
  const [selected,setSelected]=useState(null);
  const [note,setNote]=useState("");
  const [processing,setProcessing]=useState(false);

  const load=useCallback(async()=>{
    setLoading(true);
    try{const q=[filter!=="all"?`status=${filter}`:"",search?`search=${search}`:""].filter(Boolean).join("&");const res=await api.inquiries.getAll(q);setInquiries(res.data||[]);}
    catch(e){console.error(e);}finally{setLoading(false);}
  },[filter,search]);

  useEffect(()=>{load();},[load]);

  const openDetail=async(i)=>{
    setSelected(i);setNote(i.admin_notes||"");
    if(i.status==="unread"){
      try{await api.inquiries.markAsRead(i.id);setInquiries(prev=>prev.map(x=>x.id===i.id?{...x,status:"read"}:x));}catch{}
    }
  };

  const handleSaveNote=async()=>{
    setProcessing(true);
    try{await api.inquiries.update(selected.id,{admin_notes:note});setSelected(prev=>({...prev,admin_notes:note}));load();}
    catch(e){alert("Gagal: "+e.message);}finally{setProcessing(false);}
  };

  const handleDelete=async(id)=>{
    if(!window.confirm("Hapus inquiry ini?"))return;
    try{await api.inquiries.deleteInquiry(id);setSelected(null);load();}
    catch(e){alert("Gagal: "+e.message);}
  };

  const unread=inquiries.filter(i=>i.status==="unread").length;

  return(
    <div>
      {unread>0&&<div style={{background:"#FFF7ED",border:"1px solid #FDE68A",padding:".9rem 1.5rem",marginBottom:"1rem",fontSize:".85rem",color:"#92400E"}}>💌 <strong>{unread} inquiry baru</strong> belum dibaca</div>}
      <SectionCard title="Manajemen Inquiry" action={
        <div style={{display:"flex",gap:".6rem",flexWrap:"wrap"}}>
          {[["all","Semua"],["unread","Belum Dibaca"],["read","Sudah Dibaca"]].map(([v,l])=>(
            <Btn key={v} size="sm" variant={filter===v?"primary":"ghost"} onClick={()=>setFilter(v)}>{l}</Btn>
          ))}
        </div>
      }>
        <div style={{padding:".8rem 1.5rem",borderBottom:"1px solid var(--mist)"}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Cari nama atau pesan..." style={{width:"100%",padding:".6rem .9rem",border:"1px solid var(--mist)",background:"var(--white)",color:"var(--text)",fontSize:".85rem"}}/>
        </div>
        {loading?<div style={{padding:"3rem",textAlign:"center",color:"var(--light)"}}>Memuat...</div>:(
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:".83rem"}}>
              <thead><tr style={{borderBottom:"2px solid var(--mist)",background:"var(--sand)"}}>
                {["Pengirim","Kategori","Pesan","Status","Waktu","Aksi"].map(h=><th key={h} style={{padding:".75rem 1.2rem",textAlign:"left",fontSize:".68rem",fontWeight:600,letterSpacing:".08em",textTransform:"uppercase",color:"var(--light)",whiteSpace:"nowrap"}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {inquiries.length===0?<tr><td colSpan={6} style={{padding:"3rem",textAlign:"center",color:"var(--light)"}}>Tidak ada inquiry</td></tr>
                :inquiries.map(i=>(
                  <tr key={i.id} style={{borderBottom:"1px solid var(--mist)",background:i.status==="unread"?"#FFFBEB":"var(--white)"}}>
                    <td style={{padding:".8rem 1.2rem"}}><div style={{display:"flex",alignItems:"center",gap:".5rem"}}>{i.status==="unread"&&<span style={{width:8,height:8,borderRadius:"50%",background:"var(--accent)",display:"block",flexShrink:0}}/>}<div><div style={{fontWeight:500,color:"var(--espresso)"}}>{i.nama_lengkap}</div><div style={{fontSize:".72rem",color:"var(--light)"}}>{i.nomor_hp}</div></div></div></td>
                    <td style={{padding:".8rem 1.2rem"}}><span style={{background:"var(--mist)",padding:".2rem .6rem",fontSize:".72rem",color:"var(--earth)"}}>{i.keterangan||"Umum"}</span></td>
                    <td style={{padding:".8rem 1.2rem",maxWidth:240}}><div style={{fontSize:".82rem",color:"var(--text)",overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{i.pesan}</div></td>
                    <td style={{padding:".8rem 1.2rem"}}><Badge status={i.status}/></td>
                    <td style={{padding:".8rem 1.2rem",fontSize:".75rem",color:"var(--light)",whiteSpace:"nowrap"}}>{fmtDateTime(i.created_at)}</td>
                    <td style={{padding:".8rem 1.2rem"}}><div style={{display:"flex",gap:".4rem"}}><Btn size="sm" variant="ghost" onClick={()=>openDetail(i)}>👁 Buka</Btn><Btn size="sm" variant="danger" onClick={()=>handleDelete(i.id)}>🗑</Btn></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {selected&&(
        <div className="admin-modal-bd" onClick={e=>e.target===e.currentTarget&&setSelected(null)}>
          <div className="admin-modal">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"1.2rem 1.8rem",borderBottom:"1px solid var(--mist)",background:"var(--espresso)"}}>
              <div style={{fontFamily:"var(--serif)",fontSize:"1.2rem",color:"var(--sand)"}}>Detail Inquiry</div>
              <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",color:"var(--clay)",cursor:"pointer",fontSize:"1.2rem"}}>✕</button>
            </div>
            <div style={{padding:"1.5rem",display:"flex",flexDirection:"column",gap:"1.2rem"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}>
                {[["Nama",selected.nama_lengkap],["No. HP",selected.nomor_hp],["Email",selected.email||"—"],["Kategori",selected.keterangan||"Umum"]].map(([k,v])=>(
                  <div key={k}><div style={{fontSize:".7rem",fontWeight:600,letterSpacing:".08em",textTransform:"uppercase",color:"var(--earth)",marginBottom:".3rem"}}>{k}</div><div style={{fontSize:".88rem",color:"var(--text)"}}>{v}</div></div>
                ))}
              </div>
              <div style={{background:"var(--sand)",padding:"1rem 1.2rem",border:"1px solid var(--mist)"}}>
                <div style={{fontSize:".7rem",fontWeight:600,letterSpacing:".08em",textTransform:"uppercase",color:"var(--earth)",marginBottom:".5rem"}}>Pesan</div>
                <div style={{fontSize:".88rem",lineHeight:1.7,color:"var(--text)"}}>{selected.pesan}</div>
              </div>
              <div>
                <Inp label="Catatan Admin (Internal)" value={note} onChange={setNote} rows={3} placeholder="Catatan tindak lanjut internal..."/>
                <div style={{display:"flex",gap:".8rem",marginTop:".8rem",justifyContent:"flex-end"}}>
                  <Btn size="sm" variant="danger" onClick={()=>handleDelete(selected.id)}>🗑 Hapus</Btn>
                  <Btn size="sm" variant="success" onClick={handleSaveNote} disabled={processing}>{processing?"Menyimpan...":"💾 Simpan Catatan"}</Btn>
                </div>
              </div>
              <div style={{display:"flex",gap:".7rem",paddingTop:".8rem",borderTop:"1px solid var(--mist)"}}>
                <a href={`https://wa.me/${selected.nomor_hp?.replace(/\D/g,"")}`} target="_blank" rel="noreferrer" style={{padding:".6rem 1.2rem",background:"#25d366",color:"#fff",textDecoration:"none",fontSize:".78rem",fontWeight:500,letterSpacing:".06em",textTransform:"uppercase",display:"flex",alignItems:"center",gap:".4rem"}}>💬 WhatsApp</a>
                {selected.email&&<a href={`mailto:${selected.email}`} style={{padding:".6rem 1.2rem",background:"var(--espresso)",color:"var(--sand)",textDecoration:"none",fontSize:".78rem",fontWeight:500,letterSpacing:".06em",textTransform:"uppercase",display:"flex",alignItems:"center",gap:".4rem"}}>✉️ Email</a>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── SITE CONFIG ADMIN ─────────────────────────────────────
function AdminSiteConfig(){
  const SECTIONS=[
    {key:"general",label:"⚙ Umum",fields:[{k:"site_name",l:"Nama Website"},{k:"tagline",l:"Tagline"},{k:"footer_text",l:"Teks Footer"},{k:"whatsapp",l:"No. WhatsApp (628xxx)"}]},
    {key:"hero",label:"🖼 Hero/Banner",fields:[{k:"hero_title",l:"Judul Hero"},{k:"hero_subtitle",l:"Sub-Judul Hero",rows:2},{k:"hero_btn_text",l:"Teks Tombol"}]},
    {key:"about",label:"📖 Tentang Kami",fields:[{k:"about_title",l:"Judul"},{k:"about_text",l:"Teks Tentang Kami",rows:4}]},
    {key:"contact",label:"📞 Kontak",fields:[{k:"contact_phone",l:"Telepon"},{k:"contact_email",l:"Email"},{k:"contact_address",l:"Alamat Kantor"}]},
    {key:"payment",label:"💳 Pembayaran",fields:[{k:"bank_name",l:"Nama Bank"},{k:"bank_account",l:"No. Rekening"},{k:"bank_owner",l:"Atas Nama"}]},
  ];
  const [activeSection,setActiveSection]=useState("general");
  const [form,setForm]=useState(null);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [saved,setSaved]=useState(false);

  useEffect(()=>{api.siteConfig.get().then(r=>setForm(r.data)).catch(console.error).finally(()=>setLoading(false));},[]);

  const handleSave=async()=>{
    setSaving(true);setSaved(false);
    try{await api.siteConfig.update(form);setSaved(true);setTimeout(()=>setSaved(false),3500);}
    catch(e){alert("Gagal: "+e.message);}finally{setSaving(false);}
  };

  if(loading||!form)return<div style={{padding:"3rem",textAlign:"center",color:"var(--light)"}}>Memuat konfigurasi...</div>;

  return(
    <div>
      {saved&&<div style={{position:"fixed",top:"1.5rem",right:"1.5rem",zIndex:500,background:"var(--green)",color:"#fff",padding:".9rem 1.8rem",fontSize:".85rem",fontWeight:500,boxShadow:"0 8px 24px rgba(0,0,0,.15)",animation:"slideDown .3s ease"}}>✓ Perubahan berhasil disimpan dan diterapkan!</div>}
      <div style={{display:"grid",gridTemplateColumns:"200px 1fr",gap:"1.5rem"}}>
        <div style={{background:"var(--white)",border:"1px solid var(--mist)",padding:"1rem",height:"fit-content"}}>
          <div style={{fontSize:".68rem",fontWeight:600,letterSpacing:".12em",textTransform:"uppercase",color:"var(--light)",padding:".4rem .5rem",marginBottom:".4rem"}}>Bagian Website</div>
          {SECTIONS.map(s=>(
            <button key={s.key} onClick={()=>setActiveSection(s.key)} style={{display:"block",width:"100%",textAlign:"left",padding:".65rem .9rem",background:activeSection===s.key?"var(--espresso)":"transparent",color:activeSection===s.key?"var(--sand)":"var(--light)",border:"none",cursor:"pointer",fontSize:".82rem",fontWeight:activeSection===s.key?500:400,marginBottom:".1rem",transition:"all .15s"}}>{s.label}</button>
          ))}
          <div style={{marginTop:"1.5rem",borderTop:"1px solid var(--mist)",paddingTop:"1rem"}}>
            <div style={{fontSize:".68rem",fontWeight:600,letterSpacing:".12em",textTransform:"uppercase",color:"var(--light)",padding:".4rem .5rem",marginBottom:".4rem"}}>Pembayaran DP</div>
            <button onClick={()=>setActiveSection("payment-extra")} style={{display:"block",width:"100%",textAlign:"left",padding:".65rem .9rem",background:activeSection==="payment-extra"?"var(--espresso)":"transparent",color:activeSection==="payment-extra"?"var(--sand)":"var(--light)",border:"none",cursor:"pointer",fontSize:".82rem"}}>💰 Ketentuan DP</button>
          </div>
        </div>
        <div style={{background:"var(--white)",border:"1px solid var(--mist)",padding:"2rem"}}>
          {SECTIONS.filter(s=>s.key===activeSection).map(s=>(
            <div key={s.key}>
              <Tag label={s.label}/>
              <div style={{fontFamily:"var(--serif)",fontSize:"1.5rem",fontWeight:300,color:"var(--espresso)",marginBottom:"1.5rem"}}>{s.label.replace(/[^\w\s]/gi,"")} Settings</div>
              <div style={{display:"flex",flexDirection:"column",gap:"1.2rem"}}>
                {s.fields.map(f=>(
                  <Inp key={f.k} label={f.l} value={form[f.k]||""} onChange={v=>setForm(p=>({...p,[f.k]:v}))} rows={f.rows||null}/>
                ))}
              </div>
            </div>
          ))}
          {activeSection==="payment-extra"&&(
            <div>
              <Tag label="💰 Ketentuan DP"/>
              <div style={{fontFamily:"var(--serif)",fontSize:"1.5rem",fontWeight:300,color:"var(--espresso)",marginBottom:"1.5rem"}}>Ketentuan Uang Muka</div>
              <div style={{display:"flex",flexDirection:"column",gap:"1.5rem"}}>
                <div>
                  <div style={{fontSize:".72rem",fontWeight:600,letterSpacing:".08em",textTransform:"uppercase",color:"var(--earth)",marginBottom:".6rem"}}>Persentase Minimal DP</div>
                  <div style={{display:"flex",alignItems:"center",gap:"1.5rem"}}>
                    <input type="range" min={5} max={50} step={5} value={form.dp_min_percent||10} onChange={e=>setForm(p=>({...p,dp_min_percent:parseInt(e.target.value)}))} style={{flex:1}}/>
                    <span style={{fontFamily:"var(--serif)",fontSize:"2rem",color:"var(--accent)",fontWeight:500,minWidth:70}}>{form.dp_min_percent||10}%</span>
                  </div>
                  <div style={{fontSize:".78rem",color:"var(--light)",marginTop:".5rem"}}>Minimal DP yang harus dibayar pembeli saat melakukan booking</div>
                </div>
                <div style={{background:"var(--sand)",padding:"1.2rem 1.5rem",border:"1px solid var(--mist)"}}>
                  <div style={{fontSize:".72rem",fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:"var(--earth)",marginBottom:".8rem"}}>Preview Info Rekening (tampil ke pembeli)</div>
                  <div style={{display:"flex",flexDirection:"column",gap:".5rem"}}>
                    {[["Bank",form.bank_name],["No. Rekening",form.bank_account],["Atas Nama",form.bank_owner],["Minimal DP",`${form.dp_min_percent||10}% dari harga properti`]].map(([k,v])=>(
                      <div key={k} style={{display:"flex",justifyContent:"space-between",padding:".5rem 0",borderBottom:"1px solid var(--mist)",fontSize:".83rem"}}>
                        <span style={{color:"var(--light)"}}>{k}</span>
                        <span style={{fontWeight:500,color:"var(--espresso)"}}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          <div style={{marginTop:"2rem",paddingTop:"1.5rem",borderTop:"1px solid var(--mist)",display:"flex",justifyContent:"flex-end",gap:"1rem"}}>
            <Btn variant="ghost" onClick={()=>api.siteConfig.get().then(r=>setForm(r.data))}>↩ Reset</Btn>
            <Btn variant="success" onClick={handleSave} disabled={saving}>{saving?"💾 Menyimpan...":"💾 Simpan Semua Perubahan"}</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ADMIN LAYOUT ──────────────────────────────────────────
export default function AdminDashboard(){
  const navigate=useNavigate();
  const location=useLocation();
  const [activeNav,setActiveNav]=useState("overview");
  const [user,setUser]=useState(null);
  const [pendingCount,setPendingCount]=useState(0);
  const [unreadCount,setUnreadCount]=useState(0);

  useEffect(()=>{
    const u=localStorage.getItem("auth_user");
    if(!u){navigate("/admin");return;}
    setUser(JSON.parse(u));
  },[navigate]);

  useEffect(()=>{
    const seg=location.pathname.split("/").pop();
    if(["overview","bookings","inquiries","site-config"].includes(seg))setActiveNav(seg);
  },[location]);

  useEffect(()=>{
    api.bookings.getPending().then(r=>setPendingCount((r.data||[]).length)).catch(()=>{});
    api.inquiries.getUnreadCount().then(r=>setUnreadCount(r.unread_count||0)).catch(()=>{});
    const t=setInterval(()=>{
      api.bookings.getPending().then(r=>setPendingCount((r.data||[]).length)).catch(()=>{});
      api.inquiries.getUnreadCount().then(r=>setUnreadCount(r.unread_count||0)).catch(()=>{});
    },30000);
    return()=>clearInterval(t);
  },[]);

  const handleLogout=async()=>{await api.auth.logout();navigate("/");};
  const navTo=(key)=>{setActiveNav(key);navigate(`/admin/${key}`,{replace:true});};

  if(!user)return null;

  const navItems=[
    {key:"overview",icon:"📊",label:"Dashboard"},
    {key:"bookings",icon:"📋",label:"Booking",badge:pendingCount},
    {key:"inquiries",icon:"💌",label:"Inquiry",badge:unreadCount},
    {key:"site-config",icon:"🎨",label:"Tampilan Website"},
  ];

  return(
    <div style={{display:"flex",minHeight:"100vh",background:"#F0EBE3"}}>
      <style>{CSS}</style>
      {/* Sidebar */}
      <aside style={{width:240,background:"var(--espresso)",display:"flex",flexDirection:"column",flexShrink:0,position:"sticky",top:0,height:"100vh",overflowY:"auto"}}>
        <div style={{padding:"1.6rem 1.5rem",borderBottom:"1px solid rgba(200,180,154,.15)"}}>
          <div style={{fontFamily:"var(--serif)",fontSize:"1.3rem",color:"var(--sand)",letterSpacing:".08em",marginBottom:".1rem"}}>HAVEN<span style={{color:"var(--accent)"}}>EST</span></div>
          <div style={{fontSize:".68rem",color:"var(--clay)",letterSpacing:".1em",textTransform:"uppercase"}}>Admin Panel</div>
        </div>
        <nav style={{padding:".8rem",flex:1}}>
          {navItems.map(n=>(
            <button key={n.key} onClick={()=>navTo(n.key)} style={{display:"flex",alignItems:"center",gap:".8rem",width:"100%",padding:".75rem 1rem",background:activeNav===n.key?"rgba(181,132,74,.2)":"transparent",border:activeNav===n.key?"1px solid rgba(181,132,74,.25)":"1px solid transparent",color:activeNav===n.key?"var(--accent)":"var(--clay)",fontSize:".82rem",fontWeight:activeNav===n.key?600:400,cursor:"pointer",marginBottom:".2rem",transition:"all .15s",textAlign:"left",position:"relative"}}>
              <span style={{fontSize:"1rem"}}>{n.icon}</span><span style={{flex:1}}>{n.label}</span>
              {n.badge>0&&<span style={{background:"var(--red)",color:"#fff",fontSize:".65rem",fontWeight:700,padding:".1rem .5rem",borderRadius:"10px"}}>{n.badge}</span>}
            </button>
          ))}
        </nav>
        <div style={{padding:".8rem",borderTop:"1px solid rgba(200,180,154,.15)"}}>
          <button onClick={()=>navigate("/")} style={{display:"flex",alignItems:"center",gap:".8rem",width:"100%",padding:".7rem 1rem",background:"transparent",border:"1px solid transparent",color:"var(--clay)",fontSize:".82rem",cursor:"pointer",marginBottom:".2rem",textAlign:"left"}}>🌐 <span>Lihat Website</span></button>
          <button onClick={handleLogout} style={{display:"flex",alignItems:"center",gap:".8rem",width:"100%",padding:".7rem 1rem",background:"transparent",border:"1px solid transparent",color:"#f87171",fontSize:".82rem",cursor:"pointer",textAlign:"left"}}>🚪 <span>Keluar</span></button>
        </div>
      </aside>
      {/* Main */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <header style={{background:"var(--white)",borderBottom:"1px solid var(--mist)",padding:"1rem 2rem",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div style={{fontFamily:"var(--serif)",fontSize:"1.4rem",fontWeight:300,color:"var(--espresso)"}}>
            {navItems.find(n=>n.key===activeNav)?.label||"Dashboard"}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:".8rem"}}>
            <div style={{width:32,height:32,borderRadius:"50%",background:"var(--earth)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--serif)",fontSize:"1rem",color:"#fff"}}>{user.name?.[0]||"A"}</div>
            <div><div style={{fontSize:".82rem",fontWeight:500,color:"var(--espresso)"}}>{user.name}</div><div style={{fontSize:".7rem",color:"var(--light)"}}>Administrator</div></div>
          </div>
        </header>
        <main style={{flex:1,overflowY:"auto",padding:"1.8rem 2rem"}}>
          <Routes>
            <Route path="overview" element={<Overview onNav={navTo}/>}/>
            <Route path="bookings" element={<AdminBookings/>}/>
            <Route path="inquiries" element={<AdminInquiries/>}/>
            <Route path="site-config" element={<AdminSiteConfig/>}/>
            <Route path="*" element={<Overview onNav={navTo}/>}/>
          </Routes>
        </main>
      </div>
    </div>
  );
}
