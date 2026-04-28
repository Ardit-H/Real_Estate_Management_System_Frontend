import { useState, useEffect, useCallback, useContext } from "react";
import MainLayout from "../../components/layout/Layout";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";

// ─── Constants ────────────────────────────────────────────────────────────────
const LEAD_TYPES   = ["SELL", "BUY", "RENT", "RENT_SEEKING", "VALUATION"];
const LEAD_SOURCES = ["WEBSITE", "PHONE", "EMAIL", "REFERRAL", "SOCIAL"];
const PROPERTY_TYPES = ["APARTMENT", "HOUSE", "VILLA", "COMMERCIAL", "LAND", "OFFICE"];
const CURRENCIES     = ["EUR", "USD", "ALL", "GBP", "CHF"];

// ─── Styles identical to BrowseProperties palette ────────────────────────────
const STATUS_STYLE = {
  NEW:         { bg:"#fffbeb", color:"#c9a84c", border:"#f0d878", label:"New",         icon:"🔵", strip:"#c9b87a",  pill:"rgba(201,184,122,0.15)", pillBorder:"rgba(201,184,122,0.3)"  },
  IN_PROGRESS: { bg:"#edf5f0", color:"#2a6049", border:"#a3c9b0", label:"In Progress", icon:"🟣", strip:"#7eb8a4",  pill:"rgba(126,184,164,0.15)", pillBorder:"rgba(126,184,164,0.3)"  },
  DONE:        { bg:"#f5f2eb", color:"#5a5f3a", border:"#d9d4c7", label:"Done",        icon:"🟢", strip:"#a4b07e",  pill:"rgba(164,176,126,0.15)", pillBorder:"rgba(164,176,126,0.3)"  },
  REJECTED:    { bg:"#fff5ee", color:"#8b4513", border:"#f5c6a0", label:"Rejected",    icon:"🔴", strip:"#d4855a",  pill:"rgba(212,133,90,0.15)",  pillBorder:"rgba(212,133,90,0.3)"   },
};
const TYPE_ICON  = { SELL:"🏷️", BUY:"🏠", RENT:"🔑", RENT_SEEKING:"🔎", VALUATION:"📊" };
const TYPE_LABEL = {
  SELL:         "Shitje — jap pronën time",
  BUY:          "Blerje — kërkoj pronë",
  RENT:         "Qira — jap pronën time me qira",
  RENT_SEEKING: "Qira — kërkoj të marr me qira",
  VALUATION:    "Vlerësim",
};
const SOURCE_ICON = { WEBSITE:"🌐", PHONE:"📞", EMAIL:"✉️", REFERRAL:"👥", SOCIAL:"📱" };

