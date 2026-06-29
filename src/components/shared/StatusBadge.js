import React from "react";
import { statusLabel } from "../../utils/helpers";

export default function StatusBadge({ status }) {
  const st = statusLabel(status);
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 12px",
        borderRadius: "20px",
        fontSize: "13px",
        fontWeight: 600,
        background: st.bg,
        color: st.color,
      }}
    >
      {st.label}
    </span>
  );
}
