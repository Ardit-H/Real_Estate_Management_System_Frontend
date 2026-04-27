import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";

// ─── SVG Icons (no emoji) ─────────────────────────────────────────────────────
const Ico = (d, w=15, sw=1.8) => (
  <svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);
const BedIcon     = () => Ico(<><path d="M2 4v16"/><path d="M22 8H2"/><path d="M22 20V8l-4-4H6L2 8"/><path d="M6 8v4"/><path d="M18 8v4"/></>, 13);
const BathIcon    = () => Ico(<><path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/><line x1="10" y1="5" x2="8" y2="7"/><line x1="2" y1="12" x2="22" y2="12"/></>, 13);
const AreaIcon    = () => Ico(<><path d="M3 3h7v7H3z"/><path d="M14 3h7v7h-7z"/><path d="M14 14h7v7h-7z"/><path d="M3 14h7v7H3z"/></>, 13);
const GridIcon    = () => Ico(<><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></>);
const ListIcon    = () => Ico(<><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>);
const ArrowLeftIcon = () => Ico(<><path d="m15 18-6-6 6-6"/></>, 14, 2.2);
const PinIcon     = () => Ico(<><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></>, 12);
const CalendarIcon= () => Ico(<><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>, 12);
const HomeIcon    = () => Ico(<><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>, 15, 1.8);
const SearchIcon  = () => Ico(<><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></>, 16);
const HeartOffIcon= () => Ico(<><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><line x1="2" y1="2" x2="22" y2="22" strokeWidth="2"/></>, 14);

