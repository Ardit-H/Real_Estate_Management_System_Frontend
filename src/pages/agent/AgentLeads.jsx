import { useState, useEffect, useCallback, useContext } from "react";
import MainLayout from "../../components/layout/Layout";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";

const LEAD_STATUSES  = ["NEW", "IN_PROGRESS", "DONE", "REJECTED"];
const PROP_MARKER    = "__PROPERTY_DATA__:";

const STATUS_STYLE = {
  NEW:         { bg:"#eff6ff", color:"#2563eb", label:"New" },
  IN_PROGRESS: { bg:"#f5f3ff", color:"#7c3aed", label:"In Progress" },
  DONE:        { bg:"#ecfdf5", color:"#059669", label:"Done" },
  REJECTED:    { bg:"#fef2f2", color:"#dc2626", label:"Rejected" },
  DECLINED:    { bg:"#fff7ed", color:"#ea580c", label:"Declined" },
};

const TYPE_ICON   = { SELL:"🏷️", BUY:"🏠", RENT:"🔑", VALUATION:"📊" };
const SOURCE_ICON = { WEBSITE:"🌐", PHONE:"📞", EMAIL:"✉️", REFERRAL:"👥", SOCIAL:"📱" };

const fmtDate     = (d) => d ? new Date(d).toLocaleDateString("sq-AL") : "—";
const fmtDateTime = (d) => d ? new Date(d).toLocaleString("sq-AL",{ day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" }) : "—";
const fmtBudget   = (v) => v!=null ? `€${Number(v).toLocaleString("de-DE")}` : "—";

// Parse property_data embedded in lead message
function parsePropertyData(message) {
  if (!message) return null;
  const idx = message.indexOf(PROP_MARKER);
  if (idx===-1) return null;
  try { return JSON.parse(message.substring(idx + PROP_MARKER.length)); }
  catch { return null; }
}

function cleanMessage(message) {
  if (!message) return "";
  const idx = message.indexOf("\n--- Të dhënat e pronës ---");
  if (idx!==-1) return message.substring(0,idx).trim();
  const idx2 = message.indexOf(PROP_MARKER);
  if (idx2!==-1) return message.substring(0,message.lastIndexOf("\n",idx2)).trim();
  return message;
}

// ── UI helpers ────────────────────────────────────────────────────────────────
function Toast({ msg, type="success", onDone }) {
  useEffect(()=>{ const t=setTimeout(onDone,3200); return ()=>clearTimeout(t); },[onDone]);
  return (
    <div style={{ position:"fixed", bottom:28, right:28, zIndex:9999,
      background:type==="error"?"#fee2e2":"#ecfdf5",
      color:type==="error"?"#b91c1c":"#047857",
      padding:"12px 20px", borderRadius:10, fontSize:13.5, fontWeight:500,
      boxShadow:"0 4px 18px rgba(0,0,0,0.12)", maxWidth:340, animation:"fadeUp .25s ease" }}>
      {msg}
    </div>
  );
}

function Loader() {
  return (
    <div style={{ textAlign:"center", padding:"60px 0" }}>
      <div style={{ width:32, height:32, margin:"0 auto", border:"3px solid #e8edf4",
        borderTop:"3px solid #6366f1", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
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
  const s = STATUS_STYLE[status]||{ bg:"#f1f5f9", color:"#475569", label:status };
  return (
    <span style={{ background:s.bg, color:s.color, padding:"3px 10px", borderRadius:20,
      fontSize:11.5, fontWeight:600, display:"inline-flex", alignItems:"center", gap:5 }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:s.color, display:"inline-block" }} />
      {s.label}
    </span>
  );
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages<=1) return null;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6, justifyContent:"flex-end", padding:"14px 16px" }}>
      <button className="btn btn--secondary btn--sm" disabled={page===0} onClick={()=>onChange(page-1)}>← Prev</button>
      <span style={{ fontSize:13, color:"#64748b", padding:"0 8px" }}>{page+1} / {totalPages}</span>
      <button className="btn btn--secondary btn--sm" disabled={page>=totalPages-1} onClick={()=>onChange(page+1)}>Next →</button>
    </div>
  );
}

