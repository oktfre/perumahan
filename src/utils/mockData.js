// ============================================================
// MOCK DATA — Digunakan saat backend tidak tersedia (demo mode)
// Data ini disimpan di localStorage agar persisten
// ============================================================

export const MOCK_PROPERTIES = [
  { id: 1, name: "The Olive Residence", location: "Dago Atas, Bandung", price: 2400000000, badge: "Baru", beds: 4, baths: 3, area: 280, luas_bangunan_m2: 36, floor: 2, year: 2024, status: "Dijual", type: "Rumah Tapak", blok: "A", nomor_unit: "01", unit_status: "tersedia", img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80", imgs: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80","https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80","https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80","https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80"], desc: "Hunian mewah dengan desain modern minimalis di kawasan premium Dago Atas.", facilities: ["Kolam Renang","Taman Privat","Smart Home","CCTV 24 Jam","Generator","Water Heater","AC Sentral","Keamanan 24 Jam"], lat: -6.878, lng: 107.617, booking_status: null },
  { id: 2, name: "Serene Hills Cluster A", location: "Arcamanik, Bandung", price: 1800000000, badge: "Terlaris", beds: 3, baths: 2, area: 180, luas_bangunan_m2: 36, floor: 2, year: 2023, status: "Dijual", type: "Rumah Tapak", blok: "A", nomor_unit: "02", unit_status: "tersedia", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80", imgs: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80","https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80"], desc: "Cluster perumahan dengan konsep green living di Arcamanik.", facilities: ["Taman Komunal","Jogging Track","Playground","CCTV 24 Jam","Water Heater","Keamanan 24 Jam"], lat: -6.932, lng: 107.681, booking_status: null },
  { id: 3, name: "Ivory Grand House", location: "Buah Batu, Bandung", price: 3200000000, badge: "Promo", beds: 5, baths: 4, area: 350, luas_bangunan_m2: 36, floor: 3, year: 2024, status: "Dijual", type: "Rumah Tapak", blok: "A", nomor_unit: "03", unit_status: "booked", img: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80", imgs: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80","https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80"], desc: "Rumah mewah tiga lantai dengan konsep arsitektur kontemporer.", facilities: ["Kolam Renang","Home Theater","Dapur Gourmet","Smart Home","Generator","CCTV 24 Jam","Lift","AC Sentral"], lat: -6.952, lng: 107.649, booking_status: "pending" },
  { id: 4, name: "Casa Verde Villa", location: "Lembang, Bandung", price: 4500000000, badge: "Eksklusif", beds: 6, baths: 5, area: 500, luas_bangunan_m2: 36, floor: 2, year: 2023, status: "Dijual", type: "Villa", blok: "A", nomor_unit: "04", unit_status: "tersedia", img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80", imgs: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80"], desc: "Villa mewah di kawasan sejuk Lembang dengan view pegunungan memukau.", facilities: ["Kolam Renang Infinity","Taman Privat 1000m2","BBQ Area","Smart Home","Generator","CCTV 24 Jam"], lat: -6.812, lng: 107.617, booking_status: null },
  { id: 5, name: "Amber Residence", location: "Cimahi, Bandung", price: 1200000000, badge: "Baru", beds: 3, baths: 2, area: 150, luas_bangunan_m2: 36, floor: 2, year: 2025, status: "Dijual", type: "Rumah Tapak", blok: "B", nomor_unit: "01", unit_status: "tersedia", img: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80", imgs: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80"], desc: "Hunian baru dengan harga terjangkau di kawasan berkembang Cimahi.", facilities: ["Taman","CCTV 24 Jam","Water Heater","Keamanan 24 Jam"], lat: -6.884, lng: 107.542, booking_status: null },
  { id: 6, name: "The Pearl Townhouse", location: "Antapani, Bandung", price: 2100000000, badge: "Terlaris", beds: 4, baths: 3, area: 220, luas_bangunan_m2: 36, floor: 3, year: 2024, status: "Terjual", type: "Townhouse", blok: "B", nomor_unit: "02", unit_status: "terjual", img: "https://images.unsplash.com/photo-1598228723793-52759bba239c?w=800&q=80", imgs: ["https://images.unsplash.com/photo-1598228723793-52759bba239c?w=800&q=80"], desc: "Townhouse eksklusif tiga lantai di lokasi strategis Antapani.", facilities: ["Rooftop Garden","Ruang Kerja","Smart Home","CCTV 24 Jam","Water Heater","Keamanan 24 Jam"], lat: -6.921, lng: 107.668, booking_status: "approved" },
  { id: 7, name: "Green Park Residence", location: "Ujungberung, Bandung", price: 980000000, badge: "Baru", beds: 3, baths: 2, area: 120, luas_bangunan_m2: 36, floor: 2, year: 2025, status: "Dijual", type: "Rumah Tapak", blok: "B", nomor_unit: "03", unit_status: "tersedia", img: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80", imgs: ["https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80"], desc: "Rumah tapak nyaman dengan taman luas di Ujungberung.", facilities: ["Taman","Carport","CCTV 24 Jam","Keamanan 24 Jam"], lat: -6.917, lng: 107.706, booking_status: null },
  { id: 8, name: "Maple Hill House", location: "Arcamanik, Bandung", price: 1550000000, badge: "", beds: 3, baths: 2, area: 160, luas_bangunan_m2: 36, floor: 2, year: 2025, status: "Dijual", type: "Rumah Tapak", blok: "B", nomor_unit: "04", unit_status: "tersedia", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80", imgs: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"], desc: "Rumah modern 2 lantai dengan konsep open plan dan taman belakang.", facilities: ["Taman","Carport 2 Mobil","CCTV 24 Jam","Water Heater"], lat: -6.929, lng: 107.679, booking_status: null },
];

