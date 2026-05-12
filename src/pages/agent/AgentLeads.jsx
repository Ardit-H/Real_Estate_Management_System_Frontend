import { useState, useEffect, useCallback, useContext } from "react";
import MainLayout from "../../components/layout/Layout";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";
 
// ── Constants & helpers (identike me origjinalin) ─────────────────────────────
const LEAD_STATUSES = ["NEW", "IN_PROGRESS", "DONE", "REJECTED"];
const PROP_MARKER   = "__PROPERTY_DATA__:";
 
const TYPE_ICON   = { SELL:"🏷️", BUY:"🏠", RENT:"🔑", RENT_SEEKING:"🔎", VALUATION:"📊" };
const SOURCE_ICON = { WEBSITE:"🌐", PHONE:"📞", EMAIL:"✉️", REFERRAL:"👥", SOCIAL:"📱" };
 
const fmtDate     = (d) => d ? new Date(d).toLocaleDateString("sq-AL") : "—";
const fmtDateTime = (d) => d ? new Date(d).toLocaleString("sq-AL", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" }) : "—";
 
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
 
// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
  .al * { box-sizing: border-box; }
  .al { font-family: 'DM Sans', system-ui, sans-serif; background: #f2ede4; min-height: 100vh; }
  .al-btn { transition: all 0.17s ease; }
  .al-btn:hover:not(:disabled) { opacity: 0.86; transform: translateY(-1px); }
  .al-in:focus { border-color: #8a7d5e !important; box-shadow: 0 0 0 3px rgba(138,125,94,0.13) !important; outline: none; }
  @keyframes al-scale-in { from{opacity:0;transform:scale(0.95) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes al-spin     { to{transform:rotate(360deg)} }
  @keyframes al-toast    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes al-glow     { 0%,100%{opacity:0.07} 50%{opacity:0.14} }
`;
 
// Status config
const STATUS_CFG = {
  NEW:         { strip:"#c9b87a", pill:"rgba(201,184,122,0.10)", pillBorder:"rgba(201,184,122,0.25)", color:"#a8923e", label:"New"         },
  IN_PROGRESS: { strip:"#7eb8a4", pill:"rgba(126,184,164,0.10)", pillBorder:"rgba(126,184,164,0.25)", color:"#2a6049", label:"In Progress" },
  DONE:        { strip:"#a4b07e", pill:"rgba(164,176,126,0.10)", pillBorder:"rgba(164,176,126,0.25)", color:"#5a6a38", label:"Done"        },
  REJECTED:    { strip:"#c07050", pill:"rgba(192,112,80,0.10)",  pillBorder:"rgba(192,112,80,0.25)",  color:"#8b4030", label:"Rejected"    },
  DECLINED:    { strip:"#c07050", pill:"rgba(192,112,80,0.08)",  pillBorder:"rgba(192,112,80,0.20)",  color:"#8b4030", label:"Declined"    },
};
 
// Shared style objects
const INP_S = { width:"100%", padding:"10px 13px", border:"1.5px solid #e4ddd0", borderRadius:10, fontSize:13.5, color:"#1a1714", background:"#fff", fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box", outline:"none", transition:"border-color 0.2s" };
const SEL_S = { ...INP_S, cursor:"pointer" };
const BTN_PRI = { padding:"10px 22px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#c9b87a,#b0983e)", color:"#1a1714", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" };
const BTN_SEC = { padding:"10px 18px", borderRadius:10, border:"1.5px solid #e4ddd0", background:"transparent", color:"#6b6248", fontWeight:500, fontSize:13, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" };
 
// ── StatusBadge ───────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const s = STATUS_CFG[status] || { pill:"#f0ece3", pillBorder:"#e0d8c8", color:"#6b6248", label:status, strip:"#a0997e" };
  return (
    <span style={{ background:s.pill, color:s.color, border:`1.5px solid ${s.pillBorder}`, padding:"3px 11px", borderRadius:999, fontSize:10.5, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.3px", display:"inline-flex", alignItems:"center", gap:5 }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:s.strip, display:"inline-block" }} />
      {s.label}
    </span>
  );
}
 
// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position:"fixed", bottom:26, right:26, zIndex:9999, background:"#1a1714", color:type==="error" ? "#f09090" : "#90c8a8", padding:"11px 18px", borderRadius:12, fontSize:13, boxShadow:"0 10px 36px rgba(0,0,0,0.32)", border:`1px solid ${type==="error" ? "rgba(240,128,128,0.15)" : "rgba(144,200,168,0.15)"}`, maxWidth:320, fontFamily:"'DM Sans',sans-serif", animation:"al-toast 0.2s ease", display:"flex", alignItems:"center", gap:8 }}>
      <span style={{ fontSize:14 }}>{type === "error" ? "⚠️" : "✅"}</span>
      {msg}
    </div>
  );
}
 
// ── Loader ────────────────────────────────────────────────────────────────────
function Loader() {
  return (
    <div style={{ textAlign:"center", padding:"60px 0" }}>
      <div style={{ width:28, height:28, margin:"0 auto", border:"2px solid #e8e2d6", borderTop:"2px solid #c9b87a", borderRadius:"50%", animation:"al-spin 0.8s linear infinite" }} />
    </div>
  );
}
 
// ── EmptyState ────────────────────────────────────────────────────────────────
function EmptyState({ icon, text, subtext }) {
  return (
    <div style={{ textAlign:"center", padding:"60px 20px", color:"#b0a890", fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ fontSize:40, marginBottom:12 }}>{icon}</div>
      <p style={{ fontSize:15, fontWeight:500, color:"#6b6248", marginBottom:4, fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{text}</p>
      {subtext && <p style={{ fontSize:13, color:"#b0a890" }}>{subtext}</p>}
    </div>
  );
}
 
// ── Pagination ────────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6, justifyContent:"flex-end", padding:"14px 16px" }}>
      <button disabled={page === 0} onClick={() => onChange(page - 1)} style={{ ...BTN_SEC, padding:"6px 14px", fontSize:12.5, opacity:page===0 ? 0.4 : 1 }}>← Prev</button>
      <span style={{ fontSize:13, color:"#9a8c6e", padding:"0 8px" }}>{page + 1} / {totalPages}</span>
      <button disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)} style={{ ...BTN_SEC, padding:"6px 14px", fontSize:12.5, opacity:page>=totalPages-1 ? 0.4 : 1 }}>Next →</button>
    </div>
  );
}
 
// ── Modal wrapper ─────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [onClose]);
 
  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()} style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(8,6,4,0.84)", backdropFilter:"blur(14px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ width:"100%", maxWidth:wide ? 640 : 520, background:"#faf7f2", borderRadius:18, boxShadow:"0 44px 100px rgba(0,0,0,0.55)", maxHeight:"92vh", overflowY:"auto", animation:"al-scale-in 0.26s ease" }}>
        <div style={{ background:"linear-gradient(160deg,#141210 0%,#1e1a14 45%,#241e16 100%)", padding:"18px 24px", borderBottom:"1px solid rgba(201,184,122,0.14)", display:"flex", alignItems:"center", justifyContent:"space-between", position:"relative", borderRadius:"18px 18px 0 0" }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:"linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)" }} />
          <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontWeight:700, fontSize:17, color:"#f5f0e8" }}>{title}</span>
          <button onClick={onClose} style={{ background:"rgba(245,240,232,0.08)", border:"1px solid rgba(245,240,232,0.12)", borderRadius:8, width:30, height:30, cursor:"pointer", color:"rgba(245,240,232,0.6)", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        </div>
        <div style={{ padding:"22px 24px" }}>{children}</div>
      </div>
    </div>
  );
}
 
// ── CompleteModal (logjika identike) ──────────────────────────────────────────
function CompleteModal({ lead, onConfirm, onClose, loading }) {
  const propertyData    = parsePropertyData(lead.message);
  const hasPropertyData = !!propertyData && (lead.type === "SELL" || lead.type === "RENT");
  const [createProperty, setCreateProperty] = useState(hasPropertyData);
 
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
 
  return (
    <Modal title={`✓ Konfirmo Complete — Lead #${lead.id}`} onClose={onClose}>
      {hasPropertyData ? (
        <>
          <p style={{ fontSize:13.5, color:"#6b6248", marginBottom:14, lineHeight:1.6 }}>
            Ky lead <strong style={{ color:"#1a1714" }}>{TYPE_ICON[lead.type]} {lead.type}</strong> ka të dhëna prone. Dëshironi t'i shtoni automatikisht si pronë të re në sistem?
          </p>
          <div style={{ background:"rgba(126,184,164,0.08)", border:"1.5px solid rgba(126,184,164,0.22)", borderRadius:10, padding:"12px 16px", marginBottom:16 }}>
            <p style={{ fontSize:10, fontWeight:700, color:"#2a6049", textTransform:"uppercase", letterSpacing:"1px", marginBottom:8 }}>🏠 Prona që do të krijohet</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
              {propertyData.title         && <span style={{ fontSize:13, color:"#4a4438" }}>📌 {propertyData.title}</span>}
              {propertyData.city          && <span style={{ fontSize:13, color:"#4a4438" }}>📍 {propertyData.city}</span>}
              {propertyData.property_type && <span style={{ fontSize:13, color:"#4a4438" }}>🏗 {propertyData.property_type}</span>}
              {propertyData.area_sqm      && <span style={{ fontSize:13, color:"#4a4438" }}>📐 {propertyData.area_sqm} m²</span>}
              {propertyData.bedrooms      && <span style={{ fontSize:13, color:"#4a4438" }}>🛏 {propertyData.bedrooms} dhoma</span>}
              {propertyData.price         && <span style={{ fontSize:13, color:"#1a1714", fontWeight:600 }}>💰 {Number(propertyData.price).toLocaleString("de-DE")} {propertyData.currency}</span>}
              {propertyData.total_floors  && <span style={{ fontSize:13, color:"#4a4438" }}>🏢 {propertyData.total_floors} kate</span>}
              {propertyData.price_per_sqm && <span style={{ fontSize:13, color:"#4a4438" }}>📊 €{Number(propertyData.price_per_sqm).toLocaleString("de-DE")}/m²</span>}
            </div>
          </div>
          <div onClick={() => setCreateProperty((p) => !p)} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20, padding:"10px 14px", background:"#f8f5f0", borderRadius:9, cursor:"pointer", border:"1.5px solid #e8e2d6" }}>
            <div style={{ width:20, height:20, borderRadius:5, background:createProperty ? "#2a6049" : "#e4ddd0", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"background .15s" }}>
              {createProperty && <span style={{ color:"white", fontSize:12 }}>✓</span>}
            </div>
            <span style={{ fontSize:13.5, color:"#4a4438" }}>Krijo pronën automatikisht në sistem pas Complete</span>
          </div>
        </>
      ) : (
        <p style={{ fontSize:13.5, color:"#6b6248", marginBottom:20, lineHeight:1.6 }}>
          A jeni i sigurt që dëshironi ta markoni si <strong style={{ color:"#1a1714" }}>DONE</strong> lead-in #{lead.id}? Ky veprim është final dhe nuk mund të ndryshohet.
        </p>
      )}
      <div style={{ display:"flex", gap:9, justifyContent:"flex-end" }}>
        <button style={BTN_SEC} onClick={onClose} disabled={loading}>Anulo</button>
        <button style={{ ...BTN_PRI, background:loading ? "#b0a890" : undefined }} disabled={loading} onClick={() => onConfirm(lead, createProperty && hasPropertyData, propertyData)}>
          {loading ? "Duke procesuar..." : "✓ Complete"}
        </button>
      </div>
    </Modal>
  );
}
 
// ── StatusActions (logjika identike) ──────────────────────────────────────────
function StatusActions({ lead, onStatusChange, onDecline, onCompleteClick, loading, isMyLead }) {
  const { status } = lead;
 
  if (status === "DONE" || status === "REJECTED") {
    return <span style={{ fontSize:12, color:"#b0a890", fontStyle:"italic" }}>Final</span>;
  }
 
  if (!isMyLead) {
    if (status === "NEW" && !lead.assigned_agent_id) return <span style={{ fontSize:11.5, color:"#a8923e", background:"rgba(201,184,122,0.10)", padding:"3px 10px", borderRadius:999 }}>🕐 Pa asignuar</span>;
    if (status === "NEW" && lead.assigned_agent_id)  return <span style={{ fontSize:11.5, color:"#a8923e", background:"rgba(201,184,122,0.10)", padding:"3px 10px", borderRadius:999 }}>⏳ Pret pranimin</span>;
    return <span style={{ fontSize:11.5, color:"#b0a890", background:"#f0ece3", padding:"3px 10px", borderRadius:999, fontStyle:"italic" }}>Shiko vetëm</span>;
  }
 
  if (status === "NEW") {
    return (
      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
        <button className="al-btn" onClick={() => onStatusChange(lead.id, "IN_PROGRESS")} disabled={loading} style={{ ...BTN_PRI, padding:"6px 14px", fontSize:12 }}>▶ Accept</button>
        <button className="al-btn" onClick={() => onDecline(lead.id)} disabled={loading} style={{ padding:"6px 14px", borderRadius:9, border:"1.5px solid rgba(192,112,80,0.30)", background:"rgba(192,112,80,0.08)", color:"#8b4030", fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>↩ Decline</button>
      </div>
    );
  }
 
  if (status === "IN_PROGRESS") {
    const hasPropertyData = !!parsePropertyData(lead.message) && (lead.type === "SELL" || lead.type === "RENT");
    return (
      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
        <button className="al-btn" onClick={() => onCompleteClick(lead)} disabled={loading}
          style={{ padding:"6px 14px", borderRadius:9, border:`1.5px solid ${hasPropertyData ? "rgba(126,184,164,0.30)" : "rgba(164,176,126,0.30)"}`, background:hasPropertyData ? "rgba(126,184,164,0.10)" : "rgba(164,176,126,0.10)", color:hasPropertyData ? "#2a6049" : "#5a6a38", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}
          title={hasPropertyData ? "Complete + Krijo pronën automatikisht" : "Marko si të kryer"}>
          ✓ Complete{hasPropertyData ? " 🏠" : ""}
        </button>
        <button className="al-btn" onClick={() => onStatusChange(lead.id, "REJECTED")} disabled={loading} style={{ padding:"6px 14px", borderRadius:9, border:"1.5px solid rgba(192,112,80,0.30)", background:"rgba(192,112,80,0.08)", color:"#8b4030", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>✕ Reject</button>
      </div>
    );
  }
 
  return null;
}
 
// ── LeadDetailModal (logjika identike) ────────────────────────────────────────
function LeadDetailModal({ lead, onClose, onStatusChange, onDecline, onCompleteClick, statusLoading, isMyLead }) {
  const { user }     = useContext(AuthContext);
  const propertyData = parsePropertyData(lead.message);
  const s            = STATUS_CFG[lead.status] || STATUS_CFG.NEW;
 
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
 
  return (
    <Modal title={`Lead #${lead.id} — ${lead.type}`} onClose={onClose} wide>
      {!isMyLead && (
        <div style={{ background:"rgba(201,184,122,0.06)", border:"1.5px solid rgba(201,184,122,0.18)", borderRadius:10, padding:"10px 14px", marginBottom:16, fontSize:13, color:"#a8923e", display:"flex", alignItems:"center", gap:8 }}>
          ℹ️{" "}
          {!lead.assigned_agent_id ? "Ky lead nuk i është asignuar ende asnjë agjenti." : lead.assigned_agent_id === user?.id ? "Ky lead ju është asignuar juve." : `Ky lead i është asignuar agjentit ${lead.agent_name || `#${lead.assigned_agent_id}`}.`}
        </div>
      )}
 
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, padding:"12px 16px", background:s.pill, border:`1.5px solid ${s.pillBorder}`, borderRadius:11 }}>
        <div>
          <p style={{ fontSize:9.5, color:"#b0a890", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:5 }}>Statusi</p>
          <StatusBadge status={lead.status} />
        </div>
        <StatusActions lead={lead} onStatusChange={onStatusChange} onDecline={onDecline} onCompleteClick={onCompleteClick} loading={statusLoading} isMyLead={isMyLead} />
      </div>
 
      {propertyData && (lead.type === "SELL" || lead.type === "RENT") && (
        <div style={{ background:lead.type==="SELL" ? "rgba(201,184,122,0.06)" : "rgba(126,184,164,0.06)", border:`1.5px solid ${lead.type==="SELL" ? "rgba(201,184,122,0.20)" : "rgba(126,184,164,0.20)"}`, borderRadius:11, padding:"14px 16px", marginBottom:16 }}>
          <p style={{ fontSize:9.5, fontWeight:700, color:lead.type==="SELL" ? "#c9b87a" : "#7eb8a4", textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:10 }}>
            🏠 Të dhënat e pronës nga klienti
            {lead.status === "IN_PROGRESS" && isMyLead && <span style={{ fontSize:10.5, fontWeight:400, color:"#b0a890", marginLeft:8 }}>— do të krijohet automatikisht pas Complete</span>}
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
            {propertyData.title         && <span style={{ fontSize:13, color:"#4a4438" }}>📌 {propertyData.title}</span>}
            {propertyData.city          && <span style={{ fontSize:13, color:"#4a4438" }}>📍 {propertyData.city}</span>}
            {propertyData.property_type && <span style={{ fontSize:13, color:"#4a4438" }}>🏗 {propertyData.property_type}</span>}
            {propertyData.area_sqm      && <span style={{ fontSize:13, color:"#4a4438" }}>📐 {propertyData.area_sqm} m²</span>}
            {propertyData.bedrooms      && <span style={{ fontSize:13, color:"#4a4438" }}>🛏 {propertyData.bedrooms} dhoma</span>}
            {propertyData.bathrooms     && <span style={{ fontSize:13, color:"#4a4438" }}>🚿 {propertyData.bathrooms} banjo</span>}
            {propertyData.floor         && <span style={{ fontSize:13, color:"#4a4438" }}>🏢 Kati {propertyData.floor}</span>}
            {propertyData.year_built    && <span style={{ fontSize:13, color:"#4a4438" }}>🗓 Ndërtuar: {propertyData.year_built}</span>}
            {propertyData.price         && <span style={{ fontSize:13, color:"#1a1714", fontWeight:600 }}>💰 {Number(propertyData.price).toLocaleString("de-DE")} {propertyData.currency}</span>}
            {propertyData.total_floors  && <span style={{ fontSize:13, color:"#4a4438" }}>🏢 {propertyData.total_floors} kate gjithsej</span>}
            {propertyData.price_per_sqm && <span style={{ fontSize:13, color:"#4a4438" }}>📊 €{Number(propertyData.price_per_sqm).toLocaleString("de-DE")}/m²</span>}
          </div>
          {propertyData.street      && <p style={{ fontSize:13, marginTop:8, color:"#6b6248" }}>📍 {propertyData.street}</p>}
          {propertyData.description && <p style={{ fontSize:13, marginTop:8, color:"#6b6248", fontStyle:"italic", lineHeight:1.5, fontFamily:"'Cormorant Garamond',Georgia,serif" }}>"{propertyData.description}"</p>}
        </div>
      )}
 
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:16 }}>
        {[
          { label:"Klienti",        value:lead.client_name || `#${lead.client_id}` },
          { label:"Agjenti",        value:lead.agent_name || (lead.assigned_agent_id ? `#${lead.assigned_agent_id}` : "—") },
          { label:"Tipi",           value:`${TYPE_ICON[lead.type] || ""} ${lead.type}` },
          { label:"Burimi",         value:`${SOURCE_ICON[lead.source] || ""} ${lead.source}` },
          { label:"Data preferuar", value:fmtDate(lead.preferred_date) },
        ].map(({ label, value }) => (
          <div key={label} style={{ background:"#fff", borderRadius:10, padding:"10px 14px", border:"1.5px solid #e8e2d6" }}>
            <p style={{ fontSize:9.5, color:"#b0a890", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.7px", marginBottom:4 }}>{label}</p>
            <p style={{ fontSize:13.5, fontWeight:500, color:"#1a1714", margin:0, fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{value}</p>
          </div>
        ))}
      </div>
 
      {lead.message && cleanMessage(lead.message) && (
        <div style={{ background:"#fff", border:"1.5px solid #e8e2d6", borderRadius:11, padding:"14px 16px" }}>
          <p style={{ fontSize:9.5, color:"#b0a890", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.7px", marginBottom:8 }}>Mesazhi</p>
          <p style={{ fontSize:14.5, color:"#3c3830", lineHeight:1.85, fontStyle:"italic", margin:0, fontFamily:"'Cormorant Garamond',Georgia,serif" }}>"{cleanMessage(lead.message)}"</p>
        </div>
      )}
    </Modal>
  );
}
 
// ── LeadRow (logjika identike) ─────────────────────────────────────────────────
function LeadRow({ lead, onView, onStatusChange, onDecline, onCompleteClick, statusLoading, isMyLead }) {
  return (
    <tr style={{ borderBottom:"1px solid #f0ece3", transition:"background 0.12s" }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "#faf7f2"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = ""; }}>
      <td style={{ padding:"12px 16px", color:"#b0a890", fontSize:12 }}>{lead.id}</td>
      <td style={{ padding:"12px 16px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontSize:16 }}>{TYPE_ICON[lead.type] || "📋"}</span>
          <span style={{ fontWeight:500, fontSize:13.5, color:"#1a1714" }}>{lead.type}</span>
        </div>
      </td>
      <td style={{ padding:"12px 16px", fontWeight:500, fontSize:13, color:"#1a1714" }}>{lead.client_name || `#${lead.client_id}`}</td>
      <td style={{ padding:"12px 16px", fontSize:12.5, color:"#9a8c6e" }}>{lead.property_title || (lead.property_id ? `#${lead.property_id}` : "—")}</td>
      {!isMyLead && (
        <td style={{ padding:"12px 16px" }}>
          {lead.agent_name
            ? <span style={{ fontWeight:500, fontSize:13, color:"#1a1714" }}>{lead.agent_name}</span>
            : <span style={{ color:"#b0a890", fontSize:12, fontStyle:"italic" }}>Pa agjent</span>}
        </td>
      )}
      <td style={{ padding:"12px 16px", fontSize:12.5, color:"#9a8c6e" }}>{SOURCE_ICON[lead.source]} {lead.source}</td>
      <td style={{ padding:"12px 16px" }}><StatusBadge status={lead.status} /></td>
      <td style={{ padding:"12px 16px", fontSize:12, color:"#b0a890" }}>{fmtDate(lead.created_at)}</td>
      <td style={{ padding:"12px 16px" }}>
        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
          <button className="al-btn" onClick={() => onView(lead)} style={{ padding:"5px 11px", borderRadius:9, border:"1.5px solid #e4ddd0", background:"transparent", color:"#6b6248", fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>View</button>
          <StatusActions lead={lead} onStatusChange={onStatusChange} onDecline={onDecline} onCompleteClick={onCompleteClick} loading={statusLoading} isMyLead={isMyLead} />
        </div>
      </td>
    </tr>
  );
}
 
// ══ MAIN PAGE ════════════════════════════════════════════════════════════════
export default function AgentLeads() {
  const { user } = useContext(AuthContext);
 
  const [activeTab,      setActiveTab]      = useState("my");
  const [leads,          setLeads]          = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [statusLoading,  setStatusLoading]  = useState(false);
  const [page,           setPage]           = useState(0);
  const [totalPages,     setTotalPages]     = useState(0);
  const [statusFilter,   setStatusFilter]   = useState("NEW");
  const [propertyId,     setPropertyId]     = useState("");
  const [selectedLead,   setSelectedLead]   = useState(null);
  const [completeTarget, setCompleteTarget] = useState(null);
  const [toast,          setToast]          = useState(null);
  const [stats,          setStats]          = useState({ new:0, inProgress:0, done:0, rejected:0 });
 
  const notify = useCallback((msg, type = "success") => setToast({ msg, type, key: Date.now() }), []);
 
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      let url;
      if (activeTab === "my")       url = `/api/leads/my/agent?page=${page}&size=15`;
      else if (activeTab === "all") url = `/api/leads?status=${statusFilter}&page=${page}&size=15`;
      else { setLoading(false); return; }
 
      const res  = await api.get(url);
      const data = res.data;
      if (data.content !== undefined) { setLeads(data.content || []); setTotalPages(data.totalPages || 0); }
      else { setLeads(Array.isArray(data) ? data : []); setTotalPages(1); }
    } catch { notify("Gabim gjatë ngarkimit", "error"); }
    finally  { setLoading(false); }
  }, [activeTab, page, statusFilter, notify]);
 
  useEffect(() => { if (activeTab !== "property") fetchLeads(); }, [fetchLeads, activeTab]);
 
  useEffect(() => {
    if (activeTab === "my") {
      setStats({
        new:        leads.filter((l) => l.status === "NEW").length,
        inProgress: leads.filter((l) => l.status === "IN_PROGRESS").length,
        done:       leads.filter((l) => l.status === "DONE").length,
        rejected:   leads.filter((l) => l.status === "REJECTED").length,
      });
    }
  }, [leads, activeTab]);
 
  const fetchByProperty = async () => {
    if (!propertyId) { notify("Shkruaj Property ID", "error"); return; }
    setLoading(true);
    try {
      const res = await api.get(`/api/leads/property/${propertyId}`);
      setLeads(Array.isArray(res.data) ? res.data : []);
      setTotalPages(1);
    } catch { notify("Prona nuk u gjet", "error"); }
    finally { setLoading(false); }
  };
 
  const handleStatusChange = async (id, newStatus) => {
    setStatusLoading(true);
    try {
      await api.patch(`/api/leads/${id}/status`, { status: newStatus });
      notify(`Lead #${id} → ${newStatus}`);
      setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status: newStatus } : l));
      if (selectedLead?.id === id) setSelectedLead((prev) => ({ ...prev, status: newStatus }));
    } catch (err) { notify(err.response?.data?.message || "Gabim", "error"); }
    finally { setStatusLoading(false); }
  };
 
  const handleDecline = async (id) => {
    setStatusLoading(true);
    try {
      await api.patch(`/api/leads/${id}/decline`);
      notify(`Lead #${id} u kthye tek admini`);
      setLeads((prev) => prev.filter((l) => l.id !== id));
      if (selectedLead?.id === id) setSelectedLead(null);
    } catch (err) { notify(err.response?.data?.message || "Gabim gjatë decline", "error"); }
    finally { setStatusLoading(false); }
  };
 
  const handleCompleteConfirm = async (lead, shouldCreateProperty, propertyData) => {
    setStatusLoading(true);
    try {
      if (shouldCreateProperty && propertyData && user?.id) {
        const propPayload = {
          agent_id:      user.id,
          title:         propertyData.title,
          type:          propertyData.type || propertyData.property_type || "APARTMENT",
          status:        "AVAILABLE",
          listing_type:  lead.type === "RENT" ? "RENT" : "SALE",
          description:   propertyData.description || null,
          price:         propertyData.price         ? Number(propertyData.price)         : null,
          price_per_sqm: propertyData.price_per_sqm ? Number(propertyData.price_per_sqm) : null,
          currency:      propertyData.currency || "EUR",
          area_sqm:      propertyData.area_sqm      ? Number(propertyData.area_sqm)      : null,
          bedrooms:      propertyData.bedrooms       ? Number(propertyData.bedrooms)      : null,
          bathrooms:     propertyData.bathrooms      ? Number(propertyData.bathrooms)     : null,
          floor:         propertyData.floor          ? Number(propertyData.floor)         : null,
          total_floors:  propertyData.total_floors   ? Number(propertyData.total_floors)  : null,
          year_built:    propertyData.year_built     ? Number(propertyData.year_built)    : null,
          address: propertyData.city ? { city: propertyData.city, street: propertyData.street || null } : null,
        };
        try {
          const propRes       = await api.post("/api/properties", propPayload);
          const newPropertyId = propRes.data.id;
          await api.patch(`/api/leads/${lead.id}/property`, { property_id: newPropertyId });
          notify(`✓ Lead #${lead.id} u mbyll + Prona "${propertyData.title}" (ID: #${newPropertyId}) u shtua dhe u lidh!`);
        } catch (propErr) {
          console.warn("Property creation/linking failed:", propErr);
          notify(`Lead u mbyll por prona nuk u krijua: ${propErr.response?.data?.message || "gabim"}`, "error");
        }
      }
 
      await api.patch(`/api/leads/${lead.id}/status`, { status: "DONE" });
      if (!shouldCreateProperty) notify(`Lead #${lead.id} → DONE`);
      setLeads((prev) => prev.map((l) => l.id === lead.id ? { ...l, status: "DONE" } : l));
      if (selectedLead?.id === lead.id) setSelectedLead((prev) => ({ ...prev, status: "DONE" }));
      setCompleteTarget(null);
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë Complete", "error");
    } finally {
      setStatusLoading(false);
    }
  };
 
  const handleTabChange = (tab) => { setActiveTab(tab); setPage(0); setLeads([]); };
  const isMyLeadsTab    = activeTab === "my";
 
  const STAT_ITEMS = [
    { label:"New",         value:stats.new,        dot:"#c9b87a" },
    { label:"In Progress", value:stats.inProgress, dot:"#7eb8a4" },
    { label:"Done",        value:stats.done,        dot:"#a4b07e" },
    { label:"Rejected",    value:stats.rejected,   dot:"#c07050" },
  ];
 
  return (
    <MainLayout role="agent">
      <style>{CSS}</style>
      <div className="al">
 
        {/* ── Hero ── */}
        <div style={{ background:"linear-gradient(160deg,#141210 0%,#1e1a14 45%,#241e16 100%)", minHeight:280, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"36px 32px", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(rgba(255,255,255,0.018) 1px,transparent 1px)", backgroundSize:"22px 22px", pointerEvents:"none" }} />
          <div style={{ position:"absolute", top:"-60px", left:"10%", width:260, height:260, borderRadius:"50%", background:"radial-gradient(circle,rgba(201,184,122,0.07) 0%,transparent 70%)", pointerEvents:"none", animation:"al-glow 4s ease-in-out infinite" }} />
          <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:"linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)" }} />
          <div style={{ position:"relative", zIndex:1, maxWidth:700, width:"100%", textAlign:"center" }}>
            <h1 style={{ margin:"0 0 10px", fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"clamp(26px,4vw,42px)", fontWeight:700, color:"#f5f0e8", letterSpacing:"-0.7px" }}>
              Leads{" "}
              <span style={{ background:"linear-gradient(90deg,#c9b87a,#e8d9a0,#c9b87a)", backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>Management</span>
            </h1>
            <p style={{ margin:"0 auto 20px", fontSize:13.5, color:"rgba(245,240,232,0.38)" }}>Menaxho kërkesat e klientëve dhe gjurmo progresin</p>
 
            {isMyLeadsTab && leads.length > 0 && (
              <div style={{ display:"flex", gap:8, maxWidth:440, margin:"0 auto", justifyContent:"center", flexWrap:"wrap" }}>
                {STAT_ITEMS.map((s) => (
                  <div key={s.label} style={{ background:"rgba(245,240,232,0.06)", backdropFilter:"blur(10px)", borderRadius:12, padding:"9px 16px", border:"1px solid rgba(245,240,232,0.09)", display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                    <span style={{ fontSize:22, fontWeight:700, color:s.dot, lineHeight:1, fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{s.value}</span>
                    <span style={{ fontSize:9.5, color:"rgba(245,240,232,0.3)", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.8px" }}>{s.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
 
        {/* ── Flow guide ── */}
        <div style={{ background:isMyLeadsTab ? "#edf6f3" : "#f5f0e6", borderBottom:`1.5px solid ${isMyLeadsTab ? "#c8e8de" : "#e8dfc8"}`, padding:"10px 28px", display:"flex", alignItems:"center", gap:6, fontSize:12.5, flexWrap:"wrap" }}>
          {isMyLeadsTab ? (
            <>
              <span style={{ color:"#4a7a6a", fontWeight:500 }}>NEW</span>
              <span style={{ color:"#9ab8b0" }}>→</span>
              <span style={{ color:"#2a6049", fontWeight:700 }}>▶ Accept</span>
              <span style={{ color:"#9ab8b0" }}>→</span>
              <span style={{ color:"#4a7a6a", fontWeight:500 }}>IN_PROGRESS</span>
              <span style={{ color:"#9ab8b0" }}>→</span>
              <span style={{ color:"#2a6049", fontWeight:700 }}>✓ Complete</span>
              <span style={{ color:"#9ab8b0" }}>→</span>
              <span style={{ color:"#4a7a6a", fontWeight:500 }}>DONE + prona krijohet</span>
              <span style={{ color:"#c8d8d0", margin:"0 4px" }}>|</span>
              <span style={{ color:"#8b4030", fontWeight:700 }}>↩ Decline</span>
              <span style={{ color:"#9ab8b0" }}>→ tek admini</span>
              <span style={{ color:"#c8d8d0", margin:"0 4px" }}>|</span>
              <span style={{ color:"#8b4030", fontWeight:700 }}>✕ Reject</span>
              <span style={{ color:"#9ab8b0" }}>→ REJECTED (final)</span>
            </>
          ) : (
            <span style={{ color:"#7a6a50" }}>
              ℹ️ Leads <strong style={{ color:"#4a3a20" }}>NEW</strong> presin asignimin nga admini. Menaxho nga tab-i <strong style={{ color:"#4a3a20" }}>My Leads</strong>.
            </span>
          )}
        </div>
 
        {/* ── Toolbar ── */}
        <div style={{ background:"#fff", borderBottom:"1.5px solid #e8e2d6", padding:"0 28px", height:46, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, fontFamily:"'DM Sans',sans-serif", position:"sticky", top:0, zIndex:100, boxShadow:"0 1px 10px rgba(20,16,10,0.05)" }}>
          <div style={{ display:"flex", gap:0 }}>
            {[
              { id:"my",       label:"My Leads",    icon:"👤" },
              { id:"all",      label:"All Leads",   icon:"📋" },
              { id:"property", label:"By Property", icon:"🏠" },
            ].map((t) => (
              <button key={t.id} onClick={() => handleTabChange(t.id)} style={{ padding:"0 16px", height:46, border:"none", borderBottom:activeTab===t.id ? "2.5px solid #c9b87a" : "2.5px solid transparent", background:"none", color:activeTab===t.id ? "#1a1714" : "#9a8c6e", fontWeight:activeTab===t.id ? 600 : 400, fontSize:13, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", gap:5, transition:"color .15s" }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            {activeTab === "all" && (
              <select className="al-in" style={{ ...SEL_S, width:140, height:32, padding:"0 10px", fontSize:12.5 }} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
                {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            )}
            {activeTab === "property" && (
              <>
                <input className="al-in" style={{ ...INP_S, width:130, height:32, padding:"0 10px", fontSize:12.5 }} type="number" placeholder="Property ID..." value={propertyId} onChange={(e) => setPropertyId(e.target.value)} onKeyDown={(e) => e.key === "Enter" && fetchByProperty()} />
                <button style={{ ...BTN_PRI, padding:"5px 14px", fontSize:12.5 }} onClick={fetchByProperty}>Search</button>
              </>
            )}
          </div>
        </div>
 
        {/* ── Content ── */}
        <div style={{ padding:"20px 24px", maxWidth:1440, margin:"0 auto" }}>
          <div style={{ background:"#fff", borderRadius:14, border:"1.5px solid #ece6da", boxShadow:"0 2px 16px rgba(20,16,10,0.07)", overflow:"hidden" }}>
            <div style={{ padding:"14px 20px", borderBottom:"1.5px solid #e8e2d6", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontWeight:700, fontSize:17, color:"#1a1714" }}>
                {activeTab==="my" ? "My Assigned Leads" : activeTab==="all" ? `All Leads — ${statusFilter}` : "Leads by Property"}
              </span>
              {leads.length > 0 && (
                <span style={{ background:"rgba(201,184,122,0.10)", color:"#c9b87a", border:"1px solid rgba(201,184,122,0.22)", borderRadius:999, padding:"2px 10px", fontSize:10.5, fontWeight:700 }}>
                  {leads.length} leads
                </span>
              )}
            </div>
 
            {loading ? (
              <Loader />
            ) : leads.length === 0 ? (
              <EmptyState
                icon={activeTab === "property" ? "🔍" : "📭"}
                text={activeTab === "property" ? "Shkruaj Property ID dhe kliko Search" : "Nuk ka leads në këtë kategori"}
                subtext={activeTab === "my" ? "Leads do të shfaqen kur admini t'i asignojë tek ju" : undefined}
              />
            ) : (
              <>
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <thead>
                      <tr style={{ background:"#faf7f2" }}>
                        {["#", "Tipi", "Klienti", "Prona", ...(!isMyLeadsTab ? ["Agjenti"] : []), "Burimi", "Statusi", "Krijuar", "Veprime"].map((h) => (
                          <th key={h} style={{ textAlign:"left", fontSize:10.5, fontWeight:600, color:"#b0a890", textTransform:"uppercase", letterSpacing:"0.8px", padding:"10px 16px", borderBottom:"1.5px solid #e8e2d6", whiteSpace:"nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map((lead) => (
                        <LeadRow key={lead.id} lead={lead} onView={setSelectedLead} onStatusChange={handleStatusChange} onDecline={handleDecline} onCompleteClick={setCompleteTarget} statusLoading={statusLoading} isMyLead={isMyLeadsTab} />
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
              </>
            )}
          </div>
        </div>
      </div>
 
      {selectedLead && (
        <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLead(null)} onStatusChange={handleStatusChange} onDecline={handleDecline} onCompleteClick={setCompleteTarget} statusLoading={statusLoading} isMyLead={isMyLeadsTab} />
      )}
      {completeTarget && (
        <CompleteModal lead={completeTarget} onClose={() => setCompleteTarget(null)} onConfirm={handleCompleteConfirm} loading={statusLoading} />
      )}
      {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </MainLayout>
  );
}
 