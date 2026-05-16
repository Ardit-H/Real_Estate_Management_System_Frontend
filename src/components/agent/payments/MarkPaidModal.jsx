import { useState } from "react";
import api from "../../../api/axios";
import Modal from "./Modal";
import { Field, Row2 } from "./PaymentBadges";
import { PAYMENT_METHODS, fmtMoney, today, validateMarkPaid } from "./paymentHelpers";

export default function MarkPaidModal({ payment, onClose, onSuccess, notify }) {
  const [form, setForm] = useState({
    payment_method:  payment.payment_method || "BANK_TRANSFER",
    transaction_ref: "",
    paid_date:       today(),
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!validateMarkPaid(form, notify)) return;
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
      </div>
      <Field label="Metoda e pagesës">
        <select className="form-select" value={form.payment_method}
          onChange={e => set("payment_method", e.target.value)}>
          {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
        </select>
      </Field>
      <Row2>
        <Field label="Transaction Ref" hint="Max 100 karaktere">
          <input className="form-input" value={form.transaction_ref}
            onChange={e => set("transaction_ref", e.target.value)}
            placeholder="TXN-12345" maxLength={100} />
        </Field>
        <Field label="Data e pagesës" required hint="Nuk mund të jetë në të ardhmen">
          <input className="form-input" type="date" value={form.paid_date}
            onChange={e => set("paid_date", e.target.value)}
            max={today()} />
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