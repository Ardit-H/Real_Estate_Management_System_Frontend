import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";

// ─── Constants ────────────────────────────────────────────────────────────────
const LISTING_STATUSES = ["ACTIVE", "INACTIVE", "EXPIRED", "RENTED"];
const PRICE_PERIODS    = ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"];
const CURRENCIES       = ["EUR", "USD", "ALL"];

const STATUS_CFG = {
  ACTIVE:    { dot:"#7eb8a4", bg:"rgba(126,184,164,0.12)", border:"rgba(126,184,164,0.28)", color:"#2a6049" },
  INACTIVE:  { dot:"#a0997e", bg:"rgba(160,153,126,0.1)",  border:"rgba(160,153,126,0.22)", color:"#6b6248" },
  EXPIRED:   { dot:"#c9b87a", bg:"rgba(201,184,122,0.12)", border:"rgba(201,184,122,0.28)", color:"#9a7a30" },
  RENTED:    { dot:"#d4855a", bg:"rgba(212,133,90,0.12)",  border:"rgba(212,133,90,0.28)",  color:"#8b4513" },
};

const APP_STATUS_CFG = {
  PENDING:   { dot:"#c9b87a", bg:"rgba(201,184,122,0.12)", border:"rgba(201,184,122,0.28)", color:"#9a7a30" },
  APPROVED:  { dot:"#7eb8a4", bg:"rgba(126,184,164,0.12)", border:"rgba(126,184,164,0.28)", color:"#2a6049" },
  REJECTED:  { dot:"#d4855a", bg:"rgba(212,133,90,0.12)",  border:"rgba(212,133,90,0.28)",  color:"#8b4513" },
  CANCELLED: { dot:"#a0997e", bg:"rgba(160,153,126,0.1)",  border:"rgba(160,153,126,0.22)", color:"#6b6248" },
};

const fmtPrice = (v, cur="EUR", period="MONTHLY") =>
  v != null ? `€${Number(v).toLocaleString("de-DE")} / ${period.toLowerCase()}` : "—";
const fmtDate  = (d) => d ? new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : "—";
const fmtMoney = (v) => v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";

function validateListingForm(form, notify) {
  if (!form.property_id || isNaN(Number(form.property_id)) || Number(form.property_id) <= 0) {
    notify("Property ID must be a positive number","error"); return false;
  }
  if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) {
    notify("Price must be greater than 0","error"); return false;
  }
  if (Number(form.price) > 999999999) {
    notify("Price is too large","error"); return false;
  }
  if (form.deposit && (isNaN(Number(form.deposit)) || Number(form.deposit) < 0)) {
    notify("Deposit cannot be negative","error"); return false;
  }
  if (form.min_lease_months && Number(form.min_lease_months) < 1) {
    notify("Minimum lease months must be at least 1","error"); return false;
  }
  if (form.min_lease_months && Number(form.min_lease_months) > 120) {
    notify("Minimum lease months cannot exceed 120","error"); return false;
  }
  if (form.available_from && form.available_until) {
    if (new Date(form.available_until) <= new Date(form.available_from)) {
      notify("'Available until' must be after 'Available from'","error"); return false;
    }
  }
  if (form.title && form.title.length > 255) {
    notify("Title cannot exceed 255 characters","error"); return false;
  }
  if (form.description && form.description.length > 2000) {
    notify("Description cannot exceed 2000 characters","error"); return false;
  }
  return true;
}

