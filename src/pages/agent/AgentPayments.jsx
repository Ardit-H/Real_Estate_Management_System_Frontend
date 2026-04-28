import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";

// ─── Constants ────────────────────────────────────────────────────────────────
const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "OVERDUE", "REFUNDED"];
const PAYMENT_TYPES    = ["RENT", "DEPOSIT", "LATE_FEE", "MAINTENANCE"];
const PAYMENT_METHODS  = ["BANK_TRANSFER", "CASH", "CARD", "CHECK"];
const CURRENCIES       = ["EUR", "USD", "ALL"];

const TYPE_COLORS = {
  RENT:             { bg: "#eef2ff", color: "#6366f1" },
  DEPOSIT:          { bg: "#fef9c3", color: "#854d0e" },
  LATE_FEE:         { bg: "#fff1f2", color: "#be123c" },
  MAINTENANCE:      { bg: "#f1f5f9", color: "#475569" },
  COMMISSION:       { bg: "#f0fdf4", color: "#166534" },
  AGENT_COMMISSION: { bg: "#eff6ff", color: "#1d4ed8" },
  CLIENT_BONUS:     { bg: "#fdf4ff", color: "#7e22ce" },
};

const STATUS_STYLE = {
  PENDING:  { bg: "#fffbeb", color: "#d97706" },
  PAID:     { bg: "#ecfdf5", color: "#059669" },
  FAILED:   { bg: "#fef2f2", color: "#dc2626" },
  OVERDUE:  { bg: "#fff1f2", color: "#be123c" },
  REFUNDED: { bg: "#f5f3ff", color: "#7c3aed" },
};

const fmtDate  = (d) => d ? new Date(d).toLocaleDateString("sq-AL") : "—";
const fmtMoney = (v) => v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";

function isOverdue(payment) {
  if (!payment.due_date || payment.status !== "PENDING") return false;
  return new Date(payment.due_date) < new Date();
}

// ─── Recipient cell ───────────────────────────────────────────────────────────
function RecipientCell({ recipientName, recipientType }) {
  if (recipientName) {
    return (
      <span style={{ fontSize: 13, color: "#475569" }}>
        {recipientType === "AGENT" ? `👤 ${recipientName}` : `🏠 ${recipientName}`}
      </span>
    );
  }
  return (
    <span style={{ fontSize: 12, color: "#059669", fontWeight: 500,
      background: "#ecfdf5", padding: "2px 8px", borderRadius: 20 }}>
      🏢 Kompania
    </span>
  );
}

