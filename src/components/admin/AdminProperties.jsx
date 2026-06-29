// ================================================================
//  AdminProperties.jsx  —  Manajemen properti + auto-fill + peta
// ================================================================
import { useState, useEffect, useCallback } from "react";
import { propertyApi, perumahanApi, imageApi } from "../../utils/api";
import MapPicker from "../../components/MapPicker";

const BADGE_COLOR = {
  Baru: "#B5844A",
  Terlaris: "#2C1F14",
  Promo: "#4A7C59",
  Eksklusif: "#6B4F8C",
};
const FASILITAS_LIST = [
  "CCTV 24 Jam",
  "Keamanan 24 Jam",
  "Water Heater",
  "Taman",
  "Carport",
  "Kolam Renang",
  "Smart Home",
  "Generator",
  "Playground",
  "Jogging Track",
  "Dapur Modern",
  "Ruang Keluarga Luas",
  "Halaman Depan Luas",
  "Taman Komunal",
  "Ruang Serbaguna",
  "AC Sentral",
  "BBQ Area",
  "Lift",
];

const EMPTY_FORM = {
  perumahan_id: "",
  nomor_tipe: "",
  nama_properti: "",
  badge: "",
  tipe_properti: "Rumah Tapak",
  luas_tanah_lebar_m: "",
  luas_tanah_panjang_m: "",
  lebar_jalan_m: "",
  jumlah_kamar_tidur: "",
  jumlah_kamar_mandi: "",
  luas_bangunan_m2: "36",
  jumlah_lantai: "1",
  sumber_air: "Sumur Bor",
  daya_listrik_watt: "1300",
  harga_jual_juta: "",
  dp_awal_juta: "1",
  unit_tersedia: "0",
  deskripsi: "",
  fasilitas: [],
  lat: "",
  lng: "",
  opsi_tenor: [10, 15, 20],
};

// ── Styles untuk form
const lbl = {
  display: "block",
  fontSize: ".63rem",
  letterSpacing: ".1em",
  textTransform: "uppercase",
  color: "var(--earth)",
  marginBottom: ".4rem",
  fontWeight: 500,
};
const inpSt = {
  width: "100%",
  padding: ".7rem .9rem",
  border: "1px solid var(--mist)",
  background: "var(--white)",
  color: "var(--text)",
  fontFamily: "var(--sans)",
  fontSize: ".88rem",
};

// ── Field builder component (TOP LEVEL untuk hindari re-render)
const Fld = ({ label, k, type = "text", disabled = false, form, set }) => (
  <div>
    <label style={lbl}>{label}</label>
    <input
      type={type}
      value={form[k] ?? ""}
      onChange={(e) => set(k, e.target.value)}
      disabled={disabled}
      style={{
        ...inpSt,
        background: disabled ? "var(--mist)" : "var(--white)",
        opacity: disabled ? 0.75 : 1,
      }}
    />
  </div>
);

