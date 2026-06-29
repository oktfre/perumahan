import { useState, useRef, useEffect } from "react";
import { useScrolled } from "../hooks/useReveal";
import { useAuth } from "../context/AuthContext";
import { useCms } from "../context/CmsContext";
import Btn from "./atoms/Btn";

function NavLink({ label, active, onClick }) {
  const [h, setH] = useState(false);
  return (
    <li>
      <button
        onClick={onClick}
        onMouseEnter={() => setH(true)}
        onMouseLeave={() => setH(false)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: ".8rem",
          fontWeight: 500,
          letterSpacing: ".1em",
          textTransform: "uppercase",
          color: active || h ? "var(--accent)" : "var(--light)",
          transition: "color .2s",
          borderBottom: active
            ? "1px solid var(--accent)"
            : "1px solid transparent",
          paddingBottom: "2px",
        }}
      >
        {label}
      </button>
    </li>
  );
}

// ── Tombol bulat dengan inisial / ikon
function AvatarBtn({ user, onClick }) {
  const initials = user
    ? user.nama
        ?.split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "🔐";
  const [h, setH] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      title={user ? `${user.nama} (${user.role})` : "Login Admin"}
      style={{
        width: 38,
        height: 38,
        borderRadius: "50%",
        background: user
          ? h
            ? "var(--earth)"
            : "var(--accent)"
          : h
            ? "var(--mist)"
            : "transparent",
        border: user ? "none" : "1.5px solid var(--clay)",
        color: user ? "#fff" : h ? "var(--espresso)" : "var(--light)",
        fontFamily: user ? "var(--serif)" : "var(--sans)",
        fontSize: user ? "1rem" : ".85rem",
        fontWeight: 500,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all .2s",
        flexShrink: 0,
        boxShadow: h && user ? "0 4px 16px rgba(140,111,90,.3)" : "none",
      }}
    >
      {initials}
    </button>
  );
}

function Navbar({ page, setPage }) {
  const scrolled = useScrolled();
  const { isAdmin, user, logout } = useAuth();
  const { content } = useCms();
  const nav = content.navbar;
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  const NAV_LINKS = [
    { key: "home", label: nav.link_home },
    { key: "listing", label: nav.link_listing },
    //{ key: "booking", label: nav.link_booking },
    //{ key: "about", label: nav.link_about },
    { key: "contact", label: nav.link_contact },
  ];

  // Tutup dropdown saat klik luar
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target))
        setDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    setPage("home");
    setDropOpen(false);
  };

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 500,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: scrolled ? "1rem 3.5rem" : "1.4rem 3.5rem",
        background: scrolled
          ? "rgba(253,252,250,.95)"
          : "rgba(253,252,250,.85)",
        backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${scrolled ? "rgba(200,180,154,.3)" : "rgba(200,180,154,.15)"}`,
        transition: "all .3s",
        boxShadow: scrolled ? "0 2px 20px rgba(44,31,20,.06)" : "none",
      }}
    >
      {/* Logo */}
      <button
        onClick={() => setPage("home")}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontFamily: "var(--serif)",
          fontSize: "1.55rem",
          fontWeight: 500,
          letterSpacing: ".08em",
          color: "var(--espresso)",
        }}
      >
        {nav.logo_main}<span style={{ color: "var(--accent)" }}>{nav.logo_accent}</span>
      </button>

      {/* Nav links */}
      <ul style={{ display: "flex", gap: "2.2rem", listStyle: "none" }}>
        {NAV_LINKS.map((l) => (
          <NavLink
            key={l.key}
            label={l.label}
            active={page === l.key}
            onClick={() => setPage(l.key)}
          />
        ))}
      </ul>

      {/* Kanan: CTA + avatar bulat */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {/* Konsultasi — hanya di halaman publik bukan admin */}
        {!isAdmin && (
          <Btn onClick={() => setPage("contact")}>{nav.cta_label}</Btn>
        )}
        {isAdmin && (
          <button
            onClick={() => setPage("admin")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: ".78rem",
              fontWeight: 500,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              color: "var(--accent)",
              fontFamily: "var(--sans)",
              padding: ".5rem .9rem",
              borderBottom: "1px solid var(--accent)",
            }}
          >
            ⚙ Panel Admin
          </button>
        )}

        {/* ── Avatar bulat + dropdown */}
        <div ref={dropRef} style={{ position: "relative" }}>
          <AvatarBtn user={user} onClick={() => setDropOpen((v) => !v)} />

          {dropOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + .6rem)",
                right: 0,
                minWidth: 190,
                background: "#fff",
                border: "1px solid var(--mist)",
                boxShadow: "0 8px 36px rgba(44,31,20,.12)",
                zIndex: 100,
                animation: "fadeUp .18s ease both",
              }}
            >
              {/* Info user */}
              <div
                style={{
                  padding: ".8rem 1.1rem",
                  borderBottom: "1px solid var(--mist)",
                  display: "flex",
                  alignItems: "center",
                  gap: ".7rem",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: user ? "var(--accent)" : "var(--mist)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--serif)",
                    fontSize: ".9rem",
                    color: user ? "#fff" : "var(--clay)",
                    flexShrink: 0,
                  }}
                >
                  {user ? user.nama?.[0]?.toUpperCase() : "?"}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: ".82rem",
                      fontWeight: 600,
                      color: "var(--espresso)",
                    }}
                  >
                    {user?.nama || "Tamu"}
                  </div>
                  <div
                    style={{
                      fontSize: ".62rem",
                      letterSpacing: ".08em",
                      textTransform: "uppercase",
                      color: "var(--accent)",
                    }}
                  >
                    {user?.role || "—"}
                  </div>
                </div>
              </div>

              {/* Menu items */}
              {user ? (
                <>
                  {isAdmin && (
                    <MenuItem
                      icon="✏️"
                      label="Konten Website"
                      onClick={() => {
                        setPage("admin");
                        setDropOpen(false);
                      }}
                    />
                  )}
                  <MenuItem
                    icon="⚙"
                    label="Admin Panel"
                    onClick={() => {
                      setPage("admin");
                      setDropOpen(false);
                    }}
                    show={isAdmin}
                  />
                  <MenuItem
                    icon="🌐"
                    label="Lihat Website"
                    onClick={() => {
                      setPage("home");
                      setDropOpen(false);
                    }}
                  />
                  <MenuItem
                    icon="🚪"
                    label="Logout"
                    onClick={handleLogout}
                    danger
                  />
                </>
              ) : (
                <MenuItem
                  icon="🔐"
                  label="Login Admin"
                  onClick={() => {
                    setPage("login");
                    setDropOpen(false);
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function MenuItem({ icon, label, onClick, danger, show = true }) {
  const [h, setH] = useState(false);
  if (!show) return null;
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: ".7rem",
        padding: ".72rem 1.1rem",
        background: h ? "var(--sand)" : "none",
        border: "none",
        borderBottom: "1px solid var(--mist)",
        textAlign: "left",
        cursor: "pointer",
        fontFamily: "var(--sans)",
        fontSize: ".82rem",
        color: danger ? "#A04040" : "var(--text)",
        transition: "background .15s",
      }}
    >
      <span style={{ fontSize: ".9rem" }}>{icon}</span> {label}
    </button>
  );
}

export default Navbar;
