// src/components/admin/contracts/ContractCreateModal.jsx

import { useState, useEffect } from "react";
import api from "../../../api/axios";
import { CURRENCIES, today } from "./contractsHelpers";

function Field({ label, required, hint, children }) {
  return (
    <div className="lc-field">
      <label className="lc-label">{label}{required && <span>*</span>}</label>
      {children}
      {hint && <p style={{ fontSize: 11, color: "rgba(245,240,232,0.28)", marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

export default function ContractCreateModal({ onClose, onSuccess, notify }) {
  const [form, setForm] = useState({
    property_id: "", listing_id: "", client_id: "",
    start_date: "", end_date: "",
    rent: "", deposit: "", currency: "EUR", contract_file_url: "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    const h = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const handleSubmit = async () => {
    if (!form.property_id || !form.client_id || !form.start_date || !form.end_date || !form.rent) {
      notify("Plotëso të gjitha fushat e detyrueshme", "error"); return;
    }
    if (form.end_date <= form.start_date) {
      notify("End date duhet të jetë pas start date", "error"); return;
    }
    setSaving(true);
    try {
      await api.post("/api/contracts/lease", {
        property_id:       Number(form.property_id),
        listing_id:        form.listing_id ? Number(form.listing_id) : null,
        client_id:         Number(form.client_id),
        start_date:        form.start_date,
        end_date:          form.end_date,
        rent:              Number(form.rent),
        deposit:           form.deposit ? Number(form.deposit) : null,
        currency:          form.currency || "EUR",
        contract_file_url: form.contract_file_url || null,
      });
      onSuccess();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë krijimit", "error");
    } finally { setSaving(false); }
  };

  return (
    <div className="lc-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="lc-modal">
        <div className="lc-modal-header">
          <div>
            <div className="lc-modal-title">New Lease Contract</div>
            <div className="lc-modal-sub">Krijo kontratë qiraje të re</div>
          </div>
          <button className="lc-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="lc-modal-body">
          <div className="lc-row2">
            <Field label="Property ID" required>
              <input className="lc-input" type="number" min="1" placeholder="1" value={form.property_id} onChange={e => set("property_id", e.target.value)} />
            </Field>
            <Field label="Listing ID" hint="Opcional">
              <input className="lc-input" type="number" min="1" placeholder="—" value={form.listing_id} onChange={e => set("listing_id", e.target.value)} />
            </Field>
          </div>
          <Field label="Client ID" required>
            <input className="lc-input" type="number" min="1" placeholder="ID e klientit" value={form.client_id} onChange={e => set("client_id", e.target.value)} />
          </Field>
          <div className="lc-row2">
            <Field label="Start Date" required>
              <input className="lc-input" type="date" min={today()} value={form.start_date} onChange={e => set("start_date", e.target.value)} />
            </Field>
            <Field label="End Date" required>
              <input className="lc-input" type="date" min={form.start_date || today()} value={form.end_date} onChange={e => set("end_date", e.target.value)} />
            </Field>
          </div>
          <div className="lc-row2">
            <Field label="Rent / month" required>
              <input className="lc-input" type="number" min="0" step="0.01" placeholder="450.00" value={form.rent} onChange={e => set("rent", e.target.value)} />
            </Field>
            <Field label="Deposit" hint="Opcional">
              <input className="lc-input" type="number" min="0" step="0.01" placeholder="900.00" value={form.deposit} onChange={e => set("deposit", e.target.value)} />
            </Field>
          </div>
          <div className="lc-row2">
            <Field label="Currency">
              <select className="lc-input" value={form.currency} onChange={e => set("currency", e.target.value)}>
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Contract File URL" hint="Opcional">
              <input className="lc-input" type="text" placeholder="https://..." value={form.contract_file_url} onChange={e => set("contract_file_url", e.target.value)} />
            </Field>
          </div>
          <div className="lc-modal-footer">
            <button className="lc-btn-cancel" onClick={onClose}>Anulo</button>
            <button className="lc-btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? "Duke krijuar..." : "✓ Krijo Kontratë"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}