// ================================================================
//  KOMPONEN UTAMA
// ================================================================
export default function AdminProperties() {
  const [data, setData] = useState([]);
  const [perumahan, setPerumahan] = useState([]);
  const [unitOptions, setUnitOptions] = useState([]); // tipe yg ada utk perumahan terpilih
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [active, setActive] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [stokVal, setStokVal] = useState("");
  const [imgForm, setImgForm] = useState({
    url: "",
    caption: "",
    is_primary: false,
  });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [savingImg, setSavingImg] = useState(false);
  const [search, setSearch] = useState("");
  const [filterSt, setFilterSt] = useState("");

  // ── 1. Fetch perumahan TERPISAH saat mount — tidak tergantung properties load
  useEffect(() => {
    perumahanApi
      .getAll()
      .then((res) => setPerumahan(res.data || []))
      .catch(() => {});
  }, []);

  // ── 2. Fetch properti (terpisah, bisa fail tanpa pengaruh perumahan dropdown)
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({
        limit: 100,
        ...(filterSt && { status: filterSt }),
        ...(search && { search }),
      }).toString();
      const res = await propertyApi.getAll(q);
      setData(res.data || []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, filterSt]);

  useEffect(() => {
    load();
  }, [load]);

  // ── 3. Saat perumahan dipilih → load tipe-tipe yang sudah ada
  useEffect(() => {
    if (!form.perumahan_id) {
      setUnitOptions([]);
      return;
    }
    perumahanApi
      .getById(form.perumahan_id)
      .then((res) => setUnitOptions(res.data?.unit || []))
      .catch(() => setUnitOptions([]));
  }, [form.perumahan_id]);

  // ── 4. Saat nomor_tipe dipilih dari dropdown → auto-fill semua field
  const handleTipeSelect = (nomor_tipe) => {
    const unit = unitOptions.find(
      (u) => String(u.nomor_tipe) === String(nomor_tipe),
    );
    if (unit) {
      setForm((f) => ({
        ...f,
        nomor_tipe: String(unit.nomor_tipe),
        luas_tanah_lebar_m: unit.luas_tanah_lebar_m || "",
        luas_tanah_panjang_m: unit.luas_tanah_panjang_m || "",
        lebar_jalan_m: unit.lebar_jalan_m || "",
        jumlah_kamar_tidur: unit.jumlah_kamar_tidur || "",
        jumlah_kamar_mandi: unit.jumlah_kamar_mandi || "",
        luas_bangunan_m2: unit.luas_bangunan_m2 || 36,
        jumlah_lantai: unit.jumlah_lantai || 1,
        sumber_air: unit.sumber_air || "Sumur Bor",
        daya_listrik_watt: unit.daya_listrik_watt || 1300,
        harga_jual_juta: unit.harga_jual_juta || "",
        dp_awal_juta: unit.dp_awal_juta || 1,
        tipe_properti: unit.tipe_properti || "Rumah Tapak",
        lat: unit.lat || "",
        lng: unit.lng || "",
        // Deskripsi & fasilitas TIDAK diisi otomatis → tetap manual
      }));
    } else {
      // Input manual untuk nomor tipe baru
      set("nomor_tipe", nomor_tipe);
    }
  };

  // Helpers
  const flash = (m) => {
    setMsg(m);
    setTimeout(() => setMsg(""), 3500);
  };
  const close = () => {
    setModal(null);
    setActive(null);
    setErr("");
    setImgForm({ url: "", caption: "", is_primary: false });
  };
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const openAdd = () => {
    setForm({ ...EMPTY_FORM });
    setUnitOptions([]);
    setErr("");
    setModal("add");
  };

  const openEdit = (row) => {
    setActive(row);
    setForm({
      perumahan_id: row.perumahan_id || "",
      nomor_tipe: row.nomor_tipe || "",
      nama_properti: row.nama_properti || "",
      badge: row.badge || "",
      tipe_properti: row.tipe_properti || "Rumah Tapak",
      luas_tanah_lebar_m: row.luas_tanah_lebar_m || "",
      luas_tanah_panjang_m: row.luas_tanah_panjang_m || "",
      lebar_jalan_m: row.lebar_jalan_m || "",
      jumlah_kamar_tidur: row.kamar_tidur || "",
      jumlah_kamar_mandi: row.kamar_mandi || "",
      luas_bangunan_m2: row.luas_bangunan_m2 || 36,
      jumlah_lantai: row.jumlah_lantai || 1,
      sumber_air: row.sumber_air || "Sumur Bor",
      daya_listrik_watt: row.daya_listrik_watt || 1300,
      harga_jual_juta: row.harga_jual_juta || "",
      dp_awal_juta: row.dp_awal_juta || 1,
      unit_tersedia: row.unit_tersedia || 0,
      deskripsi: row.deskripsi || "",
      fasilitas: Array.isArray(row.fasilitas) ? row.fasilitas : [],
      lat: row.lat || "",
      lng: row.lng || "",
      opsi_tenor: row.opsi_tenor || [10, 15, 20],
    });
    setErr("");
    setModal("edit");
  };

  const openStok = (row) => {
    setActive(row);
    setStokVal(String(row.unit_tersedia));
    setModal("stok");
  };
  const openDel = (row) => {
    setActive(row);
    setModal("del");
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...form,
        luas_tanah_lebar_m: parseFloat(form.luas_tanah_lebar_m),
        luas_tanah_panjang_m: parseFloat(form.luas_tanah_panjang_m),
        lebar_jalan_m: parseFloat(form.lebar_jalan_m),
        jumlah_kamar_tidur: parseInt(form.jumlah_kamar_tidur),
        jumlah_kamar_mandi: parseInt(form.jumlah_kamar_mandi),
        luas_bangunan_m2: parseFloat(form.luas_bangunan_m2),
        jumlah_lantai: parseInt(form.jumlah_lantai),
        daya_listrik_watt: parseInt(form.daya_listrik_watt),
        harga_jual_juta: parseFloat(form.harga_jual_juta),
        dp_awal_juta: parseFloat(form.dp_awal_juta),
        unit_tersedia: parseInt(form.unit_tersedia || 0),
        lat: form.lat ? parseFloat(form.lat) : null,
        lng: form.lng ? parseFloat(form.lng) : null,
      };
      if (modal === "add") {
        await propertyApi.create(payload);
        flash("✅ Unit berhasil ditambahkan.");
      } else {
        await propertyApi.update(active.id, payload);
        flash("✅ Unit berhasil diperbarui.");
      }
      close();
      load();
    } catch (e) {
      setErr(e.message);
    }
  };

  const handleStok = async () => {
    try {
      await propertyApi.updateStok(active.id, {
        unit_tersedia: parseInt(stokVal, 10),
      });
      flash("✅ Stok diperbarui.");
      close();
      load();
    } catch (e) {
      setErr(e.message);
    }
  };
  const handleDel = async () => {
    try {
      await propertyApi.delete(active.id);
      flash("✅ Unit dihapus.");
      close();
      load();
    } catch (e) {
      setErr(e.message);
    }
  };

  // Gambar
  const handleAddImg = async () => {
    if (!imgForm.url) {
      setErr("URL gambar wajib.");
      return;
    }
    setSavingImg(true);
    try {
      await imageApi.add(active.id, imgForm);
      setImgForm({ url: "", caption: "", is_primary: false });
      const res = await propertyApi.getById(active.id);
      setActive(res.data);
      flash("✅ Gambar ditambahkan.");
    } catch (e) {
      setErr(e.message);
    } finally {
      setSavingImg(false);
    }
  };
  const handleDelImg = async (id) => {
    setSavingImg(true);
    try {
      await imageApi.delete(id);
      const r = await propertyApi.getById(active.id);
      setActive(r.data);
      flash("✅ Gambar dihapus.");
    } catch (e) {
      setErr(e.message);
    } finally {
      setSavingImg(false);
    }
  };
  const handleSetPrimary = async (id) => {
    setSavingImg(true);
    try {
      await imageApi.setPrimary(id);
      const r = await propertyApi.getById(active.id);
      setActive(r.data);
      flash("✅ Gambar utama diperbarui.");
    } catch (e) {
      setErr(e.message);
    } finally {
      setSavingImg(false);
    }
  };
  const handleUpdateCaption = async (id, caption) => {
    try {
      await imageApi.update(id, { caption });
      const r = await propertyApi.getById(active.id);
      setActive(r.data);
    } catch (e) {
      setErr(e.message);
    }
  };

  const toggleFasilitas = (f) =>
    setForm((prev) => {
      const arr = prev.fasilitas || [];
      return {
        ...prev,
        fasilitas: arr.includes(f) ? arr.filter((x) => x !== f) : [...arr, f],
      };
    });
  const toggleTenor = (t) =>
    setForm((f) => ({
      ...f,
      opsi_tenor: f.opsi_tenor.includes(t)
        ? f.opsi_tenor.filter((x) => x !== t)
        : [...f.opsi_tenor, t],
    }));

  // ── RENDER MODAL FORM
  const renderForm = () => (
    <Overlay onClose={close} wide>
      <h3 style={modalTitle}>
        {modal === "add"
          ? "+ Tambah Unit Baru"
          : `✏ Edit — ${active?.nama_properti || `Tipe ${active?.nomor_tipe}`}`}
      </h3>
      {err && <div style={errBox}>{err}</div>}

      {/* ══ BAGIAN 1: PERUMAHAN + NOMOR TIPE ══ */}
      <SectionDivider label="1 — Perumahan & Tipe" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
          marginBottom: "1rem",
        }}
      >
        {/* Perumahan */}
        <div>
          <label style={lbl}>
            Perumahan <Required />
          </label>
          <select
            value={form.perumahan_id}
            onChange={(e) => {
              set("perumahan_id", e.target.value);
              setForm((f) => ({ ...f, nomor_tipe: "" }));
            }}
            style={inpSt}
          >
            <option value="">— Pilih Perumahan —</option>
            {perumahan.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama} · {p.lokasi}
              </option>
            ))}
          </select>
          {perumahan.length === 0 && (
            <div
              style={{
                fontSize: ".68rem",
                color: "#A04040",
                marginTop: ".3rem",
              }}
            >
              ⚠ Data perumahan tidak terbaca. Pastikan backend berjalan.
            </div>
          )}
        </div>

        {/* Nomor Tipe — dropdown jika modal=add, atau readonly edit */}
        <div>
          <label style={lbl}>
            Nomor Tipe <Required />
            {modal === "add" && unitOptions.length > 0 && (
              <span
                style={{
                  fontSize: ".6rem",
                  color: "var(--green)",
                  marginLeft: ".4rem",
                  fontWeight: 400,
                }}
              >
                ↳ pilih tipe ada = isi otomatis
              </span>
            )}
          </label>
          {modal === "add" ? (
            <select
              value={form.nomor_tipe}
              onChange={(e) => handleTipeSelect(e.target.value)}
              style={inpSt}
              disabled={!form.perumahan_id}
            >
              <option value="">
                —{" "}
                {form.perumahan_id
                  ? "Pilih / masukkan tipe"
                  : "Pilih perumahan dulu"}{" "}
                —
              </option>
              {/* Opsi: nomor tipe yang sudah ada di DB */}
              {unitOptions.length > 0 && (
                <optgroup label="📋 Tipe yang sudah ada (klik = isi otomatis)">
                  {unitOptions.map((u) => (
                    <option key={u.id} value={u.nomor_tipe}>
                      Tipe {u.nomor_tipe} —{" "}
                      {parseFloat(u.luas_tanah_m2 || 0).toFixed(0)}m² ·{" "}
                      {u.jumlah_kamar_tidur}KT · Rp{u.harga_jual_juta}Jt
                    </option>
                  ))}
                </optgroup>
              )}
              {/* Opsi: tambah nomor baru */}
              <optgroup label="✨ Nomor tipe baru">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
                  .filter((n) => !unitOptions.find((u) => u.nomor_tipe === n))
                  .map((n) => (
                    <option key={`new-${n}`} value={n}>
                      Tipe {n} (baru)
                    </option>
                  ))}
              </optgroup>
            </select>
          ) : (
            <input
              value={form.nomor_tipe}
              readOnly
              style={{ ...inpSt, background: "var(--mist)", opacity: 0.75 }}
            />
          )}
        </div>
      </div>

      {/* Nama properti + badge + tipe properti */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr",
          gap: "1rem",
          marginBottom: "1.2rem",
        }}
      >
        <Fld label="Nama Tampilan Properti" k="nama_properti" form={form} set={set} />
        <div>
          <label style={lbl}>Badge</label>
          <select
            value={form.badge}
            onChange={(e) => set("badge", e.target.value)}
            style={inpSt}
          >
            <option value="">— Tanpa Badge —</option>
            {["Baru", "Terlaris", "Promo", "Eksklusif"].map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={lbl}>Tipe Properti</label>
          <select
            value={form.tipe_properti}
            onChange={(e) => set("tipe_properti", e.target.value)}
            style={inpSt}
          >
            {["Rumah Tapak", "Villa", "Townhouse", "Apartemen"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ══ BAGIAN 2: SPESIFIKASI (auto-fill dari tipe) ══ */}
      <SectionDivider
        label="2 — Spesifikasi Fisik"
        note={
          modal === "add" && form.nomor_tipe
            ? "✓ Terisi otomatis dari referensi tipe"
            : ""
        }
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
          marginBottom: "1.2rem",
        }}
      >
        <Fld label="Lebar Tanah (m)" k="luas_tanah_lebar_m" type="number" form={form} set={set} />
        <Fld label="Panjang Tanah (m)" k="luas_tanah_panjang_m" type="number" form={form} set={set} />
        <Fld label="Lebar Jalan (m)" k="lebar_jalan_m" type="number" form={form} set={set} />
        <Fld label="Kamar Tidur" k="jumlah_kamar_tidur" type="number" form={form} set={set} />
        <Fld label="Kamar Mandi" k="jumlah_kamar_mandi" type="number" form={form} set={set} />
        <Fld label="Luas Bangunan (m²)" k="luas_bangunan_m2" type="number" form={form} set={set} />
        <Fld label="Lantai" k="jumlah_lantai" type="number" form={form} set={set} />
        <Fld label="Daya Listrik (W)" k="daya_listrik_watt" type="number" form={form} set={set} />
        <div>
          <label style={lbl}>Sumber Air</label>
          <select
            value={form.sumber_air}
            onChange={(e) => set("sumber_air", e.target.value)}
            style={inpSt}
          >
            <option>Sumur Bor</option>
            <option>PDAM</option>
            <option>PDAM + Sumur</option>
          </select>
        </div>
        <Fld label="Stok Unit" k="unit_tersedia" type="number" form={form} set={set} />
      </div>

      {/* ══ BAGIAN 3: HARGA ══ */}
      <SectionDivider label="3 — Harga" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
          marginBottom: "1.2rem",
        }}
      >
        <Fld label="Harga Jual (Juta Rp)" k="harga_jual_juta" type="number" form={form} set={set} />
        <Fld label="DP Awal Kredit (Juta)" k="dp_awal_juta" type="number" form={form} set={set} />
      </div>
      <div style={{ marginBottom: "1.2rem" }}>
        <label style={lbl}>Opsi Tenor Angsuran (tahun)</label>
        <div style={{ display: "flex", gap: ".8rem", flexWrap: "wrap" }}>
          {[5, 10, 15, 20, 25, 30].map((t) => (
            <label
              key={t}
              style={{
                display: "flex",
                alignItems: "center",
                gap: ".3rem",
                fontSize: ".84rem",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={(form.opsi_tenor || []).includes(t)}
                onChange={() => toggleTenor(t)}
              />{" "}
              {t} thn
            </label>
          ))}
        </div>
      </div>

      {/* ══ BAGIAN 4: DESKRIPSI & FASILITAS (manual) ══ */}
      <SectionDivider label="4 — Deskripsi & Fasilitas" note="Diisi manual" />
      <div style={{ marginBottom: "1rem" }}>
        <label style={lbl}>Deskripsi Properti</label>
        <textarea
          value={form.deskripsi}
          onChange={(e) => set("deskripsi", e.target.value)}
          rows={3}
          style={{ ...inpSt, resize: "vertical" }}
          placeholder="Ceritakan keunggulan properti ini…"
        />
      </div>
      <div style={{ marginBottom: "1.4rem" }}>
        <label style={lbl}>Fasilitas (klik untuk toggle)</label>
        <div
          style={{
            display: "flex",
            gap: ".4rem",
            flexWrap: "wrap",
            marginBottom: ".5rem",
          }}
        >
          {FASILITAS_LIST.map((f) => {
            const on = (form.fasilitas || []).includes(f);
            return (
              <button
                key={f}
                type="button"
                onClick={() => toggleFasilitas(f)}
                style={{
                  padding: ".3rem .75rem",
                  background: on ? "var(--espresso)" : "var(--mist)",
                  border: `1px solid ${on ? "var(--espresso)" : "var(--clay)"}`,
                  color: on ? "var(--sand)" : "var(--text)",
                  fontSize: ".72rem",
                  cursor: "pointer",
                  transition: "all .15s",
                  borderRadius: 2,
                }}
              >
                {on ? "✓ " : ""}
                {f}
              </button>
            );
          })}
        </div>
        <input
          placeholder="Tambah fasilitas lain (tekan Enter atau koma)"
          style={{ ...inpSt, fontSize: ".78rem" }}
          onKeyDown={(e) => {
            if (e.key === "," || e.key === "Enter") {
              e.preventDefault();
              const v = e.target.value.trim().replace(/,$/, "");
              if (v && !(form.fasilitas || []).includes(v)) {
                toggleFasilitas(v);
                e.target.value = "";
              }
            }
          }}
        />
        {(form.fasilitas || []).length > 0 && (
          <div
            style={{
              marginTop: ".4rem",
              fontSize: ".72rem",
              color: "var(--light)",
            }}
          >
            Terpilih: {(form.fasilitas || []).join(", ")}
          </div>
        )}
      </div>

      {/* ══ BAGIAN 5: LOKASI / PETA ══ */}
      <SectionDivider label="5 — Lokasi & Peta" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
          marginBottom: ".8rem",
        }}
      >
        <div>
          <label style={lbl}>Latitude</label>
          <input
            type="number"
            value={form.lat}
            onChange={(e) => set("lat", e.target.value)}
            step="0.0001"
            placeholder="contoh: -6.9344"
            style={inpSt}
          />
        </div>
        <div>
          <label style={lbl}>Longitude</label>
          <input
            type="number"
            value={form.lng}
            onChange={(e) => set("lng", e.target.value)}
            step="0.0001"
            placeholder="contoh: 107.5965"
            style={inpSt}
          />
        </div>
      </div>
      <MapPicker
        lat={form.lat}
        lng={form.lng}
        onPickLocation={(lat, lng) => setForm((f) => ({ ...f, lat, lng }))}
      />

      {/* ══ BAGIAN 6: GAMBAR (hanya mode edit) ══ */}
      {modal === "edit" && (
        <>
          <SectionDivider label="6 — Gambar Properti" />
          {(active?.gambar || []).length === 0 && (
            <div
              style={{
                color: "var(--light)",
                fontSize: ".82rem",
                padding: ".8rem",
                background: "var(--sand)",
                textAlign: "center",
                marginBottom: "1rem",
              }}
            >
              Belum ada gambar. Tambahkan di bawah.
            </div>
          )}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(175px,1fr))",
              gap: ".8rem",
              marginBottom: "1.2rem",
            }}
          >
            {(active?.gambar || []).map((img) => (
              <div
                key={img.id}
                style={{
                  border: `2px solid ${img.is_primary ? "var(--accent)" : "var(--mist)"}`,
                  overflow: "hidden",
                }}
              >
                <img
                  src={img.url}
                  alt={img.caption}
                  style={{
                    width: "100%",
                    height: 100,
                    objectFit: "cover",
                    display: "block",
                  }}
                  onError={(e) =>
                    (e.target.src =
                      "https://via.placeholder.com/300x200?text=Error")
                  }
                />
                {img.is_primary && (
                  <div
                    style={{
                      background: "var(--accent)",
                      color: "#fff",
                      fontSize: ".55rem",
                      letterSpacing: ".08em",
                      textTransform: "uppercase",
                      padding: ".2rem .5rem",
                      textAlign: "center",
                    }}
                  >
                    ★ Gambar Utama
                  </div>
                )}
                <div style={{ padding: ".5rem" }}>
                  <input
                    defaultValue={img.caption}
                    onBlur={(e) => handleUpdateCaption(img.id, e.target.value)}
                    placeholder="Keterangan gambar…"
                    style={{
                      width: "100%",
                      padding: ".3rem .5rem",
                      border: "1px solid var(--mist)",
                      fontFamily: "var(--sans)",
                      fontSize: ".7rem",
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      gap: ".3rem",
                      marginTop: ".4rem",
                    }}
                  >
                    {!img.is_primary && (
                      <button
                        onClick={() => handleSetPrimary(img.id)}
                        disabled={savingImg}
                        style={{
                          ...btnSm("var(--accent)"),
                          flex: 1,
                          fontSize: ".6rem",
                          padding: ".28rem",
                        }}
                      >
                        ⭐ Utama
                      </button>
                    )}
                    <button
                      onClick={() => handleDelImg(img.id)}
                      disabled={savingImg}
                      style={{
                        ...btnSm("#A04040"),
                        flex: 1,
                        fontSize: ".6rem",
                        padding: ".28rem",
                      }}
                    >
                      🗑 Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Form tambah gambar */}
          <div
            style={{
              background: "var(--sand)",
              padding: "1rem",
              border: "1px dashed var(--clay)",
            }}
          >
            <div
              style={{
                fontSize: ".65rem",
                fontWeight: 600,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: "var(--earth)",
                marginBottom: ".7rem",
              }}
            >
              + Tambah Gambar Baru
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: ".5rem",
                marginBottom: ".5rem",
              }}
            >
              <input
                value={imgForm.url}
                onChange={(e) =>
                  setImgForm((f) => ({ ...f, url: e.target.value }))
                }
                placeholder="URL gambar (https://…)"
                style={{ ...inpSt, fontSize: ".82rem" }}
              />
              <button
                onClick={handleAddImg}
                disabled={savingImg}
                style={{
                  ...btnPrimary,
                  padding: ".6rem 1.2rem",
                  fontSize: ".75rem",
                }}
              >
                {savingImg ? "…" : "Tambah"}
              </button>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: ".5rem",
                alignItems: "center",
              }}
            >
              <input
                value={imgForm.caption}
                onChange={(e) =>
                  setImgForm((f) => ({ ...f, caption: e.target.value }))
                }
                placeholder="Keterangan gambar (contoh: Tampak Depan)"
                style={{ ...inpSt, fontSize: ".82rem" }}
              />
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: ".3rem",
                  fontSize: ".78rem",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                <input
                  type="checkbox"
                  checked={imgForm.is_primary}
                  onChange={(e) =>
                    setImgForm((f) => ({ ...f, is_primary: e.target.checked }))
                  }
                />{" "}
                Jadikan Utama
              </label>
            </div>
            {imgForm.url && (
              <img
                src={imgForm.url}
                alt="Preview"
                style={{
                  marginTop: ".8rem",
                  width: "100%",
                  maxHeight: 130,
                  objectFit: "cover",
                }}
                onError={(e) => (e.target.style.display = "none")}
              />
            )}
          </div>
        </>
      )}

      {/* Tombol aksi */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          justifyContent: "flex-end",
          marginTop: "2rem",
          borderTop: "1px solid var(--mist)",
          paddingTop: "1.5rem",
        }}
      >
        <button
          onClick={close}
          style={{
            ...btnPrimary,
            background: "var(--mist)",
            color: "var(--text)",
          }}
        >
          Batal
        </button>
        <button onClick={handleSave} style={btnPrimary}>
          {modal === "add" ? "+ Tambahkan" : "💾 Simpan Perubahan"}
        </button>
      </div>
    </Overlay>
  );

  // ── RENDER HALAMAN UTAMA
  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--serif)",
            fontSize: "1.8rem",
            fontWeight: 300,
            color: "var(--espresso)",
          }}
        >
          Manajemen Properti
        </h2>
        <button onClick={openAdd} style={btnPrimary}>
          + Tambah Unit
        </button>
      </div>

      {msg && <div style={flashStyle}>{msg}</div>}

      {/* Filter bar */}
      <div
        style={{
          display: "flex",
          gap: ".8rem",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama / perumahan…"
          style={{ ...inpSt, flex: 1, minWidth: 180, padding: ".6rem .9rem" }}
        />
        <select
          value={filterSt}
          onChange={(e) => setFilterSt(e.target.value)}
          style={{
            ...inpSt,
            padding: ".6rem .9rem",
            flex: "none",
            width: "auto",
          }}
        >
          <option value="">Semua Status</option>
          <option value="tersedia">Tersedia</option>
          <option value="sold_out">Sold Out</option>
        </select>
      </div>

      {/* Tabel */}
      {loading ? (
        <div
          style={{
            color: "var(--light)",
            textAlign: "center",
            padding: "3rem",
          }}
        >
          Memuat data properti…
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: ".82rem",
            }}
          >
            <thead>
              <tr
                style={{ background: "var(--espresso)", color: "var(--sand)" }}
              >
                {[
                  "ID",
                  "Nama Properti",
                  "Luas",
                  "KT/KM",
                  "Harga (Jt)",
                  "Stok",
                  "Status",
                  "Gambar",
                  "Aksi",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: ".75rem 1rem",
                      textAlign: "left",
                      fontWeight: 500,
                      fontSize: ".68rem",
                      letterSpacing: ".08em",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    style={{
                      textAlign: "center",
                      padding: "3rem",
                      color: "var(--light)",
                    }}
                  >
                    Tidak ada data.
                  </td>
                </tr>
              )}
              {data.map((row, i) => (
                <tr
                  key={row.id}
                  style={{
                    background: i % 2 === 0 ? "#fff" : "var(--sand)",
                    borderBottom: "1px solid var(--mist)",
                  }}
                >
                  <td style={td}>{row.id}</td>
                  <td style={td}>
                    <div style={{ fontWeight: 500, color: "var(--espresso)" }}>
                      {row.nama_properti ||
                        `${row.perumahan} T.${row.nomor_tipe}`}
                    </div>
                    <div style={{ fontSize: ".7rem", color: "var(--light)" }}>
                      {row.perumahan} · {row.tipe_properti}
                    </div>
                    {row.badge && (
                      <span
                        style={{
                          padding: ".12rem .5rem",
                          fontSize: ".58rem",
                          letterSpacing: ".08em",
                          textTransform: "uppercase",
                          background: BADGE_COLOR[row.badge] || "#333",
                          color: "#fff",
                        }}
                      >
                        {row.badge}
                      </span>
                    )}
                  </td>
                  <td style={td}>
                    {parseFloat(row.luas_tanah_m2 || 0).toFixed(0)} m²
                  </td>
                  <td style={td}>
                    {row.kamar_tidur}KT/{row.kamar_mandi}KM
                  </td>
                  <td style={td}>Rp {row.harga_jual_juta} Jt</td>
                  <td style={td}>
                    <button
                      onClick={() => openStok(row)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 600,
                        color:
                          row.unit_tersedia > 0 ? "var(--green)" : "var(--red)",
                        fontFamily: "var(--sans)",
                        fontSize: ".82rem",
                      }}
                    >
                      {row.unit_tersedia} unit
                    </button>
                  </td>
                  <td style={td}>
                    <span
                      style={{
                        padding: ".2rem .7rem",
                        fontSize: ".62rem",
                        letterSpacing: ".08em",
                        textTransform: "uppercase",
                        background:
                          row.status === "tersedia"
                            ? "rgba(74,124,89,.12)"
                            : "rgba(160,64,64,.1)",
                        color:
                          row.status === "tersedia"
                            ? "var(--green)"
                            : "var(--red)",
                        border: `1px solid ${row.status === "tersedia" ? "rgba(74,124,89,.3)" : "rgba(160,64,64,.3)"}`,
                      }}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td style={td}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: ".3rem",
                      }}
                    >
                      {row.gambar_utama ? (
                        <img
                          src={row.gambar_utama}
                          alt=""
                          style={{
                            width: 38,
                            height: 38,
                            objectFit: "cover",
                            borderRadius: 2,
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            background: "var(--mist)",
                            borderRadius: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: ".6rem",
                            color: "var(--light)",
                          }}
                        >
                          —
                        </div>
                      )}
                      <span
                        style={{ fontSize: ".68rem", color: "var(--light)" }}
                      >
                        {(row.gambar || []).length}x
                      </span>
                    </div>
                  </td>
                  <td style={td}>
                    <div style={{ display: "flex", gap: ".4rem" }}>
                      <button
                        onClick={() => openEdit(row)}
                        style={btnSm("#005BAA")}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDel(row)}
                        style={btnSm("#A04040")}
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {(modal === "add" || modal === "edit") && renderForm()}

      {modal === "stok" && (
        <Overlay onClose={close}>
          <h3 style={modalTitle}>
            📦 Update Stok —{" "}
            {active?.nama_properti || `Tipe ${active?.nomor_tipe}`}
          </h3>
          <label style={lbl}>Jumlah Stok Baru</label>
          <input
            type="number"
            min="0"
            value={stokVal}
            onChange={(e) => setStokVal(e.target.value)}
            style={{
              ...inpSt,
              fontSize: "1.5rem",
              textAlign: "center",
              marginBottom: "1.5rem",
            }}
          />
          {err && <div style={errBox}>{err}</div>}
          <div
            style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}
          >
            <button
              onClick={close}
              style={{
                ...btnPrimary,
                background: "var(--mist)",
                color: "var(--text)",
              }}
            >
              Batal
            </button>
            <button onClick={handleStok} style={btnPrimary}>
              Update Stok
            </button>
          </div>
        </Overlay>
      )}

      {modal === "del" && (
        <Overlay onClose={close}>
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🗑</div>
            <h3 style={{ ...modalTitle, textAlign: "center" }}>Hapus Unit?</h3>
            <p
              style={{
                fontSize: ".88rem",
                color: "var(--light)",
                marginBottom: "2rem",
              }}
            >
              <strong>{active?.nama_properti}</strong> akan dihapus permanen
              beserta semua gambarnya.
            </p>
            {err && <div style={errBox}>{err}</div>}
            <div
              style={{ display: "flex", gap: "1rem", justifyContent: "center" }}
            >
              <button
                onClick={close}
                style={{
                  ...btnPrimary,
                  background: "var(--mist)",
                  color: "var(--text)",
                }}
              >
                Batal
              </button>
              <button
                onClick={handleDel}
                style={{ ...btnPrimary, background: "#A04040" }}
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </Overlay>
      )}
    </div>
  );
}

