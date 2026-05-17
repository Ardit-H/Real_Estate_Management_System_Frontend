import { useState, useEffect } from "react";
import { I } from "./profileConstants.jsx";
 
export function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3400); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position:"fixed", bottom:28, right:28, zIndex:9999,
      background:"#1a1a12", color: type==="error"?"#f0a0a0":"#a0c8a0",
      padding:"14px 20px", borderRadius:0, fontSize:13, fontWeight:400,
      fontFamily:"'DM Sans',sans-serif",
      boxShadow:"0 12px 40px rgba(0,0,0,0.32)",
      border:`1px solid ${type==="error"?"rgba(240,160,160,.18)":"rgba(160,200,160,.18)"}`,
      maxWidth:340, display:"flex", alignItems:"center", gap:10,
      animation:"ap-up .25s ease",
    }}>
      <span style={{opacity:.7}}>{type==="error" ? I.warn(13) : I.check(13)}</span>
      {msg}
    </div>
  );
}
 
export function Skeleton() {
  const bar = (h, w="100%", mb=0) => (
    <div style={{height:h, width:w, background:"#e8e2d6", marginBottom:mb, animation:"ap-pulse 1.6s ease infinite"}}/>
  );
  return (
    <div style={{display:"grid", gridTemplateColumns:"260px 1fr", gap:24}}>
      <div style={{display:"flex",flexDirection:"column",gap:1}}>
        {bar(72)} {bar(52)} {bar(52)} {bar(52)}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:12,padding:"32px",background:"#fff",border:"1px solid #e4ddd2"}}>
        {bar(28,"60%",20)} {bar(16,"100%",8)} {bar(16,"80%",24)}
        {bar(44,"100%",8)} {bar(44,"100%",8)} {bar(88,"100%")}
      </div>
    </div>
  );
}
 
export function Avatar({ photoUrl, name, size=68 }) {
  const initials = name
    ? name.trim().split(" ").slice(0,2).map(w=>w[0]?.toUpperCase()).join("")
    : "AG";
  if (photoUrl) return (
    <img src={photoUrl} alt={name} style={{width:size,height:size,borderRadius:"50%",objectFit:"cover",border:"2px solid rgba(255,255,255,.2)",flexShrink:0}}/>
  );
  return (
    <div style={{width:size,height:size,borderRadius:"50%",background:"rgba(255,255,255,.1)",border:"2px solid rgba(255,255,255,.18)",display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(255,255,255,.85)",fontSize:size*.3,fontWeight:600,fontFamily:"'Cormorant Garamond',Georgia,serif",flexShrink:0,letterSpacing:".5px"}}>
      {initials}
    </div>
  );
}
 
export function StarRating({ value = 0 }) {
  const stars = Math.round(Number(value) * 2) / 2;
  return (
    <div style={{display:"flex",gap:3,alignItems:"center"}}>
      {[1,2,3,4,5].map(s => (
        <span key={s} style={{color: s<=stars ? "#c8a840" : "#ddd6c8"}}>{I.star(14)}</span>
      ))}
      <span style={{fontSize:13,color:"rgba(255,255,255,.45)",marginLeft:6,fontFamily:"'DM Sans',sans-serif"}}>
        {Number(value).toFixed(1)}
      </span>
    </div>
  );
}
 
export function PwInput({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{position:"relative"}}>
      <input className="ap-inp" type={show?"text":"password"} value={value} onChange={onChange}
        placeholder={placeholder} style={{paddingRight:42}}/>
      <button onClick={()=>setShow(p=>!p)} tabIndex={-1}
        style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#9a8c6e",display:"flex",alignItems:"center",padding:0}}>
        {show ? I.eyeOff(14) : I.eye(14)}
      </button>
    </div>
  );
}
 
export function Field({ label, children, hint, required }) {
  return (
    <div style={{marginBottom:20}}>
      <label style={{display:"block",fontSize:"10.5px",fontWeight:600,color:"#8a8070",textTransform:"uppercase",letterSpacing:"1px",marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>
        {label}{required && <span style={{color:"#b84040",marginLeft:3}}>*</span>}
      </label>
      {children}
      {hint && <p style={{fontSize:12,color:"#aaa090",marginTop:6,fontFamily:"'DM Sans',sans-serif",lineHeight:1.5}}>{hint}</p>}
    </div>
  );
}
 
export function Section({ title }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:14,margin:"28px 0 20px"}}>
      <span style={{fontSize:"10px",fontWeight:600,color:"#a09080",textTransform:"uppercase",letterSpacing:"1.2px",fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap"}}>{title}</span>
      <div style={{flex:1,height:1,background:"#ebe4d8"}}/>
    </div>
  );
}
 
export function StatChip({ icon, value }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:7,padding:"7px 14px",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.12)",color:"rgba(255,255,255,.65)",fontSize:"12.5px",fontFamily:"'DM Sans',sans-serif"}}>
      <span style={{opacity:.55}}>{icon}</span>
      {value}
    </div>
  );
}
 
