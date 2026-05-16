// src/components/admin/rentals/RentalsBadge.jsx

const BADGE_CFG = {
  ACTIVE:   { bg: "rgba(29,158,117,0.12)",  color: "#1D9E75",  border: "rgba(29,158,117,0.25)"  },
  INACTIVE: { bg: "rgba(136,135,128,0.12)", color: "#888780",  border: "rgba(136,135,128,0.25)" },
  EXPIRED:  { bg: "rgba(201,184,122,0.15)", color: "#c9b87a",  border: "rgba(201,184,122,0.3)"  },
  RENTED:   { bg: "rgba(55,138,221,0.12)",  color: "#378ADD",  border: "rgba(55,138,221,0.25)"  },
};

export default function RentalsBadge({ label }) {
  const s = BADGE_CFG[label] || { bg: "rgba(136,135,128,0.12)", color: "#888780", border: "rgba(136,135,128,0.25)" };
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      fontSize: 10.5, fontWeight: 600, letterSpacing: "0.4px",
      padding: "3px 10px", borderRadius: 999,
      whiteSpace: "nowrap", display: "inline-block",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {label ?? "—"}
    </span>
  );
}