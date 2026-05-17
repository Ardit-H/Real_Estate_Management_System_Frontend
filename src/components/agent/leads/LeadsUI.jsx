import { useEffect } from "react";
import { STATUS_CFG, BTN_SEC } from "./leadsConstants.js";
 
export function StatusBadge({ status }) {
  const s = STATUS_CFG[status] || { pill:"#f0ece3", pillBorder:"#e0d8c8", color:"#6b6248", label:status, strip:"#a0997e" };
  return (
    <span style={{ background:s.pill, color:s.color, border:`1.5px solid ${s.pillBorder}`, padding:"3px 11px", borderRadius:999, fontSize:10.5, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.3px", display:"inline-flex", alignItems:"center", gap:5 }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:s.strip, display:"inline-block" }} />
      {s.label}
    </span>
  );
}
 
export function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position:"fixed", bottom:26, right:26, zIndex:9999, background:"#1a1714", color:type==="error" ? "#f09090" : "#90c8a8", padding:"11px 18px", borderRadius:12, fontSize:13, boxShadow:"0 10px 36px rgba(0,0,0,0.32)", border:`1px solid ${type==="error" ? "rgba(240,128,128,0.15)" : "rgba(144,200,168,0.15)"}`, maxWidth:320, fontFamily:"'DM Sans',sans-serif", animation:"al-toast 0.2s ease", display:"flex", alignItems:"center", gap:8 }}>
      <span style={{ fontSize:14 }}>{type === "error" ? "⚠️" : "✅"}</span>
      {msg}
    </div>
  );
}
 
export function Loader() {
  return (
    <div style={{ textAlign:"center", padding:"60px 0" }}>
      <div style={{ width:28, height:28, margin:"0 auto", border:"2px solid #e8e2d6", borderTop:"2px solid #c9b87a", borderRadius:"50%", animation:"al-spin 0.8s linear infinite" }} />
    </div>
  );
}
 
export function EmptyState({ icon, text, subtext }) {
  return (
    <div style={{ textAlign:"center", padding:"60px 20px", color:"#b0a890", fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ fontSize:40, marginBottom:12 }}>{icon}</div>
      <p style={{ fontSize:15, fontWeight:500, color:"#6b6248", marginBottom:4, fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{text}</p>
      {subtext && <p style={{ fontSize:13, color:"#b0a890" }}>{subtext}</p>}
    </div>
  );
}
 
export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6, justifyContent:"flex-end", padding:"14px 16px" }}>
      <button disabled={page === 0} onClick={() => onChange(page - 1)} style={{ ...BTN_SEC, padding:"6px 14px", fontSize:12.5, opacity:page===0 ? 0.4 : 1 }}>← Prev</button>
      <span style={{ fontSize:13, color:"#9a8c6e", padding:"0 8px" }}>{page + 1} / {totalPages}</span>
      <button disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)} style={{ ...BTN_SEC, padding:"6px 14px", fontSize:12.5, opacity:page>=totalPages-1 ? 0.4 : 1 }}>Next →</button>
    </div>
  );
}
 
export function Modal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [onClose]);
  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()} style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(8,6,4,0.84)", backdropFilter:"blur(14px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ width:"100%", maxWidth:wide ? 640 : 520, background:"#faf7f2", borderRadius:18, boxShadow:"0 44px 100px rgba(0,0,0,0.55)", maxHeight:"92vh", overflowY:"auto", animation:"al-scale-in 0.26s ease" }}>
        <div style={{ background:"linear-gradient(160deg,#141210 0%,#1e1a14 45%,#241e16 100%)", padding:"18px 24px", borderBottom:"1px solid rgba(201,184,122,0.14)", display:"flex", alignItems:"center", justifyContent:"space-between", position:"relative", borderRadius:"18px 18px 0 0" }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:"linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)" }} />
          <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontWeight:700, fontSize:17, color:"#f5f0e8" }}>{title}</span>
          <button onClick={onClose} style={{ background:"rgba(245,240,232,0.08)", border:"1px solid rgba(245,240,232,0.12)", borderRadius:8, width:30, height:30, cursor:"pointer", color:"rgba(245,240,232,0.6)", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        </div>
        <div style={{ padding:"22px 24px" }}>{children}</div>
      </div>
    </div>
  );
}
 