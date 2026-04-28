import { useState, useEffect, useContext, useCallback } from "react";
import MainLayout from "../../components/layout/Layout";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";

import StatCard      from "../../components/agent/StatCard";
import Toast         from "../../components/agent/Toast";
import Modal         from "../../components/agent/Modal";
import PropertyForm  from "../../components/agent/PropertyForm";
import ImageManager  from "../../components/agent/ImageManager";
import PriceHistory  from "../../components/agent/PriceHistory";
import PropertyTable from "../../components/agent/PropertyTable";
import { STATUS_CONFIG } from "../../constants/propertyConstants";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  .ap * { box-sizing: border-box; }
  .ap {
    font-family: 'DM Sans', system-ui, sans-serif;
    background: #f2ede4;
    min-height: 100vh;
  }

  .ap-btn { transition: all 0.17s ease; }
  .ap-btn:hover { opacity: 0.85; transform: translateY(-1px); }

  @keyframes ap-fade-up  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes ap-scale-in { from{opacity:0;transform:scale(0.95) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes ap-toast    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes ap-spin     { to{transform:rotate(360deg)} }
  @keyframes ap-pulse    { 0%,100%{opacity:.38} 50%{opacity:.82} }
`;

// ─── Shared palette ───────────────────────────────────────────────────────────
const C = {
  bg:       "#f2ede4",
  surface:  "#faf7f2",
  dark:     "#1a1714",
  dark2:    "#2a2420",
  gold:     "#c9b87a",
  goldLight:"#e8d9a0",
  green:    "#8a7d5e",
  muted:    "#9a8c6e",
  border:   "#e8e2d6",
  border2:  "#e4ddd0",
  text:     "#1a1714",
  textSub:  "#6b6340",
  textMut:  "#b0a890",
};

// ─── Stat card — styled ───────────────────────────────────────────────────────
function LuxStatCard({ icon, label, value, accent = C.gold }) {
  return (
    <div style={{
      background: C.surface,
      border: `1.5px solid ${C.border}`,
      borderRadius: 14,
      padding: "18px 20px",
      display: "flex",
      alignItems: "center",
      gap: 14,
      boxShadow: "0 2px 12px rgba(20,16,10,0.06)",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: `${accent}18`,
        border: `1.5px solid ${accent}30`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20, flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 10, fontWeight: 600, color: C.textMut, textTransform: "uppercase", letterSpacing: "0.9px", marginBottom: 4 }}>{label}</p>
        <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: C.text, fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: "-0.5px", lineHeight: 1 }}>{value}</p>
      </div>
    </div>
  );
}

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

  return (
    <MainLayout role="agent">
      <style>{CSS}</style>
      <div className="ap">

   
        <div style={{
          background: `linear-gradient(160deg, ${C.dark} 0%, #1e1a14 45%, #241e16 100%)`,
          minHeight: 220,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 32px",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Dot texture */}
          <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(rgba(255,255,255,0.018) 1px,transparent 1px)", backgroundSize:"22px 22px", pointerEvents:"none" }}/>
          {/* Glow left */}
          <div style={{ position:"absolute", top:"-60px", left:"10%", width:300, height:300, borderRadius:"50%", background:`radial-gradient(circle,rgba(201,184,122,0.07) 0%,transparent 70%)`, pointerEvents:"none" }}/>
          {/* Glow right */}
          <div style={{ position:"absolute", bottom:"-40px", right:"10%", width:240, height:240, borderRadius:"50%", background:"radial-gradient(circle,rgba(126,184,164,0.05) 0%,transparent 70%)", pointerEvents:"none" }}/>
          {/* Gold accent line top */}
          <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:`linear-gradient(90deg,transparent,${C.gold} 30%,${C.gold} 70%,transparent)` }}/>

          <div style={{ position:"relative", zIndex:1, maxWidth:700, width:"100%", textAlign:"center" }}>
            <p style={{ margin:"0 0 8px", fontSize:10, fontWeight:600, color:C.gold, textTransform:"uppercase", letterSpacing:"2px", fontFamily:"'DM Sans',sans-serif" }}>
              Agent Dashboard
            </p>
            <h1 style={{
              margin:"0 0 10px",
              fontFamily:"'Cormorant Garamond', Georgia, serif",
              fontSize:"clamp(26px,3.5vw,40px)",
              fontWeight: 700,
              color: "#f5f0e8",
              letterSpacing: "-0.5px",
              lineHeight: 1.1,
            }}>
              My{" "}
              <span style={{
                background:`linear-gradient(90deg,${C.gold},${C.goldLight},${C.gold})`,
                backgroundSize:"200% auto",
                WebkitBackgroundClip:"text",
                WebkitTextFillColor:"transparent",
                backgroundClip:"text",
              }}>Properties</span>
            </h1>
            <p style={{ margin:"0 0 24px", fontSize:13, color:"rgba(245,240,232,0.38)", fontFamily:"'DM Sans',sans-serif", lineHeight:1.6 }}>
              Manage and track your property listings
            </p>

            {/* Add Property button */}
            <button className="ap-btn"
              onClick={() => openModal("create", null)}
              style={{
                padding:"11px 28px",
                background:`linear-gradient(135deg,${C.gold} 0%,#b0983e 100%)`,
                color:C.dark,
                border:"none",
                borderRadius:11,
                fontSize:13.5,
                fontWeight:700,
                cursor:"pointer",
                fontFamily:"'DM Sans',sans-serif",
                display:"inline-flex",
                alignItems:"center",
                gap:8,
                boxShadow:`0 6px 24px ${C.gold}30`,
              }}>
              ＋ Add Property
            </button>
          </div>
        </div>

        {/* ── Stats grid ── */}
        <div style={{ padding:"24px 28px 0", maxWidth:1440, margin:"0 auto" }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:14, marginBottom:24 }}>
            <LuxStatCard icon="🏠" label="Total Listings" value={stats.total}     accent={C.gold}   />
            <LuxStatCard icon="✅" label="Available"       value={stats.available} accent="#5aaa80"  />
            <LuxStatCard icon="🔑" label="Rented"          value={stats.rented}    accent="#7eb8d4"  />
            <LuxStatCard icon="💰" label="Sold"            value={stats.sold}      accent="#c9a87a"  />
            <LuxStatCard icon="👁" label="Total Views"     value={stats.views}     accent="#a07eb8"  />
          </div>

          {/* ── Table card ── */}
          <div style={{
            background: C.surface,
            border:`1.5px solid ${C.border}`,
            borderRadius:16,
            boxShadow:"0 4px 24px rgba(20,16,10,0.08)",
            overflow:"hidden",
            marginBottom:32,
          }}>
            <div style={{
              padding:"16px 22px",
              borderBottom:`1px solid ${C.border}`,
              display:"flex",
              alignItems:"center",
              justifyContent:"space-between",
              background:"#fdf9f4",
            }}>
              <div>
                <p style={{ margin:0, fontSize:10, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"1px", marginBottom:3 }}>Listings</p>
                <p style={{ margin:0, fontSize:18, fontWeight:700, color:C.text, fontFamily:"'Cormorant Garamond',Georgia,serif", letterSpacing:"-0.2px" }}>Property Listings</p>
              </div>
              <span style={{ fontSize:12, color:C.muted, fontFamily:"'DM Sans',sans-serif" }}>
                {properties.length} propert{properties.length !== 1 ? "ies" : "y"}
              </span>
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

        {toast && (
          <div style={{
            position:"fixed", bottom:26, right:26, zIndex:9999,
            background:C.dark,
            color:toast.type==="error"?"#f09090":"#90c8a8",
            padding:"11px 18px", borderRadius:12, fontSize:13, fontWeight:400,
            boxShadow:"0 10px 36px rgba(0,0,0,0.32)",
            border:`1px solid ${toast.type==="error"?"rgba(240,128,128,0.15)":"rgba(144,200,168,0.15)"}`,
            maxWidth:320, fontFamily:"'DM Sans',sans-serif",
            animation:"ap-toast 0.2s ease", display:"flex", alignItems:"center", gap:8,
          }}>
            <span style={{fontSize:14}}>{toast.type==="error"?"⚠️":"✅"}</span>
            {toast.msg}
          </div>
        )}
      </div>

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
        <Modal title="Change Status" onClose={closeModal}>
          <p style={{ marginBottom:20, color:"var(--text-secondary)", fontSize:13.5 }}>
            Current status of <strong>{selected.title}</strong>:&nbsp;
            <span className={`badge ${STATUS_CONFIG[selected.status]?.cls}`}>{STATUS_CONFIG[selected.status]?.label}</span>
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <button key={key} className="btn btn--secondary"
                style={{ justifyContent:"flex-start", background: selected.status===key ? "var(--brand-50)" : undefined, borderColor: selected.status===key ? "var(--brand-400)" : undefined, color: selected.status===key ? "var(--brand-600)" : undefined }}
                onClick={() => handleStatusChange(key)} disabled={saving || selected.status===key}>
                <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
                {selected.status===key && <span style={{ marginLeft:"auto", fontSize:12, color:"var(--text-muted)" }}>current</span>}
              </button>
            ))}
          </div>
        </Modal>
      )}

      {modal === "delete" && selected && (
        <Modal title="Delete Property" onClose={closeModal}>
          <div style={{ textAlign:"center", padding:"8px 0" }}>
            <div style={{ fontSize:48, marginBottom:16 }}>⚠️</div>
            <p style={{ fontWeight:600, marginBottom:8 }}>Are you sure?</p>
            <p style={{ color:"var(--text-secondary)", fontSize:13.5, marginBottom:24 }}>
              "<strong>{selected.title}</strong>" will be soft-deleted and hidden from listings.
            </p>
            <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
              <button className="btn btn--secondary" onClick={closeModal}>Cancel</button>
              <button className="btn btn--danger" onClick={handleDelete} disabled={saving}>
                {saving ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </MainLayout>
  );
}