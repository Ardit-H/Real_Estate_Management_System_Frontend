import { useState, useEffect, useCallback, useContext } from "react";
import MainLayout from "../../components/layout/Layout";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_STYLE = {
  PENDING:  { bg: "#fffbeb", color: "#d97706" },
  PAID:     { bg: "#ecfdf5", color: "#059669" },
  FAILED:   { bg: "#fef2f2", color: "#dc2626" },
  OVERDUE:  { bg: "#fff1f2", color: "#be123c" },
  REFUNDED: { bg: "#f5f3ff", color: "#7c3aed" },
};

const CONTRACT_STATUS_STYLE = {
  ACTIVE:            { bg: "#ecfdf5", color: "#059669" },
  ENDED:             { bg: "#f1f5f9", color: "#64748b" },
  CANCELLED:         { bg: "#fef2f2", color: "#dc2626" },
  PENDING_SIGNATURE: { bg: "#fffbeb", color: "#d97706" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate  = (d) => d ? new Date(d).toLocaleDateString("sq-AL") : "—";
const fmtMoney = (v) => v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";

function isOverdue(p) {
  if (!p.due_date || p.status !== "PENDING") return false;
  return new Date(p.due_date) < new Date();
}

// ─── Shared UI ────────────────────────────────────────────────────────────────
function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 9999,
      background: type === "error" ? "#fee2e2" : "#ecfdf5",
      color: type === "error" ? "#b91c1c" : "#047857",
      padding: "12px 20px", borderRadius: 10, fontSize: 13.5, fontWeight: 500,
      boxShadow: "0 4px 18px rgba(0,0,0,0.12)", maxWidth: 340,
    }}>{msg}</div>
  );
}

function Loader() {
  return (
    <div style={{ textAlign: "center", padding: "52px 0" }}>
      <div style={{ width: 30, height: 30, margin: "0 auto",
        border: "3px solid #e8edf4", borderTop: "3px solid #6366f1",
        borderRadius: "50%", animation: "spin .7s linear infinite" }} />
    </div>
  );
}

function EmptyState({ icon, text, sub }) {
  return (
    <div style={{ textAlign: "center", padding: "64px 20px", color: "#94a3b8" }}>
      <div style={{ fontSize: 44, marginBottom: 12 }}>{icon}</div>
      <p style={{ fontSize: 15, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>{text}</p>
      {sub && <p style={{ fontSize: 13 }}>{sub}</p>}
    </div>
  );
}

function StatusBadge({ status, styleMap }) {
  const s = (styleMap || STATUS_STYLE)[status] || { bg: "#f1f5f9", color: "#64748b" };
  return (
    <span style={{ background: s.bg, color: s.color,
      padding: "3px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 600 }}>
      {status?.replace("_", " ")}
    </span>
  );
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6,
      justifyContent: "flex-end", padding: "14px 16px" }}>
      <button className="btn btn--secondary btn--sm" disabled={page === 0}
        onClick={() => onChange(page - 1)}>← Prev</button>
      <span style={{ fontSize: 13, color: "#64748b", padding: "0 8px" }}>
        {page + 1} / {totalPages}
      </span>
      <button className="btn btn--secondary btn--sm" disabled={page >= totalPages - 1}
        onClick={() => onChange(page + 1)}>Next →</button>
    </div>
  );
}

// ─── Contract Selector ────────────────────────────────────────────────────────
function ContractSelector({ contracts, selectedId, onSelect }) {
  if (contracts.length === 0) return null;
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
      <button
        onClick={() => onSelect(null)}
        style={{
          padding: "7px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500,
          border: "1.5px solid",
          borderColor: selectedId === null ? "#6366f1" : "#cbd5e1",
          background:  selectedId === null ? "#eef2ff" : "#fff",
          color:       selectedId === null ? "#6366f1" : "#475569",
          cursor: "pointer",
        }}>
        Të gjitha
      </button>
      {contracts.map(c => (
        <button
          key={c.id}
          onClick={() => onSelect(c.id)}
          style={{
            padding: "7px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500,
            border: "1.5px solid",
            borderColor: selectedId === c.id ? "#6366f1" : "#cbd5e1",
            background:  selectedId === c.id ? "#eef2ff" : "#fff",
            color:       selectedId === c.id ? "#6366f1" : "#475569",
            cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
          }}>
          Kontratë #{c.id}
          <StatusBadge status={c.status} styleMap={CONTRACT_STATUS_STYLE} />
        </button>
      ))}
    </div>
  );
}

