// src/components/admin/payments/PaymentMarkPaidModal.jsx

import { useState, useEffect } from "react";
import api from "../../../api/axios";
import { PAYMENT_METHODS, fmtMoney, today } from "./paymentsHelpers";

function Field({ label, required, hint, children }) {
  return (
    <div className="pm-field">
      <label className="pm-label">{label}{required && <span>*</span>}</label>
      {children}
      {hint && <p style={{ fontSize: 11, color: "rgba(245,240,232,0.28)", marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

export default function PaymentMarkPaidModal({ payment, onClose, onSuccess, notify }) {
  const [form, setForm] = useState({
    payment_method:  payment.payment_method || "BANK_TRANSFER",
    transaction_ref: "",
    paid_date:       today(),
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    const h = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [onClose]);

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