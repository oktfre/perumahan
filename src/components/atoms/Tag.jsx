/**
 * Label dekoratif dengan garis kecil di sisi kiri.
 * @param {boolean} light - Gunakan warna terang (untuk latar gelap)
 */
const Tag = ({ label, light = false }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: ".5rem",
      fontSize: ".7rem",
      letterSpacing: ".14em",
      textTransform: "uppercase",
      color: light ? "rgba(200,180,154,.8)" : "var(--accent)",
      marginBottom: ".8rem",
    }}
  >
    <span
      style={{
        width: 20,
        height: 1,
        background: light ? "rgba(200,180,154,.6)" : "var(--accent)",
        display: "block",
      }}
    />
    {label}
  </div>
);

export default Tag;
