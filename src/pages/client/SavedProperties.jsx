import { useState, useEffect, useCallback, useRef } from "react";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";

// ─── Icons ────────────────────────────────────────────────────────────────────
const HeartIcon = ({ filled }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const BedIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 4v16"/><path d="M22 8H2"/><path d="M22 20V8l-4-4H6L2 8"/><path d="M6 8v4"/><path d="M18 8v4"/>
  </svg>
);
const BathIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/>
    <line x1="10" y1="5" x2="8" y2="7"/><line x1="2" y1="12" x2="22" y2="12"/>
  </svg>
);
const AreaIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3h7v7H3z"/><path d="M14 3h7v7h-7z"/><path d="M14 14h7v7h-7z"/><path d="M3 14h7v7H3z"/>
  </svg>
);
const LocationIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
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
const StarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE_URL    = import.meta.env.VITE_API_URL || "http://localhost:8080";
const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='260' viewBox='0 0 400 260'%3E%3Crect fill='%23e8e4da' width='400' height='260'/%3E%3Cpath d='M160 180 L200 120 L240 180Z' fill='%23c5bfaf'/%3E%3Crect x='175' y='155' width='50' height='25' fill='%23b0a894'/%3E%3C/svg%3E";

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
  SALE:{label:"For Sale",color:"#2a6049"},
  RENT:{label:"For Rent",color:"#5a3e2b"},
  BOTH:{label:"Sale / Rent",color:"#3a3a6b"},
}[type]||{label:type||"–",color:"#555"});
const buildImg = (src) => {
  if (!src) return null;
  return src.startsWith("http") ? src : BASE_URL + src;
};

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type="success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{position:"fixed",bottom:28,right:28,zIndex:9999,background:type==="error"?"#fee2e2":"#ecfdf5",color:type==="error"?"#b91c1c":"#047857",padding:"12px 20px",borderRadius:10,fontSize:13.5,fontWeight:500,boxShadow:"0 4px 18px rgba(0,0,0,0.12)",maxWidth:340}}>
      {msg}
    </div>
  );
}

