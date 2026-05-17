import { useState, useEffect, useCallback, useContext } from "react";
import MainLayout from "../../components/layout/Layout";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";
 
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
  .msp * { box-sizing: border-box; }
  .msp { font-family: 'DM Sans', system-ui, sans-serif; background: #f2ede4; min-height: 100vh; }
  .msp-card { background: #fff; border-radius: 14px; border: 1.5px solid #ece6da; box-shadow: 0 2px 16px rgba(20,16,10,0.07); }
  .msp-btn { transition: all 0.15s ease; }
  .msp-btn:hover:not(:disabled) { opacity: 0.86; transform: translateY(-1px); }
  @keyframes msp-spin   { to{transform:rotate(360deg)} }
  @keyframes msp-pulse  { 0%,100%{opacity:.38} 50%{opacity:.82} }
  @keyframes msp-toast  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes msp-glow   { 0%,100%{opacity:0.07} 50%{opacity:0.14} }
  @keyframes msp-row-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
`;
 
const fmtMoney = (v, cur = "EUR") =>
  v != null ? new Intl.NumberFormat("de-DE", { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(Number(v)) : "—";
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";
const isOverdue = (p) => {
  if (!p.due_date || p.status !== "PENDING") return false;
  return new Date(p.due_date) < new Date();
};
 
const TYPE_COLORS = {
  FULL:             { bg: "rgba(201,184,122,0.15)", color: "#7a6220",  border: "rgba(201,184,122,0.35)", label: "Full Payment"     },
  DEPOSIT:          { bg: "rgba(126,184,164,0.15)", color: "#1e5040",  border: "rgba(126,184,164,0.35)", label: "Deposit"          },
  INSTALLMENT:      { bg: "rgba(100,120,180,0.10)", color: "#3a4a8a",  border: "rgba(100,120,180,0.28)", label: "Installment"      },
  COMMISSION:       { bg: "rgba(126,184,164,0.12)", color: "#2a6049",  border: "rgba(126,184,164,0.28)", label: "Commission"       },
  AGENT_COMMISSION: { bg: "rgba(201,184,122,0.12)", color: "#8a6430",  border: "rgba(201,184,122,0.28)", label: "Agent Commission" },
  CLIENT_BONUS:     { bg: "rgba(164,176,126,0.12)", color: "#4a6030",  border: "rgba(164,176,126,0.28)", label: "Client Bonus"     },
};
 
const STATUS_CFG = {
  PENDING:  { bg: "rgba(201,184,122,0.12)", color: "#8a7230", border: "rgba(201,184,122,0.35)", label: "Pending",  strip: "#c9b87a" },
  PAID:     { bg: "rgba(126,184,164,0.14)", color: "#1e5040", border: "rgba(126,184,164,0.35)", label: "Paid",     strip: "#7eb8a4" },
  FAILED:   { bg: "rgba(212,133,90,0.12)",  color: "#7a3010", border: "rgba(212,133,90,0.30)",  label: "Failed",   strip: "#d4855a" },
  REFUNDED: { bg: "rgba(160,153,126,0.12)", color: "#5a5238", border: "rgba(160,153,126,0.28)", label: "Refunded", strip: "#9a8c6e" },
};
const getStatus = (s) => STATUS_CFG[s] || { bg: "#f0ece3", color: "#6b6248", border: "#e0d8c8", label: s, strip: "#b0a890" };
const getType   = (t) => TYPE_COLORS[t]  || { bg: "#f0ece3", color: "#6b6248", border: "#e0d8c8", label: t || "—" };
 
function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position: "fixed", bottom: 26, right: 26, zIndex: 9999, background: "#1a1714", color: type === "error" ? "#f09090" : "#90c8a8", padding: "11px 18px", borderRadius: 12, fontSize: 13, boxShadow: "0 10px 36px rgba(0,0,0,0.32)", border: `1px solid ${type === "error" ? "rgba(240,128,128,0.15)" : "rgba(144,200,168,0.15)"}`, maxWidth: 320, fontFamily: "'DM Sans',sans-serif", animation: "msp-toast 0.2s ease", display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 14 }}>{type === "error" ? "⚠️" : "✅"}</span>{msg}
    </div>
  );
}
 
function Skeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{ background: "linear-gradient(90deg,#ede9df 25%,#e4ddd0 50%,#ede9df 75%)", backgroundSize: "800px 100%", borderRadius: 11, height: 80, animation: "msp-pulse 1.6s ease-in-out infinite" }} />
      ))}
    </div>
  );
}
 
function SectionLabel({ label, count, color, borderColor }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.9px" }}>{label}</span>
      <span style={{ background: `${color}20`, color, border: `1.5px solid ${borderColor || color + "40"}`, borderRadius: 999, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>{count}</span>
      <div style={{ flex: 1, height: 1, background: `${color}25` }} />
    </div>
  );
}
 
function PaymentRow({ payment: p, idx }) {
  const sc  = getStatus(p.status);
  const tc  = getType(p.payment_type);
  const odd = isOverdue(p);
 
  return (
    <div style={{
      background: odd ? "rgba(212,133,90,0.05)" : "#fff",
      border: `1.5px solid ${odd ? "rgba(212,133,90,0.28)" : "#e8e2d6"}`,
      borderRadius: 11, padding: "14px 18px",
      animation: `msp-row-in 0.3s ease ${Math.min(idx * 0.04, 0.3)}s both`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        {/* Left: type + amount */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ background: tc.bg, color: tc.color, border: `1.5px solid ${tc.border}`, padding: "3px 11px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
            {tc.label}
          </span>
          <span style={{ fontSize: 19, fontWeight: 700, color: "#1a1714", fontFamily: "'Cormorant Garamond',Georgia,serif" }}>
            {fmtMoney(p.amount, p.currency)}
          </span>
          {odd && <span style={{ fontSize: 11, color: "#d4855a", fontWeight: 700, background: "rgba(212,133,90,0.1)", border: "1px solid rgba(212,133,90,0.28)", padding: "2px 8px", borderRadius: 999 }}>⚠️ Overdue</span>}
        </div>
        {/* Right: date + status */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {p.paid_date && <span style={{ fontSize: 12, color: "#9a8c6e" }}>Paid {fmtDate(p.paid_date)}</span>}
          {!p.paid_date && p.due_date && <span style={{ fontSize: 12, color: odd ? "#d4855a" : "#9a8c6e", fontWeight: odd ? 600 : 400 }}>Due {fmtDate(p.due_date)}</span>}
          <span style={{ background: sc.bg, color: sc.color, border: `1.5px solid ${sc.border}`, padding: "3px 11px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
            {sc.label}
          </span>
        </div>
      </div>
      {/* Recipient */}
      <div style={{ fontSize: 12.5, color: "#9a8c6e", display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{ color: "#c9b87a" }}>→</span>
        {p.recipient_name
          ? <><strong style={{ color: "#6b6248" }}>{p.recipient_name}</strong> <span style={{ background: "#f0ece3", color: "#9a8c6e", padding: "1px 7px", borderRadius: 999, fontSize: 10.5, fontWeight: 600 }}>{p.recipient_type}</span></>
          : <span style={{ color: "#2a6049", fontWeight: 600, background: "rgba(126,184,164,0.1)", border: "1px solid rgba(126,184,164,0.22)", padding: "1px 8px", borderRadius: 999, fontSize: 11 }}>🏢 Company</span>
        }
        {p.transaction_ref && <span style={{ marginLeft: 8, background: "#f0ece3", color: "#9a8c6e", padding: "1px 8px", borderRadius: 999, fontSize: 10.5 }}>Ref: {p.transaction_ref}</span>}
      </div>
    </div>
  );
}
 
function ContractTab({ contract: c, selected, onSelect }) {
  const dotColor = c.status === "COMPLETED" ? "#7eb8a4" : c.status === "CANCELLED" ? "#9a8c6e" : "#c9b87a";
  return (
    <button onClick={() => onSelect(c.id)} style={{ padding: "9px 16px", borderRadius: 10, background: selected ? "#1a1714" : "#fff", color: selected ? "#f5f0e8" : "#4a4438", border: `1.5px solid ${selected ? "#1a1714" : "#e8e2d6"}`, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 12.5, fontWeight: selected ? 600 : 400, transition: "all 0.15s", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 7 }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: dotColor, display: "inline-block", flexShrink: 0 }} />
      #{c.id} — {fmtMoney(c.sale_price, c.currency)}
    </button>
  );
}
 
export default function MySalePayments() {
  const { user } = useContext(AuthContext);
  const [contracts, setContracts] = useState([]);
  const [contractsLoaded, setContractsLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const notify = useCallback((msg, type = "success") => setToast({ msg, type, key: Date.now() }), []);
 
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const res = await api.get(`/api/sales/contracts/buyer/${user.id}?page=0&size=100`);
        setContracts(res.data.content || []);
      } catch { notify("Failed to load contracts", "error"); }
      finally { setContractsLoaded(true); }
    })();
  }, [user?.id, notify]);
 
  useEffect(() => {
    if (!contractsLoaded || contracts.length === 0 || selectedId !== null) return;
    const first = contracts.find(c => c.status === "PENDING") || contracts[0];
    setSelectedId(first.id);
  }, [contractsLoaded, contracts, selectedId]);
 
  const loadPayments = useCallback(async (contractId) => {
    if (!contractId) return;
    setLoading(true);
    try {
      const [listRes, sumRes] = await Promise.all([
        api.get(`/api/sales/payments/contract/${contractId}`),
        api.get(`/api/sales/payments/contract/${contractId}/summary`),
      ]);
      setPayments(Array.isArray(listRes.data) ? listRes.data : []);
      setSummary(sumRes.data);
    } catch { notify("Failed to load payments", "error"); }
    finally { setLoading(false); }
  }, [notify]);
 
  useEffect(() => { if (selectedId) loadPayments(selectedId); }, [selectedId, loadPayments]);
 
  const paidPayments    = payments.filter(p => p.status === "PAID");
  const overduePayments = payments.filter(p => isOverdue(p));
  const pendingPayments = payments.filter(p => p.status === "PENDING" && !isOverdue(p));
  const otherPayments   = payments.filter(p => !["PAID","PENDING","REFUNDED"].includes(p.status) && !isOverdue(p));
  const totalPaid    = paidPayments.reduce((a, p) => a + Number(p.amount || 0), 0);
  const totalPending = [...pendingPayments, ...overduePayments].reduce((a, p) => a + Number(p.amount || 0), 0);
  const selectedContract = contracts.find(c => c.id === selectedId);
 
  // Progress %
  const progressPct = selectedContract && selectedContract.sale_price > 0
    ? Math.min(100, Math.round((Number(summary?.total_paid || 0) / Number(selectedContract.sale_price)) * 100))
    : 0;
 
  return (
    <MainLayout role="client">
      <style>{CSS}</style>
      <div className="msp">
 
        {/* ── Hero ── */}
        <div style={{ background: "linear-gradient(160deg,#141210 0%,#1e1a14 45%,#241e16 100%)", minHeight: 300, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 32px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.018) 1px,transparent 1px)", backgroundSize: "22px 22px", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "-60px", right: "8%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle,rgba(201,184,122,0.07) 0%,transparent 70%)", pointerEvents: "none", animation: "msp-glow 4s ease-in-out infinite" }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)" }} />
          <div style={{ position: "relative", zIndex: 1, maxWidth: 700, width: "100%", textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(201,184,122,0.1)", border: "1px solid rgba(201,184,122,0.18)", borderRadius: 999, padding: "4px 14px", marginBottom: 14 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#c9b87a", display: "inline-block", boxShadow: "0 0 6px #c9b87a" }} />
              <span style={{ fontSize: 10.5, fontWeight: 600, color: "#c9b87a", letterSpacing: "1.2px", textTransform: "uppercase" }}>Payment History</span>
            </div>
            <h1 style={{ margin: "0 0 10px", fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "clamp(28px,4vw,44px)", fontWeight: 700, color: "#f5f0e8", letterSpacing: "-0.7px", lineHeight: 1.1 }}>
              My Sale <span style={{ background: "linear-gradient(90deg,#c9b87a,#e8d9a0,#c9b87a)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Payments</span>
            </h1>
            <p style={{ margin: "0 auto 22px", fontSize: 13.5, color: "rgba(245,240,232,0.38)", fontFamily: "'DM Sans',sans-serif", lineHeight: 1.6 }}>Track payments for your property purchases</p>
            {selectedId && !loading && payments.length > 0 && (
              <div style={{ display: "flex", gap: 10, maxWidth: 560, margin: "0 auto", justifyContent: "center", flexWrap: "wrap" }}>
                {[
                  { label: "Total",       value: payments.length,         dot: "#c9b87a" },
                  { label: "Paid",        value: fmtMoney(totalPaid),     dot: "#7eb8a4" },
                  { label: "Outstanding", value: fmtMoney(totalPending),  dot: "#c9b87a" },
                  { label: "Overdue",     value: overduePayments.length,  dot: "#d4855a" },
                ].map(s => (
                  <div key={s.label} style={{ background: "rgba(245,240,232,0.06)", backdropFilter: "blur(10px)", borderRadius: 12, padding: "10px 18px", border: "1px solid rgba(245,240,232,0.1)", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: s.dot, lineHeight: 1, fontFamily: "'Cormorant Garamond',Georgia,serif" }}>{s.value}</span>
                    <span style={{ fontSize: 9.5, color: "rgba(245,240,232,0.35)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px" }}>{s.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
 
        {/* ── Toolbar ── */}
        <div style={{ background: "#fff", borderBottom: "1.5px solid #e8e2d6", padding: "0 28px", height: 46, display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "'DM Sans',sans-serif", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 10px rgba(20,16,10,0.05)" }}>
          <p style={{ margin: 0, fontSize: 12.5, color: "#9a8c6e" }}>{loading ? "Loading…" : selectedId ? `${payments.length} payment${payments.length !== 1 ? "s" : ""} · Contract #${selectedId}` : "Select a contract"}</p>
          {overduePayments.length > 0 && <span style={{ fontSize: 12, color: "#d4855a", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>⚠️ {overduePayments.length} overdue</span>}
        </div>
 
        {/* ── Content ── */}
        <div style={{ padding: "20px 24px", maxWidth: 1000, margin: "0 auto" }}>
 
          {contractsLoaded && contracts.length === 0 && (
            <div style={{ textAlign: "center", padding: "80px 32px", color: "#b0a890", fontFamily: "'DM Sans',sans-serif" }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>💳</div>
              <p style={{ fontSize: 20, fontWeight: 700, color: "#6b6340", marginBottom: 6, fontFamily: "'Cormorant Garamond',Georgia,serif" }}>No sale contracts yet</p>
              <p style={{ fontSize: 13, color: "#b0a890" }}>Payments will appear here once you have an active purchase contract.</p>
            </div>
          )}
 
          {contracts.length > 0 && (
            <>
              {/* Contract selector */}
              <div className="msp-card" style={{ padding: "18px 22px", marginBottom: 18, animation: "msp-row-in 0.3s ease both" }}>
                <p style={{ fontSize: 9.5, fontWeight: 600, color: "#b0a890", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12 }}>Select Purchase Contract</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {contracts.map(c => <ContractTab key={c.id} contract={c} selected={selectedId === c.id} onSelect={setSelectedId} />)}
                </div>
              </div>
 
              {/* Overdue alert */}
              {overduePayments.length > 0 && (
                <div style={{ background: "rgba(212,133,90,0.08)", border: "1.5px solid rgba(212,133,90,0.28)", borderRadius: 12, padding: "14px 18px", marginBottom: 18, fontSize: 13, color: "#c06030", display: "flex", alignItems: "center", gap: 8 }}>
                  🔴 You have <strong>{overduePayments.length}</strong> overdue payment{overduePayments.length !== 1 ? "s" : ""} totalling <strong>{fmtMoney(overduePayments.reduce((s, p) => s + Number(p.amount || 0), 0))}</strong>. Please contact your agent.
                </div>
              )}
 
              {/* ── Stat cards — redesigned for better visibility ── */}
              {selectedId && !loading && summary && payments.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 18 }}>
                  {[
                    { label: "Total Payments", value: payments.length,       color: "#8a7230", bg: "#fdf8ee", border: "#e8d898", icon: "📋" },
                    { label: "Total Paid",      value: fmtMoney(summary.total_paid || 0), color: "#1e5040", bg: "#edf7f2", border: "#9adbc0", icon: "✅" },
                    { label: "Outstanding",     value: fmtMoney(totalPending), color: "#6b5820", bg: "#fdf6e3", border: "#d4b860", icon: "⏳" },
                    { label: "Overdue",         value: overduePayments.length, color: overduePayments.length > 0 ? "#8b3010" : "#5a5238", bg: overduePayments.length > 0 ? "#fef0e8" : "#f5f2eb", border: overduePayments.length > 0 ? "#e89060" : "#d4ccb0", icon: overduePayments.length > 0 ? "🔴" : "✓" },
                  ].map(s => (
                    <div key={s.label} style={{ background: s.bg, borderRadius: 13, padding: "15px 18px", border: `2px solid ${s.border}`, display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 14 }}>{s.icon}</span>
                        <p style={{ fontSize: 10, color: s.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", margin: 0, opacity: 0.75 }}>{s.label}</p>
                      </div>
                      <p style={{ fontSize: 20, fontWeight: 700, color: s.color, margin: 0, fontFamily: "'Cormorant Garamond',Georgia,serif" }}>{s.value}</p>
                    </div>
                  ))}
                </div>
              )}
 
              {/* ── Progress bar — redesigned ── */}
              {selectedContract && !loading && summary && (
                <div className="msp-card" style={{ padding: "18px 22px", marginBottom: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13 }}>💰</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#8a7230", textTransform: "uppercase", letterSpacing: "0.8px" }}>Payment Progress</span>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#1a1714", fontFamily: "'Cormorant Garamond',Georgia,serif" }}>
                      {fmtMoney(summary.total_paid || 0)} <span style={{ color: "#b0a890", fontWeight: 400, fontSize: 13 }}>of</span> {fmtMoney(selectedContract.sale_price, selectedContract.currency)}
                    </span>
                  </div>
                  {/* Track */}
                  <div style={{ height: 12, background: "#e8e2d6", borderRadius: 999, overflow: "hidden", position: "relative" }}>
                    <div style={{ height: "100%", borderRadius: 999, width: `${progressPct}%`, background: progressPct >= 100 ? "linear-gradient(90deg,#5aaa80,#7eb8a4)" : "linear-gradient(90deg,#c9b87a,#e8d9a0)", transition: "width 0.7s ease", position: "relative" }}>
                      {progressPct > 8 && (
                        <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 9, fontWeight: 700, color: progressPct >= 100 ? "#0a3020" : "#5a4010", letterSpacing: "0.3px" }}>{progressPct}%</span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7 }}>
                    <span style={{ fontSize: 11, color: "#9a8c6e" }}>0%</span>
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: progressPct >= 100 ? "#2a6049" : "#8a7230" }}>
                      {progressPct >= 100 ? "✓ Fully paid" : `${progressPct}% paid`}
                    </span>
                    <span style={{ fontSize: 11, color: "#9a8c6e" }}>100%</span>
                  </div>
                </div>
              )}
 
              {/* Payments list */}
              <div className="msp-card" style={{ overflow: "hidden" }}>
                <div style={{ padding: "16px 22px", borderBottom: "1.5px solid #ece6da", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#faf7f2" }}>
                  <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1a1714", fontFamily: "'Cormorant Garamond',Georgia,serif" }}>
                    {selectedId ? `Payments — Contract #${selectedId}` : "Select a contract"}
                  </h2>
                  {!loading && payments.length > 0 && <span style={{ background: "rgba(201,184,122,0.12)", color: "#8a7230", border: "1.5px solid rgba(201,184,122,0.3)", padding: "3px 12px", borderRadius: 999, fontSize: 11.5, fontWeight: 700 }}>{payments.length} payments</span>}
                </div>
                <div style={{ padding: "18px 22px" }}>
                  {!selectedId && <div style={{ textAlign: "center", padding: "56px 20px", color: "#b0a890" }}><div style={{ fontSize: 44, marginBottom: 12 }}>👆</div><p style={{ fontSize: 14, fontFamily: "'Cormorant Garamond',Georgia,serif", color: "#6b6340" }}>Select a contract above to view its payments.</p></div>}
                  {selectedId && loading && <Skeleton />}
                  {selectedId && !loading && payments.length === 0 && <div style={{ textAlign: "center", padding: "56px 20px", color: "#b0a890" }}><div style={{ fontSize: 44, marginBottom: 12 }}>💳</div><p style={{ fontSize: 14, fontFamily: "'Cormorant Garamond',Georgia,serif", color: "#6b6340" }}>No payments found for this contract.</p></div>}
                  {selectedId && !loading && payments.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                      {overduePayments.length > 0 && <div><SectionLabel label="⚠ Overdue" count={overduePayments.length} color="#c06030" borderColor="rgba(212,133,90,0.4)" /><div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{overduePayments.map((p, i) => <PaymentRow key={p.id} payment={p} idx={i} />)}</div></div>}
                      {pendingPayments.length > 0 && <div><SectionLabel label="Pending" count={pendingPayments.length} color="#8a7230" borderColor="rgba(201,184,122,0.4)" /><div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{pendingPayments.map((p, i) => <PaymentRow key={p.id} payment={p} idx={i} />)}</div></div>}
                      {paidPayments.length > 0 && <div><SectionLabel label="Paid" count={paidPayments.length} color="#1e5040" borderColor="rgba(126,184,164,0.4)" /><div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{paidPayments.map((p, i) => <PaymentRow key={p.id} payment={p} idx={i} />)}</div></div>}
                      {otherPayments.length > 0 && <div><SectionLabel label="Other" count={otherPayments.length} color="#6b6248" borderColor="rgba(160,153,126,0.4)" /><div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{otherPayments.map((p, i) => <PaymentRow key={p.id} payment={p} idx={i} />)}</div></div>}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </MainLayout>
  );
}
 