const fmtDate     = (d) => d ? new Date(d).toLocaleDateString("sq-AL") : "—";
const fmtDateTime = (d) => d ? new Date(d).toLocaleString("sq-AL", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" }) : "—";
const fmtBudget   = (v) => v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";

// ─── Property data helpers ────────────────────────────────────────────────────
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

// ─── Global CSS — identical system to BrowseProperties ───────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  .cl * { box-sizing: border-box; }
  .cl {
    font-family: 'DM Sans', system-ui, sans-serif;
    background: #f2ede4;
    min-height: 100vh;
  }

  .cl-card {
    transition: transform 0.25s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.25s ease;
  }
  .cl-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 24px 52px rgba(20,16,10,0.14) !important;
  }
  .cl-btn { transition: all 0.17s ease; }
  .cl-btn:hover { opacity: 0.85; transform: translateY(-1px); }

  .cl-in:focus {
    border-color: #8a7d5e !important;
    box-shadow: 0 0 0 3px rgba(138,125,94,0.13) !important;
    outline: none;
  }

  @keyframes cl-fade-up  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes cl-scale-in { from{opacity:0;transform:scale(0.95) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes cl-pulse    { 0%,100%{opacity:.38} 50%{opacity:.82} }
  @keyframes cl-spin     { to{transform:rotate(360deg)} }
  @keyframes cl-toast    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes cl-card-in  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes cl-shimmer  {
    0%   { background-position: -800px 0; }
    100% { background-position: 800px 0; }
  }
  @keyframes cl-glow-pulse { 0%,100%{opacity:0.07} 50%{opacity:0.14} }
`;

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position:"fixed", bottom:26, right:26, zIndex:9999,
      background:"#1a1714", color:type==="error"?"#f09090":"#90c8a8",
      padding:"11px 18px", borderRadius:12, fontSize:13, fontWeight:400,
      boxShadow:"0 10px 36px rgba(0,0,0,0.32)",
      border:`1px solid ${type==="error"?"rgba(240,128,128,0.15)":"rgba(144,200,168,0.15)"}`,
      maxWidth:320, fontFamily:"'DM Sans',sans-serif",
      animation:"cl-toast 0.2s ease", display:"flex", alignItems:"center", gap:8,
    }}>
      <span style={{fontSize:14}}>{type==="error"?"⚠️":"✅"}</span>
      {msg}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} style={{
          background:"linear-gradient(90deg, #ede9df 25%, #e4ddd0 50%, #ede9df 75%)",
          backgroundSize:"800px 100%",
          borderRadius:14, height:130,
          animation:`cl-shimmer 1.6s ease-in-out infinite, cl-pulse 1.6s ease-in-out infinite`,
        }}/>
      ))}
    </div>
  );
}

// ─── Shared input styles ──────────────────────────────────────────────────────
const INP_S = {
  width:"100%", padding:"10px 13px", border:"1.5px solid #e4ddd0",
  borderRadius:10, fontSize:13.5, color:"#1a1714",
  background:"#fff", fontFamily:"'DM Sans',sans-serif",
  boxSizing:"border-box", outline:"none", transition:"border-color 0.2s",
};
const SEL_S = { ...INP_S, cursor:"pointer" };
const ML = {
  display:"block", fontSize:10.5, fontWeight:600, color:"#9a8c6e",
  textTransform:"uppercase", letterSpacing:"0.7px", marginBottom:6,
  fontFamily:"'DM Sans',sans-serif",
};

function Field({ label, children, required, hint }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={ML}>
        {label}{required && <span style={{ color:"#c0392b", marginLeft:2 }}>*</span>}
      </label>
      {children}
      {hint && <p style={{ fontSize:11.5, color:"#b0a890", marginTop:4 }}>{hint}</p>}
    </div>
  );
}

// ─── Modal wrapper — identical to BrowseProperties ───────────────────────────
function ModalWrap({ children, onClose, maxW=520 }) {
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
      style={{
        position:"fixed", inset:0, zIndex:1000,
        background:"rgba(8,6,4,0.84)", backdropFilter:"blur(14px)",
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:20, fontFamily:"'DM Sans',sans-serif",
      }}>
      <div style={{
        width:"100%", maxWidth:maxW, background:"#faf7f2",
        borderRadius:18, boxShadow:"0 44px 100px rgba(0,0,0,0.55)",
        maxHeight:"92vh", overflowY:"auto",
        animation:"cl-scale-in 0.26s ease",
      }}>
        {children}
      </div>
    </div>
  );
}

const MH = ({ title, sub, onClose, icon }) => (
  <div style={{
    background:"linear-gradient(135deg, #141210 0%, #1e1a14 45%, #241e16 100%)",
    padding:"20px 26px", borderRadius:"18px 18px 0 0",
    display:"flex", alignItems:"center", justifyContent:"space-between",
    borderBottom:"1px solid rgba(201,184,122,0.15)",
    position:"relative", overflow:"hidden",
  }}>
    <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:"linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)" }}/>
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      {icon && <span style={{ fontSize:22 }}>{icon}</span>}
      <div>
        <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontWeight:700, fontSize:19, margin:"0 0 2px", color:"#f5f0e8", letterSpacing:"-0.2px" }}>{title}</p>
        {sub && <p style={{ fontSize:12, color:"rgba(245,240,232,0.4)", margin:0, fontFamily:"'DM Sans',sans-serif" }}>{sub}</p>}
      </div>
    </div>
    <button onClick={onClose} style={{
      background:"rgba(245,240,232,0.08)", backdropFilter:"blur(8px)",
      border:"1px solid rgba(245,240,232,0.12)", borderRadius:9,
      width:32, height:32, cursor:"pointer",
      display:"flex", alignItems:"center", justifyContent:"center",
      color:"rgba(245,240,232,0.6)", fontSize:16, lineHeight:1,
    }}>×</button>
  </div>
);

// ─── Property Fields ──────────────────────────────────────────────────────────
function PropertyFields({ form, setForm, leadType }) {
  const set = (k, v) => setForm(p => ({ ...p, property_data: { ...p.property_data, [k]: v } }));
  const pd = form.property_data || {};
  const isSell = leadType === "SELL";

  return (
    <div style={{
      marginTop:8, padding:"18px 16px",
      background: isSell ? "rgba(201,184,122,0.06)" : "rgba(126,184,164,0.06)",
      borderRadius:12,
      border:`1.5px solid ${isSell ? "rgba(201,184,122,0.2)" : "rgba(126,184,164,0.2)"}`,
    }}>
      <p style={{ fontSize:12, fontWeight:700, color: isSell ? "#c9b87a" : "#7eb8a4", marginBottom:16, display:"flex", alignItems:"center", gap:6, textTransform:"uppercase", letterSpacing:"0.8px" }}>
        {isSell ? "🏷️" : "🔑"} Të dhënat e pronës
        <span style={{ fontSize:11, fontWeight:400, color:"#b0a890", textTransform:"none", letterSpacing:0 }}>(agjenti do t'i regjistrojë)</span>
      </p>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
        <Field label="Titulli" required>
          <input className="cl-in" style={INP_S} value={pd.title||""} onChange={e=>set("title",e.target.value)} placeholder="p.sh. Apartament 2+1"/>
        </Field>
        <Field label="Lloji">
          <select className="cl-in" style={SEL_S} value={pd.property_type||"APARTMENT"} onChange={e=>set("property_type",e.target.value)}>
            {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:12 }}>
        <Field label="Sipërfaqja (m²)">
          <input className="cl-in" style={INP_S} type="number" min="0" value={pd.area_sqm||""} onChange={e=>set("area_sqm",e.target.value)} placeholder="85"/>
        </Field>
        <Field label="Dhoma gjumi">
          <input className="cl-in" style={INP_S} type="number" min="0" value={pd.bedrooms||""} onChange={e=>set("bedrooms",e.target.value)} placeholder="2"/>
        </Field>
        <Field label="Banjo">
          <input className="cl-in" style={INP_S} type="number" min="0" value={pd.bathrooms||""} onChange={e=>set("bathrooms",e.target.value)} placeholder="1"/>
        </Field>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:12, marginBottom:12 }}>
        <Field label={isSell ? "Çmimi i shitjes" : "Qiraja mujore"}>
          <input className="cl-in" style={INP_S} type="number" min="0" value={pd.price||""} onChange={e=>set("price",e.target.value)} placeholder="120000"/>
        </Field>
        <Field label="Monedha">
          <select className="cl-in" style={SEL_S} value={pd.currency||"EUR"} onChange={e=>set("currency",e.target.value)}>
            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
        <Field label="Qyteti" required>
          <input className="cl-in" style={INP_S} value={pd.city||""} onChange={e=>set("city",e.target.value)} placeholder="Tiranë"/>
        </Field>
        <Field label="Rruga / Lagjja">
          <input className="cl-in" style={INP_S} value={pd.street||""} onChange={e=>set("street",e.target.value)} placeholder="Rr. e Durrësit"/>
        </Field>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
        <Field label="Viti ndërtimit">
          <input className="cl-in" style={INP_S} type="number" min="1900" max={new Date().getFullYear()} value={pd.year_built||""} onChange={e=>set("year_built",e.target.value)} placeholder="2015"/>
        </Field>
        <Field label="Kati">
          <input className="cl-in" style={INP_S} type="number" value={pd.floor||""} onChange={e=>set("floor",e.target.value)} placeholder="3"/>
        </Field>
      </div>

      <Field label="Përshkrim" hint="Karakteristika, gjendje, pajisje, etj.">
        <textarea className="cl-in" value={pd.description||""} onChange={e=>set("description",e.target.value)} rows={3}
          placeholder="Apartament i ri, kuzhinë e pajisur, parking..."
          style={{ ...INP_S, resize:"vertical" }}/>
      </Field>
    </div>
  );
}

// ─── Create Lead Modal ────────────────────────────────────────────────────────
function CreateLeadModal({ onClose, onSuccess, notify }) {
  const EMPTY_PD = { title:"", property_type:"APARTMENT", area_sqm:"", bedrooms:"", bathrooms:"", price:"", currency:"EUR", city:"", street:"", year_built:"", floor:"", description:"" };
  const [form, setForm] = useState({ type:"BUY", message:"", budget:"", preferred_date:"", source:"WEBSITE", property_data:null });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleTypeChange = (t) => {
    const needs = t === "SELL" || t === "RENT";
    setForm(p => ({ ...p, type: t, property_data: needs ? (p.property_data || EMPTY_PD) : null }));
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
        type: form.type, property_id: null,
        message: buildMessage(form),
        budget: form.budget ? Number(form.budget) : null,
        preferred_date: form.preferred_date || null,
        source: form.source,
      });
      onSuccess();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë krijimit","error");
    } finally { setSaving(false); }
  };

  const DATE_LABEL = {
    SELL:"Data kur dëshironi ta listoni", BUY:"Kur jeni i disponueshëm për vizita",
    RENT:"Data nga kur prona është e disponueshme",
    RENT_SEEKING:"Kur dëshironi të lëvizni", VALUATION:"Kur dëshironi vlerësimin",
  };
  const isPropLead = form.type === "SELL" || form.type === "RENT";

  const INFO_COLORS = {
    SELL:         { bg:"rgba(201,184,122,0.08)", border:"rgba(201,184,122,0.2)",  color:"#c9b87a" },
    RENT:         { bg:"rgba(126,184,164,0.08)", border:"rgba(126,184,164,0.2)",  color:"#7eb8a4" },
    RENT_SEEKING: { bg:"rgba(164,176,126,0.08)", border:"rgba(164,176,126,0.2)",  color:"#a4b07e" },
    BUY:          { bg:"rgba(201,184,122,0.08)", border:"rgba(201,184,122,0.2)",  color:"#c9b87a" },
    VALUATION:    { bg:"rgba(164,176,126,0.08)", border:"rgba(164,176,126,0.2)",  color:"#a4b07e" },
  };
  const ic = INFO_COLORS[form.type] || INFO_COLORS.BUY;

  return (
    <ModalWrap onClose={onClose} maxW={isPropLead ? 660 : 520}>
      <MH title="Kërkesë e re" sub="Plotëso detajet e kërkesës tënde" onClose={onClose} icon="✨"/>
      <div style={{ padding:"22px 26px" }}>
        <Field label="Lloji i kërkesës" required>
          <select className="cl-in" style={SEL_S} value={form.type} onChange={e=>handleTypeChange(e.target.value)}>
            {LEAD_TYPES.map(t => <option key={t} value={t}>{TYPE_ICON[t]} {TYPE_LABEL[t]||t}</option>)}
          </select>
        </Field>

        <div style={{ background:ic.bg, border:`1.5px solid ${ic.border}`, borderRadius:10, padding:"10px 14px", marginBottom:16, fontSize:13, color:ic.color }}>
          {form.type==="SELL"         && "🏷️ Keni pronë për shitje? Plotëso të dhënat — agjenti do ta regjistrojë."}
          {form.type==="RENT"         && "🔑 Keni pronë për t'u dhënë me qira? Agjenti do t'i menaxhojë aplikimet."}
          {form.type==="RENT_SEEKING" && "🔎 Po kërkoni banesë me qira? Agjenti do t'ju gjejë opsionet."}
          {form.type==="BUY"          && "🏠 Po kërkoni pronë? Agjenti do t'ju gjejë opsionet bazuar në buxhetin tuaj."}
          {form.type==="VALUATION"    && "📊 Doni vlerësim profesional? Plotëso mesazhin me detaje."}
        </div>

        {isPropLead && <PropertyFields form={form} setForm={setForm} leadType={form.type}/>}

        <div style={{ marginTop:16 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <Field label="Buxheti (€)">
              <input className="cl-in" style={INP_S} type="number" value={form.budget} onChange={e=>set("budget",e.target.value)} placeholder="150000"/>
            </Field>
            <Field label={DATE_LABEL[form.type]||"Data e preferuar"}>
              <input className="cl-in" style={INP_S} type="date" value={form.preferred_date} onChange={e=>set("preferred_date",e.target.value)} min={new Date().toISOString().split("T")[0]}/>
            </Field>
          </div>
          <Field label="Si na gjetet?">
            <select className="cl-in" style={SEL_S} value={form.source} onChange={e=>set("source",e.target.value)}>
              {LEAD_SOURCES.map(s => <option key={s} value={s}>{SOURCE_ICON[s]} {s}</option>)}
            </select>
          </Field>
          <Field label={isPropLead ? "Shënime shtesë" : "Mesazhi"}>
            <textarea className="cl-in" value={form.message} onChange={e=>set("message",e.target.value)} rows={3}
              placeholder={isPropLead ? "Informacione shtesë..." : "Përshkruaj nevojën tënde..."}
              style={{ ...INP_S, resize:"vertical" }}/>
          </Field>
        </div>

        <div style={{ display:"flex", gap:9, justifyContent:"flex-end", borderTop:"1px solid #e8e2d6", paddingTop:18, marginTop:6 }}>
          <button onClick={onClose} className="cl-btn"
            style={{ padding:"10px 18px", borderRadius:10, border:"1.5px solid #e4ddd0", background:"transparent", color:"#6b6248", fontWeight:500, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
            Anulo
          </button>
          <button onClick={handleSubmit} disabled={saving} className="cl-btn"
            style={{ padding:"10px 22px", borderRadius:10, border:"none", background:saving?"#b0a890":"linear-gradient(135deg,#c9b87a 0%,#b0983e 100%)", color:"#1a1714", fontSize:13, fontWeight:700, cursor:saving?"not-allowed":"pointer", fontFamily:"inherit" }}>
            {saving ? "Duke dërguar…" : "✓ Dërgo kërkesën"}
          </button>
        </div>
      </div>
    </ModalWrap>
  );
}

// ─── Lead Detail Modal ────────────────────────────────────────────────────────
function LeadDetailModal({ lead, onClose }) {
  const propertyData = parsePropertyData(lead.message);
  const s = STATUS_STYLE[lead.status] || STATUS_STYLE.NEW;

  return (
    <ModalWrap onClose={onClose} maxW={580}>
      <MH
        title={`${TYPE_LABEL[lead.type]||lead.type}`}
        sub={`Kërkesë #${lead.id} · ${fmtDateTime(lead.created_at)}`}
        onClose={onClose}
        icon={TYPE_ICON[lead.type]||"📋"}
      />
      <div style={{ padding:"22px 26px" }}>

        {/* Status banner */}
        <div style={{ marginBottom:20, padding:"14px 16px", background:s.pill, borderRadius:12, border:`1.5px solid ${s.pillBorder}`, display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:`${s.strip}20`, border:`1.5px solid ${s.strip}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>
            {s.icon}
          </div>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:9.5, color:"#b0a890", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.8px", margin:"0 0 5px" }}>Statusi i kërkesës</p>
            <span style={{ background:`${s.strip}18`, color:s.strip, border:`1.5px solid ${s.strip}40`, padding:"3px 13px", borderRadius:999, fontSize:11, fontWeight:700, letterSpacing:"0.4px", textTransform:"uppercase" }}>{s.label}</span>
          </div>
          <p style={{ fontSize:12.5, color:"#6b6651", lineHeight:1.6, maxWidth:240, margin:0, fontFamily:"'Cormorant Garamond',Georgia,serif", fontStyle:"italic" }}>
            {lead.status==="NEW" && !lead.assigned_agent_id && "Kërkesa juaj u mor. Admini do t'ia asignojë një agjenti."}
            {lead.status==="NEW" && lead.assigned_agent_id  && "Agjenti është duke shqyrtuar kërkesën tuaj."}
            {lead.status==="IN_PROGRESS" && "Agjenti po punon. Do të kontaktoheni së shpejti."}
            {lead.status==="DONE"     && "Kërkesa u përfundua me sukses. Faleminderit!"}
            {lead.status==="REJECTED" && "Kërkesa nuk mund të plotësohet. Mund të krijoni një të re."}
          </p>
        </div>

        {/* Details grid */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:18 }}>
          {[
            { label:"Lloji",          value:`${TYPE_ICON[lead.type]||""} ${TYPE_LABEL[lead.type]||lead.type}` },
            { label:"Burimi",         value:`${SOURCE_ICON[lead.source]||""} ${lead.source}` },
            { label:"Buxheti",        value:fmtBudget(lead.budget) },
            { label:"Data preferuar", value:fmtDate(lead.preferred_date) },
            { label:"Agjenti",        value:lead.agent_name||(lead.assigned_agent_id?`Agjent #${lead.assigned_agent_id}`:"Pa agjent ende") },
          ].map(({ label, value }) => (
            <div key={label} style={{ background:"#fff", borderRadius:11, padding:"11px 14px", border:"1.5px solid #e8e2d6" }}>
              <p style={{ fontSize:9.5, color:"#b0a890", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:5 }}>{label}</p>
              <p style={{ fontSize:13.5, fontWeight:600, color:"#1a1714", margin:0, fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Property data */}
        {propertyData && (
          <div style={{ background:"rgba(201,184,122,0.06)", border:"1.5px solid rgba(201,184,122,0.18)", borderRadius:12, padding:"14px 16px", marginBottom:16 }}>
            <p style={{ fontSize:9.5, fontWeight:700, color:"#c9b87a", textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:10 }}>🏠 Të dhënat e pronës</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
              {propertyData.title      && <span style={{ fontSize:13, color:"#4a4438", fontFamily:"'Cormorant Garamond',Georgia,serif" }}>📌 {propertyData.title}</span>}
              {propertyData.city       && <span style={{ fontSize:13, color:"#4a4438" }}>📍 {propertyData.city}</span>}
              {propertyData.area_sqm   && <span style={{ fontSize:13, color:"#4a4438" }}>📐 {propertyData.area_sqm} m²</span>}
              {propertyData.bedrooms   && <span style={{ fontSize:13, color:"#4a4438" }}>🛏 {propertyData.bedrooms} dhoma</span>}
              {propertyData.price      && <span style={{ fontSize:13, color:"#4a4438" }}>💰 {Number(propertyData.price).toLocaleString("de-DE")} {propertyData.currency}</span>}
              {propertyData.year_built && <span style={{ fontSize:13, color:"#4a4438" }}>🗓 Ndërtuar: {propertyData.year_built}</span>}
            </div>
          </div>
        )}

        {/* Message */}
        {lead.message && cleanMessage(lead.message) && (
          <div style={{ background:"#fff", border:"1.5px solid #e8e2d6", borderRadius:12, padding:"14px 16px" }}>
            <p style={{ fontSize:9.5, color:"#b0a890", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:8 }}>Mesazhi juaj</p>
            <p style={{ fontSize:14, color:"#3c3830", lineHeight:1.8, fontStyle:"italic", margin:0, fontFamily:"'Cormorant Garamond',Georgia,serif" }}>
              "{cleanMessage(lead.message)}"
            </p>
          </div>
        )}

        <div style={{ borderTop:"1px solid #e8e2d6", paddingTop:16, marginTop:20, display:"flex", justifyContent:"flex-end" }}>
          <button onClick={onClose} className="cl-btn"
            style={{ padding:"10px 22px", borderRadius:10, border:"1.5px solid #e4ddd0", background:"transparent", color:"#6b6248", fontSize:13.5, fontWeight:500, cursor:"pointer", fontFamily:"inherit" }}>
            Mbyll
          </button>
        </div>
      </div>
    </ModalWrap>
  );
}

// ─── Lead Card — rich, matching BrowseProperties card energy ─────────────────
function LeadCard({ lead, onClick, idx }) {
  const pd = parsePropertyData(lead.message);
  const s  = STATUS_STYLE[lead.status] || STATUS_STYLE.NEW;

  return (
    <div className="cl-card" onClick={onClick}
      style={{
        background:"#fff", borderRadius:14, overflow:"hidden",
        boxShadow:"0 2px 16px rgba(20,16,10,0.08)", border:"1.5px solid #ece6da",
        cursor:"pointer", display:"flex",
        animation:`cl-card-in 0.38s ease ${Math.min(idx*0.06,0.4)}s both`,
      }}>

      {/* Left color strip */}
      <div style={{ width:4, background:`linear-gradient(to bottom, ${s.strip}, ${s.strip}88)`, flexShrink:0 }}/>

      {/* Icon column */}
      <div style={{
        width:64, flexShrink:0, display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center", gap:6,
        padding:"16px 10px",
        background:`linear-gradient(135deg, ${s.strip}08, transparent)`,
        borderRight:"1.5px solid #f0ece3",
      }}>
        <span style={{ fontSize:26 }}>{TYPE_ICON[lead.type]||"📋"}</span>
        <span style={{
          fontSize:9, fontWeight:700, color:s.strip, textTransform:"uppercase",
          letterSpacing:"0.5px", textAlign:"center", lineHeight:1.3,
          background:`${s.strip}15`, padding:"3px 6px", borderRadius:6,
          border:`1px solid ${s.strip}30`,
        }}>
          {s.label}
        </span>
      </div>

      {/* Main content */}
      <div style={{ flex:1, padding:"14px 18px", display:"flex", flexDirection:"column", justifyContent:"space-between", minWidth:0 }}>
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, marginBottom:6 }}>
            <div style={{ minWidth:0 }}>
              <h3 style={{
                margin:"0 0 3px", fontSize:15.5, fontWeight:700, color:"#1a1714",
                fontFamily:"'Cormorant Garamond',Georgia,serif", letterSpacing:"-0.1px",
                lineHeight:1.2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
              }}>
                {TYPE_LABEL[lead.type]||lead.type}
                {pd?.title && <span style={{ fontWeight:400, color:"#9a8c6e", fontSize:13.5 }}> — {pd.title}</span>}
              </h3>
              <p style={{ fontSize:11.5, color:"#b0a890", margin:0 }}>
                #{lead.id} · {fmtDate(lead.created_at)}
                {pd?.city && <span> · 📍 {pd.city}</span>}
              </p>
            </div>
            <div style={{ flexShrink:0, textAlign:"right" }}>
              {(lead.budget || pd?.price) && (
                <div style={{ fontSize:17, fontWeight:700, color:"#1a1714", fontFamily:"'Cormorant Garamond',Georgia,serif", letterSpacing:"-0.3px" }}>
                  {lead.budget ? fmtBudget(lead.budget) : `€${Number(pd.price).toLocaleString("de-DE")}`}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer row */}
        <div style={{ display:"flex", gap:14, paddingTop:10, borderTop:"1px solid #f0ece3", flexWrap:"wrap", alignItems:"center" }}>
          {pd?.area_sqm && <span style={{ fontSize:12, color:"#9a8c6e" }}>📐 {pd.area_sqm} m²</span>}
          {lead.preferred_date && <span style={{ fontSize:12, color:"#9a8c6e" }}>📅 {fmtDate(lead.preferred_date)}</span>}
          <span style={{ fontSize:12, color:"#9a8c6e" }}>
            {lead.agent_name ? `👤 ${lead.agent_name}` : lead.assigned_agent_id ? `👤 Agjent #${lead.assigned_agent_id}` : "⏳ Pa agjent ende"}
          </span>
          <span style={{ marginLeft:"auto", fontSize:11.5, color:"#c9b87a", fontWeight:600, display:"flex", alignItems:"center", gap:3 }}>
            Shiko detajet →
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
const PGB = (active, disabled) => ({
  padding:"7px 13px", borderRadius:9, border:`1.5px solid ${active?"#1a1714":"#e4ddd0"}`,
  background:active?"#1a1714":"transparent",
  color:active?"#f5f0e8":disabled?"#d4ccbe":"#6b6248",
  cursor:disabled?"not-allowed":"pointer", fontSize:13, fontWeight:active?600:400,
  fontFamily:"'DM Sans',sans-serif", opacity:disabled?0.5:1, transition:"all 0.14s",
});

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages   = Array.from({ length: totalPages }, (_, i) => i);
  const visible = pages.filter(p => p === 0 || p === totalPages - 1 || Math.abs(p - page) <= 1);
  return (
    <div style={{ display:"flex", justifyContent:"center", gap:4, marginTop:44, flexWrap:"wrap" }}>
      <button disabled={page===0} onClick={()=>onChange(page-1)} style={PGB(false,page===0)}>‹</button>
      {visible.map((p,i)=>{
        const gap=visible[i-1]!=null&&p-visible[i-1]>1;
        return <span key={p} style={{ display:"flex", gap:4 }}>
          {gap&&<span style={{ padding:"7px 4px", color:"#b0a890", fontSize:13 }}>…</span>}
          <button onClick={()=>onChange(p)} style={PGB(p===page,false)}>{p+1}</button>
        </span>;
      })}
      <button disabled={page===totalPages-1} onClick={()=>onChange(page+1)} style={PGB(false,page===totalPages-1)}>›</button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
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
    } catch { notify("Gabim gjatë ngarkimit","error"); }
    finally  { setLoading(false); }
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
      <style>{CSS}</style>
      <div className="cl">

        {/* ── Hero — identical structure & minHeight to BrowseProperties ── */}
        <div style={{
          background:"linear-gradient(160deg, #141210 0%, #1e1a14 45%, #241e16 100%)",
          minHeight:320,
          display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center",
          padding:"40px 32px",
          position:"relative", overflow:"hidden",
        }}>
          {/* Dot texture */}
          <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(rgba(255,255,255,0.018) 1px,transparent 1px)", backgroundSize:"22px 22px", pointerEvents:"none" }}/>
          {/* Glow left */}
          <div style={{ position:"absolute", top:"-60px", left:"10%", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle,rgba(201,184,122,0.07) 0%,transparent 70%)", pointerEvents:"none", animation:"cl-glow-pulse 4s ease-in-out infinite" }}/>
          {/* Glow right */}
          <div style={{ position:"absolute", bottom:"-40px", right:"10%", width:240, height:240, borderRadius:"50%", background:"radial-gradient(circle,rgba(126,184,164,0.05) 0%,transparent 70%)", pointerEvents:"none", animation:"cl-glow-pulse 4s ease-in-out infinite 2s" }}/>
          {/* Gold accent line top */}
          <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:"linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)" }}/>

          <div style={{ position:"relative", zIndex:1, maxWidth:700, width:"100%", textAlign:"center" }}>

            {/* Tag line */}
            <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(201,184,122,0.1)", border:"1px solid rgba(201,184,122,0.18)", borderRadius:999, padding:"4px 14px", marginBottom:14 }}>
              <span style={{ width:5, height:5, borderRadius:"50%", background:"#c9b87a", display:"inline-block", boxShadow:"0 0 6px #c9b87a" }}/>
              <span style={{ fontSize:10.5, fontWeight:600, color:"#c9b87a", letterSpacing:"1.2px", textTransform:"uppercase" }}>Paneli i Kërkesave</span>
            </div>

            {/* Headline */}
            <h1 style={{
              margin:"0 0 10px",
              fontFamily:"'Cormorant Garamond',Georgia,serif",
              fontSize:"clamp(28px,4vw,44px)",
              fontWeight:700, color:"#f5f0e8",
              letterSpacing:"-0.7px", lineHeight:1.1,
            }}>
              Kërkesat e{" "}
              <span style={{
                background:"linear-gradient(90deg,#c9b87a,#e8d9a0,#c9b87a)",
                backgroundSize:"200% auto",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
              }}>Mia</span>
            </h1>

            <p style={{ margin:"0 auto 24px", fontSize:13.5, color:"rgba(245,240,232,0.38)", fontFamily:"'DM Sans',sans-serif", lineHeight:1.6 }}>
              Shiko statusin e kërkesave që ke dërguar
            </p>

            {/* CTA */}
            <button onClick={() => setCreateOpen(true)} className="cl-btn"
              style={{
                display:"inline-flex", alignItems:"center", gap:8,
                background:"linear-gradient(135deg,#c9b87a 0%,#b0983e 100%)",
                color:"#1a1714", border:"none", borderRadius:11,
                padding:"12px 26px", fontSize:14, fontWeight:700,
                cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
                boxShadow:"0 6px 24px rgba(201,184,122,0.28)",
              }}>
              ✦ Kërkesë e re
            </button>

            {/* Stat pills */}
            {leads.length > 0 && (
              <div style={{ display:"flex", gap:10, maxWidth:520, margin:"24px auto 0", justifyContent:"center", flexWrap:"wrap" }}>
                {[
                  { label:"Gjithsej", value:stats.total,    dot:"#c9b87a" },
                  { label:"Aktive",   value:stats.active,   dot:"#e2c97e" },
                  { label:"Kryer",    value:stats.done,     dot:"#7eb8a4" },
                  { label:"Refuzuar", value:stats.rejected, dot:"#d4855a" },
                ].map(stat => (
                  <div key={stat.label} style={{
                    background:"rgba(245,240,232,0.06)", backdropFilter:"blur(10px)",
                    borderRadius:12, padding:"10px 18px",
                    border:"1px solid rgba(245,240,232,0.1)",
                    display:"flex", flexDirection:"column", alignItems:"center", gap:3,
                  }}>
                    <div style={{ display:"flex", alignItems:"baseline", gap:5 }}>
                      <span style={{ fontSize:24, fontWeight:700, color:stat.dot, lineHeight:1, fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{stat.value}</span>
                    </div>
                    <div style={{ fontSize:10, color:"rgba(245,240,232,0.35)", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.8px" }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

        {/* ── Toolbar ── */}
        <div style={{
          background:"#fff", borderBottom:"1.5px solid #e8e2d6",
          padding:"0 28px", height:46,
          display:"flex", alignItems:"center", justifyContent:"space-between",
          gap:12, fontFamily:"'DM Sans',sans-serif",
          position:"sticky", top:0, zIndex:100,
          boxShadow:"0 1px 10px rgba(20,16,10,0.05)",
        }}>
          <p style={{ margin:0, fontSize:12.5, color:"#9a8c6e" }}>
            {loading ? "Duke ngarkuar…" : `${leads.length} kërkesë${leads.length!==1?" gjithsej":""}`}
          </p>
          <button onClick={() => setCreateOpen(true)} className="cl-btn"
            style={{
              padding:"6px 16px", borderRadius:9,
              background:"linear-gradient(135deg,#c9b87a,#b0983e)",
              color:"#1a1714", border:"none", fontSize:12, fontWeight:700,
              cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
              display:"flex", alignItems:"center", gap:5,
            }}>
            + Kërkesë e re
          </button>
        </div>

        {/* ── Content ── */}
        <div style={{ padding:"20px 24px", maxWidth:1440, margin:"0 auto" }}>

          {loading && <Skeleton/>}

          {!loading && leads.length === 0 && (
            <div style={{ textAlign:"center", padding:"80px 32px", color:"#b0a890", fontFamily:"'DM Sans',sans-serif" }}>
              <div style={{ fontSize:52, marginBottom:16 }}>📬</div>
              <p style={{ fontSize:20, fontWeight:700, color:"#6b6340", marginBottom:6, fontFamily:"'Cormorant Garamond',Georgia,serif", letterSpacing:"-0.2px" }}>Nuk keni kërkesa ende</p>
              <p style={{ fontSize:13, marginBottom:24, color:"#b0a890" }}>Dërgoni kërkesën tuaj të parë — agjenti do t'ju kontaktojë.</p>
              <button onClick={() => setCreateOpen(true)} className="cl-btn"
                style={{
                  padding:"11px 28px", background:"linear-gradient(135deg,#c9b87a,#b0983e)",
                  color:"#1a1714", border:"none", borderRadius:11, fontSize:13.5,
                  fontWeight:700, cursor:"pointer", fontFamily:"inherit",
                }}>
                ✦ Kërkesë e re
              </button>
            </div>
          )}

          {!loading && leads.length > 0 && (
            <>
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {leads.map((lead, i) => (
                  <LeadCard key={lead.id} lead={lead} idx={i} onClick={() => setSelectedLead(lead)}/>
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} onChange={setPage}/>
            </>
          )}
        </div>
      </div>

      {createOpen && (
        <CreateLeadModal
          onClose={() => setCreateOpen(false)}
          onSuccess={() => { setCreateOpen(false); fetchLeads(); notify("Kërkesa u dërgua! Agjenti do t'ju kontaktojë. ✓"); }}
          notify={notify}
        />
      )}
      {selectedLead && <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLead(null)}/>}
      {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)}/>}
    </MainLayout>
  );
}