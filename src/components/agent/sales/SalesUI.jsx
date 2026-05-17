import { useEffect } from "react";
import { STATUS_BADGE_CFG, BTN_SEC, PGB } from "./salesConstants.js";
 
export function Badge({ label }) {
  const s = STATUS_BADGE_CFG[label] || { bg:"#f0ece3", color:"#6b6248", border:"#e0d8c8" };
  return (
    <span style={{background:s.bg,color:s.color,border:`1px solid ${s.border}`,padding:"3px 11px",borderRadius:999,fontSize:10.5,fontWeight:700,letterSpacing:"0.3px",textTransform:"uppercase"}}>
      {label}
    </span>
  );
}
 
export function Modal({ title, onClose, children, wide=false }) {
  useEffect(() => {
    const h = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [onClose]);
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(8,6,4,0.84)",backdropFilter:"blur(14px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{width:"100%",maxWidth:wide?720:520,background:"#faf7f2",borderRadius:18,boxShadow:"0 44px 100px rgba(0,0,0,0.55)",maxHeight:"92vh",overflowY:"auto",animation:"as-scale-in 0.26s ease"}}>
        <div style={{background:"linear-gradient(160deg,#141210 0%,#1e1a14 45%,#241e16 100%)",padding:"18px 24px",borderBottom:"1px solid rgba(201,184,122,0.14)",display:"flex",alignItems:"center",justifyContent:"space-between",position:"relative",borderRadius:"18px 18px 0 0"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:"linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)",borderRadius:"18px 18px 0 0"}}/>
          <span style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontWeight:700,fontSize:17,color:"#f5f0e8"}}>{title}</span>
          <button onClick={onClose} style={{background:"rgba(245,240,232,0.08)",border:"1px solid rgba(245,240,232,0.12)",borderRadius:8,width:30,height:30,cursor:"pointer",color:"rgba(245,240,232,0.6)",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
        <div style={{padding:"22px 24px"}}>{children}</div>
      </div>
    </div>
  );
}
 
export function Field({ label, children, required }) {
  return (
    <div style={{marginBottom:14}}>
      <label style={{display:"block",fontSize:10.5,fontWeight:600,color:"#9a8c6e",textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:6,fontFamily:"'DM Sans',sans-serif"}}>
        {label}{required && <span style={{color:"#c0392b",marginLeft:2}}>*</span>}
      </label>
      {children}
    </div>
  );
}
 
export function FormRow({ children }) {
  return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>{children}</div>;
}
 
export function Toast({ msg, type="success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{position:"fixed",bottom:26,right:26,zIndex:9999,background:"#1a1714",color:type==="error"?"#f09090":"#90c8a8",padding:"11px 18px",borderRadius:12,fontSize:13,boxShadow:"0 10px 36px rgba(0,0,0,0.32)",border:`1px solid ${type==="error"?"rgba(240,128,128,0.15)":"rgba(144,200,168,0.15)"}`,maxWidth:320,fontFamily:"'DM Sans',sans-serif",animation:"as-toast 0.2s ease",display:"flex",alignItems:"center",gap:8}}>
      <span style={{fontSize:14}}>{type==="error"?"⚠️":"✅"}</span>{msg}
    </div>
  );
}
 
export function EmptyState({ icon, text }) {
  return (
    <div style={{textAlign:"center",padding:"52px 20px",color:"#b0a890",fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{fontSize:32,marginBottom:10}}>{icon}</div>
      <p style={{fontSize:14}}>{text}</p>
    </div>
  );
}
 
export function Loader() {
  return (
    <div style={{textAlign:"center",padding:"48px 0"}}>
      <div style={{width:26,height:26,margin:"0 auto",border:"2px solid #e8e2d6",borderTop:"2px solid #c9b87a",borderRadius:"50%",animation:"as-spin 0.8s linear infinite"}}/>
    </div>
  );
}
 
export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{display:"flex",alignItems:"center",gap:6,justifyContent:"flex-end",padding:"14px 16px"}}>
      <button disabled={page===0} onClick={()=>onChange(page-1)} style={PGB(false,page===0)}>← Prev</button>
      <span style={{fontSize:13,color:"#9a8c6e",padding:"0 8px"}}>{page+1} / {totalPages}</span>
      <button disabled={page>=totalPages-1} onClick={()=>onChange(page+1)} style={PGB(false,page>=totalPages-1)}>Next →</button>
    </div>
  );
}
 
export function AgentTable({ children }) {
  return (
    <div style={{background:"#fff",borderRadius:14,border:"1.5px solid #ece6da",boxShadow:"0 2px 16px rgba(20,16,10,0.07)",overflow:"hidden"}}>
      {children}
    </div>
  );
}
 
export function TableHead({ children }) {
  return (
    <div style={{padding:"14px 20px",borderBottom:"1.5px solid #e8e2d6",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      {children}
    </div>
  );
}
 
export function SectionTabs({ active, onChange }) {
  const tabs = [
    { id:"listings",  label:"Sale Listings", icon:"🏷️" },
    { id:"contracts", label:"Contracts",     icon:"📄" },
    { id:"payments",  label:"Payments",      icon:"💳" },
  ];
  return (
    <div style={{display:"flex",gap:4,marginBottom:22,borderBottom:"1.5px solid #e8e2d6",paddingBottom:0}}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          padding:"10px 18px",border:"none",
          borderBottom:active===t.id?"2.5px solid #c9b87a":"2.5px solid transparent",
          background:"none",color:active===t.id?"#1a1714":"#9a8c6e",
          fontWeight:active===t.id?600:400,fontSize:13.5,cursor:"pointer",
          fontFamily:"'DM Sans',sans-serif",marginBottom:-1.5,
          display:"flex",alignItems:"center",gap:6,transition:"color .15s"}}>
          {t.icon} {t.label}
        </button>
      ))}
    </div>
  );
}
 