import { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/Layout";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE_URL    = import.meta.env.VITE_API_URL || "http://localhost:8080";
const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23ede9df' width='400' height='300'/%3E%3Cpath d='M160 195 L200 135 L240 195Z' fill='%23d4cfc3'/%3E%3Crect x='180' y='165' width='40' height='30' fill='%23c4bfb0'/%3E%3C/svg%3E";

const fmtPrice  = (v) => v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";
const fmtDate   = (d) => d ? new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : "—";
const buildImg  = (src) => src ? (src.startsWith("http")?src:BASE_URL+src) : null;
const daysUntil = (d) => d ? Math.ceil((new Date(d)-new Date())/(1000*60*60*24)) : null;

const TYPE_ICON   = { SELL:"🏷️", BUY:"🏠", RENT:"🔑", RENT_SEEKING:"🔎", VALUATION:"📊" };
const TYPE_EMOJI  = { APARTMENT:"🏢", HOUSE:"🏠", VILLA:"🏡", COMMERCIAL:"🏬", LAND:"🌿", OFFICE:"🏛️" };
const LEAD_STATUS_CFG = {
  NEW:         { dot:"#c9b87a", bg:"rgba(201,184,122,0.12)", border:"rgba(201,184,122,0.28)", color:"#9a7a30", label:"New"         },
  IN_PROGRESS: { dot:"#a4b07e", bg:"rgba(164,176,126,0.12)", border:"rgba(164,176,126,0.28)", color:"#4a5a30", label:"In Progress" },
  DONE:        { dot:"#7eb8a4", bg:"rgba(126,184,164,0.12)", border:"rgba(126,184,164,0.28)", color:"#2a6049", label:"Done"        },
  REJECTED:    { dot:"#d4855a", bg:"rgba(212,133,90,0.12)",  border:"rgba(212,133,90,0.28)",  color:"#8b4513", label:"Rejected"    },
};
const CONTRACT_STATUS_CFG = {
  ACTIVE:            { dot:"#7eb8a4", color:"#2a6049", bg:"rgba(126,184,164,0.12)", border:"rgba(126,184,164,0.28)" },
  PENDING_SIGNATURE: { dot:"#c9b87a", color:"#9a7a30", bg:"rgba(201,184,122,0.12)", border:"rgba(201,184,122,0.28)" },
  ENDED:             { dot:"#a0997e", color:"#6b6248", bg:"rgba(160,153,126,0.1)",  border:"rgba(160,153,126,0.22)" },
  CANCELLED:         { dot:"#d4855a", color:"#8b4513", bg:"rgba(212,133,90,0.12)",  border:"rgba(212,133,90,0.28)"  },
};
const PAY_STATUS_CFG = {
  PENDING:  { dot:"#c9b87a", color:"#9a7a30", bg:"rgba(201,184,122,0.1)"  },
  PAID:     { dot:"#7eb8a4", color:"#2a6049", bg:"rgba(126,184,164,0.1)"  },
  OVERDUE:  { dot:"#d4855a", color:"#8b4513", bg:"rgba(212,133,90,0.12)"  },
  FAILED:   { dot:"#d4855a", color:"#8b4513", bg:"rgba(212,133,90,0.1)"   },
  REFUNDED: { dot:"#a0997e", color:"#6b6248", bg:"rgba(160,153,126,0.1)"  },
};

// ─── Global CSS ───────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  .cd * { box-sizing: border-box; }
  .cd { font-family: 'DM Sans', system-ui, sans-serif; background: #f2ede4; min-height: 100vh; }

  /* Stat cards */
  .cd-stat { transition: transform 0.22s ease, box-shadow 0.22s ease; cursor: default; }
  .cd-stat:hover { transform: translateY(-5px); box-shadow: 0 20px 44px rgba(20,16,10,0.13) !important; }

  /* Property cards */
  .cd-prop { transition: transform 0.25s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.25s ease; cursor: pointer; }
  .cd-prop:hover { transform: translateY(-6px); box-shadow: 0 28px 60px rgba(20,16,10,0.16) !important; }
  .cd-prop:hover .cd-img { transform: scale(1.06); }
  .cd-img { transition: transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94); }

  /* Buttons */
  .cd-btn { transition: all 0.17s ease; }
  .cd-btn:hover { opacity: 0.85; transform: translateY(-1px); }

  /* Section items */
  .cd-item { transition: background 0.14s ease; }
  .cd-item:hover { background: #faf7f2 !important; }

  /* Quick action cards */
  .cd-qa { transition: all 0.2s ease; cursor: pointer; }
  .cd-qa:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(20,16,10,0.12) !important; }

  /* Animations */
  @keyframes cd-spin     { to{transform:rotate(360deg)} }
  @keyframes cd-toast    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes cd-shimmer  { 0%{background-position:-800px 0} 100%{background-position:800px 0} }
  @keyframes cd-fade-in  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes cd-glow     { 0%,100%{opacity:0.07} 50%{opacity:0.14} }
  @keyframes cd-pulse-dot{ 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.4);opacity:0.6} }
  @keyframes cd-bar-grow { from{width:0} to{width:var(--w)} }
  @keyframes cd-count-up { from{opacity:0;transform:scale(0.85)} to{opacity:1;transform:scale(1)} }
