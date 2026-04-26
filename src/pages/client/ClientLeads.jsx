import { useState, useEffect, useCallback, useContext } from "react";
import MainLayout from "../../components/layout/Layout";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";

const LEAD_TYPES   = ["SELL", "BUY", "RENT", "RENT_SEEKING", "VALUATION"];
const LEAD_SOURCES = ["WEBSITE", "PHONE", "EMAIL", "REFERRAL", "SOCIAL"];
const PROPERTY_TYPES = ["APARTMENT", "HOUSE", "VILLA", "COMMERCIAL", "LAND", "OFFICE"];
const CURRENCIES     = ["EUR", "USD", "ALL", "GBP", "CHF"];

const STATUS_STYLE = {
  NEW:         { bg: "#fffbeb", color: "#c9a84c", border: "#f0d878", label: "New",         icon: "🔵", strip: "#c9a84c" },
  IN_PROGRESS: { bg: "#edf5f0", color: "#2a6049", border: "#a3c9b0", label: "In Progress", icon: "🟣", strip: "#2a6049" },
  DONE:        { bg: "#f5f2eb", color: "#5a5f3a", border: "#d9d4c7", label: "Done",        icon: "🟢", strip: "#5a5f3a" },
  REJECTED:    { bg: "#fff5ee", color: "#8b4513", border: "#f5c6a0", label: "Rejected",    icon: "🔴", strip: "#8b4513" },
};
const TYPE_ICON  = { SELL: "🏷️", BUY: "🏠", RENT: "🔑", RENT_SEEKING: "🔎", VALUATION: "📊" };
const TYPE_LABEL = {
  SELL:         "Shitje — jap pronën time",
  BUY:          "Blerje — kërkoj pronë",
  RENT:         "Qira — jap pronën time me qira",
  RENT_SEEKING: "Qira — kërkoj të marr me qira",
  VALUATION:    "Vlerësim",
};
const SOURCE_ICON = { WEBSITE: "🌐", PHONE: "📞", EMAIL: "✉️", REFERRAL: "👥", SOCIAL: "📱" };

const fmtDate     = (d) => d ? new Date(d).toLocaleDateString("sq-AL") : "—";
const fmtDateTime = (d) => d ? new Date(d).toLocaleString("sq-AL", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" }) : "—";
const fmtBudget   = (v) => v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";

// ── Helpers for property_data embedded in message ─────────────────────────────
const PROP_MARKER = "__PROPERTY_DATA__:";

function parsePropertyData(message) {
  if (!message) return null;
  const idx = message.indexOf(PROP_MARKER);
  if (idx === -1) return null;
  try { return JSON.parse(message.substring(idx + PROP_MARKER.length)); }
  catch { return null; }
}

function cleanMessage(message) {
  if (!message) return "";
  const idx = message.indexOf("\n--- Të dhënat e pronës ---");
  if (idx !== -1) return message.substring(0, idx).trim();
  const idx2 = message.indexOf(PROP_MARKER);
  if (idx2 !== -1) return message.substring(0, message.lastIndexOf("\n", idx2)).trim();
  return message;
}

function buildMessage(form) {
  const parts = [];
  if (form.message?.trim()) parts.push(form.message.trim());
  const pd = form.property_data;
  if (pd && (form.type === "SELL" || form.type === "RENT")) {
    parts.push("\n--- Të dhënat e pronës ---");
    if (pd.title)         parts.push(`Titulli: ${pd.title}`);
    if (pd.property_type) parts.push(`Lloji: ${pd.property_type}`);
    if (pd.city)          parts.push(`Qyteti: ${pd.city}`);
    if (pd.street)        parts.push(`Adresa: ${pd.street}`);
    if (pd.area_sqm)      parts.push(`Sipërfaqja: ${pd.area_sqm} m²`);
    if (pd.bedrooms)      parts.push(`Dhoma gjumi: ${pd.bedrooms}`);
    if (pd.bathrooms)     parts.push(`Banjo: ${pd.bathrooms}`);
    if (pd.floor)         parts.push(`Kati: ${pd.floor}`);
    if (pd.year_built)    parts.push(`Viti ndërtimit: ${pd.year_built}`);
    if (pd.price)         parts.push(`Çmimi: ${pd.price} ${pd.currency || "EUR"}`);
    if (pd.description)   parts.push(`Shënime: ${pd.description}`);
    parts.push(`\n${PROP_MARKER}${JSON.stringify(pd)}`);
  }
  return parts.join("\n").trim() || null;
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 9999,
      background: type === "error" ? "#fee2e2" : "#ecfdf5",
      color: type === "error" ? "#b91c1c" : "#047857",
      padding: "12px 20px", borderRadius: 10, fontSize: 13.5, fontWeight: 500,
      boxShadow: "0 4px 18px rgba(0,0,0,0.12)", maxWidth: 340,
    }}>{msg}</div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} style={{ background: "#f0ece3", borderRadius: "14px", height: "120px", animation: "pulse 1.4s ease-in-out infinite" }} />
      ))}
    </div>
  );
}

