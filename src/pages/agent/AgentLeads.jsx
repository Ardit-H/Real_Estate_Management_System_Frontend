import { useState, useEffect, useCallback, useContext } from "react";
import MainLayout from "../../components/layout/Layout";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";
 
import { LEAD_STATUSES, CSS, INP_S, SEL_S, BTN_PRI, BTN_SEC } from "../../components/agent/leads/leadsConstants.js";
import { Toast, Loader, EmptyState, Pagination } from "../../components/agent/leads/LeadsUI.jsx";
import { LeadRow } from "../../components/agent/leads/LeadRow.jsx";
import { LeadDetailModal } from "../../components/agent/leads/LeadDetailModal.jsx";
import { CompleteModal } from "../../components/agent/leads/CompleteModal.jsx";
 
export default function AgentLeads() {
  const { user } = useContext(AuthContext);
 
  const [activeTab,      setActiveTab]      = useState("my");
  const [leads,          setLeads]          = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [statusLoading,  setStatusLoading]  = useState(false);
  const [page,           setPage]           = useState(0);
  const [totalPages,     setTotalPages]     = useState(0);
  const [statusFilter,   setStatusFilter]   = useState("NEW");
  const [propertyId,     setPropertyId]     = useState("");
  const [selectedLead,   setSelectedLead]   = useState(null);
  const [completeTarget, setCompleteTarget] = useState(null);
  const [toast,          setToast]          = useState(null);
  const [stats,          setStats]          = useState({ new:0, inProgress:0, done:0, rejected:0 });
 
  const notify = useCallback((msg, type = "success") => setToast({ msg, type, key: Date.now() }), []);
 
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      let url;
      if (activeTab === "my")       url = `/api/leads/my/agent?page=${page}&size=15`;
      else if (activeTab === "all") url = `/api/leads?status=${statusFilter}&page=${page}&size=15`;
      else { setLoading(false); return; }
 
      const res  = await api.get(url);
      const data = res.data;
      if (data.content !== undefined) { setLeads(data.content || []); setTotalPages(data.totalPages || 0); }
      else { setLeads(Array.isArray(data) ? data : []); setTotalPages(1); }
    } catch { notify("Error loading leads", "error"); }
    finally  { setLoading(false); }
  }, [activeTab, page, statusFilter, notify]);
 
  useEffect(() => { if (activeTab !== "property") fetchLeads(); }, [fetchLeads, activeTab]);
 
  useEffect(() => {
    if (activeTab === "my") {
      setStats({
        new:        leads.filter((l) => l.status === "NEW").length,
        inProgress: leads.filter((l) => l.status === "IN_PROGRESS").length,
        done:       leads.filter((l) => l.status === "DONE").length,
        rejected:   leads.filter((l) => l.status === "REJECTED").length,
      });
    }
  }, [leads, activeTab]);
 
  const fetchByProperty = async () => {
    if (!propertyId) { notify("Enter Property ID", "error"); return; }
    setLoading(true);
    try {
      const res = await api.get(`/api/leads/property/${propertyId}`);
      setLeads(Array.isArray(res.data) ? res.data : []);
      setTotalPages(1);
    } catch { notify("Property not found", "error"); }
    finally { setLoading(false); }
  };
 
  const handleStatusChange = async (id, newStatus) => {
    setStatusLoading(true);
    try {
      await api.patch(`/api/leads/${id}/status`, { status: newStatus });
      notify(`Lead #${id} → ${newStatus}`);
      setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status: newStatus } : l));
      if (selectedLead?.id === id) setSelectedLead((prev) => ({ ...prev, status: newStatus }));
    } catch (err) { notify(err.response?.data?.message || "Error", "error"); }
    finally { setStatusLoading(false); }
  };
 
  const handleDecline = async (id) => {
    setStatusLoading(true);
    try {
      await api.patch(`/api/leads/${id}/decline`);
      notify(`Lead #${id} returned to admin`);
      setLeads((prev) => prev.filter((l) => l.id !== id));
      if (selectedLead?.id === id) setSelectedLead(null);
    } catch (err) { notify(err.response?.data?.message || "Error during decline", "error"); }
    finally { setStatusLoading(false); }
  };
 
  const handleCompleteConfirm = async (lead, shouldCreateProperty, propertyData) => {
    setStatusLoading(true);
    try {
      if (shouldCreateProperty && propertyData && user?.id) {
        const propPayload = {
          agent_id:      user.id,
          title:         propertyData.title,
          type:          propertyData.type || propertyData.property_type || "APARTMENT",
          status:        "AVAILABLE",
          listing_type:  lead.type === "RENT" ? "RENT" : "SALE",
          description:   propertyData.description || null,
          price:         propertyData.price         ? Number(propertyData.price)         : null,
          price_per_sqm: propertyData.price_per_sqm ? Number(propertyData.price_per_sqm) : null,
          currency:      propertyData.currency || "EUR",
          area_sqm:      propertyData.area_sqm      ? Number(propertyData.area_sqm)      : null,
          bedrooms:      propertyData.bedrooms       ? Number(propertyData.bedrooms)      : null,
          bathrooms:     propertyData.bathrooms      ? Number(propertyData.bathrooms)     : null,
          floor:         propertyData.floor          ? Number(propertyData.floor)         : null,
          total_floors:  propertyData.total_floors   ? Number(propertyData.total_floors)  : null,
          year_built:    propertyData.year_built     ? Number(propertyData.year_built)    : null,
          address: propertyData.city ? { city: propertyData.city, street: propertyData.street || null } : null,
        };
        try {
          const propRes       = await api.post("/api/properties", propPayload);
          const newPropertyId = propRes.data.id;
          await api.patch(`/api/leads/${lead.id}/property`, { property_id: newPropertyId });
          notify(`✓ Lead #${lead.id} closed + Property "${propertyData.title}" (ID: #${newPropertyId}) added and linked!`);
        } catch (propErr) {
          console.warn("Property creation/linking failed:", propErr);
          notify(`Lead closed but property was not created: ${propErr.response?.data?.message || "error"}`, "error");
        }
      }
 
      await api.patch(`/api/leads/${lead.id}/status`, { status: "DONE" });
      if (!shouldCreateProperty) notify(`Lead #${lead.id} → DONE`);
      setLeads((prev) => prev.map((l) => l.id === lead.id ? { ...l, status: "DONE" } : l));
      if (selectedLead?.id === lead.id) setSelectedLead((prev) => ({ ...prev, status: "DONE" }));
      setCompleteTarget(null);
    } catch (err) {
      notify(err.response?.data?.message || "Error during Complete", "error");
    } finally {
      setStatusLoading(false);
    }
  };
 
  const handleTabChange = (tab) => { setActiveTab(tab); setPage(0); setLeads([]); };
  const isMyLeadsTab    = activeTab === "my";
 
  const STAT_ITEMS = [
    { label:"New",         value:stats.new,        dot:"#c9b87a" },
    { label:"In Progress", value:stats.inProgress, dot:"#7eb8a4" },
    { label:"Done",        value:stats.done,        dot:"#a4b07e" },
    { label:"Rejected",    value:stats.rejected,   dot:"#c07050" },
  ];
 
  return (
    <MainLayout role="agent">
      <style>{CSS}</style>
      <div className="al">
 
        {/* ── Hero ── */}
        <div style={{ background:"linear-gradient(160deg,#141210 0%,#1e1a14 45%,#241e16 100%)", minHeight:280, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"36px 32px", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(rgba(255,255,255,0.018) 1px,transparent 1px)", backgroundSize:"22px 22px", pointerEvents:"none" }} />
          <div style={{ position:"absolute", top:"-60px", left:"10%", width:260, height:260, borderRadius:"50%", background:"radial-gradient(circle,rgba(201,184,122,0.07) 0%,transparent 70%)", pointerEvents:"none", animation:"al-glow 4s ease-in-out infinite" }} />
          <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:"linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)" }} />
          <div style={{ position:"relative", zIndex:1, maxWidth:700, width:"100%", textAlign:"center" }}>
            <h1 style={{ margin:"0 0 10px", fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"clamp(26px,4vw,42px)", fontWeight:700, color:"#f5f0e8", letterSpacing:"-0.7px" }}>
              Leads{" "}
              <span style={{ background:"linear-gradient(90deg,#c9b87a,#e8d9a0,#c9b87a)", backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>Management</span>
            </h1>
            <p style={{ margin:"0 auto 20px", fontSize:13.5, color:"rgba(245,240,232,0.38)" }}>Manage client requests and track progress</p>
 
            {isMyLeadsTab && leads.length > 0 && (
              <div style={{ display:"flex", gap:8, maxWidth:440, margin:"0 auto", justifyContent:"center", flexWrap:"wrap" }}>
                {STAT_ITEMS.map((s) => (
                  <div key={s.label} style={{ background:"rgba(245,240,232,0.06)", backdropFilter:"blur(10px)", borderRadius:12, padding:"9px 16px", border:"1px solid rgba(245,240,232,0.09)", display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                    <span style={{ fontSize:22, fontWeight:700, color:s.dot, lineHeight:1, fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{s.value}</span>
                    <span style={{ fontSize:9.5, color:"rgba(245,240,232,0.3)", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.8px" }}>{s.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
 
        {/* ── Flow guide ── */}
        <div style={{ background:isMyLeadsTab ? "#edf6f3" : "#f5f0e6", borderBottom:`1.5px solid ${isMyLeadsTab ? "#c8e8de" : "#e8dfc8"}`, padding:"10px 28px", display:"flex", alignItems:"center", gap:6, fontSize:12.5, flexWrap:"wrap" }}>
          {isMyLeadsTab ? (
            <>
              <span style={{ color:"#4a7a6a", fontWeight:500 }}>NEW</span>
              <span style={{ color:"#9ab8b0" }}>→</span>
              <span style={{ color:"#2a6049", fontWeight:700 }}>▶ Accept</span>
              <span style={{ color:"#9ab8b0" }}>→</span>
              <span style={{ color:"#4a7a6a", fontWeight:500 }}>IN_PROGRESS</span>
              <span style={{ color:"#9ab8b0" }}>→</span>
              <span style={{ color:"#2a6049", fontWeight:700 }}>✓ Complete</span>
              <span style={{ color:"#9ab8b0" }}>→</span>
              <span style={{ color:"#4a7a6a", fontWeight:500 }}>DONE + property created</span>
              <span style={{ color:"#c8d8d0", margin:"0 4px" }}>|</span>
              <span style={{ color:"#8b4030", fontWeight:700 }}>↩ Decline</span>
              <span style={{ color:"#9ab8b0" }}>→ to admin</span>
              <span style={{ color:"#c8d8d0", margin:"0 4px" }}>|</span>
              <span style={{ color:"#8b4030", fontWeight:700 }}>✕ Reject</span>
              <span style={{ color:"#9ab8b0" }}>→ REJECTED (final)</span>
            </>
          ) : (
            <span style={{ color:"#7a6a50" }}>
              ℹ️ <strong style={{ color:"#4a3a20" }}>NEW</strong> leads are waiting for admin assignment. Manage from the <strong style={{ color:"#4a3a20" }}>My Leads</strong> tab.
            </span>
          )}
        </div>
 
        {/* ── Toolbar ── */}
        <div style={{ background:"#fff", borderBottom:"1.5px solid #e8e2d6", padding:"0 28px", height:46, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, fontFamily:"'DM Sans',sans-serif", position:"sticky", top:0, zIndex:100, boxShadow:"0 1px 10px rgba(20,16,10,0.05)" }}>
          <div style={{ display:"flex", gap:0 }}>
            {[
              { id:"my",       label:"My Leads",    icon:"👤" },
              { id:"all",      label:"All Leads",   icon:"📋" },
              { id:"property", label:"By Property", icon:"🏠" },
            ].map((t) => (
              <button key={t.id} onClick={() => handleTabChange(t.id)} style={{ padding:"0 16px", height:46, border:"none", borderBottom:activeTab===t.id ? "2.5px solid #c9b87a" : "2.5px solid transparent", background:"none", color:activeTab===t.id ? "#1a1714" : "#9a8c6e", fontWeight:activeTab===t.id ? 600 : 400, fontSize:13, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", gap:5, transition:"color .15s" }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            {activeTab === "all" && (
              <select className="al-in" style={{ ...SEL_S, width:140, height:32, padding:"0 10px", fontSize:12.5 }} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
                {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            )}
            {activeTab === "property" && (
              <>
                <input className="al-in" style={{ ...INP_S, width:130, height:32, padding:"0 10px", fontSize:12.5 }} type="number" placeholder="Property ID..." value={propertyId} onChange={(e) => setPropertyId(e.target.value)} onKeyDown={(e) => e.key === "Enter" && fetchByProperty()} />
                <button style={{ ...BTN_PRI, padding:"5px 14px", fontSize:12.5 }} onClick={fetchByProperty}>Search</button>
              </>
            )}
          </div>
        </div>
 
        {/* ── Content ── */}
        <div style={{ padding:"20px 24px", maxWidth:1440, margin:"0 auto" }}>
          <div style={{ background:"#fff", borderRadius:14, border:"1.5px solid #ece6da", boxShadow:"0 2px 16px rgba(20,16,10,0.07)", overflow:"hidden" }}>
            <div style={{ padding:"14px 20px", borderBottom:"1.5px solid #e8e2d6", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontWeight:700, fontSize:17, color:"#1a1714" }}>
                {activeTab==="my" ? "My Assigned Leads" : activeTab==="all" ? `All Leads — ${statusFilter}` : "Leads by Property"}
              </span>
              {leads.length > 0 && (
                <span style={{ background:"rgba(201,184,122,0.10)", color:"#c9b87a", border:"1px solid rgba(201,184,122,0.22)", borderRadius:999, padding:"2px 10px", fontSize:10.5, fontWeight:700 }}>
                  {leads.length} leads
                </span>
              )}
            </div>
 
            {loading ? (
              <Loader />
            ) : leads.length === 0 ? (
              <EmptyState
                icon={activeTab === "property" ? "🔍" : "📭"}
                text={activeTab === "property" ? "Enter Property ID and click Search" : "No leads in this category"}
                subtext={activeTab === "my" ? "Leads will appear when the admin assigns them to you" : undefined}
              />
            ) : (
              <>
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <thead>
                      <tr style={{ background:"#faf7f2" }}>
                        {["#", "Type", "Client", "Property", ...(!isMyLeadsTab ? ["Agent"] : []), "Source", "Status", "Created", "Actions"].map((h) => (
                          <th key={h} style={{ textAlign:"left", fontSize:10.5, fontWeight:600, color:"#b0a890", textTransform:"uppercase", letterSpacing:"0.8px", padding:"10px 16px", borderBottom:"1.5px solid #e8e2d6", whiteSpace:"nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map((lead) => (
                        <LeadRow key={lead.id} lead={lead} onView={setSelectedLead} onStatusChange={handleStatusChange} onDecline={handleDecline} onCompleteClick={setCompleteTarget} statusLoading={statusLoading} isMyLead={isMyLeadsTab} />
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
              </>
            )}
          </div>
        </div>
      </div>
 
      {selectedLead && (
        <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLead(null)} onStatusChange={handleStatusChange} onDecline={handleDecline} onCompleteClick={setCompleteTarget} statusLoading={statusLoading} isMyLead={isMyLeadsTab} />
      )}
      {completeTarget && (
        <CompleteModal lead={completeTarget} onClose={() => setCompleteTarget(null)} onConfirm={handleCompleteConfirm} loading={statusLoading} />
      )}
      {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </MainLayout>
  );
}
 