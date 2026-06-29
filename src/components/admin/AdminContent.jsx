// ================================================================
//  components/admin/AdminContent.jsx
//  Editor konten website — Hero, Stats, Why, CTA, Marquee, Testimoni
// ================================================================
import { useState } from "react";
import { useCms, DEFAULT_CONTENT } from "../../context/CmsContext";
import { toBase64 } from "../../utils/helpers";

const TABS = [
  { key: "hero", icon: "🏠", label: "Hero" },
  { key: "stats", icon: "📊", label: "Statistik" },
  { key: "why", icon: "✅", label: "Keunggulan" },
  { key: "cta", icon: "📣", label: "Banner CTA" },
  { key: "marquee", icon: "✦", label: "Marquee" },
  { key: "testimonials", icon: "💬", label: "Testimoni" },
  { key: "navbar", icon: "🧭", label: "Navbar" },
  { key: "footer", icon: "📋", label: "Footer" },
  { key: "listing", icon: "🏘", label: "Hal. Listing" },
  { key: "detail", icon: "📄", label: "Hal. Detail" },
  { key: "contact", icon: "✉️", label: "Hal. Kontak" },
];

export default function AdminContent() {
  const { content, updateSection, resetAll } = useCms();
  const [activeTab, setActiveTab] = useState("hero");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  const flash = (m, isErr = false) => {
    if (isErr) {
      setErr(m);
      setTimeout(() => setErr(""), 4000);
    } else {
      setMsg(m);
      setTimeout(() => setMsg(""), 3000);
    }
  };

  const save = async (section, data) => {
    setSaving(true);
    try {
      await updateSection(section, data);
      flash(`✅ Section "${section}" berhasil disimpan.`);
    } catch (e) {
      flash(e.message, true);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (
      !window.confirm("Reset SEMUA konten ke default? Perubahan akan hilang.")
    )
      return;
    setSaving(true);
    try {
      await resetAll();
      flash("✅ Konten direset ke default.");
    } catch (e) {
      flash(e.message, true);
    } finally {
      setSaving(false);
    }
  };

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
        <div>
          <h2
            style={{
              fontFamily: "var(--serif)",
              fontSize: "1.8rem",
              fontWeight: 300,
              color: "var(--espresso)",
            }}
          >
            Konten Website
          </h2>
          <p
            style={{
              fontSize: ".78rem",
              color: "var(--light)",
              marginTop: ".25rem",
            }}
          >
            Perubahan langsung tampil di halaman publik.
          </p>
        </div>
        <button
          onClick={handleReset}
          disabled={saving}
          style={{
            padding: ".65rem 1.4rem",
            background: "transparent",
            border: "1px solid #A04040",
            color: "#A04040",
            fontFamily: "var(--sans)",
            fontSize: ".75rem",
            letterSpacing: ".08em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          🔄 Reset ke Default
        </button>
      </div>

      {msg && <div style={flashOk}>{msg}</div>}
      {err && <div style={flashErr}>{err}</div>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "180px 1fr",
          gap: "1.5rem",
          alignItems: "start",
        }}
      >
        {/* Tab sidebar */}
        <div
          style={{
            background: "#fff",
            border: "1px solid var(--mist)",
            overflow: "hidden",
          }}
        >
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: ".7rem",
                padding: ".85rem 1rem",
                borderLeft:
                  activeTab === t.key
                    ? "3px solid var(--accent)"
                    : "3px solid transparent",
                borderTop: "none",
                borderRight: "none",
                borderBottom: "1px solid var(--mist)",
                fontFamily: "var(--sans)",
                fontSize: ".8rem",
                cursor: "pointer",
                color: activeTab === t.key ? "var(--espresso)" : "var(--light)",
                fontWeight: activeTab === t.key ? 600 : 400,
                background: activeTab === t.key ? "var(--sand)" : "#fff",
                transition: "all .15s",
              }}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div
          style={{
            background: "#fff",
            border: "1px solid var(--mist)",
            padding: "2rem",
          }}
        >
          {activeTab === "hero" && (
            <HeroEditor
              data={content.hero}
              onSave={(d) => save("hero", d)}
              saving={saving}
            />
          )}
          {activeTab === "stats" && (
            <StatsEditor
              data={content.stats}
              onSave={(d) => save("stats", d)}
              saving={saving}
            />
          )}
          {activeTab === "why" && (
            <WhyEditor
              data={content.why}
              onSave={(d) => save("why", d)}
              saving={saving}
            />
          )}
          {activeTab === "cta" && (
            <CtaEditor
              data={content.cta}
              onSave={(d) => save("cta", d)}
              saving={saving}
            />
          )}
          {activeTab === "marquee" && (
            <MarqueeEditor
              data={content.marquee}
              onSave={(d) => save("marquee", d)}
              saving={saving}
            />
          )}
          {activeTab === "testimonials" && (
            <TestimoniEditor
              data={content.testimonials}
              onSave={(d) => save("testimonials", d)}
              saving={saving}
            />
          )}
          {activeTab === "navbar" && (
            <NavbarEditor
              data={content.navbar}
              onSave={(d) => save("navbar", d)}
              saving={saving}
            />
          )}
          {activeTab === "footer" && (
            <FooterEditor
              data={content.footer}
              onSave={(d) => save("footer", d)}
              saving={saving}
            />
          )}
          {activeTab === "listing" && (
            <ListingEditor
              data={content.listing}
              onSave={(d) => save("listing", d)}
              saving={saving}
            />
          )}
          {activeTab === "detail" && (
            <DetailEditor
              data={content.detail}
              onSave={(d) => save("detail", d)}
              saving={saving}
            />
          )}
          {activeTab === "contact" && (
            <ContactEditor
              data={content.contact}
              onSave={(d) => save("contact", d)}
              saving={saving}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ================================================================
//  HERO EDITOR
// ================================================================
function HeroEditor({ data, onSave, saving }) {
  const [f, setF] = useState({ ...DEFAULT_CONTENT.hero, ...data });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const handleImage = async (file) => {
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      window.alert("Ukuran gambar maksimal 3MB.");
      return;
    }
    const base64 = await toBase64(file);
    set("image", base64);
  };

  return (
    <Section title="🏠 Hero Section" onSave={() => onSave(f)} saving={saving}>
      <div style={{ marginBottom: "1.5rem" }}>
        <label style={{ fontSize: ".7rem", fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--earth)", display: "block", marginBottom: ".5rem" }}>
          Gambar Hero (sisi kanan halaman Beranda)
        </label>
        <label style={{
          display: "flex", alignItems: "center", gap: "1rem", cursor: "pointer",
          border: "1.5px dashed var(--clay)", padding: ".8rem", background: "var(--sand)",
        }}>
          <img src={f.image} alt="Preview hero" style={{ width: 140, height: 90, objectFit: "cover" }} />
          <span style={{ fontSize: ".82rem", color: "var(--light)" }}>📎 Klik untuk ganti gambar (maks. 3MB)</span>
          <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleImage(e.target.files?.[0])} />
        </label>
      </div>
      <Grid>
        <Field
          label="Label kecil (Tag)"
          value={f.tag}
          onChange={(v) => set("tag", v)}
        />
        <Field
          label="Judul baris 1"
          value={f.title1}
          onChange={(v) => set("title1", v)}
        />
        <Field
          label='Judul baris 2 (italic accent, contoh: "Impian")'
          value={f.title2}
          onChange={(v) => set("title2", v)}
        />
        <Field
          label="Judul baris 3"
          value={f.title3}
          onChange={(v) => set("title3", v)}
        />
        <Field
          label="Deskripsi"
          value={f.description}
          onChange={(v) => set("description", v)}
          isTextarea
        />
        <Field
          label="Label Tombol 1"
          value={f.btn1}
          onChange={(v) => set("btn1", v)}
        />
        <Field
          label="Label Tombol 2"
          value={f.btn2}
          onChange={(v) => set("btn2", v)}
        />
        <Field
          label="Kartu kiri-bawah: Label (contoh: Harga cash)"
          value={f.price_label}
          onChange={(v) => set("price_label", v)}
        />
        <Field
          label="Kartu kiri-bawah: Nilai (contoh: Rp 190 Jt)"
          value={f.price_value}
          onChange={(v) => set("price_value", v)}
        />
        <Field
          label="Badge hijau kanan-atas: Nilai (contoh: Rp 1 Jt)"
          value={f.dp_value}
          onChange={(v) => set("dp_value", v)}
        />
        <Field
          label="Badge hijau kanan-atas: Label (contoh: DP)"
          value={f.dp_label}
          onChange={(v) => set("dp_label", v)}
        />
      </Grid>
      <Preview>
        <div
          style={{
            fontFamily: "var(--serif)",
            fontSize: "1.6rem",
            lineHeight: 1.1,
            color: "var(--espresso)",
            marginBottom: ".5rem",
          }}
        >
          {f.title1}{" "}
          <em style={{ color: "var(--accent)", fontStyle: "italic" }}>
            {f.title2}
          </em>{" "}
          {f.title3}
        </div>
        <div
          style={{
            fontSize: ".82rem",
            color: "var(--light)",
            marginBottom: ".8rem",
          }}
        >
          {f.description}
        </div>
        <div style={{ display: "flex", gap: ".8rem" }}>
          <span style={prevBtn("#2C1F14")}>{f.btn1}</span>
          <span
            style={prevBtn(
              "transparent",
              "1px solid var(--clay)",
              "var(--earth)",
            )}
          >
            {f.btn2}
          </span>
        </div>
      </Preview>
    </Section>
  );
}

// ================================================================
//  STATS EDITOR
// ================================================================
function StatsEditor({ data, onSave, saving }) {
  const [f, setF] = useState([...(data || DEFAULT_CONTENT.stats)]);
  const upd = (i, k, v) =>
    setF((p) => p.map((s, idx) => (idx === i ? { ...s, [k]: v } : s)));
  return (
    <Section
      title="📊 Statistik Beranda"
      onSave={() => onSave(f)}
      saving={saving}
    >
      {f.map((s, i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
            marginBottom: "1rem",
            padding: "1rem",
            background: "var(--sand)",
            borderLeft: "3px solid var(--accent)",
          }}
        >
          <Field
            label={`Statistik ${i + 1} — Nilai`}
            value={s.value}
            onChange={(v) => upd(i, "value", v)}
          />
          <Field
            label={`Statistik ${i + 1} — Label`}
            value={s.label}
            onChange={(v) => upd(i, "label", v)}
          />
        </div>
      ))}
      <Preview>
        <div style={{ display: "flex", gap: "3rem" }}>
          {f.map((s, i) => (
            <div key={i}>
              <div
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "2rem",
                  fontWeight: 500,
                  color: "var(--espresso)",
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: ".7rem",
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                  color: "var(--light)",
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </Preview>
    </Section>
  );
}

// ================================================================
//  WHY EDITOR
// ================================================================
function WhyEditor({ data, onSave, saving }) {
  const [f, setF] = useState({
    ...DEFAULT_CONTENT.why,
    ...data,
    items: [...(data?.items || DEFAULT_CONTENT.why.items)],
  });
  const setTop = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const setItem = (i, k, v) =>
    setF((p) => ({
      ...p,
      items: p.items.map((it, idx) => (idx === i ? { ...it, [k]: v } : it)),
    }));
  return (
    <Section
      title="✅ Section Keunggulan"
      onSave={() => onSave(f)}
      saving={saving}
    >
      <Grid>
        <Field
          label="Tag kecil"
          value={f.tag}
          onChange={(v) => setTop("tag", v)}
        />
        <Field
          label="Judul utama"
          value={f.title}
          onChange={(v) => setTop("title", v)}
        />
      </Grid>
      {f.items.map((it, i) => (
        <div
          key={i}
          style={{
            marginTop: "1rem",
            padding: "1.2rem",
            background: "var(--sand)",
            borderLeft: `3px solid var(--clay)`,
          }}
        >
          <div
            style={{
              fontSize: ".65rem",
              fontWeight: 600,
              letterSpacing: ".1em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: ".8rem",
            }}
          >
            Item {it.no}
          </div>
          <Grid>
            <Field
              label="Judul item"
              value={it.title}
              onChange={(v) => setItem(i, "title", v)}
            />
            <Field
              label="Deskripsi"
              value={it.desc}
              onChange={(v) => setItem(i, "desc", v)}
              isTextarea
            />
          </Grid>
        </div>
      ))}
    </Section>
  );
}

// ================================================================
//  CTA EDITOR
// ================================================================
function CtaEditor({ data, onSave, saving }) {
  const [f, setF] = useState({ ...DEFAULT_CONTENT.cta, ...data });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  return (
    <Section
      title="📣 Banner CTA (Ajakan Bertindak)"
      onSave={() => onSave(f)}
      saving={saving}
    >
      <Grid>
        <Field
          label="Tag kecil"
          value={f.tag}
          onChange={(v) => set("tag", v)}
        />
        <Field
          label="Judul"
          value={f.title}
          onChange={(v) => set("title", v)}
        />
        <Field
          label="Deskripsi"
          value={f.description}
          onChange={(v) => set("description", v)}
          isTextarea
        />
        <Field
          label="Label Tombol 1"
          value={f.btn1}
          onChange={(v) => set("btn1", v)}
        />
        <Field
          label="Label Tombol 2"
          value={f.btn2}
          onChange={(v) => set("btn2", v)}
        />
      </Grid>
      <Preview dark>
        <div
          style={{
            fontSize: ".6rem",
            letterSpacing: ".14em",
            textTransform: "uppercase",
            color: "var(--clay)",
            marginBottom: ".4rem",
          }}
        >
          {f.tag}
        </div>
        <div
          style={{
            fontFamily: "var(--serif)",
            fontSize: "1.4rem",
            color: "var(--sand)",
            marginBottom: ".5rem",
          }}
        >
          {f.title}
        </div>
        <div
          style={{
            fontSize: ".8rem",
            color: "var(--clay)",
            marginBottom: "1rem",
          }}
        >
          {f.description}
        </div>
        <div style={{ display: "flex", gap: ".7rem" }}>
          <span style={prevBtn("var(--sand)", "none", "var(--espresso)")}>
            {f.btn1}
          </span>
          <span
            style={prevBtn(
              "transparent",
              "1px solid rgba(200,180,154,.4)",
              "var(--sand)",
            )}
          >
            {f.btn2}
          </span>
        </div>
      </Preview>
    </Section>
  );
}

// ================================================================
//  MARQUEE EDITOR
// ================================================================
function MarqueeEditor({ data, onSave, saving }) {
  const [items, setItems] = useState([...(data || DEFAULT_CONTENT.marquee)]);
  const update = (i, v) =>
    setItems((p) => p.map((x, idx) => (idx === i ? v : x)));
  const add = () => setItems((p) => [...p, "Item Baru"]);
  const remove = (i) => setItems((p) => p.filter((_, idx) => idx !== i));
  return (
    <Section
      title="✦ Teks Marquee Berjalan"
      onSave={() => onSave(items)}
      saving={saving}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: ".6rem",
          marginBottom: "1rem",
        }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            style={{ display: "flex", gap: ".5rem", alignItems: "center" }}
          >
            <span
              style={{
                fontSize: ".75rem",
                color: "var(--accent)",
                width: 22,
                flexShrink: 0,
              }}
            >
              ✦
            </span>
            <input
              value={item}
              onChange={(e) => update(i, e.target.value)}
              style={{ ...inp, flex: 1 }}
            />
            <button
              onClick={() => remove(i)}
              style={{ ...btnDel, padding: ".5rem .7rem" }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <button onClick={add} style={btnAdd}>
        + Tambah Item
      </button>
      <Preview>
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          {items.map((t, i) => (
            <span
              key={i}
              style={{
                fontSize: ".72rem",
                letterSpacing: ".12em",
                textTransform: "uppercase",
                color: "var(--earth)",
              }}
            >
              ✦ {t}
            </span>
          ))}
        </div>
      </Preview>
    </Section>
  );
}

// ================================================================
//  TESTIMONIALS EDITOR
// ================================================================
function TestimoniEditor({ data, onSave, saving }) {
  const [items, setItems] = useState([
    ...(data || DEFAULT_CONTENT.testimonials),
  ]);
  const upd = (i, k, v) =>
    setItems((p) => p.map((x, idx) => (idx === i ? { ...x, [k]: v } : x)));
  const add = () =>
    setItems((p) => [
      ...p,
      {
        inisial: "N",
        nama: "Nama Baru",
        lokasi: "Lokasi",
        teks: "Testimoni...",
      },
    ]);
  const del = (i) => setItems((p) => p.filter((_, idx) => idx !== i));
  return (
    <Section title="💬 Testimoni" onSave={() => onSave(items)} saving={saving}>
      {items.map((it, i) => (
        <div
          key={i}
          style={{
            marginBottom: "1.2rem",
            padding: "1.2rem",
            background: "var(--sand)",
            borderTop: "3px solid var(--accent)",
            position: "relative",
          }}
        >
          <button
            onClick={() => del(i)}
            style={{
              ...btnDel,
              position: "absolute",
              top: "1rem",
              right: "1rem",
            }}
          >
            ✕ Hapus
          </button>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "60px 1fr 1fr",
              gap: "1rem",
              marginBottom: ".8rem",
            }}
          >
            <Field
              label="Inisial"
              value={it.inisial}
              onChange={(v) => upd(i, "inisial", v)}
            />
            <Field
              label="Nama"
              value={it.nama}
              onChange={(v) => upd(i, "nama", v)}
            />
            <Field
              label="Lokasi"
              value={it.lokasi}
              onChange={(v) => upd(i, "lokasi", v)}
            />
          </div>
          <Field
            label="Teks testimoni"
            value={it.teks}
            onChange={(v) => upd(i, "teks", v)}
            isTextarea
          />
        </div>
      ))}
      <button onClick={add} style={btnAdd}>
        + Tambah Testimoni
      </button>
    </Section>
  );
}

// ================================================================
//  NAVBAR EDITOR
// ================================================================
function NavbarEditor({ data, onSave, saving }) {
  const [f, setF] = useState({ ...DEFAULT_CONTENT.navbar, ...data });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  return (
    <Section title="🧭 Navbar (Menu Atas)" onSave={() => onSave(f)} saving={saving}>
      <Grid>
        <Field label="Logo — bagian utama" value={f.logo_main} onChange={(v) => set("logo_main", v)} />
        <Field label="Logo — bagian aksen (warna accent)" value={f.logo_accent} onChange={(v) => set("logo_accent", v)} />
        <Field label="Label menu: Beranda" value={f.link_home} onChange={(v) => set("link_home", v)} />
        <Field label="Label menu: Properti" value={f.link_listing} onChange={(v) => set("link_listing", v)} />
        <Field label="Label menu: Booking" value={f.link_booking} onChange={(v) => set("link_booking", v)} />
        <Field label="Label menu: Tentang" value={f.link_about} onChange={(v) => set("link_about", v)} />
        <Field label="Label menu: Kontak" value={f.link_contact} onChange={(v) => set("link_contact", v)} />
        <Field label="Label tombol CTA kanan" value={f.cta_label} onChange={(v) => set("cta_label", v)} />
      </Grid>
      <Preview>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontFamily: "var(--serif)", fontSize: "1.3rem", color: "var(--espresso)" }}>
            {f.logo_main}<span style={{ color: "var(--accent)" }}>{f.logo_accent}</span>
          </div>
          <div style={{ display: "flex", gap: "1.2rem", fontSize: ".72rem", textTransform: "uppercase", letterSpacing: ".08em", color: "var(--light)" }}>
            <span>{f.link_home}</span><span>{f.link_listing}</span><span>{f.link_booking}</span><span>{f.link_about}</span><span>{f.link_contact}</span>
          </div>
          <span style={prevBtn("#2C1F14")}>{f.cta_label}</span>
        </div>
      </Preview>
    </Section>
  );
}

