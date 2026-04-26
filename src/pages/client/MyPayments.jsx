import { useState, useEffect, useCallback, useContext } from "react";
import MainLayout from "../../components/layout/Layout";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";

// ─── Constants ────────────────────────────────────────────────────────────────
const PAY_STATUS = {
  PENDING:  { bg: "#fffbeb", color: "#c9a84c", border: "#f0d878" },
  PAID:     { bg: "#edf5f0", color: "#2a6049", border: "#a3c9b0" },
  FAILED:   { bg: "#fff5ee", color: "#8b4513", border: "#f5c6a0" },
  OVERDUE:  { bg: "#fff5ee", color: "#8b3a1c", border: "#e8b090" },
  REFUNDED: { bg: "#f5f2eb", color: "#5a5f3a", border: "#d9d4c7" },
};

const CONTRACT_STATUS_STYLE = {
  ACTIVE:            { bg: "#edf5f0", color: "#2a6049", border: "#a3c9b0" },
  ENDED:             { bg: "#f5f2eb", color: "#8a8469", border: "#d9d4c7" },
  CANCELLED:         { bg: "#fff5ee", color: "#8b4513", border: "#f5c6a0" },
  PENDING_SIGNATURE: { bg: "#fffbeb", color: "#c9a84c", border: "#f0d878" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate  = (d) => d ? new Date(d).toLocaleDateString("sq-AL") : "—";
const fmtMoney = (v) => v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";

function isOverdue(p) {
  if (!p.due_date || p.status !== "PENDING") return false;
  return new Date(p.due_date) < new Date();
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 9999,
      background: type === "error" ? "#fee2e2" : "#ecfdf5",
      color: type === "error" ? "#b91c1c" : "#047857",
      padding: "12px 20px", borderRadius: 10, fontSize: 13.5, fontWeight: 500,
      boxShadow: "0 4px 18px rgba(0,0,0,0.12)", maxWidth: 340,
      fontFamily: "'Georgia', serif",
    }}>{msg}</div>
  );
}

