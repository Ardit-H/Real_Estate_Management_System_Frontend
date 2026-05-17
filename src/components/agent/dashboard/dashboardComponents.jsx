import { useEffect } from "react";
import { C } from "./dashboardConstants";

// Status Pill Component
export function StatusPill({ label, config }) {
  const s = config || { color: "#64748b", bg: "#f1f5f9" };
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: "3px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 600, letterSpacing: "0.3px", whiteSpace: "nowrap",
    }}>{label}</span>
  );
}

// Stat Card Component
export function StatCard({ icon, label, value, accent = C.gold, sub, onClick }) {
  return (
    <div className="ad-stat ad-card ad-btn" onClick={onClick}
      style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 14, cursor: onClick ? "pointer" : "default" }}>
      <div style={{
        width: 46, height: 46, borderRadius: 12, flexShrink: 0,
        background: `${accent}18`, border: `1.5px solid ${accent}28`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 10, fontWeight: 600, color: C.textMut, textTransform: "uppercase", letterSpacing: "0.9px", marginBottom: 3 }}>{label}</p>
        <p style={{ margin: 0, fontSize: 26, fontWeight: 700, color: C.text, fontFamily: "'Cormorant Garamond',Georgia,serif", letterSpacing: "-0.5px", lineHeight: 1 }}>{value ?? "—"}</p>
        {sub && <p style={{ margin: "4px 0 0", fontSize: 11, color: C.muted }}>{sub}</p>}
      </div>
    </div>
  );
}

// Section Header Component
export function SectionHeader({ title, count, action, onAction }) {
  return (
    <div style={{
      padding: "14px 20px", borderBottom: `1px solid ${C.border}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: "#fdf9f4",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text, fontFamily: "'Cormorant Garamond',Georgia,serif" }}>{title}</p>
        {count != null && (
          <span style={{ background: `${C.gold}22`, color: C.textSub, padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{count}</span>
        )}
      </div>
      {action && (
        <button className="ad-btn" onClick={onAction}
          style={{ padding: "6px 14px", borderRadius: 9, background: C.dark, color: "#f5f0e8", fontSize: 11.5, fontWeight: 500 }}>
          {action}
        </button>
      )}
    </div>
  );
}

// Empty Row Component
export function EmptyRow({ icon, text }) {
  return (
    <div style={{ padding: "36px 20px", textAlign: "center", color: C.textMut }}>
      <div style={{ fontSize: 30, marginBottom: 8 }}>{icon}</div>
      <p style={{ fontSize: 13, margin: 0 }}>{text}</p>
    </div>
  );
}

// Skeleton Component
export function Skeleton({ rows = 3, h = 44 }) {
  return (
    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="ad-skeleton" style={{ height: h, opacity: 1 - i * 0.15 }} />
      ))}
    </div>
  );
}

// Toast Component
export function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position: "fixed", bottom: 26, right: 26, zIndex: 9999,
      background: C.dark, color: type === "error" ? "#f09090" : "#90c8a8",
      padding: "11px 18px", borderRadius: 12, fontSize: 13,
      boxShadow: "0 10px 36px rgba(0,0,0,0.32)",
      border: `1px solid ${type === "error" ? "rgba(240,128,128,0.15)" : "rgba(144,200,168,0.15)"}`,
      fontFamily: "'DM Sans',sans-serif", animation: "ad-toast 0.2s ease",
      display: "flex", alignItems: "center", gap: 8,
    }}>
      {type === "error" ? "⚠️" : "✅"} {msg}
    </div>
  );
}