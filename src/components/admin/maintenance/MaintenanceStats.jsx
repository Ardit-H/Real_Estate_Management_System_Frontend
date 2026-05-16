import { C } from "./maintenanceHelpers";

export function MaintenanceStats({ counts, tab, onViewUrgent }) {
  const stats = [
    { icon: "📬", label: "Open",        value: counts.open,       accent: "#2563eb" },
    { icon: "⚙️",  label: "In Progress", value: counts.inProgress, accent: "#d97706" },
    { icon: "✅",  label: "Completed",   value: counts.completed,  accent: "#059669" },
    { icon: "🚨",  label: "Urgent",      value: counts.urgent,     accent: "#dc2626" },
  ];

  return (
    <>
      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 14, marginBottom: 24 }}>
        {stats.map(s => (
          <div key={s.label} className="ad-card" style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: `${s.accent}18`, border: `1.5px solid ${s.accent}28`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, flexShrink: 0,
            }}>
              {s.icon}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 600, color: C.textMut, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 3 }}>{s.label}</p>
              <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: C.text, fontFamily: "'Cormorant Garamond',Georgia,serif", lineHeight: 1 }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Urgent Banner */}
      {counts.urgent > 0 && tab !== "urgent" && (
        <div style={{
          background: "#fff8f0", border: "1.5px solid #f5c6a0", borderRadius: 12,
          padding: "12px 18px", marginBottom: 18,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>🚨</span>
            <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: "#7a3a1a" }}>
              {counts.urgent} urgent open request{counts.urgent !== 1 ? "s" : ""} need immediate attention
            </p>
          </div>
          <button className="ad-btn" onClick={onViewUrgent} style={{ padding: "6px 14px", borderRadius: 8, background: "#7a3a1a", color: "#fff", fontSize: 12, fontWeight: 600 }}>
            View Urgent →
          </button>
        </div>
      )}
    </>
  );
}