// ================================================================
//  FOOTER EDITOR
// ================================================================
function FooterEditor({ data, onSave, saving }) {
  const [f, setF] = useState({
    ...DEFAULT_CONTENT.footer,
    ...data,
    columns: [...(data?.columns || DEFAULT_CONTENT.footer.columns)],
  });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const setColTitle = (i, v) =>
    setF((p) => ({ ...p, columns: p.columns.map((c, idx) => (idx === i ? { ...c, title: v } : c)) }));
  const setColLink = (i, li, v) =>
    setF((p) => ({
      ...p,
      columns: p.columns.map((c, idx) =>
        idx === i ? { ...c, links: c.links.map((l, lidx) => (lidx === li ? v : l)) } : c
      ),
    }));
  const addLink = (i) =>
    setF((p) => ({ ...p, columns: p.columns.map((c, idx) => (idx === i ? { ...c, links: [...c.links, "Link Baru"] } : c)) }));
  const delLink = (i, li) =>
    setF((p) => ({
      ...p,
      columns: p.columns.map((c, idx) => (idx === i ? { ...c, links: c.links.filter((_, lidx) => lidx !== li) } : c)),
    }));

  return (
    <Section title="📋 Footer" onSave={() => onSave(f)} saving={saving}>
      <Grid>
        <Field label="Logo — bagian utama" value={f.logo_main} onChange={(v) => set("logo_main", v)} />
        <Field label="Logo — bagian aksen" value={f.logo_accent} onChange={(v) => set("logo_accent", v)} />
      </Grid>
      <Field label="Deskripsi singkat perusahaan" value={f.description} onChange={(v) => set("description", v)} isTextarea />

      {f.columns.map((col, i) => (
        <div key={i} style={{ marginTop: "1.2rem", padding: "1.2rem", background: "var(--sand)", borderLeft: "3px solid var(--clay)" }}>
          <Field label={`Judul Kolom ${i + 1}`} value={col.title} onChange={(v) => setColTitle(i, v)} />
          <div style={{ display: "flex", flexDirection: "column", gap: ".5rem", marginTop: ".8rem" }}>
            {col.links.map((l, li) => (
              <div key={li} style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
                <input value={l} onChange={(e) => setColLink(i, li, e.target.value)} style={{ ...inp, flex: 1 }} />
                <button onClick={() => delLink(i, li)} style={btnDel}>✕</button>
              </div>
            ))}
          </div>
          <button onClick={() => addLink(i)} style={{ ...btnAdd, marginTop: ".6rem" }}>+ Tambah Link</button>
        </div>
      ))}

      <div style={{ marginTop: "1.2rem" }}>
        <Grid>
          <Field label="Teks copyright" value={f.copyright} onChange={(v) => set("copyright", v)} />
          <Field label="Tagline kanan bawah" value={f.tagline} onChange={(v) => set("tagline", v)} />
        </Grid>
      </div>
    </Section>
  );
}

