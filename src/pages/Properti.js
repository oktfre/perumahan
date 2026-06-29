import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../utils/useApi";
import { fmt, calcKPR, BADGE_COLORS } from "../utils/helpers";

// ── STYLES ────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root { --sand:#F5F0E8;--clay:#C8B49A;--earth:#8C6F5A;--espresso:#2C1F14;--white:#FDFCFA;--mist:#EAE5DC;--accent:#B5844A;--text:#3A2E25;--light:#7A7065;--green:#4A7C59;--red:#A04040;--serif:'Cormorant Garamond',serif;--sans:'DM Sans',sans-serif; }
  body { font-family: var(--sans); background: var(--white); color: var(--text); overflow-x: hidden; }
  input,select,textarea,button { font-family: var(--sans); }
  input:focus,select:focus,textarea:focus { outline: none; }
  input[type=range]{-webkit-appearance:none;width:100%;height:4px;background:var(--mist);border-radius:2px;outline:none;}
  input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:var(--accent);cursor:pointer;border:3px solid var(--white);box-shadow:0 2px 8px rgba(181,132,74,.4);}
  @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes backdropIn{from{opacity:0}to{opacity:1}}
  @keyframes slideUp{from{opacity:0;transform:translateY(60px)}to{opacity:1;transform:translateY(0)}}
  .kpr-backdrop{position:fixed;inset:0;z-index:1000;background:rgba(44,31,20,.65);backdrop-filter:blur(6px);animation:backdropIn .3s ease;display:flex;align-items:flex-end;justify-content:center;}
  .kpr-sheet{width:100%;max-width:1280px;height:92vh;background:var(--espresso);border-radius:16px 16px 0 0;display:flex;flex-direction:column;overflow:hidden;animation:slideUp .45s cubic-bezier(.16,1,.3,1);}
