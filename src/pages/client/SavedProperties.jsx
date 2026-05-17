import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";
import { PAGE_SIZE } from "../../components/client/savedproperties/savedPropertiesConstants";
import { CSS } from "../../components/client/savedproperties/savedPropertiesStyles";
import { SearchIcon, ArrowLeftIcon, HomeIcon, GridIcon, ListIcon } from "../../components/client/savedproperties/savedPropertiesIcons";
import { Toast, Skeleton, Pagination } from "../../components/client/savedproperties/savedPropertiesComponents";
import SavedCard from "../../components/client/savedproperties/SavedCard";

// ═══════════════════════════════════════════════════════════════════════════════
export default function SavedProperties() {
  const navigate = useNavigate();

  const [items,         setItems]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [page,          setPage]          = useState(0);
  const [totalPages,    setTotalPages]    = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [viewMode,      setViewMode]      = useState("grid");
  const [toast,         setToast]         = useState(null);

  const notify = useCallback((msg,type="success") => setToast({msg,type,key:Date.now()}), []);

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
    ?{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:18}
    :{display:"flex",flexDirection:"column",gap:12};

  return (
    <MainLayout role="client">
      <style>{CSS}</style>
      <div className="sp">

        {/* ══════════════════════════════════════════════════
            HERO — identical structure & minHeight:320
            ══════════════════════════════════════════════════ */}
        <div style={{
          background:"linear-gradient(160deg, #141210 0%, #1e1a14 45%, #241e16 100%)",
          minHeight:320,
          display:"flex",
          flexDirection:"column",
          alignItems:"center",
          justifyContent:"center",
          padding:"40px 32px",
          position:"relative",
          overflow:"hidden",
        }}>
          {/* Dot texture */}
          <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,0.018) 1px,transparent 1px)",backgroundSize:"22px 22px",pointerEvents:"none"}}/>
          {/* Glow orbs */}
          <div style={{position:"absolute",top:"-60px",left:"10%",width:300,height:300,borderRadius:"50%",background:"radial-gradient(circle,rgba(201,184,122,0.07) 0%,transparent 70%)",pointerEvents:"none",animation:"sp-glow 4s ease-in-out infinite"}}/>
          <div style={{position:"absolute",bottom:"-40px",right:"10%",width:240,height:240,borderRadius:"50%",background:"radial-gradient(circle,rgba(126,184,164,0.05) 0%,transparent 70%)",pointerEvents:"none",animation:"sp-glow 4s ease-in-out infinite 2s"}}/>
          {/* Gold accent line top */}
          <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:"linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)"}}/>

          {/* Back button — top left */}
          <button onClick={()=>navigate("/client/browseproperties")} className="sp-back"
            style={{
              position:"absolute",top:18,left:24,
              padding:"7px 14px",
              background:"rgba(201,184,122,0.08)",
              color:"rgba(245,240,232,0.55)",
              border:"1px solid rgba(201,184,122,0.15)",
              borderRadius:9,fontSize:11.5,fontWeight:500,
              cursor:"pointer",fontFamily:"'DM Sans',sans-serif",
              display:"flex",alignItems:"center",gap:6,zIndex:2,
              transition:"all 0.15s",
            }}>
            <ArrowLeftIcon/> Browse Properties
          </button>

          {/* Centered content */}
          <div style={{position:"relative",zIndex:1,maxWidth:700,width:"100%",textAlign:"center"}}>

            {/* Tag pill */}
            <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(201,184,122,0.1)",border:"1px solid rgba(201,184,122,0.18)",borderRadius:999,padding:"4px 14px",marginBottom:14}}>
              <span style={{width:5,height:5,borderRadius:"50%",background:"#c9b87a",display:"inline-block",boxShadow:"0 0 6px #c9b87a"}}/>
              <span style={{fontSize:10.5,fontWeight:600,color:"#c9b87a",letterSpacing:"1.2px",textTransform:"uppercase"}}>Favourites</span>
            </div>

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
              margin:"0 auto 0",
              fontSize:13.5,
              color:"rgba(245,240,232,0.38)",
              fontFamily:"'DM Sans',sans-serif",
              lineHeight:1.6,
            }}>
              {loading
                ? "Loading your collection…"
                : totalElements===0
                  ? "You haven't saved any properties yet."
                  : `${totalElements.toLocaleString()} saved propert${totalElements!==1?"ies":"y"} in your collection`
              }
            </p>

            {/* Count pill when loaded */}
            {!loading && totalElements > 0 && (
              <div style={{marginTop:20,display:"inline-flex",alignItems:"center",gap:6,background:"rgba(245,240,232,0.06)",backdropFilter:"blur(10px)",borderRadius:12,padding:"10px 20px",border:"1px solid rgba(245,240,232,0.1)",animation:"sp-fade-in 0.4s ease 0.2s both"}}>
                <span style={{fontSize:24,fontWeight:700,color:"#c9b87a",lineHeight:1,fontFamily:"'Cormorant Garamond',Georgia,serif"}}>{totalElements}</span>
                <span style={{fontSize:10,color:"rgba(245,240,232,0.35)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.8px"}}>Saved</span>
              </div>
            )}
          </div>
        </div>

        {/* ══ Toolbar — identical to BrowseProperties ══ */}
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

          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {/* Browse link */}
            <button onClick={()=>navigate("/client/browseproperties")}
              style={{padding:"5px 13px",borderRadius:9,background:"#f5f0e8",border:"1.5px solid #e8e2d6",color:"#6b6248",fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5,transition:"all 0.14s"}}>
              <SearchIcon/> Browse
            </button>
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
                    transition:"all 0.14s",
                    boxShadow:viewMode===m?"0 1px 5px rgba(0,0,0,0.08)":"none",
                    fontSize:11.5,fontFamily:"inherit",fontWeight:viewMode===m?500:400,
                  }}>
                  <I/> {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ══ Content ══ */}
        <div style={{padding:"20px 24px",maxWidth:1440,margin:"0 auto"}}>

          {loading && <Skeleton viewMode={viewMode}/>}

          {!loading && items.length===0 && (
            <div style={{textAlign:"center",padding:"88px 32px",color:"#b0a890",fontFamily:"'DM Sans',sans-serif"}}>
              <div style={{
                width:64,height:64,borderRadius:"50%",
                background:"linear-gradient(135deg,#1e1a14,#2a2420)",
                border:"1.5px solid #3a3428",
                display:"flex",alignItems:"center",justifyContent:"center",
                margin:"0 auto 20px",
                color:"#8a7d5e",
              }}>
                <HomeIcon/>
              </div>
              <p style={{fontSize:20,fontWeight:700,color:"#4a4438",marginBottom:6,fontFamily:"'Cormorant Garamond',Georgia,serif",letterSpacing:"-0.2px"}}>
                No saved properties yet
              </p>
              <p style={{fontSize:13,marginBottom:28,color:"#b0a890",lineHeight:1.6}}>
                Tap the ❤ on any listing while browsing to save it here.
              </p>
              <button onClick={()=>navigate("/client/browseproperties")}
                style={{
                  padding:"12px 28px",
                  background:"linear-gradient(135deg,#c9b87a,#b0983e)",
                  color:"#1a1714",
                  border:"none",borderRadius:11,fontSize:13.5,fontWeight:700,
                  cursor:"pointer",fontFamily:"inherit",
                  display:"inline-flex",alignItems:"center",gap:8,
                  boxShadow:"0 6px 24px rgba(201,184,122,0.28)",
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
                    key={item.savedId??item.propertyId}
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