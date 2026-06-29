// ================================================================
//  components/common/MapPicker.jsx
//  Google Maps picker — cari alamat, klik/drag pin, update lat/lng
//
//  Cara pakai:
//    import MapPicker from '../common/MapPicker';
//    <MapPicker lat={form.lat} lng={form.lng} onPickLocation={(lat,lng) => ...} />
//
//  Konfigurasi:
//    Tambahkan di file .env frontend:
//    VITE_GOOGLE_MAPS_API_KEY=AIzaSy...
// ================================================================
import { useState, useEffect, useRef } from 'react';

// ── Load Google Maps API (dipanggil sekali, aman jika dipanggil berulang)
function loadGoogleMapsScript(apiKey, onReady, onError) {
  // Sudah dimuat sebelumnya
  if (window.google?.maps) { onReady(); return; }

  // Script sedang dalam proses dimuat
  if (document.getElementById('gmaps-script')) {
    // Tunggu sampai selesai via polling
    const wait = setInterval(() => {
      if (window.google?.maps) { clearInterval(wait); onReady(); }
    }, 150);
    return;
  }

  window.__gmaps_ready_cb = onReady;

  const script    = document.createElement('script');
  script.id       = 'gmaps-script';
  script.async    = true;
  script.defer    = true;
  script.src      = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker&callback=__gmaps_ready_cb`;
  script.onerror  = onError;
  document.head.appendChild(script);
}

// ── Komponen utama
export default function MapPicker({ lat, lng, onPickLocation }) {
  const containerRef = useRef(null);
  const mapRef       = useRef(null);    // google.maps.Map
  const markerRef    = useRef(null);    // google.maps.Marker
  const [searchVal,  setSearchVal]  = useState('');
  const [apiReady,   setApiReady]   = useState(!!window.google?.maps);
  const [error,      setError]      = useState('');
  const [searching,  setSearching]  = useState(false);

const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';

  // ── 1. Muat Google Maps API
  useEffect(() => {
    if (!API_KEY) return;
    loadGoogleMapsScript(
      API_KEY,
      () => setApiReady(true),
      () => setError('Gagal memuat Google Maps. Periksa API key & koneksi internet.')
    );
  }, [API_KEY]);

  // ── 2. Inisialisasi peta setelah API siap
  useEffect(() => {
    if (!apiReady || !containerRef.current || mapRef.current) return;

    const defaultCenter = { lat: -6.9344, lng: 107.5965 }; // Bandung
    const center = (lat && lng)
      ? { lat: parseFloat(lat), lng: parseFloat(lng) }
      : defaultCenter;

    // Buat instance Map
    const map = new window.google.maps.Map(containerRef.current, {
      center,
      zoom:              lat && lng ? 16 : 12,
      mapId:             'DEMO_MAP_ID',
      zoomControl:       true,
      streetViewControl: true,
      mapTypeControl:    false,
      fullscreenControl: false,
    });
    mapRef.current = map;

    // Buat Marker yang bisa digeser
    const marker = new window.google.maps.Marker({
      map,
      position:  lat && lng ? center : null,
      draggable: true,
      animation: window.google.maps.Animation.DROP,
      title:     'Geser untuk mengubah lokasi',
    });
    markerRef.current = marker;

    // Klik peta → pindahkan marker + update parent
    map.addListener('click', e => {
      const pos = e.latLng;
      marker.setPosition(pos);
      onPickLocation(
        pos.lat().toFixed(6),
        pos.lng().toFixed(6)
      );
    });

    // Selesai drag → update parent
    marker.addListener('dragend', e => {
      const pos = e.latLng;
      onPickLocation(
        pos.lat().toFixed(6),
        pos.lng().toFixed(6)
      );
    });
  }, [apiReady]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 3. Sync marker saat lat/lng berubah dari luar (contoh: pilih tipe unit)
  useEffect(() => {
    if (!markerRef.current || !mapRef.current || !lat || !lng) return;
    const pos = { lat: parseFloat(lat), lng: parseFloat(lng) };
    markerRef.current.setPosition(pos);
    mapRef.current.panTo(pos);
    mapRef.current.setZoom(16);
  }, [lat, lng]);

  // ── 4. Cari alamat via Google Geocoder
  const handleSearch = () => {
    if (!apiReady || !searchVal.trim()) return;
    setSearching(true);
    setError('');
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode(
      { address: searchVal, region: 'id' },
      (results, status) => {
        setSearching(false);
        if (status === 'OK' && results[0]) {
          const loc = results[0].geometry.location;
          onPickLocation(
            loc.lat().toFixed(6),
            loc.lng().toFixed(6)
          );
        } else {
          setError('Alamat tidak ditemukan. Coba kata kunci lain.');
          setTimeout(() => setError(''), 3500);
        }
      }
    );
  };

  // ── Render
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'.6rem' }}>

      {/* Search bar */}
      <div style={{ display:'flex', gap:'.5rem' }}>
        <input
          value={searchVal}
          onChange={e => setSearchVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="Cari alamat / nama lokasi di Indonesia…"
          style={styles.input}
        />
        <button
          onClick={handleSearch}
          disabled={!apiReady || searching}
          style={{
            ...styles.btn,
            opacity: (!apiReady || searching) ? .55 : 1,
            cursor:  (!apiReady || searching) ? 'not-allowed' : 'pointer',
          }}
        >
          {searching ? '⏳' : '🔍 Cari'}
        </button>
      </div>

      {/* Pesan error */}
      {error && (
        <div style={styles.errBox}>⚠ {error}</div>
      )}

      {/* Info jika API key belum dikonfigurasi */}
      {!API_KEY && (
        <div style={styles.infoBox}>
          <strong>Google Maps belum aktif.</strong> Tambahkan di file{' '}
          <code style={styles.code}>.env</code> frontend:<br />
          <code style={styles.code}>VITE_GOOGLE_MAPS_API_KEY=AIzaSy…</code>
        </div>
      )}

      {/* Container peta Google Maps */}
      <div
        ref={containerRef}
        style={{
          ...styles.mapContainer,
          // Tampilkan placeholder saat API belum siap
          ...(!apiReady && styles.mapPlaceholder),
        }}
      >
        {!apiReady && (
          <div style={{ textAlign:'center', color:'#7A7065', fontSize:'.78rem' }}>
            <div style={{ fontSize:'2rem', marginBottom:'.4rem' }}>🗺</div>
            {API_KEY ? 'Memuat Google Maps…' : 'Isi Lat / Lng secara manual'}
          </div>
        )}
      </div>

      {/* Koordinat aktif + link eksternal */}
      {lat && lng && (
        <div style={styles.coordRow}>
          <span style={{ color:'#7A7065', fontSize:'.7rem' }}>
            📍 {parseFloat(lat).toFixed(6)}, {parseFloat(lng).toFixed(6)}
            <em style={{ marginLeft:'.5rem', opacity:.7 }}>
              · Klik peta atau geser pin untuk ubah lokasi
            </em>
          </span>
          <a
            href={`https://www.google.com/maps?q=${lat},${lng}`}
            target="_blank"
            rel="noreferrer"
            style={styles.link}
          >
            Buka di Google Maps ↗
          </a>
        </div>
      )}
    </div>
  );
}

