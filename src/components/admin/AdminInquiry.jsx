import { useState, useEffect } from 'react';
import { authApi } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import AdminInquiries from './AdminInquiries';

function AdminInquiry() {
  const { user: me } = useAuth();
  const [tab,    setTab]    = useState('inquiry');
  const [users,  setUsers]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,  setModal]  = useState(null);
  const [form,   setForm]   = useState({ nama:'', email:'', password:'', role:'user' });
  const [msg,    setMsg]    = useState('');
  const [err,    setErr]    = useState('');

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3500); };
  const close = () => { setModal(null); setErr(''); setForm({ nama:'', email:'', password:'', role:'user' }); };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const u = await authApi.getUsers();
        setUsers(u.data || []);
      } catch (e) { setErr(e.message); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleCreateUser = async () => {
    if (!form.nama || !form.email || !form.password) { setErr('Semua field wajib diisi.'); return; }
    try {
      await authApi.createUser(form);
      flash('✅ Akun berhasil dibuat.');
      const r = await authApi.getUsers(); setUsers(r.data || []);
      close();
    } catch (e) { setErr(e.message); }
  };

  const handleToggle = async (u) => {
    try {
      await authApi.toggleUser(u.id, !u.is_active);
      flash(`✅ Akun "${u.nama}" ${!u.is_active ? 'diaktifkan' : 'dinonaktifkan'}.`);
      const r = await authApi.getUsers(); setUsers(r.data || []);
    } catch (e) { setErr(e.message); }
  };

  const handleDelUser = async (u) => {
    if (!window.confirm(`Hapus akun "${u.nama}"? Tindakan ini permanen.`)) return;
    try {
      await authApi.deleteUser(u.id);
      flash('✅ Akun dihapus.');
      const r = await authApi.getUsers(); setUsers(r.data || []);
    } catch (e) { setErr(e.message); }
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem', flexWrap:'wrap', gap:'1rem' }}>
        <h2 style={{ fontFamily:'var(--serif)', fontSize:'1.8rem', fontWeight:300, color:'var(--espresso)' }}>
          {tab === 'inquiry' ? 'Inquiry Konsultasi' : 'Manajemen Akun'}
        </h2>
        <div style={{ display:'flex', gap:'.5rem' }}>
          {['inquiry','users'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding:'.55rem 1.4rem', background: tab===t ? 'var(--espresso)' : 'var(--mist)', border:'none', color: tab===t ? 'var(--sand)' : 'var(--text)', fontFamily:'var(--sans)', fontSize:'.75rem', letterSpacing:'.08em', textTransform:'uppercase', cursor:'pointer' }}>
              {t === 'inquiry' ? '📨 Inquiry' : '👤 Users'}
            </button>
          ))}
          {tab === 'users' && (
            <button onClick={() => setModal('addUser')} style={{ padding:'.55rem 1.4rem', background:'var(--accent)', border:'none', color:'#fff', fontFamily:'var(--sans)', fontSize:'.75rem', letterSpacing:'.08em', textTransform:'uppercase', cursor:'pointer' }}>
              + Tambah Akun
            </button>
          )}
        </div>
      </div>

      {msg && <div style={flashStyle}>{msg}</div>}
      {err && !modal && <div style={errBox}>{err}</div>}

      {loading ? <div style={{ textAlign:'center', padding:'4rem', color:'var(--light)' }}>Memuat…</div> : (
        <>
          {/* ── TAB INQUIRY — gunakan AdminInquiries component baru */}
          {tab === 'inquiry' && <AdminInquiries />}

          {/* ── TAB USERS */}
          {tab === 'users' && (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'.83rem' }}>
                <thead>
                  <tr style={{ background:'var(--espresso)', color:'var(--sand)' }}>
                    {['ID','Nama','Email','Role','Status','Last Login','Aksi'].map(h => (
                      <th key={h} style={{ padding:'.75rem 1rem', textAlign:'left', fontWeight:500, fontSize:'.67rem', letterSpacing:'.08em', textTransform:'uppercase', whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                {users.length === 0 ? null : (
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id} style={{ background: i%2===0?'#fff':'var(--sand)', borderBottom:'1px solid var(--mist)' }}>
                      <td style={td}>{u.id}</td>
                      <td style={td}><strong>{u.nama}</strong>{u.id === me?.id && <span style={{ marginLeft:'.4rem', fontSize:'.6rem', color:'var(--accent)' }}>(saya)</span>}</td>
                      <td style={td}>{u.email}</td>
                      <td style={td}>
                        <span style={{ padding:'.2rem .65rem', fontSize:'.6rem', letterSpacing:'.08em', textTransform:'uppercase', background: u.role==='admin' ? 'rgba(44,31,20,.08)' : 'rgba(0,91,170,.08)', color: u.role==='admin' ? 'var(--espresso)' : '#005BAA', border:`1px solid ${u.role==='admin' ? 'rgba(44,31,20,.2)' : 'rgba(0,91,170,.2)'}` }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={td}>
                        <span style={{ padding:'.2rem .65rem', fontSize:'.6rem', letterSpacing:'.08em', textTransform:'uppercase', background: u.is_active ? 'rgba(74,124,89,.1)' : 'rgba(160,64,64,.1)', color: u.is_active ? 'var(--green)' : 'var(--red)', border:`1px solid ${u.is_active ? 'rgba(74,124,89,.3)' : 'rgba(160,64,64,.3)'}` }}>
                          {u.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td style={td}>{u.last_login ? new Date(u.last_login).toLocaleDateString('id-ID') : '—'}</td>
                      <td style={td}>
                        {u.id !== me?.id && (
                          <div style={{ display:'flex', gap:'.4rem' }}>
                            <button onClick={() => handleToggle(u)} style={btnSm(u.is_active ? '#B5844A' : 'var(--green)')}>
                              {u.is_active ? 'Nonaktif' : 'Aktifkan'}
                            </button>
                            <button onClick={() => handleDelUser(u)} style={btnSm('#A04040')}>Hapus</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                )}
              </table>
              {users.length === 0 && <Empty icon="👤" text="Belum ada user terdaftar." />}
            </div>
          )}
        </>
      )}

      {/* Modal Tambah User */}
      {modal === 'addUser' && (
        <div onClick={e => e.target===e.currentTarget && close()}
          style={{ position:'fixed', inset:0, background:'rgba(44,31,20,.6)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
          <div style={{ background:'#fff', width:'100%', maxWidth:460, padding:'2.5rem', position:'relative', borderRadius:2 }}>
            <button onClick={close} style={{ position:'absolute', top:'1rem', right:'1rem', background:'none', border:'none', fontSize:'1.3rem', cursor:'pointer', color:'var(--light)' }}>✕</button>
            <h3 style={{ fontFamily:'var(--serif)', fontSize:'1.4rem', fontWeight:400, color:'var(--espresso)', marginBottom:'1.5rem' }}>+ Tambah Akun Baru</h3>
            {err && <div style={errBox}>{err}</div>}
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              {[['Nama Lengkap','nama','text'],['Email','email','email'],['Password (min 8 karakter)','password','password']].map(([label, key, type]) => (
                <div key={key}>
                  <label style={lbl}>{label}</label>
                  <input type={type} value={form[key]} onChange={e => setForm(f=>({...f,[key]:e.target.value}))} style={inpSt} />
                </div>
              ))}
              <div>
                <label style={lbl}>Role</label>
                <select value={form.role} onChange={e => setForm(f=>({...f, role:e.target.value}))} style={inpSt}>
                  <option value="user">User (hanya lihat)</option>
                  <option value="admin">Admin (CRUD penuh)</option>
                </select>
              </div>
            </div>
            <div style={{ display:'flex', gap:'1rem', justifyContent:'flex-end', marginTop:'2rem', borderTop:'1px solid var(--mist)', paddingTop:'1.5rem' }}>
              <button onClick={close}            style={{ padding:'.75rem 1.5rem', background:'var(--mist)', border:'none', color:'var(--text)', fontFamily:'var(--sans)', fontSize:'.78rem', cursor:'pointer' }}>Batal</button>
              <button onClick={handleCreateUser} style={{ padding:'.75rem 1.5rem', background:'var(--espresso)', border:'none', color:'var(--sand)', fontFamily:'var(--sans)', fontSize:'.78rem', cursor:'pointer' }}>Buat Akun</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Empty({ icon, text }) {
  return (
    <div style={{ textAlign:'center', padding:'5rem', color:'var(--light)' }}>
      <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>{icon}</div>
      <div style={{ fontSize:'1rem' }}>{text}</div>
    </div>
  );
}

const td       = { padding:'.75rem 1rem', color:'var(--text)', verticalAlign:'middle' };
const lbl      = { display:'block', fontSize:'.65rem', letterSpacing:'.1em', textTransform:'uppercase', color:'var(--earth)', marginBottom:'.4rem', fontWeight:500 };
const inpSt    = { width:'100%', padding:'.75rem 1rem', border:'1px solid var(--mist)', background:'var(--white)', color:'var(--text)', fontFamily:'var(--sans)', fontSize:'.9rem' };
const btnSm    = (bg) => ({ padding:'.35rem .75rem', background:bg, border:'none', color:'#fff', fontSize:'.7rem', cursor:'pointer', letterSpacing:'.06em', textTransform:'uppercase', fontFamily:'var(--sans)', borderRadius:2 });
const flashStyle = { background:'rgba(74,124,89,.1)', border:'1px solid rgba(74,124,89,.3)', color:'var(--green)', padding:'.8rem 1.2rem', marginBottom:'1rem', fontSize:'.85rem' };
const errBox   = { background:'rgba(160,64,64,.1)', border:'1px solid rgba(160,64,64,.3)', color:'#A04040', padding:'.75rem 1rem', marginBottom:'1rem', fontSize:'.82rem' };

export default AdminInquiry;