// ================================================================
//  LISTING PAGE EDITOR
// ================================================================
function ListingEditor({ data, onSave, saving }) {
  const [f, setF] = useState({ ...DEFAULT_CONTENT.listing, ...data });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  return (
    <Section title="🏘 Halaman Daftar Properti" onSave={() => onSave(f)} saving={saving}>
      <Grid>
        <Field label="Label kecil (Tag)" value={f.tag} onChange={(v) => set("tag", v)} />
        <Field label="Judul halaman" value={f.title} onChange={(v) => set("title", v)} />
        <Field label="Placeholder kolom cari" value={f.search_placeholder} onChange={(v) => set("search_placeholder", v)} />
        <Field label="Judul saat hasil kosong" value={f.empty_title} onChange={(v) => set("empty_title", v)} />
        <Field label="Subjudul saat hasil kosong" value={f.empty_subtitle} onChange={(v) => set("empty_subtitle", v)} />
      </Grid>
    </Section>
  );
}

// ================================================================
//  DETAIL PAGE EDITOR
// ================================================================
function DetailEditor({ data, onSave, saving }) {
  const [f, setF] = useState({ ...DEFAULT_CONTENT.detail, ...data });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  return (
    <Section title="📄 Halaman Detail Properti" onSave={() => onSave(f)} saving={saving}>
      <Grid>
        <Field label="Breadcrumb: Beranda" value={f.breadcrumb_home} onChange={(v) => set("breadcrumb_home", v)} />
        <Field label="Breadcrumb: Properti" value={f.breadcrumb_listing} onChange={(v) => set("breadcrumb_listing", v)} />
        <Field label="Tombol: Hubungi Agen" value={f.cta_hubungi} onChange={(v) => set("cta_hubungi", v)} />
        <Field label="Tombol: Simulasi KPR" value={f.cta_kpr} onChange={(v) => set("cta_kpr", v)} />
        <Field label="Tombol: Booking Sekarang" value={f.cta_booking} onChange={(v) => set("cta_booking", v)} />
        <Field label="Tombol: Hubungi via WhatsApp" value={f.cta_whatsapp} onChange={(v) => set("cta_whatsapp", v)} />
        <Field label="Nomor WhatsApp agen (62xxx)" value={f.agent_whatsapp} onChange={(v) => set("agent_whatsapp", v)} />
        <Field label="Nama Agen" value={f.agent_name} onChange={(v) => set("agent_name", v)} />
        <Field label="Jabatan Agen" value={f.agent_title} onChange={(v) => set("agent_title", v)} />
        <Field label="Rating Agen" value={f.agent_rating} onChange={(v) => set("agent_rating", v)} />
        <Field label="Label Estimasi KPR" value={f.kpr_teaser_label} onChange={(v) => set("kpr_teaser_label", v)} />
        <Field label="Catatan Estimasi KPR" value={f.kpr_teaser_note} onChange={(v) => set("kpr_teaser_note", v)} />
      </Grid>
      <Preview>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--earth)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "var(--serif)" }}>
            {f.agent_name?.[0] || "A"}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: ".9rem", color: "var(--espresso)" }}>{f.agent_name}</div>
            <div style={{ fontSize: ".74rem", color: "var(--light)" }}>{f.agent_title}</div>
            <div style={{ fontSize: ".7rem", color: "var(--accent)" }}>{f.agent_rating}</div>
          </div>
        </div>
      </Preview>
    </Section>
  );
}