`;

// ── ATOMS ─────────────────────────────────────────────────
const Btn = ({ children, variant="primary", onClick, style={}, disabled=false, full=false }) => {
  const [h,setH]=useState(false);
  const map={
    primary:{bg:h&&!disabled?"var(--accent)":"var(--espresso)",color:"var(--sand)"},
    ghost:{bg:h&&!disabled?"var(--mist)":"transparent",color:"var(--earth)",border:"1.5px solid var(--clay)"},
    danger:{bg:h&&!disabled?"#8b3030":"var(--red)",color:"#fff"},
    success:{bg:h&&!disabled?"#3d6b4a":"var(--green)",color:"#fff"},
    kpr:{bg:h&&!disabled?"#3d6b4a":"var(--green)",color:"#fff"},
    booking:{bg:h&&!disabled?"#5c3a8e":"#6B4F8C",color:"#fff"},
  };
  const v=map[variant]||map.primary;
  return <button onClick={disabled?undefined:onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} disabled={disabled} style={{fontFamily:"var(--sans)",fontSize:".82rem",fontWeight:500,letterSpacing:".07em",textTransform:"uppercase",border:v.border||"none",cursor:disabled?"not-allowed":"pointer",padding:".75rem 1.6rem",transition:"all .2s",opacity:disabled?.5:1,background:v.bg,color:v.color,transform:h&&!disabled?"translateY(-1px)":"none",width:full?"100%":"auto",...style}}>{children}</button>;
};

const Tag=({label})=>(<div style={{display:"flex",alignItems:"center",gap:".5rem",fontSize:".7rem",letterSpacing:".14em",textTransform:"uppercase",color:"var(--accent)",marginBottom:".6rem"}}><span style={{width:18,height:1,background:"var(--accent)",display:"block"}}/>{label}</div>);

const Inp=({label,value,onChange,type="text",placeholder="",required=false,options=null,rows=null,error=""})=>(
  <div style={{display:"flex",flexDirection:"column",gap:".4rem"}}>
    <label style={{fontSize:".75rem",fontWeight:500,letterSpacing:".08em",textTransform:"uppercase",color:"var(--earth)"}}>{label}{required&&<span style={{color:"var(--accent)"}}> *</span>}</label>
    {options?(<select value={value} onChange={e=>onChange(e.target.value)} style={{padding:".7rem 1rem",border:`1px solid ${error?"var(--red)":"var(--mist)"}`,background:"var(--white)",color:"var(--text)",fontSize:".88rem"}}><option value="">Pilih {label}</option>{options.map(o=><option key={o} value={o}>{o}</option>)}</select>
    ):rows?(<textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{padding:".7rem 1rem",border:`1px solid ${error?"var(--red)":"var(--mist)"}`,background:"var(--white)",color:"var(--text)",fontSize:".88rem",resize:"vertical"}}/>
    ):(<input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{padding:".7rem 1rem",border:`1px solid ${error?"var(--red)":"var(--mist)"}`,background:"var(--white)",color:"var(--text)",fontSize:".88rem"}}/>)}
    {error&&<span style={{fontSize:".72rem",color:"var(--red)"}}>⚠ {error}</span>}
  </div>
);

// ── KPR MODAL ─────────────────────────────────────────────
function KPRModal({prop,onClose}){
  const [harga,setHarga]=useState(Math.round(prop.price/1e6));
  const [dp,setDp]=useState(20);
  const [tenor,setTenor]=useState(20);
  const [rate,setRate]=useState(10.5);
  const [tab,setTab]=useState("ringkasan");
  useEffect(()=>{document.body.style.overflow="hidden";return()=>{document.body.style.overflow="";};});
  const hargaRp=harga*1e6,dpRp=hargaRp*dp/100,pokok=hargaRp-dpRp;
  const cicilan=calcKPR(pokok,rate,tenor),totalBayar=cicilan*tenor*12,totalBunga=totalBayar-pokok;
  const rekoGaji=cicilan*3,ratioCicil=(cicilan/rekoGaji)*100;
  const fmtM=n=>n>=1e9?`Rp ${(n/1e9).toFixed(2).replace(/\.?0+$/,"")} M`:`Rp ${(n/1e6).toFixed(0)} Jt`;
  const Slider=({label,value,min,max,step=1,onChange,suffix="",fmtFn})=>{
    const pct=((value-min)/(max-min))*100;
    return(<div style={{display:"flex",flexDirection:"column",gap:".5rem"}}><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:".65rem",letterSpacing:".1em",textTransform:"uppercase",color:"var(--clay)"}}>{label}</span><span style={{fontFamily:"var(--serif)",fontSize:"1.1rem",color:"var(--sand)"}}>{fmtFn?fmtFn(value):value}{suffix}</span></div><div style={{position:"relative"}}><div style={{position:"absolute",top:"50%",left:0,height:4,width:`${pct}%`,background:"var(--accent)",transform:"translateY(-50%)",borderRadius:2,pointerEvents:"none"}}/><input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(Number(e.target.value))}/></div></div>);
  };
  return(
    <div className="kpr-backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="kpr-sheet">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"1rem 2rem .8rem",borderBottom:"1px solid rgba(200,180,154,.15)",flexShrink:0}}>
          <div><div style={{fontFamily:"var(--serif)",fontSize:"1.4rem",color:"var(--sand)"}}>Simulasi KPR</div><div style={{fontSize:".75rem",color:"var(--clay)"}}>📍 {prop.name} · <span style={{color:"var(--accent)"}}>{fmt(prop.price)}</span></div></div>
          <div style={{display:"flex",alignItems:"center",gap:"1.5rem"}}>
            <div style={{textAlign:"right"}}><div style={{fontSize:".62rem",letterSpacing:".12em",textTransform:"uppercase",color:"var(--clay)"}}>Cicilan / Bulan</div><div style={{fontFamily:"var(--serif)",fontSize:"1.6rem",color:"var(--accent)"}}>{fmtM(cicilan)}</div></div>
            <button onClick={onClose} style={{width:36,height:36,border:"1px solid rgba(200,180,154,.3)",background:"rgba(255,255,255,.06)",color:"var(--clay)",cursor:"pointer",fontSize:"1.1rem",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"300px 1fr",flex:1,overflow:"hidden"}}>
          <div style={{borderRight:"1px solid rgba(200,180,154,.15)",overflowY:"auto",padding:"1.5rem",display:"flex",flexDirection:"column",gap:"1.6rem"}}>
            {[{t:"💰 Harga",el:<><Slider label="Harga" value={harga} min={300} max={10000} step={50} onChange={setHarga} fmtFn={v=>fmtM(v*1e6)}/></>},
              {t:"🏦 DP",el:<><Slider label="DP %" value={dp} min={10} max={80} step={1} onChange={setDp} suffix="%"/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:".5rem",marginTop:".7rem"}}>{[["DP",fmtM(dpRp)],["Pinjaman",fmtM(pokok)]].map(([l,v])=><div key={l} style={{background:"rgba(255,255,255,.05)",border:"1px solid rgba(200,180,154,.15)",padding:".55rem .7rem"}}><div style={{fontSize:".58rem",letterSpacing:".1em",textTransform:"uppercase",color:"var(--clay)"}}>{l}</div><div style={{fontFamily:"var(--serif)",fontSize:".9rem",color:"var(--sand)"}}>{v}</div></div>)}</div></>},
              {t:"📅 Tenor",el:<><Slider label="Tahun" value={tenor} min={1} max={30} step={1} onChange={setTenor} suffix=" thn"/><div style={{display:"flex",gap:".4rem",flexWrap:"wrap",marginTop:".7rem"}}>{[5,10,15,20,25,30].map(t=><button key={t} onClick={()=>setTenor(t)} style={{padding:".3rem .6rem",background:tenor===t?"var(--accent)":"transparent",border:"1px solid "+(tenor===t?"var(--accent)":"rgba(200,180,154,.25)"),color:tenor===t?"var(--white)":"var(--clay)",fontSize:".68rem",cursor:"pointer"}}>{t}T</button>)}</div></>},
              {t:"📈 Bunga/Tahun",el:<Slider label="Bunga" value={rate} min={5} max={18} step={0.25} onChange={setRate} suffix="%" fmtFn={v=>v.toFixed(2)}/>},
            ].map(({t,el})=>(<div key={t}><div style={{fontSize:".68rem",fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:"var(--clay)",paddingBottom:".5rem",borderBottom:"1px solid rgba(200,180,154,.15)",marginBottom:".9rem"}}>{t}</div>{el}</div>))}
            <div><div style={{fontSize:".68rem",fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:"var(--clay)",paddingBottom:".5rem",borderBottom:"1px solid rgba(200,180,154,.15)",marginBottom:".9rem"}}>💡 Kemampuan Bayar</div>
              <div style={{padding:".9rem 1rem",background:"rgba(245,240,232,.06)",border:"1px solid rgba(200,180,154,.2)"}}><div style={{fontSize:".62rem",letterSpacing:".1em",textTransform:"uppercase",color:"var(--clay)"}}>Gaji Min Disarankan</div><div style={{fontFamily:"var(--serif)",fontSize:"1.3rem",color:"var(--sand)"}}>{fmtM(rekoGaji)}</div></div>
              <div style={{marginTop:".7rem"}}><div style={{display:"flex",justifyContent:"space-between",fontSize:".68rem",color:"var(--clay)",marginBottom:".3rem"}}><span>Rasio Cicilan/Gaji</span><span style={{color:ratioCicil<=33?"#90EE90":ratioCicil<=50?"var(--clay)":"#ffb3b3"}}>{Math.round(ratioCicil)}% {ratioCicil<=33?"✓ Aman":ratioCicil<=50?"⚠ Batas":"✗ Berat"}</span></div><div style={{height:6,background:"rgba(255,255,255,.1)",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(ratioCicil,100)}%`,background:ratioCicil<=33?"var(--green)":ratioCicil<=50?"var(--accent)":"var(--red)",transition:"width .5s",borderRadius:3}}/></div></div>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",overflow:"hidden"}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",borderBottom:"1px solid rgba(200,180,154,.15)",flexShrink:0}}>
              {[["Cicilan/Bulan",cicilan,"var(--accent)",true],["Total Bayar",totalBayar,"var(--sand)"],["Total Bunga",totalBunga,"#ff9999"],["Pokok",pokok,"#99ccff"]].map(([l,v,c,big])=>(
                <div key={l} style={{padding:"1rem 1.4rem",borderRight:"1px solid rgba(200,180,154,.12)",background:big?"rgba(181,132,74,.12)":"transparent"}}>
                  <div style={{fontSize:".62rem",letterSpacing:".1em",textTransform:"uppercase",color:"var(--clay)",marginBottom:".35rem"}}>{l}</div>
                  <div style={{fontFamily:"var(--serif)",fontSize:big?"1.6rem":"1.2rem",color:c,lineHeight:1}}>{fmtM(v)}</div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",borderBottom:"1px solid rgba(200,180,154,.15)",background:"rgba(255,255,255,.03)",flexShrink:0}}>
              {[["ringkasan","📊 Ringkasan"],["jadwal","📋 Jadwal"],["tips","💡 Tips"]].map(([k,l])=>(
                <button key={k} onClick={()=>setTab(k)} style={{padding:".85rem 1.5rem",background:"none",border:"none",borderBottom:tab===k?"2px solid var(--accent)":"2px solid transparent",marginBottom:-1,fontFamily:"var(--sans)",fontSize:".76rem",fontWeight:500,color:tab===k?"var(--accent)":"var(--clay)",cursor:"pointer"}}>{l}</button>
              ))}
            </div>
            <div style={{flex:1,overflowY:"auto",padding:"1.5rem 2rem"}}>
              {tab==="ringkasan"&&(
                <div>{[["Harga Properti",fmtM(harga*1e6)],["Uang Muka ("+dp+"%)",fmtM(dpRp)],["Pokok Pinjaman",fmtM(pokok)],["Suku Bunga/Tahun",rate.toFixed(2)+"%"],["Tenor",tenor+" tahun"],["Cicilan/Bulan",fmtM(cicilan)],["Total Bunga",fmtM(totalBunga)],["Total Pembayaran",fmtM(totalBayar)]].map(([k,v],i)=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",padding:".55rem .8rem",background:i>=5?"rgba(181,132,74,.08)":"transparent",borderBottom:"1px solid rgba(200,180,154,.1)"}}>
                    <span style={{fontSize:".78rem",color:"var(--clay)"}}>{k}</span>
                    <span style={{fontSize:".82rem",fontWeight:i>=5?600:400,color:i===5?"var(--accent)":i===6?"#ff9999":"var(--sand)",fontFamily:i>=5?"var(--serif)":"var(--sans)"}}>{v}</span>
                  </div>
                ))}</div>
              )}
              {tab==="jadwal"&&(
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:".78rem"}}>
                  <thead><tr style={{background:"rgba(255,255,255,.06)"}}>{["Bulan","Cicilan","Bunga","Pokok","Sisa"].map(h=><th key={h} style={{padding:".6rem .9rem",textAlign:"right",fontSize:".62rem",letterSpacing:".08em",textTransform:"uppercase",color:"var(--clay)"}}>{h}</th>)}</tr></thead>
                  <tbody>{Array.from({length:Math.min(tenor*12,60)},(_,i)=>{const r=rate/100/12,c=calcKPR(pokok,rate,tenor);let s=pokok;for(let k=0;k<i;k++){s-=c-s*r;}const bunga=Math.max(0,s)*r,pok=c-bunga;s-=pok;const isY=(i+1)%12===0;return(<tr key={i} style={{background:isY?"rgba(181,132,74,.1)":i%2===0?"transparent":"rgba(255,255,255,.02)",borderBottom:"1px solid rgba(200,180,154,.08)"}}><td style={{padding:".5rem .9rem",color:isY?"var(--accent)":"var(--clay)",fontWeight:isY?600:400}}>{isY?`📅 Thn ${(i+1)/12}`:i+1}</td><td style={{padding:".5rem .9rem",textAlign:"right",fontFamily:"var(--serif)",color:"var(--sand)"}}>{fmtM(c)}</td><td style={{padding:".5rem .9rem",textAlign:"right",color:"#ff9999"}}>{fmtM(bunga)}</td><td style={{padding:".5rem .9rem",textAlign:"right",color:"#90EE90"}}>{fmtM(pok)}</td><td style={{padding:".5rem .9rem",textAlign:"right",fontFamily:"var(--serif)",color:"var(--sand)"}}>{fmtM(Math.max(0,s))}</td></tr>);})}</tbody>
                </table>
              )}
              {tab==="tips"&&(
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}>
                  {[["🏦","Perbesar DP","var(--accent)",`DP ${dp}% saat ini. Menaikkan ke 30% bisa memangkas ratusan juta bunga.`],["⏰","Persingkat Tenor","#6699ff","Tenor lebih singkat = total bunga jauh lebih kecil meski cicilan naik."],["💰","Cicil Ekstra","var(--green)","Cicilan ekstra langsung memangkas pokok dan mengurangi bunga berikutnya."],["🔄","Refinancing","var(--earth)","Setelah 3-5 tahun, pertimbangkan pindah bank bila bunga pasar turun."]].map(([ic,t,c,d])=>(
                    <div key={t} style={{padding:"1.1rem",border:"1px solid rgba(200,180,154,.15)",borderLeft:`3px solid ${c}`,background:"rgba(255,255,255,.03)"}}>
                      <div style={{fontSize:"1.3rem",marginBottom:".5rem"}}>{ic}</div>
                      <div style={{fontSize:".82rem",fontWeight:600,color:"var(--sand)",marginBottom:".4rem"}}>{t}</div>
                      <div style={{fontSize:".75rem",color:"var(--clay)",lineHeight:1.65}}>{d}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── FORM PAGE (Tambah/Edit Properti) ──────────────────────
function FormSection({title,children}){
  return(<div style={{border:"1px solid var(--mist)",overflow:"hidden"}}>
    <div style={{background:"var(--sand)",padding:".9rem 1.4rem",borderBottom:"1px solid var(--mist)"}}><div style={{fontSize:".75rem",fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:"var(--earth)"}}>{title}</div></div>
    <div style={{padding:"1.4rem",display:"flex",flexDirection:"column",gap:"1rem"}}>{children}</div>
  </div>);
}

function FormPage({prop,onBack,onSave}){
  const isEdit=!!prop;
  const empty={name:"",location:"",price:"",type:"",badge:"Baru",status:"Dijual",beds:"",baths:"",area:"",luas_bangunan_m2:"36",floor:"",year:new Date().getFullYear().toString(),desc:"",img:"",facilities:[]};
  const [form,setForm]=useState(isEdit?{...prop,price:String(prop.price/1e6),facilities:[...prop.facilities]}:empty);
  const [errors,setErrors]=useState({});
  const [saved,setSaved]=useState(false);
  const [saving,setSaving]=useState(false);
  const [newFac,setNewFac]=useState("");
  const set=(k,v)=>{setForm(f=>({...f,[k]:v}));setErrors(e=>({...e,[k]:""}));};
  const validate=()=>{const e={};if(!form.name)e.name="Wajib diisi";if(!form.location)e.location="Wajib diisi";if(!form.price)e.price="Wajib diisi";if(!form.type)e.type="Wajib dipilih";if(!form.beds)e.beds="Wajib diisi";if(!form.area)e.area="Wajib diisi";setErrors(e);return Object.keys(e).length===0;};
  const handleSave=async()=>{if(!validate())return;setSaving(true);try{const data={...form,price:Number(form.price)*1e6,beds:Number(form.beds),baths:Number(form.baths),area:Number(form.area),luas_bangunan_m2:Number(form.luas_bangunan_m2)||36,floor:Number(form.floor),year:Number(form.year),imgs:form.img?[form.img]:[],id:prop?.id||Date.now()};setSaved(true);setTimeout(()=>onSave(data),600);}catch(e){alert("Gagal menyimpan: "+e.message);}finally{setSaving(false);}};
  const addFac=()=>{if(newFac.trim()&&!form.facilities.includes(newFac.trim())){set("facilities",[...form.facilities,newFac.trim()]);setNewFac("");}};
  const F=({k,label,...rest})=>(<div><Inp label={label} value={form[k]} onChange={v=>set(k,v)} error={errors[k]} {...rest}/></div>);
  return(
    <div style={{minHeight:"100vh",background:"var(--white)",animation:"fadeIn .4s ease"}}>
      <div style={{background:"var(--espresso)",padding:"2rem 3rem",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><Tag label={isEdit?"Edit Properti":"Tambah Properti"}/><h1 style={{fontFamily:"var(--serif)",fontSize:"clamp(1.6rem,2.5vw,2.2rem)",fontWeight:300,color:"var(--sand)"}}>{isEdit?`Edit: ${prop.name}`:"Tambah Properti Baru"}</h1></div>
        <div style={{display:"flex",gap:".8rem"}}><Btn variant="ghost" onClick={onBack} style={{color:"var(--clay)",borderColor:"rgba(200,180,154,.4)"}}>Batal</Btn>{saved?<Btn variant="success" disabled>✓ Tersimpan!</Btn>:<Btn variant="success" onClick={handleSave} disabled={saving}>{saving?"Menyimpan...":isEdit?"💾 Simpan Perubahan":"✚ Tambah Properti"}</Btn>}</div>
      </div>
      <div style={{padding:"2.5rem 3rem",display:"grid",gridTemplateColumns:"1fr 360px",gap:"2.5rem",maxWidth:1200}}>
        <div style={{display:"flex",flexDirection:"column",gap:"2rem"}}>
          <FormSection title="Informasi Dasar">
            <F k="name" label="Nama Properti" placeholder="cth: The Olive Residence" required/>
            <F k="location" label="Lokasi / Alamat" placeholder="cth: Dago Atas, Bandung" required/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}><F k="type" label="Tipe" options={["Rumah Tapak","Villa","Townhouse","Apartemen","Ruko"]} required/><F k="status" label="Status" options={["Dijual","Disewa","Terjual"]}/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}><F k="badge" label="Label" options={["Baru","Terlaris","Promo","Eksklusif"]}/><F k="year" label="Tahun Dibangun" type="number" placeholder="2024"/></div>
          </FormSection>
          <FormSection title="Harga">
            <F k="price" label="Harga (Juta Rupiah)" type="number" placeholder="cth: 2400 = Rp 2,4 Miliar" required/>
            {form.price&&<div style={{fontSize:".78rem",color:"var(--accent)"}}>= {fmt(Number(form.price)*1e6)}</div>}
          </FormSection>
          <FormSection title="Spesifikasi">
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"1rem"}}><F k="beds" label="Kamar Tidur" type="number" placeholder="4" required/><F k="baths" label="Kamar Mandi" type="number" placeholder="3"/><F k="luas_bangunan_m2" label="Luas Bangunan (m²)" type="number" placeholder="36"/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}><F k="area" label="Luas Bangunan (m²)" type="number" placeholder="280" required/><F k="floor" label="Jumlah Lantai" type="number" placeholder="2"/></div>
          </FormSection>
          <FormSection title="Deskripsi"><Inp label="Deskripsi Properti" value={form.desc} onChange={v=>set("desc",v)} placeholder="Tuliskan deskripsi lengkap..." rows={5}/></FormSection>
          <FormSection title="Fasilitas">
            <div style={{display:"flex",gap:".7rem"}}>
              <input value={newFac} onChange={e=>setNewFac(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addFac()} placeholder="Tambah fasilitas (Enter)..." style={{flex:1,padding:".7rem 1rem",border:"1px solid var(--mist)",fontFamily:"var(--sans)",fontSize:".88rem",color:"var(--text)"}}/>
              <Btn onClick={addFac} style={{padding:".7rem 1.2rem"}}>+ Tambah</Btn>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:".5rem",marginTop:".5rem"}}>
              {form.facilities.map(f=>(<div key={f} style={{display:"flex",alignItems:"center",gap:".4rem",background:"var(--mist)",padding:".35rem .8rem",fontSize:".78rem"}}>{f}<button onClick={()=>set("facilities",form.facilities.filter(x=>x!==f))} style={{background:"none",border:"none",color:"var(--light)",cursor:"pointer",fontSize:".9rem",lineHeight:1,padding:0}}>✕</button></div>))}
              {form.facilities.length===0&&<span style={{fontSize:".78rem",color:"var(--light)"}}>Belum ada fasilitas</span>}
            </div>
          </FormSection>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:"1.5rem",alignSelf:"start"}}>
          <FormSection title="Foto Utama">
            <Inp label="URL Foto" value={form.img} onChange={v=>set("img",v)} placeholder="https://..."/>
            {form.img?<div style={{marginTop:".8rem",height:200,background:`url('${form.img}') center/cover no-repeat`,border:"1px solid var(--mist)"}}/>:<div style={{marginTop:".8rem",height:160,background:"var(--mist)",display:"flex",alignItems:"center",justifyContent:"center",border:"1px dashed var(--clay)",color:"var(--light)",fontSize:".82rem",flexDirection:"column",gap:".5rem"}}><span style={{fontSize:"2rem"}}>🖼</span>Preview foto</div>}
          </FormSection>
          <FormSection title="Preview Card">
            <div style={{border:"1px solid var(--mist)",overflow:"hidden"}}>
              <div style={{height:140,background:form.img?`url('${form.img}') center/cover no-repeat`:"var(--mist)",display:"flex",alignItems:"center",justifyContent:"center"}}>{!form.img&&<span style={{color:"var(--clay)",fontSize:".8rem"}}>Belum ada foto</span>}</div>
              <div style={{padding:"1rem"}}><div style={{fontFamily:"var(--serif)",fontSize:"1.2rem",color:"var(--espresso)"}}>{form.price?fmt(Number(form.price)*1e6):"Rp —"}</div><div style={{fontSize:".85rem",fontWeight:500,color:"var(--text)",marginTop:".15rem"}}>{form.name||"Nama Properti"}</div><div style={{fontSize:".75rem",color:"var(--light)",marginTop:".1rem"}}>📍 {form.location||"Lokasi"}</div></div>
            </div>
          </FormSection>
        </div>
      </div>
    </div>
  );
}

