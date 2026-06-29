import { useState } from "react";
import Btn from "../atoms/Btn";
import Tag from "../atoms/Tag";
import Footer from "../Footer";
import { inquiriesApi } from "../../utils/api";
import { useCms } from "../../context/CmsContext";

function FInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}) {
  return (
    <div>
      <label
        style={{
          fontSize: ".75rem",
          fontWeight: 500,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          color: "var(--earth)",
          display: "block",
          marginBottom: ".5rem",
        }}
      >
        {label}
        {required && <span style={{ color: "var(--accent)" }}> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: ".75rem 1rem",
          border: "1px solid var(--mist)",
          background: "var(--white)",
          color: "var(--text)",
          fontSize: ".88rem",
        }}
      />
    </div>
  );
}

const EMPTY_FORM = {
  nama_lengkap: "",
  nomor_hp: "",
  email: "",
  pesan: "",
  keterangan: "",
};

function ContactPage({ setPage }) {
  const { content } = useCms();
  const cfg = content.contact;
  const [form, setForm] = useState(EMPTY_FORM);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const send = async () => {
    setLoading(true);
    setError("");

    try {
      await inquiriesApi.create({
        nama_lengkap: form.nama_lengkap,
        nomor_hp: form.nomor_hp,
        email: form.email,
        keterangan: form.keterangan,
        pesan: form.pesan,
      });
      setSent(true);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err.message || "Gagal mengirim pesan. Coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", paddingTop: 80 }} className="page-enter">
      {/* Hero */}
      <div style={{ background: "var(--espresso)", padding: "4rem 5rem 5rem" }}>
        <Tag label={cfg.tag} light />
        <h1
          style={{
            fontFamily: "var(--serif)",
            fontSize: "clamp(2.5rem,4vw,3.5rem)",
            fontWeight: 300,
            color: "var(--sand)",
            marginBottom: "1rem",
          }}
        >
          {cfg.title}
        </h1>
        <p
          style={{
            fontSize: ".95rem",
            color: "var(--clay)",
            maxWidth: 500,
            lineHeight: 1.75,
          }}
        >
          {cfg.subtitle}
        </p>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 0 }}
      >
        {/* Form */}
        <div style={{ padding: "4rem 5rem", background: "var(--white)" }}>
          {sent ? (
            <div style={{ textAlign: "center", padding: "4rem 0" }}>
              <div style={{ fontSize: "4rem", marginBottom: "1.5rem" }}>✅</div>
              <div
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "2rem",
                  color: "var(--espresso)",
                  marginBottom: "1rem",
                }}
              >
                {cfg.success_title}
              </div>
              <div
                style={{
                  fontSize: ".9rem",
                  color: "var(--light)",
                  marginBottom: "2rem",
                  lineHeight: 1.7,
                }}
              >
                {cfg.success_desc}
              </div>
              <Btn
                onClick={() => {
                  setSent(false);
                  setForm(EMPTY_FORM);
                }}
              >
                Kirim Pesan Lain
              </Btn>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
                maxWidth: 580,
              }}
            >
              {error && (
                <div
                  style={{
                    background: "rgba(160, 64, 64, 0.1)",
                    border: "1px solid rgba(160, 64, 64, 0.3)",
                    color: "#A04040",
                    padding: "0.75rem 1rem",
                    borderRadius: "4px",
                    fontSize: ".85rem",
                  }}
                >
                  ❌ {error}
                </div>
              )}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1.5rem",
                }}
              >
                <FInput
                  label="Nama Lengkap"
                  value={form.nama_lengkap}
                  onChange={(v) => set("nama_lengkap", v)}
                  placeholder="Budi Santoso"
                  required
                />
                <FInput
                  label="Nomor HP / WhatsApp"
                  value={form.nomor_hp}
                  onChange={(v) => set("nomor_hp", v)}
                  placeholder="08xxxxxxxxxx"
                  type="tel"
                  required
                />
              </div>
              <FInput
                label="Email"
                value={form.email}
                onChange={(v) => set("email", v)}
                placeholder="email@anda.com"
                type="email"
              />

              <div>
                <label
                  style={{
                    fontSize: ".75rem",
                    fontWeight: 500,
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                    color: "var(--earth)",
                    display: "block",
                    marginBottom: ".5rem",
                  }}
                >
                  Keterangan <span style={{ color: "var(--accent)" }}>*</span>
                </label>
                <select
                  value={form.keterangan}
                  onChange={(e) => set("keterangan", e.target.value)}
                  style={{
                    width: "100%",
                    padding: ".75rem 1rem",
                    border: "1px solid var(--mist)",
                    background: "var(--white)",
                    color: form.keterangan ? "var(--text)" : "var(--light)",
                    fontFamily: "var(--sans)",
                    fontSize: ".88rem",
                  }}
                >
                  <option value="">Pilih kategori...</option>
                  {[
                    "Tanya Harga",
                    "Tanya Spesifikasi",
                    "Proses Cicilan",
                    "Lokasi Properti",
                    "Tour Unit",
                    "Penawaran Khusus",
                    "Lainnya",
                  ].map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    fontSize: ".75rem",
                    fontWeight: 500,
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                    color: "var(--earth)",
                    display: "block",
                    marginBottom: ".5rem",
                  }}
                >
                  Pesan
                </label>
                <textarea
                  value={form.pesan}
                  onChange={(e) => set("pesan", e.target.value)}
                  rows={5}
                  placeholder="Ceritakan kebutuhan properti Anda..."
                  style={{
                    width: "100%",
                    padding: ".75rem 1rem",
                    border: "1px solid var(--mist)",
                    background: "var(--white)",
                    color: "var(--text)",
                    fontFamily: "var(--sans)",
                    fontSize: ".88rem",
                    resize: "vertical",
                  }}
                />
              </div>

              <Btn
                onClick={send}
                disabled={!form.nama_lengkap || !form.nomor_hp || !form.keterangan || loading}
                style={{ padding: "1rem 2.5rem" }}
              >
                {loading ? "Mengirim..." : "Kirim Pesan →"}
              </Btn>
            </div>
          )}
        </div>

        {/* Sidebar info kontak */}
        <div
          style={{
            background: "var(--sand)",
            padding: "4rem 3rem",
            display: "flex",
            flexDirection: "column",
            gap: "2.5rem",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--serif)",
                fontSize: "1.6rem",
                fontWeight: 300,
                color: "var(--espresso)",
                marginBottom: "1.5rem",
              }}
            >
              Info Kontak
            </div>
            {[
              ["📍", "Alamat", cfg.alamat],
              ["📞", "Telepon", cfg.telepon],
              ["✉️", "Email", cfg.email],
              ["🕐", "Jam Operasional", cfg.jam_operasional],
            ].map(([ic, l, v]) => (
              <div
                key={l}
                style={{
                  display: "flex",
                  gap: "1rem",
                  marginBottom: "1.5rem",
                  alignItems: "flex-start",
                }}
              >
                <span style={{ fontSize: "1.3rem", marginTop: ".1rem" }}>
                  {ic}
                </span>
                <div>
                  <div
                    style={{
                      fontSize: ".72rem",
                      letterSpacing: ".1em",
                      textTransform: "uppercase",
                      color: "var(--light)",
                      marginBottom: ".2rem",
                    }}
                  >
                    {l}
                  </div>
                  <div
                    style={{
                      fontSize: ".85rem",
                      color: "var(--text)",
                      lineHeight: 1.6,
                      whiteSpace: "pre-line",
                    }}
                  >
                    {v}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: "1.5rem", background: "var(--espresso)" }}>
            <div
              style={{
                fontSize: ".72rem",
                letterSpacing: ".12em",
                textTransform: "uppercase",
                color: "var(--clay)",
                marginBottom: ".5rem",
              }}
            >
              {cfg.respon_label}
            </div>
            <div
              style={{
                fontFamily: "var(--serif)",
                fontSize: "1.6rem",
                color: "var(--accent)",
                marginBottom: ".3rem",
              }}
            >
              {cfg.respon_value}
            </div>
            <div
              style={{
                fontSize: ".8rem",
                color: "var(--clay)",
                lineHeight: 1.6,
              }}
            >
              {cfg.respon_desc}
            </div>
          </div>
        </div>
      </div>

      <Footer setPage={setPage} />
    </div>
  );
}

export default ContactPage;
