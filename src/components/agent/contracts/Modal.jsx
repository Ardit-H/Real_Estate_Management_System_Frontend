import { useEffect } from "react";

export default function Modal({ title, onClose, children, wide=false }) {
  useEffect(()=>{
    const h=e=>e.key==="Escape"&&onClose();
    window.addEventListener("keydown",h);
    document.body.style.overflow="hidden";
    return()=>{ window.removeEventListener("keydown",h); document.body.style.overflow=""; };
  },[onClose]);

  return (
    <div
      onClick={e=>e.target===e.currentTarget&&onClose()}
      style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(8,6,4,0.84)",backdropFilter:"blur(14px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'DM Sans',sans-serif"}}
    >
      <div style={{width:"100%",maxWidth:wide?700:520,background:"#faf7f2",borderRadius:18,boxShadow:"0 44px 100px rgba(0,0,0,0.55)",maxHeight:"92vh",overflowY:"auto",animation:"ac-scale-in 0.26s ease"}}>
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