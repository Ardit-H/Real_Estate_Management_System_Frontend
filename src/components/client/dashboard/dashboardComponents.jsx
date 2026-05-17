import { useEffect } from "react";
import { PLACEHOLDER, fmtPrice, buildImg, TYPE_EMOJI } from "./dashboardConstants";

// Toast Component
export function Toast({ msg, type="success", onDone }) {
  useEffect(()=>{ const t=setTimeout(onDone,3000); return()=>clearTimeout(t); },[onDone]);
  return (
    <div style={{ position:"fixed", bottom:26, right:26, zIndex:9999, background:"#1a1714", color:type==="error"?"#f09090":"#90c8a8", padding:"11px 18px", borderRadius:12, fontSize:13, boxShadow:"0 10px 36px rgba(0,0,0,0.32)", border:`1px solid ${type==="error"?"rgba(240,128,128,0.15)":"rgba(144,200,168,0.15)"}`, maxWidth:320, fontFamily:"'DM Sans',sans-serif", animation:"cd-toast 0.2s ease", display:"flex", alignItems:"center", gap:8 }}>
      <span>{type==="error"?"⚠️":"✅"}</span>{msg}
    </div>
  );
}

// Shimmer Component
export function Shimmer({ h=60, r=12, w="100%" }) {
  return <div style={{ height:h, borderRadius:r, width:w, background:"linear-gradient(90deg,#ede9df 25%,#e4ddd0 50%,#ede9df 75%)", backgroundSize:"800px 100%", animation:"cd-shimmer 1.6s ease-in-out infinite" }}/>;
}

// Pill Component
export function Pill({ status, cfg }) {
  const s = cfg[status] || { dot:"#a0997e", bg:"rgba(160,153,126,0.1)", border:"rgba(160,153,126,0.22)", color:"#6b6248", label:status };
  return (
    <span style={{ background:s.bg, color:s.color, border:`1.5px solid ${s.border||s.bg}`, padding:"3px 10px", borderRadius:999, fontSize:10.5, fontWeight:700, display:"inline-flex", alignItems:"center", gap:5, textTransform:"uppercase", letterSpacing:"0.3px", whiteSpace:"nowrap" }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:s.dot, flexShrink:0 }}/>
      {s.label||status}
    </span>
  );
}

// Section Head Component
export function SectionHead({ title, sub, action, onAction }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:16, gap:10 }}>
      <div>
        <h2 style={{ margin:"0 0 3px", fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:22, fontWeight:700, color:"#1a1714", letterSpacing:"-0.3px" }}>{title}</h2>
        {sub && <p style={{ margin:0, fontSize:12, color:"#b0a890" }}>{sub}</p>}
      </div>
      {action && (
        <button className="cd-btn" onClick={onAction}
          style={{ background:"rgba(201,184,122,0.1)", border:"1px solid rgba(201,184,122,0.22)", color:"#c9b87a", padding:"6px 14px", borderRadius:9, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
          {action} →
        </button>
      )}
    </div>
  );
}

// Ring Component
export function Ring({ pct, size=56, stroke=5, color="#c9b87a", children }) {
  const r = (size-stroke*2)/2; const c = 2*Math.PI*r;
  const dash = Math.max(0,Math.min(100,pct))/100*c;
  return (
    <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e8e2d6" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
          style={{ transition:"stroke-dasharray 1s ease" }}/>
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
        {children}
      </div>
    </div>
  );
}

// MiniBar Component
export function MiniBar({ data, color="#c9b87a" }) {
  const max = Math.max(...data.map(d=>d.value),1);
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:4, height:36 }}>
      {data.map((d,i) => (
        <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
          <div style={{ width:"100%", background:color, borderRadius:"3px 3px 0 0", opacity:0.5+0.5*(d.value/max), height:`${(d.value/max)*32}px`, minHeight:d.value>0?4:1, transition:"height 0.6s ease" }}/>
          {d.label && <span style={{ fontSize:8, color:"#b0a890", whiteSpace:"nowrap" }}>{d.label}</span>}
        </div>
      ))}
    </div>
  );
}