// ── Complete Confirmation Modal ───────────────────────────────────────────────
// Shfaqet kur agjenti klikon Complete në lead SELL/RENT me property_data
// Pyet nëse dëshiron të krijojë property automatikisht
function CompleteModal({ lead, onConfirm, onClose, loading }) {
  const propertyData = parsePropertyData(lead.message);
  const hasPropertyData = !!propertyData && (lead.type==="SELL"||lead.type==="RENT");
  const [createProperty, setCreateProperty] = useState(hasPropertyData);

  useEffect(() => {
    const h = (e) => e.key==="Escape" && onClose();
    window.addEventListener("keydown",h);
    return () => window.removeEventListener("keydown",h);
  }, [onClose]);

  return (
    <div style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(15,23,42,0.45)",
      display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ width:"100%", maxWidth:500, background:"#fff", borderRadius:16,
        boxShadow:"0 20px 60px rgba(15,23,42,0.18)", animation:"fadeUp .2s ease" }}>
        <div style={{ padding:"18px 24px", borderBottom:"1px solid #e8edf4" }}>
          <h3 style={{ fontWeight:600, fontSize:15, margin:0 }}>
            ✓ Konfirmo Complete — Lead #{lead.id}
          </h3>
        </div>
        <div style={{ padding:"22px 24px" }}>

          {hasPropertyData ? (
            <>
              <p style={{ fontSize:13.5, color:"#475569", marginBottom:16, lineHeight:1.6 }}>
                Ky lead <strong>{TYPE_ICON[lead.type]} {lead.type}</strong> ka të dhëna prone.
                Dëshironi t'i shtoni automatikisht si pronë të re në sistem?
              </p>

              {/* Property preview */}
              <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0",
                borderRadius:10, padding:"12px 16px", marginBottom:18 }}>
                <p style={{ fontSize:12, fontWeight:600, color:"#166534",
                  textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:8 }}>
                  🏠 Prona që do të krijohet
                </p>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                  {propertyData.title       && <span style={{ fontSize:13 }}>📌 {propertyData.title}</span>}
                  {propertyData.city        && <span style={{ fontSize:13 }}>📍 {propertyData.city}</span>}
                  {propertyData.property_type && <span style={{ fontSize:13 }}>🏗 {propertyData.property_type}</span>}
                  {propertyData.area_sqm    && <span style={{ fontSize:13 }}>📐 {propertyData.area_sqm} m²</span>}
                  {propertyData.bedrooms    && <span style={{ fontSize:13 }}>🛏 {propertyData.bedrooms} dhoma</span>}
                  {propertyData.price       && <span style={{ fontSize:13 }}>💰 {Number(propertyData.price).toLocaleString("de-DE")} {propertyData.currency}</span>}
                </div>
              </div>

              {/* Toggle */}
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20,
                padding:"10px 14px", background:"#f8fafc", borderRadius:8, cursor:"pointer" }}
                onClick={() => setCreateProperty(p=>!p)}>
                <div style={{ width:20, height:20, borderRadius:4,
                  background: createProperty ? "#059669" : "#e2e8f0",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  flexShrink:0, transition:"background .15s" }}>
                  {createProperty && <span style={{ color:"white", fontSize:12 }}>✓</span>}
                </div>
                <span style={{ fontSize:13.5, color:"#374151" }}>
                  Krijo pronën automatikisht në sistem pas Complete
                </span>
              </div>
            </>
          ) : (
            <p style={{ fontSize:13.5, color:"#475569", marginBottom:20, lineHeight:1.6 }}>
              A jeni i sigurt që dëshironi ta markoni si <strong>DONE</strong> lead-in #{lead.id}?
              Ky veprim është final dhe nuk mund të ndryshohet.
            </p>
          )}

          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <button className="btn btn--secondary" onClick={onClose} disabled={loading}>Anulo</button>
            <button className="btn btn--sm" disabled={loading}
              style={{ background:"#059669", color:"white", border:"none",
                padding:"8px 20px", borderRadius:8, cursor:"pointer", fontWeight:500 }}
              onClick={() => onConfirm(lead, createProperty && hasPropertyData, propertyData)}>
              {loading ? "Duke procesuar..." : "✓ Complete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Status Actions ────────────────────────────────────────────────────────────
function StatusActions({ lead, onStatusChange, onDecline, onCompleteClick, loading, isMyLead }) {
  const { status } = lead;

  if (status==="DONE"||status==="REJECTED") {
    return <span style={{ fontSize:12, color:"#94a3b8", fontStyle:"italic" }}>Final</span>;
  }

  if (!isMyLead) {
    if (status==="NEW" && !lead.assigned_agent_id) {
      return <span style={{ fontSize:11.5, color:"#64748b", background:"#f1f5f9", padding:"3px 10px", borderRadius:20 }}>🕐 Pa asignuar</span>;
    }
    if (status==="NEW" && lead.assigned_agent_id) {
      return <span style={{ fontSize:11.5, color:"#d97706", background:"#fffbeb", padding:"3px 10px", borderRadius:20 }}>⏳ Pret pranimin</span>;
    }
    return <span style={{ fontSize:11.5, color:"#94a3b8", background:"#f1f5f9", padding:"3px 10px", borderRadius:20, fontStyle:"italic" }}>Shiko vetëm</span>;
  }

  if (status==="NEW") {
    return (
      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
        <button className="btn btn--primary btn--sm" onClick={()=>onStatusChange(lead.id,"IN_PROGRESS")} disabled={loading}>▶ Accept</button>
        <button className="btn btn--secondary btn--sm" onClick={()=>onDecline(lead.id)} disabled={loading}
          style={{ color:"#ea580c", borderColor:"#fed7aa" }}>↩ Decline</button>
      </div>
    );
  }

  if (status==="IN_PROGRESS") {
    const hasPropertyData = !!parsePropertyData(lead.message) && (lead.type==="SELL"||lead.type==="RENT");
    return (
      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
        <button className="btn btn--sm" disabled={loading}
          style={{ background: hasPropertyData ? "#f0fdf4" : "#ecfdf5",
            color:"#059669", border:`1px solid ${hasPropertyData?"#86efac":"#a7f3d0"}` }}
          onClick={() => onCompleteClick(lead)}
          title={hasPropertyData ? "Complete + Krijo pronën automatikisht" : "Marko si të kryer"}>
          ✓ Complete{hasPropertyData ? " 🏠" : ""}
        </button>
        <button className="btn btn--danger btn--sm" onClick={()=>onStatusChange(lead.id,"REJECTED")} disabled={loading}>✕ Reject</button>
      </div>
    );
  }

  return null;
}

// ── Lead Detail Modal ─────────────────────────────────────────────────────────
function LeadDetailModal({ lead, onClose, onStatusChange, onDecline, onCompleteClick, statusLoading, isMyLead }) {
  const { user } = useContext(AuthContext);
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
      <div style={{ width:"100%", maxWidth:600, background:"#fff", borderRadius:16,
        boxShadow:"0 20px 60px rgba(15,23,42,0.18)", maxHeight:"90vh", overflowY:"auto", animation:"fadeUp .2s ease" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"18px 24px", borderBottom:"1px solid #e8edf4" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:22 }}>{TYPE_ICON[lead.type]||"📋"}</span>
            <div>
              <h3 style={{ fontWeight:600, fontSize:15, margin:0 }}>Lead #{lead.id} — {lead.type}</h3>
              <p style={{ fontSize:12, color:"#64748b", margin:0 }}>Krijuar: {fmtDateTime(lead.created_at)}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width:30, height:30, border:"none", background:"none", color:"#94a3b8", cursor:"pointer", fontSize:16 }}>✕</button>
        </div>

        <div style={{ padding:"22px 24px" }}>
          {/* Banner */}
          {!isMyLead && (
            <div style={{ background:"#fffbeb", border:"1px solid #fde68a", borderRadius:8,
              padding:"10px 14px", marginBottom:18, fontSize:13, color:"#92400e",
              display:"flex", alignItems:"center", gap:8 }}>
              <span>ℹ️</span>
              <span>
                {!lead.assigned_agent_id
                  ? "Ky lead nuk i është asignuar ende asnjë agjenti."
                  : lead.assigned_agent_id===user?.id
                    ? "Ky lead ju është asignuar juve."
                    : `Ky lead i është asignuar agjentit ${lead.agent_name||`#${lead.assigned_agent_id}`}.`}
              </span>
            </div>
          )}

          {/* Status + actions */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
            marginBottom:20, padding:"12px 16px", background:"#f8fafc", borderRadius:10, border:"1px solid #e8edf4" }}>
            <div>
              <p style={{ fontSize:11, color:"#94a3b8", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:5 }}>Statusi</p>
              <StatusBadge status={lead.status} />
            </div>
            <StatusActions lead={lead} onStatusChange={onStatusChange} onDecline={onDecline}
              onCompleteClick={onCompleteClick} loading={statusLoading} isMyLead={isMyLead} />
          </div>

          {/* Property data panel (SELL/RENT) */}
          {propertyData && (lead.type==="SELL"||lead.type==="RENT") && (
            <div style={{ background: lead.type==="SELL"?"#fef9ff":"#f0fdf4",
              border:`1px solid ${lead.type==="SELL"?"#e9d5ff":"#bbf7d0"}`,
              borderRadius:10, padding:"14px 16px", marginBottom:18 }}>
              <p style={{ fontSize:12, fontWeight:600,
                color: lead.type==="SELL"?"#7c3aed":"#166534",
                textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>
                🏠 Të dhënat e pronës nga klienti
                {lead.status==="IN_PROGRESS" && isMyLead && (
                  <span style={{ fontSize:11, fontWeight:400, color:"#94a3b8", marginLeft:8 }}>
                    — do të krijohet automatikisht pas Complete
                  </span>
                )}
              </p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {propertyData.title         && <span style={{ fontSize:13 }}>📌 {propertyData.title}</span>}
                {propertyData.city          && <span style={{ fontSize:13 }}>📍 {propertyData.city}</span>}
                {propertyData.property_type && <span style={{ fontSize:13 }}>🏗 {propertyData.property_type}</span>}
                {propertyData.area_sqm      && <span style={{ fontSize:13 }}>📐 {propertyData.area_sqm} m²</span>}
                {propertyData.bedrooms      && <span style={{ fontSize:13 }}>🛏 {propertyData.bedrooms} dhoma</span>}
                {propertyData.bathrooms     && <span style={{ fontSize:13 }}>🚿 {propertyData.bathrooms} banjo</span>}
                {propertyData.floor         && <span style={{ fontSize:13 }}>🏢 Kati {propertyData.floor}</span>}
                {propertyData.year_built    && <span style={{ fontSize:13 }}>🗓 Ndërtuar: {propertyData.year_built}</span>}
                {propertyData.price         && <span style={{ fontSize:13 }}>💰 {Number(propertyData.price).toLocaleString("de-DE")} {propertyData.currency}</span>}
              </div>
              {propertyData.street && <p style={{ fontSize:13, marginTop:8, color:"#475569" }}>📍 {propertyData.street}</p>}
              {propertyData.description && (
                <p style={{ fontSize:13, marginTop:8, color:"#475569", fontStyle:"italic", lineHeight:1.5 }}>
                  "{propertyData.description}"
                </p>
              )}
            </div>
          )}

          {/* Info grid */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:18 }}>
            {[
              { label:"Klienti",        value:lead.client_name||`#${lead.client_id}` },
              { label:"Agjenti",        value:lead.agent_name||(lead.assigned_agent_id?`#${lead.assigned_agent_id}`:"—") },
              { label:"Tipi",           value:`${TYPE_ICON[lead.type]||""} ${lead.type}` },
              { label:"Burimi",         value:`${SOURCE_ICON[lead.source]||""} ${lead.source}` },
              { label:"Buxheti",        value:fmtBudget(lead.budget) },
              { label:"Data preferuar", value:fmtDate(lead.preferred_date) },
            ].map(({label,value})=>(
              <div key={label} style={{ background:"#f8fafc", borderRadius:8, padding:"10px 14px", border:"1px solid #e8edf4" }}>
                <p style={{ fontSize:11, color:"#94a3b8", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>{label}</p>
                <p style={{ fontSize:13.5, fontWeight:500, color:"#0f172a" }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Clean message */}
          {lead.message && cleanMessage(lead.message) && (
            <div style={{ background:"#f8fafc", border:"1px solid #e8edf4", borderRadius:10, padding:"14px 16px" }}>
              <p style={{ fontSize:11, color:"#94a3b8", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8 }}>Mesazhi</p>
              <p style={{ fontSize:13.5, color:"#374151", lineHeight:1.6 }}>{cleanMessage(lead.message)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Lead Row ──────────────────────────────────────────────────────────────────
function LeadRow({ lead, onView, onStatusChange, onDecline, onCompleteClick, statusLoading, isMyLead }) {
  return (
    <tr>
      <td style={{ color:"#94a3b8", fontSize:12 }}>{lead.id}</td>
      <td>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontSize:16 }}>{TYPE_ICON[lead.type]||"📋"}</span>
          <span style={{ fontWeight:500, fontSize:13.5 }}>{lead.type}</span>
        </div>
      </td>
      <td><p style={{ fontWeight:500, fontSize:13, margin:0 }}>{lead.client_name||`#${lead.client_id}`}</p></td>
      <td style={{ fontSize:12.5, color:"#475569" }}>
        {lead.property_title || (lead.property_id ? `#${lead.property_id}` : "—")}
      </td>
      {!isMyLead && (
        <td>
          {lead.agent_name
            ? <span style={{ fontWeight:500, fontSize:13 }}>{lead.agent_name}</span>
            : <span style={{ color:"#94a3b8", fontSize:12, fontStyle:"italic" }}>Pa agjent</span>}
        </td>
      )}
      <td style={{ fontSize:12.5, color:"#64748b" }}>{SOURCE_ICON[lead.source]} {lead.source}</td>
      <td style={{ fontWeight:600, fontSize:13 }}>{fmtBudget(lead.budget)}</td>
      <td><StatusBadge status={lead.status} /></td>
      <td style={{ fontSize:12, color:"#94a3b8" }}>{fmtDate(lead.created_at)}</td>
      <td>
        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
          <button className="btn btn--ghost btn--sm" onClick={()=>onView(lead)}>View</button>
          <StatusActions lead={lead} onStatusChange={onStatusChange} onDecline={onDecline}
            onCompleteClick={onCompleteClick} loading={statusLoading} isMyLead={isMyLead} />
        </div>
      </td>
    </tr>
  );
}

// ══ MAIN PAGE ═════════════════════════════════════════════════════════════════
export default function AgentLeads() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("my");
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState("NEW");
  const [propertyId, setPropertyId] = useState("");
  const [selectedLead, setSelectedLead] = useState(null);
  const [completeTarget, setCompleteTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [stats, setStats] = useState({ new:0, inProgress:0, done:0, rejected:0 });

  const notify = useCallback((msg, type="success") => setToast({ msg, type, key:Date.now() }), []);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      let url;
      if (activeTab==="my")       url = `/api/leads/my/agent?page=${page}&size=15`;
      else if (activeTab==="all") url = `/api/leads?status=${statusFilter}&page=${page}&size=15`;
      else { setLoading(false); return; }

      const res = await api.get(url);
      const data = res.data;
      if (data.content!==undefined) { setLeads(data.content||[]); setTotalPages(data.totalPages||0); }
      else { setLeads(Array.isArray(data)?data:[]); setTotalPages(1); }
    } catch { notify("Gabim gjatë ngarkimit","error"); }
    finally { setLoading(false); }
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
    if (!propertyId) { notify("Shkruaj Property ID","error"); return; }
    setLoading(true);
    try {
      const res = await api.get(`/api/leads/property/${propertyId}`);
      setLeads(Array.isArray(res.data)?res.data:[]); setTotalPages(1);
    } catch { notify("Prona nuk u gjet","error"); }
    finally { setLoading(false); }
  };

  // ── Status change ────────────────────────────────────────────────────────
  const handleStatusChange = async (id, newStatus) => {
    setStatusLoading(true);
    try {
      await api.patch(`/api/leads/${id}/status`, { status:newStatus });
      notify(`Lead #${id} → ${newStatus}`);
      setLeads(prev => prev.map(l => l.id===id ? {...l, status:newStatus} : l));
      if (selectedLead?.id===id) setSelectedLead(prev => ({...prev, status:newStatus}));
    } catch (err) { notify(err.response?.data?.message||"Gabim","error"); }
    finally { setStatusLoading(false); }
  };

  // ── Decline ──────────────────────────────────────────────────────────────
  const handleDecline = async (id) => {
    setStatusLoading(true);
    try {
      await api.patch(`/api/leads/${id}/decline`);
      notify(`Lead #${id} u kthye tek admini`);
      setLeads(prev => prev.filter(l => l.id!==id));
      if (selectedLead?.id===id) setSelectedLead(null);
    } catch (err) { notify(err.response?.data?.message||"Gabim gjatë decline","error"); }
    finally { setStatusLoading(false); }
  };

  // ── Complete + auto-create property ─────────────────────────────────────
const handleCompleteConfirm = async (lead, shouldCreateProperty, propertyData) => {
  setStatusLoading(true);
  try {
    if (shouldCreateProperty && propertyData && user?.id) {
      const propPayload = {
        agent_id:     user.id,
        title:        propertyData.title,
        type:         propertyData.property_type || "APARTMENT",
        status:       "AVAILABLE",
        listing_type: lead.type === "SELL" ? "SALE" : "RENT",
        description:  propertyData.description || null,
        price:        propertyData.price ? Number(propertyData.price) : null,
        currency:     propertyData.currency || "EUR",
        area_sqm:     propertyData.area_sqm ? Number(propertyData.area_sqm) : null,
        bedrooms:     propertyData.bedrooms ? Number(propertyData.bedrooms) : null,
        bathrooms:    propertyData.bathrooms ? Number(propertyData.bathrooms) : null,
        floor:        propertyData.floor ? Number(propertyData.floor) : null,
        year_built:   propertyData.year_built ? Number(propertyData.year_built) : null,
        address: propertyData.city ? {
          city:   propertyData.city,
          street: propertyData.street || null,
        } : null,
      };

      try {
        const propRes = await api.post("/api/properties", propPayload);
        const newPropertyId = propRes.data.id;

        // ── SHTUAR: lidh lead-in me property_id e krijuar ──────────────
        await api.patch(`/api/leads/${lead.id}/property`, {
          property_id: newPropertyId,
        });

        notify(`✓ Lead #${lead.id} u mbyll + Prona "${propertyData.title}" (ID: #${newPropertyId}) u shtua dhe u lidh!`);
      } catch (propErr) {
        console.warn("Property creation/linking failed:", propErr);
        notify(
          `Lead u mbyll por prona nuk u krijua: ${propErr.response?.data?.message || "gabim"}`,
          "error"
        );
      }
    }

    // Complete lead-in
    await api.patch(`/api/leads/${lead.id}/status`, { status: "DONE" });

    if (!shouldCreateProperty) notify(`Lead #${lead.id} → DONE`);

    setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: "DONE" } : l));
    if (selectedLead?.id === lead.id) setSelectedLead(prev => ({ ...prev, status: "DONE" }));
    setCompleteTarget(null);

  } catch (err) {
    notify(err.response?.data?.message || "Gabim gjatë Complete", "error");
  } finally {
    setStatusLoading(false);
  }
};

  const handleTabChange = (tab) => { setActiveTab(tab); setPage(0); setLeads([]); };
  const isMyLeadsTab = activeTab==="my";

  const statCards = [
    { label:"New",         value:stats.new,        color:"#2563eb", bg:"#eff6ff" },
    { label:"In Progress", value:stats.inProgress,  color:"#7c3aed", bg:"#f5f3ff" },
    { label:"Done",        value:stats.done,        color:"#059669", bg:"#ecfdf5" },
    { label:"Rejected",    value:stats.rejected,    color:"#dc2626", bg:"#fef2f2" },
  ];

  return (
    <MainLayout role="agent">
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px);} to{opacity:1;transform:translateY(0);} }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="page-header">
        <div>
          <h1 className="page-title">Leads Management</h1>
          <p className="page-subtitle">Menaxho kërkesat e klientëve dhe gjurmo progresin</p>
        </div>
      </div>

      {isMyLeadsTab && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
          {statCards.map(s=>(
            <div key={s.label} className="stat-card">
              <div className="stat-card__label">{s.label}</div>
              <div className="stat-card__value" style={{ color:s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Flow guide */}
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:20, padding:"11px 16px",
        background: isMyLeadsTab?"#f0fdf4":"#f0f4ff", borderRadius:10,
        border:`1px solid ${isMyLeadsTab?"#bbf7d0":"#c7d7fe"}`, fontSize:13, flexWrap:"wrap" }}>
        {isMyLeadsTab ? (
          <>
            <span>🔵 NEW</span><span style={{ color:"#94a3b8" }}>→</span>
            <span style={{ color:"#6366f1", fontWeight:600 }}>▶ Accept</span><span style={{ color:"#94a3b8" }}>→</span>
            <span>🟣 IN_PROGRESS</span><span style={{ color:"#94a3b8" }}>→</span>
            <span style={{ color:"#059669", fontWeight:600 }}>✓ Complete 🏠</span><span style={{ color:"#94a3b8" }}>→</span>
            <span>🟢 DONE + prona krijohet</span>
            <span style={{ color:"#94a3b8", margin:"0 4px" }}>|</span>
            <span style={{ color:"#ea580c", fontWeight:600 }}>↩ Decline</span><span style={{ color:"#94a3b8" }}>→ tek admini</span>
            <span style={{ color:"#94a3b8", margin:"0 4px" }}>|</span>
            <span style={{ color:"#dc2626", fontWeight:600 }}>✕ Reject</span><span style={{ color:"#94a3b8" }}>→ 🔴 REJECTED (final)</span>
          </>
        ) : (
          <>
            <span>ℹ️</span>
            <span style={{ color:"#3730a3" }}>Leads <strong>NEW</strong> presin asignimin nga admini. Menaxho nga tab-i <strong>My Leads</strong>.</span>
          </>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:10 }}>
        <div style={{ display:"flex", gap:4, borderBottom:"1px solid #e8edf4", paddingBottom:0 }}>
          {[{id:"my",label:"My Leads",icon:"👤"},{id:"all",label:"All Leads",icon:"📋"},{id:"property",label:"By Property",icon:"🏠"}].map(t=>(
            <button key={t.id} onClick={()=>handleTabChange(t.id)} style={{
              padding:"9px 16px", border:"none",
              borderBottom: activeTab===t.id?"2px solid #6366f1":"2px solid transparent",
              background:"none", color: activeTab===t.id?"#6366f1":"#64748b",
              fontWeight: activeTab===t.id?600:400, fontSize:13.5, cursor:"pointer",
              fontFamily:"inherit", marginBottom:-1, display:"flex", alignItems:"center", gap:5 }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          {activeTab==="all" && (
            <select className="form-select" style={{ height:34, padding:"0 10px", fontSize:13, width:160 }}
              value={statusFilter} onChange={e=>{ setStatusFilter(e.target.value); setPage(0); }}>
              {LEAD_STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          )}
          {activeTab==="property" && (
            <>
              <input className="form-input" style={{ height:34, padding:"0 10px", fontSize:13, width:130 }}
                type="number" placeholder="Property ID..." value={propertyId}
                onChange={e=>setPropertyId(e.target.value)} onKeyDown={e=>e.key==="Enter"&&fetchByProperty()} />
              <button className="btn btn--primary btn--sm" onClick={fetchByProperty}>Search</button>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">
            {activeTab==="my" ? "My Assigned Leads" : activeTab==="all" ? `All Leads — ${statusFilter}` : "Leads by Property"}
          </h2>
          {leads.length>0 && (
            <span style={{ background:"#eef2ff", color:"#6366f1", padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:500 }}>
              {leads.length} leads
            </span>
          )}
        </div>

        {loading ? <Loader /> : leads.length===0 ? (
          <EmptyState icon={activeTab==="property"?"🔍":"📭"}
            text={activeTab==="property"?"Shkruaj Property ID dhe kliko Search":"Nuk ka leads në këtë kategori"}
            subtext={activeTab==="my"?"Leads do të shfaqen kur admini t'i asignojë tek ju":undefined} />
        ) : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th><th>Tipi</th><th>Klienti</th><th>Prona</th>
                    {!isMyLeadsTab && <th>Agjenti</th>}
                    <th>Burimi</th><th>Buxheti</th><th>Statusi</th><th>Krijuar</th><th>Veprime</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map(lead=>(
                    <LeadRow key={lead.id} lead={lead} onView={setSelectedLead}
                      onStatusChange={handleStatusChange} onDecline={handleDecline}
                      onCompleteClick={setCompleteTarget}
                      statusLoading={statusLoading} isMyLead={isMyLeadsTab} />
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </div>

      {selectedLead && (
        <LeadDetailModal lead={selectedLead} onClose={()=>setSelectedLead(null)}
          onStatusChange={handleStatusChange} onDecline={handleDecline}
          onCompleteClick={setCompleteTarget}
          statusLoading={statusLoading} isMyLead={isMyLeadsTab} />
      )}

      {completeTarget && (
        <CompleteModal lead={completeTarget}
          onClose={()=>setCompleteTarget(null)}
          onConfirm={handleCompleteConfirm}
          loading={statusLoading} />
      )}

      {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={()=>setToast(null)} />}
    </MainLayout>
  );
}