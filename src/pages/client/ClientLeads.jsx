import { useState, useEffect, useCallback, useContext } from "react";
import MainLayout from "../../components/layout/Layout";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";
 
import { CSS } from "../../components/client/leads/leadsConstants";
import { Toast, Skeleton, Pagination } from "../../components/client/leads/LeadsUI";
import { PlusIcon, ChartIcon } from "../../components/client/leads/LeadsIcons";
import LeadCard from "../../components/client/leads/LeadCard";
import CreateLeadModal from "../../components/client/leads/CreateLeadModal";
import LeadDetailModal from "../../components/client/leads/LeadDetailModal";
 
export default function ClientLeads() {
  const { user }                        = useContext(AuthContext);
  const [leads,        setLeads]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [page,         setPage]         = useState(0);
  const [totalPages,   setTotalPages]   = useState(0);
  const [createOpen,   setCreateOpen]   = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [toast,        setToast]        = useState(null);
 
  const notify = useCallback((msg, type = "success") =>
    setToast({ msg, type, key: Date.now() }), []);
 
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/leads/my/client?page=${page}&size=10`);
      setLeads(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch { notify("Error loading requests", "error"); }
    finally  { setLoading(false); }
  }, [page, notify]);
 
  useEffect(() => { fetchLeads(); }, [fetchLeads]);
 
  const stats = {
    total:    leads.length,
    active:   leads.filter(l => l.status === "NEW" || l.status === "IN_PROGRESS").length,
    done:     leads.filter(l => l.status === "DONE").length,
    rejected: leads.filter(l => l.status === "REJECTED").length,
  };
 
  return (
    <MainLayout role="client">
      <style>{CSS}</style>
      <div className="cl">
 
        {/* Hero */}
        <div style={{
          background: "linear-gradient(160deg,#141210 0%,#1e1a14 45%,#241e16 100%)",
          padding: "36px 32px 30px", position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.018) 1px,transparent 1px)", backgroundSize: "22px 22px", pointerEvents: "none" }}/>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)" }}/>
 
          <div style={{ position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
            <h1 style={{ margin: "0 0 10px", fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "clamp(28px,4vw,44px)", fontWeight: 700, color: "#f5f0e8", letterSpacing: "-0.7px", lineHeight: 1.1 }}>
              My{" "}
              <span style={{ background: "linear-gradient(90deg,#c9b87a,#e8d9a0,#c9b87a)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Requests</span>
            </h1>
            <p style={{ margin: "0 auto 22px", fontSize: 13.5, color: "rgba(245,240,232,0.38)", lineHeight: 1.6 }}>
              Track and manage your property requests
            </p>
 
            <button onClick={() => setCreateOpen(true)} className="cl-btn" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "linear-gradient(135deg,#c9b87a 0%,#b0983e 100%)",
              color: "#1a1714", border: "none", borderRadius: 11,
              padding: "11px 24px", fontSize: 13.5, fontWeight: 700,
              cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
              boxShadow: "0 6px 22px rgba(201,184,122,0.25)",
            }}>
              <PlusIcon /> New Request
            </button>
 
            {!loading && leads.length > 0 && (
              <div style={{ display: "flex", gap: 8, maxWidth: 480, margin: "20px auto 0", justifyContent: "center", flexWrap: "wrap" }}>
                {[
                  { label: "Total",    value: stats.total,    dot: "#c9b87a" },
                  { label: "Active",   value: stats.active,   dot: "#e2c97e" },
                  { label: "Done",     value: stats.done,     dot: "#7eb8a4" },
                  { label: "Rejected", value: stats.rejected, dot: "#c07050" },
                ].map(stat => (
                  <div key={stat.label} style={{
                    background: "rgba(245,240,232,0.06)", backdropFilter: "blur(10px)",
                    borderRadius: 11, padding: "9px 16px",
                    border: "1px solid rgba(245,240,232,0.09)",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                  }}>
                    <span style={{ fontSize: 22, fontWeight: 700, color: stat.dot, lineHeight: 1, fontFamily: "'Cormorant Garamond',Georgia,serif" }}>{stat.value}</span>
                    <span style={{ fontSize: 9.5, color: "rgba(245,240,232,0.3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px" }}>{stat.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
 
        {/* Toolbar */}
        <div style={{
          background: "#fff", borderBottom: "1.5px solid #e8e2d6",
          padding: "0 28px", height: 46,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 12, position: "sticky", top: 0, zIndex: 100,
          boxShadow: "0 1px 10px rgba(20,16,10,0.05)",
        }}>
          <p style={{ margin: 0, fontSize: 12.5, color: "#9a8c6e" }}>
            {loading ? "Loading…" : `${leads.length} request${leads.length !== 1 ? "s" : ""}`}
          </p>
          <button onClick={() => setCreateOpen(true)} className="cl-btn" style={{
            padding: "5px 14px", borderRadius: 9,
            background: "linear-gradient(135deg,#c9b87a,#b0983e)",
            color: "#1a1714", border: "none", fontSize: 12, fontWeight: 700,
            cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <PlusIcon /> New Request
          </button>
        </div>
 
        {/* Content */}
        <div style={{ padding: "20px 24px", maxWidth: 1440, margin: "0 auto" }}>
          {loading && <Skeleton />}
 
          {!loading && leads.length === 0 && (
            <div style={{ textAlign: "center", padding: "80px 32px", color: "#9a8c6e", fontFamily: "'DM Sans',sans-serif" }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#f0ece3", border: "1.5px solid #e4ddd0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", color: "#b0a890" }}>
                <ChartIcon />
              </div>
              <p style={{ fontSize: 18, fontWeight: 700, color: "#4a4438", marginBottom: 6, fontFamily: "'Cormorant Garamond',Georgia,serif", letterSpacing: "-0.2px" }}>No requests yet</p>
              <p style={{ fontSize: 13, marginBottom: 24, color: "#9a8c6e" }}>Submit your first request — an agent will get back to you.</p>
              <button onClick={() => setCreateOpen(true)} className="cl-btn" style={{
                padding: "11px 28px", background: "linear-gradient(135deg,#c9b87a,#b0983e)",
                color: "#1a1714", border: "none", borderRadius: 11,
                fontSize: 13.5, fontWeight: 700, cursor: "pointer",
                fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 8,
              }}>
                <PlusIcon /> New Request
              </button>
            </div>
          )}
 
          {!loading && leads.length > 0 && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {leads.map((lead, i) => (
                  <LeadCard key={lead.id} lead={lead} idx={i} onClick={() => setSelectedLead(lead)} />
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </>
          )}
        </div>
      </div>
 
      {createOpen && (
        <CreateLeadModal
          onClose={() => setCreateOpen(false)}
          onSuccess={() => { setCreateOpen(false); fetchLeads(); notify("Request submitted. Your agent will contact you shortly. ✓"); }}
          notify={notify}
        />
      )}
      {selectedLead && (
        <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
      )}
      {toast && (
        <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />
      )}
    </MainLayout>
  );
}
 