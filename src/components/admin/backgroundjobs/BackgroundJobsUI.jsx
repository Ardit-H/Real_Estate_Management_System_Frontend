import { C } from "./backgroundJobsConstants.js";
 
export function Loader() {
  return (
    <div style={{ textAlign: "center", padding: "52px 0" }}>
      <div style={{ width: 28, height: 28, margin: "0 auto", border: "2.5px solid #e8e2d6", borderTop: `2.5px solid ${C.gold}`, borderRadius: "50%", animation: "bj-spin .7s linear infinite" }} />
    </div>
  );
}
 
export function StatCards({ systemData }) {
  if (!systemData) return null;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 12, marginBottom: 22 }}>
      {[
        { icon: "💳", label: "Overdue Payments",   value: systemData.overdueCount,    accent: "#dc2626" },
        { icon: "📄", label: "Expiring Contracts",  value: systemData.expiringCount,   accent: "#d97706" },
        { icon: "🎯", label: "Unassigned Leads",    value: systemData.unassignedLeads, accent: "#7c3aed" },
      ].map(s => (
        <div key={s.label} className="bj-card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: `${s.accent}18`, border: `1.5px solid ${s.accent}28`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
            {s.icon}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 9.5, fontWeight: 600, color: C.textMut, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 2 }}>{s.label}</p>
            <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.text, fontFamily: "'Cormorant Garamond',Georgia,serif", lineHeight: 1 }}>{s.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
 
export function JobCard({ job, stats }) {
  return (
    <div className="bj-job-card" style={{ borderLeft: `3px solid ${job.color}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 11, background: job.bg, border: `1.5px solid ${job.color}28`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
          {job.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "'DM Sans',sans-serif" }}>
              {job.name}
            </p>
            <span style={{ background: "#ecfdf5", color: "#059669", padding: "2px 9px", borderRadius: 20, fontSize: 10, fontWeight: 600, flexShrink: 0 }}>● Active</span>
          </div>
          <p style={{ margin: "3px 0 0", fontSize: 12, color: C.textMut }}>🕐 {job.schedule}</p>
        </div>
      </div>
      <p style={{ fontSize: 13, color: C.textSub, margin: "0 0 12px", lineHeight: 1.6 }}>{job.description}</p>
      {stats && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {Object.entries(stats).map(([k, v]) => (
            <div key={k} style={{ background: "#f0ece3", borderRadius: 8, padding: "5px 12px", fontSize: 12, border: `1px solid ${C.border}` }}>
              <span style={{ color: C.textMut }}>{k}: </span>
              <strong style={{ color: C.text }}>{v}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
 