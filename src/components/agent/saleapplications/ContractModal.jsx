import { useState } from "react";
import api from "../../../api/axios";
import { INP_S, SEL_S, BTN_PRI, BTN_SEC } from "./saleAppConstants.js";
import { Modal, Field, FormRow } from "./SaleAppUI.jsx";
 
export function ContractModal({ initial, prefill, onClose, onSuccess, notify }) {
  const [form, setForm] = useState({
    property_id:       initial?.property_id       ?? prefill?.propertyId ?? "",
    listing_id:        initial?.listing_id        ?? prefill?.listingId  ?? "",
    buyer_id:          initial?.buyer_id          ?? prefill?.buyerId    ?? "",
    sale_price:        initial?.sale_price        ?? prefill?.price      ?? "",
    currency:          initial?.currency          ?? "EUR",
    contract_date:     initial?.contract_date     ?? "",
    handover_date:     initial?.handover_date     ?? "",
    contract_file_url: initial?.contract_file_url ?? "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({...p, [k]: v}));
 
  const handleSubmit = async () => {
    if (!form.property_id || !form.buyer_id || !form.sale_price) {
      notify("Property ID, Buyer ID and price are required", "error"); return;
    }
    setSaving(true);
    try {
      const payload = {
        property_id:       Number(form.property_id),
        listing_id:        form.listing_id ? Number(form.listing_id) : null,
        buyer_id:          Number(form.buyer_id),
        sale_price:        Number(form.sale_price),
        currency:          form.currency,
        contract_date:     form.contract_date     || null,
        handover_date:     form.handover_date     || null,
        contract_file_url: form.contract_file_url || null,
      };
      initial
        ? await api.put(`/api/sales/contracts/${initial.id}`, payload)
        : await api.post("/api/sales/contracts", payload);
      onSuccess();
    } catch (err) { notify(err.response?.data?.message || "Error", "error"); }
    finally { setSaving(false); }
  };
 
  return (
    <Modal title={initial ? `Edit Contract #${initial.id}` : "New Sale Contract"} onClose={onClose} wide>
      <FormRow>
        <Field label="Property ID" required>
          <input className="sa-input" style={INP_S} type="number" value={form.property_id}
            onChange={e => set("property_id", e.target.value)} disabled={!!initial} placeholder="ex: 42"/>
        </Field>
        <Field label="Listing ID">
          <input className="sa-input" style={INP_S} type="number" value={form.listing_id}
            onChange={e => set("listing_id", e.target.value)} placeholder="(optional)"/>
        </Field>
      </FormRow>
      <FormRow>
        <Field label="Buyer ID" required>
          <input className="sa-input" style={INP_S} type="number" value={form.buyer_id}
            onChange={e => set("buyer_id", e.target.value)} disabled={!!initial} placeholder="Buyer ID"/>
        </Field>
        <Field label="Sale Price" required>
          <input className="sa-input" style={INP_S} type="number" value={form.sale_price}
            onChange={e => set("sale_price", e.target.value)} placeholder="ex: 145000"/>
        </Field>
      </FormRow>
      <FormRow>
        <Field label="Currency">
          <select className="sa-select" style={SEL_S} value={form.currency} onChange={e => set("currency", e.target.value)}>
            <option>EUR</option><option>USD</option><option>ALL</option>
          </select>
        </Field>
        <Field label="Contract Date">
          <input className="sa-input" style={INP_S} type="date" value={form.contract_date}
            onChange={e => set("contract_date", e.target.value)}/>
        </Field>
      </FormRow>
      <FormRow>
        <Field label="Handover Date">
          <input className="sa-input" style={INP_S} type="date" value={form.handover_date}
            onChange={e => set("handover_date", e.target.value)} min={form.contract_date || undefined}/>
        </Field>
        <Field label="Contract File URL">
          <input className="sa-input" style={INP_S} value={form.contract_file_url}
            onChange={e => set("contract_file_url", e.target.value)} placeholder="https://..."/>
        </Field>
      </FormRow>
      <div style={{display:"flex",gap:9,justifyContent:"flex-end",marginTop:6}}>
        <button style={BTN_SEC} onClick={onClose}>Cancel</button>
        <button style={BTN_PRI} onClick={handleSubmit} disabled={saving}>
          {saving ? "Saving..." : initial ? "Save changes" : "Create contract"}
        </button>
      </div>
    </Modal>
  );
}
 