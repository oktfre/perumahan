import { useState } from "react";
import { useCms } from "../context/CmsContext";

function FootLink({ label }) {
  const [h, setH] = useState(false);
  return (
    <li>
      <button
        type="button"
        onMouseEnter={() => setH(true)}
        onMouseLeave={() => setH(false)}
        style={{
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          fontFamily: "var(--sans)",
          fontSize: ".82rem",
          color: h ? "var(--sand)" : "var(--clay)",
          transition: "color .2s",
        }}
      >
        {label}
      </button>
    </li>
  );
}

function Footer({ setPage }) {
  const { content } = useCms();
  const foot = content.footer;
  return (
    <footer
      style={{
        background: "var(--espresso)",
        padding: "4rem 5rem 2rem",
        borderTop: "1px solid rgba(200,180,154,.12)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr",
          gap: "4rem",
          marginBottom: "3rem",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--serif)",
              fontSize: "1.5rem",
              color: "var(--sand)",
              letterSpacing: ".08em",
              marginBottom: "1rem",
            }}
          >
            {foot.logo_main}<span style={{ color: "var(--accent)" }}>{foot.logo_accent}</span>
          </div>
          <div
            style={{
              fontSize: ".82rem",
              color: "var(--clay)",
              lineHeight: 1.75,
              maxWidth: 280,
            }}
          >
            {foot.description}
          </div>
        </div>

        {foot.columns.map((col) => (
          <div key={col.title}>
            <div
              style={{
                fontSize: ".7rem",
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "var(--accent)",
                marginBottom: "1.2rem",
              }}
            >
              {col.title}
            </div>
            <ul
              style={{
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: ".65rem",
              }}
            >
              {col.links.map((l) => (
                <FootLink key={l} label={l} />
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: "2rem",
          borderTop: "1px solid rgba(200,180,154,.12)",
          fontSize: ".74rem",
          color: "var(--earth)",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <span>{foot.copyright}</span>
        <span>{foot.tagline}</span>
      </div>
    </footer>
  );
}

export default Footer;
