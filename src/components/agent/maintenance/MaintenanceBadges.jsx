import { useEffect } from "react";
import { PRI_CFG, STA_CFG, C } from "./maintenanceHelpers";

export function Toast({msg,type="success",onDone}){
  useEffect(()=>{const t=setTimeout(onDone,3200);return()=>clearTimeout(t)},[onDone]);
  return(<div style={{position:"fixed",bottom:26,right:26,zIndex:9999,background:C.dark,color:type==="error"?"#f09090":"#90c8a8",padding:"11px 18px",borderRadius:12,fontSize:13,boxShadow:"0 10px 36px rgba(0,0,0,.32)",border:`1px solid ${type==="error"?"rgba(240,128,128,.15)":"rgba(144,200,168,.15)"}`,fontFamily:"'DM Sans',sans-serif",animation:"mn-toast .2s ease",display:"flex",alignItems:"center",gap:8}}>{type==="error"?"⚠️":"✅"} {msg}</div>)
}

export function Loader(){return(<div style={{textAlign:"center",padding:"52px 0"}}><div style={{width:28,height:28,margin:"0 auto",border:"2.5px solid #e8e2d6",borderTop:`2.5px solid ${C.gold}`,borderRadius:"50%",animation:"mn-spin .7s linear infinite"}}/></div>)}

export function Empty({icon,text}){return(<div style={{textAlign:"center",padding:"52px 20px",color:C.textMut}}><div style={{fontSize:36,marginBottom:10}}>{icon}</div><p style={{fontSize:13.5,margin:0}}>{text}</p></div>)}

export function PBadge({p}){const c=PRI_CFG[p]||PRI_CFG.MEDIUM;return(<span style={{background:c.bg,color:c.color,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,display:"inline-flex",alignItems:"center",gap:4}}><span style={{width:5,height:5,borderRadius:"50%",background:c.dot,display:"inline-block"}}/>{c.label}</span>)}

export function SBadge({s}){const c=STA_CFG[s]||STA_CFG.OPEN;return(<span style={{background:c.bg,color:c.color,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600}}>{c.label}</span>)}

export function Pager({page,totalPages,onChange}){if(totalPages<=1)return null;return(<div style={{display:"flex",alignItems:"center",gap:6,justifyContent:"flex-end",padding:"14px 18px"}}><button className="mn-btn" disabled={page===0} onClick={()=>onChange(page-1)} style={{padding:"6px 14px",borderRadius:9,border:"1.5px solid #e4ddd0",background:"transparent",color:C.textSub,fontSize:13,opacity:page===0?.4:1}}>Prev</button><span style={{fontSize:12.5,color:C.muted,padding:"0 8px"}}>{page+1}/{totalPages}</span><button className="mn-btn" disabled={page>=totalPages-1} onClick={()=>onChange(page+1)} style={{padding:"6px 14px",borderRadius:9,border:"1.5px solid #e4ddd0",background:"transparent",color:C.textSub,fontSize:13,opacity:page>=totalPages-1?.4:1}}>Next</button></div>)}

export function Field({label,required,children}){return(<div style={{marginBottom:14}}><label style={{display:"block",fontSize:10.5,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:6}}>{label}{required&&<span style={{color:"#ef4444",marginLeft:2}}>*</span>}</label>{children}</div>)}

export function Row2({children}){return<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>{children}</div>}