// ── Field helper ──────────────────────────────────────────────────────────────
function Field({ label, children, required, hint }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#6b6651", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
        {label}{required && <span style={{ color: "#c0392b", marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {hint && <p style={{ fontSize: 11.5, color: "#a0997e", marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

// ── Input / Select / Textarea shared styles ───────────────────────────────────
const inputStyle = {
  width: "100%", padding: "9px 12px", border: "1.5px solid #d9d4c7",
  borderRadius: "8px", fontSize: "13.5px", color: "#2c2c1e",
  background: "#fff", outline: "none", fontFamily: "inherit",
  boxSizing: "border-box", transition: "border-color 0.15s",
};
const selectStyle = { ...inputStyle, cursor: "pointer" };

// ── Property Fields (SELL/RENT only) ─────────────────────────────────────────
function PropertyFields({ form, setForm, leadType }) {
  const set = (k, v) => setForm(p => ({ ...p, property_data: { ...p.property_data, [k]: v } }));
  const pd = form.property_data || {};
  const isSell  = leadType === "SELL";
  const accent  = isSell ? "#8b4513" : "#2a6049";
  const bg      = isSell ? "#fff9f5" : "#f5faf7";
  const border  = isSell ? "#f5c6a0" : "#a3c9b0";

  return (
    <div style={{ marginTop: 8, padding: "18px 16px", background: bg, borderRadius: 12, border: `1px solid ${border}` }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: accent, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
        {isSell ? "🏷️" : "🔑"} Të dhënat e pronës suaj
        <span style={{ fontSize: 11.5, fontWeight: 400, color: "#a0997e" }}>(agjenti do t'i regjistrojë në sistem)</span>
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <Field label="Titulli i pronës" required>
          <input style={inputStyle} value={pd.title||""} onChange={e=>set("title",e.target.value)} placeholder="p.sh. Apartament 2+1 në Prishtinë" />
        </Field>
        <Field label="Lloji i pronës" required>
          <select style={selectStyle} value={pd.property_type||"APARTMENT"} onChange={e=>set("property_type",e.target.value)}>
            {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
        <Field label="Sipërfaqja (m²)">
          <input style={inputStyle} type="number" min="0" value={pd.area_sqm||""} onChange={e=>set("area_sqm",e.target.value)} placeholder="85" />
        </Field>
        <Field label="Dhoma gjumi">
          <input style={inputStyle} type="number" min="0" value={pd.bedrooms||""} onChange={e=>set("bedrooms",e.target.value)} placeholder="2" />
        </Field>
        <Field label="Banjo">
          <input style={inputStyle} type="number" min="0" value={pd.bathrooms||""} onChange={e=>set("bathrooms",e.target.value)} placeholder="1" />
        </Field>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, marginBottom: 12 }}>
        <Field label={isSell ? "Çmimi i shitjes" : "Qiraja mujore"}>
          <input style={inputStyle} type="number" min="0" value={pd.price||""} onChange={e=>set("price",e.target.value)} placeholder="120000" />
        </Field>
        <Field label="Monedha">
          <select style={selectStyle} value={pd.currency||"EUR"} onChange={e=>set("currency",e.target.value)}>
            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <Field label="Qyteti" required>
          <input style={inputStyle} value={pd.city||""} onChange={e=>set("city",e.target.value)} placeholder="Prishtinë" />
        </Field>
        <Field label="Rruga / Lagjja">
          <input style={inputStyle} value={pd.street||""} onChange={e=>set("street",e.target.value)} placeholder="Rr. UÇK, Nr. 15" />
        </Field>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <Field label="Viti i ndërtimit">
          <input style={inputStyle} type="number" min="1900" max={new Date().getFullYear()} value={pd.year_built||""} onChange={e=>set("year_built",e.target.value)} placeholder="2015" />
        </Field>
        <Field label="Kati">
          <input style={inputStyle} type="number" value={pd.floor||""} onChange={e=>set("floor",e.target.value)} placeholder="3" />
        </Field>
      </div>

      <Field label="Përshkrim i shkurtër" hint="Karakteristika, gjendje, pajisje, etj.">
        <textarea value={pd.description||""} onChange={e=>set("description",e.target.value)} rows={3}
          placeholder="Apartament i ri, kuzhinë e pajisur, parking, pa hipotekë..."
          style={{ ...inputStyle, resize: "vertical" }} />
      </Field>
    </div>
  );
}

// ── Create Lead Modal ─────────────────────────────────────────────────────────
function CreateLeadModal({ onClose, onSuccess, notify }) {
  const EMPTY_PD = { title:"", property_type:"APARTMENT", area_sqm:"", bedrooms:"",
    bathrooms:"", price:"", currency:"EUR", city:"", street:"", year_built:"", floor:"", description:"" };

  const [form, setForm] = useState({ type:"BUY", message:"", budget:"", preferred_date:"", source:"WEBSITE", property_data:null });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleTypeChange = (t) => {
    const needsPropertyData = t === "SELL" || t === "RENT";
    setForm(p => ({ ...p, type: t, property_data: needsPropertyData ? (p.property_data || EMPTY_PD) : null }));
  };

  const handleSubmit = async () => {
    const pd = form.property_data;
    if ((form.type==="SELL"||form.type==="RENT") && pd) {
      if (!pd.title?.trim()) { notify("Titulli i pronës është i detyrueshëm","error"); return; }
      if (!pd.city?.trim())  { notify("Qyteti i pronës është i detyrueshëm","error"); return; }
    }
    setSaving(true);
    try {
      await api.post("/api/leads", {
        type:           form.type,
        property_id:    null,
        message:        buildMessage(form),
        budget:         form.budget ? Number(form.budget) : null,
        preferred_date: form.preferred_date || null,
        source:         form.source,
      });
      onSuccess();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë krijimit","error");
    } finally { setSaving(false); }
  };

  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const DATE_LABEL = {
    SELL: "Data kur dëshironi ta listoni",
    BUY:  "Kur jeni i disponueshëm për vizita",
    RENT: "Data nga kur prona është e disponueshme",
    RENT_SEEKING: "Kur dëshironi të lëvizni",
    VALUATION: "Kur dëshironi vlerësimin",
  };
  const isPropLead = form.type === "SELL" || form.type === "RENT";

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: "fixed", inset: 0, background: "rgba(20,20,10,0.72)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", animation: "fadeInOverlay 0.2s ease" }}
    >
      <div style={{ background: "#faf8f3", borderRadius: "18px", width: "100%", maxWidth: isPropLead ? 660 : 520, boxShadow: "0 24px 64px rgba(0,0,0,0.35)", maxHeight: "90vh", overflowY: "auto", animation: "slideUpModal 0.25s ease" }}>

        {/* Modal header — same green gradient as hero */}
        <div style={{ background: "linear-gradient(135deg, #5a5f3a 0%, #3d4228 100%)", padding: "20px 26px", borderRadius: "18px 18px 0 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontWeight: 800, fontSize: 16, margin: 0, color: "#fff" }}>Kërkesë e re</p>
            <p style={{ fontSize: 12, color: "#c8ccaa", margin: 0 }}>Plotëso detajet e kërkesës tënde</p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, border: "none", background: "rgba(255,255,255,0.15)", color: "#fff", cursor: "pointer", borderRadius: "50%", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        <div style={{ padding: "22px 26px" }}>
          <Field label="Lloji i kërkesës" required>
            <select style={selectStyle} value={form.type} onChange={e=>handleTypeChange(e.target.value)}>
              {LEAD_TYPES.map(t => <option key={t} value={t}>{TYPE_ICON[t]} {TYPE_LABEL[t]||t}</option>)}
            </select>
          </Field>

          {/* Info banner */}
          <div style={{
            background: isPropLead ? (form.type==="SELL" ? "#fff9f5" : "#f5faf7") : "#f5f2eb",
            border: `1px solid ${isPropLead ? (form.type==="SELL" ? "#f5c6a0" : "#a3c9b0") : "#d9d4c7"}`,
            borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 12.5,
            color: isPropLead ? (form.type==="SELL" ? "#8b4513" : "#2a6049") : "#5a5f3a",
          }}>
            {form.type==="SELL"         && "🏷️ Keni pronë për shitje? Plotëso të dhënat — agjenti do ta regjistrojë dhe listojë në sistem."}
            {form.type==="RENT"         && "🔑 Keni pronë për t'u dhënë me qira? Plotëso të dhënat — agjenti do t'i menaxhojë aplikimet."}
            {form.type==="RENT_SEEKING" && "🔎 Po kërkoni banesë/pronë me qira? Agjenti do t'ju gjejë opsionet bazuar në preferencat tuaja."}
            {form.type==="BUY"          && "🏠 Po kërkoni pronë? Agjenti do t'ju gjejë opsionet bazuar në buxhetin tuaj."}
            {form.type==="VALUATION"    && "📊 Doni vlerësim profesional të pronës suaj? Plotëso mesazhin."}
          </div>

          {isPropLead && <PropertyFields form={form} setForm={setForm} leadType={form.type} />}

          <div style={{ marginTop: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="Buxheti (€)">
                <input style={inputStyle} type="number" value={form.budget} onChange={e=>set("budget",e.target.value)} placeholder="150000" />
              </Field>
              <Field label={DATE_LABEL[form.type]||"Data e preferuar"}>
                <input style={inputStyle} type="date" value={form.preferred_date} onChange={e=>set("preferred_date",e.target.value)} min={new Date().toISOString().split("T")[0]} />
              </Field>
            </div>
            <Field label="Si na gjetet?">
              <select style={selectStyle} value={form.source} onChange={e=>set("source",e.target.value)}>
                {LEAD_SOURCES.map(s => <option key={s} value={s}>{SOURCE_ICON[s]} {s}</option>)}
              </select>
            </Field>
            <Field label={isPropLead ? "Shënime shtesë (opcionale)" : "Mesazhi"}>
              <textarea value={form.message} onChange={e=>set("message",e.target.value)} rows={3}
                placeholder={isPropLead ? "Informacione shtesë..." : "Përshkruaj nevojën tënde..."}
                style={{ ...inputStyle, resize: "vertical" }} />
            </Field>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", borderTop: "1px solid #e5e0d4", paddingTop: 18, marginTop: 6 }}>
            <button onClick={onClose}
              style={{ padding: "9px 20px", borderRadius: 10, border: "1.5px solid #d9d4c7", background: "#fff", color: "#5a5f3a", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              Anulo
            </button>
            <button onClick={handleSubmit} disabled={saving}
              style={{ padding: "9px 22px", borderRadius: 10, border: "none", background: saving ? "#a3a380" : "linear-gradient(135deg,#5a5f3a,#3d4228)", color: "#fff", fontSize: 13.5, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
              {saving ? "Duke dërguar..." : "Dërgo kërkesën"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Lead Detail Modal ─────────────────────────────────────────────────────────
function LeadDetailModal({ lead, onClose }) {
  const propertyData = parsePropertyData(lead.message);
  const s = STATUS_STYLE[lead.status] || STATUS_STYLE.NEW;

  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: "fixed", inset: 0, background: "rgba(20,20,10,0.72)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", animation: "fadeInOverlay 0.2s ease" }}
    >
      <div style={{ background: "#faf8f3", borderRadius: "18px", width: "100%", maxWidth: 580, boxShadow: "0 24px 64px rgba(0,0,0,0.35)", maxHeight: "90vh", overflowY: "auto", animation: "slideUpModal 0.25s ease" }}>

        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #5a5f3a 0%, #3d4228 100%)", padding: "20px 26px", borderRadius: "18px 18px 0 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>{TYPE_ICON[lead.type]||"📋"}</span>
            <div>
              <p style={{ fontWeight: 800, fontSize: 15, margin: 0, color: "#fff" }}>
                Kërkesë #{lead.id} — {TYPE_LABEL[lead.type]||lead.type}
              </p>
              <p style={{ fontSize: 12, color: "#c8ccaa", margin: 0 }}>Dërguar: {fmtDateTime(lead.created_at)}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, border: "none", background: "rgba(255,255,255,0.15)", color: "#fff", cursor: "pointer", borderRadius: "50%", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        <div style={{ padding: "22px 26px" }}>
          {/* Status banner */}
          <div style={{ marginBottom: 20, padding: "14px 16px", background: s.bg, borderRadius: 10, border: `1px solid ${s.border}`, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 24 }}>{s.icon}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 11, color: "#a0997e", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>Statusi</p>
              <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, padding: "3px 12px", borderRadius: "20px", fontSize: 12, fontWeight: 700 }}>{s.label}</span>
            </div>
            <p style={{ fontSize: 12.5, color: "#6b6651", lineHeight: 1.6, maxWidth: 280, margin: 0 }}>
              {lead.status==="NEW" && !lead.assigned_agent_id && "Kërkesa juaj u mor. Admini do t'ia asignojë një agjenti."}
              {lead.status==="NEW" && lead.assigned_agent_id  && "Agjenti është duke shqyrtuar kërkesën tuaj."}
              {lead.status==="IN_PROGRESS" && "Agjenti po punon. Do të kontaktoheni."}
              {lead.status==="DONE"     && "Kërkesa u përfundua me sukses. Faleminderit!"}
              {lead.status==="REJECTED" && "Kërkesa nuk mund të plotësohet. Mund të krijoni një të re."}
            </p>
          </div>

          {/* Details grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
            {[
              { label: "Lloji",          value: `${TYPE_ICON[lead.type]||""} ${TYPE_LABEL[lead.type]||lead.type}` },
              { label: "Burimi",         value: `${SOURCE_ICON[lead.source]||""} ${lead.source}` },
              { label: "Buxheti",        value: fmtBudget(lead.budget) },
              { label: "Data preferuar", value: fmtDate(lead.preferred_date) },
              { label: "Agjenti",        value: lead.agent_name||(lead.assigned_agent_id?`Agjent #${lead.assigned_agent_id}`:"Pa agjent") },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: "#fff", borderRadius: 10, padding: "10px 14px", border: "1px solid #e5e0d4" }}>
                <p style={{ fontSize: 11, color: "#a0997e", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{label}</p>
                <p style={{ fontSize: 13.5, fontWeight: 600, color: "#2c2c1e", margin: 0 }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Property data */}
          {propertyData && (
            <div style={{ background: "#fff9f5", border: "1px solid #f5c6a0", borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#8b4513", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>🏠 Të dhënat e pronës tuaj</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {propertyData.title      && <span style={{ fontSize: 13, color: "#4a4a36" }}>📌 {propertyData.title}</span>}
                {propertyData.city       && <span style={{ fontSize: 13, color: "#4a4a36" }}>📍 {propertyData.city}</span>}
                {propertyData.area_sqm   && <span style={{ fontSize: 13, color: "#4a4a36" }}>📐 {propertyData.area_sqm} m²</span>}
                {propertyData.bedrooms   && <span style={{ fontSize: 13, color: "#4a4a36" }}>🛏 {propertyData.bedrooms} dhoma</span>}
                {propertyData.price      && <span style={{ fontSize: 13, color: "#4a4a36" }}>💰 {Number(propertyData.price).toLocaleString("de-DE")} {propertyData.currency}</span>}
                {propertyData.year_built && <span style={{ fontSize: 13, color: "#4a4a36" }}>🗓 Ndërtuar: {propertyData.year_built}</span>}
              </div>
            </div>
          )}

          {/* Message */}
          {lead.message && cleanMessage(lead.message) && (
            <div style={{ background: "#f5f2eb", border: "1px solid #e5e0d4", borderRadius: 10, padding: "14px 16px" }}>
              <p style={{ fontSize: 11, color: "#a0997e", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Mesazhi juaj</p>
              <p style={{ fontSize: 13.5, color: "#4a4a36", lineHeight: 1.7, fontStyle: "italic", margin: 0 }}>"{cleanMessage(lead.message)}"</p>
            </div>
          )}

          <div style={{ borderTop: "1px solid #e5e0d4", paddingTop: 16, marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
            <button onClick={onClose}
              style={{ padding: "9px 22px", borderRadius: 10, border: "1.5px solid #d9d4c7", background: "#fff", color: "#5a5f3a", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              Mbyll
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Lead Card ─────────────────────────────────────────────────────────────────
function LeadCard({ lead, onClick }) {
  const pd = parsePropertyData(lead.message);
  const s  = STATUS_STYLE[lead.status] || STATUS_STYLE.NEW;

  return (
    <div
      onClick={onClick}
      style={{ background: "#fff", borderRadius: "14px", overflow: "hidden", boxShadow: "0 2px 12px rgba(90,95,58,0.10)", border: "1px solid #ede9df", cursor: "pointer", transition: "transform 0.18s, box-shadow 0.18s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(90,95,58,0.18)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(90,95,58,0.10)"; }}
    >
      {/* status strip */}
      <div style={{ height: "4px", background: s.strip }} />

      <div style={{ padding: "16px 20px" }}>
        {/* Top row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24 }}>{TYPE_ICON[lead.type]||"📋"}</span>
            <div>
              <p style={{ fontWeight: 700, fontSize: "14.5px", margin: 0, color: "#2c2c1e" }}>
                {TYPE_LABEL[lead.type]||lead.type}
                {pd?.title && <span style={{ fontWeight: 400, color: "#8a8469", fontSize: 13, marginLeft: 6 }}>— {pd.title}</span>}
              </p>
              <p style={{ fontSize: "12px", color: "#a0997e", margin: "2px 0 0" }}>
                #{lead.id} · {fmtDate(lead.created_at)}
                {pd?.city && ` · 📍 ${pd.city}`}
              </p>
            </div>
          </div>
          {/* status badge */}
          <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, padding: "3px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 700, display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
            {s.icon} {s.label}
          </span>
        </div>

        {/* Details row */}
        <div style={{ display: "flex", gap: 16, paddingTop: 12, borderTop: "1px solid #f0ece3", flexWrap: "wrap", alignItems: "center" }}>
          {(lead.budget || pd?.price) && (
            <span style={{ fontSize: "12.5px", color: "#6b6651", display: "flex", alignItems: "center", gap: 4 }}>
              💰 {lead.budget ? fmtBudget(lead.budget) : `${Number(pd.price).toLocaleString("de-DE")} ${pd.currency||"EUR"}`}
            </span>
          )}
          {pd?.area_sqm && <span style={{ fontSize: "12.5px", color: "#6b6651" }}>📐 {pd.area_sqm} m²</span>}
          {lead.preferred_date && <span style={{ fontSize: "12.5px", color: "#6b6651" }}>📅 {fmtDate(lead.preferred_date)}</span>}
          <span style={{ fontSize: "12.5px", color: "#6b6651" }}>
            {lead.agent_name ? `👤 ${lead.agent_name}` : lead.assigned_agent_id ? `👤 Agjent #${lead.assigned_agent_id}` : "⏳ Pa agjent ende"}
          </span>
          <span style={{ marginLeft: "auto", fontSize: "12px", color: "#5a5f3a", fontWeight: 600 }}>Shiko detajet →</span>
        </div>
      </div>
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages   = Array.from({ length: totalPages }, (_, i) => i);
  const visible = pages.filter(p => p === 0 || p === totalPages - 1 || Math.abs(p - page) <= 1);
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "36px", flexWrap: "wrap" }}>
      <button disabled={page === 0} onClick={() => onChange(page - 1)} style={S.pageBtn(false, page === 0)}>‹</button>
      {visible.map((p, i) => {
        const gap = visible[i-1] != null && p - visible[i-1] > 1;
        return (
          <span key={p} style={{ display: "flex", gap: "6px" }}>
            {gap && <span style={{ padding: "6px 4px", color: "#8a8469" }}>…</span>}
            <button onClick={() => onChange(p)} style={S.pageBtn(p === page, false)}>{p + 1}</button>
          </span>
        );
      })}
      <button disabled={page === totalPages - 1} onClick={() => onChange(page + 1)} style={S.pageBtn(false, page === totalPages - 1)}>›</button>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ClientLeads() {
  const { user } = useContext(AuthContext);
  const [leads,        setLeads]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [page,         setPage]         = useState(0);
  const [totalPages,   setTotalPages]   = useState(0);
  const [createOpen,   setCreateOpen]   = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [toast,        setToast]        = useState(null);

  const notify = useCallback((msg, type = "success") => setToast({ msg, type, key: Date.now() }), []);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/leads/my/client?page=${page}&size=10`);
      setLeads(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch { notify("Gabim gjatë ngarkimit", "error"); }
    finally   { setLoading(false); }
  }, [page, notify]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const stats = {
    total:    leads.length,
    active:   leads.filter(l => l.status==="NEW"||l.status==="IN_PROGRESS").length,
    done:     leads.filter(l => l.status==="DONE").length,
    rejected: leads.filter(l => l.status==="REJECTED").length,
  };

  return (
    <MainLayout role="client">
      <div style={{ background: "#f5f2eb", minHeight: "100vh", fontFamily: "'Georgia', serif" }}>

        {/* ── Hero ── */}
        <div style={{ background: "linear-gradient(135deg, #5a5f3a 0%, #3d4228 100%)", padding: "48px 32px 40px", textAlign: "center" }}>
          <h1 style={{ margin: "0 0 8px", fontSize: "32px", fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>
            Kërkesat e Mia
          </h1>
          <p style={{ margin: "0 0 28px", color: "#c8ccaa", fontSize: "15px" }}>
            Shiko statusin e kërkesave që ke dërguar
          </p>

          {/* CTA button */}
          <button
            onClick={() => setCreateOpen(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: "7px", background: "#a3a380", color: "#1f1f1f", border: "none", borderRadius: "10px", padding: "11px 24px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
          >
            + Kërkesë e re
          </button>

          {/* Stat pills */}
          {leads.length > 0 && (
            <div style={{ display: "flex", gap: "10px", maxWidth: "520px", margin: "24px auto 0", justifyContent: "center", flexWrap: "wrap" }}>
              {[
                { label: "Gjithsej", value: stats.total,    color: "#c8ccaa" },
                { label: "Aktive",   value: stats.active,   color: "#c9a84c" },
                { label: "Kryer",    value: stats.done,     color: "#a3c9b0" },
                { label: "Refuzuar", value: stats.rejected, color: "#f5c6a0" },
              ].map(stat => (
                <div key={stat.label} style={{ background: "rgba(255,255,255,0.13)", backdropFilter: "blur(6px)", borderRadius: "10px", padding: "10px 18px", border: "1px solid rgba(255,255,255,0.18)" }}>
                  <div style={{ fontSize: "22px", fontWeight: 900, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                  <div style={{ fontSize: "11px", color: "#c8ccaa", fontWeight: 600, marginTop: "3px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div style={{ padding: "28px 24px", maxWidth: "1400px", margin: "0 auto" }}>

          {/* Toolbar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "10px" }}>
            <span style={{ color: "#8a8469", fontSize: "13.5px" }}>
              {loading ? "Duke ngarkuar…" : `${leads.length} kërkesë${leads.length !== 1 ? " gjithsej" : ""}`}
            </span>
          </div>

          {/* Content */}
          {loading && <Skeleton />}

          {!loading && leads.length === 0 && (
            <div style={{ textAlign: "center", padding: "64px 32px", color: "#8a8469" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>📬</div>
              <h3 style={{ color: "#5a5f3a", margin: "0 0 8px" }}>Nuk keni kërkesa ende</h3>
              <p style={{ margin: "0 0 20px" }}>Klikoni butonin për të dërguar kërkesën tuaj të parë.</p>
              <button onClick={() => setCreateOpen(true)}
                style={{ ...S.applyBtn, width: "auto", padding: "11px 28px" }}>
                + Kërkesë e re
              </button>
            </div>
          )}

          {!loading && leads.length > 0 && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {leads.map(lead => (
                  <LeadCard key={lead.id} lead={lead} onClick={() => setSelectedLead(lead)} />
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </>
          )}
        </div>
      </div>

      {createOpen && (
        <CreateLeadModal
          onClose={() => setCreateOpen(false)}
          onSuccess={() => { setCreateOpen(false); fetchLeads(); notify("Kërkesa u dërgua! Agjenti do t'ju kontaktojë."); }}
          notify={notify}
        />
      )}
      {selectedLead && <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLead(null)} />}
      {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

      <style>{`
        @keyframes pulse         { 0%,100%{opacity:.5} 50%{opacity:.9} }
        @keyframes fadeInOverlay { from{opacity:0} to{opacity:1} }
        @keyframes slideUpModal  { from{transform:translateY(24px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes spin          { to{transform:rotate(360deg)} }
      `}</style>
    </MainLayout>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  applyBtn: {
    background: "#5a5f3a", color: "#fff", border: "none",
    borderRadius: "10px", fontSize: "14px", fontWeight: 700,
    cursor: "pointer", fontFamily: "'Georgia', serif",
  },
  pageBtn: (active, disabled) => ({
    padding: "7px 13px", borderRadius: "8px", border: "1.5px solid",
    borderColor: active ? "#5a5f3a" : "#d9d4c7",
    background:  active ? "#5a5f3a" : "#fff",
    color: active ? "#fff" : disabled ? "#c5bfaf" : "#5a5f3a",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "13px", fontWeight: active ? 700 : 400,
    fontFamily: "inherit", transition: "all 0.15s",
  }),
};