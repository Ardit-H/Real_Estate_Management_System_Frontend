import { useState, useEffect, useCallback, useRef, useContext } from "react";
import MainLayout from "../../components/layout/Layout";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";

// ─── Icons ────────────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const SlidersIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/>
    <line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/>
    <line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/>
    <line x1="17" y1="16" x2="23" y2="16"/>
  </svg>
);
const BedIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 4v16"/><path d="M22 8H2"/><path d="M22 20V8l-4-4H6L2 8"/><path d="M6 8v4"/><path d="M18 8v4"/>
  </svg>
);
const BathIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/>
    <line x1="10" y1="5" x2="8" y2="7"/><line x1="2" y1="12" x2="22" y2="12"/>
  </svg>
);
const AreaIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3h7v7H3z"/><path d="M14 3h7v7h-7z"/><path d="M14 14h7v7h-7z"/><path d="M3 14h7v7H3z"/>
  </svg>
);
const MapPinIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const HeartIcon = ({ filled }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill={filled?"currentColor":"none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);
const GridIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/>
    <rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>
  </svg>
);
const ListIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);
const ChevronLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
);
const ChevronRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);
const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
);
const MaximizeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/>
    <path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>
  </svg>
);
const EyeIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const FloorIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9h18"/><path d="M3 15h18"/><path d="M3 3h18"/><path d="M3 21h18"/>
  </svg>
);
const CalendarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const PhoneIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.38 2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const MessageIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const KeyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2 10.58 12.42M13 7l3 3M18 2l3 3-6 6-3-3"/>
  </svg>
);
const HomeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const StarIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);
const ClipboardIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
  </svg>
);

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE_URL       = import.meta.env.VITE_API_URL || "http://localhost:8080";
const PROPERTY_TYPES = ["APARTMENT","HOUSE","VILLA","COMMERCIAL","LAND","OFFICE"];
const LISTING_TYPES  = ["SALE","RENT","BOTH"];
const PAGE_SIZE      = 12;

