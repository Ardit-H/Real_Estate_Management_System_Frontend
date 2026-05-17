import { useEffect } from "react";
import { C, STATUS_STYLE } from "./leadsConstants.js";
 
export function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position: "fixed", bottom: 26, right: 26, zIndex: 9999,
      background: C.dark, color: type === "error" ? "#f09090" : "#90c8a8",
      padding: "11px 18px", borderRadius: 12, fontSize: 13,
      boxShadow: "0 10px 36px rgba(0,0,0,.32)",
      border: `1px solid ${type === "error" ? "rgba(240,128,128,.15)" : "rgba(144,200,168,.15)"}`,
      fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 8,
    }}>
      {type === "error" ? "⚠️" : "✅"} {msg}
    </div>
  );
}
 
export function Loader() {
  return (
    <div style={{ textAlign: "center", padding: "52px 0" }}>
      <div style={{ width: 28, height: 28, margin: "0 auto", border: `2.5px solid ${C.border}`, borderTop: `2.5px solid ${C.gold}`, borderRadius: "50%", animation: "al-spin .7s linear infinite" }} />
    </div>
  );
}
 
export function EmptyState({ icon, text }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: C.textMut }}>
      <div style={{ fontSize: 44, marginBottom: 12 }}>{icon}</div>
      <p style={{ fontSize: 16, fontWeight: 700, color: C.textSub, margin: 0, fontFamily: "'Cormorant Garamond',Georgia,serif" }}>{text}</p>
    </div>
  );
}
 
export function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || { bg: "#f0ece3", color: C.textSub, label: status };
  return (
    <span style={{ background: s.bg, color: s.color, padding: "2px 9px", borderRadius: 20, fontSize: 10, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, display: "inline-block" }} />
      {s.label}
    </span>
  );
}
 
export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end", padding: "14px 18px" }}>
      <button className="al-btn" disabled={page === 0} onClick={() => onChange(page - 1)}
        style={{ padding: "6px 14px", borderRadius: 9, border: `1.5px solid ${C.border}`, background: "transparent", color: C.textSub, fontSize: 13, opacity: page === 0 ? .4 : 1 }}>
        Prev
      </button>
      <span style={{ fontSize: 12.5, color: C.muted, padding: "0 8px" }}>{page + 1} / {totalPages}</span>
      <button className="al-btn" disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)}
        style={{ padding: "6px 14px", borderRadius: 9, border: `1.5px solid ${C.border}`, background: "transparent", color: C.textSub, fontSize: 13, opacity: page >= totalPages - 1 ? .4 : 1 }}>
        Next
      </button>
    </div>
  );
}
 
export function Field({ label, children, required }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.textMut, textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 6 }}>
        {label}{required && <span style={{ color: "#dc2626", marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  );
}
 
export function Modal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
 
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(26,23,20,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="al-modal-inner" style={{ width: "100%", maxWidth: wide ? 660 : 500, background: C.surface, borderRadius: 16, border: `1.5px solid ${C.border}`, boxShadow: "0 24px 64px rgba(26,23,20,.22)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 22px", borderBottom: `1px solid ${C.border}`, background: "#fdf9f4" }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: C.text, fontFamily: "'Cormorant Garamond',Georgia,serif" }}>{title}</span>
          <button onClick={onClose} className="al-btn" style={{ width: 28, height: 28, borderRadius: 7, background: "#f0ece3", border: `1px solid ${C.border}`, color: C.muted, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={{ padding: "20px 22px" }}>{children}</div>
      </div>
    </div>
  );
}
 