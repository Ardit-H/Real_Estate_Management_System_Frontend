import { useState, useEffect, useCallback, useContext } from "react";
import { AuthContext } from "../../context/AuthProvider";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";

// ─── Constants ────────────────────────────────────────────────────────────────
const SALE_STATUSES        = ["ACTIVE", "SOLD", "PENDING", "CANCELLED"];
const CONTRACT_STATUSES    = ["PENDING", "COMPLETED", "CANCELLED"];
const PAYMENT_TYPES        = ["FULL", "DEPOSIT", "INSTALLMENT", "COMMISSION", "AGENT_COMMISSION", "CLIENT_BONUS"];
const PAYMENT_METHODS      = ["BANK_TRANSFER", "CASH", "CARD", "CHECK"];
const MANUAL_PAYMENT_TYPES = ["DEPOSIT", "INSTALLMENT"];

const STATUS_CFG = {
  ACTIVE:    { dot:"#7eb8a4", bg:"rgba(126,184,164,0.12)", border:"rgba(126,184,164,0.28)", color:"#2a6049" },
  SOLD:      { dot:"#c9b87a", bg:"rgba(201,184,122,0.12)", border:"rgba(201,184,122,0.28)", color:"#9a7a30" },
  PENDING:   { dot:"#e2c97e", bg:"rgba(226,201,126,0.12)", border:"rgba(226,201,126,0.28)", color:"#8a6a10" },
  CANCELLED: { dot:"#d4855a", bg:"rgba(212,133,90,0.12)",  border:"rgba(212,133,90,0.28)",  color:"#8b4513" },
  COMPLETED: { dot:"#7eb8a4", bg:"rgba(126,184,164,0.12)", border:"rgba(126,184,164,0.28)", color:"#2a6049" },
  PAID:      { dot:"#7eb8a4", bg:"rgba(126,184,164,0.12)", border:"rgba(126,184,164,0.28)", color:"#2a6049" },
  FAILED:    { dot:"#d4855a", bg:"rgba(212,133,90,0.12)",  border:"rgba(212,133,90,0.28)",  color:"#8b4513" },
  REFUNDED:  { dot:"#a0997e", bg:"rgba(160,153,126,0.1)",  border:"rgba(160,153,126,0.22)", color:"#6b6248" },
};

const PAY_TYPE_CFG = {
  FULL:             { bg:"rgba(201,184,122,0.1)",  color:"#c9b87a",  border:"rgba(201,184,122,0.25)"  },
  DEPOSIT:          { bg:"rgba(226,201,126,0.1)",  color:"#9a7a30",  border:"rgba(226,201,126,0.25)"  },
  INSTALLMENT:      { bg:"rgba(160,153,126,0.1)",  color:"#6b6248",  border:"rgba(160,153,126,0.22)"  },
  COMMISSION:       { bg:"rgba(126,184,164,0.1)",  color:"#2a6049",  border:"rgba(126,184,164,0.2)"   },
  AGENT_COMMISSION: { bg:"rgba(164,176,126,0.1)",  color:"#4a5a30",  border:"rgba(164,176,126,0.22)"  },
  CLIENT_BONUS:     { bg:"rgba(201,184,122,0.08)", color:"#8a6a10",  border:"rgba(201,184,122,0.18)"  },
};

const fmtPrice = (v, cur="EUR") => v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";
const fmtDate  = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }) : "—";

