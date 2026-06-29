import { useState, useEffect } from 'react';
import { perumahanApi } from '../../utils/api';

function AdminPerumahan() {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null);
  const [active,  setActive]  = useState(null);
  const [form,    setForm]    = useState({ nama:'', lokasi:'' });
  const [msg,     setMsg]     = useState('');
  const [err,     setErr]     = useState('');

  const load = async () => {
    setLoading(true);
    try { const r = await perumahanApi.getAll(); setData(r.data || []); }
    catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const flash  = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };
  const close  = ()  => { setModal(null); setActive(null); setErr(''); };
  const openAdd  = () => { setForm({ nama:'', lokasi:'' }); setErr(''); setModal('add'); };
  const openEdit = (r) => { setActive(r); setForm({ nama: r.nama, lokasi: r.lokasi }); setErr(''); setModal('edit'); };
  const openDel  = (r) => { setActive(r); setModal('del'); };

  const handleSave = async () => {
    if (!form.nama.trim() || !form.lokasi.trim()) {
      setErr('Nama dan lokasi wajib diisi.'); return;
    }
    try {
      if (modal === 'add') {
        await perumahanApi.create(form);
        flash('✅ Perumahan berhasil ditambahkan.');
      } else {
        await perumahanApi.update(active.id, form);
        flash('✅ Perumahan berhasil diperbarui.');
      }
      close(); load();
    } catch (e) { setErr(e.message); }
  };

  const handleDel = async () => {
    try {
      await perumahanApi.delete(active.id);
      flash('✅ Perumahan dihapus.'); close(); load();
    } catch (e) { setErr(e.message); }
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem', flexWrap:'wrap', gap:'1rem' }}>
        <h2 style={{ fontFamily:'var(--serif)', fontSize:'1.8rem', fontWeight:300, color:'var(--espresso)' }}>Manajemen Perumahan</h2>
        <button onClick={openAdd} style={btnPrimary}>+ Tambah Perumahan</button>
      </div>

      {msg && <div style={flashStyle}>{msg}</div>}

      {loading ? <div style={{ color:'var(--light)', textAlign:'center', padding:'3rem' }}>Memuat…</div> : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'1.2rem' }}>
          {data.length === 0 && (
            <div style={{ color:'var(--light)', padding:'3rem', gridColumn:'1/-1', textAlign:'center' }}>Belum ada perumahan.</div>
          )}
          {data.map(row => (
            <div key={row.id} style={{ background:'#fff', border:'1px solid var(--mist)', padding:'1.5rem', borderLeft:'4px solid var(--accent)', transition:'box-shadow .2s' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(44,31,20,.08)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'.8rem' }}>
                <div>
                  <div style={{ fontFamily:'var(--serif)', fontSize:'1.2rem', color:'var(--espresso)', marginBottom:'.2rem' }}>{row.nama}</div>
                  <div style={{ fontSize:'.78rem', color:'var(--light)' }}>📍 {row.lokasi}</div>
                </div>
                <span style={{ fontFamily:'var(--serif)', fontSize:'1.8rem', color:'var(--clay)', fontWeight:300 }}>#{row.id}</span>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.5rem', marginBottom:'1.2rem', paddingTop:'.8rem', borderTop:'1px solid var(--mist)' }}>
                {[['Total Tipe', row.total_tipe || '—'], ['Unit Tersedia', row.total_unit_tersedia || 0], ['Harga Mulai', row.harga_terendah_juta ? `Rp ${row.harga_terendah_juta} Jt` : '—'], ['Harga Tertinggi', row.harga_tertinggi_juta ? `Rp ${row.harga_tertinggi_juta} Jt` : '—']].map(([k,v]) => (
                  <div key={k}>
                    <div style={{ fontSize:'.6rem', letterSpacing:'.1em', textTransform:'uppercase', color:'var(--light)' }}>{k}</div>
                    <div style={{ fontSize:'.88rem', fontWeight:500, color:'var(--espresso)' }}>{v}</div>
                  </div>
                ))}
              </div>

              <div style={{ display:'flex', gap:'.6rem' }}>
                <button onClick={() => openEdit(row)} style={{ ...btnSm('#005BAA'), flex:1 }}>✏ Edit</button>
                <button onClick={() => openDel(row)}  style={{ ...btnSm('#A04040'), flex:1 }}>🗑 Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add/Edit */}
      {(modal === 'add' || modal === 'edit') && (
        <Overlay onClose={close}>
          <h3 style={modalTitle}>{modal==='add' ? '+ Tambah Perumahan' : `✏ Edit — ${active?.nama}`}</h3>
          {err && <div style={errBox}>{err}</div>}
          <div style={{ display:'flex', flexDirection:'column', gap:'1.2rem' }}>
            <div>
              <label style={lbl}>Nama Perumahan</label>
              <input value={form.nama} onChange={e => setForm(f => ({...f, nama: e.target.value}))} placeholder="contoh: Jasmine Residence" style={inpSt} />
            </div>
            <div>
              <label style={lbl}>Lokasi / Alamat</label>
              <input value={form.lokasi} onChange={e => setForm(f => ({...f, lokasi: e.target.value}))} placeholder="contoh: Jl. Perdamaian No. 1" style={inpSt} />
            </div>
          </div>
          <div style={{ display:'flex', gap:'1rem', justifyContent:'flex-end', marginTop:'2rem', borderTop:'1px solid var(--mist)', paddingTop:'1.5rem' }}>
            <button onClick={close}       style={{ ...btnPrimary, background:'var(--mist)', color:'var(--text)' }}>Batal</button>
            <button onClick={handleSave}  style={btnPrimary}>{modal==='add' ? 'Tambahkan' : 'Simpan'}</button>
          </div>
        </Overlay>
      )}

      {/* Modal Delete */}
      {modal === 'del' && (
        <Overlay onClose={close}>
          <div style={{ textAlign:'center', padding:'1rem 0' }}>
            <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>⚠️</div>
            <h3 style={{ ...modalTitle, textAlign:'center' }}>Hapus Perumahan?</h3>
            <p style={{ fontSize:'.88rem', color:'var(--light)', marginBottom:'.6rem' }}>
              <strong>{active?.nama}</strong> dan semua tipe unit di dalamnya akan dihapus permanen.
            </p>
            <p style={{ fontSize:'.78rem', color:'#A04040', marginBottom:'2rem' }}>Tindakan ini tidak dapat dibatalkan.</p>
            {err && <div style={errBox}>{err}</div>}
            <div style={{ display:'flex', gap:'1rem', justifyContent:'center' }}>
              <button onClick={close}    style={{ ...btnPrimary, background:'var(--mist)', color:'var(--text)' }}>Batal</button>
              <button onClick={handleDel} style={{ ...btnPrimary, background:'#A04040' }}>Ya, Hapus Semua</button>
            </div>
          </div>
        </Overlay>
      )}
    </div>
  );
}

