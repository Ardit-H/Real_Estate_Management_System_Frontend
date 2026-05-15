import { useState, useEffect, useCallback } from "react";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";

// ─── DTOs (nga backend) ───────────────────────────────────────────────────────
// PaymentResponse: id, contract_id, amount, currency, payment_type,
//   due_date, paid_date, payment_method, transaction_ref,
//   recipient_id, recipient_name, recipient_type, status, notes, created_at
// PaymentSummaryResponse: total_payments, total_paid, total_pending, total_overdue, payments
// PaymentCreateRequest: contract_id, amount, currency, payment_type,
//   due_date, payment_method, recipient_id, notes
// PaymentMarkPaidRequest: payment_method, transaction_ref, paid_date
// PaymentStatusRequest: status

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  .pm * { box-sizing: border-box; margin: 0; padding: 0; }
  .pm { min-height: 100vh; background: #1a1714; font-family: 'DM Sans', sans-serif; color: #f5f0e8; padding: 32px 36px; }

  .pm-eyebrow { font-size: 10.5px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: rgba(201,184,122,0.55); margin-bottom: 6px; }
  .pm-title { font-family: 'Cormorant Garamond', serif; font-size: 34px; font-weight: 700; color: #f5f0e8; line-height: 1.1; margin-bottom: 4px; }
  .pm-title span { color: #c9b87a; font-style: italic; }
  .pm-subtitle { font-size: 13px; color: rgba(245,240,232,0.38); margin-bottom: 28px; }

  /* Stats */
  .pm-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 28px; }
  .pm-stat { background: rgba(255,255,255,0.025); border: 1px solid rgba(201,184,122,0.1); border-radius: 14px; padding: 18px 20px; transition: all 0.2s; }
  .pm-stat:hover { background: rgba(201,184,122,0.05); border-color: rgba(201,184,122,0.2); transform: translateY(-1px); }
  .pm-stat-label { font-size: 10.5px; font-weight: 600; letter-spacing: 1.2px; text-transform: uppercase; color: rgba(245,240,232,0.3); margin-bottom: 8px; }
  .pm-stat-value { font-family: 'Cormorant Garamond', serif; font-size: 26px; font-weight: 700; line-height: 1; }
  .pm-stat-sub { font-size: 11px; color: rgba(245,240,232,0.3); margin-top: 4px; }

  /* Tabs */
  .pm-tabs { display: flex; gap: 4px; margin-bottom: 20px; border-bottom: 1px solid rgba(201,184,122,0.1); }
  .pm-tab { height: 38px; padding: 0 18px; background: none; border: none; border-bottom: 2px solid transparent; color: rgba(245,240,232,0.4); font-size: 13.5px; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.17s; display: flex; align-items: center; gap: 7px; margin-bottom: -1px; }
  .pm-tab:hover { color: rgba(245,240,232,0.7); }
  .pm-tab.active { color: #c9b87a; border-bottom-color: #c9b87a; font-weight: 600; }
  .pm-tab-badge { background: rgba(201,184,122,0.15); color: #c9b87a; padding: 1px 7px; border-radius: 10px; font-size: 11px; font-weight: 600; }
  .pm-tab-badge.red { background: rgba(248,113,113,0.15); color: #f87171; }

  /* Toolbar */
  .pm-toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; flex-wrap: wrap; }
  .pm-search { flex: 1; min-width: 200px; max-width: 320px; display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(201,184,122,0.12); border-radius: 10px; padding: 0 14px; height: 38px; transition: all 0.2s; }
  .pm-search:focus-within { border-color: rgba(201,184,122,0.3); box-shadow: 0 0 0 3px rgba(201,184,122,0.07); }
  .pm-search input { flex: 1; border: none; background: transparent; outline: none; font-size: 13px; color: #f5f0e8; font-family: 'DM Sans', sans-serif; }
  .pm-search input::placeholder { color: rgba(245,240,232,0.2); }
  .pm-select { height: 38px; padding: 0 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(201,184,122,0.12); border-radius: 10px; color: rgba(245,240,232,0.6); font-size: 12.5px; font-family: 'DM Sans', sans-serif; cursor: pointer; outline: none; }
  .pm-select option { background: #1a1714; }
  .pm-btn-add { height: 38px; padding: 0 16px; background: linear-gradient(135deg,#c9b87a,#b0983e); color: #1a1714; border: none; border-radius: 10px; font-size: 13px; font-weight: 700; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.17s; display: flex; align-items: center; gap: 6px; margin-left: auto; }
  .pm-btn-add:hover { opacity: 0.88; transform: translateY(-1px); }
  .pm-count { font-size: 12px; color: rgba(245,240,232,0.28); white-space: nowrap; }

  /* Table */
  .pm-table-wrap { background: rgba(255,255,255,0.02); border: 1px solid rgba(201,184,122,0.1); border-radius: 16px; overflow: hidden; margin-bottom: 20px; }
  .pm-table { width: 100%; border-collapse: collapse; }
  .pm-table thead tr { border-bottom: 1px solid rgba(201,184,122,0.1); background: rgba(255,255,255,0.02); }
  .pm-table th { padding: 12px 14px; text-align: left; font-size: 10.5px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: rgba(201,184,122,0.5); white-space: nowrap; }
  .pm-table th:last-child { text-align: right; }
  .pm-table tbody tr { border-bottom: 1px solid rgba(201,184,122,0.05); transition: background 0.15s; }
  .pm-table tbody tr:last-child { border-bottom: none; }
  .pm-table tbody tr:hover { background: rgba(201,184,122,0.04); }
  .pm-table td { padding: 13px 14px; vertical-align: middle; font-size: 13px; }
  .pm-table td:last-child { text-align: right; }

  /* Badges */
  .pm-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; white-space: nowrap; }
  .pm-badge-dot { width: 5px; height: 5px; border-radius: 50%; }
  .pm-badge-PENDING  { background: rgba(251,191,36,0.12);  color: #fbbf24; }
  .pm-badge-PENDING .pm-badge-dot  { background: #fbbf24; }
  .pm-badge-PAID     { background: rgba(52,211,153,0.12);  color: #34d399; }
  .pm-badge-PAID .pm-badge-dot     { background: #34d399; }
  .pm-badge-OVERDUE  { background: rgba(248,113,113,0.14); color: #f87171; }
  .pm-badge-OVERDUE .pm-badge-dot  { background: #f87171; }
  .pm-badge-FAILED   { background: rgba(248,113,113,0.1);  color: #f87171; }
  .pm-badge-FAILED .pm-badge-dot   { background: #f87171; }
  .pm-badge-REFUNDED { background: rgba(167,139,250,0.12); color: #a78bfa; }
  .pm-badge-REFUNDED .pm-badge-dot { background: #a78bfa; }

  .pm-type-chip { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 500; background: rgba(201,184,122,0.08); color: rgba(201,184,122,0.7); border: 1px solid rgba(201,184,122,0.12); }

  /* Actions */
  .pm-actions { display: flex; align-items: center; gap: 6px; justify-content: flex-end; }
  .pm-btn { height: 29px; padding: 0 11px; border-radius: 7px; font-size: 11.5px; font-family: 'DM Sans', sans-serif; font-weight: 500; cursor: pointer; transition: all 0.17s; display: flex; align-items: center; gap: 5px; border: 1px solid transparent; }
  .pm-btn-view   { background: rgba(255,255,255,0.04); border-color: rgba(201,184,122,0.12); color: rgba(245,240,232,0.5); }
  .pm-btn-view:hover   { background: rgba(201,184,122,0.08); color: #c9b87a; border-color: rgba(201,184,122,0.25); }
  .pm-btn-paid   { background: rgba(52,211,153,0.1); border-color: rgba(52,211,153,0.25); color: #34d399; }
  .pm-btn-paid:hover   { background: rgba(52,211,153,0.18); }
  .pm-btn-paid:disabled { opacity: 0.3; cursor: not-allowed; }
  .pm-btn-status { background: rgba(167,139,250,0.08); border-color: rgba(167,139,250,0.2); color: #a78bfa; }
  .pm-btn-status:hover { background: rgba(167,139,250,0.15); }

  /* Pagination */
  .pm-pagination { display: flex; align-items: center; gap: 8px; justify-content: center; padding: 14px; }
  .pm-page-btn { height: 32px; min-width: 32px; padding: 0 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(201,184,122,0.12); border-radius: 8px; color: rgba(245,240,232,0.5); font-size: 12px; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; justify-content: center; }
  .pm-page-btn:hover:not(:disabled) { background: rgba(201,184,122,0.08); color: #c9b87a; }
  .pm-page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
  .pm-page-btn.active { background: rgba(201,184,122,0.15); color: #c9b87a; border-color: rgba(201,184,122,0.3); }

  /* Empty/Spinner */
  .pm-empty { padding: 60px 24px; text-align: center; color: rgba(245,240,232,0.28); }
  .pm-empty-icon { font-size: 34px; margin-bottom: 12px; }
  .pm-empty-text { font-size: 14px; }
  @keyframes pm-spin { to { transform: rotate(360deg); } }
  .pm-spinner { width: 22px; height: 22px; margin: 52px auto; border: 2px solid rgba(201,184,122,0.15); border-top-color: #c9b87a; border-radius: 50%; animation: pm-spin 0.7s linear infinite; }

  /* Modal */
  .pm-overlay { position: fixed; inset: 0; z-index: 600; background: rgba(0,0,0,0.78); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; padding: 20px; animation: pm-fade 0.18s ease; }
  @keyframes pm-fade { from{opacity:0} to{opacity:1} }
  @keyframes pm-up   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  .pm-modal { background: #211d19; border: 1px solid rgba(201,184,122,0.15); border-radius: 18px; width: 100%; max-width: 520px; max-height: 92vh; overflow-y: auto; box-shadow: 0 36px 88px rgba(0,0,0,0.65); animation: pm-up 0.24s cubic-bezier(0.16,1,0.3,1); }
  .pm-modal-sm { max-width: 420px; }
  .pm-modal-header { padding: 20px 24px 14px; border-bottom: 1px solid rgba(201,184,122,0.08); background: rgba(255,255,255,0.02); position: sticky; top: 0; z-index: 1; display: flex; align-items: center; justify-content: space-between; }
  .pm-modal-title { font-family: 'Cormorant Garamond', serif; font-size: 21px; font-weight: 700; color: #f5f0e8; }
  .pm-modal-sub { font-size: 12px; color: rgba(245,240,232,0.35); margin-top: 2px; }
  .pm-modal-close { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; width: 30px; height: 30px; cursor: pointer; color: rgba(245,240,232,0.5); font-size: 15px; display: flex; align-items: center; justify-content: center; transition: all 0.15s; flex-shrink: 0; }
  .pm-modal-close:hover { color: #f5f0e8; background: rgba(255,255,255,0.1); }
  .pm-modal-body { padding: 20px 24px; }
  .pm-modal-footer { display: flex; gap: 10px; justify-content: flex-end; padding-top: 16px; border-top: 1px solid rgba(201,184,122,0.08); margin-top: 4px; }

  /* Form */
  .pm-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .pm-field { margin-bottom: 14px; }
  .pm-label { display: block; font-size: 10.5px; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase; color: rgba(201,184,122,0.5); margin-bottom: 7px; }
  .pm-label span { color: #f87171; margin-left: 2px; }
  .pm-input { width: 100%; padding: 10px 13px; background: rgba(255,255,255,0.04); border: 1px solid rgba(201,184,122,0.14); border-radius: 9px; color: #f5f0e8; font-size: 13px; font-family: 'DM Sans', sans-serif; outline: none; transition: border-color 0.2s; }
  .pm-input:focus { border-color: rgba(201,184,122,0.4); box-shadow: 0 0 0 3px rgba(201,184,122,0.07); }
  .pm-input::placeholder { color: rgba(245,240,232,0.2); }
  .pm-input option { background: #1a1714; }

  /* Detail grid */
  .pm-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
  .pm-detail-item { background: rgba(255,255,255,0.03); border: 1px solid rgba(201,184,122,0.08); border-radius: 10px; padding: 11px 14px; }
  .pm-detail-item.full { grid-column: 1/-1; }
  .pm-detail-label { font-size: 10px; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase; color: rgba(201,184,122,0.45); margin-bottom: 5px; }
  .pm-detail-value { font-size: 13px; color: rgba(245,240,232,0.8); }

  /* Footer buttons */
  .pm-btn-cancel { height: 38px; padding: 0 18px; background: rgba(255,255,255,0.04); border: 1px solid rgba(201,184,122,0.12); border-radius: 10px; color: rgba(245,240,232,0.5); font-size: 13px; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.15s; }
  .pm-btn-cancel:hover { background: rgba(255,255,255,0.07); color: #f5f0e8; }
  .pm-btn-primary { height: 38px; padding: 0 22px; background: linear-gradient(135deg,#c9b87a,#b0983e); color: #1a1714; border: none; border-radius: 10px; font-size: 13px; font-weight: 700; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.15s; }
  .pm-btn-primary:hover { opacity: 0.88; }
  .pm-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

  /* Toast */
  @keyframes pm-toast-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  .pm-toast { position: fixed; bottom: 28px; right: 28px; z-index: 9999; background: #211d19; border-radius: 12px; padding: 13px 18px; display: flex; align-items: center; gap: 10px; box-shadow: 0 16px 40px rgba(0,0,0,0.5); font-size: 13.5px; color: rgba(245,240,232,0.85); max-width: 340px; animation: pm-toast-in 0.25s ease; }
  .pm-toast.success { border: 1px solid rgba(52,211,153,0.3); }
  .pm-toast.error   { border: 1px solid rgba(248,113,113,0.3); }
`;

const PAYMENT_TYPES   = ["RENT","DEPOSIT","LATE_FEE","MAINTENANCE","AGENT_COMMISSION","CLIENT_BONUS"];
const PAYMENT_METHODS = ["BANK_TRANSFER","CASH","CARD","CHECK"];
const CURRENCIES      = ["EUR","USD","GBP","CHF","ALL","MKD"];
const ALL_STATUSES    = ["PENDING","PAID","OVERDUE","FAILED","REFUNDED"];

const fmtMoney = (v, cur = "EUR") =>
  v != null ? `${cur || "EUR"} ${Number(v).toLocaleString("de-DE", { minimumFractionDigits: 2 })}` : "—";
const fmtDate = d => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const today   = () => new Date().toISOString().split("T")[0];

const isOverdue = p =>
  p.status === "OVERDUE" ||
  (p.status === "PENDING" && p.due_date &&
    new Date(p.due_date).toISOString().split("T")[0] < today());

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const s = status || "PENDING";
  return (
    <span className={`pm-badge pm-badge-${s}`}>
      <span className="pm-badge-dot" />
      {s}
    </span>
  );
}

function Spinner() { return <div className="pm-spinner" />; }

function Toast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3400); return () => clearTimeout(t); }, [onDone]);
  return <div className={`pm-toast ${type}`}>{type === "success" ? "✅" : "❌"} {msg}</div>;
}

function Field({ label, required, hint, children }) {
  return (
    <div className="pm-field">
      <label className="pm-label">{label}{required && <span>*</span>}</label>
      {children}
      {hint && <p style={{ fontSize: 11, color: "rgba(245,240,232,0.28)", marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

// ─── CREATE MODAL ─────────────────────────────────────────────────────────────
function CreateModal({ onClose, onSuccess, notify }) {
  const [form, setForm] = useState({
    contract_id: "", amount: "", currency: "EUR",
    payment_type: "RENT", due_date: "",
    payment_method: "BANK_TRANSFER", recipient_id: "", notes: "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.contract_id || !form.amount || !form.due_date) {
      notify("Plotëso fushat e detyrueshme", "error"); return;
    }
    setSaving(true);
    try {
      await api.post("/api/payments", {
        contract_id:    Number(form.contract_id),
        amount:         Number(form.amount),
        currency:       form.currency || "EUR",
        payment_type:   form.payment_type || null,
        due_date:       form.due_date,
        payment_method: form.payment_method || null,
        recipient_id:   form.recipient_id ? Number(form.recipient_id) : null,
        notes:          form.notes || null,
      });
      onSuccess();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë krijimit", "error");
    } finally { setSaving(false); }
  };

  useEffect(() => {
    const h = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div className="pm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="pm-modal">
        <div className="pm-modal-header">
          <div>
            <div className="pm-modal-title">New Payment</div>
            <div className="pm-modal-sub">Krijo pagesë të re për kontratë</div>
          </div>
          <button className="pm-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="pm-modal-body">
          <Field label="Contract ID" required>
            <input className="pm-input" type="number" min="1" placeholder="ID e kontratës" value={form.contract_id} onChange={e => set("contract_id", e.target.value)} />
          </Field>
          <div className="pm-row2">
            <Field label="Amount" required>
              <input className="pm-input" type="number" min="0" step="0.01" placeholder="450.00" value={form.amount} onChange={e => set("amount", e.target.value)} />
            </Field>
            <Field label="Currency">
              <select className="pm-input" value={form.currency} onChange={e => set("currency", e.target.value)}>
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
          </div>
          <div className="pm-row2">
            <Field label="Payment Type">
              <select className="pm-input" value={form.payment_type} onChange={e => set("payment_type", e.target.value)}>
                {PAYMENT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Due Date" required>
              <input className="pm-input" type="date" value={form.due_date} onChange={e => set("due_date", e.target.value)} />
            </Field>
          </div>
          <div className="pm-row2">
            <Field label="Payment Method">
              <select className="pm-input" value={form.payment_method} onChange={e => set("payment_method", e.target.value)}>
                {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="Recipient ID" hint="Opcional — null = Kompania">
              <input className="pm-input" type="number" min="1" placeholder="—" value={form.recipient_id} onChange={e => set("recipient_id", e.target.value)} />
            </Field>
          </div>
          <Field label="Notes" hint="Max 1000 karaktere">
            <textarea className="pm-input" rows={2} placeholder="(opcional)" value={form.notes} onChange={e => set("notes", e.target.value)} style={{ resize: "vertical", minHeight: 60 }} />
          </Field>
          <div className="pm-modal-footer">
            <button className="pm-btn-cancel" onClick={onClose}>Anulo</button>
            <button className="pm-btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? "Duke krijuar..." : "✓ Krijo Pagesë"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MARK PAID MODAL ──────────────────────────────────────────────────────────
function MarkPaidModal({ payment, onClose, onSuccess, notify }) {
  const [form, setForm] = useState({
    payment_method:  payment.payment_method || "BANK_TRANSFER",
    transaction_ref: "",
    paid_date:       today(),
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.paid_date) { notify("Paid date e detyrueshme", "error"); return; }
    if (form.paid_date > today()) { notify("Paid date nuk mund të jetë në të ardhmen", "error"); return; }
    setSaving(true);
    try {
      await api.patch(`/api/payments/${payment.id}/pay`, {
        payment_method:  form.payment_method  || null,
        transaction_ref: form.transaction_ref || null,
        paid_date:       form.paid_date,
      });
      onSuccess();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim", "error");
    } finally { setSaving(false); }
  };

  return (
    <div className="pm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="pm-modal pm-modal-sm">
        <div className="pm-modal-header">
          <div>
            <div className="pm-modal-title">Mark as PAID</div>
            <div className="pm-modal-sub">Pagesa #{payment.id} · {fmtMoney(payment.amount, payment.currency)}</div>
          </div>
          <button className="pm-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="pm-modal-body">
          <div style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.18)", borderRadius: 9, padding: "10px 13px", marginBottom: 16, fontSize: 12.5, color: "rgba(245,240,232,0.6)", lineHeight: 1.6 }}>
            Shuma: <strong style={{ color: "#c9b87a" }}>{fmtMoney(payment.amount, payment.currency)}</strong>
            {" · "} Tipi: <strong>{payment.payment_type}</strong>
          </div>
          <Field label="Metoda e Pagesës">
            <select className="pm-input" value={form.payment_method} onChange={e => set("payment_method", e.target.value)}>
              {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
            </select>
          </Field>
          <div className="pm-row2">
            <Field label="Transaction Ref" hint="Opcional">
              <input className="pm-input" type="text" placeholder="TXN-12345" value={form.transaction_ref} onChange={e => set("transaction_ref", e.target.value)} />
            </Field>
            <Field label="Paid Date" required>
              <input className="pm-input" type="date" value={form.paid_date} max={today()} onChange={e => set("paid_date", e.target.value)} />
            </Field>
          </div>
          <div className="pm-modal-footer">
            <button className="pm-btn-cancel" onClick={onClose}>Anulo</button>
            <button className="pm-btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? "Duke shënuar..." : "✓ Konfirmo PAID"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── STATUS MODAL ─────────────────────────────────────────────────────────────
function StatusModal({ payment, onClose, onSuccess, notify }) {
  const [status, setStatus] = useState(payment.status);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (status === payment.status) { onClose(); return; }
    setSaving(true);
    try {
      await api.patch(`/api/payments/${payment.id}/status`, { status });
      onSuccess();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim", "error");
    } finally { setSaving(false); }
  };

  return (
    <div className="pm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="pm-modal pm-modal-sm">
        <div className="pm-modal-header">
          <div>
            <div className="pm-modal-title">Change Status</div>
            <div className="pm-modal-sub">Pagesa #{payment.id}</div>
          </div>
          <button className="pm-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="pm-modal-body">
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {ALL_STATUSES.map(s => (
              <label key={s} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", background: status === s ? "rgba(201,184,122,0.08)" : "rgba(255,255,255,0.02)", border: `1px solid ${status === s ? "rgba(201,184,122,0.25)" : "rgba(201,184,122,0.08)"}`, borderRadius: 10, cursor: "pointer", transition: "all 0.15s" }}>
                <input type="radio" name="status" value={s} checked={status === s} onChange={() => setStatus(s)} style={{ accentColor: "#c9b87a" }} />
                <StatusBadge status={s} />
              </label>
            ))}
          </div>
          <div className="pm-modal-footer">
            <button className="pm-btn-cancel" onClick={onClose}>Anulo</button>
            <button className="pm-btn-primary" onClick={handleSubmit} disabled={saving || status === payment.status}>
              {saving ? "Duke ndryshuar..." : "✓ Ndrysho Statusin"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── VIEW MODAL ───────────────────────────────────────────────────────────────
function ViewModal({ payment, onClose, onMarkPaid, onStatus }) {
  const overdue = isOverdue(payment);
  return (
    <div className="pm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="pm-modal">
        <div className="pm-modal-header">
          <div>
            <div className="pm-modal-title">Payment #{payment.id}</div>
            <div className="pm-modal-sub">Detajet e plota</div>
          </div>
          <button className="pm-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="pm-modal-body">
          <div style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,184,122,0.1)", borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 11, color: "rgba(245,240,232,0.35)", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 600, marginBottom: 6 }}>Status</p>
              <StatusBadge status={overdue && payment.status === "PENDING" ? "OVERDUE" : payment.status} />
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 11, color: "rgba(245,240,232,0.35)", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 600, marginBottom: 4 }}>Amount</p>
              <p style={{ fontSize: 24, fontWeight: 700, color: "#c9b87a", fontFamily: "'Cormorant Garamond', serif" }}>
                {fmtMoney(payment.amount, payment.currency)}
              </p>
            </div>
          </div>
          <div className="pm-detail-grid">
            <div className="pm-detail-item">
              <div className="pm-detail-label">Contract ID</div>
              <div className="pm-detail-value">#{payment.contract_id || "—"}</div>
            </div>
            <div className="pm-detail-item">
              <div className="pm-detail-label">Payment Type</div>
              <div className="pm-detail-value">{payment.payment_type || "—"}</div>
            </div>
            <div className="pm-detail-item">
              <div className="pm-detail-label">Due Date</div>
              <div className="pm-detail-value" style={{ color: overdue ? "#f87171" : undefined }}>
                {overdue && "⚠️ "}{fmtDate(payment.due_date)}
              </div>
            </div>
            <div className="pm-detail-item">
              <div className="pm-detail-label">Paid Date</div>
              <div className="pm-detail-value">{fmtDate(payment.paid_date)}</div>
            </div>
            <div className="pm-detail-item">
              <div className="pm-detail-label">Payment Method</div>
              <div className="pm-detail-value">{payment.payment_method || "—"}</div>
            </div>
            <div className="pm-detail-item">
              <div className="pm-detail-label">Transaction Ref</div>
              <div className="pm-detail-value" style={{ fontSize: 12, wordBreak: "break-all" }}>{payment.transaction_ref || "—"}</div>
            </div>
            <div className="pm-detail-item">
              <div className="pm-detail-label">Recipient</div>
              <div className="pm-detail-value">
                {payment.recipient_name
                  ? `${payment.recipient_name} (${payment.recipient_type})`
                  : payment.recipient_type === "COMPANY" ? "🏢 Kompania" : "—"}
              </div>
            </div>
            <div className="pm-detail-item">
              <div className="pm-detail-label">Currency</div>
              <div className="pm-detail-value">{payment.currency || "EUR"}</div>
            </div>
            {payment.notes && (
              <div className="pm-detail-item full">
                <div className="pm-detail-label">Notes</div>
                <div className="pm-detail-value" style={{ fontSize: 12.5, lineHeight: 1.6 }}>{payment.notes}</div>
              </div>
            )}
            <div className="pm-detail-item">
              <div className="pm-detail-label">Created At</div>
              <div className="pm-detail-value">{fmtDate(payment.created_at)}</div>
            </div>
          </div>
          <div className="pm-modal-footer">
            <button className="pm-btn-cancel" onClick={onClose}>Mbyll</button>
            <button
              className="pm-btn"
              style={{ height: 38, padding: "0 16px", fontSize: 13, background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)", color: "#a78bfa", borderRadius: 10, cursor: "pointer" }}
              onClick={() => { onClose(); onStatus(payment); }}
            >⚡ Status</button>
            {payment.status !== "PAID" && payment.status !== "REFUNDED" && (
              <button className="pm-btn-primary" onClick={() => { onClose(); onMarkPaid(payment); }}>
                ✓ Mark Paid
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminPayments() {
  const [tab,          setTab]          = useState("status"); // "contract" | "status" | "overdue"
  const [contractId,   setContractId]   = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [search,       setSearch]       = useState("");

  const [payments,     setPayments]     = useState([]);
  const [summary,      setSummary]      = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [page,         setPage]         = useState(0);
  const [totalPages,   setTotalPages]   = useState(0);
  const [revenue,      setRevenue]      = useState(null);
  const [overdueCount, setOverdueCount] = useState(0);

  const [createOpen,   setCreateOpen]   = useState(false);
  const [viewTarget,   setViewTarget]   = useState(null);
  const [paidTarget,   setPaidTarget]   = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);

  const [toast, setToast] = useState(null);
  const notify = (msg, type = "success") => setToast({ msg, type, key: Date.now() });

  const PAGE_SIZE = 15;

  // Revenue & overdue count
  useEffect(() => {
    api.get("/api/payments/revenue").then(r => setRevenue(r.data)).catch(() => {});
    api.get("/api/payments/overdue").then(r => setOverdueCount((r.data || []).length)).catch(() => {});
  }, []);

  const fetchByContract = useCallback(async (cid) => {
    const id = cid ?? contractId;
    if (!id) return;
    setLoading(true); setSummary(null);
    try {
      const [listRes, sumRes] = await Promise.all([
        api.get(`/api/payments/contract/${id}`),
        api.get(`/api/payments/contract/${id}/summary`),
      ]);
      setPayments(Array.isArray(listRes.data) ? listRes.data : []);
      setSummary(sumRes.data);
      setTotalPages(1);
    } catch {
      notify("Kontrata nuk u gjet ose nuk ka pagesa", "error");
      setPayments([]);
    } finally { setLoading(false); }
  }, [contractId]);

  const fetchByStatus = useCallback(async () => {
    setLoading(true); setSummary(null);
    try {
      const res = await api.get(`/api/payments/status/${statusFilter}?page=${page}&size=${PAGE_SIZE}`);
      setPayments(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch {
      notify("Gabim gjatë ngarkimit", "error");
    } finally { setLoading(false); }
  }, [statusFilter, page]);

  const fetchOverdue = useCallback(async () => {
    setLoading(true); setSummary(null);
    try {
      const res = await api.get("/api/payments/overdue");
      setPayments(Array.isArray(res.data) ? res.data : []);
      setTotalPages(1);
    } catch {
      notify("Gabim gjatë ngarkimit", "error");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (tab === "status")   fetchByStatus();
    if (tab === "overdue")  fetchOverdue();
    if (tab === "contract") { setPayments([]); setSummary(null); }
  }, [tab, fetchByStatus, fetchOverdue]);

  const handleSuccess = (msg = "Operacioni u krye me sukses") => {
    setCreateOpen(false); setPaidTarget(null); setStatusTarget(null);
    notify(msg);
    if (tab === "contract" && contractId) fetchByContract(contractId);
    else if (tab === "status") fetchByStatus();
    else fetchOverdue();
    api.get("/api/payments/revenue").then(r => setRevenue(r.data)).catch(() => {});
    api.get("/api/payments/overdue").then(r => setOverdueCount((r.data || []).length)).catch(() => {});
  };

  // Client-side search filter
  const filtered = payments.filter(p => {
    const q = search.toLowerCase();
    return !q ||
      String(p.id).includes(q) ||
      String(p.contract_id).includes(q) ||
      (p.payment_type || "").toLowerCase().includes(q) ||
      (p.recipient_name || "").toLowerCase().includes(q) ||
      (p.status || "").toLowerCase().includes(q);
  });

  const stats = {
    revenue:  revenue,
    total:    payments.length,
    paid:     payments.filter(p => p.status === "PAID").length,
    overdue:  overdueCount,
  };

  const TABS = [
    { id: "status",   label: "By Status",   icon: "🔍" },
    { id: "contract", label: "By Contract", icon: "📋" },
    { id: "overdue",  label: "Overdue",     icon: "🔴", badge: overdueCount, red: true },
  ];

  return (
    <MainLayout role="admin">
      <style>{CSS}</style>
      <div className="pm">

        {/* ── Header ── */}
        <p className="pm-eyebrow">Finance Management</p>
        <h1 className="pm-title">Lease <span>Payments</span></h1>
        <p className="pm-subtitle">Menaxho pagesat e qirasë — shëno, filtro dhe krijo pagesa të reja</p>

        {/* ── Stats ── */}
        <div className="pm-stats">
          <div className="pm-stat">
            <p className="pm-stat-label">Total Revenue</p>
            <p className="pm-stat-value" style={{ color: "#34d399" }}>
              {revenue != null ? `€${Number(revenue).toLocaleString("de-DE")}` : "—"}
            </p>
            <p className="pm-stat-sub">pagesat PAID</p>
          </div>
          <div className="pm-stat">
            <p className="pm-stat-label">Payments Loaded</p>
            <p className="pm-stat-value" style={{ color: "#f5f0e8" }}>{stats.total}</p>
            <p className="pm-stat-sub">në pamjen aktuale</p>
          </div>
          <div className="pm-stat">
            <p className="pm-stat-label">PAID</p>
            <p className="pm-stat-value" style={{ color: "#34d399" }}>{stats.paid}</p>
            <p className="pm-stat-sub">nga lista aktuale</p>
          </div>
          <div className="pm-stat">
            <p className="pm-stat-label">Overdue</p>
            <p className="pm-stat-value" style={{ color: stats.overdue > 0 ? "#f87171" : "#94a3b8" }}>
              {stats.overdue}
            </p>
            <p className="pm-stat-sub">pagesa me vonesë</p>
          </div>
        </div>

        {/* Summary bar (vetëm kur By Contract) */}
        {summary && (
          <div style={{ display: "flex", gap: 16, padding: "14px 18px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(201,184,122,0.1)", borderRadius: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
            {[
              { label: "Total",   value: summary.total_payments,                                              color: "#f5f0e8" },
              { label: "Paid",    value: fmtMoney(summary.total_paid),                                        color: "#34d399" },
              { label: "Pending", value: fmtMoney(summary.total_pending),                                     color: "#fbbf24" },
              { label: "Overdue", value: summary.total_overdue, hide: !summary.total_overdue,                 color: "#f87171" },
            ].filter(s => !s.hide).map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                {i > 0 && <div style={{ width: 1, height: 28, background: "rgba(201,184,122,0.1)" }} />}
                <div>
                  <p style={{ fontSize: 10, color: "rgba(245,240,232,0.3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 3 }}>{s.label}</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: s.color, fontFamily: "'Cormorant Garamond', serif" }}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Tabs ── */}
        <div className="pm-tabs">
          {TABS.map(t => (
            <button key={t.id} className={`pm-tab ${tab === t.id ? "active" : ""}`}
              onClick={() => { setTab(t.id); setPage(0); setPayments([]); setSummary(null); }}>
              {t.icon} {t.label}
              {t.badge > 0 && <span className={`pm-tab-badge${t.red ? " red" : ""}`}>{t.badge}</span>}
            </button>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div className="pm-toolbar">
          <div className="pm-search">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(245,240,232,0.25)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Kërko sipas ID, tippit, recipientit..." />
          </div>

          {tab === "contract" && (
            <>
              <input
                className="pm-select"
                type="number" min="1"
                style={{ width: 150, cursor: "text" }}
                placeholder="Contract ID..."
                value={contractId}
                onChange={e => setContractId(e.target.value)}
                onKeyDown={e => e.key === "Enter" && fetchByContract(contractId)}
              />
              <button
                style={{ height: 38, padding: "0 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(201,184,122,0.15)", borderRadius: 10, color: "#c9b87a", fontSize: 13, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}
                onClick={() => fetchByContract(contractId)}
              >
                Load
              </button>
            </>
          )}

          {tab === "status" && (
            <select className="pm-select" value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(0); }}>
              {ALL_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          )}

          <span className="pm-count">{filtered.length} pagesa</span>
          <button className="pm-btn-add" onClick={() => setCreateOpen(true)}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Payment
          </button>
        </div>

        {/* ── Table ── */}
        <div className="pm-table-wrap">
          {loading ? <Spinner /> :
           filtered.length === 0 ? (
            <div className="pm-empty">
              <div className="pm-empty-icon">
                {tab === "contract" && !contractId ? "📋" : tab === "overdue" ? "✅" : "💳"}
              </div>
              <div className="pm-empty-text">
                {tab === "contract" && !contractId
                  ? "Shkruaj Contract ID dhe kliko Load"
                  : tab === "overdue"
                  ? "Nuk ka pagesa me vonesë 🎉"
                  : "Nuk ka pagesa"}
              </div>
            </div>
          ) : (
            <table className="pm-table">
              <thead>
                <tr>
                  <th>#ID</th>
                  <th>Contract</th>
                  <th>Shuma</th>
                  <th>Tipi</th>
                  <th>Recipient</th>
                  <th>Due Date</th>
                  <th>Paid Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const overdue = isOverdue(p);
                  return (
                    <tr key={p.id} onClick={() => setViewTarget(p)}>
                      <td>
                        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, fontWeight: 700, color: "#c9b87a" }}>
                          #{p.id}
                        </span>
                      </td>
                      <td>
                        <span style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(201,184,122,0.1)", padding: "2px 8px", borderRadius: 6, fontSize: 12, color: "rgba(245,240,232,0.55)" }}>
                          #{p.contract_id}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: "#c9b87a", fontSize: 13.5 }}>
                          {fmtMoney(p.amount, p.currency)}
                        </span>
                      </td>
                      <td>
                        <span className="pm-type-chip">{p.payment_type || "—"}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: 12.5, color: "rgba(245,240,232,0.5)" }}>
                          {p.recipient_name
                            ? `${p.recipient_name}`
                            : <span style={{ color: "rgba(201,184,122,0.5)", fontSize: 12 }}>🏢 Kompania</span>}
                        </span>
                        {p.recipient_type && p.recipient_type !== "COMPANY" && (
                          <span style={{ fontSize: 10, color: "rgba(245,240,232,0.3)", marginLeft: 4 }}>({p.recipient_type})</span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: 12.5, color: overdue ? "#f87171" : "rgba(245,240,232,0.5)", fontWeight: overdue ? 600 : 400 }}>
                          {overdue && "⚠️ "}{fmtDate(p.due_date)}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: 12, color: "rgba(245,240,232,0.38)" }}>
                          {fmtDate(p.paid_date)}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={overdue && p.status === "PENDING" ? "OVERDUE" : p.status} />
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        <div className="pm-actions">
                          <button className="pm-btn pm-btn-view" onClick={() => setViewTarget(p)}>👁</button>
                          <button
                            className="pm-btn pm-btn-paid"
                            disabled={p.status === "PAID" || p.status === "REFUNDED"}
                            onClick={() => setPaidTarget(p)}
                          >✓ Paid</button>
                          <button className="pm-btn pm-btn-status" onClick={() => setStatusTarget(p)}>⚡</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Pagination (vetëm By Status) ── */}
        {tab === "status" && totalPages > 1 && (
          <div className="pm-pagination">
            <button className="pm-page-btn" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const p = page <= 3 ? i : page - 3 + i;
              if (p >= totalPages) return null;
              return (
                <button key={p} className={`pm-page-btn ${p === page ? "active" : ""}`} onClick={() => setPage(p)}>
                  {p + 1}
                </button>
              );
            })}
            <button className="pm-page-btn" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        )}

      </div>

      {/* ── Modals ── */}
      {createOpen && (
        <CreateModal
          onClose={() => setCreateOpen(false)}
          onSuccess={() => handleSuccess("Pagesa u krijua me sukses ✓")}
          notify={notify}
        />
      )}

      {viewTarget && (
        <ViewModal
          payment={viewTarget}
          onClose={() => setViewTarget(null)}
          onMarkPaid={p => setPaidTarget(p)}
          onStatus={p => setStatusTarget(p)}
        />
      )}

      {paidTarget && (
        <MarkPaidModal
          payment={paidTarget}
          onClose={() => setPaidTarget(null)}
          onSuccess={() => handleSuccess("Pagesa u shënua si PAID ✓")}
          notify={notify}
        />
      )}

      {statusTarget && (
        <StatusModal
          payment={statusTarget}
          onClose={() => setStatusTarget(null)}
          onSuccess={() => handleSuccess("Statusi u ndryshua ✓")}
          notify={notify}
        />
      )}

      {toast && (
        <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />
      )}
    </MainLayout>
  );
}