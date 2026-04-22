import { useState, useEffect, useCallback, useContext } from "react";
import MainLayout from "../../components/layout/Layout";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";

const LEAD_TYPES   = ["SELL", "BUY", "RENT", "RENT_SEEKING", "VALUATION"];
const LEAD_SOURCES = ["WEBSITE", "PHONE", "EMAIL", "REFERRAL", "SOCIAL"];
const PROPERTY_TYPES = ["APARTMENT", "HOUSE", "VILLA", "COMMERCIAL", "LAND", "OFFICE"];
const CURRENCIES     = ["EUR", "USD", "ALL", "GBP", "CHF"];

const STATUS_STYLE = {
  NEW:         { bg: "#eff6ff", color: "#2563eb", label: "New",         icon: "🔵" },
  IN_PROGRESS: { bg: "#f5f3ff", color: "#7c3aed", label: "In Progress", icon: "🟣" },
  DONE:        { bg: "#ecfdf5", color: "#059669", label: "Done",        icon: "🟢" },
  REJECTED:    { bg: "#fef2f2", color: "#dc2626", label: "Rejected",    icon: "🔴" },
};
const TYPE_ICON   = { SELL: "🏷️", BUY: "🏠", RENT: "🔑", RENT_SEEKING: "🔎", VALUATION: "📊" };
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
    if (pd.title)       parts.push(`Titulli: ${pd.title}`);
    if (pd.property_type) parts.push(`Lloji: ${pd.property_type}`);
    if (pd.city)        parts.push(`Qyteti: ${pd.city}`);
    if (pd.street)      parts.push(`Adresa: ${pd.street}`);
    if (pd.area_sqm)    parts.push(`Sipërfaqja: ${pd.area_sqm} m²`);
    if (pd.bedrooms)    parts.push(`Dhoma gjumi: ${pd.bedrooms}`);
    if (pd.bathrooms)   parts.push(`Banjo: ${pd.bathrooms}`);
    if (pd.floor)       parts.push(`Kati: ${pd.floor}`);
    if (pd.year_built)  parts.push(`Viti ndërtimit: ${pd.year_built}`);
    if (pd.price)       parts.push(`Çmimi: ${pd.price} ${pd.currency || "EUR"}`);
    if (pd.description) parts.push(`Shënime: ${pd.description}`);
    parts.push(`\n${PROP_MARKER}${JSON.stringify(pd)}`);
  }
  return parts.join("\n").trim() || null;
}

// ── UI helpers ────────────────────────────────────────────────────────────────
function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position:"fixed", bottom:28, right:28, zIndex:9999,
      background: type === "error" ? "#fee2e2" : "#ecfdf5",
      color: type === "error" ? "#b91c1c" : "#047857",
      padding:"12px 20px", borderRadius:10, fontSize:13.5, fontWeight:500,
      boxShadow:"0 4px 18px rgba(0,0,0,0.12)", maxWidth:340, animation:"fadeUp .25s ease" }}>
      {msg}
    </div>
  );
}

function Loader() {
  return (
    <div style={{ textAlign:"center", padding:"60px 0" }}>
      <div style={{ width:32, height:32, margin:"0 auto",
        border:"3px solid #e8edf4", borderTop:"3px solid #6366f1",
        borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
    </div>
  );
}

function EmptyState({ icon, text, subtext }) {
  return (
    <div style={{ textAlign:"center", padding:"60px 20px", color:"#94a3b8" }}>
      <div style={{ fontSize:40, marginBottom:12 }}>{icon}</div>
      <p style={{ fontSize:15, fontWeight:500, color:"#64748b", marginBottom:4 }}>{text}</p>
      {subtext && <p style={{ fontSize:13 }}>{subtext}</p>}
    </div>
  );
}

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || { bg:"#f1f5f9", color:"#475569", label:status };
  return (
    <span style={{ background:s.bg, color:s.color, padding:"3px 10px", borderRadius:20,
      fontSize:11.5, fontWeight:600, display:"inline-flex", alignItems:"center", gap:5 }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:s.color, display:"inline-block" }} />
      {s.label}
    </span>
  );
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6, justifyContent:"flex-end", padding:"14px 16px" }}>
      <button className="btn btn--secondary btn--sm" disabled={page===0} onClick={() => onChange(page-1)}>← Prev</button>
      <span style={{ fontSize:13, color:"#64748b", padding:"0 8px" }}>{page+1} / {totalPages}</span>
      <button className="btn btn--secondary btn--sm" disabled={page>=totalPages-1} onClick={() => onChange(page+1)}>Next →</button>
    </div>
  );
}

