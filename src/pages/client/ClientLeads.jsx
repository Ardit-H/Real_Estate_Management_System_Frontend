import { useState, useEffect, useCallback, useContext } from "react";
import MainLayout from "../../components/layout/Layout";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";

// ─── Constants ────────────────────────────────────────────────────────────────
const LEAD_TYPES     = ["SELL", "RENT", "VALUATION"];
const LEAD_SOURCES   = ["WEBSITE", "PHONE", "EMAIL", "REFERRAL", "SOCIAL"];
const PROPERTY_TYPES = ["APARTMENT", "HOUSE", "VILLA", "COMMERCIAL", "LAND", "OFFICE"];
const CURRENCIES     = ["EUR", "USD", "ALL", "GBP", "CHF"];
const PRICE_PERIODS  = ["MONTHLY", "YEARLY", "DAILY", "WEEKLY"];

// Which fields are shown per property type
const TYPE_FIELDS = {
  APARTMENT: { floor: true,  total_floors: true,  bedrooms: true,  bathrooms: true,  year_built: true,  area_sqm: true },
  HOUSE:     { floor: false, total_floors: true, bedrooms: true,  bathrooms: true,  year_built: true,  area_sqm: true },
  VILLA:     { floor: false, total_floors: true, bedrooms: true,  bathrooms: true,  year_built: true,  area_sqm: true },
  COMMERCIAL:{ floor: true,  total_floors: true,  bedrooms: false, bathrooms: false, year_built: true,  area_sqm: true },
  LAND:      { floor: false, total_floors: false, bedrooms: false, bathrooms: false, year_built: false, area_sqm: true },
  OFFICE:    { floor: true,  total_floors: true,  bedrooms: false, bathrooms: true,  year_built: true,  area_sqm: true },
};

const TYPE_LABEL = {
  SELL:      "Sell a property",
  RENT:      "Rent out a property",
  VALUATION: "Property valuation",
};

const SOURCE_LABEL = {
  WEBSITE:  "Website",
  PHONE:    "Phone",
  EMAIL:    "Email",
  REFERRAL: "Referral",
  SOCIAL:   "Social Media",
};

