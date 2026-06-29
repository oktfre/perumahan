// ============================================================
// API UTILITY — Terhubung ke Backend Express + PostgreSQL
// Base URL diambil dari .env (REACT_APP_API_URL)
// ============================================================

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000/api";

// ── Token & user tersimpan di localStorage ──────────────────
const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
};
export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};
export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
export const setStoredUser = (user) => {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// ── Helper fetch dengan auth token ──────────────────────────
async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  let body = null;
  try {
    body = await res.json();
  } catch {
    /* response tanpa body (mis. 204) */
  }

  if (!res.ok) {
    throw new Error(body?.message || body?.error || `HTTP ${res.status}`);
  }
  return body;
}

// ── Client generik (dipakai CmsContext, HomePage, dll) ──────
export const api = {
  get: (path) => apiFetch(path),
  post: (path, data) => apiFetch(path, { method: "POST", body: JSON.stringify(data ?? {}) }),
  put: (path, data) => apiFetch(path, { method: "PUT", body: JSON.stringify(data ?? {}) }),
  patch: (path, data) => apiFetch(path, { method: "PATCH", body: JSON.stringify(data ?? {}) }),
  delete: (path) => apiFetch(path, { method: "DELETE" }),
};

// ── AUTH ─────────────────────────────────────────────────────
export const authApi = {
  login: ({ email, password }) =>
    apiFetch("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  logout: () => apiFetch("/auth/logout", { method: "POST" }),
  me: () => apiFetch("/auth/me"),
  gantiPassword: (password_lama, password_baru) =>
    apiFetch("/auth/ganti-password", { method: "PUT", body: JSON.stringify({ password_lama, password_baru }) }),
  getUsers: () => apiFetch("/auth/users"),
  createUser: (data) => apiFetch("/auth/users", { method: "POST", body: JSON.stringify(data) }),
  toggleUser: (id, is_active) =>
    apiFetch(`/auth/users/${id}/status`, { method: "PATCH", body: JSON.stringify({ is_active }) }),
  deleteUser: (id) => apiFetch(`/auth/users/${id}`, { method: "DELETE" }),
};

// ── PERUMAHAN ────────────────────────────────────────────────
export const perumahanApi = {
  getAll: () => apiFetch("/perumahan"),
  getById: (id) => apiFetch(`/perumahan/${id}`),
  create: (data) => apiFetch("/perumahan", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/perumahan/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => apiFetch(`/perumahan/${id}`, { method: "DELETE" }),
};

// ── PROPERTIES (tipe unit) ───────────────────────────────────
export const propertyApi = {
  getAll: (query = "") => apiFetch(`/properties${query ? `?${query}` : ""}`),
  getTersedia: (query = "") => apiFetch(`/properties/tersedia${query ? `?${query}` : ""}`),
  getFeatured: (limit = 6) => apiFetch(`/properties/featured?limit=${limit}`),
  getById: (id) => apiFetch(`/properties/${id}`),
  create: (data) => apiFetch("/properties", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/properties/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  updateStok: (id, data) => apiFetch(`/properties/${id}/stok`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id) => apiFetch(`/properties/${id}`, { method: "DELETE" }),
};
// alias (beberapa file lama memakai nama plural)
export const propertiesApi = propertyApi;

// ── GAMBAR PROPERTI ──────────────────────────────────────────
export const imageApi = {
  add: (propertyId, data) => apiFetch(`/properties/${propertyId}/images`, { method: "POST", body: JSON.stringify(data) }),
  update: (imgId, data) => apiFetch(`/properties/images/${imgId}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (imgId) => apiFetch(`/properties/images/${imgId}`, { method: "DELETE" }),
  setPrimary: (imgId) => apiFetch(`/properties/images/${imgId}/primary`, { method: "PUT" }),
};

// ── REKAP & KPR ──────────────────────────────────────────────
export const rekapApi = { get: () => apiFetch("/rekap") };
export const kprApi = {
  getBanks: () => apiFetch("/kpr/banks"),
  simulasi: (data) => apiFetch("/kpr/simulasi", { method: "POST", body: JSON.stringify(data) }),
};

// ── KONTAK (form konsultasi) ─────────────────────────────────
export const kontakApi = {
  submit: (data) => apiFetch("/kontak", { method: "POST", body: JSON.stringify(data) }),
  getAll: (query = "") => apiFetch(`/kontak${query ? `?${query}` : ""}`),
  getTestimonials: () => apiFetch("/testimonials"),
};

// ── INQUIRIES (konsultasi gratis) ────────────────────────────
export const inquiriesApi = {
  create: (data) => apiFetch("/inquiries", { method: "POST", body: JSON.stringify(data) }),
  getAll: (query = "") => apiFetch(`/inquiries${query ? `?${query}` : ""}`),
  getById: (id) => apiFetch(`/inquiries/${id}`),
  update: (id, data) => apiFetch(`/inquiries/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  markAsRead: (id) => apiFetch(`/inquiries/${id}/mark-read`, { method: "PATCH" }),
  deleteInquiry: (id) => apiFetch(`/inquiries/${id}`, { method: "DELETE" }),
  getUnreadCount: () => apiFetch("/inquiries/unread-count"),
};

// ── BOOKING ──────────────────────────────────────────────────
export const bookingApi = {
  create: (data) => apiFetch("/booking", { method: "POST", body: JSON.stringify(data) }),
  getAll: (query = "") => apiFetch(`/admin/booking${query ? `?${query}` : ""}`),
  getById: (id) => apiFetch(`/admin/booking/${id}`),
  confirm: (id) => apiFetch(`/admin/booking/${id}/confirm`, { method: "PUT" }),
  reject: (id, alasan) => apiFetch(`/admin/booking/${id}/reject`, { method: "PUT", body: JSON.stringify({ alasan }) }),
};

// ── CMS (konten website) ─────────────────────────────────────
export const cmsApi = {
  getAll: () => apiFetch("/cms"),
  getSection: (section) => apiFetch(`/cms/${section}`),
  updateSection: (section, data) => apiFetch(`/cms/${section}`, { method: "PUT", body: JSON.stringify(data) }),
  reset: () => apiFetch("/cms/reset", { method: "POST" }),
};