// ── DETAIL PAGE ────────────────────────────────────────────
function DetailPage({prop,onBack,onEdit,onBooking}){
  const [activeImg,setActiveImg]=useState(0);
  const [tab,setTab]=useState("deskripsi");
  const [showKPR,setShowKPR]=useState(false);
  const imgs=prop.imgs||[prop.img].filter(Boolean);
  if(!imgs.length)imgs.push("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80");
  const bStatus=prop.booking_status;
  const isSold=prop.status==="Terjual";
  const isPending=bStatus==="pending";
  return(
    <div style={{minHeight:"100vh",background:"var(--white)",animation:"fadeIn .4s ease"}}>
      <div style={{padding:"1.2rem 3rem",borderBottom:"1px solid var(--mist)",display:"flex",alignItems:"center",gap:".7rem",fontSize:".8rem",color:"var(--light)"}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:"var(--accent)",cursor:"pointer",fontSize:".8rem",fontFamily:"var(--sans)",fontWeight:500}}>← Kembali</button>
        <span>/</span><span>Properti</span><span>/</span><span style={{color:"var(--text)"}}>{prop.name}</span>
      </div>
      <div style={{padding:"2rem 3rem"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"2rem",flexWrap:"wrap",gap:"1rem"}}>
          <div>
            <div style={{display:"flex",gap:".6rem",marginBottom:".6rem",flexWrap:"wrap"}}>
              <span style={{background:BADGE_COLORS[prop.badge]||"var(--espresso)",color:"#fff",fontSize:".65rem",letterSpacing:".1em",textTransform:"uppercase",padding:".3rem .7rem"}}>{prop.badge}</span>
              <span style={{background:"var(--mist)",color:"var(--earth)",fontSize:".65rem",letterSpacing:".1em",textTransform:"uppercase",padding:".3rem .7rem"}}>{prop.type}</span>
              <span style={{background:isSold?"#fee2e2":isPending?"#fef3c7":"var(--mist)",color:isSold?"var(--red)":isPending?"#92400e":"var(--green)",fontSize:".65rem",letterSpacing:".1em",textTransform:"uppercase",padding:".3rem .7rem"}}>● {isSold?"Terjual":isPending?"Pre-Booking":prop.status}</span>
            </div>
            <h1 style={{fontFamily:"var(--serif)",fontSize:"clamp(1.8rem,3vw,2.8rem)",fontWeight:300,color:"var(--espresso)",marginBottom:".4rem"}}>{prop.name}</h1>
            <div style={{fontSize:".85rem",color:"var(--light)"}}>📍 {prop.location}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"var(--serif)",fontSize:"clamp(2rem,3.5vw,2.8rem)",fontWeight:500,color:"var(--espresso)"}}>{fmt(prop.price)}</div>
            <div style={{fontSize:".75rem",color:"var(--light)",marginBottom:"1rem"}}>Harga jual</div>
            <div style={{display:"flex",gap:".8rem",flexWrap:"wrap",justifyContent:"flex-end"}}>
              <Btn onClick={onEdit} variant="ghost">✏️ Edit</Btn>
              <Btn onClick={()=>setShowKPR(true)} variant="kpr">💰 Simulasi KPR</Btn>
              {!isSold&&!isPending&&<Btn onClick={onBooking} variant="booking">🏷️ Booking Sekarang</Btn>}
            </div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"3fr 1fr",gap:"1rem",marginBottom:"2rem"}}>
          <div style={{overflow:"hidden",position:"relative"}}>
            <div style={{height:420,background:`url('${imgs[activeImg]}') center/cover no-repeat`,transition:"opacity .3s"}}/>
            {isSold&&<div style={{position:"absolute",inset:0,background:"rgba(44,31,20,.6)",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{background:"var(--red)",color:"#fff",padding:".5rem 2rem",fontSize:"1.5rem",fontWeight:600,letterSpacing:".15em",textTransform:"uppercase"}}>TERJUAL</div></div>}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"1rem",overflowY:"auto",maxHeight:420}}>
            {imgs.map((img,i)=>(<div key={i} onClick={()=>setActiveImg(i)} style={{height:120,background:`url('${img}') center/cover no-repeat`,cursor:"pointer",border:activeImg===i?"3px solid var(--accent)":"3px solid transparent",transition:"border .2s",flexShrink:0}}/>))}
          </div>
        </div>
        <div style={{display:"flex",gap:0,background:"var(--mist)",marginBottom:"2rem",flexWrap:"wrap"}}>
          {[["🛏","Kamar Tidur",prop.beds],["🚿","Kamar Mandi",prop.baths],["📐","Luas Bangunan",`${prop.area} m²`],["🏗","Luas Bangunan",`${prop.luas_bangunan_m2||36} m²`],["🏢","Lantai",prop.floor],["📅","Tahun",prop.year]].map(([ic,lbl,val])=>(
            <div key={lbl} style={{flex:1,minWidth:110,padding:"1.2rem 1.5rem",borderRight:"1px solid var(--clay)",textAlign:"center"}}>
              <div style={{fontSize:"1.3rem",marginBottom:".3rem"}}>{ic}</div>
              <div style={{fontFamily:"var(--serif)",fontSize:"1.2rem",fontWeight:500,color:"var(--espresso)"}}>{val}</div>
              <div style={{fontSize:".68rem",letterSpacing:".1em",textTransform:"uppercase",color:"var(--light)",marginTop:".15rem"}}>{lbl}</div>
            </div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:"3rem"}}>
          <div>
            <div style={{display:"flex",borderBottom:"2px solid var(--mist)",marginBottom:"1.5rem"}}>
              {["deskripsi","fasilitas","lokasi"].map(t=>(<button key={t} onClick={()=>setTab(t)} style={{padding:".75rem 1.5rem",background:"none",border:"none",borderBottom:tab===t?"2px solid var(--accent)":"2px solid transparent",marginBottom:-2,fontFamily:"var(--sans)",fontSize:".8rem",fontWeight:500,letterSpacing:".08em",textTransform:"uppercase",color:tab===t?"var(--accent)":"var(--light)",cursor:"pointer"}}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>))}
            </div>
            {tab==="deskripsi"&&(
              <div style={{animation:"fadeIn .3s ease"}}>
                <p style={{fontSize:".9rem",lineHeight:1.8,color:"var(--text)",marginBottom:"1.5rem"}}>{prop.desc}</p>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:".8rem"}}>
                  {[["Tipe",prop.type],["Status",prop.status],["Luas Tanah",`${Math.round(prop.area*1.3)} m²`],["Luas Bangunan",`${prop.area} m²`],["Jumlah Lantai",prop.floor],["Tahun Dibangun",prop.year]].map(([k,v])=>(<div key={k} style={{display:"flex",justifyContent:"space-between",padding:".7rem 1rem",background:"var(--sand)",fontSize:".83rem"}}><span style={{color:"var(--light)"}}>{k}</span><span style={{fontWeight:500,color:"var(--espresso)"}}>{v}</span></div>))}
                </div>
              </div>
            )}
            {tab==="fasilitas"&&(<div style={{animation:"fadeIn .3s ease",display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:".8rem"}}>{prop.facilities?.map(f=>(<div key={f} style={{display:"flex",alignItems:"center",gap:".7rem",padding:".9rem 1.1rem",background:"var(--sand)",fontSize:".85rem"}}><span style={{color:"var(--green)",fontWeight:700}}>✓</span>{f}</div>))}</div>)}
            {tab==="lokasi"&&(<div style={{animation:"fadeIn .3s ease"}}><div style={{height:320,background:"linear-gradient(135deg,#e8e0d4,#d4cbbf)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",border:"1px solid var(--mist)",position:"relative",overflow:"hidden"}}><div style={{position:"absolute",inset:0,opacity:.15,backgroundImage:"repeating-linear-gradient(0deg,#8C6F5A 0,#8C6F5A 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#8C6F5A 0,#8C6F5A 1px,transparent 1px,transparent 40px)"}}/><div style={{fontSize:"2.5rem",marginBottom:".5rem"}}>📍</div><div style={{fontFamily:"var(--serif)",fontSize:"1.2rem",color:"var(--espresso)",marginBottom:".3rem"}}>{prop.location}</div><div style={{fontSize:".78rem",color:"var(--light)",marginBottom:"1rem"}}>Koordinat: {prop.lat}°, {prop.lng}°</div><a href={`https://maps.google.com/?q=${prop.lat},${prop.lng}`} target="_blank" rel="noreferrer" style={{padding:".6rem 1.4rem",background:"var(--espresso)",color:"var(--sand)",textDecoration:"none",fontSize:".78rem",letterSpacing:".08em",textTransform:"uppercase"}}>Buka di Google Maps →</a></div></div>)}
          </div>
          <div style={{background:"var(--sand)",padding:"2rem",border:"1px solid var(--mist)",alignSelf:"start"}}>
            <div style={{display:"flex",alignItems:"center",gap:"1rem",marginBottom:"1.5rem",paddingBottom:"1.5rem",borderBottom:"1px solid var(--mist)"}}>
              <div style={{width:52,height:52,borderRadius:"50%",background:"var(--earth)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--serif)",fontSize:"1.4rem",color:"#fff",flexShrink:0}}>A</div>
              <div><div style={{fontSize:".9rem",fontWeight:600,color:"var(--espresso)"}}>Agus Santoso</div><div style={{fontSize:".75rem",color:"var(--light)"}}>Senior Property Agent</div><div style={{fontSize:".72rem",color:"var(--accent)",marginTop:".1rem"}}>⭐ 4.9 (128 ulasan)</div></div>
            </div>
            {/* Booking status banner */}
            {isSold&&(<div style={{background:"#fee2e2",border:"1px solid #fca5a5",borderRadius:6,padding:"1rem",marginBottom:"1rem",textAlign:"center"}}><div style={{fontSize:"1rem",fontWeight:700,color:"var(--red)"}}>🔴 Properti Telah Terjual</div><div style={{fontSize:".8rem",color:"#7f1d1d",marginTop:".3rem"}}>Maaf, properti ini sudah tidak tersedia.</div></div>)}
            {isPending&&!isSold&&(<div style={{background:"#fef3c7",border:"1px solid #fde68a",borderRadius:6,padding:"1rem",marginBottom:"1rem",textAlign:"center"}}><div style={{fontSize:".95rem",fontWeight:700,color:"#92400e"}}>⏳ Sedang Dalam Proses Booking</div><div style={{fontSize:".8rem",color:"#78350f",marginTop:".3rem"}}>Properti ini sedang dalam verifikasi admin.</div></div>)}
            <div style={{display:"flex",flexDirection:"column",gap:".8rem"}}>
              <Btn style={{width:"100%",padding:".9rem",textAlign:"center"}}>📞 Hubungi via WhatsApp</Btn>
              <Btn variant="ghost" style={{width:"100%",padding:".9rem",textAlign:"center"}}>📅 Jadwalkan Kunjungan</Btn>
              <Btn variant="kpr" onClick={()=>setShowKPR(true)} style={{width:"100%",padding:".9rem",textAlign:"center"}}>💰 Simulasi KPR</Btn>
              {!isSold&&!isPending&&<Btn variant="booking" onClick={onBooking} style={{width:"100%",padding:".9rem",textAlign:"center"}}>🏷️ Booking Properti Ini</Btn>}
            </div>
            <div style={{marginTop:"1rem",padding:"1rem",background:"var(--espresso)",color:"var(--clay)",fontSize:".75rem",lineHeight:1.6,textAlign:"center"}}>
              <div style={{fontFamily:"var(--serif)",fontSize:"1.3rem",color:"var(--accent)",marginBottom:".3rem"}}>{fmt(calcKPR(prop.price*.8,10.5,20))} <span style={{fontSize:".7rem",color:"var(--clay)"}}>/bln</span></div>
              <div>Estimasi cicilan KPR<br/>DP 20% · 20 tahun · 10.5%</div>
              <button onClick={()=>setShowKPR(true)} style={{marginTop:".6rem",background:"none",border:"none",color:"var(--accent)",fontSize:".72rem",letterSpacing:".08em",textTransform:"uppercase",cursor:"pointer",fontFamily:"var(--sans)",textDecoration:"underline"}}>Hitung ulang →</button>
            </div>
            <div style={{marginTop:"1.5rem",paddingTop:"1.5rem",borderTop:"1px solid var(--mist)",fontSize:".78rem",color:"var(--light)",lineHeight:1.6}}>🔒 Data Anda aman dan tidak akan disebarkan kepada pihak ketiga.</div>
          </div>
        </div>
      </div>
      {showKPR&&<KPRModal prop={prop} onClose={()=>setShowKPR(false)}/>}
    </div>
  );
}

