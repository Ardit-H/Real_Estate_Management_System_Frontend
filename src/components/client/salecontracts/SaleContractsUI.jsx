import { useEffect } from "react";
import { PGB } from "./saleConstants";
 
export function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position: "fixed", bottom: 26, right: 26, zIndex: 9999, background: "#1a1714", color: type === "error" ? "#f09090" : "#90c8a8", padding: "11px 18px", borderRadius: 12, fontSize: 13, boxShadow: "0 10px 36px rgba(0,0,0,0.32)", border: `1px solid ${type === "error" ? "rgba(240,128,128,0.15)" : "rgba(144,200,168,0.15)"}`, maxWidth: 320, fontFamily: "'DM Sans',sans-serif", animation: "msc-toast 0.2s ease", display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 14 }}>{type === "error" ? "⚠️" : "✅"}</span>{msg}
    </div>
  );
}
 
export function Skeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} style={{ background: "linear-gradient(90deg,#ede9df 25%,#e4ddd0 50%,#ede9df 75%)", backgroundSize: "800px 100%", borderRadius: 14, height: 160, animation: "msc-pulse 1.6s ease-in-out infinite" }} />
      ))}
    </div>
  );
}
 
export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages   = Array.from({ length: totalPages }, (_, i) => i);
  const visible = pages.filter(p => p === 0 || p === totalPages - 1 || Math.abs(p - page) <= 1);
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 36, flexWrap: "wrap" }}>
      <button disabled={page === 0} onClick={() => onChange(page - 1)} style={PGB(false, page === 0)}>‹</button>
      {visible.map((p, i) => {
        const gap = visible[i - 1] != null && p - visible[i - 1] > 1;
        return (<span key={p} style={{ display: "flex", gap: 4 }}>{gap && <span style={{ padding: "7px 4px", color: "#b0a890", fontSize: 13 }}>…</span>}<button onClick={() => onChange(p)} style={PGB(p === page, false)}>{p + 1}</button></span>);
      })}
      <button disabled={page === totalPages - 1} onClick={() => onChange(page + 1)} style={PGB(false, page === totalPages - 1)}>›</button>
    </div>
  );
}
 