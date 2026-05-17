import { useEffect } from "react";
import { C, STATUS_CFG } from "./saleAppConstants.js";
 
export function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position:"fixed", bottom:26, right:26, zIndex:9999, background:C.dark, color:type==="error"?"#f09090":"#90c8a8", padding:"11px 18px", borderRadius:12, fontSize:13, boxShadow:"0 10px 36px rgba(0,0,0,0.32)", border:`1px solid ${type==="error"?"rgba(240,128,128,0.15)":"rgba(144,200,168,0.15)"}`, fontFamily:"'DM Sans',sans-serif", animation:"sa-toast 0.2s ease", display:"flex", alignItems:"center", gap:8, maxWidth:360 }}>
      {type === "error" ? "⚠️" : "✅"} {msg}
    </div>
  );
}
 
export function Skeleton({ rows = 5, h = 56 }) {
  return (
    <div style={{ padding:"14px 16px", display:"flex", flexDirection:"column", gap:10 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="sa-skeleton" style={{ height:h, opacity:1 - i * 0.13 }} />
      ))}
    </div>
  );
}
 
export function EmptyState({ icon, title, sub }) {
  return (
    <div style={{ padding:"56px 20px", textAlign:"center", color:C.textMut }}>
      <div style={{ fontSize:42, marginBottom:12 }}>{icon}</div>
      <p style={{ fontSize:14, fontWeight:600, color:C.textSub, margin:"0 0 5px", fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{title}</p>
      {sub && <p style={{ fontSize:12.5, margin:0, lineHeight:1.6 }}>{sub}</p>}
    </div>
  );
}
 
export function StatusPill({ status }) {
  const s = STATUS_CFG[status] || { color:"#64748b", bg:"#f1f5f9", dot:"#64748b" };
  return (
    <span className="sa-chip" style={{ background:s.bg, color:s.color }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:s.dot, display:"inline-block", flexShrink:0 }} />
      {status}
    </span>
  );
}
 
export function StatCard({ icon, label, value, accent = C.gold, delay = 0 }) {
  return (
    <div className="sa-stat sa-card" style={{ padding:"18px 20px", display:"flex", alignItems:"center", gap:14, animationDelay:`${delay}s` }}>
      <div style={{ width:46, height:46, borderRadius:12, flexShrink:0, background:`${accent}18`, border:`1.5px solid ${accent}28`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{icon}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ margin:0, fontSize:10, fontWeight:600, color:C.textMut, textTransform:"uppercase", letterSpacing:"0.9px", marginBottom:3 }}>{label}</p>
        <p style={{ margin:0, fontSize:26, fontWeight:700, color:C.text, fontFamily:"'Cormorant Garamond',Georgia,serif", letterSpacing:"-0.5px", lineHeight:1 }}>{value ?? "—"}</p>
      </div>
    </div>
  );
}
 
export function SectionHeader({ title, count, badge, children }) {
  return (
    <div style={{ padding:"14px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", background:"#fdf9f4", flexWrap:"wrap", gap:10 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <p style={{ margin:0, fontSize:15, fontWeight:700, color:C.text, fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{title}</p>
        {count != null && <span style={{ background:`${C.gold}22`, color:C.textSub, padding:"2px 9px", borderRadius:20, fontSize:11, fontWeight:600 }}>{count}</span>}
        {badge}
      </div>
      {children}
    </div>
  );
}
 
export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:6, padding:"16px 20px", borderTop:`1px solid ${C.border}`, background:"#fdf9f4" }}>
      <button className="sa-btn" disabled={page===0} onClick={()=>onChange(page-1)} style={{ padding:"6px 14px", borderRadius:9, border:`1.5px solid ${C.border}`, background:"transparent", color:page===0?C.textMut:C.text, fontSize:13, opacity:page===0?0.5:1 }}>‹ Previous</button>
      <span style={{ fontSize:12.5, color:C.muted, padding:"0 8px" }}>Page {page+1} of {totalPages}</span>
      <button className="sa-btn" disabled={page===totalPages-1} onClick={()=>onChange(page+1)} style={{ padding:"6px 14px", borderRadius:9, border:`1.5px solid ${C.border}`, background:"transparent", color:page===totalPages-1?C.textMut:C.text, fontSize:13, opacity:page===totalPages-1?0.5:1 }}>Next ›</button>
    </div>
  );
}
 
export function Modal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const h = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [onClose]);
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position:"fixed", inset:0, zIndex:2000, background:"rgba(8,6,4,0.84)", backdropFilter:"blur(14px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ width:"100%", maxWidth:wide?720:520, background:"#faf7f2", borderRadius:18, boxShadow:"0 44px 100px rgba(0,0,0,0.55)", maxHeight:"92vh", overflowY:"auto" }}>
        <div style={{ background:"linear-gradient(160deg,#141210 0%,#1e1a14 45%,#241e16 100%)", padding:"18px 24px", borderBottom:"1px solid rgba(201,184,122,0.14)", display:"flex", alignItems:"center", justifyContent:"space-between", borderRadius:"18px 18px 0 0", position:"relative" }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:"linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)", borderRadius:"18px 18px 0 0" }}/>
          <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontWeight:700, fontSize:17, color:"#f5f0e8" }}>{title}</span>
          <button onClick={onClose} style={{ background:"rgba(245,240,232,0.08)", border:"1px solid rgba(245,240,232,0.12)", borderRadius:8, width:30, height:30, cursor:"pointer", color:"rgba(245,240,232,0.6)", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        </div>
        <div style={{ padding:"22px 24px" }}>{children}</div>
      </div>
    </div>
  );
}
 
export function Field({ label, children, required }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:"block", fontSize:10.5, fontWeight:600, color:"#9a8c6e", textTransform:"uppercase", letterSpacing:"0.7px", marginBottom:6, fontFamily:"'DM Sans',sans-serif" }}>
        {label}{required && <span style={{ color:"#c0392b", marginLeft:2 }}>*</span>}
      </label>
      {children}
    </div>
  );
}
 
export function FormRow({ children }) {
  return <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>{children}</div>;
}
 