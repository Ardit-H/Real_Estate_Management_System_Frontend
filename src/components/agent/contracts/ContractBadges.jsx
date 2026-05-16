import { useEffect } from "react";
import { STATUS_CFG, BTN_SEC } from "./contractHelpers";

// ── StatusBadge ───────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const s = STATUS_CFG[status]||{ pill:"#f0ece3", pillBorder:"#e0d8c8", color:"#6b6248", label:status, strip:"#a0997e" };
  return (
    <span style={{background:s.pill,color:s.color,border:`1.5px solid ${s.pillBorder}`,padding:"3px 11px",borderRadius:999,fontSize:10.5,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.3px",display:"inline-flex",alignItems:"center",gap:5}}>
      <span style={{width:5,height:5,borderRadius:"50%",background:s.strip,display:"inline-block",boxShadow:`0 0 4px ${s.strip}`}}/>
      {s.label}
    </span>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
export function Toast({ msg, type="success", onDone }) {
  useEffect(()=>{ const t=setTimeout(onDone,3200); return()=>clearTimeout(t); },[onDone]);
  return (
    <div style={{position:"fixed",bottom:26,right:26,zIndex:9999,background:"#1a1714",color:type==="error"?"#f09090":"#90c8a8",padding:"11px 18px",borderRadius:12,fontSize:13,boxShadow:"0 10px 36px rgba(0,0,0,0.32)",border:`1px solid ${type==="error"?"rgba(240,128,128,0.15)":"rgba(144,200,168,0.15)"}`,maxWidth:320,fontFamily:"'DM Sans',sans-serif",animation:"ac-toast 0.2s ease",display:"flex",alignItems:"center",gap:8}}>
      <span>{type==="error"?"⚠️":"✅"}</span>{msg}
    </div>
  );
}

// ── Loader ────────────────────────────────────────────────────────────────────
export function Loader() {
  return (
    <div style={{textAlign:"center",padding:"52px 0"}}>
      <div style={{width:26,height:26,margin:"0 auto",border:"2px solid #e8e2d6",borderTop:"2px solid #c9b87a",borderRadius:"50%",animation:"ac-spin 0.8s linear infinite"}}/>
    </div>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({ icon, text }) {
  return (
    <div style={{textAlign:"center",padding:"52px 20px",color:"#b0a890",fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{fontSize:36,marginBottom:10}}>{icon}</div>
      <p style={{fontSize:14}}>{text}</p>
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────
export function Pagination({ page, totalPages, onChange }) {
  if(totalPages<=1) return null;
  return (
    <div style={{display:"flex",alignItems:"center",gap:6,justifyContent:"flex-end",padding:"14px 16px"}}>
      <button disabled={page===0} onClick={()=>onChange(page-1)} style={{...BTN_SEC,padding:"6px 14px",fontSize:12.5,opacity:page===0?0.4:1}}>← Prev</button>
      <span style={{fontSize:13,color:"#9a8c6e",padding:"0 8px"}}>{page+1} / {totalPages}</span>
      <button disabled={page>=totalPages-1} onClick={()=>onChange(page+1)} style={{...BTN_SEC,padding:"6px 14px",fontSize:12.5,opacity:page>=totalPages-1?0.4:1}}>Next →</button>
    </div>
  );
}

// ── Field ─────────────────────────────────────────────────────────────────────
export function Field({ label, children, required, hint }) {
  return (
    <div style={{marginBottom:14}}>
      <label style={{display:"block",fontSize:10.5,fontWeight:600,color:"#9a8c6e",textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:6,fontFamily:"'DM Sans',sans-serif"}}>
        {label}{required&&<span style={{color:"#c0392b",marginLeft:2}}>*</span>}
      </label>
      {children}
      {hint&&<p style={{fontSize:11.5,color:"#b0a890",marginTop:4}}>{hint}</p>}
    </div>
  );
}

// ── Row2 ──────────────────────────────────────────────────────────────────────
export function Row2({ children }) {
  return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>{children}</div>;
}