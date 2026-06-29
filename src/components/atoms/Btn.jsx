import { useState } from "react";

/**
 * Tombol serbaguna dengan beberapa varian tampilan.
 * @param {"primary"|"ghost"|"accent"|"kpr"|"light"|"outline_light"} variant
 */
const Btn = ({
  children,
  variant = "primary",
  onClick,
  style = {},
  full = false,
  disabled = false,
}) => {
  const [h, setH] = useState(false);

  const v =
    {
      primary: {
        bg: h && !disabled ? "var(--accent)" : "var(--espresso)",
        fg: "var(--sand)",
      },
      ghost: {
        bg: h && !disabled ? "var(--mist)" : "transparent",
        fg: "var(--earth)",
        bd: "1.5px solid var(--clay)",
      },
      accent: {
        bg: h && !disabled ? "var(--earth)" : "var(--accent)",
        fg: "var(--white)",
      },
      kpr: { bg: h && !disabled ? "#3d6b4a" : "var(--green)", fg: "#fff" },
      light: {
        bg: h && !disabled ? "var(--accent)" : "var(--sand)",
        fg: h ? "#fff" : "var(--espresso)",
      },
      outline_light: {
        bg: "transparent",
        fg: "var(--sand)",
        bd: h ? "1.5px solid var(--clay)" : "1.5px solid rgba(245,240,232,.3)",
      },
    }[variant] || {};

  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      disabled={disabled}
      style={{
        fontFamily: "var(--sans)",
        fontSize: ".82rem",
        fontWeight: 500,
        letterSpacing: ".07em",
        textTransform: "uppercase",
        background: v.bg,
        color: v.fg,
        border: v.bd || "none",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        padding: ".85rem 2rem",
        transition: "all .22s",
        transform: h && !disabled ? "translateY(-1px)" : "none",
        width: full ? "100%" : "auto",
        ...style,
      }}
    >
      {children}
    </button>
  );
};

export default Btn;
