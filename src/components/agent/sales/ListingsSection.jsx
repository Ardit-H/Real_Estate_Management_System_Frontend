import { useState, useEffect, useCallback } from "react";
import api from "../../../api/axios";
import { SALE_STATUSES, fmtPrice, fmtDate, INP_S, SEL_S, BTN_PRI, BTN_SEC } from "./salesConstants.js";
import { Badge, Modal, Field, FormRow, Loader, EmptyState, Pagination, AgentTable, TableHead } from "./SalesUI.jsx";
 
export function ListingsSection({ onSelectContract, notify, currentUserId }) {
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
    } catch { notify("Error loading listings", "error"); }
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
      notify("Listing deleted successfully");
      setDeleteId(null); fetchListings();
    } catch { notify("Error deleting listing", "error"); }
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
          <EmptyState icon="🏷️" text="No listings. Create your first listing." />
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
                            {l.agent_id===currentUserId ? <span style={{color:"#c9b87a",fontWeight:600}}>👤 Me</span> : agentNames[l.agent_id]||`Agent #${l.agent_id}`}
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
                              <span style={{fontSize:11.5,color:"#b0a890",background:"#f0ece3",padding:"3px 10px",borderRadius:999,fontStyle:"italic"}}>View only</span>
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
          onSuccess={() => { setModalOpen(false); fetchListings(); notify(editTarget?"Listing updated":"Listing created"); }}
          notify={notify}/>
      )}
 
      {deleteId && (
        <Modal title="Confirm deletion" onClose={() => setDeleteId(null)}>
          <p style={{fontSize:14,color:"#6b6248",marginBottom:20}}>Are you sure you want to delete listing <strong style={{color:"#1a1714"}}>#{deleteId}</strong>?</p>
          <div style={{display:"flex",gap:9,justifyContent:"flex-end"}}>
            <button onClick={() => setDeleteId(null)} style={BTN_SEC}>Cancel</button>
            <button onClick={handleDelete} style={{...BTN_PRI,background:"#8b3a1c"}}>Delete</button>
          </div>
        </Modal>
      )}
    </>
  );
}
 
export function ListingModal({ initial, onClose, onSuccess, notify }) {
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
    if (!form.property_id||!form.price) { notify("Property ID and price are required","error"); return; }
    setSaving(true);
    try {
      const payload = { property_id:Number(form.property_id),price:Number(form.price),currency:form.currency,negotiable:form.negotiable,description:form.description||null,highlights:form.highlights||null,...(initial&&{status:form.status}) };
      initial ? await api.put(`/api/sales/listings/${initial.id}`,payload) : await api.post("/api/sales/listings",payload);
      onSuccess();
    } catch(err) { notify(err.response?.data?.message||"Error","error"); }
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
        <Field label="Negotiable"><select className="as-in" style={SEL_S} value={String(form.negotiable)} onChange={e=>set("negotiable",e.target.value==="true")}><option value="true">Yes</option><option value="false">No</option></select></Field>
      </FormRow>
      {initial && <Field label="Status"><select className="as-in" style={SEL_S} value={form.status} onChange={e=>set("status",e.target.value)}>{SALE_STATUSES.map(s=><option key={s}>{s}</option>)}</select></Field>}
      <Field label="Description"><textarea className="as-in" style={{...INP_S,resize:"vertical"}} rows={3} value={form.description} onChange={e=>set("description",e.target.value)} placeholder="Property description..."/></Field>
      <Field label="Highlights"><textarea className="as-in" style={{...INP_S,resize:"vertical"}} rows={2} value={form.highlights} onChange={e=>set("highlights",e.target.value)} placeholder="Key features..."/></Field>
      <div style={{display:"flex",gap:9,justifyContent:"flex-end",marginTop:6}}>
        <button style={BTN_SEC} onClick={onClose}>Cancel</button>
        <button style={BTN_PRI} onClick={handleSubmit} disabled={saving}>{saving?"Saving...":initial?"Save changes":"Create listing"}</button>
      </div>
    </Modal>
  );
}
 