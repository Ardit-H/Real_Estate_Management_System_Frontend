import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";
import {
  PAYMENT_STATUSES,
  PAYMENT_TYPES,
  PAYMENT_METHODS,
  CURRENCIES,
  STATUS_STYLE,
  fmtDate,
  fmtMoney,
  today,
  isOverdue,
  validatePaymentForm,
  validateMarkPaid
} from "../../components/agent/payments/paymentHelpers";
import {
  Toast,
  Loader,
  EmptyState,
  StatusBadge,
  Pagination,
  Field,
  Row2
} from "../../components/agent/payments/PaymentBadges";
import Modal from "../../components/agent/payments/Modal";
import CreatePaymentModal from "../../components/agent/payments/CreatePaymentModal";
import MarkPaidModal from "../../components/agent/payments/MarkPaidModal";

// ═══════════════════════════════════════════════════════════════════════════════
export default function AgentPayments() {
  const navigate = useNavigate();
  const location = useLocation();

  const fromContractId = location.state?.fromContractId || null;

  const [tab, setTab]               = useState("contract");
  const [contractId, setContractId] = useState(fromContractId || "");
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [payments, setPayments]     = useState([]);
  const [summary, setSummary]       = useState(null);
  const [loading, setLoading]       = useState(false);
  const [page, setPage]             = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [markPaidTarget, setMarkPaidTarget] = useState(null);
  const [toast, setToast]           = useState(null);
  const [revenue, setRevenue]       = useState(null);

  const autoLoadedRef = useRef(false);
  const notify = useCallback((msg, type = "success") =>
    setToast({ msg, type, key: Date.now() }), []);

  useEffect(() => {
    api.get("/api/payments/revenue").then(r => setRevenue(r.data)).catch(() => {});
  }, []);

  const fetchByContract = useCallback(async (cid) => {
    const id = cid != null ? String(cid) : contractId;
    if (!id) { notify("Shkruaj Contract ID", "error"); return; }
    if (isNaN(Number(id)) || Number(id) <= 0) {
      notify("Contract ID duhet të jetë numër pozitiv", "error"); return;
    }
    setLoading(true);
    try {
      const [listRes, sumRes] = await Promise.all([
        api.get(`/api/payments/contract/${id}`),
        api.get(`/api/payments/contract/${id}/summary`),
      ]);
      setPayments(Array.isArray(listRes.data) ? listRes.data : []);
      setSummary(sumRes.data);
      setTotalPages(1);
    } catch {
      notify("Gabim — kontrata nuk u gjet", "error");
    } finally {
      setLoading(false);
    }
  }, [contractId, notify]);

  useEffect(() => {
    if (fromContractId && !autoLoadedRef.current) {
      autoLoadedRef.current = true;
      fetchByContract(fromContractId);
    }
  }, [fromContractId, fetchByContract]);

  const fetchByStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/payments/status/${statusFilter}?page=${page}&size=15`);
      setPayments(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setSummary(null);
    } catch {
      notify("Gabim gjatë ngarkimit", "error");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page, notify]);

  const fetchOverdue = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/payments/overdue");
      setPayments(Array.isArray(res.data) ? res.data : []);
      setTotalPages(1); setSummary(null);
    } catch {
      notify("Gabim gjatë ngarkimit", "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    if (tab === "status")  fetchByStatus();
    if (tab === "overdue") fetchOverdue();
    if (tab === "contract" && !fromContractId) { setPayments([]); setSummary(null); }
  }, [tab, fetchByStatus, fetchOverdue, fromContractId]);

  const handleMarkPaidSuccess = () => {
    setMarkPaidTarget(null); notify("Pagesa u shënua si PAID");
    if (tab === "contract")    fetchByContract();
    else if (tab === "status") fetchByStatus();
    else                       fetchOverdue();
  };

  const tabs = [
    { id: "contract", label: "By Contract", icon: "📋" },
    { id: "status",   label: "By Status",   icon: "🔍" },
    { id: "overdue",  label: "Overdue",     icon: "🔴" },
  ];

  return (
    <MainLayout role="agent">
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>

      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {fromContractId && (
            <button className="btn btn--ghost btn--sm"
              onClick={() => navigate("/agent/contracts")}
              style={{ color: "#6366f1", border: "1px solid #c7d7fe" }}>
              ← Kontratat
            </button>
          )}
          <div>
            <h1 className="page-title">Lease Payments</h1>
            <p className="page-subtitle">
              {fromContractId ? `Pagesat e Kontratës #${fromContractId}` : "Menaxho pagesat e qirasë dhe gjurmo statusin"}
            </p>
          </div>
        </div>
        <button className="btn btn--primary" onClick={() => setCreateOpen(true)}>+ New Payment</button>
      </div>

      {(revenue !== null || summary) && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24 }}>
          {revenue !== null && (
            <div className="stat-card">
              <div className="stat-card__label">Total Revenue</div>
              <div className="stat-card__value" style={{ color: "#059669", fontSize: 22 }}>
                €{Number(revenue).toLocaleString("de-DE")}
              </div>
            </div>
          )}
          {summary && (
            <>
              <div className="stat-card">
                <div className="stat-card__label">Total Paguar</div>
                <div className="stat-card__value" style={{ color: "#059669", fontSize: 22 }}>
                  €{Number(summary.total_paid || 0).toLocaleString("de-DE")}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-card__label">Në pritje / Overdue</div>
                <div className="stat-card__value" style={{
                  color: (summary.overdue_count || 0) > 0 ? "#dc2626" : "#d97706", fontSize: 22 }}>
                  €{Number(summary.total_pending || 0).toLocaleString("de-DE")}
                  {(summary.overdue_count || 0) > 0 && (
                    <span style={{ fontSize: 13, marginLeft: 6 }}>({summary.overdue_count} overdue)</span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {tab === "overdue" && payments.length > 0 && (
        <div style={{ background: "#fff1f2", border: "1px solid #fecdd3",
          borderRadius: 10, padding: "12px 18px", marginBottom: 18,
          fontSize: 13.5, color: "#be123c", fontWeight: 500 }}>
          🔴 {payments.length} pagesa me vonesë — klienti duhet të njoftohet!
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center",
        justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #e8edf4" }}>
          {tabs.map(t => (
            <button key={t.id}
              onClick={() => { setTab(t.id); setPage(0); setPayments([]); setSummary(null); }}
              style={{ padding: "9px 16px", border: "none",
                borderBottom: tab === t.id ? "2px solid #6366f1" : "2px solid transparent",
                background: "none", color: tab === t.id ? "#6366f1" : "#64748b",
                fontWeight: tab === t.id ? 600 : 400, fontSize: 13.5,
                cursor: "pointer", fontFamily: "inherit", marginBottom: -1,
                display: "flex", alignItems: "center", gap: 5 }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {tab === "contract" && (
            <>
              <input className="form-input" type="number" min="1"
                style={{ height: 34, padding: "0 10px", fontSize: 13, width: 150 }}
                placeholder="Contract ID..."
                value={contractId}
                onChange={e => setContractId(e.target.value)}
                onKeyDown={e => e.key === "Enter" && fetchByContract()} />
              <button className="btn btn--secondary btn--sm"
                onClick={() => fetchByContract()}>Load</button>
            </>
          )}
          {tab === "status" && (
            <select className="form-select"
              style={{ height: 34, padding: "0 10px", fontSize: 13, width: 160 }}
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(0); }}>
              {PAYMENT_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          )}
        </div>
      </div>

      {summary && (
        <div style={{ display: "flex", gap: 16, padding: "14px 20px",
          background: "#f8fafc", borderRadius: 10, border: "1px solid #e8edf4",
          marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
          {[
            { label: "Total Pagesa", value: summary.total_payments },
            { label: "Paguar",       value: `€${Number(summary.total_paid||0).toLocaleString("de-DE")}`,    color: "#059669" },
            { label: "Në Pritje",    value: `€${Number(summary.total_pending||0).toLocaleString("de-DE")}`, color: "#d97706" },
            ...(summary.overdue_count ? [{ label: "Overdue", value: summary.overdue_count, color: "#dc2626" }] : []),
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {i > 0 && <div style={{ width: 1, height: 32, background: "#e8edf4" }} />}
              <div>
                <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600,
                  textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{s.label}</p>
                <p style={{ fontSize: 20, fontWeight: 600, color: s.color }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <div className="card__header">
          <h2 className="card__title">
            {tab === "contract" && contractId ? `Pagesat — Kontratë #${contractId}` :
             tab === "contract"               ? "Pagesat" :
             tab === "status"                 ? `Pagesat — ${statusFilter}` :
                                               "Pagesat me Vonesë"}
          </h2>
          {payments.length > 0 && (
            <span style={{ background: "#eef2ff", color: "#6366f1",
              padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500 }}>
              {payments.length}
            </span>
          )}
        </div>

        {loading ? <Loader /> : payments.length === 0 ? (
          <EmptyState icon={tab === "overdue" ? "✅" : "💳"}
            text={
              tab === "contract" && !contractId ? "Shkruaj Contract ID dhe kliko Load" :
              tab === "contract" && contractId  ? "Nuk ka pagesa për këtë kontratë" :
              tab === "overdue"                 ? "Nuk ka pagesa me vonesë 🎉" :
              `Nuk ka pagesa me status ${statusFilter}`
            }
          />
        ) : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th><th>Contract</th><th>Shuma</th><th>Tipi</th>
                    <th>Due Date</th><th>Paid Date</th><th>Metoda</th><th>Statusi</th><th>Veprime</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p.id} style={{ background: isOverdue(p) ? "#fff9f9" : undefined }}>
                      <td style={{ color: "#94a3b8", fontSize: 12 }}>{p.id}</td>
                      <td>
                        <span style={{ background: "#eef2ff", color: "#6366f1",
                          padding: "2px 7px", borderRadius: 20, fontSize: 12 }}>
                          #{p.contract_id}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{fmtMoney(p.amount)}</td>
                      <td>
                        <span style={{ background: "#f1f5f9", color: "#475569",
                          padding: "2px 8px", borderRadius: 20, fontSize: 11.5, fontWeight: 500 }}>
                          {p.payment_type}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: 12.5,
                          color: isOverdue(p) ? "#dc2626" : "#64748b",
                          fontWeight: isOverdue(p) ? 600 : 400 }}>
                          {isOverdue(p) ? "⚠️ " : ""}{fmtDate(p.due_date)}
                        </span>
                      </td>
                      <td style={{ fontSize: 12.5, color: "#64748b" }}>{fmtDate(p.paid_date)}</td>
                      <td style={{ fontSize: 12.5, color: "#64748b" }}>{p.payment_method || "—"}</td>
                      <td><StatusBadge status={p.status} /></td>
                      <td>
                        {(p.status === "PENDING" || p.status === "OVERDUE") && (
                          <button className="btn btn--primary btn--sm"
                            onClick={() => setMarkPaidTarget(p)}>Mark Paid</button>
                        )}
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

      {createOpen && (
        <CreatePaymentModal defaultContractId={contractId}
          onClose={() => setCreateOpen(false)}
          onSuccess={() => { setCreateOpen(false); notify("Pagesa u krijua"); if (contractId) fetchByContract(); }}
          notify={notify} />
      )}
      {markPaidTarget && (
        <MarkPaidModal payment={markPaidTarget} onClose={() => setMarkPaidTarget(null)}
          onSuccess={handleMarkPaidSuccess} notify={notify} />
      )}
      {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type}
        onDone={() => setToast(null)} />}
    </MainLayout>
  );
}