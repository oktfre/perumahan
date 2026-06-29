import React, { useState } from "react";
import { useApp } from "../../context/AppContext";

export default function LoginPage({ onNavigate }) {
  const { login } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError("Email dan password wajib diisi"); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const result = login(email, password);
    setLoading(false);
    if (result.success) {
      onNavigate(result.user.role === "admin" ? "admin" : "home");
    } else {
      setError(result.message);
    }
  };

  const fillDemo = (type) => {
    if (type === "admin") { setEmail("admin@rumahku.id"); setPassword("admin123"); }
    else { setEmail("budi@email.com"); setPassword("user123"); }
    setError("");
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">🏠 RumahKu</div>
        <h2>Selamat Datang Kembali!</h2>
        <p>Platform properti terpercaya untuk menemukan hunian impian Anda</p>
        <div className="login-features">
          {["✅ Ribuan pilihan properti", "🔒 Transaksi 100% aman", "⚡ Proses booking cepat"].map((f, i) => (
            <div key={i} className="login-feature">{f}</div>
          ))}
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <h2>Masuk ke Akun</h2>
          <p className="login-sub">Silakan login untuk melanjutkan</p>

          {/* Demo buttons */}
          <div className="demo-btns">
            <button className="demo-btn" onClick={() => fillDemo("admin")}>🔑 Login Admin</button>
            <button className="demo-btn" onClick={() => fillDemo("user")}>👤 Login User</button>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                placeholder="email@contoh.com"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-pw-wrap">
                <input
                  type={showPw ? "text" : "password"}
                  className="form-input"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••"
                />
                <button type="button" className="pw-toggle" onClick={() => setShowPw(s => !s)}>
                  {showPw ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "⏳ Memproses..." : "Masuk"}
            </button>
          </form>

          <div className="login-footer">
            <p>Belum punya akun? <button className="link-btn" onClick={() => alert("Hubungi admin untuk daftar.")}>Daftar</button></p>
          </div>
        </div>
      </div>
    </div>
  );
}
