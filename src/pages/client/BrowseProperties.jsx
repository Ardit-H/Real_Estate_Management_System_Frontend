import { useState, useEffect, useCallback, useRef } from "react";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";

// ─── Icons ────────────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
  </svg>
);
const BedIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 4v16"/><path d="M22 8H2"/><path d="M22 20V8l-4-4H6L2 8"/><path d="M6 8v4"/><path d="M18 8v4"/>
  </svg>
);
const BathIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/>
    <line x1="10" y1="5" x2="8" y2="7"/><line x1="2" y1="12" x2="22" y2="12"/>
  </svg>
);
const AreaIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3h7v7H3z"/><path d="M14 3h7v7h-7z"/><path d="M14 14h7v7h-7z"/><path d="M3 14h7v7H3z"/>
  </svg>
);
const LocationIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const StarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);
const GridIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/>
    <rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>
  </svg>
);
const ListIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);
const ChevronLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6"/>
  </svg>
);
const ChevronRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);
const FloorIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9h18"/><path d="M3 15h18"/><path d="M3 3h18"/><path d="M3 21h18"/>
  </svg>
);
const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const PhoneIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.38 2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const MessageIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const EyeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const MaximizeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/>
    <path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>
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
}[type]||type);
const listingBadge = (type) => ({
  SALE:{label:"For Sale",color:"#2a6049"},
  RENT:{label:"For Rent",color:"#5a3e2b"},
  BOTH:{label:"Sale / Rent",color:"#3a3a6b"},
}[type]||{label:type||"–",color:"#555"});
const imgUrl = (src) => {
  if (!src) return null;
  return src.startsWith("http") ? src : BASE_URL + src;
};
const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='260' viewBox='0 0 400 260'%3E%3Crect fill='%23e8e4da' width='400' height='260'/%3E%3Cpath d='M160 180 L200 120 L240 180Z' fill='%23c5bfaf'/%3E%3Crect x='175' y='155' width='50' height='25' fill='%23b0a894'/%3E%3C/svg%3E";
const gridStyle = (mode) => ({
  display: mode==="grid"?"grid":"flex",
  gridTemplateColumns: mode==="grid"?"repeat(auto-fill, minmax(280px, 1fr))":undefined,
  flexDirection: mode==="list"?"column":undefined,
  gap:"16px",
});

