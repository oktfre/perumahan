import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

function LoginPage({ setPage }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      setError("Email dan password wajib diisi.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await login(form.email, form.password);
      if (res.user.role === "admin") {
        setPage("admin");
      } else {
        setPage("home");
      }
    } catch (err) {
      setError(err.message || "Login gagal. Periksa email dan password.");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--espresso)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      {/* Card */}
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          background: "rgba(255,255,255,.04)",
          border: "1px solid rgba(200,180,154,.15)",
          padding: "3rem 3.5rem",
          animation: "fadeUp .5s ease both",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div
            style={{
              fontFamily: "var(--serif)",
              fontSize: "2rem",
              fontWeight: 500,
              color: "var(--sand)",
              letterSpacing: ".1em",
            }}
          >
            HAVEN<span style={{ color: "var(--accent)" }}>EST</span>
          </div>
          <div
            style={{
              fontSize: ".72rem",
              letterSpacing: ".15em",
              textTransform: "uppercase",
              color: "var(--clay)",
              marginTop: ".5rem",
            }}
          >
            Admin Panel
          </div>
          <div
            style={{
              width: 40,
              height: 1,
              background: "rgba(200,180,154,.3)",
              margin: "1rem auto 0",
            }}
          />
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              background: "rgba(160,64,64,.15)",
              border: "1px solid rgba(160,64,64,.4)",
              color: "#ffb3b3",
              fontSize: ".82rem",
              padding: ".9rem 1.1rem",
              marginBottom: "1.5rem",
              lineHeight: 1.5,
            }}
          >
            ⚠ {error}
          </div>
        )}

        {/* Form */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.3rem" }}
        >
          {/* Email */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: ".65rem",
                letterSpacing: ".12em",
                textTransform: "uppercase",
                color: "var(--clay)",
                marginBottom: ".5rem",
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              onKeyDown={handleKey}
              placeholder="admin@havenest.id"
              autoFocus
              style={{
                width: "100%",
                padding: ".85rem 1rem",
                background: "rgba(255,255,255,.06)",
                border: "1px solid rgba(200,180,154,.25)",
                color: "var(--sand)",
                fontFamily: "var(--sans)",
                fontSize: ".9rem",
              }}
            />
          </div>

          {/* Password */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: ".65rem",
                letterSpacing: ".12em",
                textTransform: "uppercase",
                color: "var(--clay)",
                marginBottom: ".5rem",
              }}
            >
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                onKeyDown={handleKey}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: ".85rem 3rem .85rem 1rem",
                  background: "rgba(255,255,255,.06)",
                  border: "1px solid rgba(200,180,154,.25)",
                  color: "var(--sand)",
                  fontFamily: "var(--sans)",
                  fontSize: ".9rem",
                }}
              />
              <button
                onClick={() => setShowPass((v) => !v)}
                style={{
                  position: "absolute",
                  right: ".8rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--clay)",
                  fontSize: ".9rem",
                }}
              >
                {showPass ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              marginTop: ".5rem",
              padding: "1rem",
              background: loading ? "var(--earth)" : "var(--accent)",
              border: "none",
              color: "#fff",
              fontFamily: "var(--sans)",
              fontSize: ".82rem",
              fontWeight: 500,
              letterSpacing: ".1em",
              textTransform: "uppercase",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background .2s",
            }}
          >
            {loading ? "⏳ Memverifikasi…" : "🔐 Masuk ke Admin"}
          </button>
        </div>

        {/* Back */}
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <button
            onClick={() => setPage("home")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--clay)",
              fontSize: ".78rem",
              letterSpacing: ".08em",
              textTransform: "uppercase",
            }}
          >
            ← Kembali ke Website
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
