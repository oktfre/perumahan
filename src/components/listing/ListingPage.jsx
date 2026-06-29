import { useState, useEffect, useCallback } from "react";
import { propertyApi } from "../../utils/api";
import { useCms } from "../../context/CmsContext";
import Tag from "../atoms/Tag";
import Footer from "../Footer";
import { ListingCard, ListingRow } from "./ListingCards";

const PLACEHOLDER = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=85";

function ListingPage({ setPage, setSelectedProp }) {
  const { content } = useCms();
  const cfg = content.listing;
  const [data,       setData]      = useState([]);
  const [loading,    setLoading]   = useState(true);
  const [error,      setError]     = useState("");
  const [view,       setView]      = useState("grid");
  const [search,     setSearch]    = useState("");
  const [status,     setStatus]    = useState("");
  const [sort,       setSort]      = useState("default");
  const [showFilter, setShowFilter] = useState(false);
  const [kt,         setKt]        = useState("");
  const [hargaMin,   setHargaMin]  = useState("");
  const [hargaMax,   setHargaMax]  = useState("");
  const [page,       setPageNum]   = useState(1);
  const [pagination, setPagination] = useState({});

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const q = new URLSearchParams({
        page, limit: 12,
        ...(search   && { search }),
        ...(status   && { status }),
        ...(sort     && { sort }),
        ...(kt       && { kamar_tidur: kt }),
        ...(hargaMin && { harga_min: hargaMin }),
        ...(hargaMax && { harga_max: hargaMax }),
      }).toString();
      const res = await propertyApi.getAll(q);
      setData(res.data || []);
      setPagination(res.pagination || {});
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [page, search, status, sort, kt, hargaMin, hargaMax]);

  useEffect(() => { load(); }, [load]);

  const goDetail = (p) => {
    setSelectedProp({ ...p, img: p.gambar_utama || PLACEHOLDER, imgs: (p.gambar||[]).map(g=>g.url), });
    setPage("detail"); window.scrollTo(0,0);
  };

  const reset = () => { setStatus(""); setKt(""); setHargaMin(""); setHargaMax(""); setSearch(""); setPageNum(1); };

  return (
    <div style={{ minHeight:"100vh", paddingTop:80 }} className="page-enter">
      {/* Header */}
      <div style={{ background:"var(--espresso)", padding:"3rem 4rem 0" }}>
        <Tag label={cfg.tag} light />
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:"2rem" }}>
          <h1 style={{ fontFamily:"var(--serif)", fontSize:"clamp(2rem,3vw,2.8rem)", fontWeight:300, color:"var(--sand)" }}>{cfg.title}</h1>
          <div style={{ fontFamily:"var(--serif)", fontSize:"1.1rem", color:"var(--clay)" }}>
            {loading ? "Memuat…" : `${pagination.total || 0} properti ditemukan`}
          </div>
        </div>

        {/* Toolbar */}
        <div style={{ display:"flex", gap:"1rem", paddingBottom:"1.5rem", flexWrap:"wrap" }}>
          <div style={{ flex:1, minWidth:200, position:"relative" }}>
            <span style={{ position:"absolute", left:"1rem", top:"50%", transform:"translateY(-50%)", color:"var(--clay)", fontSize:".9rem" }}>🔍</span>
            <input value={search} onChange={e=>{setSearch(e.target.value);setPageNum(1);}} placeholder={cfg.search_placeholder}
              style={{ width:"100%", padding:".75rem 1rem .75rem 2.8rem", background:"rgba(255,255,255,.08)", border:"1px solid rgba(200,180,154,.25)", color:"var(--sand)", fontSize:".88rem" }} />
          </div>
          <select value={sort} onChange={e=>setSort(e.target.value)}
            style={{ padding:".75rem 1rem", background:"rgba(255,255,255,.08)", border:"1px solid rgba(200,180,154,.25)", color:"var(--sand)", fontSize:".82rem", cursor:"pointer" }}>
            <option value="default"    style={{background:"#2C1F14"}}>Urutkan</option>
            <option value="harga_asc"  style={{background:"#2C1F14"}}>Harga Terendah</option>
            <option value="harga_desc" style={{background:"#2C1F14"}}>Harga Tertinggi</option>
            <option value="terbaru"    style={{background:"#2C1F14"}}>Terbaru</option>
            <option value="terluas"    style={{background:"#2C1F14"}}>Terluas</option>
          </select>
          <button onClick={()=>setShowFilter(v=>!v)}
            style={{ padding:".75rem 1.3rem", background:showFilter?"var(--accent)":"rgba(255,255,255,.08)", border:"1px solid rgba(200,180,154,.25)", color:"var(--sand)", cursor:"pointer", fontSize:".82rem" }}>
            ⚙ Filter {showFilter?"▲":"▼"}
          </button>
          <div style={{ display:"flex", border:"1px solid rgba(200,180,154,.25)", overflow:"hidden" }}>
            {["grid","list"].map(v=>(
              <button key={v} onClick={()=>setView(v)}
                style={{ padding:".6rem 1rem", background:v===view?"var(--accent)":"transparent", border:"none", color:"var(--sand)", cursor:"pointer", fontSize:"1rem", transition:"background .2s" }}>
                {v==="grid"?"⊞":"☰"}
              </button>
            ))}
          </div>
        </div>

        {/* Filter panel */}
        {showFilter && (
          <div style={{ background:"rgba(255,255,255,.05)", border:"1px solid rgba(200,180,154,.15)", padding:"1.2rem 1.5rem", marginBottom:"1.5rem", display:"flex", gap:"1.5rem", flexWrap:"wrap" }}>
            {[["Status","status",["tersedia","pra_booking","terjual"],setStatus,status],["Min KT","kamar_tidur",["1","2","3","4"],setKt,kt]].map(([lbl,_,opts,setter,val])=>(
              <div key={lbl} style={{ flex:1, minWidth:130 }}>
                <div style={{ fontSize:".62rem", letterSpacing:".12em", textTransform:"uppercase", color:"var(--clay)", marginBottom:".4rem" }}>{lbl}</div>
                <select value={val} onChange={e=>{setter(e.target.value);setPageNum(1);}}
                  style={{ width:"100%", padding:".6rem .8rem", background:"transparent", border:"1px solid rgba(200,180,154,.25)", color:"var(--sand)", fontFamily:"var(--sans)", fontSize:".85rem" }}>
                  <option value="" style={{background:"#2C1F14"}}>Semua</option>
                  {opts.map(o=><option key={o} value={o} style={{background:"#2C1F14"}}>{o}</option>)}
                </select>
              </div>
            ))}
            {[["Harga Min (Jt)",setHargaMin,hargaMin],["Harga Max (Jt)",setHargaMax,hargaMax]].map(([lbl,setter,val])=>(
              <div key={lbl} style={{ flex:1, minWidth:130 }}>
                <div style={{ fontSize:".62rem", letterSpacing:".12em", textTransform:"uppercase", color:"var(--clay)", marginBottom:".4rem" }}>{lbl}</div>
                <input type="number" value={val} onChange={e=>{setter(e.target.value);setPageNum(1);}} placeholder="contoh: 200"
                  style={{ width:"100%", padding:".6rem .8rem", background:"transparent", border:"1px solid rgba(200,180,154,.25)", color:"var(--sand)", fontFamily:"var(--sans)", fontSize:".85rem" }} />
              </div>
            ))}
            <div style={{ display:"flex", alignItems:"flex-end" }}>
              <button onClick={reset} style={{ padding:".6rem 1rem", background:"transparent", border:"1px solid rgba(200,180,154,.25)", color:"var(--clay)", cursor:"pointer", fontSize:".75rem" }}>Reset</button>
            </div>
          </div>
        )}
      </div>

      {/* Hasil */}
      <div style={{ padding:"2.5rem 4rem" }}>
        {error && <div style={{ background:"rgba(160,64,64,.1)", border:"1px solid rgba(160,64,64,.3)", color:"#A04040", padding:"1rem 1.5rem", marginBottom:"1.5rem" }}>⚠ {error}</div>}

        {loading ? (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:"2rem" }}>
            {Array.from({length:6}).map((_,i)=>(
              <div key={i} style={{ height:380, background:"var(--mist)", animation:"pulse 1.5s ease-in-out infinite", animationDelay:`${i*.1}s` }} />
            ))}
          </div>
        ) : data.length===0 ? (
          <div style={{ textAlign:"center", padding:"6rem 0" }}>
            <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>🏠</div>
            <div style={{ fontFamily:"var(--serif)", fontSize:"1.6rem", color:"var(--clay)", marginBottom:".5rem" }}>{cfg.empty_title}</div>
            <div style={{ fontSize:".85rem", color:"var(--light)" }}>{cfg.empty_subtitle}</div>
          </div>
        ) : view==="grid" ? (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(310px,1fr))", gap:"2rem" }}>
            {data.map((p,i)=><ListingCard key={p.id} prop={p} delay={i*.07} onClick={()=>goDetail(p)} />)}
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:"1.2rem" }}>
            {data.map((p,i)=><ListingRow key={p.id} prop={p} delay={i*.05} onClick={()=>goDetail(p)} />)}
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.total_pages>1 && (
          <div style={{ display:"flex", justifyContent:"center", gap:".5rem", marginTop:"3rem" }}>
            {Array.from({length:pagination.total_pages},(_,i)=>i+1).map(pg=>(
              <button key={pg} onClick={()=>setPageNum(pg)}
                style={{ width:38, height:38, background:pg===page?"var(--espresso)":"var(--mist)", border:"1px solid var(--clay)", color:pg===page?"var(--sand)":"var(--text)", cursor:"pointer", fontSize:".82rem", fontFamily:"var(--sans)", transition:"all .2s" }}>
                {pg}
              </button>
            ))}
          </div>
        )}
      </div>
      <Footer setPage={setPage} />
    </div>
  );
}

export default ListingPage;