export function Banner({ type="info", children }) {
  const cfg = {
    info:    {bg:"#f7f4ee",border:"#ddd6c8",color:"#6b6040",icon:I.info()},
    warn:    {bg:"#fdf6e8",border:"#e8c880",color:"#7a5a10",icon:I.warn()},
    success: {bg:"#f0f8f2",border:"#b8d8c0",color:"#2a5840",icon:I.check()},
    error:   {bg:"#fef2f2",border:"#e8b8b8",color:"#8b2020",icon:I.warn()},
  }[type];
  return (
    <div style={{display:"flex",alignItems:"flex-start",gap:10,padding:"12px 16px",background:cfg.bg,border:`1px solid ${cfg.border}`,marginBottom:20,fontSize:"13px",color:cfg.color,fontFamily:"'DM Sans',sans-serif",lineHeight:1.55}}>
      <span style={{marginTop:1,opacity:.8}}>{cfg.icon}</span>
      {children}
    </div>
  );
}
 
export function SaveBtn({ onClick, disabled, label, loading: l }) {
  return (
    <button className="ap-save" onClick={onClick} disabled={disabled||l}
      style={{padding:"11px 28px",border:"none",background:disabled||l?"#b0a890":"#1a1a12",color:"#f4f1ea",fontSize:"13px",fontWeight:500,cursor:disabled||l?"not-allowed":"pointer",fontFamily:"'DM Sans',sans-serif",letterSpacing:".3px",display:"flex",alignItems:"center",gap:9,opacity:disabled||l?.6:1,boxShadow:disabled||l?"none":"0 4px 16px rgba(26,26,18,.22)"}}>
      {l ? (
        <><div style={{width:13,height:13,border:"1.5px solid rgba(244,241,234,.3)",borderTop:"1.5px solid #f4f1ea",borderRadius:"50%",animation:"ap-spin .7s linear infinite"}}/> Saving…</>
      ) : (
        <>{label} <span style={{opacity:.5}}>{I.arrow(13)}</span></>
      )}
    </button>
  );
}
 
export function MetaGrid({ userInfo }) {
  const items = [
    {label:"Role",      value:"Agent",                                                color:"#2a4060"},
    {label:"Status",    value:userInfo?.is_active?"Active":"Inactive",                color:userInfo?.is_active?"#2a5040":"#8b3010"},
    {label:"Tenant ID", value:userInfo?.tenant_id?`#${userInfo.tenant_id}`:"—",       color:"#6b6040"},
  ];
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:24}}>
      {items.map(item=>(
        <div key={item.label} style={{padding:"14px 16px",background:"#f7f4ee",border:"1px solid #e4ddd2"}}>
          <p style={{fontSize:"10px",fontWeight:600,color:"#a09080",textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 5px",fontFamily:"'DM Sans',sans-serif"}}>{item.label}</p>
          <p style={{fontSize:14,fontWeight:500,color:item.color,margin:0,fontFamily:"'DM Sans',sans-serif"}}>{item.value}</p>
        </div>
      ))}
    </div>
  );
}
 