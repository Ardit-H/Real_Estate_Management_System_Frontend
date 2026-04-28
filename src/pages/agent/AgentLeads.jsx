import { useState, useEffect, useCallback, useContext } from "react";
import MainLayout from "../../components/layout/Layout";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";

// ─── Constants ────────────────────────────────────────────────────────────────
const LEAD_STATUSES = ["NEW", "IN_PROGRESS", "DONE", "REJECTED"];
const PROP_MARKER   = "__PROPERTY_DATA__:";

const STATUS_CFG = {
  NEW:         { dot:"#c9b87a", bg:"rgba(201,184,122,0.12)", border:"rgba(201,184,122,0.28)", color:"#9a7a30", label:"New"         },
  IN_PROGRESS: { dot:"#a4b07e", bg:"rgba(164,176,126,0.12)", border:"rgba(164,176,126,0.28)", color:"#4a5a30", label:"In Progress" },
  DONE:        { dot:"#7eb8a4", bg:"rgba(126,184,164,0.12)", border:"rgba(126,184,164,0.28)", color:"#2a6049", label:"Done"        },
  REJECTED:    { dot:"#d4855a", bg:"rgba(212,133,90,0.12)",  border:"rgba(212,133,90,0.28)",  color:"#8b4513", label:"Rejected"    },
  DECLINED:    { dot:"#d4855a", bg:"rgba(212,133,90,0.1)",   border:"rgba(212,133,90,0.22)",  color:"#8b4513", label:"Declined"    },
};

const TYPE_ICON   = { SELL:"🏷️", BUY:"🏠", RENT:"🔑", RENT_SEEKING:"🔎", VALUATION:"📊" };
const SOURCE_ICON = { WEBSITE:"🌐", PHONE:"📞", EMAIL:"✉️", REFERRAL:"👥", SOCIAL:"📱" };

const fmtDate     = (d) => d ? new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : "—";
const fmtDateTime = (d) => d ? new Date(d).toLocaleString("en-GB",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}) : "—";
const fmtBudget   = (v) => v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";

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