function Overlay({ children, onClose }) {
  return (
    <div onClick={e => e.target===e.currentTarget && onClose()}
      style={{ position:'fixed', inset:0, background:'rgba(44,31,20,.6)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
      <div style={{ background:'#fff', width:'100%', maxWidth:520, maxHeight:'90vh', overflowY:'auto', padding:'2.5rem', position:'relative', borderRadius:2 }}>
        <button onClick={onClose} style={{ position:'absolute', top:'1rem', right:'1rem', background:'none', border:'none', fontSize:'1.3rem', cursor:'pointer', color:'var(--light)' }}>✕</button>
        {children}
      </div>
    </div>
  );
}

const lbl       = { display:'block', fontSize:'.65rem', letterSpacing:'.1em', textTransform:'uppercase', color:'var(--earth)', marginBottom:'.4rem', fontWeight:500 };
const inpSt     = { width:'100%', padding:'.75rem 1rem', border:'1px solid var(--mist)', background:'var(--white)', color:'var(--text)', fontFamily:'var(--sans)', fontSize:'.9rem' };
const btnPrimary = { padding:'.75rem 1.8rem', background:'var(--espresso)', border:'none', color:'var(--sand)', fontFamily:'var(--sans)', fontSize:'.78rem', fontWeight:500, letterSpacing:'.08em', textTransform:'uppercase', cursor:'pointer' };
const btnSm     = (bg) => ({ padding:'.5rem .8rem', background:bg, border:'none', color:'#fff', fontSize:'.72rem', cursor:'pointer', letterSpacing:'.06em', textTransform:'uppercase', fontFamily:'var(--sans)', borderRadius:2 });
const flashStyle = { background:'rgba(74,124,89,.1)', border:'1px solid rgba(74,124,89,.3)', color:'var(--green)', padding:'.8rem 1.2rem', marginBottom:'1rem', fontSize:'.85rem' };
const errBox    = { background:'rgba(160,64,64,.1)', border:'1px solid rgba(160,64,64,.3)', color:'#A04040', padding:'.75rem 1rem', marginBottom:'1rem', fontSize:'.82rem' };
const modalTitle = { fontFamily:'var(--serif)', fontSize:'1.4rem', fontWeight:400, color:'var(--espresso)', marginBottom:'1.5rem' };

export default AdminPerumahan;