// ── LISTING PAGE ───────────────────────────────────────────
function ListingPage({properties,onView,onEdit,onDelete,onAdd,onHome}){
  const [view,setView]=useState("grid");
  const [search,setSearch]=useState("");
  const [filterType,setFilterType]=useState("");
  const [filterBadge,setFilterBadge]=useState("");
  const [filterStatus,setFilterStatus]=useState("");
  const [sortBy,setSortBy]=useState("default");
  const [priceMin,setPriceMin]=useState("");
  const [priceMax,setPriceMax]=useState("");
  const [showFilter,setShowFilter]=useState(false);
  const filtered=properties.filter(p=>{const q=search.toLowerCase();return(!q||p.name?.toLowerCase().includes(q)||p.location?.toLowerCase().includes(q))&&(!filterType||p.type===filterType)&&(!filterBadge||p.badge===filterBadge)&&(!filterStatus||p.status===filterStatus)&&(!priceMin||p.price>=Number(priceMin)*1e6)&&(!priceMax||p.price<=Number(priceMax)*1e6);}).sort((a,b)=>sortBy==="price-asc"?a.price-b.price:sortBy==="price-desc"?b.price-a.price:sortBy==="newest"?b.year-a.year:sortBy==="area"?b.area-a.area:0);
  return(
    <div style={{minHeight:"100vh",background:"var(--white)"}}>
      <style>{GLOBAL_CSS}</style>
      <div style={{background:"var(--espresso)",padding:"2.5rem 3rem 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:"2rem"}}>
          <div style={{display:"flex",alignItems:"center",gap:"1.5rem"}}>
            <button onClick={onHome} style={{background:"none",border:"none",color:"var(--sand)",cursor:"pointer",fontSize:"1.2rem",padding:0}}>← Beranda</button>
            <div><Tag label="Manajemen Properti"/><h1 style={{fontFamily:"var(--serif)",fontSize:"clamp(2rem,3vw,2.6rem)",fontWeight:300,color:"var(--sand)"}}>Daftar Properti</h1></div>
          </div>
          <Btn onClick={onAdd} style={{padding:".9rem 2rem"}}>+ Tambah Properti</Btn>
        </div>
        <div style={{display:"flex",gap:"1rem",alignItems:"center",paddingBottom:"1.5rem",flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:200,position:"relative"}}><span style={{position:"absolute",left:"1rem",top:"50%",transform:"translateY(-50%)",color:"var(--clay)"}}>🔍</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari nama atau lokasi..." style={{width:"100%",padding:".75rem 1rem .75rem 2.8rem",background:"rgba(255,255,255,.08)",border:"1px solid rgba(200,180,154,.3)",color:"var(--sand)",fontSize:".88rem",fontFamily:"var(--sans)"}}/></div>
          <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{padding:".75rem 1rem",background:"rgba(255,255,255,.08)",border:"1px solid rgba(200,180,154,.3)",color:"var(--sand)",fontSize:".82rem",fontFamily:"var(--sans)",cursor:"pointer"}}>
            {[["default","Urutkan"],["price-asc","Harga Terendah"],["price-desc","Harga Tertinggi"],["newest","Terbaru"],["area","Luas Terbesar"]].map(([v,l])=><option key={v} value={v} style={{background:"var(--espresso)"}}>{l}</option>)}
          </select>
          <button onClick={()=>setShowFilter(v=>!v)} style={{padding:".75rem 1.2rem",background:showFilter?"var(--accent)":"rgba(255,255,255,.08)",border:"1px solid rgba(200,180,154,.3)",color:"var(--sand)",fontSize:".82rem",cursor:"pointer",fontFamily:"var(--sans)"}}>⚙ Filter</button>
          <div style={{display:"flex",border:"1px solid rgba(200,180,154,.3)",overflow:"hidden"}}>
            {["grid","list"].map(v=>(<button key={v} onClick={()=>setView(v)} style={{padding:".6rem .9rem",background:view===v?"var(--accent)":"transparent",border:"none",color:"var(--sand)",cursor:"pointer",fontSize:".95rem"}}>{v==="grid"?"⊞":"☰"}</button>))}
          </div>
        </div>
        {showFilter&&(
          <div style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(200,180,154,.2)",padding:"1.2rem 1.5rem",marginBottom:"1.5rem",display:"flex",gap:"1.5rem",flexWrap:"wrap",animation:"slideDown .3s ease"}}>
            {[["Tipe",filterType,setFilterType,["Rumah Tapak","Villa","Townhouse","Apartemen","Ruko"]],["Label",filterBadge,setFilterBadge,["Baru","Terlaris","Promo","Eksklusif"]],["Status",filterStatus,setFilterStatus,["Dijual","Disewa","Terjual"]]].map(([l,v,sv,opts])=>(
              <div key={l} style={{flex:1,minWidth:140}}><div style={{fontSize:".68rem",letterSpacing:".12em",textTransform:"uppercase",color:"var(--clay)",marginBottom:".4rem"}}>{l}</div>
                <select value={v} onChange={e=>sv(e.target.value)} style={{width:"100%",padding:".6rem .8rem",background:"transparent",border:"1px solid rgba(200,180,154,.3)",color:"var(--sand)",fontFamily:"var(--sans)",fontSize:".85rem"}}>
                  <option value="" style={{background:"var(--espresso)"}}>Semua {l}</option>
                  {opts.map(o=><option key={o} value={o} style={{background:"var(--espresso)"}}>{o}</option>)}
                </select>
              </div>
            ))}
            <div style={{flex:1,minWidth:120}}><div style={{fontSize:".68rem",letterSpacing:".12em",textTransform:"uppercase",color:"var(--clay)",marginBottom:".4rem"}}>Harga Min (Jt)</div><input type="number" value={priceMin} onChange={e=>setPriceMin(e.target.value)} placeholder="500" style={{width:"100%",padding:".6rem .8rem",background:"transparent",border:"1px solid rgba(200,180,154,.3)",color:"var(--sand)",fontFamily:"var(--sans)",fontSize:".85rem"}}/></div>
            <div style={{flex:1,minWidth:120}}><div style={{fontSize:".68rem",letterSpacing:".12em",textTransform:"uppercase",color:"var(--clay)",marginBottom:".4rem"}}>Harga Max (Jt)</div><input type="number" value={priceMax} onChange={e=>setPriceMax(e.target.value)} placeholder="5000" style={{width:"100%",padding:".6rem .8rem",background:"transparent",border:"1px solid rgba(200,180,154,.3)",color:"var(--sand)",fontFamily:"var(--sans)",fontSize:".85rem"}}/></div>
            <div style={{display:"flex",alignItems:"flex-end"}}><button onClick={()=>{setFilterType("");setFilterBadge("");setFilterStatus("");setPriceMin("");setPriceMax("");setSearch("");}} style={{padding:".6rem 1rem",background:"transparent",border:"1px solid rgba(200,180,154,.3)",color:"var(--clay)",fontFamily:"var(--sans)",fontSize:".78rem",cursor:"pointer"}}>Reset</button></div>
          </div>
        )}
      </div>
      <div style={{padding:"1.2rem 3rem",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid var(--mist)"}}>
        <span style={{fontSize:".82rem",color:"var(--light)"}}>Menampilkan <strong style={{color:"var(--espresso)"}}>{filtered.length}</strong> dari {properties.length} properti</span>
      </div>
      <div style={{padding:"2rem 3rem"}}>
        {filtered.length===0?(<div style={{textAlign:"center",padding:"5rem 0",color:"var(--light)"}}><div style={{fontSize:"3rem",marginBottom:"1rem"}}>🏠</div><div style={{fontFamily:"var(--serif)",fontSize:"1.5rem",color:"var(--clay)",marginBottom:".5rem"}}>Properti tidak ditemukan</div><div style={{fontSize:".85rem"}}>Coba ubah filter atau kata kunci pencarian</div></div>
        ):view==="grid"?(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:"1.8rem"}}>
            {filtered.map((p,i)=><GridCard key={p.id} prop={p} onView={()=>onView(p)} onEdit={()=>onEdit(p)} onDelete={()=>onDelete(p.id)} style={{animation:`fadeUp .4s ease both`,animationDelay:`${i*.06}s`}}/>)}
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
            {filtered.map((p,i)=><ListCard key={p.id} prop={p} onView={()=>onView(p)} onEdit={()=>onEdit(p)} onDelete={()=>onDelete(p.id)} style={{animation:`fadeUp .4s ease both`,animationDelay:`${i*.05}s`}}/>)}
          </div>
        )}
      </div>
    </div>
  );
}

function GridCard({prop,onView,onEdit,onDelete,style}){
  const [hov,setHov]=useState(false);
  const [confirm,setConfirm]=useState(false);
  const isSold=prop.status==="Terjual";
  const isPending=prop.booking_status==="pending";
  return(
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{background:"var(--white)",border:"1px solid var(--mist)",overflow:"hidden",cursor:"pointer",transition:"transform .3s, box-shadow .3s",transform:hov?"translateY(-4px)":"none",boxShadow:hov?"0 16px 48px rgba(44,31,20,.1)":"none",...style}}>
      <div style={{overflow:"hidden",position:"relative"}}>
        <div onClick={onView} style={{height:220,background:`url('${prop.img||prop.imgs?.[0]}') center/cover no-repeat`,transition:"transform .5s",transform:hov?"scale(1.05)":"scale(1)"}}/>
        <div style={{position:"absolute",top:"1rem",left:"1rem",background:BADGE_COLORS[prop.badge]||"var(--espresso)",color:"#fff",fontSize:".65rem",letterSpacing:".1em",textTransform:"uppercase",padding:".3rem .7rem"}}>{prop.badge}</div>
        <div style={{position:"absolute",top:"1rem",right:"1rem",background:"var(--white)",color:"var(--espresso)",fontSize:".65rem",letterSpacing:".1em",textTransform:"uppercase",padding:".3rem .7rem"}}>{prop.type}</div>
        {isPending&&<div style={{position:"absolute",bottom:"1rem",left:"1rem",background:"#F59E0B",color:"#fff",fontSize:".6rem",padding:".25rem .6rem"}}>⏳ Pre-Booking</div>}
        {isSold&&<div style={{position:"absolute",inset:0,background:"rgba(44,31,20,.55)",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{background:"var(--red)",color:"#fff",padding:".4rem 1rem",fontWeight:600,letterSpacing:".1em",textTransform:"uppercase"}}>TERJUAL</div></div>}
      </div>
      <div style={{padding:"1.3rem"}} onClick={onView}>
        <div style={{fontFamily:"var(--serif)",fontSize:"1.5rem",fontWeight:500,color:"var(--espresso)",marginBottom:".2rem"}}>{fmt(prop.price)}</div>
        <div style={{fontSize:".88rem",fontWeight:500,color:"var(--text)",marginBottom:".15rem"}}>{prop.name}</div>
        <div style={{fontSize:".75rem",color:"var(--light)"}}>📍 {prop.location}</div>
        <div style={{display:"flex",gap:"1rem",marginTop:"1rem",paddingTop:"1rem",borderTop:"1px solid var(--mist)",flexWrap:"wrap"}}>
          {[["🛏",`${prop.beds} KT`],["🚿",`${prop.baths} KM`],["📐",`${prop.area}m²`]].map(([ic,v])=>(<span key={v} style={{fontSize:".75rem",color:"var(--light)",display:"flex",alignItems:"center",gap:".25rem"}}>{ic} {v}</span>))}
        </div>
      </div>
      <div style={{display:"flex",borderTop:"1px solid var(--mist)"}}>
        {confirm?(<><button onClick={()=>setConfirm(false)} style={{flex:1,padding:".65rem",background:"transparent",border:"none",color:"var(--light)",fontSize:".75rem",cursor:"pointer",borderRight:"1px solid var(--mist)"}}>Batal</button><button onClick={()=>{setConfirm(false);onDelete();}} style={{flex:1,padding:".65rem",background:"var(--red)",border:"none",color:"#fff",fontSize:".75rem",cursor:"pointer",fontWeight:500}}>Ya, Hapus</button></>
        ):(<><ABtn icon="👁" label="Detail" onClick={onView}/><ABtn icon="✏️" label="Edit" onClick={onEdit} border/><ABtn icon="🗑" label="Hapus" onClick={()=>setConfirm(true)} danger/></>)}
      </div>
    </div>
  );
}

function ListCard({prop,onView,onEdit,onDelete,style}){
  const [hov,setHov]=useState(false);
  const [confirm,setConfirm]=useState(false);
  const isSold=prop.status==="Terjual";
  const isPending=prop.booking_status==="pending";
  return(
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{background:"var(--white)",border:"1px solid var(--mist)",display:"flex",overflow:"hidden",transition:"box-shadow .25s, border-color .25s",boxShadow:hov?"0 6px 24px rgba(44,31,20,.08)":"none",borderColor:hov?"var(--clay)":"var(--mist)",...style}}>
      <div style={{width:220,flexShrink:0,overflow:"hidden",position:"relative",cursor:"pointer"}} onClick={onView}>
        <div style={{height:"100%",minHeight:140,background:`url('${prop.img||prop.imgs?.[0]}') center/cover no-repeat`,transition:"transform .4s",transform:hov?"scale(1.04)":"scale(1)"}}/>
        <div style={{position:"absolute",top:".7rem",left:".7rem",background:BADGE_COLORS[prop.badge]||"var(--espresso)",color:"#fff",fontSize:".6rem",letterSpacing:".1em",textTransform:"uppercase",padding:".25rem .6rem"}}>{prop.badge}</div>
        {(isSold||isPending)&&<div style={{position:"absolute",bottom:".5rem",left:".5rem",background:isSold?"var(--red)":"#F59E0B",color:"#fff",fontSize:".6rem",padding:".2rem .5rem"}}>{isSold?"TERJUAL":"Pre-Booking"}</div>}
      </div>
      <div style={{flex:1,padding:"1.2rem 1.5rem",cursor:"pointer"}} onClick={onView}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div><div style={{fontFamily:"var(--serif)",fontSize:"1.5rem",fontWeight:500,color:"var(--espresso)"}}>{fmt(prop.price)}</div><div style={{fontSize:".9rem",fontWeight:500,color:"var(--text)"}}>{prop.name}</div><div style={{fontSize:".75rem",color:"var(--light)",marginTop:".2rem"}}>📍 {prop.location}</div></div>
          <div style={{background:"var(--mist)",padding:".3rem .7rem",fontSize:".68rem",letterSpacing:".1em",textTransform:"uppercase",color:"var(--earth)",flexShrink:0,marginLeft:"1rem"}}>{prop.type}</div>
        </div>
        <div style={{display:"flex",gap:"1.5rem",marginTop:".9rem",flexWrap:"wrap"}}>
          {[["🛏",`${prop.beds} KT`],["🚿",`${prop.baths} KM`],["📐",`${prop.area} m²`],["🏗",`${prop.luas_bangunan_m2||36} m² Bangunan`],["🏢",`${prop.floor} Lantai`]].map(([ic,v])=>(<span key={v} style={{fontSize:".78rem",color:"var(--light)",display:"flex",alignItems:"center",gap:".3rem"}}>{ic} {v}</span>))}
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",borderLeft:"1px solid var(--mist)",flexShrink:0}}>
        {confirm?(<><button onClick={()=>setConfirm(false)} style={{flex:1,padding:"0 1.2rem",background:"transparent",border:"none",borderBottom:"1px solid var(--mist)",color:"var(--light)",fontSize:".72rem",cursor:"pointer"}}>Batal</button><button onClick={()=>{setConfirm(false);onDelete();}} style={{flex:1,padding:"0 1.2rem",background:"var(--red)",border:"none",color:"#fff",fontSize:".72rem",cursor:"pointer",fontWeight:500}}>Hapus</button></>
        ):(<><SBtn icon="👁" label="Detail" onClick={onView}/><SBtn icon="✏️" label="Edit" onClick={onEdit} border/><SBtn icon="🗑" label="Hapus" onClick={()=>setConfirm(true)} danger/></>)}
      </div>
    </div>
  );
}

