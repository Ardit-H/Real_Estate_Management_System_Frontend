// src/components/admin/rentalApplications/RentalAppStatCards.jsx

import { APP_STATUSES, STATUS_COLORS } from "./rentalAppHelpers";

export default function RentalAppStatCards({ apps }) {
  if (!apps.length) return null;

  const counts = APP_STATUSES.reduce((acc, s) => ({
    ...acc, [s]: apps.filter(a => a.status === s).length,
  }), {});

  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
      {APP_STATUSES.map(s => (
        <div key={s} style={{ background: "#fff", borderRadius: 12, border: "1px solid rgba(138,125,94,0.15)", padding: "14px 18px", flex: "1 1 100px", minWidth: 90, boxShadow: "0 2px 12px rgba(20,16,10,0.05)" }}>
          <p style={{ fontSize: 10, color: "#b0a890", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 4px", fontFamily: "'DM Sans', sans-serif" }}>{s}</p>
          <p style={{ fontSize: 26, fontWeight: 700, color: STATUS_COLORS[s], margin: 0, letterSpacing: "-0.04em", fontFamily: "'Cormorant Garamond', serif" }}>{counts[s]}</p>
        </div>
      ))}
    </div>
  );
}