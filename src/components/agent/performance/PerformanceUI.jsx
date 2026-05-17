import { useEffect } from "react";
import { C } from "./performanceConstants.js";
 
export function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position:"fixed", bottom:26, right:26, zIndex:9999, background:C.dark, color:type==="error"?"#f09090":"#90c8a8", padding:"11px 18px", borderRadius:12, fontSize:13, boxShadow:"0 10px 36px rgba(0,0,0,0.32)", border:`1px solid ${type==="error"?"rgba(240,128,128,0.15)":"rgba(144,200,168,0.15)"}`, fontFamily:"'DM Sans',sans-serif", animation:"mp-toast 0.2s ease", display:"flex", alignItems:"center", gap:8 }}>
      {type === "error" ? "⚠️" : "✅"} {msg}
    </div>
  );
}
 
export function Skeleton({ rows = 3, h = 44 }) {
  return (
    <div style={{ padding:"14px 16px", display:"flex", flexDirection:"column", gap:8 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="mp-skeleton" style={{ height:h, opacity:1 - i * 0.15 }} />
      ))}
    </div>
  );
}
 
export function EmptyRow({ icon, text }) {
  return (
    <div style={{ padding:"36px 20px", textAlign:"center", color:C.textMut }}>
      <div style={{ fontSize:30, marginBottom:8 }}>{icon}</div>
      <p style={{ fontSize:13, margin:0 }}>{text}</p>
    </div>
  );
}
 
export function StatCard({ icon, label, value, accent = C.gold, sub, delta }) {
  return (
    <div className="mp-stat mp-card mp-btn" style={{ padding:"18px 20px", display:"flex", alignItems:"center", gap:14 }}>
      <div style={{ width:46, height:46, borderRadius:12, flexShrink:0, background:`${accent}18`, border:`1.5px solid ${accent}28`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{icon}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ margin:0, fontSize:10, fontWeight:600, color:C.textMut, textTransform:"uppercase", letterSpacing:"0.9px", marginBottom:3 }}>{label}</p>
        <p style={{ margin:0, fontSize:26, fontWeight:700, color:C.text, fontFamily:"'Cormorant Garamond',Georgia,serif", letterSpacing:"-0.5px", lineHeight:1 }}>{value ?? "—"}</p>
        {sub && <p style={{ margin:"4px 0 0", fontSize:11, color:C.muted }}>{sub}</p>}
        {delta != null && <p style={{ margin:"4px 0 0", fontSize:11, color:delta >= 0 ? "#059669" : "#dc2626", fontWeight:600 }}>{delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}% vs last month</p>}
      </div>
    </div>
  );
}
 
export function SectionHeader({ title, count, action, onAction }) {
  return (
    <div style={{ padding:"14px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", background:"#fdf9f4" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <p style={{ margin:0, fontSize:15, fontWeight:700, color:C.text, fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{title}</p>
        {count != null && <span style={{ background:`${C.gold}22`, color:C.textSub, padding:"2px 9px", borderRadius:20, fontSize:11, fontWeight:600 }}>{count}</span>}
      </div>
      {action && (
        <button className="mp-btn" onClick={onAction} style={{ padding:"6px 14px", borderRadius:9, background:C.dark, color:"#f5f0e8", fontSize:11.5, fontWeight:500 }}>{action}</button>
      )}
    </div>
  );
}
 
export function ProgressRing({ value = 0, max = 100, size = 80, color = C.gold, label }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(value / max, 1));
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#ede9df" strokeWidth={8} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={8} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" className="mp-progress-ring" />
      </svg>
      <span style={{ fontSize:11, color:C.textSub, fontWeight:500 }}>{label}</span>
    </div>
  );
}
 
export function BarRow({ label, value, max, accent, formatVal }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
        <span style={{ fontSize:12, color:C.textSub, fontWeight:500 }}>{label}</span>
        <span style={{ fontSize:12, color:C.text, fontWeight:600 }}>{formatVal ? formatVal(value) : value}</span>
      </div>
      <div className="mp-bar-wrap">
        <div className="mp-bar-fill" style={{ width:`${pct}%`, background:accent || C.gold }} />
      </div>
    </div>
  );
}
 