// StatCard Component
export function StatCard({ icon, label, value, sub, color="#c9b87a", loading, onClick }) {
  return (
    <div className="cd-stat" onClick={onClick}
      style={{ background:"#fff", borderRadius:14, border:"1.5px solid #ece6da", padding:"18px 20px", boxShadow:"0 2px 16px rgba(20,16,10,0.07)", cursor:onClick?"pointer":"default", animation:"cd-fade-in 0.4s ease both" }}>
      <div style={{ width:40, height:40, borderRadius:11, background:`${color}18`, border:`1.5px solid ${color}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, marginBottom:12 }}>
        {icon}
      </div>
      {loading ? <Shimmer h={26} r={6}/> : (
        <div style={{ fontSize:28, fontWeight:700, color:"#1a1714", fontFamily:"'Cormorant Garamond',Georgia,serif", letterSpacing:"-0.5px", lineHeight:1 }}>
          {value ?? "—"}
        </div>
      )}
      <div style={{ marginTop:4, fontSize:11.5, color:"#b0a890", fontWeight:500 }}>{label}</div>
      {sub && <div style={{ marginTop:3, fontSize:11, color:"#9a8c6e" }}>{sub}</div>}
    </div>
  );
}

// PropCard Component
export function PropCard({ item, idx, onClick }) {
  const img = buildImg(item.primary_image||item.primaryImage) || PLACEHOLDER;
  const lt  = item.listing_type || item.listingType;
  const badge = { SALE:{label:"For Sale",dot:"#e2c97e"}, RENT:{label:"For Rent",dot:"#7eb8a4"}, BOTH:{label:"Sale & Rent",dot:"#a4b07e"} }[lt] || {label:lt||"",dot:"#9a8c6e"};
  return (
    <div className="cd-prop" onClick={onClick}
      style={{ background:"#fff", borderRadius:14, overflow:"hidden", border:"1.5px solid #ece6da", boxShadow:"0 2px 16px rgba(20,16,10,0.08)", animation:`cd-fade-in 0.4s ease ${idx*0.08}s both` }}>
      <div style={{ position:"relative", height:140, overflow:"hidden", background:"#ede9df" }}>
        <img src={img} alt={item.title} className="cd-img" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>{e.target.src=PLACEHOLDER;}}/>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(8,6,4,0.55) 0%, transparent 55%)" }}/>
        <span style={{ position:"absolute", top:8, left:8, background:"rgba(20,16,10,0.72)", backdropFilter:"blur(10px)", color:"#f5f0e8", fontSize:9.5, fontWeight:600, padding:"3px 10px", borderRadius:999, letterSpacing:"0.6px", textTransform:"uppercase", display:"flex", alignItems:"center", gap:4, border:`1px solid ${badge.dot}35` }}>
          <span style={{ width:4, height:4, borderRadius:"50%", background:badge.dot }}/>
          {badge.label}
        </span>
        <span style={{ position:"absolute", bottom:7, left:8, color:"rgba(245,240,232,0.7)", fontSize:10.5, display:"flex", alignItems:"center", gap:4 }}>
          {TYPE_EMOJI[item.type]||"🏠"} {item.type}
        </span>
      </div>
      <div style={{ padding:"12px 14px" }}>
        <p style={{ margin:"0 0 3px", fontSize:13.5, fontWeight:700, color:"#1a1714", fontFamily:"'Cormorant Garamond',Georgia,serif", lineHeight:1.2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.title}</p>
        {(item.city||item.country) && <p style={{ margin:"0 0 8px", fontSize:11, color:"#b0a890" }}>📍 {[item.city,item.country].filter(Boolean).join(", ")}</p>}
        <div style={{ fontSize:17, fontWeight:700, color:"#1a1714", fontFamily:"'Cormorant Garamond',Georgia,serif", letterSpacing:"-0.3px", marginBottom:8 }}>{fmtPrice(item.price)}</div>
        <div style={{ display:"flex", gap:10, color:"#9a8c6e", fontSize:11, paddingTop:8, borderTop:"1px solid #f0ece3" }}>
          {item.bedrooms!=null && <span>🛏 {item.bedrooms}</span>}
          {item.bathrooms!=null && <span>🚿 {item.bathrooms}</span>}
          {(item.area_sqm||item.areaSqm) && <span>📐 {item.area_sqm||item.areaSqm}m²</span>}
        </div>
      </div>
    </div>
  );
}

// QuickAction Component
export function QuickAction({ icon, label, desc, color, onClick }) {
  return (
    <div className="cd-qa" onClick={onClick}
      style={{ background:"#fff", border:`1.5px solid ${color}22`, borderRadius:14, padding:"18px 16px", boxShadow:"0 2px 12px rgba(20,16,10,0.06)", textAlign:"center" }}>
      <div style={{ width:48, height:48, borderRadius:14, background:`${color}14`, border:`1.5px solid ${color}28`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, margin:"0 auto 10px" }}>{icon}</div>
      <p style={{ margin:"0 0 4px", fontSize:13.5, fontWeight:700, color:"#1a1714", fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{label}</p>
      <p style={{ margin:0, fontSize:11.5, color:"#b0a890" }}>{desc}</p>
    </div>
  );
}