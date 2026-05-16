import { useState } from "react";
import api from "../../../api/axios";
import {
  LISTING_STATUSES, PRICE_PERIODS, CURRENCIES,
  validateListingForm, INP_S, SEL_S, BTN_PRI, BTN_SEC,
} from "./rentalHelpers";
import { Modal, Field, Row2 } from "./RentalBadges";

export function ListingModal({ initial, onClose, onSuccess, notify }) {
  const [form, setForm] = useState({
    property_id:      initial?.property_id      ?? "",
    title:            initial?.title             ?? "",
    description:      initial?.description       ?? "",
    available_from:   initial?.available_from    ?? "",
    available_until:  initial?.available_until   ?? "",
    price:            initial?.price             ?? "",
    currency:         initial?.currency          ?? "EUR",
    deposit:          initial?.deposit           ?? "",
    price_period:     initial?.price_period      ?? "MONTHLY",
    min_lease_months: initial?.min_lease_months  ?? 12,
    status:           initial?.status            ?? "ACTIVE",
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!validateListingForm(form, notify)) return;
    setSaving(true);
    try {
      const payload = {
        property_id:      Number(form.property_id),
        title:            form.title.trim() || null,
        description:      form.description || null,
        available_from:   form.available_from || null,
        available_until:  form.available_until || null,
        price:            Number(form.price),
        currency:         form.currency,
        deposit:          form.deposit ? Number(form.deposit) : null,
        price_period:     form.price_period,
        min_lease_months: Number(form.min_lease_months),
        ...(initial && { status: form.status }),
      };
      initial
        ? await api.put(`/api/rentals/listings/${initial.id}`, payload)
        : await api.post("/api/rentals/listings", payload);
      onSuccess();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë ruajtjes", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={initial ? `Edit Listing #${initial.id}` : "New Rental Listing"} onClose={onClose} wide>
      <Row2>
        <Field label="Property ID" required hint="ID numerike e pronës">
          <input
            className="ar-in" style={INP_S} type="number" min="1"
            value={form.property_id} onChange={e => set("property_id", e.target.value)}
            disabled={!!initial} placeholder="42"
          />
        </Field>
        <Field label="Titull">
          <input
            className="ar-in" style={INP_S}
            value={form.title} onChange={e => set("title", e.target.value)}
            placeholder="2BR Apartment" maxLength={255}
          />
        </Field>
      </Row2>

      <Row2>
        <Field label="Çmimi" required hint="Duhet të jetë > 0">
          <input
            className="ar-in" style={INP_S} type="number" min="1" step="0.01"
            value={form.price} onChange={e => set("price", e.target.value)}
            placeholder="450"
          />
        </Field>
        <Field label="Periudha">
          <select className="ar-in" style={SEL_S} value={form.price_period} onChange={e => set("price_period", e.target.value)}>
            {PRICE_PERIODS.map(p => <option key={p}>{p}</option>)}
          </select>
        </Field>
      </Row2>

      <Row2>
        <Field label="Depozita" hint="Opcionale">
          <input
            className="ar-in" style={INP_S} type="number" min="0" step="0.01"
            value={form.deposit} onChange={e => set("deposit", e.target.value)}
            placeholder="900"
          />
        </Field>
        <Field label="Monedha">
          <select className="ar-in" style={SEL_S} value={form.currency} onChange={e => set("currency", e.target.value)}>
            {CURRENCIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>
      </Row2>

      <Row2>
        <Field label="Disponueshëm nga">
          <input
            className="ar-in" style={INP_S} type="date"
            value={form.available_from} onChange={e => set("available_from", e.target.value)}
          />
        </Field>
        <Field label="Disponueshëm deri">
          <input
            className="ar-in" style={INP_S} type="date"
            value={form.available_until} onChange={e => set("available_until", e.target.value)}
            min={form.available_from || undefined}
          />
        </Field>
      </Row2>

      <Row2>
        <Field label="Min. muaj qira" hint="1—120 muaj">
          <input
            className="ar-in" style={INP_S} type="number" min="1" max="120"
            value={form.min_lease_months} onChange={e => set("min_lease_months", e.target.value)}
          />
        </Field>
        {initial && (
          <Field label="Statusi">
            <select className="ar-in" style={SEL_S} value={form.status} onChange={e => set("status", e.target.value)}>
              {LISTING_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>
        )}
      </Row2>

      <Field label="Përshkrim" hint="Max 2000 karaktere">
        <textarea
          className="ar-in"
          value={form.description} onChange={e => set("description", e.target.value)}
          rows={3} placeholder="Përshkrim i apartamentit..." maxLength={2000}
          style={{ ...INP_S, resize: "vertical" }}
        />
        <p style={{ fontSize: 11, color: "#b0a890", textAlign: "right", marginTop: 2 }}>
          {form.description.length}/2000
        </p>
      </Field>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 9, marginTop: 6 }}>
        <button style={BTN_SEC} onClick={onClose}>Anulo</button>
        <button style={BTN_PRI} onClick={handleSubmit} disabled={saving}>
          {saving ? "Duke ruajtur..." : initial ? "Ruaj ndryshimet" : "Krijo listing"}
        </button>
      </div>
    </Modal>
  );
}