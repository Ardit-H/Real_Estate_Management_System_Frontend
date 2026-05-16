// src/components/admin/rentals/RentalsStatCards.jsx

export default function RentalsStatCards({ total, rows }) {
  const activeCount  = rows.filter(r => r.status === "ACTIVE").length;
  const rentedCount  = rows.filter(r => r.status === "RENTED").length;
  const expiredCount = rows.filter(r => r.status === "EXPIRED").length;

  const cards = [
    { label: "Total",   val: total,        color: "#c9b87a" },
    { label: "Active",  val: activeCount,  color: "#1D9E75" },
    { label: "Rented",  val: rentedCount,  color: "#378ADD" },
    { label: "Expired", val: expiredCount, color: "#D85A30" },
  ];

  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
      {cards.map(s => (
        <div key={s.label} style={{ background: "#fff", borderRadius: 12, border: "1px solid rgba(138,125,94,0.15)", padding: "14px 18px", flex: "1 1 100px", minWidth: 90, boxShadow: "0 2px 12px rgba(20,16,10,0.05)" }}>
          <p style={{ fontSize: 10, color: "#b0a890", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 4px", fontFamily: "'DM Sans', sans-serif" }}>{s.label}</p>
          <p style={{ fontSize: 26, fontWeight: 700, color: s.color, margin: 0, letterSpacing: "-0.04em", fontFamily: "'Cormorant Garamond', serif" }}>{s.val}</p>
        </div>
      ))}
    </div>
  );
}