const fmtDate     = d => d ? new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }) : "—";
const fmtDateTime = d => d ? new Date(d).toLocaleString("en-GB", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" }) : "—";

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const Ico = (d, w=15, sw=1.8) => (
  <svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);
const PlusIcon       = () => Ico(<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>, 14, 2.2);
const HomeIcon       = () => Ico(<><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>, 14);
const TagIcon        = () => Ico(<><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></>, 14);
const KeyIcon        = () => Ico(<><circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2 10.58 12.42M13 7l3 3M18 2l3 3-6 6-3-3"/></>, 14);
const ChartIcon      = () => Ico(<><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>, 14);
const CalendarIcon   = () => Ico(<><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>, 13);
const UserIcon       = () => Ico(<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>, 13);
const PinIcon        = () => Ico(<><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></>, 12);
const AreaIcon       = () => Ico(<><path d="M3 3h7v7H3z"/><path d="M14 3h7v7h-7z"/><path d="M14 14h7v7h-7z"/><path d="M3 14h7v7H3z"/></>, 13);
const BedIcon        = () => Ico(<><path d="M2 4v16"/><path d="M22 8H2"/><path d="M22 20V8l-4-4H6L2 8"/><path d="M6 8v4"/><path d="M18 8v4"/></>, 13);
const ArrowRightIcon = () => Ico(<><path d="m9 18 6-6-6-6"/></>, 13, 2.2);
const ClockIcon      = () => Ico(<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>, 13);

const TYPE_ICON = {
  SELL:      <TagIcon />,
  RENT:      <KeyIcon />,
  VALUATION: <ChartIcon />,
};

// ─── Global CSS ───────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
  .cl * { box-sizing: border-box; }
  .cl { font-family: 'DM Sans', system-ui, sans-serif; background: #f2ede4; min-height: 100vh; }
  .cl-card { transition: transform 0.25s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.25s ease; }
  .cl-card:hover { transform: translateY(-4px); box-shadow: 0 20px 48px rgba(20,16,10,0.13) !important; }
  .cl-btn { transition: all 0.17s ease; }
  .cl-btn:hover:not(:disabled) { opacity: 0.86; transform: translateY(-1px); }
  .cl-in:focus { border-color: #8a7d5e !important; box-shadow: 0 0 0 3px rgba(138,125,94,0.13) !important; outline: none; }
  @keyframes cl-fade-up  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes cl-scale-in { from{opacity:0;transform:scale(0.95) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes cl-spin     { to{transform:rotate(360deg)} }
  @keyframes cl-toast    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes cl-card-in  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes cl-shimmer  { 0%{background-position:-800px 0} 100%{background-position:800px 0} }
`;

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position:"fixed", bottom:26, right:26, zIndex:9999,
      background:"#1a1714", color:type==="error"?"#e08080":"#80c0a0",
      padding:"11px 18px", borderRadius:12, fontSize:13,
      boxShadow:"0 10px 36px rgba(0,0,0,0.32)",
      border:`1px solid ${type==="error"?"rgba(224,128,128,0.15)":"rgba(128,192,160,0.15)"}`,
      maxWidth:320, fontFamily:"'DM Sans',sans-serif",
      animation:"cl-toast 0.2s ease", display:"flex", alignItems:"center", gap:8,
    }}>
      <span style={{ opacity:0.5, fontSize:11 }}>{type==="error" ? "✕" : "✓"}</span>
      {msg}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {Array.from({ length:3 }).map((_,i) => (
        <div key={i} style={{
          background:"linear-gradient(90deg,#ede9df 25%,#e4ddd0 50%,#ede9df 75%)",
          backgroundSize:"800px 100%", borderRadius:14, height:118,
          animation:"cl-shimmer 1.5s ease-in-out infinite",
        }}/>
      ))}
    </div>
  );
}

// ─── Shared field styles ──────────────────────────────────────────────────────
const INP_S = {
  width:"100%", padding:"10px 13px", border:"1.5px solid #e4ddd0",
  borderRadius:10, fontSize:13.5, color:"#1a1714",
  background:"#fff", fontFamily:"'DM Sans',sans-serif",
  boxSizing:"border-box", outline:"none", transition:"border-color 0.2s",
};
const SEL_S = { ...INP_S, cursor:"pointer" };
const LBL = {
  display:"block", fontSize:10.5, fontWeight:600, color:"#9a8c6e",
  textTransform:"uppercase", letterSpacing:"0.7px", marginBottom:6,
  fontFamily:"'DM Sans',sans-serif",
};

function Field({ label, children, required, hint }) {
  return (
    <div style={{ marginBottom:13 }}>
      <label style={LBL}>
        {label}{required && <span style={{ color:"#c0392b", marginLeft:2 }}>*</span>}
      </label>
      {children}
      {hint && <p style={{ fontSize:11.5, color:"#b0a890", marginTop:4 }}>{hint}</p>}
    </div>
  );
}

// ─── Modal wrapper ────────────────────────────────────────────────────────────
function ModalWrap({ children, onClose, maxW = 620 }) {
  useEffect(() => {
    const h = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position:"fixed", inset:0, zIndex:1000,
        background:"rgba(8,6,4,0.84)", backdropFilter:"blur(14px)",
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:20, fontFamily:"'DM Sans',sans-serif",
      }}>
      <div style={{
        width:"100%", maxWidth:maxW, background:"#faf7f2", borderRadius:18,
        boxShadow:"0 44px 100px rgba(0,0,0,0.55)", maxHeight:"92vh",
        overflowY:"auto", animation:"cl-scale-in 0.26s ease",
      }}>
        {children}
      </div>
    </div>
  );
}

function MH({ title, sub, onClose }) {
  return (
    <div style={{
      background:"linear-gradient(135deg,#141210 0%,#1e1a14 45%,#241e16 100%)",
      padding:"20px 26px", borderRadius:"18px 18px 0 0",
      display:"flex", alignItems:"center", justifyContent:"space-between",
      borderBottom:"1px solid rgba(201,184,122,0.14)",
      position:"relative", overflow:"hidden",
    }}>
      <div style={{
        position:"absolute", top:0, left:0, right:0, height:"2px",
        background:"linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)",
      }}/>
      <div>
        <p style={{
          fontFamily:"'Cormorant Garamond',Georgia,serif", fontWeight:700,
          fontSize:19, margin:"0 0 2px", color:"#f5f0e8", letterSpacing:"-0.2px",
        }}>{title}</p>
        {sub && <p style={{ fontSize:12, color:"rgba(245,240,232,0.38)", margin:0 }}>{sub}</p>}
      </div>
      <button onClick={onClose} style={{
        background:"rgba(245,240,232,0.07)", backdropFilter:"blur(8px)",
        border:"1px solid rgba(245,240,232,0.12)", borderRadius:9,
        width:32, height:32, cursor:"pointer", display:"flex",
        alignItems:"center", justifyContent:"center",
        color:"rgba(245,240,232,0.55)", fontSize:16,
      }}>×</button>
    </div>
  );
}

// ─── Property Fields ──────────────────────────────────────────────────────────
function PropertyFields({ form, setForm }) {
  const set = (k, v) => setForm(p => ({
    ...p,
    property_data: { ...p.property_data, [k]: v },
  }));

  const pd     = form.property_data || {};
  const isRent = form.type === "RENT";
  const fields = TYPE_FIELDS[pd.type || "APARTMENT"] || TYPE_FIELDS.APARTMENT;

  const accent = isRent ? "#7eb8a4" : "#c9b87a";
  const bg     = isRent ? "rgba(126,184,164,0.06)" : "rgba(201,184,122,0.06)";
  const border = isRent ? "rgba(126,184,164,0.18)" : "rgba(201,184,122,0.18)";

  // ── Auto-calculation ──────────────────────────────────────────────────────
  const handlePrice = val => {
    set("price", val);
    if (val && pd.area_sqm && Number(pd.area_sqm) > 0)
      set("price_per_sqm", (Number(val) / Number(pd.area_sqm)).toFixed(2));
  };

  const handleAreaSqm = val => {
    set("area_sqm", val);
    if (val && pd.price && Number(val) > 0)
      set("price_per_sqm", (Number(pd.price) / Number(val)).toFixed(2));
    else if (val && pd.price_per_sqm && Number(val) > 0)
      set("price", (Number(pd.price_per_sqm) * Number(val)).toFixed(2));
  };

  const handlePricePerSqm = val => {
    set("price_per_sqm", val);
    if (val && pd.area_sqm && Number(pd.area_sqm) > 0)
      set("price", (Number(val) * Number(pd.area_sqm)).toFixed(2));
  };

  // When property type changes — clear irrelevant fields
  const handleTypeChange = val => {
    const nf = TYPE_FIELDS[val] || TYPE_FIELDS.APARTMENT;
    set("type", val);
    if (!nf.floor)        set("floor", "");
    if (!nf.total_floors) set("total_floors", "");
    if (!nf.bedrooms)     set("bedrooms", "");
    if (!nf.bathrooms)    set("bathrooms", "");
    if (!nf.year_built)   set("year_built", "");
  };

  // Count visible columns for grid
  const roomCols   = [true, fields.bedrooms, fields.bathrooms].filter(Boolean).length;
  const floorCols  = [fields.floor, fields.total_floors, fields.year_built].filter(Boolean).length;
  const priceCols  = isRent ? 4 : 3;

  return (
    <div style={{
      marginTop:8, padding:"16px 14px", background:bg,
      borderRadius:12, border:`1.5px solid ${border}`, marginBottom:14,
    }}>
      <p style={{
        fontSize:10, fontWeight:700, color:accent,
        textTransform:"uppercase", letterSpacing:"1px",
        marginBottom:14, display:"flex", alignItems:"center", gap:6,
      }}>
        <HomeIcon /> Property details
        <span style={{ fontSize:10, fontWeight:400, color:"#b0a890", textTransform:"none", letterSpacing:0 }}>
          (agent will register in the system)
        </span>
      </p>

      {/* Title + Type */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <Field label="Property title" required>
          <input className="cl-in" style={INP_S}
            value={pd.title || ""}
            onChange={e => set("title", e.target.value)}
            placeholder="e.g. 2+1 Apartment Tirana" />
        </Field>
        <Field label="Property type" required>
          <select className="cl-in" style={SEL_S}
            value={pd.type || "APARTMENT"}
            onChange={e => handleTypeChange(e.target.value)}>
            {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
      </div>

      {/* Price block */}
      <div style={{
        background:"#fff", border:"1px solid #e8e2d6",
        borderRadius:10, padding:"12px 14px", marginBottom:12,
      }}>
        <p style={{
          fontSize:10, fontWeight:700, color:"#9a8c6e",
          textTransform:"uppercase", letterSpacing:"0.7px", margin:"0 0 10px",
        }}>
          💡 Fill any two price fields — the third calculates automatically
        </p>

        <div style={{ display:"grid", gridTemplateColumns:`repeat(${priceCols}, 1fr)`, gap:12 }}>
          <Field label={isRent ? "Rent price" : "Asking price"} required>
            <input className="cl-in" style={INP_S}
              type="number" min="0"
              value={pd.price || ""}
              onChange={e => handlePrice(e.target.value)}
              placeholder={isRent ? "500" : "120000"} />
          </Field>

          <Field label="Price per m²">
            <input className="cl-in" style={INP_S}
              type="number" min="0"
              value={pd.price_per_sqm || ""}
              onChange={e => handlePricePerSqm(e.target.value)}
              placeholder="1200" />
          </Field>

          <Field label="Currency">
            <select className="cl-in" style={SEL_S}
              value={pd.currency || "EUR"}
              onChange={e => set("currency", e.target.value)}>
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>

          {isRent && (
            <Field label="Period">
              <select className="cl-in" style={SEL_S}
                value={pd.price_period || "MONTHLY"}
                onChange={e => set("price_period", e.target.value)}>
                {PRICE_PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
          )}
        </div>

        {/* Auto-calc confirmation */}
        {pd.price && pd.area_sqm && pd.price_per_sqm && (
          <div style={{
            marginTop:8, padding:"6px 10px",
            background:"#f0fdf4", borderRadius:7,
            border:"1px solid #a7f3d0",
            fontSize:12, color:"#047857",
            display:"flex", gap:16, flexWrap:"wrap",
          }}>
            <span>Total: <strong>€{Number(pd.price).toLocaleString("de-DE")}</strong></span>
            <span>Per m²: <strong>€{Number(pd.price_per_sqm).toLocaleString("de-DE")}</strong></span>
            <span>Area: <strong>{pd.area_sqm} m²</strong></span>
          </div>
        )}
      </div>

      {/* Area + Bedrooms + Bathrooms */}
      <div style={{ display:"grid", gridTemplateColumns:`repeat(${roomCols}, 1fr)`, gap:12 }}>
        <Field label="Area (m²)">
          <input className="cl-in" style={INP_S}
            type="number" min="0"
            value={pd.area_sqm || ""}
            onChange={e => handleAreaSqm(e.target.value)}
            placeholder="85" />
        </Field>

        {fields.bedrooms && (
          <Field label="Bedrooms">
            <input className="cl-in" style={INP_S}
              type="number" min="0"
              value={pd.bedrooms || ""}
              onChange={e => set("bedrooms", e.target.value)}
              placeholder="2" />
          </Field>
        )}

        {fields.bathrooms && (
          <Field label="Bathrooms">
            <input className="cl-in" style={INP_S}
              type="number" min="0"
              value={pd.bathrooms || ""}
              onChange={e => set("bathrooms", e.target.value)}
              placeholder="1" />
          </Field>
        )}
      </div>

      {/* Floor + Total floors + Year built */}
      {floorCols > 0 && (
        <div style={{ display:"grid", gridTemplateColumns:`repeat(${floorCols}, 1fr)`, gap:12 }}>
          {fields.floor && (
            <Field label="Floor">
              <input className="cl-in" style={INP_S}
                type="number"
                value={pd.floor || ""}
                onChange={e => set("floor", e.target.value)}
                placeholder="3" />
            </Field>
          )}
          {fields.total_floors && (
            <Field label="Total floors">
              <input className="cl-in" style={INP_S}
                type="number" min="1"
                value={pd.total_floors || ""}
                onChange={e => set("total_floors", e.target.value)}
                placeholder="8" />
            </Field>
          )}
          {fields.year_built && (
            <Field label="Year built">
              <input className="cl-in" style={INP_S}
                type="number"
                min="1900" max={new Date().getFullYear()}
                value={pd.year_built || ""}
                onChange={e => set("year_built", e.target.value)}
                placeholder="2015" />
            </Field>
          )}
        </div>
      )}

      {/* City + Street */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <Field label="City" required>
          <input className="cl-in" style={INP_S}
            value={pd.city || ""}
            onChange={e => set("city", e.target.value)}
            placeholder="Tirana" />
        </Field>
        <Field label="Street / Area">
          <input className="cl-in" style={INP_S}
            value={pd.street || ""}
            onChange={e => set("street", e.target.value)}
            placeholder="Rr. e Durrësit" />
        </Field>
      </div>

      {/* Description */}
      <Field label="Description" hint="Condition, features, included appliances, etc.">
        <textarea className="cl-in"
          value={pd.description || ""}
          onChange={e => set("description", e.target.value)}
          rows={2}
          placeholder="Newly renovated, equipped kitchen, parking..."
          style={{ ...INP_S, resize:"vertical" }} />
      </Field>


    </div>
  );
}

// ─── Create Lead Modal ────────────────────────────────────────────────────────
function CreateLeadModal({ onClose, onSuccess, notify }) {
  const EMPTY_PD = {
    title:"", type:"APARTMENT", area_sqm:"", bedrooms:"",
    bathrooms:"", price:"", price_per_sqm:"", currency:"EUR",
    city:"", street:"", year_built:"", floor:"",
    total_floors:"", description:"", price_period:"MONTHLY",
  };

  const [form, setForm] = useState({
    type:           "SELL",
    message:        "",
    preferred_date: "",
    source:         "WEBSITE",
    property_data:  { ...EMPTY_PD },
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // VALUATION has no property data
  const handleTypeChange = t => {
    setForm(p => ({
      ...p,
      type:          t,
      property_data: t === "VALUATION" ? null : (p.property_data || { ...EMPTY_PD }),
    }));
  };

  // Build message string with property data embedded
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
      if (pd.price_period && form.type === "RENT")
                            parts.push(`Period: ${pd.price_period}`);
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
      if (!form.message?.trim()) {
        notify("Please describe the property you want valued", "error"); return;
      }
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
    SELL: {
      text:   "Have a property to sell? Fill in the details — your agent will register and list it.",
      accent: "#c9b87a", bg: "rgba(201,184,122,0.07)", border: "rgba(201,184,122,0.18)",
    },
    RENT: {
      text:   "Have a property to rent out? Provide the details — your agent will manage applications.",
      accent: "#7eb8a4", bg: "rgba(126,184,164,0.07)", border: "rgba(126,184,164,0.18)",
    },
    VALUATION: {
      text:   "Want a professional property valuation? Describe the property in your message.",
      accent: "#a4b07e", bg: "rgba(164,176,126,0.07)", border: "rgba(164,176,126,0.18)",
    },
  };
  const info = INFO[form.type] || INFO.SELL;

  return (
    <ModalWrap onClose={onClose} maxW={form.type !== "VALUATION" ? 700 : 520}>
      <MH title="New Request" sub="Tell us what you need" onClose={onClose} />
      <div style={{ padding:"22px 26px" }}>

        {/* Request type */}
        <Field label="Request type" required>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            {LEAD_TYPES.map(t => (
              <button key={t} onClick={() => handleTypeChange(t)}
                style={{
                  display:"flex", alignItems:"center", gap:7,
                  padding:"10px 18px", borderRadius:10,
                  border:`1.5px solid ${form.type===t ? "#8a7d5e" : "#e4ddd0"}`,
                  background:form.type===t ? "#1a1714" : "transparent",
                  color:form.type===t ? "#f5f0e8" : "#6b6248",
                  cursor:"pointer", fontSize:13,
                  fontWeight:form.type===t ? 600 : 400,
                  fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s",
                }}>
                <span style={{ opacity:form.type===t ? 1 : 0.5 }}>{TYPE_ICON[t]}</span>
                {TYPE_LABEL[t]}
              </button>
            ))}
          </div>
        </Field>

        {/* Info banner */}
        <div style={{
          background:info.bg, border:`1.5px solid ${info.border}`,
          borderRadius:10, padding:"10px 14px", marginBottom:16,
          fontSize:13, color:info.accent,
          display:"flex", alignItems:"flex-start", gap:8,
        }}>
          <span style={{ opacity:0.7, marginTop:1, flexShrink:0 }}><HomeIcon /></span>
          {info.text}
        </div>

        {/* Property fields — SELL and RENT only */}
        {form.type !== "VALUATION" && (
          <PropertyFields form={form} setForm={setForm} />
        )}

        {/* Preferred date */}
        <Field label={DATE_LABEL[form.type] || "Preferred date"}>
          <input className="cl-in" style={INP_S} type="date"
            value={form.preferred_date}
            onChange={e => set("preferred_date", e.target.value)}
            min={new Date().toISOString().split("T")[0]} />
        </Field>

        {/* Source */}
        <Field label="How did you find us?">
          <select className="cl-in" style={SEL_S}
            value={form.source}
            onChange={e => set("source", e.target.value)}>
            {LEAD_SOURCES.map(s => (
              <option key={s} value={s}>{SOURCE_LABEL[s]}</option>
            ))}
          </select>
        </Field>

        {/* Message */}
        <Field
          label={form.type === "VALUATION" ? "Describe the property" : "Additional notes"}
          required={form.type === "VALUATION"}>
          <textarea className="cl-in"
            value={form.message}
            onChange={e => set("message", e.target.value)}
            rows={3}
            placeholder={
              form.type === "VALUATION"
                ? "Describe the property you want valued..."
                : "Any other relevant details..."
            }
            style={{ ...INP_S, resize:"vertical" }} />
        </Field>

        {/* Actions */}
        <div style={{
          display:"flex", gap:9, justifyContent:"flex-end",
          borderTop:"1px solid #e8e2d6", paddingTop:18, marginTop:4,
        }}>
          <button onClick={onClose} className="cl-btn"
            style={{
              padding:"10px 18px", borderRadius:10,
              border:"1.5px solid #e4ddd0", background:"transparent",
              color:"#6b6248", fontWeight:500, fontSize:13,
              cursor:"pointer", fontFamily:"inherit",
            }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving} className="cl-btn"
            style={{
              padding:"10px 24px", borderRadius:10, border:"none",
              background:saving ? "#b0a890" : "linear-gradient(135deg,#c9b87a 0%,#b0983e 100%)",
              color:"#1a1714", fontSize:13, fontWeight:700,
              cursor:saving ? "not-allowed" : "pointer",
              fontFamily:"inherit", display:"flex", alignItems:"center", gap:7,
            }}>
            {saving
              ? <><div style={{ width:14, height:14, border:"2px solid rgba(26,23,20,0.25)", borderTop:"2px solid #1a1714", borderRadius:"50%", animation:"cl-spin 0.7s linear infinite" }}/> Submitting…</>
              : <><span style={{ fontSize:13 }}>✓</span> Submit Request</>
            }
          </button>
        </div>
      </div>
    </ModalWrap>
  );
}

// ─── Lead Detail Modal ────────────────────────────────────────────────────────
function LeadDetailModal({ lead, onClose }) {
  const parsePD = msg => {
    if (!msg) return null;
    try {
      const marker = "__PROPERTY_DATA__:";
      const idx    = msg.indexOf(marker);
      if (idx === -1) return null;
      return JSON.parse(msg.substring(idx + marker.length));
    } catch { return null; }
  };

  const cleanMsg = msg => {
    if (!msg) return "";
    const idx = msg.indexOf("\n--- Property Details ---");
    if (idx !== -1) return msg.substring(0, idx).trim();
    const idx2 = msg.indexOf("\n__PROPERTY_DATA__:");
    if (idx2 !== -1) return msg.substring(0, idx2).trim();
    return msg;
  };

  const pd = parsePD(lead.message);
  const s  = STATUS[lead.status] || STATUS.NEW;

  return (
    <ModalWrap onClose={onClose} maxW={580}>
      <MH
        title={TYPE_LABEL[lead.type] || lead.type}
        sub={`Request #${lead.id} · ${fmtDateTime(lead.created_at)}`}
        onClose={onClose}
      />
      <div style={{ padding:"22px 26px" }}>

        {/* Status banner */}
        <div style={{
          marginBottom:20, padding:"14px 16px", background:s.pill,
          borderRadius:12, border:`1.5px solid ${s.pillBorder}`,
          display:"flex", alignItems:"center", gap:14,
        }}>
          <div style={{
            width:38, height:38, borderRadius:10,
            background:`${s.strip}18`, border:`1.5px solid ${s.strip}35`,
            display:"flex", alignItems:"center", justifyContent:"center",
            color:s.strip, flexShrink:0,
          }}>
            {TYPE_ICON[lead.type] || <TagIcon />}
          </div>
          <div style={{ flex:1 }}>
            <p style={{
              fontSize:9.5, color:"#b0a890", fontWeight:600,
              textTransform:"uppercase", letterSpacing:"0.8px", margin:"0 0 5px",
            }}>Request status</p>
            <span style={{
              background:`${s.strip}16`, color:s.color,
              border:`1.5px solid ${s.strip}35`,
              padding:"3px 13px", borderRadius:999,
              fontSize:11, fontWeight:700,
              letterSpacing:"0.4px", textTransform:"uppercase",
            }}>{s.label}</span>
          </div>
          <p style={{
            fontSize:12.5, color:"#6b6248", lineHeight:1.65,
            maxWidth:220, margin:0,
            fontFamily:"'Cormorant Garamond',Georgia,serif", fontStyle:"italic",
          }}>
            {lead.status==="NEW"&&!lead.assigned_agent_id && "Your request has been received. An admin will assign an agent shortly."}
            {lead.status==="NEW"&&lead.assigned_agent_id  && "An agent is reviewing your request."}
            {lead.status==="IN_PROGRESS"                  && "Your agent is actively working on this. You will be contacted soon."}
            {lead.status==="DONE"                         && "Request completed successfully. Thank you!"}
            {lead.status==="REJECTED"                     && "This request could not be fulfilled. Feel free to submit a new one."}
          </p>
        </div>

        {/* Details grid */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:16 }}>
          {[
            { label:"Type",           value: TYPE_LABEL[lead.type] || lead.type },
            { label:"Source",         value: SOURCE_LABEL[lead.source] || lead.source },
            { label:"Preferred date", value: fmtDate(lead.preferred_date) },
            { label:"Assigned agent", value: lead.agent_name || (lead.assigned_agent_id ? `Agent #${lead.assigned_agent_id}` : "Not assigned yet") },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background:"#fff", borderRadius:11,
              padding:"11px 14px", border:"1.5px solid #e8e2d6",
            }}>
              <p style={{
                fontSize:9.5, color:"#b0a890", fontWeight:600,
                textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:5,
              }}>{label}</p>
              <p style={{
                fontSize:13.5, fontWeight:600, color:"#1a1714", margin:0,
                fontFamily:"'Cormorant Garamond',Georgia,serif",
              }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Property data */}
        {pd && (
          <div style={{
            background:"rgba(201,184,122,0.06)",
            border:"1.5px solid rgba(201,184,122,0.18)",
            borderRadius:12, padding:"14px 16px", marginBottom:14,
          }}>
            <p style={{
              fontSize:9.5, fontWeight:700, color:"#c9b87a",
              textTransform:"uppercase", letterSpacing:"0.8px",
              marginBottom:10, display:"flex", alignItems:"center", gap:5,
            }}>
              <HomeIcon /> Property details
            </p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {pd.title && (
                <div style={{
                  background:"#fff", borderRadius:8, padding:"8px 12px",
                  border:"1px solid #e8e2d6", gridColumn:"span 2",
                }}>
                  <p style={{ fontSize:10, color:"#b0a890", margin:"0 0 3px", textTransform:"uppercase", letterSpacing:"0.6px" }}>Title</p>
                  <p style={{ fontSize:14, fontWeight:600, margin:0, fontFamily:"'Cormorant Garamond',Georgia,serif", color:"#1a1714" }}>{pd.title}</p>
                </div>
              )}
              {[
                pd.type        && { icon:<TagIcon/>,      text: pd.type },
                pd.city        && { icon:<PinIcon/>,      text: pd.city },
                pd.area_sqm    && { icon:<AreaIcon/>,     text: `${pd.area_sqm} m²` },
                pd.bedrooms    && { icon:<BedIcon/>,      text: `${pd.bedrooms} bedrooms` },
                pd.bathrooms   && { icon:null,            text: `${pd.bathrooms} bathrooms` },
                pd.floor       && { icon:null,            text: `Floor ${pd.floor}${pd.total_floors ? ` / ${pd.total_floors}` : ""}` },
                pd.year_built  && { icon:<CalendarIcon/>, text: `Built: ${pd.year_built}` },
                pd.price       && {
                  icon: null,
                  text: `€${Number(pd.price).toLocaleString("de-DE")} ${pd.currency}${  lead.type === "RENT" && pd.price_period ? ` / ${pd.price_period}` : ""}`,
                  bold: true,
                },
                pd.price_per_sqm && {
                  icon: null,
                  text: `€${Number(pd.price_per_sqm).toLocaleString("de-DE")} / m²`,
                },
              ].filter(Boolean).map((item, i) => (
                <span key={i} style={{
                  fontSize:13, color:"#4a4438",
                  display:"flex", alignItems:"center", gap:5,
                  padding:"6px 10px", background:"#fff",
                  borderRadius:8, border:"1px solid #e8e2d6",
                  fontWeight: item.bold ? 600 : 400,
                }}>
                  {item.icon} {item.text}
                </span>
              ))}
            </div>
            {pd.description && (
              <div style={{
                marginTop:8, padding:"8px 12px",
                background:"#fff", borderRadius:8, border:"1px solid #e8e2d6",
              }}>
                <p style={{ fontSize:10, color:"#b0a890", margin:"0 0 3px", textTransform:"uppercase", letterSpacing:"0.6px" }}>Notes</p>
                <p style={{ fontSize:13, color:"#4a4438", margin:0, lineHeight:1.6 }}>{pd.description}</p>
              </div>
            )}
          </div>
        )}

        {/* Message */}
        {lead.message && cleanMsg(lead.message) && (
          <div style={{
            background:"#fff", border:"1.5px solid #e8e2d6",
            borderRadius:12, padding:"14px 16px",
          }}>
            <p style={{
              fontSize:9.5, color:"#b0a890", fontWeight:600,
              textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:8,
            }}>Your message</p>
            <p style={{
              fontSize:14.5, color:"#3c3830", lineHeight:1.85,
              fontStyle:"italic", margin:0,
              fontFamily:"'Cormorant Garamond',Georgia,serif",
            }}>"{cleanMsg(lead.message)}"</p>
          </div>
        )}

        <div style={{
          borderTop:"1px solid #e8e2d6", paddingTop:16,
          marginTop:18, display:"flex", justifyContent:"flex-end",
        }}>
          <button onClick={onClose} className="cl-btn"
            style={{
              padding:"10px 22px", borderRadius:10,
              border:"1.5px solid #e4ddd0", background:"transparent",
              color:"#6b6248", fontSize:13.5, fontWeight:500,
              cursor:"pointer", fontFamily:"inherit",
            }}>
            Close
          </button>
        </div>
      </div>
    </ModalWrap>
  );
}

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS = {
  NEW:         { strip:"#c9b87a", pill:"rgba(201,184,122,0.12)", pillBorder:"rgba(201,184,122,0.28)", color:"#a8923e", label:"New"         },
  IN_PROGRESS: { strip:"#7eb8a4", pill:"rgba(126,184,164,0.12)", pillBorder:"rgba(126,184,164,0.28)", color:"#2a8068", label:"In Progress" },
  DONE:        { strip:"#a4b07e", pill:"rgba(164,176,126,0.12)", pillBorder:"rgba(164,176,126,0.28)", color:"#5a6a38", label:"Done"        },
  REJECTED:    { strip:"#c07050", pill:"rgba(192,112,80,0.12)",  pillBorder:"rgba(192,112,80,0.28)",  color:"#8b4030", label:"Rejected"    },
};

// ─── Lead Card ────────────────────────────────────────────────────────────────
function LeadCard({ lead, onClick, idx }) {
  const parsePD = msg => {
    if (!msg) return null;
    try {
      const marker = "__PROPERTY_DATA__:";
      const idx    = msg.indexOf(marker);
      if (idx === -1) return null;
      return JSON.parse(msg.substring(idx + marker.length));
    } catch { return null; }
  };

  const pd = parsePD(lead.message);
  const s  = STATUS[lead.status] || STATUS.NEW;

  return (
    <div className="cl-card" onClick={onClick}
      style={{
        background:"#fff", borderRadius:14, overflow:"hidden",
        boxShadow:"0 2px 14px rgba(20,16,10,0.08)",
        border:"1.5px solid #ece6da", cursor:"pointer", display:"flex",
        animation:`cl-card-in 0.38s ease ${Math.min(idx*0.06,0.4)}s both`,
      }}>

      {/* Left accent strip */}
      <div style={{ width:4, background:`linear-gradient(to bottom,${s.strip},${s.strip}66)`, flexShrink:0 }}/>

      {/* Icon column */}
      <div style={{
        width:60, flexShrink:0,
        display:"flex", flexDirection:"column", alignItems:"center",
        justifyContent:"center", gap:7, padding:"14px 8px",
        background:`${s.strip}07`, borderRight:"1.5px solid #f0ece3",
      }}>
        <div style={{
          color:s.strip, width:28, height:28, borderRadius:8,
          background:`${s.strip}12`, border:`1.5px solid ${s.strip}28`,
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          {TYPE_ICON[lead.type] || <TagIcon />}
        </div>
        <span style={{
          fontSize:8.5, fontWeight:700, color:s.color,
          textTransform:"uppercase", letterSpacing:"0.5px",
          textAlign:"center", lineHeight:1.3,
          background:`${s.strip}12`, padding:"2px 6px",
          borderRadius:5, border:`1px solid ${s.strip}25`,
        }}>
          {s.label}
        </span>
      </div>

      {/* Main content */}
      <div style={{
        flex:1, padding:"13px 18px",
        display:"flex", flexDirection:"column", justifyContent:"space-between", minWidth:0,
      }}>
        <div>
          <div style={{
            display:"flex", justifyContent:"space-between",
            alignItems:"flex-start", gap:12, marginBottom:5,
          }}>
            <div style={{ minWidth:0 }}>
              <h3 style={{
                margin:"0 0 3px", fontSize:15.5, fontWeight:700,
                color:"#1a1714", fontFamily:"'Cormorant Garamond',Georgia,serif",
                letterSpacing:"-0.1px", lineHeight:1.2,
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
              }}>
                {TYPE_LABEL[lead.type] || lead.type}
                {pd?.title && (
                  <span style={{ fontWeight:400, color:"#9a8c6e", fontSize:13.5 }}>
                    {" "}— {pd.title}
                  </span>
                )}
              </h3>
              <p style={{
                fontSize:11.5, color:"#b0a890", margin:0,
                display:"flex", alignItems:"center", gap:8, flexWrap:"wrap",
              }}>
                <span>#{lead.id}</span>
                <span style={{ display:"flex", alignItems:"center", gap:3 }}>
                  <ClockIcon />{fmtDate(lead.created_at)}
                </span>
                {pd?.city && (
                  <span style={{ display:"flex", alignItems:"center", gap:3 }}>
                    <PinIcon />{pd.city}
                  </span>
                )}
              </p>
            </div>

            {pd?.price && (
              <div style={{ flexShrink:0, textAlign:"right" }}>
                <div style={{
                  fontSize:17, fontWeight:700, color:"#1a1714",
                  fontFamily:"'Cormorant Garamond',Georgia,serif", letterSpacing:"-0.3px",
                }}>
                  €{Number(pd.price).toLocaleString("de-DE")}
                  {pd.price_period && lead.type === "RENT" && (
                    <span style={{ fontSize:11, fontWeight:400, color:"#9a8c6e" }}>
                      /{pd.price_period}
                    </span>
                  )}
                </div>
                {pd.price_per_sqm && (
                  <div style={{ fontSize:11, color:"#9a8c6e" }}>
                    €{Number(pd.price_per_sqm).toLocaleString("de-DE")}/m²
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display:"flex", gap:14, paddingTop:9,
          borderTop:"1px solid #f0ece3", flexWrap:"wrap", alignItems:"center",
        }}>
          {pd?.area_sqm && (
            <span style={{ fontSize:12, color:"#9a8c6e", display:"flex", alignItems:"center", gap:4 }}>
              <AreaIcon />{pd.area_sqm} m²
            </span>
          )}
          {pd?.bedrooms && (
            <span style={{ fontSize:12, color:"#9a8c6e", display:"flex", alignItems:"center", gap:4 }}>
              <BedIcon />{pd.bedrooms} beds
            </span>
          )}
          {lead.preferred_date && (
            <span style={{ fontSize:12, color:"#9a8c6e", display:"flex", alignItems:"center", gap:4 }}>
              <CalendarIcon />{fmtDate(lead.preferred_date)}
            </span>
          )}
          <span style={{ fontSize:12, color:"#9a8c6e", display:"flex", alignItems:"center", gap:4 }}>
            <UserIcon />
            {lead.agent_name || (lead.assigned_agent_id ? `Agent #${lead.assigned_agent_id}` : "Not assigned yet")}
          </span>
          <span style={{
            marginLeft:"auto", fontSize:11.5, color:"#c9b87a",
            fontWeight:600, display:"flex", alignItems:"center", gap:4,
          }}>
            View details <ArrowRightIcon />
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
const PGB = (active, disabled) => ({
  padding:"7px 13px", borderRadius:9,
  border:`1.5px solid ${active ? "#1a1714" : "#e4ddd0"}`,
  background:active ? "#1a1714" : "transparent",
  color:active ? "#f5f0e8" : disabled ? "#d4ccbe" : "#6b6248",
  cursor:disabled ? "not-allowed" : "pointer",
  fontSize:13, fontWeight:active ? 600 : 400,
  fontFamily:"'DM Sans',sans-serif",
  opacity:disabled ? 0.5 : 1, transition:"all 0.14s",
});

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages   = Array.from({ length:totalPages }, (_, i) => i);
  const visible = pages.filter(p => p===0 || p===totalPages-1 || Math.abs(p-page)<=1);
  return (
    <div style={{ display:"flex", justifyContent:"center", gap:4, marginTop:44, flexWrap:"wrap" }}>
      <button disabled={page===0} onClick={() => onChange(page-1)} style={PGB(false,page===0)}>‹</button>
      {visible.map((p, i) => {
        const gap = visible[i-1] != null && p - visible[i-1] > 1;
        return (
          <span key={p} style={{ display:"flex", gap:4 }}>
            {gap && <span style={{ padding:"7px 4px", color:"#b0a890", fontSize:13 }}>…</span>}
            <button onClick={() => onChange(p)} style={PGB(p===page, false)}>{p+1}</button>
          </span>
        );
      })}
      <button disabled={page===totalPages-1} onClick={() => onChange(page+1)} style={PGB(false,page===totalPages-1)}>›</button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ClientLeads() {
  const { user }                               = useContext(AuthContext);
  const [leads,        setLeads]               = useState([]);
  const [loading,      setLoading]             = useState(true);
  const [page,         setPage]                = useState(0);
  const [totalPages,   setTotalPages]          = useState(0);
  const [createOpen,   setCreateOpen]          = useState(false);
  const [selectedLead, setSelectedLead]        = useState(null);
  const [toast,        setToast]               = useState(null);

  const notify = useCallback((msg, type="success") =>
    setToast({ msg, type, key:Date.now() }), []);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/leads/my/client?page=${page}&size=10`);
      setLeads(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch { notify("Error loading requests", "error"); }
    finally  { setLoading(false); }
  }, [page, notify]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const stats = {
    total:    leads.length,
    active:   leads.filter(l => l.status==="NEW" || l.status==="IN_PROGRESS").length,
    done:     leads.filter(l => l.status==="DONE").length,
    rejected: leads.filter(l => l.status==="REJECTED").length,
  };

  return (
    <MainLayout role="client">
      <style>{CSS}</style>
      <div className="cl">

        {/* Hero */}
        <div style={{
          background:"linear-gradient(160deg,#141210 0%,#1e1a14 45%,#241e16 100%)",
          padding:"36px 32px 30px", position:"relative", overflow:"hidden",
        }}>
          <div style={{
            position:"absolute", inset:0,
            backgroundImage:"radial-gradient(rgba(255,255,255,0.018) 1px,transparent 1px)",
            backgroundSize:"22px 22px", pointerEvents:"none",
          }}/>
          <div style={{
            position:"absolute", top:0, left:0, right:0, height:"2px",
            background:"linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)",
          }}/>

          <div style={{ position:"relative", zIndex:1, maxWidth:700, margin:"0 auto", textAlign:"center" }}>
            <h1 style={{
              margin:"0 0 10px",
              fontFamily:"'Cormorant Garamond',Georgia,serif",
              fontSize:"clamp(28px,4vw,44px)", fontWeight:700,
              color:"#f5f0e8", letterSpacing:"-0.7px", lineHeight:1.1,
            }}>
              My{" "}
              <span style={{
                background:"linear-gradient(90deg,#c9b87a,#e8d9a0,#c9b87a)",
                backgroundSize:"200% auto",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
              }}>Requests</span>
            </h1>
            <p style={{
              margin:"0 auto 22px", fontSize:13.5,
              color:"rgba(245,240,232,0.38)", lineHeight:1.6,
            }}>
              Track and manage your property requests
            </p>

            <button onClick={() => setCreateOpen(true)} className="cl-btn"
              style={{
                display:"inline-flex", alignItems:"center", gap:8,
                background:"linear-gradient(135deg,#c9b87a 0%,#b0983e 100%)",
                color:"#1a1714", border:"none", borderRadius:11,
                padding:"11px 24px", fontSize:13.5, fontWeight:700,
                cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
                boxShadow:"0 6px 22px rgba(201,184,122,0.25)",
              }}>
              <PlusIcon /> New Request
            </button>

            {!loading && leads.length > 0 && (
              <div style={{
                display:"flex", gap:8, maxWidth:480,
                margin:"20px auto 0", justifyContent:"center", flexWrap:"wrap",
              }}>
                {[
                  { label:"Total",    value:stats.total,    dot:"#c9b87a" },
                  { label:"Active",   value:stats.active,   dot:"#e2c97e" },
                  { label:"Done",     value:stats.done,     dot:"#7eb8a4" },
                  { label:"Rejected", value:stats.rejected, dot:"#c07050" },
                ].map(stat => (
                  <div key={stat.label} style={{
                    background:"rgba(245,240,232,0.06)", backdropFilter:"blur(10px)",
                    borderRadius:11, padding:"9px 16px",
                    border:"1px solid rgba(245,240,232,0.09)",
                    display:"flex", flexDirection:"column", alignItems:"center", gap:2,
                  }}>
                    <span style={{
                      fontSize:22, fontWeight:700, color:stat.dot, lineHeight:1,
                      fontFamily:"'Cormorant Garamond',Georgia,serif",
                    }}>{stat.value}</span>
                    <span style={{
                      fontSize:9.5, color:"rgba(245,240,232,0.3)", fontWeight:600,
                      textTransform:"uppercase", letterSpacing:"0.8px",
                    }}>{stat.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div style={{
          background:"#fff", borderBottom:"1.5px solid #e8e2d6",
          padding:"0 28px", height:46,
          display:"flex", alignItems:"center", justifyContent:"space-between",
          gap:12, position:"sticky", top:0, zIndex:100,
          boxShadow:"0 1px 10px rgba(20,16,10,0.05)",
        }}>
          <p style={{ margin:0, fontSize:12.5, color:"#9a8c6e" }}>
            {loading ? "Loading…" : `${leads.length} request${leads.length!==1?"s":""}`}
          </p>
          <button onClick={() => setCreateOpen(true)} className="cl-btn"
            style={{
              padding:"5px 14px", borderRadius:9,
              background:"linear-gradient(135deg,#c9b87a,#b0983e)",
              color:"#1a1714", border:"none", fontSize:12, fontWeight:700,
              cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
              display:"flex", alignItems:"center", gap:5,
            }}>
            <PlusIcon /> New Request
          </button>
        </div>

        {/* Content */}
        <div style={{ padding:"20px 24px", maxWidth:1440, margin:"0 auto" }}>
          {loading && <Skeleton />}

          {!loading && leads.length === 0 && (
            <div style={{
              textAlign:"center", padding:"80px 32px",
              color:"#9a8c6e", fontFamily:"'DM Sans',sans-serif",
            }}>
              <div style={{
                width:52, height:52, borderRadius:"50%",
                background:"#f0ece3", border:"1.5px solid #e4ddd0",
                display:"flex", alignItems:"center", justifyContent:"center",
                margin:"0 auto 18px", color:"#b0a890",
              }}>
                <ChartIcon />
              </div>
              <p style={{
                fontSize:18, fontWeight:700, color:"#4a4438", marginBottom:6,
                fontFamily:"'Cormorant Garamond',Georgia,serif", letterSpacing:"-0.2px",
              }}>No requests yet</p>
              <p style={{ fontSize:13, marginBottom:24, color:"#9a8c6e" }}>
                Submit your first request — an agent will get back to you.
              </p>
              <button onClick={() => setCreateOpen(true)} className="cl-btn"
                style={{
                  padding:"11px 28px",
                  background:"linear-gradient(135deg,#c9b87a,#b0983e)",
                  color:"#1a1714", border:"none", borderRadius:11,
                  fontSize:13.5, fontWeight:700, cursor:"pointer",
                  fontFamily:"inherit", display:"inline-flex", alignItems:"center", gap:8,
                }}>
                <PlusIcon /> New Request
              </button>
            </div>
          )}

          {!loading && leads.length > 0 && (
            <>
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {leads.map((lead, i) => (
                  <LeadCard key={lead.id} lead={lead} idx={i}
                    onClick={() => setSelectedLead(lead)} />
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
          onSuccess={() => {
            setCreateOpen(false);
            fetchLeads();
            notify("Request submitted. Your agent will contact you shortly. ✓");
          }}
          notify={notify}
        />
      )}
      {selectedLead && (
        <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
      )}
      {toast && (
        <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />
      )}
    </MainLayout>
  );
}