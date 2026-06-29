// ============================================================
// useApi — Auto-switch antara API nyata & mock (localStorage)
// Jika REACT_APP_USE_MOCK=true atau backend tidak bisa dijangkau,
// secara otomatis fallback ke mock localStorage.
// ============================================================

import {
  mockPropertiesApi, mockBookingsApi, mockInquiriesApi,
  mockAuthApi, mockSiteConfigApi,
} from "./mockData";
import {
  propertiesApi, bookingsApi, inquiriesApi, authApi, siteConfigApi,
} from "./api";

const USE_MOCK = process.env.REACT_APP_USE_MOCK === "true" || !process.env.REACT_APP_API_URL;

// Wrapper yang mencoba API nyata dulu, fallback ke mock jika gagal
function withFallback(realFn, mockFn) {
  if (USE_MOCK) return mockFn;
  return async (...args) => {
    try {
      return await realFn(...args);
    } catch (err) {
      // Jika network error / backend tidak tersedia → gunakan mock
      if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
        console.warn("[API] Backend tidak tersedia, menggunakan mock data");
        return mockFn(...args);
      }
      throw err;
    }
  };
}

export const api = {
  properties: {
    getAll: withFallback(propertiesApi.getAll, mockPropertiesApi.getAll),
    getById: withFallback(propertiesApi.getById, mockPropertiesApi.getById),
    create: withFallback(propertiesApi.create, mockPropertiesApi.create),
    update: withFallback(propertiesApi.update, mockPropertiesApi.update),
    delete: withFallback(propertiesApi.delete, mockPropertiesApi.delete),
    updateStatus: withFallback(propertiesApi.updateStatus, mockPropertiesApi.updateStatus),
  },
  bookings: {
    getAll: withFallback(bookingsApi.getAll, mockBookingsApi.getAll),
    getById: withFallback(bookingsApi.getById, mockBookingsApi.getById),
    create: withFallback(bookingsApi.create, mockBookingsApi.create),
    approve: withFallback(bookingsApi.approve, mockBookingsApi.approve),
    reject: withFallback(bookingsApi.reject, mockBookingsApi.reject),
    getPending: withFallback(bookingsApi.getPending, mockBookingsApi.getPending),
    getByProperty: withFallback(bookingsApi.getByProperty, mockBookingsApi.getByProperty),
  },
  inquiries: {
    getAll: withFallback(inquiriesApi.getAll, mockInquiriesApi.getAll),
    getById: withFallback(inquiriesApi.getById, mockInquiriesApi.getById),
    create: withFallback(inquiriesApi.create, mockInquiriesApi.create),
    markAsRead: withFallback(inquiriesApi.markAsRead, mockInquiriesApi.markAsRead),
    update: withFallback(inquiriesApi.update, mockInquiriesApi.update),
    deleteInquiry: withFallback(inquiriesApi.deleteInquiry, mockInquiriesApi.deleteInquiry),
    getUnreadCount: withFallback(inquiriesApi.getUnreadCount, mockInquiriesApi.getUnreadCount),
  },
  auth: {
    login: withFallback(authApi.login, mockAuthApi.login),
    logout: withFallback(authApi.logout, mockAuthApi.logout),
    me: withFallback(authApi.me, mockAuthApi.me),
  },
  siteConfig: {
    get: withFallback(siteConfigApi.get, mockSiteConfigApi.get),
    update: withFallback(siteConfigApi.update, mockSiteConfigApi.update),
  },
};

// Re-export mock inquiriesApi karena digunakan langsung di AdminInquiries
export { mockInquiriesApi as inquiriesApi };