function Field({ label, children, required, hint }) {
  return (
    <div className="form-group">
      <label className="form-label">
        {label}{required && <span style={{ color:"#ef4444", marginLeft:2 }}>*</span>}
      </label>
      {children}
      {hint && <p style={{ fontSize:11.5, color:"#94a3b8", marginTop:4 }}>{hint}</p>}
    </div>
  );
}

// ── Property Fields (SELL/RENT only) ─────────────────────────────────────────
function PropertyFields({ form, setForm, leadType }) {
  const set = (k, v) => setForm(p => ({ ...p, property_data: { ...p.property_data, [k]: v } }));
  const pd = form.property_data || {};
  const color = leadType === "SELL" ? "#7c3aed" : "#059669";
  const bg    = leadType === "SELL" ? "#fef9ff" : "#f0fdf4";
  const border = leadType === "SELL" ? "#e9d5ff" : "#bbf7d0";

  return (
    <div style={{ marginTop:8, padding:"18px 16px", background:bg, borderRadius:12, border:`1px solid ${border}` }}>
      <p style={{ fontSize:13, fontWeight:600, color, marginBottom:16, display:"flex", alignItems:"center", gap:6 }}>
        {leadType === "SELL" ? "🏷️" : "🔑"} Të dhënat e pronës suaj
        <span style={{ fontSize:11.5, fontWeight:400, color:"#94a3b8" }}>
          (agjenti do t'i regjistrojë në sistem)
        </span>
      </p>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
        <Field label="Titulli i pronës" required>
          <input className="form-input" value={pd.title||""} onChange={e=>set("title",e.target.value)}
            placeholder="p.sh. Apartament 2+1 në Prishtinë" />
        </Field>
        <Field label="Lloji i pronës" required>
          <select className="form-select" value={pd.property_type||"APARTMENT"} onChange={e=>set("property_type",e.target.value)}>
            {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:12 }}>
        <Field label="Sipërfaqja (m²)">
          <input className="form-input" type="number" min="0" value={pd.area_sqm||""} onChange={e=>set("area_sqm",e.target.value)} placeholder="85" />
        </Field>
        <Field label="Dhoma gjumi">
          <input className="form-input" type="number" min="0" value={pd.bedrooms||""} onChange={e=>set("bedrooms",e.target.value)} placeholder="2" />
        </Field>
        <Field label="Banjo">
          <input className="form-input" type="number" min="0" value={pd.bathrooms||""} onChange={e=>set("bathrooms",e.target.value)} placeholder="1" />
        </Field>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:12, marginBottom:12 }}>
        <Field label={leadType === "SELL" ? "Çmimi i shitjes" : "Qiraja mujore"}>
          <input className="form-input" type="number" min="0" value={pd.price||""} onChange={e=>set("price",e.target.value)} placeholder="120000" />
        </Field>
        <Field label="Monedha">
          <select className="form-select" value={pd.currency||"EUR"} onChange={e=>set("currency",e.target.value)}>
            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
        <Field label="Qyteti" required>
          <input className="form-input" value={pd.city||""} onChange={e=>set("city",e.target.value)} placeholder="Prishtinë" />
        </Field>
        <Field label="Rruga / Lagjja">
          <input className="form-input" value={pd.street||""} onChange={e=>set("street",e.target.value)} placeholder="Rr. UÇK, Nr. 15" />
        </Field>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
        <Field label="Viti i ndërtimit">
          <input className="form-input" type="number" min="1900" max={new Date().getFullYear()}
            value={pd.year_built||""} onChange={e=>set("year_built",e.target.value)} placeholder="2015" />
        </Field>
        <Field label="Kati">
          <input className="form-input" type="number" value={pd.floor||""} onChange={e=>set("floor",e.target.value)} placeholder="3" />
        </Field>
      </div>

      <Field label="Përshkrim i shkurtër" hint="Karakteristika, gjendje, pajisje, etj.">
        <textarea value={pd.description||""} onChange={e=>set("description",e.target.value)} rows={3}
          placeholder="Apartament i ri, kuzhinë e pajisur, parking, pa hipotekë..."
          style={{ width:"100%", padding:"9px 12px", border:"1px solid #cbd5e1",
            borderRadius:10, fontSize:14, fontFamily:"inherit", resize:"vertical", outline:"none" }} />
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
    const h = (e) => e.key==="Escape" && onClose();
    window.addEventListener("keydown",h);
    return () => window.removeEventListener("keydown",h);
  }, [onClose]);

  const DATE_LABEL = {
    SELL:"Data kur dëshironi ta listoni",
    BUY:"Kur jeni i disponueshëm për vizita", 
    RENT:"Data nga kur prona është e disponueshme",
    RENT_SEEKING: "Kur dëshironi të lëvizni / move-in date", 
    VALUATION:"Kur dëshironi vlerësimin" 
  
  };
  const isPropLead = form.type==="SELL"||form.type==="RENT";

  return (
    <div style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(15,23,42,0.45)",
      display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ width:"100%", maxWidth: isPropLead ? 640 : 520, background:"#fff", borderRadius:16,
        boxShadow:"0 20px 60px rgba(15,23,42,0.18)", maxHeight:"90vh", overflowY:"auto", animation:"fadeUp .2s ease" }}>

        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"18px 24px", borderBottom:"1px solid #e8edf4" }}>
          <div>
            <h3 style={{ fontWeight:600, fontSize:15, margin:0 }}>Kërkesë e re</h3>
            <p style={{ fontSize:12, color:"#64748b", margin:0 }}>Plotëso detajet e kërkesës tënde</p>
          </div>
          <button onClick={onClose} style={{ width:30, height:30, border:"none", background:"none", color:"#94a3b8", cursor:"pointer", fontSize:16 }}>✕</button>
        </div>

        <div style={{ padding:"22px 24px" }}>
          <Field label="Lloji i kërkesës" required>
            <select className="form-select" value={form.type} onChange={e=>handleTypeChange(e.target.value)}>
              {LEAD_TYPES.map(t => <option key={t} value={t}>{TYPE_ICON[t]} {TYPE_LABEL[t]||t}</option>)}
            </select>
          </Field>

          {/* Info banner */}
          <div style={{ background: isPropLead?(form.type==="SELL"?"#fef9ff":"#f0fdf4"):"#eff6ff",
            border:`1px solid ${isPropLead?(form.type==="SELL"?"#e9d5ff":"#bbf7d0"):"#bfdbfe"}`,
            borderRadius:8, padding:"10px 14px", marginBottom:16, fontSize:12.5,
            color: isPropLead?(form.type==="SELL"?"#6b21a8":"#166534"):"#1e40af" }}>
            {form.type==="SELL" && "🏷️ Keni pronë për shitje? Plotëso të dhënat — agjenti do ta regjistrojë dhe listojë në sistem."}
            {form.type==="RENT" && "🔑 Keni pronë për t'u dhënë me qira? Plotëso të dhënat — agjenti do t'i menaxhojë aplikimet."}
            {form.type==="RENT_SEEKING" && "🔎 Po kërkoni banesë/pronë me qira? Agjenti do t'ju gjejë opsionet bazuar në preferencat tuaja."}
            {form.type==="BUY"  && "🏠 Po kërkoni pronë? Agjenti do t'ju gjejë opsionet bazuar në buxhetin tuaj."}
            {form.type==="VALUATION" && "📊 Doni vlerësim profesional të pronës suaj? Plotëso mesazhin."}
          </div>

          {isPropLead && <PropertyFields form={form} setForm={setForm} leadType={form.type} />}

          <div style={{ marginTop:16 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <Field label="Buxheti (€)">
                <input className="form-input" type="number" value={form.budget}
                  onChange={e=>set("budget",e.target.value)} placeholder="150000" />
              </Field>
              <Field label={DATE_LABEL[form.type]||"Data e preferuar"}>
                <input className="form-input" type="date" value={form.preferred_date}
                  onChange={e=>set("preferred_date",e.target.value)}
                  min={new Date().toISOString().split("T")[0]} />
              </Field>
            </div>
            <Field label="Si na gjetet?">
              <select className="form-select" value={form.source} onChange={e=>set("source",e.target.value)}>
                {LEAD_SOURCES.map(s => <option key={s} value={s}>{SOURCE_ICON[s]} {s}</option>)}
              </select>
            </Field>
            <Field label={isPropLead ? "Shënime shtesë (opcionale)" : "Mesazhi"}>
              <textarea value={form.message} onChange={e=>set("message",e.target.value)} rows={3}
                placeholder={isPropLead ? "Informacione shtesë..." : "Përshkruaj nevojën tënde..."}
                style={{ width:"100%", padding:"9px 12px", border:"1px solid #cbd5e1",
                  borderRadius:10, fontSize:14, fontFamily:"inherit", resize:"vertical", outline:"none" }} />
            </Field>
          </div>

          <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:6 }}>
            <button className="btn btn--secondary" onClick={onClose}>Anulo</button>
            <button className="btn btn--primary" onClick={handleSubmit} disabled={saving}>
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
  useEffect(() => {
    const h = (e) => e.key==="Escape" && onClose();
    window.addEventListener("keydown",h);
    return () => window.removeEventListener("keydown",h);
  }, [onClose]);

  return (
    <div style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(15,23,42,0.45)",
      display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ width:"100%", maxWidth:580, background:"#fff", borderRadius:16,
        boxShadow:"0 20px 60px rgba(15,23,42,0.18)", maxHeight:"90vh", overflowY:"auto", animation:"fadeUp .2s ease" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"18px 24px", borderBottom:"1px solid #e8edf4" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:22 }}>{TYPE_ICON[lead.type]||"📋"}</span>
            <div>
              <h3 style={{ fontWeight:600, fontSize:15, margin:0 }}>
                Kërkesë #{lead.id} — {TYPE_LABEL[lead.type]||lead.type}
              </h3>
              <p style={{ fontSize:12, color:"#64748b", margin:0 }}>Dërguar: {fmtDateTime(lead.created_at)}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width:30, height:30, border:"none", background:"none", color:"#94a3b8", cursor:"pointer", fontSize:16 }}>✕</button>
        </div>

        <div style={{ padding:"22px 24px" }}>
          {/* Status banner */}
          <div style={{ marginBottom:20, padding:"14px 16px",
            background: STATUS_STYLE[lead.status]?.bg||"#f8fafc",
            borderRadius:10, border:`1px solid ${STATUS_STYLE[lead.status]?.color}30` }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:20 }}>{STATUS_STYLE[lead.status]?.icon||"⚪"}</span>
              <div>
                <p style={{ fontSize:11, color:"#94a3b8", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", margin:0 }}>Statusi</p>
                <div style={{ marginTop:4 }}><StatusBadge status={lead.status} /></div>
              </div>
            </div>
            <p style={{ fontSize:12.5, color:"#475569", marginTop:10, lineHeight:1.6 }}>
              {lead.status==="NEW" && !lead.assigned_agent_id && "Kërkesa juaj u mor. Admini do t'ia asignojë një agjenti."}
              {lead.status==="NEW" && lead.assigned_agent_id && "Agjenti është duke shqyrtuar kërkesën tuaj."}
              {lead.status==="IN_PROGRESS" && "Agjenti po punon. Do të kontaktoheni."}
              {lead.status==="DONE" && (lead.type==="SELL"||lead.type==="RENT")
                ? "Prona juaj u regjistrua në sistem dhe është aktive. Faleminderit!"
                : lead.status==="DONE" ? "Kërkesa u përfundua me sukses. Faleminderit!" : ""}
              {lead.status==="REJECTED" && "Kërkesa nuk mund të plotësohet. Mund të krijoni një të re."}
            </p>
          </div>

          {/* Details grid */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:18 }}>
            {[
              { label:"Lloji",          value:`${TYPE_ICON[lead.type]||""} ${TYPE_LABEL[lead.type]||lead.type}` },
              { label:"Burimi",         value:`${SOURCE_ICON[lead.source]||""} ${lead.source}` },
              { label:"Buxheti",        value:fmtBudget(lead.budget) },
              { label:"Data preferuar", value:fmtDate(lead.preferred_date) },
              { label:"Agjenti",        value:lead.agent_name||(lead.assigned_agent_id?`Agjent #${lead.assigned_agent_id}`:"Pa agjent") },
            ].map(({label,value}) => (
              <div key={label} style={{ background:"#f8fafc", borderRadius:8, padding:"10px 14px", border:"1px solid #e8edf4" }}>
                <p style={{ fontSize:11, color:"#94a3b8", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>{label}</p>
                <p style={{ fontSize:13.5, fontWeight:500, color:"#0f172a" }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Property data panel */}
          {propertyData && (
            <div style={{ background:"#fef9ff", border:"1px solid #e9d5ff", borderRadius:10, padding:"14px 16px", marginBottom:16 }}>
              <p style={{ fontSize:12, fontWeight:600, color:"#7c3aed", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>
                🏠 Të dhënat e pronës tuaj
              </p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {propertyData.title      && <span style={{ fontSize:13 }}>📌 {propertyData.title}</span>}
                {propertyData.city       && <span style={{ fontSize:13 }}>📍 {propertyData.city}</span>}
                {propertyData.area_sqm   && <span style={{ fontSize:13 }}>📐 {propertyData.area_sqm} m²</span>}
                {propertyData.bedrooms   && <span style={{ fontSize:13 }}>🛏 {propertyData.bedrooms} dhoma</span>}
                {propertyData.price      && <span style={{ fontSize:13 }}>💰 {Number(propertyData.price).toLocaleString("de-DE")} {propertyData.currency}</span>}
                {propertyData.year_built && <span style={{ fontSize:13 }}>🗓 Ndërtuar: {propertyData.year_built}</span>}
              </div>
            </div>
          )}

          {/* Clean message */}
          {lead.message && cleanMessage(lead.message) && (
            <div style={{ background:"#f8fafc", border:"1px solid #e8edf4", borderRadius:10, padding:"14px 16px" }}>
              <p style={{ fontSize:11, color:"#94a3b8", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8 }}>Mesazhi juaj</p>
              <p style={{ fontSize:13.5, color:"#374151", lineHeight:1.6, fontStyle:"italic" }}>
                "{cleanMessage(lead.message)}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ClientLeads() {
  const { user } = useContext(AuthContext);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [toast, setToast] = useState(null);

  const notify = useCallback((msg, type="success") => setToast({ msg, type, key:Date.now() }), []);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/leads/my/client?page=${page}&size=10`);
      setLeads(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch { notify("Gabim gjatë ngarkimit","error"); }
    finally { setLoading(false); }
  }, [page, notify]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const stats = {
    total:    leads.length,
    active:   leads.filter(l=>l.status==="NEW"||l.status==="IN_PROGRESS").length,
    done:     leads.filter(l=>l.status==="DONE").length,
    rejected: leads.filter(l=>l.status==="REJECTED").length,
  };

  return (
    <MainLayout role="client">
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px);} to{opacity:1;transform:translateY(0);} }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="page-header">
        <div>
          <h1 className="page-title">Kërkesat e mia</h1>
          <p className="page-subtitle">Shiko statusin e kërkesave që ke dërguar</p>
        </div>
        <button className="btn btn--primary" onClick={() => setCreateOpen(true)}>+ Kërkesë e re</button>
      </div>

      {leads.length > 0 && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
          {[
            { label:"Gjithsej", value:stats.total,    color:"#6366f1", bg:"#eef2ff" },
            { label:"Aktive",   value:stats.active,   color:"#7c3aed", bg:"#f5f3ff" },
            { label:"Kryer",    value:stats.done,     color:"#059669", bg:"#ecfdf5" },
            { label:"Refuzuar", value:stats.rejected, color:"#dc2626", bg:"#fef2f2" },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-card__label">{s.label}</div>
              <div className="stat-card__value" style={{ color:s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Të gjitha kërkesat</h2>
        </div>
        {loading ? <Loader /> : leads.length===0 ? (
          <EmptyState icon="📬" text="Nuk keni kërkesa ende" subtext="Klikoni '+ Kërkesë e re' për të filluar" />
        ) : (
          <>
            <div style={{ padding:"16px 20px", display:"flex", flexDirection:"column", gap:12 }}>
              {leads.map(lead => {
                const pd = parsePropertyData(lead.message);
                return (
                  <div key={lead.id} style={{ border:"1px solid #e8edf4", borderRadius:12, padding:"16px 18px",
                    background:"#fafafa", cursor:"pointer", transition:"box-shadow .15s ease" }}
                    onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 16px rgba(15,23,42,0.08)"}
                    onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}
                    onClick={()=>setSelectedLead(lead)}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <span style={{ fontSize:24 }}>{TYPE_ICON[lead.type]||"📋"}</span>
                        <div>
                          <p style={{ fontWeight:600, fontSize:14.5, margin:0 }}>
                            {TYPE_LABEL[lead.type]||lead.type}
                            {pd?.title && <span style={{ fontWeight:400, color:"#64748b", fontSize:13, marginLeft:6 }}>— {pd.title}</span>}
                          </p>
                          <p style={{ fontSize:12.5, color:"#94a3b8", margin:0, marginTop:2 }}>
                            #{lead.id} · {fmtDate(lead.created_at)}
                            {pd?.city && ` · 📍 ${pd.city}`}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={lead.status} />
                    </div>
                    <div style={{ display:"flex", gap:16, marginTop:12, paddingTop:12, borderTop:"1px solid #e8edf4", flexWrap:"wrap" }}>
                      {(lead.budget||pd?.price) && (
                        <span style={{ fontSize:13, color:"#475569" }}>
                          💰 {lead.budget ? fmtBudget(lead.budget) : `${Number(pd.price).toLocaleString("de-DE")} ${pd.currency||"EUR"}`}
                        </span>
                      )}
                      {pd?.area_sqm && <span style={{ fontSize:13, color:"#475569" }}>📐 {pd.area_sqm} m²</span>}
                      {lead.preferred_date && <span style={{ fontSize:13, color:"#475569" }}>📅 {fmtDate(lead.preferred_date)}</span>}
                      <span style={{ fontSize:13, color:"#475569" }}>
                        {lead.agent_name?`👤 ${lead.agent_name}`:lead.assigned_agent_id?`👤 Agjent #${lead.assigned_agent_id}`:"⏳ Pa agjent ende"}
                      </span>
                      <span style={{ marginLeft:"auto", fontSize:12.5, color:"#6366f1", fontWeight:500 }}>Shiko detajet →</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </div>

      {createOpen && (
        <CreateLeadModal onClose={()=>setCreateOpen(false)}
          onSuccess={() => { setCreateOpen(false); fetchLeads(); notify("Kërkesa u dërgua! Agjenti do t'ju kontaktojë."); }}
          notify={notify} />
      )}
      {selectedLead && <LeadDetailModal lead={selectedLead} onClose={()=>setSelectedLead(null)} />}
      {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={()=>setToast(null)} />}
    </MainLayout>
  );
}