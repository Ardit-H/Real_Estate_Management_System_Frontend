import { useState, useEffect, useCallback, useContext } from "react";
import MainLayout from "../../components/layout/Layout";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";
import { CSS, daysUntil } from "../../components/client/contracts/contractsHelpers";
import { Toast, Skeleton, Pagination } from "../../components/client/contracts/ContractsBadges";
import ContractCard from "../../components/client/contracts/ContractCard";
import ContractDetailModal from "../../components/client/contracts/ContractDetailModal";
import ContractPaymentsModal from "../../components/client/contracts/ContractPaymentsModal";

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function ClientContracts() {
  const { user }         = useContext(AuthContext);
  const [contracts,      setContracts]    = useState([]);
  const [loading,        setLoading]      = useState(true);
  const [page,           setPage]         = useState(0);
  const [totalPages,     setTotalPages]   = useState(0);
  const [totalElements,  setTotalElements]= useState(0);
  const [detailTarget,   setDetailTarget] = useState(null);
  const [paymentsTarget, setPaymentsTarget] = useState(null);
  const [toast,          setToast]        = useState(null);

  const notify = useCallback((msg, type="success") => setToast({ msg, type, key:Date.now() }), []);

  const fetchContracts = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/contracts/lease/client/${user.id}?page=${page}&size=10`);
      setContracts(res.data.content||[]);
      setTotalPages(res.data.totalPages||0);
      setTotalElements(res.data.totalElements||0);
    } catch { notify("Failed to load contracts","error"); }
    finally   { setLoading(false); }
  }, [user?.id, page, notify]);

  useEffect(() => { fetchContracts(); }, [fetchContracts]);

  const stats = {
    active:   contracts.filter(c => c.status==="ACTIVE").length,
    pending:  contracts.filter(c => c.status==="PENDING_SIGNATURE").length,
    expiring: contracts.filter(c => { const d=daysUntil(c.end_date); return d!==null&&d<=30&&d>0&&c.status==="ACTIVE"; }).length,
  };

  return (
    <MainLayout role="client">
      <style>{CSS}</style>
      <div className="cc">

        {/* ── Hero ── */}
        <div style={{
          background:"linear-gradient(160deg,#141210 0%,#1e1a14 45%,#241e16 100%)",
          minHeight:320, display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center",
          padding:"40px 32px", position:"relative", overflow:"hidden",
        }}>
          <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,0.018) 1px,transparent 1px)",backgroundSize:"22px 22px",pointerEvents:"none"}}/>
          <div style={{position:"absolute",top:"-60px",left:"10%",width:300,height:300,borderRadius:"50%",background:"radial-gradient(circle,rgba(201,184,122,0.07) 0%,transparent 70%)",pointerEvents:"none",animation:"cc-glow 4s ease-in-out infinite"}}/>
          <div style={{position:"absolute",bottom:"-40px",right:"10%",width:240,height:240,borderRadius:"50%",background:"radial-gradient(circle,rgba(126,184,164,0.05) 0%,transparent 70%)",pointerEvents:"none",animation:"cc-glow 4s ease-in-out infinite 2s"}}/>
          <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:"linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)"}}/>

          <div style={{ position:"relative", zIndex:1, maxWidth:700, width:"100%", textAlign:"center" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(201,184,122,0.1)", border:"1px solid rgba(201,184,122,0.18)", borderRadius:999, padding:"4px 14px", marginBottom:14 }}>
              <span style={{ width:5, height:5, borderRadius:"50%", background:"#c9b87a", display:"inline-block", boxShadow:"0 0 6px #c9b87a" }}/>
              <span style={{ fontSize:10.5, fontWeight:600, color:"#c9b87a", letterSpacing:"1.2px", textTransform:"uppercase" }}>My Contracts</span>
            </div>

            <h1 style={{ margin:"0 0 10px", fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"clamp(28px,4vw,44px)", fontWeight:700, color:"#f5f0e8", letterSpacing:"-0.7px", lineHeight:1.1 }}>
              Lease{" "}
              <span style={{ background:"linear-gradient(90deg,#c9b87a,#e8d9a0,#c9b87a)", backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>Agreements</span>
            </h1>

            <p style={{ margin:"0 auto 24px", fontSize:13.5, color:"rgba(245,240,232,0.38)", fontFamily:"'DM Sans',sans-serif", lineHeight:1.6 }}>
              View and manage your active lease contracts & payment history
            </p>

            {!loading && contracts.length > 0 && (
              <div style={{ display:"flex", gap:10, maxWidth:520, margin:"0 auto", justifyContent:"center", flexWrap:"wrap" }}>
                {[
                  { label:"Total",    value:totalElements, dot:"#c9b87a" },
                  { label:"Active",   value:stats.active,  dot:"#7eb8a4" },
                  { label:"Pending",  value:stats.pending, dot:"#c9b87a" },
                  { label:"Expiring", value:stats.expiring,dot:"#d4855a" },
                ].map(stat => (
                  <div key={stat.label} style={{ background:"rgba(245,240,232,0.06)", backdropFilter:"blur(10px)", borderRadius:12, padding:"10px 18px", border:"1px solid rgba(245,240,232,0.1)", display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                    <span style={{ fontSize:24, fontWeight:700, color:stat.dot, lineHeight:1, fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{stat.value}</span>
                    <span style={{ fontSize:10, color:"rgba(245,240,232,0.35)", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.8px" }}>{stat.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div style={{ background:"#fff", borderBottom:"1.5px solid #e8e2d6", padding:"0 28px", height:46, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, fontFamily:"'DM Sans',sans-serif", position:"sticky", top:0, zIndex:100, boxShadow:"0 1px 10px rgba(20,16,10,0.05)" }}>
          <p style={{ margin:0, fontSize:12.5, color:"#9a8c6e" }}>
            {loading ? "Loading…" : `${totalElements} contract${totalElements!==1?"s":""}`}
          </p>
          {stats.expiring > 0 && (
            <span style={{ fontSize:12, color:"#c9b87a", fontWeight:600, display:"flex", alignItems:"center", gap:5 }}>
              ⚠️ {stats.expiring} expiring soon
            </span>
          )}
        </div>

        {/* ── Content ── */}
        <div style={{ padding:"20px 24px", maxWidth:1100, margin:"0 auto" }}>

          {stats.expiring > 0 && (
            <div style={{ background:"rgba(201,184,122,0.08)", border:"1.5px solid rgba(201,184,122,0.22)", borderRadius:12, padding:"13px 18px", marginBottom:20, fontSize:13, color:"#c9b87a", display:"flex", alignItems:"center", gap:8 }}>
              ⚠️ You have <strong>{stats.expiring}</strong> contract{stats.expiring!==1?"s":""} expiring within 30 days. Contact your agent to arrange renewal.
            </div>
          )}

          {loading && <Skeleton/>}

          {!loading && contracts.length === 0 && (
            <div style={{ textAlign:"center", padding:"80px 32px", color:"#b0a890", fontFamily:"'DM Sans',sans-serif" }}>
              <div style={{ fontSize:52, marginBottom:16 }}>📄</div>
              <p style={{ fontSize:20, fontWeight:700, color:"#6b6340", marginBottom:6, fontFamily:"'Cormorant Garamond',Georgia,serif", letterSpacing:"-0.2px" }}>No lease contracts yet</p>
              <p style={{ fontSize:13, color:"#b0a890" }}>Your contracts will appear here once created by your agent.</p>
            </div>
          )}

          {!loading && contracts.length > 0 && (
            <>
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {contracts.map((c,i) => (
                  <ContractCard key={c.id} contract={c} idx={i} onDetail={setDetailTarget} onPayments={setPaymentsTarget}/>
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} onChange={setPage}/>
            </>
          )}
        </div>
      </div>

      {detailTarget && (
        <ContractDetailModal
          contract={detailTarget} onClose={()=>setDetailTarget(null)}
          onViewPayments={(c)=>{ setDetailTarget(null); setPaymentsTarget(c); }}
        />
      )}
      {paymentsTarget && (
        <ContractPaymentsModal contract={paymentsTarget} onClose={()=>setPaymentsTarget(null)} notify={notify}/>
      )}
      {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}
    </MainLayout>
  );
}