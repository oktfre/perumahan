import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { formatRupiah, formatDate, fileToDataURL } from "../../utils/helpers";
import StatusBadge from "../../components/shared/StatusBadge";

const EMPTY_FORM = {
  name: "", type: "Rumah", price: "", location: "", address: "",
  bedrooms: "", bathrooms: "", landArea: "", buildingArea: "",
  description: "", facilities: "", images: "", featured: false,
};

export default function AdminProperties() {
  const { properties, addProperty, updateProperty, deleteProperty } = useApp();
  const [modal, setModal] = useState(null); // null | "add" | "edit" | "delete" | "view"
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [saving, setSaving] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);

  const filtered = properties.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const openAdd = () => { setForm(EMPTY_FORM); setUploadedImages([]); setModal("add"); };
  const openEdit = (p) => {
    setSelected(p);
    setForm({ ...p, price: p.price.toLocaleString("id-ID"), facilities: p.facilities?.join(", ") || "", images: "" });
    setUploadedImages(p.images || []);
    setModal("edit");
  };
  const openDelete = (p) => { setSelected(p); setModal("delete"); };
  const openView = (p) => { setSelected(p); setModal("view"); };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const urls = await Promise.all(files.map(fileToDataURL));
    setUploadedImages(prev => [...prev, ...urls]);
  };

  const removeImage = (idx) => setUploadedImages(prev => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    if (!form.name || !form.price || !form.location) { alert("Nama, harga, dan lokasi wajib diisi"); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 400));
    const data = {
      ...form,
      price: parseInt(form.price.replace(/\D/g, "")),
      bedrooms: parseInt(form.bedrooms) || 0,
      bathrooms: parseInt(form.bathrooms) || 0,
      landArea: parseInt(form.landArea) || 0,
      buildingArea: parseInt(form.buildingArea) || 0,
      facilities: form.facilities.split(",").map(f => f.trim()).filter(Boolean),
      images: uploadedImages.length > 0 ? uploadedImages : (form.images ? [form.images] : []),
    };
    if (modal === "add") addProperty(data);
    else updateProperty(selected.id, data);
    setSaving(false);
    setModal(null);
  };

  const handleDelete = () => { deleteProperty(selected.id); setModal(null); };

  const F = ({ label, name, type = "text", placeholder, required, rows }) => (
    <div className="form-group">
      <label>{label}{required && " *"}</label>
      {rows ? (
        <textarea className="form-input" rows={rows} value={form[name] || ""} placeholder={placeholder}
          onChange={e => setForm(prev => ({ ...prev, [name]: e.target.value }))} />
      ) : (
        <input type={type} className="form-input" value={form[name] || ""} placeholder={placeholder}
          onChange={e => setForm(prev => ({ ...prev, [name]: e.target.value }))} />
      )}
    </div>
  );

  return (
    <div className="admin-properties">
      {/* Top controls */}
      <div className="admin-controls">
        <div className="control-left">
          <input className="search-input" placeholder="🔍 Cari properti..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">Semua Status</option>
            <option value="available">Tersedia</option>
            <option value="pre-booking">Pre-Booking</option>
            <option value="sold">Terjual</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>➕ Tambah Properti</button>
      </div>

      {/* Table */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Foto</th><th>Nama Properti</th><th>Tipe</th><th>Lokasi</th>
              <th>Harga</th><th>Status</th><th>Tanggal</th><th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: "center", padding: 32 }}>Tidak ada data</td></tr>
            ) : filtered.map(p => (
              <tr key={p.id}>
                <td>
                  <img src={p.images?.[0] || "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=200&q=80"}
                    alt="" style={{ width: 60, height: 45, objectFit: "cover", borderRadius: 6 }} />
                </td>
                <td><strong>{p.name}</strong>{p.featured && <span className="badge-featured">⭐</span>}</td>
                <td>{p.type}</td>
                <td className="text-sm">{p.location}</td>
                <td><strong>{formatRupiah(p.price)}</strong></td>
                <td><StatusBadge status={p.status} /></td>
                <td className="text-sm">{formatDate(p.createdAt)}</td>
                <td>
                  <div className="action-btns">
                    <button className="btn-icon" title="Lihat" onClick={() => openView(p)}>👁️</button>
                    <button className="btn-icon" title="Edit" onClick={() => openEdit(p)}>✏️</button>
                    <button className="btn-icon danger" title="Hapus" onClick={() => openDelete(p)}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD / EDIT MODAL */}
      {(modal === "add" || modal === "edit") && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modal === "add" ? "Tambah Properti Baru" : "Edit Properti"}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row-2">
                <F label="Nama Properti" name="name" placeholder="Nama properti" required />
                <div className="form-group">
                  <label>Tipe Properti *</label>
                  <select className="form-input" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                    {["Rumah", "Villa", "Apartemen", "Kavling", "Ruko"].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label>Harga (Rp) *</label>
                  <input className="form-input" placeholder="Contoh: 850000000"
                    value={form.price}
                    onChange={e => setForm(p => ({ ...p, price: e.target.value.replace(/\D/g, "") ? parseInt(e.target.value.replace(/\D/g, "")).toLocaleString("id-ID") : "" }))} />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select className="form-input" value={form.status || "available"} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                    <option value="available">Tersedia</option>
                    <option value="pre-booking">Pre-Booking</option>
                    <option value="sold">Terjual</option>
                  </select>
                </div>
              </div>
              <F label="Lokasi (Kota/Kabupaten)" name="location" placeholder="Contoh: BSD City, Tangerang Selatan" required />
              <F label="Alamat Lengkap" name="address" placeholder="Alamat lengkap properti" />
              <div className="form-row-4">
                <F label="Kamar Tidur" name="bedrooms" type="number" placeholder="0" />
                <F label="Kamar Mandi" name="bathrooms" type="number" placeholder="0" />
                <F label="Luas Tanah (m²)" name="landArea" type="number" placeholder="0" />
                <F label="Luas Bangunan (m²)" name="buildingArea" type="number" placeholder="0" />
              </div>
              <F label="Deskripsi" name="description" placeholder="Deskripsi properti..." rows={3} />
              <F label="Fasilitas (pisahkan dengan koma)" name="facilities" placeholder="Kolam Renang, Garasi, CCTV" />

              {/* Image upload */}
              <div className="form-group">
                <label>Foto Properti</label>
                <div className="image-upload-grid">
                  {uploadedImages.map((img, i) => (
                    <div key={i} className="img-preview-thumb">
                      <img src={img} alt="" />
                      <button className="img-remove" onClick={() => removeImage(i)}>✕</button>
                    </div>
                  ))}
                  <label className="img-add-btn" htmlFor="prop-images">
                    <span>+</span><small>Tambah Foto</small>
                    <input id="prop-images" type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleImageUpload} />
                  </label>
                </div>
                <p className="form-hint">Atau masukkan URL gambar:</p>
                <F label="" name="images" placeholder="https://..." />
              </div>

              <div className="form-check">
                <input type="checkbox" id="featured" checked={form.featured || false}
                  onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))} />
                <label htmlFor="featured">Tandai sebagai Properti Unggulan</label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Batal</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Menyimpan..." : modal === "add" ? "Simpan Properti" : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {modal === "view" && selected && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detail Properti</h3>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              {selected.images?.[0] && <img src={selected.images[0]} alt="" style={{ width: "100%", borderRadius: 8, marginBottom: 16 }} />}
              <div className="view-grid">
                {[
                  { label: "Nama", val: selected.name },
                  { label: "Tipe", val: selected.type },
                  { label: "Harga", val: formatRupiah(selected.price) },
                  { label: "Status", val: <StatusBadge status={selected.status} /> },
                  { label: "Lokasi", val: selected.location },
                  { label: "Kamar Tidur", val: selected.bedrooms },
                  { label: "Kamar Mandi", val: selected.bathrooms },
                  { label: "Luas Tanah", val: `${selected.landArea} m²` },
                  { label: "Luas Bangunan", val: `${selected.buildingArea} m²` },
                  { label: "Unggulan", val: selected.featured ? "Ya" : "Tidak" },
                ].map((r, i) => <div key={i} className="view-row"><span>{r.label}</span><strong>{r.val}</strong></div>)}
              </div>
              {selected.description && <div style={{ marginTop: 12 }}><strong>Deskripsi:</strong><p>{selected.description}</p></div>}
              {selected.facilities?.length > 0 && <div style={{ marginTop: 12 }}><strong>Fasilitas:</strong><p>{selected.facilities.join(", ")}</p></div>}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Tutup</button>
              <button className="btn btn-primary" onClick={() => openEdit(selected)}>Edit Properti</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {modal === "delete" && selected && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Hapus Properti</h3><button className="modal-close" onClick={() => setModal(null)}>✕</button></div>
            <div className="modal-body">
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <div style={{ fontSize: 48 }}>🗑️</div>
                <p>Apakah Anda yakin ingin menghapus properti <strong>{selected.name}</strong>?</p>
                <p style={{ color: "#dc2626", fontSize: 13 }}>Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Batal</button>
              <button className="btn btn-danger" onClick={handleDelete}>Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
