import { useState, useEffect, useContext, useCallback } from "react";
import MainLayout from "../../components/layout/Layout";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";
 
import StatCard      from "../../components/agent/properties/StatCard";
import Toast         from "../../components/agent/properties/Toast";
import Modal         from "../../components/agent/properties/Modal";
import PropertyForm  from "../../components/agent/properties/PropertyForm";
import ImageManager  from "../../components/agent/properties/ImageManager";
import PriceHistory  from "../../components/agent/properties/PriceHistory";
import PropertyTable from "../../components/agent/properties/PropertyTable";
import { STATUS_CONFIG } from "../../constants/propertyConstants";
 
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
 
  .ap * { box-sizing: border-box; }
  .ap { font-family: 'DM Sans', system-ui, sans-serif; background: #f2ede4; min-height: 100vh; }
 
  .ap-card { transition: transform 0.22s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.22s ease; }
  .ap-card:hover { transform: translateY(-4px); box-shadow: 0 20px 48px rgba(20,16,10,0.13) !important; }
  .ap-btn { transition: all 0.17s ease; }
  .ap-btn:hover:not(:disabled) { opacity: 0.86; transform: translateY(-1px); }
 
  @keyframes ap-fade-up  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes ap-scale-in { from{opacity:0;transform:scale(0.95) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes ap-spin     { to{transform:rotate(360deg)} }
  @keyframes ap-toast    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes ap-shimmer  { 0%{background-position:-800px 0} 100%{background-position:800px 0} }
  @keyframes ap-glow     { 0%,100%{opacity:0.07} 50%{opacity:0.14} }
`;
 
export default function AgentProperties() {
  const { user } = useContext(AuthContext);
 
  const [properties, setProperties] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState(null);
  const [toast,      setToast]      = useState(null);
  const [modal,      setModal]      = useState(null);
  const [selected,   setSelected]   = useState(null);
  const [page,       setPage]       = useState(0);
  const [totalPages, setTotalPages] = useState(0);
 
  const showToast  = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };
  const closeModal = () => { setModal(null); setSelected(null); };
  const openModal  = (type, prop) => { setSelected(prop); setModal(type); };
 
  const fetchProperties = useCallback(async (p = 0) => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/properties/agent/${user.id}`, { params: { page: p, size: 10 } });
      setProperties(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setPage(p);
    } catch { setError("Could not load properties."); }
    finally { setLoading(false); }
  }, [user?.id]);
 
  useEffect(() => { fetchProperties(0); }, [fetchProperties]);
 
  const stats = {
    total:     properties.length,
    available: properties.filter(p => p.status === "AVAILABLE").length,
    rented:    properties.filter(p => p.status === "RENTED").length,
    sold:      properties.filter(p => p.status === "SOLD").length,
    views:     properties.reduce((s, p) => s + (p.view_count || 0), 0),
  };
 
  const handleCreate = async (data) => {
    setSaving(true);
    try { await api.post("/api/properties", data); showToast("Property created!"); closeModal(); fetchProperties(0); }
    catch (e) { showToast(e.response?.data?.message || "Create failed", "error"); }
    finally { setSaving(false); }
  };
 
  const handleEdit = async (data) => {
    setSaving(true);
    try { await api.put(`/api/properties/${selected.id}`, data); showToast("Property updated!"); closeModal(); fetchProperties(page); }
    catch (e) { showToast(e.response?.data?.message || "Update failed", "error"); }
    finally { setSaving(false); }
  };
 
  const handleStatusChange = async (newStatus) => {
    setSaving(true);
    try { await api.patch(`/api/properties/${selected.id}/status`, { status: newStatus }); showToast("Status updated!"); closeModal(); fetchProperties(page); }
    catch (e) { showToast(e.response?.data?.message || "Failed", "error"); }
    finally { setSaving(false); }
  };
 
  const handleDelete = async () => {
    setSaving(true);
    try { await api.delete(`/api/properties/${selected.id}`); showToast("Property deleted."); closeModal(); fetchProperties(0); }
    catch (e) { showToast(e.response?.data?.message || "Delete failed", "error"); }
    finally { setSaving(false); }
  };
 
  const STAT_ITEMS = [
    { emoji:"🏠", label:"Total Listings", value:stats.total,     dot:"#c9b87a" },
    { emoji:"✅", label:"Available",       value:stats.available, dot:"#7eb8a4" },
    { emoji:"🔑", label:"Rented",          value:stats.rented,    dot:"#7eb8a4" },
    { emoji:"💰", label:"Sold",            value:stats.sold,      dot:"#c9b87a" },
    { emoji:"👁",  label:"Total Views",    value:stats.views,     dot:"#a4b07e" },
  ];
 
  return (
    <MainLayout role="agent">
      <style>{CSS}</style>
      <div className="ap">
 
        {/* ── Hero ── */}
        <div style={{
          background:"linear-gradient(160deg,#141210 0%,#1e1a14 45%,#241e16 100%)",
          minHeight:280, display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center",
          padding:"36px 32px", position:"relative", overflow:"hidden",
        }}>
          <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,0.018) 1px,transparent 1px)",backgroundSize:"22px 22px",pointerEvents:"none"}}/>
          <div style={{position:"absolute",top:"-60px",left:"10%",width:280,height:280,borderRadius:"50%",background:"radial-gradient(circle,rgba(201,184,122,0.07) 0%,transparent 70%)",pointerEvents:"none",animation:"ap-glow 4s ease-in-out infinite"}}/>
          <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:"linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)"}}/>
 
          <div style={{position:"relative",zIndex:1,maxWidth:700,width:"100%",textAlign:"center"}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(201,184,122,0.1)",border:"1px solid rgba(201,184,122,0.18)",borderRadius:999,padding:"4px 14px",marginBottom:14}}>
              <span style={{width:5,height:5,borderRadius:"50%",background:"#c9b87a",display:"inline-block",boxShadow:"0 0 6px #c9b87a"}}/>
              <span style={{fontSize:10.5,fontWeight:600,color:"#c9b87a",letterSpacing:"1.2px",textTransform:"uppercase"}}>Agent Panel</span>
            </div>
            <h1 style={{margin:"0 0 10px",fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"clamp(26px,4vw,42px)",fontWeight:700,color:"#f5f0e8",letterSpacing:"-0.7px",lineHeight:1.1}}>
              My{" "}
              <span style={{background:"linear-gradient(90deg,#c9b87a,#e8d9a0,#c9b87a)",backgroundSize:"200% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Properties</span>
            </h1>
            <p style={{margin:"0 auto 24px",fontSize:13.5,color:"rgba(245,240,232,0.38)",fontFamily:"'DM Sans',sans-serif",lineHeight:1.6}}>
              Manage and track your property listings
            </p>
            <button className="ap-btn" onClick={() => openModal("create", null)}
              style={{display:"inline-flex",alignItems:"center",gap:8,background:"linear-gradient(135deg,#c9b87a 0%,#b0983e 100%)",color:"#1a1714",border:"none",borderRadius:11,padding:"11px 24px",fontSize:13.5,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 6px 22px rgba(201,184,122,0.25)"}}>
              <span style={{fontSize:16}}>+</span> Add Property
            </button>
 
            {!loading && properties.length > 0 && (
              <div style={{display:"flex",gap:8,maxWidth:520,margin:"22px auto 0",justifyContent:"center",flexWrap:"wrap"}}>
                {STAT_ITEMS.map(s => (
                  <div key={s.label} style={{background:"rgba(245,240,232,0.06)",backdropFilter:"blur(10px)",borderRadius:12,padding:"9px 16px",border:"1px solid rgba(245,240,232,0.09)",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                    <span style={{fontSize:20,fontWeight:700,color:s.dot,lineHeight:1,fontFamily:"'Cormorant Garamond',Georgia,serif"}}>{s.value}</span>
                    <span style={{fontSize:9.5,color:"rgba(245,240,232,0.3)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.8px"}}>{s.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
 
        {/* ── Toolbar ── */}
        <div style={{background:"#fff",borderBottom:"1.5px solid #e8e2d6",padding:"0 28px",height:46,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,fontFamily:"'DM Sans',sans-serif",position:"sticky",top:0,zIndex:100,boxShadow:"0 1px 10px rgba(20,16,10,0.05)"}}>
          <p style={{margin:0,fontSize:12.5,color:"#9a8c6e"}}>
            {loading ? "Loading…" : `${properties.length} propert${properties.length !== 1 ? "ies" : "y"}`}
          </p>
          <button className="ap-btn" onClick={() => openModal("create", null)}
            style={{padding:"5px 14px",borderRadius:9,background:"linear-gradient(135deg,#c9b87a,#b0983e)",color:"#1a1714",border:"none",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:5}}>
            + Add Property
          </button>
        </div>
 
        {/* ── Content ── */}
        <div style={{padding:"20px 24px",maxWidth:1440,margin:"0 auto"}}>
          {error && (
            <div style={{background:"#fff8f5",border:"1.5px solid #f5c6a0",borderRadius:12,padding:"13px 16px",color:"#7a3a1a",fontSize:13,marginBottom:18,display:"flex",alignItems:"center",gap:10,fontFamily:"'DM Sans',sans-serif"}}>
              ⚠️ {error}
              <button onClick={() => fetchProperties(0)} style={{background:"#1a1714",color:"#f5f0e8",border:"none",borderRadius:8,padding:"5px 13px",cursor:"pointer",fontSize:12,fontFamily:"inherit",marginLeft:"auto"}}>Retry</button>
            </div>
          )}
 
          {/* Properties Table Card */}
          <div style={{background:"#fff",borderRadius:14,border:"1.5px solid #ece6da",boxShadow:"0 2px 16px rgba(20,16,10,0.07)",overflow:"hidden",fontFamily:"'DM Sans',sans-serif"}}>
            <div style={{padding:"16px 22px",borderBottom:"1.5px solid #e8e2d6",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontWeight:700,fontSize:17,color:"#1a1714",letterSpacing:"-0.2px"}}>Property Listings</span>
              {properties.length > 0 && (
                <span style={{background:"rgba(201,184,122,0.1)",color:"#c9b87a",border:"1px solid rgba(201,184,122,0.22)",borderRadius:999,padding:"2px 10px",fontSize:10.5,fontWeight:700}}>
                  {properties.length} listings
                </span>
              )}
            </div>
            <PropertyTable
              properties={properties}
              page={page}
              totalPages={totalPages}
              onPageChange={fetchProperties}
              onAction={openModal}
              loading={loading}
              error={error}
              onRetry={() => fetchProperties(0)}
            />
          </div>
        </div>
      </div>
 
      {toast && <Toast msg={toast.msg} type={toast.type} />}
 
      {modal === "create" && (
        <Modal title="Add New Property" onClose={closeModal} wide>
          <PropertyForm onSubmit={handleCreate} loading={saving} />
        </Modal>
      )}
 
      {modal === "edit" && selected && (
        <Modal title={`Edit: ${selected.title}`} onClose={closeModal} wide>
          <PropertyForm initial={selected} onSubmit={handleEdit} loading={saving} />
        </Modal>
      )}
 
      {modal === "images"  && selected && <ImageManager property={selected} onClose={closeModal} />}
      {modal === "history" && selected && <PriceHistory propertyId={selected.id} onClose={closeModal} />}
 
      {modal === "status" && selected && (
        <AgentModal title="Change Status" onClose={closeModal}>
          <p style={{marginBottom:16,color:"#9a8c6e",fontSize:13.5}}>
            Current status of <strong style={{color:"#1a1714"}}>{selected.title}</strong>
          </p>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <button key={key}
                onClick={() => handleStatusChange(key)} disabled={saving || selected.status===key}
                style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:10,border:`1.5px solid ${selected.status===key?"#8a7d5e":"#e4ddd0"}`,background:selected.status===key?"#1a1714":"transparent",color:selected.status===key?"#f5f0e8":"#6b6248",cursor:selected.status===key?"default":"pointer",fontSize:13,fontFamily:"'DM Sans',sans-serif",fontWeight:selected.status===key?600:400,transition:"all 0.15s"}}>
                <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
                {selected.status===key && <span style={{marginLeft:"auto",fontSize:11,color:"#c9b87a"}}>current</span>}
              </button>
            ))}
          </div>
        </AgentModal>
      )}
 
      {modal === "delete" && selected && (
        <AgentModal title="Delete Property" onClose={closeModal}>
          <div style={{textAlign:"center",padding:"8px 0"}}>
            <div style={{fontSize:44,marginBottom:14}}>⚠️</div>
            <p style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontWeight:700,fontSize:18,marginBottom:8,color:"#1a1714"}}>Are you sure?</p>
            <p style={{color:"#9a8c6e",fontSize:13.5,marginBottom:24}}>
              "<strong style={{color:"#1a1714"}}>{selected.title}</strong>" will be soft-deleted and hidden from listings.
            </p>
            <div style={{display:"flex",gap:10,justifyContent:"center"}}>
              <button onClick={closeModal} style={BTN_SEC}>Cancel</button>
              <button onClick={handleDelete} disabled={saving} style={BTN_DANGER}>{saving ? "Deleting…" : "Yes, Delete"}</button>
            </div>
          </div>
        </AgentModal>
      )}
    </MainLayout>
  );
}
 
/* ── Inline Modal for status/delete (dark-themed) ── */
function AgentModal({ title, onClose, children }) {
  useEffect(() => {
    const h = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [onClose]);
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(8,6,4,0.84)",backdropFilter:"blur(14px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{width:"100%",maxWidth:480,background:"#faf7f2",borderRadius:18,boxShadow:"0 44px 100px rgba(0,0,0,0.55)",animation:"ap-scale-in 0.26s ease",overflow:"hidden"}}>
        <div style={{background:"linear-gradient(160deg,#141210 0%,#1e1a14 45%,#241e16 100%)",padding:"18px 24px",borderBottom:"1px solid rgba(201,184,122,0.14)",display:"flex",alignItems:"center",justifyContent:"space-between",position:"relative"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:"linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)"}}/>
          <span style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontWeight:700,fontSize:17,color:"#f5f0e8"}}>{title}</span>
          <button onClick={onClose} style={{background:"rgba(245,240,232,0.08)",border:"1px solid rgba(245,240,232,0.12)",borderRadius:8,width:30,height:30,cursor:"pointer",color:"rgba(245,240,232,0.6)",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
        <div style={{padding:"22px 24px"}}>{children}</div>
      </div>
    </div>
  );
}
 
const BTN_SEC = {padding:"10px 20px",borderRadius:10,border:"1.5px solid #e4ddd0",background:"transparent",color:"#6b6248",fontWeight:500,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"};
const BTN_DANGER = {padding:"10px 20px",borderRadius:10,border:"none",background:"#8b3a1c",color:"#f5f0e8",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"};
 