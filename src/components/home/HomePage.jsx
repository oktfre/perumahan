import { useState, useEffect } from "react";
import { api } from "../../utils/api";
import { useReveal } from "../../hooks/useReveal";
import { useCms } from "../../context/CmsContext";
import Btn from "../atoms/Btn";
import Tag from "../atoms/Tag";
import Footer from "../Footer";
import HomeCard from "./HomeCard";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=85";

function HomePage({ setPage, setSelectedProp }) {
  const s1 = useReveal(),
    s2 = useReveal(),
    s3 = useReveal(),
    s4 = useReveal(),
    s5 = useReveal();
  const { content } = useCms();
  const hero = content.hero || {};
  const stats = content.stats || [];
  const why = content.why || { items: [] };
  const cta = content.cta || {};
  const marq = content.marquee || [];
  const testi = content.testimonials || [];

  const [featured, setFeatured] = useState([]);
  const [others, setOthers] = useState([]);
  const [loadProp, setLoadProp] = useState(true);

  useEffect(() => {
    api
      .get("/properties/featured?limit=6")
      .then((res) => {
        const all = res.data || [];
        setFeatured(all.slice(0, 3));
        setOthers(all.slice(3, 6));
      })
      .catch(() => {})
      .finally(() => setLoadProp(false));
  }, []);

  const goDetail = (p) => {
    setSelectedProp({
      ...p,
      img: p.gambar_utama || PLACEHOLDER,
      imgs: (p.gambar || []).map((g) => g.url),
      name: p.nama_properti || `${p.perumahan} Tipe ${p.nomor_tipe}`,
      location: p.lokasi,
      price: parseFloat(p.harga_jual_juta || 0) * 1_000_000,
      beds: p.kamar_tidur,
      baths: p.kamar_mandi,
      area: parseFloat(p.luas_tanah_m2 || 0),
      luas_bangunan: p.luas_bangunan_m2 || 36,
      floor: p.jumlah_lantai,
      year: new Date().getFullYear(),
      type: p.tipe_properti || "Rumah Tapak",
      status: p.status === "tersedia" ? "Dijual" : "Habis",
      desc: p.deskripsi || "",
      facilities: Array.isArray(p.fasilitas) ? p.fasilitas : [],
      lat: p.lat,
      lng: p.lng,
      badge: p.badge,
    });
    setPage("detail");
    window.scrollTo(0, 0);
  };

  const SkeletonCard = () => (
    <div style={{ border: "1px solid var(--mist)", overflow: "hidden" }}>
      <div
        style={{
          height: 230,
          background: "var(--mist)",
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      />
      <div style={{ padding: "1.4rem" }}>
        <div
          style={{
            height: 24,
            background: "var(--mist)",
            marginBottom: ".6rem",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
        <div
          style={{
            height: 16,
            background: "var(--mist)",
            width: "60%",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
      </div>
    </div>
  );

  return (
    <div style={{ paddingTop: 80 }}>
      {/* ── HERO */}
      <section
        style={{
          minHeight: "100vh",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "5rem 3.5rem 5rem 5rem",
            background: "var(--white)",
          }}
        >
          <div style={{ animation: "fadeRight .7s ease both" }}>
            <Tag label={hero.tag || "Properti Premium Indonesia"} />
            <h1
              style={{
                fontFamily: "var(--serif)",
                fontSize: "clamp(3.2rem,5vw,5.5rem)",
                fontWeight: 300,
                lineHeight: 1.05,
                color: "var(--espresso)",
                marginBottom: "1.8rem",
              }}
            >
              {hero.title1 || "Temukan Rumah"}
              <br />
              <em style={{ fontStyle: "italic", color: "var(--accent)" }}>
                {hero.title2 || "Impian"}
              </em>
              <br />
              {hero.title3 || "Anda Bersama Kami"}
            </h1>
            <p
              style={{
                fontSize: "1rem",
                fontWeight: 300,
                lineHeight: 1.8,
                color: "var(--light)",
                maxWidth: 440,
                marginBottom: "3rem",
              }}
            >
              {hero.description}
            </p>
            <div
              style={{ display: "flex", gap: "1.2rem", marginBottom: "4rem" }}
            >
              <Btn onClick={() => setPage("listing")}>
                {hero.btn1 || "Jelajahi Properti"}
              </Btn>
              <Btn variant="ghost">{hero.btn2 || "▶ Video Tour"}</Btn>
            </div>
            <div
              style={{
                display: "flex",
                gap: "3rem",
                paddingTop: "2.5rem",
                borderTop: "1px solid var(--mist)",
              }}
            >
              {stats.map((s, i) => (
                <div key={i}>
                  <div
                    style={{
                      fontFamily: "var(--serif)",
                      fontSize: "2.4rem",
                      fontWeight: 500,
                      color: "var(--espresso)",
                      lineHeight: 1,
                    }}
                  >
                    {s.value}
                  </div>
                  <div
                    style={{
                      fontSize: ".72rem",
                      letterSpacing: ".1em",
                      textTransform: "uppercase",
                      color: "var(--light)",
                      marginTop: ".3rem",
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hero image kanan */}
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            animation: "fadeLeft .9s ease both .2s",
            opacity: 0,
            animationFillMode: "both",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(160deg,rgba(44,31,20,.04) 0%,rgba(44,31,20,.38) 100%), url('${hero.image || PLACEHOLDER}') center/cover no-repeat`,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "3rem",
              left: "-2rem",
              background: "var(--white)",
              padding: "1.5rem 2.2rem",
              boxShadow: "0 12px 48px rgba(44,31,20,.18)",
              animation: "fadeRight .8s ease both .6s",
              opacity: 0,
              animationFillMode: "both",
            }}
          >
            <div
              style={{
                fontSize: ".7rem",
                letterSpacing: ".12em",
                textTransform: "capitalize",
                color: "var(--light)",
                marginTop: ".2rem",
              }}
            >
              {hero.price_label}
            </div>

            <div
              style={{
                fontFamily: "var(--serif)",
                fontSize: "1.6rem",
                fontWeight: 500,
                color: "var(--espresso)",
              }}
            >
              {hero.price_value}
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              top: "3rem",
              right: "2rem",
              background: "var(--green)",
              padding: "1rem 1.5rem",
              boxShadow: "0 8px 32px rgba(74,124,89,.4)",
              animation: "fadeUp .8s ease both .8s",
              opacity: 0,
              animationFillMode: "both",
            }}
          >
            <div
              style={{
                fontFamily: "var(--serif)",
                fontSize: "1.1rem",
                color: "#fff",
              }}
            >
              {hero.dp_value}
            </div>
            <div
              style={{
                fontSize: ".62rem",
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,.7)",
                marginTop: ".1rem",
              }}
            >
              {hero.dp_label}
            </div>
          </div>
        </div>
      </section>

      {/* ── SEARCH BAR */}
      <div style={{ background: "var(--espresso)", padding: "2rem 5rem" }}>
        <div
          style={{ display: "flex", border: "1px solid rgba(200,180,154,.2)" }}
        >
          {[
            {
              label: "Lokasi",
              options: ["Semua Lokasi", "Bandung", "Cimahi", "Lembang"],
            },
            {
              label: "Tipe Properti",
              options: ["Semua Tipe", "Rumah Tapak", "Villa", "Townhouse"],
            },
            {
              label: "Harga",
              options: [
                "Semua Harga",
                "< Rp 200 Jt",
                "Rp 200–500 Jt",
                "Rp 500 Jt – 1 M",
                "> Rp 1 M",
              ],
            },
          ].map((f) => (
            <div
              key={f.label}
              style={{
                flex: 1,
                padding: "1.2rem 1.8rem",
                borderRight: "1px solid rgba(200,180,154,.2)",
              }}
            >
              <div
                style={{
                  fontSize: ".62rem",
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  color: "var(--clay)",
                  marginBottom: ".4rem",
                }}
              >
                {f.label}
              </div>
              <select
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--sand)",
                  fontFamily: "var(--sans)",
                  fontSize: ".9rem",
                  width: "100%",
                  cursor: "pointer",
                }}
              >
                {f.options.map((o) => (
                  <option key={o} style={{ background: "var(--espresso)" }}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          ))}
          <button
            onClick={() => setPage("listing")}
            style={{
              padding: "0 2.8rem",
              background: "var(--accent)",
              border: "none",
              color: "#fff",
              fontSize: ".82rem",
              fontWeight: 500,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "background .2s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => (e.target.style.background = "var(--earth)")}
            onMouseLeave={(e) => (e.target.style.background = "var(--accent)")}
          >
            🔍 Cari Sekarang
          </button>
        </div>
      </div>

      {/* ── MARQUEE */}
      <div
        style={{
          background: "var(--mist)",
          padding: ".9rem 0",
          overflow: "hidden",
          borderTop: "1px solid var(--clay)",
          borderBottom: "1px solid var(--clay)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "3rem",
            animation: "marquee 22s linear infinite",
            whiteSpace: "nowrap",
          }}
        >
          {[...marq, ...marq].map((t, i) => (
            <span
              key={i}
              style={{
                fontSize: ".72rem",
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "var(--earth)",
                flexShrink: 0,
              }}
            >
              ✦ {t}
            </span>
          ))}
        </div>
      </div>

      {/* ── PROPERTI UNGGULAN */}
      <section style={{ padding: "6rem 5rem", background: "var(--white)" }}>
        <div ref={s1.ref} className={`reveal${s1.vis ? " vis" : ""}`}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: "3rem",
            }}
          >
            <div>
              <Tag label="Pilihan Terbaik" />
              <h2
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "clamp(2rem,3vw,2.8rem)",
                  fontWeight: 300,
                  color: "var(--espresso)",
                }}
              >
                Properti Unggulan
              </h2>
            </div>
            <button
              onClick={() => setPage("listing")}
              style={{
                background: "none",
                border: "none",
                fontSize: ".8rem",
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: "var(--light)",
                borderBottom: "1px solid var(--clay)",
                paddingBottom: 2,
                cursor: "pointer",
              }}
            >
              Lihat Semua →
            </button>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: "2rem",
            }}
          >
            {loadProp ? (
              Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            ) : featured.length > 0 ? (
              featured.map((p, i) => (
                <HomeCard
                  key={p.id}
                  prop={p}
                  delay={i * 0.1}
                  onClick={() => goDetail(p)}
                />
              ))
            ) : (
              <div
                style={{
                  gridColumn: "1/-1",
                  textAlign: "center",
                  color: "var(--light)",
                  padding: "4rem",
                }}
              >
                Belum ada properti tersedia.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── MENGAPA HAVENEST */}
      <section style={{ background: "var(--mist)", padding: "7rem 5rem" }}>
        <div
          ref={s2.ref}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "7rem",
            alignItems: "center",
          }}
          className={`reveal${s2.vis ? " vis" : ""}`}
        >
          <div
            style={{
              position: "relative",
              paddingBottom: "2.5rem",
              paddingRight: "2.5rem",
            }}
          >
            <div
              style={{
                width: "100%",
                height: 520,
                background: `url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=85') center/cover no-repeat`,
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 210,
                height: 210,
                background: `url('https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400&q=85') center/cover no-repeat`,
                border: "6px solid var(--white)",
                boxShadow: "0 10px 40px rgba(44,31,20,.15)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "2rem",
                left: "-1.5rem",
                background: "var(--espresso)",
                padding: "1.2rem 2rem",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "1.8rem",
                  color: "var(--accent)",
                  fontWeight: 500,
                }}
              >
                850+
              </div>
              <div
                style={{
                  fontSize: ".65rem",
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  color: "var(--clay)",
                }}
              >
                Keluarga Bahagia
              </div>
            </div>
          </div>
          <div>
            <Tag label={why.tag || "Keunggulan Kami"} />
            <h2
              style={{
                fontFamily: "var(--serif)",
                fontSize: "clamp(2rem,3vw,2.8rem)",
                fontWeight: 300,
                color: "var(--espresso)",
                marginBottom: "2.5rem",
                lineHeight: 1.2,
              }}
            >
              {why.title || "Mengapa Memilih Havenest?"}
            </h2>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
            >
              {(why.items || []).map((item) => (
                <div
                  key={item.no}
                  style={{
                    display: "flex",
                    gap: "1.4rem",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--serif)",
                      fontSize: "2.2rem",
                      fontWeight: 300,
                      color: "var(--clay)",
                      lineHeight: 1,
                      minWidth: "3rem",
                    }}
                  >
                    {item.no}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: ".9rem",
                        fontWeight: 600,
                        color: "var(--espresso)",
                        marginBottom: ".4rem",
                      }}
                    >
                      {item.title}
                    </div>
                    <div
                      style={{
                        fontSize: ".83rem",
                        color: "var(--light)",
                        lineHeight: 1.7,
                      }}
                    >
                      {item.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PROPERTI LAINNYA */}
      <section style={{ padding: "6rem 5rem", background: "var(--white)" }}>
        <div ref={s3.ref} className={`reveal${s3.vis ? " vis" : ""}`}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: "3rem",
            }}
          >
            <div>
              <Tag label="Tersedia Sekarang" />
              <h2
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "clamp(2rem,3vw,2.8rem)",
                  fontWeight: 300,
                  color: "var(--espresso)",
                }}
              >
                Properti Lainnya
              </h2>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: "2rem",
            }}
          >
            {loadProp
              ? Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))
              : others.length > 0
                ? others.map((p, i) => (
                    <HomeCard
                      key={p.id}
                      prop={p}
                      delay={i * 0.1}
                      onClick={() => goDetail(p)}
                    />
                  ))
                : featured
                    .slice(0, 3)
                    .map((p, i) => (
                      <HomeCard
                        key={p.id}
                        prop={p}
                        delay={i * 0.1}
                        onClick={() => goDetail(p)}
                      />
                    ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "3rem" }}>
            <Btn
              onClick={() => setPage("listing")}
              style={{ padding: "1rem 3rem" }}
            >
              Lihat Semua Properti
            </Btn>
          </div>
        </div>
      </section>

      {/* ── TESTIMONI */}
      <section style={{ padding: "6rem 5rem", background: "var(--sand)" }}>
        <div ref={s4.ref} className={`reveal${s4.vis ? " vis" : ""}`}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <Tag label="Kata Mereka" />
            <h2
              style={{
                fontFamily: "var(--serif)",
                fontSize: "clamp(2rem,3vw,2.8rem)",
                fontWeight: 300,
                color: "var(--espresso)",
              }}
            >
              Cerita Nyata Pembeli Kami
            </h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: "2rem",
            }}
          >
            {testi.map((t) => (
              <div
                key={t.nama}
                style={{
                  padding: "2rem",
                  background: "var(--white)",
                  borderTop: "3px solid var(--accent)",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: "3rem",
                    color: "var(--clay)",
                    lineHeight: 1,
                    marginBottom: ".5rem",
                  }}
                >
                  "
                </div>
                <p
                  style={{
                    fontSize: ".88rem",
                    lineHeight: 1.75,
                    color: "var(--text)",
                    marginBottom: "1.5rem",
                  }}
                >
                  {t.teks}
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: ".9rem",
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      background: "var(--earth)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--serif)",
                      fontSize: "1.1rem",
                      color: "#fff",
                    }}
                  >
                    {t.inisial}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: ".83rem",
                        fontWeight: 600,
                        color: "var(--espresso)",
                      }}
                    >
                      {t.nama}
                    </div>
                    <div style={{ fontSize: ".72rem", color: "var(--light)" }}>
                      {t.lokasi}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER */}
      <section
        style={{ background: "var(--espresso)", padding: "5.5rem 5rem" }}
      >
        <div
          ref={s5.ref}
          className={`reveal${s5.vis ? " vis" : ""}`}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "3rem",
            flexWrap: "wrap",
          }}
        >
          <div style={{ maxWidth: 560 }}>
            <Tag label={cta.tag || "Mulai Sekarang"} light />
            <h2
              style={{
                fontFamily: "var(--serif)",
                fontSize: "clamp(2rem,3.5vw,3.2rem)",
                fontWeight: 300,
                color: "var(--sand)",
                lineHeight: 1.1,
                marginBottom: "1rem",
              }}
            >
              {cta.title || "Siap Menemukan Rumah Impian Anda?"}
            </h2>
            <p
              style={{
                fontSize: ".9rem",
                color: "var(--clay)",
                lineHeight: 1.75,
              }}
            >
              {cta.description}
            </p>
          </div>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Btn
              variant="light"
              onClick={() => setPage("contact")}
              style={{ padding: "1.1rem 2.5rem" }}
            >
              {cta.btn1 || "Konsultasi Sekarang"}
            </Btn>
            <Btn
              variant="outline_light"
              onClick={() => setPage("listing")}
              style={{ padding: "1.1rem 2.5rem" }}
            >
              {cta.btn2 || "Lihat Properti"}
            </Btn>
          </div>
        </div>
      </section>

      <Footer setPage={setPage} />
    </div>
  );
}

export default HomePage;