const DEFAULT_FILTERS = {
  minPrice:"", maxPrice:"",
  minBedrooms:"", maxBedrooms:"",
  minBathrooms:"",
  minArea:"", maxArea:"",
  city:"", country:"",
  type:"", listingType:"",
  status:"AVAILABLE",
  isFeatured:"",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatPrice = (price, currency="EUR") => {
  if (!price) return "–";
  return new Intl.NumberFormat("en-EU",{style:"currency",currency,maximumFractionDigits:0}).format(price);
};
const typeLabel = (type) => ({
  APARTMENT:"Apartment",HOUSE:"House",VILLA:"Villa",
  COMMERCIAL:"Commercial",LAND:"Land",OFFICE:"Office",
}[type]||type||"–");
const listingBadge = (type) => ({
  SALE:  {label:"For Sale", dark:"#1c3a2e", light:"#e8f2ed"},
  RENT:  {label:"For Rent", dark:"#3d2a14", light:"#f5ede0"},
  BOTH:  {label:"Sale / Rent", dark:"#1e1e3a", light:"#ebebf5"},
}[type]||{label:type||"–", dark:"#2a2a2a", light:"#f0f0f0"});
const imgUrl = (src) => {
  if (!src) return null;
  return src.startsWith("http") ? src : BASE_URL + src;
};
const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23ede9df' width='400' height='300'/%3E%3Cpath d='M150 200 L200 130 L250 200Z' fill='%23d4cfc3'/%3E%3Crect x='177' y='168' width='46' height='32' fill='%23c4bfb0'/%3E%3C/svg%3E";

const gridStyle = (mode) => ({
  display: mode==="grid"?"grid":"flex",
  gridTemplateColumns: mode==="grid"?"repeat(auto-fill, minmax(320px, 1fr))":undefined,
  flexDirection: mode==="list"?"column":undefined,
  gap: mode==="grid"?"24px":"16px",
});

// ─── CSS-in-JS global styles injected once ────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');

  .bp-root * { box-sizing: border-box; }
  .bp-root { font-family: 'DM Sans', system-ui, sans-serif; background: #f7f5f0; min-height: 100vh; }

  .bp-input:focus { border-color: #9a8c6e !important; box-shadow: 0 0 0 3px rgba(154,140,110,0.12) !important; outline: none; }
  .bp-select:focus { border-color: #9a8c6e !important; outline: none; }

  .bp-card { transition: transform 0.22s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.22s ease; }
  .bp-card:hover { transform: translateY(-4px); box-shadow: 0 20px 48px rgba(40,35,25,0.13) !important; }
  .bp-card:hover .bp-card-img { transform: scale(1.04); }
  .bp-card-img { transition: transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94); }

  .bp-btn-primary { transition: all 0.18s ease; }
  .bp-btn-primary:hover { background: #2a2a1a !important; transform: translateY(-1px); }
  .bp-btn-secondary { transition: all 0.18s ease; }
  .bp-btn-secondary:hover { background: #f0ece3 !important; }

  .bp-filter-chip { transition: all 0.15s ease; }
  .bp-filter-chip:hover { border-color: #9a8c6e !important; }

  .bp-heart:hover { color: #c0392b !important; transform: scale(1.15); }
  .bp-heart { transition: all 0.15s ease; }

  .bp-pagination-btn { transition: all 0.15s ease; }
  .bp-pagination-btn:hover:not(:disabled) { background: #f0ece3 !important; border-color: #9a8c6e !important; }

  @keyframes bp-fade-up { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes bp-scale-in { from { opacity:0; transform:scale(0.96) translateY(12px); } to { opacity:1; transform:scale(1) translateY(0); } }
  @keyframes bp-slide-right { from { transform:translateX(100%); } to { transform:translateX(0); } }
  @keyframes bp-pulse { 0%,100%{opacity:.45} 50%{opacity:.9} }
  @keyframes bp-spin { to { transform:rotate(360deg); } }
  @keyframes bp-toast-in { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
`;

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type="success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position:"fixed", bottom:28, right:28, zIndex:9999,
      background:"#1c1c14", color: type==="error"?"#f08080":"#a8c8a0",
      padding:"13px 20px", borderRadius:10, fontSize:13.5, fontWeight:400,
      boxShadow:"0 8px 32px rgba(0,0,0,0.28)",
      border:`1px solid ${type==="error"?"rgba(240,128,128,0.2)":"rgba(168,200,160,0.2)"}`,
      maxWidth:340, fontFamily:"'DM Sans', sans-serif",
      animation:"bp-toast-in 0.25s ease",
      display:"flex", alignItems:"center", gap:10,
    }}>
      <span style={{opacity:0.6, fontSize:12}}>{type==="error"?"✕":"✓"}</span>
      {msg}
    </div>
  );
}

// ─── Price Chart ──────────────────────────────────────────────────────────────
function PriceChart({ history }) {
  const [hovered, setHovered] = useState(null);
  if (!history || history.length === 0) {
    return <div style={{textAlign:"center",padding:"36px",color:"#b0a890",fontSize:"13px",fontFamily:"'DM Sans',sans-serif"}}>No price history available.</div>;
  }
  const points = history.map((h, i) => ({
    x: i, y: h.new_price ?? h.newPrice,
    date: new Date(h.changed_at ?? h.changedAt).toLocaleDateString("en-GB",{month:"short",year:"2-digit"}),
  }));
  const W=480, H=160, PAD={t:16,r:20,b:36,l:56};
  const ys = points.map(p=>p.y);
  const minY=Math.min(...ys), maxY=Math.max(...ys);
  const rangeY=maxY-minY||1, rangeX=(points.length-1)||1;
  const px=(x)=>PAD.l+(x/rangeX)*(W-PAD.l-PAD.r);
  const py=(y)=>PAD.t+(1-(y-minY)/rangeY)*(H-PAD.t-PAD.b);
  const pathD=points.map((p,i)=>`${i===0?"M":"L"}${px(p.x).toFixed(1)},${py(p.y).toFixed(1)}`).join(" ");
  const areaD=pathD+` L${px(points.length-1).toFixed(1)},${(H-PAD.b).toFixed(1)} L${px(0).toFixed(1)},${(H-PAD.b).toFixed(1)} Z`;
  const last=points[points.length-1], prev=points[points.length-2];
  const trend=prev?(last.y>prev.y?"up":last.y<prev.y?"down":"same"):"same";
  const trendColor=trend==="up"?"#c0392b":trend==="down"?"#2e8b57":"#9a8c6e";
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px"}}>
        <span style={{fontSize:"11px",fontWeight:600,color:"#9a8c6e",textTransform:"uppercase",letterSpacing:"1px",fontFamily:"'DM Sans',sans-serif"}}>Price History</span>
        <span style={{fontSize:"11.5px",fontWeight:500,color:trendColor,fontFamily:"'DM Sans',sans-serif"}}>
          {trend==="up"?"▲ Increased":trend==="down"?"▼ Decreased":"— Stable"}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:"auto",overflow:"visible"}}>
        <defs>
          <linearGradient id="areafill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6b6340" stopOpacity="0.2"/>
            <stop offset="100%" stopColor="#6b6340" stopOpacity="0"/>
          </linearGradient>
        </defs>
        {[0,0.25,0.5,0.75,1].map(t=>{
          const yv=minY+t*rangeY, ypos=py(yv);
          return <g key={t}>
            <line x1={PAD.l} y1={ypos} x2={W-PAD.r} y2={ypos} stroke="#e5dfd2" strokeWidth="1"/>
            <text x={PAD.l-8} y={ypos+4} textAnchor="end" fontSize="10" fill="#b0a890" fontFamily="'DM Sans',sans-serif">
              {yv>=1000?`${(yv/1000).toFixed(0)}k`:yv.toFixed(0)}
            </text>
          </g>;
        })}
        <path d={areaD} fill="url(#areafill)"/>
        <path d={pathD} fill="none" stroke="#6b6340" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        {points.map((p,i)=>(
          <g key={i} onMouseEnter={()=>setHovered(i)} onMouseLeave={()=>setHovered(null)} style={{cursor:"pointer"}}>
            <circle cx={px(p.x)} cy={py(p.y)} r={hovered===i?6:4} fill={hovered===i?"#6b6340":"#f7f5f0"} stroke="#6b6340" strokeWidth="2" style={{transition:"r 0.15s"}}/>
            {hovered===i&&<g>
              <rect x={Math.min(px(p.x)-52,W-PAD.r-104)} y={py(p.y)-54} width="112" height="44" rx="6" fill="#1c1c14"/>
              <text x={Math.min(px(p.x)-52,W-PAD.r-104)+56} y={py(p.y)-33} textAnchor="middle" fontSize="11.5" fill="#f7f5f0" fontWeight="500" fontFamily="'DM Sans',sans-serif">{formatPrice(p.y,"EUR")}</text>
              <text x={Math.min(px(p.x)-52,W-PAD.r-104)+56} y={py(p.y)-17} textAnchor="middle" fontSize="10" fill="#9a8c6e" fontFamily="'DM Sans',sans-serif">{p.date}</text>
            </g>}
            <text x={px(p.x)} y={H-PAD.b+14} textAnchor="middle" fontSize="10" fill="#b0a890" fontFamily="'DM Sans',sans-serif">{p.date}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ─── Property Detail Modal ────────────────────────────────────────────────────
function PropertyDetailModal({ propertyId, onClose, onApply, onBuy }) {
  const [property,     setProperty]     = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [imgIndex,     setImgIndex]     = useState(0);
  const [fullscreen,   setFullscreen]   = useState(false);
  const overlayRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [propRes, histRes] = await Promise.all([
          api.get(`/api/properties/${propertyId}`),
          api.get(`/api/properties/${propertyId}/price-history`).catch(()=>({data:[]})),
        ]);
        if (!cancelled) { setProperty(propRes.data); setPriceHistory(Array.isArray(histRes.data)?histRes.data:[]); }
      } catch {} finally { if (!cancelled) setLoading(false); }
    };
    load();
    return () => { cancelled = true; };
  }, [propertyId]);

  useEffect(() => {
    const fn = (e) => { if (e.key==="Escape") { if (fullscreen) setFullscreen(false); else onClose(); }};
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose, fullscreen]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const images  = property?.images?.length ? property.images.map(i=>imgUrl(i.imageUrl||i.image_url)).filter(Boolean) : [];
  const mainImg = images[imgIndex] || PLACEHOLDER;
  const badge   = listingBadge(property?.listingType||property?.listing_type);
  const isRent  = ["RENT","BOTH"].includes(property?.listingType||property?.listing_type);
  const isSale  = ["SALE","BOTH"].includes(property?.listingType||property?.listing_type);
  const addr    = property?.address;
  const addrStr = [addr?.street,addr?.city,addr?.country].filter(Boolean).join(", ");
  const features= property?.features || [];
  const prevImg = () => setImgIndex(i=>(i-1+images.length)%images.length);
  const nextImg = () => setImgIndex(i=>(i+1)%images.length);

  return (
    <>
      <div ref={overlayRef} onClick={e=>{if(e.target===overlayRef.current)onClose();}}
        style={{position:"fixed",inset:0,background:"rgba(12,11,8,0.78)",backdropFilter:"blur(10px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"24px",fontFamily:"'DM Sans',sans-serif"}}>
        <div style={{background:"#f7f5f0",borderRadius:"4px",width:"100%",maxWidth:"880px",maxHeight:"92vh",overflowY:"auto",boxShadow:"0 40px 80px rgba(0,0,0,0.45)",animation:"bp-scale-in 0.28s ease",position:"relative"}}>

          {/* Close */}
          <button onClick={onClose}
            style={{position:"sticky",top:"14px",float:"right",marginRight:"14px",zIndex:10,background:"rgba(28,28,20,0.7)",backdropFilter:"blur(8px)",border:"none",borderRadius:"2px",width:"32px",height:"32px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#f7f5f0"}}>
            <XIcon />
          </button>

          {loading && (
            <div style={{padding:"100px 40px",textAlign:"center",color:"#9a8c6e"}}>
              <div style={{width:28,height:28,margin:"0 auto 16px",border:"2px solid #e5dfd2",borderTop:"2px solid #6b6340",borderRadius:"50%",animation:"bp-spin .8s linear infinite"}}/>
              <p style={{fontSize:13}}>Loading property…</p>
            </div>
          )}

          {!loading && property && <>
            {/* Gallery */}
            <div style={{position:"relative",height:"380px",background:"#1c1c14",borderRadius:"4px 4px 0 0",overflow:"hidden"}}>
              <img src={mainImg} alt={property.title} className="bp-card-img"
                style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}
                onError={e=>{e.target.src=PLACEHOLDER;}}/>
              <div style={{position:"absolute",inset:0,background:"linear-gradient(to top, rgba(12,11,8,0.6) 0%, transparent 55%)"}}/>

              {/* Listing badge */}
              <div style={{position:"absolute",top:"18px",left:"18px",display:"flex",gap:"8px"}}>
                <span style={{background:badge.dark,color:"#fff",fontSize:"11px",fontWeight:500,padding:"5px 14px",borderRadius:"2px",letterSpacing:"0.4px",textTransform:"uppercase"}}>{badge.label}</span>
                {(property.isFeatured||property.is_featured)&&(
                  <span style={{background:"rgba(185,150,60,0.9)",color:"#fff",fontSize:"11px",fontWeight:500,padding:"5px 12px",borderRadius:"2px",display:"flex",alignItems:"center",gap:"4px",letterSpacing:"0.4px",textTransform:"uppercase",backdropFilter:"blur(4px)"}}>
                    <StarIcon /> Featured
                  </span>
                )}
              </div>

              {/* Views */}
              <div style={{position:"absolute",top:"18px",right:"54px",background:"rgba(12,11,8,0.55)",color:"rgba(247,245,240,0.75)",fontSize:"11px",padding:"4px 10px",borderRadius:"2px",display:"flex",alignItems:"center",gap:"5px",backdropFilter:"blur(6px)"}}>
                <EyeIcon /> {property.viewCount??property.view_count??0}
              </div>

              {/* Fullscreen */}
              <button onClick={()=>setFullscreen(true)}
                style={{position:"absolute",bottom:"16px",right:"16px",background:"rgba(12,11,8,0.55)",border:"1px solid rgba(247,245,240,0.15)",borderRadius:"2px",color:"#f7f5f0",padding:"7px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:"6px",fontSize:"11.5px",backdropFilter:"blur(6px)",fontFamily:"'DM Sans',sans-serif",letterSpacing:"0.3px"}}>
                <MaximizeIcon /> View fullscreen
              </button>

              {/* Arrows */}
              {images.length>1&&<>
                <button onClick={prevImg}
                  style={{position:"absolute",left:"14px",top:"50%",transform:"translateY(-50%)",background:"rgba(247,245,240,0.88)",border:"none",borderRadius:"2px",width:"38px",height:"38px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <ChevronLeftIcon />
                </button>
                <button onClick={nextImg}
                  style={{position:"absolute",right:"14px",top:"50%",transform:"translateY(-50%)",background:"rgba(247,245,240,0.88)",border:"none",borderRadius:"2px",width:"38px",height:"38px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <ChevronRightIcon />
                </button>
                <div style={{position:"absolute",bottom:"16px",left:"50%",transform:"translateX(-50%)",display:"flex",gap:"5px"}}>
                  {images.map((_,i)=>(
                    <button key={i} onClick={()=>setImgIndex(i)}
                      style={{width:i===imgIndex?"18px":"6px",height:"6px",borderRadius:"3px",background:i===imgIndex?"#f7f5f0":"rgba(247,245,240,0.4)",border:"none",cursor:"pointer",transition:"all 0.2s",padding:0}}/>
                  ))}
                </div>
                <div style={{position:"absolute",bottom:"0",left:"0",right:"0",display:"flex",gap:"3px",padding:"6px 10px 0",overflowX:"auto",background:"linear-gradient(to top, rgba(12,11,8,0.65),transparent)"}}>
                  {images.map((src,i)=>(
                    <img key={i} src={src} alt="" onClick={()=>setImgIndex(i)}
                      style={{width:"54px",height:"40px",objectFit:"cover",borderRadius:"2px",cursor:"pointer",
                        border:i===imgIndex?"2px solid #f7f5f0":"2px solid transparent",
                        opacity:i===imgIndex?1:0.55,flexShrink:0,transition:"all 0.2s"}}
                      onError={e=>{e.target.src=PLACEHOLDER;}}/>
                  ))}
                </div>
              </>}
            </div>

            {/* Body */}
            <div style={{padding:"30px 34px 36px"}}>
              {/* Title + Price */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"20px",marginBottom:"20px",flexWrap:"wrap"}}>
                <div style={{flex:1}}>
                  <h2 style={{margin:"0 0 8px",fontSize:"26px",fontWeight:600,color:"#1c1c14",lineHeight:1.15,fontFamily:"'Cormorant Garamond',Georgia,serif",letterSpacing:"-0.3px"}}>{property.title}</h2>
                  {addrStr&&<div style={{display:"flex",alignItems:"center",gap:"5px",color:"#9a8c6e",fontSize:"13px"}}><MapPinIcon /> {addrStr}</div>}
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontSize:"28px",fontWeight:600,color:"#1c1c14",letterSpacing:"-0.5px",fontFamily:"'Cormorant Garamond',Georgia,serif"}}>{formatPrice(property.price,property.currency)}</div>
                  {(property.pricePerSqm||property.price_per_sqm)&&<div style={{fontSize:"12px",color:"#9a8c6e",marginTop:2}}>{formatPrice(property.pricePerSqm||property.price_per_sqm,property.currency)}/m²</div>}
                </div>
              </div>

              {/* Tags */}
              <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"24px"}}>
                {[property.status||"AVAILABLE",typeLabel(property.type),property.currency].filter(Boolean).map((tag,i)=>(
                  <span key={i} style={{background:"#f0ece3",color:"#6b5f45",border:"1px solid #e0d8c8",borderRadius:"2px",padding:"4px 12px",fontSize:"11px",fontWeight:500,letterSpacing:"0.5px",textTransform:"uppercase"}}>{tag}</span>
                ))}
              </div>

              {/* Stats */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(130px,1fr))",gap:"10px",marginBottom:"28px"}}>
                {[
                  {icon:<BedIcon/>,label:"Bedrooms",val:property.bedrooms},
                  {icon:<BathIcon/>,label:"Bathrooms",val:property.bathrooms},
                  {icon:<AreaIcon/>,label:"Area",val:property.areaSqm??property.area_sqm,unit:"m²"},
                  {icon:<FloorIcon/>,label:"Floor",val:property.floor!=null?`${property.floor} / ${property.totalFloors??property.total_floors??'–'}`:null},
                  {icon:<CalendarIcon/>,label:"Year Built",val:property.yearBuilt??property.year_built},
                ].filter(s=>s.val!=null).map((s,i)=>(
                  <div key={i} style={{background:"#fff",border:"1px solid #e8e2d6",borderRadius:"2px",padding:"14px 16px",display:"flex",flexDirection:"column",gap:"6px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"5px",color:"#b0a890",fontSize:"10px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.8px"}}>{s.icon} {s.label}</div>
                    <div style={{fontSize:"17px",fontWeight:600,color:"#1c1c14",fontFamily:"'Cormorant Garamond',Georgia,serif"}}>{s.val}{s.unit?` ${s.unit}`:""}</div>
                  </div>
                ))}
              </div>

              {/* Description */}
              {property.description&&(
                <div style={{marginBottom:"28px"}}>
                  <p style={{margin:"0 0 10px",fontSize:"10.5px",fontWeight:600,color:"#b0a890",textTransform:"uppercase",letterSpacing:"1px"}}>Description</p>
                  <p style={{margin:0,fontSize:"14.5px",lineHeight:1.8,color:"#3c3830",whiteSpace:"pre-wrap",fontFamily:"'Cormorant Garamond',Georgia,serif"}}>{property.description}</p>
                </div>
              )}

              {/* Features */}
              {features.length>0&&(
                <div style={{marginBottom:"28px"}}>
                  <p style={{margin:"0 0 12px",fontSize:"10.5px",fontWeight:600,color:"#b0a890",textTransform:"uppercase",letterSpacing:"1px"}}>Features & Amenities</p>
                  <div style={{display:"flex",flexWrap:"wrap",gap:"7px"}}>
                    {features.map((f,i)=>(
                      <span key={i} style={{background:"#fff",border:"1px solid #e8e2d6",borderRadius:"2px",padding:"5px 12px",fontSize:"12.5px",color:"#4a4438",fontWeight:400}}>
                        {typeof f==="string"?f.replace(/_/g," "):f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Chart */}
              <div style={{marginBottom:"28px",background:"#fff",border:"1px solid #e8e2d6",borderRadius:"2px",padding:"20px 22px"}}>
                <PriceChart history={priceHistory} />
              </div>

              {/* Contact */}
              <div style={{background:"#1c1c14",borderRadius:"2px",padding:"24px 26px"}}>
                <p style={{margin:"0 0 2px",fontSize:"10px",fontWeight:600,color:"#6b6340",textTransform:"uppercase",letterSpacing:"1px"}}>Contact</p>
                <p style={{margin:"0 0 18px",fontSize:"16px",fontWeight:500,color:"#f7f5f0",fontFamily:"'Cormorant Garamond',Georgia,serif"}}>
                  {property.agentId||property.agent_id?`Agent #${property.agentId??property.agent_id}`:"Our Agent"}
                </p>
                <div style={{display:"flex",gap:"10px",flexWrap:"wrap"}}>
                  {[
                    {icon:<MessageIcon/>,label:"Send Message",style:{background:"rgba(247,245,240,0.08)",color:"#f7f5f0",border:"1px solid rgba(247,245,240,0.15)"}},
                    {icon:<PhoneIcon/>,label:"Request Viewing",style:{background:"rgba(247,245,240,0.08)",color:"#f7f5f0",border:"1px solid rgba(247,245,240,0.15)"}},
                  ].map((b,i)=>(
                    <button key={i} style={{display:"flex",alignItems:"center",gap:"8px",...b.style,borderRadius:"2px",padding:"10px 18px",fontSize:"13px",fontWeight:500,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all 0.15s"}}>
                      {b.icon} {b.label}
                    </button>
                  ))}
                  {isRent&&(property.status==="AVAILABLE"||!property.status)&&(
                    <button onClick={()=>{onClose();onApply(property);}}
                      style={{display:"flex",alignItems:"center",gap:"8px",background:"#f7f5f0",color:"#1c1c14",border:"none",borderRadius:"2px",padding:"10px 20px",fontSize:"13px",fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all 0.15s"}}>
                      <KeyIcon /> Apply for Rent
                    </button>
                  )}
                  {isSale&&(property.status==="AVAILABLE"||!property.status)&&(
                    <button onClick={()=>{onClose();onBuy(property);}}
                      style={{display:"flex",alignItems:"center",gap:"8px",background:"#9a8c6e",color:"#f7f5f0",border:"none",borderRadius:"2px",padding:"10px 20px",fontSize:"13px",fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all 0.15s"}}>
                      <HomeIcon /> Apply for Purchase
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>}
        </div>
      </div>

      {/* Fullscreen */}
      {fullscreen&&(
        <div onClick={()=>setFullscreen(false)}
          style={{position:"fixed",inset:0,background:"rgba(12,11,8,0.97)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",cursor:"zoom-out"}}>
          <img src={mainImg} alt="" style={{maxWidth:"94vw",maxHeight:"94vh",objectFit:"contain"}} />
          {images.length>1&&<>
            <button onClick={e=>{e.stopPropagation();prevImg();}} style={{position:"fixed",left:"20px",top:"50%",transform:"translateY(-50%)",background:"rgba(247,245,240,0.1)",border:"1px solid rgba(247,245,240,0.15)",borderRadius:"2px",width:"46px",height:"46px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#f7f5f0"}}><ChevronLeftIcon /></button>
            <button onClick={e=>{e.stopPropagation();nextImg();}} style={{position:"fixed",right:"20px",top:"50%",transform:"translateY(-50%)",background:"rgba(247,245,240,0.1)",border:"1px solid rgba(247,245,240,0.15)",borderRadius:"2px",width:"46px",height:"46px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#f7f5f0"}}><ChevronRightIcon /></button>
          </>}
          <button onClick={()=>setFullscreen(false)} style={{position:"fixed",top:"20px",right:"20px",background:"rgba(247,245,240,0.1)",border:"1px solid rgba(247,245,240,0.15)",borderRadius:"2px",width:"40px",height:"40px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#f7f5f0"}}><XIcon /></button>
          <div style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",color:"rgba(247,245,240,0.45)",fontSize:12,fontFamily:"'DM Sans',sans-serif"}}>{imgIndex+1} / {images.length}</div>
        </div>
      )}
    </>
  );
}

// ─── Rental Apply Modal ───────────────────────────────────────────────────────
function RentalApplyModal({ property, onClose, onSuccess, notify }) {
  const [listings, setListings]   = useState([]);
  const [loadingL, setLoadingL]   = useState(true);
  const [selectedL, setSelectedL] = useState(null);
  const [form, setForm]           = useState({ message:"", income:"", move_in_date:"" });
  const [saving, setSaving]       = useState(false);

  useEffect(() => {
    const h = (e) => e.key==="Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  useEffect(() => {
    const load = async () => {
      setLoadingL(true);
      try {
        const res = await api.get(`/api/rentals/listings/property/${property.id}`);
        const active = (Array.isArray(res.data)?res.data:[]).filter(l=>l.status==="ACTIVE");
        setListings(active);
        if (active.length===1) setSelectedL(active[0]);
      } catch { notify("Could not load listings","error"); }
      finally { setLoadingL(false); }
    };
    load();
  }, [property.id, notify]);

  const handleSubmit = async () => {
    if (!selectedL) { notify("Please select a listing","error"); return; }
    setSaving(true);
    try {
      await api.post("/api/rentals/applications", {
        listing_id: selectedL.id, message: form.message||null,
        income: form.income?Number(form.income):null,
        move_in_date: form.move_in_date||null,
      });
      onSuccess();
    } catch (err) { notify(err.response?.data?.message||"Error submitting application","error"); }
    finally { setSaving(false); }
  };

  const fmtMoney = (v,period="MONTHLY") => v!=null?`€${Number(v).toLocaleString("de-DE")} / ${period.toLowerCase()}`:"—";
  const fmtDate  = (d) => d?new Date(d).toLocaleDateString("en-GB"):"—";
  const inp = {width:"100%",padding:"9px 12px",border:"1px solid #e0d8c8",borderRadius:"2px",fontSize:"13.5px",color:"#1c1c14",background:"#fff",fontFamily:"'DM Sans',sans-serif",boxSizing:"border-box",outline:"none"};

  return (
    <div style={{position:"fixed",inset:0,zIndex:2000,background:"rgba(12,11,8,0.75)",backdropFilter:"blur(10px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'DM Sans',sans-serif"}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{width:"100%",maxWidth:540,background:"#f7f5f0",borderRadius:"4px",boxShadow:"0 40px 80px rgba(0,0,0,0.4)",maxHeight:"90vh",overflowY:"auto",animation:"bp-scale-in 0.25s ease"}}>
        <div style={{padding:"20px 24px",borderBottom:"1px solid #e8e2d6",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <p style={{fontWeight:600,fontSize:15,margin:"0 0 3px",color:"#1c1c14",fontFamily:"'Cormorant Garamond',Georgia,serif"}}>Apply for Rent</p>
            <p style={{fontSize:12,color:"#9a8c6e",margin:0}}>{property.title}</p>
          </div>
          <button onClick={onClose} style={{border:"none",background:"none",color:"#9a8c6e",cursor:"pointer",fontSize:18,padding:"2px",lineHeight:1}}>×</button>
        </div>
        <div style={{padding:"22px 24px"}}>
          <div style={{marginBottom:18}}>
            <label style={S.modalLabel}>Available Listings <span style={{color:"#c0392b"}}>*</span></label>
            {loadingL
              ?<div style={{padding:"16px",textAlign:"center",color:"#9a8c6e",fontSize:13}}>Loading…</div>
              :listings.length===0
                ?<div style={{background:"#fff8f0",border:"1px solid #e8d5b0",borderRadius:"2px",padding:"12px 14px",fontSize:13,color:"#8b6030"}}>No active listings available for this property.</div>
                :<div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {listings.map(l=>(
                    <div key={l.id} onClick={()=>setSelectedL(l)}
                      style={{padding:"12px 14px",borderRadius:"2px",cursor:"pointer",border:`1px solid ${selectedL?.id===l.id?"#6b6340":"#e0d8c8"}`,background:selectedL?.id===l.id?"#f0ece3":"#fff",transition:"all 0.15s"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div>
                          <p style={{fontWeight:500,fontSize:13.5,margin:"0 0 3px",color:"#1c1c14"}}>{l.title||`Listing #${l.id}`}</p>
                          <p style={{fontSize:12,color:"#9a8c6e",margin:0}}>
                            {fmtMoney(l.price,l.price_period)}{l.deposit&&` · Deposit: €${Number(l.deposit).toLocaleString()}`}{l.min_lease_months&&` · Min. ${l.min_lease_months} mo`}
                          </p>
                        </div>
                        {selectedL?.id===l.id&&<div style={{width:18,height:18,borderRadius:"50%",background:"#6b6340",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:10,flexShrink:0}}>✓</div>}
                      </div>
                    </div>
                  ))}
                </div>
            }
          </div>
          {listings.length>0&&<>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
              <div><label style={S.modalLabel}>Monthly Income (€)</label><input className="bp-input" style={inp} type="number" min="0" placeholder="e.g. 1500" value={form.income} onChange={e=>setForm(f=>({...f,income:e.target.value}))}/></div>
              <div><label style={S.modalLabel}>Move-in Date</label><input className="bp-input" style={inp} type="date" value={form.move_in_date} onChange={e=>setForm(f=>({...f,move_in_date:e.target.value}))}/></div>
            </div>
            <div style={{marginBottom:22}}>
              <label style={S.modalLabel}>Message (optional)</label>
              <textarea rows={3} placeholder="Introduce yourself…" value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))}
                style={{...inp,resize:"vertical"}}/>
            </div>
          </>}
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <button onClick={onClose} style={{padding:"9px 18px",borderRadius:"2px",border:"1px solid #e0d8c8",background:"transparent",color:"#6b6340",fontWeight:500,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
            <button onClick={handleSubmit} disabled={saving||listings.length===0||!selectedL}
              style={{padding:"9px 20px",borderRadius:"2px",background:saving||listings.length===0||!selectedL?"#b0a890":"#1c1c14",color:"#f7f5f0",border:"none",fontSize:13,fontWeight:500,cursor:saving||lists.length===0||!selectedL?"not-allowed":"pointer",fontFamily:"inherit",opacity:saving||listings.length===0||!selectedL?0.65:1}}>
              {saving?"Submitting…":"Submit Application"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sale Buy Modal ───────────────────────────────────────────────────────────
function SaleBuyModal({ property, onClose, onSuccess, notify }) {
  const [listings, setListings]   = useState([]);
  const [loadingL, setLoadingL]   = useState(true);
  const [selectedL, setSelectedL] = useState(null);
  const [form, setForm]           = useState({ message:"", offer_price:"", desired_purchase_date:"", monthly_income:"" });
  const [saving, setSaving]       = useState(false);

  useEffect(() => {
    const h = (e) => e.key==="Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  useEffect(() => {
    const load = async () => {
      setLoadingL(true);
      try {
        const res = await api.get(`/api/sales/listings/property/${property.id}`);
        const active = (Array.isArray(res.data)?res.data:[]).filter(l=>l.status==="ACTIVE");
        setListings(active);
        if (active.length===1) setSelectedL(active[0]);
      } catch { notify("Could not load sale listings","error"); }
      finally { setLoadingL(false); }
    };
    load();
  }, [property.id, notify]);

  const handleSubmit = async () => {
    if (!selectedL) { notify("Please select a listing","error"); return; }
    setSaving(true);
    try {
      await api.post("/api/sales/applications", {
        listing_id: selectedL.id, message: form.message||null,
        offer_price: form.offer_price?Number(form.offer_price):null,
        desired_purchase_date: form.desired_purchase_date||null,
        monthly_income: form.monthly_income?Number(form.monthly_income):null,
      });
      onSuccess();
    } catch (err) { notify(err.response?.data?.message||"Error submitting application","error"); }
    finally { setSaving(false); }
  };

  const fmtPrice = (v) => v!=null?`€${Number(v).toLocaleString("de-DE")}`:"—";
  const inp = {width:"100%",padding:"9px 12px",border:"1px solid #e0d8c8",borderRadius:"2px",fontSize:"13.5px",color:"#1c1c14",background:"#fff",fontFamily:"'DM Sans',sans-serif",boxSizing:"border-box",outline:"none"};

  return (
    <div style={{position:"fixed",inset:0,zIndex:2000,background:"rgba(12,11,8,0.75)",backdropFilter:"blur(10px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'DM Sans',sans-serif"}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{width:"100%",maxWidth:540,background:"#f7f5f0",borderRadius:"4px",boxShadow:"0 40px 80px rgba(0,0,0,0.4)",maxHeight:"90vh",overflowY:"auto",animation:"bp-scale-in 0.25s ease"}}>
        <div style={{padding:"20px 24px",borderBottom:"1px solid #e8e2d6",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <p style={{fontWeight:600,fontSize:15,margin:"0 0 3px",color:"#1c1c14",fontFamily:"'Cormorant Garamond',Georgia,serif"}}>Apply for Purchase</p>
            <p style={{fontSize:12,color:"#9a8c6e",margin:0}}>{property.title}</p>
          </div>
          <button onClick={onClose} style={{border:"none",background:"none",color:"#9a8c6e",cursor:"pointer",fontSize:18,padding:"2px",lineHeight:1}}>×</button>
        </div>
        <div style={{padding:"22px 24px"}}>
          <div style={{marginBottom:18}}>
            <label style={S.modalLabel}>Sale Listings <span style={{color:"#c0392b"}}>*</span></label>
            {loadingL
              ?<div style={{padding:"16px",textAlign:"center",color:"#9a8c6e",fontSize:13}}>Loading…</div>
              :listings.length===0
                ?<div style={{background:"#fff8f0",border:"1px solid #e8d5b0",borderRadius:"2px",padding:"12px 14px",fontSize:13,color:"#8b6030"}}>No active sale listings for this property.</div>
                :<div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {listings.map(l=>(
                    <div key={l.id} onClick={()=>setSelectedL(l)}
                      style={{padding:"12px 14px",borderRadius:"2px",cursor:"pointer",border:`1px solid ${selectedL?.id===l.id?"#6b6340":"#e0d8c8"}`,background:selectedL?.id===l.id?"#f0ece3":"#fff",transition:"all 0.15s"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div>
                          <p style={{fontWeight:500,fontSize:13.5,margin:"0 0 3px",color:"#1c1c14"}}>{l.title||`Listing #${l.id}`}</p>
                          <p style={{fontSize:12,color:"#9a8c6e",margin:0}}>
                            Price: {fmtPrice(l.price)}{l.negotiable&&" · Negotiable"}
                          </p>
                        </div>
                        {selectedL?.id===l.id&&<div style={{width:18,height:18,borderRadius:"50%",background:"#6b6340",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:10,flexShrink:0}}>✓</div>}
                      </div>
                    </div>
                  ))}
                </div>
            }
          </div>
          {listings.length>0&&<>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
              <div><label style={S.modalLabel}>Your Offer (€) — optional</label><input className="bp-input" style={inp} type="number" min="0" placeholder="e.g. 120000" value={form.offer_price} onChange={e=>setForm(f=>({...f,offer_price:e.target.value}))}/></div>
              <div><label style={S.modalLabel}>Monthly Income (€) — optional</label><input className="bp-input" style={inp} type="number" min="0" placeholder="e.g. 3000" value={form.monthly_income} onChange={e=>setForm(f=>({...f,monthly_income:e.target.value}))}/></div>
            </div>
            <div style={{marginBottom:14}}>
              <label style={S.modalLabel}>Desired Purchase Date — optional</label>
              <input className="bp-input" style={inp} type="date" value={form.desired_purchase_date} onChange={e=>setForm(f=>({...f,desired_purchase_date:e.target.value}))}/>
            </div>
            <div style={{marginBottom:22}}>
              <label style={S.modalLabel}>Message — optional</label>
              <textarea rows={3} placeholder="Introduce yourself and describe your interest…" value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))}
                style={{...inp,resize:"vertical"}}/>
            </div>
          </>}
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <button onClick={onClose} style={{padding:"9px 18px",borderRadius:"2px",border:"1px solid #e0d8c8",background:"transparent",color:"#6b6340",fontWeight:500,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
            <button onClick={handleSubmit} disabled={saving||listings.length===0||!selectedL}
              style={{padding:"9px 20px",borderRadius:"2px",background:saving||listings.length===0||!selectedL?"#b0a890":"#1c1c14",color:"#f7f5f0",border:"none",fontSize:13,fontWeight:500,cursor:saving||listings.length===0||!selectedL?"not-allowed":"pointer",fontFamily:"inherit",opacity:saving||listings.length===0||!selectedL?0.65:1}}>
              {saving?"Submitting…":"Submit Application"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── My Applications Modal ────────────────────────────────────────────────────
function MyApplicationsModal({ onClose, notify }) {
  const [tab, setTab] = useState("rent");
  const [rentApps,    setRentApps]    = useState([]);
  const [rentLoading, setRentLoading] = useState(true);
  const [rentPage,    setRentPage]    = useState(0);
  const [rentTotal,   setRentTotal]   = useState(0);
  const [cancelling,  setCancelling]  = useState(null);
  const [saleApps,    setSaleApps]    = useState([]);
  const [saleLoading, setSaleLoading] = useState(true);
  const [salePage,    setSalePage]    = useState(0);
  const [saleTotal,   setSaleTotal]   = useState(0);
  const [cancelSale,  setCancelSale]  = useState(null);

  useEffect(() => {
    const h = (e) => e.key==="Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const loadRent = useCallback(async (pg=0) => {
    setRentLoading(true);
    try {
      const res = await api.get(`/api/rentals/applications/my?page=${pg}&size=10`);
      setRentApps(res.data.content||[]); setRentTotal(res.data.totalPages||0); setRentPage(pg);
    } catch { notify("Error loading rental applications","error"); }
    finally { setRentLoading(false); }
  }, [notify]);

  const loadSale = useCallback(async (pg=0) => {
    setSaleLoading(true);
    try {
      const res = await api.get(`/api/sales/applications/my?page=${pg}&size=10`);
      setSaleApps(res.data.content||[]); setSaleTotal(res.data.totalPages||0); setSalePage(pg);
    } catch { notify("Error loading purchase applications","error"); }
    finally { setSaleLoading(false); }
  }, [notify]);

  useEffect(() => { loadRent(0); loadSale(0); }, [loadRent, loadSale]);

  const handleCancelRent = async (appId) => {
    setCancelling(appId);
    try { await api.patch(`/api/rentals/applications/${appId}/cancel`); notify("Rental application cancelled"); loadRent(rentPage); }
    catch (err) { notify(err.response?.data?.message||"Error","error"); }
    finally { setCancelling(null); }
  };

  const handleCancelSale = async (appId) => {
    setCancelSale(appId);
    try { await api.patch(`/api/sales/applications/${appId}/cancel`); notify("Purchase application cancelled"); loadSale(salePage); }
    catch (err) { notify(err.response?.data?.message||"Error","error"); }
    finally { setCancelSale(null); }
  };

  const STATUS = {
    PENDING:   {color:"#9a7a30",bg:"#fdf6e3"},
    APPROVED:  {color:"#2a6049",bg:"#edf5f0"},
    REJECTED:  {color:"#8b3a1c",bg:"#fdf0e8"},
    CANCELLED: {color:"#6b6651",bg:"#f5f2eb"},
  };
  const fmtDT = (d) => d?new Date(d).toLocaleDateString("en-GB"):"—";
  const fmtMon = (v) => v!=null?`€${Number(v).toLocaleString("de-DE")}`:"—";

  const AppCard = ({app, onCancel, cancelling: c}) => {
    const s = STATUS[app.status]||{color:"#6b6651",bg:"#f5f2eb"};
    return (
      <div style={{background:"#fff",border:"1px solid #e8e2d6",borderRadius:"2px",padding:"14px 18px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
          <div>
            <p style={{fontWeight:500,fontSize:13.5,margin:"0 0 3px",color:"#1c1c14"}}>Listing #{app.listing_id}{app.property_id?` — Property #${app.property_id}`:""}</p>
            <p style={{fontSize:12,color:"#9a8c6e",margin:0}}>
              {fmtDT(app.created_at)}
              {app.income&&` · Income: ${fmtMon(app.income)}`}
              {app.move_in_date&&` · Move-in: ${fmtDT(app.move_in_date)}`}
              {app.offer_price&&` · Offer: ${fmtMon(app.offer_price)}`}
            </p>
          </div>
          <span style={{background:s.bg,color:s.color,padding:"3px 10px",borderRadius:"2px",fontSize:11,fontWeight:500,letterSpacing:"0.4px",textTransform:"uppercase",flexShrink:0,marginLeft:8}}>{app.status}</span>
        </div>
        {app.message&&<p style={{fontSize:13,color:"#6b6340",margin:"6px 0 0",fontStyle:"italic",fontFamily:"'Cormorant Garamond',Georgia,serif"}}>"{app.message}"</p>}
        {app.status==="APPROVED"&&<p style={{fontSize:12.5,color:"#2a6049",margin:"8px 0 0"}}>Application approved. The agent will contact you shortly.</p>}
        {app.status==="PENDING"&&(
          <button style={{marginTop:10,padding:"6px 14px",borderRadius:"2px",border:"1px solid #e0d8c8",background:"transparent",color:"#6b6340",fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}
            onClick={()=>onCancel(app.id)} disabled={c===app.id}>
            {c===app.id?"Cancelling…":"Cancel Application"}
          </button>
        )}
      </div>
    );
  };

  return (
    <div style={{position:"fixed",inset:0,zIndex:2000,background:"rgba(12,11,8,0.75)",backdropFilter:"blur(10px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'DM Sans',sans-serif"}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{width:"100%",maxWidth:660,background:"#f7f5f0",borderRadius:"4px",boxShadow:"0 40px 80px rgba(0,0,0,0.4)",maxHeight:"90vh",overflowY:"auto",animation:"bp-scale-in 0.25s ease"}}>
        <div style={{padding:"20px 24px",borderBottom:"1px solid #e8e2d6",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <p style={{fontWeight:600,fontSize:15,margin:0,color:"#1c1c14",fontFamily:"'Cormorant Garamond',Georgia,serif"}}>My Applications</p>
          <button onClick={onClose} style={{border:"none",background:"none",color:"#9a8c6e",cursor:"pointer",fontSize:18,padding:"2px",lineHeight:1}}>×</button>
        </div>
        <div style={{display:"flex",borderBottom:"1px solid #e8e2d6"}}>
          {[{id:"rent",label:"Rental"},{id:"sale",label:"Purchase"}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{flex:1,padding:"12px 0",border:"none",background:"none",cursor:"pointer",fontFamily:"inherit",fontSize:13.5,fontWeight:tab===t.id?600:400,color:tab===t.id?"#1c1c14":"#9a8c6e",borderBottom:`2px solid ${tab===t.id?"#6b6340":"transparent"}`,transition:"all 0.15s"}}>
              {t.label}
            </button>
          ))}
        </div>
        <div style={{padding:"22px 24px"}}>
          {tab==="rent"&&(
            rentLoading?<div style={{textAlign:"center",padding:40,color:"#9a8c6e",fontSize:13}}>Loading…</div>
            :rentApps.length===0?<div style={{textAlign:"center",padding:"48px 20px",color:"#9a8c6e"}}><p style={{fontSize:14}}>No rental applications yet.</p></div>
            :<div style={{display:"flex",flexDirection:"column",gap:10}}>
              {rentApps.map(app=><AppCard key={app.id} app={app} onCancel={handleCancelRent} cancelling={cancelling}/>)}
              {rentTotal>1&&<div style={{display:"flex",justifyContent:"center",gap:6,marginTop:14}}>
                <button className="bp-pagination-btn" style={S.pgBtn(false,rentPage===0)} disabled={rentPage===0} onClick={()=>loadRent(rentPage-1)}>←</button>
                <span style={{fontSize:12,color:"#9a8c6e",padding:"7px 8px"}}>{rentPage+1}/{rentTotal}</span>
                <button className="bp-pagination-btn" style={S.pgBtn(false,rentPage>=rentTotal-1)} disabled={rentPage>=rentTotal-1} onClick={()=>loadRent(rentPage+1)}>→</button>
              </div>}
            </div>
          )}
          {tab==="sale"&&(
            saleLoading?<div style={{textAlign:"center",padding:40,color:"#9a8c6e",fontSize:13}}>Loading…</div>
            :saleApps.length===0?<div style={{textAlign:"center",padding:"48px 20px",color:"#9a8c6e"}}><p style={{fontSize:14}}>No purchase applications yet.</p></div>
            :<div style={{display:"flex",flexDirection:"column",gap:10}}>
              {saleApps.map(app=><AppCard key={app.id} app={app} onCancel={handleCancelSale} cancelling={cancelSale}/>)}
              {saleTotal>1&&<div style={{display:"flex",justifyContent:"center",gap:6,marginTop:14}}>
                <button className="bp-pagination-btn" style={S.pgBtn(false,salePage===0)} disabled={salePage===0} onClick={()=>loadSale(salePage-1)}>←</button>
                <span style={{fontSize:12,color:"#9a8c6e",padding:"7px 8px"}}>{salePage+1}/{saleTotal}</span>
                <button className="bp-pagination-btn" style={S.pgBtn(false,salePage>=saleTotal-1)} disabled={salePage>=saleTotal-1} onClick={()=>loadSale(salePage+1)}>→</button>
              </div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Property Card ────────────────────────────────────────────────────────────
function PropertyCard({ property, viewMode, onOpen, onApply, onBuy, onSaveToggle, savedIds }) {
  const badge    = listingBadge(property.listing_type||property.listingType);
  const imageSrc = property.primaryImage||property.primary_image||property.imageUrl;
  const img      = imageSrc?(imageSrc.startsWith("http")?imageSrc:BASE_URL+imageSrc):PLACEHOLDER;
  const isGrid   = viewMode==="grid";
  const isRent   = ["RENT","BOTH"].includes(property.listing_type||property.listingType);
  const isSale   = ["SALE","BOTH"].includes(property.listing_type||property.listingType);
  const isSaved  = savedIds?.has(property.id);

  return (
    <div className="bp-card" onClick={()=>onOpen(property.id)}
      style={{
        background:"#fff", borderRadius:"2px", overflow:"hidden",
        boxShadow:"0 2px 12px rgba(40,35,25,0.07)",
        cursor:"pointer", display:isGrid?"block":"flex",
        border:"1px solid #e8e2d6",
        minHeight:isGrid?"auto":"180px",
        fontFamily:"'DM Sans',sans-serif",
      }}>
      {/* Image */}
      <div style={{position:"relative",width:isGrid?"100%":"240px",minWidth:isGrid?"auto":"240px",height:isGrid?"220px":"100%",minHeight:isGrid?"220px":"180px",background:"#ede9df",flexShrink:0,overflow:"hidden"}}>
        <img src={img} alt={property.title} className="bp-card-img"
          style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}
          onError={e=>{e.target.src=PLACEHOLDER;}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to top, rgba(12,11,8,0.42) 0%, transparent 60%)"}}/>

        {/* Badge */}
        <span style={{position:"absolute",top:"12px",left:"12px",background:badge.dark,color:"#fff",fontSize:"10px",fontWeight:500,padding:"4px 10px",borderRadius:"2px",letterSpacing:"0.5px",textTransform:"uppercase"}}>
          {badge.label}
        </span>

        {/* Featured */}
        {(property.is_featured||property.isFeatured)&&(
          <span style={{position:"absolute",top:"12px",left:isGrid?"86px":"80px",background:"rgba(168,130,48,0.9)",color:"#fff",fontSize:"10px",fontWeight:500,padding:"4px 10px",borderRadius:"2px",display:"flex",alignItems:"center",gap:"3px",letterSpacing:"0.4px",textTransform:"uppercase"}}>
            <StarIcon /> Featured
          </span>
        )}

        {/* Save */}
        <button className="bp-heart" onClick={e=>{e.stopPropagation();onSaveToggle(property);}}
          style={{position:"absolute",top:"10px",right:"10px",background:"rgba(247,245,240,0.88)",border:"none",borderRadius:"50%",width:"32px",height:"32px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:isSaved?"#c0392b":"#9a8c6e"}}>
          <HeartIcon filled={isSaved} />
        </button>

        {/* Type */}
        <span style={{position:"absolute",bottom:"10px",left:"12px",color:"rgba(247,245,240,0.75)",fontSize:"11px",fontWeight:400,fontFamily:"'DM Sans',sans-serif",letterSpacing:"0.2px"}}>
          {typeLabel(property.type)}
        </span>
      </div>

      {/* Content */}
      <div style={{padding:isGrid?"18px 20px 20px":"18px 24px",flex:1,display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
        <div>
          {(property.city||property.country)&&(
            <div style={{display:"flex",alignItems:"center",gap:"4px",color:"#b0a890",fontSize:"11.5px",marginBottom:"6px"}}>
              <MapPinIcon />{[property.city,property.country].filter(Boolean).join(", ")}
            </div>
          )}
          <h3 style={{margin:"0 0 10px",fontSize:isGrid?"17px":"18px",fontWeight:600,color:"#1c1c14",lineHeight:1.25,overflow:"hidden",textOverflow:"ellipsis",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",fontFamily:"'Cormorant Garamond',Georgia,serif",letterSpacing:"-0.1px"}}>
            {property.title}
          </h3>
          <div style={{fontSize:isGrid?"19px":"21px",fontWeight:600,color:"#1c1c14",marginBottom:"14px",fontFamily:"'Cormorant Garamond',Georgia,serif",letterSpacing:"-0.3px"}}>
            {formatPrice(property.price,property.currency)}
          </div>
        </div>
        <div>
          {/* Stats */}
          <div style={{display:"flex",gap:"16px",color:"#9a8c6e",fontSize:"12px",flexWrap:"wrap",paddingTop:"12px",borderTop:"1px solid #f0ece3",marginBottom:(isRent||isSale)&&property.status==="AVAILABLE"?"14px":"0"}}>
            {property.bedrooms!=null&&<span style={{display:"flex",alignItems:"center",gap:"4px"}}><BedIcon/>{property.bedrooms} bd</span>}
            {property.bathrooms!=null&&<span style={{display:"flex",alignItems:"center",gap:"4px"}}><BathIcon/>{property.bathrooms} ba</span>}
            {(property.area_sqm??property.areaSqm)!=null&&<span style={{display:"flex",alignItems:"center",gap:"4px"}}><AreaIcon/>{property.area_sqm??property.areaSqm} m²</span>}
          </div>

          {/* CTAs */}
          {property.status==="AVAILABLE"&&(isRent||isSale)&&(
            <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
              {isRent&&(
                <button className="bp-btn-primary" onClick={e=>{e.stopPropagation();onApply(property);}}
                  style={{flex:1,padding:"9px 12px",borderRadius:"2px",background:"#1c1c14",color:"#f7f5f0",border:"none",fontSize:"12.5px",fontWeight:500,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:6,letterSpacing:"0.2px"}}>
                  <KeyIcon /> Rent
                </button>
              )}
              {isSale&&(
                <button className="bp-btn-primary" onClick={e=>{e.stopPropagation();onBuy(property);}}
                  style={{flex:1,padding:"9px 12px",borderRadius:"2px",background:isRent?"#9a8c6e":"#1c1c14",color:"#f7f5f0",border:"none",fontSize:"12.5px",fontWeight:500,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:6,letterSpacing:"0.2px"}}>
                  <HomeIcon /> Purchase
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Filter Drawer ────────────────────────────────────────────────────────────
function FilterDrawer({ filters, setFilters, onApply, onReset, open, onClose }) {
  useEffect(() => {
    const h = (e) => e.key==="Escape" && open && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  const inp = {width:"100%",padding:"8px 11px",border:"1px solid #e0d8c8",borderRadius:"2px",fontSize:"13px",color:"#1c1c14",background:"#fff",fontFamily:"'DM Sans',sans-serif",boxSizing:"border-box",outline:"none"};

  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(12,11,8,0.4)",zIndex:500,backdropFilter:"blur(2px)"}}/>
      <div style={{position:"fixed",top:0,right:0,bottom:0,width:"340px",background:"#f7f5f0",zIndex:501,boxShadow:"-8px 0 40px rgba(12,11,8,0.15)",overflowY:"auto",animation:"bp-slide-right 0.28s cubic-bezier(0.25,0.46,0.45,0.94)",fontFamily:"'DM Sans',sans-serif"}}>
        {/* Drawer header */}
        <div style={{padding:"20px 24px",borderBottom:"1px solid #e8e2d6",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:"#f7f5f0",zIndex:1}}>
          <span style={{fontSize:"13px",fontWeight:600,color:"#1c1c14",letterSpacing:"0.5px",textTransform:"uppercase"}}>Filters</span>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <button onClick={onReset} style={{background:"none",border:"none",cursor:"pointer",color:"#9a8c6e",fontSize:"12px",fontFamily:"inherit",padding:0,textDecoration:"underline"}}>Reset</button>
            <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:"#6b6340",display:"flex",alignItems:"center",padding:4}}><XIcon /></button>
          </div>
        </div>

        <div style={{padding:"24px"}}>
          {/* Listing type */}
          <div style={{marginBottom:"22px"}}>
            <label style={S.drawerLabel}>Listing Type</label>
            <div style={{display:"flex",gap:"6px"}}>
              {["",...LISTING_TYPES].map(lt=>(
                <button key={lt} className="bp-filter-chip"
                  onClick={()=>setFilters(f=>({...f,listingType:lt}))}
                  style={{flex:1,padding:"7px 4px",borderRadius:"2px",border:`1px solid ${filters.listingType===lt?"#6b6340":"#e0d8c8"}`,background:filters.listingType===lt?"#1c1c14":"transparent",color:filters.listingType===lt?"#f7f5f0":"#6b6340",cursor:"pointer",fontSize:"12px",fontWeight:500,fontFamily:"inherit",letterSpacing:"0.3px"}}>
                  {lt===""?"All":lt==="SALE"?"For Sale":lt==="RENT"?"For Rent":"Both"}
                </button>
              ))}
            </div>
          </div>

          {/* Property type */}
          <div style={{marginBottom:"22px"}}>
            <label style={S.drawerLabel}>Property Type</label>
            <select className="bp-select" value={filters.type} onChange={e=>setFilters(f=>({...f,type:e.target.value}))} style={inp}>
              <option value="">All Types</option>
              {PROPERTY_TYPES.map(t=><option key={t} value={t}>{typeLabel(t)}</option>)}
            </select>
          </div>

          {/* City */}
          <div style={{marginBottom:"22px"}}>
            <label style={S.drawerLabel}>City</label>
            <input className="bp-input" type="text" placeholder="e.g. Tirana" value={filters.city} onChange={e=>setFilters(f=>({...f,city:e.target.value}))} style={inp}/>
          </div>

          {/* Price */}
          <div style={{marginBottom:"22px"}}>
            <label style={S.drawerLabel}>Price (EUR)</label>
            <div style={{display:"flex",gap:"8px"}}>
              <input className="bp-input" type="number" min="0" placeholder="Min" value={filters.minPrice} onChange={e=>setFilters(f=>({...f,minPrice:e.target.value}))} style={inp}/>
              <input className="bp-input" type="number" min="0" placeholder="Max" value={filters.maxPrice} onChange={e=>setFilters(f=>({...f,maxPrice:e.target.value}))} style={inp}/>
            </div>
          </div>

          {/* Bedrooms */}
          <div style={{marginBottom:"22px"}}>
            <label style={S.drawerLabel}>Min. Bedrooms</label>
            <div style={{display:"flex",gap:"5px",flexWrap:"wrap"}}>
              {["","1","2","3","4","5","6"].map(n=>(
                <button key={n} className="bp-filter-chip"
                  onClick={()=>setFilters(f=>({...f,minBedrooms:n}))}
                  style={{padding:"6px 12px",borderRadius:"2px",border:`1px solid ${filters.minBedrooms===n?"#6b6340":"#e0d8c8"}`,background:filters.minBedrooms===n?"#1c1c14":"transparent",color:filters.minBedrooms===n?"#f7f5f0":"#6b6340",cursor:"pointer",fontSize:"12px",fontFamily:"inherit"}}>
                  {n===""?"Any":`${n}+`}
                </button>
              ))}
            </div>
          </div>

          {/* Bathrooms */}
          <div style={{marginBottom:"22px"}}>
            <label style={S.drawerLabel}>Min. Bathrooms</label>
            <div style={{display:"flex",gap:"5px",flexWrap:"wrap"}}>
              {["","1","2","3","4"].map(n=>(
                <button key={n} className="bp-filter-chip"
                  onClick={()=>setFilters(f=>({...f,minBathrooms:n}))}
                  style={{padding:"6px 12px",borderRadius:"2px",border:`1px solid ${filters.minBathrooms===n?"#6b6340":"#e0d8c8"}`,background:filters.minBathrooms===n?"#1c1c14":"transparent",color:filters.minBathrooms===n?"#f7f5f0":"#6b6340",cursor:"pointer",fontSize:"12px",fontFamily:"inherit"}}>
                  {n===""?"Any":`${n}+`}
                </button>
              ))}
            </div>
          </div>

          {/* Area */}
          <div style={{marginBottom:"22px"}}>
            <label style={S.drawerLabel}>Area (m²)</label>
            <div style={{display:"flex",gap:"8px"}}>
              <input className="bp-input" type="number" min="0" placeholder="Min" value={filters.minArea} onChange={e=>setFilters(f=>({...f,minArea:e.target.value}))} style={inp}/>
              <input className="bp-input" type="number" min="0" placeholder="Max" value={filters.maxArea} onChange={e=>setFilters(f=>({...f,maxArea:e.target.value}))} style={inp}/>
            </div>
          </div>

          {/* Featured */}
          <div style={{marginBottom:"28px"}}>
            <label style={{display:"flex",alignItems:"center",gap:"9px",cursor:"pointer",color:"#4a4438",fontSize:"13px"}}>
              <input type="checkbox" checked={filters.isFeatured===true} onChange={e=>setFilters(f=>({...f,isFeatured:e.target.checked?true:""}))} style={{accentColor:"#6b6340",width:"15px",height:"15px"}}/>
              Featured only
            </label>
          </div>

          <button onClick={()=>{onApply();onClose();}} className="bp-btn-primary"
            style={{width:"100%",padding:"12px",background:"#1c1c14",color:"#f7f5f0",border:"none",borderRadius:"2px",fontSize:"13.5px",fontWeight:500,cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.3px"}}>
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, onChange }) {
  if (totalPages<=1) return null;
  const pages   = Array.from({length:totalPages},(_,i)=>i);
  const visible = pages.filter(p=>p===0||p===totalPages-1||Math.abs(p-page)<=1);
  return (
    <div style={{display:"flex",justifyContent:"center",gap:"4px",marginTop:"48px",flexWrap:"wrap"}}>
      <button disabled={page===0} onClick={()=>onChange(page-1)} className="bp-pagination-btn" style={S.pgBtn(false,page===0)}>‹</button>
      {visible.map((p,i)=>{
        const gap=visible[i-1]!=null&&p-visible[i-1]>1;
        return <span key={p} style={{display:"flex",gap:"4px"}}>
          {gap&&<span style={{padding:"7px 4px",color:"#b0a890",fontSize:13}}>…</span>}
          <button onClick={()=>onChange(p)} className="bp-pagination-btn" style={S.pgBtn(p===page,false)}>{p+1}</button>
        </span>;
      })}
      <button disabled={page===totalPages-1} onClick={()=>onChange(page+1)} className="bp-pagination-btn" style={S.pgBtn(false,page===totalPages-1)}>›</button>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ viewMode }) {
  return (
    <div style={gridStyle(viewMode)}>
      {Array.from({length:6}).map((_,i)=>(
        <div key={i} style={{background:"#ede9df",borderRadius:"2px",height:viewMode==="grid"?"340px":"180px",animation:"bp-pulse 1.6s ease-in-out infinite"}}/>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BrowseProperties() {
  const { user } = useContext(AuthContext);

  const [properties,     setProperties]     = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState(null);
  const [searchQuery,    setSearchQuery]    = useState("");
  const [filters,        setFilters]        = useState(DEFAULT_FILTERS);
  const [pendingFilters, setPendingFilters] = useState(DEFAULT_FILTERS);
  const [page,           setPage]           = useState(0);
  const [totalPages,     setTotalPages]     = useState(0);
  const [totalElements,  setTotalElements]  = useState(0);
  const [viewMode,       setViewMode]       = useState("grid");
  const [mode,           setMode]           = useState("filter");
  const [savedIds,       setSavedIds]       = useState(new Set());
  const [filterOpen,     setFilterOpen]     = useState(false);

  const [selectedId,  setSelectedId]  = useState(null);
  const [applyTarget, setApplyTarget] = useState(null);
  const [buyTarget,   setBuyTarget]   = useState(null);
  const [showMyApps,  setShowMyApps]  = useState(false);
  const [toast,       setToast]       = useState(null);

  const notify = useCallback((msg, type="success") => setToast({msg,type,key:Date.now()}), []);

  useEffect(() => {
    const loadSavedIds = async () => {
      try {
        const res = await api.get("/api/properties/saved?page=0&size=500");
        const content = res.data?.content ?? [];
        setSavedIds(new Set(content.map(r => r.propertyId)));
      } catch {}
    };
    loadSavedIds();
  }, []);

  const handleSaveToggle = useCallback(async (property) => {
    const isSaved = savedIds.has(property.id);
    setSavedIds(prev => { const next=new Set(prev); isSaved?next.delete(property.id):next.add(property.id); return next; });
    try {
      if (isSaved) { await api.delete(`/api/properties/saved/${property.id}`); notify("Removed from saved"); }
      else { await api.post(`/api/properties/saved/${property.id}`); notify("Saved to favourites"); }
    } catch (err) {
      setSavedIds(prev => { const next=new Set(prev); isSaved?next.add(property.id):next.delete(property.id); return next; });
      if (err.response?.status===409) { setSavedIds(prev=>new Set([...prev,property.id])); return; }
      notify(err.response?.data?.message||"Error","error");
    }
  }, [savedIds, notify]);

  const fetchFiltered = useCallback(async (f, pg=0) => {
    setLoading(true); setError(null);
    try {
      const params = { page:pg, size:PAGE_SIZE, status:"AVAILABLE" };
      if (f.minPrice)    params.minPrice    = f.minPrice;
      if (f.maxPrice)    params.maxPrice    = f.maxPrice;
      if (f.minBedrooms) params.minBedrooms = f.minBedrooms;
      if (f.maxBedrooms) params.maxBedrooms = f.maxBedrooms;
      if (f.minBathrooms) params.minBathrooms = f.minBathrooms;
      if (f.minArea)     params.minArea     = f.minArea;
      if (f.maxArea)     params.maxArea     = f.maxArea;
      if (f.city)        params.city        = f.city;
      if (f.country)     params.country     = f.country;
      if (f.type)        params.type        = f.type;
      if (f.listingType) params.listingType = f.listingType;
      if (f.isFeatured)  params.isFeatured  = true;
      const res = await api.get("/api/properties/filter", { params });
      const data = res.data;
      setProperties(data.content||[]); setTotalPages(data.totalPages??data.total_pages??0);
      setTotalElements(data.totalElements??data.total_elements??0); setPage(pg);
    } catch { setError("Could not load properties. Please try again."); }
    finally { setLoading(false); }
  }, []);

  const fetchSearch = useCallback(async (keyword, pg=0) => {
    setLoading(true); setError(null);
    try {
      const upper = keyword.toUpperCase();
      if (PROPERTY_TYPES.includes(upper)) { fetchFiltered({...DEFAULT_FILTERS,type:upper},0); return; }
      if (upper==="RENT") { fetchFiltered({...DEFAULT_FILTERS,listingType:"RENT"},0); return; }
      if (upper==="SALE") { fetchFiltered({...DEFAULT_FILTERS,listingType:"SALE"},0); return; }
      const params = { page:pg, size:PAGE_SIZE, sort:"createdAt,desc", status:"AVAILABLE", city:keyword };
      const res = await api.get("/api/properties/filter", { params });
      const data = res.data;
      setProperties(data.content||[]); setTotalPages(data.totalPages??0);
      setTotalElements(data.totalElements??0); setPage(pg);
    } catch { setError("Search failed. Please try again."); }
    finally { setLoading(false); }
  }, [fetchFiltered]);

  useEffect(() => { fetchFiltered(DEFAULT_FILTERS,0); }, [fetchFiltered]);

  const handleSearch = () => {
    const q = searchQuery.trim();
    if (!q) { setMode("filter"); fetchFiltered(filters,0); return; }
    setMode("search"); fetchSearch(q,0);
  };
  const handleApplyFilters = () => {
    setFilters(pendingFilters); setMode("filter"); setSearchQuery("");
    fetchFiltered(pendingFilters,0);
  };
  const handleResetFilters = () => {
    setPendingFilters(DEFAULT_FILTERS); setFilters(DEFAULT_FILTERS);
    setMode("filter"); setSearchQuery(""); fetchFiltered(DEFAULT_FILTERS,0);
  };
  const handlePageChange = (p) => {
    mode==="search"&&searchQuery.trim()?fetchSearch(searchQuery.trim(),p):fetchFiltered(filters,p);
    window.scrollTo({top:0,behavior:"smooth"});
  };

  const activeFilterCount = Object.entries(filters).filter(([k,v])=>k!=="status"&&v!==""&&v!=null&&v!==false).length;

  return (
    <MainLayout role="client">
      <style>{GLOBAL_CSS}</style>

      <div className="bp-root">

        {/* ── Top bar ── */}
        <div style={{background:"#fff",borderBottom:"1px solid #e8e2d6",padding:"0 32px",position:"sticky",top:0,zIndex:100,height:"60px",display:"flex",alignItems:"center",gap:"16px",fontFamily:"'DM Sans',sans-serif"}}>

          {/* Search */}
          <div style={{flex:1,maxWidth:"480px",display:"flex",alignItems:"center",gap:"10px",background:"#f7f5f0",border:"1px solid #e8e2d6",borderRadius:"2px",padding:"0 14px",height:"38px"}}>
            <span style={{color:"#b0a890",flexShrink:0,display:"flex"}}><SearchIcon/></span>
            <input type="text" placeholder="Search by city, title, keyword…" value={searchQuery}
              onChange={e=>setSearchQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSearch()}
              className="bp-input"
              style={{flex:1,border:"none",outline:"none",fontSize:"13.5px",color:"#1c1c14",background:"transparent",fontFamily:"inherit"}}/>
            {searchQuery&&<button onClick={()=>{setSearchQuery("");setMode("filter");fetchFiltered(filters,0);}} style={{background:"none",border:"none",cursor:"pointer",color:"#b0a890",padding:0,display:"flex"}}><XIcon/></button>}
          </div>

          <button onClick={handleSearch}
            style={{padding:"0 18px",height:"38px",background:"#1c1c14",color:"#f7f5f0",border:"none",borderRadius:"2px",fontSize:"13px",fontWeight:500,cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.2px",display:"flex",alignItems:"center",gap:7}}>
            <SearchIcon/> Search
          </button>

          {/* Divider */}
          <div style={{width:1,height:28,background:"#e8e2d6"}}/>

          {/* Filters button */}
          <button onClick={()=>setFilterOpen(true)}
            style={{padding:"0 16px",height:"38px",background:"transparent",color:activeFilterCount>0?"#1c1c14":"#6b6340",border:`1px solid ${activeFilterCount>0?"#6b6340":"#e0d8c8"}`,borderRadius:"2px",fontSize:"13px",fontWeight:500,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:7,letterSpacing:"0.2px",position:"relative"}}>
            <SlidersIcon/>
            Filters
            {activeFilterCount>0&&(
              <span style={{background:"#1c1c14",color:"#f7f5f0",borderRadius:"50%",width:18,height:18,fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:600}}>
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Active filter chips */}
          {activeFilterCount>0&&(
            <button onClick={handleResetFilters}
              style={{padding:"0 12px",height:"30px",background:"transparent",color:"#9a8c6e",border:"none",borderRadius:"2px",fontSize:"12px",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5,textDecoration:"underline"}}>
              Clear all
            </button>
          )}

          {/* Spacer */}
          <div style={{flex:1}}/>

          {/* View toggle */}
          <div style={{display:"flex",gap:"2px",background:"#f7f5f0",border:"1px solid #e8e2d6",borderRadius:"2px",padding:"3px"}}>
            {[{m:"grid",Icon:GridIcon},{m:"list",Icon:ListIcon}].map(({m,Icon})=>(
              <button key={m} onClick={()=>setViewMode(m)}
                style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"6px 10px",borderRadius:"2px",border:"none",background:viewMode===m?"#fff":"transparent",color:viewMode===m?"#1c1c14":"#b0a890",cursor:"pointer",transition:"all 0.15s",boxShadow:viewMode===m?"0 1px 4px rgba(0,0,0,0.08)":"none"}}>
                <Icon/>
              </button>
            ))}
          </div>

          {/* My Applications */}
          <button onClick={()=>setShowMyApps(true)}
            style={{padding:"0 14px",height:"38px",background:"transparent",color:"#6b6340",border:"1px solid #e0d8c8",borderRadius:"2px",fontSize:"12.5px",fontWeight:500,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:7,letterSpacing:"0.2px"}}>
            <ClipboardIcon/> My Applications
          </button>
        </div>

        {/* ── Main content ── */}
        <div style={{padding:"28px 32px",maxWidth:"1440px",margin:"0 auto"}}>

          {/* Results count + search label */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"22px",flexWrap:"wrap",gap:8}}>
            <p style={{margin:0,fontSize:"13px",color:"#9a8c6e",fontFamily:"'DM Sans',sans-serif"}}>
              {loading?"Loading…":`${totalElements.toLocaleString()} propert${totalElements!==1?"ies":"y"} available`}
              {mode==="search"&&searchQuery&&<span style={{color:"#6b6340"}}> · Results for "<strong>{searchQuery}</strong>"</span>}
            </p>
          </div>

          {/* Error */}
          {error&&(
            <div style={{background:"#fff8f5",border:"1px solid #e8c4b0",borderRadius:"2px",padding:"14px 18px",color:"#6b3a1c",fontSize:"13.5px",marginBottom:"20px",display:"flex",alignItems:"center",gap:"12px",fontFamily:"'DM Sans',sans-serif"}}>
              {error}
              <button onClick={()=>mode==="search"?fetchSearch(searchQuery,page):fetchFiltered(filters,page)}
                style={{background:"#1c1c14",color:"#f7f5f0",border:"none",borderRadius:"2px",padding:"5px 14px",cursor:"pointer",fontSize:"12px",fontFamily:"inherit"}}>
                Retry
              </button>
            </div>
          )}

          {loading&&<Skeleton viewMode={viewMode}/>}

          {!loading&&!error&&properties.length===0&&(
            <div style={{textAlign:"center",padding:"88px 32px",color:"#b0a890",fontFamily:"'DM Sans',sans-serif"}}>
              <div style={{width:48,height:48,border:"1px solid #e0d8c8",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",color:"#c4bdb0"}}>
                <SearchIcon/>
              </div>
              <p style={{fontSize:"16px",fontWeight:500,color:"#6b6340",marginBottom:6,fontFamily:"'Cormorant Garamond',Georgia,serif"}}>No properties found</p>
              <p style={{fontSize:"13px",marginBottom:20}}>Try adjusting your filters or search terms.</p>
              <button onClick={handleResetFilters}
                style={{padding:"9px 22px",background:"#1c1c14",color:"#f7f5f0",border:"none",borderRadius:"2px",fontSize:"13px",fontWeight:500,cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.2px"}}>
                Clear Filters
              </button>
            </div>
          )}

          {!loading&&properties.length>0&&<>
            <div style={gridStyle(viewMode)}>
              {properties.map(p=>(
                <PropertyCard key={p.id} property={p} viewMode={viewMode}
                  onOpen={setSelectedId} onApply={setApplyTarget} onBuy={setBuyTarget}
                  onSaveToggle={handleSaveToggle} savedIds={savedIds}/>
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={handlePageChange}/>
          </>}
        </div>
      </div>

      {/* Filter Drawer */}
      <FilterDrawer
        filters={pendingFilters} setFilters={setPendingFilters}
        onApply={handleApplyFilters} onReset={handleResetFilters}
        open={filterOpen} onClose={()=>setFilterOpen(false)}
      />

      {selectedId&&<PropertyDetailModal propertyId={selectedId} onClose={()=>setSelectedId(null)}
        onApply={(p)=>{setSelectedId(null);setApplyTarget(p);}}
        onBuy={(p)=>{setSelectedId(null);setBuyTarget(p);}}/>}
      {applyTarget&&<RentalApplyModal property={applyTarget} onClose={()=>setApplyTarget(null)}
        onSuccess={()=>{setApplyTarget(null);notify("Application submitted successfully");}} notify={notify}/>}
      {buyTarget&&<SaleBuyModal property={buyTarget} onClose={()=>setBuyTarget(null)}
        onSuccess={()=>{setBuyTarget(null);notify("Purchase application submitted");}} notify={notify}/>}
      {showMyApps&&<MyApplicationsModal onClose={()=>setShowMyApps(false)} notify={notify}/>}
      {toast&&<Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}
    </MainLayout>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  drawerLabel: { display:"block", fontSize:"10.5px", fontWeight:600, color:"#b0a890", textTransform:"uppercase", letterSpacing:"0.9px", marginBottom:"9px", fontFamily:"'DM Sans',sans-serif" },
  modalLabel:  { display:"block", fontSize:"11px", fontWeight:600, color:"#9a8c6e", textTransform:"uppercase", letterSpacing:"0.7px", marginBottom:"7px", fontFamily:"'DM Sans',sans-serif" },
  pgBtn: (active, disabled) => ({
    padding:"7px 13px", borderRadius:"2px", border:"1px solid",
    borderColor: active?"#1c1c14":"#e0d8c8",
    background: active?"#1c1c14":"transparent",
    color: active?"#f7f5f0": disabled?"#d4ccbe":"#6b6340",
    cursor: disabled?"not-allowed":"pointer",
    fontSize:"13px", fontWeight: active?500:400,
    fontFamily:"'DM Sans',sans-serif",
    opacity: disabled?0.5:1,
  }),
};