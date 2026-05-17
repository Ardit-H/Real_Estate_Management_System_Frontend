import { useState } from "react";
import api from "../../../api/axios";
import { ModalWrap, MH, Field } from "./LeadsUI";
import PropertyFields from "./PropertyFields";
import { TYPE_ICON, HomeIcon } from "./LeadsIcons";
import {
  LEAD_TYPES, LEAD_SOURCES, TYPE_LABEL, SOURCE_LABEL,
  INP_S, SEL_S,
} from "./leadsConstants";
 
const EMPTY_PD = {
  title: "", type: "APARTMENT", area_sqm: "", bedrooms: "",
  bathrooms: "", price: "", price_per_sqm: "", currency: "EUR",
  city: "", street: "", year_built: "", floor: "",
  total_floors: "", description: "", price_period: "MONTHLY",
};
 
export default function CreateLeadModal({ onClose, onSuccess, notify }) {
  const [form, setForm] = useState({
    type:           "SELL",
    message:        "",
    preferred_date: "",
    source:         "WEBSITE",
    property_data:  { ...EMPTY_PD },
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
 
  const handleTypeChange = t => {
    setForm(p => ({
      ...p,
      type:          t,
      property_data: t === "VALUATION" ? null : (p.property_data || { ...EMPTY_PD }),
    }));
  };
 
  const buildMessage = () => {
    const parts = [];
    if (form.message?.trim()) parts.push(form.message.trim());
    const pd = form.property_data;
    if (pd && form.type !== "VALUATION") {
      parts.push("\n--- Property Details ---");
      if (pd.title)         parts.push(`Title: ${pd.title}`);
      if (pd.type)          parts.push(`Type: ${pd.type}`);
      if (pd.city)          parts.push(`City: ${pd.city}`);
      if (pd.street)        parts.push(`Address: ${pd.street}`);
      if (pd.area_sqm)      parts.push(`Area: ${pd.area_sqm} m²`);
      if (pd.bedrooms)      parts.push(`Bedrooms: ${pd.bedrooms}`);
      if (pd.bathrooms)     parts.push(`Bathrooms: ${pd.bathrooms}`);
      if (pd.floor)         parts.push(`Floor: ${pd.floor}`);
      if (pd.total_floors)  parts.push(`Total floors: ${pd.total_floors}`);
      if (pd.year_built)    parts.push(`Year built: ${pd.year_built}`);
      if (pd.price)         parts.push(`Price: ${pd.price} ${pd.currency}`);
      if (pd.price_per_sqm) parts.push(`Price per m²: ${pd.price_per_sqm} ${pd.currency}`);
      if (pd.price_period && form.type === "RENT") parts.push(`Period: ${pd.price_period}`);
      if (pd.description)   parts.push(`Notes: ${pd.description}`);
      parts.push(`\n__PROPERTY_DATA__:${JSON.stringify(pd)}`);
    }
    return parts.join("\n").trim() || null;
  };
 
  const handleSubmit = async () => {
    if (form.type !== "VALUATION") {
      const pd = form.property_data;
      if (!pd?.title?.trim()) { notify("Property title is required", "error"); return; }
      if (!pd?.city?.trim())  { notify("City is required", "error"); return; }
      if (!pd?.price)         { notify("Price is required", "error"); return; }
    } else {
      if (!form.message?.trim()) { notify("Please describe the property you want valued", "error"); return; }
    }
    setSaving(true);
    try {
      await api.post("/api/leads", {
        type:           form.type,
        property_id:    null,
        message:        buildMessage(),
        budget:         null,
        preferred_date: form.preferred_date || null,
        source:         form.source,
      });
      onSuccess();
    } catch (err) {
      notify(err.response?.data?.message || "Error submitting request", "error");
    } finally {
      setSaving(false);
    }
  };
 
  const DATE_LABEL = {
    SELL:      "Preferred listing date",
    RENT:      "Date property is available from",
    VALUATION: "Preferred valuation date",
  };
 
  const INFO = {
    SELL:      { text: "Have a property to sell? Fill in the details — your agent will register and list it.",         accent: "#c9b87a", bg: "rgba(201,184,122,0.07)", border: "rgba(201,184,122,0.18)" },
    RENT:      { text: "Have a property to rent out? Provide the details — your agent will manage applications.",      accent: "#7eb8a4", bg: "rgba(126,184,164,0.07)", border: "rgba(126,184,164,0.18)" },
    VALUATION: { text: "Want a professional property valuation? Describe the property in your message.",               accent: "#a4b07e", bg: "rgba(164,176,126,0.07)", border: "rgba(164,176,126,0.18)" },
  };
  const info = INFO[form.type] || INFO.SELL;
 
  return (
    <ModalWrap onClose={onClose} maxW={form.type !== "VALUATION" ? 700 : 520}>
      <MH title="New Request" sub="Tell us what you need" onClose={onClose} />
      <div style={{ padding: "22px 26px" }}>
 
        <Field label="Request type" required>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {LEAD_TYPES.map(t => (
              <button key={t} onClick={() => handleTypeChange(t)} style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "10px 18px", borderRadius: 10,
                border: `1.5px solid ${form.type === t ? "#8a7d5e" : "#e4ddd0"}`,
                background: form.type === t ? "#1a1714" : "transparent",
                color: form.type === t ? "#f5f0e8" : "#6b6248",
                cursor: "pointer", fontSize: 13,
                fontWeight: form.type === t ? 600 : 400,
                fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s",
              }}>
                <span style={{ opacity: form.type === t ? 1 : 0.5 }}>{TYPE_ICON[t]}</span>
                {TYPE_LABEL[t]}
              </button>
            ))}
          </div>
        </Field>
 
        <div style={{
          background: info.bg, border: `1.5px solid ${info.border}`,
          borderRadius: 10, padding: "10px 14px", marginBottom: 16,
          fontSize: 13, color: info.accent, display: "flex", alignItems: "flex-start", gap: 8,
        }}>
          <span style={{ opacity: 0.7, marginTop: 1, flexShrink: 0 }}><HomeIcon /></span>
          {info.text}
        </div>
 
        {form.type !== "VALUATION" && (
          <PropertyFields form={form} setForm={setForm} />
        )}
 
        <Field label={DATE_LABEL[form.type] || "Preferred date"}>
          <input className="cl-in" style={INP_S} type="date"
            value={form.preferred_date}
            onChange={e => set("preferred_date", e.target.value)}
            min={new Date().toISOString().split("T")[0]} />
        </Field>
 
        <Field label="How did you find us?">
          <select className="cl-in" style={SEL_S}
            value={form.source}
            onChange={e => set("source", e.target.value)}>
            {LEAD_SOURCES.map(s => (
              <option key={s} value={s}>{SOURCE_LABEL[s]}</option>
            ))}
          </select>
        </Field>
 
        <Field
          label={form.type === "VALUATION" ? "Describe the property" : "Additional notes"}
          required={form.type === "VALUATION"}>
          <textarea className="cl-in"
            value={form.message}
            onChange={e => set("message", e.target.value)}
            rows={3}
            placeholder={form.type === "VALUATION" ? "Describe the property you want valued..." : "Any other relevant details..."}
            style={{ ...INP_S, resize: "vertical" }} />
        </Field>
 
        <div style={{
          display: "flex", gap: 9, justifyContent: "flex-end",
          borderTop: "1px solid #e8e2d6", paddingTop: 18, marginTop: 4,
        }}>
          <button onClick={onClose} className="cl-btn" style={{
            padding: "10px 18px", borderRadius: 10,
            border: "1.5px solid #e4ddd0", background: "transparent",
            color: "#6b6248", fontWeight: 500, fontSize: 13,
            cursor: "pointer", fontFamily: "inherit",
          }}>Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="cl-btn" style={{
            padding: "10px 24px", borderRadius: 10, border: "none",
            background: saving ? "#b0a890" : "linear-gradient(135deg,#c9b87a 0%,#b0983e 100%)",
            color: "#1a1714", fontSize: 13, fontWeight: 700,
            cursor: saving ? "not-allowed" : "pointer",
            fontFamily: "inherit", display: "flex", alignItems: "center", gap: 7,
          }}>
            {saving
              ? <><div style={{ width: 14, height: 14, border: "2px solid rgba(26,23,20,0.25)", borderTop: "2px solid #1a1714", borderRadius: "50%", animation: "cl-spin 0.7s linear infinite" }}/> Submitting…</>
              : <><span style={{ fontSize: 13 }}>✓</span> Submit Request</>
            }
          </button>
        </div>
      </div>
    </ModalWrap>
  );
}
 