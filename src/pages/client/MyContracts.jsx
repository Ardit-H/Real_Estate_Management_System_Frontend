import { useState, useEffect, useCallback, useContext } from "react";
import MainLayout from "../../components/layout/Layout";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_STYLE = {
  ACTIVE:            { bg: "#ecfdf5", color: "#059669", dot: "#10b981" },
  ENDED:             { bg: "#f1f5f9", color: "#64748b", dot: "#94a3b8" },
  CANCELLED:         { bg: "#fef2f2", color: "#dc2626", dot: "#ef4444" },
  PENDING_SIGNATURE: { bg: "#fffbeb", color: "#d97706", dot: "#f59e0b" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate  = (d) => d ? new Date(d).toLocaleDateString("sq-AL") : "—";
const fmtDT    = (d) => d ? new Date(d).toLocaleString("sq-AL", {
  day: "2-digit", month: "2-digit", year: "numeric",
  hour: "2-digit", minute: "2-digit" }) : "—";
const fmtMoney = (v, cur = "EUR") =>
  v != null ? `€${Number(v).toLocaleString("de-DE")} ${cur}` : "—";

function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
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

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || { bg: "#f1f5f9", color: "#64748b", dot: "#94a3b8" };
  return (
    <span style={{ background: s.bg, color: s.color,
      padding: "3px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 600,
      display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%",
        background: s.dot, display: "inline-block" }} />
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

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function ContractDetailModal({ contract, onClose, onViewPayments }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const days = daysUntil(contract.end_date);
  const expiring = days !== null && days <= 30 && days > 0 && contract.status === "ACTIVE";
  const expired  = days !== null && days <= 0;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(15,23,42,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: "100%", maxWidth: 600, background: "#fff",
        borderRadius: 16, boxShadow: "0 20px 60px rgba(15,23,42,0.18)",
        maxHeight: "90vh", overflowY: "auto", animation: "fadeUp .2s ease" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 24px", borderBottom: "1px solid #e8edf4" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>📄</span>
            <div>
              <p style={{ fontWeight: 700, fontSize: 15, margin: 0 }}>
                Kontratë Qiraje #{contract.id}
              </p>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
                Prona #{contract.property_id}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, border: "none",
            background: "none", color: "#94a3b8", cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>

        <div style={{ padding: "22px 24px" }}>
          {/* Status banner */}
          <div style={{ display: "flex", justifyContent: "space-between",
            alignItems: "center", background: "#f8fafc", borderRadius: 10,
            padding: "12px 16px", marginBottom: 20 }}>
            <StatusBadge status={contract.status} />
            {contract.status === "ACTIVE" && days !== null && (
              <span style={{
                fontSize: 12.5, fontWeight: 600,
                color: expiring ? "#d97706" : expired ? "#dc2626" : "#64748b",
              }}>
                {expiring ? `⚠️ Skadon pas ${days} ditësh` :
                 expired  ? "⚠️ Kontrata ka skaduar" :
                            `${days} ditë të mbetura`}
              </span>
            )}
          </div>

          {/* Expiring warning */}
          {expiring && (
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a",
              borderRadius: 8, padding: "10px 14px", marginBottom: 18,
              fontSize: 13, color: "#92400e" }}>
              ⚠️ Kontrata juaj skadon brenda <strong>{days} ditësh</strong>. Kontaktoni agjentin tuaj për rinovim.
            </div>
          )}

          {/* Details grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            {[
              { label: "Prona",         value: `#${contract.property_id}` },
              { label: "Agjenti",       value: contract.agent_id ? `#${contract.agent_id}` : "—" },
              { label: "Data fillimit", value: fmtDate(contract.start_date) },
              { label: "Data mbarimit", value: fmtDate(contract.end_date) },
              { label: "Qiraja mujore", value: fmtMoney(contract.rent, contract.currency) },
              { label: "Depozita",      value: fmtMoney(contract.deposit, contract.currency) },
              { label: "Krijuar më",    value: fmtDT(contract.created_at) },
              { label: "Ndryshuar",     value: fmtDT(contract.updated_at) },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: "#f8fafc", borderRadius: 8,
                padding: "10px 14px", border: "1px solid #e8edf4" }}>
                <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600,
                  textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{label}</p>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Contract file link */}
          {contract.contract_file_url && (
            <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd",
              borderRadius: 8, padding: "10px 14px", marginBottom: 20 }}>
              <a href={contract.contract_file_url} target="_blank" rel="noopener noreferrer"
                style={{ color: "#0ea5e9", fontSize: 13.5, fontWeight: 500, textDecoration: "none" }}>
                📄 Hap dokumentin e kontratës ↗
              </a>
            </div>
          )}

          {/* Actions */}
          <div style={{ borderTop: "1px solid #e8edf4", paddingTop: 18,
            display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn btn--secondary" onClick={onClose}>Mbyll</button>
            {contract.status === "ACTIVE" && (
              <button className="btn btn--primary"
                onClick={() => { onClose(); onViewPayments(contract); }}>
                💳 Shiko Pagesat
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Payments Modal (read-only for client) ────────────────────────────────────
function ContractPaymentsModal({ contract, onClose, notify }) {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary]   = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [listRes, sumRes] = await Promise.all([
          api.get(`/api/payments/contract/${contract.id}`),
          api.get(`/api/payments/contract/${contract.id}/summary`),
        ]);
        setPayments(Array.isArray(listRes.data) ? listRes.data : []);
        setSummary(sumRes.data);
      } catch {
        notify("Gabim gjatë ngarkimit të pagesave", "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [contract.id, notify]);

  const PAY_STATUS = {
    PENDING:  { bg: "#fffbeb", color: "#d97706" },
    PAID:     { bg: "#ecfdf5", color: "#059669" },
    FAILED:   { bg: "#fef2f2", color: "#dc2626" },
    OVERDUE:  { bg: "#fff1f2", color: "#be123c" },
    REFUNDED: { bg: "#f5f3ff", color: "#7c3aed" },
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("sq-AL") : "—";
  const fmtMon  = (v) => v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1100,
      background: "rgba(15,23,42,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: "100%", maxWidth: 680, background: "#fff",
        borderRadius: 16, boxShadow: "0 20px 60px rgba(15,23,42,0.18)",
        maxHeight: "90vh", overflowY: "auto", animation: "fadeUp .2s ease" }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 24px", borderBottom: "1px solid #e8edf4" }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 15, margin: 0 }}>
              💳 Pagesat — Kontratë #{contract.id}
            </p>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
              Qiraja: {fmtMoney(contract.rent, contract.currency)} / muaj
            </p>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, border: "none",
            background: "none", color: "#94a3b8", cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>

        <div style={{ padding: "20px 24px" }}>
          {/* Summary bar */}
          {summary && (
            <div style={{ display: "flex", gap: 14, padding: "14px 16px",
              background: "#f8fafc", borderRadius: 10, border: "1px solid #e8edf4",
              marginBottom: 20, flexWrap: "wrap" }}>
              {[
                { label: "Total Pagesa", value: summary.total_payments, color: "#6366f1" },
                { label: "Paguar",       value: `€${Number(summary.total_paid || 0).toLocaleString("de-DE")}`, color: "#059669" },
                { label: "Në Pritje",    value: `€${Number(summary.total_pending || 0).toLocaleString("de-DE")}`, color: "#d97706" },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ flex: 1, minWidth: 100 }}>
                  <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600,
                    textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{label}</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color }}>{value}</p>
                </div>
              ))}
              {(summary.overdue_count || 0) > 0 && (
                <div style={{ flex: 1, minWidth: 100 }}>
                  <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600,
                    textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>Overdue</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: "#dc2626" }}>
                    {summary.overdue_count}
                  </p>
                </div>
              )}
            </div>
          )}

          {loading ? <Loader /> : payments.length === 0 ? (
            <EmptyState icon="💳" text="Nuk ka pagesa për këtë kontratë" />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {payments.map(p => {
                const s = PAY_STATUS[p.status] || { bg: "#f1f5f9", color: "#64748b" };
                const isOverdue = p.status === "OVERDUE" ||
                  (p.status === "PENDING" && p.due_date && new Date(p.due_date) < new Date());
                return (
                  <div key={p.id} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "12px 16px", background: isOverdue ? "#fff9f9" : "#f8fafc",
                    borderRadius: 10, border: `1px solid ${isOverdue ? "#fecaca" : "#e8edf4"}`,
                  }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>
                          €{Number(p.amount).toLocaleString("de-DE")}
                        </span>
                        <span style={{ background: "#f1f5f9", color: "#475569",
                          padding: "1px 7px", borderRadius: 20, fontSize: 11, fontWeight: 500 }}>
                          {p.payment_type}
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
                        Due: {fmtDate(p.due_date)}
                        {p.paid_date && ` · Paguar: ${fmtDate(p.paid_date)}`}
                        {p.payment_method && ` · ${p.payment_method}`}
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {isOverdue && <span style={{ fontSize: 12, color: "#dc2626", fontWeight: 600 }}>⚠️ Vonuar</span>}
                      <span style={{ background: s.bg, color: s.color,
                        padding: "3px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 600 }}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ borderTop: "1px solid #e8edf4", paddingTop: 16, marginTop: 20,
            display: "flex", justifyContent: "flex-end" }}>
            <button className="btn btn--secondary" onClick={onClose}>Mbyll</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function ClientContracts() {
  const { user } = useContext(AuthContext);
  const [contracts,      setContracts]      = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [page,           setPage]           = useState(0);
  const [totalPages,     setTotalPages]     = useState(0);
  const [totalElements,  setTotalElements]  = useState(0);
  const [detailTarget,   setDetailTarget]   = useState(null);
  const [paymentsTarget, setPaymentsTarget] = useState(null);
  const [toast,          setToast]          = useState(null);

  const notify = useCallback((msg, type = "success") =>
    setToast({ msg, type, key: Date.now() }), []);

  const fetchContracts = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/contracts/lease/client/${user.id}?page=${page}&size=10`);
      setContracts(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
    } catch {
      notify("Gabim gjatë ngarkimit të kontratave", "error");
    } finally {
      setLoading(false);
    }
  }, [user?.id, page, notify]);

  useEffect(() => { fetchContracts(); }, [fetchContracts]);

  // Stats
  const stats = {
    active:    contracts.filter(c => c.status === "ACTIVE").length,
    pending:   contracts.filter(c => c.status === "PENDING_SIGNATURE").length,
    expiring:  contracts.filter(c => {
      const d = daysUntil(c.end_date);
      return d !== null && d <= 30 && d > 0 && c.status === "ACTIVE";
    }).length,
  };

  return (
    <MainLayout role="client">
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px);} to{opacity:1;transform:translateY(0);} }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>

      <div className="page-header">
        <div>
          <h1 className="page-title">Kontratat e Mia</h1>
          <p className="page-subtitle">Shiko dhe menaxho kontratat tuaja të qirasë</p>
        </div>
      </div>

      {/* Stats */}
      {!loading && contracts.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 14, marginBottom: 24 }}>
          {[
            { label: "Total Kontrata",  value: totalElements, color: "#6366f1", bg: "#eef2ff" },
            { label: "Aktive",          value: stats.active,   color: "#059669", bg: "#ecfdf5" },
            { label: "Prisë Nënshkrim", value: stats.pending,  color: "#d97706", bg: "#fffbeb" },
            { label: "Skadojnë Shpejt", value: stats.expiring, color: "#dc2626", bg: "#fef2f2" },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ background: s.bg }}>
              <div className="stat-card__label">{s.label}</div>
              <div className="stat-card__value" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Expiring warning banner */}
      {stats.expiring > 0 && (
        <div style={{ background: "#fffbeb", border: "1px solid #fde68a",
          borderRadius: 10, padding: "12px 18px", marginBottom: 20,
          fontSize: 13.5, color: "#92400e", fontWeight: 500 }}>
          ⚠️ Keni <strong>{stats.expiring}</strong> kontratë që skadon brenda 30 ditëve.
          Kontaktoni agjentin tuaj për rinovim.
        </div>
      )}

      {/* Contracts table/cards */}
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Të gjitha Kontratat</h2>
          {!loading && contracts.length > 0 && (
            <span style={{ background: "#eef2ff", color: "#6366f1",
              padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500 }}>
              {totalElements} kontrata
            </span>
          )}
        </div>

        {loading ? <Loader /> : contracts.length === 0 ? (
          <EmptyState
            icon="📄"
            text="Nuk keni kontrata qiraje"
            sub="Kontratat tuaja do të shfaqen këtu pasi të jenë krijuar nga agjenti."
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Prona</th>
                    <th>Qiraja</th>
                    <th>Periudha</th>
                    <th>Statusi</th>
                    <th>Skadon</th>
                    <th>Veprime</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map(c => {
                    const days = daysUntil(c.end_date);
                    const expiring = days !== null && days <= 30 && days > 0 && c.status === "ACTIVE";
                    return (
                      <tr key={c.id}>
                        <td style={{ color: "#94a3b8", fontSize: 12 }}>{c.id}</td>
                        <td>
                          <span style={{ background: "#eef2ff", color: "#6366f1",
                            padding: "2px 8px", borderRadius: 20, fontSize: 12, fontWeight: 500 }}>
                            Prona #{c.property_id}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          {fmtMoney(c.rent, c.currency)}
                          <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 400 }}>/muaj</span>
                        </td>
                        <td>
                          <p style={{ fontSize: 12, color: "#64748b" }}>{fmtDate(c.start_date)}</p>
                          <p style={{ fontSize: 12, color: "#64748b" }}>→ {fmtDate(c.end_date)}</p>
                        </td>
                        <td><StatusBadge status={c.status} /></td>
                        <td>
                          {days !== null && c.status === "ACTIVE" ? (
                            <span style={{ fontWeight: 600, fontSize: 12.5,
                              color: expiring ? "#d97706" : days < 0 ? "#dc2626" : "#64748b" }}>
                              {expiring ? `⚠️ ${days}d` : days < 0 ? "Skaduar" : `${days}d`}
                            </span>
                          ) : "—"}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button className="btn btn--ghost btn--sm"
                              onClick={() => setDetailTarget(c)}>
                              Detaje
                            </button>
                            {c.status === "ACTIVE" && (
                              <button className="btn btn--secondary btn--sm"
                                onClick={() => setPaymentsTarget(c)}>
                                💳 Pagesat
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </div>

      {/* Modals */}
      {detailTarget && (
        <ContractDetailModal
          contract={detailTarget}
          onClose={() => setDetailTarget(null)}
          onViewPayments={(c) => { setDetailTarget(null); setPaymentsTarget(c); }}
        />
      )}

      {paymentsTarget && (
        <ContractPaymentsModal
          contract={paymentsTarget}
          onClose={() => setPaymentsTarget(null)}
          notify={notify}
        />
      )}

      {toast && (
        <Toast key={toast.key} msg={toast.msg} type={toast.type}
          onDone={() => setToast(null)} />
      )}
    </MainLayout>
  );
}