// ── Style lokal (tidak bergantung CSS global)
const styles = {
  input: {
    flex: 1,
    padding: '.7rem .9rem',
    border: '1px solid #EAE5DC',
    background: '#FDFCFA',
    color: '#3A2E25',
    fontFamily: 'DM Sans, sans-serif',
    fontSize: '.88rem',
    outline: 'none',
    width: '100%',
  },
  btn: {
    padding: '.65rem 1.2rem',
    background: '#2C1F14',
    border: 'none',
    color: '#F5F0E8',
    fontFamily: 'DM Sans, sans-serif',
    fontSize: '.78rem',
    fontWeight: 500,
    letterSpacing: '.08em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    transition: 'background .2s',
  },
  errBox: {
    color: '#A04040',
    fontSize: '.72rem',
    padding: '.45rem .7rem',
    background: 'rgba(160,64,64,.07)',
    border: '1px solid rgba(160,64,64,.2)',
  },
  infoBox: {
    padding: '.8rem 1rem',
    background: 'rgba(181,132,74,.07)',
    border: '1px dashed #C8B49A',
    fontSize: '.78rem',
    color: '#8C6F5A',
    lineHeight: 1.65,
  },
  code: {
    background: '#EAE5DC',
    padding: '.1rem .4rem',
    fontFamily: 'monospace',
    fontSize: '.82em',
  },
  mapContainer: {
    width: '100%',
    height: 280,
    border: '1px solid #EAE5DC',
  },
  mapPlaceholder: {
    background: '#F5F0E8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coordRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '.4rem',
  },
  link: {
    fontSize: '.7rem',
    color: '#B5844A',
    textDecoration: 'none',
  },
};