// ── Sub-komponen
function Overlay({ children, onClose, wide }) {
  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(44,31,20,.65)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "#fff",
          width: "100%",
          maxWidth: wide ? 920 : 520,
          maxHeight: "94vh",
          overflowY: "auto",
          padding: "2.5rem",
          position: "relative",
          borderRadius: 2,
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "none",
            border: "none",
            fontSize: "1.3rem",
            cursor: "pointer",
            color: "var(--light)",
          }}
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

function SectionDivider({ label, note }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: ".8rem",
        margin: "1.4rem 0 1rem",
        borderBottom: "2px solid var(--mist)",
        paddingBottom: ".5rem",
      }}
    >
      <span
        style={{
          fontSize: ".68rem",
          fontWeight: 700,
          letterSpacing: ".12em",
          textTransform: "uppercase",
          color: "var(--accent)",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      {note && (
        <span
          style={{ fontSize: ".62rem", color: "var(--green)", fontWeight: 400 }}
        >
          {note}
        </span>
      )}
    </div>
  );
}

function Required() {
  return (
    <span style={{ color: "var(--accent)", marginLeft: ".15rem" }}>*</span>
  );
}

// ── Other Styles
const td = {
  padding: ".75rem 1rem",
  color: "var(--text)",
  verticalAlign: "middle",
};
const btnPrimary = {
  padding: ".75rem 1.8rem",
  background: "var(--espresso)",
  border: "none",
  color: "var(--sand)",
  fontFamily: "var(--sans)",
  fontSize: ".78rem",
  fontWeight: 500,
  letterSpacing: ".08em",
  textTransform: "uppercase",
  cursor: "pointer",
  transition: "background .2s",
};
const btnSm = (bg) => ({
  padding: ".35rem .75rem",
  background: bg,
  border: "none",
  color: "#fff",
  fontSize: ".72rem",
  cursor: "pointer",
  letterSpacing: ".06em",
  textTransform: "uppercase",
  fontFamily: "var(--sans)",
  borderRadius: 2,
});
const flashStyle = {
  background: "rgba(74,124,89,.1)",
  border: "1px solid rgba(74,124,89,.3)",
  color: "var(--green)",
  padding: ".8rem 1.2rem",
  marginBottom: "1rem",
  fontSize: ".85rem",
};
const errBox = {
  background: "rgba(160,64,64,.1)",
  border: "1px solid rgba(160,64,64,.3)",
  color: "#A04040",
  padding: ".75rem 1rem",
  marginBottom: "1rem",
  fontSize: ".82rem",
};
const modalTitle = {
  fontFamily: "var(--serif)",
  fontSize: "1.4rem",
  fontWeight: 400,
  color: "var(--espresso)",
  marginBottom: "1.5rem",
};
