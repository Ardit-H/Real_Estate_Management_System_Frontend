import { useState, useEffect, useCallback, useContext } from "react";
import MainLayout from "../../components/layout/Layout";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";

// ─── Constants ────────────────────────────────────────────────────────────────
const PAY_STATUS_CFG = {
  PENDING:  { bg:"rgba(201,184,122,0.1)",  color:"#c9b87a", border:"rgba(201,184,122,0.25)", label:"Pending"  },
  PAID:     { bg:"rgba(126,184,164,0.1)",  color:"#2a6049", border:"rgba(126,184,164,0.25)", label:"Paid"     },
  FAILED:   { bg:"rgba(212,133,90,0.1)",   color:"#8b4513", border:"rgba(212,133,90,0.25)",  label:"Failed"   },
  OVERDUE:  { bg:"rgba(212,133,90,0.12)",  color:"#8b3a1c", border:"rgba(212,133,90,0.3)",   label:"Overdue"  },
  REFUNDED: { bg:"rgba(160,153,126,0.1)",  color:"#6b6248", border:"rgba(160,153,126,0.22)", label:"Refunded" },
};

const CONTRACT_STATUS_CFG = {
  ACTIVE:            { label:"Active",            dot:"#7eb8a4", pill:"rgba(126,184,164,0.13)", pillBorder:"rgba(126,184,164,0.28)", color:"#2a6049"  },
  ENDED:             { label:"Ended",             dot:"#a0997e", pill:"rgba(160,153,126,0.1)",  pillBorder:"rgba(160,153,126,0.22)", color:"#6b6248"  },
  CANCELLED:         { label:"Cancelled",         dot:"#d4855a", pill:"rgba(212,133,90,0.1)",   pillBorder:"rgba(212,133,90,0.25)",  color:"#8b4513"  },
  PENDING_SIGNATURE: { label:"Pending Signature", dot:"#c9b87a", pill:"rgba(201,184,122,0.12)", pillBorder:"rgba(201,184,122,0.28)", color:"#9a7a30"  },
};

const TYPE_ICON = { RENT:"💳", DEPOSIT:"🔒", LATE_FEE:"🔴", REFUND:"↩️" };

const fmtDate  = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }) : "—";
const fmtMoney = (v) => v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";

function isOverdue(p) {
  if (!p.due_date || p.status !== "PENDING") return false;
  return new Date(p.due_date) < new Date();
}