const ABtn=({icon,label,onClick,border,danger})=>{const[h,setH]=useState(false);return <button onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{flex:1,padding:".65rem",background:danger&&h?"var(--red)":h?"var(--mist)":"transparent",border:"none",borderLeft:border?"1px solid var(--mist)":"none",color:danger&&h?"#fff":"var(--light)",fontSize:".75rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:".3rem",transition:"all .2s"}}>{icon} {label}</button>;};
const SBtn=({icon,label,onClick,border,danger})=>{const[h,setH]=useState(false);return <button onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{flex:1,padding:"0 1.4rem",background:danger&&h?"var(--red)":h?"var(--mist)":"transparent",border:"none",borderTop:border?"1px solid var(--mist)":"none",color:danger&&h?"#fff":"var(--light)",fontSize:".75rem",cursor:"pointer",display:"flex",alignItems:"center",gap:".35rem",transition:"all .2s"}}>{icon} {label}</button>;};

// ── ROOT PROPERTI COMPONENT ────────────────────────────────
export default function Properti(){
  const navigate=useNavigate();
  const {id}=useParams();
  const [page,setPage]=useState(id?"detail":"list");
  const [properties,setProperties]=useState([]);
  const [selected,setSelected]=useState(null);
  const [loading,setLoading]=useState(true);
  const [toast,setToast]=useState(null);

  const showToast=(msg,type="success")=>{setToast({msg,type});setTimeout(()=>setToast(null),3500);};

  const loadProperties=useCallback(async()=>{
    setLoading(true);
    try{const res=await api.properties.getAll();setProperties(res.data||[]);}
    catch(e){showToast("Gagal memuat data: "+e.message,"danger");}
    finally{setLoading(false);}
  },[]);

  useEffect(()=>{loadProperties();},[loadProperties]);

  // If URL has ID, load that property
  useEffect(()=>{
    if(id&&properties.length>0){
      const found=properties.find(p=>String(p.id)===String(id));
      if(found){setSelected(found);setPage("detail");}
    }
  },[id,properties]);

  const handleView=(p)=>{setSelected(p);setPage("detail");navigate(`/properti/${p.id}`,{replace:true});};
  const handleEdit=(p)=>{setSelected(p);setPage("form");};
  const handleAdd=()=>{setSelected(null);setPage("form");};
  const handleBack=()=>{setPage("list");setSelected(null);navigate("/properti",{replace:true});};
  const handleHome=()=>navigate("/");

  const handleDelete=async(propId)=>{
    if(!window.confirm("Hapus properti ini?"))return;
    try{await api.properties.delete(propId);showToast("Properti berhasil dihapus","danger");loadProperties();}
    catch(e){showToast("Gagal menghapus: "+e.message,"danger");}
  };

  const handleSave=async(data)=>{
    try{
      if(selected&&selected.id){
        await api.properties.update(selected.id,data);
        showToast("Properti berhasil diperbarui");
      }else{
        await api.properties.create(data);
        showToast("Properti baru berhasil ditambahkan");
      }
      await loadProperties();
      setPage("list");setSelected(null);navigate("/properti",{replace:true});
    }catch(e){showToast("Gagal menyimpan: "+e.message,"danger");}
  };

  const handleBooking=(p)=>{navigate(`/booking/${p.id}`);};

  if(loading&&page==="list"){
    return(<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--white)"}}><style>{GLOBAL_CSS}</style><div style={{textAlign:"center",color:"var(--light)"}}><div style={{fontFamily:"var(--serif)",fontSize:"2rem",marginBottom:"1rem"}}>HAVEN<span style={{color:"var(--accent)"}}>EST</span></div><div>Memuat properti...</div></div></div>);
  }

  return(
    <>
      <style>{GLOBAL_CSS}</style>
      {toast&&(<div style={{position:"fixed",top:"1.5rem",right:"1.5rem",zIndex:9999,background:toast.type==="danger"?"var(--red)":"var(--green)",color:"#fff",padding:".9rem 1.8rem",fontSize:".85rem",fontWeight:500,boxShadow:"0 8px 24px rgba(0,0,0,.15)",animation:"slideDown .3s ease"}}>{toast.type==="danger"?"🗑":"✓"} {toast.msg}</div>)}
      {page==="list"&&<ListingPage properties={properties} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} onAdd={handleAdd} onHome={handleHome}/>}
      {page==="detail"&&selected&&<DetailPage prop={selected} onBack={handleBack} onEdit={()=>handleEdit(selected)} onBooking={()=>handleBooking(selected)}/>}
      {page==="form"&&<FormPage prop={selected} onBack={handleBack} onSave={handleSave}/>}
    </>
  );
}