`;

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type="success", onDone }) {
  useEffect(()=>{ const t=setTimeout(onDone,3000); return()=>clearTimeout(t); },[onDone]);
  return (
    <div style={{ position:"fixed", bottom:26, right:26, zIndex:9999, background:"#1a1714", color:type==="error"?"#f09090":"#90c8a8", padding:"11px 18px", borderRadius:12, fontSize:13, boxShadow:"0 10px 36px rgba(0,0,0,0.32)", border:`1px solid ${type==="error"?"rgba(240,128,128,0.15)":"rgba(144,200,168,0.15)"}`, maxWidth:320, fontFamily:"'DM Sans',sans-serif", animation:"cd-toast 0.2s ease", display:"flex", alignItems:"center", gap:8 }}>
      <span>{type==="error"?"⚠️":"✅"}</span>{msg}
    </div>
  );
}

// ─── Shimmer skeleton ─────────────────────────────────────────────────────────
function Shimmer({ h=60, r=12, w="100%" }) {
  return <div style={{ height:h, borderRadius:r, width:w, background:"linear-gradient(90deg,#ede9df 25%,#e4ddd0 50%,#ede9df 75%)", backgroundSize:"800px 100%", animation:"cd-shimmer 1.6s ease-in-out infinite" }}/>;
}

// ─── Mini badge ───────────────────────────────────────────────────────────────
function Pill({ status, cfg }) {
  const s = cfg[status] || { dot:"#a0997e", bg:"rgba(160,153,126,0.1)", border:"rgba(160,153,126,0.22)", color:"#6b6248", label:status };
  return (
    <span style={{ background:s.bg, color:s.color, border:`1.5px solid ${s.border||s.bg}`, padding:"3px 10px", borderRadius:999, fontSize:10.5, fontWeight:700, display:"inline-flex", alignItems:"center", gap:5, textTransform:"uppercase", letterSpacing:"0.3px" }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:s.dot, boxShadow:`0 0 5px ${s.dot}`, flexShrink:0 }}/>
      {s.label||status}
    </span>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHead({ title, sub, action, onAction }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:16, gap:10 }}>
      <div>
        <h2 style={{ margin:"0 0 3px", fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:22, fontWeight:700, color:"#1a1714", letterSpacing:"-0.3px" }}>{title}</h2>
        {sub && <p style={{ margin:0, fontSize:12, color:"#b0a890" }}>{sub}</p>}
      </div>
      {action && (
        <button className="cd-btn" onClick={onAction}
          style={{ background:"rgba(201,184,122,0.1)", border:"1px solid rgba(201,184,122,0.22)", color:"#c9b87a", padding:"6px 14px", borderRadius:9, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:5 }}>
          {action} →
        </button>
      )}
    </div>
  );
}

// ─── Animated counter ────────────────────────────────────────────────────────
function AnimCount({ value, prefix="", suffix="" }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0; const end = Number(value)||0; if (end===0) { setDisplay(0); return; }
    const dur = 800; const step = dur/60;
    const inc = end/60;
    const timer = setInterval(()=>{
      start += inc;
      if (start >= end) { setDisplay(end); clearInterval(timer); }
      else setDisplay(Math.round(start));
    }, step);
    return ()=>clearInterval(timer);
  }, [value]);
  return <span style={{ animation:"cd-count-up 0.4s ease" }}>{prefix}{display.toLocaleString()}{suffix}</span>;
}

// ─── Mini bar chart ───────────────────────────────────────────────────────────
function MiniBar({ data, color="#c9b87a" }) {
  const max = Math.max(...data.map(d=>d.value),1);
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:4, height:36 }}>
      {data.map((d,i) => (
        <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
          <div style={{ width:"100%", background:color, borderRadius:"3px 3px 0 0", opacity:0.7+0.3*(d.value/max), transition:"height 0.6s ease", height:`${(d.value/max)*32}px`, minHeight:d.value>0?4:1 }}/>
          {d.label && <span style={{ fontSize:8, color:"#b0a890", whiteSpace:"nowrap" }}>{d.label}</span>}
        </div>
      ))}
    </div>
  );
}

// ─── Progress ring ────────────────────────────────────────────────────────────
function Ring({ pct, size=56, stroke=5, color="#c9b87a", children }) {
  const r = (size-stroke*2)/2; const c = 2*Math.PI*r;
  const dash = (pct/100)*c;
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

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color="#c9b87a", trend, loading, sparkData, onClick }) {
  return (
    <div className="cd-stat" onClick={onClick}
      style={{ background:"#fff", borderRadius:14, border:"1.5px solid #ece6da", padding:"18px 20px", boxShadow:"0 2px 16px rgba(20,16,10,0.07)", cursor:onClick?"pointer":"default", animation:"cd-fade-in 0.4s ease both" }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:12 }}>
        <div style={{ width:40, height:40, borderRadius:11, background:`${color}18`, border:`1.5px solid ${color}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>
          {icon}
        </div>
        {trend != null && (
          <span style={{ fontSize:11, fontWeight:600, color:trend>=0?"#2a6049":"#8b4513", background:trend>=0?"rgba(126,184,164,0.1)":"rgba(212,133,90,0.1)", padding:"2px 8px", borderRadius:999 }}>
            {trend>=0?"↑":"↓"} {Math.abs(trend)}%
          </span>
        )}
      </div>
      {loading ? <Shimmer h={28} r={6}/> : (
        <div style={{ fontSize:28, fontWeight:700, color:"#1a1714", fontFamily:"'Cormorant Garamond',Georgia,serif", letterSpacing:"-0.5px", lineHeight:1 }}>
          <AnimCount value={value}/>
        </div>
      )}
      <div style={{ marginTop:4, fontSize:11.5, color:"#b0a890", fontWeight:500 }}>{label}</div>
      {sub && <div style={{ marginTop:3, fontSize:11, color:"#9a8c6e" }}>{sub}</div>}
      {sparkData && !loading && <div style={{ marginTop:10 }}><MiniBar data={sparkData} color={color}/></div>}
    </div>
  );
}

