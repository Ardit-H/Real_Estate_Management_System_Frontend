import { useState, useEffect, useCallback, useContext  } from "react";
import { AuthContext } from "../../context/AuthProvider";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";

const INP_S = {width:"100%",padding:"10px 13px",border:"1.5px solid #e4ddd0",borderRadius:10,fontSize:13.5,color:"#1a1714",background:"#fff",fontFamily:"'DM Sans',sans-serif",boxSizing:"border-box",outline:"none",transition:"border-color 0.2s"};
const SEL_S = {...INP_S,cursor:"pointer"};
const BTN_PRI = {padding:"10px 22px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#c9b87a,#b0983e)",color:"#1a1714",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"};
const BTN_SEC = {padding:"10px 18px",borderRadius:10,border:"1.5px solid #e4ddd0",background:"transparent",color:"#6b6248",fontWeight:500,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"};
 
 
// ─── Global CSS ───────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
 
  .sa * { box-sizing: border-box; }
  .sa { font-family: 'DM Sans', system-ui, sans-serif; background: #f2ede4; min-height: 100vh; }
 
  .sa-card {
    background: #faf7f2;
    border: 1.5px solid #e8e2d6;
    border-radius: 14px;
    box-shadow: 0 2px 16px rgba(20,16,10,0.06);
    overflow: hidden;
  }
 
  .sa-btn {
    transition: all 0.17s ease;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    border: none;
  }
  .sa-btn:hover { opacity: 0.85; transform: translateY(-1px); }
  .sa-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
 
  @keyframes sa-fade-up  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes sa-pulse    { 0%,100%{opacity:.4} 50%{opacity:.85} }
  @keyframes sa-toast    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes sa-spin     { to{transform:rotate(360deg)} }
  @keyframes sa-modal-in { from{opacity:0;transform:translateY(14px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes sa-row-in   { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
 
  .sa-section  { animation: sa-fade-up 0.5s ease 0.15s both; }
  .sa-row:hover { background: #f5f0e8 !important; }
  .sa-row { animation: sa-row-in 0.3s ease both; }
 
  .sa-skeleton {
    background: #ede9df;
    border-radius: 10px;
    animation: sa-pulse 1.5s ease infinite;
  }
 
  .sa-stat { animation: sa-fade-up 0.4s ease both; }
  .sa-stat:nth-child(1) { animation-delay: 0.05s; }
  .sa-stat:nth-child(2) { animation-delay: 0.10s; }
  .sa-stat:nth-child(3) { animation-delay: 0.15s; }
  .sa-stat:nth-child(4) { animation-delay: 0.20s; }
  .sa-stat:nth-child(5) { animation-delay: 0.25s; }
 
  .sa-table { width: 100%; border-collapse: collapse; }
  .sa-table th {
    text-align: left; font-size: 10px; font-weight: 600;
    color: #b0a890; text-transform: uppercase; letter-spacing: 0.9px;
    padding: 10px 16px; background: #fdf9f4;
    border-bottom: 1px solid #e8e2d6; white-space: nowrap;
  }
  .sa-table td {
    padding: 13px 16px; font-size: 13px; color: #1a1714;
    border-bottom: 1px solid #e8e2d6; vertical-align: middle;
  }
  .sa-table tr:last-child td { border-bottom: none; }
  .sa-table-wrap { overflow-x: auto; }
 
  .sa-input {
    padding: 9px 13px;
    border: 1.5px solid #e0dbd0;
    border-radius: 10px;
    font-size: 13.5px;
    font-family: 'DM Sans', sans-serif;
    color: #1a1714;
    background: #f5f0e8;
    outline: none;
    transition: border-color 0.17s, box-shadow 0.17s, background 0.17s;
  }
  .sa-input:focus {
    border-color: #c9b87a;
    background: #faf7f2;
    box-shadow: 0 0 0 3px rgba(201,184,122,0.12);
  }
  .sa-input::placeholder { color: #b0a890; }
 
  .sa-select {
    padding: 9px 13px;
    border: 1.5px solid #e0dbd0;
    border-radius: 10px;
    font-size: 13.5px;
    font-family: 'DM Sans', sans-serif;
    color: #1a1714;
    background: #f5f0e8;
    outline: none;
    cursor: pointer;
    transition: border-color 0.17s, box-shadow 0.17s, background 0.17s;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23b0a890' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 32px;
  }
  .sa-select:focus {
    border-color: #c9b87a;
    background-color: #faf7f2;
    box-shadow: 0 0 0 3px rgba(201,184,122,0.12);
  }
 
  .sa-textarea {
    width: 100%; padding: 10px 13px;
    border: 1.5px solid #e0dbd0; border-radius: 10px;
    font-size: 13.5px; font-family: 'DM Sans', sans-serif;
    color: #1a1714; background: #f5f0e8;
    outline: none; resize: vertical;
    transition: border-color 0.17s, box-shadow 0.17s, background 0.17s;
  }
  .sa-textarea:focus {
    border-color: #c9b87a; background: #faf7f2;
    box-shadow: 0 0 0 3px rgba(201,184,122,0.12);
  }
  .sa-textarea::placeholder { color: #b0a890; }
 
  .sa-char-count { font-size: 11px; color: #b0a890; text-align: right; margin-top: 4px; }
 
  .sa-tab {
    padding: 10px 20px; font-size: 13px; font-weight: 500;
    border: none; background: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    color: #9a8c6e; border-bottom: 2px solid transparent;
    transition: all 0.16s ease;
  }
  .sa-tab:hover { color: #1a1714; }
  .sa-tab.active { color: #1a1714; border-bottom-color: #c9b87a; font-weight: 600; }
 
  .sa-chip {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 11px; border-radius: 20px; font-size: 11px; font-weight: 600;
    white-space: nowrap;
  }
`;
 
// ─── Palette ─────────────────────────────────────────────────────────────────
const C = {
  bg: "#f2ede4", surface: "#faf7f2", dark: "#1a1714",
  gold: "#c9b87a", goldL: "#e8d9a0",
  muted: "#9a8c6e", border: "#e8e2d6",
  text: "#1a1714", textSub: "#6b6340", textMut: "#b0a890",
};
 
const STATUS_CFG = {
  PENDING:   { color: "#d97706", bg: "#fffbeb", dot: "#d97706" },
  APPROVED:  { color: "#059669", bg: "#ecfdf5", dot: "#059669" },
  REJECTED:  { color: "#dc2626", bg: "#fef2f2", dot: "#dc2626" },
  CANCELLED: { color: "#64748b", bg: "#f1f5f9", dot: "#64748b" },
};
 
// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate  = (d) => d ? new Date(d).toLocaleDateString("sq-AL") : "—";
const fmtDT    = (d) => d ? new Date(d).toLocaleString("sq-AL", {
  day: "2-digit", month: "2-digit", year: "numeric",
  hour: "2-digit", minute: "2-digit" }) : "—";
const fmtMoney = (v, c = "EUR") =>
  v != null ? new Intl.NumberFormat("de-DE", { style: "currency", currency: c, maximumFractionDigits: 0 }).format(v) : "—";
 
function validateInput({ mode, listingId, propertyId, agentMode, statusFilter }, notify) {
  if (mode === "listing") {
    if (!listingId || !listingId.toString().trim()) { notify("Shkruaj Listing ID", "error"); return false; }
    if (isNaN(Number(listingId)) || Number(listingId) <= 0) { notify("Listing ID duhet të jetë numër pozitiv", "error"); return false; }
  }
  if (mode === "property") {
    if (!propertyId || !propertyId.toString().trim()) { notify("Shkruaj Property ID", "error"); return false; }
    if (isNaN(Number(propertyId)) || Number(propertyId) <= 0) { notify("Property ID duhet të jetë numër pozitiv", "error"); return false; }
  }
  return true;
}
 
function validateRejection(reason, notify) {
  if (reason && reason.length > 500) { notify("Arsyeja nuk mund të kalojë 500 karaktere", "error"); return false; }
  return true;
}
 
function Modal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const h = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [onClose]);
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{position:"fixed",inset:0,zIndex:2000,background:"rgba(8,6,4,0.84)",backdropFilter:"blur(14px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{width:"100%",maxWidth:wide?720:520,background:"#faf7f2",borderRadius:18,boxShadow:"0 44px 100px rgba(0,0,0,0.55)",maxHeight:"92vh",overflowY:"auto"}}>
        <div style={{background:"linear-gradient(160deg,#141210 0%,#1e1a14 45%,#241e16 100%)",padding:"18px 24px",borderBottom:"1px solid rgba(201,184,122,0.14)",display:"flex",alignItems:"center",justifyContent:"space-between",borderRadius:"18px 18px 0 0",position:"relative"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:"linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)",borderRadius:"18px 18px 0 0"}}/>
          <span style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontWeight:700,fontSize:17,color:"#f5f0e8"}}>{title}</span>
          <button onClick={onClose} style={{background:"rgba(245,240,232,0.08)",border:"1px solid rgba(245,240,232,0.12)",borderRadius:8,width:30,height:30,cursor:"pointer",color:"rgba(245,240,232,0.6)",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
        <div style={{padding:"22px 24px"}}>{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children, required }) {
  return (
    <div style={{marginBottom:14}}>
      <label style={{display:"block",fontSize:10.5,fontWeight:600,color:"#9a8c6e",textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:6,fontFamily:"'DM Sans',sans-serif"}}>
        {label}{required && <span style={{color:"#c0392b",marginLeft:2}}>*</span>}
      </label>
      {children}
    </div>
  );
}

function FormRow({ children }) {
  return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>{children}</div>;
}

function ContractModal({ initial, prefill, onClose, onSuccess, notify }) {
  const [form, setForm] = useState({
    property_id: initial?.property_id ?? prefill?.propertyId ?? "",
    listing_id:  initial?.listing_id  ?? prefill?.listingId  ?? "",
    buyer_id:    initial?.buyer_id    ?? prefill?.buyerId    ?? "",
    sale_price:  initial?.sale_price  ?? prefill?.price      ?? "",
    currency:    initial?.currency    ?? "EUR",
    contract_date:     initial?.contract_date     ?? "",
    handover_date:     initial?.handover_date     ?? "",
    contract_file_url: initial?.contract_file_url ?? "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({...p, [k]: v}));

  const handleSubmit = async () => {
    if (!form.property_id || !form.buyer_id || !form.sale_price) {
      notify("Property ID, Buyer ID dhe çmimi janë të detyrueshme", "error"); return;
    }
    setSaving(true);
    try {
      const payload = {
        property_id:       Number(form.property_id),
        listing_id:        form.listing_id ? Number(form.listing_id) : null,
        buyer_id:          Number(form.buyer_id),
        sale_price:        Number(form.sale_price),
        currency:          form.currency,
        contract_date:     form.contract_date     || null,
        handover_date:     form.handover_date     || null,
        contract_file_url: form.contract_file_url || null,
      };
      initial
        ? await api.put(`/api/sales/contracts/${initial.id}`, payload)
        : await api.post("/api/sales/contracts", payload);
      onSuccess();
    } catch (err) { notify(err.response?.data?.message || "Gabim", "error"); }
    finally { setSaving(false); }
  };

  return (
    <Modal title={initial ? `Edit Contract #${initial.id}` : "New Sale Contract"} onClose={onClose} wide>
      <FormRow>
        <Field label="Property ID" required>
          <input className="sa-input" style={INP_S} type="number" value={form.property_id}
            onChange={e => set("property_id", e.target.value)} disabled={!!initial} placeholder="ex: 42"/>
        </Field>
        <Field label="Listing ID">
          <input className="sa-input" style={INP_S} type="number" value={form.listing_id}
            onChange={e => set("listing_id", e.target.value)} placeholder="(opcional)"/>
        </Field>
      </FormRow>
      <FormRow>
        <Field label="Buyer ID" required>
          <input className="sa-input" style={INP_S} type="number" value={form.buyer_id}
            onChange={e => set("buyer_id", e.target.value)} disabled={!!initial} placeholder="ID e blerësit"/>
        </Field>
        <Field label="Sale Price" required>
          <input className="sa-input" style={INP_S} type="number" value={form.sale_price}
            onChange={e => set("sale_price", e.target.value)} placeholder="ex: 145000"/>
        </Field>
      </FormRow>
      <FormRow>
        <Field label="Currency">
          <select className="sa-select" style={SEL_S} value={form.currency} onChange={e => set("currency", e.target.value)}>
            <option>EUR</option><option>USD</option><option>ALL</option>
          </select>
        </Field>
        <Field label="Contract Date">
          <input className="sa-input" style={INP_S} type="date" value={form.contract_date}
            onChange={e => set("contract_date", e.target.value)}/>
        </Field>
      </FormRow>
      <FormRow>
        <Field label="Handover Date">
          <input className="sa-input" style={INP_S} type="date" value={form.handover_date}
            onChange={e => set("handover_date", e.target.value)} min={form.contract_date || undefined}/>
        </Field>
        <Field label="Contract File URL">
          <input className="sa-input" style={INP_S} value={form.contract_file_url}
            onChange={e => set("contract_file_url", e.target.value)} placeholder="https://..."/>
        </Field>
      </FormRow>
      <div style={{display:"flex",gap:9,justifyContent:"flex-end",marginTop:6}}>
        <button style={BTN_SEC} onClick={onClose}>Anulo</button>
        <button style={BTN_PRI} onClick={handleSubmit} disabled={saving}>
          {saving ? "Duke ruajtur..." : initial ? "Ruaj ndryshimet" : "Krijo kontratë"}
        </button>
      </div>
    </Modal>
  );
}
// ─── Shared Components ────────────────────────────────────────────────────────
function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position: "fixed", bottom: 26, right: 26, zIndex: 9999,
      background: C.dark, color: type === "error" ? "#f09090" : "#90c8a8",
      padding: "11px 18px", borderRadius: 12, fontSize: 13,
      boxShadow: "0 10px 36px rgba(0,0,0,0.32)",
      border: `1px solid ${type === "error" ? "rgba(240,128,128,0.15)" : "rgba(144,200,168,0.15)"}`,
      fontFamily: "'DM Sans',sans-serif", animation: "sa-toast 0.2s ease",
      display: "flex", alignItems: "center", gap: 8, maxWidth: 360,
    }}>
      {type === "error" ? "⚠️" : "✅"} {msg}
    </div>
  );
}
 
function Skeleton({ rows = 5, h = 56 }) {
  return (
    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="sa-skeleton" style={{ height: h, opacity: 1 - i * 0.13 }} />
      ))}
    </div>
  );
}
 
function EmptyState({ icon, title, sub }) {
  return (
    <div style={{ padding: "56px 20px", textAlign: "center", color: C.textMut }}>
      <div style={{ fontSize: 42, marginBottom: 12 }}>{icon}</div>
      <p style={{ fontSize: 14, fontWeight: 600, color: C.textSub, margin: "0 0 5px",
        fontFamily: "'Cormorant Garamond',Georgia,serif" }}>{title}</p>
      {sub && <p style={{ fontSize: 12.5, margin: 0, lineHeight: 1.6 }}>{sub}</p>}
    </div>
  );
}
 
function StatusPill({ status }) {
  const s = STATUS_CFG[status] || { color: "#64748b", bg: "#f1f5f9", dot: "#64748b" };
  return (
    <span className="sa-chip" style={{ background: s.bg, color: s.color }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot, display: "inline-block", flexShrink: 0 }} />
      {status}
    </span>
  );
}
 
function StatCard({ icon, label, value, accent = C.gold, delay = 0 }) {
  return (
    <div className="sa-stat sa-card" style={{
      padding: "18px 20px", display: "flex", alignItems: "center", gap: 14,
      animationDelay: `${delay}s`,
    }}>
      <div style={{
        width: 46, height: 46, borderRadius: 12, flexShrink: 0,
        background: `${accent}18`, border: `1.5px solid ${accent}28`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 10, fontWeight: 600, color: C.textMut,
          textTransform: "uppercase", letterSpacing: "0.9px", marginBottom: 3 }}>{label}</p>
        <p style={{ margin: 0, fontSize: 26, fontWeight: 700, color: C.text,
          fontFamily: "'Cormorant Garamond',Georgia,serif", letterSpacing: "-0.5px", lineHeight: 1 }}>
          {value ?? "—"}
        </p>
      </div>
    </div>
  );
}
 
function SectionHeader({ title, count, badge, children }) {
  return (
    <div style={{
      padding: "14px 20px", borderBottom: `1px solid ${C.border}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: "#fdf9f4", flexWrap: "wrap", gap: 10,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text,
          fontFamily: "'Cormorant Garamond',Georgia,serif" }}>{title}</p>
        {count != null && (
          <span style={{ background: `${C.gold}22`, color: C.textSub,
            padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
            {count}
          </span>
        )}
        {badge}
      </div>
      {children}
    </div>
  );
}
 
// ─── App Detail Modal ─────────────────────────────────────────────────────────
function AppDetailModal({ app, onClose, onUpdateStatus, notify, onCreateContract, currentUserId  }) {
  const [rejReason,  setRejReason]  = useState(app.rejection_reason || "");
  const [showReject, setShowReject] = useState(false);
  const [saving,     setSaving]     = useState(false);
 
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
 
  const handleApprove = async () => {
    setSaving(true);
    await onUpdateStatus(app.id, "APPROVED", null);
    setSaving(false);
  };
 
  const handleReject = async () => {
    if (!validateRejection(rejReason, notify)) return;
    setSaving(true);
    await onUpdateStatus(app.id, "REJECTED", rejReason || null);
    setSaving(false);
    setShowReject(false);
  };
 
  const handleCancel = async () => {
    setSaving(true);
    await onUpdateStatus(app.id, "CANCELLED", null);
    setSaving(false);
  };
 
  const infoFields = [
    { label: "Buyer",  value: app.buyer_name || `#${app.buyer_id}` },
    { label: "Listing ID",        value: app.listing_id  ? `#${app.listing_id}`  : "—"             },
    { label: "Property ID",       value: app.property_id ? `#${app.property_id}` : "—"             },
    { label: "Agent",  value: app.agent_name || (app.agent_id ? `#${app.agent_id}` : "—") },
    { label: "Offer Price",       value: fmtMoney(app.offer_price)                                  },
    { label: "Monthly Income",    value: fmtMoney(app.monthly_income)                               },
    { label: "Purchase Date",     value: fmtDate(app.desired_purchase_date)                         },
    { label: "Krijuar më",        value: fmtDT(app.created_at)                                      },
    { label: "Ndryshuar",         value: fmtDT(app.updated_at)                                      },
  ];
 
  const isOwner          = app.agent_id === currentUserId;
  const canApproveReject = app.status === "PENDING"  && isOwner;
  const canCancel        = (app.status === "PENDING" || app.status === "APPROVED") && isOwner;
  
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(20,16,10,0.65)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        width: "100%", maxWidth: 580,
        background: C.surface, border: `1.5px solid ${C.border}`,
        borderRadius: 18, boxShadow: "0 32px 72px rgba(0,0,0,0.38)",
        maxHeight: "90vh", overflowY: "auto",
        animation: "sa-modal-in 0.22s ease",
      }}>
 
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 24px", borderBottom: `1px solid ${C.border}`,
          background: "#fdf9f4", position: "sticky", top: 0, zIndex: 1,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: `${C.gold}18`, border: `1px solid ${C.gold}28`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
            }}>🏠</div>
            <div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text,
                fontFamily: "'Cormorant Garamond',Georgia,serif" }}>
                Sale Application #{app.id}
              </p>
              <p style={{ margin: 0, fontSize: 11, color: C.muted }}>
                {app.listing_id  ? `Listing #${app.listing_id}` : ""}
                {app.property_id ? ` · Property #${app.property_id}` : ""}
              </p>
            </div>
          </div>
          <button className="sa-btn" onClick={onClose}
            style={{
              width: 30, height: 30, borderRadius: 8,
              background: "#f0ece3", border: `1px solid ${C.border}`,
              fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
              color: C.muted,
            }}>
            ×
          </button>
        </div>
 
        <div style={{ padding: "20px 24px" }}>
 
          {/* Status bar */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            background: "#f5f0e8", borderRadius: 10, padding: "12px 16px", marginBottom: 20,
          }}>
            <StatusPill status={app.status} />
            {app.updated_at && (
              <span style={{ fontSize: 11.5, color: C.muted }}>
                Përditësuar: {fmtDT(app.updated_at)}
              </span>
            )}
          </div>
 
          {/* Info grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 9, marginBottom: 18 }}>
            {infoFields.map(({ label, value }) => (
              <div key={label} style={{
                background: "#f5f0e8", borderRadius: 9,
                padding: "10px 13px", border: `1px solid ${C.border}`,
              }}>
                <p style={{ margin: 0, fontSize: 9.5, color: C.textMut, fontWeight: 600,
                  textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 3 }}>{label}</p>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: C.text, wordBreak: "break-all" }}>{value}</p>
              </div>
            ))}
          </div>
 
          {/* Offer vs price highlight */}
          {app.offer_price && (
            <div style={{
              background: "linear-gradient(135deg, rgba(201,184,122,0.08), rgba(201,184,122,0.04))",
              border: `1.5px solid ${C.gold}30`,
              borderRadius: 12, padding: "14px 18px", marginBottom: 18,
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <span style={{ fontSize: 22 }}>💰</span>
              <div>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 600, color: C.gold,
                  textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 3 }}>Oferta e Blerësit</p>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.text,
                  fontFamily: "'Cormorant Garamond',Georgia,serif", letterSpacing: "-0.3px" }}>
                  {fmtMoney(app.offer_price)}
                </p>
              </div>
              {app.monthly_income && (
                <>
                  <div style={{ width: 1, height: 40, background: `${C.gold}25`, flexShrink: 0 }} />
                  <div>
                    <p style={{ margin: 0, fontSize: 10, fontWeight: 600, color: C.muted,
                      textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 3 }}>Të Ardhura / Muaj</p>
                    <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.text,
                      fontFamily: "'Cormorant Garamond',Georgia,serif", letterSpacing: "-0.3px" }}>
                      {fmtMoney(app.monthly_income)}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
 
          {/* Message */}
          {app.message && (
            <div style={{
              background: "#f5f0e8", border: `1px solid ${C.border}`,
              borderRadius: 10, padding: "14px 16px", marginBottom: 18,
            }}>
              <p style={{ margin: "0 0 7px", fontSize: 9.5, color: C.textMut, fontWeight: 600,
                textTransform: "uppercase", letterSpacing: "0.7px" }}>Mesazhi i Blerësit</p>
              <p style={{ margin: 0, fontSize: 13.5, color: C.textSub,
                lineHeight: 1.65, fontStyle: "italic",
                fontFamily: "'Cormorant Garamond',Georgia,serif" }}>
                "{app.message}"
              </p>
            </div>
          )}
 
          {/* Rejection reason (existing) */}
          {app.rejection_reason && (
            <div style={{
              background: "#fef2f2", border: "1px solid #fecaca",
              borderRadius: 10, padding: "12px 16px", marginBottom: 18,
              display: "flex", alignItems: "flex-start", gap: 9,
            }}>
              <span style={{ fontSize: 15, flexShrink: 0 }}>✕</span>
              <p style={{ margin: 0, fontSize: 12.5, color: "#dc2626", lineHeight: 1.55 }}>
                <strong>Arsyeja e refuzimit:</strong> {app.rejection_reason}
              </p>
            </div>
          )}

          {/* Contract shortcut — shfaqet kur APPROVED */}
          {app.status === "APPROVED" && isOwner && (
            <div style={{ marginBottom: 16 }}>
              <button className="sa-btn" onClick={() => onCreateContract(app)}
                style={{
                  width: "100%", padding: "11px 0",
                  background: "linear-gradient(135deg,#c9b87a,#b0983e)",
                  color: "#1a1714", border: "none", borderRadius: 10,
                  fontSize: 13, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}>
                📄 Krijo Sale Contract →
              </button>
            </div>
          )}
          
          {/* Actions */}
          {(canApproveReject || canCancel) && (
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 18 }}>
              {!showReject ? (
                <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
                  {canApproveReject && (
                    <>
                      <button className="sa-btn" onClick={handleApprove} disabled={saving}
                        style={{
                          flex: 1, minWidth: 130, padding: "10px 0",
                          background: "#ecfdf5", color: "#059669",
                          border: "1.5px solid #a7f3d0", borderRadius: 10,
                          fontSize: 13, fontWeight: 600,
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                        }}>
                        ✓ Aprovo Aplikimin
                      </button>
                      <button className="sa-btn" onClick={() => setShowReject(true)} disabled={saving}
                        style={{
                          flex: 1, minWidth: 130, padding: "10px 0",
                          background: "#fef2f2", color: "#dc2626",
                          border: "1.5px solid #fecaca", borderRadius: 10,
                          fontSize: 13, fontWeight: 600,
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                        }}>
                        ✕ Refuzo
                      </button>
                    </>
                  )}
                  {canCancel && !canApproveReject && (
                    <button className="sa-btn" onClick={handleCancel} disabled={saving}
                      style={{
                        padding: "10px 20px", background: "#f1f5f9", color: "#64748b",
                        border: "1.5px solid #e2e8f0", borderRadius: 10,
                        fontSize: 13, fontWeight: 600,
                      }}>
                      Anulo Aplikimin
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <p style={{ margin: "0 0 9px", fontSize: 13, fontWeight: 500, color: C.text }}>
                    Arsyeja e refuzimit{" "}
                    <span style={{ color: C.textMut, fontWeight: 400 }}>(opcionale, max 500 karaktere)</span>
                  </p>
                  <textarea
                    className="sa-textarea"
                    value={rejReason}
                    onChange={e => setRejReason(e.target.value)}
                    rows={3}
                    placeholder="Shkruaj arsyen..."
                    maxLength={500}
                  />
                  <p className="sa-char-count">{rejReason.length}/500</p>
                  <div style={{ display: "flex", gap: 9, marginTop: 8 }}>
                    <button className="sa-btn"
                      onClick={() => { setShowReject(false); setRejReason(""); }}
                      style={{
                        padding: "9px 18px", borderRadius: 10,
                        background: "#f0ece3", color: C.textSub,
                        border: `1.5px solid ${C.border}`, fontSize: 13,
                      }}>
                      Anulo
                    </button>
                    <button className="sa-btn" onClick={handleReject} disabled={saving}
                      style={{
                        flex: 1, padding: "9px 0",
                        background: "#fef2f2", color: "#dc2626",
                        border: "1.5px solid #fecaca",
                        borderRadius: 10, fontSize: 13, fontWeight: 600,
                      }}>
                      Konfirmo Refuzimin
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {!isOwner && app.status === "PENDING" && (
            <div style={{
              background: "#f5f2eb", border: "1px solid #e8e2d6",
              borderRadius: 10, padding: "12px 16px", marginTop: 4,
              display: "flex", alignItems: "center", gap: 9,
            }}>
              <span style={{ fontSize: 16 }}>👁</span>
              <p style={{ margin: 0, fontSize: 13, color: "#9a8c6e", lineHeight: 1.5 }}>
                Ky aplikim i përket një listingu të agjentit tjetër. Mund ta shohësh por nuk mund të ndërhysh.
              </p>
            </div>
          )}
 
        </div>
      </div>
    </div>
  );
}
 
// ─── Applications Table ───────────────────────────────────────────────────────
function ApplicationsTable({ applications, loading, onOpenApp, onQuickApprove, onQuickReject, onCreateContract, currentUserId,emptyTitle, emptySub }) {
  if (loading) return <Skeleton rows={5} h={58} />;
  if (applications.length === 0) return <EmptyState icon="🏠" title={emptyTitle} sub={emptySub} />;
 
  return (
    <div className="sa-table-wrap">
      <table className="sa-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Buyer</th>
            <th>Ownership</th>
            <th>Listing</th>
            <th>Property</th>
            <th>Oferta</th>
            <th>Të Ardhura</th>
            <th>Purchase Date</th>
            <th>Statusi</th>
            <th>Krijuar</th>
            <th>Veprime</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app, i) => (
            <tr key={app.id} className="sa-row" style={{ transition: "background 0.15s", animationDelay: `${i * 0.04}s` }}>
              <td style={{ color: C.textMut, fontSize: 12 }}>{app.id}</td>
              <td style={{ fontWeight: 500 }}>{app.buyer_name || `#${app.buyer_id}`}</td>
              <td>
                {app.agent_id === currentUserId
                  ? <span style={{ background: "rgba(201,184,122,0.12)", color: "#8a7230", border: "1px solid rgba(201,184,122,0.3)", padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600 }}>👤 Unë</span>
                  : <span style={{ background: "#f0ece3", color: "#b0a890", border: "1px solid #e4ddd0", padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 500 }}>👁 Vetëm shiko</span>
                }
              </td>
              <td style={{ fontSize: 12.5, color: C.textSub }}>
                {app.listing_id ? `#${app.listing_id}` : "—"}
              </td>
              <td style={{ fontSize: 12.5, color: C.textSub }}>
                {app.property_id ? `#${app.property_id}` : "—"}
              </td>
              <td style={{ fontWeight: 600, color: C.text, fontSize: 13 }}>
                {fmtMoney(app.offer_price)}
              </td>
              <td style={{ fontSize: 12.5, color: C.textSub }}>
                {fmtMoney(app.monthly_income)}
              </td>
              <td style={{ fontSize: 12, color: C.textMut }}>
                {fmtDate(app.desired_purchase_date)}
              </td>
              <td><StatusPill status={app.status} /></td>
              <td style={{ fontSize: 12, color: C.textMut }}>{fmtDT(app.created_at)}</td>
             <td>
                <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                  {/* View — gjithmonë i dukshëm */}
                  <button className="sa-btn" onClick={() => onOpenApp(app)}
                    style={{
                      padding: "5px 11px", borderRadius: 8,
                      background: "#f0ece3", color: C.textSub,
                      border: `1px solid ${C.border}`, fontSize: 11.5, fontWeight: 500,
                    }}>
                    View
                  </button>

                  {/* Veprimet — vetëm nëse ky listing është i agjentit aktual */}
                  {app.agent_id === currentUserId ? (
                    <>
                      {app.status === "PENDING" && (
                        <>
                          <button className="sa-btn" onClick={() => onQuickApprove(app.id)}
                            title="Aprovo"
                            style={{
                              width: 30, height: 30, borderRadius: 8,
                              background: "#ecfdf5", color: "#059669",
                              border: "1px solid #a7f3d0",
                              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
                            }}>✓</button>
                          <button className="sa-btn" onClick={() => onQuickReject(app)}
                            title="Refuzo"
                            style={{
                              width: 30, height: 30, borderRadius: 8,
                              background: "#fef2f2", color: "#dc2626",
                              border: "1px solid #fecaca",
                              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
                            }}>✕</button>
                        </>
                      )}
                      {app.status === "APPROVED" && (
                        <button className="sa-btn" onClick={() => onCreateContract(app)}
                          title="Krijo kontratë"
                          style={{
                            padding: "5px 10px", borderRadius: 8, fontSize: 11.5, fontWeight: 700,
                            background: "linear-gradient(135deg,#c9b87a,#b0983e)",
                            color: "#1a1714", border: "none", cursor: "pointer",
                            fontFamily: "'DM Sans',sans-serif",
                          }}>
                          📄 Contract
                        </button>
                      )}
                    </>
                  ) : (
                    /* Agjent tjetër — vetëm shiko */
                    <span style={{
                      fontSize: 11, color: "#b0a890", fontStyle: "italic",
                      background: "#f5f2eb", padding: "3px 9px",
                      borderRadius: 999, border: "1px solid #e8e2d6",
                    }}>
                      vetëm shiko
                    </span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
 
// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, padding: "16px 20px", borderTop: `1px solid ${C.border}`, background: "#fdf9f4" }}>
      <button className="sa-btn"
        disabled={page === 0}
        onClick={() => onChange(page - 1)}
        style={{ padding: "6px 14px", borderRadius: 9, border: `1.5px solid ${C.border}`, background: "transparent", color: page === 0 ? C.textMut : C.text, fontSize: 13, opacity: page === 0 ? 0.5 : 1 }}>
        ‹ Mëparshme
      </button>
      <span style={{ fontSize: 12.5, color: C.muted, padding: "0 8px" }}>
        Faqja {page + 1} nga {totalPages}
      </span>
      <button className="sa-btn"
        disabled={page === totalPages - 1}
        onClick={() => onChange(page + 1)}
        style={{ padding: "6px 14px", borderRadius: 9, border: `1.5px solid ${C.border}`, background: "transparent", color: page === totalPages - 1 ? C.textMut : C.text, fontSize: 13, opacity: page === totalPages - 1 ? 0.5 : 1 }}>
        Tjetra ›
      </button>
    </div>
  );
}
 
// ═══════════════════════════════════════════════════════════════════════════════
export default function AgentSaleApplications() {
  // ── Tab state ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("my");
  // my = my agent applications, listing = by listing ID, property = by property ID, status = by status
 
  // ── My Applications ────────────────────────────────────────────────────────
  const [myApps,      setMyApps]      = useState([]);
  const [myLoading,   setMyLoading]   = useState(false);
  const [myPage,      setMyPage]      = useState(0);
  const [myTotalP,    setMyTotalP]    = useState(0);
 
  // ── By Listing ─────────────────────────────────────────────────────────────
  const [listingId,    setListingId]    = useState("");
  const [listingApps,  setListingApps]  = useState([]);
  const [listingLoading, setListingLoading] = useState(false);
  const [listingPage,  setListingPage]  = useState(0);
  const [listingTotalP, setListingTotalP] = useState(0);
  const [listingSearched, setListingSearched] = useState(false);
 
  // ── By Property ────────────────────────────────────────────────────────────
  const [propertyId,   setPropertyId]   = useState("");
  const [propertyApps, setPropertyApps] = useState([]);
  const [propertyLoading, setPropertyLoading] = useState(false);
  const [propertyPage, setPropertyPage] = useState(0);
  const [propertyTotalP, setPropertyTotalP] = useState(0);
  const [propertySearched, setPropertySearched] = useState(false);
 
  // ── By Status ──────────────────────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [statusApps,   setStatusApps]   = useState([]);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusPage,   setStatusPage]   = useState(0);
  const [statusTotalP, setStatusTotalP] = useState(0);
 
  // ── Modal & Toast ──────────────────────────────────────────────────────────
  const [selectedApp, setSelectedApp] = useState(null);
  const [toast,       setToast]       = useState(null);
  const [contractPrefill,    setContractPrefill]    = useState(null);
  const [showContractModal,  setShowContractModal]  = useState(false);
 
  const { user } = useContext(AuthContext);
  const currentUserId = user?.id;

  const notify = useCallback((msg, type = "success") =>
    setToast({ msg, type, key: Date.now() }), []);
 
  // ── Fetch helpers ──────────────────────────────────────────────────────────
  const fetchMyApps = useCallback(async (pg = 0) => {
    setMyLoading(true);
    try {
      const res = await api.get(`/api/sales/applications/agent/me?page=${pg}&size=15`);
      setMyApps(res.data.content || []);
      setMyTotalP(res.data.totalPages || 0);
      setMyPage(pg);
    } catch {
      notify("Gabim gjatë ngarkimit të aplikimeve", "error");
    } finally {
      setMyLoading(false);
    }
  }, [notify]);
 
  const fetchByListing = useCallback(async (pg = 0) => {
    if (!validateInput({ mode: "listing", listingId }, notify)) return;
    setListingLoading(true);
    setListingSearched(true);
    try {
      const res = await api.get(`/api/sales/applications/listing/${Number(listingId)}?page=${pg}&size=15`);
      setListingApps(res.data.content || []);
      setListingTotalP(res.data.totalPages || 0);
      setListingPage(pg);
    } catch {
      notify("Listing nuk u gjet ose nuk ka aplikime", "error");
    } finally {
      setListingLoading(false);
    }
  }, [listingId, notify]);
 
  const fetchByProperty = useCallback(async (pg = 0) => {
    if (!validateInput({ mode: "property", propertyId }, notify)) return;
    setPropertyLoading(true);
    setPropertySearched(true);
    try {
      const res = await api.get(`/api/sales/applications/property/${Number(propertyId)}?page=${pg}&size=15`);
      setPropertyApps(res.data.content || []);
      setPropertyTotalP(res.data.totalPages || 0);
      setPropertyPage(pg);
    } catch {
      notify("Prona nuk u gjet ose nuk ka aplikime", "error");
    } finally {
      setPropertyLoading(false);
    }
  }, [propertyId, notify]);
 
  const fetchByStatus = useCallback(async (status = statusFilter, pg = 0) => {
    setStatusLoading(true);
    try {
      const res = await api.get(`/api/sales/applications/status/${status}?page=${pg}&size=15`);
      setStatusApps(res.data.content || []);
      setStatusTotalP(res.data.totalPages || 0);
      setStatusPage(pg);
    } catch {
      notify("Gabim gjatë filtrimit sipas statusit", "error");
    } finally {
      setStatusLoading(false);
    }
  }, [statusFilter, notify]);
 
  // Initial load
  useEffect(() => { fetchMyApps(0); }, [fetchMyApps]);
  useEffect(() => {
    if (contractPrefill) setShowContractModal(true);
  }, [contractPrefill]);
  // Load status tab when opened
  useEffect(() => {
    if (activeTab === "status") fetchByStatus(statusFilter, 0);
  }, [activeTab]);
 
  // ── Update Status ──────────────────────────────────────────────────────────
  const handleUpdateStatus = async (appId, status, reason) => {
    if (status === "REJECTED" && !validateRejection(reason, notify)) return;
    try {
      await api.patch(`/api/sales/applications/${appId}/status`, {
        status,
        rejection_reason: reason || null,
      });
 
      // Patch local state across all tabs
      const patch = (list) => list.map(a =>
        a.id === appId ? { ...a, status, rejection_reason: reason || a.rejection_reason } : a
      );
      setMyApps(patch);
      setListingApps(patch);
      setPropertyApps(patch);
      setStatusApps(patch);
 
      if (selectedApp?.id === appId) {
        setSelectedApp(prev => ({ ...prev, status, rejection_reason: reason || prev.rejection_reason }));
      }
       notify(`Aplikimi #${appId} → ${status}`);

      if (status === "APPROVED") {
        const all = [...myApps, ...listingApps, ...propertyApps, ...statusApps];
        const found = all.find(a => a.id === appId);
        if (found) setContractPrefill({ ...found, status: "APPROVED" });
      }
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë ndryshimit të statusit", "error");
    }
  };
  
  const handleCreateContract = useCallback((app) => {
    setContractPrefill(app);
    setShowContractModal(true);
  }, []);
 
  // ── Stats (from myApps or current visible list) ────────────────────────────
  const currentList =
    activeTab === "my"       ? myApps       :
    activeTab === "listing"  ? listingApps  :
    activeTab === "property" ? propertyApps :
    statusApps;
 
  const stats = {
    total:    currentList.length,
    pending:  currentList.filter(a => a.status === "PENDING").length,
    approved: currentList.filter(a => a.status === "APPROVED").length,
    rejected: currentList.filter(a => a.status === "REJECTED").length,
    cancelled: currentList.filter(a => a.status === "CANCELLED").length,
  };
 
  const tabConfig = [
    { id: "my",       label: "🤝 Aplikimet e Mia",    count: myApps.length         },
    { id: "listing",  label: "📋 Sipas Listing ID",   count: null                  },
    { id: "property", label: "🏢 Sipas Property ID",  count: null                  },
    { id: "status",   label: "🔎 Sipas Statusit",     count: null                  },
  ];
 
  return (
    <MainLayout role="agent">
      <style>{CSS}</style>
      <div className="sa">
 
        {/* ── HERO ── */}
        <div style={{
          background: `linear-gradient(160deg, ${C.dark} 0%, #1e1a14 50%, #241e16 100%)`,
          minHeight: 200, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "36px 32px", position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.018) 1px,transparent 1px)", backgroundSize: "22px 22px", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "-60px", right: "5%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle,rgba(201,184,122,0.07) 0%,transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "-40px", left: "8%", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle,rgba(126,184,164,0.05) 0%,transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg,transparent,${C.gold} 30%,${C.gold} 70%,transparent)` }} />
 
          <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 700, width: "100%" }}>
            <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 600, color: C.gold,
              textTransform: "uppercase", letterSpacing: "2.5px", fontFamily: "'DM Sans',sans-serif" }}>
              Sales Management
            </p>
            <h1 style={{
              margin: "0 0 10px",
              fontFamily: "'Cormorant Garamond',Georgia,serif",
              fontSize: "clamp(24px,3.5vw,38px)",
              fontWeight: 700, color: "#f5f0e8", letterSpacing: "-0.5px", lineHeight: 1.1,
            }}>
              Sale{" "}
              <span style={{
                background: `linear-gradient(90deg,${C.gold},${C.goldL},${C.gold})`,
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
                Applications
              </span>
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(245,240,232,0.38)", fontFamily: "'DM Sans',sans-serif" }}>
              Menaxho dhe shqyrto aplikimet e blerjes nga klientët
            </p>
          </div>
        </div>
 
        <div style={{ padding: "24px 28px", maxWidth: 1500, margin: "0 auto" }}>
 
          {/* ── Stat Cards — only when data loaded ── */}
          {currentList.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(165px,1fr))", gap: 14, marginBottom: 24 }}>
              <StatCard icon="📋" label="Total"     value={stats.total}     accent={C.gold}    delay={0.05} />
              <StatCard icon="⏳" label="Pending"   value={stats.pending}   accent="#d97706"   delay={0.10} />
              <StatCard icon="✅" label="Approved"  value={stats.approved}  accent="#059669"   delay={0.15} />
              <StatCard icon="✕"  label="Rejected"  value={stats.rejected}  accent="#dc2626"   delay={0.20} />
              <StatCard icon="🚫" label="Cancelled" value={stats.cancelled} accent="#64748b"   delay={0.25} />
            </div>
          )}
 
          {/* ── Main card ── */}
          <div className="sa-card sa-section">
 
            {/* Tabs */}
            <div style={{ borderBottom: `1px solid ${C.border}`, display: "flex", overflowX: "auto", background: "#fdf9f4" }}>
              {tabConfig.map(tab => (
                <button key={tab.id}
                  className={`sa-tab${activeTab === tab.id ? " active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}>
                  {tab.label}
                  {tab.count != null && tab.count > 0 && (
                    <span style={{ marginLeft: 7, background: activeTab === tab.id ? `${C.gold}22` : "#ede9df", color: C.textSub, padding: "1px 7px", borderRadius: 20, fontSize: 10.5, fontWeight: 600 }}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
 
            {/* ── Tab: My Agent Applications ── */}
            {activeTab === "my" && (
              <>
                <SectionHeader title="Aplikimet e Listingjeve të Mi" count={myApps.length}>
                  <button className="sa-btn" onClick={() => fetchMyApps(myPage)}
                    style={{ padding: "6px 14px", borderRadius: 9, background: "#f0ece3", color: C.textSub, border: `1px solid ${C.border}`, fontSize: 12 }}>
                    🔄 Rifresko
                  </button>
                </SectionHeader>
                <ApplicationsTable
                  applications={myApps} loading={myLoading}
                  onOpenApp={setSelectedApp}
                  onQuickApprove={(id) => handleUpdateStatus(id, "APPROVED", null)}
                  onQuickReject={(app) => { setSelectedApp(app); }}
                  onCreateContract={handleCreateContract}
                  currentUserId={currentUserId}
                  emptyTitle="Asnjë aplikim akoma"
                  emptySub="Klientët do të aplikojnë sapo të shfaqni listingjet tuaja."
                />
                <Pagination page={myPage} totalPages={myTotalP} onChange={fetchMyApps} />
              </>
            )}
 
            {/* ── Tab: By Listing ID ── */}
            {activeTab === "listing" && (
              <>
                <SectionHeader title="Kërko sipas Listing ID" />
                <div style={{ padding: "18px 22px", display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap", borderBottom: `1px solid ${C.border}`, background: "#faf7f2" }}>
                  <div>
                    <p style={{ margin: "0 0 7px", fontSize: 11, fontWeight: 600, color: C.textMut,
                      textTransform: "uppercase", letterSpacing: "0.7px" }}>
                      Listing ID <span style={{ color: "#ef4444" }}>*</span>
                    </p>
                    <div style={{ display: "flex", gap: 10 }}>
                      <input className="sa-input" type="number" min="1" style={{ width: 170, height: 40 }}
                        placeholder="p.sh. 15"
                        value={listingId}
                        onChange={e => setListingId(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && fetchByListing(0)} />
                      <button className="sa-btn" onClick={() => fetchByListing(0)} disabled={listingLoading}
                        style={{
                          padding: "0 18px", height: 40, borderRadius: 10,
                          background: C.dark, color: "#f5f0e8",
                          fontSize: 13, fontWeight: 500,
                          display: "flex", alignItems: "center", gap: 7,
                        }}>
                        {listingLoading
                          ? <><div style={{ width: 13, height: 13, border: "2px solid rgba(245,240,232,0.3)", borderTop: "2px solid #f5f0e8", borderRadius: "50%", animation: "sa-spin 0.7s linear infinite" }} /> Duke ngarkuar…</>
                          : <>🔍 Kërko</>}
                      </button>
                    </div>
                  </div>
                </div>
                <ApplicationsTable
                  applications={listingApps} loading={listingLoading}
                  onOpenApp={setSelectedApp}
                  onQuickApprove={(id) => handleUpdateStatus(id, "APPROVED", null)}
                  onQuickReject={(app) => { setSelectedApp(app); }}
                  onCreateContract={handleCreateContract}
                  currentUserId={currentUserId}
                  emptyTitle={listingSearched ? "Nuk ka aplikime" : "Asnjë kërkim akoma"}
                  emptySub={listingSearched
                    ? `Nuk u gjetën aplikime për Listing #${listingId}`
                    : "Shkruaj Listing ID dhe kliko Kërko"}
                />
                <Pagination page={listingPage} totalPages={listingTotalP} onChange={fetchByListing} />
              </>
            )}
 
            {/* ── Tab: By Property ID ── */}
            {activeTab === "property" && (
              <>
                <SectionHeader title="Kërko sipas Property ID" />
                <div style={{ padding: "18px 22px", display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap", borderBottom: `1px solid ${C.border}`, background: "#faf7f2" }}>
                  <div>
                    <p style={{ margin: "0 0 7px", fontSize: 11, fontWeight: 600, color: C.textMut,
                      textTransform: "uppercase", letterSpacing: "0.7px" }}>
                      Property ID <span style={{ color: "#ef4444" }}>*</span>
                    </p>
                    <div style={{ display: "flex", gap: 10 }}>
                      <input className="sa-input" type="number" min="1" style={{ width: 170, height: 40 }}
                        placeholder="p.sh. 7"
                        value={propertyId}
                        onChange={e => setPropertyId(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && fetchByProperty(0)} />
                      <button className="sa-btn" onClick={() => fetchByProperty(0)} disabled={propertyLoading}
                        style={{
                          padding: "0 18px", height: 40, borderRadius: 10,
                          background: C.dark, color: "#f5f0e8",
                          fontSize: 13, fontWeight: 500,
                          display: "flex", alignItems: "center", gap: 7,
                        }}>
                        {propertyLoading
                          ? <><div style={{ width: 13, height: 13, border: "2px solid rgba(245,240,232,0.3)", borderTop: "2px solid #f5f0e8", borderRadius: "50%", animation: "sa-spin 0.7s linear infinite" }} /> Duke ngarkuar…</>
                          : <>🔍 Kërko</>}
                      </button>
                    </div>
                  </div>
                </div>
                <ApplicationsTable
                  applications={propertyApps} loading={propertyLoading}
                  onOpenApp={setSelectedApp}
                  onQuickApprove={(id) => handleUpdateStatus(id, "APPROVED", null)}
                  onQuickReject={(app) => { setSelectedApp(app); }}
                  onCreateContract={handleCreateContract}
                  currentUserId={currentUserId}
                  emptyTitle={propertySearched ? "Nuk ka aplikime" : "Asnjë kërkim akoma"}
                  emptySub={propertySearched
                    ? `Nuk u gjetën aplikime për Property #${propertyId}`
                    : "Shkruaj Property ID dhe kliko Kërko"}
                />
                <Pagination page={propertyPage} totalPages={propertyTotalP} onChange={fetchByProperty} />
              </>
            )}
 
            {/* ── Tab: By Status ── */}
            {activeTab === "status" && (
              <>
                <SectionHeader title="Filtro sipas Statusit">
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <select className="sa-select" style={{ height: 36, fontSize: 12.5 }}
                      value={statusFilter}
                      onChange={e => {
                        setStatusFilter(e.target.value);
                        fetchByStatus(e.target.value, 0);
                      }}>
                      <option value="PENDING">⏳ Pending</option>
                      <option value="APPROVED">✅ Approved</option>
                      <option value="REJECTED">✕ Rejected</option>
                      <option value="CANCELLED">🚫 Cancelled</option>
                    </select>
                    <button className="sa-btn" onClick={() => fetchByStatus(statusFilter, 0)}
                      style={{ padding: "0 14px", height: 36, borderRadius: 9, background: "#f0ece3", color: C.textSub, border: `1px solid ${C.border}`, fontSize: 12 }}>
                      🔄 Rifresko
                    </button>
                  </div>
                </SectionHeader>
                <ApplicationsTable
                  applications={statusApps} loading={statusLoading}
                  onOpenApp={setSelectedApp}
                  onQuickApprove={(id) => handleUpdateStatus(id, "APPROVED", null)}
                  onQuickReject={(app) => { setSelectedApp(app); }}
                  onCreateContract={handleCreateContract}
                  currentUserId={currentUserId}
                  emptyTitle={`Asnjë aplikim me status ${statusFilter}`}
                  emptySub="Provo një status tjetër ose rikontrollo më vonë."
                />
                <Pagination page={statusPage} totalPages={statusTotalP} onChange={pg => fetchByStatus(statusFilter, pg)} />
              </>
            )}
 
          </div>
        </div>
 
        {/* Modal */}
        {selectedApp && (
          <AppDetailModal
            app={selectedApp}
            onClose={() => setSelectedApp(null)}
            onUpdateStatus={handleUpdateStatus}
            notify={notify}
            onCreateContract={handleCreateContract}
            currentUserId={currentUserId}
          />
        )}

        {/* Contract Modal */}
        {showContractModal && contractPrefill && (
          <ContractModal
            initial={null}
            prefill={{
              propertyId: contractPrefill.property_id,
              listingId:  contractPrefill.listing_id,
              price:      contractPrefill.offer_price,
              buyerId:    contractPrefill.buyer_id,
            }}
            onClose={() => { setShowContractModal(false); setContractPrefill(null); }}
            onSuccess={() => {
              setShowContractModal(false);
              setContractPrefill(null);
              notify("Kontrata u krijua me sukses ✓");
            }}
            notify={notify}
          />
        )}
 
        {/* Toast */}
        {toast && (
          <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />
        )}
      </div>
    </MainLayout>
  );
}
 