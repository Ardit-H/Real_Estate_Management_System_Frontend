import { useEffect } from "react";
import { C } from "./profileConstants.js";
 
export function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position: "fixed", bottom: 26, right: 26, zIndex: 9999,
      background: C.dark, color: type === "error" ? "#f09090" : "#90c8a8",
      padding: "11px 18px", borderRadius: 12, fontSize: 13,
      boxShadow: "0 10px 36px rgba(0,0,0,.32)",
      border: `1px solid ${type === "error" ? "rgba(240,128,128,.15)" : "rgba(144,200,168,.15)"}`,
      fontFamily: "'DM Sans',sans-serif", animation: "ap-toast .2s ease",
      display: "flex", alignItems: "center", gap: 8,
    }}>
      {type === "error" ? "⚠️" : "✅"} {msg}
    </div>
  );
}
 
export function Loader() {
  return (
    <div style={{ textAlign: "center", padding: "52px 0" }}>
      <div style={{ width: 28, height: 28, margin: "0 auto", border: "2.5px solid #e8e2d6", borderTop: `2.5px solid ${C.gold}`, borderRadius: "50%", animation: "ap-spin .7s linear infinite" }} />
    </div>
  );
}
 
export function Field({ label, children, hint }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: C.textSub, textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 6 }}>{label}</label>
      {children}
      {hint && <p style={{ fontSize: 11.5, color: C.textMut, marginTop: 5, marginBottom: 0 }}>{hint}</p>}
    </div>
  );
}
 
export function Avatar({ name, size = 80 }) {
  const initials = name
    ? name.trim().split(" ").slice(0, 2).map(w => w[0]?.toUpperCase()).join("")
    : "AD";
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg, ${C.gold}, ${C.goldL})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: C.dark, fontSize: size * 0.32, fontWeight: 700,
      border: `3px solid ${C.border}`, flexShrink: 0,
      fontFamily: "'Cormorant Garamond',Georgia,serif",
    }}>{initials}</div>
  );
}
 
export function InfoBadge({ label, value, color, bg }) {
  return (
    <div style={{ background: bg || "#f0ece3", borderRadius: 11, padding: "12px 14px", border: `1.5px solid ${(color || C.textSub)}22` }}>
      <p style={{ fontSize: 10, color: C.textMut, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 5 }}>{label}</p>
      <p style={{ fontSize: 14.5, fontWeight: 700, color: color || C.textSub, margin: 0, fontFamily: "'Cormorant Garamond',Georgia,serif" }}>
        {value || "—"}
      </p>
    </div>
  );
}
 