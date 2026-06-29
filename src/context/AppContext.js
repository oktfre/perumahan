import React, { createContext, useContext, useState, useEffect } from "react";
import { initialProperties, initialBookings, initialUsers, initialSiteConfig } from "../data/initialData";

const AppContext = createContext();

export function AppProvider({ children }) {
  // ── State ─────────────────────────────────────────────────
  const [siteConfig, setSiteConfig] = useState(() => {
    const stored = localStorage.getItem("siteConfig");
    return stored ? JSON.parse(stored) : initialSiteConfig;
  });

  const [properties, setProperties] = useState(() => {
    const stored = localStorage.getItem("properties");
    return stored ? JSON.parse(stored) : initialProperties;
  });

  const [bookings, setBookings] = useState(() => {
    const stored = localStorage.getItem("bookings");
    return stored ? JSON.parse(stored) : initialBookings;
  });

  const [users] = useState(() => {
    const stored = localStorage.getItem("users");
    return stored ? JSON.parse(stored) : initialUsers;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const stored = sessionStorage.getItem("currentUser");
    return stored ? JSON.parse(stored) : null;
  });

  // ── Persist to localStorage ────────────────────────────────
  useEffect(() => { localStorage.setItem("siteConfig", JSON.stringify(siteConfig)); }, [siteConfig]);
  useEffect(() => { localStorage.setItem("properties", JSON.stringify(properties)); }, [properties]);
  useEffect(() => { localStorage.setItem("bookings", JSON.stringify(bookings)); }, [bookings]);

  // ── Auth ──────────────────────────────────────────────────
  const login = (email, password) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      const { password: _, ...safeUser } = user;
      setCurrentUser(safeUser);
      sessionStorage.setItem("currentUser", JSON.stringify(safeUser));
      return { success: true, user: safeUser };
    }
    return { success: false, message: "Email atau password salah" };
  };

  const logout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem("currentUser");
  };

  // ── Properties CRUD ───────────────────────────────────────
  const addProperty = (data) => {
    const newProp = { ...data, id: "prop-" + Date.now(), createdAt: new Date().toISOString().split("T")[0], status: "available" };
    setProperties(prev => [newProp, ...prev]);
    return newProp;
  };

  const updateProperty = (id, data) => {
    setProperties(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  };

  const deleteProperty = (id) => {
    setProperties(prev => prev.filter(p => p.id !== id));
  };

  // ── Site Config CRUD ──────────────────────────────────────
  const updateSiteConfig = (data) => {
    setSiteConfig(prev => ({ ...prev, ...data }));
  };

  // ── Bookings ──────────────────────────────────────────────
  const createBooking = (data) => {
    const newBooking = {
      ...data,
      id: "book-" + Date.now(),
      status: "pending",
      adminNote: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setBookings(prev => [newBooking, ...prev]);
    // Set property to pre-booking
    updateProperty(data.propertyId, { status: "pre-booking" });
    return newBooking;
  };

  const updateBookingStatus = (bookingId, status, adminNote = "") => {
    setBookings(prev => prev.map(b => {
      if (b.id !== bookingId) return b;
      const updated = { ...b, status, adminNote, updatedAt: new Date().toISOString() };
      return updated;
    }));
    // If approved → set property sold; if rejected → set property available again
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      if (status === "approved") updateProperty(booking.propertyId, { status: "sold" });
      if (status === "rejected") updateProperty(booking.propertyId, { status: "available" });
    }
  };

  // ── Helpers ───────────────────────────────────────────────
  const getPropertyById = (id) => properties.find(p => p.id === id);
  const getBookingsByProperty = (propertyId) => bookings.filter(b => b.propertyId === propertyId);
  const getPendingBookings = () => bookings.filter(b => b.status === "pending");

  return (
    <AppContext.Provider value={{
      siteConfig, updateSiteConfig,
      properties, addProperty, updateProperty, deleteProperty, getPropertyById,
      bookings, createBooking, updateBookingStatus, getBookingsByProperty, getPendingBookings,
      users,
      currentUser, login, logout,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
