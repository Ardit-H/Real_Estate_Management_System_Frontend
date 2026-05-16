// src/components/admin/contracts/ContractEditModal.jsx

import { useState, useEffect } from "react";
import api from "../../../api/axios";
import { CURRENCIES } from "./contractsHelpers";

function Field({ label, hint, children }) {
  return (
    <div className="lc-field">
      <label className="lc-label">{label}</label>
      {children}
      {hint && <p style={{ fontSize: 11, color: "rgba(245,240,232,0.28)", marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

export default function ContractEditModal({ contract, onClose, onSuccess, notify }) {
  const [form, setForm] = useState({
    start_date:        contract.start_date?.split("T")[0] || "",
    end_date:          contract.end_date?.split("T")[0]   || "",
    rent:              contract.rent              || "",
    deposit:           contract.deposit           || "",
    currency:          contract.currency          || "EUR",
    contract_file_url: contract.contract_file_url || "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    const h = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const handleSubmit = async () => {
    if (form.start_date && form.end_date && form.end_date <= form.start_date) {
      notify("End date duhet të jetë pas start date", "error"); return;
    }
    setSaving(true);
    try {
      await api.put(`/api/contracts/lease/${contract.id}`, {
        start_date:        form.start_date        || null,
        end_date:          form.end_date          || null,
        rent:              form.rent    ? Number(form.rent)    : null,
        deposit:           form.deposit ? Number(form.deposit) : null,
        currency:          form.currency          || null,
        contract_file_url: form.contract_file_url || null,
      });
      onSuccess();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë ruajtjes", "error");
    } finally { setSaving(false); }
  };

  return (
    <div className="lc-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="lc-modal">
        <div className="lc-modal-header">
          <div>
            <div className="lc-modal-title">Edit Contract #{contract.id}</div>
            <div className="lc-modal-sub">Ndrysho të dhënat e kontratës</div>
          </div>
          <button className="lc-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="lc-modal-body">
          <div className="lc-row2">
            <Field label="Start Date">
              <input className="lc-input" type="date" value={form.start_date} onChange={e => set("start_date", e.target.value)} />
            </Field>
            <Field label="End Date">
              <input className="lc-input" type="date" value={form.end_date} onChange={e => set("end_date", e.target.value)} />
            </Field>
          </div>
          <div className="lc-row2">
            <Field label="Rent / month">
              <input className="lc-input" type="number" min="0" step="0.01" value={form.rent} onChange={e => set("rent", e.target.value)} />
            </Field>
            <Field label="Deposit">
              <input className="lc-input" type="number" min="0" step="0.01" value={form.deposit} onChange={e => set("deposit", e.target.value)} />
            </Field>
          </div>
          <div className="lc-row2">
            <Field label="Currency">
              <select className="lc-input" value={form.currency} onChange={e => set("currency", e.target.value)}>
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Contract File URL">
              <input className="lc-input" type="text" placeholder="https://..." value={form.contract_file_url} onChange={e => set("contract_file_url", e.target.value)} />
            </Field>
          </div>
          <div className="lc-modal-footer">
            <button className="lc-btn-cancel" onClick={onClose}>Anulo</button>
            <button className="lc-btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? "Duke ruajtur..." : "✓ Ruaj Ndryshimet"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}