// ─── Type label icons (SVG, no emoji) ────────────────────────────────────────
const TypeIcon = ({ type, size=12 }) => {
  const icons = {
    VILLA:      Ico(<><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></>, size),
    HOUSE:      Ico(<><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>, size),
    APARTMENT:  Ico(<><rect x="4" y="2" width="16" height="20" rx="1"/><line x1="9" y1="22" x2="9" y2="16"/><line x1="15" y1="22" x2="15" y2="16"/><rect x="9" y="16" width="6" height="6"/><line x1="9" y1="7" x2="9.01" y2="7"/><line x1="15" y1="7" x2="15.01" y2="7"/><line x1="9" y1="11" x2="9.01" y2="11"/><line x1="15" y1="11" x2="15.01" y2="11"/></>, size),
    COMMERCIAL: Ico(<><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></>, size),
    LAND:       Ico(<><path d="M3 17h18"/><path d="M3 12h18"/><path d="m3 7 5 5 4-5 5 5 4-5"/></>, size),
    OFFICE:     Ico(<><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="M3 9h18"/></>, size),
  };
  return icons[type] || Ico(<><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></>, size);
};

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE_URL    = import.meta.env.VITE_API_URL || "http://localhost:8080";
const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23ede9df' width='400' height='300'/%3E%3Cpath d='M160 195 L200 135 L240 195Z' fill='%23d4cfc3'/%3E%3Crect x='180' y='165' width='40' height='30' fill='%23c4bfb0'/%3E%3C/svg%3E";
const PAGE_SIZE   = 12;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtPrice = (p, c="EUR") => p ? new Intl.NumberFormat("en-EU",{style:"currency",currency:c,maximumFractionDigits:0}).format(p) : "–";
const typeLbl  = t => ({APARTMENT:"Apartment",HOUSE:"House",VILLA:"Villa",COMMERCIAL:"Commercial",LAND:"Land",OFFICE:"Office"}[t]||t||"–");
const BADGE    = {
  SALE: { label:"For Sale",    dot:"#c9b87a" },
  RENT: { label:"For Rent",    dot:"#7eb8a4" },
  BOTH: { label:"Sale & Rent", dot:"#a4b07e" },
};
const getBadge = t => BADGE[t] || { label:t||"–", dot:"#8a7d5e" };
const buildImg = src => src ? (src.startsWith("http")?src:BASE_URL+src) : null;

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  .sp * { box-sizing: border-box; }
  .sp {
    font-family: 'DM Sans', system-ui, sans-serif;
    background: #f2ede4;
    min-height: 100vh;
  }

  .sp-card { transition: transform 0.24s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.24s ease; }
  .sp-card:hover { transform: translateY(-5px); box-shadow: 0 24px 52px rgba(20,16,10,0.14) !important; }
  .sp-card:hover .sp-img { transform: scale(1.05); }
  .sp-img { transition: transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94); }

  .sp-unsave { transition: all 0.16s ease; }
  .sp-unsave:hover { transform: scale(1.1) !important; background: rgba(200,60,50,0.9) !important; }

  .sp-pg { transition: all 0.14s ease; }
  .sp-pg:hover:not(:disabled) { background: #ede9df !important; border-color: #8a7d5e !important; }

  .sp-view-btn { transition: all 0.14s ease; }

  @keyframes sp-pulse   { 0%,100%{opacity:.38} 50%{opacity:.82} }
  @keyframes sp-card-in { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes sp-toast   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
`;

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type="success", onDone }) {
  useEffect(()=>{ const t=setTimeout(onDone,3000); return()=>clearTimeout(t); },[onDone]);
  return (
    <div style={{
      position:"fixed",bottom:26,right:26,zIndex:9999,
      background:"#1a1714",color:type==="error"?"#e08080":"#80c0a0",
      padding:"11px 18px",borderRadius:12,fontSize:13,fontWeight:400,
      boxShadow:"0 10px 36px rgba(0,0,0,0.32)",
      border:`1px solid ${type==="error"?"rgba(224,128,128,0.15)":"rgba(128,192,160,0.15)"}`,
      maxWidth:320,fontFamily:"'DM Sans',sans-serif",
      animation:"sp-toast 0.2s ease",display:"flex",alignItems:"center",gap:8,
    }}>
      <span style={{opacity:0.55,fontSize:11}}>{type==="error"?"✕":"✓"}</span>
      {msg}
    </div>
  );
}

// ─── Saved Property Card ──────────────────────────────────────────────────────
function SavedCard({ item, viewMode, onUnsave, idx }) {
  const badge    = getBadge(item.listingType);
  const img      = buildImg(item.primaryImage) || PLACEHOLDER;
  const isGrid   = viewMode === "grid";
  const savedFmt = item.savedAt
    ? new Date(item.savedAt).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})
    : null;

  return (
    <div className="sp-card"
      style={{
        background:"#fff",
        borderRadius:14,
        overflow:"hidden",
        boxShadow:"0 2px 14px rgba(20,16,10,0.08)",
        border:"1.5px solid #ece6da",
        display:isGrid?"block":"flex",
        minHeight:isGrid?"auto":"150px",
        width:"100%",
        fontFamily:"'DM Sans',sans-serif",
        animation:`sp-card-in 0.36s ease ${Math.min(idx*0.05,0.4)}s both`,
      }}>

      {/* Image */}
      <div style={{
        position:"relative",
        width:isGrid?"100%":"210px",
        minWidth:isGrid?"auto":"210px",
        height:isGrid?"175px":"100%",
        minHeight:isGrid?"175px":"150px",
        background:"#ede9df",
        flexShrink:0,
        overflow:"hidden",
      }}>
        <img src={img} alt={item.title} className="sp-img"
          style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}
          onError={e=>{e.target.src=PLACEHOLDER;}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to top, rgba(8,6,4,0.48) 0%, transparent 50%)"}}/>

        {/* Listing badge */}
        <span style={{
          position:"absolute",top:10,left:10,
          background:"rgba(20,16,10,0.70)",
          backdropFilter:"blur(10px)",
          color:"#f5f0e8",
          fontSize:9.5,fontWeight:600,
          padding:"4px 11px",borderRadius:999,
          letterSpacing:"0.6px",textTransform:"uppercase",
          display:"flex",alignItems:"center",gap:5,
          border:`1px solid ${badge.dot}35`,
        }}>
          <span style={{width:4,height:4,borderRadius:"50%",background:badge.dot,display:"inline-block",flexShrink:0}}/>
          {badge.label}
        </span>

        {/* Unsave button — clean, no emoji */}
        <button
          className="sp-unsave"
          onClick={()=>onUnsave(item.propertyId)}
          title="Remove from saved"
          style={{
            position:"absolute",top:8,right:8,
            background:"rgba(200,55,45,0.82)",
            backdropFilter:"blur(8px)",
            border:"1px solid rgba(255,255,255,0.15)",
            borderRadius:"50%",
            width:30,height:30,
            cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",
            color:"#fff",
          }}>
          <HeartOffIcon/>
        </button>

        {/* Property type — icon + label, no emoji */}
        <span style={{
          position:"absolute",bottom:9,left:10,
          color:"rgba(245,240,232,0.65)",
          fontSize:11,
          fontFamily:"'DM Sans',sans-serif",
          display:"flex",alignItems:"center",gap:5,
        }}>
          <TypeIcon type={item.type} size={11}/>
          {typeLbl(item.type)}
        </span>
      </div>

      {/* Content */}
      <div style={{padding:isGrid?"13px 15px 15px":"13px 18px",flex:1,display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
        <div>
          {(item.city||item.country)&&(
            <div style={{display:"flex",alignItems:"center",gap:4,color:"#9a8c6e",fontSize:11,marginBottom:5}}>
              <PinIcon/>
              {[item.city,item.country].filter(Boolean).join(", ")}
            </div>
          )}
          <h3 style={{
            margin:"0 0 7px",
            fontSize:isGrid?"16.5px":"17px",
            fontWeight:700,
            color:"#1a1714",
            lineHeight:1.22,
            overflow:"hidden",
            textOverflow:"ellipsis",
            display:"-webkit-box",
            WebkitLineClamp:2,
            WebkitBoxOrient:"vertical",
            fontFamily:"'Cormorant Garamond',Georgia,serif",
            letterSpacing:"-0.1px",
          }}>
            {item.title}
          </h3>
          <div style={{
            fontSize:isGrid?"18px":"20px",
            fontWeight:700,
            color:"#1a1714",
            marginBottom:10,
            fontFamily:"'Cormorant Garamond',Georgia,serif",
            letterSpacing:"-0.3px",
          }}>
            {fmtPrice(item.price, item.currency)}
          </div>
        </div>

        <div>
          {/* Stats row — icons only */}
          <div style={{
            display:"flex",gap:14,
            color:"#8a7d5e",fontSize:11.5,
            flexWrap:"wrap",
            paddingTop:9,
            borderTop:"1px solid #f0ece3",
            marginBottom:savedFmt?7:0,
          }}>
            {item.bedrooms!=null&&(
              <span style={{display:"flex",alignItems:"center",gap:4}}>
                <BedIcon/> {item.bedrooms} bd
              </span>
            )}
            {item.bathrooms!=null&&(
              <span style={{display:"flex",alignItems:"center",gap:4}}>
                <BathIcon/> {item.bathrooms} ba
              </span>
            )}
            {item.areaSqm!=null&&(
              <span style={{display:"flex",alignItems:"center",gap:4}}>
                <AreaIcon/> {item.areaSqm} m²
              </span>
            )}
          </div>

          {/* Saved date */}
          {savedFmt&&(
            <div style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"#a09080"}}>
              <CalendarIcon/> Saved {savedFmt}
            </div>
          )}

          {/* Note */}
          {item.note&&(
            <div style={{
              fontSize:12,color:"#6b6248",marginTop:5,
              fontStyle:"italic",
              fontFamily:"'Cormorant Garamond',Georgia,serif",
            }}>
              "{item.note}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
const PGB = (active, disabled) => ({
  padding:"6px 13px",borderRadius:9,
  border:`1.5px solid ${active?"#1a1714":"#e4ddd0"}`,
  background: active?"#1a1714":"transparent",
  color: active?"#f5f0e8":disabled?"#d4ccbe":"#6b6248",
  cursor: disabled?"not-allowed":"pointer",
  fontSize:13,fontWeight:active?600:400,
  fontFamily:"'DM Sans',sans-serif",
  opacity:disabled?0.5:1,transition:"all 0.14s",
});

function Pagination({ page, totalPages, onChange }) {
  if (totalPages<=1) return null;
  const pages   = Array.from({length:totalPages},(_,i)=>i);
  const visible = pages.filter(p=>p===0||p===totalPages-1||Math.abs(p-page)<=1);
  return (
    <div style={{display:"flex",justifyContent:"center",gap:4,marginTop:40,flexWrap:"wrap"}}>
      <button disabled={page===0} onClick={()=>onChange(page-1)} className="sp-pg" style={PGB(false,page===0)}>‹</button>
      {visible.map((p,i)=>{
        const gap = visible[i-1]!=null && p-visible[i-1]>1;
        return <span key={p} style={{display:"flex",gap:4}}>
          {gap&&<span style={{padding:"7px 4px",color:"#b0a890",fontSize:13}}>…</span>}
          <button onClick={()=>onChange(p)} className="sp-pg" style={PGB(p===page,false)}>{p+1}</button>
        </span>;
      })}
      <button disabled={page===totalPages-1} onClick={()=>onChange(page+1)} className="sp-pg" style={PGB(false,page===totalPages-1)}>›</button>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ viewMode }) {
  return (
    <div style={{
      display:viewMode==="grid"?"grid":"flex",
      gridTemplateColumns:viewMode==="grid"?"repeat(auto-fill,minmax(240px,1fr))":undefined,
      flexDirection:viewMode==="list"?"column":undefined,
      gap:viewMode==="grid"?18:12,
    }}>
      {Array.from({length:6}).map((_,i)=>(
        <div key={i} style={{background:"#ede9df",borderRadius:14,height:viewMode==="grid"?280:150,animation:"sp-pulse 1.6s ease-in-out infinite"}}/>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SavedProperties() {
  const navigate = useNavigate();

  const [items,         setItems]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [page,          setPage]          = useState(0);
  const [totalPages,    setTotalPages]    = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [viewMode,      setViewMode]      = useState("grid");
  const [toast,         setToast]         = useState(null);

  const notify = useCallback((msg, type="success") => setToast({msg,type,key:Date.now()}), []);

  const loadPage = useCallback(async (pg=0) => {
    setLoading(true);
    try {
      const res  = await api.get(`/api/properties/saved?page=${pg}&size=${PAGE_SIZE}`);
      const data = res.data;
      setItems(data.content||[]);
      setTotalPages(data.totalPages||0);
      setTotalElements(data.totalElements||0);
      setPage(pg);
    } catch {
      notify("Error loading saved properties","error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(()=>{ loadPage(0); },[loadPage]);

  const handleUnsave = useCallback(async (propertyId) => {
    setItems(prev=>prev.filter(i=>i.propertyId!==propertyId));
    setTotalElements(prev=>Math.max(0,prev-1));
    try {
      await api.delete(`/api/properties/saved/${propertyId}`);
      notify("Removed from saved");
      loadPage(page);
    } catch (err) {
      loadPage(page);
      notify(err.response?.data?.message||"Error removing property","error");
    }
  }, [page, loadPage, notify]);

  const handlePageChange = pg => {
    loadPage(pg);
    window.scrollTo({top:0,behavior:"smooth"});
  };

  const gridStyle = viewMode==="grid"
    ? {display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:18}
    : {display:"flex",flexDirection:"column",gap:12};

  return (
    <MainLayout role="client">
      <style>{CSS}</style>
      <div className="sp">

        {/* ── Hero — identical layout/height to BrowseProperties ── */}
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
          {/* Gold accent line */}
          <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:"linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)"}}/>

          {/* Back button — top left */}
          <button onClick={()=>navigate("/client/browseproperties")}
            style={{
              position:"absolute",top:18,left:24,
              padding:"7px 14px",
              background:"rgba(201,184,122,0.08)",
              color:"rgba(245,240,232,0.55)",
              border:"1px solid rgba(201,184,122,0.15)",
              borderRadius:9,fontSize:11.5,fontWeight:500,
              cursor:"pointer",fontFamily:"'DM Sans',sans-serif",
              display:"flex",alignItems:"center",gap:6,zIndex:2,
            }}>
            <ArrowLeftIcon/> Browse Properties
          </button>

          {/* Centered content */}
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
              Your Saved{" "}
              <span style={{
                background:"linear-gradient(90deg,#c9b87a,#e8d9a0,#c9b87a)",
                backgroundSize:"200% auto",
                WebkitBackgroundClip:"text",
                WebkitTextFillColor:"transparent",
                backgroundClip:"text",
              }}>Properties</span>
            </h1>

            <p style={{
              margin:0,
              fontSize:13.5,
              color:"rgba(245,240,232,0.35)",
              fontFamily:"'DM Sans',sans-serif",
              lineHeight:1.6,
            }}>
              {loading
                ? "Loading your saved properties…"
                : totalElements===0
                  ? "You have no saved properties yet."
                  : `${totalElements.toLocaleString()} saved propert${totalElements!==1?"ies":"y"}`
              }
            </p>

          </div>
        </div>

        {/* ── Toolbar — identical to BrowseProperties ── */}
        <div style={{
          background:"#fff",
          borderBottom:"1.5px solid #e8e2d6",
          padding:"0 28px",
          height:46,
          display:"flex",
          alignItems:"center",
          justifyContent:"space-between",
          gap:12,
          fontFamily:"'DM Sans',sans-serif",
          position:"sticky",top:0,zIndex:100,
          boxShadow:"0 1px 10px rgba(20,16,10,0.05)",
        }}>
          <p style={{margin:0,fontSize:12.5,color:"#9a8c6e"}}>
            {loading
              ? "Loading…"
              : `${totalElements.toLocaleString()} saved propert${totalElements!==1?"ies":"y"}`
            }
          </p>
          {/* View toggle */}
          <div style={{display:"flex",gap:2,background:"#f5f0e8",border:"1.5px solid #e8e2d6",borderRadius:10,padding:"3px"}}>
            {[{m:"grid",I:GridIcon,label:"Grid"},{m:"list",I:ListIcon,label:"List"}].map(({m,I,label})=>(
              <button key={m} className="sp-view-btn" onClick={()=>setViewMode(m)}
                style={{
                  display:"flex",alignItems:"center",gap:5,
                  padding:"5px 10px",borderRadius:8,border:"none",
                  background:viewMode===m?"#fff":"transparent",
                  color:viewMode===m?"#1a1714":"#b0a890",
                  cursor:"pointer",
                  boxShadow:viewMode===m?"0 1px 5px rgba(0,0,0,0.08)":"none",
                  fontSize:11.5,fontFamily:"inherit",fontWeight:viewMode===m?500:400,
                }}>
                <I/> {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ── */}
        <div style={{padding:"20px 24px",maxWidth:1440,margin:"0 auto"}}>

          {loading && <Skeleton viewMode={viewMode}/>}

          {!loading && items.length===0 && (
            <div style={{textAlign:"center",padding:"88px 32px",color:"#9a8c6e",fontFamily:"'DM Sans',sans-serif"}}>
              {/* House icon instead of emoji */}
              <div style={{width:56,height:56,borderRadius:"50%",background:"#f0ece3",border:"1.5px solid #e4ddd0",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",color:"#b0a890"}}>
                <HomeIcon/>
              </div>
              <p style={{fontSize:17,fontWeight:700,color:"#4a4438",marginBottom:6,fontFamily:"'Cormorant Garamond',Georgia,serif",letterSpacing:"-0.2px"}}>
                No saved properties yet
              </p>
              <p style={{fontSize:13,marginBottom:24,color:"#9a8c6e"}}>
                Click the heart icon on any property listing to save it here.
              </p>
              <button onClick={()=>navigate("/client/browseproperties")}
                style={{
                  padding:"11px 28px",background:"#1a1714",color:"#f5f0e8",
                  border:"none",borderRadius:11,fontSize:13.5,fontWeight:600,
                  cursor:"pointer",fontFamily:"inherit",
                  display:"inline-flex",alignItems:"center",gap:8,
                }}>
                <SearchIcon/> Browse Properties
              </button>
            </div>
          )}

          {!loading && items.length>0 && (
            <>
              <div style={gridStyle}>
                {items.map((item,i)=>(
                  <SavedCard
                    key={item.savedId}
                    item={item}
                    viewMode={viewMode}
                    onUnsave={handleUnsave}
                    idx={i}
                  />
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} onChange={handlePageChange}/>
            </>
          )}

        </div>
      </div>

      {toast&&<Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}
    </MainLayout>
  );
}