// ─── Shared UI ────────────────────────────────────────────────────────────────
function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 9999,
      background: type === "error" ? "#fee2e2" : "#ecfdf5",
      color: type === "error" ? "#b91c1c" : "#047857",
      padding: "12px 20px", borderRadius: 10, fontSize: 13.5, fontWeight: 500,
      boxShadow: "0 4px 18px rgba(0,0,0,0.12)", maxWidth: 340 }}>{msg}</div>
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
function EmptyState({ icon, text }) {
  return (
    <div style={{ textAlign: "center", padding: "52px 20px", color: "#94a3b8" }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>{icon}</div>
      <p style={{ fontSize: 14 }}>{text}</p>
    </div>
  );
}
function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || { bg: "#f1f5f9", color: "#64748b" };
  return (
    <span style={{ background: s.bg, color: s.color,
      padding: "3px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 600 }}>
      {status}
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
function Field({ label, children, required }) {
  return (
    <div className="form-group">
      <label className="form-label">
        {label}{required && <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  );
}
function Row2({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>{children}</div>;
}
function Modal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(15,23,42,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: "100%", maxWidth: wide ? 680 : 500,
        background: "#fff", borderRadius: 16,
        boxShadow: "0 20px 60px rgba(15,23,42,0.18)",
        maxHeight: "90vh", overflowY: "auto", animation: "fadeUp .2s ease" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 24px", borderBottom: "1px solid #e8edf4" }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>{title}</span>
          <button onClick={onClose} style={{ width: 30, height: 30, border: "none",
            background: "none", color: "#94a3b8", cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>
        <div style={{ padding: "22px 24px" }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Create Payment Modal ─────────────────────────────────────────────────────
function CreatePaymentModal({ contractId, onClose, onSuccess, notify }) {
  const [contracts, setContracts]           = useState([]);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [form, setForm] = useState({
    contract_id:    contractId || "",
    amount:         "",
    currency:       "EUR",
    payment_type:   "RENT",
    due_date:       "",
    payment_method: "BANK_TRANSFER",
    notes:          "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    setLoadingContracts(true);
    api.get("/api/contracts/lease?page=0&size=100")
      .then(res => setContracts(res.data.content || []))
      .catch(() => {})
      .finally(() => setLoadingContracts(false));
  }, []);

  const handleSubmit = async () => {
    if (!form.contract_id || !form.amount || !form.due_date) {
      notify("Kontrata, shuma dhe due date janë të detyrueshme", "error"); return;
    }
    setSaving(true);
    try {
      await api.post("/api/payments", {
        contract_id:    Number(form.contract_id),
        amount:         Number(form.amount),
        currency:       form.currency,
        payment_type:   form.payment_type,
        due_date:       form.due_date,
        payment_method: form.payment_method || null,
        notes:          form.notes          || null,
      });
      onSuccess();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë krijimit", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="New Lease Payment" onClose={onClose}>
      <Field label="Kontrata" required>
        <select className="form-select" value={form.contract_id}
          onChange={e => set("contract_id", e.target.value)} disabled={loadingContracts}>
          <option value="">Zgjidh një kontratë...</option>
          {contracts.map(c => (
            <option key={c.id} value={c.id}>
              #{c.id} — Client #{c.client_id} — {fmtMoney(c.rent)}
            </option>
          ))}
        </select>
      </Field>
      <Row2>
        <Field label="Shuma" required>
          <input className="form-input" type="number" value={form.amount}
            onChange={e => set("amount", e.target.value)} placeholder="450" />
        </Field>
        <Field label="Monedha">
          <select className="form-select" value={form.currency}
            onChange={e => set("currency", e.target.value)}>
            {CURRENCIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>
      </Row2>
      <Row2>
        <Field label="Tipi">
          <select className="form-select" value={form.payment_type}
            onChange={e => set("payment_type", e.target.value)}>
            {PAYMENT_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Due Date" required>
          <input className="form-input" type="date" value={form.due_date}
            onChange={e => set("due_date", e.target.value)} />
        </Field>
      </Row2>
      <Field label="Metoda">
        <select className="form-select" value={form.payment_method}
          onChange={e => set("payment_method", e.target.value)}>
          {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
        </select>
      </Field>
      <Field label="Shënime">
        <input className="form-input" value={form.notes}
          onChange={e => set("notes", e.target.value)} placeholder="(opcional)" />
      </Field>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
        <button className="btn btn--secondary" onClick={onClose}>Anulo</button>
        <button className="btn btn--primary" onClick={handleSubmit} disabled={saving}>
          {saving ? "Duke krijuar..." : "Krijo pagesë"}
        </button>
      </div>
    </Modal>
  );
}

// ─── Mark Paid Modal ──────────────────────────────────────────────────────────
function MarkPaidModal({ payment, onClose, onSuccess, notify }) {
  const [form, setForm] = useState({
    payment_method:  payment.payment_method || "BANK_TRANSFER",
    transaction_ref: "",
    paid_date:       new Date().toISOString().split("T")[0],
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await api.patch(`/api/payments/${payment.id}/pay`, {
        payment_method:  form.payment_method,
        transaction_ref: form.transaction_ref || null,
        paid_date:       form.paid_date,
      });
      onSuccess();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={`Mark as PAID — Pagesë #${payment.id}`} onClose={onClose}>
      <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0",
        borderRadius: 8, padding: "10px 14px", marginBottom: 18, fontSize: 13, color: "#047857" }}>
        Shuma: <strong>{fmtMoney(payment.amount)} {payment.currency}</strong>
        {" · "}Tipi: <strong>{payment.payment_type}</strong>
        {payment.recipient_name && (
          <span style={{ marginLeft: 8 }}>
            · Recipient: <strong>{payment.recipient_name}</strong>
          </span>
        )}
      </div>
      <Field label="Metoda e pagesës">
        <select className="form-select" value={form.payment_method}
          onChange={e => set("payment_method", e.target.value)}>
          {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
        </select>
      </Field>
      <Row2>
        <Field label="Transaction Ref">
          <input className="form-input" value={form.transaction_ref}
            onChange={e => set("transaction_ref", e.target.value)} placeholder="TXN-12345" />
        </Field>
        <Field label="Data e pagesës">
          <input className="form-input" type="date" value={form.paid_date}
            max={new Date().toISOString().split("T")[0]}
            onChange={e => set("paid_date", e.target.value)} />
        </Field>
      </Row2>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
        <button className="btn btn--secondary" onClick={onClose}>Anulo</button>
        <button className="btn btn--primary" onClick={handleSubmit} disabled={saving}>
          {saving ? "Duke shënuar..." : "✓ Konfirmo PAID"}
        </button>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function AgentPayments() {
  const location = useLocation();

  const [tab, setTab]                       = useState("contract");
  const [selectedContractId, setSelectedContractId] = useState(
    location.state?.fromContractId || ""
  );
  const [contracts, setContracts]           = useState([]);
  const [statusFilter, setStatusFilter]     = useState("PENDING");
  const [payments, setPayments]             = useState([]);
  const [summary, setSummary]               = useState(null);
  const [loading, setLoading]               = useState(false);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [page, setPage]                     = useState(0);
  const [totalPages, setTotalPages]         = useState(0);
  const [createOpen, setCreateOpen]         = useState(false);
  const [markPaidTarget, setMarkPaidTarget] = useState(null);
  const [toast, setToast]                   = useState(null);
  const [revenue, setRevenue]               = useState(null);

  // auto-load kur vjen nga AgentContracts me fromContractId
  const autoLoaded = useRef(false);

  const notify = useCallback((msg, type = "success") =>
    setToast({ msg, type, key: Date.now() }), []);

  useEffect(() => {
    setLoadingContracts(true);
    api.get("/api/contracts/lease?page=0&size=100")
      .then(res => setContracts(res.data.content || []))
      .catch(() => {})
      .finally(() => setLoadingContracts(false));
  }, []);

  useEffect(() => {
    api.get("/api/payments/revenue").then(r => setRevenue(r.data)).catch(() => {});
  }, []);

  const fetchByContract = useCallback(async (cid) => {
    const id = cid || selectedContractId;
    if (!id) { notify("Zgjidh një kontratë", "error"); return; }
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
  }, [selectedContractId, notify]);

  // Auto-load nga navigation state
  useEffect(() => {
    if (location.state?.fromContractId && !autoLoaded.current) {
      autoLoaded.current = true;
      fetchByContract(location.state.fromContractId);
    }
  }, [location.state, fetchByContract]);

  const fetchByStatus = useCallback(async () => {
    if (tab !== "status") return;
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
  }, [tab, statusFilter, page, notify]);

  const fetchOverdue = useCallback(async () => {
    if (tab !== "overdue") return;
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
  }, [tab, notify]);

  useEffect(() => {
    if (tab === "status")  fetchByStatus();
    if (tab === "overdue") fetchOverdue();
    if (tab === "contract") {
      if (selectedContractId) fetchByContract();
      else { setPayments([]); setSummary(null); }
    }
  }, [tab, fetchByStatus, fetchOverdue, fetchByContract, selectedContractId]);

  const handleContractChange = (e) => {
    const value = e.target.value;
    setSelectedContractId(value);
    if (!value) { setPayments([]); setSummary(null); }
  };

  const handleMarkPaidSuccess = () => {
    setMarkPaidTarget(null);
    notify("Pagesa u shënua si PAID");
    if (tab === "contract" && selectedContractId) fetchByContract();
    else if (tab === "status") fetchByStatus();
    else fetchOverdue();
  };

  const tabs = [
    { id: "contract", label: "By Contract", icon: "📋" },
    { id: "status",   label: "By Status",   icon: "🔍" },
    { id: "overdue",  label: "Overdue",     icon: "🔴" },
  ];

  const overdueCount = payments.filter(p => isOverdue(p)).length;

  // ── Commission breakdown (si te Sales) ───────────────────────
  const agentCommissionTotal = payments
    .filter(p => p.payment_type === "AGENT_COMMISSION")
    .reduce((s, p) => s + Number(p.amount), 0);
  const companyCommissionTotal = payments
    .filter(p => p.payment_type === "COMMISSION")
    .reduce((s, p) => s + Number(p.amount), 0);
  const hasCommissions = agentCommissionTotal > 0 || companyCommissionTotal > 0;

  // ── Progress bar (si te Sales) ────────────────────────────────
  const rentTotal = payments
    .filter(p => p.payment_type === "RENT")
    .reduce((s, p) => s + Number(p.amount), 0);
  const paidPct = summary && Number(summary.total_paid) > 0 && rentTotal > 0
    ? Math.min(100, Math.round((Number(summary.total_paid) / rentTotal) * 100))
    : null;

  return (
    <MainLayout role="agent">
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px);} to{opacity:1;transform:translateY(0);} }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>

      <div className="page-header">
        <div>
          <h1 className="page-title">Lease Payments</h1>
          <p className="page-subtitle">Menaxho pagesat e qirasë dhe gjurmo statusin</p>
        </div>
        <button className="btn btn--primary" onClick={() => setCreateOpen(true)}>
          + New Payment
        </button>
      </div>

      {/* Revenue stats */}
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
                    <span style={{ fontSize: 13, marginLeft: 6 }}>
                      ({summary.overdue_count} overdue)
                    </span>
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

      {/* Tabs + filter */}
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
              {t.id === "overdue" && overdueCount > 0 && tab !== "overdue" && (
                <span style={{ background: "#dc2626", color: "white",
                  borderRadius: "50%", width: 18, height: 18, fontSize: 10,
                  display: "inline-flex", alignItems: "center",
                  justifyContent: "center", fontWeight: 700 }}>{overdueCount}</span>
              )}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {tab === "contract" && (
            <select className="form-select"
              style={{ height: 34, padding: "0 10px", fontSize: 13, width: 280 }}
              value={selectedContractId}
              onChange={handleContractChange}
              disabled={loadingContracts}>
              <option value="">-- Zgjidh një kontratë --</option>
              {contracts.map(c => (
                <option key={c.id} value={c.id}>
                  #{c.id} — Client #{c.client_id} — {fmtMoney(c.rent)}
                </option>
              ))}
            </select>
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

      {/* Summary bar + progress bar + commission breakdown — si te Sales ── */}
      {summary && (
        <div style={{ background: "#f8fafc", borderRadius: 10,
          border: "1px solid #e8edf4", marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 16, padding: "14px 20px",
            alignItems: "center", flexWrap: "wrap" }}>
            {[
              { label: "Total Pagesa", value: summary.total_payments },
              { label: "Paguar",    value: `€${Number(summary.total_paid||0).toLocaleString("de-DE")}`,    color: "#059669" },
              { label: "Në Pritje", value: `€${Number(summary.total_pending||0).toLocaleString("de-DE")}`, color: "#d97706" },
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

            {/* Progress bar — si te Sales */}
            {paidPct !== null && (
              <>
                <div style={{ width: 1, height: 32, background: "#e8edf4" }} />
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600,
                      textTransform: "uppercase", letterSpacing: "0.06em" }}>Paguar</span>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: "#6366f1" }}>{paidPct}%</span>
                  </div>
                  <div style={{ height: 6, background: "#e8edf4", borderRadius: 99 }}>
                    <div style={{ height: "100%", borderRadius: 99,
                      width: `${paidPct}%`,
                      background: paidPct === 100 ? "#10b981" : "#6366f1",
                      transition: "width .4s ease" }} />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Commission breakdown — si te Sales */}
          {hasCommissions && (
            <div style={{ borderTop: "1px solid #e8edf4", padding: "12px 20px",
              display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ width: 1, height: 32, background: "transparent" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div>
                  <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600,
                    textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>
                    Komisioni Agjentit
                  </p>
                  <p style={{ fontSize: 20, fontWeight: 600, color: "#1d4ed8" }}>
                    €{agentCommissionTotal.toLocaleString("de-DE")}
                  </p>
                </div>
                <div style={{ width: 1, height: 32, background: "#e8edf4" }} />
                <div>
                  <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600,
                    textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>
                    Kompania
                  </p>
                  <p style={{ fontSize: 20, fontWeight: 600, color: "#059669" }}>
                    €{companyCommissionTotal.toLocaleString("de-DE")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">
            {tab === "contract" && selectedContractId ? `Pagesat — Kontratë #${selectedContractId}` :
             tab === "contract"                       ? "Pagesat" :
             tab === "status"                         ? `Pagesat — ${statusFilter}` :
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
              tab === "contract" && !selectedContractId ? "Zgjidh një kontratë nga lista" :
              tab === "contract" && selectedContractId  ? "Nuk ka pagesa për këtë kontratë" :
              tab === "overdue"                         ? "Nuk ka pagesa me vonesë 🎉" :
              `Nuk ka pagesa me status ${statusFilter}`
            }
          />
        ) : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Contract</th>
                    <th>Shuma</th>
                    <th>Tipi</th>
                    <th>Recipient</th>
                    <th>Due Date</th>
                    <th>Paid Date</th>
                    <th>Metoda</th>
                    <th>Statusi</th>
                    <th>Veprime</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(p => {
                    const typeStyle = TYPE_COLORS[p.payment_type] || TYPE_COLORS.RENT;
                    return (
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
                          <span style={{ background: typeStyle.bg, color: typeStyle.color,
                            padding: "2px 8px", borderRadius: 20, fontSize: 11.5, fontWeight: 500 }}>
                            {p.payment_type}
                          </span>
                        </td>
                        <td>
                          <RecipientCell
                            recipientName={p.recipient_name}
                            recipientType={p.recipient_type}
                          />
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
                              onClick={() => setMarkPaidTarget(p)}>
                              Mark Paid
                            </button>
                          )}
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

      {createOpen && (
        <CreatePaymentModal
          contractId={selectedContractId || ""}
          onClose={() => setCreateOpen(false)}
          onSuccess={() => {
            setCreateOpen(false);
            notify("Pagesa u krijua");
            if (tab === "contract" && selectedContractId) fetchByContract();
            else if (tab === "status") fetchByStatus();
            else fetchOverdue();
          }}
          notify={notify}
        />
      )}
      {markPaidTarget && (
        <MarkPaidModal
          payment={markPaidTarget}
          onClose={() => setMarkPaidTarget(null)}
          onSuccess={handleMarkPaidSuccess}
          notify={notify}
        />
      )}
      {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type}
        onDone={() => setToast(null)} />}
    </MainLayout>
  );
}