// ================================================================
//  CONTACT PAGE EDITOR
// ================================================================
function ContactEditor({ data, onSave, saving }) {
  const [f, setF] = useState({ ...DEFAULT_CONTENT.contact, ...data });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  return (
    <Section title="✉️ Halaman Kontak" onSave={() => onSave(f)} saving={saving}>
      <Grid>
        <Field label="Label kecil (Tag)" value={f.tag} onChange={(v) => set("tag", v)} />
        <Field label="Judul halaman" value={f.title} onChange={(v) => set("title", v)} />
        <Field label="Subjudul" value={f.subtitle} onChange={(v) => set("subtitle", v)} isTextarea />
        <Field label="Alamat (boleh multi-baris)" value={f.alamat} onChange={(v) => set("alamat", v)} isTextarea />
        <Field label="Telepon" value={f.telepon} onChange={(v) => set("telepon", v)} />
        <Field label="Email" value={f.email} onChange={(v) => set("email", v)} />
        <Field label="Jam Operasional" value={f.jam_operasional} onChange={(v) => set("jam_operasional", v)} />
        <Field label="Label kartu respon" value={f.respon_label} onChange={(v) => set("respon_label", v)} />
        <Field label="Nilai kartu respon" value={f.respon_value} onChange={(v) => set("respon_value", v)} />
        <Field label="Deskripsi kartu respon" value={f.respon_desc} onChange={(v) => set("respon_desc", v)} />
        <Field label="Judul setelah pesan terkirim" value={f.success_title} onChange={(v) => set("success_title", v)} />
        <Field label="Deskripsi setelah pesan terkirim" value={f.success_desc} onChange={(v) => set("success_desc", v)} isTextarea />
      </Grid>
    </Section>
  );
}

