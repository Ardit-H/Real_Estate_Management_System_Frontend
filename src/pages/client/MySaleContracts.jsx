import { useState, useEffect, useCallback, useContext } from "react";
import MainLayout from "../../components/layout/Layout";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";
 
import { CSS_CONTRACTS } from "../../components/client/salecontracts/saleConstants";
import { Toast, Skeleton, Pagination } from "../../components/client/salecontracts/SaleContractsUI";
import { ContractCard, ContractDetailModal, PaymentsQuickModal } from "../../components/client/salecontracts/ContractComponents";
 
export default function MySaleContracts() {
  const { user } = useContext(AuthContext);
  const [contracts,      setContracts]      = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [page,           setPage]           = useState(0);
  const [totalPages,     setTotalPages]     = useState(0);
  const [totalElements,  setTotalElements]  = useState(0);
  const [detailTarget,   setDetailTarget]   = useState(null);
  const [paymentsTarget, setPaymentsTarget] = useState(null);
  const [toast,          setToast]          = useState(null);
  const notify = useCallback((msg, type = "success") => setToast({ msg, type, key: Date.now() }), []);
 
  const fetchContracts = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/sales/contracts/buyer/${user.id}?page=${page}&size=10`);
      setContracts(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
    } catch { notify("Failed to load sale contracts", "error"); }
    finally { setLoading(false); }
  }, [user?.id, page, notify]);
 
  useEffect(() => { fetchContracts(); }, [fetchContracts]);
 
  const stats = {
    total:     totalElements,
    completed: contracts.filter(c => c.status === "COMPLETED").length,
    pending:   contracts.filter(c => ["PENDING", "PENDING_SIGNATURE"].includes(c.status)).length,
  };
 
  return (
    <MainLayout role="client">
      <style>{CSS_CONTRACTS}</style>
      <div className="msc">
 
        {/* Hero */}
        <div style={{ background: "linear-gradient(160deg,#141210 0%,#1e1a14 45%,#241e16 100%)", minHeight: 300, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 32px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.018) 1px,transparent 1px)", backgroundSize: "22px 22px", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "-60px", left: "10%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle,rgba(201,184,122,0.07) 0%,transparent 70%)", pointerEvents: "none", animation: "msc-glow 4s ease-in-out infinite" }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)" }} />
          <div style={{ position: "relative", zIndex: 1, maxWidth: 700, width: "100%", textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(201,184,122,0.1)", border: "1px solid rgba(201,184,122,0.18)", borderRadius: 999, padding: "4px 14px", marginBottom: 14 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#c9b87a", display: "inline-block", boxShadow: "0 0 6px #c9b87a" }} />
              <span style={{ fontSize: 10.5, fontWeight: 600, color: "#c9b87a", letterSpacing: "1.2px", textTransform: "uppercase" }}>Purchase History</span>
            </div>
            <h1 style={{ margin: "0 0 10px", fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "clamp(28px,4vw,44px)", fontWeight: 700, color: "#f5f0e8", letterSpacing: "-0.7px", lineHeight: 1.1 }}>
              My Sale <span style={{ background: "linear-gradient(90deg,#c9b87a,#e8d9a0,#c9b87a)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Contracts</span>
            </h1>
            <p style={{ margin: "0 auto 22px", fontSize: 13.5, color: "rgba(245,240,232,0.38)", fontFamily: "'DM Sans',sans-serif", lineHeight: 1.6 }}>Track your property purchases, contracts & payment schedules</p>
            {!loading && totalElements > 0 && (
              <div style={{ display: "flex", gap: 10, maxWidth: 480, margin: "0 auto", justifyContent: "center", flexWrap: "wrap" }}>
                {[{ label: "Total", value: stats.total, dot: "#c9b87a" }, { label: "Completed", value: stats.completed, dot: "#7eb8a4" }, { label: "Pending", value: stats.pending, dot: "#d4855a" }].map(s => (
                  <div key={s.label} style={{ background: "rgba(245,240,232,0.06)", backdropFilter: "blur(10px)", borderRadius: 12, padding: "10px 18px", border: "1px solid rgba(245,240,232,0.1)", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                    <span style={{ fontSize: 22, fontWeight: 700, color: s.dot, lineHeight: 1, fontFamily: "'Cormorant Garamond',Georgia,serif" }}>{s.value}</span>
                    <span style={{ fontSize: 9.5, color: "rgba(245,240,232,0.35)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px" }}>{s.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
 
        {/* Toolbar */}
        <div style={{ background: "#fff", borderBottom: "1.5px solid #e8e2d6", padding: "0 28px", height: 46, display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "'DM Sans',sans-serif", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 10px rgba(20,16,10,0.05)" }}>
          <p style={{ margin: 0, fontSize: 12.5, color: "#9a8c6e" }}>{loading ? "Loading…" : `${totalElements} contract${totalElements !== 1 ? "s" : ""}`}</p>
        </div>
 
        {/* Content */}
        <div style={{ padding: "20px 24px", maxWidth: 900, margin: "0 auto" }}>
          {loading && <Skeleton />}
          {!loading && contracts.length === 0 && (
            <div style={{ textAlign: "center", padding: "88px 32px", color: "#b0a890", fontFamily: "'DM Sans',sans-serif" }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>🏠</div>
              <p style={{ fontSize: 20, fontWeight: 700, color: "#4a4438", marginBottom: 6, fontFamily: "'Cormorant Garamond',Georgia,serif" }}>No sale contracts yet</p>
              <p style={{ fontSize: 13, color: "#b0a890", lineHeight: 1.6, marginBottom: 24 }}>Your property purchase contracts will appear here once created.</p>
              <a href="/client/browseproperties" style={{ padding: "12px 28px", background: "linear-gradient(135deg,#c9b87a,#b0983e)", color: "#1a1714", border: "none", borderRadius: 11, fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 7, boxShadow: "0 6px 24px rgba(201,184,122,0.28)" }}>🔍 Browse Properties</a>
            </div>
          )}
          {!loading && contracts.length > 0 && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {contracts.map((c, i) => (
                  <ContractCard key={c.id} contract={c} idx={i} onDetail={setDetailTarget} onPayments={setPaymentsTarget} />
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </>
          )}
        </div>
      </div>
 
      {detailTarget   && <ContractDetailModal contract={detailTarget}   onClose={() => setDetailTarget(null)}   onViewPayments={c => { setDetailTarget(null); setPaymentsTarget(c); }} />}
      {paymentsTarget && <PaymentsQuickModal  contract={paymentsTarget} onClose={() => setPaymentsTarget(null)} notify={notify} />}
      {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </MainLayout>
  );
}
 