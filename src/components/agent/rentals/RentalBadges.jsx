import { useEffect } from "react";
import { STATUS_CFG, PGB } from "./rentalHelpers";

// ── Toast ─────────────────────────────────────────────────────────────────────
export function Toast({ msg, type = "success", onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div style={{
      position: "fixed", bottom: 26, right: 26, zIndex: 9999,
      background: "#1a1714",
      color: type === "error" ? "#f09090" : "#90c8a8",
      padding: "11px 18px", borderRadius: 12, fontSize: 13,
      boxShadow: "0 10px 36px rgba(0,0,0,0.32)",
      border: `1px solid ${type === "error" ? "rgba(240,128,128,0.15)" : "rgba(144,200,168,0.15)"}`,
      maxWidth: 320, fontFamily: "'DM Sans',sans-serif",
      animation: "ar-toast 0.2s ease", display: "flex", alignItems: "center", gap: 8,
    }}>
      <span>{type === "error" ? "⚠️" : "✅"}</span>
      {msg}
    </div>
  );
}

// ── Loader ────────────────────────────────────────────────────────────────────
export function Loader() {
  return (
    <div style={{ textAlign: "center", padding: "48px 0" }}>
      <div style={{
        width: 26, height: 26, margin: "0 auto",
        border: "2px solid #e8e2d6", borderTop: "2px solid #c9b87a",
        borderRadius: "50%", animation: "ar-spin 0.8s linear infinite",
      }} />
    </div>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({ icon, text }) {
  return (
    <div style={{ textAlign: "center", padding: "52px 20px", color: "#b0a890", fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ fontSize: 32, marginBottom: 10 }}>{icon}</div>
      <p style={{ fontSize: 14 }}>{text}</p>
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────
export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end", padding: "14px 16px" }}>
      <button disabled={page === 0} onClick={() => onChange(page - 1)} style={PGB(false, page === 0)}>← Prev</button>
      <span style={{ fontSize: 13, color: "#9a8c6e", padding: "0 8px" }}>{page + 1} / {totalPages}</span>
      <button disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)} style={PGB(false, page >= totalPages - 1)}>Next →</button>
    </div>
  );
}

// ── Field ─────────────────────────────────────────────────────────────────────
export function Field({ label, children, required, hint }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        display: "block", fontSize: 10.5, fontWeight: 600, color: "#9a8c6e",
        textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 6,
        fontFamily: "'DM Sans',sans-serif",
      }}>
        {label}{required && <span style={{ color: "#c0392b", marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {hint && <p style={{ fontSize: 11.5, color: "#b0a890", marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

// ── Row2 ──────────────────────────────────────────────────────────────────────
export function Row2({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>{children}</div>;
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const h = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", h);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(8,6,4,0.84)", backdropFilter: "blur(14px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, fontFamily: "'DM Sans',sans-serif",
      }}
    >
      <div style={{
        width: "100%", maxWidth: wide ? 700 : 520,
        background: "#faf7f2", borderRadius: 18,
        boxShadow: "0 44px 100px rgba(0,0,0,0.55)",
        maxHeight: "92vh", overflowY: "auto",
        animation: "ar-scale-in 0.26s ease",
      }}>
        {/* Header */}
        <div style={{
          background: "linear-gradient(160deg,#141210 0%,#1e1a14 45%,#241e16 100%)",
          padding: "18px 24px", borderBottom: "1px solid rgba(201,184,122,0.14)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "relative", borderRadius: "18px 18px 0 0",
        }}>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "2px",
            background: "linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)",
            borderRadius: "18px 18px 0 0",
          }} />
          <span style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontWeight: 700, fontSize: 17, color: "#f5f0e8" }}>
            {title}
          </span>
          <button
            onClick={onClose}
            style={{
              background: "rgba(245,240,232,0.08)", border: "1px solid rgba(245,240,232,0.12)",
              borderRadius: 8, width: 30, height: 30, cursor: "pointer",
              color: "rgba(245,240,232,0.6)", fontSize: 16,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >×</button>
        </div>

        {/* Body */}
        <div style={{ padding: "22px 24px" }}>{children}</div>
      </div>
    </div>
  );
}

// ── StatusBadge ───────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const s = STATUS_CFG[status] || { bg: "#f0ece3", color: "#6b6248", border: "#e0d8c8" };
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      padding: "3px 11px", borderRadius: 999, fontSize: 10.5,
      fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase",
    }}>
      {status}
    </span>
  );
}