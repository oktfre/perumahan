import { useState, useEffect, useCallback } from "react";
import { bookingApi } from "../../utils/api";
import { fmtM, fmtDateTime } from "../../utils/helpers";

const STATUS_LABEL = {
  pra_booking: { label: "⏳ Pra-Booking", color: "#F59E0B" },
  terjual: { label: "✅ Terjual", color: "#4A7C59" },
  ditolak: { label: "❌ Ditolak", color: "#A04040" },
};

function StatusBadge({ status }) {
  const s = STATUS_LABEL[status] || { label: status, color: "#999" };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "0.25rem 0.75rem",
        background: s.color + "20",
        border: `1px solid ${s.color}`,
        color: s.color,
        borderRadius: "4px",
        fontSize: "0.75rem",
        fontWeight: 500,
      }}
    >
      {s.label}
    </span>
  );
}

export default function AdminBookings() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectBox, setShowRejectBox] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const query = filter ? `status=${filter}` : "";
      const res = await bookingApi.getAll(query);
      setData(res.data || []);
    } catch (e) {
      setErr(e.message || "Gagal memuat data booking");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const flash = (text) => { setMsg(text); setTimeout(() => setMsg(""), 3000); };

  const handleConfirm = async (id) => {
    if (!window.confirm("Konfirmasi DP sudah masuk dan tandai unit ini TERJUAL?")) return;
    setBusy(true);
    try {
      await bookingApi.confirm(id);
      flash("✅ Booking dikonfirmasi — unit ditandai terjual.");
      setSelected(null);
      load();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async (id) => {
    setBusy(true);
    try {
      await bookingApi.reject(id, rejectReason);
      flash("✅ Booking ditolak — unit tersedia kembali.");
      setSelected(null);
      setShowRejectBox(false);
      setRejectReason("");
      load();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const pendingCount = data.filter((b) => b.status === "pra_booking").length;

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h2 style={{ fontSize: "1.8rem", color: "#2C1F14", marginBottom: "0.5rem" }}>Manajemen Booking</h2>
          {pendingCount > 0 && (
            <div style={{ fontSize: "0.9rem", color: "#A04040", fontWeight: 600 }}>
              ⏳ {pendingCount} booking menunggu verifikasi
            </div>
          )}
        </div>
      </div>

      {msg && (
        <div style={{ background: "rgba(74,124,89,.1)", border: "1px solid rgba(74,124,89,.3)", color: "#2d5a3d", padding: "1rem", borderRadius: 4, marginBottom: "1rem" }}>
          {msg}
        </div>
      )}
      {err && (
        <div style={{ background: "rgba(160,64,64,.1)", border: "1px solid rgba(160,64,64,.3)", color: "#A04040", padding: "1rem", borderRadius: 4, marginBottom: "1rem" }}>
          {err}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "2rem", minHeight: "calc(100vh - 200px)" }}>
        {/* Filter sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: ".5rem", borderRight: "1px solid #E8E4D8", paddingRight: "1.5rem" }}>
          {[
            ["", "Semua"],
            ["pra_booking", "⏳ Pra-Booking"],
            ["terjual", "✅ Terjual"],
            ["ditolak", "❌ Ditolak"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                padding: "0.75rem 1rem",
                background: filter === key ? "#2C1F14" : "#E8E4D8",
                color: filter === key ? "#E8DCC4" : "#2C1F14",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                fontSize: "0.85rem",
                fontWeight: 500,
                textAlign: "left",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* List + Detail */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: "2rem", alignItems: "start" }}>
          {/* List */}
          <div>
            {loading ? (
              <div style={{ textAlign: "center", color: "#999", padding: "2rem" }}>Memuat…</div>
            ) : data.length === 0 ? (
              <div style={{ textAlign: "center", color: "#999", padding: "2rem" }}>📭 Belum ada booking</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: ".6rem", maxHeight: "calc(100vh - 280px)", overflowY: "auto" }}>
                {data.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => { setSelected(b); setShowRejectBox(false); setRejectReason(""); }}
                    style={{
                      padding: "1rem",
                      background: selected?.id === b.id ? "#2C1F1415" : b.status === "pra_booking" ? "#FFF9F0" : "#fff",
                      border: `1px solid ${selected?.id === b.id ? "#2C1F14" : "#E8E4D8"}`,
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: ".35rem" }}>
                      <div style={{ fontSize: ".9rem", fontWeight: 600, color: "#2C1F14" }}>{b.nama_pembeli}</div>
                      <StatusBadge status={b.status} />
                    </div>
                    <div style={{ fontSize: ".8rem", color: "#666", marginBottom: ".3rem" }}>
                      🏠 {b.nama_properti || `Unit #${b.property_id}`}
                    </div>
                    <div style={{ fontSize: ".75rem", color: "#999" }}>{fmtDateTime(b.created_at)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detail */}
          <div>
            {selected ? (
              <div style={{ background: "#fff", border: "1px solid #E8E4D8", borderRadius: 8, padding: "1.8rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1.2rem" }}>
                  <div>
                    <h3 style={{ fontSize: "1.2rem", color: "#2C1F14", marginBottom: ".4rem" }}>{selected.nama_pembeli}</h3>
                    <div style={{ color: "#666", fontSize: ".85rem", lineHeight: 1.6 }}>
                      <div>📱 {selected.no_hp || "-"}</div>
                      <div>📧 {selected.email || "-"}</div>
                      {selected.alamat && <div>🏡 {selected.alamat}</div>}
                    </div>
                  </div>
                  <StatusBadge status={selected.status} />
                </div>

                <div style={{ background: "#F5F0E8", padding: "1rem", borderRadius: 4, marginBottom: "1.2rem" }}>
                  <div style={{ fontSize: ".68rem", letterSpacing: ".06em", textTransform: "uppercase", color: "#8C6F5A", marginBottom: ".3rem" }}>Unit dibooking</div>
                  <div style={{ fontFamily: "var(--serif)", fontSize: "1.1rem", color: "#2C1F14" }}>
                    {selected.nama_properti || `Unit #${selected.property_id}`}
                  </div>
                  {selected.nama_perumahan && <div style={{ fontSize: ".8rem", color: "#666" }}>{selected.nama_perumahan} — {selected.lokasi_perumahan}</div>}
                  {selected.harga_jual_juta && (
                    <div style={{ fontSize: ".85rem", color: "#8C6F5A", marginTop: ".3rem" }}>
                      Harga: {fmtM(parseFloat(selected.harga_jual_juta) * 1_000_000)}
                    </div>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".8rem", marginBottom: "1.2rem" }}>
                  <div style={{ background: "#F5F5F5", padding: ".8rem", borderRadius: 4 }}>
                    <div style={{ fontSize: ".68rem", color: "#999", marginBottom: ".25rem" }}>METODE BAYAR</div>
                    <div style={{ fontSize: ".88rem", fontWeight: 600, color: "#2C1F14" }}>
                      {selected.metode_pembayaran || "-"} {selected.bank ? `(${selected.bank})` : ""}
                    </div>
                  </div>
                  <div style={{ background: "#F5F5F5", padding: ".8rem", borderRadius: 4 }}>
                    <div style={{ fontSize: ".68rem", color: "#999", marginBottom: ".25rem" }}>NOMINAL DP</div>
                    <div style={{ fontSize: ".88rem", fontWeight: 600, color: "#2C1F14" }}>{fmtM(selected.nominal_dp || 1000000)}</div>
                  </div>
                </div>

                <div style={{ marginBottom: "1.2rem" }}>
                  <div style={{ fontSize: ".8rem", fontWeight: 600, color: "#2C1F14", marginBottom: ".5rem", textTransform: "uppercase" }}>Bukti Transfer</div>
                  {selected.bukti_transfer ? (
                    <img
                      src={selected.bukti_transfer}
                      alt="Bukti transfer"
                      style={{ maxWidth: "100%", maxHeight: 320, border: "1px solid #E8E4D8", borderRadius: 4, cursor: "zoom-in" }}
                      onClick={() => window.open(selected.bukti_transfer, "_blank")}
                    />
                  ) : (
                    <div style={{ color: "#999", fontSize: ".85rem" }}>Belum ada bukti transfer.</div>
                  )}
                </div>

                <div style={{ fontSize: ".75rem", color: "#999", marginBottom: "1.2rem" }}>
                  Booking dibuat: {fmtDateTime(selected.created_at)}
                </div>

                {selected.catatan_admin && (
                  <div style={{ background: "#FFF0F0", padding: "1rem", borderRadius: 4, borderLeft: "3px solid #A04040", marginBottom: "1.2rem" }}>
                    <div style={{ fontSize: ".8rem", fontWeight: 600, color: "#A04040", marginBottom: ".3rem" }}>Catatan Admin</div>
                    <div style={{ fontSize: ".85rem", color: "#7f1d1d" }}>{selected.catatan_admin}</div>
                  </div>
                )}

                {selected.status === "pra_booking" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: ".7rem" }}>
                    {showRejectBox && (
                      <textarea
                        placeholder="Alasan penolakan (opsional)..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows={2}
                        style={{ padding: ".7rem", border: "1px solid #E8E4D8", borderRadius: 4, fontSize: ".85rem", fontFamily: "var(--sans)", resize: "vertical" }}
                      />
                    )}
                    <div style={{ display: "flex", gap: ".75rem" }}>
                      <button
                        onClick={() => handleConfirm(selected.id)}
                        disabled={busy}
                        style={{ flex: 1, padding: ".8rem", background: "#4A7C59", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: ".85rem", fontWeight: 600 }}
                      >
                        ✅ Konfirmasi — DP Sudah Masuk
                      </button>
                      {!showRejectBox ? (
                        <button
                          onClick={() => setShowRejectBox(true)}
                          disabled={busy}
                          style={{ flex: 1, padding: ".8rem", background: "#A04040", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: ".85rem", fontWeight: 600 }}
                        >
                          ❌ Tolak Booking
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReject(selected.id)}
                          disabled={busy}
                          style={{ flex: 1, padding: ".8rem", background: "#7f1d1d", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: ".85rem", fontWeight: 600 }}
                        >
                          Konfirmasi Tolak
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: 400, color: "#999", textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
                <p>Pilih booking untuk melihat detail</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