// ─── Property Mini Card ───────────────────────────────────────────────────────
function PropCard({ item, idx }) {
  const navigate = useNavigate();
  const img = buildImg(item.primary_image||item.primaryImage) || PLACEHOLDER;
  const badge = { SALE:{label:"For Sale",dot:"#e2c97e"}, RENT:{label:"For Rent",dot:"#7eb8a4"}, BOTH:{label:"Sale & Rent",dot:"#a4b07e"} }[item.listing_type||item.listingType] || {label:item.listing_type||"",dot:"#9a8c6e"};

  return (
    <div className="cd-prop" onClick={()=>navigate("/client/browseproperties")}
      style={{ background:"#fff", borderRadius:14, overflow:"hidden", border:"1.5px solid #ece6da", boxShadow:"0 2px 16px rgba(20,16,10,0.08)", animation:`cd-fade-in 0.4s ease ${idx*0.08}s both` }}>
      <div style={{ position:"relative", height:140, overflow:"hidden", background:"#ede9df" }}>
        <img src={img} alt={item.title} className="cd-img" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>{e.target.src=PLACEHOLDER;}}/>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(8,6,4,0.55) 0%, transparent 55%)" }}/>
        <span style={{ position:"absolute", top:8, left:8, background:"rgba(20,16,10,0.72)", backdropFilter:"blur(10px)", color:"#f5f0e8", fontSize:9.5, fontWeight:600, padding:"3px 10px", borderRadius:999, letterSpacing:"0.6px", textTransform:"uppercase", display:"flex", alignItems:"center", gap:4, border:`1px solid ${badge.dot}35` }}>
          <span style={{ width:4, height:4, borderRadius:"50%", background:badge.dot, boxShadow:`0 0 5px ${badge.dot}` }}/>
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

