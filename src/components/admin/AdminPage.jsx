import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminProperties from './AdminProperties';
import AdminPerumahan  from './AdminPerumahan';
import AdminInquiry    from './AdminInquiry';
import AdminContent    from './AdminContent';
import AdminBookings   from './AdminBookings';

const MENUS = [
  { key: 'content',    icon: '✏️', label: 'Konten Web'  },
  { key: 'properties', icon: '🏠', label: 'Properti'    },
  { key: 'perumahan',  icon: '🏘', label: 'Perumahan'   },
  { key: 'booking',    icon: '📋', label: 'Booking'     },
  { key: 'inquiry',    icon: '📨', label: 'Inquiry & User' },
];

function AdminPage({ setPage }) {
  const { user, logout }  = useAuth();
  const [activeMenu, setActiveMenu] = useState('content');
  const [collapsed,  setCollapsed]  = useState(false);

  const handleLogout = async () => { await logout(); setPage('home'); };

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#F0EDE8' }}>

      {/* ── SIDEBAR */}
      <aside style={{
        width: collapsed ? 64 : 230, flexShrink:0,
        background:'var(--espresso)', display:'flex', flexDirection:'column',
        transition:'width .25s ease', position:'sticky', top:0, height:'100vh', overflow:'hidden',
      }}>
        {/* Logo */}
        <div style={{ padding:'1.4rem 1rem', borderBottom:'1px solid rgba(200,180,154,.1)', flexShrink:0, display:'flex', alignItems:'center', justifyContent: collapsed ? 'center' : 'space-between' }}>
          {!collapsed && (
            <div style={{ fontFamily:'var(--serif)', fontSize:'1.25rem', color:'var(--sand)', letterSpacing:'.08em', whiteSpace:'nowrap' }}>
              HAVEN<span style={{ color:'var(--accent)' }}>EST</span>
            </div>
          )}
          <button onClick={() => setCollapsed(v => !v)}
            style={{ background:'none', border:'none', color:'var(--clay)', cursor:'pointer', fontSize:'1rem', lineHeight:1, padding:'.25rem', flexShrink:0 }}>
            {collapsed ? '▶' : '◀'}
          </button>
        </div>
        {!collapsed && <div style={{ padding:'.25rem 1rem .75rem', fontSize:'.58rem', letterSpacing:'.14em', textTransform:'uppercase', color:'rgba(200,180,154,.5)' }}>Admin Panel</div>}

        {/* Nav items */}
        <nav style={{ flex:1, overflowY:'auto', padding:'.5rem 0' }}>
          {MENUS.map(m => (
            <button key={m.key} onClick={() => setActiveMenu(m.key)}
              title={collapsed ? m.label : undefined}
              style={{
                width:'100%', display:'flex', alignItems:'center',
                gap: collapsed ? 0 : '.8rem', justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '.9rem 0' : '.85rem 1.2rem',
                background: activeMenu===m.key ? 'rgba(181,132,74,.18)' : 'transparent',
                borderLeft:  activeMenu===m.key ? '3px solid var(--accent)' : '3px solid transparent',
                border:'none', cursor:'pointer', transition:'all .15s',
              }}>
              <span style={{ fontSize:'1.05rem', flexShrink:0 }}>{m.icon}</span>
              {!collapsed && (
                <span style={{ fontSize:'.8rem', fontWeight: activeMenu===m.key ? 600 : 400, color: activeMenu===m.key ? 'var(--sand)' : 'var(--clay)', whiteSpace:'nowrap' }}>
                  {m.label}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer sidebar */}
        <div style={{ borderTop:'1px solid rgba(200,180,154,.1)', padding:'.6rem', flexShrink:0 }}>
          {!collapsed && (
            <div style={{ display:'flex', alignItems:'center', gap:'.6rem', padding:'.7rem .8rem', marginBottom:'.4rem', background:'rgba(255,255,255,.04)' }}>
              <div style={{ width:30, height:30, borderRadius:'50%', background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--serif)', fontSize:'.85rem', color:'#fff', flexShrink:0 }}>
                {user?.nama?.[0]?.toUpperCase() || 'A'}
              </div>
              <div style={{ overflow:'hidden' }}>
                <div style={{ fontSize:'.78rem', fontWeight:600, color:'var(--sand)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user?.nama}</div>
                <div style={{ fontSize:'.58rem', letterSpacing:'.08em', textTransform:'uppercase', color:'var(--accent)' }}>{user?.role}</div>
              </div>
            </div>
          )}
          {[
            { icon:'🌐', label:'Lihat Website', action:() => setPage('home') },
            { icon:'🚪', label:'Logout',        action:handleLogout, danger:true },
          ].map(({ icon, label, action, danger }) => (
            <button key={label} onClick={action} title={collapsed ? label : undefined}
              style={{ width:'100%', display:'flex', alignItems:'center', gap: collapsed?0:'.6rem', justifyContent: collapsed?'center':'flex-start', padding: collapsed?'.7rem 0':'.65rem .8rem', background:'none', border:'none', cursor:'pointer', color: danger?'#ff9999':'var(--clay)', fontSize:'.79rem', transition:'color .15s' }}
              onMouseEnter={e => e.currentTarget.style.color = danger?'#ffb3b3':'var(--sand)'}
              onMouseLeave={e => e.currentTarget.style.color = danger?'#ff9999':'var(--clay)'}>
              <span style={{ fontSize:'.95rem', flexShrink:0 }}>{icon}</span>
              {!collapsed && label}
            </button>
          ))}
        </div>
      </aside>

      {/* ── MAIN */}
      <main style={{ flex:1, display:'flex', flexDirection:'column', minHeight:'100vh', overflow:'auto' }}>
        {/* Topbar */}
        <div style={{ background:'#fff', borderBottom:'1px solid var(--mist)', padding:'.9rem 2rem', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:10, flexShrink:0 }}>
          <div style={{ fontFamily:'var(--serif)', fontSize:'1.25rem', color:'var(--espresso)' }}>
            {MENUS.find(m => m.key===activeMenu)?.icon} {MENUS.find(m => m.key===activeMenu)?.label}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'.5rem' }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--green)' }} />
            <span style={{ fontSize:'.72rem', color:'var(--light)' }}>Live</span>
          </div>
        </div>

        <div style={{ flex:1, padding:'2rem' }}>
          {activeMenu === 'content'    && <AdminContent />}
          {activeMenu === 'properties' && <AdminProperties />}
          {activeMenu === 'perumahan'  && <AdminPerumahan />}
          {activeMenu === 'booking'    && <AdminBookings />}
          {activeMenu === 'inquiry'    && <AdminInquiry />}
        </div>
      </main>
    </div>
  );
}

export default AdminPage;
