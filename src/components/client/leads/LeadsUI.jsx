import { useEffect } from "react";
import { LBL } from "./leadsConstants";
 
// ─── Toast ────────────────────────────────────────────────────────────────────
export function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position: "fixed", bottom: 26, right: 26, zIndex: 9999,
      background: "#1a1714", color: type === "error" ? "#e08080" : "#80c0a0",
      padding: "11px 18px", borderRadius: 12, fontSize: 13,
      boxShadow: "0 10px 36px rgba(0,0,0,0.32)",
      border: `1px solid ${type === "error" ? "rgba(224,128,128,0.15)" : "rgba(128,192,160,0.15)"}`,
      maxWidth: 320, fontFamily: "'DM Sans',sans-serif",
      animation: "cl-toast 0.2s ease", display: "flex", alignItems: "center", gap: 8,
    }}>
      <span style={{ opacity: 0.5, fontSize: 11 }}>{type === "error" ? "✕" : "✓"}</span>
      {msg}
    </div>
  );
}
 
// ─── Skeleton ─────────────────────────────────────────────────────────────────
export function Skeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} style={{
          background: "linear-gradient(90deg,#ede9df 25%,#e4ddd0 50%,#ede9df 75%)",
          backgroundSize: "800px 100%", borderRadius: 14, height: 118,
          animation: "cl-shimmer 1.5s ease-in-out infinite",
        }}/>
      ))}
    </div>
  );
}
 
// ─── Field ────────────────────────────────────────────────────────────────────
export function Field({ label, children, required, hint }) {
  return (
    <div style={{ marginBottom: 13 }}>
      <label style={LBL}>
        {label}{required && <span style={{ color: "#c0392b", marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {hint && <p style={{ fontSize: 11.5, color: "#b0a890", marginTop: 4 }}>{hint}</p>}
    </div>
  );
}
 
// ─── ModalWrap ────────────────────────────────────────────────────────────────
export function ModalWrap({ children, onClose, maxW = 620 }) {
  useEffect(() => {
    const h = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(8,6,4,0.84)", backdropFilter: "blur(14px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, fontFamily: "'DM Sans',sans-serif",
      }}>
      <div style={{
        width: "100%", maxWidth: maxW, background: "#faf7f2", borderRadius: 18,
        boxShadow: "0 44px 100px rgba(0,0,0,0.55)", maxHeight: "92vh",
        overflowY: "auto", animation: "cl-scale-in 0.26s ease",
      }}>
        {children}
      </div>
    </div>
  );
}
 
// ─── Modal Header ─────────────────────────────────────────────────────────────
export function MH({ title, sub, onClose }) {
  return (
    <div style={{
      background: "linear-gradient(135deg,#141210 0%,#1e1a14 45%,#241e16 100%)",
      padding: "20px 26px", borderRadius: "18px 18px 0 0",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      borderBottom: "1px solid rgba(201,184,122,0.14)",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "2px",
        background: "linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)",
      }}/>
      <div>
        <p style={{
          fontFamily: "'Cormorant Garamond',Georgia,serif", fontWeight: 700,
          fontSize: 19, margin: "0 0 2px", color: "#f5f0e8", letterSpacing: "-0.2px",
        }}>{title}</p>
        {sub && <p style={{ fontSize: 12, color: "rgba(245,240,232,0.38)", margin: 0 }}>{sub}</p>}
      </div>
      <button onClick={onClose} style={{
        background: "rgba(245,240,232,0.07)", backdropFilter: "blur(8px)",
        border: "1px solid rgba(245,240,232,0.12)", borderRadius: 9,
        width: 32, height: 32, cursor: "pointer", display: "flex",
        alignItems: "center", justifyContent: "center",
        color: "rgba(245,240,232,0.55)", fontSize: 16,
      }}>×</button>
    </div>
  );
}
 
// ─── Pagination ───────────────────────────────────────────────────────────────
const PGB = (active, disabled) => ({
  padding: "7px 13px", borderRadius: 9,
  border: `1.5px solid ${active ? "#1a1714" : "#e4ddd0"}`,
  background: active ? "#1a1714" : "transparent",
  color: active ? "#f5f0e8" : disabled ? "#d4ccbe" : "#6b6248",
  cursor: disabled ? "not-allowed" : "pointer",
  fontSize: 13, fontWeight: active ? 600 : 400,
  fontFamily: "'DM Sans',sans-serif",
  opacity: disabled ? 0.5 : 1, transition: "all 0.14s",
});
 
export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages   = Array.from({ length: totalPages }, (_, i) => i);
  const visible = pages.filter(p => p === 0 || p === totalPages - 1 || Math.abs(p - page) <= 1);
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 44, flexWrap: "wrap" }}>
      <button disabled={page === 0} onClick={() => onChange(page - 1)} style={PGB(false, page === 0)}>‹</button>
      {visible.map((p, i) => {
        const gap = visible[i - 1] != null && p - visible[i - 1] > 1;
        return (
          <span key={p} style={{ display: "flex", gap: 4 }}>
            {gap && <span style={{ padding: "7px 4px", color: "#b0a890", fontSize: 13 }}>…</span>}
            <button onClick={() => onChange(p)} style={PGB(p === page, false)}>{p + 1}</button>
          </span>
        );
      })}
      <button disabled={page === totalPages - 1} onClick={() => onChange(page + 1)} style={PGB(false, page === totalPages - 1)}>›</button>
    </div>
  );
}
 