// ─── Activity item ────────────────────────────────────────────────────────────
function ActivityItem({ icon, title, sub, time, dot="#c9b87a", idx }) {
  return (
    <div className="cd-item" style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"11px 14px", borderRadius:10, animation:`cd-fade-in 0.35s ease ${idx*0.06}s both` }}>
      <div style={{ width:34, height:34, borderRadius:10, background:`${dot}18`, border:`1.5px solid ${dot}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>{icon}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ margin:"0 0 2px", fontSize:13, fontWeight:600, color:"#1a1714", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{title}</p>
        <p style={{ margin:0, fontSize:11.5, color:"#9a8c6e" }}>{sub}</p>
      </div>
      <span style={{ fontSize:11, color:"#b0a890", whiteSpace:"nowrap", flexShrink:0 }}>{time}</span>
    </div>
  );
}

// ─── Quick action card ────────────────────────────────────────────────────────
function QuickAction({ icon, label, desc, color, onClick }) {
  return (
    <div className="cd-qa" onClick={onClick}
      style={{ background:"#fff", border:`1.5px solid ${color}22`, borderRadius:14, padding:"18px 16px", boxShadow:"0 2px 12px rgba(20,16,10,0.06)", textAlign:"center" }}>
      <div style={{ width:48, height:48, borderRadius:14, background:`${color}14`, border:`1.5px solid ${color}28`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, margin:"0 auto 10px" }}>{icon}</div>
      <p style={{ margin:"0 0 4px", fontSize:13.5, fontWeight:700, color:"#1a1714", fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{label}</p>
      <p style={{ margin:0, fontSize:11.5, color:"#b0a890" }}>{desc}</p>
    </div>
  );
}

// ─── Profile update modal ─────────────────────────────────────────────────────
function ProfileModal({ user, profile, onClose, onSuccess, notify }) {
  const [form, setForm] = useState({
    first_name: user?.first_name||"",
    last_name:  user?.last_name||"",
    email:      user?.email||"",
    phone:           profile?.phone||"",
    preferred_contact: profile?.preferred_contact||"EMAIL",
    budget_min:  profile?.budget_min||"",
    budget_max:  profile?.budget_max||"",
    preferred_type: profile?.preferred_type||"",
    preferred_city: profile?.preferred_city||"",
  });
  const [saving, setSaving] = useState(false);
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  useEffect(()=>{
    const h=(e)=>e.key==="Escape"&&onClose();
    window.addEventListener("keydown",h); return()=>window.removeEventListener("keydown",h);
  },[onClose]);
  useEffect(()=>{ document.body.style.overflow="hidden"; return()=>{ document.body.style.overflow=""; }; },[]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        api.put("/api/users/me",{ first_name:form.first_name, last_name:form.last_name, email:form.email }),
        api.put("/api/users/clients/me",{
          phone:            form.phone||null,
          preferred_contact:form.preferred_contact||null,
          budget_min:       form.budget_min?Number(form.budget_min):null,
          budget_max:       form.budget_max?Number(form.budget_max):null,
          preferred_type:   form.preferred_type||null,
          preferred_city:   form.preferred_city||null,
        }),
      ]);
      onSuccess();
    } catch(err) { notify(err.response?.data?.message||"Error saving profile","error"); }
    finally { setSaving(false); }
  };

  const INP = { width:"100%", padding:"10px 13px", border:"1.5px solid #e4ddd0", borderRadius:10, fontSize:13.5, color:"#1a1714", background:"#fff", fontFamily:"'DM Sans',sans-serif", outline:"none", transition:"border-color 0.2s" };
  const ML  = { display:"block", fontSize:10.5, fontWeight:600, color:"#9a8c6e", textTransform:"uppercase", letterSpacing:"0.7px", marginBottom:6, fontFamily:"'DM Sans',sans-serif" };
  const R2  = { display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 };

  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()}
      style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(8,6,4,0.84)", backdropFilter:"blur(14px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ width:"100%", maxWidth:560, background:"#faf7f2", borderRadius:18, boxShadow:"0 44px 100px rgba(0,0,0,0.55)", maxHeight:"92vh", overflowY:"auto", animation:"cd-fade-in 0.26s ease" }}>
        <div style={{ background:"linear-gradient(160deg,#141210 0%,#1e1a14 45%,#241e16 100%)", padding:"20px 26px", borderRadius:"18px 18px 0 0", display:"flex", alignItems:"center", justifyContent:"space-between", position:"relative", overflow:"hidden" }}>
          <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,0.018) 1px,transparent 1px)",backgroundSize:"22px 22px",pointerEvents:"none"}}/>
          <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:"linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)"}}/>
          <p style={{ position:"relative", fontFamily:"'Cormorant Garamond',Georgia,serif", fontWeight:700, fontSize:19, margin:0, color:"#f5f0e8" }}>Edit Profile</p>
          <button onClick={onClose} style={{ position:"relative", background:"rgba(245,240,232,0.08)", border:"1px solid rgba(245,240,232,0.12)", borderRadius:9, width:32, height:32, cursor:"pointer", color:"rgba(245,240,232,0.6)", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        </div>
        <div style={{ padding:"22px 26px" }}>
          <p style={{ fontSize:10.5, fontWeight:600, color:"#b0a890", textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:14 }}>Personal Info</p>
          <div style={R2}>
            <div><label style={ML}>First Name</label><input style={INP} value={form.first_name} onChange={e=>set("first_name",e.target.value)}/></div>
            <div><label style={ML}>Last Name</label><input style={INP} value={form.last_name} onChange={e=>set("last_name",e.target.value)}/></div>
          </div>
          <div style={{ marginBottom:14 }}><label style={ML}>Email</label><input style={INP} type="email" value={form.email} onChange={e=>set("email",e.target.value)}/></div>

          <p style={{ fontSize:10.5, fontWeight:600, color:"#b0a890", textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:14, marginTop:6, borderTop:"1px solid #e8e2d6", paddingTop:16 }}>Preferences</p>
          <div style={R2}>
            <div><label style={ML}>Phone</label><input style={INP} value={form.phone} onChange={e=>set("phone",e.target.value)} placeholder="+383..."/></div>
            <div><label style={ML}>Preferred Contact</label>
              <select style={{ ...INP, cursor:"pointer" }} value={form.preferred_contact} onChange={e=>set("preferred_contact",e.target.value)}>
                <option value="EMAIL">Email</option><option value="PHONE">Phone</option><option value="WHATSAPP">WhatsApp</option>
              </select>
            </div>
          </div>
          <div style={R2}>
            <div><label style={ML}>Budget Min (€)</label><input style={INP} type="number" value={form.budget_min} onChange={e=>set("budget_min",e.target.value)} placeholder="50000"/></div>
            <div><label style={ML}>Budget Max (€)</label><input style={INP} type="number" value={form.budget_max} onChange={e=>set("budget_max",e.target.value)} placeholder="200000"/></div>
          </div>
          <div style={R2}>
            <div><label style={ML}>Preferred Type</label><input style={INP} value={form.preferred_type} onChange={e=>set("preferred_type",e.target.value)} placeholder="APARTMENT"/></div>
            <div><label style={ML}>Preferred City</label><input style={INP} value={form.preferred_city} onChange={e=>set("preferred_city",e.target.value)} placeholder="Prishtinë"/></div>
          </div>
          <div style={{ display:"flex", gap:9, justifyContent:"flex-end", borderTop:"1px solid #e8e2d6", paddingTop:18, marginTop:6 }}>
            <button onClick={onClose} className="cd-btn"
              style={{ padding:"10px 18px", borderRadius:10, border:"1.5px solid #e4ddd0", background:"transparent", color:"#6b6248", fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} className="cd-btn"
              style={{ padding:"10px 22px", borderRadius:10, background:"linear-gradient(135deg,#c9b87a,#b0983e)", color:"#1a1714", border:"none", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
              {saving ? "Saving…" : "✓ Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
export default function ClientDashboard() {
  const { user } = useContext(AuthContext);
  const navigate  = useNavigate();

  // ── State ──────────────────────────────────────────────────────────────────
  const [clientProfile,  setClientProfile]  = useState(null);
  const [savedProps,     setSavedProps]      = useState([]);
  const [leads,          setLeads]           = useState([]);
  const [contracts,      setContracts]       = useState([]);
  const [payments,       setPayments]        = useState([]);
  const [saleApps,       setSaleApps]        = useState([]);
  const [rentalApps,     setRentalApps]      = useState([]);
  const [featuredProps,  setFeaturedProps]   = useState([]);
  const [loading,        setLoading]         = useState(true);
  const [profileOpen,    setProfileOpen]     = useState(false);
  const [toast,          setToast]           = useState(null);
  const [greeting,       setGreeting]        = useState("Good morning");

  const notify = useCallback((msg,type="success")=>setToast({msg,type,key:Date.now()}),[]);

  // ── Greeting ───────────────────────────────────────────────────────────────
  useEffect(()=>{
    const h = new Date().getHours();
    if (h<12) setGreeting("Good morning");
    else if (h<17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  },[]);

  // ── Data fetch ─────────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        api.get("/api/users/clients/me"),
        api.get("/api/properties/saved?page=0&size=6"),
        api.get("/api/leads/my/client?page=0&size=10"),
        api.get(`/api/contracts/lease/client/${user?.id}?page=0&size=5`),
        api.get("/api/rentals/applications/my?page=0&size=5"),
        api.get("/api/sales/applications/my?page=0&size=5"),
        api.get("/api/properties/filter?page=0&size=6&status=AVAILABLE&isFeatured=true"),
      ]);

      if (results[0].status==="fulfilled") setClientProfile(results[0].value.data);
      if (results[1].status==="fulfilled") setSavedProps(results[1].value.data?.content||[]);
      if (results[2].status==="fulfilled") setLeads(results[2].value.data?.content||[]);
      if (results[3].status==="fulfilled") {
        const contracts = results[3].value.data?.content||[];
        setContracts(contracts);
        // load payments for first active contract
        const active = contracts.find(c=>c.status==="ACTIVE");
        if (active) {
          try {
            const pRes = await api.get(`/api/payments/contract/${active.id}`);
            setPayments(Array.isArray(pRes.data)?pRes.data:[]);
          } catch {}
        }
      }
      if (results[4].status==="fulfilled") setRentalApps(results[4].value.data?.content||[]);
      if (results[5].status==="fulfilled") setSaleApps(results[5].value.data?.content||[]);
      if (results[6].status==="fulfilled") setFeaturedProps(results[6].value.data?.content||[]);
    } catch {}
    finally { setLoading(false); }
  }, [user?.id]);

  useEffect(() => { if (user?.id) loadAll(); }, [loadAll, user?.id]);

  // ── Computed stats ─────────────────────────────────────────────────────────
  const activeContracts   = contracts.filter(c=>c.status==="ACTIVE").length;
  const pendingLeads      = leads.filter(l=>l.status==="NEW"||l.status==="IN_PROGRESS").length;
  const overduePayments   = payments.filter(p=>p.status==="OVERDUE"||(p.status==="PENDING"&&p.due_date&&new Date(p.due_date)<new Date())).length;
  const pendingApps       = [...rentalApps,...saleApps].filter(a=>a.status==="PENDING").length;
  const totalRent         = contracts.filter(c=>c.status==="ACTIVE").reduce((s,c)=>s+Number(c.rent||0),0);

  // Build monthly payment trend (last 6 months from payments)
  const sparkPayments = (() => {
    const months = Array.from({length:6},(_,i)=>{ const d=new Date(); d.setMonth(d.getMonth()-5+i); return { label:d.toLocaleDateString("en-GB",{month:"short"}), value:0, key:`${d.getFullYear()}-${d.getMonth()}` }; });
    payments.filter(p=>p.status==="PAID"&&p.paid_date).forEach(p=>{ const d=new Date(p.paid_date); const k=`${d.getFullYear()}-${d.getMonth()}`; const m=months.find(m=>m.key===k); if(m) m.value+=Number(p.amount||0); });
    return months;
  })();

  const activeContract = contracts.find(c=>c.status==="ACTIVE");
  const nextPayment    = payments.find(p=>p.status==="PENDING");
  const days           = activeContract ? daysUntil(activeContract.end_date) : null;
  const contractPct    = activeContract
    ? Math.round(((new Date()-new Date(activeContract.start_date))/(new Date(activeContract.end_date)-new Date(activeContract.start_date)))*100)
    : 0;

  // ── Activities feed ────────────────────────────────────────────────────────
  const activities = [
    ...leads.slice(0,3).map(l=>({ icon:TYPE_ICON[l.type]||"📋", title:`${l.type} request ${l.status==="DONE"?"completed":"submitted"}`, sub:`Lead #${l.id}${l.agent_name?` · Agent: ${l.agent_name}`:""}`, time:fmtDate(l.created_at), dot: LEAD_STATUS_CFG[l.status]?.dot||"#c9b87a" })),
    ...rentalApps.slice(0,2).map(a=>({ icon:"🔑", title:`Rental application ${a.status.toLowerCase()}`, sub:`Listing #${a.listing_id} · ${a.status}`, time:fmtDate(a.created_at), dot: a.status==="APPROVED"?"#7eb8a4":a.status==="REJECTED"?"#d4855a":"#c9b87a" })),
    ...saleApps.slice(0,2).map(a=>({ icon:"🏠", title:`Purchase application ${a.status.toLowerCase()}`, sub:`Property #${a.property_id}`, time:fmtDate(a.created_at), dot: a.status==="APPROVED"?"#7eb8a4":a.status==="REJECTED"?"#d4855a":"#c9b87a" })),
  ].sort((a,b)=>new Date(b.raw||0)-new Date(a.raw||0)).slice(0,6);

  const firstName = user?.first_name || "there";



  return (
    <MainLayout role="client">
      <style>{CSS}</style>
      <div className="cd">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <div style={{ background:"linear-gradient(160deg,#141210 0%,#1e1a14 45%,#241e16 100%)", minHeight:280, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"36px 32px", position:"relative", overflow:"hidden" }}>
          <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,0.018) 1px,transparent 1px)",backgroundSize:"22px 22px",pointerEvents:"none"}}/>
          <div style={{position:"absolute",top:"-60px",left:"8%",width:320,height:320,borderRadius:"50%",background:"radial-gradient(circle,rgba(201,184,122,0.07) 0%,transparent 70%)",pointerEvents:"none",animation:"cd-glow 4s ease-in-out infinite"}}/>
          <div style={{position:"absolute",bottom:"-40px",right:"8%",width:260,height:260,borderRadius:"50%",background:"radial-gradient(circle,rgba(126,184,164,0.05) 0%,transparent 70%)",pointerEvents:"none",animation:"cd-glow 4s ease-in-out infinite 2s"}}/>
          <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:"linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)"}}/>

          {/* Edit profile button */}
          <button onClick={()=>setProfileOpen(true)} className="cd-btn"
            style={{ position:"absolute", top:18, right:24, padding:"7px 14px", background:"rgba(201,184,122,0.08)", color:"rgba(245,240,232,0.55)", border:"1px solid rgba(201,184,122,0.15)", borderRadius:9, fontSize:11.5, fontWeight:500, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", gap:6, zIndex:2 }}>
            ✏️ Edit Profile
          </button>

          <div style={{ position:"relative", zIndex:1, maxWidth:700, width:"100%", textAlign:"center" }}>
            {/* Avatar + greeting */}
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(201,184,122,0.1)", border:"1px solid rgba(201,184,122,0.18)", borderRadius:999, padding:"5px 16px 5px 8px", marginBottom:16 }}>
              <div style={{ width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg,#c9b87a,#b0983e)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"#1a1714" }}>
                {firstName[0]?.toUpperCase()}
              </div>
              <span style={{ fontSize:11, fontWeight:600, color:"#c9b87a", letterSpacing:"0.8px" }}>{greeting}, {firstName}</span>
            </div>

            <h1 style={{ margin:"0 0 10px", fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"clamp(26px,3.5vw,42px)", fontWeight:700, color:"#f5f0e8", letterSpacing:"-0.7px", lineHeight:1.1 }}>
              Your{" "}
              <span style={{ background:"linear-gradient(90deg,#c9b87a,#e8d9a0,#c9b87a)", backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>Real Estate</span>
              {" "}Dashboard
            </h1>

            <p style={{ margin:"0 auto 28px", fontSize:13.5, color:"rgba(245,240,232,0.38)", lineHeight:1.6 }}>
              Everything about your properties, contracts and applications — at a glance.
            </p>

            {/* Quick stat pills */}
            {!loading && (
              <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
                {[
                  { label:"Saved",    value:savedProps.length,  dot:"#c9b87a" },
                  { label:"Requests", value:leads.length,       dot:"#a4b07e" },
                  { label:"Contracts",value:contracts.length,   dot:"#7eb8a4" },
                  { label:"Overdue",  value:overduePayments,    dot: overduePayments>0?"#d4855a":"#a0997e" },
                ].map(s=>(
                  <div key={s.label} style={{ background:"rgba(245,240,232,0.06)", backdropFilter:"blur(10px)", borderRadius:12, padding:"9px 16px", border:"1px solid rgba(245,240,232,0.1)", display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                    <span style={{ fontSize:20, fontWeight:700, color:s.dot, fontFamily:"'Cormorant Garamond',Georgia,serif", lineHeight:1 }}>{s.value}</span>
                    <span style={{ fontSize:10, color:"rgba(245,240,232,0.35)", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.8px" }}>{s.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Single-column content ────────────────────────────────────────── */}
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"24px 24px 48px" }}>

          {/* Stat cards row */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(175px,1fr))", gap:12, marginBottom:28 }}>
            <StatCard icon="❤️" label="Saved Properties" value={savedProps.length} color="#d4855a" loading={loading} onClick={()=>navigate("/client/savedproperties")}/>
            <StatCard icon="📋" label="Active Requests" value={pendingLeads} sub={`${leads.length} total`} color="#c9b87a" loading={loading} onClick={()=>navigate("/client/leads")}/>
            <StatCard icon="📄" label="Active Contracts" value={activeContracts} sub={totalRent>0?`€${totalRent.toLocaleString("de-DE")}/mo`:undefined} color="#7eb8a4" loading={loading} onClick={()=>navigate("/client/contracts")}/>
            <StatCard icon="💳" label="Overdue Payments" value={overduePayments} color={overduePayments>0?"#d4855a":"#a4b07e"} loading={loading} onClick={()=>navigate("/client/payments")}/>
            <StatCard icon="✉️" label="Pending Applications" value={pendingApps} color="#a4b07e" loading={loading}/>
          </div>

          {/* Two column row */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:28 }}>

            {/* Active contract widget */}
            <div style={{ background:"#fff", borderRadius:14, border:"1.5px solid #ece6da", padding:"18px 20px", boxShadow:"0 2px 16px rgba(20,16,10,0.07)" }}>
              <p style={{ fontSize:10, fontWeight:700, color:"#b0a890", textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:12 }}>📄 Active Contract</p>
              {loading ? <><Shimmer h={20} r={6}/><div style={{marginTop:8}}/><Shimmer h={20} r={6} w="70%"/></> :
               activeContract ? (
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                    <Ring pct={Math.max(0,Math.min(100,contractPct))} size={60} color="#7eb8a4">
                      <span style={{ fontSize:11, fontWeight:700, color:"#2a6049" }}>{Math.max(0,Math.min(100,contractPct))}%</span>
                    </Ring>
                    <div>
                      <p style={{ margin:"0 0 3px", fontSize:15, fontWeight:700, color:"#1a1714", fontFamily:"'Cormorant Garamond',Georgia,serif" }}>Property #{activeContract.property_id}</p>
                      <p style={{ margin:0, fontSize:12, color:"#9a8c6e" }}>{fmtDate(activeContract.start_date)} → {fmtDate(activeContract.end_date)}</p>
                    </div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    {[
                      { label:"Monthly Rent", value:fmtPrice(activeContract.rent) },
                      { label:"Deposit",      value:fmtPrice(activeContract.deposit) },
                      { label:"Days Left",    value:days!=null?`${days}d`:"—" },
                      { label:"Status",       value:<Pill status={activeContract.status} cfg={CONTRACT_STATUS_CFG}/> },
                    ].map(({label,value})=>(
                      <div key={label} style={{ background:"#f8f5f0", borderRadius:8, padding:"9px 11px" }}>
                        <p style={{ fontSize:9.5, color:"#b0a890", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.7px", marginBottom:3 }}>{label}</p>
                        <div style={{ fontSize:13, fontWeight:700, color:"#1a1714", fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{value}</div>
                      </div>
                    ))}
                  </div>
                  {days!=null&&days<=30&&days>0&&(
                    <div style={{ marginTop:12, background:"rgba(201,184,122,0.08)", border:"1.5px solid rgba(201,184,122,0.22)", borderRadius:9, padding:"8px 12px", fontSize:12, color:"#c9b87a", display:"flex", alignItems:"center", gap:6 }}>
                      ⚠️ Contract expires in <strong>{days} days</strong>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign:"center", padding:"24px 0", color:"#b0a890" }}>
                  <p style={{ fontSize:13.5, fontFamily:"'Cormorant Garamond',Georgia,serif", color:"#8a7d5e", fontStyle:"italic" }}>No active contracts</p>
                  <button className="cd-btn" onClick={()=>navigate("/client/browseproperties")}
                    style={{ marginTop:10, background:"linear-gradient(135deg,#c9b87a,#b0983e)", color:"#1a1714", border:"none", borderRadius:9, padding:"7px 16px", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                    Browse Properties →
                  </button>
                </div>
              )}
            </div>

            {/* Next payment widget */}
            <div style={{ background:"#fff", borderRadius:14, border:"1.5px solid #ece6da", padding:"18px 20px", boxShadow:"0 2px 16px rgba(20,16,10,0.07)" }}>
              <p style={{ fontSize:10, fontWeight:700, color:"#b0a890", textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:12 }}>💳 Payment Overview</p>
              {loading ? <><Shimmer h={20} r={6}/><div style={{marginTop:8}}/><Shimmer h={40} r={6}/></> : (
                <div>
                  {nextPayment ? (
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14, padding:"12px 14px", background: nextPayment.status==="OVERDUE"||new Date(nextPayment.due_date)<new Date() ? "rgba(212,133,90,0.08)" : "rgba(201,184,122,0.08)", borderRadius:10, border:`1.5px solid ${nextPayment.status==="OVERDUE"?"rgba(212,133,90,0.25)":"rgba(201,184,122,0.22)"}` }}>
                      <div style={{ fontSize:28, fontWeight:700, color:"#1a1714", fontFamily:"'Cormorant Garamond',Georgia,serif", letterSpacing:"-0.5px" }}>{fmtPrice(nextPayment.amount)}</div>
                      <div style={{ flex:1 }}>
                        <p style={{ margin:"0 0 3px", fontSize:11, color:"#b0a890", textTransform:"uppercase", letterSpacing:"0.6px", fontWeight:600 }}>Next Due</p>
                        <p style={{ margin:0, fontSize:13, color:"#1a1714", fontWeight:600 }}>{fmtDate(nextPayment.due_date)}</p>
                      </div>
                      <Pill status={nextPayment.status==="PENDING"&&new Date(nextPayment.due_date)<new Date()?"OVERDUE":nextPayment.status} cfg={PAY_STATUS_CFG}/>
                    </div>
                  ) : (
                    <p style={{ fontSize:13.5, fontFamily:"'Cormorant Garamond',Georgia,serif", color:"#8a7d5e", fontStyle:"italic", marginBottom:14 }}>No pending payments</p>
                  )}
                  {sparkPayments.some(s=>s.value>0) && (
                    <div>
                      <p style={{ fontSize:10, color:"#b0a890", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.7px", marginBottom:8 }}>Payment Trend (6mo)</p>
                      <MiniBar data={sparkPayments} color="#7eb8a4"/>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ marginBottom:28 }}>
            <SectionHead title="Quick Actions" sub="Jump to any section"/>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:12 }}>
              <QuickAction icon="🏠" label="Browse" desc="Find properties" color="#c9b87a" onClick={()=>navigate("/client/browseproperties")}/>
              <QuickAction icon="❤️" label="Saved" desc="Your favourites" color="#d4855a" onClick={()=>navigate("/client/savedproperties")}/>
              <QuickAction icon="📋" label="Requests" desc="Lead requests" color="#a4b07e" onClick={()=>navigate("/client/leads")}/>
              <QuickAction icon="📄" label="Contracts" desc="Lease agreements" color="#7eb8a4" onClick={()=>navigate("/client/contracts")}/>
              <QuickAction icon="💳" label="Payments" desc="Payment history" color="#c9b87a" onClick={()=>navigate("/client/payments")}/>
              <QuickAction icon="✉️" label="Applications" desc="My applications" color="#a4b07e" onClick={()=>navigate("/client/leads")}/>
            </div>
          </div>

          {/* Featured Properties */}
          <div style={{ marginBottom:28 }}>
            <SectionHead title="Featured Properties" sub="Handpicked listings for you" action="Browse All" onAction={()=>navigate("/client/browseproperties")}/>
            {loading ? (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:14 }}>
                {[0,1,2,3].map(i=><Shimmer key={i} h={260} r={14}/>)}
              </div>
            ) : featuredProps.length===0 ? (
              <div style={{ background:"#fff", borderRadius:14, border:"1.5px solid #ece6da", padding:"40px 20px", textAlign:"center", color:"#b0a890" }}>
                <p style={{ fontSize:13.5, fontFamily:"'Cormorant Garamond',Georgia,serif", color:"#8a7d5e", fontStyle:"italic" }}>No featured properties at the moment.</p>
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:14 }}>
                {featuredProps.map((p,i)=><PropCard key={p.id} item={p} idx={i}/>)}
              </div>
            )}
          </div>

          {/* Recent Requests + Applications side by side */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:28 }}>

            {/* My Requests */}
            <div>
              <SectionHead title="My Requests" sub={`${leads.length} total`} action="View All" onAction={()=>navigate("/client/leads")}/>
              {loading ? <div style={{display:"flex",flexDirection:"column",gap:8}}>{[0,1,2].map(i=><Shimmer key={i} h={60} r={11}/>)}</div> :
              leads.length===0 ? (
                <div style={{ background:"#fff", borderRadius:12, border:"1.5px solid #ece6da", padding:"28px 20px", textAlign:"center" }}>
                  <p style={{ fontSize:13.5, fontFamily:"'Cormorant Garamond',Georgia,serif", color:"#8a7d5e", fontStyle:"italic" }}>No requests yet.</p>
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {leads.slice(0,4).map((l,i) => {
                    const s = LEAD_STATUS_CFG[l.status]||LEAD_STATUS_CFG.NEW;
                    return (
                      <div key={l.id} style={{ background:"#fff", borderRadius:11, border:"1.5px solid #ece6da", padding:"11px 14px", display:"flex", alignItems:"center", gap:11, animation:`cd-fade-in 0.35s ease ${i*0.06}s both` }}>
                        <div style={{ width:36, height:36, borderRadius:10, background:`${s.dot}18`, border:`1.5px solid ${s.dot}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, flexShrink:0 }}>{TYPE_ICON[l.type]||"📋"}</div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ margin:"0 0 2px", fontSize:13, fontWeight:700, color:"#1a1714", fontFamily:"'Cormorant Garamond',Georgia,serif", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{l.type}</p>
                          <p style={{ margin:0, fontSize:11, color:"#b0a890" }}>#{l.id} · {fmtDate(l.created_at)}</p>
                        </div>
                        <Pill status={l.status} cfg={LEAD_STATUS_CFG}/>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Applications */}
            <div>
              <SectionHead title="Applications" sub="Rental & purchase"/>
              {loading ? <div style={{display:"flex",flexDirection:"column",gap:8}}>{[0,1,2].map(i=><Shimmer key={i} h={60} r={11}/>)}</div> : (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {[...rentalApps.slice(0,2).map(a=>({...a,_type:"rental"})),...saleApps.slice(0,2).map(a=>({...a,_type:"sale"}))].length===0 ? (
                    <div style={{ background:"#fff", borderRadius:12, border:"1.5px solid #ece6da", padding:"28px 20px", textAlign:"center" }}>
                      <p style={{ fontSize:13.5, fontFamily:"'Cormorant Garamond',Georgia,serif", color:"#8a7d5e", fontStyle:"italic" }}>No applications yet.</p>
                    </div>
                  ) : [...rentalApps.slice(0,2).map(a=>({...a,_type:"rental"})),...saleApps.slice(0,2).map(a=>({...a,_type:"sale"}))].map((a,i)=>(
                    <div key={`${a._type}-${a.id}`} style={{ background:"#fff", borderRadius:11, border:"1.5px solid #ece6da", padding:"11px 14px", display:"flex", alignItems:"center", gap:11, animation:`cd-fade-in 0.3s ease ${i*0.05}s both` }}>
                      <span style={{ fontSize:17, flexShrink:0 }}>{a._type==="rental"?"🔑":"🏠"}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ margin:"0 0 2px", fontSize:13, fontWeight:700, color:"#1a1714", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {a._type==="rental"?`Listing #${a.listing_id}`:`Property #${a.property_id}`}
                        </p>
                        <p style={{ margin:0, fontSize:11, color:"#b0a890" }}>{fmtDate(a.created_at)}</p>
                      </div>
                      <Pill status={a.status} cfg={STATUS_CFG_APP}/>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Activity feed */}
          <div>
            <SectionHead title="Recent Activity" sub="Latest updates across your account"/>
            {loading ? (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {[0,1,2].map(i=><Shimmer key={i} h={56} r={10}/>)}
              </div>
            ) : activities.length===0 ? (
              <div style={{ background:"#fff", borderRadius:14, border:"1.5px solid #ece6da", padding:"40px 20px", textAlign:"center", color:"#b0a890" }}>
                <p style={{ fontSize:13.5, fontFamily:"'Cormorant Garamond',Georgia,serif", color:"#8a7d5e", fontStyle:"italic" }}>No recent activity yet.</p>
              </div>
            ) : (
              <div style={{ background:"#fff", borderRadius:14, border:"1.5px solid #ece6da", overflow:"hidden", boxShadow:"0 2px 16px rgba(20,16,10,0.07)" }}>
                {activities.map((a,i)=>(
                  <div key={i}>
                    <ActivityItem {...a} idx={i}/>
                    {i<activities.length-1 && <div style={{ height:1, background:"#f0ece3", margin:"0 14px" }}/>}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {profileOpen && (
        <ProfileModal user={user} profile={clientProfile} onClose={()=>setProfileOpen(false)}
          onSuccess={()=>{ setProfileOpen(false); loadAll(); notify("Profile updated ✓"); }}
          notify={notify}/>
      )}
      {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}
    </MainLayout>
  );
}

// ─── App status config ────────────────────────────────────────────────────────
const STATUS_CFG_APP = {
  PENDING:   { dot:"#c9b87a", bg:"rgba(201,184,122,0.12)", border:"rgba(201,184,122,0.28)", color:"#9a7a30", label:"Pending"   },
  APPROVED:  { dot:"#7eb8a4", bg:"rgba(126,184,164,0.12)", border:"rgba(126,184,164,0.28)", color:"#2a6049", label:"Approved"  },
  REJECTED:  { dot:"#d4855a", bg:"rgba(212,133,90,0.12)",  border:"rgba(212,133,90,0.28)",  color:"#8b4513", label:"Rejected"  },
  CANCELLED: { dot:"#a0997e", bg:"rgba(160,153,126,0.1)",  border:"rgba(160,153,126,0.22)", color:"#6b6248", label:"Cancelled" },
};