export const MOCK_BOOKINGS = [
  { id: 1, property_id: 3, property_name: "Ivory Grand House", buyer_name: "Budi Santoso", buyer_phone: "081234567891", buyer_email: "budi@email.com", buyer_address: "Jl. Mawar No. 5, Bandung", buyer_ktp: "3271012345670001", dp_amount: 320000000, dp_proof_url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=80", dp_proof_filename: "bukti_transfer_budi.jpg", notes: "Mohon diproses segera", status: "pending", admin_note: "", created_at: "2025-06-10T10:30:00", updated_at: "2025-06-10T10:30:00" },
];

export const MOCK_INQUIRIES = [
  { id: 1, nama_lengkap: "Rina Kusumawati", nomor_hp: "082345678901", email: "rina@email.com", keterangan: "KPR", pesan: "Saya tertarik dengan The Olive Residence. Apakah bisa membantu proses KPR?", status: "unread", admin_notes: null, created_at: "2025-06-12T09:00:00" },
  { id: 2, nama_lengkap: "Andika Pratama", nomor_hp: "083456789012", email: "andika@email.com", keterangan: "Info Harga", pesan: "Mohon info harga terbaru dan promo yang tersedia untuk Casa Verde Villa.", status: "read", admin_notes: "Sudah dihubungi via WA", created_at: "2025-06-11T14:20:00" },
];

export const MOCK_USERS = [
  { id: 1, name: "Admin Havenest", email: "admin@havenest.id", password: "admin123", role: "admin" },
];

export const MOCK_SITE_CONFIG = {
  site_name: "Havenest",
  tagline: "Properti Premium Indonesia",
  hero_title: "Temukan Rumah Impian Anda",
  hero_subtitle: "Koleksi hunian eksklusif dengan desain arsitektur modern, lokasi strategis, dan lingkungan premium.",
  hero_btn_text: "Jelajahi Properti",
  about_title: "Tentang Havenest",
  about_text: "Platform properti premium Indonesia yang mengutamakan transparansi, kualitas, dan kepuasan pelanggan sejak 2012. Kami hadir untuk membantu Anda menemukan hunian impian dengan layanan profesional.",
  contact_phone: "(022) 1234-5678",
  contact_email: "hello@havenest.id",
  contact_address: "Jl. Ir. H. Juanda No. 15, Bandung, Jawa Barat",
  bank_name: "Bank BCA",
  bank_account: "1234567890",
  bank_owner: "PT Havenest Prima",
  dp_min_percent: 10,
  whatsapp: "6222123456789",
  footer_text: "© 2026 PT. Havenest Prima. Semua hak dilindungi.",
};

// ── localStorage Helpers ────────────────────────────────────
function lsGet(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function lsSet(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }

// ── MOCK API — digunakan saat backend tidak tersedia ────────
export const mockPropertiesApi = {
  getAll: async (query = "") => {
    await delay();
    const props = lsGet("mock_properties", MOCK_PROPERTIES);
    const params = new URLSearchParams(query);
    const status = params.get("status");
    const q = params.get("q");
    let data = props;
    if (status) data = data.filter(p => p.status.toLowerCase() === status.toLowerCase());
    if (q) data = data.filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || p.location.toLowerCase().includes(q.toLowerCase()));
    return { data, total: data.length };
  },
  getById: async (id) => {
    await delay();
    const props = lsGet("mock_properties", MOCK_PROPERTIES);
    const data = props.find(p => p.id === Number(id));
    if (!data) throw new Error("Properti tidak ditemukan");
    return { data };
  },
  create: async (formData) => {
    await delay(600);
    const props = lsGet("mock_properties", MOCK_PROPERTIES);
    const newProp = { ...formData, id: Date.now() };
    lsSet("mock_properties", [newProp, ...props]);
    return { data: newProp, message: "Properti berhasil ditambahkan" };
  },
  update: async (id, formData) => {
    await delay(600);
    const props = lsGet("mock_properties", MOCK_PROPERTIES);
    const updated = props.map(p => p.id === Number(id) ? { ...p, ...formData } : p);
    lsSet("mock_properties", updated);
    return { data: updated.find(p => p.id === Number(id)), message: "Properti berhasil diperbarui" };
  },
  delete: async (id) => {
    await delay(400);
    const props = lsGet("mock_properties", MOCK_PROPERTIES);
    lsSet("mock_properties", props.filter(p => p.id !== Number(id)));
    return { message: "Properti berhasil dihapus" };
  },
  updateStatus: async (id, status) => {
    await delay(400);
    const props = lsGet("mock_properties", MOCK_PROPERTIES);
    lsSet("mock_properties", props.map(p => p.id === Number(id) ? { ...p, booking_status: status } : p));
    return { message: "Status diperbarui" };
  },
};

export const mockBookingsApi = {
  getAll: async (query = "") => {
    await delay();
    const bookings = lsGet("mock_bookings", MOCK_BOOKINGS);
    const params = new URLSearchParams(query);
    const status = params.get("status");
    let data = bookings;
    if (status) data = data.filter(b => b.status === status);
    return { data, total: data.length };
  },
  getById: async (id) => {
    await delay();
    const bookings = lsGet("mock_bookings", MOCK_BOOKINGS);
    return { data: bookings.find(b => b.id === Number(id)) };
  },
  create: async (formData) => {
    await delay(800);
    const bookings = lsGet("mock_bookings", MOCK_BOOKINGS);
    const newBooking = { ...formData, id: Date.now(), status: "pending", admin_note: "", created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    lsSet("mock_bookings", [newBooking, ...bookings]);
    // Update property booking_status
    const props = lsGet("mock_properties", MOCK_PROPERTIES);
    lsSet("mock_properties", props.map(p => p.id === Number(formData.property_id) ? { ...p, booking_status: "pending" } : p));
    return { data: newBooking, message: "Booking berhasil diajukan" };
  },
  approve: async (id, adminNote = "") => {
    await delay(600);
    const bookings = lsGet("mock_bookings", MOCK_BOOKINGS);
    const booking = bookings.find(b => b.id === Number(id));
    const updated = bookings.map(b => b.id === Number(id) ? { ...b, status: "approved", admin_note: adminNote, updated_at: new Date().toISOString() } : b);
    lsSet("mock_bookings", updated);
    // Update property status to Terjual
    if (booking) {
      const props = lsGet("mock_properties", MOCK_PROPERTIES);
      lsSet("mock_properties", props.map(p => p.id === Number(booking.property_id) ? { ...p, status: "Terjual", booking_status: "approved" } : p));
    }
    return { message: "Booking disetujui, properti ditandai Terjual" };
  },
  reject: async (id, adminNote = "") => {
    await delay(600);
    const bookings = lsGet("mock_bookings", MOCK_BOOKINGS);
    const booking = bookings.find(b => b.id === Number(id));
    const updated = bookings.map(b => b.id === Number(id) ? { ...b, status: "rejected", admin_note: adminNote, updated_at: new Date().toISOString() } : b);
    lsSet("mock_bookings", updated);
    // Reset property status
    if (booking) {
      const props = lsGet("mock_properties", MOCK_PROPERTIES);
      lsSet("mock_properties", props.map(p => p.id === Number(booking.property_id) ? { ...p, booking_status: null } : p));
    }
    return { message: "Booking ditolak" };
  },
  getPending: async () => {
    const bookings = lsGet("mock_bookings", MOCK_BOOKINGS);
    return { data: bookings.filter(b => b.status === "pending") };
  },
  getByProperty: async (propertyId) => {
    const bookings = lsGet("mock_bookings", MOCK_BOOKINGS);
    return { data: bookings.filter(b => b.property_id === Number(propertyId)) };
  },
};

export const mockInquiriesApi = {
  getAll: async (query = "") => {
    await delay();
    const inquiries = lsGet("mock_inquiries", MOCK_INQUIRIES);
    const params = new URLSearchParams(query);
    const status = params.get("status");
    const search = params.get("search");
    let data = [...inquiries].reverse();
    if (status) data = data.filter(i => i.status === status);
    if (search) data = data.filter(i => i.nama_lengkap.toLowerCase().includes(search.toLowerCase()) || i.pesan.toLowerCase().includes(search.toLowerCase()));
    return { data, pagination: { total_pages: 1, current_page: 1 } };
  },
  getById: async (id) => {
    await delay();
    const inquiries = lsGet("mock_inquiries", MOCK_INQUIRIES);
    return { data: inquiries.find(i => i.id === Number(id)) };
  },
  create: async (formData) => {
    await delay(600);
    const inquiries = lsGet("mock_inquiries", MOCK_INQUIRIES);
    const newInq = { ...formData, id: Date.now(), status: "unread", admin_notes: null, created_at: new Date().toISOString() };
    lsSet("mock_inquiries", [newInq, ...inquiries]);
    return { data: newInq, message: "Inquiry berhasil dikirim" };
  },
  markAsRead: async (id) => {
    await delay();
    const inqs = lsGet("mock_inquiries", MOCK_INQUIRIES);
    lsSet("mock_inquiries", inqs.map(i => i.id === Number(id) ? { ...i, status: "read" } : i));
    return { message: "Ditandai sudah dibaca" };
  },
  update: async (id, data) => {
    await delay();
    const inqs = lsGet("mock_inquiries", MOCK_INQUIRIES);
    lsSet("mock_inquiries", inqs.map(i => i.id === Number(id) ? { ...i, ...data } : i));
    return { message: "Inquiry diperbarui" };
  },
  deleteInquiry: async (id) => {
    await delay();
    const inqs = lsGet("mock_inquiries", MOCK_INQUIRIES);
    lsSet("mock_inquiries", inqs.filter(i => i.id !== Number(id)));
    return { message: "Inquiry dihapus" };
  },
  getUnreadCount: async () => {
    const inqs = lsGet("mock_inquiries", MOCK_INQUIRIES);
    return { unread_count: inqs.filter(i => i.status === "unread").length };
  },
};

export const mockAuthApi = {
  login: async (email, password) => {
    await delay(500);
    const user = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (!user) throw new Error("Email atau password salah");
    const token = "mock-token-" + Date.now();
    localStorage.setItem("auth_token", token);
    localStorage.setItem("auth_user", JSON.stringify({ id: user.id, name: user.name, email: user.email, role: user.role }));
    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  },
  logout: async () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    return { message: "Logged out" };
  },
  me: async () => {
    const user = localStorage.getItem("auth_user");
    if (!user) throw new Error("Unauthorized");
    return { data: JSON.parse(user) };
  },
};

export const mockSiteConfigApi = {
  get: async () => {
    await delay();
    return { data: lsGet("mock_site_config", MOCK_SITE_CONFIG) };
  },
  update: async (data) => {
    await delay(500);
    const current = lsGet("mock_site_config", MOCK_SITE_CONFIG);
    const updated = { ...current, ...data };
    lsSet("mock_site_config", updated);
    return { data: updated, message: "Konfigurasi berhasil disimpan" };
  },
};

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms));
