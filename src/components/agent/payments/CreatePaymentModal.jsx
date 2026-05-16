import { useState } from "react";
import api from "../../../api/axios";
import Modal from "./Modal";
import { Field, Row2 } from "./PaymentBadges";
import { PAYMENT_TYPES, PAYMENT_METHODS, CURRENCIES, validatePaymentForm } from "./paymentHelpers";

export default function CreatePaymentModal({ defaultContractId, onClose, onSuccess, notify }) {
  const [form, setForm] = useState({
    contract_id:    defaultContractId || "",
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
    if (!validatePaymentForm(form, notify)) return;
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
      <Field label="Contract ID" required hint="ID numerike e kontratës">
        <input className="form-input" type="number" min="1" value={form.contract_id}
          onChange={e => set("contract_id", e.target.value)} placeholder="ID e kontratës" />
      </Field>
      <Row2>
        <Field label="Shuma" required hint="Duhet të jetë > 0">
          <input className="form-input" type="number" min="0.01" step="0.01" value={form.amount}
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
      <Field label="Shënime" hint="Max 500 karaktere">
        <input className="form-input" value={form.notes}
          onChange={e => set("notes", e.target.value)}
          placeholder="(opcional)" maxLength={500} />
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