// ─── Payment Timeline Item ────────────────────────────────────────────────────
function PaymentItem({ payment }) {
  const overdue = isOverdue(payment);
  const s = STATUS_STYLE[payment.status] || { bg: "#f1f5f9", color: "#64748b" };
  const displayStatus = overdue && payment.status === "PENDING" ? "OVERDUE" : payment.status;
  const dispStyle = STATUS_STYLE[displayStatus] || s;

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 18px",
      background: overdue ? "#fff9f9" : "#fff",
      borderRadius: 10,
      border: `1px solid ${overdue ? "#fecaca" : "#e8edf4"}`,
      transition: "box-shadow 0.15s",
    }}>
      {/* Left: type + dates */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {/* Icon */}
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: dispStyle.bg, fontSize: 18,
        }}>
          {payment.status === "PAID" ? "✓" :
           overdue ? "⚠️" :
           payment.payment_type === "DEPOSIT" ? "🔒" :
           payment.payment_type === "LATE_FEE" ? "🔴" : "💳"}
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <span style={{ fontWeight: 600, fontSize: 13.5 }}>
              {fmtMoney(payment.amount)} {payment.currency}
            </span>
            <span style={{ background: "#f1f5f9", color: "#475569",
              padding: "1px 7px", borderRadius: 20, fontSize: 11, fontWeight: 500 }}>
              {payment.payment_type}
            </span>
            <span style={{ background: "#eef2ff", color: "#6366f1",
              padding: "1px 7px", borderRadius: 20, fontSize: 11, fontWeight: 500 }}>
              #{payment.contract_id}
            </span>
          </div>
          <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
            Due: {fmtDate(payment.due_date)}
            {payment.paid_date && ` · Paguar: ${fmtDate(payment.paid_date)}`}
            {payment.payment_method && ` · ${payment.payment_method}`}
            {payment.transaction_ref && ` · Ref: ${payment.transaction_ref}`}
          </p>
          {payment.notes && (
            <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0", fontStyle: "italic" }}>
              {payment.notes}
            </p>
          )}
        </div>
      </div>

      {/* Right: status */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <span style={{ background: dispStyle.bg, color: dispStyle.color,
          padding: "3px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 600 }}>
          {displayStatus}
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function ClientPayments() {
  const { user } = useContext(AuthContext);

  // Contracts (for tab selector)
  const [contracts,    setContracts]    = useState([]);
  const [contractsLoaded, setContractsLoaded] = useState(false);

  // Payments state
  const [payments,     setPayments]     = useState([]);
  const [summary,      setSummary]      = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [selectedContractId, setSelectedContractId] = useState(null);

  const [toast, setToast] = useState(null);

  const notify = useCallback((msg, type = "success") =>
    setToast({ msg, type, key: Date.now() }), []);

  // ── Load client contracts ────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;
    const loadContracts = async () => {
      try {
        const res = await api.get(`/api/contracts/lease/client/${user.id}?page=0&size=100`);
        setContracts(res.data.content || []);
      } catch {
        notify("Gabim gjatë ngarkimit të kontratave", "error");
      } finally {
        setContractsLoaded(true);
      }
    };
    loadContracts();
  }, [user?.id, notify]);

  // ── Load payments when contract selected ───────────────────────────────────
  const loadPayments = useCallback(async (contractId) => {
    if (!contractId) {
      setPayments([]);
      setSummary(null);
      return;
    }
    setLoading(true);
    try {
      const [listRes, sumRes] = await Promise.all([
        api.get(`/api/payments/contract/${contractId}`),
        api.get(`/api/payments/contract/${contractId}/summary`),
      ]);
      setPayments(Array.isArray(listRes.data) ? listRes.data : []);
      setSummary(sumRes.data);
    } catch {
      notify("Gabim gjatë ngarkimit të pagesave", "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  // Auto-select first active contract
  useEffect(() => {
    if (!contractsLoaded) return;
    if (contracts.length > 0 && selectedContractId === null) {
      const active = contracts.find(c => c.status === "ACTIVE") || contracts[0];
      setSelectedContractId(active.id);
      loadPayments(active.id);
    }
  }, [contractsLoaded, contracts, selectedContractId, loadPayments]);

  const handleSelectContract = (id) => {
    setSelectedContractId(id);
    loadPayments(id);
  };

  // ── Computed stats ────────────────────────────────────────────────────────────
  const overduePays  = payments.filter(p => isOverdue(p) || p.status === "OVERDUE");
  const pendingPays  = payments.filter(p => p.status === "PENDING" && !isOverdue(p));
  const paidPays     = payments.filter(p => p.status === "PAID");

  const totalPaid    = paidPays.reduce((acc, p) => acc + Number(p.amount || 0), 0);
  const totalPending = [...pendingPays, ...overduePays].reduce((acc, p) => acc + Number(p.amount || 0), 0);

  return (
    <MainLayout role="client">
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px);} to{opacity:1;transform:translateY(0);} }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>

      <div className="page-header">
        <div>
          <h1 className="page-title">Pagesat e Mia</h1>
          <p className="page-subtitle">Shiko historikun e pagesave të qirasë</p>
        </div>
      </div>

      {/* No contracts state */}
      {contractsLoaded && contracts.length === 0 && (
        <div className="card">
          <EmptyState
            icon="💳"
            text="Nuk keni kontrata aktive"
            sub="Pagesat do të shfaqen këtu pasi të keni një kontratë qiraje aktive."
          />
        </div>
      )}

      {contracts.length > 0 && (
        <>
          {/* Contract selector */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ padding: "16px 20px" }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 10 }}>
                Zgjidh kontratën:
              </p>
              <ContractSelector
                contracts={contracts}
                selectedId={selectedContractId}
                onSelect={handleSelectContract}
              />
            </div>
          </div>

          {/* Overdue alert */}
          {overduePays.length > 0 && (
            <div style={{ background: "#fff1f2", border: "1px solid #fecdd3",
              borderRadius: 10, padding: "12px 18px", marginBottom: 20,
              fontSize: 13.5, color: "#be123c", fontWeight: 500 }}>
              🔴 Keni <strong>{overduePays.length}</strong> pagesë me vonesë totalisht{" "}
              <strong>{fmtMoney(overduePays.reduce((s, p) => s + Number(p.amount || 0), 0))}</strong>.
              Ju lutemi kontaktoni agjentin tuaj.
            </div>
          )}

          {/* Summary cards */}
          {selectedContractId && !loading && payments.length > 0 && (
            <div style={{ display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: 14, marginBottom: 24 }}>
              {[
                { label: "Total Pagesa", value: payments.length,     color: "#6366f1", bg: "#eef2ff" },
                { label: "Paguar",       value: fmtMoney(totalPaid), color: "#059669", bg: "#ecfdf5" },
                { label: "Në Pritje",    value: fmtMoney(totalPending), color: "#d97706", bg: "#fffbeb" },
                { label: "Me Vonesë",    value: overduePays.length,  color: "#dc2626", bg: "#fef2f2" },
              ].map(s => (
                <div key={s.label} className="stat-card" style={{ background: s.bg }}>
                  <div className="stat-card__label">{s.label}</div>
                  <div className="stat-card__value" style={{ color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Payment list */}
          <div className="card">
            <div className="card__header">
              <h2 className="card__title">
                {selectedContractId
                  ? `Pagesat — Kontratë #${selectedContractId}`
                  : "Zgjidh një kontratë"}
              </h2>
              {!loading && payments.length > 0 && (
                <span style={{ background: "#eef2ff", color: "#6366f1",
                  padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500 }}>
                  {payments.length} pagesa
                </span>
              )}
            </div>

            {!selectedContractId ? (
              <EmptyState icon="👆" text="Zgjidh një kontratë" sub="Kliko mbi një kontratë për të parë pagesat." />
            ) : loading ? <Loader /> : payments.length === 0 ? (
              <EmptyState icon="💳" text="Nuk ka pagesa" sub="Nuk ka pagesa për këtë kontratë aktualisht." />
            ) : (
              <>
                {/* Group by status: overdue first, then pending, then paid */}
                {overduePays.length > 0 && (
                  <div style={{ padding: "0 16px 4px" }}>
                    <p style={{ fontSize: 11.5, fontWeight: 700, color: "#be123c",
                      textTransform: "uppercase", letterSpacing: "0.06em",
                      marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                      ⚠️ Me Vonesë ({overduePays.length})
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                      {overduePays.map(p => <PaymentItem key={p.id} payment={p} />)}
                    </div>
                  </div>
                )}

                {pendingPays.length > 0 && (
                  <div style={{ padding: "0 16px 4px" }}>
                    <p style={{ fontSize: 11.5, fontWeight: 700, color: "#d97706",
                      textTransform: "uppercase", letterSpacing: "0.06em",
                      marginBottom: 10 }}>
                      Në Pritje ({pendingPays.length})
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                      {pendingPays.map(p => <PaymentItem key={p.id} payment={p} />)}
                    </div>
                  </div>
                )}

                {paidPays.length > 0 && (
                  <div style={{ padding: "0 16px 4px" }}>
                    <p style={{ fontSize: 11.5, fontWeight: 700, color: "#059669",
                      textTransform: "uppercase", letterSpacing: "0.06em",
                      marginBottom: 10 }}>
                      Të Paguara ({paidPays.length})
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                      {paidPays.map(p => <PaymentItem key={p.id} payment={p} />)}
                    </div>
                  </div>
                )}

                {/* Remaining statuses (FAILED, REFUNDED) */}
                {payments.filter(p =>
                  !["PAID", "PENDING", "OVERDUE"].includes(p.status) && !isOverdue(p)
                ).length > 0 && (
                  <div style={{ padding: "0 16px 16px" }}>
                    <p style={{ fontSize: 11.5, fontWeight: 700, color: "#64748b",
                      textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                      Të tjera
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {payments.filter(p =>
                        !["PAID", "PENDING", "OVERDUE"].includes(p.status) && !isOverdue(p)
                      ).map(p => <PaymentItem key={p.id} payment={p} />)}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {toast && (
        <Toast key={toast.key} msg={toast.msg} type={toast.type}
          onDone={() => setToast(null)} />
      )}
    </MainLayout>
  );
}
