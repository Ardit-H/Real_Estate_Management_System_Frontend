import { useEffect } from "react";
import { C, PRI_CFG, STA_CFG } from "./maintenanceHelpers";

export function Toast({ msg, type = "success", onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div style={{
      position: "fixed", bottom: 26, right: 26, zIndex: 9999,
      background: C.dark, color: type === "error" ? "#f09090" : "#90c8a8",
      padding: "11px 18px", borderRadius: 12, fontSize: 13,
      boxShadow: "0 10px 36px rgba(0,0,0,.32)",
      border: `1px solid ${type === "error" ? "rgba(240,128,128,.15)" : "rgba(144,200,168,.15)"}`,
      fontFamily: "'DM Sans',sans-serif", animation: "ad-toast .2s ease",
      display: "flex", alignItems: "center", gap: 8,
    }}>
      {type === "error" ? "⚠️" : "✅"} {msg}
    </div>
  );
}

export function Loader() {
  return (
    <div style={{ textAlign: "center", padding: "52px 0" }}>
      <div style={{
        width: 28, height: 28, margin: "0 auto",
        border: "2.5px solid #e8e2d6",
        borderTop: `2.5px solid ${C.gold}`,
        borderRadius: "50%", animation: "ad-spin .7s linear infinite",
      }} />
    </div>
  );
}

export function Empty({ icon, text }) {
  return (
    <div style={{ textAlign: "center", padding: "52px 20px", color: C.textMut }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>{icon}</div>
      <p style={{ fontSize: 13.5, margin: 0 }}>{text}</p>
    </div>
  );
}

export function PBadge({ p }) {
  const c = PRI_CFG[p] || PRI_CFG.MEDIUM;
  return (
    <span style={{
      background: c.bg, color: c.color,
      padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
      display: "inline-flex", alignItems: "center", gap: 4,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.dot, display: "inline-block" }} />
      {c.label}
    </span>
  );
}

export function SBadge({ s }) {
  const c = STA_CFG[s] || STA_CFG.OPEN;
  return (
    <span style={{
      background: c.bg, color: c.color,
      padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
    }}>
      {c.label}
    </span>
  );
}

export function Pager({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end", padding: "14px 18px" }}>
      <button className="ad-btn" disabled={page === 0} onClick={() => onChange(page - 1)} style={{ padding: "6px 14px", borderRadius: 9, border: "1.5px solid #e4ddd0", background: "transparent", color: C.textSub, fontSize: 13, opacity: page === 0 ? .4 : 1 }}>Prev</button>
      <span style={{ fontSize: 12.5, color: C.muted, padding: "0 8px" }}>{page + 1}/{totalPages}</span>
      <button className="ad-btn" disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)} style={{ padding: "6px 14px", borderRadius: 9, border: "1.5px solid #e4ddd0", background: "transparent", color: C.textSub, fontSize: 13, opacity: page >= totalPages - 1 ? .4 : 1 }}>Next</button>
    </div>
  );
}

export function Field({ label, required, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 10.5, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 6 }}>
        {label}{required && <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

export function Row2({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>{children}</div>;
}

export function Modal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const h = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(8,6,4,.72)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        width: "100%", maxWidth: wide ? 720 : 540,
        background: C.surface, borderRadius: 16,
        boxShadow: "0 32px 80px rgba(0,0,0,.35)",
        maxHeight: "90vh", overflowY: "auto",
        animation: "ad-scale-in .22s ease",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 24px", borderBottom: `1px solid ${C.border}`, background: "#fdf9f4",
        }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.text, fontFamily: "'Cormorant Garamond',Georgia,serif" }}>{title}</p>
          <button onClick={onClose} style={{ width: 30, height: 30, border: "none", background: "none", color: C.muted, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={{ padding: "22px 24px" }}>{children}</div>
      </div>
    </div>
  );
}