// ─── Mini Price Chart (SVG) ────────────────────────────────────────────────────
function PriceChart({ history }) {
  if (!history || history.length === 0) {
    return (
      <div style={{ textAlign:"center", padding:"32px", color:"#a0997e", fontSize:"13px" }}>
        No price history available yet.
      </div>
    );
  }

  const points = history.map((h, i) => ({
    x: i,
    y: h.new_price,
    date: new Date(h.changed_at).toLocaleDateString("en-GB",{month:"short",year:"2-digit"}),
    reason: h.reason,
    old: h.old_price,
  }));

  const W = 480, H = 160, PAD = { t:16, r:20, b:36, l:56 };
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const rangeY = maxY - minY || 1;
  const rangeX = (xs.length - 1) || 1;

  const px = (x) => PAD.l + (x / rangeX) * (W - PAD.l - PAD.r);
  const py = (y) => PAD.t + (1 - (y - minY) / rangeY) * (H - PAD.t - PAD.b);

  const pathD = points.map((p, i) => `${i===0?"M":"L"}${px(p.x).toFixed(1)},${py(p.y).toFixed(1)}`).join(" ");
  const areaD = pathD + ` L${px(xs[xs.length-1]).toFixed(1)},${(H-PAD.b).toFixed(1)} L${px(0).toFixed(1)},${(H-PAD.b).toFixed(1)} Z`;

  const last = points[points.length-1];
  const prev = points[points.length-2];
  const trend = prev ? (last.y > prev.y ? "up" : last.y < prev.y ? "down" : "same") : "same";
  const trendColor = trend==="up"?"#c0392b":trend==="down"?"#27ae60":"#888";
  const trendLabel = trend==="up"?"▲ Price increased":trend==="down"?"▼ Price dropped":"● No change";

  const [hovered, setHovered] = useState(null);

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
        <span style={{ fontSize:"13px", fontWeight:700, color:"#4a4a36" }}>Price History</span>
        <span style={{ fontSize:"12px", fontWeight:700, color:trendColor }}>{trendLabel}</span>
      </div>
      <div style={{ position:"relative" }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", height:"auto", overflow:"visible" }}>
          <defs>
            <linearGradient id="areafill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5a5f3a" stopOpacity="0.18"/>
              <stop offset="100%" stopColor="#5a5f3a" stopOpacity="0"/>
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0,0.25,0.5,0.75,1].map(t => {
            const yv = minY + t * rangeY;
            const ypos = py(yv);
            return (
              <g key={t}>
                <line x1={PAD.l} y1={ypos} x2={W-PAD.r} y2={ypos} stroke="#e5e0d4" strokeWidth="1"/>
                <text x={PAD.l-6} y={ypos+4} textAnchor="end" fontSize="10" fill="#a0997e">
                  {yv >= 1000 ? `${(yv/1000).toFixed(0)}k` : yv.toFixed(0)}
                </text>
              </g>
            );
          })}

          {/* Area */}
          <path d={areaD} fill="url(#areafill)"/>
          {/* Line */}
          <path d={pathD} fill="none" stroke="#5a5f3a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>

          {/* Points */}
          {points.map((p, i) => (
            <g key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor:"pointer" }}
            >
              <circle cx={px(p.x)} cy={py(p.y)} r="5" fill="#fff" stroke="#5a5f3a" strokeWidth="2.5"/>
              {hovered === i && (
                <g>
                  <rect
                    x={Math.min(px(p.x)-50, W-PAD.r-100)}
                    y={py(p.y)-52}
                    width="110" height="44"
                    rx="6" fill="#2c2c1e" opacity="0.93"
                  />
                  <text x={Math.min(px(p.x)-50,W-PAD.r-100)+55} y={py(p.y)-34} textAnchor="middle" fontSize="11" fill="#fff" fontWeight="700">
                    {formatPrice(p.y,"EUR")}
                  </text>
                  <text x={Math.min(px(p.x)-50,W-PAD.r-100)+55} y={py(p.y)-18} textAnchor="middle" fontSize="10" fill="#c8ccaa">
                    {p.date}
                  </text>
                </g>
              )}
              {/* X label */}
              <text x={px(p.x)} y={H-PAD.b+14} textAnchor="middle" fontSize="10" fill="#a0997e">{p.date}</text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

// ─── Property Detail Modal ─────────────────────────────────────────────────────
function PropertyDetailModal({ propertyId, onClose }) {
  const [property,    setProperty]    = useState(null);
  const [priceHistory,setPriceHistory]= useState([]);
  const [loading,     setLoading]     = useState(true);
  const [imgIndex,    setImgIndex]    = useState(0);
  const [fullscreen,  setFullscreen]  = useState(false);
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
        if (!cancelled) {
          setProperty(propRes.data);
          setPriceHistory(Array.isArray(histRes.data) ? histRes.data : []);
        }
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [propertyId]);

  // Close on Escape
  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") { if (fullscreen) setFullscreen(false); else onClose(); }};
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose, fullscreen]);

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const images = property?.images?.length
    ? property.images.map(i => imgUrl(i.imageUrl || i.image_url)).filter(Boolean)
    : [];
  const mainImg = images[imgIndex] || PLACEHOLDER;
  const badge   = listingBadge(property?.listingType || property?.listing_type);

  const prevImg = () => setImgIndex(i => (i - 1 + images.length) % images.length);
  const nextImg = () => setImgIndex(i => (i + 1) % images.length);

  const addr = property?.address;
  const addrStr = [addr?.street, addr?.city, addr?.country].filter(Boolean).join(", ");
  const features = property?.features || [];

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={e => { if (e.target === overlayRef.current) onClose(); }}
        style={{
          position:"fixed", inset:0,
          background:"rgba(20,20,10,0.72)",
          backdropFilter:"blur(4px)",
          zIndex:1000,
          display:"flex", alignItems:"center", justifyContent:"center",
          padding:"20px",
          animation:"fadeInOverlay 0.2s ease",
        }}
      >
        {/* Modal Box */}
        <div style={{
          background:"#faf8f3",
          borderRadius:"18px",
          width:"100%",
          maxWidth:"860px",
          maxHeight:"90vh",
          overflowY:"auto",
          boxShadow:"0 24px 64px rgba(0,0,0,0.35)",
          animation:"slideUpModal 0.25s ease",
          position:"relative",
        }}>
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position:"sticky", top:"12px", float:"right", marginRight:"12px",
              zIndex:10, background:"rgba(255,255,255,0.9)", border:"none",
              borderRadius:"50%", width:"34px", height:"34px",
              cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:"0 2px 8px rgba(0,0,0,0.18)", color:"#4a4a36",
            }}
          ><CloseIcon /></button>

          {/* Loading state */}
          {loading && (
            <div style={{ padding:"80px 40px", textAlign:"center", color:"#8a8469" }}>
              <div style={{ fontSize:"32px", marginBottom:"12px" }}>⏳</div>
              <p>Loading property details…</p>
            </div>
          )}

          {!loading && property && (
            <>
              {/* ── Image Gallery ─────────────────────────────────── */}
              <div style={{ position:"relative", height:"320px", background:"#1a1a14", borderRadius:"18px 18px 0 0", overflow:"hidden" }}>
                <img
                  src={mainImg}
                  alt={property.title}
                  style={{ width:"100%", height:"100%", objectFit:"cover", display:"block", transition:"opacity 0.2s" }}
                  onError={e=>{ e.target.src=PLACEHOLDER; }}
                />
                {/* Gradient overlay */}
                <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 50%)" }}/>

                {/* Listing badge */}
                <div style={{ position:"absolute", top:"16px", left:"16px", display:"flex", gap:"8px" }}>
                  <span style={{ background:badge.color, color:"#fff", fontSize:"12px", fontWeight:700, padding:"4px 12px", borderRadius:"20px" }}>
                    {badge.label}
                  </span>
                  {(property.isFeatured || property.is_featured) && (
                    <span style={{ background:"#c9a84c", color:"#fff", fontSize:"12px", fontWeight:700, padding:"4px 10px", borderRadius:"20px", display:"flex", alignItems:"center", gap:"3px" }}>
                      <StarIcon /> Featured
                    </span>
                  )}
                </div>

                {/* View count */}
                <div style={{ position:"absolute", top:"16px", right:"50px", background:"rgba(0,0,0,0.5)", color:"#fff", fontSize:"11px", padding:"3px 9px", borderRadius:"12px", display:"flex", alignItems:"center", gap:"4px", backdropFilter:"blur(4px)" }}>
                  <EyeIcon /> {property.viewCount ?? property.view_count ?? 0} views
                </div>

                {/* Fullscreen button */}
                <button
                  onClick={() => setFullscreen(true)}
  style={{
    position:"absolute",
    bottom:"14px",
    right:"14px",
    zIndex: 5,   // 👈 SHTO KËTË
    background:"rgba(0,0,0,0.5)",
    border:"none",
    borderRadius:"8px",
    color:"#fff",
    padding:"6px 10px",
    cursor:"pointer",
    display:"flex",
    alignItems:"center",
    gap:"5px",
    fontSize:"12px",
    backdropFilter:"blur(4px)"
  }}
                >
                  <MaximizeIcon /> Fullscreen
                </button>

                {/* Navigation arrows */}
                {images.length > 1 && (
                  <>
                    <button onClick={prevImg} style={{ position:"absolute", left:"12px", top:"50%", transform:"translateY(-50%)", background:"rgba(255,255,255,0.85)", border:"none", borderRadius:"50%", width:"36px", height:"36px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 8px rgba(0,0,0,0.2)" }}>
                      <ChevronLeftIcon />
                    </button>
                    <button onClick={nextImg} style={{ position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)", background:"rgba(255,255,255,0.85)", border:"none", borderRadius:"50%", width:"36px", height:"36px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 8px rgba(0,0,0,0.2)" }}>
                      <ChevronRightIcon />
                    </button>
                  </>
                )}

                {/* Dot indicators */}
                {images.length > 1 && (
                  <div style={{
  position:"absolute",
  bottom:"0",
  left:"0",
  right:"0",
  zIndex: 1,   // 👈 SHTO KËTË
  display:"flex",
}}>
                    {images.map((_, i) => (
                      <button key={i} onClick={()=>setImgIndex(i)} style={{ width: i===imgIndex?"20px":"8px", height:"8px", borderRadius:"4px", background: i===imgIndex?"#fff":"rgba(255,255,255,0.5)", border:"none", cursor:"pointer", transition:"all 0.2s", padding:0 }}/>
                    ))}
                  </div>
                )}

                {/* Thumbnail strip */}
                {images.length > 1 && (
                  <div style={{ position:"absolute", bottom:"0", left:"0", right:"0", display:"flex", gap:"4px", padding:"8px 12px 0", overflowX:"auto", background:"rgba(0,0,0,0.4)" }}>
                    {images.map((src, i) => (
                      <img
                        key={i} src={src} alt=""
                        onClick={()=>setImgIndex(i)}
                        style={{ width:"52px", height:"38px", objectFit:"cover", borderRadius:"5px", cursor:"pointer", border: i===imgIndex?"2px solid #fff":"2px solid transparent", opacity: i===imgIndex?1:0.65, flexShrink:0, transition:"all 0.15s" }}
                        onError={e=>{ e.target.src=PLACEHOLDER; }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* ── Body ─────────────────────────────────────────── */}
              <div style={{ padding:"24px 28px 28px" }}>

                {/* Title + Price row */}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"16px", marginBottom:"8px", flexWrap:"wrap" }}>
                  <h2 style={{ margin:0, fontSize:"22px", fontWeight:800, color:"#2c2c1e", lineHeight:1.25, flex:1 }}>
                    {property.title}
                  </h2>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:"26px", fontWeight:900, color:"#5a5f3a", whiteSpace:"nowrap" }}>
                      {formatPrice(property.price, property.currency)}
                    </div>
                    {(property.pricePerSqm || property.price_per_sqm) && (
                      <div style={{ fontSize:"12px", color:"#8a8469" }}>
                        {formatPrice(property.pricePerSqm||property.price_per_sqm, property.currency)} / m²
                      </div>
                    )}
                  </div>
                </div>

                {/* Location */}
                {addrStr && (
                  <div style={{ display:"flex", alignItems:"center", gap:"5px", color:"#8a8469", fontSize:"13px", marginBottom:"16px" }}>
                    <LocationIcon /> {addrStr}
                  </div>
                )}

                {/* Status chips */}
                <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", marginBottom:"20px" }}>
                  <span style={{ background:"#edf2e8", color:"#3d5227", border:"1px solid #c8d4b0", borderRadius:"20px", padding:"3px 12px", fontSize:"12px", fontWeight:700 }}>
                    {property.status || "AVAILABLE"}
                  </span>
                  <span style={{ background:"#f0ece3", color:"#5a5f3a", border:"1px solid #d9d4c7", borderRadius:"20px", padding:"3px 12px", fontSize:"12px", fontWeight:700 }}>
                    {typeLabel(property.type)}
                  </span>
                  {property.currency && (
                    <span style={{ background:"#f0ece3", color:"#5a5f3a", border:"1px solid #d9d4c7", borderRadius:"20px", padding:"3px 12px", fontSize:"12px", fontWeight:600 }}>
                      {property.currency}
                    </span>
                  )}
                </div>

                {/* ── Specs Grid ── */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(130px,1fr))", gap:"10px", marginBottom:"22px" }}>
                  {[
                    { icon:<BedIcon/>,      label:"Bedrooms",    val:property.bedrooms },
                    { icon:<BathIcon/>,     label:"Bathrooms",   val:property.bathrooms },
                    { icon:<AreaIcon/>,     label:"Area",        val:property.areaSqm??property.area_sqm, unit:"m²" },
                    { icon:<FloorIcon/>,    label:"Floor",       val:property.floor!=null?`${property.floor} / ${property.totalFloors??property.total_floors??'–'}`:null },
                    { icon:<CalendarIcon/>, label:"Year Built",  val:property.yearBuilt??property.year_built },
                  ].filter(s => s.val != null).map((s,i) => (
                    <div key={i} style={{ background:"#fff", border:"1px solid #e5e0d4", borderRadius:"10px", padding:"12px 14px", display:"flex", flexDirection:"column", gap:"4px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:"5px", color:"#a0997e", fontSize:"11px", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.5px" }}>
                        {s.icon} {s.label}
                      </div>
                      <div style={{ fontSize:"16px", fontWeight:800, color:"#2c2c1e" }}>
                        {s.val}{s.unit ? ` ${s.unit}` : ""}
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── Description ── */}
                {property.description && (
                  <div style={{ marginBottom:"22px" }}>
                    <h4 style={{ margin:"0 0 8px", fontSize:"13px", fontWeight:700, color:"#6b6651", textTransform:"uppercase", letterSpacing:"0.6px" }}>Description</h4>
                    <p style={{ margin:0, fontSize:"14px", lineHeight:1.7, color:"#4a4a36", whiteSpace:"pre-wrap" }}>
                      {property.description}
                    </p>
                  </div>
                )}

                {/* ── Features ── */}
                {features.length > 0 && (
                  <div style={{ marginBottom:"22px" }}>
                    <h4 style={{ margin:"0 0 10px", fontSize:"13px", fontWeight:700, color:"#6b6651", textTransform:"uppercase", letterSpacing:"0.6px" }}>Features & Amenities</h4>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:"7px" }}>
                      {features.map((f, i) => (
                        <span key={i} style={{ background:"#fff", border:"1px solid #d9d4c7", borderRadius:"20px", padding:"4px 12px", fontSize:"12.5px", color:"#4a4a36", fontWeight:500 }}>
                          ✓ {typeof f === "string" ? f.replace(/_/g," ") : f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Price History Chart ── */}
                <div style={{ marginBottom:"22px", background:"#fff", border:"1px solid #e5e0d4", borderRadius:"12px", padding:"18px 20px" }}>
                  <PriceChart history={priceHistory} />
                </div>

                {/* ── Contact Agent Box ── */}
                <div style={{ background:"linear-gradient(135deg, #5a5f3a, #3d4228)", borderRadius:"14px", padding:"20px 22px", color:"#fff" }}>
                  <h4 style={{ margin:"0 0 4px", fontSize:"14px", fontWeight:700, color:"#c8ccaa", textTransform:"uppercase", letterSpacing:"0.5px" }}>Contact Agent</h4>
                  <p style={{ margin:"0 0 16px", fontSize:"16px", fontWeight:700 }}>
                    {property.agentId || property.agent_id ? `Agent #${property.agentId??property.agent_id}` : "Our Agent"}
                  </p>
                  <div style={{ display:"flex", gap:"10px", flexWrap:"wrap" }}>
                    <button style={{
                      display:"flex", alignItems:"center", gap:"7px",
                      background:"#a3a380", color:"#1f1f1f",
                      border:"none", borderRadius:"10px",
                      padding:"10px 18px", fontSize:"13.5px", fontWeight:700,
                      cursor:"pointer", fontFamily:"inherit",
                      transition:"opacity 0.15s",
                    }}>
                      <MessageIcon /> Send Message
                    </button>
                    <button style={{
                      display:"flex", alignItems:"center", gap:"7px",
                      background:"rgba(255,255,255,0.15)", color:"#fff",
                      border:"1.5px solid rgba(255,255,255,0.35)", borderRadius:"10px",
                      padding:"10px 18px", fontSize:"13.5px", fontWeight:700,
                      cursor:"pointer", fontFamily:"inherit",
                      transition:"opacity 0.15s",
                    }}>
                      <PhoneIcon /> Request Viewing
                    </button>
                  </div>
                </div>

              </div>
            </>
          )}
        </div>
      </div>

      {/* Fullscreen image overlay */}
      {fullscreen && (
        <div
          onClick={() => setFullscreen(false)}
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.95)", zIndex:2000, display:"flex", alignItems:"center", justifyContent:"center", cursor:"zoom-out" }}
        >
          <img src={mainImg} alt="" style={{ maxWidth:"95vw", maxHeight:"95vh", objectFit:"contain" }} />
          {images.length > 1 && (
            <>
              <button onClick={e=>{e.stopPropagation();prevImg();}} style={{ position:"fixed", left:"16px", top:"50%", transform:"translateY(-50%)", background:"rgba(255,255,255,0.15)", border:"none", borderRadius:"50%", width:"44px", height:"44px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff" }}>
                <ChevronLeftIcon />
              </button>
              <button onClick={e=>{e.stopPropagation();nextImg();}} style={{ position:"fixed", right:"16px", top:"50%", transform:"translateY(-50%)", background:"rgba(255,255,255,0.15)", border:"none", borderRadius:"50%", width:"44px", height:"44px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff" }}>
                <ChevronRightIcon />
              </button>
            </>
          )}
          <button onClick={()=>setFullscreen(false)} style={{ position:"fixed", top:"16px", right:"16px", background:"rgba(255,255,255,0.15)", border:"none", borderRadius:"50%", width:"40px", height:"40px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff" }}>
            <CloseIcon />
          </button>
        </div>
      )}
    </>
  );
}

// ─── Property Card ─────────────────────────────────────────────────────────────
function PropertyCard({ property, viewMode, onOpen }) {
  const badge  = listingBadge(property.listing_type || property.listingType);
  const src    = property.primaryImage || property.primary_image || property.imageUrl;
  const img    = src ? (src.startsWith("http") ? src : BASE_URL + src) : PLACEHOLDER;
  const isGrid = viewMode === "grid";

  return (
    <div
      onClick={() => onOpen(property.id)}
      style={{
        background:"#fff", borderRadius:"14px", overflow:"hidden",
        boxShadow:"0 2px 12px rgba(90,95,58,0.10)", cursor:"pointer",
        display:isGrid?"block":"flex",
        transition:"transform 0.18s, box-shadow 0.18s",
        border:"1px solid #ede9df",
        minHeight:isGrid?"auto":"160px",
      }}
      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 8px 28px rgba(90,95,58,0.18)";}}
      onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 2px 12px rgba(90,95,58,0.10)";}}
    >
      <div style={{ position:"relative", width:isGrid?"100%":"220px", minWidth:isGrid?"auto":"220px", height:isGrid?"200px":"100%", minHeight:isGrid?"200px":"160px", background:"#f0ece3", flexShrink:0 }}>
        <img src={img} alt={property.title} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} onError={e=>{e.target.src=PLACEHOLDER;}}/>
        <div style={{ position:"absolute", top:"10px", left:"10px", display:"flex", gap:"6px" }}>
          <span style={{ background:badge.color, color:"#fff", fontSize:"11px", fontWeight:700, padding:"3px 9px", borderRadius:"20px", letterSpacing:"0.4px" }}>{badge.label}</span>
          {(property.is_featured||property.isFeatured) && (
            <span style={{ background:"#c9a84c", color:"#fff", fontSize:"11px", fontWeight:700, padding:"3px 8px", borderRadius:"20px", display:"flex", alignItems:"center", gap:"3px" }}><StarIcon /> Featured</span>
          )}
        </div>
        <span style={{ position:"absolute", bottom:"10px", right:"10px", background:"rgba(0,0,0,0.55)", color:"#fff", fontSize:"11px", padding:"2px 8px", borderRadius:"8px", backdropFilter:"blur(4px)" }}>{typeLabel(property.type)}</span>
      </div>

      <div style={{ padding:isGrid?"16px":"16px 20px", flex:1, display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
        <div>
          {(property.city||property.country) && (
            <div style={{ display:"flex", alignItems:"center", gap:"4px", color:"#8a8469", fontSize:"12px", marginBottom:"6px" }}>
              <LocationIcon /><span>{[property.city,property.country].filter(Boolean).join(", ")}</span>
            </div>
          )}
          <h3 style={{ margin:"0 0 8px", fontSize:isGrid?"15px":"16px", fontWeight:700, color:"#2c2c1e", lineHeight:1.3, overflow:"hidden", textOverflow:"ellipsis", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
            {property.title}
          </h3>
          <div style={{ fontSize:isGrid?"18px":"20px", fontWeight:800, color:"#5a5f3a", marginBottom:"10px" }}>
            {formatPrice(property.price, property.currency)}
          </div>
        </div>
        <div style={{ display:"flex", gap:"14px", color:"#6b6651", fontSize:"12.5px", flexWrap:"wrap" }}>
          {property.bedrooms  != null && <span style={{ display:"flex", alignItems:"center", gap:"4px" }}><BedIcon/>{property.bedrooms} bed{property.bedrooms!==1?"s":""}</span>}
          {property.bathrooms != null && <span style={{ display:"flex", alignItems:"center", gap:"4px" }}><BathIcon/>{property.bathrooms} bath{property.bathrooms!==1?"s":""}</span>}
          {(property.area_sqm??property.areaSqm) != null && <span style={{ display:"flex", alignItems:"center", gap:"4px" }}><AreaIcon/>{property.area_sqm??property.areaSqm} m²</span>}
        </div>
      </div>
    </div>
  );
}

// ─── Number Selector ──────────────────────────────────────────────────────────
function NumberSelector({ label, filterKey, filters, setFilters, max=8 }) {
  return (
    <div style={{ marginBottom:"16px" }}>
      <label style={S.filterLabel}>{label}</label>
      <div style={{ display:"flex", gap:"5px", flexWrap:"wrap" }}>
        <button onClick={()=>setFilters(f=>({...f,[filterKey]:""}))} style={{...S.numBtn,background:filters[filterKey]===""?"#5a5f3a":"#f0ece3",color:filters[filterKey]===""?"#fff":"#5a5f3a"}}>Any</button>
        {Array.from({length:max},(_,i)=>i+1).map(n=>(
          <button key={n} onClick={()=>setFilters(f=>({...f,[filterKey]:n}))} style={{...S.numBtn,background:Number(filters[filterKey])===n?"#5a5f3a":"#f0ece3",color:Number(filters[filterKey])===n?"#fff":"#5a5f3a"}}>{n}+</button>
        ))}
      </div>
    </div>
  );
}

// ─── Range Input ──────────────────────────────────────────────────────────────
function RangeInput({ label, minKey, maxKey, filters, setFilters, ph=["Min","Max"] }) {
  return (
    <div style={{ marginBottom:"16px" }}>
      <label style={S.filterLabel}>{label}</label>
      <div style={{ display:"flex", gap:"8px" }}>
        <input type="number" min="0" placeholder={ph[0]} value={filters[minKey]} onChange={e=>setFilters(f=>({...f,[minKey]:e.target.value}))} style={S.filterInput}/>
        <input type="number" min="0" placeholder={ph[1]} value={filters[maxKey]} onChange={e=>setFilters(f=>({...f,[maxKey]:e.target.value}))} style={S.filterInput}/>
      </div>
    </div>
  );
}

// ─── Filter Sidebar ────────────────────────────────────────────────────────────
function FilterSidebar({ filters, setFilters, onApply, onReset }) {
  return (
    <aside style={{ width:"270px", minWidth:"270px", background:"#faf8f3", borderRadius:"14px", border:"1px solid #e5e0d4", padding:"22px 18px", height:"fit-content", position:"sticky", top:"24px", maxHeight:"calc(100vh - 48px)", overflowY:"auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"7px", fontWeight:700, color:"#2c2c1e", fontSize:"15px" }}><FilterIcon/> Filters</div>
        <button onClick={onReset} style={{ background:"none", border:"none", cursor:"pointer", color:"#8a8469", fontSize:"12px", textDecoration:"underline", fontFamily:"inherit" }}>Reset all</button>
      </div>

      <div style={{ marginBottom:"16px" }}>
        <label style={S.filterLabel}>Listing Type</label>
        <div style={{ display:"flex", gap:"6px" }}>
          {["",...LISTING_TYPES].map(lt=>(
            <button key={lt} onClick={()=>setFilters(f=>({...f,listingType:lt}))}
              style={{ flex:1, padding:"6px 4px", borderRadius:"8px", border:"1.5px solid", borderColor:filters.listingType===lt?"#5a5f3a":"#d9d4c7", background:filters.listingType===lt?"#5a5f3a":"#fff", color:filters.listingType===lt?"#fff":"#5a5f3a", cursor:"pointer", fontSize:"11.5px", fontWeight:600, transition:"all 0.15s", fontFamily:"inherit" }}>
              {lt===""?"All":lt==="SALE"?"Sale":lt==="RENT"?"Rent":"Both"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom:"16px" }}>
        <label style={S.filterLabel}>Property Type</label>
        <select value={filters.type} onChange={e=>setFilters(f=>({...f,type:e.target.value}))} style={S.select}>
          <option value="">All Types</option>
          {PROPERTY_TYPES.map(t=><option key={t} value={t}>{typeLabel(t)}</option>)}
        </select>
      </div>

      <div style={{ marginBottom:"16px" }}>
        <label style={S.filterLabel}>City</label>
        <input type="text" placeholder="e.g. Tirana" value={filters.city} onChange={e=>setFilters(f=>({...f,city:e.target.value}))} style={S.filterInputFull}/>
      </div>

      <RangeInput label="Price (EUR)" minKey="minPrice" maxKey="maxPrice" filters={filters} setFilters={setFilters} ph={["Min €","Max €"]}/>
      <NumberSelector label="Min. Bedrooms"  filterKey="minBedrooms"  filters={filters} setFilters={setFilters}/>
      <NumberSelector label="Min. Bathrooms" filterKey="minBathrooms" filters={filters} setFilters={setFilters} max={5}/>
      <RangeInput label="Area (m²)" minKey="minArea" maxKey="maxArea" filters={filters} setFilters={setFilters} ph={["Min m²","Max m²"]}/>

      <div style={{ marginBottom:"20px" }}>
        <label style={{ display:"flex", alignItems:"center", gap:"8px", cursor:"pointer", color:"#4a4a36", fontSize:"13px" }}>
          <input type="checkbox" checked={filters.isFeatured===true} onChange={e=>setFilters(f=>({...f,isFeatured:e.target.checked?true:""}))} style={{ accentColor:"#5a5f3a", width:"16px", height:"16px" }}/>
          <span style={{ fontWeight:600 }}>Featured only</span>
        </label>
      </div>

      <button onClick={onApply} style={S.applyBtn}>Apply Filters</button>
    </aside>
  );
}

// ─── Pagination ────────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages   = Array.from({length:totalPages},(_,i)=>i);
  const visible = pages.filter(p=>p===0||p===totalPages-1||Math.abs(p-page)<=1);
  return (
    <div style={{ display:"flex", justifyContent:"center", gap:"6px", marginTop:"36px", flexWrap:"wrap" }}>
      <button disabled={page===0} onClick={()=>onChange(page-1)} style={S.pageBtn(false,page===0)}>‹</button>
      {visible.map((p,i)=>{
        const gap=visible[i-1]!=null&&p-visible[i-1]>1;
        return (
          <span key={p} style={{ display:"flex", gap:"6px" }}>
            {gap&&<span style={{ padding:"6px 4px", color:"#8a8469" }}>…</span>}
            <button onClick={()=>onChange(p)} style={S.pageBtn(p===page,false)}>{p+1}</button>
          </span>
        );
      })}
      <button disabled={page===totalPages-1} onClick={()=>onChange(page+1)} style={S.pageBtn(false,page===totalPages-1)}>›</button>
    </div>
  );
}

function Skeleton({ viewMode }) {
  return (
    <div style={gridStyle(viewMode)}>
      {Array.from({length:6}).map((_,i)=>(
        <div key={i} style={{ background:"#f0ece3", borderRadius:"14px", height:viewMode==="grid"?"320px":"160px", animation:"pulse 1.4s ease-in-out infinite" }}/>
      ))}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function BrowseProperties() {
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

  // ── MODAL STATE ───────────────────────────────────────────────────────────
  const [selectedId, setSelectedId] = useState(null);

  // ── Fetch filtered ────────────────────────────────────────────────────────
  const fetchFiltered = useCallback(async (f, pg=0) => {
    setLoading(true); setError(null);
    try {
      const params = { page:pg, size:PAGE_SIZE, status:"AVAILABLE" };
      if (f.minPrice)     params.minPrice     = f.minPrice;
      if (f.maxPrice)     params.maxPrice     = f.maxPrice;
      if (f.minBedrooms)  params.minBedrooms  = f.minBedrooms;
      if (f.maxBedrooms)  params.maxBedrooms  = f.maxBedrooms;
      if (f.minBathrooms) params.minBathrooms = f.minBathrooms;
      if (f.minArea)      params.minArea      = f.minArea;
      if (f.maxArea)      params.maxArea      = f.maxArea;
      if (f.city)         params.city         = f.city;
      if (f.country)      params.country      = f.country;
      if (f.type)         params.type         = f.type;
      if (f.listingType)  params.listingType  = f.listingType;
      if (f.isFeatured)   params.isFeatured   = true;

      const res  = await api.get("/api/properties/filter", { params });
      const data = res.data;
      setProperties(data.content||[]);
      setTotalPages(data.totalPages??data.total_pages??0);
      setTotalElements(data.totalElements??data.total_elements??0);
      setPage(pg);
    } catch { setError("Could not load properties. Please try again."); }
    finally  { setLoading(false); }
  }, []);

  // ── Fetch search ──────────────────────────────────────────────────────────
  const fetchSearch = useCallback(async (keyword, pg=0) => {
    setLoading(true); setError(null);
    try {
      const upper = keyword.toUpperCase();
      if (PROPERTY_TYPES.includes(upper)) { fetchFiltered({...DEFAULT_FILTERS,type:upper},0); return; }
      if (upper==="RENT") { fetchFiltered({...DEFAULT_FILTERS,listingType:"RENT"},0); return; }
      if (upper==="SALE") { fetchFiltered({...DEFAULT_FILTERS,listingType:"SALE"},0); return; }

      const params = { page:pg, size:PAGE_SIZE, sort:"createdAt,desc", status:"AVAILABLE", city:keyword };
      const res  = await api.get("/api/properties/filter", { params });
      const data = res.data;
      setProperties(data.content||[]);
      setTotalPages(data.totalPages??0);
      setTotalElements(data.totalElements??0);
      setPage(pg);
    } catch { setError("Search failed. Please try again."); }
    finally  { setLoading(false); }
  }, [fetchFiltered]);

  useEffect(() => { fetchFiltered(DEFAULT_FILTERS,0); }, [fetchFiltered]);

  const handleSearch = () => {
    const q = searchQuery.trim();
    if (!q) { setMode("filter"); fetchFiltered(filters,0); return; }
    setMode("search");
    fetchSearch(q,0);
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
    mode==="search"&&searchQuery.trim() ? fetchSearch(searchQuery.trim(),p) : fetchFiltered(filters,p);
    window.scrollTo({top:0,behavior:"smooth"});
  };

  const activeFilterCount = Object.entries(filters).filter(([k,v])=>k!=="status"&&v!==""&&v!=null&&v!==false).length;

  return (
    <MainLayout role="client">
      <div style={{ background:"#f5f2eb", minHeight:"100vh", fontFamily:"'Georgia', serif" }}>

        {/* Hero */}
        <div style={{ background:"linear-gradient(135deg, #5a5f3a 0%, #3d4228 100%)", padding:"48px 32px 40px", textAlign:"center" }}>
          <h1 style={{ margin:"0 0 8px", fontSize:"32px", fontWeight:800, color:"#fff", letterSpacing:"-0.5px" }}>Find Your Perfect Property</h1>
          <p style={{ margin:"0 0 24px", color:"#c8ccaa", fontSize:"15px" }}>Browse thousands of listings — apartments, villas, offices and more.</p>
          <div style={{ display:"flex", gap:"10px", maxWidth:"680px", margin:"0 auto" }}>
            <div style={{ flex:1, display:"flex", alignItems:"center", gap:"10px", background:"#fff", borderRadius:"10px", padding:"10px 14px" }}>
              <span style={{ color:"#8a8469", flexShrink:0 }}><SearchIcon/></span>
              <input type="text" placeholder="Search city, title, keyword…" value={searchQuery}
                onChange={e=>setSearchQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSearch()}
                style={{ flex:1, border:"none", outline:"none", fontSize:"14.5px", color:"#2c2c1e", background:"transparent", fontFamily:"inherit" }}/>
              {searchQuery && (
                <button onClick={()=>{setSearchQuery("");setMode("filter");fetchFiltered(filters,0);}}
                  style={{ background:"none", border:"none", cursor:"pointer", color:"#8a8469", padding:"0 4px" }}>
                  <CloseIcon/>
                </button>
              )}
            </div>
            <button onClick={handleSearch} style={{ display:"flex", alignItems:"center", gap:"7px", background:"#a3a380", color:"#1f1f1f", border:"none", borderRadius:"10px", padding:"10px 20px", fontSize:"14px", fontWeight:700, cursor:"pointer", whiteSpace:"nowrap", fontFamily:"inherit" }}>
              <SearchIcon/> Search
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding:"28px 24px", maxWidth:"1400px", margin:"0 auto" }}>
          <div style={{ display:"flex", gap:"24px", alignItems:"flex-start" }}>
            <FilterSidebar filters={pendingFilters} setFilters={setPendingFilters} onApply={handleApplyFilters} onReset={handleResetFilters}/>

            <main style={{ flex:1, minWidth:0 }}>
              {/* Toolbar */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"18px", flexWrap:"wrap", gap:"10px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"10px", flexWrap:"wrap" }}>
                  <span style={{ color:"#8a8469", fontSize:"13.5px" }}>
                    {loading?"Loading…":`${totalElements.toLocaleString()} propert${totalElements!==1?"ies":"y"} found`}
                  </span>
                  {activeFilterCount>0&&(
                    <button onClick={handleResetFilters} style={{ display:"flex", alignItems:"center", gap:"5px", background:"#fff0f0", color:"#c0392b", border:"1px solid #f5c6c6", borderRadius:"8px", padding:"5px 12px", fontSize:"12.5px", cursor:"pointer", fontFamily:"inherit" }}>
                      Clear filters <CloseIcon/>
                    </button>
                  )}
                  {mode==="search"&&searchQuery&&(
                    <span style={{ background:"#edf2e8", color:"#5a5f3a", border:"1px solid #c8d4b0", borderRadius:"8px", padding:"4px 10px", fontSize:"12.5px" }}>
                      Results for: <strong>{searchQuery}</strong>
                    </span>
                  )}
                </div>
                <div style={{ display:"flex", gap:"4px" }}>
                  {[{m:"grid",icon:<GridIcon/>},{m:"list",icon:<ListIcon/>}].map(({m,icon})=>(
                    <button key={m} onClick={()=>setViewMode(m)} style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"7px 10px", borderRadius:"8px", border:"none", background:viewMode===m?"#5a5f3a":"#f0ece3", color:viewMode===m?"#fff":"#5a5f3a", cursor:"pointer", transition:"all 0.15s" }}>{icon}</button>
                  ))}
                </div>
              </div>

              {error&&(
                <div style={{ background:"#fff5f5", border:"1px solid #fecaca", borderRadius:"10px", padding:"14px 18px", color:"#c0392b", fontSize:"14px", marginBottom:"16px", display:"flex", alignItems:"center", gap:"10px", flexWrap:"wrap" }}>
                  <strong>Error:</strong> {error}
                  <button onClick={()=>mode==="search"?fetchSearch(searchQuery,page):fetchFiltered(filters,page)} style={{ background:"#c0392b", color:"#fff", border:"none", borderRadius:"6px", padding:"5px 12px", cursor:"pointer", fontSize:"12.5px", fontFamily:"inherit" }}>Retry</button>
                </div>
              )}

              {loading&&<Skeleton viewMode={viewMode}/>}

              {!loading&&!error&&properties.length===0&&(
                <div style={{ textAlign:"center", padding:"64px 32px", color:"#8a8469" }}>
                  <div style={{ fontSize:"48px", marginBottom:"12px" }}>🏠</div>
                  <h3 style={{ color:"#5a5f3a", margin:"0 0 8px" }}>No properties found</h3>
                  <p style={{ margin:"0 0 16px" }}>Try adjusting your filters or search terms.</p>
                  <button onClick={handleResetFilters} style={{...S.applyBtn, width:"auto", padding:"10px 24px"}}>Clear all filters</button>
                </div>
              )}

              {!loading&&properties.length>0&&(
                <>
                  <div style={gridStyle(viewMode)}>
                    {properties.map(p=>(
                      <PropertyCard key={p.id} property={p} viewMode={viewMode} onOpen={setSelectedId}/>
                    ))}
                  </div>
                  <Pagination page={page} totalPages={totalPages} onChange={handlePageChange}/>
                </>
              )}
            </main>
          </div>
        </div>
      </div>

      {/* ── Property Detail Modal ── */}
      {selectedId && (
        <PropertyDetailModal
          propertyId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:.9} }
        @keyframes fadeInOverlay { from{opacity:0} to{opacity:1} }
        @keyframes slideUpModal { from{transform:translateY(24px);opacity:0} to{transform:translateY(0);opacity:1} }
      `}</style>
    </MainLayout>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  filterLabel: { display:"block", fontSize:"11.5px", fontWeight:700, color:"#6b6651", textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:"7px" },
  filterInput: { flex:1, padding:"8px 10px", borderRadius:"8px", border:"1.5px solid #d9d4c7", fontSize:"13px", color:"#2c2c1e", background:"#fff", outline:"none", fontFamily:"inherit", width:"100%" },
  filterInputFull: { width:"100%", padding:"8px 10px", borderRadius:"8px", border:"1.5px solid #d9d4c7", fontSize:"13px", color:"#2c2c1e", background:"#fff", outline:"none", fontFamily:"inherit", boxSizing:"border-box" },
  select: { width:"100%", padding:"8px 10px", borderRadius:"8px", border:"1.5px solid #d9d4c7", fontSize:"13px", color:"#2c2c1e", background:"#fff", outline:"none", fontFamily:"inherit", cursor:"pointer", boxSizing:"border-box" },
  numBtn: { padding:"5px 10px", borderRadius:"7px", border:"1.5px solid #d9d4c7", cursor:"pointer", fontSize:"12px", fontWeight:600, transition:"all 0.15s", fontFamily:"inherit" },
  applyBtn: { width:"100%", padding:"11px", background:"#5a5f3a", color:"#fff", border:"none", borderRadius:"10px", fontSize:"14px", fontWeight:700, cursor:"pointer", fontFamily:"inherit" },
  pageBtn: (active,disabled) => ({ padding:"7px 13px", borderRadius:"8px", border:"1.5px solid", borderColor:active?"#5a5f3a":"#d9d4c7", background:active?"#5a5f3a":"#fff", color:active?"#fff":disabled?"#c5bfaf":"#5a5f3a", cursor:disabled?"not-allowed":"pointer", fontSize:"13px", fontWeight:active?700:400, fontFamily:"inherit", transition:"all 0.15s" }),
};
