import { useState, useEffect, useCallback } from "react";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";

// ─── Constants ────────────────────────────────────────────────────────────────
const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "OVERDUE", "REFUNDED"];
const PAYMENT_TYPES    = ["RENT", "DEPOSIT", "LATE_FEE", "MAINTENANCE", "AGENT_COMMISSION", "CLIENT_BONUS"];
const PAYMENT_METHODS  = ["BANK_TRANSFER", "CASH", "CARD", "CHECK", "ONLINE"];
const CURRENCIES       = ["EUR", "USD", "GBP", "CHF", "ALL", "MKD"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtPrice = (v, cur = "EUR") =>
  v != null ? `€${Number(v).toLocaleString("de-DE")} ${cur}` : "—";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }) : "—";

const fmtDateTime = (d) =>
  d ? new Date(d).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "2-digit",
    hour: "2-digit", minute: "2-digit",
  }) : "—";

// ─── Badge ────────────────────────────────────────────────────────────────────
const BADGE_CFG = {
  PENDING:          { bg: "#FAEEDA", color: "#854F0B" },
  PAID:             { bg: "#EAF3DE", color: "#3B6D11" },
  FAILED:           { bg: "#FCEBEB", color: "#A32D2D" },
  OVERDUE:          { bg: "#FCEBEB", color: "#A32D2D" },
  REFUNDED:         { bg: "#F1EFE8", color: "#5F5E5A" },
};

function Badge({ label }) {
  const s = BADGE_CFG[label] || { bg: "#F1EFE8", color: "#5F5E5A" };
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: 11, fontWeight: 500,
      padding: "3px 8px", borderRadius: 999, whiteSpace: "nowrap", display: "inline-block" }}>
      {label ?? "—"}
    </span>
  );
}

// ─── Shared UI ────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, maxWidth = 520 }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(15,23,42,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ width: "100%", maxWidth, background: "#fff", borderRadius: 16,
        boxShadow: "0 20px 60px rgba(15,23,42,0.18)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 24px", borderBottom: "1px solid #e8edf4",
          position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>{title}</span>
          <button onClick={onClose} style={{ width: 30, height: 30, border: "none",
            background: "none", color: "#94a3b8", cursor: "pointer", fontSize: 16, borderRadius: 6 }}>✕</button>
        </div>
        <div style={{ padding: "22px 24px" }}>{children}</div>
      </div>
    </div>
  );
}

function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 9999,
      background: type === "error" ? "#fee2e2" : "#ecfdf5",
      color: type === "error" ? "#b91c1c" : "#047857",
      padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 500,
      boxShadow: "0 4px 18px rgba(0,0,0,0.12)", maxWidth: 340 }}>{msg}</div>
  );
}

const TH = { padding: "10px 12px", textAlign: "left", fontWeight: 500, fontSize: 12,
  color: "#64748b", borderBottom: "1px solid #e8edf4", background: "#f8fafc", whiteSpace: "nowrap" };
const TD = { padding: "10px 12px", borderBottom: "1px solid #f1f5f9", fontSize: 13,
  color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };
const inputSt  = { width: "100%", padding: "8px 11px", fontSize: 13, border: "1px solid #d1d5db",
  borderRadius: 8, background: "#fff", color: "#0f172a", outline: "none", boxSizing: "border-box" };
const selectSt = { ...inputSt, cursor: "pointer" };
const btnSm = (bg, color, border) => ({ fontSize: 11, padding: "4px 9px", borderRadius: 6,
  border: `1px solid ${border}`, background: bg, color, cursor: "pointer", whiteSpace: "nowrap", fontWeight: 500 });

function Field({ label, children, required }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>
        {label}{required && <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function Row2({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>{children}</div>;
}

function Empty({ icon, text }) {
  return (
    <div style={{ textAlign: "center", padding: "52px 20px", color: "#94a3b8" }}>
      <div style={{ fontSize: 34, marginBottom: 12 }}>{icon}</div>
      <p style={{ fontSize: 14 }}>{text}</p>
    </div>
  );
}

function Loader() {
  return (
    <div style={{ textAlign: "center", padding: "48px 0" }}>
      <div style={{ width: 28, height: 28, margin: "0 auto", border: "3px solid #e8edf4",
        borderTop: "3px solid #6366f1", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
    </div>
  );
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const btn = (d) => ({ fontSize: 13, padding: "5px 12px", borderRadius: 8,
    border: "0.5px solid #d1d5db", background: "transparent",
    color: d ? "#cbd5e1" : "#374151", cursor: d ? "default" : "pointer", opacity: d ? 0.5 : 1 });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8,
      justifyContent: "flex-end", padding: "14px 16px 4px" }}>
      <button disabled={page === 0} onClick={() => onChange(page - 1)} style={btn(page === 0)}>← Prev</button>
      <span style={{ fontSize: 13, color: "#64748b", padding: "0 6px" }}>{page + 1} / {totalPages}</span>
      <button disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)} style={btn(page >= totalPages - 1)}>Next →</button>
    </div>
  );
}

