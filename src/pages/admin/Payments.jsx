import { useState, useEffect, useCallback } from "react";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "OVERDUE", "REFUNDED"];
const PAYMENT_TYPES    = ["RENT", "DEPOSIT", "LATE_FEE", "MAINTENANCE"];
const PAYMENT_METHODS  = ["BANK_TRANSFER", "CASH", "CARD", "CHECK", "ONLINE"];
const CURRENCIES       = ["EUR", "USD", "GBP", "CHF", "ALL", "MKD"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtPrice = (v, cur = "EUR") =>
  v != null ? `€${Number(v).toLocaleString("de-DE")} ${cur}` : "—";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }) : "—";

const fmtDateTime = (d) =>
  d ? new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—";

// ─── Badge ────────────────────────────────────────────────────────────────────

const BADGE_CFG = {
  PENDING:  { bg: "#FAEEDA", color: "#854F0B" },
  PAID:     { bg: "#EAF3DE", color: "#3B6D11" },
  FAILED:   { bg: "#FCEBEB", color: "#A32D2D" },
  OVERDUE:  { bg: "#FCEBEB", color: "#A32D2D" },
  REFUNDED: { bg: "#F1EFE8", color: "#5F5E5A" },
};

function Badge({ label }) {
  const s = BADGE_CFG[label] || { bg: "#F1EFE8", color: "#5F5E5A" };
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: 11, fontWeight: 500, padding: "3px 8px", borderRadius: 999, whiteSpace: "nowrap", display: "inline-block" }}>
      {label ?? "—"}
    </span>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function Modal({ title, onClose, children, maxWidth = 520 }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ width: "100%", maxWidth, background: "#fff", borderRadius: 16, boxShadow: "0 20px 60px rgba(15,23,42,0.18)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #e8edf4", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>{title}</span>
          <button onClick={onClose} style={{ width: 30, height: 30, border: "none", background: "none", color: "#94a3b8", cursor: "pointer", fontSize: 16, borderRadius: 6 }}>✕</button>
        </div>
        <div style={{ padding: "22px 24px" }}>{children}</div>
      </div>
    </div>
  );
}

function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 9999, background: type === "error" ? "#fee2e2" : "#ecfdf5", color: type === "error" ? "#b91c1c" : "#047857", padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 500, boxShadow: "0 4px 18px rgba(0,0,0,0.12)", maxWidth: 340 }}>
      {msg}
    </div>
  );
}

const TH = { padding: "10px 12px", textAlign: "left", fontWeight: 500, fontSize: 12, color: "#64748b", borderBottom: "1px solid #e8edf4", background: "#f8fafc", whiteSpace: "nowrap" };
const TD = { padding: "10px 12px", borderBottom: "1px solid #f1f5f9", fontSize: 13, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };
const inputSt  = { width: "100%", padding: "8px 11px", fontSize: 13, border: "1px solid #d1d5db", borderRadius: 8, background: "#fff", color: "#0f172a", outline: "none", boxSizing: "border-box" };
const selectSt = { ...inputSt, cursor: "pointer" };

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

