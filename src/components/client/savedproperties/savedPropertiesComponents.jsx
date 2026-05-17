import { useEffect } from "react";

// Toast Component
export function Toast({ msg, type="success", onDone }) {
  useEffect(()=>{ const t=setTimeout(onDone,3000); return()=>clearTimeout(t); },[onDone]);
  return (
    <div style={{
      position:"fixed",bottom:26,right:26,zIndex:9999,
      background:"#1a1714",color:type==="error"?"#f09090":"#90c8a8",
      padding:"11px 18px",borderRadius:12,fontSize:13,fontWeight:400,
      boxShadow:"0 10px 36px rgba(0,0,0,0.32)",
      border:`1px solid ${type==="error"?"rgba(240,128,128,0.15)":"rgba(144,200,168,0.15)"}`,
      maxWidth:320,fontFamily:"'DM Sans',sans-serif",
      animation:"sp-toast 0.2s ease",display:"flex",alignItems:"center",gap:8,
    }}>
      <span style={{fontSize:14}}>{type==="error"?"⚠️":"✅"}</span>{msg}
    </div>
  );
}

// Skeleton Component
export function Skeleton({ viewMode }) {
  return (
    <div style={{
      display:viewMode==="grid"?"grid":"flex",
      gridTemplateColumns:viewMode==="grid"?"repeat(auto-fill,minmax(240px,1fr))":undefined,
      flexDirection:viewMode==="list"?"column":undefined,
      gap:viewMode==="grid"?18:12,
    }}>
      {Array.from({length:6}).map((_,i)=>(
        <div key={i} style={{
          background:"linear-gradient(90deg,#ede9df 25%,#e4ddd0 50%,#ede9df 75%)",
          backgroundSize:"800px 100%",
          borderRadius:14,
          height:viewMode==="grid"?280:150,
          animation:"sp-shimmer 1.6s ease-in-out infinite",
        }}/>
      ))}
    </div>
  );
}

// Pagination Component
const PGB = (active, disabled) => ({
  padding:"7px 13px",borderRadius:9,
  border:`1.5px solid ${active?"#1a1714":"#e4ddd0"}`,
  background:active?"#1a1714":"transparent",
  color:active?"#f5f0e8":disabled?"#d4ccbe":"#6b6248",
  cursor:disabled?"not-allowed":"pointer",
  fontSize:13,fontWeight:active?600:400,
  fontFamily:"'DM Sans',sans-serif",
  opacity:disabled?0.5:1,transition:"all 0.14s",
});

export function Pagination({ page, totalPages, onChange }) {
  if (totalPages<=1) return null;
  const pages   = Array.from({length:totalPages},(_,i)=>i);
  const visible = pages.filter(p=>p===0||p===totalPages-1||Math.abs(p-page)<=1);
  return (
    <div style={{display:"flex",justifyContent:"center",gap:4,marginTop:44,flexWrap:"wrap"}}>
      <button disabled={page===0} onClick={()=>onChange(page-1)} className="sp-pg" style={PGB(false,page===0)}>‹</button>
      {visible.map((p,i)=>{
        const gap=visible[i-1]!=null&&p-visible[i-1]>1;
        return <span key={p} style={{display:"flex",gap:4}}>
          {gap&&<span style={{padding:"7px 4px",color:"#b0a890",fontSize:13}}>…</span>}
          <button onClick={()=>onChange(p)} className="sp-pg" style={PGB(p===page,false)}>{p+1}</button>
        </span>;
      })}
      <button disabled={page===totalPages-1} onClick={()=>onChange(page+1)} className="sp-pg" style={PGB(false,page===totalPages-1)}>›</button>
    </div>
  );
}