// ─── Payment Detail Modal ─────────────────────────────────────────────────────
function PaymentDetailModal({ payment: p, onClose }) {
  return (
    <Modal title={`Payment #${p.id} — Detaje`} onClose={onClose}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px", marginBottom: 16 }}>
        {[
          ["ID",          `#${p.id}`],
          ["Contract",    `#${p.contract_id}`],
          ["Amount",      fmtPrice(p.amount, p.currency)],
          ["Type",        p.payment_type || "—"],
          ["Status",      "badge"],
          ["Due Date",    fmtDate(p.due_date)],
          ["Paid Date",   fmtDate(p.paid_date)],
          ["Method",      p.payment_method || "—"],
          ["Transaction", p.transaction_ref || "—"],
          ["Recipient",   p.recipient_name || (p.recipient_id ? `#${p.recipient_id}` : "Company")],
          ["Created",     fmtDateTime(p.created_at)],
        ].map(([label, val]) => (
          <div key={label}>
            <p style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase",
              letterSpacing: "0.06em", margin: "0 0 3px" }}>{label}</p>
            {val === "badge"
              ? <Badge label={p.status} />
              : <p style={{ fontSize: 14, fontWeight: 500, margin: 0, wordBreak: "break-all" }}>{val}</p>}
          </div>
        ))}
      </div>
      {p.notes && (
        <div>
          <p style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase",
            letterSpacing: "0.06em", margin: "0 0 4px" }}>Notes</p>
          <div style={{ background: "#f8fafc", border: "1px solid #e8edf4", borderRadius: 8,
            padding: "10px 14px", fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{p.notes}</div>
        </div>
      )}
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
    if (form.paid_date > new Date().toISOString().split("T")[0]) {
      notify("Data e pagesës nuk mund të jetë në të ardhmen", "error"); return;
    }
    setSaving(true);
    try {
      await api.patch(`/api/payments/${payment.id}/pay`, {
        payment_method:  form.payment_method,
        transaction_ref: form.transaction_ref || null,
        paid_date:       form.paid_date,
      });
      notify("Pagesa u shënua si PAID");
      onSuccess();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={`Mark Payment #${payment.id} as PAID`} onClose={onClose}>
      <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 8,
        padding: "10px 14px", marginBottom: 18, fontSize: 13, color: "#047857" }}>
        Shuma: <strong>{fmtPrice(payment.amount, payment.currency)}</strong>
        {payment.due_date && <span style={{ marginLeft: 12, color: "#64748b" }}>Due: {fmtDate(payment.due_date)}</span>}
      </div>
      <Field label="Payment Method">
        <select style={selectSt} value={form.payment_method} onChange={e => set("payment_method", e.target.value)}>
          {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
        </select>
      </Field>
      <Row2>
        <Field label="Transaction Ref">
          <input style={inputSt} value={form.transaction_ref}
            onChange={e => set("transaction_ref", e.target.value)} placeholder="TXN-12345" />
        </Field>
        <Field label="Paid Date">
          <input style={inputSt} type="date" value={form.paid_date}
            max={new Date().toISOString().split("T")[0]}
            onChange={e => set("paid_date", e.target.value)} />
        </Field>
      </Row2>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
        <button className="btn btn--secondary" onClick={onClose}>Anulo</button>
        <button className="btn btn--primary" onClick={handleSubmit} disabled={saving}>
          {saving ? "Duke shënuar..." : "✓ Konfirmo PAID"}
        </button>
      </div>
    </Modal>
  );
}

