import { useState, useEffect, useMemo } from "react";
import { BANKS } from "../../constants/data";
import { fmtM, fmtRp, calcKPR, buildAmort } from "../../utils/helpers";

function KPRModal({ prop, onClose }) {
  const [harga, setHarga] = useState(Math.round(prop.price / 1e6));
  const [dp, setDp] = useState(20);
  const [tenor, setTenor] = useState(20);
  const [rate, setRate] = useState(10.5);
  const [tab, setTab] = useState("ringkasan");
  const [selBank, setSelBank] = useState(null);
  const [amorPg, setAmorPg] = useState(1);
  const PER_PAGE = 24;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const hargaRp = harga * 1e6;
  const dpRp = (hargaRp * dp) / 100;
  const pokok = hargaRp - dpRp;
  const cicilan = calcKPR(pokok, rate, tenor);
  const totalBayar = cicilan * tenor * 12;
  const totalBunga = totalBayar - pokok;
  const rekoGaji = cicilan * 3;
  const ratio = (cicilan / rekoGaji) * 100;

  const amort = useMemo(
    () => buildAmort(pokok, rate, tenor),
    [pokok, rate, tenor],
  );
  const amorSlice = amort.slice((amorPg - 1) * PER_PAGE, amorPg * PER_PAGE);
  const totalPg = Math.ceil(amort.length / PER_PAGE);

  const yearSumm = useMemo(
    () =>
      Array.from({ length: tenor }, (_, i) => {
        const rows = amort.slice(i * 12, (i + 1) * 12);
        return {
          year: i + 1,
          sisa: rows[rows.length - 1]?.sisa || 0,
          totalB: rows.reduce((s, r) => s + r.bunga, 0),
        };
      }),
    [amort, tenor],
  );

  const applyBank = (b) => {
    setSelBank(b.id);
    setRate(b.rate);
    if (dp < b.minDP) setDp(b.minDP);
    if (tenor > b.maxTenor) setTenor(b.maxTenor);
  };

  // ── Sub-komponen slider
  const Sld = ({
    label,
    value,
    min,
    max,
    step = 1,
    onChange,
    fmt,
    suffix = "",
  }) => {
    const pct = ((value - min) / (max - min)) * 100;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <span
            style={{
              fontSize: ".63rem",
              letterSpacing: ".1em",
              textTransform: "uppercase",
              color: "var(--clay)",
              fontWeight: 500,
            }}
          >
            {label}
          </span>
          <span
            style={{
              fontFamily: "var(--serif)",
              fontSize: "1.1rem",
              fontWeight: 500,
              color: "var(--sand)",
            }}
          >
            {fmt ? fmt(value) : value}
            {suffix}
          </span>
        </div>
        <div style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              height: 4,
              width: `${pct}%`,
              background: "var(--accent)",
              transform: "translateY(-50%)",
              borderRadius: 2,
              pointerEvents: "none",
            }}
          />
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
          />
        </div>
      </div>
    );
  };

  // ── Sub-komponen quick-button
  const QBtn = ({ label, active, onClick, disabled }) => {
    const [h, setH] = useState(false);
    return (
      <button
        onClick={!disabled ? onClick : undefined}
        onMouseEnter={() => setH(true)}
        onMouseLeave={() => setH(false)}
        style={{
          padding: ".28rem .6rem",
          background: active
            ? "var(--accent)"
            : h && !disabled
              ? "rgba(255,255,255,.1)"
              : "transparent",
          border:
            "1px solid " + (active ? "var(--accent)" : "rgba(200,180,154,.25)"),
          color: active ? "#fff" : "var(--clay)",
          fontSize: ".65rem",
          cursor: disabled ? "default" : "pointer",
          opacity: disabled ? 0.4 : 1,
          transition: "all .15s",
          fontFamily: "var(--sans)",
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <div
      className="kpr-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="kpr-sheet">
        {/* Handle */}
        <div
          style={{
            width: 44,
            height: 5,
            background: "rgba(200,180,154,.3)",
            borderRadius: 3,
            margin: "12px auto 0",
            flexShrink: 0,
            cursor: "grab",
          }}
        />

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1rem 2rem .9rem",
            borderBottom: "1px solid rgba(200,180,154,.12)",
            flexShrink: 0,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--serif)",
                fontSize: "1.4rem",
                fontWeight: 400,
                color: "var(--sand)",
              }}
            >
              Simulasi KPR
            </div>
            <div
              style={{
                fontSize: ".72rem",
                color: "var(--clay)",
                marginTop: ".1rem",
              }}
            >
              📍 {prop.name} ·{" "}
              <span style={{ color: "var(--accent)" }}>{fmtM(prop.price)}</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: ".6rem",
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  color: "var(--clay)",
                }}
              >
                Cicilan / Bulan
              </div>
              <div
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "1.7rem",
                  fontWeight: 500,
                  color: "var(--accent)",
                }}
              >
                {fmtM(cicilan)}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "1px solid rgba(200,180,154,.3)",
                background: "rgba(255,255,255,.06)",
                color: "var(--clay)",
                cursor: "pointer",
                fontSize: "1.1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all .2s",
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "300px 1fr",
            flex: 1,
            overflow: "hidden",
          }}
        >
          {/* Kolom kiri – input */}
          <div
            style={{
              borderRight: "1px solid rgba(200,180,154,.12)",
              overflowY: "auto",
              padding: "1.4rem 1.6rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
            }}
          >
            {/* Harga */}
            <div>
              <div
                style={{
                  fontSize: ".65rem",
                  fontWeight: 600,
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                  color: "var(--clay)",
                  borderBottom: "1px solid rgba(200,180,154,.15)",
                  paddingBottom: ".5rem",
                  marginBottom: ".9rem",
                }}
              >
                💰 Harga Properti
              </div>
              <Sld
                label="Harga"
                value={harga}
                min={300}
                max={10000}
                step={50}
                onChange={setHarga}
                fmt={(v) => fmtM(v * 1e6)}
              />
              <div
                style={{
                  display: "flex",
                  border: "1px solid rgba(200,180,154,.2)",
                  overflow: "hidden",
                  marginTop: ".7rem",
                }}
              >
                <button
                  onClick={() => setHarga((v) => Math.max(300, v - 50))}
                  style={{
                    padding: ".4rem .8rem",
                    background: "rgba(255,255,255,.04)",
                    border: "none",
                    color: "var(--clay)",
                    cursor: "pointer",
                    fontSize: "1rem",
                  }}
                >
                  −
                </button>
                <input
                  type="number"
                  value={harga}
                  onChange={(e) =>
                    setHarga(
                      Math.min(10000, Math.max(300, Number(e.target.value))),
                    )
                  }
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    color: "var(--sand)",
                    fontSize: ".85rem",
                    textAlign: "center",
                    padding: ".4rem",
                  }}
                />
                <button
                  onClick={() => setHarga((v) => Math.min(10000, v + 50))}
                  style={{
                    padding: ".4rem .8rem",
                    background: "rgba(255,255,255,.04)",
                    border: "none",
                    color: "var(--clay)",
                    cursor: "pointer",
                    fontSize: "1rem",
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* DP */}
            <div>
              <div
                style={{
                  fontSize: ".65rem",
                  fontWeight: 600,
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                  color: "var(--clay)",
                  borderBottom: "1px solid rgba(200,180,154,.15)",
                  paddingBottom: ".5rem",
                  marginBottom: ".9rem",
                }}
              >
                🏦 Uang Muka (DP)
              </div>
              <Sld
                label="Persen DP"
                value={dp}
                min={10}
                max={80}
                step={1}
                onChange={setDp}
                suffix="%"
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: ".5rem",
                  marginTop: ".7rem",
                }}
              >
                {[
                  ["DP", fmtM(dpRp), true],
                  ["Pinjaman", fmtM(pokok), false],
                ].map(([l, v, ac]) => (
                  <div
                    key={l}
                    style={{
                      background: "rgba(255,255,255,.05)",
                      padding: ".5rem .7rem",
                    }}
                  >
                    <div
                      style={{
                        fontSize: ".58rem",
                        letterSpacing: ".1em",
                        textTransform: "uppercase",
                        color: "var(--clay)",
                        marginBottom: ".15rem",
                      }}
                    >
                      {l}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--serif)",
                        fontSize: ".9rem",
                        color: ac ? "var(--accent)" : "var(--sand)",
                        fontWeight: 500,
                      }}
                    >
                      {v}
                    </div>
                  </div>
                ))}
              </div>
              {dp < 20 && (
                <div
                  style={{
                    marginTop: ".6rem",
                    background: "rgba(160,64,64,.12)",
                    border: "1px solid rgba(160,64,64,.25)",
                    padding: ".55rem .7rem",
                    fontSize: ".7rem",
                    color: "#ffb3b3",
                    lineHeight: 1.5,
                  }}
                >
                  ⚠ DP di bawah 20% biasanya dikenakan asuransi tambahan.
                </div>
              )}
            </div>

            {/* Tenor */}
            <div>
              <div
                style={{
                  fontSize: ".65rem",
                  fontWeight: 600,
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                  color: "var(--clay)",
                  borderBottom: "1px solid rgba(200,180,154,.15)",
                  paddingBottom: ".5rem",
                  marginBottom: ".9rem",
                }}
              >
                📅 Tenor
              </div>
              <Sld
                label="Jangka Waktu"
                value={tenor}
                min={1}
                max={30}
                step={1}
                onChange={setTenor}
                suffix=" tahun"
              />
              <div
                style={{
                  display: "flex",
                  gap: ".3rem",
                  flexWrap: "wrap",
                  marginTop: ".7rem",
                }}
              >
                {[5, 10, 15, 20, 25, 30].map((t) => (
                  <QBtn
                    key={t}
                    label={`${t}T`}
                    active={tenor === t}
                    onClick={() => setTenor(t)}
                  />
                ))}
              </div>
            </div>

            {/* Suku Bunga */}
            <div>
              <div
                style={{
                  fontSize: ".65rem",
                  fontWeight: 600,
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                  color: "var(--clay)",
                  borderBottom: "1px solid rgba(200,180,154,.15)",
                  paddingBottom: ".5rem",
                  marginBottom: ".9rem",
                }}
              >
                📈 Suku Bunga
              </div>
              <Sld
                label="Bunga/Tahun"
                value={rate}
                min={5}
                max={18}
                step={0.25}
                onChange={(v) => {
                  setRate(v);
                  setSelBank(null);
                }}
                fmt={(v) => v.toFixed(2)}
                suffix="%"
              />
            </div>

            {/* Kemampuan Bayar */}
            <div>
              <div
                style={{
                  fontSize: ".65rem",
                  fontWeight: 600,
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                  color: "var(--clay)",
                  borderBottom: "1px solid rgba(200,180,154,.15)",
                  paddingBottom: ".5rem",
                  marginBottom: ".9rem",
                }}
              >
                💡 Kemampuan Bayar
              </div>
              <div
                style={{
                  background: "rgba(255,255,255,.05)",
                  padding: ".8rem",
                  marginBottom: ".7rem",
                }}
              >
                <div
                  style={{
                    fontSize: ".6rem",
                    letterSpacing: ".1em",
                    textTransform: "uppercase",
                    color: "var(--clay)",
                    marginBottom: ".25rem",
                  }}
                >
                  Gaji Min. Disarankan
                </div>
                <div
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: "1.2rem",
                    color: "var(--sand)",
                    fontWeight: 500,
                  }}
                >
                  {fmtM(rekoGaji)}
                </div>
              </div>
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: ".65rem",
                    color: "var(--clay)",
                    marginBottom: ".3rem",
                  }}
                >
                  <span>Rasio Cicilan</span>
                  <span
                    style={{
                      color:
                        ratio <= 33
                          ? "#90EE90"
                          : ratio <= 50
                            ? "var(--clay)"
                            : "#ffb3b3",
                      fontWeight: 600,
                    }}
                  >
                    {Math.round(ratio)}%{" "}
                    {ratio <= 33
                      ? "✓ Aman"
                      : ratio <= 50
                        ? "⚠ Batas"
                        : "✗ Berat"}
                  </span>
                </div>
                <div
                  style={{
                    height: 5,
                    background: "rgba(255,255,255,.1)",
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.min(ratio, 100)}%`,
                      background:
                        ratio <= 33
                          ? "var(--green)"
                          : ratio <= 50
                            ? "var(--accent)"
                            : "var(--red)",
                      transition: "width .5s, background .5s",
                      borderRadius: 3,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Kolom kanan – hasil */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Strip total */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                borderBottom: "1px solid rgba(200,180,154,.12)",
                flexShrink: 0,
              }}
            >
              {[
                ["Cicilan/Bulan", cicilan, "var(--accent)", true],
                ["Total Bayar", totalBayar, "var(--sand)", false],
                ["Total Bunga", totalBunga, "#ff9999", false],
                ["Pokok", pokok, "#99ccff", false],
              ].map(([l, v, c, big]) => (
                <div
                  key={l}
                  style={{
                    padding: "1rem 1.4rem",
                    borderRight:
                      l !== "Pokok" ? "1px solid rgba(200,180,154,.1)" : "none",
                    background: big ? "rgba(181,132,74,.1)" : "transparent",
                  }}
                >
                  <div
                    style={{
                      fontSize: ".6rem",
                      letterSpacing: ".1em",
                      textTransform: "uppercase",
                      color: "var(--clay)",
                      marginBottom: ".3rem",
                    }}
                  >
                    {l}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--serif)",
                      fontSize: big ? "1.6rem" : "1.15rem",
                      fontWeight: 500,
                      color: c,
                      lineHeight: 1,
                    }}
                  >
                    {fmtM(v)}
                  </div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div
              style={{
                display: "flex",
                borderBottom: "1px solid rgba(200,180,154,.12)",
                background: "rgba(255,255,255,.02)",
                flexShrink: 0,
              }}
            >
              {[
                ["ringkasan", "📊 Ringkasan"],
                ["jadwal", "📋 Jadwal"],
                ["bank", "🏦 Bank"],
                ["tips", "💡 Tips"],
              ].map(([k, lbl]) => (
                <button
                  key={k}
                  onClick={() => setTab(k)}
                  style={{
                    padding: ".8rem 1.4rem",
                    background: "none",
                    border: "none",
                    borderBottom:
                      tab === k
                        ? "2px solid var(--accent)"
                        : "2px solid transparent",
                    marginBottom: -1,
                    fontFamily: "var(--sans)",
                    fontSize: ".72rem",
                    fontWeight: 500,
                    letterSpacing: ".07em",
                    color: tab === k ? "var(--accent)" : "var(--clay)",
                    cursor: "pointer",
                    transition: "color .2s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {lbl}
                </button>
              ))}
            </div>

            <div
              style={{ flex: 1, overflowY: "auto", padding: "1.5rem 2rem" }}
              key={tab}
            >
              {/* TAB: RINGKASAN */}
              {tab === "ringkasan" && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "200px 1fr",
                    gap: "2rem",
                  }}
                >
                  {/* Donut */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    <div
                      style={{
                        fontSize: ".68rem",
                        fontWeight: 600,
                        letterSpacing: ".1em",
                        textTransform: "uppercase",
                        color: "var(--clay)",
                        alignSelf: "flex-start",
                      }}
                    >
                      Komposisi
                    </div>
                    {(() => {
                      const total = pokok + totalBunga,
                        pct = pokok / total,
                        R = 64,
                        C = 2 * Math.PI * R,
                        dash = pct * C;
                      return (
                        <div
                          style={{
                            position: "relative",
                            width: 150,
                            height: 150,
                          }}
                        >
                          <svg width="150" height="150" viewBox="0 0 150 150">
                            <circle
                              cx="75"
                              cy="75"
                              r={R}
                              fill="none"
                              stroke="rgba(255,255,255,.07)"
                              strokeWidth="17"
                            />
                            <circle
                              cx="75"
                              cy="75"
                              r={R}
                              fill="none"
                              stroke="var(--clay)"
                              strokeWidth="17"
                              strokeDasharray={`${C - dash} ${dash}`}
                              strokeDashoffset={0}
                              transform="rotate(-90 75 75)"
                              style={{
                                transition: "stroke-dasharray .7s ease",
                              }}
                            />
                            <circle
                              cx="75"
                              cy="75"
                              r={R}
                              fill="none"
                              stroke="var(--accent)"
                              strokeWidth="17"
                              strokeDasharray={`${dash} ${C - dash}`}
                              strokeDashoffset={0}
                              transform="rotate(-90 75 75)"
                              style={{
                                transition: "stroke-dasharray .7s ease",
                              }}
                            />
                          </svg>
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <div
                              style={{
                                fontFamily: "var(--serif)",
                                fontSize: "1.2rem",
                                fontWeight: 500,
                                color: "var(--sand)",
                              }}
                            >
                              {Math.round(pct * 100)}%
                            </div>
                            <div
                              style={{
                                fontSize: ".55rem",
                                letterSpacing: ".1em",
                                textTransform: "uppercase",
                                color: "var(--clay)",
                              }}
                            >
                              Pokok
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: ".5rem",
                        alignSelf: "stretch",
                      }}
                    >
                      {[
                        [
                          "var(--accent)",
                          "Pokok",
                          pokok,
                          Math.round((pokok / totalBayar) * 100),
                        ],
                        [
                          "var(--clay)",
                          "Bunga",
                          totalBunga,
                          Math.round((totalBunga / totalBayar) * 100),
                        ],
                      ].map(([c, l, v, p]) => (
                        <div
                          key={l}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: ".5rem",
                          }}
                        >
                          <div
                            style={{
                              width: 9,
                              height: 9,
                              borderRadius: "50%",
                              background: c,
                              flexShrink: 0,
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: ".65rem",
                                  color: "var(--clay)",
                                }}
                              >
                                {l}
                              </span>
                              <span
                                style={{
                                  fontSize: ".65rem",
                                  color: "var(--clay)",
                                }}
                              >
                                {p}%
                              </span>
                            </div>
                            <div
                              style={{
                                fontSize: ".75rem",
                                fontFamily: "var(--serif)",
                                color: "var(--sand)",
                                fontWeight: 500,
                              }}
                            >
                              {fmtM(v)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Detail */}
                  <div>
                    <div
                      style={{
                        fontSize: ".68rem",
                        fontWeight: 600,
                        letterSpacing: ".1em",
                        textTransform: "uppercase",
                        color: "var(--clay)",
                        marginBottom: ".9rem",
                      }}
                    >
                      Rincian Lengkap
                    </div>
                    {[
                      ["Harga Properti", fmtM(hargaRp), ""],
                      ["Uang Muka (" + dp + "%)", fmtM(dpRp), ""],
                      ["Pokok Pinjaman", fmtM(pokok), ""],
                      ["Suku Bunga/Tahun", rate.toFixed(2) + "%", ""],
                      ["Tenor", tenor + " tahun", ""],
                      ["Cicilan/Bulan", fmtRp(cicilan), "accent"],
                      ["Total Bunga", fmtM(totalBunga), "red"],
                      ["Total Pembayaran", fmtM(totalBayar), "bold"],
                    ].map(([k, v, hi]) => (
                      <div
                        key={k}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: ".5rem .75rem",
                          background: hi
                            ? "rgba(181,132,74,.08)"
                            : "transparent",
                          borderBottom: "1px solid rgba(200,180,154,.08)",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{ fontSize: ".76rem", color: "var(--clay)" }}
                        >
                          {k}
                        </span>
                        <span
                          style={{
                            fontSize: ".8rem",
                            fontWeight: hi ? 600 : 400,
                            fontFamily: hi ? "var(--serif)" : "var(--sans)",
                            color:
                              hi === "accent"
                                ? "var(--accent)"
                                : hi === "red"
                                  ? "#ff9999"
                                  : hi === "bold"
                                    ? "var(--sand)"
                                    : "var(--clay)",
                          }}
                        >
                          {v}
                        </span>
                      </div>
                    ))}
                    {/* Bar sisa hutang per tahun */}
                    <div style={{ marginTop: "1.3rem" }}>
                      <div
                        style={{
                          fontSize: ".66rem",
                          fontWeight: 600,
                          letterSpacing: ".1em",
                          textTransform: "uppercase",
                          color: "var(--clay)",
                          marginBottom: ".7rem",
                        }}
                      >
                        Sisa Hutang per Tahun
                      </div>
                      {yearSumm
                        .filter(
                          (_, i) =>
                            i % Math.max(1, Math.floor(tenor / 6)) === 0 ||
                            i === tenor - 1,
                        )
                        .map((y) => {
                          const pct = (y.sisa / pokok) * 100;
                          return (
                            <div
                              key={y.year}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: ".7rem",
                                marginBottom: ".35rem",
                              }}
                            >
                              <div
                                style={{
                                  width: 38,
                                  fontSize: ".62rem",
                                  color: "var(--clay)",
                                  textAlign: "right",
                                  flexShrink: 0,
                                }}
                              >
                                Thn {y.year}
                              </div>
                              <div
                                style={{
                                  flex: 1,
                                  height: 12,
                                  background: "rgba(255,255,255,.08)",
                                  borderRadius: 2,
                                  overflow: "hidden",
                                }}
                              >
                                <div
                                  style={{
                                    height: "100%",
                                    width: `${pct}%`,
                                    background:
                                      "linear-gradient(90deg,var(--accent),var(--clay))",
                                    borderRadius: 2,
                                    transition: "width .6s ease",
                                  }}
                                />
                              </div>
                              <div
                                style={{
                                  width: 75,
                                  fontSize: ".66rem",
                                  color: "var(--sand)",
                                  fontFamily: "var(--serif)",
                                  flexShrink: 0,
                                }}
                              >
                                {fmtM(y.sisa)}
                              </div>
                              <div
                                style={{
                                  width: 30,
                                  fontSize: ".6rem",
                                  color: "var(--clay)",
                                  flexShrink: 0,
                                }}
                              >
                                {Math.round(pct)}%
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: JADWAL AMORTISASI */}
              {tab === "jadwal" && (
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "1rem",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontFamily: "var(--serif)",
                          fontSize: "1.05rem",
                          color: "var(--sand)",
                        }}
                      >
                        Jadwal Amortisasi
                      </div>
                      <div style={{ fontSize: ".7rem", color: "var(--clay)" }}>
                        {tenor * 12} cicilan · Bulan{" "}
                        {(amorPg - 1) * PER_PAGE + 1}–
                        {Math.min(amorPg * PER_PAGE, tenor * 12)}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: ".4rem",
                        alignItems: "center",
                      }}
                    >
                      <QBtn
                        label="‹"
                        active={false}
                        onClick={() => setAmorPg((p) => Math.max(1, p - 1))}
                        disabled={amorPg === 1}
                      />
                      <span
                        style={{
                          padding: ".3rem .6rem",
                          fontSize: ".7rem",
                          color: "var(--clay)",
                          background: "rgba(255,255,255,.06)",
                          border: "1px solid rgba(200,180,154,.2)",
                        }}
                      >
                        {amorPg}/{totalPg}
                      </span>
                      <QBtn
                        label="›"
                        active={false}
                        onClick={() =>
                          setAmorPg((p) => Math.min(totalPg, p + 1))
                        }
                        disabled={amorPg === totalPg}
                      />
                    </div>
                  </div>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: ".76rem",
                    }}
                  >
                    <thead>
                      <tr style={{ background: "rgba(255,255,255,.05)" }}>
                        {["Bulan", "Cicilan", "Bunga", "Pokok", "Sisa"].map(
                          (h) => (
                            <th
                              key={h}
                              style={{
                                padding: ".55rem .9rem",
                                textAlign: "right",
                                fontSize: ".6rem",
                                letterSpacing: ".08em",
                                textTransform: "uppercase",
                                color: "var(--clay)",
                                fontWeight: 600,
                              }}
                            >
                              {h}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {amorSlice.map((row, i) => {
                        const isYr = row.bulan % 12 === 0;
                        return (
                          <tr
                            key={row.bulan}
                            style={{
                              background: isYr
                                ? "rgba(181,132,74,.09)"
                                : i % 2 === 0
                                  ? "transparent"
                                  : "rgba(255,255,255,.02)",
                              borderBottom: "1px solid rgba(200,180,154,.07)",
                            }}
                          >
                            <td
                              style={{
                                padding: ".48rem .9rem",
                                color: isYr ? "var(--accent)" : "var(--clay)",
                                fontWeight: isYr ? 600 : 400,
                              }}
                            >
                              {isYr ? `📅 Thn ${row.bulan / 12}` : row.bulan}
                            </td>
                            <td
                              style={{
                                padding: ".48rem .9rem",
                                textAlign: "right",
                                fontFamily: "var(--serif)",
                                color: "var(--sand)",
                                fontWeight: 500,
                              }}
                            >
                              {fmtM(row.cicilan)}
                            </td>
                            <td
                              style={{
                                padding: ".48rem .9rem",
                                textAlign: "right",
                                color: "#ff9999",
                              }}
                            >
                              {fmtM(row.bunga)}
                            </td>
                            <td
                              style={{
                                padding: ".48rem .9rem",
                                textAlign: "right",
                                color: "#90EE90",
                              }}
                            >
                              {fmtM(row.pokok)}
                            </td>
                            <td
                              style={{
                                padding: ".48rem .9rem",
                                textAlign: "right",
                                fontFamily: "var(--serif)",
                                color: isYr ? "var(--accent)" : "var(--sand)",
                                fontWeight: isYr ? 600 : 400,
                              }}
                            >
                              {fmtM(row.sisa)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: ".4rem",
                      marginTop: "1rem",
                      flexWrap: "wrap",
                    }}
                  >
                    {Array.from({ length: totalPg }, (_, i) => i + 1).map(
                      (p) => (
                        <QBtn
                          key={p}
                          label={String(p)}
                          active={amorPg === p}
                          onClick={() => setAmorPg(p)}
                        />
                      ),
                    )}
                  </div>
                </div>
              )}

              {/* TAB: BANK */}
              {tab === "bank" && (
                <div>
                  <div style={{ marginBottom: "1.2rem" }}>
                    <div
                      style={{
                        fontFamily: "var(--serif)",
                        fontSize: "1.1rem",
                        color: "var(--sand)",
                        marginBottom: ".2rem",
                      }}
                    >
                      Perbandingan Penawaran Bank
                    </div>
                    <div style={{ fontSize: ".73rem", color: "var(--clay)" }}>
                      Klik bank untuk menerapkan suku bunga secara otomatis
                    </div>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill,minmax(240px,1fr))",
                      gap: "1rem",
                      marginBottom: "1.8rem",
                    }}
                  >
                    {BANKS.map((bank) => {
                      const c = calcKPR(
                        pokok,
                        bank.rate,
                        Math.min(tenor, bank.maxTenor),
                      );
                      const t = c * Math.min(tenor, bank.maxTenor) * 12,
                        b = t - pokok;
                      const isActive = selBank === bank.id;
                      const isCheapest =
                        bank.id ===
                        BANKS.reduce((a, b2) => (b2.rate < a.rate ? b2 : a)).id;
                      return (
                        <div
                          key={bank.id}
                          onClick={() => applyBank(bank)}
                          style={{
                            border: `2px solid ${isActive ? "var(--accent)" : "rgba(200,180,154,.18)"}`,
                            background: isActive
                              ? "rgba(181,132,74,.1)"
                              : "rgba(255,255,255,.03)",
                            padding: "1.1rem",
                            cursor: "pointer",
                            position: "relative",
                            transition: "all .22s",
                            transform: isActive ? "scale(.98)" : "scale(1)",
                          }}
                        >
                          {isCheapest && (
                            <div
                              style={{
                                position: "absolute",
                                top: -1,
                                right: "1rem",
                                background: "var(--green)",
                                color: "#fff",
                                fontSize: ".56rem",
                                letterSpacing: ".1em",
                                textTransform: "uppercase",
                                padding: ".18rem .6rem",
                              }}
                            >
                              Termurah
                            </div>
                          )}
                          {isActive && (
                            <div
                              style={{
                                position: "absolute",
                                top: -1,
                                left: "1rem",
                                background: "var(--accent)",
                                color: "#fff",
                                fontSize: ".56rem",
                                letterSpacing: ".1em",
                                textTransform: "uppercase",
                                padding: ".18rem .6rem",
                              }}
                            >
                              ✓ Dipilih
                            </div>
                          )}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: ".7rem",
                              marginBottom: ".8rem",
                            }}
                          >
                            <div
                              style={{
                                width: 34,
                                height: 34,
                                background: bank.color,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: ".95rem",
                                flexShrink: 0,
                              }}
                            >
                              {bank.logo}
                            </div>
                            <div>
                              <div
                                style={{
                                  fontWeight: 600,
                                  color: "var(--sand)",
                                  fontSize: ".82rem",
                                }}
                              >
                                {bank.name}
                              </div>
                              <div
                                style={{
                                  fontSize: ".62rem",
                                  color: "var(--clay)",
                                }}
                              >
                                {bank.note}
                              </div>
                            </div>
                          </div>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: ".35rem",
                            }}
                          >
                            {[
                              ["Bunga/Tahun", bank.rate.toFixed(2) + "%", true],
                              ["Cicilan", fmtM(c), false],
                              ["Total Bunga", fmtM(b), "red"],
                              ["Max Tenor", bank.maxTenor + "T", false],
                            ].map(([l, v, hi]) => (
                              <div
                                key={l}
                                style={{
                                  background: "rgba(255,255,255,.05)",
                                  padding: ".42rem .55rem",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: ".56rem",
                                    letterSpacing: ".08em",
                                    textTransform: "uppercase",
                                    color: "var(--clay)",
                                    marginBottom: ".12rem",
                                  }}
                                >
                                  {l}
                                </div>
                                <div
                                  style={{
                                    fontSize: ".75rem",
                                    fontWeight: 600,
                                    fontFamily: "var(--serif)",
                                    color:
                                      hi === true
                                        ? "var(--accent)"
                                        : hi === "red"
                                          ? "#ff9999"
                                          : "var(--sand)",
                                  }}
                                >
                                  {v}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Tabel perbandingan */}
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: ".75rem",
                    }}
                  >
                    <thead>
                      <tr style={{ background: "rgba(255,255,255,.05)" }}>
                        {[
                          "Bank",
                          "Bunga/Thn",
                          "Cicilan/Bln",
                          "Total Bunga",
                          "vs Termurah",
                        ].map((h) => (
                          <th
                            key={h}
                            style={{
                              padding: ".55rem .9rem",
                              textAlign: "left",
                              fontSize: ".6rem",
                              letterSpacing: ".07em",
                              textTransform: "uppercase",
                              color: "var(--clay)",
                              fontWeight: 600,
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...BANKS]
                        .sort((a, b) => a.rate - b.rate)
                        .map((bank, i) => {
                          const c = calcKPR(
                            pokok,
                            bank.rate,
                            Math.min(tenor, bank.maxTenor),
                          );
                          const t = c * Math.min(tenor, bank.maxTenor) * 12,
                            b = t - pokok;
                          const minB =
                            calcKPR(pokok, BANKS[0].rate, tenor) * tenor * 12 -
                            pokok;
                          const sel = b - minB;
                          return (
                            <tr
                              key={bank.id}
                              style={{
                                background:
                                  selBank === bank.id
                                    ? "rgba(181,132,74,.07)"
                                    : i % 2 === 0
                                      ? "transparent"
                                      : "rgba(255,255,255,.02)",
                                borderBottom: "1px solid rgba(200,180,154,.07)",
                              }}
                            >
                              <td
                                style={{
                                  padding: ".48rem .9rem",
                                  fontWeight: 500,
                                  color: "var(--sand)",
                                }}
                              >
                                {bank.logo} {bank.name}
                              </td>
                              <td
                                style={{
                                  padding: ".48rem .9rem",
                                  color:
                                    i === 0 ? "var(--green)" : "var(--clay)",
                                }}
                              >
                                {bank.rate.toFixed(2)}%
                              </td>
                              <td
                                style={{
                                  padding: ".48rem .9rem",
                                  fontFamily: "var(--serif)",
                                  color: "var(--sand)",
                                }}
                              >
                                {fmtM(c)}
                              </td>
                              <td
                                style={{
                                  padding: ".48rem .9rem",
                                  color: "#ff9999",
                                }}
                              >
                                {fmtM(b)}
                              </td>
                              <td
                                style={{
                                  padding: ".48rem .9rem",
                                  color: sel === 0 ? "var(--green)" : "#ff9999",
                                  fontWeight: 500,
                                }}
                              >
                                {sel === 0 ? "✓ Termurah" : "+" + fmtM(sel)}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB: TIPS */}
              {tab === "tips" && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                  }}
                >
                  {[
                    [
                      "🏦",
                      "Perbesar DP",
                      "var(--accent)",
                      `DP Anda ${dp}%. Menaikkan ke 30% bisa hemat ratusan juta bunga dan memperkecil cicilan bulanan secara signifikan.`,
                    ],
                    [
                      "⏰",
                      "Persingkat Tenor",
                      "#6699ff",
                      `Tenor ${tenor} tahun → bunga ${fmtM(totalBunga)}. Potong jadi ${Math.max(5, tenor - 5)} tahun untuk hemat besar meski cicilan naik.`,
                    ],
                    [
                      "💰",
                      "Cicil Ekstra",
                      "var(--green)",
                      "Cicilan ekstra kapan saja langsung mengurangi pokok, sehingga bunga bulan berikutnya menjadi lebih kecil.",
                    ],
                    [
                      "🔄",
                      "Refinancing",
                      "var(--earth)",
                      "Setelah 3–5 tahun, pertimbangkan pindah bank jika suku bunga pasar turun. Selisih 0.5% saja sangat berarti.",
                    ],
                    [
                      "📊",
                      "Rasio 30%",
                      "var(--accent)",
                      `Cicilan ideal max 30% gaji. Gaji min disarankan: ${fmtM(rekoGaji)} untuk cicilan ${fmtM(cicilan)}/bulan.`,
                    ],
                    [
                      "🛡",
                      "Dana Darurat",
                      "#ff9999",
                      "Siapkan dana darurat 6 bulan pengeluaran sebelum mengambil KPR agar cicilan aman di situasi tak terduga.",
                    ],
                    [
                      "📝",
                      "Biaya Tersembunyi",
                      "var(--clay)",
                      "Provisi 1%, asuransi jiwa & kebakaran, biaya notaris/PPAT bisa mencapai 3–5% dari nilai properti.",
                    ],
                    [
                      "🎯",
                      "Fixed vs Floating",
                      "#99ccff",
                      "Bunga fixed aman 3–5 tahun pertama, lalu beralih ke floating yang mengikuti suku bunga pasar.",
                    ],
                  ].map(([icon, title, color, desc]) => (
                    <div
                      key={title}
                      style={{
                        padding: "1.1rem",
                        border: "1px solid rgba(200,180,154,.15)",
                        borderLeft: `3px solid ${color}`,
                        background: "rgba(255,255,255,.03)",
                        transition: "transform .2s, background .2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "rgba(255,255,255,.06)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          "rgba(255,255,255,.03)";
                        e.currentTarget.style.transform = "none";
                      }}
                    >
                      <div
                        style={{ fontSize: "1.3rem", marginBottom: ".5rem" }}
                      >
                        {icon}
                      </div>
                      <div
                        style={{
                          fontSize: ".82rem",
                          fontWeight: 600,
                          color: "var(--sand)",
                          marginBottom: ".4rem",
                        }}
                      >
                        {title}
                      </div>
                      <div
                        style={{
                          fontSize: ".74rem",
                          color: "var(--clay)",
                          lineHeight: 1.65,
                        }}
                      >
                        {desc}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KPRModal;