// ─── Saved Property Card ──────────────────────────────────────────────────────
// SavedPropertyResponse fields (flat, from backend):
//   savedId, propertyId, title, type, status, listingType,
//   price, currency, bedrooms, bathrooms, areaSqm,
//   city, country, primaryImage, note, savedAt
function SavedPropertyCard({ item, viewMode, onUnsave }) {
  const badge      = listingBadge(item.listingType);
  const img        = buildImg(item.primaryImage) || PLACEHOLDER;
  const isGrid     = viewMode === "grid";
  const savedAtFmt = item.savedAt ? new Date(item.savedAt).toLocaleDateString("sq-AL") : null;

  return (
    <div
      style={{
        background:"#fff", borderRadius:"14px", overflow:"hidden",
        boxShadow:"0 2px 12px rgba(90,95,58,0.10)",
        display:isGrid?"block":"flex",
        transition:"transform 0.18s, box-shadow 0.18s",
        border:"1px solid #ede9df",
        minHeight:isGrid?"auto":"160px",
      }}
      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 8px 28px rgba(90,95,58,0.18)";}}
      onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 2px 12px rgba(90,95,58,0.10)";}}
    >
      <div style={{position:"relative",width:isGrid?"100%":"220px",minWidth:isGrid?"auto":"220px",height:isGrid?"200px":"100%",minHeight:isGrid?"200px":"160px",background:"#f0ece3",flexShrink:0}}>
        <img src={img} alt={item.title} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}} onError={e=>{e.target.src=PLACEHOLDER;}}/>
        <div style={{position:"absolute",top:"10px",left:"10px",display:"flex",gap:6}}>
          <span style={{background:badge.color,color:"#fff",fontSize:"11px",fontWeight:700,padding:"3px 9px",borderRadius:"20px"}}>{badge.label}</span>
        </div>
        {/* Red heart — DELETE /api/properties/saved/{propertyId} */}
        <button
          onClick={() => onUnsave(item.propertyId)}
          title="Hiq nga të preferuarat"
          style={{
            position:"absolute", top:"10px", right:"10px",
            background:"#e74c3c", border:"none", borderRadius:"50%",
            width:"32px", height:"32px", cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 2px 8px rgba(0,0,0,0.2)", color:"#fff",
            transition:"all 0.18s",
          }}
          onMouseEnter={e=>{e.currentTarget.style.background="#c0392b";e.currentTarget.style.transform="scale(1.1)";}}
          onMouseLeave={e=>{e.currentTarget.style.background="#e74c3c";e.currentTarget.style.transform="scale(1)";}}
        >
          <HeartIcon filled />
        </button>
        <span style={{position:"absolute",bottom:"10px",right:"10px",background:"rgba(0,0,0,0.55)",color:"#fff",fontSize:"11px",padding:"2px 8px",borderRadius:"8px",backdropFilter:"blur(4px)"}}>{typeLabel(item.type)}</span>
      </div>

      <div style={{padding:isGrid?"16px":"16px 20px",flex:1,display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
        <div>
          {(item.city||item.country)&&<div style={{display:"flex",alignItems:"center",gap:4,color:"#8a8469",fontSize:"12px",marginBottom:5}}><LocationIcon /><span>{[item.city,item.country].filter(Boolean).join(", ")}</span></div>}
          <h3 style={{margin:"0 0 7px",fontSize:isGrid?"15px":"16px",fontWeight:700,color:"#2c2c1e",lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>
            {item.title}
          </h3>
          <div style={{fontSize:isGrid?"18px":"20px",fontWeight:800,color:"#5a5f3a",marginBottom:9}}>
            {formatPrice(item.price, item.currency)}
          </div>
        </div>
        <div>
          <div style={{display:"flex",gap:"13px",color:"#6b6651",fontSize:"12.5px",flexWrap:"wrap",marginBottom:savedAtFmt?7:0}}>
            {item.bedrooms!=null&&<span style={{display:"flex",alignItems:"center",gap:4}}><BedIcon/>{item.bedrooms} bed{item.bedrooms!==1?"s":""}</span>}
            {item.bathrooms!=null&&<span style={{display:"flex",alignItems:"center",gap:4}}><BathIcon/>{item.bathrooms} bath{item.bathrooms!==1?"s":""}</span>}
            {item.areaSqm!=null&&<span style={{display:"flex",alignItems:"center",gap:4}}><AreaIcon/>{item.areaSqm} m²</span>}
          </div>
          {savedAtFmt&&<div style={{fontSize:11.5,color:"#a0997e"}}>❤️ Ruajtur më {savedAtFmt}</div>}
          {item.note&&<div style={{fontSize:12,color:"#8a8469",marginTop:4,fontStyle:"italic"}}>"{item.note}"</div>}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function SavedProperties() {
  const [items,         setItems]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [page,          setPage]          = useState(0);
  const [totalPages,    setTotalPages]    = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [viewMode,      setViewMode]      = useState("grid");
  const [toast,         setToast]         = useState(null);

  const PAGE_SIZE = 12;

  const notify = useCallback((msg, type="success") => setToast({msg,type,key:Date.now()}), []);

  // GET /api/properties/saved?page={pg}&size={PAGE_SIZE}
  // Returns Page<SavedPropertyResponse> — flat record
  const loadPage = useCallback(async (pg=0) => {
    setLoading(true);
    try {
      const res  = await api.get(`/api/properties/saved?page=${pg}&size=${PAGE_SIZE}`);
      const data = res.data;
      setItems(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
      setPage(pg);
    } catch {
      notify("Gabim gjatë ngarkimit të të preferuarave", "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => { loadPage(0); }, [loadPage]);

  // DELETE /api/properties/saved/{propertyId}
  const handleUnsave = useCallback(async (propertyId) => {
    // Optimistic removal
    setItems(prev => prev.filter(i => i.propertyId !== propertyId));
    setTotalElements(prev => prev - 1);
    try {
      await api.delete(`/api/properties/saved/${propertyId}`);
      notify("Prona u hoq nga të preferuarat");
      // Reload to fix pagination if needed
      loadPage(page);
    } catch (err) {
      // Revert
      loadPage(page);
      notify(err.response?.data?.message || "Gabim gjatë heqjes", "error");
    }
  }, [page, loadPage, notify]);

  const handlePageChange = (pg) => {
    loadPage(pg);
    window.scrollTo({top:0, behavior:"smooth"});
  };

  const gridStyle = (mode) => ({
    display: mode==="grid"?"grid":"flex",
    gridTemplateColumns: mode==="grid"?"repeat(auto-fill, minmax(280px, 1fr))":undefined,
    flexDirection: mode==="list"?"column":undefined,
    gap:"16px",
  });

  return (
    <MainLayout role="client">
      <div style={{background:"#f5f2eb",minHeight:"100vh",fontFamily:"'Georgia', serif"}}>

        {/* Hero */}
        <div style={{background:"linear-gradient(135deg, #5a5f3a 0%, #3d4228 100%)",padding:"40px 24px 36px",textAlign:"center"}}>
          <h1 style={{margin:"0 0 6px",fontSize:"28px",fontWeight:800,color:"#fff",letterSpacing:"-0.5px"}}>❤️ Pronat e Preferuara</h1>
          <p style={{margin:0,color:"#c8ccaa",fontSize:"14.5px"}}>
            {loading ? "Duke ngarkuar..." : `${totalElements} pronë të ruajtura`}
          </p>
        </div>

        <div style={{maxWidth:"1200px",margin:"0 auto",padding:"28px 24px"}}>

          {/* Toolbar */}
          {!loading && items.length > 0 && (
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:10}}>
              <span style={{color:"#8a8469",fontSize:"13.5px"}}>{totalElements} pronë të preferuara</span>
              <div style={{display:"flex",gap:4}}>
                {[{m:"grid",icon:<GridIcon/>},{m:"list",icon:<ListIcon/>}].map(({m,icon})=>(
                  <button key={m} onClick={()=>setViewMode(m)}
                    style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"7px 10px",borderRadius:"8px",border:"none",background:viewMode===m?"#5a5f3a":"#f0ece3",color:viewMode===m?"#fff":"#5a5f3a",cursor:"pointer",transition:"all 0.15s"}}>
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div style={gridStyle("grid")}>
              {Array.from({length:6}).map((_,i)=>(
                <div key={i} style={{background:"#f0ece3",borderRadius:"14px",height:"300px",animation:"pulse 1.4s ease-in-out infinite"}}/>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div style={{textAlign:"center",padding:"72px 32px",color:"#8a8469"}}>
              <div style={{fontSize:52,marginBottom:14}}>🏠</div>
              <h3 style={{color:"#5a5f3a",margin:"0 0 8px",fontSize:20}}>Nuk keni prona të ruajtura</h3>
              <p style={{margin:"0 0 22px",fontSize:14}}>Klikoni ikonën ❤️ në kartat e pronave për t'i shtuar këtu.</p>
              <a href="/client/browseproperties"
                style={{padding:"10px 26px",borderRadius:10,background:"#5a5f3a",color:"#fff",textDecoration:"none",fontSize:14,fontWeight:700,fontFamily:"inherit"}}>
                Shfleto Pronat
              </a>
            </div>
          ) : (
            <>
              <div style={gridStyle(viewMode)}>
                {items.map(item => (
                  <SavedPropertyCard
                    key={item.savedId}
                    item={item}
                    viewMode={viewMode}
                    onUnsave={handleUnsave}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:8,marginTop:32}}>
                  <button disabled={page===0} onClick={()=>handlePageChange(page-1)}
                    style={{display:"flex",alignItems:"center",justifyContent:"center",width:36,height:36,borderRadius:8,border:"1.5px solid #d9d4c7",background:page===0?"#f5f2eb":"#fff",color:page===0?"#c5bfaf":"#5a5f3a",cursor:page===0?"not-allowed":"pointer"}}>
                    <ChevronLeftIcon />
                  </button>
                  {Array.from({length:totalPages},(_,i)=>i)
                    .filter(p=>p===0||p===totalPages-1||Math.abs(p-page)<=1)
                    .map((p,i,arr)=>(
                      <span key={p} style={{display:"flex",alignItems:"center",gap:8}}>
                        {arr[i-1]!=null&&p-arr[i-1]>1&&<span style={{color:"#8a8469"}}>…</span>}
                        <button onClick={()=>handlePageChange(p)}
                          style={{width:36,height:36,borderRadius:8,border:"1.5px solid",borderColor:p===page?"#5a5f3a":"#d9d4c7",background:p===page?"#5a5f3a":"#fff",color:p===page?"#fff":"#5a5f3a",fontWeight:p===page?700:400,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
                          {p+1}
                        </button>
                      </span>
                    ))
                  }
                  <button disabled={page>=totalPages-1} onClick={()=>handlePageChange(page+1)}
                    style={{display:"flex",alignItems:"center",justifyContent:"center",width:36,height:36,borderRadius:8,border:"1.5px solid #d9d4c7",background:page>=totalPages-1?"#f5f2eb":"#fff",color:page>=totalPages-1?"#c5bfaf":"#5a5f3a",cursor:page>=totalPages-1?"not-allowed":"pointer"}}>
                    <ChevronRightIcon />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:.9} }
      `}</style>
    </MainLayout>
  );
}