// ─── Status Modal ─────────────────────────────────────────────────────────────
function StatusModal({ payment, onClose, onSuccess, notify }) {
  const available = PAYMENT_STATUSES.filter(s => s !== payment.status && s !== "PAID");
  const [status, setStatus] = useState(available[0] || "FAILED");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await api.patch(`/api/payments/${payment.id}/status`, { status });
      notify(`Statusi u ndryshua në ${status}`);
      onSuccess();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim", "error");
    } finally {
      setSaving(false);
    }
  };

  const isDanger = ["FAILED", "OVERDUE"].includes(status);
  return (
    <Modal title={`Ndrysho Statusin — Payment #${payment.id}`} onClose={onClose}>
      <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
        Aktual: <Badge label={payment.status} />
      </p>
      <Field label="Statusi i ri" required>
        <select style={selectSt} value={status} onChange={e => setStatus(e.target.value)}>
          {available.map(s => <option key={s}>{s}</option>)}
        </select>
      </Field>
      <div style={{ background: isDanger ? "#fef2f2" : "#f0fdf4",
        border: `1px solid ${isDanger ? "#fecaca" : "#a7f3d0"}`,
        borderRadius: 8, padding: "10px 14px", marginBottom: 20,
        fontSize: 13, color: isDanger ? "#b91c1c" : "#047857" }}>
        {isDanger ? `⚠️ Pagesa do të shënohet si ${status}.` : `✓ Pagesa do të shënohet si ${status}.`}
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button className="btn btn--secondary" onClick={onClose}>Anulo</button>
        <button className={`btn ${isDanger ? "btn--danger" : "btn--primary"}`}
          onClick={handleSubmit} disabled={saving}>
          {saving ? "Duke ndryshuar..." : `Konfirmo — ${status}`}
        </button>
      </div>
    </Modal>
  );
}

