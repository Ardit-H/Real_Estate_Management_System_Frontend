import { useState, useEffect, useCallback, useRef, useContext } from "react";
import MainLayout from "../../components/layout/Layout";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";

// ─── Tiny SVG helpers ─────────────────────────────────────────────────────────
const Ico = (d, w=15, sw=1.8) => (
  <svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);
const SearchIcon    = () => Ico(<><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></>, 16);
const SlidersIcon   = () => Ico(<><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></>, 14);
const BedIcon       = () => Ico(<><path d="M2 4v16"/><path d="M22 8H2"/><path d="M22 20V8l-4-4H6L2 8"/><path d="M6 8v4"/><path d="M18 8v4"/></>, 13);
const BathIcon      = () => Ico(<><path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/><line x1="10" y1="5" x2="8" y2="7"/><line x1="2" y1="12" x2="22" y2="12"/></>, 13);
const AreaIcon      = () => Ico(<><path d="M3 3h7v7H3z"/><path d="M14 3h7v7h-7z"/><path d="M14 14h7v7h-7z"/><path d="M3 14h7v7H3z"/></>, 13);
const PinIcon       = () => Ico(<><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></>, 12);
const XIcon         = () => Ico(<><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>, 13, 2.2);
const GridIcon      = () => Ico(<><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></>);
const ListIcon      = () => Ico(<><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>);
const ChevL         = () => Ico(<path d="m15 18-6-6 6-6"/>, 18, 2.2);
const ChevR         = () => Ico(<path d="m9 18 6-6-6-6"/>, 18, 2.2);
const MaxIcon       = () => Ico(<><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></>, 13);
const EyeIcon       = () => Ico(<><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></>, 12);
const FloorIcon     = () => Ico(<><path d="M3 9h18"/><path d="M3 15h18"/><path d="M3 3h18"/><path d="M3 21h18"/></>, 13);
const CalIcon       = () => Ico(<><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>, 13);
const PhoneIcon     = () => Ico(<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.38 2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>, 14);
const MsgIcon       = () => Ico(<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>, 14);
const KeyIcon       = () => Ico(<><circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2 10.58 12.42M13 7l3 3M18 2l3 3-6 6-3-3"/></>, 14);
const HomeIcon      = () => Ico(<><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>, 14);
const StarIcon      = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="#c9b87a"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>;
const ClipIcon      = () => Ico(<><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></>, 14);

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE_URL       = import.meta.env.VITE_API_URL || "http://localhost:8080";
const PROPERTY_TYPES = ["APARTMENT","HOUSE","VILLA","COMMERCIAL","LAND","OFFICE"];
const LISTING_TYPES  = ["SALE","RENT","BOTH"];
const PAGE_SIZE      = 12;
const DEFAULT_FILTERS = {
  minPrice:"", maxPrice:"", minBedrooms:"", maxBedrooms:"",
  minBathrooms:"", minArea:"", maxArea:"", city:"", country:"",
  type:"", listingType:"", status:"AVAILABLE", isFeatured:"",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtPrice = (p, c="EUR") => p ? new Intl.NumberFormat("en-EU",{style:"currency",currency:c,maximumFractionDigits:0}).format(p) : "–";
const typeLbl  = t => ({APARTMENT:"Apartment",HOUSE:"House",VILLA:"Villa",COMMERCIAL:"Commercial",LAND:"Land",OFFICE:"Office"}[t]||t||"–");
const BADGE = {
  SALE: { label:"For Sale",    dot:"#e2c97e", bg:"rgba(20,16,10,0.72)" },
  RENT: { label:"For Rent",    dot:"#7eb8a4", bg:"rgba(20,16,10,0.72)" },
  BOTH: { label:"Sale & Rent", dot:"#a4b07e", bg:"rgba(20,16,10,0.72)" },
};
const getBadge = t => BADGE[t] || { label:t||"–", dot:"#9a8c6e", bg:"rgba(20,16,10,0.72)" };
const getImg   = src => src ? (src.startsWith("http")?src:BASE_URL+src) : null;
const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23ede9df' width='400' height='300'/%3E%3Cpath d='M160 195 L200 135 L240 195Z' fill='%23d4cfc3'/%3E%3Crect x='180' y='165' width='40' height='30' fill='%23c4bfb0'/%3E%3C/svg%3E";

// type → emoji
const TYPE_EMOJI = { APARTMENT:"🏢", HOUSE:"🏠", VILLA:"🏡", COMMERCIAL:"🏬", LAND:"🌿", OFFICE:"🏛️" };

// ─── Global CSS ───────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  .bp * { box-sizing: border-box; }
  .bp {
    font-family: 'DM Sans', system-ui, sans-serif;
    background: #f2ede4;
    min-height: 100vh;
  }

  /* inputs */
  .bp-in:focus { border-color: #8a7d5e !important; box-shadow: 0 0 0 3px rgba(138,125,94,0.13) !important; outline: none; }

  /* cards */
  .bp-card { transition: transform 0.25s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.25s ease; }
  .bp-card:hover { transform: translateY(-6px); box-shadow: 0 28px 60px rgba(20,16,10,0.16) !important; }
  .bp-card:hover .bp-img { transform: scale(1.06); }
  .bp-img { transition: transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94); }

  /* heart */
  .bp-heart { transition: all 0.15s ease; }
  .bp-heart:hover { color: #c0392b !important; transform: scale(1.2) !important; }

  /* buttons */
  .bp-btn { transition: all 0.17s ease; }
  .bp-btn:hover { opacity: 0.85; transform: translateY(-1px); }
  .bp-chip { transition: all 0.14s ease; }

  /* pg */
  .bp-pg:hover:not(:disabled) { background: #ede9df !important; border-color: #8a7d5e !important; }

  @keyframes bp-fade-up    { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes bp-scale-in   { from{opacity:0;transform:scale(0.95) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes bp-slide-r    { from{transform:translateX(100%)} to{transform:translateX(0)} }
  @keyframes bp-pulse      { 0%,100%{opacity:.38} 50%{opacity:.82} }
  @keyframes bp-spin       { to{transform:rotate(360deg)} }
  @keyframes bp-toast      { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes bp-card-in    { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
`;

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type="success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position:"fixed",bottom:26,right:26,zIndex:9999,
      background:"#1a1714",color:type==="error"?"#f09090":"#90c8a8",
      padding:"11px 18px",borderRadius:12,fontSize:13,fontWeight:400,
      boxShadow:"0 10px 36px rgba(0,0,0,0.32)",
      border:`1px solid ${type==="error"?"rgba(240,128,128,0.15)":"rgba(144,200,168,0.15)"}`,
      maxWidth:320,fontFamily:"'DM Sans',sans-serif",
      animation:"bp-toast 0.2s ease",display:"flex",alignItems:"center",gap:8,
    }}>
      <span style={{fontSize:14}}>{type==="error"?"⚠️":"✅"}</span>
      {msg}
    </div>
  );
}

// ─── Price Chart ──────────────────────────────────────────────────────────────
function PriceChart({ history }) {
  const [hov, setHov] = useState(null);
  if (!history?.length) return (
    <div style={{textAlign:"center",padding:28,color:"#b0a890",fontSize:13,fontFamily:"'DM Sans',sans-serif"}}>
      📊 No price history available.
    </div>
  );
  const pts = history.map((h,i) => ({
    x:i, y:h.new_price??h.newPrice,
    date:new Date(h.changed_at??h.changedAt).toLocaleDateString("en-GB",{month:"short",year:"2-digit"}),
  }));
  const W=480,H=148,P={t:12,r:16,b:32,l:50};
  const ys=pts.map(p=>p.y),minY=Math.min(...ys),maxY=Math.max(...ys);
  const rY=maxY-minY||1,rX=(pts.length-1)||1;
  const px=x=>P.l+(x/rX)*(W-P.l-P.r);
  const py=y=>P.t+(1-(y-minY)/rY)*(H-P.t-P.b);
  const pathD=pts.map((p,i)=>`${i===0?"M":"L"}${px(p.x).toFixed(1)},${py(p.y).toFixed(1)}`).join(" ");
  const areaD=pathD+` L${px(pts.length-1)},${H-P.b} L${px(0)},${H-P.b} Z`;
  const last=pts[pts.length-1],prev=pts[pts.length-2];
  const trend=prev?(last.y>prev.y?"up":last.y<prev.y?"down":"same"):"same";
  const tc=trend==="up"?"#e07070":trend==="down"?"#5aaa80":"#9a8c6e";
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <span style={{fontSize:10,fontWeight:600,color:"#9a8c6e",textTransform:"uppercase",letterSpacing:"1px"}}>📈 Price History</span>
        <span style={{fontSize:11,fontWeight:500,color:tc}}>{trend==="up"?"▲ Rising":trend==="down"?"▼ Falling":"— Stable"}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:"auto",overflow:"visible"}}>
        <defs>
          <linearGradient id="af2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8a7d5e" stopOpacity="0.2"/>
            <stop offset="100%" stopColor="#8a7d5e" stopOpacity="0"/>
          </linearGradient>
        </defs>
        {[0,0.25,0.5,0.75,1].map(t => {
          const yv=minY+t*rY,yp=py(yv);
          return <g key={t}>
            <line x1={P.l} y1={yp} x2={W-P.r} y2={yp} stroke="#e8e2d6" strokeWidth="1"/>
            <text x={P.l-6} y={yp+4} textAnchor="end" fontSize="9" fill="#b0a890" fontFamily="'DM Sans',sans-serif">
              {yv>=1000?`${(yv/1000).toFixed(0)}k`:yv.toFixed(0)}
            </text>
          </g>;
        })}
        <path d={areaD} fill="url(#af2)"/>
        <path d={pathD} fill="none" stroke="#8a7d5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        {pts.map((p,i) => (
          <g key={i} onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)} style={{cursor:"pointer"}}>
            <circle cx={px(p.x)} cy={py(p.y)} r={hov===i?5.5:3.5}
              fill={hov===i?"#8a7d5e":"#f2ede4"} stroke="#8a7d5e" strokeWidth="2"
              style={{transition:"r 0.13s"}}/>
            {hov===i && <g>
              <rect x={Math.min(px(p.x)-48,W-P.r-96)} y={py(p.y)-48} width="100" height="38" rx="7" fill="#1a1714"/>
              <text x={Math.min(px(p.x)-48,W-P.r-96)+50} y={py(p.y)-28} textAnchor="middle" fontSize="10.5" fill="#f5f0e8" fontWeight="500" fontFamily="'DM Sans',sans-serif">{fmtPrice(p.y)}</text>
              <text x={Math.min(px(p.x)-48,W-P.r-96)+50} y={py(p.y)-14} textAnchor="middle" fontSize="9" fill="#8a7d5e" fontFamily="'DM Sans',sans-serif">{p.date}</text>
            </g>}
            <text x={px(p.x)} y={H-P.b+12} textAnchor="middle" fontSize="9" fill="#b0a890" fontFamily="'DM Sans',sans-serif">{p.date}</text>
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
  const [imgIdx,       setImgIdx]       = useState(0);
  const [fullscreen,   setFullscreen]   = useState(false);
  const overlayRef = useRef(null);

  useEffect(() => {
    let cancelled=false;
    (async()=>{
      setLoading(true);
      try {
        const [pR,hR] = await Promise.all([
          api.get(`/api/properties/${propertyId}`),
          api.get(`/api/properties/${propertyId}/price-history`).catch(()=>({data:[]})),
        ]);
        if(!cancelled){ setProperty(pR.data); setPriceHistory(Array.isArray(hR.data)?hR.data:[]); }
      } catch{}finally{if(!cancelled)setLoading(false);}
    })();
    return()=>{cancelled=true;};
  },[propertyId]);

  useEffect(()=>{
    const fn=e=>{if(e.key==="Escape"){fullscreen?setFullscreen(false):onClose();}};
    window.addEventListener("keydown",fn);return()=>window.removeEventListener("keydown",fn);
  },[onClose,fullscreen]);

  useEffect(()=>{document.body.style.overflow="hidden";return()=>{document.body.style.overflow="";};},[]);

  const images  = property?.images?.length ? property.images.map(i=>getImg(i.imageUrl||i.image_url)).filter(Boolean) : [];
  const mainImg = images[imgIdx]||PLACEHOLDER;
  const badge   = getBadge(property?.listingType||property?.listing_type);
  const isRent  = ["RENT","BOTH"].includes(property?.listingType||property?.listing_type);
  const isSale  = ["SALE","BOTH"].includes(property?.listingType||property?.listing_type);
  const addr    = property?.address;
  const addrStr = [addr?.street,addr?.city,addr?.country].filter(Boolean).join(", ");
  const features= property?.features||[];
  const typeEm  = TYPE_EMOJI[property?.type]||"🏠";

  const INP = {width:"100%",padding:"10px 13px",border:"1.5px solid #e4ddd0",borderRadius:10,fontSize:13.5,color:"#1a1714",background:"#fff",fontFamily:"'DM Sans',sans-serif",boxSizing:"border-box",outline:"none",transition:"border-color 0.2s"};

  return (
    <>
      <div ref={overlayRef} onClick={e=>{if(e.target===overlayRef.current)onClose();}}
        style={{position:"fixed",inset:0,background:"rgba(8,6,4,0.84)",backdropFilter:"blur(14px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'DM Sans',sans-serif"}}>
        <div style={{background:"#faf7f2",borderRadius:18,width:"100%",maxWidth:870,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 44px 100px rgba(0,0,0,0.55)",animation:"bp-scale-in 0.26s ease",position:"relative"}}>

          <button onClick={onClose}
            style={{position:"sticky",top:14,float:"right",marginRight:14,zIndex:10,background:"rgba(20,16,10,0.7)",backdropFilter:"blur(8px)",border:"none",borderRadius:9,width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#f5f0e8"}}>
            <XIcon/>
          </button>

          {loading && (
            <div style={{padding:"80px 40px",textAlign:"center",color:"#9a8c6e"}}>
              <div style={{width:26,height:26,margin:"0 auto 14px",border:"2px solid #e8e2d6",borderTop:"2px solid #8a7d5e",borderRadius:"50%",animation:"bp-spin .8s linear infinite"}}/>
              <p style={{fontSize:13}}>Loading property…</p>
            </div>
          )}

          {!loading&&property&&<>
            {/* Gallery */}
            <div style={{position:"relative",height:370,background:"#1a1714",borderRadius:"18px 18px 0 0",overflow:"hidden"}}>
              <img src={mainImg} alt={property.title} className="bp-img"
                style={{width:"100%",height:"100%",objectFit:"cover"}}
                onError={e=>{e.target.src=PLACEHOLDER;}}/>
              <div style={{position:"absolute",inset:0,background:"linear-gradient(to top, rgba(8,6,4,0.65) 0%, transparent 50%)"}}/>

              {/* Badges */}
              <div style={{position:"absolute",top:16,left:16,display:"flex",gap:8,flexWrap:"wrap"}}>
                <span style={{background:badge.bg,backdropFilter:"blur(10px)",color:"#fff",fontSize:10,fontWeight:600,padding:"5px 13px",borderRadius:999,letterSpacing:"0.6px",textTransform:"uppercase",border:`1px solid ${badge.dot}40`,display:"flex",alignItems:"center",gap:5}}>
                  <span style={{width:5,height:5,borderRadius:"50%",background:badge.dot,display:"inline-block",boxShadow:`0 0 6px ${badge.dot}`}}/>
                  {badge.label}
                </span>
                {(property.isFeatured||property.is_featured)&&(
                  <span style={{background:"rgba(201,184,122,0.88)",backdropFilter:"blur(8px)",color:"#1a1714",fontSize:10,fontWeight:700,padding:"5px 12px",borderRadius:999,display:"flex",alignItems:"center",gap:4}}>
                    <StarIcon/> Featured
                  </span>
                )}
              </div>

              <div style={{position:"absolute",top:16,right:50,background:"rgba(20,16,10,0.5)",backdropFilter:"blur(6px)",color:"rgba(245,240,232,0.65)",fontSize:11,padding:"4px 10px",borderRadius:999,display:"flex",alignItems:"center",gap:5}}>
                <EyeIcon/> {property.viewCount??property.view_count??0}
              </div>

              <button onClick={()=>setFullscreen(true)}
                style={{position:"absolute",bottom:14,right:14,background:"rgba(20,16,10,0.5)",backdropFilter:"blur(6px)",border:"1px solid rgba(245,240,232,0.14)",borderRadius:9,color:"#f5f0e8",padding:"6px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:6,fontSize:11,fontFamily:"inherit"}}>
                <MaxIcon/> Fullscreen
              </button>

              {images.length>1&&<>
                <button onClick={()=>setImgIdx(i=>(i-1+images.length)%images.length)}
                  style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",background:"rgba(245,240,232,0.9)",border:"none",borderRadius:9,width:36,height:36,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <ChevL/>
                </button>
                <button onClick={()=>setImgIdx(i=>(i+1)%images.length)}
                  style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"rgba(245,240,232,0.9)",border:"none",borderRadius:9,width:36,height:36,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <ChevR/>
                </button>
                <div style={{position:"absolute",bottom:14,left:"50%",transform:"translateX(-50%)",display:"flex",gap:5}}>
                  {images.map((_,i)=>(
                    <button key={i} onClick={()=>setImgIdx(i)}
                      style={{width:i===imgIdx?18:6,height:6,borderRadius:3,background:i===imgIdx?"#f5f0e8":"rgba(245,240,232,0.38)",border:"none",cursor:"pointer",transition:"all 0.2s",padding:0}}/>
                  ))}
                </div>
              </>}
            </div>

            {/* Body */}
            <div style={{padding:"26px 30px 32px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:16,marginBottom:16,flexWrap:"wrap"}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:7}}>
                    <span style={{fontSize:20}}>{typeEm}</span>
                    <h2 style={{margin:0,fontSize:25,fontWeight:700,color:"#1a1714",lineHeight:1.15,fontFamily:"'Cormorant Garamond',Georgia,serif",letterSpacing:"-0.3px"}}>{property.title}</h2>
                  </div>
                  {addrStr&&<div style={{display:"flex",alignItems:"center",gap:5,color:"#9a8c6e",fontSize:13}}>📍 {addrStr}</div>}
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontSize:27,fontWeight:700,color:"#1a1714",letterSpacing:"-0.5px",fontFamily:"'Cormorant Garamond',Georgia,serif"}}>{fmtPrice(property.price,property.currency)}</div>
                  {(property.pricePerSqm||property.price_per_sqm)&&<div style={{fontSize:12,color:"#9a8c6e",marginTop:2}}>{fmtPrice(property.pricePerSqm||property.price_per_sqm,property.currency)}/m²</div>}
                </div>
              </div>

              {/* Status tags */}
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:20}}>
                {[property.status||"AVAILABLE",typeLbl(property.type),property.currency].filter(Boolean).map((t,i)=>(
                  <span key={i} style={{background:"#f0ece3",color:"#6b5f45",border:"1px solid #e0d8c8",borderRadius:999,padding:"4px 13px",fontSize:10.5,fontWeight:600,letterSpacing:"0.5px",textTransform:"uppercase"}}>{t}</span>
                ))}
              </div>

              {/* Stats */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(115px,1fr))",gap:8,marginBottom:22}}>
                {[
                  {icon:<BedIcon/>,label:"Bedrooms",val:property.bedrooms,em:"🛏️"},
                  {icon:<BathIcon/>,label:"Bathrooms",val:property.bathrooms,em:"🚿"},
                  {icon:<AreaIcon/>,label:"Area",val:property.areaSqm??property.area_sqm,unit:"m²",em:"📐"},
                  {icon:<FloorIcon/>,label:"Floor",val:property.floor!=null?`${property.floor} / ${property.totalFloors??property.total_floors??'–'}`:null,em:"🏗️"},
                  {icon:<CalIcon/>,label:"Year Built",val:property.yearBuilt??property.year_built,em:"📅"},
                ].filter(s=>s.val!=null).map((s,i)=>(
                  <div key={i} style={{background:"#fff",border:"1.5px solid #e8e2d6",borderRadius:12,padding:"12px 13px"}}>
                    <div style={{fontSize:16,marginBottom:4}}>{s.em}</div>
                    <div style={{fontSize:9.5,fontWeight:600,color:"#b0a890",textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:4}}>{s.label}</div>
                    <div style={{fontSize:16,fontWeight:700,color:"#1a1714",fontFamily:"'Cormorant Garamond',Georgia,serif"}}>{s.val}{s.unit?` ${s.unit}`:""}</div>
                  </div>
                ))}
              </div>

              {property.description&&(
                <div style={{marginBottom:22}}>
                  <p style={{margin:"0 0 8px",fontSize:10,fontWeight:600,color:"#b0a890",textTransform:"uppercase",letterSpacing:"1px"}}>📝 Description</p>
                  <p style={{margin:0,fontSize:14.5,lineHeight:1.88,color:"#3c3830",whiteSpace:"pre-wrap",fontFamily:"'Cormorant Garamond',Georgia,serif"}}>{property.description}</p>
                </div>
              )}

              {features.length>0&&(
                <div style={{marginBottom:22}}>
                  <p style={{margin:"0 0 10px",fontSize:10,fontWeight:600,color:"#b0a890",textTransform:"uppercase",letterSpacing:"1px"}}>✨ Features & Amenities</p>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {features.map((f,i)=>(
                      <span key={i} style={{background:"#fff",border:"1.5px solid #e8e2d6",borderRadius:999,padding:"5px 13px",fontSize:12,color:"#4a4438"}}>
                        {typeof f==="string"?f.replace(/_/g," "):f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{marginBottom:22,background:"#fff",border:"1.5px solid #e8e2d6",borderRadius:14,padding:"18px 20px"}}>
                <PriceChart history={priceHistory}/>
              </div>

              {/* Contact */}
              <div style={{background:"linear-gradient(135deg, #1a1714 0%, #2a2420 100%)",borderRadius:14,padding:"22px 24px"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
                  <span style={{fontSize:20}}>🤝</span>
                  <div>
                    <p style={{margin:0,fontSize:9.5,fontWeight:600,color:"#6b6340",textTransform:"uppercase",letterSpacing:"1px"}}>Contact Agent</p>
                    <p style={{margin:"2px 0 0",fontSize:15,fontWeight:500,color:"#f5f0e8",fontFamily:"'Cormorant Garamond',Georgia,serif"}}>
                      {property.agentId||property.agent_id?`Agent #${property.agentId??property.agent_id}`:"Our Agent"}
                    </p>
                  </div>
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {[{icon:<MsgIcon/>,label:"💬 Send Message"},{icon:<PhoneIcon/>,label:"📞 Request Viewing"}].map((b,i)=>(
                    <button key={i} className="bp-btn" style={{display:"flex",alignItems:"center",gap:7,background:"rgba(245,240,232,0.07)",color:"#f5f0e8",border:"1px solid rgba(245,240,232,0.13)",borderRadius:10,padding:"9px 15px",fontSize:12.5,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>
                      {b.label}
                    </button>
                  ))}
                  {isRent&&(property.status==="AVAILABLE"||!property.status)&&(
                    <button className="bp-btn" onClick={()=>{onClose();onApply(property);}}
                      style={{display:"flex",alignItems:"center",gap:7,background:"#f5f0e8",color:"#1a1714",border:"none",borderRadius:10,padding:"9px 17px",fontSize:12.5,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                      🔑 Apply for Rent
                    </button>
                  )}
                  {isSale&&(property.status==="AVAILABLE"||!property.status)&&(
                    <button className="bp-btn" onClick={()=>{onClose();onBuy(property);}}
                      style={{display:"flex",alignItems:"center",gap:7,background:"#c9b87a",color:"#1a1714",border:"none",borderRadius:10,padding:"9px 17px",fontSize:12.5,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                      🏠 Apply for Purchase
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>}
        </div>
      </div>

      {fullscreen&&(
        <div onClick={()=>setFullscreen(false)}
          style={{position:"fixed",inset:0,background:"rgba(8,6,4,0.97)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",cursor:"zoom-out"}}>
          <img src={mainImg} alt="" style={{maxWidth:"94vw",maxHeight:"94vh",objectFit:"contain"}}/>
          {images.length>1&&<>
            <button onClick={e=>{e.stopPropagation();setImgIdx(i=>(i-1+images.length)%images.length);}} style={{position:"fixed",left:16,top:"50%",transform:"translateY(-50%)",background:"rgba(245,240,232,0.1)",border:"1px solid rgba(245,240,232,0.14)",borderRadius:9,width:44,height:44,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#f5f0e8"}}><ChevL/></button>
            <button onClick={e=>{e.stopPropagation();setImgIdx(i=>(i+1)%images.length);}} style={{position:"fixed",right:16,top:"50%",transform:"translateY(-50%)",background:"rgba(245,240,232,0.1)",border:"1px solid rgba(245,240,232,0.14)",borderRadius:9,width:44,height:44,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#f5f0e8"}}><ChevR/></button>
          </>}
          <button onClick={()=>setFullscreen(false)} style={{position:"fixed",top:16,right:16,background:"rgba(245,240,232,0.1)",border:"1px solid rgba(245,240,232,0.14)",borderRadius:9,width:38,height:38,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#f5f0e8"}}><XIcon/></button>
          <div style={{position:"fixed",bottom:16,left:"50%",transform:"translateX(-50%)",color:"rgba(245,240,232,0.4)",fontSize:11.5,fontFamily:"'DM Sans',sans-serif"}}>{imgIdx+1} / {images.length}</div>
        </div>
      )}
    </>
  );
}

// ─── Shared modal wrapper ─────────────────────────────────────────────────────
function ModalWrap({ children, onClose, maxW=520 }) {
  useEffect(()=>{
    const h=e=>e.key==="Escape"&&onClose();
    window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);
  },[onClose]);
  return (
    <div style={{position:"fixed",inset:0,zIndex:2000,background:"rgba(8,6,4,0.8)",backdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'DM Sans',sans-serif"}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{width:"100%",maxWidth:maxW,background:"#faf7f2",borderRadius:16,boxShadow:"0 44px 90px rgba(0,0,0,0.45)",maxHeight:"90vh",overflowY:"auto",animation:"bp-scale-in 0.24s ease"}}>
        {children}
      </div>
    </div>
  );
}

const MH = ({title,sub,onClose}) => (
  <div style={{padding:"18px 24px",borderBottom:"1px solid #e8e2d6",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
    <div>
      <p style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontWeight:700,fontSize:18,margin:"0 0 3px",color:"#1a1714"}}>{title}</p>
      {sub&&<p style={{fontSize:12,color:"#9a8c6e",margin:0}}>{sub}</p>}
    </div>
    <button onClick={onClose} style={{border:"none",background:"none",color:"#9a8c6e",cursor:"pointer",fontSize:20,padding:"2px",lineHeight:1}}>×</button>
  </div>
);

const ML = {display:"block",fontSize:10.5,fontWeight:600,color:"#9a8c6e",textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:6,fontFamily:"'DM Sans',sans-serif"};
const INP_S = {width:"100%",padding:"10px 13px",border:"1.5px solid #e4ddd0",borderRadius:10,fontSize:13.5,color:"#1a1714",background:"#fff",fontFamily:"'DM Sans',sans-serif",boxSizing:"border-box",outline:"none"};

// ─── Rental Apply Modal ───────────────────────────────────────────────────────
function RentalApplyModal({ property, onClose, onSuccess, notify }) {
  const [listings, setListings]   = useState([]);
  const [loading,  setLoading]    = useState(true);
  const [sel,      setSel]        = useState(null);
  const [form,     setForm]       = useState({ message:"", income:"", move_in_date:"" });
  const [saving,   setSaving]     = useState(false);

  useEffect(()=>{
    (async()=>{
      setLoading(true);
      try{
        const res=await api.get(`/api/rentals/listings/property/${property.id}`);
        const a=(Array.isArray(res.data)?res.data:[]).filter(l=>l.status==="ACTIVE");
        setListings(a);if(a.length===1)setSel(a[0]);
      }catch{notify("Could not load listings","error");}
      finally{setLoading(false);}
    })();
  },[property.id,notify]);

  const submit=async()=>{
    if(!sel){notify("Please select a listing","error");return;}
    setSaving(true);
    try{
      await api.post("/api/rentals/applications",{listing_id:sel.id,message:form.message||null,income:form.income?Number(form.income):null,move_in_date:form.move_in_date||null});
      onSuccess();
    }catch(err){notify(err.response?.data?.message||"Error","error");}
    finally{setSaving(false);}
  };

  const fmtM=(v,p="MONTHLY")=>v!=null?`€${Number(v).toLocaleString("de-DE")} / ${p.toLowerCase()}`:"—";

  return (
    <ModalWrap onClose={onClose}>
      <MH title="🔑 Apply for Rent" sub={property.title} onClose={onClose}/>
      <div style={{padding:"20px 24px"}}>
        <div style={{marginBottom:14}}>
          <label style={ML}>Available Listings <span style={{color:"#c0392b"}}>*</span></label>
          {loading?<div style={{textAlign:"center",padding:16,color:"#9a8c6e",fontSize:13}}>Loading…</div>
          :listings.length===0?<div style={{background:"#fff8f5",border:"1px solid #f5c6a0",borderRadius:10,padding:"12px 14px",fontSize:13,color:"#7a3a1a"}}>No active listings available.</div>
          :<div style={{display:"flex",flexDirection:"column",gap:7}}>
            {listings.map(l=>(
              <div key={l.id} onClick={()=>setSel(l)}
                style={{padding:"12px 14px",borderRadius:10,cursor:"pointer",border:`1.5px solid ${sel?.id===l.id?"#8a7d5e":"#e4ddd0"}`,background:sel?.id===l.id?"#f5f0e8":"#fff",transition:"all 0.15s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <p style={{fontWeight:500,fontSize:13.5,margin:"0 0 3px",color:"#1a1714"}}>{l.title||`Listing #${l.id}`}</p>
                    <p style={{fontSize:12,color:"#9a8c6e",margin:0}}>{fmtM(l.price,l.price_period)}{l.deposit&&` · Deposit: €${Number(l.deposit).toLocaleString()}`}</p>
                  </div>
                  {sel?.id===l.id&&<div style={{width:18,height:18,borderRadius:"50%",background:"#1a1714",display:"flex",alignItems:"center",justifyContent:"center",color:"#f5f0e8",fontSize:10,flexShrink:0}}>✓</div>}
                </div>
              </div>
            ))}
          </div>}
        </div>
        {listings.length>0&&<>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div><label style={ML}>Monthly Income (€)</label><input className="bp-in" style={INP_S} type="number" min="0" placeholder="e.g. 1500" value={form.income} onChange={e=>setForm(f=>({...f,income:e.target.value}))}/></div>
            <div><label style={ML}>Move-in Date</label><input className="bp-in" style={INP_S} type="date" value={form.move_in_date} onChange={e=>setForm(f=>({...f,move_in_date:e.target.value}))}/></div>
          </div>
          <div style={{marginBottom:18}}>
            <label style={ML}>Message (optional)</label>
            <textarea rows={3} placeholder="Introduce yourself…" value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))} style={{...INP_S,resize:"vertical"}}/>
          </div>
        </>}
        <div style={{display:"flex",gap:9,justifyContent:"flex-end"}}>
          <button onClick={onClose} style={{padding:"10px 18px",borderRadius:10,border:"1.5px solid #e4ddd0",background:"transparent",color:"#6b6248",fontWeight:500,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
          <button onClick={submit} disabled={saving||!sel||listings.length===0}
            style={{padding:"10px 20px",borderRadius:10,background:saving||!sel?"#b0a890":"#1a1714",color:"#f5f0e8",border:"none",fontSize:13,fontWeight:600,cursor:saving||!sel?"not-allowed":"pointer",fontFamily:"inherit"}}>
            {saving?"Submitting…":"Submit Application"}
          </button>
        </div>
      </div>
    </ModalWrap>
  );
}

// ─── Sale Buy Modal ───────────────────────────────────────────────────────────
function SaleBuyModal({ property, onClose, onSuccess, notify }) {
  const [listings, setListings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [sel,      setSel]      = useState(null);
  const [form,     setForm]     = useState({ message:"", offer_price:"", desired_purchase_date:"", monthly_income:"" });
  const [saving,   setSaving]   = useState(false);

  useEffect(()=>{
    (async()=>{
      setLoading(true);
      try{
        const res=await api.get(`/api/sales/listings/property/${property.id}`);
        const a=(Array.isArray(res.data)?res.data:[]).filter(l=>l.status==="ACTIVE");
        setListings(a);if(a.length===1)setSel(a[0]);
      }catch{notify("Could not load sale listings","error");}
      finally{setLoading(false);}
    })();
  },[property.id,notify]);

  const submit=async()=>{
    if(!sel){notify("Please select a listing","error");return;}
    setSaving(true);
    try{
      await api.post("/api/sales/applications",{listing_id:sel.id,message:form.message||null,offer_price:form.offer_price?Number(form.offer_price):null,desired_purchase_date:form.desired_purchase_date||null,monthly_income:form.monthly_income?Number(form.monthly_income):null});
      onSuccess();
    }catch(err){notify(err.response?.data?.message||"Error","error");}
    finally{setSaving(false);}
  };

  return (
    <ModalWrap onClose={onClose}>
      <MH title="🏠 Apply for Purchase" sub={property.title} onClose={onClose}/>
      <div style={{padding:"20px 24px"}}>
        <div style={{marginBottom:14}}>
          <label style={ML}>Sale Listings <span style={{color:"#c0392b"}}>*</span></label>
          {loading?<div style={{textAlign:"center",padding:16,color:"#9a8c6e",fontSize:13}}>Loading…</div>
          :listings.length===0?<div style={{background:"#fff8f5",border:"1px solid #f5c6a0",borderRadius:10,padding:"12px 14px",fontSize:13,color:"#7a3a1a"}}>No active sale listings.</div>
          :<div style={{display:"flex",flexDirection:"column",gap:7}}>
            {listings.map(l=>(
              <div key={l.id} onClick={()=>setSel(l)}
                style={{padding:"12px 14px",borderRadius:10,cursor:"pointer",border:`1.5px solid ${sel?.id===l.id?"#8a7d5e":"#e4ddd0"}`,background:sel?.id===l.id?"#f5f0e8":"#fff",transition:"all 0.15s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <p style={{fontWeight:500,fontSize:13.5,margin:"0 0 3px",color:"#1a1714"}}>{l.title||`Listing #${l.id}`}</p>
                    <p style={{fontSize:12,color:"#9a8c6e",margin:0}}>€{Number(l.price).toLocaleString("de-DE")}{l.negotiable&&" · Negotiable"}</p>
                  </div>
                  {sel?.id===l.id&&<div style={{width:18,height:18,borderRadius:"50%",background:"#1a1714",display:"flex",alignItems:"center",justifyContent:"center",color:"#f5f0e8",fontSize:10,flexShrink:0}}>✓</div>}
                </div>
              </div>
            ))}
          </div>}
        </div>
        {listings.length>0&&<>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div><label style={ML}>Your Offer (€)</label><input className="bp-in" style={INP_S} type="number" min="0" placeholder="e.g. 120000" value={form.offer_price} onChange={e=>setForm(f=>({...f,offer_price:e.target.value}))}/></div>
            <div><label style={ML}>Monthly Income (€)</label><input className="bp-in" style={INP_S} type="number" min="0" placeholder="e.g. 3000" value={form.monthly_income} onChange={e=>setForm(f=>({...f,monthly_income:e.target.value}))}/></div>
          </div>
          <div style={{marginBottom:12}}>
            <label style={ML}>Desired Purchase Date</label>
            <input className="bp-in" style={INP_S} type="date" value={form.desired_purchase_date} onChange={e=>setForm(f=>({...f,desired_purchase_date:e.target.value}))}/>
          </div>
          <div style={{marginBottom:18}}>
            <label style={ML}>Message</label>
            <textarea rows={3} placeholder="Introduce yourself…" value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))} style={{...INP_S,resize:"vertical"}}/>
          </div>
        </>}
        <div style={{display:"flex",gap:9,justifyContent:"flex-end"}}>
          <button onClick={onClose} style={{padding:"10px 18px",borderRadius:10,border:"1.5px solid #e4ddd0",background:"transparent",color:"#6b6248",fontWeight:500,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
          <button onClick={submit} disabled={saving||!sel||listings.length===0}
            style={{padding:"10px 20px",borderRadius:10,background:saving||!sel?"#b0a890":"#1a1714",color:"#f5f0e8",border:"none",fontSize:13,fontWeight:600,cursor:saving||!sel?"not-allowed":"pointer",fontFamily:"inherit"}}>
            {saving?"Submitting…":"Submit Application"}
          </button>
        </div>
      </div>
    </ModalWrap>
  );
}

// ─── My Applications Modal ────────────────────────────────────────────────────
function MyApplicationsModal({ onClose, notify }) {
  const [tab,         setTab]         = useState("rent");
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

  const loadRent=useCallback(async(pg=0)=>{
    setRentLoading(true);
    try{const res=await api.get(`/api/rentals/applications/my?page=${pg}&size=10`);setRentApps(res.data.content||[]);setRentTotal(res.data.totalPages||0);setRentPage(pg);}
    catch{notify("Error loading rental applications","error");}
    finally{setRentLoading(false);}
  },[notify]);

  const loadSale=useCallback(async(pg=0)=>{
    setSaleLoading(true);
    try{const res=await api.get(`/api/sales/applications/my?page=${pg}&size=10`);setSaleApps(res.data.content||[]);setSaleTotal(res.data.totalPages||0);setSalePage(pg);}
    catch{notify("Error loading purchase applications","error");}
    finally{setSaleLoading(false);}
  },[notify]);

  useEffect(()=>{loadRent(0);loadSale(0);},[loadRent,loadSale]);

  const STATUS={PENDING:{color:"#9a7a30",bg:"#fdf6e3"},APPROVED:{color:"#2a6049",bg:"#edf5f0"},REJECTED:{color:"#8b3a1c",bg:"#fdf0e8"},CANCELLED:{color:"#6b6651",bg:"#f5f2eb"}};

  const AppCard=({app,onCancel,c})=>{
    const s=STATUS[app.status]||{color:"#6b6651",bg:"#f5f2eb"};
    return(
      <div style={{background:"#fff",border:"1.5px solid #e8e2d6",borderRadius:11,padding:"13px 16px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
          <div>
            <p style={{fontWeight:500,fontSize:13.5,margin:"0 0 3px",color:"#1a1714"}}>Listing #{app.listing_id}{app.property_id?` · Property #${app.property_id}`:""}</p>
            <p style={{fontSize:11.5,color:"#9a8c6e",margin:0}}>{app.created_at?new Date(app.created_at).toLocaleDateString("en-GB"):"—"}{app.income&&` · Income: €${Number(app.income).toLocaleString()}`}{app.offer_price&&` · Offer: €${Number(app.offer_price).toLocaleString()}`}</p>
          </div>
          <span style={{background:s.bg,color:s.color,padding:"3px 11px",borderRadius:999,fontSize:10,fontWeight:600,letterSpacing:"0.4px",textTransform:"uppercase",flexShrink:0,marginLeft:8}}>{app.status}</span>
        </div>
        {app.message&&<p style={{fontSize:13,color:"#6b6340",margin:"6px 0 0",fontStyle:"italic",fontFamily:"'Cormorant Garamond',Georgia,serif"}}>"{app.message}"</p>}
        {app.status==="PENDING"&&(
          <button style={{marginTop:8,padding:"5px 13px",borderRadius:8,border:"1.5px solid #e4ddd0",background:"transparent",color:"#6b6248",fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}
            onClick={()=>onCancel(app.id)} disabled={c===app.id}>
            {c===app.id?"Cancelling…":"Cancel Application"}
          </button>
        )}
      </div>
    );
  };

  return (
    <ModalWrap onClose={onClose} maxW={640}>
      <MH title="📋 My Applications" onClose={onClose}/>
      <div style={{display:"flex",borderBottom:"1px solid #e8e2d6"}}>
        {[{id:"rent",label:"🔑 Rental"},{id:"sale",label:"🏠 Purchase"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{flex:1,padding:"12px 0",border:"none",background:"none",cursor:"pointer",fontFamily:"inherit",fontSize:13.5,fontWeight:tab===t.id?600:400,color:tab===t.id?"#1a1714":"#9a8c6e",borderBottom:`2px solid ${tab===t.id?"#8a7d5e":"transparent"}`,transition:"all 0.15s"}}>
            {t.label}
          </button>
        ))}
      </div>
      <div style={{padding:"20px 24px"}}>
        {tab==="rent"&&(rentLoading?<div style={{textAlign:"center",padding:36,color:"#9a8c6e",fontSize:13}}>Loading…</div>
          :rentApps.length===0?<div style={{textAlign:"center",padding:"36px 20px",color:"#b0a890",fontSize:13.5}}>No rental applications yet.</div>
          :<div style={{display:"flex",flexDirection:"column",gap:8}}>
            {rentApps.map(app=><AppCard key={app.id} app={app} onCancel={async id=>{setCancelling(id);try{await api.patch(`/api/rentals/applications/${id}/cancel`);notify("Cancelled");loadRent(rentPage);}catch(e){notify(e.response?.data?.message||"Error","error");}finally{setCancelling(null);}}} c={cancelling}/>)}
          </div>
        )}
        {tab==="sale"&&(saleLoading?<div style={{textAlign:"center",padding:36,color:"#9a8c6e",fontSize:13}}>Loading…</div>
          :saleApps.length===0?<div style={{textAlign:"center",padding:"36px 20px",color:"#b0a890",fontSize:13.5}}>No purchase applications yet.</div>
          :<div style={{display:"flex",flexDirection:"column",gap:8}}>
            {saleApps.map(app=><AppCard key={app.id} app={app} onCancel={async id=>{setCancelSale(id);try{await api.patch(`/api/sales/applications/${id}/cancel`);notify("Cancelled");loadSale(salePage);}catch(e){notify(e.response?.data?.message||"Error","error");}finally{setCancelSale(null);}}} c={cancelSale}/>)}
          </div>
        )}
      </div>
    </ModalWrap>
  );
}

// ─── Property Card ────────────────────────────────────────────────────────────
function PropertyCard({ property, viewMode, onOpen, onApply, onBuy, onSaveToggle, savedIds, idx }) {
  const badge   = getBadge(property.listing_type||property.listingType);
  const src     = property.primaryImage||property.primary_image||property.imageUrl;
  const img     = src?(src.startsWith("http")?src:BASE_URL+src):PLACEHOLDER;
  const isGrid  = viewMode==="grid";
  const isRent  = ["RENT","BOTH"].includes(property.listing_type||property.listingType);
  const isSale  = ["SALE","BOTH"].includes(property.listing_type||property.listingType);
  const isSaved = savedIds?.has(property.id);
  const typeEm  = TYPE_EMOJI[property.type]||"🏠";

  return (
    <div className="bp-card" onClick={()=>onOpen(property.id)}
      style={{
        background:"#fff", borderRadius:14, overflow:"hidden",
        boxShadow:"0 2px 16px rgba(20,16,10,0.08)",
        border:"1.5px solid #ece6da",
        display:isGrid?"block":"flex",
        minHeight:isGrid?"auto":"150px",
        width:"100%",
        fontFamily:"'DM Sans',sans-serif",
        cursor:"pointer",
        animation:`bp-card-in 0.38s ease ${Math.min(idx*0.05,0.4)}s both`,
      }}>

      {/* Image */}
      <div style={{position:"relative",width:isGrid?"100%":"210px",minWidth:isGrid?"auto":"210px",height:isGrid?"175px":"100%",minHeight:isGrid?"175px":"150px",background:"#ede9df",flexShrink:0,overflow:"hidden"}}>
        <img src={img} alt={property.title} className="bp-img"
          style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}
          onError={e=>{e.target.src=PLACEHOLDER;}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to top, rgba(8,6,4,0.5) 0%, transparent 52%)"}}/>

        {/* Badge */}
        <span style={{
          position:"absolute",top:10,left:10,
          background:badge.bg,backdropFilter:"blur(10px)",color:"#fff",
          fontSize:9.5,fontWeight:600,padding:"4px 11px",borderRadius:999,
          letterSpacing:"0.6px",textTransform:"uppercase",
          display:"flex",alignItems:"center",gap:5,
          border:`1px solid ${badge.dot}38`,
        }}>
          <span style={{width:4,height:4,borderRadius:"50%",background:badge.dot,display:"inline-block",boxShadow:`0 0 5px ${badge.dot}`}}/>
          {badge.label}
        </span>

        {/* Featured */}
        {(property.is_featured||property.isFeatured)&&(
          <span style={{position:"absolute",top:10,left:isGrid?"90px":"84px",background:"rgba(201,184,122,0.9)",backdropFilter:"blur(6px)",color:"#1a1714",fontSize:9.5,fontWeight:700,padding:"4px 10px",borderRadius:999,display:"flex",alignItems:"center",gap:3}}>
            ⭐ Featured
          </span>
        )}

        {/* Save */}
        <button className="bp-heart" onClick={e=>{e.stopPropagation();onSaveToggle(property);}}
          style={{position:"absolute",top:8,right:8,background:"rgba(245,240,232,0.92)",border:"none",borderRadius:"50%",width:30,height:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:isSaved?"#c0392b":"#9a8c6e",fontSize:15}}>
          {isSaved?"❤️":"🤍"}
        </button>

        {/* Property type */}
        <span style={{position:"absolute",bottom:9,left:10,color:"rgba(245,240,232,0.75)",fontSize:11.5,fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:4}}>
          {typeEm} {typeLbl(property.type)}
        </span>
      </div>

      {/* Content */}
      <div style={{padding:isGrid?"13px 15px 15px":"13px 18px",flex:1,display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
        <div>
          {(property.city||property.country)&&(
            <div style={{display:"flex",alignItems:"center",gap:4,color:"#b0a890",fontSize:11,marginBottom:5}}>
              📍 {[property.city,property.country].filter(Boolean).join(", ")}
            </div>
          )}
          <h3 style={{margin:"0 0 8px",fontSize:isGrid?"16.5px":"17.5px",fontWeight:700,color:"#1a1714",lineHeight:1.22,overflow:"hidden",textOverflow:"ellipsis",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",fontFamily:"'Cormorant Garamond',Georgia,serif",letterSpacing:"-0.1px"}}>
            {property.title}
          </h3>
          <div style={{fontSize:isGrid?"18px":"20px",fontWeight:700,color:"#1a1714",marginBottom:11,fontFamily:"'Cormorant Garamond',Georgia,serif",letterSpacing:"-0.3px"}}>
            {fmtPrice(property.price,property.currency)}
          </div>
        </div>
        <div>
          {/* Stats row */}
          <div style={{display:"flex",gap:12,color:"#9a8c6e",fontSize:11.5,flexWrap:"wrap",paddingTop:10,borderTop:"1px solid #f0ece3",marginBottom:(isRent||isSale)&&property.status==="AVAILABLE"?11:0}}>
            {property.bedrooms!=null&&<span>🛏 {property.bedrooms}</span>}
            {property.bathrooms!=null&&<span>🚿 {property.bathrooms}</span>}
            {(property.area_sqm??property.areaSqm)!=null&&<span>📐 {property.area_sqm??property.areaSqm} m²</span>}
          </div>

          {/* CTAs */}
          {property.status==="AVAILABLE"&&(isRent||isSale)&&(
            <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
              {isRent&&(
                <button className="bp-btn" onClick={e=>{e.stopPropagation();onApply(property);}}
                  style={{flex:1,padding:"8px 10px",borderRadius:10,background:"#1a1714",color:"#f5f0e8",border:"none",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                  🔑 Rent
                </button>
              )}
              {isSale&&(
                <button className="bp-btn" onClick={e=>{e.stopPropagation();onBuy(property);}}
                  style={{flex:1,padding:"8px 10px",borderRadius:10,background:isRent?"#f0ece3":"#1a1714",color:isRent?"#4a4438":"#f5f0e8",border:isRent?"1.5px solid #e0d8c8":"none",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                  🏠 Buy
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
  useEffect(()=>{const h=e=>e.key==="Escape"&&open&&onClose();window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);},[open,onClose]);
  const INP={width:"100%",padding:"9px 12px",border:"1.5px solid #e4ddd0",borderRadius:10,fontSize:13,color:"#1a1714",background:"#fff",fontFamily:"'DM Sans',sans-serif",boxSizing:"border-box",outline:"none"};
  const DL={display:"block",fontSize:9.5,fontWeight:600,color:"#b0a890",textTransform:"uppercase",letterSpacing:"1px",marginBottom:7,fontFamily:"'DM Sans',sans-serif"};
  if(!open)return null;
  return(
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(8,6,4,0.42)",zIndex:500,backdropFilter:"blur(3px)"}}/>
      <div style={{position:"fixed",top:0,right:0,bottom:0,width:320,background:"#faf7f2",zIndex:501,boxShadow:"-10px 0 44px rgba(8,6,4,0.16)",overflowY:"auto",animation:"bp-slide-r 0.26s cubic-bezier(0.25,0.46,0.45,0.94)",fontFamily:"'DM Sans',sans-serif"}}>
        <div style={{padding:"17px 20px",borderBottom:"1px solid #e8e2d6",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:"#faf7f2",zIndex:1}}>
          <div>
            <p style={{margin:0,fontSize:9.5,fontWeight:600,color:"#8a7d5e",textTransform:"uppercase",letterSpacing:"1.2px"}}>🔍 Filter</p>
            <p style={{margin:"2px 0 0",fontSize:17,fontWeight:700,color:"#1a1714",fontFamily:"'Cormorant Garamond',Georgia,serif",letterSpacing:"-0.2px"}}>Refine Results</p>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button onClick={onReset} style={{background:"none",border:"none",cursor:"pointer",color:"#9a8c6e",fontSize:12,fontFamily:"inherit",padding:0,textDecoration:"underline"}}>Reset all</button>
            <button onClick={onClose} style={{background:"rgba(245,240,232,0.8)",border:"1.5px solid #e8e2d6",cursor:"pointer",color:"#6b6340",display:"flex",alignItems:"center",justifyContent:"center",padding:6,borderRadius:8}}><XIcon/></button>
          </div>
        </div>
        <div style={{padding:20}}>
          <div style={{marginBottom:18}}>
            <label style={DL}>Listing Type</label>
            <div style={{display:"flex",gap:6}}>
              {["",...LISTING_TYPES].map(lt=>(
                <button key={lt} className="bp-chip"
                  onClick={()=>setFilters(f=>({...f,listingType:lt}))}
                  style={{flex:1,padding:"7px 4px",borderRadius:9,border:`1.5px solid ${filters.listingType===lt?"#8a7d5e":"#e4ddd0"}`,background:filters.listingType===lt?"#1a1714":"transparent",color:filters.listingType===lt?"#f5f0e8":"#6b6248",cursor:"pointer",fontSize:11.5,fontWeight:500,fontFamily:"inherit"}}>
                  {lt===""?"All":lt==="SALE"?"💰 Sale":lt==="RENT"?"🔑 Rent":"Both"}
                </button>
              ))}
            </div>
          </div>
          <div style={{marginBottom:16}}>
            <label style={DL}>Property Type</label>
            <select className="bp-in" value={filters.type} onChange={e=>setFilters(f=>({...f,type:e.target.value}))} style={INP}>
              <option value="">All Types</option>
              {PROPERTY_TYPES.map(t=><option key={t} value={t}>{TYPE_EMOJI[t]} {typeLbl(t)}</option>)}
            </select>
          </div>
          <div style={{marginBottom:16}}>
            <label style={DL}>City</label>
            <input className="bp-in" type="text" placeholder="📍 e.g. Tirana" value={filters.city} onChange={e=>setFilters(f=>({...f,city:e.target.value}))} style={INP}/>
          </div>
          <div style={{marginBottom:16}}>
            <label style={DL}>Price Range (EUR)</label>
            <div style={{display:"flex",gap:7}}>
              <input className="bp-in" type="number" min="0" placeholder="Min" value={filters.minPrice} onChange={e=>setFilters(f=>({...f,minPrice:e.target.value}))} style={INP}/>
              <input className="bp-in" type="number" min="0" placeholder="Max" value={filters.maxPrice} onChange={e=>setFilters(f=>({...f,maxPrice:e.target.value}))} style={INP}/>
            </div>
          </div>
          <div style={{marginBottom:16}}>
            <label style={DL}>Min. Bedrooms 🛏</label>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {["","1","2","3","4","5","6"].map(n=>(
                <button key={n} className="bp-chip"
                  onClick={()=>setFilters(f=>({...f,minBedrooms:n}))}
                  style={{padding:"6px 11px",borderRadius:9,border:`1.5px solid ${filters.minBedrooms===n?"#8a7d5e":"#e4ddd0"}`,background:filters.minBedrooms===n?"#1a1714":"transparent",color:filters.minBedrooms===n?"#f5f0e8":"#6b6248",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>
                  {n===""?"Any":`${n}+`}
                </button>
              ))}
            </div>
          </div>
          <div style={{marginBottom:16}}>
            <label style={DL}>Min. Bathrooms 🚿</label>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {["","1","2","3","4"].map(n=>(
                <button key={n} className="bp-chip"
                  onClick={()=>setFilters(f=>({...f,minBathrooms:n}))}
                  style={{padding:"6px 11px",borderRadius:9,border:`1.5px solid ${filters.minBathrooms===n?"#8a7d5e":"#e4ddd0"}`,background:filters.minBathrooms===n?"#1a1714":"transparent",color:filters.minBathrooms===n?"#f5f0e8":"#6b6248",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>
                  {n===""?"Any":`${n}+`}
                </button>
              ))}
            </div>
          </div>
          <div style={{marginBottom:16}}>
            <label style={DL}>Area (m²) 📐</label>
            <div style={{display:"flex",gap:7}}>
              <input className="bp-in" type="number" min="0" placeholder="Min" value={filters.minArea} onChange={e=>setFilters(f=>({...f,minArea:e.target.value}))} style={INP}/>
              <input className="bp-in" type="number" min="0" placeholder="Max" value={filters.maxArea} onChange={e=>setFilters(f=>({...f,maxArea:e.target.value}))} style={INP}/>
            </div>
          </div>
          <div style={{marginBottom:24}}>
            <label style={{display:"flex",alignItems:"center",gap:9,cursor:"pointer",color:"#4a4438",fontSize:13}}>
              <input type="checkbox" checked={filters.isFeatured===true} onChange={e=>setFilters(f=>({...f,isFeatured:e.target.checked?true:""}))} style={{accentColor:"#8a7d5e",width:15,height:15}}/>
              ⭐ Featured properties only
            </label>
          </div>
          <button onClick={()=>{onApply();onClose();}}
            style={{width:"100%",padding:"12px",background:"#1a1714",color:"#f5f0e8",border:"none",borderRadius:11,fontSize:13.5,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
            Apply Filters ✓
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, onChange }) {
  if(totalPages<=1)return null;
  const pages=Array.from({length:totalPages},(_,i)=>i);
  const visible=pages.filter(p=>p===0||p===totalPages-1||Math.abs(p-page)<=1);
  return(
    <div style={{display:"flex",justifyContent:"center",gap:4,marginTop:44,flexWrap:"wrap"}}>
      <button disabled={page===0} onClick={()=>onChange(page-1)} className="bp-pg" style={PGB(false,page===0)}>‹</button>
      {visible.map((p,i)=>{
        const gap=visible[i-1]!=null&&p-visible[i-1]>1;
        return<span key={p} style={{display:"flex",gap:4}}>
          {gap&&<span style={{padding:"7px 4px",color:"#b0a890",fontSize:13}}>…</span>}
          <button onClick={()=>onChange(p)} className="bp-pg" style={PGB(p===page,false)}>{p+1}</button>
        </span>;
      })}
      <button disabled={page===totalPages-1} onClick={()=>onChange(page+1)} className="bp-pg" style={PGB(false,page===totalPages-1)}>›</button>
    </div>
  );
}

const PGB=(active,disabled)=>({padding:"7px 13px",borderRadius:9,border:`1.5px solid ${active?"#1a1714":"#e4ddd0"}`,background:active?"#1a1714":"transparent",color:active?"#f5f0e8":disabled?"#d4ccbe":"#6b6248",cursor:disabled?"not-allowed":"pointer",fontSize:13,fontWeight:active?600:400,fontFamily:"'DM Sans',sans-serif",opacity:disabled?0.5:1,transition:"all 0.14s"});

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ viewMode }) {
  return(
    <div style={{display:viewMode==="grid"?"grid":"flex",gridTemplateColumns:viewMode==="grid"?"repeat(auto-fill,minmax(240px,1fr))":undefined,flexDirection:viewMode==="list"?"column":undefined,gap:viewMode==="grid"?18:12}}>
      {Array.from({length:6}).map((_,i)=>(
        <div key={i} style={{background:"#ede9df",borderRadius:14,height:viewMode==="grid"?280:150,animation:"bp-pulse 1.6s ease-in-out infinite"}}/>
      ))}
    </div>
  );
}

// ─── Quick filter pills ───────────────────────────────────────────────────────
const QUICK = [
  { label:"🏡 Villas",     filter:{ type:"VILLA" } },
  { label:"🏢 Apartments", filter:{ type:"APARTMENT" } },
  { label:"🔑 For Rent",   filter:{ listingType:"RENT" } },
  { label:"💰 For Sale",   filter:{ listingType:"SALE" } },
  { label:"🏠 Houses",     filter:{ type:"HOUSE" } },
  { label:"⭐ Featured",   filter:{ isFeatured:true } },
];

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
  const [activeQuick,    setActiveQuick]    = useState(null);
  const [selectedId,     setSelectedId]     = useState(null);
  const [applyTarget,    setApplyTarget]    = useState(null);
  const [buyTarget,      setBuyTarget]      = useState(null);
  const [showMyApps,     setShowMyApps]     = useState(false);
  const [toast,          setToast]          = useState(null);

  const notify = useCallback((msg,type="success")=>setToast({msg,type,key:Date.now()}),[]);

  useEffect(()=>{
    (async()=>{
      try{const res=await api.get("/api/properties/saved?page=0&size=500");setSavedIds(new Set((res.data?.content??[]).map(r=>r.propertyId)));}catch{}
    })();
  },[]);

  const handleSaveToggle=useCallback(async(property)=>{
    const isSaved=savedIds.has(property.id);
    setSavedIds(prev=>{const n=new Set(prev);isSaved?n.delete(property.id):n.add(property.id);return n;});
    try{
      if(isSaved){await api.delete(`/api/properties/saved/${property.id}`);notify("Removed from saved ✕");}
      else{await api.post(`/api/properties/saved/${property.id}`);notify("Saved to favourites ❤️");}
    }catch(err){
      setSavedIds(prev=>{const n=new Set(prev);isSaved?n.add(property.id):n.delete(property.id);return n;});
      if(err.response?.status===409){setSavedIds(prev=>new Set([...prev,property.id]));return;}
      notify(err.response?.data?.message||"Error","error");
    }
  },[savedIds,notify]);

  const fetchFiltered=useCallback(async(f,pg=0)=>{
    setLoading(true);setError(null);
    try{
      const params={page:pg,size:PAGE_SIZE,status:"AVAILABLE"};
      if(f.minPrice)params.minPrice=f.minPrice;if(f.maxPrice)params.maxPrice=f.maxPrice;
      if(f.minBedrooms)params.minBedrooms=f.minBedrooms;if(f.maxBedrooms)params.maxBedrooms=f.maxBedrooms;
      if(f.minBathrooms)params.minBathrooms=f.minBathrooms;
      if(f.minArea)params.minArea=f.minArea;if(f.maxArea)params.maxArea=f.maxArea;
      if(f.city)params.city=f.city;if(f.country)params.country=f.country;
      if(f.type)params.type=f.type;if(f.listingType)params.listingType=f.listingType;
      if(f.isFeatured)params.isFeatured=true;
      const res=await api.get("/api/properties/filter",{params});
      const d=res.data;
      setProperties(d.content||[]);setTotalPages(d.totalPages??d.total_pages??0);
      setTotalElements(d.totalElements??d.total_elements??0);setPage(pg);
    }catch{setError("Could not load properties. Please try again.");}
    finally{setLoading(false);}
  },[]);

  const fetchSearch=useCallback(async(keyword,pg=0)=>{
    setLoading(true);setError(null);
    try{
      const upper=keyword.toUpperCase();
      if(PROPERTY_TYPES.includes(upper)){fetchFiltered({...DEFAULT_FILTERS,type:upper},0);return;}
      if(upper==="RENT"){fetchFiltered({...DEFAULT_FILTERS,listingType:"RENT"},0);return;}
      if(upper==="SALE"){fetchFiltered({...DEFAULT_FILTERS,listingType:"SALE"},0);return;}
      const res=await api.get("/api/properties/filter",{params:{page:pg,size:PAGE_SIZE,sort:"createdAt,desc",status:"AVAILABLE",city:keyword}});
      const d=res.data;
      setProperties(d.content||[]);setTotalPages(d.totalPages??0);setTotalElements(d.totalElements??0);setPage(pg);
    }catch{setError("Search failed. Please try again.");}
    finally{setLoading(false);}
  },[fetchFiltered]);

  useEffect(()=>{fetchFiltered(DEFAULT_FILTERS,0);},[fetchFiltered]);

  const handleSearch=()=>{const q=searchQuery.trim();if(!q){setMode("filter");fetchFiltered(filters,0);return;}setMode("search");setActiveQuick(null);fetchSearch(q,0);};
  const handleApplyFilters=()=>{setFilters(pendingFilters);setMode("filter");setSearchQuery("");setActiveQuick(null);fetchFiltered(pendingFilters,0);};
  const handleResetFilters=()=>{setPendingFilters(DEFAULT_FILTERS);setFilters(DEFAULT_FILTERS);setMode("filter");setSearchQuery("");setActiveQuick(null);fetchFiltered(DEFAULT_FILTERS,0);};
  const handleQuick=(q,i)=>{
    if(activeQuick===i){setActiveQuick(null);handleResetFilters();return;}
    setActiveQuick(i);setMode("filter");setSearchQuery("");
    const f={...DEFAULT_FILTERS,...q.filter};setFilters(f);setPendingFilters(f);fetchFiltered(f,0);
  };
  const handlePageChange=p=>{mode==="search"&&searchQuery.trim()?fetchSearch(searchQuery.trim(),p):fetchFiltered(filters,p);window.scrollTo({top:0,behavior:"smooth"});};

  const activeFilterCount=Object.entries(filters).filter(([k,v])=>k!=="status"&&v!==""&&v!=null&&v!==false).length;
  const gridStyle=viewMode==="grid"
    ?{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:18}
    :{display:"flex",flexDirection:"column",gap:12};

  return (
    <MainLayout role="client">
      <style>{CSS}</style>
      <div className="bp">

        {/* ── Hero banner ── */}
        <div style={{
          background:"linear-gradient(160deg, #141210 0%, #1e1a14 45%, #241e16 100%)",
          padding:"36px 32px 30px",
          position:"relative",
          overflow:"hidden",
        }}>
          {/* Dot texture */}
          <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,0.018) 1px,transparent 1px)",backgroundSize:"22px 22px",pointerEvents:"none"}}/>
          {/* Glow left */}
          <div style={{position:"absolute",top:"-60px",left:"10%",width:300,height:300,borderRadius:"50%",background:"radial-gradient(circle,rgba(201,184,122,0.07) 0%,transparent 70%)",pointerEvents:"none"}}/>
          {/* Glow right */}
          <div style={{position:"absolute",bottom:"-40px",right:"10%",width:240,height:240,borderRadius:"50%",background:"radial-gradient(circle,rgba(126,184,164,0.05) 0%,transparent 70%)",pointerEvents:"none"}}/>
          {/* Gold accent line top */}
          <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:"linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)"}}/>

          {/* My Applications — top right */}
          <button onClick={()=>setShowMyApps(true)}
            style={{position:"absolute",top:18,right:24,padding:"7px 14px",background:"rgba(201,184,122,0.08)",color:"rgba(245,240,232,0.6)",border:"1px solid rgba(201,184,122,0.16)",borderRadius:9,fontSize:11.5,fontWeight:500,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:6,zIndex:2}}>
            📋 My Applications
          </button>

          <div style={{position:"relative",zIndex:1,maxWidth:700,margin:"0 auto",textAlign:"center"}}>

            {/* Headline */}
            <h1 style={{
              margin:"0 0 10px",
              fontFamily:"'Cormorant Garamond',Georgia,serif",
              fontSize:"clamp(28px,4vw,44px)",
              fontWeight:700,
              color:"#f5f0e8",
              letterSpacing:"-0.7px",
              lineHeight:1.1,
            }}>
              Find Your{" "}
              <span style={{
                background:"linear-gradient(90deg,#c9b87a,#e8d9a0,#c9b87a)",
                backgroundSize:"200% auto",
                WebkitBackgroundClip:"text",
                WebkitTextFillColor:"transparent",
                backgroundClip:"text",
              }}>Dream Property</span>
            </h1>

            <p style={{
              margin:"0 auto 24px",
              fontSize:13.5,
              color:"rgba(245,240,232,0.38)",
              fontFamily:"'DM Sans',sans-serif",
              lineHeight:1.6,
            }}>
              Verified listings across Albania — villas, apartments, offices & more.
            </p>

            {/* Search bar — full width */}
            <div style={{display:"flex",gap:0,marginBottom:16,boxShadow:"0 6px 24px rgba(0,0,0,0.28)",borderRadius:14,overflow:"hidden",border:"1.5px solid rgba(245,240,232,0.09)"}}>
              <div style={{flex:1,display:"flex",alignItems:"center",gap:10,background:"rgba(245,240,232,0.06)",padding:"0 18px",height:50,backdropFilter:"blur(10px)"}}>
                <span style={{color:"rgba(245,240,232,0.3)",flexShrink:0,display:"flex"}}><SearchIcon/></span>
                <input type="text" placeholder="Search by city, title, keyword…" value={searchQuery}
                  onChange={e=>setSearchQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSearch()}
                  style={{flex:1,border:"none",outline:"none",fontSize:13.5,color:"#f5f0e8",background:"transparent",fontFamily:"'DM Sans',sans-serif"}}/>
                {searchQuery&&<button onClick={()=>{setSearchQuery("");setMode("filter");fetchFiltered(filters,0);}} style={{background:"none",border:"none",cursor:"pointer",color:"rgba(245,240,232,0.3)",padding:0,display:"flex"}}><XIcon/></button>}
              </div>
              <div style={{width:1,background:"rgba(245,240,232,0.07)",alignSelf:"stretch",flexShrink:0}}/>
              <button onClick={()=>setFilterOpen(true)}
                style={{padding:"0 18px",height:50,background:"rgba(245,240,232,0.06)",color:activeFilterCount>0?"#c9b87a":"rgba(245,240,232,0.45)",border:"none",fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                <SlidersIcon/>
                {activeFilterCount>0&&<span style={{background:"#c9b87a",color:"#1a1714",borderRadius:"50%",width:16,height:16,fontSize:9.5,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{activeFilterCount}</span>}
                Filters
              </button>
              <div style={{width:1,background:"rgba(245,240,232,0.07)",alignSelf:"stretch",flexShrink:0}}/>
              <button onClick={handleSearch}
                style={{padding:"0 24px",height:50,background:"linear-gradient(135deg,#c9b87a 0%,#b0983e 100%)",color:"#1a1714",border:"none",fontSize:13.5,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:7,flexShrink:0}}>
                🔍 Search
              </button>
            </div>

            {/* Quick pills + count */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5,flexWrap:"wrap"}}>
              {QUICK.map((q,i)=>(
                <button key={i} onClick={()=>handleQuick(q,i)}
                  style={{padding:"4px 12px",borderRadius:999,border:`1px solid ${activeQuick===i?"#c9b87a":"rgba(245,240,232,0.1)"}`,background:activeQuick===i?"rgba(201,184,122,0.13)":"transparent",color:activeQuick===i?"#c9b87a":"rgba(245,240,232,0.4)",cursor:"pointer",fontSize:11,fontWeight:activeQuick===i?600:400,fontFamily:"'DM Sans',sans-serif",transition:"all 0.14s"}}>
                  {q.label}
                </button>
              ))}
              {(activeFilterCount>0||activeQuick!==null)&&(
                <button onClick={handleResetFilters}
                  style={{padding:"4px 10px",borderRadius:999,border:"none",background:"none",color:"rgba(245,240,232,0.22)",cursor:"pointer",fontSize:10.5,fontFamily:"'DM Sans',sans-serif",textDecoration:"underline"}}>
                  Clear ×
                </button>
              )}
              <span style={{color:"rgba(245,240,232,0.2)",fontSize:11,fontFamily:"'DM Sans',sans-serif",marginLeft:4}}>
                {loading?"…":`${totalElements.toLocaleString()} listings`}
              </span>
            </div>

          </div>
        </div>

        {/* ── Toolbar ── */}
        <div style={{background:"#fff",borderBottom:"1.5px solid #e8e2d6",padding:"0 28px",height:46,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,fontFamily:"'DM Sans',sans-serif",position:"sticky",top:0,zIndex:100,boxShadow:"0 1px 10px rgba(20,16,10,0.05)"}}>
          <p style={{margin:0,fontSize:12.5,color:"#9a8c6e"}}>
            {loading?"Searching…":`${totalElements.toLocaleString()} result${totalElements!==1?"s":""}`}
            {mode==="search"&&searchQuery&&<span style={{color:"#6b6340"}}> · "<strong>{searchQuery}</strong>"</span>}
          </p>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {/* Saved link */}
            <a href="/client/savedproperties"
              style={{padding:"5px 13px",borderRadius:9,background:"#fff8f5",border:"1.5px solid #f5c6c0",color:"#c0392b",fontSize:12,fontWeight:500,textDecoration:"none",display:"flex",alignItems:"center",gap:5,fontFamily:"'DM Sans',sans-serif",transition:"all 0.14s"}}>
              ❤️ Saved
            </a>
            {/* View toggle */}
            <div style={{display:"flex",gap:2,background:"#f5f0e8",border:"1.5px solid #e8e2d6",borderRadius:10,padding:"3px"}}>
              {[{m:"grid",I:GridIcon,label:"Grid"},{m:"list",I:ListIcon,label:"List"}].map(({m,I,label})=>(
                <button key={m} onClick={()=>setViewMode(m)}
                  style={{display:"flex",alignItems:"center",gap:5,padding:"5px 10px",borderRadius:8,border:"none",background:viewMode===m?"#fff":"transparent",color:viewMode===m?"#1a1714":"#b0a890",cursor:"pointer",transition:"all 0.14s",boxShadow:viewMode===m?"0 1px 5px rgba(0,0,0,0.08)":"none",fontSize:11.5,fontFamily:"inherit",fontWeight:viewMode===m?500:400}}>
                  <I/> {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div style={{padding:"20px 24px",maxWidth:1440,margin:"0 auto"}}>

          {error&&(
            <div style={{background:"#fff8f5",border:"1.5px solid #f5c6a0",borderRadius:12,padding:"13px 16px",color:"#7a3a1a",fontSize:13,marginBottom:18,display:"flex",alignItems:"center",gap:10,fontFamily:"'DM Sans',sans-serif"}}>
              ⚠️ {error}
              <button onClick={()=>mode==="search"?fetchSearch(searchQuery,page):fetchFiltered(filters,page)}
                style={{background:"#1a1714",color:"#f5f0e8",border:"none",borderRadius:8,padding:"5px 13px",cursor:"pointer",fontSize:12,fontFamily:"inherit",marginLeft:"auto"}}>
                Retry
              </button>
            </div>
          )}

          {loading&&<Skeleton viewMode={viewMode}/>}

          {!loading&&!error&&properties.length===0&&(
            <div style={{textAlign:"center",padding:"80px 32px",color:"#b0a890",fontFamily:"'DM Sans',sans-serif"}}>
              <div style={{fontSize:48,marginBottom:16}}>🏘️</div>
              <p style={{fontSize:18,fontWeight:700,color:"#6b6340",marginBottom:6,fontFamily:"'Cormorant Garamond',Georgia,serif",letterSpacing:"-0.2px"}}>No properties found</p>
              <p style={{fontSize:13,marginBottom:20,color:"#b0a890"}}>Try adjusting your filters or search terms.</p>
              <button onClick={handleResetFilters}
                style={{padding:"10px 24px",background:"#1a1714",color:"#f5f0e8",border:"none",borderRadius:11,fontSize:13.5,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                🔄 Clear Filters
              </button>
            </div>
          )}

          {!loading&&properties.length>0&&<>
            <div style={gridStyle}>
              {properties.map((p,i)=>(
                <PropertyCard key={p.id} property={p} viewMode={viewMode} idx={i}
                  onOpen={setSelectedId} onApply={setApplyTarget} onBuy={setBuyTarget}
                  onSaveToggle={handleSaveToggle} savedIds={savedIds}/>
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={handlePageChange}/>
          </>}
        </div>
      </div>

      <FilterDrawer filters={pendingFilters} setFilters={setPendingFilters}
        onApply={handleApplyFilters} onReset={handleResetFilters}
        open={filterOpen} onClose={()=>setFilterOpen(false)}/>

      {selectedId&&<PropertyDetailModal propertyId={selectedId} onClose={()=>setSelectedId(null)}
        onApply={p=>{setSelectedId(null);setApplyTarget(p);}}
        onBuy={p=>{setSelectedId(null);setBuyTarget(p);}}/>}
      {applyTarget&&<RentalApplyModal property={applyTarget} onClose={()=>setApplyTarget(null)}
        onSuccess={()=>{setApplyTarget(null);notify("Application submitted ✓");}} notify={notify}/>}
      {buyTarget&&<SaleBuyModal property={buyTarget} onClose={()=>setBuyTarget(null)}
        onSuccess={()=>{setBuyTarget(null);notify("Purchase application submitted ✓");}} notify={notify}/>}
      {showMyApps&&<MyApplicationsModal onClose={()=>setShowMyApps(false)} notify={notify}/>}
      {toast&&<Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}
    </MainLayout>
  );
}