// ─── Global CSS ───────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  .al * { box-sizing: border-box; }
  .al { font-family: 'DM Sans', system-ui, sans-serif; background: #f2ede4; min-height: 100vh; }

  /* Inputs */
  .al-in {
    width: 100%; padding: 10px 13px; border: 1.5px solid #e4ddd0; border-radius: 10px;
    font-size: 13.5px; color: #1a1714; background: #fff;
    font-family: 'DM Sans', sans-serif; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box;
  }
  .al-in:focus { border-color: #8a7d5e !important; box-shadow: 0 0 0 3px rgba(138,125,94,0.13) !important; }
  .al-sel { cursor: pointer; }
  .al-ta  { resize: vertical; }

  /* Table */
  .al-table { width: 100%; border-collapse: collapse; }
  .al-table th {
    padding: 9px 14px; font-size: 9.5px; font-weight: 700;
    color: #b0a890; text-transform: uppercase; letter-spacing: 0.8px;
    border-bottom: 1.5px solid #ece6da; text-align: left;
    background: #faf7f2; white-space: nowrap;
  }
  .al-table td {
    padding: 12px 14px; font-size: 13px; color: #1a1714;
    border-bottom: 1px solid #f0ece3; vertical-align: middle;
  }
  .al-table tbody tr { transition: background 0.14s; }
  .al-table tbody tr:hover { background: #faf7f2; }
  .al-table tbody tr:last-child td { border-bottom: none; }

  /* Buttons */
  .al-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 7px 14px; border-radius: 9px; font-size: 12.5px;
    font-weight: 600; cursor: pointer; font-family: inherit;
    border: none; transition: all 0.17s ease; white-space: nowrap;
  }
  .al-btn:hover { opacity: 0.85; transform: translateY(-1px); }
  .al-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .al-btn--primary  { background: linear-gradient(135deg,#c9b87a,#b0983e); color: #1a1714; }
  .al-btn--secondary{ background: transparent; border: 1.5px solid #e4ddd0 !important; color: #6b6248; }
  .al-btn--secondary:hover { background: #f5f0e8 !important; }
  .al-btn--ghost    { background: rgba(201,184,122,0.08); border: 1px solid rgba(201,184,122,0.2) !important; color: #9a7a30; }
  .al-btn--ghost:hover { background: rgba(201,184,122,0.16) !important; }
  .al-btn--danger   { background: rgba(212,133,90,0.1); border: 1.5px solid rgba(212,133,90,0.28) !important; color: #8b4513; }
  .al-btn--danger:hover { background: rgba(212,133,90,0.2) !important; }
  .al-btn--success  { background: rgba(126,184,164,0.1); border: 1.5px solid rgba(126,184,164,0.28) !important; color: #2a6049; }
  .al-btn--success:hover { background: rgba(126,184,164,0.2) !important; }
  .al-btn--amber    { background: rgba(201,184,122,0.1); border: 1.5px solid rgba(201,184,122,0.28) !important; color: #9a7a30; }
  .al-btn--sm       { padding: 5px 11px; font-size: 11.5px; border-radius: 8px; }

  /* Card */
  .al-card { background: #fff; border-radius: 14px; border: 1.5px solid #ece6da; box-shadow: 0 2px 16px rgba(20,16,10,0.07); overflow: hidden; }
  .al-card-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 22px; border-bottom: 1.5px solid #ece6da; background: #faf7f2; flex-wrap: wrap; gap: 10px; }
  .al-card-title  { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 18px; font-weight: 700; color: #1a1714; letter-spacing: -0.2px; margin: 0; }

  /* Tabs */
  .al-tab { padding: 10px 18px; border: none; background: none; font-size: 13.5px; font-weight: 400; cursor: pointer; font-family: inherit; transition: all 0.15s; border-bottom: 2px solid transparent; margin-bottom: -2px; display: flex; align-items: center; gap: 7px; color: #9a8c6e; }
  .al-tab.active { color: #1a1714; font-weight: 600; border-bottom-color: #c9b87a; }
  .al-tab:hover:not(.active) { color: #6b6248; background: #f5f0e8; }

  /* Stat cards */
  .al-stat { background: #fff; border-radius: 12px; border: 1.5px solid #ece6da; padding: 16px 20px; box-shadow: 0 2px 12px rgba(20,16,10,0.06); transition: transform 0.2s; }
  .al-stat:hover { transform: translateY(-3px); }

  /* Animations */
  @keyframes al-scale-in { from{opacity:0;transform:scale(0.95) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes al-spin     { to{transform:rotate(360deg)} }
  @keyframes al-toast    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes al-shimmer  { 0%{background-position:-800px 0} 100%{background-position:800px 0} }
  @keyframes al-glow     { 0%,100%{opacity:0.07} 50%{opacity:0.14} }
  @keyframes al-card-in  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
`;

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const s = STATUS_CFG[status] || { dot:"#a0997e", bg:"rgba(160,153,126,0.1)", border:"rgba(160,153,126,0.22)", color:"#6b6248", label:status };
  return (
    <span style={{ background:s.bg, color:s.color, border:`1.5px solid ${s.border}`, padding:"3px 11px", borderRadius:999, fontSize:10.5, fontWeight:700, display:"inline-flex", alignItems:"center", gap:5, textTransform:"uppercase", letterSpacing:"0.3px" }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:s.dot, boxShadow:`0 0 5px ${s.dot}` }}/>
      {s.label}
    </span>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type="success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position:"fixed", bottom:26, right:26, zIndex:9999, background:"#1a1714", color:type==="error"?"#f09090":"#90c8a8", padding:"11px 18px", borderRadius:12, fontSize:13, boxShadow:"0 10px 36px rgba(0,0,0,0.32)", border:`1px solid ${type==="error"?"rgba(240,128,128,0.15)":"rgba(144,200,168,0.15)"}`, maxWidth:320, fontFamily:"'DM Sans',sans-serif", animation:"al-toast 0.2s ease", display:"flex", alignItems:"center", gap:8 }}>
      <span style={{fontSize:14}}>{type==="error"?"⚠️":"✅"}</span>{msg}
    </div>
  );
}

// ─── Loader ───────────────────────────────────────────────────────────────────
function Loader() {
  return (
    <div style={{ textAlign:"center", padding:"52px 0" }}>
      <div style={{ width:26, height:26, margin:"0 auto", border:"2px solid #e8e2d6", borderTop:"2px solid #c9b87a", borderRadius:"50%", animation:"al-spin 0.8s linear infinite" }}/>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ icon, text, subtext }) {
  return (
    <div style={{ textAlign:"center", padding:"56px 20px", color:"#b0a890" }}>
      <div style={{ fontSize:40, marginBottom:12 }}>{icon}</div>
      <p style={{ fontSize:15, fontWeight:600, color:"#6b6340", marginBottom:6, fontFamily:"'Cormorant Garamond',Georgia,serif", fontStyle:"italic" }}>{text}</p>
      {subtext && <p style={{ fontSize:13, color:"#b0a890" }}>{subtext}</p>}
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
const PGB = (active, disabled) => ({
  padding:"6px 13px", borderRadius:9, border:`1.5px solid ${active?"#1a1714":"#e4ddd0"}`,
  background:active?"#1a1714":"transparent", color:active?"#f5f0e8":disabled?"#d4ccbe":"#6b6248",
  cursor:disabled?"not-allowed":"pointer", fontSize:12.5, fontWeight:active?600:400,
  fontFamily:"'DM Sans',sans-serif", opacity:disabled?0.5:1, transition:"all 0.14s",
});
function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6, justifyContent:"flex-end", padding:"14px 18px", borderTop:"1px solid #f0ece3" }}>
      <button disabled={page===0} onClick={()=>onChange(page-1)} style={PGB(false,page===0)}>‹ Prev</button>
      <span style={{ fontSize:12.5, color:"#9a8c6e", padding:"0 10px" }}>{page+1} / {totalPages}</span>
      <button disabled={page>=totalPages-1} onClick={()=>onChange(page+1)} style={PGB(false,page>=totalPages-1)}>Next ›</button>
    </div>
  );
}

// ─── Modal wrapper ────────────────────────────────────────────────────────────
function ModalWrap({ title, subtitle, onClose, children, wide=false, accentColor="#c9b87a" }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  useEffect(() => { document.body.style.overflow="hidden"; return()=>{ document.body.style.overflow=""; }; }, []);
  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()}
      style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(8,6,4,0.84)", backdropFilter:"blur(14px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ width:"100%", maxWidth:wide?680:540, background:"#faf7f2", borderRadius:18, boxShadow:"0 44px 100px rgba(0,0,0,0.55)", maxHeight:"92vh", overflowY:"auto", animation:"al-scale-in 0.26s ease" }}>
        <div style={{ background:"linear-gradient(160deg,#141210 0%,#1e1a14 45%,#241e16 100%)", padding:"20px 26px", borderRadius:"18px 18px 0 0", display:"flex", alignItems:"center", justifyContent:"space-between", position:"relative", overflow:"hidden" }}>
          <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,0.018) 1px,transparent 1px)",backgroundSize:"22px 22px",pointerEvents:"none"}}/>
          <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:`linear-gradient(90deg,transparent,${accentColor} 30%,${accentColor} 70%,transparent)`}}/>
          <div style={{position:"relative"}}>
            <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontWeight:700, fontSize:19, margin:"0 0 2px", color:"#f5f0e8", letterSpacing:"-0.2px" }}>{title}</p>
            {subtitle && <p style={{ fontSize:11.5, color:"rgba(245,240,232,0.4)", margin:0 }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} style={{ position:"relative", background:"rgba(245,240,232,0.08)", backdropFilter:"blur(8px)", border:"1px solid rgba(245,240,232,0.12)", borderRadius:9, width:32, height:32, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(245,240,232,0.6)", fontSize:16 }}>×</button>
        </div>
        <div style={{ padding:"22px 26px" }}>{children}</div>
      </div>
    </div>
  );
}

const ML = { display:"block", fontSize:10.5, fontWeight:600, color:"#9a8c6e", textTransform:"uppercase", letterSpacing:"0.7px", marginBottom:6, fontFamily:"'DM Sans',sans-serif" };

function InfoBox({ type="info", children }) {
  const cfg = {
    info:    { bg:"rgba(201,184,122,0.08)",  border:"rgba(201,184,122,0.22)",  color:"#9a7a30" },
    success: { bg:"rgba(126,184,164,0.08)",  border:"rgba(126,184,164,0.22)",  color:"#2a6049" },
    warning: { bg:"rgba(212,133,90,0.08)",   border:"rgba(212,133,90,0.22)",   color:"#8b4513" },
    purple:  { bg:"rgba(164,176,126,0.08)",  border:"rgba(164,176,126,0.22)",  color:"#4a5a30" },
  }[type];
  return (
    <div style={{ background:cfg.bg, border:`1.5px solid ${cfg.border}`, borderRadius:10, padding:"10px 14px", marginBottom:14, fontSize:12.5, color:cfg.color, lineHeight:1.6 }}>
      {children}
    </div>
  );
}

// ─── Property Data Preview ────────────────────────────────────────────────────
function PropertyPreview({ propertyData, leadType }) {
  if (!propertyData) return null;
  const isSell = leadType === "SELL";
  return (
    <div style={{ background:isSell?"rgba(201,184,122,0.06)":"rgba(126,184,164,0.06)", border:`1.5px solid ${isSell?"rgba(201,184,122,0.22)":"rgba(126,184,164,0.22)"}`, borderRadius:12, padding:"14px 16px", marginBottom:16 }}>
      <p style={{ fontSize:9.5, fontWeight:700, color:isSell?"#c9b87a":"#7eb8a4", textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:10 }}>
        🏠 Property Data from Client
      </p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
        {propertyData.title         && <span style={{ fontSize:13, color:"#4a4438" }}>📌 {propertyData.title}</span>}
        {propertyData.city          && <span style={{ fontSize:13, color:"#4a4438" }}>📍 {propertyData.city}</span>}
        {propertyData.property_type && <span style={{ fontSize:13, color:"#4a4438" }}>🏗 {propertyData.property_type}</span>}
        {propertyData.area_sqm      && <span style={{ fontSize:13, color:"#4a4438" }}>📐 {propertyData.area_sqm} m²</span>}
        {propertyData.bedrooms      && <span style={{ fontSize:13, color:"#4a4438" }}>🛏 {propertyData.bedrooms} rooms</span>}
        {propertyData.bathrooms     && <span style={{ fontSize:13, color:"#4a4438" }}>🚿 {propertyData.bathrooms} baths</span>}
        {propertyData.floor         && <span style={{ fontSize:13, color:"#4a4438" }}>🏢 Floor {propertyData.floor}</span>}
        {propertyData.year_built    && <span style={{ fontSize:13, color:"#4a4438" }}>🗓 Built: {propertyData.year_built}</span>}
        {propertyData.price         && <span style={{ fontSize:13, color:"#4a4438" }}>💰 {Number(propertyData.price).toLocaleString("de-DE")} {propertyData.currency}</span>}
      </div>
      {propertyData.street && <p style={{ fontSize:13, marginTop:8, color:"#9a8c6e" }}>📍 {propertyData.street}</p>}
      {propertyData.description && <p style={{ fontSize:13, marginTop:8, color:"#6b6248", fontStyle:"italic", lineHeight:1.5, fontFamily:"'Cormorant Garamond',Georgia,serif" }}>"{propertyData.description}"</p>}
    </div>
  );
}

// ─── Complete Confirmation Modal ──────────────────────────────────────────────
function CompleteModal({ lead, onConfirm, onClose, loading }) {
  const propertyData      = parsePropertyData(lead.message);
  const hasPropertyData   = !!propertyData && (lead.type==="SELL"||lead.type==="RENT");
  const [createProp, setCreateProp] = useState(hasPropertyData);

  return (
    <ModalWrap title={`Confirm Complete — Lead #${lead.id}`} subtitle="This action is final and cannot be undone" onClose={onClose} accentColor="#7eb8a4">
      {hasPropertyData ? (
        <>
          <InfoBox type="success">
            This <strong>{TYPE_ICON[lead.type]} {lead.type}</strong> lead has embedded property data. Would you like to automatically register it as a new property in the system?
          </InfoBox>
          <PropertyPreview propertyData={propertyData} leadType={lead.type}/>
          {/* Toggle */}
          <div onClick={()=>setCreateProp(p=>!p)}
            style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20, padding:"11px 14px", background:createProp?"rgba(126,184,164,0.08)":"#f5f0e8", border:`1.5px solid ${createProp?"rgba(126,184,164,0.22)":"#e4ddd0"}`, borderRadius:10, cursor:"pointer", transition:"all 0.15s" }}>
            <div style={{ width:20, height:20, borderRadius:6, background:createProp?"#7eb8a4":"#e4ddd0", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"background .15s" }}>
              {createProp && <span style={{ color:"white", fontSize:12, fontWeight:700 }}>✓</span>}
            </div>
            <span style={{ fontSize:13, color:"#1a1714", fontWeight:createProp?600:400 }}>
              Auto-create property in system after completing
            </span>
          </div>
        </>
      ) : (
        <InfoBox type="info">
          Are you sure you want to mark Lead <strong>#{lead.id}</strong> as <strong>DONE</strong>? This is a final action.
        </InfoBox>
      )}
      <div style={{ display:"flex", gap:9, justifyContent:"flex-end", borderTop:"1px solid #e8e2d6", paddingTop:18, marginTop:4 }}>
        <button className="al-btn al-btn--secondary" onClick={onClose} disabled={loading}>Cancel</button>
        <button className="al-btn al-btn--success" onClick={()=>onConfirm(lead, createProp&&hasPropertyData, propertyData)} disabled={loading}>
          {loading ? "Processing…" : "✓ Complete"}
        </button>
      </div>
    </ModalWrap>
  );
}

// ─── Status Action Buttons ────────────────────────────────────────────────────
function StatusActions({ lead, onStatusChange, onDecline, onCompleteClick, loading, isMyLead }) {
  const { status } = lead;

  if (status==="DONE" || status==="REJECTED") {
    return <span style={{ fontSize:11, color:"#b0a890", fontStyle:"italic", background:"#f5f0e8", padding:"3px 10px", borderRadius:999 }}>Final</span>;
  }

  if (!isMyLead) {
    if (status==="NEW" && !lead.assigned_agent_id)
      return <span style={{ fontSize:11, color:"#9a8c6e", background:"#f5f0e8", padding:"3px 10px", borderRadius:999 }}>Unassigned</span>;
    if (status==="NEW" && lead.assigned_agent_id)
      return <span style={{ fontSize:11, color:"#9a7a30", background:"rgba(201,184,122,0.1)", border:"1px solid rgba(201,184,122,0.22)", padding:"3px 10px", borderRadius:999 }}>⏳ Pending acceptance</span>;
    return <span style={{ fontSize:11, color:"#b0a890", fontStyle:"italic", background:"#f5f0e8", padding:"3px 10px", borderRadius:999 }}>View only</span>;
  }

  if (status==="NEW") {
    return (
      <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
        <button className="al-btn al-btn--primary al-btn--sm" onClick={()=>onStatusChange(lead.id,"IN_PROGRESS")} disabled={loading}>▶ Accept</button>
        <button className="al-btn al-btn--danger al-btn--sm" onClick={()=>onDecline(lead.id)} disabled={loading}>↩ Decline</button>
      </div>
    );
  }

  if (status==="IN_PROGRESS") {
    const hasPropertyData = !!parsePropertyData(lead.message) && (lead.type==="SELL"||lead.type==="RENT");
    return (
      <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
        <button className="al-btn al-btn--success al-btn--sm" onClick={()=>onCompleteClick(lead)} disabled={loading}>
          ✓ Complete{hasPropertyData ? " 🏠" : ""}
        </button>
        <button className="al-btn al-btn--danger al-btn--sm" onClick={()=>onStatusChange(lead.id,"REJECTED")} disabled={loading}>✕ Reject</button>
      </div>
    );
  }
  return null;
}

// ─── Lead Detail Modal ────────────────────────────────────────────────────────
function LeadDetailModal({ lead, onClose, onStatusChange, onDecline, onCompleteClick, statusLoading, isMyLead }) {
  const { user } = useContext(AuthContext);
  const propertyData = parsePropertyData(lead.message);
  const s = STATUS_CFG[lead.status] || STATUS_CFG.NEW;

  return (
    <ModalWrap title={`${TYPE_ICON[lead.type]||"📋"} Lead #${lead.id} — ${lead.type}`} subtitle={`Created: ${fmtDateTime(lead.created_at)}`} onClose={onClose} wide accentColor={s.dot}>

      {!isMyLead && (
        <InfoBox type="info">
          ℹ️ {!lead.assigned_agent_id
            ? "This lead has not been assigned to any agent yet."
            : lead.assigned_agent_id===user?.id
              ? "This lead is assigned to you."
              : `This lead is assigned to agent ${lead.agent_name||`#${lead.assigned_agent_id}`}.`}
        </InfoBox>
      )}

      {/* Status + actions */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18, padding:"13px 16px", background:s.bg, border:`1.5px solid ${s.border}`, borderRadius:12, flexWrap:"wrap", gap:10 }}>
        <div>
          <p style={{ fontSize:9.5, color:"#b0a890", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:6 }}>Status</p>
          <StatusBadge status={lead.status}/>
        </div>
        <StatusActions lead={lead} onStatusChange={onStatusChange} onDecline={onDecline} onCompleteClick={onCompleteClick} loading={statusLoading} isMyLead={isMyLead}/>
      </div>

      {/* Property data */}
      {propertyData && (lead.type==="SELL"||lead.type==="RENT") && (
        <PropertyPreview propertyData={propertyData} leadType={lead.type}/>
      )}

      {/* Info grid */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:18 }}>
        {[
          { label:"Client",         value:lead.client_name||`#${lead.client_id}`         },
          { label:"Agent",          value:lead.agent_name||(lead.assigned_agent_id?`#${lead.assigned_agent_id}`:"—") },
          { label:"Type",           value:`${TYPE_ICON[lead.type]||""} ${lead.type}`     },
          { label:"Source",         value:`${SOURCE_ICON[lead.source]||""} ${lead.source}` },
          { label:"Budget",         value:fmtBudget(lead.budget)                         },
          { label:"Preferred Date", value:fmtDate(lead.preferred_date)                   },
        ].map(({label,value}) => (
          <div key={label} style={{ background:"#fff", borderRadius:11, padding:"11px 14px", border:"1.5px solid #e8e2d6" }}>
            <p style={{ fontSize:9.5, color:"#b0a890", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:5 }}>{label}</p>
            <p style={{ fontSize:13.5, fontWeight:600, color:"#1a1714", margin:0, fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Message */}
      {lead.message && cleanMessage(lead.message) && (
        <div style={{ background:"#fff", border:"1.5px solid #e8e2d6", borderRadius:11, padding:"14px 16px" }}>
          <p style={{ fontSize:9.5, color:"#b0a890", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:8 }}>Message</p>
          <p style={{ fontSize:14, color:"#3c3830", lineHeight:1.8, fontStyle:"italic", margin:0, fontFamily:"'Cormorant Garamond',Georgia,serif" }}>"{cleanMessage(lead.message)}"</p>
        </div>
      )}
    </ModalWrap>
  );
}

// ─── Lead Table Row ───────────────────────────────────────────────────────────
function LeadRow({ lead, onView, onStatusChange, onDecline, onCompleteClick, statusLoading, isMyLead }) {
  return (
    <tr>
      <td style={{ color:"#b0a890", fontSize:11.5 }}>{lead.id}</td>
      <td>
        <div style={{ display:"flex", alignItems:"center", gap:7 }}>
          <span style={{ fontSize:16 }}>{TYPE_ICON[lead.type]||"📋"}</span>
          <span style={{ fontWeight:600, fontSize:13, fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{lead.type}</span>
        </div>
      </td>
      <td style={{ fontWeight:500, fontSize:13 }}>{lead.client_name||`#${lead.client_id}`}</td>
      <td style={{ fontSize:12.5, color:"#9a8c6e" }}>{lead.property_title||(lead.property_id?`#${lead.property_id}`:"—")}</td>
      {!isMyLead && (
        <td style={{ fontSize:13 }}>
          {lead.agent_name
            ? <span style={{ fontWeight:500 }}>{lead.agent_name}</span>
            : <span style={{ color:"#b0a890", fontSize:11.5, fontStyle:"italic" }}>Unassigned</span>}
        </td>
      )}
      <td style={{ fontSize:12.5, color:"#9a8c6e" }}>{SOURCE_ICON[lead.source]} {lead.source}</td>
      <td style={{ fontWeight:700, fontSize:14, fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{fmtBudget(lead.budget)}</td>
      <td><StatusBadge status={lead.status}/></td>
      <td style={{ fontSize:12, color:"#b0a890" }}>{fmtDate(lead.created_at)}</td>
      <td>
        <div style={{ display:"flex", gap:5, alignItems:"center" }}>
          <button className="al-btn al-btn--ghost al-btn--sm" onClick={()=>onView(lead)}>View</button>
          <StatusActions lead={lead} onStatusChange={onStatusChange} onDecline={onDecline} onCompleteClick={onCompleteClick} loading={statusLoading} isMyLead={isMyLead}/>
        </div>
      </td>
    </tr>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function AgentLeads() {
  const { user } = useContext(AuthContext);
  const [activeTab,      setActiveTab]      = useState("my");
  const [leads,          setLeads]          = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [statusLoading,  setStatusLoading]  = useState(false);
  const [page,           setPage]           = useState(0);
  const [totalPages,     setTotalPages]     = useState(0);
  const [totalEl,        setTotalEl]        = useState(0);
  const [statusFilter,   setStatusFilter]   = useState("NEW");
  const [propertyId,     setPropertyId]     = useState("");
  const [selectedLead,   setSelectedLead]   = useState(null);
  const [completeTarget, setCompleteTarget] = useState(null);
  const [toast,          setToast]          = useState(null);
  const [stats,          setStats]          = useState({ new:0, inProgress:0, done:0, rejected:0 });

  const notify = useCallback((msg,type="success") => setToast({msg,type,key:Date.now()}), []);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      let url;
      if      (activeTab==="my")  url = `/api/leads/my/agent?page=${page}&size=15`;
      else if (activeTab==="all") url = `/api/leads?status=${statusFilter}&page=${page}&size=15`;
      else { setLoading(false); return; }
      const res  = await api.get(url);
      const data = res.data;
      if (data.content !== undefined) { setLeads(data.content||[]); setTotalPages(data.totalPages||0); setTotalEl(data.totalElements||0); }
      else { setLeads(Array.isArray(data)?data:[]); setTotalPages(1); setTotalEl(Array.isArray(data)?data.length:0); }
    } catch { notify("Failed to load leads","error"); }
    finally  { setLoading(false); }
  }, [activeTab, page, statusFilter, notify]);

  useEffect(() => { if (activeTab!=="property") fetchLeads(); }, [fetchLeads, activeTab]);

  useEffect(() => {
    if (activeTab==="my") {
      setStats({
        new:        leads.filter(l=>l.status==="NEW").length,
        inProgress: leads.filter(l=>l.status==="IN_PROGRESS").length,
        done:       leads.filter(l=>l.status==="DONE").length,
        rejected:   leads.filter(l=>l.status==="REJECTED").length,
      });
    }
  }, [leads, activeTab]);

  const fetchByProperty = async () => {
    if (!propertyId) { notify("Enter a Property ID","error"); return; }
    setLoading(true);
    try {
      const res = await api.get(`/api/leads/property/${propertyId}`);
      setLeads(Array.isArray(res.data)?res.data:[]); setTotalPages(1); setTotalEl(Array.isArray(res.data)?res.data.length:0);
    } catch { notify("Property not found","error"); }
    finally  { setLoading(false); }
  };

  const handleStatusChange = async (id, newStatus) => {
    setStatusLoading(true);
    try {
      await api.patch(`/api/leads/${id}/status`,{ status:newStatus });
      notify(`Lead #${id} → ${newStatus}`);
      setLeads(prev=>prev.map(l=>l.id===id?{...l,status:newStatus}:l));
      if (selectedLead?.id===id) setSelectedLead(prev=>({...prev,status:newStatus}));
    } catch (err) { notify(err.response?.data?.message||"Error","error"); }
    finally { setStatusLoading(false); }
  };

  const handleDecline = async (id) => {
    setStatusLoading(true);
    try {
      await api.patch(`/api/leads/${id}/decline`);
      notify(`Lead #${id} returned to admin`);
      setLeads(prev=>prev.filter(l=>l.id!==id));
      if (selectedLead?.id===id) setSelectedLead(null);
    } catch (err) { notify(err.response?.data?.message||"Error declining","error"); }
    finally { setStatusLoading(false); }
  };

  const handleCompleteConfirm = async (lead, shouldCreateProperty, propertyData) => {
    setStatusLoading(true);
    try {
      if (shouldCreateProperty && propertyData && user?.id) {
        const propPayload = {
          agent_id: user.id, title: propertyData.title,
          type: propertyData.property_type||"APARTMENT", status:"AVAILABLE",
          listing_type: lead.type==="SELL"?"SALE":"RENT",
          description: propertyData.description||null,
          price: propertyData.price?Number(propertyData.price):null,
          currency: propertyData.currency||"EUR",
          area_sqm: propertyData.area_sqm?Number(propertyData.area_sqm):null,
          bedrooms: propertyData.bedrooms?Number(propertyData.bedrooms):null,
          bathrooms: propertyData.bathrooms?Number(propertyData.bathrooms):null,
          floor: propertyData.floor?Number(propertyData.floor):null,
          year_built: propertyData.year_built?Number(propertyData.year_built):null,
          address: propertyData.city?{ city:propertyData.city, street:propertyData.street||null }:null,
        };
        try {
          const propRes = await api.post("/api/properties",propPayload);
          const newPropertyId = propRes.data.id;
          await api.patch(`/api/leads/${lead.id}/property`,{ property_id:newPropertyId });
          notify(`✓ Lead #${lead.id} completed + Property "${propertyData.title}" (ID: #${newPropertyId}) created and linked!`);
        } catch (propErr) {
          notify(`Lead completed but property creation failed: ${propErr.response?.data?.message||"error"}`,"error");
        }
      }
      await api.patch(`/api/leads/${lead.id}/status`,{ status:"DONE" });
      if (!shouldCreateProperty) notify(`Lead #${lead.id} → DONE`);
      setLeads(prev=>prev.map(l=>l.id===lead.id?{...l,status:"DONE"}:l));
      if (selectedLead?.id===lead.id) setSelectedLead(prev=>({...prev,status:"DONE"}));
      setCompleteTarget(null);
    } catch (err) { notify(err.response?.data?.message||"Error completing lead","error"); }
    finally { setStatusLoading(false); }
  };

  const handleTabChange = (tab) => { setActiveTab(tab); setPage(0); setLeads([]); };
  const isMyLeadsTab = activeTab==="my";

  const STAT_CARDS = [
    { label:"New",         value:stats.new,        cfg:STATUS_CFG.NEW         },
    { label:"In Progress", value:stats.inProgress,  cfg:STATUS_CFG.IN_PROGRESS },
    { label:"Done",        value:stats.done,        cfg:STATUS_CFG.DONE        },
    { label:"Rejected",    value:stats.rejected,    cfg:STATUS_CFG.REJECTED    },
  ];

  return (
    <MainLayout role="agent">
      <style>{CSS}</style>
      <div className="al">

        {/* ── Hero ── */}
        <div style={{ background:"linear-gradient(160deg,#141210 0%,#1e1a14 45%,#241e16 100%)", minHeight:280, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"36px 32px", position:"relative", overflow:"hidden" }}>
          <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,0.018) 1px,transparent 1px)",backgroundSize:"22px 22px",pointerEvents:"none"}}/>
          <div style={{position:"absolute",top:"-60px",left:"8%",width:280,height:280,borderRadius:"50%",background:"radial-gradient(circle,rgba(201,184,122,0.07) 0%,transparent 70%)",pointerEvents:"none",animation:"al-glow 4s ease-in-out infinite"}}/>
          <div style={{position:"absolute",bottom:"-40px",right:"8%",width:220,height:220,borderRadius:"50%",background:"radial-gradient(circle,rgba(126,184,164,0.05) 0%,transparent 70%)",pointerEvents:"none",animation:"al-glow 4s ease-in-out infinite 2s"}}/>
          <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:"linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)"}}/>

          <div style={{ position:"relative", zIndex:1, maxWidth:700, width:"100%", textAlign:"center" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(201,184,122,0.1)", border:"1px solid rgba(201,184,122,0.18)", borderRadius:999, padding:"4px 14px", marginBottom:14 }}>
              <span style={{ width:5, height:5, borderRadius:"50%", background:"#c9b87a", display:"inline-block", boxShadow:"0 0 6px #c9b87a" }}/>
              <span style={{ fontSize:10.5, fontWeight:600, color:"#c9b87a", letterSpacing:"1.2px", textTransform:"uppercase" }}>Leads Management</span>
            </div>

            <h1 style={{ margin:"0 0 10px", fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"clamp(26px,3.5vw,40px)", fontWeight:700, color:"#f5f0e8", letterSpacing:"-0.7px", lineHeight:1.1 }}>
              Client{" "}
              <span style={{ background:"linear-gradient(90deg,#c9b87a,#e8d9a0,#c9b87a)", backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>Requests</span>
            </h1>

            <p style={{ margin:"0 auto 24px", fontSize:13.5, color:"rgba(245,240,232,0.38)", fontFamily:"'DM Sans',sans-serif", lineHeight:1.6 }}>
              Manage client leads, track progress and auto-register properties
            </p>

            {/* Workflow strip */}
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(245,240,232,0.05)", backdropFilter:"blur(10px)", borderRadius:12, padding:"10px 20px", border:"1px solid rgba(245,240,232,0.1)", flexWrap:"wrap", justifyContent:"center" }}>
              {[
                { label:"NEW", color:"#c9b87a" },
                { label:"→", color:"rgba(245,240,232,0.2)" },
                { label:"Accept", color:"#c9b87a", bold:true },
                { label:"→", color:"rgba(245,240,232,0.2)" },
                { label:"IN PROGRESS", color:"#a4b07e" },
                { label:"→", color:"rgba(245,240,232,0.2)" },
                { label:"Complete ✓", color:"#7eb8a4", bold:true },
                { label:"→", color:"rgba(245,240,232,0.2)" },
                { label:"DONE 🏠", color:"#7eb8a4" },
              ].map((s,i) => (
                <span key={i} style={{ fontSize:11.5, color:s.color, fontWeight:s.bold?700:400, fontFamily:"'DM Sans',sans-serif" }}>{s.label}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div style={{ background:"#fff", borderBottom:"1.5px solid #e8e2d6", padding:"0 28px", height:46, display:"flex", alignItems:"center", justifyContent:"space-between", fontFamily:"'DM Sans',sans-serif", position:"sticky", top:0, zIndex:100, boxShadow:"0 1px 10px rgba(20,16,10,0.05)" }}>
          <p style={{ margin:0, fontSize:12.5, color:"#9a8c6e" }}>
            {loading ? "Loading…" : `${totalEl||leads.length} lead${(totalEl||leads.length)!==1?"s":""}`}
          </p>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            {activeTab==="all" && (
              <select className="al-in al-sel" style={{ width:150, height:34, padding:"0 12px", fontSize:12.5 }}
                value={statusFilter} onChange={e=>{ setStatusFilter(e.target.value); setPage(0); }}>
                {LEAD_STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            )}
            {activeTab==="property" && (
              <div style={{ display:"flex", gap:6 }}>
                <input className="al-in" style={{ width:140, height:34, padding:"0 12px", fontSize:12.5 }}
                  type="number" placeholder="Property ID…" value={propertyId}
                  onChange={e=>setPropertyId(e.target.value)} onKeyDown={e=>e.key==="Enter"&&fetchByProperty()}/>
                <button className="al-btn al-btn--primary al-btn--sm" onClick={fetchByProperty}>Search</button>
              </div>
            )}
          </div>
        </div>

        {/* ── Content ── */}
        <div style={{ padding:"20px 24px", maxWidth:1400, margin:"0 auto" }}>

          {/* Stat cards — only My Leads tab */}
          {isMyLeadsTab && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
              {STAT_CARDS.map(s => (
                <div key={s.label} className="al-stat">
                  <div style={{ fontSize:9.5, fontWeight:600, color:"#b0a890", textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:8 }}>{s.label}</div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:28, fontWeight:700, color:s.cfg.color, fontFamily:"'Cormorant Garamond',Georgia,serif", lineHeight:1 }}>{s.value}</span>
                    <span style={{ width:7, height:7, borderRadius:"50%", background:s.cfg.dot, boxShadow:`0 0 8px ${s.cfg.dot}`, flexShrink:0 }}/>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div style={{ display:"flex", borderBottom:"2px solid #e8e2d6", marginBottom:20 }}>
            {[
              { id:"my",       label:"My Leads",    icon:"👤" },
              { id:"all",      label:"All Leads",   icon:"📋" },
              { id:"property", label:"By Property", icon:"🏠" },
            ].map(t => (
              <button key={t.id} onClick={()=>handleTabChange(t.id)} className={`al-tab${activeTab===t.id?" active":""}`}>
                <span style={{fontSize:14}}>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>

          {/* Table card */}
          <div className="al-card">
            <div className="al-card-header">
              <h2 className="al-card-title">
                {activeTab==="my" ? "My Assigned Leads" : activeTab==="all" ? `All Leads — ${statusFilter}` : "Leads by Property"}
              </h2>
              {leads.length > 0 && (
                <span style={{ background:"rgba(201,184,122,0.1)", color:"#c9b87a", border:"1px solid rgba(201,184,122,0.22)", padding:"4px 13px", borderRadius:999, fontSize:12, fontWeight:600 }}>
                  {leads.length} shown
                </span>
              )}
            </div>

            {loading ? <Loader/> : leads.length===0 ? (
              <EmptyState
                icon={activeTab==="property"?"🔍":"📭"}
                text={activeTab==="property"?"Enter a Property ID and click Search":"No leads in this category"}
                subtext={activeTab==="my"?"Leads will appear here once the admin assigns them to you":undefined}/>
            ) : (
              <>
                <div style={{ overflowX:"auto" }}>
                  <table className="al-table">
                    <thead>
                      <tr>
                        <th>#</th><th>Type</th><th>Client</th><th>Property</th>
                        {!isMyLeadsTab && <th>Agent</th>}
                        <th>Source</th><th>Budget</th><th>Status</th><th>Created</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map(lead => (
                        <LeadRow key={lead.id} lead={lead} onView={setSelectedLead}
                          onStatusChange={handleStatusChange} onDecline={handleDecline}
                          onCompleteClick={setCompleteTarget}
                          statusLoading={statusLoading} isMyLead={isMyLeadsTab}/>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination page={page} totalPages={totalPages} onChange={setPage}/>
              </>
            )}
          </div>
        </div>
      </div>

      {selectedLead && (
        <LeadDetailModal lead={selectedLead} onClose={()=>setSelectedLead(null)}
          onStatusChange={handleStatusChange} onDecline={handleDecline}
          onCompleteClick={setCompleteTarget}
          statusLoading={statusLoading} isMyLead={isMyLeadsTab}/>
      )}
      {completeTarget && (
        <CompleteModal lead={completeTarget} onClose={()=>setCompleteTarget(null)} onConfirm={handleCompleteConfirm} loading={statusLoading}/>
      )}
      {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}
    </MainLayout>
  );
}