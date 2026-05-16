// src/components/admin/rentals/RentalFormModal.jsx

import { useState, useEffect } from "react";
import api from "../../../api/axios";
import { RENTAL_STATUSES, PRICE_PERIODS, CURRENCIES, primaryBtn, secondaryBtn, inputSt, selectSt, textareaSt } from "./rentalsHelpers";

function Field({ label, children, required }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 10.5, fontWeight: 600, color: "#8a7d5e", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>
        {label}{required && <span style={{ color: "#D85A30", marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function Row({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>{children}</div>;
}

export default function RentalFormModal({ initial, onClose, onSuccess, notify }) {
  const [form, setForm] = useState({
    property_id:      initial?.property_id      ?? "",
    title:            initial?.title            ?? "",
    description:      initial?.description      ?? "",
    available_from:   initial?.available_from   ?? "",
    available_until:  initial?.available_until  ?? "",
    price:            initial?.price            ?? "",
    currency:         initial?.currency         ?? "EUR",
    deposit:          initial?.deposit          ?? "",
    price_period:     initial?.price_period     ?? "MONTHLY",
    min_lease_months: initial?.min_lease_months ?? 12,
    status:           initial?.status           ?? "ACTIVE",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const h = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const set = (k, v) => setForm(p => {
    const next = { ...p, [k]: v };
    if (k === "available_from" && next.available_until && next.available_until < v) next.available_until = "";
    return next;
  });

  const dateError = form.available_from && form.available_until && form.available_until < form.available_from
    ? "Available Until nuk mund të jetë para Available From." : null;

  const handleSubmit = async () => {
    if (!form.property_id || !form.price) { notify("Property ID dhe çmimi janë të detyrueshme", "error"); return; }
    if (dateError) { notify(dateError, "error"); return; }
    setSaving(true);
    try {
      const payload = {
        property_id:      Number(form.property_id),
        title:            form.title            || null,
        description:      form.description      || null,
        available_from:   form.available_from   || null,
        available_until:  form.available_until  || null,
        price:            Number(form.price),
        currency:         form.currency,
        deposit:          form.deposit ? Number(form.deposit) : null,
        price_period:     form.price_period,
        min_lease_months: Number(form.min_lease_months),
        ...(initial && { status: form.status }),
      };
      if (initial) { await api.put(`/api/rentals/listings/${initial.id}`, payload); }
      else         { await api.post("/api/rentals/listings", payload); }
      onSuccess();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë ruajtjes", "error");
    } finally { setSaving(false); }
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(8,6,4,0.82)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'DM Sans', sans-serif" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ width: "100%", maxWidth: 620, background: "#faf7f2", borderRadius: 18, boxShadow: "0 44px 100px rgba(0,0,0,0.55)", maxHeight: "90vh", overflow: "hidden", animation: "ar-scale 0.22s ease" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid rgba(138,125,94,0.15)", position: "sticky", top: 0, background: "#faf7f2", zIndex: 1 }}>
          <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 700, fontSize: 17, color: "#1a1714" }}>
            {initial ? `Edit Listing #${initial.id}` : "New Rental Listing"}
          </span>
          <button onClick={onClose} style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(138,125,94,0.2)", background: "rgba(138,125,94,0.08)", color: "#8a7d5e", cursor: "pointer", fontSize: 15, borderRadius: 8 }}>✕</button>
        </div>
        <div style={{ padding: "22px 24px", overflowY: "auto", maxHeight: "calc(90vh - 60px)" }}>
          <Row>
            <Field label="Property ID" required>
              <input style={inputSt} type="number" value={form.property_id} onChange={e => set("property_id", e.target.value)} disabled={!!initial} placeholder="ex: 42" />
            </Field>
            <Field label="Title">
              <input style={inputSt} value={form.title} onChange={e => set("title", e.target.value)} placeholder="Apartament 2+1 Tirana" />
            </Field>
          </Row>
          <Row>
            <Field label="Price (€)" required>
              <input style={inputSt} type="number" value={form.price} onChange={e => set("price", e.target.value)} placeholder="ex: 800" />
            </Field>
            <Field label="Price Period">
              <select style={selectSt} value={form.price_period} onChange={e => set("price_period", e.target.value)}>
                {PRICE_PERIODS.map(p => <option key={p}>{p}</option>)}
              </select>
            </Field>
          </Row>
          <Row>
            <Field label="Deposit (€)">
              <input style={inputSt} type="number" value={form.deposit} onChange={e => set("deposit", e.target.value)} placeholder="ex: 1600" />
            </Field>
            <Field label="Currency">
              <select style={selectSt} value={form.currency} onChange={e => set("currency", e.target.value)}>
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
          </Row>
          <Row>
            <Field label="Min Lease (muaj)">
              <input style={inputSt} type="number" value={form.min_lease_months} onChange={e => set("min_lease_months", e.target.value)} placeholder="12" />
            </Field>
            {initial && (
              <Field label="Status">
                <select style={selectSt} value={form.status} onChange={e => set("status", e.target.value)}>
                  {RENTAL_STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
            )}
          </Row>
          <Row>
            <Field label="Available From">
              <input style={inputSt} type="date" value={form.available_from} onChange={e => set("available_from", e.target.value)} />
            </Field>
            <Field label="Available Until">
              <input
                style={{ ...inputSt, borderColor: dateError ? "#D85A30" : "rgba(138,125,94,0.25)", background: dateError ? "rgba(216,90,48,0.04)" : "#fff" }}
                type="date" value={form.available_until} min={form.available_from || undefined}
                onChange={e => {
                  if (form.available_from && e.target.value < form.available_from) { notify("Available Until nuk mund të jetë para Available From.", "error"); return; }
                  set("available_until", e.target.value);
                }}
              />
              {dateError && <p style={{ fontSize: 11, color: "#D85A30", margin: "4px 0 0" }}>⚠ {dateError}</p>}
            </Field>
          </Row>
          <Field label="Description">
            <textarea style={textareaSt} rows={3} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Përshkrim i listingut..." />
          </Field>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 6 }}>
            <button style={secondaryBtn} onClick={onClose}>Anulo</button>
            <button
              style={{ ...primaryBtn, opacity: dateError ? 0.55 : 1, cursor: dateError ? "not-allowed" : "pointer" }}
              onClick={handleSubmit}
              disabled={saving || !!dateError}
            >
              {saving ? "Duke ruajtur..." : initial ? "Ruaj ndryshimet" : "Krijo listing"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}