function Row({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>{children}</div>;
}

function Empty({ icon, text }) {
  return <div style={{ textAlign: "center", padding: "52px 20px", color: "#94a3b8" }}><div style={{ fontSize: 34, marginBottom: 12 }}>{icon}</div><p style={{ fontSize: 14 }}>{text}</p></div>;
}

function Loader() {
  return <div style={{ textAlign: "center", padding: "48px 0" }}><div style={{ width: 28, height: 28, margin: "0 auto", border: "3px solid #e8edf4", borderTop: "3px solid #6366f1", borderRadius: "50%", animation: "spin .7s linear infinite" }} /></div>;
}

const btnPrimary = { fontSize: 13, padding: "7px 14px", borderRadius: 8, border: "none", background: "#6366f1", color: "#fff", cursor: "pointer", fontWeight: 500, whiteSpace: "nowrap" };
const btnSm = (bg, color, border) => ({ fontSize: 11, padding: "4px 9px", borderRadius: 6, border: `1px solid ${border}`, background: bg, color, cursor: "pointer", whiteSpace: "nowrap", fontWeight: 500 });

// ─── Payment detail modal ─────────────────────────────────────────────────────

function PaymentDetailModal({ payment: p, onClose }) {
  return (
    <Modal title={`Payment #${p.id} — Detaje`} onClose={onClose}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px", marginBottom: 16 }}>
        {[
          ["ID", `#${p.id}`],
          ["Contract", `#${p.contract_id}`],
          ["Amount", fmtPrice(p.amount, p.currency)],
          ["Type", p.payment_type || "—"],
          ["Status", "badge"],
          ["Due Date", fmtDate(p.due_date)],
          ["Paid Date", fmtDate(p.paid_date)],
          ["Method", p.payment_method || "—"],
          ["Ref", p.transaction_ref || "—"],
          ["Created", fmtDateTime(p.created_at)],
        ].map(([label, val]) => (
          <div key={label}>
            <p style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 3px" }}>{label}</p>
            {val === "badge" ? <Badge label={p.status} /> : <p style={{ fontSize: 14, fontWeight: 500, margin: 0, wordBreak: "break-all" }}>{val}</p>}
          </div>
        ))}
      </div>
      {p.notes && (
        <div>
          <p style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>Notes</p>
          <div style={{ background: "#f8fafc", border: "1px solid #e8edf4", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{p.notes}</div>
        </div>
      )}
    </Modal>
  );
}

// ─── Create payment modal ─────────────────────────────────────────────────────

function CreatePaymentModal({ contractId, onClose, onSuccess, notify }) {
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
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.contract_id || !form.amount || !form.due_date) {
      notify("Contract ID, Shuma dhe Due Date janë të detyrueshme", "error"); return;
    }
    setSaving(true);
    try {
      // POST /api/payments
      await api.post("/api/payments", {
        contract_id:    Number(form.contract_id),
        amount:         Number(form.amount),
        currency:       form.currency,
        payment_type:   form.payment_type,
        due_date:       form.due_date,
        payment_method: form.payment_method || null,
        notes:          form.notes || null,
      });
      onSuccess();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë krijimit", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={contractId ? `New Payment — Contract #${contractId}` : "New Payment"} onClose={onClose}>
      <Row>
        <Field label="Contract ID" required>
          <input style={inputSt} type="number" value={form.contract_id}
            onChange={(e) => set("contract_id", e.target.value)} disabled={!!contractId} placeholder="ex: 10" />
        </Field>
        <Field label="Amount (€)" required>
          <input style={inputSt} type="number" value={form.amount}
            onChange={(e) => set("amount", e.target.value)} placeholder="ex: 800" />
        </Field>
      </Row>
      <Row>
        <Field label="Payment Type">
          <select style={selectSt} value={form.payment_type} onChange={(e) => set("payment_type", e.target.value)}>
            {PAYMENT_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Currency">
          <select style={selectSt} value={form.currency} onChange={(e) => set("currency", e.target.value)}>
            {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
      </Row>
      <Row>
        <Field label="Due Date" required>
          <input style={inputSt} type="date" value={form.due_date} onChange={(e) => set("due_date", e.target.value)} />
        </Field>
        <Field label="Payment Method">
          <select style={selectSt} value={form.payment_method} onChange={(e) => set("payment_method", e.target.value)}>
            {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
          </select>
        </Field>
      </Row>
      <Field label="Notes">
        <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2}
          placeholder="Shënime shtesë..."
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

// ─── Mark paid modal ──────────────────────────────────────────────────────────

function MarkPaidModal({ payment, onClose, onSuccess, notify }) {
  const [form, setForm] = useState({
    payment_method:  payment.payment_method || "BANK_TRANSFER",
    transaction_ref: "",
    paid_date:       new Date().toISOString().split("T")[0],
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (form.paid_date > new Date().toISOString().split("T")[0]) {
      notify("Data e pagesës nuk mund të jetë në të ardhmen", "error"); return;
    }
    setSaving(true);
    try {
      // PATCH /api/payments/{id}/pay
      await api.patch(`/api/payments/${payment.id}/pay`, {
        payment_method:  form.payment_method,
        transaction_ref: form.transaction_ref || null,
        paid_date:       form.paid_date,
      });
      notify("Pagesa u shënua si PAID");
      onSuccess();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë shënimit", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={`Mark Payment #${payment.id} as PAID`} onClose={onClose}>
      <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 8, padding: "10px 14px", marginBottom: 18, fontSize: 13, color: "#047857" }}>
        Shuma: <strong>{fmtPrice(payment.amount, payment.currency)}</strong>
        {payment.due_date && <span style={{ marginLeft: 12, color: "#64748b" }}>Due: {fmtDate(payment.due_date)}</span>}
      </div>
      <Field label="Payment Method">
        <select style={selectSt} value={form.payment_method} onChange={(e) => set("payment_method", e.target.value)}>
          {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
        </select>
      </Field>
      <Row>
        <Field label="Transaction Ref">
          <input style={inputSt} value={form.transaction_ref} onChange={(e) => set("transaction_ref", e.target.value)} placeholder="TXN-12345" />
        </Field>
        <Field label="Paid Date">
          <input style={inputSt} type="date" value={form.paid_date}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => set("paid_date", e.target.value)} />
        </Field>
      </Row>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
        <button className="btn btn--secondary" onClick={onClose}>Anulo</button>
        <button className="btn btn--primary" onClick={handleSubmit} disabled={saving}>
          {saving ? "Duke shënuar..." : "✓ Konfirmo PAID"}
        </button>
      </div>
    </Modal>
  );
}

// ─── Status update modal ──────────────────────────────────────────────────────

function StatusModal({ payment, onClose, onSuccess, notify }) {
  const [status, setStatus] = useState("FAILED");
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

  const available = PAYMENT_STATUSES.filter((s) => s !== payment.status && s !== "PAID");
  const isDanger  = ["FAILED", "OVERDUE"].includes(status);

  return (
    <Modal title={`Ndrysho Statusin — Payment #${payment.id}`} onClose={onClose}>
      <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
        Statusi aktual: <Badge label={payment.status} />
      </p>
      <Field label="Statusi i ri" required>
        <select style={selectSt} value={status} onChange={(e) => setStatus(e.target.value)}>
          {available.map((s) => <option key={s}>{s}</option>)}
        </select>
      </Field>
      <div style={{ background: isDanger ? "#fef2f2" : "#f0fdf4", border: `1px solid ${isDanger ? "#fecaca" : "#a7f3d0"}`, borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 13, color: isDanger ? "#b91c1c" : "#047857" }}>
        {isDanger ? `⚠️ Pagesa do të shënohet si ${status}.` : `✓ Pagesa do të shënohet si ${status}.`}
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button className="btn btn--secondary" onClick={onClose}>Anulo</button>
        <button className={`btn ${isDanger ? "btn--danger" : "btn--primary"}`} onClick={handleSubmit} disabled={saving}>
          {saving ? "Duke ndryshuar..." : `Konfirmo — ${status}`}
        </button>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function AdminPayments() {
  const [contractId, setContractId]   = useState("");
  const [inputId, setInputId]         = useState("");
  const [payments, setPayments]       = useState([]);
  const [summary, setSummary]         = useState(null);
  const [loading, setLoading]         = useState(false);
  const [statusF, setStatusF]         = useState("");

  const [createOpen, setCreateOpen]   = useState(false);
  const [detailTarget, setDetail]     = useState(null);
  const [markPaidTarget, setMarkPaid] = useState(null);
  const [statusTarget, setStatusTgt] = useState(null);

  const [toast, setToast] = useState(null);
  const notify = useCallback((msg, type = "success") => setToast({ msg, type, key: Date.now() }), []);

  const fetchPayments = useCallback(async () => {
    if (!contractId) return;
    setLoading(true);
    try {
      const [listRes, sumRes] = await Promise.all([
        api.get(`/api/payments/contract/${contractId}`),
        api.get(`/api/payments/contract/${contractId}/summary`),
      ]);
      setPayments(listRes.data || []);
      setSummary(sumRes.data);
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë ngarkimit të pagesave", "error");
    } finally {
      setLoading(false);
    }
  }, [contractId, notify]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const displayed = statusF ? payments.filter((p) => p.status === statusF) : payments;

  // Summary stats
  const totalPaid    = summary ? Number(summary.total_paid)    : 0;
  const totalPending = summary ? Number(summary.total_pending) : 0;
  const overdueCount = summary ? summary.overdue_count         : 0;

  const statusColors = { PENDING: "#f59e0b", PAID: "#22c55e", FAILED: "#ef4444", OVERDUE: "#ef4444", REFUNDED: "#94a3b8" };
  const counts = PAYMENT_STATUSES.reduce((acc, s) => ({ ...acc, [s]: payments.filter((p) => p.status === s).length }), {});

  return (
    <MainLayout role="admin">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, margin: "0 0 4px" }}>Rental Payments</h1>
        <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>Admin view — menaxho pagesat e qirasë sipas kontratës</p>
      </div>

      {/* Summary bar */}
      {summary && contractId && (
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          {[
            { label: "Total Payments", val: summary.total_payments, color: "#6366f1", fmt: false },
            { label: "Total Paid",     val: totalPaid,              color: "#22c55e", fmt: true  },
            { label: "Total Pending",  val: totalPending,           color: "#f59e0b", fmt: true  },
            { label: "Overdue",        val: overdueCount,           color: "#ef4444", fmt: false },
          ].map((s) => (
            <div key={s.label} style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8edf4", padding: "12px 18px", flex: "1 1 120px" }}>
              <p style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>{s.label}</p>
              <p style={{ fontSize: s.fmt ? 18 : 26, fontWeight: 700, color: s.color, margin: 0, letterSpacing: "-0.02em" }}>
                {s.fmt ? fmtPrice(s.val) : s.val}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Payment status distribution */}
      {payments.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8edf4", padding: "14px 18px", marginBottom: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 500, color: "#374151", margin: "0 0 10px" }}>Status distribution</p>
          <div style={{ display: "flex", height: 8, borderRadius: 999, overflow: "hidden", gap: 1, marginBottom: 8 }}>
            {PAYMENT_STATUSES.map((s) => {
              const pct = payments.length > 0 ? (counts[s] / payments.length) * 100 : 0;
              return pct > 0 ? (
                <div key={s} title={`${s}: ${counts[s]}`} style={{ width: `${pct}%`, background: statusColors[s], transition: "width .4s" }} />
              ) : null;
            })}
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {PAYMENT_STATUSES.map((s) => (
              <span key={s} style={{ fontSize: 11, color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: statusColors[s], display: "inline-block" }} />
                {s} ({counts[s]})
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8edf4", overflow: "hidden" }}>
        {/* Toolbar */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 20px", borderBottom: "1px solid #e8edf4", flexWrap: "wrap" }}>
          <label style={{ fontSize: 13, color: "#64748b", whiteSpace: "nowrap" }}>Lease Contract #</label>
          <input type="number" value={inputId} onChange={(e) => setInputId(e.target.value)}
            placeholder="ex: 10"
            style={{ width: 110, padding: "7px 11px", fontSize: 13, border: "1px solid #d1d5db", borderRadius: 8, background: "#fff", color: "#0f172a", outline: "none" }}
          />
          <button onClick={() => { setContractId(inputId ? Number(inputId) : ""); setSummary(null); }}
            style={{ fontSize: 13, padding: "7px 14px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff", color: "#374151", cursor: "pointer" }}>
            Load
          </button>
          {contractId && (
            <button onClick={() => setCreateOpen(true)} style={btnPrimary}>+ Add Payment</button>
          )}
          <div style={{ marginLeft: "auto" }}>
            <select value={statusF} onChange={(e) => setStatusF(e.target.value)}
              style={{ padding: "7px 10px", fontSize: 13, border: "1px solid #d1d5db", borderRadius: 8, background: "#fff", color: "#0f172a", cursor: "pointer" }}>
              <option value="">All statuses</option>
              {PAYMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        {!contractId ? (
          <Empty icon="💳" text="Shkruaj Lease Contract ID dhe kliko Load për të parë pagesat." />
        ) : loading ? <Loader /> : displayed.length === 0 ? (
          <Empty icon="💳" text={statusF ? `Nuk ka pagesa me status ${statusF}.` : "Nuk ka pagesa për këtë kontratë."} />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
              <thead>
                <tr>
                  {["#ID", "Amount", "Type", "Method", "Due Date", "Paid Date", "Ref", "Status", "Created", "Actions"].map((h) => (
                    <th key={h} style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayed.map((p) => {
                  const isOverdue = p.status === "PENDING" && p.due_date && new Date(p.due_date) < new Date();
                  return (
                    <tr key={p.id}
                      onMouseEnter={(e) => Array.from(e.currentTarget.cells).forEach((c) => (c.style.background = "#f8fafc"))}
                      onMouseLeave={(e) => Array.from(e.currentTarget.cells).forEach((c) => (c.style.background = ""))}>
                      <td style={{ ...TD, fontFamily: "monospace", color: "#94a3b8", fontSize: 12 }}>{p.id}</td>
                      <td style={{ ...TD, fontWeight: 600, color: isOverdue ? "#ef4444" : "#0f172a" }}>
                        {fmtPrice(p.amount, p.currency)}
                        {isOverdue && <span style={{ fontSize: 10, color: "#ef4444", marginLeft: 6, fontWeight: 400 }}>SCADUTO</span>}
                      </td>
                      <td style={TD}>
                        <span style={{ background: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 500 }}>
                          {p.payment_type}
                        </span>
                      </td>
                      <td style={{ ...TD, color: "#64748b" }}>{p.payment_method || "—"}</td>
                      <td style={{ ...TD, color: isOverdue ? "#ef4444" : "#64748b", fontWeight: isOverdue ? 500 : 400 }}>{fmtDate(p.due_date)}</td>
                      <td style={{ ...TD, color: "#64748b" }}>{fmtDate(p.paid_date)}</td>
                      <td style={{ ...TD, fontSize: 12, color: "#94a3b8", maxWidth: 100 }} title={p.transaction_ref || ""}>{p.transaction_ref || "—"}</td>
                      <td style={TD}><Badge label={p.status} /></td>
                      <td style={{ ...TD, color: "#94a3b8", fontSize: 12 }}>{fmtDateTime(p.created_at)}</td>
                      <td style={TD}>
                        <div style={{ display: "flex", gap: 5 }}>
                          <button style={btnSm("#eef2ff", "#6366f1", "#c7d7fe")} onClick={() => setDetail(p)}>Detail</button>
                          {p.status === "PENDING" && (
                            <button style={btnSm("#ecfdf5", "#047857", "#a7f3d0")} onClick={() => setMarkPaid(p)}>Mark Paid</button>
                          )}
                          {["PENDING", "OVERDUE"].includes(p.status) && (
                            <button style={btnSm("#fffbeb", "#92400e", "#fde68a")} onClick={() => setStatusTgt(p)}>Status</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {createOpen     && <CreatePaymentModal contractId={contractId} onClose={() => setCreateOpen(false)} onSuccess={() => { setCreateOpen(false); fetchPayments(); notify("Pagesa u krijua"); }} notify={notify} />}
      {detailTarget   && <PaymentDetailModal payment={detailTarget} onClose={() => setDetail(null)} />}
      {markPaidTarget && <MarkPaidModal payment={markPaidTarget} onClose={() => setMarkPaid(null)} onSuccess={() => { setMarkPaid(null); fetchPayments(); }} notify={notify} />}
      {statusTarget   && <StatusModal payment={statusTarget} onClose={() => setStatusTgt(null)} onSuccess={() => { setStatusTgt(null); fetchPayments(); notify("Statusi u ndryshua"); }} notify={notify} />}
      {toast          && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </MainLayout>
  );
}
