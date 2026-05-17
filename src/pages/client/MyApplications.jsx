import { useEffect, useState, useCallback } from "react";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";
 
import { STATUS_FILTERS, CloseIcon } from "../../components/client/applications/applicationsConstants";
import { Toast, Skeleton, Pagination } from "../../components/client/applications/ApplicationsUI";
import ApplicationCard from "../../components/client/applications/ApplicationCard";
 
export default function MyApplications() {
  const [apps,          setApps]          = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [page,          setPage]          = useState(0);
  const [totalPages,    setTotalPages]    = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [allCounts,     setAllCounts]     = useState({ PENDING: 0, APPROVED: 0, total: 0 });
  const [toast,         setToast]         = useState(null);
  const [statusFilter,  setStatusFilter]  = useState("");
 
  const notify = useCallback((msg, type = "success") =>
    setToast({ msg, type, key: Date.now() }), []);
 
  const loadApps = useCallback(async (pg = 0, status = statusFilter) => {
    setLoading(true);
    try {
      const params = { page: pg, size: 10 };
      if (status) params.status = status;
      const res  = await api.get("/api/rentals/applications/my", { params });
      const data = res.data;
      setApps(data.content        || []);
      setTotalPages(data.totalPages   || 0);
      setTotalElements(data.totalElements || 0);
      setPage(pg);
    } catch {
      notify("Error loading applications", "error");
    } finally {
      setLoading(false);
    }
  }, [notify, statusFilter]);
 
  const loadCounts = useCallback(async () => {
    try {
      const [totalRes, pendingRes, approvedRes] = await Promise.all([
        api.get("/api/rentals/applications/my", { params: { page: 0, size: 1 } }),
        api.get("/api/rentals/applications/my", { params: { page: 0, size: 1, status: "PENDING" } }),
        api.get("/api/rentals/applications/my", { params: { page: 0, size: 1, status: "APPROVED" } }),
      ]);
      setAllCounts({
        total:    totalRes.data.totalElements    || 0,
        PENDING:  pendingRes.data.totalElements  || 0,
        APPROVED: approvedRes.data.totalElements || 0,
      });
    } catch {}
  }, []);
 
  useEffect(() => { loadApps(0, statusFilter); }, [statusFilter]); // eslint-disable-line
  useEffect(() => { loadCounts(); }, [loadCounts]);
 
  const handleCancel = async appId => {
    try {
      await api.patch(`/api/rentals/applications/${appId}/cancel`);
      notify("Application canceled successfully");
      loadApps(page, statusFilter);
      loadCounts();
    } catch (err) {
      notify(err.response?.data?.message || "Error occurred while canceling the application", "error");
    }
  };
 
  return (
    <MainLayout role="client">
      <div style={{ background: "#f5f2eb", minHeight: "100vh", fontFamily: "'Georgia', serif" }}>
 
        {/* Hero */}
        <div style={{ background: "linear-gradient(135deg, #5a5f3a 0%, #3d4228 100%)", padding: "48px 32px 40px", textAlign: "center" }}>
          <h1 style={{ margin: "0 0 8px", fontSize: "32px", fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>
            My applications
          </h1>
          <p style={{ margin: "0 0 24px", color: "#c8ccaa", fontSize: "15px" }}>
            View and manage your rental applications
          </p>
          {allCounts.total > 0 && (
            <div style={{ display: "flex", gap: "10px", maxWidth: "480px", margin: "0 auto", justifyContent: "center", flexWrap: "wrap" }}>
              {[
                { label: "Total",  value: allCounts.total,    color: "#c8ccaa" },
                { label: "Pending", value: allCounts.PENDING,  color: "#c9a84c" },
                { label: "Approved",  value: allCounts.APPROVED, color: "#a3c9b0" },
              ].map(stat => (
                <div key={stat.label} style={{ background: "rgba(255,255,255,0.13)", backdropFilter: "blur(6px)", borderRadius: "10px", padding: "10px 20px", border: "1px solid rgba(255,255,255,0.18)" }}>
                  <div style={{ fontSize: "24px", fontWeight: 900, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                  <div style={{ fontSize: "11px", color: "#c8ccaa", fontWeight: 600, marginTop: "3px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
 
        {/* Body */}
        <div style={{ padding: "28px 24px", maxWidth: "1400px", margin: "0 auto" }}>
 
          {/* Toolbar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <span style={{ color: "#8a8469", fontSize: "13.5px" }}>
                {loading ? "Loading…" : `${totalElements} application${totalElements !== 1 ? "s" : ""} total`}
              </span>
              {statusFilter && (
                <button onClick={() => setStatusFilter("")}
                  style={{ display: "flex", alignItems: "center", gap: "5px", background: "#fff0f0", color: "#c0392b", border: "1px solid #f5c6c6", borderRadius: "8px", padding: "5px 12px", fontSize: "12.5px", cursor: "pointer", fontFamily: "inherit" }}>
                  Clear filter <CloseIcon />
                </button>
              )}
              {statusFilter && (
                <span style={{ background: "#edf2e8", color: "#5a5f3a", border: "1px solid #c8d4b0", borderRadius: "8px", padding: "4px 10px", fontSize: "12.5px" }}>
                  Status: <strong>{STATUS_FILTERS.find(f => f.value === statusFilter)?.label}</strong>
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
              {STATUS_FILTERS.map(f => (
                <button key={f.value} onClick={() => setStatusFilter(f.value)}
                  style={{ padding: "7px 14px", borderRadius: "8px", border: "none", background: statusFilter === f.value ? "#5a5f3a" : "#f0ece3", color: statusFilter === f.value ? "#fff" : "#5a5f3a", cursor: "pointer", fontSize: "13px", fontWeight: 600, transition: "all 0.15s", fontFamily: "inherit" }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
 
          {/* Empty */}
          {!loading && apps.length === 0 && (
            <div style={{ textAlign: "center", padding: "64px 32px", color: "#8a8469" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>📭</div>
              <h3 style={{ color: "#5a5f3a", margin: "0 0 8px" }}>
                {statusFilter ? "No applications found with the selected status." : "You haven't submitted any applications yet."}
              </h3>
              <p style={{ margin: "0 0 16px" }}>
                {statusFilter ? "Try changing the filter." : "Browse properties and apply for rentals."}
              </p>
            </div>
          )}
 
          {loading && <Skeleton />}
 
          {!loading && apps.length > 0 && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {apps.map(app => (
                  <ApplicationCard key={app.id} app={app} onCancel={handleCancel} />
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} onLoadApps={loadApps} statusFilter={statusFilter} />
            </>
          )}
        </div>
      </div>
 
      {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
 
      <style>{`
        @keyframes pulse         { 0%,100%{opacity:.5} 50%{opacity:.9} }
        @keyframes fadeInOverlay { from{opacity:0} to{opacity:1} }
        @keyframes slideUpModal  { from{transform:translateY(24px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes spin          { to{transform:rotate(360deg)} }
      `}</style>
    </MainLayout>
  );
}
 