import { useState, useEffect, useCallback, useContext } from "react";
import { AuthContext } from "../../context/AuthProvider";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";
 
import { CSS, C, validateInput, validateRejection } from "../../components/agent/saleapplications/saleAppConstants.js";
import { Toast, StatCard, SectionHeader, Pagination } from "../../components/agent/saleapplications/SaleAppUI.jsx";
import { AppDetailModal } from "../../components/agent/saleapplications/AppDetailModal.jsx";
import { ApplicationsTable } from "../../components/agent/saleapplications/ApplicationsTable.jsx";
import { ContractModal } from "../../components/agent/saleapplications/ContractModal.jsx";
 
export default function AgentSaleApplications() {
  const [activeTab, setActiveTab] = useState("my");
 
  const [myApps,      setMyApps]      = useState([]);
  const [myLoading,   setMyLoading]   = useState(false);
  const [myPage,      setMyPage]      = useState(0);
  const [myTotalP,    setMyTotalP]    = useState(0);
 
  const [listingId,       setListingId]       = useState("");
  const [listingApps,     setListingApps]     = useState([]);
  const [listingLoading,  setListingLoading]  = useState(false);
  const [listingPage,     setListingPage]     = useState(0);
  const [listingTotalP,   setListingTotalP]   = useState(0);
  const [listingSearched, setListingSearched] = useState(false);
 
  const [propertyId,       setPropertyId]       = useState("");
  const [propertyApps,     setPropertyApps]     = useState([]);
  const [propertyLoading,  setPropertyLoading]  = useState(false);
  const [propertyPage,     setPropertyPage]     = useState(0);
  const [propertyTotalP,   setPropertyTotalP]   = useState(0);
  const [propertySearched, setPropertySearched] = useState(false);
 
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [statusApps,   setStatusApps]   = useState([]);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusPage,   setStatusPage]   = useState(0);
  const [statusTotalP, setStatusTotalP] = useState(0);
 
  const [selectedApp,       setSelectedApp]       = useState(null);
  const [toast,             setToast]             = useState(null);
  const [contractPrefill,   setContractPrefill]   = useState(null);
  const [showContractModal, setShowContractModal] = useState(false);
 
  const { user } = useContext(AuthContext);
  const currentUserId = user?.id;
  const notify = useCallback((msg, type = "success") => setToast({ msg, type, key: Date.now() }), []);
 
  const fetchMyApps = useCallback(async (pg = 0) => {
    setMyLoading(true);
    try {
      const res = await api.get(`/api/sales/applications/agent/me?page=${pg}&size=15`);
      setMyApps(res.data.content || []);
      setMyTotalP(res.data.totalPages || 0);
      setMyPage(pg);
    } catch { notify("Error loading applications", "error"); }
    finally { setMyLoading(false); }
  }, [notify]);
 
  const fetchByListing = useCallback(async (pg = 0) => {
    if (!validateInput({ mode:"listing", listingId }, notify)) return;
    setListingLoading(true); setListingSearched(true);
    try {
      const res = await api.get(`/api/sales/applications/listing/${Number(listingId)}?page=${pg}&size=15`);
      setListingApps(res.data.content || []); setListingTotalP(res.data.totalPages || 0); setListingPage(pg);
    } catch { notify("Listing not found or has no applications", "error"); }
    finally { setListingLoading(false); }
  }, [listingId, notify]);
 
  const fetchByProperty = useCallback(async (pg = 0) => {
    if (!validateInput({ mode:"property", propertyId }, notify)) return;
    setPropertyLoading(true); setPropertySearched(true);
    try {
      const res = await api.get(`/api/sales/applications/property/${Number(propertyId)}?page=${pg}&size=15`);
      setPropertyApps(res.data.content || []); setPropertyTotalP(res.data.totalPages || 0); setPropertyPage(pg);
    } catch { notify("Property not found or has no applications", "error"); }
    finally { setPropertyLoading(false); }
  }, [propertyId, notify]);
 
  const fetchByStatus = useCallback(async (status = statusFilter, pg = 0) => {
    setStatusLoading(true);
    try {
      const res = await api.get(`/api/sales/applications/status/${status}?page=${pg}&size=15`);
      setStatusApps(res.data.content || []); setStatusTotalP(res.data.totalPages || 0); setStatusPage(pg);
    } catch { notify("Error filtering by status", "error"); }
    finally { setStatusLoading(false); }
  }, [statusFilter, notify]);
 
  useEffect(() => { fetchMyApps(0); }, [fetchMyApps]);
  useEffect(() => { if (contractPrefill) setShowContractModal(true); }, [contractPrefill]);
  useEffect(() => { if (activeTab === "status") fetchByStatus(statusFilter, 0); }, [activeTab]);
 
  const handleUpdateStatus = async (appId, status, reason) => {
    if (status === "REJECTED" && !validateRejection(reason, notify)) return;
    try {
      await api.patch(`/api/sales/applications/${appId}/status`, { status, rejection_reason: reason || null });
      const patch = (list) => list.map(a => a.id === appId ? { ...a, status, rejection_reason: reason || a.rejection_reason } : a);
      setMyApps(patch); setListingApps(patch); setPropertyApps(patch); setStatusApps(patch);
      if (selectedApp?.id === appId) setSelectedApp(prev => ({ ...prev, status, rejection_reason: reason || prev.rejection_reason }));
      notify(`Application #${appId} → ${status}`);
      if (status === "APPROVED") {
        const all = [...myApps, ...listingApps, ...propertyApps, ...statusApps];
        const found = all.find(a => a.id === appId);
        if (found) setContractPrefill({ ...found, status: "APPROVED" });
      }
    } catch (err) { notify(err.response?.data?.message || "Error updating status", "error"); }
  };
 
  const handleCreateContract = useCallback((app) => { setContractPrefill(app); setShowContractModal(true); }, []);
 
  const currentList =
    activeTab === "my"       ? myApps       :
    activeTab === "listing"  ? listingApps  :
    activeTab === "property" ? propertyApps :
    statusApps;
 
  const stats = {
    total:     currentList.length,
    pending:   currentList.filter(a => a.status === "PENDING").length,
    approved:  currentList.filter(a => a.status === "APPROVED").length,
    rejected:  currentList.filter(a => a.status === "REJECTED").length,
    cancelled: currentList.filter(a => a.status === "CANCELLED").length,
  };
 
  const tabConfig = [
    { id:"my",       label:"🤝 My Applications",  count:myApps.length },
    { id:"listing",  label:"📋 By Listing ID",    count:null          },
    { id:"property", label:"🏢 By Property ID",   count:null          },
    { id:"status",   label:"🔎 By Status",        count:null          },
  ];
 
  return (
    <MainLayout role="agent">
      <style>{CSS}</style>
      <div className="sa">
 
        {/* ── HERO ── */}
        <div style={{ background:`linear-gradient(160deg, ${C.dark} 0%, #1e1a14 50%, #241e16 100%)`, minHeight:200, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"36px 32px", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(rgba(255,255,255,0.018) 1px,transparent 1px)", backgroundSize:"22px 22px", pointerEvents:"none" }} />
          <div style={{ position:"absolute", top:"-60px", right:"5%", width:280, height:280, borderRadius:"50%", background:"radial-gradient(circle,rgba(201,184,122,0.07) 0%,transparent 70%)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:"-40px", left:"8%", width:200, height:200, borderRadius:"50%", background:"radial-gradient(circle,rgba(126,184,164,0.05) 0%,transparent 70%)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:`linear-gradient(90deg,transparent,${C.gold} 30%,${C.gold} 70%,transparent)` }} />
          <div style={{ position:"relative", zIndex:1, textAlign:"center", maxWidth:700, width:"100%" }}>
            <p style={{ margin:"0 0 8px", fontSize:10, fontWeight:600, color:C.gold, textTransform:"uppercase", letterSpacing:"2.5px", fontFamily:"'DM Sans',sans-serif" }}>Sales Management</p>
            <h1 style={{ margin:"0 0 10px", fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"clamp(24px,3.5vw,38px)", fontWeight:700, color:"#f5f0e8", letterSpacing:"-0.5px", lineHeight:1.1 }}>
              Sale{" "}
              <span style={{ background:`linear-gradient(90deg,${C.gold},${C.goldL},${C.gold})`, backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>Applications</span>
            </h1>
            <p style={{ margin:0, fontSize:13, color:"rgba(245,240,232,0.38)", fontFamily:"'DM Sans',sans-serif" }}>
              Manage and review purchase applications from clients
            </p>
          </div>
        </div>
 
        <div style={{ padding:"24px 28px", maxWidth:1500, margin:"0 auto" }}>
 
          {currentList.length > 0 && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(165px,1fr))", gap:14, marginBottom:24 }}>
              <StatCard icon="📋" label="Total"     value={stats.total}     accent={C.gold}    delay={0.05} />
              <StatCard icon="⏳" label="Pending"   value={stats.pending}   accent="#d97706"   delay={0.10} />
              <StatCard icon="✅" label="Approved"  value={stats.approved}  accent="#059669"   delay={0.15} />
              <StatCard icon="✕"  label="Rejected"  value={stats.rejected}  accent="#dc2626"   delay={0.20} />
              <StatCard icon="🚫" label="Cancelled" value={stats.cancelled} accent="#64748b"   delay={0.25} />
            </div>
          )}
 
          <div className="sa-card sa-section">
 
            {/* Tabs */}
            <div style={{ borderBottom:`1px solid ${C.border}`, display:"flex", overflowX:"auto", background:"#fdf9f4" }}>
              {tabConfig.map(tab => (
                <button key={tab.id} className={`sa-tab${activeTab === tab.id ? " active" : ""}`} onClick={() => setActiveTab(tab.id)}>
                  {tab.label}
                  {tab.count != null && tab.count > 0 && (
                    <span style={{ marginLeft:7, background:activeTab === tab.id ? `${C.gold}22` : "#ede9df", color:C.textSub, padding:"1px 7px", borderRadius:20, fontSize:10.5, fontWeight:600 }}>{tab.count}</span>
                  )}
                </button>
              ))}
            </div>
 
            {/* My Applications tab */}
            {activeTab === "my" && (
              <>
                <SectionHeader title="My Listing Applications" count={myApps.length}>
                  <button className="sa-btn" onClick={() => fetchMyApps(myPage)} style={{ padding:"6px 14px", borderRadius:9, background:"#f0ece3", color:C.textSub, border:`1px solid ${C.border}`, fontSize:12 }}>🔄 Refresh</button>
                </SectionHeader>
                <ApplicationsTable applications={myApps} loading={myLoading} onOpenApp={setSelectedApp} onQuickApprove={(id) => handleUpdateStatus(id,"APPROVED",null)} onQuickReject={(app) => { setSelectedApp(app); }} onCreateContract={handleCreateContract} currentUserId={currentUserId} emptyTitle="No applications yet" emptySub="Clients will apply once you publish your listings." />
                <Pagination page={myPage} totalPages={myTotalP} onChange={fetchMyApps} />
              </>
            )}
 
            {/* By Listing tab */}
            {activeTab === "listing" && (
              <>
                <SectionHeader title="Search by Listing ID" />
                <div style={{ padding:"18px 22px", display:"flex", gap:12, alignItems:"flex-end", flexWrap:"wrap", borderBottom:`1px solid ${C.border}`, background:"#faf7f2" }}>
                  <div>
                    <p style={{ margin:"0 0 7px", fontSize:11, fontWeight:600, color:C.textMut, textTransform:"uppercase", letterSpacing:"0.7px" }}>Listing ID <span style={{ color:"#ef4444" }}>*</span></p>
                    <div style={{ display:"flex", gap:10 }}>
                      <input className="sa-input" type="number" min="1" style={{ width:170, height:40 }} placeholder="e.g. 15" value={listingId} onChange={e => setListingId(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchByListing(0)} />
                      <button className="sa-btn" onClick={() => fetchByListing(0)} disabled={listingLoading}
                        style={{ padding:"0 18px", height:40, borderRadius:10, background:C.dark, color:"#f5f0e8", fontSize:13, fontWeight:500, display:"flex", alignItems:"center", gap:7 }}>
                        {listingLoading ? <><div style={{ width:13, height:13, border:"2px solid rgba(245,240,232,0.3)", borderTop:"2px solid #f5f0e8", borderRadius:"50%", animation:"sa-spin 0.7s linear infinite" }}/> Loading…</> : <>🔍 Search</>}
                      </button>
                    </div>
                  </div>
                </div>
                <ApplicationsTable applications={listingApps} loading={listingLoading} onOpenApp={setSelectedApp} onQuickApprove={(id) => handleUpdateStatus(id,"APPROVED",null)} onQuickReject={(app) => { setSelectedApp(app); }} onCreateContract={handleCreateContract} currentUserId={currentUserId} emptyTitle={listingSearched ? "No applications" : "No search yet"} emptySub={listingSearched ? `No applications found for Listing #${listingId}` : "Enter Listing ID and click Search"} />
                <Pagination page={listingPage} totalPages={listingTotalP} onChange={fetchByListing} />
              </>
            )}
 
            {/* By Property tab */}
            {activeTab === "property" && (
              <>
                <SectionHeader title="Search by Property ID" />
                <div style={{ padding:"18px 22px", display:"flex", gap:12, alignItems:"flex-end", flexWrap:"wrap", borderBottom:`1px solid ${C.border}`, background:"#faf7f2" }}>
                  <div>
                    <p style={{ margin:"0 0 7px", fontSize:11, fontWeight:600, color:C.textMut, textTransform:"uppercase", letterSpacing:"0.7px" }}>Property ID <span style={{ color:"#ef4444" }}>*</span></p>
                    <div style={{ display:"flex", gap:10 }}>
                      <input className="sa-input" type="number" min="1" style={{ width:170, height:40 }} placeholder="e.g. 7" value={propertyId} onChange={e => setPropertyId(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchByProperty(0)} />
                      <button className="sa-btn" onClick={() => fetchByProperty(0)} disabled={propertyLoading}
                        style={{ padding:"0 18px", height:40, borderRadius:10, background:C.dark, color:"#f5f0e8", fontSize:13, fontWeight:500, display:"flex", alignItems:"center", gap:7 }}>
                        {propertyLoading ? <><div style={{ width:13, height:13, border:"2px solid rgba(245,240,232,0.3)", borderTop:"2px solid #f5f0e8", borderRadius:"50%", animation:"sa-spin 0.7s linear infinite" }}/> Loading…</> : <>🔍 Search</>}
                      </button>
                    </div>
                  </div>
                </div>
                <ApplicationsTable applications={propertyApps} loading={propertyLoading} onOpenApp={setSelectedApp} onQuickApprove={(id) => handleUpdateStatus(id,"APPROVED",null)} onQuickReject={(app) => { setSelectedApp(app); }} onCreateContract={handleCreateContract} currentUserId={currentUserId} emptyTitle={propertySearched ? "No applications" : "No search yet"} emptySub={propertySearched ? `No applications found for Property #${propertyId}` : "Enter Property ID and click Search"} />
                <Pagination page={propertyPage} totalPages={propertyTotalP} onChange={fetchByProperty} />
              </>
            )}
 
            {/* By Status tab */}
            {activeTab === "status" && (
              <>
                <SectionHeader title="Filter by Status">
                  <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                    <select className="sa-select" style={{ height:36, fontSize:12.5 }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); fetchByStatus(e.target.value, 0); }}>
                      <option value="PENDING">⏳ Pending</option>
                      <option value="APPROVED">✅ Approved</option>
                      <option value="REJECTED">✕ Rejected</option>
                      <option value="CANCELLED">🚫 Cancelled</option>
                    </select>
                    <button className="sa-btn" onClick={() => fetchByStatus(statusFilter, 0)} style={{ padding:"0 14px", height:36, borderRadius:9, background:"#f0ece3", color:C.textSub, border:`1px solid ${C.border}`, fontSize:12 }}>🔄 Refresh</button>
                  </div>
                </SectionHeader>
                <ApplicationsTable applications={statusApps} loading={statusLoading} onOpenApp={setSelectedApp} onQuickApprove={(id) => handleUpdateStatus(id,"APPROVED",null)} onQuickReject={(app) => { setSelectedApp(app); }} onCreateContract={handleCreateContract} currentUserId={currentUserId} emptyTitle={`No applications with status ${statusFilter}`} emptySub="Try a different status or check back later." />
                <Pagination page={statusPage} totalPages={statusTotalP} onChange={pg => fetchByStatus(statusFilter, pg)} />
              </>
            )}
          </div>
        </div>
 
        {selectedApp && <AppDetailModal app={selectedApp} onClose={() => setSelectedApp(null)} onUpdateStatus={handleUpdateStatus} notify={notify} onCreateContract={handleCreateContract} currentUserId={currentUserId} />}
 
        {showContractModal && contractPrefill && (
          <ContractModal initial={null}
            prefill={{ propertyId:contractPrefill.property_id, listingId:contractPrefill.listing_id, price:contractPrefill.offer_price, buyerId:contractPrefill.buyer_id }}
            onClose={() => { setShowContractModal(false); setContractPrefill(null); }}
            onSuccess={() => { setShowContractModal(false); setContractPrefill(null); notify("Contract created successfully ✓"); }}
            notify={notify} />
        )}
 
        {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      </div>
    </MainLayout>
  );
}
 