// ─── Global CSS ───────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  .ar * { box-sizing: border-box; }
  .ar {
    font-family: 'DM Sans', system-ui, sans-serif;
    background: #f2ede4;
    min-height: 100vh;
  }

  /* Inputs */
  .ar-in {
    width: 100%; padding: 10px 13px;
    border: 1.5px solid #e4ddd0; border-radius: 10px;
    font-size: 13.5px; color: #1a1714; background: #fff;
    font-family: 'DM Sans', sans-serif; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    box-sizing: border-box;
  }
  .ar-in:focus {
    border-color: #8a7d5e !important;
    box-shadow: 0 0 0 3px rgba(138,125,94,0.13) !important;
  }
  .ar-sel { cursor: pointer; }
  .ar-ta  { resize: vertical; }

  /* Table */
  .ar-table { width: 100%; border-collapse: collapse; }
  .ar-table th {
    padding: 9px 14px; font-size: 9.5px; font-weight: 700;
    color: #b0a890; text-transform: uppercase; letter-spacing: 0.8px;
    border-bottom: 1.5px solid #ece6da; text-align: left;
    background: #faf7f2; white-space: nowrap;
  }
  .ar-table td {
    padding: 12px 14px; font-size: 13px; color: #1a1714;
    border-bottom: 1px solid #f0ece3; vertical-align: middle;
  }
  .ar-table tbody tr { transition: background 0.14s; }
  .ar-table tbody tr:hover { background: #faf7f2; }
  .ar-table tbody tr:last-child td { border-bottom: none; }

  /* Buttons */
  .ar-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 7px 14px; border-radius: 9px; font-size: 12.5px;
    font-weight: 600; cursor: pointer; font-family: inherit;
    border: none; transition: all 0.17s ease; white-space: nowrap;
  }
  .ar-btn:hover { opacity: 0.85; transform: translateY(-1px); }
  .ar-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  .ar-btn--primary   { background: linear-gradient(135deg,#c9b87a,#b0983e); color: #1a1714; }
  .ar-btn--secondary { background: transparent; border: 1.5px solid #e4ddd0 !important; color: #6b6248; }
  .ar-btn--secondary:hover { background: #f5f0e8 !important; }
  .ar-btn--ghost     { background: rgba(201,184,122,0.08); border: 1px solid rgba(201,184,122,0.2) !important; color: #9a7a30; }
  .ar-btn--ghost:hover { background: rgba(201,184,122,0.15) !important; }
  .ar-btn--danger    { background: rgba(212,133,90,0.1); border: 1.5px solid rgba(212,133,90,0.28) !important; color: #8b4513; }
  .ar-btn--danger:hover { background: rgba(212,133,90,0.2) !important; }
  .ar-btn--success   { background: rgba(126,184,164,0.12); border: 1.5px solid rgba(126,184,164,0.28) !important; color: #2a6049; }
  .ar-btn--success:hover { background: rgba(126,184,164,0.22) !important; }
  .ar-btn--sm        { padding: 5px 11px; font-size: 11.5px; border-radius: 8px; }

  /* Card */
  .ar-card {
    background: #fff; border-radius: 14px;
    border: 1.5px solid #ece6da;
    box-shadow: 0 2px 16px rgba(20,16,10,0.07);
    overflow: hidden; margin-bottom: 20px;
  }
  .ar-card-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 22px; border-bottom: 1.5px solid #ece6da;
    background: #faf7f2; flex-wrap: wrap; gap: 10px;
  }
  .ar-card-title {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 18px; font-weight: 700; color: #1a1714;
    letter-spacing: -0.2px; margin: 0;
  }

  /* Animations */
  @keyframes ar-scale-in { from{opacity:0;transform:scale(0.95) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes ar-fade-up  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes ar-spin     { to{transform:rotate(360deg)} }
  @keyframes ar-toast    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes ar-shimmer  { 0%{background-position:-800px 0} 100%{background-position:800px 0} }
  @keyframes ar-glow     { 0%,100%{opacity:0.07} 50%{opacity:0.14} }
  @keyframes ar-card-in  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
`;

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status, cfg }) {
  const s = (cfg||STATUS_CFG)[status] || { dot:"#a0997e", bg:"rgba(160,153,126,0.1)", border:"rgba(160,153,126,0.22)", color:"#6b6248" };
  return (
    <span style={{
      background:s.bg, color:s.color, border:`1.5px solid ${s.border}`,
      padding:"3px 11px", borderRadius:999, fontSize:10.5, fontWeight:700,
      display:"inline-flex", alignItems:"center", gap:5,
      textTransform:"uppercase", letterSpacing:"0.3px",
    }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:s.dot, boxShadow:`0 0 5px ${s.dot}` }}/>
      {status}
    </span>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type="success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position:"fixed", bottom:26, right:26, zIndex:9999,
      background:"#1a1714", color:type==="error"?"#f09090":"#90c8a8",
      padding:"11px 18px", borderRadius:12, fontSize:13,
      boxShadow:"0 10px 36px rgba(0,0,0,0.32)",
      border:`1px solid ${type==="error"?"rgba(240,128,128,0.15)":"rgba(144,200,168,0.15)"}`,
      maxWidth:320, fontFamily:"'DM Sans',sans-serif",
      animation:"ar-toast 0.2s ease", display:"flex", alignItems:"center", gap:8,
    }}>
      <span style={{fontSize:14}}>{type==="error"?"⚠️":"✅"}</span>{msg}
    </div>
  );
}

// ─── Loader ───────────────────────────────────────────────────────────────────
function Loader() {
  return (
    <div style={{ textAlign:"center", padding:"52px 0" }}>
      <div style={{ width:26, height:26, margin:"0 auto", border:"2px solid #e8e2d6", borderTop:"2px solid #c9b87a", borderRadius:"50%", animation:"ar-spin 0.8s linear infinite" }}/>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ icon, text }) {
  return (
    <div style={{ textAlign:"center", padding:"56px 20px", color:"#b0a890" }}>
      <div style={{ fontSize:40, marginBottom:12 }}>{icon}</div>
      <p style={{ fontSize:13.5, fontFamily:"'Cormorant Garamond',Georgia,serif", color:"#8a7d5e", fontStyle:"italic" }}>{text}</p>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
const PGB = (active, disabled) => ({
  padding:"6px 13px", borderRadius:9, border:`1.5px solid ${active?"#1a1714":"#e4ddd0"}`,
  background:active?"#1a1714":"transparent",
  color:active?"#f5f0e8":disabled?"#d4ccbe":"#6b6248",
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
function Modal({ title, onClose, children, wide=false }) {
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
    <div onClick={e=>e.target===e.currentTarget&&onClose()}
      style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(8,6,4,0.84)", backdropFilter:"blur(14px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ width:"100%", maxWidth:wide?700:540, background:"#faf7f2", borderRadius:18, boxShadow:"0 44px 100px rgba(0,0,0,0.55)", maxHeight:"92vh", overflowY:"auto", animation:"ar-scale-in 0.26s ease" }}>
        <div style={{ background:"linear-gradient(160deg,#141210 0%,#1e1a14 45%,#241e16 100%)", padding:"20px 26px", borderRadius:"18px 18px 0 0", display:"flex", alignItems:"center", justifyContent:"space-between", position:"relative", overflow:"hidden" }}>
          <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,0.018) 1px,transparent 1px)",backgroundSize:"22px 22px",pointerEvents:"none"}}/>
          <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:"linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)"}}/>
          <p style={{ position:"relative", fontFamily:"'Cormorant Garamond',Georgia,serif", fontWeight:700, fontSize:19, margin:0, color:"#f5f0e8", letterSpacing:"-0.2px" }}>{title}</p>
          <button onClick={onClose} style={{ position:"relative", background:"rgba(245,240,232,0.08)", backdropFilter:"blur(8px)", border:"1px solid rgba(245,240,232,0.12)", borderRadius:9, width:32, height:32, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(245,240,232,0.6)", fontSize:16 }}>×</button>
        </div>
        <div style={{ padding:"22px 26px" }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Field & Form helpers ─────────────────────────────────────────────────────
const ML = { display:"block", fontSize:10.5, fontWeight:600, color:"#9a8c6e", textTransform:"uppercase", letterSpacing:"0.7px", marginBottom:6, fontFamily:"'DM Sans',sans-serif" };

function Field({ label, children, required, hint }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={ML}>{label}{required&&<span style={{color:"#d4855a",marginLeft:2}}>*</span>}</label>
      {children}
      {hint && <p style={{ fontSize:11, color:"#b0a890", marginTop:4 }}>{hint}</p>}
    </div>
  );
}
function Row2({ children }) {
  return <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>{children}</div>;
}

function InfoBox({ type="info", children }) {
  const cfg = {
    info:    { bg:"rgba(201,184,122,0.08)", border:"rgba(201,184,122,0.22)", color:"#9a7a30" },
    success: { bg:"rgba(126,184,164,0.08)", border:"rgba(126,184,164,0.22)", color:"#2a6049" },
    warning: { bg:"rgba(212,133,90,0.08)",  border:"rgba(212,133,90,0.22)",  color:"#8b4513" },
  }[type];
  return (
    <div style={{ background:cfg.bg, border:`1.5px solid ${cfg.border}`, borderRadius:10, padding:"10px 14px", marginBottom:14, fontSize:12.5, color:cfg.color, lineHeight:1.6 }}>
      {children}
    </div>
  );
}

// ─── Listing Form Modal ───────────────────────────────────────────────────────
function ListingModal({ initial, onClose, onSuccess, notify }) {
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
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const handleSubmit = async () => {
    if (!validateListingForm(form, notify)) return;
    setSaving(true);
    try {
      const payload = {
        property_id:      Number(form.property_id),
        title:            form.title.trim() || null,
        description:      form.description || null,
        available_from:   form.available_from  || null,
        available_until:  form.available_until || null,
        price:            Number(form.price),
        currency:         form.currency,
        deposit:          form.deposit ? Number(form.deposit) : null,
        price_period:     form.price_period,
        min_lease_months: Number(form.min_lease_months),
        ...(initial && { status: form.status }),
      };
      initial ? await api.put(`/api/rentals/listings/${initial.id}`,payload) : await api.post("/api/rentals/listings",payload);
      onSuccess();
    } catch (err) { notify(err.response?.data?.message||"Error saving","error"); }
    finally { setSaving(false); }
  };

  return (
    <Modal title={initial?`Edit Listing #${initial.id}`:"New Rental Listing"} onClose={onClose} wide>
      <Row2>
        <Field label="Property ID" required hint="Numeric property ID">
          <input className="ar-in" type="number" min="1" value={form.property_id} onChange={e=>set("property_id",e.target.value)} disabled={!!initial} placeholder="42"/>
        </Field>
        <Field label="Title">
          <input className="ar-in" value={form.title} onChange={e=>set("title",e.target.value)} placeholder="2BR Apartment, Prishtinë" maxLength={255}/>
        </Field>
      </Row2>
      <Row2>
        <Field label="Price" required hint="Must be greater than 0">
          <input className="ar-in" type="number" min="1" step="0.01" value={form.price} onChange={e=>set("price",e.target.value)} placeholder="450"/>
        </Field>
        <Field label="Price Period">
          <select className="ar-in ar-sel" value={form.price_period} onChange={e=>set("price_period",e.target.value)}>
            {PRICE_PERIODS.map(p=><option key={p}>{p}</option>)}
          </select>
        </Field>
      </Row2>
      <Row2>
        <Field label="Deposit" hint="Optional — cannot be negative">
          <input className="ar-in" type="number" min="0" step="0.01" value={form.deposit} onChange={e=>set("deposit",e.target.value)} placeholder="900"/>
        </Field>
        <Field label="Currency">
          <select className="ar-in ar-sel" value={form.currency} onChange={e=>set("currency",e.target.value)}>
            {CURRENCIES.map(c=><option key={c}>{c}</option>)}
          </select>
        </Field>
      </Row2>
      <Row2>
        <Field label="Available From">
          <input className="ar-in" type="date" value={form.available_from} onChange={e=>set("available_from",e.target.value)}/>
        </Field>
        <Field label="Available Until" hint="Must be after 'Available From'">
          <input className="ar-in" type="date" value={form.available_until} onChange={e=>set("available_until",e.target.value)} min={form.available_from||undefined}/>
        </Field>
      </Row2>
      <Row2>
        <Field label="Min. Lease Months" hint="1 — 120 months">
          <input className="ar-in" type="number" min="1" max="120" value={form.min_lease_months} onChange={e=>set("min_lease_months",e.target.value)}/>
        </Field>
        {initial && (
          <Field label="Status">
            <select className="ar-in ar-sel" value={form.status} onChange={e=>set("status",e.target.value)}>
              {LISTING_STATUSES.map(s=><option key={s}>{s}</option>)}
            </select>
          </Field>
        )}
      </Row2>
      <Field label="Description" hint="Max 2000 characters">
        <textarea className="ar-in ar-ta" rows={3} value={form.description} onChange={e=>set("description",e.target.value)}
          placeholder="Describe the property..." maxLength={2000}/>
        <p style={{ fontSize:11, color:"#b0a890", textAlign:"right", marginTop:3 }}>{(form.description||"").length}/2000</p>
      </Field>
      <div style={{ display:"flex", justifyContent:"flex-end", gap:9, borderTop:"1px solid #e8e2d6", paddingTop:18, marginTop:6 }}>
        <button className="ar-btn ar-btn--secondary" onClick={onClose}>Cancel</button>
        <button className="ar-btn ar-btn--primary" onClick={handleSubmit} disabled={saving}>
          {saving ? "Saving…" : initial ? "Save Changes" : "Create Listing"}
        </button>
      </div>
    </Modal>
  );
}

// ─── Applications Panel ───────────────────────────────────────────────────────
function ApplicationsPanel({ listing, onClose, notify }) {
  const navigate = useNavigate();
  const [apps,      setApps]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [reviewing, setReviewing] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/rentals/applications/listing/${listing.id}`);
        setApps(res.data||[]);
      } catch { notify("Failed to load applications","error"); }
      finally   { setLoading(false); }
    })();
  }, [listing.id, notify]);

  const handleReview = async (appId, status, reason=null) => {
    try {
      await api.patch(`/api/rentals/applications/${appId}/review`,{ status, rejection_reason:reason });
      setApps(prev=>prev.map(a=>a.id===appId?{...a,status}:a));
      notify(`Application #${appId} → ${status}`);
      setReviewing(null);
    } catch (err) { notify(err.response?.data?.message||"Error","error"); }
  };

  const goToCreateContract = (app) => {
    navigate("/agent/contracts",{
      state:{
        fromPropertyId: String(listing.property_id),
        fromListingId:  String(listing.id),
        fromClientId:   String(app.client_id),
      },
    });
  };

  return (
    <Modal title={`Applications — Listing #${listing.id}${listing.title?`: ${listing.title}`:""}`} onClose={onClose} wide>
      {loading ? <Loader/> : apps.length===0 ? (
        <EmptyState icon="📭" text="No applications for this listing."/>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {apps.map(app => {
            const s = APP_STATUS_CFG[app.status] || APP_STATUS_CFG.PENDING;
            return (
              <div key={app.id}
                style={{
                  border:`1.5px solid ${s.border}`,
                  borderRadius:12, padding:"16px 18px",
                  background:s.bg,
                  animation:"ar-card-in 0.3s ease both",
                }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                  <div>
                    <p style={{ fontWeight:700, fontSize:14, marginBottom:3, color:"#1a1714", fontFamily:"'Cormorant Garamond',Georgia,serif" }}>
                      Application #{app.id} — Client #{app.client_id}
                    </p>
                    <p style={{ fontSize:12, color:"#9a8c6e", margin:0 }}>
                      {new Date(app.created_at).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}
                      {app.income && ` · Income: €${Number(app.income).toLocaleString()}`}
                      {app.move_in_date && ` · Move-in: ${fmtDate(app.move_in_date)}`}
                    </p>
                  </div>
                  <StatusBadge status={app.status} cfg={APP_STATUS_CFG}/>
                </div>

                {app.message && (
                  <p style={{ fontSize:13.5, color:"#4a4438", marginBottom:10, fontStyle:"italic", fontFamily:"'Cormorant Garamond',Georgia,serif", lineHeight:1.6, paddingLeft:8, borderLeft:"2px solid #e0d8c8" }}>
                    "{app.message}"
                  </p>
                )}

                {app.status==="APPROVED" && (
                  <div style={{ background:"rgba(201,184,122,0.06)", border:"1.5px solid rgba(201,184,122,0.22)", borderRadius:10, padding:"11px 14px", marginBottom:10, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
                    <div>
                      <span style={{ fontSize:13, color:"#c9b87a", fontWeight:600 }}>✓ Approved — ready for contract</span>
                      <p style={{ fontSize:11.5, color:"#9a8c6e", marginTop:3 }}>
                        Client #{app.client_id} · Listing #{listing.id} · Property #{listing.property_id}
                      </p>
                    </div>
                    <button className="ar-btn ar-btn--primary ar-btn--sm" onClick={()=>goToCreateContract(app)}>
                      📋 Create Contract →
                    </button>
                  </div>
                )}

                {app.status==="PENDING" && (
                  <div style={{ display:"flex", gap:8 }}>
                    <button className="ar-btn ar-btn--success ar-btn--sm" onClick={()=>handleReview(app.id,"APPROVED")}>
                      ✓ Approve
                    </button>
                    <button className="ar-btn ar-btn--danger ar-btn--sm" onClick={()=>setReviewing(app)}>
                      ✕ Reject
                    </button>
                  </div>
                )}

                {app.rejection_reason && (
                  <p style={{ fontSize:12, color:"#d4855a", marginTop:8, display:"flex", alignItems:"center", gap:5 }}>
                    <span>⚠</span> Reason: {app.rejection_reason}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {reviewing && (
        <RejectDialog app={reviewing} onConfirm={(reason)=>handleReview(reviewing.id,"REJECTED",reason)} onClose={()=>setReviewing(null)}/>
      )}
    </Modal>
  );
}

// ─── Reject Dialog ────────────────────────────────────────────────────────────
function RejectDialog({ app, onConfirm, onClose }) {
  const [reason, setReason] = useState("");
  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()}
      style={{ position:"fixed", inset:0, zIndex:2000, background:"rgba(8,6,4,0.84)", backdropFilter:"blur(14px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:"#faf7f2", borderRadius:18, padding:0, maxWidth:420, width:"100%", boxShadow:"0 44px 100px rgba(0,0,0,0.55)", animation:"ar-scale-in 0.24s ease", overflow:"hidden" }}>
        <div style={{ background:"linear-gradient(160deg,#141210 0%,#1e1a14 100%)", padding:"18px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"relative" }}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:"linear-gradient(90deg,transparent,#d4855a 30%,#d4855a 70%,transparent)"}}/>
          <p style={{ position:"relative", fontFamily:"'Cormorant Garamond',Georgia,serif", fontWeight:700, fontSize:17, margin:0, color:"#f5f0e8" }}>Reject Application #{app.id}</p>
          <button onClick={onClose} style={{ position:"relative", background:"rgba(245,240,232,0.08)", border:"1px solid rgba(245,240,232,0.12)", borderRadius:8, width:30, height:30, cursor:"pointer", color:"rgba(245,240,232,0.6)", fontSize:15, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        </div>
        <div style={{ padding:"20px 24px" }}>
          <Field label="Rejection Reason">
            <textarea className="ar-in ar-ta" value={reason} onChange={e=>setReason(e.target.value)} rows={3} placeholder="Enter reason…" maxLength={500}/>
            <p style={{ fontSize:11, color:"#b0a890", textAlign:"right", marginTop:3 }}>{reason.length}/500</p>
          </Field>
          <div style={{ display:"flex", gap:9, justifyContent:"flex-end", borderTop:"1px solid #e8e2d6", paddingTop:16, marginTop:4 }}>
            <button className="ar-btn ar-btn--secondary" onClick={onClose}>Cancel</button>
            <button className="ar-btn ar-btn--danger" onClick={()=>onConfirm(reason||null)}>Confirm Rejection</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function AgentRentals() {
  const [listings,    setListings]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [page,        setPage]        = useState(0);
  const [totalPages,  setTotalPages]  = useState(0);
  const [totalEl,     setTotalEl]     = useState(0);
  const [modalOpen,   setModalOpen]   = useState(false);
  const [editTarget,  setEditTarget]  = useState(null);
  const [deleteId,    setDeleteId]    = useState(null);
  const [appsTarget,  setAppsTarget]  = useState(null);
  const [toast,       setToast]       = useState(null);

  const notify = useCallback((msg,type="success") => setToast({msg,type,key:Date.now()}), []);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/rentals/listings?page=${page}&size=12&sortBy=createdAt&sortDir=desc`);
      setListings(res.data.content||[]);
      setTotalPages(res.data.totalPages||0);
      setTotalEl(res.data.totalElements||0);
    } catch { notify("Failed to load listings","error"); }
    finally  { setLoading(false); }
  }, [page, notify]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const handleDelete = async () => {
    try {
      await api.delete(`/api/rentals/listings/${deleteId}`);
      notify("Listing deleted successfully");
      setDeleteId(null);
      fetchListings();
    } catch (err) { notify(err.response?.data?.message||"Failed to delete","error"); }
  };

  // Quick stats from loaded data
  const stats = {
    active:  listings.filter(l=>l.status==="ACTIVE").length,
    rented:  listings.filter(l=>l.status==="RENTED").length,
    expired: listings.filter(l=>l.status==="EXPIRED").length,
  };

  return (
    <MainLayout role="agent">
      <style>{CSS}</style>
      <div className="ar">

        {/* ── Hero ── */}
        <div style={{
          background:"linear-gradient(160deg,#141210 0%,#1e1a14 45%,#241e16 100%)",
          minHeight:280,
          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
          padding:"36px 32px", position:"relative", overflow:"hidden",
        }}>
          <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,0.018) 1px,transparent 1px)",backgroundSize:"22px 22px",pointerEvents:"none"}}/>
          <div style={{position:"absolute",top:"-60px",left:"8%",width:280,height:280,borderRadius:"50%",background:"radial-gradient(circle,rgba(201,184,122,0.07) 0%,transparent 70%)",pointerEvents:"none",animation:"ar-glow 4s ease-in-out infinite"}}/>
          <div style={{position:"absolute",bottom:"-40px",right:"8%",width:220,height:220,borderRadius:"50%",background:"radial-gradient(circle,rgba(126,184,164,0.05) 0%,transparent 70%)",pointerEvents:"none",animation:"ar-glow 4s ease-in-out infinite 2s"}}/>
          <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:"linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)"}}/>

          <div style={{ position:"relative", zIndex:1, maxWidth:700, width:"100%", textAlign:"center" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(201,184,122,0.1)", border:"1px solid rgba(201,184,122,0.18)", borderRadius:999, padding:"4px 14px", marginBottom:14 }}>
              <span style={{ width:5, height:5, borderRadius:"50%", background:"#c9b87a", display:"inline-block", boxShadow:"0 0 6px #c9b87a" }}/>
              <span style={{ fontSize:10.5, fontWeight:600, color:"#c9b87a", letterSpacing:"1.2px", textTransform:"uppercase" }}>Rental Management</span>
            </div>

            <h1 style={{ margin:"0 0 10px", fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"clamp(26px,3.5vw,40px)", fontWeight:700, color:"#f5f0e8", letterSpacing:"-0.7px", lineHeight:1.1 }}>
              Rental{" "}
              <span style={{ background:"linear-gradient(90deg,#c9b87a,#e8d9a0,#c9b87a)", backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>Listings</span>
            </h1>

            <p style={{ margin:"0 auto 24px", fontSize:13.5, color:"rgba(245,240,232,0.38)", fontFamily:"'DM Sans',sans-serif", lineHeight:1.6 }}>
              Manage rental listings and review client applications
            </p>

            {/* Stat pills */}
            {!loading && listings.length > 0 && (
              <div style={{ display:"flex", gap:10, maxWidth:480, margin:"0 auto", justifyContent:"center", flexWrap:"wrap" }}>
                {[
                  { label:"Total",   value:totalEl,       dot:"#c9b87a" },
                  { label:"Active",  value:stats.active,  dot:"#7eb8a4" },
                  { label:"Rented",  value:stats.rented,  dot:"#d4855a" },
                  { label:"Expired", value:stats.expired, dot:"#c9b87a" },
                ].map(stat => (
                  <div key={stat.label} style={{ background:"rgba(245,240,232,0.06)", backdropFilter:"blur(10px)", borderRadius:12, padding:"10px 18px", border:"1px solid rgba(245,240,232,0.1)", display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                    <span style={{ fontSize:22, fontWeight:700, color:stat.dot, lineHeight:1, fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{stat.value}</span>
                    <span style={{ fontSize:10, color:"rgba(245,240,232,0.35)", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.8px" }}>{stat.label}</span>
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
          fontFamily:"'DM Sans',sans-serif",
          position:"sticky", top:0, zIndex:100,
          boxShadow:"0 1px 10px rgba(20,16,10,0.05)",
        }}>
          <p style={{ margin:0, fontSize:12.5, color:"#9a8c6e" }}>
            {loading ? "Loading…" : `${totalEl} listing${totalEl!==1?"s":""}`}
          </p>
          <button className="ar-btn ar-btn--primary ar-btn--sm" onClick={()=>{ setEditTarget(null); setModalOpen(true); }}>
            + New Listing
          </button>
        </div>

        {/* ── Content ── */}
        <div style={{ padding:"20px 24px", maxWidth:1400, margin:"0 auto" }}>
          <div className="ar-card">
            <div className="ar-card-header">
              <h2 className="ar-card-title">All Rental Listings</h2>
              {listings.length > 0 && (
                <span style={{ background:"rgba(201,184,122,0.1)", color:"#c9b87a", border:"1px solid rgba(201,184,122,0.22)", padding:"4px 13px", borderRadius:999, fontSize:12, fontWeight:600 }}>
                  {listings.length} shown
                </span>
              )}
            </div>

            {loading ? <Loader/> : listings.length===0 ? (
              <EmptyState icon="🔑" text="No rental listings yet. Create your first one."/>
            ) : (
              <>
                <div style={{ overflowX:"auto" }}>
                  <table className="ar-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Title / Property</th>
                        <th>Price</th>
                        <th>Deposit</th>
                        <th>Availability</th>
                        <th>Min. Months</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listings.map(l => (
                        <tr key={l.id}>
                          <td style={{ color:"#b0a890", fontSize:11.5 }}>{l.id}</td>
                          <td>
                            <p style={{ fontWeight:600, fontSize:13.5, margin:"0 0 4px", color:"#1a1714", fontFamily:"'Cormorant Garamond',Georgia,serif" }}>
                              {l.title||`Listing #${l.id}`}
                            </p>
                            <span style={{ background:"rgba(201,184,122,0.1)", color:"#c9b87a", border:"1px solid rgba(201,184,122,0.22)", padding:"2px 9px", borderRadius:999, fontSize:10.5, fontWeight:600 }}>
                              prop #{l.property_id}
                            </span>
                          </td>
                          <td style={{ fontWeight:700, fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:14.5 }}>
                            {fmtPrice(l.price, l.currency, l.price_period)}
                          </td>
                          <td style={{ color:"#9a8c6e", fontSize:13 }}>{fmtMoney(l.deposit)}</td>
                          <td>
                            <p style={{ fontSize:12, color:"#9a8c6e", margin:"0 0 2px" }}>{fmtDate(l.available_from)}</p>
                            <p style={{ fontSize:12, color:"#b0a890", margin:0 }}>→ {fmtDate(l.available_until)}</p>
                          </td>
                          <td style={{ textAlign:"center", fontWeight:600, color:"#6b6248" }}>
                            {l.min_lease_months||"—"}
                          </td>
                          <td><StatusBadge status={l.status}/></td>
                          <td>
                            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                              <button className="ar-btn ar-btn--ghost ar-btn--sm" onClick={()=>setAppsTarget(l)}>
                                Applications
                              </button>
                              <button className="ar-btn ar-btn--secondary ar-btn--sm" onClick={()=>{ setEditTarget(l); setModalOpen(true); }}>
                                Edit
                              </button>
                              <button className="ar-btn ar-btn--danger ar-btn--sm" onClick={()=>setDeleteId(l.id)}>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
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

      {/* ── Modals ── */}
      {modalOpen && (
        <ListingModal initial={editTarget} onClose={()=>setModalOpen(false)}
          onSuccess={()=>{ setModalOpen(false); fetchListings(); notify(editTarget?"Listing updated":"Listing created"); }}
          notify={notify}/>
      )}

      {deleteId && (
        <Modal title="Confirm Deletion" onClose={()=>setDeleteId(null)}>
          <InfoBox type="warning">
            ⚠️ Are you sure you want to delete listing <strong>#{deleteId}</strong>? This action cannot be undone.
          </InfoBox>
          <div style={{ display:"flex", gap:9, justifyContent:"flex-end", borderTop:"1px solid #e8e2d6", paddingTop:16, marginTop:4 }}>
            <button className="ar-btn ar-btn--secondary" onClick={()=>setDeleteId(null)}>Cancel</button>
            <button className="ar-btn ar-btn--danger" onClick={handleDelete}>Delete</button>
          </div>
        </Modal>
      )}

      {appsTarget && (
        <ApplicationsPanel listing={appsTarget} onClose={()=>setAppsTarget(null)} notify={notify}/>
      )}

      {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}
    </MainLayout>
  );
}