// ─── Create Payment Modal ─────────────────────────────────────────────────────
function CreatePaymentModal({ onClose, onSuccess, notify }) {
  const [form, setForm] = useState({
    contract_id:    "",
    amount:         "",
    currency:       "EUR",
    payment_type:   "RENT",
    due_date:       "",
    payment_method: "BANK_TRANSFER",
    notes:          "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.contract_id || !form.amount || !form.due_date) {
      notify("Contract ID, Shuma dhe Due Date janë të detyrueshme", "error"); return;
    }
    if (Number(form.amount) <= 0) {
      notify("Shuma duhet të jetë > 0", "error"); return;
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
        notes:          form.notes || null,
      });
      notify("Pagesa u krijua");
      onSuccess();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë krijimit", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="New Payment" onClose={onClose} maxWidth={560}>
      <Row2>
        <Field label="Contract ID" required>
          <input style={inputSt} type="number" value={form.contract_id}
            onChange={e => set("contract_id", e.target.value)} placeholder="ex: 10" />
        </Field>
        <Field label="Amount (€)" required>
          <input style={inputSt} type="number" value={form.amount}
            onChange={e => set("amount", e.target.value)} placeholder="ex: 800" />
        </Field>
      </Row2>
      <Row2>
        <Field label="Payment Type">
          <select style={selectSt} value={form.payment_type} onChange={e => set("payment_type", e.target.value)}>
            {PAYMENT_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Currency">
          <select style={selectSt} value={form.currency} onChange={e => set("currency", e.target.value)}>
            {CURRENCIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>
      </Row2>
      <Row2>
        <Field label="Due Date" required>
          <input style={inputSt} type="date" value={form.due_date}
            onChange={e => set("due_date", e.target.value)} />
        </Field>
        <Field label="Payment Method">
          <select style={selectSt} value={form.payment_method} onChange={e => set("payment_method", e.target.value)}>
            {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
          </select>
        </Field>
      </Row2>
      <Field label="Notes">
        <textarea value={form.notes} onChange={e => set("notes", e.target.value)}
          rows={2} placeholder="Shënime shtesë..."
          style={{ ...inputSt, resize: "vertical", lineHeight: 1.6 }} />
      </Field>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
        <button className="btn btn--secondary" onClick={onClose}>Anulo</button>
        <button className="btn btn--primary" onClick={handleSubmit} disabled={saving}>
          {saving ? "Duke krijuar..." : "Krijo pagesë"}
        </button>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminPayments() {
  // ── Filter state ───────────────────────────────────────────────────────────
  // mode: "all" | "status" | "overdue"
  const [mode, setMode]       = useState("all");
  const [statusFilter, setStatusFilter] = useState("");
  const [overdueOn, setOverdueOn]       = useState(false);

  // ── Data state ─────────────────────────────────────────────────────────────
  const [payments, setPayments]     = useState([]);
  const [revenue, setRevenue]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]           = useState(0);
  const [tick, setTick]             = useState(0);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [createOpen, setCreateOpen]   = useState(false);
  const [detailTarget, setDetail]     = useState(null);
  const [markPaidTarget, setMarkPaid] = useState(null);
  const [statusTarget, setStatusTgt] = useState(null);
  const [toast, setToast]             = useState(null);
  const [globalCounts, setGlobalCounts] = useState({});

  const notify = useCallback((msg, type = "success") =>
    setToast({ msg, type, key: Date.now() }), []);

  // ── Fetch revenue + global counts per status (always, independent of filter) ──
  useEffect(() => {
    api.get("/api/payments/revenue")
      .then(res => setRevenue(res.data))
      .catch(() => setRevenue(0));

    // Fetch count for each status in parallel — page=0,size=1 just to get totalElements
    Promise.allSettled(
      ["PENDING","PAID","FAILED","OVERDUE","REFUNDED"].map(s =>
        api.get(`/api/payments/status/${s}?page=0&size=1`)
          .then(r => ({ status: s, count: r.data.totalElements ?? 0 }))
          .catch(() => ({ status: s, count: 0 }))
      )
    ).then(results => {
      const counts = {};
      results.forEach(r => {
        if (r.status === "fulfilled") counts[r.value.status] = r.value.count;
      });
      setGlobalCounts(counts);
    });
  }, [tick]);

  // ── Fetch payments — switches endpoint based on mode ──────────────────────
  useEffect(() => {
    let alive = true;
    setLoading(true);

    const doFetch = async () => {
      try {
        let res;
        if (overdueOn) {
          // Merge dy burime:
          // 1. /api/payments/overdue  → PENDING me due_date të kaluar
          // 2. /api/payments/status/OVERDUE → pagesat me status OVERDUE
          const [overdueRes, statusRes] = await Promise.allSettled([
            api.get("/api/payments/overdue"),
            api.get("/api/payments/status/OVERDUE?page=0&size=100"),
          ]);
          if (!alive) return;
          const pendingOverdue = overdueRes.status === "fulfilled"
            ? (Array.isArray(overdueRes.value.data) ? overdueRes.value.data : []) : [];
          const statusOverdue = statusRes.status === "fulfilled"
            ? (statusRes.value.data.content || []) : [];
          // deduplicate by id
          const map = new Map();
          [...pendingOverdue, ...statusOverdue].forEach(p => map.set(p.id, p));
          const data = Array.from(map.values());
          setPayments(data);
          setTotal(data.length);
          setTotalPages(1);
        } else if (mode === "status" && statusFilter) {
          // GET /api/payments/status/{status} — returns Page
          res = await api.get(`/api/payments/status/${statusFilter}?page=${page}&size=20`);
          if (!alive) return;
          setPayments(res.data.content || []);
          setTotal(res.data.totalElements || 0);
          setTotalPages(res.data.totalPages || 1);
        } else {
          // Default: load PENDING (most relevant for admin)
          // Use status/PENDING as default since there's no "getAll payments" endpoint
          res = await api.get(`/api/payments/status/PENDING?page=${page}&size=20`);
          if (!alive) return;
          setPayments(res.data.content || []);
          setTotal(res.data.totalElements || 0);
          setTotalPages(res.data.totalPages || 1);
        }
      } catch {
        if (!alive) return;
        setPayments([]);
        setTotal(0);
        setTotalPages(1);
      } finally {
        if (alive) setLoading(false);
      }
    };

    doFetch();
    return () => { alive = false; };
  }, [mode, statusFilter, overdueOn, page, tick]);

  const refetch = useCallback(() => setTick(t => t + 1), []);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const applyStatusFilter = (s) => {
    setOverdueOn(false);
    setStatusFilter(s);
    setMode(s ? "status" : "all");
    setPage(0);
  };

  const toggleOverdue = () => {
    const next = !overdueOn;
    setOverdueOn(next);
    if (next) {
      setStatusFilter("");
      setMode("overdue");
    } else {
      setMode("all");
    }
    setPage(0);
  };

  // ── Stats from current payments ───────────────────────────────────────────
  // globalCounts = totalet reale nga backend per cdo status (jo nga faqja aktuale)
  const counts = globalCounts;
  const statusColors = {
    PENDING: "#f59e0b", PAID: "#22c55e",
    FAILED: "#ef4444", OVERDUE: "#ef4444", REFUNDED: "#94a3b8",
  };

  const activeLabel = overdueOn ? "⏰ Overdue"
    : mode === "status" && statusFilter ? `Status: ${statusFilter}`
    : "PENDING (default)";

  return (
    <MainLayout role="admin">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 20, fontWeight: 500, margin: 0 }}>Payments</h1>
          <p style={{ fontSize: 13, color: "#94a3b8", margin: "2px 0 0" }}>
            Admin view — shiko dhe menaxho pagesat globalisht
          </p>
        </div>
        <button onClick={() => setCreateOpen(true)}
          style={{ fontSize: 13, padding: "7px 14px", borderRadius: 8, border: "none",
            background: "#6366f1", color: "#fff", cursor: "pointer", fontWeight: 500, whiteSpace: "nowrap" }}>
          + New Payment
        </button>
      </div>

      {/* ── TOP STATS ── */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {/* Total Revenue */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8edf4",
          padding: "16px 20px", flex: "2 1 200px", minWidth: 180 }}>
          <p style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase",
            letterSpacing: "0.06em", margin: "0 0 6px" }}>Total Revenue (PAID)</p>
          <p style={{ fontSize: 26, fontWeight: 700, color: "#22c55e", margin: 0,
            letterSpacing: "-0.02em" }}>
            {revenue === null ? "—" : fmtPrice(revenue)}
          </p>
        </div>
        {/* Stats per status in current view */}
        {PAYMENT_STATUSES.map(s => (
          <div key={s} style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8edf4",
            padding: "12px 16px", flex: "1 1 90px", minWidth: 80 }}>
            <p style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase",
              letterSpacing: "0.06em", margin: "0 0 4px" }}>{s.replace("_"," ")}</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: statusColors[s], margin: 0,
              letterSpacing: "-0.02em" }}>{counts[s]}</p>
          </div>
        ))}
      </div>

      {/* ── STATUS DISTRIBUTION BAR ── */}
      {payments.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8edf4",
          padding: "14px 18px", marginBottom: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 500, color: "#374151", margin: "0 0 8px" }}>
            Status distribution — {total} pagesa gjithsej
          </p>
          <div style={{ display: "flex", height: 8, borderRadius: 999, overflow: "hidden", gap: 1, marginBottom: 8 }}>
            {PAYMENT_STATUSES.map(s => {
              const pct = payments.length > 0 ? (counts[s] / payments.length) * 100 : 0;
              return pct > 0 ? (
                <div key={s} title={`${s}: ${counts[s]}`}
                  style={{ width: `${pct}%`, background: statusColors[s], transition: "width .4s" }} />
              ) : null;
            })}
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {PAYMENT_STATUSES.map(s => (
              <span key={s} style={{ fontSize: 11, color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%",
                  background: statusColors[s], display: "inline-block" }} />
                {s} ({counts[s]})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── MAIN CARD ── */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8edf4", overflow: "hidden" }}>

        {/* Toolbar / Filters */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, padding: "16px 20px",
          borderBottom: "1px solid #e8edf4", flexWrap: "wrap" }}>

          {/* Status filter dropdown */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 500, color: "#64748b",
              display: "block", marginBottom: 5 }}>Filter by Status</label>
            <select
              value={statusFilter}
              onChange={e => applyStatusFilter(e.target.value)}
              disabled={overdueOn}
              style={{ ...selectSt, width: 190, height: 34, padding: "0 10px",
                opacity: overdueOn ? 0.5 : 1 }}>
              <option value="">PENDING (default)</option>
              {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Overdue toggle */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 500, color: "#64748b",
              display: "block", marginBottom: 5 }}>Overdue Payments</label>
            <button onClick={toggleOverdue} style={{
              padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500,
              cursor: "pointer", transition: "all .15s",
              border: overdueOn ? "none" : "1px solid #d1d5db",
              background: overdueOn ? "#ef4444" : "#fff",
              color: overdueOn ? "#fff" : "#374151",
            }}>
              ⏰ {overdueOn ? "Overdue ON" : "Overdue OFF"}
            </button>
          </div>

          {/* Active filter badge */}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "#64748b" }}>Aktiv:</span>
            <span style={{ background: overdueOn ? "#fef2f2" : "#eef2ff",
              color: overdueOn ? "#b91c1c" : "#6366f1",
              fontSize: 12, fontWeight: 500, padding: "3px 10px", borderRadius: 999 }}>
              {activeLabel}
            </span>
          </div>
        </div>

        {/* Table */}
        {loading ? <Loader /> : payments.length === 0 ? (
          <Empty icon="💳"
            text={overdueOn ? "Nuk ka pagesa të vonuara." :
              mode === "status" ? `Nuk ka pagesa me status ${statusFilter}.` :
              "Nuk ka pagesa PENDING."} />
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 850 }}>
                <thead>
                  <tr>
                    {["#ID","Contract","Amount","Type","Recipient","Due Date","Paid Date","Status","Created","Actions"]
                      .map(h => <th key={h} style={TH}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {payments.map(p => {
                    const isOverdue = p.status === "PENDING" && p.due_date && new Date(p.due_date) < new Date();
                    return (
                      <tr key={p.id}
                        onMouseEnter={e => Array.from(e.currentTarget.cells).forEach(td => (td.style.background = "#f8fafc"))}
                        onMouseLeave={e => Array.from(e.currentTarget.cells).forEach(td => (td.style.background = ""))}>
                        <td style={{ ...TD, fontFamily: "monospace", color: "#94a3b8", fontSize: 12 }}>{p.id}</td>
                        <td style={TD}>
                          <span style={{ background: "#eef2ff", color: "#6366f1",
                            padding: "2px 8px", borderRadius: 20, fontSize: 12, fontWeight: 500 }}>
                            #{p.contract_id}
                          </span>
                        </td>
                        <td style={{ ...TD, fontWeight: 600, color: isOverdue ? "#ef4444" : "#0f172a" }}>
                          {fmtPrice(p.amount, p.currency)}
                          {isOverdue && <span style={{ fontSize: 10, color: "#ef4444",
                            marginLeft: 5, fontWeight: 400 }}>OVERDUE</span>}
                        </td>
                        <td style={TD}>
                          <span style={{ background: "#f1f5f9", color: "#475569",
                            padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 500 }}>
                            {p.payment_type}
                          </span>
                        </td>
                        <td style={{ ...TD, color: "#64748b", fontSize: 12 }}>
                          {p.recipient_name || (p.recipient_id ? `#${p.recipient_id}` : "Company")}
                        </td>
                        <td style={{ ...TD, color: isOverdue ? "#ef4444" : "#64748b",
                          fontWeight: isOverdue ? 500 : 400 }}>{fmtDate(p.due_date)}</td>
                        <td style={{ ...TD, color: "#64748b" }}>{fmtDate(p.paid_date)}</td>
                        <td style={TD}><Badge label={p.status} /></td>
                        <td style={{ ...TD, color: "#94a3b8", fontSize: 12 }}>{fmtDate(p.created_at)}</td>
                        <td style={TD}>
                          <div style={{ display: "flex", gap: 5 }}>
                            <button style={btnSm("#eef2ff","#6366f1","#c7d7fe")} onClick={() => setDetail(p)}>Detail</button>
                            {p.status === "PENDING" && (
                              <button style={btnSm("#ecfdf5","#047857","#a7f3d0")} onClick={() => setMarkPaid(p)}>Mark Paid</button>
                            )}
                            {["PENDING","OVERDUE"].includes(p.status) && (
                              <button style={btnSm("#fffbeb","#92400e","#fde68a")} onClick={() => setStatusTgt(p)}>Status</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages}
              onChange={p => setPage(p)} />
          </>
        )}
      </div>

      {createOpen     && <CreatePaymentModal onClose={() => setCreateOpen(false)}
        onSuccess={() => { setCreateOpen(false); refetch(); }} notify={notify} />}
      {detailTarget   && <PaymentDetailModal payment={detailTarget} onClose={() => setDetail(null)} />}
      {markPaidTarget && <MarkPaidModal payment={markPaidTarget} onClose={() => setMarkPaid(null)}
        onSuccess={() => { setMarkPaid(null); refetch(); notify("Pagesa u shënua si PAID"); }} notify={notify} />}
      {statusTarget   && <StatusModal payment={statusTarget} onClose={() => setStatusTgt(null)}
        onSuccess={() => { setStatusTgt(null); refetch(); notify("Statusi u ndryshua"); }} notify={notify} />}
      {toast          && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </MainLayout>
  );
}
