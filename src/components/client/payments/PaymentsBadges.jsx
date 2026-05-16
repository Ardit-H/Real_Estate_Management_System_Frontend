import { useEffect } from "react";
import { fmtMoney } from "./paymentsHelpers";

// Toast Component
export function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position:"fixed", bottom:26, right:26, zIndex:9999,
      background:"#1a1714", color:type==="error"?"#f09090":"#90c8a8",
      padding:"11px 18px", borderRadius:12, fontSize:13,
      boxShadow:"0 10px 36px rgba(0,0,0,0.32)",
      border:`1px solid ${type==="error"?"rgba(240,128,128,0.15)":"rgba(144,200,168,0.15)"}`,
      maxWidth:320, fontFamily:"'DM Sans',sans-serif",
      animation:"cp-toast 0.2s ease", display:"flex", alignItems:"center", gap:8,
    }}>
      <span style={{fontSize:14}}>{type==="error"?"⚠️":"✅"}</span>{msg}
    </div>
  );
}

// Skeleton Component
export function Skeleton({ count=4 }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {Array.from({ length:count }).map((_, i) => (
        <div key={i} style={{
          background:"linear-gradient(90deg,#ede9df 25%,#e4ddd0 50%,#ede9df 75%)",
          backgroundSize:"800px 100%", borderRadius:12, height:68,
          animation:"cp-shimmer 1.6s ease-in-out infinite",
        }}/>
      ))}
    </div>
  );
}

// Section Label Component
export function SectionLabel({ label, count, color }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
      <span style={{ fontSize:9.5, fontWeight:700, color, textTransform:"uppercase", letterSpacing:"1px" }}>{label}</span>
      <span style={{ background:`${color}14`, color, border:`1px solid ${color}30`, padding:"1px 9px", borderRadius:999, fontSize:10.5, fontWeight:700 }}>{count}</span>
      <div style={{ flex:1, height:"1px", background:`${color}18` }}/>
    </div>
  );
}