import { useState, useEffect, useCallback } from "react";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";
 
import { LEAD_STATUSES, STATUS_STYLE, TYPE_ICON, SOURCE_ICON, fmtDate, C, CSS } from "../../components/admin/leads/leadsConstants.js";
import { Toast, Loader, EmptyState, StatusBadge, Pagination } from "../../components/admin/leads/LeadsUI.jsx";
import { AssignModal, StatusModal, LeadDetailModal } from "../../components/admin/leads/LeadsModals.jsx";
 
export default function AdminLeads() {
  const [activeTab,    setActiveTab]    = useState("all");
  const [leads,        setLeads]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [page,         setPage]         = useState(0);
  const [totalPages,   setTotalPages]   = useState(0);
  const [statusFilter, setStatusFilter] = useState("NEW");
  const [propertyId,   setPropertyId]   = useState("");
  const [selectedLead, setSelectedLead] = useState(null);
  const [assignTarget, setAssignTarget] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [toast,        setToast]        = useState(null);
 
  const notify = useCallback((msg, type = "success") =>
    setToast({ msg, type, key: Date.now() }), []);
 
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (activeTab === "all") {
        res = await api.get(`/api/leads?status=${statusFilter}&page=${page}&size=15`);
        setLeads(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
      } else if (activeTab === "unassigned") {
        res = await api.get("/api/leads/unassigned");
        setLeads(Array.isArray(res.data) ? res.data : []);
        setTotalPages(1);
      } else {
        setLoading(false);
        return;
      }
    } catch {
      notify("Error loading leads", "error");
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, statusFilter, notify]);
 
  useEffect(() => {
    if (activeTab !== "property") fetchLeads();
  }, [fetchLeads, activeTab]);
 
  const fetchByProperty = async () => {
    if (!propertyId) { notify("Enter Property ID", "error"); return; }
    setLoading(true);
    try {
      const res = await api.get(`/api/leads/property/${propertyId}`);
      setLeads(Array.isArray(res.data) ? res.data : []);
      setTotalPages(1);
    } catch {
      notify("Property not found", "error");
    } finally {
      setLoading(false);
    }
  };
 
  const handleSuccess = (msg) => {
    setAssignTarget(null);
    setStatusTarget(null);
    fetchLeads();
    notify(msg);
  };
 
  return (
    <MainLayout role="admin">
      <style>{CSS}</style>
      <div className="al">
 
        {/* ── HERO ── */}
        <div style={{ background: "linear-gradient(160deg,#1a1714 0%,#1e1a14 50%,#241e16 100%)", minHeight: 180, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "36px 32px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.018) 1px,transparent 1px)", backgroundSize: "22px 22px", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg,transparent,${C.gold} 30%,${C.gold} 70%,transparent)` }} />
          <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
            <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 600, color: C.gold, textTransform: "uppercase", letterSpacing: "2.5px" }}>Admin · CRM</p>
            <h1 style={{ margin: "0 0 8px", fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "clamp(24px,3vw,36px)", fontWeight: 700, color: "#f5f0e8", letterSpacing: "-0.4px" }}>
              Leads{" "}
              <span style={{ background: `linear-gradient(90deg,${C.gold},${C.goldL})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Management</span>
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(245,240,232,.38)" }}>
              Manage all requests, assign agents and track progress
            </p>
          </div>
        </div>
 
        {/* ── CONTENT ── */}
        <div style={{ padding: "24px 28px", maxWidth: 1100, margin: "0 auto" }}>
 
          {/* Flow guide */}
          <div className="al-card" style={{ marginBottom: 20, padding: "13px 18px", borderLeft: `3px solid ${C.gold}`, display: "flex", alignItems: "flex-start", gap: 10 }}>
            <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>📋</span>
            <p style={{ margin: 0, fontSize: 13, color: C.textSub, lineHeight: 1.6 }}>
              <strong style={{ color: C.text }}>Flow:</strong> Create/Receive lead →{" "}
              <strong style={{ color: C.text }}>Assign agent</strong> (stays NEW) →
              Agent Accept (IN_PROGRESS) →
              Agent Complete (<strong style={{ color: "#059669" }}>DONE</strong>) or Reject (<strong style={{ color: "#dc2626" }}>REJECTED</strong>)
              <span style={{ marginLeft: 16, fontSize: 12, color: C.muted }}>
                · <strong>Unassigned</strong> tab shows leads waiting for assignment
              </span>
            </p>
          </div>
 
          {/* Tabs + filters */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", gap: 2, borderBottom: `1px solid ${C.border}` }}>
              {[
                { id: "all",        label: "All",         icon: "📋" },
                { id: "unassigned", label: "Unassigned",  icon: "⚠️" },
                { id: "property",   label: "By Property", icon: "🏠" },
              ].map(t => (
                <button key={t.id} className="al-tab-btn"
                  onClick={() => { setActiveTab(t.id); setPage(0); setLeads([]); }}
                  style={{
                    padding: "9px 16px", marginBottom: -1,
                    borderBottom: activeTab === t.id ? `2px solid ${C.gold}` : "2px solid transparent",
                    color: activeTab === t.id ? C.dark : C.muted,
                    fontWeight: activeTab === t.id ? 600 : 400, fontSize: 13.5,
                  }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
 
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {activeTab === "all" && (
                <select
                  style={{ height: 34, padding: "0 10px", fontSize: 13, borderRadius: 9, border: `1.5px solid ${C.border}`, background: C.surface, color: C.text, fontFamily: "'DM Sans',sans-serif", width: 160 }}
                  value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }}>
                  {LEAD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              )}
              {activeTab === "property" && (
                <>
                  <input
                    style={{ height: 34, padding: "0 10px", fontSize: 13, width: 130, borderRadius: 9, border: `1.5px solid ${C.border}`, background: C.surface, color: C.text, fontFamily: "'DM Sans',sans-serif" }}
                    type="number" placeholder="Property ID..."
                    value={propertyId} onChange={e => setPropertyId(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && fetchByProperty()} />
                  <button className="al-btn" onClick={fetchByProperty}
                    style={{ padding: "7px 14px", borderRadius: 9, background: C.dark, color: C.goldL, fontSize: 13, fontWeight: 500, border: `1px solid ${C.gold}40` }}>
                    Search
                  </button>
                </>
              )}
            </div>
          </div>
 
          {/* Unassigned alert */}
          {activeTab === "unassigned" && leads.length > 0 && (
            <div style={{ background: "#fffbeb", border: "1.5px solid #fde68a", borderLeft: `3px solid #d97706`, borderRadius: 10, padding: "11px 18px", marginBottom: 16, fontSize: 13.5, color: "#92400e", fontWeight: 500 }}>
              ⚠️ {leads.length} lead{leads.length > 1 ? "s" : ""} waiting for assignment
            </div>
          )}
 
          {/* Main card */}
          <div className="al-card">
            <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, background: "#fdf9f4", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text, fontFamily: "'Cormorant Garamond',Georgia,serif" }}>
                {activeTab === "all"        ? `All Leads — ${statusFilter}` : ""}
                {activeTab === "unassigned" ? "Leads without agent — Waiting for assignment" : ""}
                {activeTab === "property"   ? "Leads by Property" : ""}
              </p>
              {leads.length > 0 && (
                <span style={{ background: `${C.gold}22`, color: C.textSub, padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                  {leads.length} leads
                </span>
              )}
            </div>
 
            {loading ? <Loader /> : leads.length === 0 ? (
              <EmptyState
                icon={activeTab === "unassigned" ? "✅" : activeTab === "property" ? "🔍" : "📭"}
                text={
                  activeTab === "unassigned" ? "All leads are assigned" :
                  activeTab === "property"   ? "Enter Property ID and click Search" :
                  "No leads with this status"
                }
              />
            ) : (
              <>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'DM Sans',sans-serif" }}>
                    <thead>
                      <tr style={{ background: "#f0ece3", borderBottom: `1px solid ${C.border}` }}>
                        {["#", "Type", "Client", "Agent", "Property", "Source", "Status", "Created", "Actions"].map(h => (
                          <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.7px", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map(lead => (
                        <tr key={lead.id} className="al-row" style={{ borderBottom: `1px solid ${C.border}` }}>
                          <td style={{ padding: "13px 14px", color: C.textMut, fontSize: 12 }}>{lead.id}</td>
                          <td style={{ padding: "13px 14px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontSize: 15 }}>{TYPE_ICON[lead.type] || "📋"}</span>
                              <span style={{ fontWeight: 500, fontSize: 13, color: C.text }}>{lead.type}</span>
                            </div>
                          </td>
                          <td style={{ padding: "13px 14px" }}>
                            <p style={{ fontWeight: 500, fontSize: 13, margin: 0, color: C.text }}>{lead.client_name || `#${lead.client_id}`}</p>
                          </td>
                          <td style={{ padding: "13px 14px" }}>
                            {lead.agent_name
                              ? <p style={{ fontWeight: 500, fontSize: 13, margin: 0, color: "#059669" }}>{lead.agent_name}</p>
                              : <span style={{ fontSize: 11, color: "#ea580c", background: "#fff7ed", padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>No agent</span>}
                          </td>
                          <td style={{ padding: "13px 14px", fontSize: 12.5, color: C.textSub }}>
                            {lead.property_title || (lead.property_id ? `#${lead.property_id}` : "—")}
                          </td>
                          <td style={{ padding: "13px 14px", fontSize: 12.5, color: C.textSub }}>
                            {SOURCE_ICON[lead.source]} {lead.source}
                          </td>
                          <td style={{ padding: "13px 14px" }}><StatusBadge status={lead.status} /></td>
                          <td style={{ padding: "13px 14px", fontSize: 12, color: C.textMut }}>{fmtDate(lead.created_at)}</td>
                          <td style={{ padding: "13px 14px" }}>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                              <button className="al-btn" onClick={() => setSelectedLead(lead)}
                                style={{ padding: "5px 12px", borderRadius: 7, border: `1.5px solid ${C.border}`, background: "transparent", color: C.textSub, fontSize: 12, fontWeight: 500 }}>
                                View
                              </button>
                              {lead.status !== "DONE" && lead.status !== "REJECTED" && (
                                <>
                                  <button className="al-btn" onClick={() => setAssignTarget(lead)}
                                    style={{ padding: "5px 12px", borderRadius: 7, background: C.dark, color: C.goldL, fontSize: 12, fontWeight: 500, border: `1px solid ${C.gold}40` }}>
                                    {lead.assigned_agent_id ? "↩ Reassign" : "👤 Assign"}
                                  </button>
                                  <button className="al-btn" onClick={() => setStatusTarget(lead)}
                                    style={{ padding: "5px 12px", borderRadius: 7, border: `1.5px solid ${C.border}`, background: C.surface, color: C.textSub, fontSize: 12, fontWeight: 500 }}>
                                    Status
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
              </>
            )}
          </div>
 
          {/* Status legend */}
          <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            {Object.entries(STATUS_STYLE).map(([key, s]) => (
              <span key={key} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: s.bg, color: s.color, padding: "4px 12px", borderRadius: 20, fontSize: 11.5, fontWeight: 500 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, display: "inline-block" }} />
                {s.label}
              </span>
            ))}
          </div>
        </div>
 
        {selectedLead && (
          <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLead(null)} onAssign={setAssignTarget} onStatusChange={setStatusTarget} />
        )}
        {assignTarget && (
          <AssignModal lead={assignTarget} onClose={() => setAssignTarget(null)}
            onSuccess={() => handleSuccess(`Lead #${assignTarget.id} assigned successfully`)} notify={notify} />
        )}
        {statusTarget && (
          <StatusModal lead={statusTarget} onClose={() => setStatusTarget(null)}
            onSuccess={() => handleSuccess(`Lead #${statusTarget.id} status changed`)} notify={notify} />
        )}
 
        {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      </div>
    </MainLayout>
  );
}
 