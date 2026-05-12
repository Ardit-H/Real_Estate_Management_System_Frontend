import { useState, useEffect, useCallback, useContext } from "react";
import { AuthContext } from "../../context/AuthProvider";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";
 
// ── Constants (pa ndryshim) ───────────────────────────────────────────────────
const SALE_STATUSES   = ["ACTIVE", "SOLD", "PENDING", "CANCELLED"];
const CONTRACT_STATUSES = ["PENDING", "COMPLETED", "CANCELLED"];
const PAYMENT_TYPES   = ["FULL", "DEPOSIT", "INSTALLMENT", "COMMISSION","AGENT_COMMISSION", "CLIENT_BONUS"];
const PAYMENT_METHODS = ["BANK_TRANSFER", "CASH", "CARD", "CHECK"];
const MANUAL_PAYMENT_TYPES = ["DEPOSIT", "INSTALLMENT"];
const TYPE_COLORS = {
  FULL:             { bg:"#f0ece3", color:"#4a4438" },
  DEPOSIT:          { bg:"rgba(201,184,122,0.12)", color:"#8a7230" },
  INSTALLMENT:      { bg:"#f0ece3", color:"#6b6248" },
  COMMISSION:       { bg:"rgba(126,184,164,0.12)", color:"#2a6049" },
  AGENT_COMMISSION: { bg:"rgba(201,184,122,0.12)", color:"#8a6430" },
  CLIENT_BONUS:     { bg:"rgba(164,176,126,0.12)", color:"#4a6030" },
};
 
// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtPrice = (v, cur="EUR") => v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";
const fmtDate  = (d) => d ? new Date(d).toLocaleDateString("sq-AL") : "—";
 
