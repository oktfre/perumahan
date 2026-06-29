import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { formatRupiah, formatDateTime } from "../../utils/helpers";
import StatusBadge from "../../components/shared/StatusBadge";

export default function AdminBookings() {
  const { bookings, properties, updateBookingStatus, getPropertyById } = useApp();
  const [selected, setSelected] = useState(null);
  const [modal, setModal] = useState(null); // "view" | "approve" | "reject"
  const [adminNote, setAdminNote] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [processing, setProcessing] = useState(false);
  const [imgZoom, setImgZoom] = useState(false);

  const filtered = bookings.filter(b => filterStatus === "all" || b.status === filterStatus)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const pendingCount = bookings.filter(b => b.status === "pending").length;

  const openDetail = (booking) => {
    setSelected(booking);
    setAdminNote(booking.adminNote || "");
    setModal("view");
  };

  const handleApprove = async () => {
    if (!window.confirm("Konfirmasi: DP telah diterima dan properti akan ditandai TERJUAL?")) return;
    setProcessing(true);
    await new Promise(r => setTimeout(r, 600));
    updateBookingStatus(selected.id, "approved", adminNote);
    setProcessing(false);
    setModal(null);
  };

  const handleReject = async () => {
    if (!adminNote.trim()) { alert("Mohon isi alasan penolakan."); return; }
    if (!window.confirm("Konfirmasi penolakan booking ini?")) return;
    setProcessing(true);
    await new Promise(r => setTimeout(r, 600));
    updateBookingStatus(selected.id, "rejected", adminNote);
    setProcessing(false);
    setModal(null);
  };

  const prop = selected ? getPropertyById(selected.propertyId) : null;

  return (
    <div className="admin-bookings">
      {/* Header with pending alert */}
      {pendingCount > 0 && (
        <div className="pending-alert">
          ⚠️ Terdapat <strong>{pendingCount} booking</strong> yang menunggu verifikasi DP Anda!
        </div>
      )}

      {/* Filter */}
      <div className="admin-controls">
        <div className="control-left">
          <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">Semua Status</option>
            <option value="pending">Menunggu Verifikasi</option>
            <option value="approved">Disetujui</option>
            <option value="rejected">Ditolak</option>
          </select>
          <span className="results-info">{filtered.length} booking</span>
        </div>
      </div>

      {/* Table */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th><th>Pembeli</th><th>Properti</th>
              <th>Jumlah DP</th><th>Bukti DP</th><th>Status</th><th>Waktu</th><th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: "center", padding: 40 }}>Tidak ada data booking</td></tr>
            ) : filtered.map(b => {
              const p = properties.find(pr => pr.id === b.propertyId);
              return (
                <tr key={b.id} className={b.status === "pending" ? "row-pending" : ""}>
                  <td><small className="text-mono">{b.id}</small></td>
                  <td>
                    <strong>{b.buyerName}</strong><br />
                    <small>{b.buyerPhone}</small><br />
                    <small>{b.buyerEmail}</small>
                  </td>
                  <td>{p?.name || <em style={{ color: "#999" }}>Dihapus</em>}</td>
                  <td><strong>{formatRupiah(b.dpAmount)}</strong></td>
                  <td>
                    {b.dpProofUrl && (
                      <img src={b.dpProofUrl} alt="bukti" style={{ width: 56, height: 40, objectFit: "cover", borderRadius: 4, cursor: "pointer" }}
                        onClick={() => { setSelected(b); setImgZoom(true); }} />
                    )}
                  </td>
                  <td><StatusBadge status={b.status} /></td>
                  <td><small>{formatDateTime(b.createdAt)}</small></td>
                  <td>
                    <button className="btn btn-sm btn-outline" onClick={() => openDetail(b)}>
                      {b.status === "pending" ? "🔍 Verifikasi" : "👁️ Detail"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* DETAIL / VERIFY MODAL */}
      {modal === "view" && selected && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detail Booking — {selected.status === "pending" && "⚠️ Menunggu Verifikasi"}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="booking-detail-grid">
                {/* Left: Buyer info */}
                <div>
                  <h4>📋 Informasi Pembeli</h4>
                  <div className="view-grid">
                    {[
                      { label: "Nama", val: selected.buyerName },
                      { label: "No. HP", val: selected.buyerPhone },
                      { label: "Email", val: selected.buyerEmail },
                      { label: "No. KTP", val: selected.buyerKTP },
                      { label: "Alamat", val: selected.buyerAddress },
                    ].map((r, i) => <div key={i} className="view-row"><span>{r.label}</span><strong>{r.val}</strong></div>)}
                  </div>

                  <h4 style={{ marginTop: 20 }}>🏠 Properti</h4>
                  <div className="view-grid">
                    {[
                      { label: "Nama", val: prop?.name || "-" },
                      { label: "Lokasi", val: prop?.location || "-" },
                      { label: "Harga", val: formatRupiah(prop?.price) },
                    ].map((r, i) => <div key={i} className="view-row"><span>{r.label}</span><strong>{r.val}</strong></div>)}
                  </div>

                  <h4 style={{ marginTop: 20 }}>💰 Pembayaran DP</h4>
                  <div className="view-grid">
                    {[
                      { label: "Jumlah DP", val: <strong style={{color:"#1a6b3a",fontSize:18}}>{formatRupiah(selected.dpAmount)}</strong> },
                      { label: "Status", val: <StatusBadge status={selected.status} /> },
                      { label: "Waktu Booking", val: formatDateTime(selected.createdAt) },
                      { label: "Diperbarui", val: formatDateTime(selected.updatedAt) },
                    ].map((r, i) => <div key={i} className="view-row"><span>{r.label}</span><strong>{r.val}</strong></div>)}
                  </div>

                  {selected.notes && (
                    <div style={{ marginTop: 16, padding: 12, background: "#f8f9fa", borderRadius: 8 }}>
                      <strong>Catatan Pembeli:</strong>
                      <p style={{ margin: "4px 0 0" }}>{selected.notes}</p>
                    </div>
                  )}
                </div>

                {/* Right: Proof of DP */}
                <div>
                  <h4>📄 Bukti Transfer DP</h4>
                  {selected.dpProofUrl ? (
                    <div className="dp-proof-wrap">
                      <img
                        src={selected.dpProofUrl}
                        alt="Bukti DP"
                        className="dp-proof-img"
                        onClick={() => setImgZoom(true)}
                        title="Klik untuk perbesar"
                      />
                      <p className="dp-proof-name">{selected.dpProofFileName}</p>
                      <button className="btn btn-ghost btn-sm" onClick={() => setImgZoom(true)}>🔍 Perbesar</button>
                    </div>
                  ) : <p>Tidak ada bukti yang diupload.</p>}

                  {/* Admin action for pending */}
                  {selected.status === "pending" && (
                    <div className="admin-action-box">
                      <h4>✅ Verifikasi DP</h4>
                      <div className="form-group">
                        <label>Catatan Admin (wajib jika menolak)</label>
                        <textarea className="form-input" rows={3} value={adminNote}
                          onChange={e => setAdminNote(e.target.value)}
                          placeholder="Contoh: DP telah diterima / Nominal tidak sesuai" />
                      </div>
                      <div className="verify-btns">
                        <button className="btn btn-success btn-block" onClick={handleApprove} disabled={processing}>
                          {processing ? "⏳..." : "✅ Setujui & Tandai Terjual"}
                        </button>
                        <button className="btn btn-danger btn-block" onClick={handleReject} disabled={processing}>
                          {processing ? "⏳..." : "❌ Tolak Booking"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Admin note for processed */}
                  {selected.status !== "pending" && selected.adminNote && (
                    <div className="admin-note-box">
                      <strong>Catatan Admin:</strong>
                      <p>{selected.adminNote}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* Image Zoom */}
      {imgZoom && (selected?.dpProofUrl || bookings.find(b => b.id === selected?.id)?.dpProofUrl) && (
        <div className="img-zoom-overlay" onClick={() => setImgZoom(false)}>
          <img src={selected.dpProofUrl} alt="Bukti DP - Full" className="img-zoom-full" onClick={e => e.stopPropagation()} />
          <button className="img-zoom-close" onClick={() => setImgZoom(false)}>✕ Tutup</button>
        </div>
      )}
    </div>
  );
}