// ─── Global CSS ───────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  .as * { box-sizing: border-box; }
  .as {
    font-family: 'DM Sans', system-ui, sans-serif;
    background: #f2ede4;
    min-height: 100vh;
  }

  /* Inputs */
  .as-in {
    width: 100%; padding: 10px 13px;
    border: 1.5px solid #e4ddd0; border-radius: 10px;
    font-size: 13.5px; color: #1a1714; background: #fff;
    font-family: 'DM Sans', sans-serif;
    outline: none; transition: border-color 0.2s, box-shadow 0.2s;
  }
  .as-in:focus {
    border-color: #8a7d5e !important;
    box-shadow: 0 0 0 3px rgba(138,125,94,0.13) !important;
  }
  .as-sel { cursor: pointer; }
  .as-ta { resize: vertical; }

  /* Table */
  .as-table { width: 100%; border-collapse: collapse; }
  .as-table th {
    padding: 9px 14px; font-size: 9.5px; font-weight: 700;
    color: #b0a890; text-transform: uppercase; letter-spacing: 0.8px;
    border-bottom: 1.5px solid #ece6da; text-align: left;
    background: #faf7f2; white-space: nowrap;
  }
  .as-table td {
    padding: 12px 14px; font-size: 13px; color: #1a1714;
    border-bottom: 1px solid #f0ece3; vertical-align: middle;
  }
  .as-table tbody tr { transition: background 0.14s; }
  .as-table tbody tr:hover { background: #faf7f2; }
  .as-table tbody tr:last-child td { border-bottom: none; }

  /* Buttons */
  .as-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 7px 14px; border-radius: 9px; font-size: 12.5px;
    font-weight: 600; cursor: pointer; font-family: inherit;
    border: none; transition: all 0.17s ease; white-space: nowrap;
  }
  .as-btn:hover { opacity: 0.85; transform: translateY(-1px); }
  .as-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  .as-btn--primary  { background: linear-gradient(135deg,#c9b87a,#b0983e); color: #1a1714; }
  .as-btn--secondary{ background: transparent; border: 1.5px solid #e4ddd0 !important; color: #6b6248; }
  .as-btn--secondary:hover { background: #f5f0e8 !important; }
  .as-btn--danger   { background: rgba(212,133,90,0.12); border: 1.5px solid rgba(212,133,90,0.28) !important; color: #8b4513; }
  .as-btn--danger:hover { background: rgba(212,133,90,0.2) !important; }
  .as-btn--ghost    { background: rgba(201,184,122,0.08); border: 1px solid rgba(201,184,122,0.2) !important; color: #9a7a30; }
  .as-btn--sm       { padding: 5px 11px; font-size: 11.5px; border-radius: 8px; }

  /* Cards */
  .as-card {
    background: #fff; border-radius: 14px;
    border: 1.5px solid #ece6da;
    box-shadow: 0 2px 16px rgba(20,16,10,0.07);
    overflow: hidden; margin-bottom: 20px;
  }
  .as-card-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 22px; border-bottom: 1.5px solid #ece6da;
    background: #faf7f2; flex-wrap: wrap; gap: 10px;
  }
  .as-card-title {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 18px; font-weight: 700; color: #1a1714;
    letter-spacing: -0.2px; margin: 0;
  }

  /* Tabs */
  .as-tab {
    padding: 11px 20px; border: none; background: none;
    font-size: 13.5px; font-weight: 400; cursor: pointer;
    font-family: inherit; transition: all 0.15s;
    border-bottom: 2px solid transparent; margin-bottom: -2px;
    display: flex; align-items: center; gap: 7px;
    color: #9a8c6e;
  }
  .as-tab.active {
    color: #1a1714; font-weight: 600;
    border-bottom-color: #c9b87a;
  }
  .as-tab:hover:not(.active) { color: #6b6248; background: #f5f0e8; }

  /* Animations */
  @keyframes as-scale-in { from{opacity:0;transform:scale(0.95) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes as-fade-up  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes as-spin     { to{transform:rotate(360deg)} }
  @keyframes as-toast    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes as-shimmer  { 0%{background-position:-800px 0} 100%{background-position:800px 0} }
  @keyframes as-glow     { 0%,100%{opacity:0.07} 50%{opacity:0.14} }
`;

// ─── Status Badge ─────────────────────────────────────────────────────────────
function Badge({ label }) {
  const s = STATUS_CFG[label] || { dot:"#a0997e", bg:"rgba(160,153,126,0.1)", border:"rgba(160,153,126,0.22)", color:"#6b6248" };
  return (
    <span style={{
      background:s.bg, color:s.color, border:`1.5px solid ${s.border}`,
      padding:"3px 11px", borderRadius:999, fontSize:10.5, fontWeight:700,
      display:"inline-flex", alignItems:"center", gap:5, textTransform:"uppercase", letterSpacing:"0.3px",
    }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:s.dot, boxShadow:`0 0 5px ${s.dot}` }}/>
      {label}
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
      animation:"as-toast 0.2s ease", display:"flex", alignItems:"center", gap:8,
    }}>
      <span style={{fontSize:14}}>{type==="error"?"⚠️":"✅"}</span>{msg}
    </div>
  );
}

// ─── Loader ───────────────────────────────────────────────────────────────────
function Loader() {
  return (
    <div style={{ textAlign:"center", padding:"52px 0", color:"#b0a890" }}>
      <div style={{ width:26, height:26, margin:"0 auto", border:"2px solid #e8e2d6", borderTop:"2px solid #c9b87a", borderRadius:"50%", animation:"as-spin 0.8s linear infinite" }}/>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ icon, text }) {
  return (
    <div style={{ textAlign:"center", padding:"56px 20px", color:"#b0a890", fontFamily:"'DM Sans',sans-serif" }}>
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
      <div style={{ width:"100%", maxWidth:wide?700:540, background:"#faf7f2", borderRadius:18, boxShadow:"0 44px 100px rgba(0,0,0,0.55)", maxHeight:"92vh", overflowY:"auto", animation:"as-scale-in 0.26s ease" }}>

        {/* Modal header */}
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

// ─── Field + Form helpers ─────────────────────────────────────────────────────
const ML = { display:"block", fontSize:10.5, fontWeight:600, color:"#9a8c6e", textTransform:"uppercase", letterSpacing:"0.7px", marginBottom:6, fontFamily:"'DM Sans',sans-serif" };

function Field({ label, children, required }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={ML}>{label}{required&&<span style={{color:"#d4855a",marginLeft:2}}>*</span>}</label>
      {children}
    </div>
  );
}

function FormRow({ children }) {
  return <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>{children}</div>;
}

// ─── Info / Warning banners ───────────────────────────────────────────────────
function InfoBox({ type="info", children }) {
  const cfg = {
    info:    { bg:"rgba(201,184,122,0.08)", border:"rgba(201,184,122,0.22)", color:"#9a7a30" },
    success: { bg:"rgba(126,184,164,0.08)", border:"rgba(126,184,164,0.22)", color:"#2a6049" },
    warning: { bg:"rgba(212,133,90,0.08)",  border:"rgba(212,133,90,0.22)",  color:"#8b4513" },
  }[type];
  return (
    <div style={{ background:cfg.bg, border:`1.5px solid ${cfg.border}`, borderRadius:10, padding:"10px 14px", marginBottom:16, fontSize:12.5, color:cfg.color, lineHeight:1.6 }}>
      {children}
    </div>
  );
}

// ─── Section Tabs ─────────────────────────────────────────────────────────────
function SectionTabs({ active, onChange }) {
  const tabs = [
    { id:"listings",  label:"Sale Listings", icon:"🏷️"  },
    { id:"contracts", label:"Contracts",      icon:"📄"  },
    { id:"payments",  label:"Payments",       icon:"💳" },
  ];
  return (
    <div style={{ display:"flex", gap:0, borderBottom:"2px solid #e8e2d6", marginBottom:22 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={()=>onChange(t.id)} className={`as-tab${active===t.id?" active":""}`}>
          <span style={{fontSize:15}}>{t.icon}</span> {t.label}
        </button>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LISTINGS SECTION
// ═══════════════════════════════════════════════════════════════════════════════
function ListingsSection({ onSelectContract, notify, currentUserId }) {
  const [listings,     setListings]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [page,         setPage]         = useState(0);
  const [totalPages,   setTotalPages]   = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [deleteId,     setDeleteId]     = useState(null);
  const [showOnlyMine, setShowOnlyMine] = useState(true);
  const [agentNames,   setAgentNames]   = useState({});

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const url = showOnlyMine
        ? `/api/sales/listings/agent/me?page=${page}&size=10`
        : statusFilter
          ? `/api/sales/listings/status/${statusFilter}?page=${page}&size=10`
          : `/api/sales/listings?page=${page}&size=10&sortBy=createdAt&sortDir=desc`;
      const res  = await api.get(url);
      const data = res.data;
      setListings(data.content||[]);
      setTotalPages(data.totalPages||0);
    } catch { notify("Failed to load listings","error"); }
    finally  { setLoading(false); }
  }, [page, statusFilter, showOnlyMine, notify]);

  useEffect(() => { fetchListings(); }, [fetchListings]);
  useEffect(() => {
    api.get("/api/users/agents/list").then(res => {
      const map = {};
      (res.data||[]).forEach(u => { map[u.id] = `${u.first_name} ${u.last_name}`.trim() || `Agent #${u.id}`; });
      setAgentNames(map);
    }).catch(()=>{});
  }, []);

  const handleDelete = async () => {
    try {
      await api.delete(`/api/sales/listings/${deleteId}`);
      notify("Listing deleted successfully");
      setDeleteId(null);
      fetchListings();
    } catch { notify("Failed to delete listing","error"); }
  };

  return (
    <>
      <div className="as-card">
        <div className="as-card-header">
          <h2 className="as-card-title">Sale Listings</h2>
          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
            <button onClick={()=>{ setShowOnlyMine(p=>!p); setPage(0); }}
              style={{
                padding:"6px 14px", borderRadius:999, fontSize:12, fontWeight:600,
                cursor:"pointer", border:"1.5px solid",
                background:showOnlyMine?"rgba(201,184,122,0.12)":"transparent",
                color:showOnlyMine?"#c9b87a":"#9a8c6e",
                borderColor:showOnlyMine?"rgba(201,184,122,0.3)":"#e4ddd0",
                transition:"all 0.15s",
              }}>
              {showOnlyMine ? "👤 My Listings" : "🌐 All Listings"}
            </button>
            {!showOnlyMine && (
              <select className="as-in as-sel" style={{ width:150, height:36, padding:"0 12px", fontSize:12.5 }}
                value={statusFilter} onChange={e=>{ setStatusFilter(e.target.value); setPage(0); }}>
                <option value="">All statuses</option>
                {SALE_STATUSES.map(s=><option key={s}>{s}</option>)}
              </select>
            )}
            <button className="as-btn as-btn--primary" onClick={()=>{ setEditTarget(null); setModalOpen(true); }}>
              + New Listing
            </button>
          </div>
        </div>

        {loading ? <Loader/> : listings.length===0 ? (
          <EmptyState icon="🏷️" text="No listings yet. Create your first listing."/>
        ) : (
          <>
            <div style={{ overflowX:"auto" }}>
              <table className="as-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Property</th>
                    {!showOnlyMine && <th>Agent</th>}
                    <th>Price</th>
                    <th>Negotiable</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map(l => {
                    const isOwner = l.agent_id === currentUserId;
                    return (
                      <tr key={l.id}>
                        <td style={{ color:"#b0a890", fontSize:11.5 }}>{l.id}</td>
                        <td>
                          <span style={{ background:"rgba(201,184,122,0.1)", color:"#c9b87a", border:"1px solid rgba(201,184,122,0.22)", padding:"3px 10px", borderRadius:999, fontSize:11.5, fontWeight:600 }}>
                            #{l.property_id}
                          </span>
                        </td>
                        {!showOnlyMine && (
                          <td style={{ fontSize:12.5, color:"#6b6248" }}>
                            {l.agent_id===currentUserId
                              ? <span style={{color:"#c9b87a",fontWeight:600}}>👤 Me</span>
                              : <span>{agentNames[l.agent_id]||`Agent #${l.agent_id}`}</span>}
                          </td>
                        )}
                        <td style={{ fontWeight:700, fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:15 }}>
                          {fmtPrice(l.price, l.currency)}
                        </td>
                        <td>
                          <span style={{ fontSize:12, fontWeight:600, color:l.negotiable?"#2a6049":"#b0a890" }}>
                            {l.negotiable ? "✓ Yes" : "No"}
                          </span>
                        </td>
                        <td><Badge label={l.status}/></td>
                        <td style={{ color:"#b0a890", fontSize:12 }}>{fmtDate(l.created_at)}</td>
                        <td>
                          <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                            {isOwner ? (
                              <>
                                <button className="as-btn as-btn--secondary as-btn--sm" onClick={()=>{ setEditTarget(l); setModalOpen(true); }}>Edit</button>
                                <button className="as-btn as-btn--primary as-btn--sm" onClick={()=>onSelectContract({ listingId:l.id, propertyId:l.property_id, price:l.price })}>Contract →</button>
                                <button className="as-btn as-btn--danger as-btn--sm" onClick={()=>setDeleteId(l.id)}>Delete</button>
                              </>
                            ) : (
                              <span style={{ fontSize:11, color:"#b0a890", background:"#f5f0e8", padding:"3px 10px", borderRadius:999, fontStyle:"italic" }}>View only</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={setPage}/>
          </>
        )}
      </div>

      {modalOpen && (
        <ListingModal initial={editTarget} onClose={()=>setModalOpen(false)}
          onSuccess={()=>{ setModalOpen(false); fetchListings(); notify(editTarget?"Listing updated":"Listing created"); }}
          notify={notify}/>
      )}

      {deleteId && (
        <Modal title="Confirm Delete" onClose={()=>setDeleteId(null)}>
          <InfoBox type="warning">
            ⚠️ Are you sure you want to delete listing <strong>#{deleteId}</strong>? This action cannot be undone.
          </InfoBox>
          <div style={{ display:"flex", gap:9, justifyContent:"flex-end", marginTop:8 }}>
            <button className="as-btn as-btn--secondary" onClick={()=>setDeleteId(null)}>Cancel</button>
            <button className="as-btn as-btn--danger" onClick={handleDelete}>Delete</button>
          </div>
        </Modal>
      )}
    </>
  );
}

function ListingModal({ initial, onClose, onSuccess, notify }) {
  const [form, setForm] = useState({
    property_id:  initial?.property_id  ?? "",
    price:        initial?.price        ?? "",
    currency:     initial?.currency     ?? "EUR",
    negotiable:   initial?.negotiable   ?? true,
    description:  initial?.description  ?? "",
    highlights:   initial?.highlights   ?? "",
    status:       initial?.status       ?? "ACTIVE",
  });
  const [saving, setSaving] = useState(false);
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const handleSubmit = async () => {
    if (!form.property_id || !form.price) { notify("Property ID and price are required","error"); return; }
    setSaving(true);
    try {
      const payload = {
        property_id: Number(form.property_id), price: Number(form.price),
        currency: form.currency, negotiable: form.negotiable,
        description: form.description||null, highlights: form.highlights||null,
        ...(initial && { status: form.status }),
      };
      initial ? await api.put(`/api/sales/listings/${initial.id}`,payload) : await api.post("/api/sales/listings",payload);
      onSuccess();
    } catch (err) { notify(err.response?.data?.message||"Error saving","error"); }
    finally { setSaving(false); }
  };

  return (
    <Modal title={initial?`Edit Listing #${initial.id}`:"New Sale Listing"} onClose={onClose}>
      <FormRow>
        <Field label="Property ID" required>
          <input className="as-in" type="number" value={form.property_id} onChange={e=>set("property_id",e.target.value)} placeholder="e.g. 42" disabled={!!initial}/>
        </Field>
        <Field label="Price" required>
          <input className="as-in" type="number" value={form.price} onChange={e=>set("price",e.target.value)} placeholder="e.g. 145000"/>
        </Field>
      </FormRow>
      <FormRow>
        <Field label="Currency">
          <select className="as-in as-sel" value={form.currency} onChange={e=>set("currency",e.target.value)}>
            <option value="EUR">EUR</option><option value="USD">USD</option><option value="ALL">ALL</option>
          </select>
        </Field>
        <Field label="Negotiable">
          <select className="as-in as-sel" value={String(form.negotiable)} onChange={e=>set("negotiable",e.target.value==="true")}>
            <option value="true">Yes</option><option value="false">No</option>
          </select>
        </Field>
      </FormRow>
      {initial && (
        <Field label="Status">
          <select className="as-in as-sel" value={form.status} onChange={e=>set("status",e.target.value)}>
            {SALE_STATUSES.map(s=><option key={s}>{s}</option>)}
          </select>
        </Field>
      )}
      <Field label="Description">
        <textarea className="as-in as-ta" rows={3} value={form.description} onChange={e=>set("description",e.target.value)} placeholder="Property description..."/>
      </Field>
      <Field label="Highlights">
        <textarea className="as-in as-ta" rows={2} value={form.highlights} onChange={e=>set("highlights",e.target.value)} placeholder="Key features..."/>
      </Field>
      <div style={{ display:"flex", gap:9, justifyContent:"flex-end", borderTop:"1px solid #e8e2d6", paddingTop:18, marginTop:6 }}>
        <button className="as-btn as-btn--secondary" onClick={onClose}>Cancel</button>
        <button className="as-btn as-btn--primary" onClick={handleSubmit} disabled={saving}>
          {saving ? "Saving…" : initial ? "Save Changes" : "Create Listing"}
        </button>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTRACTS SECTION
// ═══════════════════════════════════════════════════════════════════════════════
function ContractsSection({ prefill, onSelectPayment, notify, currentUserId }) {
  const [contracts,    setContracts]   = useState([]);
  const [loading,      setLoading]     = useState(true);
  const [page,         setPage]        = useState(0);
  const [totalPages,   setTotalPages]  = useState(0);
  const [modalOpen,    setModalOpen]   = useState(false);
  const [editTarget,   setEditTarget]  = useState(null);
  const [statusTarget, setStatusTarget]= useState(null);

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await api.get(`/api/sales/contracts?page=${page}&size=10`);
      setContracts(res.data.content||[]);
      setTotalPages(res.data.totalPages||0);
    } catch { notify("Failed to load contracts","error"); }
    finally  { setLoading(false); }
  }, [page, notify]);

  useEffect(() => { fetchContracts(); }, [fetchContracts]);
  useEffect(() => {
    if (prefill?.listingId) { setEditTarget(null); setModalOpen(true); }
  }, [prefill]);

  return (
    <>
      <div className="as-card">
        <div className="as-card-header">
          <h2 className="as-card-title">Sale Contracts</h2>
          <button className="as-btn as-btn--primary" onClick={()=>{ setEditTarget(null); setModalOpen(true); }}>+ New Contract</button>
        </div>

        {loading ? <Loader/> : contracts.length===0 ? (
          <EmptyState icon="📄" text="No contracts yet."/>
        ) : (
          <>
            <div style={{ overflowX:"auto" }}>
              <table className="as-table">
                <thead>
                  <tr>
                    <th>#</th><th>Property</th><th>Buyer ID</th><th>Sale Price</th>
                    <th>Contract Date</th><th>Handover</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map(c => (
                    <tr key={c.id}>
                      <td style={{ color:"#b0a890", fontSize:11.5 }}>{c.id}</td>
                      <td>
                        <span style={{ background:"rgba(201,184,122,0.1)", color:"#c9b87a", border:"1px solid rgba(201,184,122,0.22)", padding:"3px 10px", borderRadius:999, fontSize:11.5, fontWeight:600 }}>
                          #{c.property_id}
                        </span>
                      </td>
                      <td style={{ fontWeight:500 }}>#{c.buyer_id}</td>
                      <td style={{ fontWeight:700, fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:15 }}>{fmtPrice(c.sale_price,c.currency)}</td>
                      <td style={{ color:"#9a8c6e", fontSize:12 }}>{fmtDate(c.contract_date)}</td>
                      <td style={{ color:"#9a8c6e", fontSize:12 }}>{fmtDate(c.handover_date)}</td>
                      <td><Badge label={c.status}/></td>
                      <td>
                        <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                          {c.status==="PENDING" && c.agent_id===currentUserId && (
                            <>
                              <button className="as-btn as-btn--secondary as-btn--sm" onClick={()=>{ setEditTarget(c); setModalOpen(true); }}>Edit</button>
                              <button className="as-btn as-btn--ghost as-btn--sm" onClick={()=>setStatusTarget(c)}>Status</button>
                            </>
                          )}
                          {c.agent_id===currentUserId && (
                            <button className="as-btn as-btn--primary as-btn--sm" onClick={()=>onSelectPayment({ contractId:c.id, salePrice:c.sale_price })}>Payments →</button>
                          )}
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

      {modalOpen && (
        <ContractModal initial={editTarget} prefill={prefill} onClose={()=>setModalOpen(false)}
          onSuccess={()=>{ setModalOpen(false); fetchContracts(); notify(editTarget?"Contract updated":"Contract created"); }}
          notify={notify}/>
      )}
      {statusTarget && (
        <ContractStatusModal contract={statusTarget} onClose={()=>setStatusTarget(null)}
          onSuccess={()=>{ setStatusTarget(null); fetchContracts(); notify("Contract status updated"); }}
          notify={notify}/>
      )}
    </>
  );
}

function ContractModal({ initial, prefill, onClose, onSuccess, notify }) {
  const [form, setForm] = useState({
    property_id:       initial?.property_id       ?? prefill?.propertyId ?? "",
    listing_id:        initial?.listing_id         ?? prefill?.listingId  ?? "",
    buyer_id:          initial?.buyer_id           ?? "",
    sale_price:        initial?.sale_price         ?? prefill?.price      ?? "",
    currency:          initial?.currency           ?? "EUR",
    contract_date:     initial?.contract_date      ?? "",
    handover_date:     initial?.handover_date      ?? "",
    contract_file_url: initial?.contract_file_url  ?? "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const handleSubmit = async () => {
    if (!form.property_id||!form.buyer_id||!form.sale_price) { notify("Property ID, Buyer ID and price are required","error"); return; }
    setSaving(true);
    try {
      const payload = {
        property_id: Number(form.property_id), listing_id: form.listing_id?Number(form.listing_id):null,
        buyer_id: Number(form.buyer_id), sale_price: Number(form.sale_price), currency: form.currency,
        contract_date: form.contract_date||null, handover_date: form.handover_date||null,
        contract_file_url: form.contract_file_url||null,
      };
      initial ? await api.put(`/api/sales/contracts/${initial.id}`,payload) : await api.post("/api/sales/contracts",payload);
      onSuccess();
    } catch (err) { notify(err.response?.data?.message||"Error saving","error"); }
    finally { setSaving(false); }
  };

  return (
    <Modal title={initial?`Edit Contract #${initial.id}`:"New Sale Contract"} onClose={onClose} wide>
      <FormRow>
        <Field label="Property ID" required>
          <input className="as-in" type="number" value={form.property_id} onChange={e=>set("property_id",e.target.value)} disabled={!!initial} placeholder="e.g. 42"/>
        </Field>
        <Field label="Listing ID">
          <input className="as-in" type="number" value={form.listing_id} onChange={e=>set("listing_id",e.target.value)} placeholder="(optional)"/>
        </Field>
      </FormRow>
      <FormRow>
        <Field label="Buyer ID" required>
          <input className="as-in" type="number" value={form.buyer_id} onChange={e=>set("buyer_id",e.target.value)} disabled={!!initial} placeholder="Buyer's ID"/>
        </Field>
        <Field label="Sale Price" required>
          <input className="as-in" type="number" value={form.sale_price} onChange={e=>set("sale_price",e.target.value)} placeholder="e.g. 145000"/>
        </Field>
      </FormRow>
      <FormRow>
        <Field label="Currency">
          <select className="as-in as-sel" value={form.currency} onChange={e=>set("currency",e.target.value)}>
            <option value="EUR">EUR</option><option value="USD">USD</option><option value="ALL">ALL</option>
          </select>
        </Field>
        <Field label="Contract Date">
          <input className="as-in" type="date" value={form.contract_date} onChange={e=>set("contract_date",e.target.value)}/>
        </Field>
      </FormRow>
      <FormRow>
        <Field label="Handover Date">
          <input className="as-in" type="date" value={form.handover_date} onChange={e=>set("handover_date",e.target.value)} min={form.contract_date||new Date().toISOString().split("T")[0]}/>
        </Field>
        <Field label="Contract File URL">
          <input className="as-in" value={form.contract_file_url} onChange={e=>set("contract_file_url",e.target.value)} placeholder="https://..."/>
        </Field>
      </FormRow>
      <div style={{ display:"flex", gap:9, justifyContent:"flex-end", borderTop:"1px solid #e8e2d6", paddingTop:18, marginTop:6 }}>
        <button className="as-btn as-btn--secondary" onClick={onClose}>Cancel</button>
        <button className="as-btn as-btn--primary" onClick={handleSubmit} disabled={saving}>
          {saving ? "Saving…" : initial ? "Save Changes" : "Create Contract"}
        </button>
      </div>
    </Modal>
  );
}

function ContractStatusModal({ contract, onClose, onSuccess, notify }) {
  const [status,  setStatus]  = useState("COMPLETED");
  const [saving,  setSaving]  = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await api.patch(`/api/sales/contracts/${contract.id}/status`,{ status });
      onSuccess();
    } catch (err) { notify(err.response?.data?.message||"Error","error"); }
    finally { setSaving(false); }
  };

  return (
    <Modal title={`Change Status — Contract #${contract.id}`} onClose={onClose}>
      <p style={{ fontSize:13, color:"#9a8c6e", marginBottom:16 }}>
        Current status: <Badge label={contract.status}/>
      </p>
      <Field label="New Status" required>
        <select className="as-in as-sel" value={status} onChange={e=>setStatus(e.target.value)}>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </Field>
      {status==="COMPLETED" && (
        <InfoBox type="info">
          💡 Marking as <strong>COMPLETED</strong> will automatically generate commission payments (3% of sale price).
          <br/><span style={{fontSize:11.5,opacity:0.8}}>If the property comes from a client lead, a FULL payment (97%) will also be created for the property owner.</span>
        </InfoBox>
      )}
      {status==="CANCELLED" && (
        <InfoBox type="warning">⚠️ Cancellation is irreversible.</InfoBox>
      )}
      {status==="COMPLETED" && (
        <InfoBox type="success">✓ Contract will be marked as completed successfully.</InfoBox>
      )}
      <div style={{ display:"flex", gap:9, justifyContent:"flex-end", borderTop:"1px solid #e8e2d6", paddingTop:18, marginTop:4 }}>
        <button className="as-btn as-btn--secondary" onClick={onClose}>Cancel</button>
        <button className={`as-btn ${status==="CANCELLED"?"as-btn--danger":"as-btn--primary"}`} onClick={handleSubmit} disabled={saving}>
          {saving ? "Updating…" : `Confirm — ${status}`}
        </button>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAYMENTS SECTION
// ═══════════════════════════════════════════════════════════════════════════════
function PaymentsSection({ prefill, notify }) {
  const [contractId,     setContractId]     = useState(prefill?.contractId??"");
  const [contractStatus, setContractStatus] = useState(null);
  const [payments,       setPayments]       = useState([]);
  const [summary,        setSummary]        = useState(null);
  const [loading,        setLoading]        = useState(false);
  const [createOpen,     setCreateOpen]     = useState(false);
  const [payTarget,      setPayTarget]      = useState(null);

  useEffect(() => { if (prefill?.contractId) setContractId(prefill.contractId); }, [prefill]);
  useEffect(() => { if (contractId) fetchPayments(); }, [contractId]);

  const fetchPayments = async () => {
    if (!contractId) return;
    setLoading(true);
    try {
      const [listRes, sumRes, contractRes] = await Promise.all([
        api.get(`/api/sales/payments/contract/${contractId}`),
        api.get(`/api/sales/payments/contract/${contractId}/summary`),
        api.get(`/api/sales/contracts/${contractId}`),
      ]);
      setPayments(listRes.data||[]);
      setSummary(sumRes.data);
      setContractStatus(contractRes.data?.status??null);
    } catch { notify("Failed to load payments","error"); }
    finally  { setLoading(false); }
  };

  const handleMarkPaid = async (data) => {
    try {
      await api.patch(`/api/sales/payments/${payTarget.id}/pay`, data);
      notify("Payment marked as PAID");
      setPayTarget(null);
      fetchPayments();
    } catch (err) { notify(err.response?.data?.message||"Error","error"); }
  };

  const paidPct = summary && Number(summary.total_paid)>0 && prefill?.salePrice
    ? Math.min(100, Math.round((Number(summary.total_paid)/Number(prefill.salePrice))*100))
    : null;

  return (
    <>
      <div className="as-card">
        <div className="as-card-header">
          <h2 className="as-card-title">Sale Payments</h2>
          <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <label style={{ fontSize:12.5, color:"#9a8c6e", whiteSpace:"nowrap" }}>Contract #</label>
              <input className="as-in" type="number" style={{ width:110, height:36, padding:"0 12px", fontSize:13 }}
                value={contractId} onChange={e=>setContractId(e.target.value)} placeholder="ID…"/>
              <button className="as-btn as-btn--secondary as-btn--sm" onClick={fetchPayments}>Load</button>
            </div>
            {contractId && contractStatus!=="COMPLETED" && contractStatus!=="CANCELLED" && (
              <button className="as-btn as-btn--primary as-btn--sm" onClick={()=>setCreateOpen(true)}>+ Add Payment</button>
            )}
            {contractId && contractStatus==="COMPLETED" && (
              <span style={{ fontSize:12, color:"#2a6049", fontWeight:600, background:"rgba(126,184,164,0.1)", padding:"5px 13px", borderRadius:999, border:"1.5px solid rgba(126,184,164,0.25)" }}>
                ✓ Payments finalized automatically
              </span>
            )}
          </div>
        </div>

        {/* Summary bar */}
        {summary && (
          <div style={{ display:"flex", gap:16, padding:"16px 22px", background:"#faf7f2", borderBottom:"1.5px solid #ece6da", alignItems:"center", flexWrap:"wrap" }}>
            {[
              { label:"Total Payments", value:summary.total_payments, color:"#1a1714" },
              { label:"Total Paid",     value:`€${Number(summary.total_paid).toLocaleString("de-DE")}`, color:"#2a6049" },
            ].map((s,i) => (
              <div key={i} style={{ display:"flex", flexDirection:"column", gap:3 }}>
                <span style={{ fontSize:9.5, color:"#b0a890", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.8px" }}>{s.label}</span>
                <span style={{ fontSize:20, fontWeight:700, color:s.color, fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{s.value}</span>
              </div>
            ))}

            {payments.some(p=>p.payment_type==="DEPOSIT"||p.payment_type==="INSTALLMENT") && (
              <>
                <div style={{ width:1, height:32, background:"#e8e2d6" }}/>
                <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                  <span style={{ fontSize:9.5, color:"#b0a890", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.8px" }}>Deposit / Installments</span>
                  <span style={{ fontSize:20, fontWeight:700, color:"#9a7a30", fontFamily:"'Cormorant Garamond',Georgia,serif" }}>
                    €{payments.filter(p=>(p.payment_type==="DEPOSIT"||p.payment_type==="INSTALLMENT")&&p.status==="PAID").reduce((s,p)=>s+Number(p.amount),0).toLocaleString("de-DE")}
                  </span>
                </div>
              </>
            )}

            {paidPct!==null && (
              <>
                <div style={{ width:1, height:32, background:"#e8e2d6" }}/>
                <div style={{ flex:1, minWidth:160 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                    <span style={{ fontSize:9.5, color:"#b0a890", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.8px" }}>Paid</span>
                    <span style={{ fontSize:12.5, fontWeight:700, color:paidPct===100?"#2a6049":"#c9b87a" }}>{paidPct}%</span>
                  </div>
                  <div style={{ height:6, background:"#e8e2d6", borderRadius:99 }}>
                    <div style={{ height:"100%", borderRadius:99, width:`${paidPct}%`, background:paidPct===100?"#7eb8a4":"linear-gradient(90deg,#c9b87a,#b0983e)", transition:"width .4s ease" }}/>
                  </div>
                </div>
              </>
            )}

            {payments.some(p=>p.payment_type==="AGENT_COMMISSION") && (
              <>
                <div style={{ width:1, height:32, background:"#e8e2d6" }}/>
                {[
                  { label:"Owner / Client", value:payments.filter(p=>p.payment_type==="FULL").reduce((s,p)=>s+Number(p.amount),0), color:"#9a7a30" },
                  { label:"Agent Commission", value:payments.filter(p=>p.payment_type==="AGENT_COMMISSION").reduce((s,p)=>s+Number(p.amount),0), color:"#4a5a30" },
                  { label:"Company", value:payments.filter(p=>p.payment_type==="COMMISSION").reduce((s,p)=>s+Number(p.amount),0), color:"#2a6049" },
                ].map((s,i) => (
                  <div key={i} style={{ display:"flex", flexDirection:"column", gap:3 }}>
                    <span style={{ fontSize:9.5, color:"#b0a890", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.8px" }}>{s.label}</span>
                    <span style={{ fontSize:16, fontWeight:700, color:s.color, fontFamily:"'Cormorant Garamond',Georgia,serif" }}>€{s.value.toLocaleString("de-DE")}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {!contractId ? (
          <EmptyState icon="💳" text="Enter a Contract ID and click Load to view payments."/>
        ) : loading ? <Loader/> : payments.length===0 ? (
          <EmptyState icon="💳" text="No payments for this contract."/>
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table className="as-table">
              <thead>
                <tr>
                  <th>#</th><th>Amount</th><th>Type</th><th>Recipient</th>
                  <th>Method</th><th>Paid Date</th><th>Ref</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => {
                  const tc = PAY_TYPE_CFG[p.payment_type]||PAY_TYPE_CFG.FULL;
                  return (
                    <tr key={p.id}>
                      <td style={{ color:"#b0a890", fontSize:11.5 }}>{p.id}</td>
                      <td style={{ fontWeight:700, fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:15 }}>{fmtPrice(p.amount,p.currency)}</td>
                      <td>
                        <span style={{ background:tc.bg, color:tc.color, border:`1.5px solid ${tc.border}`, padding:"3px 10px", borderRadius:999, fontSize:10.5, fontWeight:700, textTransform:"uppercase" }}>
                          {p.payment_type}
                        </span>
                      </td>
                      <td>
                        {p.recipient_name ? (
                          <span style={{ fontSize:13, color:"#6b6248" }}>
                            {p.recipient_type==="AGENT" ? `👤 ${p.recipient_name}` : p.payment_type==="FULL" ? `🏠 ${p.recipient_name} (Owner)` : `🎁 ${p.recipient_name} (Bonus)`}
                          </span>
                        ) : (
                          <span style={{ fontSize:11.5, color:"#2a6049", fontWeight:600, background:"rgba(126,184,164,0.1)", padding:"3px 10px", borderRadius:999, border:"1px solid rgba(126,184,164,0.22)" }}>🏢 Company</span>
                        )}
                      </td>
                      <td style={{ color:"#9a8c6e", fontSize:12 }}>{p.payment_method||"—"}</td>
                      <td style={{ color:"#9a8c6e", fontSize:12 }}>{fmtDate(p.paid_date)}</td>
                      <td style={{ fontSize:11.5, color:"#b0a890" }}>{p.transaction_ref||"—"}</td>
                      <td><Badge label={p.status}/></td>
                      <td>
                        {p.status==="PENDING" && (
                          <button className="as-btn as-btn--primary as-btn--sm" onClick={()=>setPayTarget(p)}>Mark Paid</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {createOpen && (
        <PaymentCreateModal contractId={contractId} onClose={()=>setCreateOpen(false)}
          onSuccess={()=>{ setCreateOpen(false); fetchPayments(); notify("Payment created"); }}
          notify={notify}/>
      )}
      {payTarget && (
        <MarkPaidModal payment={payTarget} onClose={()=>setPayTarget(null)} onSubmit={handleMarkPaid} notify={notify}/>
      )}
    </>
  );
}

function PaymentCreateModal({ contractId, onClose, onSuccess, notify }) {
  const [form, setForm] = useState({ amount:"", currency:"EUR", payment_type:"DEPOSIT", payment_method:"BANK_TRANSFER" });
  const [saving, setSaving] = useState(false);
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const handleSubmit = async () => {
    if (!form.amount) { notify("Amount is required","error"); return; }
    setSaving(true);
    try {
      await api.post("/api/sales/payments",{ contract_id:Number(contractId), amount:Number(form.amount), currency:form.currency, payment_type:form.payment_type, payment_method:form.payment_method });
      onSuccess();
    } catch (err) { notify(err.response?.data?.message||"Error","error"); }
    finally { setSaving(false); }
  };

  return (
    <Modal title={`New Payment — Contract #${contractId}`} onClose={onClose}>
      <InfoBox type="info">
        💡 Register only advance payments here (deposit or installments).
        <br/><span style={{fontSize:11.5,opacity:0.8}}>FULL, COMMISSION and AGENT_COMMISSION payments are created automatically when the contract is marked COMPLETED. Any amount entered here will be deducted from the final payment.</span>
      </InfoBox>
      <FormRow>
        <Field label="Amount" required>
          <input className="as-in" type="number" value={form.amount} onChange={e=>set("amount",e.target.value)} placeholder="e.g. 14500"/>
        </Field>
        <Field label="Currency">
          <select className="as-in as-sel" value={form.currency} onChange={e=>set("currency",e.target.value)}>
            <option value="EUR">EUR</option><option value="USD">USD</option><option value="ALL">ALL</option>
          </select>
        </Field>
      </FormRow>
      <FormRow>
        <Field label="Payment Type">
          <select className="as-in as-sel" value={form.payment_type} onChange={e=>set("payment_type",e.target.value)}>
            {MANUAL_PAYMENT_TYPES.map(t=><option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Payment Method">
          <select className="as-in as-sel" value={form.payment_method} onChange={e=>set("payment_method",e.target.value)}>
            {PAYMENT_METHODS.map(m=><option key={m}>{m}</option>)}
          </select>
        </Field>
      </FormRow>
      <div style={{ display:"flex", gap:9, justifyContent:"flex-end", borderTop:"1px solid #e8e2d6", paddingTop:18, marginTop:6 }}>
        <button className="as-btn as-btn--secondary" onClick={onClose}>Cancel</button>
        <button className="as-btn as-btn--primary" onClick={handleSubmit} disabled={saving}>
          {saving ? "Creating…" : "Create Payment"}
        </button>
      </div>
    </Modal>
  );
}

function MarkPaidModal({ payment, onClose, onSubmit, notify }) {
  const [form, setForm] = useState({ payment_method:payment.payment_method||"BANK_TRANSFER", transaction_ref:"", paid_date:new Date().toISOString().split("T")[0] });
  const [saving, setSaving] = useState(false);
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const handleSubmit = async () => {
    setSaving(true);
    try { await onSubmit({ payment_method:form.payment_method, transaction_ref:form.transaction_ref||null, paid_date:form.paid_date }); }
    finally { setSaving(false); }
  };

  return (
    <Modal title={`Mark Payment #${payment.id} as PAID`} onClose={onClose}>
      <InfoBox type="success">
        Amount: <strong>{fmtPrice(payment.amount,payment.currency)}</strong>
      </InfoBox>
      <Field label="Payment Method">
        <select className="as-in as-sel" value={form.payment_method} onChange={e=>set("payment_method",e.target.value)}>
          {PAYMENT_METHODS.map(m=><option key={m}>{m}</option>)}
        </select>
      </Field>
      <FormRow>
        <Field label="Transaction Ref">
          <input className="as-in" value={form.transaction_ref} onChange={e=>set("transaction_ref",e.target.value)} placeholder="TXN-12345"/>
        </Field>
        <Field label="Paid Date">
          <input className="as-in" type="date" value={form.paid_date} onChange={e=>set("paid_date",e.target.value)}/>
        </Field>
      </FormRow>
      <div style={{ display:"flex", gap:9, justifyContent:"flex-end", borderTop:"1px solid #e8e2d6", paddingTop:18, marginTop:6 }}>
        <button className="as-btn as-btn--secondary" onClick={onClose}>Cancel</button>
        <button className="as-btn as-btn--primary" onClick={handleSubmit} disabled={saving}>
          {saving ? "Confirming…" : "✓ Confirm PAID"}
        </button>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function AgentSales() {
  const { user } = useContext(AuthContext);
  const [tab,             setTab]             = useState("listings");
  const [toast,           setToast]           = useState(null);
  const [contractPrefill, setContractPrefill] = useState(null);
  const [paymentPrefill,  setPaymentPrefill]  = useState(null);

  const notify = useCallback((msg,type="success") => setToast({ msg, type, key:Date.now() }), []);

  const goToContract = (prefill) => { setContractPrefill(prefill); setTab("contracts"); };
  const goToPayment  = (prefill) => { setPaymentPrefill(prefill);  setTab("payments");  };

  return (
    <MainLayout role="agent">
      <style>{CSS}</style>
      <div className="as">

        {/* ── Hero ── */}
        <div style={{
          background:"linear-gradient(160deg,#141210 0%,#1e1a14 45%,#241e16 100%)",
          minHeight:260,
          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
          padding:"36px 32px", position:"relative", overflow:"hidden",
        }}>
          <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,0.018) 1px,transparent 1px)",backgroundSize:"22px 22px",pointerEvents:"none"}}/>
          <div style={{position:"absolute",top:"-60px",left:"8%",width:280,height:280,borderRadius:"50%",background:"radial-gradient(circle,rgba(201,184,122,0.07) 0%,transparent 70%)",pointerEvents:"none",animation:"as-glow 4s ease-in-out infinite"}}/>
          <div style={{position:"absolute",bottom:"-40px",right:"8%",width:220,height:220,borderRadius:"50%",background:"radial-gradient(circle,rgba(126,184,164,0.05) 0%,transparent 70%)",pointerEvents:"none",animation:"as-glow 4s ease-in-out infinite 2s"}}/>
          <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:"linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)"}}/>

          <div style={{ position:"relative", zIndex:1, maxWidth:700, width:"100%", textAlign:"center" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(201,184,122,0.1)", border:"1px solid rgba(201,184,122,0.18)", borderRadius:999, padding:"4px 14px", marginBottom:14 }}>
              <span style={{ width:5, height:5, borderRadius:"50%", background:"#c9b87a", display:"inline-block", boxShadow:"0 0 6px #c9b87a" }}/>
              <span style={{ fontSize:10.5, fontWeight:600, color:"#c9b87a", letterSpacing:"1.2px", textTransform:"uppercase" }}>Sales Management</span>
            </div>

            <h1 style={{ margin:"0 0 10px", fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"clamp(26px,3.5vw,40px)", fontWeight:700, color:"#f5f0e8", letterSpacing:"-0.7px", lineHeight:1.1 }}>
              Sales{" "}
              <span style={{ background:"linear-gradient(90deg,#c9b87a,#e8d9a0,#c9b87a)", backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>Pipeline</span>
            </h1>

            <p style={{ margin:"0 auto 22px", fontSize:13.5, color:"rgba(245,240,232,0.38)", fontFamily:"'DM Sans',sans-serif", lineHeight:1.6 }}>
              Manage listings, contracts and sale payments in one place
            </p>

            {/* Workflow steps */}
            <div style={{ display:"inline-flex", alignItems:"center", gap:10, background:"rgba(245,240,232,0.05)", backdropFilter:"blur(10px)", borderRadius:12, padding:"10px 20px", border:"1px solid rgba(245,240,232,0.1)" }}>
              {[
                { step:"1", label:"Listing",  icon:"🏷️", id:"listings"  },
                { step:"2", label:"Contract", icon:"📄", id:"contracts" },
                { step:"3", label:"Payment",  icon:"💳", id:"payments"  },
              ].map((s,i) => (
                <div key={s.id} style={{ display:"flex", alignItems:"center", gap:8 }}>
                  {i>0 && <span style={{ color:"rgba(201,184,122,0.3)", fontSize:14 }}>──</span>}
                  <button onClick={()=>setTab(s.id)}
                    style={{
                      display:"flex", alignItems:"center", gap:6,
                      background:"none", border:"none", cursor:"pointer",
                      padding:"4px 8px", borderRadius:8,
                      opacity: tab===s.id ? 1 : 0.45,
                      transition:"opacity 0.15s",
                    }}>
                    <span style={{ fontSize:14 }}>{s.icon}</span>
                    <span style={{ fontSize:12, fontWeight:tab===s.id?700:400, color:tab===s.id?"#c9b87a":"rgba(245,240,232,0.7)", fontFamily:"'DM Sans',sans-serif" }}>{s.step}. {s.label}</span>
                  </button>
                </div>
              ))}
              <span style={{ marginLeft:8, fontSize:10.5, color:"rgba(245,240,232,0.25)", fontFamily:"'DM Sans',sans-serif" }}>Click "Contract →" for quick workflow</span>
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div style={{ padding:"24px", maxWidth:1400, margin:"0 auto" }}>
          <SectionTabs active={tab} onChange={setTab}/>

          {tab==="listings"  && <ListingsSection  onSelectContract={goToContract} notify={notify} currentUserId={user?.id}/>}
          {tab==="contracts" && <ContractsSection prefill={contractPrefill} onSelectPayment={goToPayment} notify={notify} currentUserId={user?.id}/>}
          {tab==="payments"  && <PaymentsSection  prefill={paymentPrefill} notify={notify}/>}
        </div>
      </div>

      {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}
    </MainLayout>
  );
}