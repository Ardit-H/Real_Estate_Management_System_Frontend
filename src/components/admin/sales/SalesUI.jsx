import { useEffect } from "react";
import { BADGE_MAP, pgBtn, secondaryBtn, dangerBtn } from "./salesConstants.js";
 
export function Badge({ label }) {
  const s = BADGE_MAP[label] || { bg:"rgba(136,135,128,0.12)", color:"#888780", border:"rgba(136,135,128,0.25)" };
  return (
    <span style={{ background:s.bg, color:s.color, border:`1px solid ${s.border}`, fontSize:10.5, fontWeight:600, letterSpacing:"0.4px", padding:"3px 10px", borderRadius:999, whiteSpace:"nowrap", display:"inline-block", fontFamily:"'DM Sans',sans-serif" }}>
      {label ?? "—"}
    </span>
  );
}
 
export function Modal({ title, onClose, children, maxWidth = 520 }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(8,6,4,0.82)", backdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"'DM Sans',sans-serif" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ width:"100%", maxWidth, background:"#faf7f2", borderRadius:18, boxShadow:"0 44px 100px rgba(0,0,0,0.55)", maxHeight:"90vh", overflowY:"auto", animation:"as-scale 0.22s ease", overflow:"hidden" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 24px", borderBottom:"1px solid rgba(138,125,94,0.15)", position:"sticky", top:0, background:"#faf7f2", zIndex:1 }}>
          <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontWeight:700, fontSize:17, color:"#1a1714" }}>{title}</span>
          <button onClick={onClose} style={{ width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center", border:"1px solid rgba(138,125,94,0.2)", background:"rgba(138,125,94,0.08)", color:"#8a7d5e", cursor:"pointer", fontSize:15, borderRadius:8 }}>✕</button>
        </div>
        <div style={{ padding:"22px 24px", overflowY:"auto", maxHeight:"calc(90vh - 60px)" }}>{children}</div>
      </div>
    </div>
  );
}
 
export function Field({ label, children, required }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ fontSize:10.5, fontWeight:600, color:"#8a7d5e", display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.5px" }}>
        {label}{required && <span style={{ color:"#D85A30", marginLeft:2 }}>*</span>}
      </label>
      {children}
    </div>
  );
}
 
export function Row({ children }) {
  return <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>{children}</div>;
}
 
export function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position:"fixed", bottom:26, right:26, zIndex:9999, background:"#1a1714", color:type==="error"?"#f09090":"#90c8a8", padding:"11px 18px", borderRadius:12, fontSize:13, fontWeight:400, boxShadow:"0 10px 36px rgba(0,0,0,0.32)", border:`1px solid ${type==="error"?"rgba(240,128,128,0.15)":"rgba(144,200,168,0.15)"}`, maxWidth:320, fontFamily:"'DM Sans',sans-serif", animation:"as-toast 0.2s ease", display:"flex", alignItems:"center", gap:8 }}>
      <span style={{ fontSize:14 }}>{type==="error"?"⚠️":"✅"}</span>{msg}
    </div>
  );
}
 
export function Empty({ icon, text }) {
  return (
    <div style={{ textAlign:"center", padding:"52px 20px", color:"#b0a890", fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ fontSize:34, marginBottom:12 }}>{icon}</div>
      <p style={{ fontSize:14 }}>{text}</p>
    </div>
  );
}
 
export function Loader() {
  return (
    <div style={{ textAlign:"center", padding:"48px 0" }}>
      <div style={{ width:26, height:26, margin:"0 auto", border:"2px solid rgba(138,125,94,0.15)", borderTop:"2px solid #8a7d5e", borderRadius:"50%", animation:"as-spin .8s linear infinite" }} />
    </div>
  );
}
 
export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, justifyContent:"flex-end", padding:"14px 16px 8px" }}>
      <button disabled={page===0} onClick={()=>onChange(page-1)} className="as-pg" style={pgBtn(page===0)}>← Prev</button>
      <span style={{ fontSize:13, color:"#8a7d5e", padding:"0 6px", fontFamily:"'DM Sans',sans-serif" }}>{page+1} / {totalPages}</span>
      <button disabled={page>=totalPages-1} onClick={()=>onChange(page+1)} className="as-pg" style={pgBtn(page>=totalPages-1)}>Next →</button>
    </div>
  );
}
 
export function Tabs({ active, onChange }) {
  const tabs = [
    { id:"listings",  label:"Sale Listings", icon:"🏷️" },
    { id:"contracts", label:"Contracts",      icon:"📄" },
    { id:"payments",  label:"Payments",       icon:"💳" },
  ];
  return (
    <div style={{ display:"flex", gap:2, marginBottom:22, background:"linear-gradient(160deg,#141210 0%,#1e1a14 100%)", borderRadius:12, border:"1px solid rgba(201,184,122,0.12)", padding:6, position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)" }} />
      {tabs.map((t) => (
        <button key={t.id} onClick={()=>onChange(t.id)} className="as-tab" style={{ flex:1, padding:"10px 16px", border:"none", borderRadius:9, background:active===t.id?"rgba(201,184,122,0.12)":"transparent", color:active===t.id?"#c9b87a":"rgba(245,240,232,0.38)", fontWeight:active===t.id?600:400, fontSize:13.5, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:7, outline:"none", transition:"all 0.15s", boxShadow:active===t.id?"0 0 0 1px rgba(201,184,122,0.2)":"none" }}>
          <span style={{ fontSize:15 }}>{t.icon}</span> {t.label}
        </button>
      ))}
    </div>
  );
}
 
export function DeleteModal({ id, label, onCancel, onConfirm, loading }) {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(8,6,4,0.82)", backdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"'DM Sans',sans-serif" }}
      onClick={(e) => e.target === e.currentTarget && !loading && onCancel()}>
      <div style={{ width:"100%", maxWidth:440, background:"#faf7f2", borderRadius:18, boxShadow:"0 44px 100px rgba(0,0,0,0.55)", animation:"as-scale 0.22s ease", overflow:"hidden" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 24px", borderBottom:"1px solid rgba(138,125,94,0.15)" }}>
          <span style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:17, color:"#1a1714" }}>Confirm deletion</span>
          <button onClick={onCancel} disabled={loading} style={{ width:30, height:30, border:"1px solid rgba(138,125,94,0.2)", background:"rgba(138,125,94,0.08)", color:"#8a7d5e", cursor:"pointer", fontSize:15, borderRadius:8 }}>✕</button>
        </div>
        <div style={{ padding:"22px 24px" }}>
          <p style={{ fontSize:14, color:"#4a4438", marginBottom:18, lineHeight:1.6 }}>
            Are you sure you want to delete <strong style={{ color:"#1a1714" }}>{label} #{id}</strong>? This action cannot be undone.
          </p>
          <div style={{ background:"rgba(216,90,48,0.08)", border:"1px solid rgba(216,90,48,0.2)", borderRadius:10, padding:"10px 15px", marginBottom:22, fontSize:13, color:"#D85A30" }}>
            Soft delete — the record is marked with <code style={{ background:"rgba(216,90,48,0.12)", padding:"1px 6px", borderRadius:4, fontSize:12 }}>deleted_at</code> and no longer appears.
          </div>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <button onClick={onCancel} disabled={loading} style={secondaryBtn}>Cancel</button>
            <button onClick={onConfirm} disabled={loading} style={dangerBtn}>{loading ? "Deleting..." : "Delete"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
 