// ── Design tokens ─────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
  .as * { box-sizing: border-box; }
  .as { font-family: 'DM Sans', system-ui, sans-serif; background: #f2ede4; min-height: 100vh; }
  .as-btn { transition: all 0.17s ease; }
  .as-btn:hover:not(:disabled) { opacity: 0.86; transform: translateY(-1px); }
  .as-in:focus { border-color: #8a7d5e !important; box-shadow: 0 0 0 3px rgba(138,125,94,0.13) !important; outline: none; }
  @keyframes as-scale-in { from{opacity:0;transform:scale(0.95) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes as-fade-up   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes as-spin      { to{transform:rotate(360deg)} }
  @keyframes as-toast     { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes as-glow      { 0%,100%{opacity:0.07} 50%{opacity:0.14} }
`;
 
const STATUS_BADGE_CFG = {
  ACTIVE:    { bg:"rgba(126,184,164,0.12)", color:"#2a6049",  border:"rgba(126,184,164,0.25)" },
  SOLD:      { bg:"rgba(201,184,122,0.12)", color:"#8a7230",  border:"rgba(201,184,122,0.25)" },
  PENDING:   { bg:"rgba(201,184,122,0.1)",  color:"#a8923e",  border:"rgba(201,184,122,0.2)"  },
  CANCELLED: { bg:"rgba(212,133,90,0.1)",   color:"#8b4013",  border:"rgba(212,133,90,0.2)"   },
  COMPLETED: { bg:"rgba(126,184,164,0.12)", color:"#2a6049",  border:"rgba(126,184,164,0.25)" },
  PAID:      { bg:"rgba(126,184,164,0.12)", color:"#2a6049",  border:"rgba(126,184,164,0.25)" },
  FAILED:    { bg:"rgba(212,133,90,0.1)",   color:"#8b4013",  border:"rgba(212,133,90,0.2)"   },
  REFUNDED:  { bg:"rgba(160,153,126,0.1)",  color:"#6b6248",  border:"rgba(160,153,126,0.2)"  },
};
 
function Badge({ label }) {
  const s = STATUS_BADGE_CFG[label] || { bg:"#f0ece3", color:"#6b6248", border:"#e0d8c8" };
  return (
    <span style={{background:s.bg,color:s.color,border:`1px solid ${s.border}`,padding:"3px 11px",borderRadius:999,fontSize:10.5,fontWeight:700,letterSpacing:"0.3px",textTransform:"uppercase"}}>
      {label}
    </span>
  );
}
 
// ── Shared UI (dark-gold themed) ──────────────────────────────────────────────
function Modal({ title, onClose, children, wide=false }) {
  useEffect(() => {
    const h = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [onClose]);
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(8,6,4,0.84)",backdropFilter:"blur(14px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{width:"100%",maxWidth:wide?720:520,background:"#faf7f2",borderRadius:18,boxShadow:"0 44px 100px rgba(0,0,0,0.55)",maxHeight:"92vh",overflowY:"auto",animation:"as-scale-in 0.26s ease"}}>
        <div style={{background:"linear-gradient(160deg,#141210 0%,#1e1a14 45%,#241e16 100%)",padding:"18px 24px",borderBottom:"1px solid rgba(201,184,122,0.14)",display:"flex",alignItems:"center",justifyContent:"space-between",position:"relative",borderRadius:"18px 18px 0 0"}}>
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
 
function Toast({ msg, type="success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{position:"fixed",bottom:26,right:26,zIndex:9999,background:"#1a1714",color:type==="error"?"#f09090":"#90c8a8",padding:"11px 18px",borderRadius:12,fontSize:13,boxShadow:"0 10px 36px rgba(0,0,0,0.32)",border:`1px solid ${type==="error"?"rgba(240,128,128,0.15)":"rgba(144,200,168,0.15)"}`,maxWidth:320,fontFamily:"'DM Sans',sans-serif",animation:"as-toast 0.2s ease",display:"flex",alignItems:"center",gap:8}}>
      <span style={{fontSize:14}}>{type==="error"?"⚠️":"✅"}</span>{msg}
    </div>
  );
}
 
function EmptyState({ icon, text }) {
  return (
    <div style={{textAlign:"center",padding:"52px 20px",color:"#b0a890",fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{fontSize:32,marginBottom:10}}>{icon}</div>
      <p style={{fontSize:14}}>{text}</p>
    </div>
  );
}
 
function Loader() {
  return (
    <div style={{textAlign:"center",padding:"48px 0"}}>
      <div style={{width:26,height:26,margin:"0 auto",border:"2px solid #e8e2d6",borderTop:"2px solid #c9b87a",borderRadius:"50%",animation:"as-spin 0.8s linear infinite"}}/>
    </div>
  );
}
 
function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{display:"flex",alignItems:"center",gap:6,justifyContent:"flex-end",padding:"14px 16px"}}>
      <button disabled={page===0} onClick={()=>onChange(page-1)} style={PGB(false,page===0)}>← Prev</button>
      <span style={{fontSize:13,color:"#9a8c6e",padding:"0 8px"}}>{page+1} / {totalPages}</span>
      <button disabled={page>=totalPages-1} onClick={()=>onChange(page+1)} style={PGB(false,page>=totalPages-1)}>Next →</button>
    </div>
  );
}
const PGB=(active,disabled)=>({padding:"6px 14px",borderRadius:9,border:`1.5px solid ${active?"#1a1714":"#e4ddd0"}`,background:active?"#1a1714":"transparent",color:active?"#f5f0e8":disabled?"#d4ccbe":"#6b6248",cursor:disabled?"not-allowed":"pointer",fontSize:12.5,fontWeight:active?600:400,fontFamily:"'DM Sans',sans-serif",opacity:disabled?0.5:1,transition:"all 0.14s"});
 
const INP_S = {width:"100%",padding:"10px 13px",border:"1.5px solid #e4ddd0",borderRadius:10,fontSize:13.5,color:"#1a1714",background:"#fff",fontFamily:"'DM Sans',sans-serif",boxSizing:"border-box",outline:"none",transition:"border-color 0.2s"};
const SEL_S = {...INP_S,cursor:"pointer"};
const BTN_PRI = {padding:"10px 22px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#c9b87a,#b0983e)",color:"#1a1714",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"};
const BTN_SEC = {padding:"10px 18px",borderRadius:10,border:"1.5px solid #e4ddd0",background:"transparent",color:"#6b6248",fontWeight:500,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"};
 
// ── Section Tabs ──────────────────────────────────────────────────────────────
function SectionTabs({ active, onChange }) {
  const tabs = [
    { id:"listings",  label:"Sale Listings", icon:"🏷️" },
    { id:"contracts", label:"Contracts",     icon:"📄" },
    { id:"payments",  label:"Payments",      icon:"💳" },
  ];
  return (
    <div style={{display:"flex",gap:4,marginBottom:22,borderBottom:"1.5px solid #e8e2d6",paddingBottom:0}}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          padding:"10px 18px",border:"none",
          borderBottom:active===t.id?"2.5px solid #c9b87a":"2.5px solid transparent",
          background:"none",color:active===t.id?"#1a1714":"#9a8c6e",
          fontWeight:active===t.id?600:400,fontSize:13.5,cursor:"pointer",
          fontFamily:"'DM Sans',sans-serif",marginBottom:-1.5,
          display:"flex",alignItems:"center",gap:6,transition:"color .15s"}}>
          {t.icon} {t.label}
        </button>
      ))}
    </div>
  );
}
 
// ── Table wrapper ─────────────────────────────────────────────────────────────
function AgentTable({ children }) {
  return (
    <div style={{background:"#fff",borderRadius:14,border:"1.5px solid #ece6da",boxShadow:"0 2px 16px rgba(20,16,10,0.07)",overflow:"hidden"}}>
      {children}
    </div>
  );
}
 
function TableHead({ children }) {
  return (
    <div style={{padding:"14px 20px",borderBottom:"1.5px solid #e8e2d6",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      {children}
    </div>
  );
}
 
// ═════════════════════════════════════════════════════════════════════════════
// LISTINGS SECTION (logjika identike, dizajn i ri)
// ═════════════════════════════════════════════════════════════════════════════
function ListingsSection({ onSelectContract, notify, currentUserId }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [showOnlyMine, setShowOnlyMine] = useState(true);
  const [agentNames, setAgentNames] = useState({});
 
  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const url = showOnlyMine
        ? `/api/sales/listings/agent/me?page=${page}&size=10`
        : statusFilter
          ? `/api/sales/listings/status/${statusFilter}?page=${page}&size=10`
          : `/api/sales/listings?page=${page}&size=10&sortBy=createdAt&sortDir=desc`;
      const res = await api.get(url);
      setListings(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch { notify("Gabim gjatë ngarkimit", "error"); }
    finally { setLoading(false); }
  }, [page, statusFilter, showOnlyMine, notify]);
 
  useEffect(() => { fetchListings(); }, [fetchListings]);
  useEffect(() => {
    api.get("/api/users/agents/list").then(res => {
      const map = {};
      (res.data||[]).forEach(u => { map[u.id] = `${u.first_name} ${u.last_name}`.trim() || `Agent #${u.id}`; });
      setAgentNames(map);
    }).catch(() => {});
  }, []);
 
  const handleDelete = async () => {
    try {
      await api.delete(`/api/sales/listings/${deleteId}`);
      notify("Listing u fshi me sukses");
      setDeleteId(null); fetchListings();
    } catch { notify("Gabim gjatë fshirjes", "error"); }
  };
 
  return (
    <>
      <AgentTable>
        <TableHead>
          <span style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontWeight:700,fontSize:17,color:"#1a1714"}}>Sale Listings</span>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <button onClick={() => { setShowOnlyMine(p => !p); setPage(0); }}
              style={{padding:"5px 14px",borderRadius:999,fontSize:12,fontWeight:600,cursor:"pointer",border:"1.5px solid",background:showOnlyMine?"rgba(201,184,122,0.12)":"#f0ece3",color:showOnlyMine?"#c9b87a":"#9a8c6e",borderColor:showOnlyMine?"rgba(201,184,122,0.3)":"#e4ddd0",fontFamily:"'DM Sans',sans-serif"}}>
              {showOnlyMine ? "👤 My Listings" : "🌐 All Listings"}
            </button>
            {!showOnlyMine && (
              <select className="as-in" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
                style={{...SEL_S,width:140,height:34,padding:"0 10px",fontSize:12.5}}>
                <option value="">All statuses</option>
                {SALE_STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            )}
            <button className="as-btn" onClick={() => { setEditTarget(null); setModalOpen(true); }}
              style={{...BTN_PRI,padding:"7px 16px",fontSize:12.5}}>+ New Listing</button>
          </div>
        </TableHead>
 
        {loading ? <Loader /> : listings.length === 0 ? (
          <EmptyState icon="🏷️" text="Nuk ka listings. Krijo listingun e parë." />
        ) : (
          <>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{background:"#faf7f2"}}>
                    {["#","Property ID",...(!showOnlyMine?["Agent"]:[]),"Price","Negotiable","Status","Created","Actions"].map(h => (
                      <th key={h} style={{textAlign:"left",fontSize:10.5,fontWeight:600,color:"#b0a890",textTransform:"uppercase",letterSpacing:"0.8px",padding:"10px 16px",borderBottom:"1.5px solid #e8e2d6",whiteSpace:"nowrap"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {listings.map(l => {
                    const isOwner = l.agent_id === currentUserId;
                    return (
                      <tr key={l.id} style={{borderBottom:"1px solid #f0ece3",transition:"background 0.12s"}}
                        onMouseEnter={e=>e.currentTarget.style.background="#faf7f2"}
                        onMouseLeave={e=>e.currentTarget.style.background=""}>
                        <td style={{padding:"12px 16px",color:"#b0a890",fontSize:12}}>{l.id}</td>
                        <td style={{padding:"12px 16px"}}>
                          <span style={{background:"rgba(201,184,122,0.1)",color:"#c9b87a",border:"1px solid rgba(201,184,122,0.22)",padding:"2px 9px",borderRadius:999,fontSize:11.5,fontWeight:600}}>#{l.property_id}</span>
                        </td>
                        {!showOnlyMine && (
                          <td style={{padding:"12px 16px",fontSize:12.5,color:"#6b6248"}}>
                            {l.agent_id===currentUserId ? <span style={{color:"#c9b87a",fontWeight:600}}>👤 Unë</span> : agentNames[l.agent_id]||`Agent #${l.agent_id}`}
                          </td>
                        )}
                        <td style={{padding:"12px 16px",fontWeight:700,fontSize:14,color:"#1a1714",fontFamily:"'Cormorant Garamond',Georgia,serif"}}>{fmtPrice(l.price)}</td>
                        <td style={{padding:"12px 16px",fontSize:12,fontWeight:500,color:l.negotiable?"#2a6049":"#b0a890"}}>{l.negotiable?"✓ Yes":"No"}</td>
                        <td style={{padding:"12px 16px"}}><Badge label={l.status}/></td>
                        <td style={{padding:"12px 16px",fontSize:12,color:"#9a8c6e"}}>{fmtDate(l.created_at)}</td>
                        <td style={{padding:"12px 16px"}}>
                          <div style={{display:"flex",gap:5}}>
                            {isOwner ? (
                              <>
                                <button onClick={() => { setEditTarget(l); setModalOpen(true); }} style={{...BTN_SEC,padding:"5px 11px",fontSize:12}}>Edit</button>
                                <button onClick={() => onSelectContract({listingId:l.id,propertyId:l.property_id,price:l.price})} style={{...BTN_PRI,padding:"5px 11px",fontSize:12}}>Contract →</button>
                                <button onClick={() => setDeleteId(l.id)} style={{padding:"5px 11px",borderRadius:9,border:"1.5px solid rgba(212,133,90,0.3)",background:"rgba(212,133,90,0.08)",color:"#8b4013",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Del</button>
                              </>
                            ) : (
                              <span style={{fontSize:11.5,color:"#b0a890",background:"#f0ece3",padding:"3px 10px",borderRadius:999,fontStyle:"italic"}}>Vetëm shiko</span>
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
      </AgentTable>
 
      {modalOpen && (
        <ListingModal initial={editTarget} onClose={() => setModalOpen(false)}
          onSuccess={() => { setModalOpen(false); fetchListings(); notify(editTarget?"Listing u ndryshua":"Listing u krijua"); }}
          notify={notify}/>
      )}
 
      {deleteId && (
        <Modal title="Konfirmo fshirjen" onClose={() => setDeleteId(null)}>
          <p style={{fontSize:14,color:"#6b6248",marginBottom:20}}>A jeni i sigurt që dëshironi të fshini listing <strong style={{color:"#1a1714"}}>#{deleteId}</strong>?</p>
          <div style={{display:"flex",gap:9,justifyContent:"flex-end"}}>
            <button onClick={() => setDeleteId(null)} style={BTN_SEC}>Anulo</button>
            <button onClick={handleDelete} style={{...BTN_PRI,background:"#8b3a1c"}}>Fshi</button>
          </div>
        </Modal>
      )}
    </>
  );
}
 
function ListingModal({ initial, onClose, onSuccess, notify }) {
  const [form, setForm] = useState({
    property_id: initial?.property_id ?? "",
    price: initial?.price ?? "",
    currency: initial?.currency ?? "EUR",
    negotiable: initial?.negotiable ?? true,
    description: initial?.description ?? "",
    highlights: initial?.highlights ?? "",
    status: initial?.status ?? "ACTIVE",
  });
  const [saving, setSaving] = useState(false);
  const set = (k,v) => setForm(p => ({...p,[k]:v}));
 
  const handleSubmit = async () => {
    if (!form.property_id||!form.price) { notify("Property ID dhe çmimi janë të detyrueshme","error"); return; }
    setSaving(true);
    try {
      const payload = { property_id:Number(form.property_id),price:Number(form.price),currency:form.currency,negotiable:form.negotiable,description:form.description||null,highlights:form.highlights||null,...(initial&&{status:form.status}) };
      initial ? await api.put(`/api/sales/listings/${initial.id}`,payload) : await api.post("/api/sales/listings",payload);
      onSuccess();
    } catch(err) { notify(err.response?.data?.message||"Gabim","error"); }
    finally { setSaving(false); }
  };
 
  return (
    <Modal title={initial?`Edit Listing #${initial.id}`:"New Sale Listing"} onClose={onClose}>
      <FormRow>
        <Field label="Property ID" required><input className="as-in" style={INP_S} type="number" value={form.property_id} onChange={e=>set("property_id",e.target.value)} placeholder="ex: 42" disabled={!!initial}/></Field>
        <Field label="Price" required><input className="as-in" style={INP_S} type="number" value={form.price} onChange={e=>set("price",e.target.value)} placeholder="ex: 145000"/></Field>
      </FormRow>
      <FormRow>
        <Field label="Currency"><select className="as-in" style={SEL_S} value={form.currency} onChange={e=>set("currency",e.target.value)}><option value="EUR">EUR</option><option value="USD">USD</option><option value="ALL">ALL</option></select></Field>
        <Field label="Negotiable"><select className="as-in" style={SEL_S} value={String(form.negotiable)} onChange={e=>set("negotiable",e.target.value==="true")}><option value="true">Po</option><option value="false">Jo</option></select></Field>
      </FormRow>
      {initial && <Field label="Status"><select className="as-in" style={SEL_S} value={form.status} onChange={e=>set("status",e.target.value)}>{SALE_STATUSES.map(s=><option key={s}>{s}</option>)}</select></Field>}
      <Field label="Description"><textarea className="as-in" style={{...INP_S,resize:"vertical"}} rows={3} value={form.description} onChange={e=>set("description",e.target.value)} placeholder="Përshkrim i pronës..."/></Field>
      <Field label="Highlights"><textarea className="as-in" style={{...INP_S,resize:"vertical"}} rows={2} value={form.highlights} onChange={e=>set("highlights",e.target.value)} placeholder="Tiparet kryesore..."/></Field>
      <div style={{display:"flex",gap:9,justifyContent:"flex-end",marginTop:6}}>
        <button style={BTN_SEC} onClick={onClose}>Anulo</button>
        <button style={BTN_PRI} onClick={handleSubmit} disabled={saving}>{saving?"Duke ruajtur...":initial?"Ruaj ndryshimet":"Krijo listing"}</button>
      </div>
    </Modal>
  );
}
 
// ═════════════════════════════════════════════════════════════════════════════
// CONTRACTS SECTION
// ═════════════════════════════════════════════════════════════════════════════
function ContractsSection({ prefill, onSelectPayment, notify, currentUserId }) {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
 
  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/sales/contracts?page=${page}&size=10`);
      setContracts(res.data.content||[]);
      setTotalPages(res.data.totalPages||0);
    } catch { notify("Gabim gjatë ngarkimit","error"); }
    finally { setLoading(false); }
  }, [page, notify]);
 
  useEffect(() => { fetchContracts(); }, [fetchContracts]);
  useEffect(() => { if (prefill?.listingId) { setEditTarget(null); setModalOpen(true); } }, [prefill]);
 
  return (
    <>
      <AgentTable>
        <TableHead>
          <span style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontWeight:700,fontSize:17,color:"#1a1714"}}>Sale Contracts</span>
          <button className="as-btn" onClick={() => { setEditTarget(null); setModalOpen(true); }} style={{...BTN_PRI,padding:"7px 16px",fontSize:12.5}}>+ New Contract</button>
        </TableHead>
 
        {loading ? <Loader /> : contracts.length===0 ? <EmptyState icon="📄" text="Nuk ka kontrata aktive." /> : (
          <>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{background:"#faf7f2"}}>
                    {["#","Property","Buyer ID","Sale Price","Contract Date","Handover","Status","Actions"].map(h => (
                      <th key={h} style={{textAlign:"left",fontSize:10.5,fontWeight:600,color:"#b0a890",textTransform:"uppercase",letterSpacing:"0.8px",padding:"10px 16px",borderBottom:"1.5px solid #e8e2d6",whiteSpace:"nowrap"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {contracts.map(c => (
                    <tr key={c.id} style={{borderBottom:"1px solid #f0ece3",transition:"background 0.12s"}}
                      onMouseEnter={e=>e.currentTarget.style.background="#faf7f2"}
                      onMouseLeave={e=>e.currentTarget.style.background=""}>
                      <td style={{padding:"12px 16px",color:"#b0a890",fontSize:12}}>{c.id}</td>
                      <td style={{padding:"12px 16px"}}><span style={{background:"rgba(201,184,122,0.1)",color:"#c9b87a",border:"1px solid rgba(201,184,122,0.22)",padding:"2px 9px",borderRadius:999,fontSize:11.5,fontWeight:600}}>#{c.property_id}</span></td>
                      <td style={{padding:"12px 16px",fontWeight:500,color:"#1a1714",fontSize:13}}>#{c.buyer_id}</td>
                      <td style={{padding:"12px 16px",fontWeight:700,fontSize:14,color:"#1a1714",fontFamily:"'Cormorant Garamond',Georgia,serif"}}>{fmtPrice(c.sale_price)}</td>
                      <td style={{padding:"12px 16px",fontSize:12.5,color:"#9a8c6e"}}>{fmtDate(c.contract_date)}</td>
                      <td style={{padding:"12px 16px",fontSize:12.5,color:"#9a8c6e"}}>{fmtDate(c.handover_date)}</td>
                      <td style={{padding:"12px 16px"}}><Badge label={c.status}/></td>
                      <td style={{padding:"12px 16px"}}>
                        <div style={{display:"flex",gap:5}}>
                          {c.status==="PENDING"&&c.agent_id===currentUserId&&(
                            <>
                              <button onClick={() => { setEditTarget(c); setModalOpen(true); }} style={{...BTN_SEC,padding:"5px 11px",fontSize:12}}>Edit</button>
                              <button onClick={() => setStatusTarget(c)} style={{padding:"5px 11px",borderRadius:9,border:"1.5px solid #e4ddd0",background:"transparent",color:"#6b6248",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Status</button>
                            </>
                          )}
                          {c.agent_id===currentUserId&&(
                            <button onClick={() => onSelectPayment({contractId:c.id,salePrice:c.sale_price})} style={{...BTN_PRI,padding:"5px 11px",fontSize:12}}>Payments →</button>
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
      </AgentTable>
 
      {modalOpen && <ContractModal initial={editTarget} prefill={prefill} onClose={() => setModalOpen(false)} onSuccess={() => { setModalOpen(false); fetchContracts(); notify(editTarget?"Kontrata u ndryshua":"Kontrata u krijua"); }} notify={notify}/>}
      {statusTarget && <ContractStatusModal contract={statusTarget} onClose={() => setStatusTarget(null)} onSuccess={() => { setStatusTarget(null); fetchContracts(); notify("Statusi u ndryshua"); }} notify={notify}/>}
    </>
  );
}
 
function ContractModal({ initial, prefill, onClose, onSuccess, notify }) {
  const [form, setForm] = useState({ property_id:initial?.property_id??prefill?.propertyId??"",listing_id:initial?.listing_id??prefill?.listingId??"",buyer_id:initial?.buyer_id??"",sale_price:initial?.sale_price??prefill?.price??"",currency:initial?.currency??"EUR",contract_date:initial?.contract_date??"",handover_date:initial?.handover_date??"",contract_file_url:initial?.contract_file_url??"" });
  const [saving,setSaving]=useState(false);
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  const handleSubmit=async()=>{
    if(!form.property_id||!form.buyer_id||!form.sale_price){notify("Property ID, Buyer ID dhe çmimi janë të detyrueshme","error");return;}
    setSaving(true);
    try{
      const payload={property_id:Number(form.property_id),listing_id:form.listing_id?Number(form.listing_id):null,buyer_id:Number(form.buyer_id),sale_price:Number(form.sale_price),currency:form.currency,contract_date:form.contract_date||null,handover_date:form.handover_date||null,contract_file_url:form.contract_file_url||null};
      initial?await api.put(`/api/sales/contracts/${initial.id}`,payload):await api.post("/api/sales/contracts",payload);
      onSuccess();
    }catch(err){notify(err.response?.data?.message||"Gabim","error");}
    finally{setSaving(false);}
  };
  return (
    <Modal title={initial?`Edit Contract #${initial.id}`:"New Sale Contract"} onClose={onClose} wide>
      <FormRow><Field label="Property ID" required><input className="as-in" style={INP_S} type="number" value={form.property_id} onChange={e=>set("property_id",e.target.value)} disabled={!!initial} placeholder="ex: 42"/></Field><Field label="Listing ID"><input className="as-in" style={INP_S} type="number" value={form.listing_id} onChange={e=>set("listing_id",e.target.value)} placeholder="(opcional)"/></Field></FormRow>
      <FormRow><Field label="Buyer ID" required><input className="as-in" style={INP_S} type="number" value={form.buyer_id} onChange={e=>set("buyer_id",e.target.value)} disabled={!!initial} placeholder="ID e blerësit"/></Field><Field label="Sale Price" required><input className="as-in" style={INP_S} type="number" value={form.sale_price} onChange={e=>set("sale_price",e.target.value)} placeholder="ex: 145000"/></Field></FormRow>
      <FormRow><Field label="Currency"><select className="as-in" style={SEL_S} value={form.currency} onChange={e=>set("currency",e.target.value)}><option>EUR</option><option>USD</option><option>ALL</option></select></Field><Field label="Contract Date"><input className="as-in" style={INP_S} type="date" value={form.contract_date} onChange={e=>set("contract_date",e.target.value)}/></Field></FormRow>
      <FormRow><Field label="Handover Date"><input className="as-in" style={INP_S} type="date" value={form.handover_date} onChange={e=>set("handover_date",e.target.value)} min={form.contract_date||undefined}/></Field><Field label="Contract File URL"><input className="as-in" style={INP_S} value={form.contract_file_url} onChange={e=>set("contract_file_url",e.target.value)} placeholder="https://..."/></Field></FormRow>
      <div style={{display:"flex",gap:9,justifyContent:"flex-end",marginTop:6}}><button style={BTN_SEC} onClick={onClose}>Anulo</button><button style={BTN_PRI} onClick={handleSubmit} disabled={saving}>{saving?"Duke ruajtur...":initial?"Ruaj ndryshimet":"Krijo kontratë"}</button></div>
    </Modal>
  );
}
 
function ContractStatusModal({ contract, onClose, onSuccess, notify }) {
  const [status,setStatus]=useState("COMPLETED");
  const [saving,setSaving]=useState(false);
  const handleSubmit=async()=>{
    setSaving(true);
    try{await api.patch(`/api/sales/contracts/${contract.id}/status`,{status});onSuccess();}
    catch(err){notify(err.response?.data?.message||"Gabim","error");}
    finally{setSaving(false);}
  };
  return (
    <Modal title={`Ndrysho statusin e Kontratës #${contract.id}`} onClose={onClose}>
      <p style={{fontSize:13.5,color:"#6b6248",marginBottom:16}}>Statusi aktual: <Badge label={contract.status}/></p>
      <Field label="Statusi i ri">
        <select className="as-in" style={SEL_S} value={status} onChange={e=>setStatus(e.target.value)}>
          <option value="COMPLETED">COMPLETED</option><option value="CANCELLED">CANCELLED</option>
        </select>
      </Field>
      {status==="COMPLETED"&&<div style={{background:"rgba(126,184,164,0.08)",border:"1.5px solid rgba(126,184,164,0.22)",borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:13,color:"#2a6049"}}>💡 Duke shënuar COMPLETED, sistemi do të krijojë automatikisht pagesat e komisionit (3% e çmimit të shitjes).</div>}
      {status==="CANCELLED"&&<div style={{background:"rgba(212,133,90,0.08)",border:"1.5px solid rgba(212,133,90,0.22)",borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:13,color:"#8b4013"}}>⚠️ Anulimi i kontratës është i pakthyeshëm.</div>}
      <div style={{display:"flex",gap:9,justifyContent:"flex-end"}}><button style={BTN_SEC} onClick={onClose}>Anulo</button><button style={{...BTN_PRI,...(status==="CANCELLED"?{background:"#8b3a1c"}:{})}} onClick={handleSubmit} disabled={saving}>{saving?"Duke ndryshuar...":`Konfirmo — ${status}`}</button></div>
    </Modal>
  );
}
 
// ═════════════════════════════════════════════════════════════════════════════
// PAYMENTS SECTION
// ═════════════════════════════════════════════════════════════════════════════
function PaymentsSection({ prefill, notify }) {
  const [contractId,setContractId]=useState(prefill?.contractId??"");
  const [contractStatus,setContractStatus]=useState(null);
  const [payments,setPayments]=useState([]);
  const [summary,setSummary]=useState(null);
  const [loading,setLoading]=useState(false);
  const [createOpen,setCreateOpen]=useState(false);
  const [payTarget,setPayTarget]=useState(null);
 
  useEffect(() => { if(prefill?.contractId) setContractId(prefill.contractId); }, [prefill]);
  useEffect(() => { if(contractId) fetchPayments(); }, [contractId]);
 
  const fetchPayments=async()=>{
    if(!contractId)return;
    setLoading(true);
    try{
      const[listRes,sumRes,contractRes]=await Promise.all([api.get(`/api/sales/payments/contract/${contractId}`),api.get(`/api/sales/payments/contract/${contractId}/summary`),api.get(`/api/sales/contracts/${contractId}`)]);
      setPayments(listRes.data||[]);setSummary(sumRes.data);setContractStatus(contractRes.data?.status??null);
    }catch{notify("Gabim gjatë ngarkimit","error");}
    finally{setLoading(false);}
  };
 
  const handleMarkPaid=async(data)=>{
    try{await api.patch(`/api/sales/payments/${payTarget.id}/pay`,data);notify("Pagesa u shënua si PAID");setPayTarget(null);fetchPayments();}
    catch(err){notify(err.response?.data?.message||"Gabim","error");}
  };
 
  return (
    <>
      <AgentTable>
        <TableHead>
          <span style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontWeight:700,fontSize:17,color:"#1a1714"}}>Sale Payments</span>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <label style={{fontSize:12.5,color:"#9a8c6e",whiteSpace:"nowrap"}}>Contract #</label>
              <input className="as-in" style={{...INP_S,width:110,height:34,padding:"0 10px",fontSize:13}} type="number" value={contractId} onChange={e=>setContractId(e.target.value)} placeholder="ID..."/>
              <button className="as-btn" onClick={fetchPayments} style={{...BTN_SEC,padding:"6px 14px",fontSize:12.5}}>Load</button>
            </div>
            {contractId&&contractStatus!=="COMPLETED"&&contractStatus!=="CANCELLED"&&(
              <button className="as-btn" onClick={() => setCreateOpen(true)} style={{...BTN_PRI,padding:"6px 14px",fontSize:12.5}}>+ Add Payment</button>
            )}
            {contractId&&contractStatus==="COMPLETED"&&(
              <span style={{fontSize:11.5,color:"#2a6049",fontWeight:600,background:"rgba(126,184,164,0.1)",padding:"4px 12px",borderRadius:999,border:"1px solid rgba(126,184,164,0.25)"}}>✓ Finalizuar automatikisht</span>
            )}
          </div>
        </TableHead>
 
        {summary && (
          <div style={{display:"flex",gap:14,padding:"14px 20px",background:"#faf7f2",borderBottom:"1.5px solid #e8e2d6",alignItems:"center",flexWrap:"wrap"}}>
            {[
              {label:"Total Payments",val:summary.total_payments,color:"#c9b87a"},
              {label:"Total Paid",val:`€${Number(summary.total_paid||0).toLocaleString("de-DE")}`,color:"#2a6049"},
              ...(summary.overdue_count>0?[{label:"Overdue",val:summary.overdue_count,color:"#8b4013"}]:[]),
            ].map((s,i) => (
              <div key={i} style={{display:"flex",alignItems:"center",gap:14}}>
                {i>0&&<div style={{width:1,height:28,background:"#e8e2d6"}}/>}
                <div>
                  <p style={{fontSize:9.5,color:"#b0a890",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:2}}>{s.label}</p>
                  <p style={{fontSize:20,fontWeight:700,color:s.color,fontFamily:"'Cormorant Garamond',Georgia,serif",margin:0}}>{s.val}</p>
                </div>
              </div>
            ))}
          </div>
        )}
 
        {!contractId ? <EmptyState icon="💳" text="Shkruaj Contract ID dhe kliko Load."/> : loading ? <Loader/> : payments.length===0 ? <EmptyState icon="💳" text="Nuk ka pagesa për këtë kontratë."/> : (
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{background:"#faf7f2"}}>
                  {["#","Amount","Type","Recipient","Method","Paid Date","Ref","Status","Actions"].map(h => (
                    <th key={h} style={{textAlign:"left",fontSize:10.5,fontWeight:600,color:"#b0a890",textTransform:"uppercase",letterSpacing:"0.8px",padding:"10px 16px",borderBottom:"1.5px solid #e8e2d6",whiteSpace:"nowrap"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map(p => {
                  const tc = TYPE_COLORS[p.payment_type]||TYPE_COLORS.FULL;
                  return (
                    <tr key={p.id} style={{borderBottom:"1px solid #f0ece3",transition:"background 0.12s"}} onMouseEnter={e=>e.currentTarget.style.background="#faf7f2"} onMouseLeave={e=>e.currentTarget.style.background=""}>
                      <td style={{padding:"12px 16px",color:"#b0a890",fontSize:12}}>{p.id}</td>
                      <td style={{padding:"12px 16px",fontWeight:700,fontSize:14,color:"#1a1714",fontFamily:"'Cormorant Garamond',Georgia,serif"}}>{fmtPrice(p.amount)}</td>
                      <td style={{padding:"12px 16px"}}><span style={{background:tc.bg,color:tc.color,padding:"2px 9px",borderRadius:999,fontSize:11,fontWeight:600}}>{p.payment_type}</span></td>
                      <td style={{padding:"12px 16px",fontSize:12.5,color:"#6b6248"}}>{p.recipient_name?p.recipient_name:<span style={{color:"#2a6049",fontSize:11.5,background:"rgba(126,184,164,0.1)",padding:"2px 8px",borderRadius:999}}>🏢 Kompania</span>}</td>
                      <td style={{padding:"12px 16px",fontSize:12.5,color:"#9a8c6e"}}>{p.payment_method||"—"}</td>
                      <td style={{padding:"12px 16px",fontSize:12.5,color:"#9a8c6e"}}>{fmtDate(p.paid_date)}</td>
                      <td style={{padding:"12px 16px",fontSize:11.5,color:"#b0a890"}}>{p.transaction_ref||"—"}</td>
                      <td style={{padding:"12px 16px"}}><Badge label={p.status}/></td>
                      <td style={{padding:"12px 16px"}}>{p.status==="PENDING"&&<button className="as-btn" onClick={() => setPayTarget(p)} style={{...BTN_PRI,padding:"5px 12px",fontSize:12}}>Mark Paid</button>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AgentTable>
 
      {createOpen&&<PaymentCreateModal contractId={contractId} onClose={() => setCreateOpen(false)} onSuccess={() => { setCreateOpen(false); fetchPayments(); notify("Pagesa u krijua"); }} notify={notify}/>}
      {payTarget&&<MarkPaidModal payment={payTarget} onClose={() => setPayTarget(null)} onSubmit={handleMarkPaid} notify={notify}/>}
    </>
  );
}
 
function PaymentCreateModal({ contractId, onClose, onSuccess, notify }) {
  const [form,setForm]=useState({amount:"",currency:"EUR",payment_type:"DEPOSIT",payment_method:"BANK_TRANSFER"});
  const [saving,setSaving]=useState(false);
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  const handleSubmit=async()=>{
    if(!form.amount){notify("Shuma është e detyrueshme","error");return;}
    setSaving(true);
    try{await api.post("/api/sales/payments",{contract_id:Number(contractId),amount:Number(form.amount),currency:form.currency,payment_type:form.payment_type,payment_method:form.payment_method});onSuccess();}
    catch(err){notify(err.response?.data?.message||"Gabim","error");}
    finally{setSaving(false);}
  };
  return (
    <Modal title={`New Payment — Contract #${contractId}`} onClose={onClose}>
      <div style={{background:"rgba(201,184,122,0.07)",border:"1.5px solid rgba(201,184,122,0.2)",borderRadius:10,padding:"10px 14px",marginBottom:16,fontSize:13,color:"#8a7230"}}>💡 Këtu regjistro vetëm pagesa paraprake (kaparro ose këste). Pagesat FULL, COMMISSION krijohen automatikisht.</div>
      <FormRow><Field label="Amount" required><input className="as-in" style={INP_S} type="number" value={form.amount} onChange={e=>set("amount",e.target.value)} placeholder="ex: 14500"/></Field><Field label="Currency"><select className="as-in" style={SEL_S} value={form.currency} onChange={e=>set("currency",e.target.value)}><option>EUR</option><option>USD</option><option>ALL</option></select></Field></FormRow>
      <FormRow><Field label="Payment Type"><select className="as-in" style={SEL_S} value={form.payment_type} onChange={e=>set("payment_type",e.target.value)}>{MANUAL_PAYMENT_TYPES.map(t=><option key={t}>{t}</option>)}</select></Field><Field label="Payment Method"><select className="as-in" style={SEL_S} value={form.payment_method} onChange={e=>set("payment_method",e.target.value)}>{PAYMENT_METHODS.map(m=><option key={m}>{m}</option>)}</select></Field></FormRow>
      <div style={{display:"flex",gap:9,justifyContent:"flex-end",marginTop:6}}><button style={BTN_SEC} onClick={onClose}>Anulo</button><button style={BTN_PRI} onClick={handleSubmit} disabled={saving}>{saving?"Duke krijuar...":"Krijo pagesë"}</button></div>
    </Modal>
  );
}
 
function MarkPaidModal({ payment, onClose, onSubmit, notify }) {
  const [form,setForm]=useState({payment_method:payment.payment_method||"BANK_TRANSFER",transaction_ref:"",paid_date:new Date().toISOString().split("T")[0]});
  const [saving,setSaving]=useState(false);
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  const handleSubmit=async()=>{setSaving(true);try{await onSubmit({payment_method:form.payment_method,transaction_ref:form.transaction_ref||null,paid_date:form.paid_date});}finally{setSaving(false);}};
  return (
    <Modal title={`Mark Payment #${payment.id} as PAID`} onClose={onClose}>
      <div style={{background:"rgba(126,184,164,0.08)",border:"1.5px solid rgba(126,184,164,0.22)",borderRadius:10,padding:"10px 14px",marginBottom:16,fontSize:13,color:"#2a6049"}}>Shuma: <strong>€{Number(payment.amount).toLocaleString("de-DE")}</strong></div>
      <Field label="Payment Method"><select className="as-in" style={SEL_S} value={form.payment_method} onChange={e=>set("payment_method",e.target.value)}>{PAYMENT_METHODS.map(m=><option key={m}>{m}</option>)}</select></Field>
      <FormRow><Field label="Transaction Ref"><input className="as-in" style={INP_S} value={form.transaction_ref} onChange={e=>set("transaction_ref",e.target.value)} placeholder="TXN-12345"/></Field><Field label="Paid Date"><input className="as-in" style={INP_S} type="date" value={form.paid_date} onChange={e=>set("paid_date",e.target.value)}/></Field></FormRow>
      <div style={{display:"flex",gap:9,justifyContent:"flex-end",marginTop:6}}><button style={BTN_SEC} onClick={onClose}>Anulo</button><button style={BTN_PRI} onClick={handleSubmit} disabled={saving}>{saving?"Duke shënuar...":"✓ Konfirmo PAID"}</button></div>
    </Modal>
  );
}
 
// ═════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════════════════════════════════════
export default function AgentSales() {
  const { user } = useContext(AuthContext);
  const [tab, setTab] = useState("listings");
  const [toast, setToast] = useState(null);
  const [contractPrefill, setContractPrefill] = useState(null);
  const [paymentPrefill,  setPaymentPrefill]  = useState(null);
 
  const notify = useCallback((msg, type="success") => setToast({ msg, type, key:Date.now() }), []);
  const goToContract = (prefill) => { setContractPrefill(prefill); setTab("contracts"); };
  const goToPayment  = (prefill) => { setPaymentPrefill(prefill); setTab("payments"); };
 
  return (
    <MainLayout role="agent">
      <style>{CSS}</style>
      <div className="as">
 
        {/* ── Hero ── */}
        <div style={{background:"linear-gradient(160deg,#141210 0%,#1e1a14 45%,#241e16 100%)",minHeight:220,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 32px",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,0.018) 1px,transparent 1px)",backgroundSize:"22px 22px",pointerEvents:"none"}}/>
          <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:"linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)"}}/>
          <div style={{position:"relative",zIndex:1,maxWidth:700,width:"100%",textAlign:"center"}}>
            <h1 style={{margin:"0 0 8px",fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"clamp(24px,4vw,38px)",fontWeight:700,color:"#f5f0e8",letterSpacing:"-0.5px"}}>
              Sales{" "}
              <span style={{background:"linear-gradient(90deg,#c9b87a,#e8d9a0,#c9b87a)",backgroundSize:"200% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Management</span>
            </h1>
            <p style={{margin:0,fontSize:13,color:"rgba(245,240,232,0.38)"}}>Listing → Contract → Payment</p>
          </div>
        </div>
 
        {/* ── Workflow breadcrumb ── */}
        <div style={{background:"#f5f0e6",borderBottom:"1.5px solid #e8dfc8",padding:"10px 28px",display:"flex",alignItems:"center",gap:6,fontSize:13,flexWrap:"wrap"}}>
          {[{id:"listings",label:"1. Listing"},{id:"contracts",label:"2. Contract"},{id:"payments",label:"3. Payment"}].map((s,i) => (
            <span key={s.id} style={{display:"flex",alignItems:"center",gap:6}}>
              {i>0&&<span style={{color:"#c9b87a",fontWeight:300}}>────</span>}
              <span style={{
                fontWeight:tab===s.id?700:500,
                color:tab===s.id?"#8a6a10":"#9a8c6e",
                background:tab===s.id?"rgba(201,184,122,0.18)":"transparent",
                padding:tab===s.id?"3px 10px":"0",
                borderRadius:tab===s.id?999:0,
                border:tab===s.id?"1.5px solid rgba(201,184,122,0.35)":"none",
              }}>{s.label}</span>
            </span>
          ))}
          <span style={{marginLeft:"auto",fontSize:11.5,color:"#b0a080"}}>Kliko "Contract →" ose "Payments →" për workflow të shpejtë</span>
        </div>
 
        {/* ── Content ── */}
        <div style={{padding:"22px 24px",maxWidth:1440,margin:"0 auto"}}>
          <SectionTabs active={tab} onChange={setTab}/>
 
          {tab==="listings"&&<ListingsSection onSelectContract={goToContract} notify={notify} currentUserId={user?.id}/>}
          {tab==="contracts"&&<ContractsSection prefill={contractPrefill} onSelectPayment={goToPayment} notify={notify} currentUserId={user?.id}/>}
          {tab==="payments"&&<PaymentsSection prefill={paymentPrefill} notify={notify}/>}
        </div>
      </div>
 
      {toast&&<Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)}/>}
    </MainLayout>
  );
}
 