// ─── Contract Selector ────────────────────────────────────────────────────────
function ContractSelector({ contracts, selectedId, onSelect }) {
  if (contracts.length === 0) return null;

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <button
        onClick={() => onSelect(null)}
        style={{
          padding: "7px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600,
          border: "1.5px solid",
          borderColor: selectedId === null ? "#5a5f3a" : "#d9d4c7",
          background:  selectedId === null ? "#5a5f3a" : "#fff",
          color:       selectedId === null ? "#fff"    : "#5a5f3a",
          cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
        }}>
        Të gjitha
      </button>
      {contracts.map(c => {
        const s  = CONTRACT_STATUS_STYLE[c.status] || CONTRACT_STATUS_STYLE.ENDED;
        const active = selectedId === c.id;
        return (
          <button key={c.id} onClick={() => onSelect(c.id)}
            style={{
              padding: "7px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600,
              border: "1.5px solid",
              borderColor: active ? "#5a5f3a" : "#d9d4c7",
              background:  active ? "#5a5f3a" : "#fff",
              color:       active ? "#fff"    : "#5a5f3a",
              cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
              display: "flex", alignItems: "center", gap: 7,
            }}>
            Kontratë #{c.id}
            <span style={{
              background: active ? "rgba(255,255,255,0.2)" : s.bg,
              color:      active ? "#fff" : s.color,
              border:     `1px solid ${active ? "rgba(255,255,255,0.3)" : s.border}`,
              padding: "1px 7px", borderRadius: 20, fontSize: 11, fontWeight: 700,
            }}>
              {c.status?.replace("_", " ")}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Payment Item ─────────────────────────────────────────────────────────────
function PaymentItem({ payment }) {
  const overdue       = isOverdue(payment);
  const displayStatus = overdue && payment.status === "PENDING" ? "OVERDUE" : payment.status;
  const s             = PAY_STATUS[displayStatus] || { bg: "#f5f2eb", color: "#8a8469", border: "#d9d4c7" };

  const typeIcon = {
    RENT:      "💳",
    DEPOSIT:   "🔒",
    LATE_FEE:  "🔴",
    REFUND:    "↩️",
  }[payment.payment_type] || "💳";

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 18px",
      background: overdue ? "#fff9f5" : "#fff",
      borderRadius: 12,
      border: `1px solid ${overdue ? "#f5c6a0" : "#e5e0d4"}`,
      transition: "box-shadow 0.15s",
      fontFamily: "'Georgia', serif",
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(90,95,58,0.1)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}
    >
      {/* Left */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 10, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: s.bg, border: `1px solid ${s.border}`, fontSize: 18,
        }}>
          {payment.status === "PAID" ? "✓" : overdue ? "⚠️" : typeIcon}
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 800, fontSize: 14, color: "#2c2c1e" }}>
              {fmtMoney(payment.amount)} {payment.currency}
            </span>
            <span style={{ background: "#f5f2eb", color: "#6b6651", padding: "1px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
              {payment.payment_type}
            </span>
            <span style={{ background: "#edf2e8", color: "#3d5227", border: "1px solid #c8d4b0", padding: "1px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
              #{payment.contract_id}
            </span>
          </div>
          <p style={{ fontSize: 12, color: "#8a8469", margin: 0 }}>
            Due: {fmtDate(payment.due_date)}
            {payment.paid_date && ` · Paguar: ${fmtDate(payment.paid_date)}`}
            {payment.payment_method && ` · ${payment.payment_method}`}
            {payment.transaction_ref && ` · Ref: ${payment.transaction_ref}`}
          </p>
          {payment.notes && (
            <p style={{ fontSize: 12, color: "#a0997e", margin: "2px 0 0", fontStyle: "italic" }}>{payment.notes}</p>
          )}
        </div>
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        {overdue && <span style={{ fontSize: 12, color: "#8b4513", fontWeight: 700 }}>⚠️ Vonuar</span>}
        <span style={{
          background: s.bg, color: s.color, border: `1px solid ${s.border}`,
          padding: "3px 11px", borderRadius: 20, fontSize: 11.5, fontWeight: 700,
        }}>
          {displayStatus}
        </span>
      </div>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ label, count, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
      <span style={{ fontSize: 11.5, fontWeight: 800, color, textTransform: "uppercase", letterSpacing: "0.7px" }}>
        {label}
      </span>
      <span style={{ background: "#f5f2eb", color: "#8a8469", border: "1px solid #e5e0d4", padding: "1px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
        {count}
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function ClientPayments() {
  const { user } = useContext(AuthContext);

  const [contracts,        setContracts]        = useState([]);
  const [contractsLoaded,  setContractsLoaded]  = useState(false);
  const [payments,         setPayments]         = useState([]);
  const [summary,          setSummary]          = useState(null);
  const [loading,          setLoading]          = useState(false);
  const [selectedContractId, setSelectedContractId] = useState(null);
  const [toast,            setToast]            = useState(null);

  const notify = useCallback((msg, type = "success") =>
    setToast({ msg, type, key: Date.now() }), []);

  // Load contracts
  useEffect(() => {
    if (!user?.id) return;
    const loadContracts = async () => {
      try {
        const res = await api.get(`/api/contracts/lease/client/${user.id}?page=0&size=100`);
        setContracts(res.data.content || []);
      } catch { notify("Gabim gjatë ngarkimit të kontratave", "error"); }
      finally   { setContractsLoaded(true); }
    };
    loadContracts();
  }, [user?.id, notify]);

  // Load payments for selected contract
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
    } catch { notify("Gabim gjatë ngarkimit të pagesave", "error"); }
    finally   { setLoading(false); }
  }, [notify]);

  // Auto-select first active contract
  useEffect(() => {
    if (!contractsLoaded || contracts.length === 0 || selectedContractId !== null) return;
    const active = contracts.find(c => c.status === "ACTIVE") || contracts[0];
    setSelectedContractId(active.id);
    loadPayments(active.id);
  }, [contractsLoaded, contracts, selectedContractId, loadPayments]);

  const handleSelectContract = (id) => {
    setSelectedContractId(id);
    loadPayments(id);
  };

  // Computed
  const overduePays = payments.filter(p => isOverdue(p) || p.status === "OVERDUE");
  const pendingPays = payments.filter(p => p.status === "PENDING" && !isOverdue(p));
  const paidPays    = payments.filter(p => p.status === "PAID");
  const otherPays   = payments.filter(p => !["PAID","PENDING","OVERDUE"].includes(p.status) && !isOverdue(p));

  const totalPaid    = paidPays.reduce((acc, p)    => acc + Number(p.amount || 0), 0);
  const totalPending = [...pendingPays, ...overduePays].reduce((acc, p) => acc + Number(p.amount || 0), 0);

  return (
    <MainLayout role="client">
      <div style={{ background: "#f5f2eb", minHeight: "100vh", fontFamily: "'Georgia', serif" }}>

        {/* ── Hero ── */}
        <div style={{ background: "linear-gradient(135deg, #5a5f3a 0%, #3d4228 100%)", padding: "48px 32px 40px", textAlign: "center" }}>
          <h1 style={{ margin: "0 0 8px", fontSize: "32px", fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>
            Pagesat e Mia
          </h1>
          <p style={{ margin: "0 0 24px", color: "#c8ccaa", fontSize: "15px" }}>
            Shiko historikun e pagesave të qirasë
          </p>

          {selectedContractId && !loading && payments.length > 0 && (
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              {[
                { label: "Total Pagesa", value: payments.length,       accent: "#c8ccaa" },
                { label: "Paguar",       value: fmtMoney(totalPaid),   accent: "#a3c9b0" },
                { label: "Në Pritje",    value: fmtMoney(totalPending),accent: "#c9a84c" },
                { label: "Me Vonesë",    value: overduePays.length,    accent: "#f5c6a0" },
              ].map(stat => (
                <div key={stat.label} style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(6px)", borderRadius: 12, padding: "12px 20px", border: "1px solid rgba(255,255,255,0.15)", minWidth: 90 }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: stat.accent, lineHeight: 1 }}>{stat.value}</div>
                  <div style={{ fontSize: 11, color: "#c8ccaa", fontWeight: 600, marginTop: 3, textTransform: "uppercase", letterSpacing: "0.5px" }}>{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "28px 24px" }}>

          {/* No contracts */}
          {contractsLoaded && contracts.length === 0 && (
            <div style={{ textAlign: "center", padding: "64px 32px", color: "#8a8469" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>💳</div>
              <h3 style={{ color: "#5a5f3a", margin: "0 0 8px", fontSize: 18 }}>Nuk keni kontrata aktive</h3>
              <p style={{ margin: 0, fontSize: 14 }}>Pagesat do të shfaqen këtu pasi të keni një kontratë qiraje aktive.</p>
            </div>
          )}

          {contracts.length > 0 && (
            <>
              {/* Contract selector card */}
              <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e0d4", boxShadow: "0 2px 12px rgba(90,95,58,0.08)", padding: "18px 22px", marginBottom: 20 }}>
                <p style={{ fontSize: 11.5, fontWeight: 700, color: "#a0997e", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 12 }}>
                  Zgjidh kontratën
                </p>
                <ContractSelector
                  contracts={contracts}
                  selectedId={selectedContractId}
                  onSelect={handleSelectContract}
                />
              </div>

              {/* Overdue alert */}
              {overduePays.length > 0 && (
                <div style={{ background: "#fff5ee", border: "1px solid #f5c6a0", borderRadius: 12, padding: "14px 20px", marginBottom: 20, fontSize: 13.5, color: "#8b4513", fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
                  🔴 Keni <strong>{overduePays.length}</strong> pagesë me vonesë —
                  <strong>{fmtMoney(overduePays.reduce((s, p) => s + Number(p.amount || 0), 0))}</strong>.
                  Ju lutemi kontaktoni agjentin tuaj.
                </div>
              )}

              {/* Summary stat cards */}
              {selectedContractId && !loading && summary && payments.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 22 }}>
                  {[
                    { label: "Total Pagesa", value: payments.length,                                         color: "#5a5f3a", bg: "#f5f2eb", border: "#d9d4c7" },
                    { label: "Paguar",       value: `€${Number(summary.total_paid    || 0).toLocaleString()}`,color: "#2a6049", bg: "#edf5f0", border: "#a3c9b0" },
                    { label: "Në Pritje",    value: `€${Number(summary.total_pending || 0).toLocaleString()}`,color: "#c9a84c", bg: "#fffbeb", border: "#f0d878" },
                    { label: "Me Vonesë",    value: overduePays.length,                                       color: "#8b4513", bg: "#fff5ee", border: "#f5c6a0" },
                  ].map(s => (
                    <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: "14px 16px", border: `1px solid ${s.border}`, boxShadow: "0 2px 8px rgba(90,95,58,0.06)" }}>
                      <p style={{ fontSize: 11, color: "#a0997e", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{s.label}</p>
                      <p style={{ fontSize: 20, fontWeight: 900, color: s.color, margin: 0 }}>{s.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Payment list */}
              <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e0d4", boxShadow: "0 2px 12px rgba(90,95,58,0.08)", overflow: "hidden" }}>
                {/* Card header */}
                <div style={{ padding: "16px 22px", borderBottom: "1px solid #e5e0d4", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#2c2c1e" }}>
                    {selectedContractId ? `Pagesat — Kontratë #${selectedContractId}` : "Zgjidh një kontratë"}
                  </h2>
                  {!loading && payments.length > 0 && (
                    <span style={{ background: "#edf2e8", color: "#3d5227", border: "1px solid #c8d4b0", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                      {payments.length} pagesa
                    </span>
                  )}
                </div>

                <div style={{ padding: "18px 22px" }}>
                  {!selectedContractId ? (
                    <div style={{ textAlign: "center", padding: "48px 20px", color: "#8a8469" }}>
                      <div style={{ fontSize: 40, marginBottom: 10 }}>👆</div>
                      <p style={{ fontSize: 14 }}>Zgjidh një kontratë për të parë pagesat.</p>
                    </div>
                  ) : loading ? (
                    <div style={{ textAlign: "center", padding: "40px 0" }}>
                      <div style={{ width: 28, height: 28, margin: "0 auto", border: "3px solid #e5e0d4", borderTop: "3px solid #5a5f3a", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
                    </div>
                  ) : payments.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "48px 20px", color: "#8a8469" }}>
                      <div style={{ fontSize: 40, marginBottom: 10 }}>💳</div>
                      <p style={{ fontSize: 14 }}>Nuk ka pagesa për këtë kontratë aktualisht.</p>
                    </div>
                  ) : (
                    <>
                      {/* Overdue */}
                      {overduePays.length > 0 && (
                        <div style={{ marginBottom: 20 }}>
                          <SectionHeader label="⚠️ Me Vonesë" count={overduePays.length} color="#8b4513" />
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {overduePays.map(p => <PaymentItem key={p.id} payment={p} />)}
                          </div>
                        </div>
                      )}

                      {/* Pending */}
                      {pendingPays.length > 0 && (
                        <div style={{ marginBottom: 20 }}>
                          <SectionHeader label="Në Pritje" count={pendingPays.length} color="#c9a84c" />
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {pendingPays.map(p => <PaymentItem key={p.id} payment={p} />)}
                          </div>
                        </div>
                      )}

                      {/* Paid */}
                      {paidPays.length > 0 && (
                        <div style={{ marginBottom: 20 }}>
                          <SectionHeader label="Të Paguara" count={paidPays.length} color="#2a6049" />
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {paidPays.map(p => <PaymentItem key={p.id} payment={p} />)}
                          </div>
                        </div>
                      )}

                      {/* Other (FAILED, REFUNDED…) */}
                      {otherPays.length > 0 && (
                        <div style={{ marginBottom: 8 }}>
                          <SectionHeader label="Të tjera" count={otherPays.length} color="#8a8469" />
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {otherPays.map(p => <PaymentItem key={p.id} payment={p} />)}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:.9} }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>
    </MainLayout>
  );
}