// ─── Global CSS ───────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  .cp * { box-sizing: border-box; }
  .cp { font-family: 'DM Sans', system-ui, sans-serif; background: #f2ede4; min-height: 100vh; }

  .cp-card { transition: transform 0.22s ease, box-shadow 0.22s ease; }
  .cp-card:hover { transform: translateY(-4px); box-shadow: 0 20px 44px rgba(20,16,10,0.12) !important; }

  .cp-pay-row { transition: box-shadow 0.15s ease, background 0.15s ease; }
  .cp-pay-row:hover { box-shadow: 0 4px 18px rgba(20,16,10,0.08) !important; background: #faf7f2 !important; }

  .cp-btn { transition: all 0.17s ease; }
  .cp-btn:hover { opacity: 0.85; transform: translateY(-1px); }

  .cp-chip { transition: all 0.14s ease; }

  @keyframes cp-fade-up  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes cp-shimmer  { 0%{background-position:-800px 0} 100%{background-position:800px 0} }
  @keyframes cp-pulse    { 0%,100%{opacity:.38} 50%{opacity:.82} }
  @keyframes cp-spin     { to{transform:rotate(360deg)} }
  @keyframes cp-toast    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes cp-glow     { 0%,100%{opacity:0.07} 50%{opacity:0.14} }
  @keyframes cp-card-in  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
`;

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position:"fixed", bottom:26, right:26, zIndex:9999,
      background:"#1a1714", color:type==="error"?"#f09090":"#90c8a8",
      padding:"11px 18px", borderRadius:12, fontSize:13,
      boxShadow:"0 10px 36px rgba(0,0,0,0.32)",
      border:`1px solid ${type==="error"?"rgba(240,128,128,0.15)":"rgba(144,200,168,0.15)"}`,
      maxWidth:320, fontFamily:"'DM Sans',sans-serif",
      animation:"cp-toast 0.2s ease", display:"flex", alignItems:"center", gap:8,
    }}>
      <span style={{fontSize:14}}>{type==="error"?"⚠️":"✅"}</span>{msg}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ count=4 }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {Array.from({ length:count }).map((_, i) => (
        <div key={i} style={{
          background:"linear-gradient(90deg,#ede9df 25%,#e4ddd0 50%,#ede9df 75%)",
          backgroundSize:"800px 100%", borderRadius:12, height:68,
          animation:"cp-shimmer 1.6s ease-in-out infinite",
        }}/>
      ))}
    </div>
  );
}

// ─── Contract Selector Tabs ───────────────────────────────────────────────────
function ContractTabs({ contracts, selectedId, onSelect }) {
  if (contracts.length === 0) return null;
  return (
    <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
      <button onClick={() => onSelect(null)} className="cp-chip"
        style={{
          padding:"7px 16px", borderRadius:999, fontSize:12.5, fontWeight:600,
          border:`1.5px solid ${selectedId===null?"#1a1714":"#e4ddd0"}`,
          background:selectedId===null?"#1a1714":"transparent",
          color:selectedId===null?"#f5f0e8":"#6b6248",
          cursor:"pointer", fontFamily:"inherit",
        }}>
        All Contracts
      </button>
      {contracts.map(c => {
        const s      = CONTRACT_STATUS_CFG[c.status] || CONTRACT_STATUS_CFG.ENDED;
        const active = selectedId === c.id;
        return (
          <button key={c.id} onClick={() => onSelect(c.id)} className="cp-chip"
            style={{
              padding:"7px 14px", borderRadius:999, fontSize:12.5, fontWeight:600,
              border:`1.5px solid ${active?"#1a1714":"#e4ddd0"}`,
              background:active?"#1a1714":"transparent",
              color:active?"#f5f0e8":"#6b6248",
              cursor:"pointer", fontFamily:"inherit",
              display:"flex", alignItems:"center", gap:7,
            }}>
            Contract #{c.id}
            <span style={{
              background:active?"rgba(245,240,232,0.12)":s.pill,
              color:active?"rgba(245,240,232,0.7)":s.color,
              border:`1px solid ${active?"rgba(245,240,232,0.2)":s.pillBorder}`,
              padding:"1px 8px", borderRadius:999, fontSize:10.5, fontWeight:700,
            }}>
              {s.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Section Label ────────────────────────────────────────────────────────────
function SectionLabel({ label, count, color }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
      <span style={{ fontSize:9.5, fontWeight:700, color, textTransform:"uppercase", letterSpacing:"1px" }}>{label}</span>
      <span style={{ background:`${color}14`, color, border:`1px solid ${color}30`, padding:"1px 9px", borderRadius:999, fontSize:10.5, fontWeight:700 }}>{count}</span>
      <div style={{ flex:1, height:"1px", background:`${color}18` }}/>
    </div>
  );
}

// ─── Payment Row ──────────────────────────────────────────────────────────────
function PaymentRow({ payment, idx }) {
  const overdue       = isOverdue(payment);
  const displayStatus = (overdue && payment.status==="PENDING") ? "OVERDUE" : payment.status;
  const s             = PAY_STATUS_CFG[displayStatus] || PAY_STATUS_CFG.PENDING;
  const icon          = payment.status==="PAID" ? "✓" : overdue ? "⚠" : (TYPE_ICON[payment.payment_type]||"💳");

  return (
    <div className="cp-pay-row"
      style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"13px 16px", background:"#fff", borderRadius:12,
        border:`1.5px solid ${overdue?"rgba(212,133,90,0.22)":"#ece6da"}`,
        animation:`cp-card-in 0.3s ease ${Math.min(idx*0.04,0.3)}s both`,
      }}>

      {/* Icon */}
      <div style={{ width:38, height:38, borderRadius:10, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", background:s.bg, border:`1.5px solid ${s.border}`, fontSize:16, marginRight:14 }}>
        {icon}
      </div>

      {/* Info */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:4, flexWrap:"wrap" }}>
          <span style={{ fontWeight:700, fontSize:15, color:"#1a1714", fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{fmtMoney(payment.amount)}</span>
          <span style={{ background:"#f0ece3", color:"#6b5f45", border:"1px solid #e0d8c8", padding:"2px 9px", borderRadius:999, fontSize:10.5, fontWeight:600, textTransform:"uppercase" }}>{payment.payment_type}</span>
          <span style={{ background:"rgba(201,184,122,0.1)", color:"#c9b87a", border:"1px solid rgba(201,184,122,0.22)", padding:"2px 9px", borderRadius:999, fontSize:10.5, fontWeight:600 }}>#{payment.contract_id}</span>
        </div>
        <p style={{ fontSize:12, color:"#b0a890", margin:0 }}>
          Due: {fmtDate(payment.due_date)}
          {payment.paid_date && ` · Paid: ${fmtDate(payment.paid_date)}`}
          {payment.payment_method && ` · ${payment.payment_method}`}
          {payment.transaction_ref && ` · Ref: ${payment.transaction_ref}`}
        </p>
        {payment.notes && <p style={{ fontSize:11.5, color:"#b0a890", margin:"3px 0 0", fontStyle:"italic", fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{payment.notes}</p>}
      </div>

      {/* Status badge */}
      <div style={{ display:"flex", alignItems:"center", gap:7, flexShrink:0, marginLeft:12 }}>
        {overdue && <span style={{ fontSize:11.5, color:"#d4855a", fontWeight:700 }}>Overdue</span>}
        <span style={{ background:s.bg, color:s.color, border:`1.5px solid ${s.border}`, padding:"3px 12px", borderRadius:999, fontSize:10.5, fontWeight:700, textTransform:"uppercase" }}>{s.label}</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function ClientPayments() {
  const { user } = useContext(AuthContext);

  const [contracts,          setContracts]        = useState([]);
  const [contractsLoaded,    setContractsLoaded]  = useState(false);
  const [payments,           setPayments]         = useState([]);
  const [summary,            setSummary]          = useState(null);
  const [loading,            setLoading]          = useState(false);
  const [selectedContractId, setSelectedContractId] = useState(null);
  const [toast,              setToast]            = useState(null);

  const notify = useCallback((msg, type="success") => setToast({ msg, type, key:Date.now() }), []);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const res = await api.get(`/api/contracts/lease/client/${user.id}?page=0&size=100`);
        setContracts(res.data.content||[]);
      } catch { notify("Failed to load contracts","error"); }
      finally   { setContractsLoaded(true); }
    })();
  }, [user?.id, notify]);

  const loadPayments = useCallback(async (contractId) => {
    if (!contractId) { setPayments([]); setSummary(null); return; }
    setLoading(true);
    try {
      const [listRes, sumRes] = await Promise.all([
        api.get(`/api/payments/contract/${contractId}`),
        api.get(`/api/payments/contract/${contractId}/summary`),
      ]);
      setPayments(Array.isArray(listRes.data) ? listRes.data : []);
      setSummary(sumRes.data);
    } catch { notify("Failed to load payments","error"); }
    finally   { setLoading(false); }
  }, [notify]);

  useEffect(() => {
    if (!contractsLoaded || contracts.length===0 || selectedContractId!==null) return;
    const active = contracts.find(c=>c.status==="ACTIVE") || contracts[0];
    setSelectedContractId(active.id);
    loadPayments(active.id);
  }, [contractsLoaded, contracts, selectedContractId, loadPayments]);

  const handleSelect = (id) => { setSelectedContractId(id); loadPayments(id); };

  const overduePays = payments.filter(p => isOverdue(p) || p.status==="OVERDUE");
  const pendingPays = payments.filter(p => p.status==="PENDING" && !isOverdue(p));
  const paidPays    = payments.filter(p => p.status==="PAID");
  const otherPays   = payments.filter(p => !["PAID","PENDING","OVERDUE"].includes(p.status) && !isOverdue(p));

  const totalPaid    = paidPays.reduce((a,p)     => a + Number(p.amount||0), 0);
  const totalPending = [...pendingPays,...overduePays].reduce((a,p) => a + Number(p.amount||0), 0);

  return (
    <MainLayout role="client">
      <style>{CSS}</style>
      <div className="cp">

        {/* ── Hero ── */}
        <div style={{
          background:"linear-gradient(160deg,#141210 0%,#1e1a14 45%,#241e16 100%)",
          minHeight:320, display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center",
          padding:"40px 32px", position:"relative", overflow:"hidden",
        }}>
          <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,0.018) 1px,transparent 1px)",backgroundSize:"22px 22px",pointerEvents:"none"}}/>
          <div style={{position:"absolute",top:"-60px",left:"8%",width:300,height:300,borderRadius:"50%",background:"radial-gradient(circle,rgba(201,184,122,0.07) 0%,transparent 70%)",pointerEvents:"none",animation:"cp-glow 4s ease-in-out infinite"}}/>
          <div style={{position:"absolute",bottom:"-40px",right:"8%",width:240,height:240,borderRadius:"50%",background:"radial-gradient(circle,rgba(126,184,164,0.05) 0%,transparent 70%)",pointerEvents:"none",animation:"cp-glow 4s ease-in-out infinite 2s"}}/>
          <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:"linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)"}}/>

          <div style={{ position:"relative", zIndex:1, maxWidth:700, width:"100%", textAlign:"center" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(201,184,122,0.1)", border:"1px solid rgba(201,184,122,0.18)", borderRadius:999, padding:"4px 14px", marginBottom:14 }}>
              <span style={{ width:5, height:5, borderRadius:"50%", background:"#c9b87a", display:"inline-block", boxShadow:"0 0 6px #c9b87a" }}/>
              <span style={{ fontSize:10.5, fontWeight:600, color:"#c9b87a", letterSpacing:"1.2px", textTransform:"uppercase" }}>Payment History</span>
            </div>

            <h1 style={{ margin:"0 0 10px", fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"clamp(28px,4vw,44px)", fontWeight:700, color:"#f5f0e8", letterSpacing:"-0.7px", lineHeight:1.1 }}>
              My{" "}
              <span style={{ background:"linear-gradient(90deg,#c9b87a,#e8d9a0,#c9b87a)", backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>Payments</span>
            </h1>

            <p style={{ margin:"0 auto 24px", fontSize:13.5, color:"rgba(245,240,232,0.38)", fontFamily:"'DM Sans',sans-serif", lineHeight:1.6 }}>
              Track your rent payments, deposits & outstanding balances
            </p>

            {selectedContractId && !loading && payments.length > 0 && (
              <div style={{ display:"flex", gap:10, maxWidth:560, margin:"0 auto", justifyContent:"center", flexWrap:"wrap" }}>
                {[
                  { label:"Payments",    value:payments.length,        dot:"#c9b87a"  },
                  { label:"Paid",        value:fmtMoney(totalPaid),    dot:"#7eb8a4"  },
                  { label:"Outstanding", value:fmtMoney(totalPending), dot:"#c9b87a"  },
                  { label:"Overdue",     value:overduePays.length,     dot:"#d4855a"  },
                ].map(stat => (
                  <div key={stat.label} style={{ background:"rgba(245,240,232,0.06)", backdropFilter:"blur(10px)", borderRadius:12, padding:"10px 18px", border:"1px solid rgba(245,240,232,0.1)", display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                    <span style={{ fontSize:20, fontWeight:700, color:stat.dot, lineHeight:1, fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{stat.value}</span>
                    <span style={{ fontSize:10, color:"rgba(245,240,232,0.35)", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.8px" }}>{stat.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div style={{ background:"#fff", borderBottom:"1.5px solid #e8e2d6", padding:"0 28px", height:46, display:"flex", alignItems:"center", justifyContent:"space-between", fontFamily:"'DM Sans',sans-serif", position:"sticky", top:0, zIndex:100, boxShadow:"0 1px 10px rgba(20,16,10,0.05)" }}>
          <p style={{ margin:0, fontSize:12.5, color:"#9a8c6e" }}>
            {loading ? "Loading…" : selectedContractId ? `${payments.length} payment${payments.length!==1?"s":""} · Contract #${selectedContractId}` : "Select a contract"}
          </p>
          {overduePays.length > 0 && (
            <span style={{ fontSize:12, color:"#d4855a", fontWeight:600, display:"flex", alignItems:"center", gap:5 }}>
              ⚠️ {overduePays.length} overdue
            </span>
          )}
        </div>

        {/* ── Content ── */}
        <div style={{ padding:"20px 24px", maxWidth:1100, margin:"0 auto" }}>

          {contractsLoaded && contracts.length === 0 && (
            <div style={{ textAlign:"center", padding:"80px 32px", color:"#b0a890", fontFamily:"'DM Sans',sans-serif" }}>
              <div style={{ fontSize:52, marginBottom:16 }}>💳</div>
              <p style={{ fontSize:20, fontWeight:700, color:"#6b6340", marginBottom:6, fontFamily:"'Cormorant Garamond',Georgia,serif", letterSpacing:"-0.2px" }}>No active contracts</p>
              <p style={{ fontSize:13, color:"#b0a890" }}>Payments will appear here once you have an active lease contract.</p>
            </div>
          )}

          {contracts.length > 0 && (
            <>
              {/* Contract selector */}
              <div className="cp-card"
                style={{ background:"#fff", borderRadius:14, border:"1.5px solid #ece6da", padding:"18px 22px", marginBottom:18, boxShadow:"0 2px 16px rgba(20,16,10,0.07)", animation:"cp-card-in 0.35s ease both" }}>
                <p style={{ fontSize:9.5, fontWeight:600, color:"#b0a890", textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:12 }}>Select Contract</p>
                <ContractTabs contracts={contracts} selectedId={selectedContractId} onSelect={handleSelect}/>
              </div>

              {/* Overdue alert */}
              {overduePays.length > 0 && (
                <div style={{ background:"rgba(212,133,90,0.08)", border:"1.5px solid rgba(212,133,90,0.25)", borderRadius:12, padding:"13px 18px", marginBottom:18, fontSize:13, color:"#d4855a", display:"flex", alignItems:"center", gap:8 }}>
                  🔴 You have <strong>{overduePays.length}</strong> overdue payment{overduePays.length!==1?"s":""} totalling <strong>{fmtMoney(overduePays.reduce((s,p)=>s+Number(p.amount||0),0))}</strong>. Please contact your agent.
                </div>
              )}

              {/* Summary stat cards */}
              {selectedContractId && !loading && summary && payments.length > 0 && (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:10, marginBottom:18 }}>
                  {[
                    { label:"Total",      value:payments.length,                                          dot:"#c9b87a", bg:"rgba(201,184,122,0.08)",  border:"rgba(201,184,122,0.2)"  },
                    { label:"Paid",       value:fmtMoney(summary.total_paid||0),                          dot:"#7eb8a4", bg:"rgba(126,184,164,0.08)",  border:"rgba(126,184,164,0.2)"  },
                    { label:"Outstanding",value:fmtMoney(summary.total_pending||0),                       dot:"#c9b87a", bg:"rgba(201,184,122,0.06)",  border:"rgba(201,184,122,0.15)" },
                    { label:"Overdue",    value:overduePays.length,                                       dot:"#d4855a", bg:"rgba(212,133,90,0.07)",   border:"rgba(212,133,90,0.2)"   },
                  ].map(s => (
                    <div key={s.label} style={{ background:s.bg, borderRadius:12, padding:"13px 16px", border:`1.5px solid ${s.border}` }}>
                      <p style={{ fontSize:9.5, color:"#b0a890", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:6 }}>{s.label}</p>
                      <p style={{ fontSize:20, fontWeight:700, color:s.dot, margin:0, fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{s.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Payment list card */}
              <div className="cp-card"
                style={{ background:"#fff", borderRadius:14, border:"1.5px solid #ece6da", overflow:"hidden", boxShadow:"0 2px 16px rgba(20,16,10,0.07)" }}>

                {/* Card header */}
                <div style={{ padding:"16px 22px", borderBottom:"1.5px solid #ece6da", display:"flex", justifyContent:"space-between", alignItems:"center", background:"#faf7f2" }}>
                  <h2 style={{ margin:0, fontSize:15, fontWeight:700, color:"#1a1714", fontFamily:"'Cormorant Garamond',Georgia,serif" }}>
                    {selectedContractId ? `Payments — Contract #${selectedContractId}` : "Select a contract to view payments"}
                  </h2>
                  {!loading && payments.length > 0 && (
                    <span style={{ background:"rgba(201,184,122,0.1)", color:"#c9b87a", border:"1px solid rgba(201,184,122,0.22)", padding:"3px 12px", borderRadius:999, fontSize:11.5, fontWeight:700 }}>
                      {payments.length} payments
                    </span>
                  )}
                </div>

                <div style={{ padding:"18px 22px" }}>
                  {!selectedContractId ? (
                    <div style={{ textAlign:"center", padding:"56px 20px", color:"#b0a890" }}>
                      <div style={{ fontSize:44, marginBottom:12 }}>👆</div>
                      <p style={{ fontSize:14, fontFamily:"'Cormorant Garamond',Georgia,serif", color:"#6b6340" }}>Select a contract above to view its payments.</p>
                    </div>
                  ) : loading ? (
                    <Skeleton/>
                  ) : payments.length === 0 ? (
                    <div style={{ textAlign:"center", padding:"56px 20px", color:"#b0a890" }}>
                      <div style={{ fontSize:44, marginBottom:12 }}>💳</div>
                      <p style={{ fontSize:14, fontFamily:"'Cormorant Garamond',Georgia,serif", color:"#6b6340" }}>No payments found for this contract.</p>
                    </div>
                  ) : (
                    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

                      {overduePays.length > 0 && (
                        <div>
                          <SectionLabel label="⚠ Overdue" count={overduePays.length} color="#d4855a"/>
                          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                            {overduePays.map((p,i) => <PaymentRow key={p.id} payment={p} idx={i}/>)}
                          </div>
                        </div>
                      )}

                      {pendingPays.length > 0 && (
                        <div>
                          <SectionLabel label="Pending" count={pendingPays.length} color="#c9b87a"/>
                          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                            {pendingPays.map((p,i) => <PaymentRow key={p.id} payment={p} idx={i}/>)}
                          </div>
                        </div>
                      )}

                      {paidPays.length > 0 && (
                        <div>
                          <SectionLabel label="Paid" count={paidPays.length} color="#7eb8a4"/>
                          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                            {paidPays.map((p,i) => <PaymentRow key={p.id} payment={p} idx={i}/>)}
                          </div>
                        </div>
                      )}

                      {otherPays.length > 0 && (
                        <div>
                          <SectionLabel label="Other" count={otherPays.length} color="#9a8c6e"/>
                          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                            {otherPays.map((p,i) => <PaymentRow key={p.id} payment={p} idx={i}/>)}
                          </div>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}
    </MainLayout>
  );
}