// ================================================================
//  SHARED SUB-COMPONENTS
// ================================================================
function Section({ title, children, onSave, saving }) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          paddingBottom: "1rem",
          borderBottom: "1px solid var(--mist)",
        }}
      >
        <h3
          style={{
            fontFamily: "var(--serif)",
            fontSize: "1.25rem",
            fontWeight: 400,
            color: "var(--espresso)",
          }}
        >
          {title}
        </h3>
        <button
          onClick={onSave}
          disabled={saving}
          style={{
            padding: ".7rem 2rem",
            background: saving ? "var(--clay)" : "var(--espresso)",
            border: "none",
            color: "var(--sand)",
            fontFamily: "var(--sans)",
            fontSize: ".78rem",
            fontWeight: 500,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            cursor: saving ? "not-allowed" : "pointer",
            transition: "background .2s",
          }}
        >
          {saving ? "⏳ Menyimpan…" : "💾 Simpan"}
        </button>
      </div>
      {children}
    </div>
  );
}

function Grid({ children }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "1rem",
        marginBottom: "1rem",
      }}
    >
      {children}
    </div>
  );
}

function Field({ label, value, onChange, isTextarea }) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: ".63rem",
          letterSpacing: ".1em",
          textTransform: "uppercase",
          color: "var(--earth)",
          marginBottom: ".4rem",
          fontWeight: 500,
        }}
      >
        {label}
      </label>
      {isTextarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          style={{ ...inp, resize: "vertical" }}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={inp}
        />
      )}
    </div>
  );
}

