// src/components/admin/payments/PaymentCreateModal.jsx

import { useState, useEffect } from "react";
import api from "../../../api/axios";
import { PAYMENT_TYPES, PAYMENT_METHODS, CURRENCIES } from "./paymentsHelpers";

function Field({ label, required, hint, children }) {
  return (
    <div className="pm-field">
      <label className="pm-label">{label}{required && <span>*</span>}</label>
      {children}
      {hint && <p style={{ fontSize: 11, color: "rgba(245,240,232,0.28)", marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

export default function PaymentCreateModal({ onClose, onSuccess, notify }) {
  const [form, setForm] = useState({
    contract_id: "", amount: "", currency: "EUR",
    payment_type: "RENT", due_date: "",
    payment_method: "BANK_TRANSFER", recipient_id: "", notes: "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    const h = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [onClose]);

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