function Preview({ children, dark }) {
  return (
    <div
      style={{
        marginTop: "1.5rem",
        padding: "1.5rem",
        background: dark ? "var(--espresso)" : "var(--sand)",
        border: "1px dashed var(--clay)",
      }}
    >
      <div
        style={{
          fontSize: ".6rem",
          letterSpacing: ".12em",
          textTransform: "uppercase",
          color: "var(--clay)",
          marginBottom: ".7rem",
        }}
      >
        Preview
      </div>
      {children}
    </div>
  );
}

// ── Style atoms
const inp = {
  width: "100%",
  padding: ".65rem .9rem",
  border: "1px solid var(--mist)",
  background: "#fff",
  color: "var(--text)",
  fontFamily: "var(--sans)",
  fontSize: ".88rem",
};
const btnAdd = {
  padding: ".6rem 1.4rem",
  background: "transparent",
  border: "1px dashed var(--clay)",
  color: "var(--earth)",
  fontFamily: "var(--sans)",
  fontSize: ".78rem",
  cursor: "pointer",
  transition: "all .15s",
};
const btnDel = {
  padding: ".35rem .7rem",
  background: "rgba(160,64,64,.08)",
  border: "1px solid rgba(160,64,64,.25)",
  color: "#A04040",
  fontFamily: "var(--sans)",
  fontSize: ".72rem",
  cursor: "pointer",
};
const prevBtn = (bg, bd = "none", color = "#fff") => ({
  display: "inline-block",
  padding: ".5rem 1.2rem",
  background: bg,
  border: bd,
  color,
  fontSize: ".72rem",
  letterSpacing: ".08em",
  textTransform: "uppercase",
});
const flashOk = {
  background: "rgba(74,124,89,.1)",
  border: "1px solid rgba(74,124,89,.3)",
  color: "var(--green)",
  padding: ".8rem 1.2rem",
  marginBottom: "1rem",
  fontSize: ".85rem",
};
const flashErr = {
  background: "rgba(160,64,64,.1)",
  border: "1px solid rgba(160,64,64,.3)",
  color: "#A04040",
  padding: ".8rem 1.2rem",
  marginBottom: "1rem",
  fontSize: ".85rem",
};
