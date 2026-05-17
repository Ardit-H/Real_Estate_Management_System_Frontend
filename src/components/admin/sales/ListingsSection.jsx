import { useState, useEffect, useCallback } from "react";
import api from "../../../api/axios";
import { SALE_STATUSES, CURRENCIES, fmtPrice, fmtDate, fmtDateTime, inputSt, selectSt, textareaSt, primaryBtn, secondaryBtn, btnSm, pillGold, card, cardHeader, cardTitle, TH, TD } from "./salesConstants.js";
import { Badge, Modal, Field, Row, Empty, Loader, Pagination, DeleteModal } from "./SalesUI.jsx";
 
export function ListingsSection({ onGoContract, notify }) {
  const [rows, setRows]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(0);
  const [totalPages, setTotalPg]  = useState(0);
  const [total, setTotal]         = useState(0);
  const [statusF, setStatusF]     = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [detailTarget, setDetail]   = useState(null);
  const [deleteId, setDeleteId]     = useState(null);
  const [deleting, setDeleting]     = useState(false);
 
  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const url = statusF
        ? `/api/sales/listings/status/${statusF}?page=${page}&size=10`
        : `/api/sales/listings?page=${page}&size=10&sortBy=createdAt&sortDir=desc`;
      const res = await api.get(url);
      const d = res.data;
      setRows(d.content || []);
      setTotalPg(d.totalPages || 0);
      setTotal(d.totalElements || 0);
    } catch (err) { notify(err.response?.data?.message || "Error loading", "error"); }
    finally { setLoading(false); }
  }, [page, statusF, notify]);
 
  useEffect(() => { fetch(); }, [fetch]);
 
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/api/sales/listings/${deleteId}`);
      notify("Listing deleted successfully");
      setDeleteId(null); fetch();
    } catch (err) { notify(err.response?.data?.message || "Error deleting", "error"); }
    finally { setDeleting(false); }
  };
 
  const activeCount = rows.filter((r) => r.status === "ACTIVE").length;
 
  return (
    <>
      <div style={card}>
        <div style={cardHeader}>
          <div>
            <h2 style={cardTitle}>Sale Listings</h2>
            <p style={{ fontSize:12, color:"#b0a890", margin:0, fontFamily:"'DM Sans',sans-serif" }}>{total} total · {activeCount} active on this page</p>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
            <select value={statusF} onChange={(e)=>{ setStatusF(e.target.value); setPage(0); }} style={{ ...selectSt, width:150, height:36, padding:"0 10px" }}>
              <option value="">All statuses</option>
              {SALE_STATUSES.map((s)=><option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={()=>setCreateOpen(true)} style={primaryBtn}>+ New Listing</button>
          </div>
        </div>
 
        {loading ? <Loader /> : rows.length === 0 ? <Empty icon="🏷️" text="No sale listings. Create the first one." /> : (
          <>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", minWidth:700 }}>
                <thead><tr>{["#ID","Property ID","Agent ID","Price","Negotiable","Status","Created","Actions"].map((h)=><th key={h} style={TH}>{h}</th>)}</tr></thead>
                <tbody>
                  {rows.map((l)=>(
                    <tr key={l.id} className="as-row">
                      <td style={{ ...TD, fontFamily:"monospace", color:"#b0a890", fontSize:11.5 }}>{l.id}</td>
                      <td style={TD}><span style={pillGold}>#{l.property_id}</span></td>
                      <td style={{ ...TD, color:"#8a7d5e" }}>{l.agent_id ? `#${l.agent_id}` : "—"}</td>
                      <td style={{ ...TD, fontWeight:600 }}>{fmtPrice(l.price)}</td>
                      <td style={TD}><span style={{ fontSize:12, fontWeight:600, color:l.negotiable?"#1D9E75":"#b0a890" }}>{l.negotiable?"✓ Yes":"No"}</span></td>
                      <td style={TD}><Badge label={l.status} /></td>
                      <td style={{ ...TD, color:"#b0a890" }}>{fmtDate(l.created_at)}</td>
                      <td style={TD}>
                        <div style={{ display:"flex", gap:5 }}>
                          <button className="as-btn" style={btnSm("rgba(201,184,122,0.08)","#c9b87a","rgba(201,184,122,0.25)")} onClick={()=>setDetail(l)}>Detail</button>
                          <button className="as-btn" style={btnSm("rgba(29,158,117,0.08)","#1D9E75","rgba(29,158,117,0.25)")} onClick={()=>setEditTarget(l)}>Edit</button>
                          <button className="as-btn" style={btnSm("rgba(55,138,221,0.08)","#378ADD","rgba(55,138,221,0.25)")} onClick={()=>onGoContract({ listingId:l.id, propertyId:l.property_id, price:l.price })}>Contract →</button>
                          <button className="as-btn" style={btnSm("rgba(216,90,48,0.08)","#D85A30","rgba(216,90,48,0.25)")} onClick={()=>setDeleteId(l.id)}>Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </div>
 
      {createOpen && <ListingFormModal onClose={()=>setCreateOpen(false)} onSuccess={()=>{ setCreateOpen(false); fetch(); notify("Listing created successfully"); }} notify={notify} />}
      {editTarget && <ListingFormModal initial={editTarget} onClose={()=>setEditTarget(null)} onSuccess={()=>{ setEditTarget(null); fetch(); notify("Listing updated"); }} notify={notify} />}
      {detailTarget && <ListingDetailModal listing={detailTarget} onClose={()=>setDetail(null)} />}
      {deleteId && <DeleteModal id={deleteId} label="Listing" onCancel={()=>setDeleteId(null)} onConfirm={handleDelete} loading={deleting} />}
    </>
  );
}
 
export function ListingFormModal({ initial, onClose, onSuccess, notify }) {
  const [form, setForm] = useState({ property_id:initial?.property_id??"", price:initial?.price??"", currency:initial?.currency??"EUR", negotiable:initial?.negotiable??true, description:initial?.description??"", highlights:initial?.highlights??"", status:initial?.status??"ACTIVE" });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
 
  const handleSubmit = async () => {
    if (!form.property_id || !form.price) { notify("Property ID and price are required", "error"); return; }
    setSaving(true);
    try {
      const payload = { property_id:Number(form.property_id), price:Number(form.price), currency:form.currency, negotiable:form.negotiable, description:form.description||null, highlights:form.highlights||null, ...(initial&&{status:form.status}) };
      if (initial) { await api.put(`/api/sales/listings/${initial.id}`, payload); }
      else { await api.post("/api/sales/listings", payload); }
      onSuccess();
    } catch (err) { notify(err.response?.data?.message||"Error saving","error"); }
    finally { setSaving(false); }
  };
 
  return (
    <Modal title={initial?`Edit Listing #${initial.id}`:"New Sale Listing"} onClose={onClose}>
      <Row>
        <Field label="Property ID" required><input style={inputSt} type="number" value={form.property_id} onChange={(e)=>set("property_id",e.target.value)} disabled={!!initial} placeholder="ex: 42" /></Field>
        <Field label="Price (€)" required><input style={inputSt} type="number" value={form.price} onChange={(e)=>set("price",e.target.value)} placeholder="ex: 145000" /></Field>
      </Row>
      <Row>
        <Field label="Currency"><select style={selectSt} value={form.currency} onChange={(e)=>set("currency",e.target.value)}>{CURRENCIES.map((c)=><option key={c}>{c}</option>)}</select></Field>
        <Field label="Negotiable"><select style={selectSt} value={String(form.negotiable)} onChange={(e)=>set("negotiable",e.target.value==="true")}><option value="true">Yes</option><option value="false">No</option></select></Field>
      </Row>
      {initial && <Field label="Status"><select style={selectSt} value={form.status} onChange={(e)=>set("status",e.target.value)}>{SALE_STATUSES.map((s)=><option key={s}>{s}</option>)}</select></Field>}
      <Field label="Description"><textarea style={textareaSt} rows={3} value={form.description} onChange={(e)=>set("description",e.target.value)} placeholder="Property description..." /></Field>
      <Field label="Highlights"><textarea style={textareaSt} rows={2} value={form.highlights} onChange={(e)=>set("highlights",e.target.value)} placeholder="Key features..." /></Field>
      <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:6 }}>
        <button style={secondaryBtn} onClick={onClose}>Cancel</button>
        <button style={primaryBtn} onClick={handleSubmit} disabled={saving}>{saving?"Saving...":initial?"Save changes":"Create listing"}</button>
      </div>
    </Modal>
  );
}
 
export function ListingDetailModal({ listing: l, onClose }) {
  return (
    <Modal title={`Listing #${l.id} — Details`} onClose={onClose}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px 20px", marginBottom:16 }}>
        {[["ID",`#${l.id}`],["Property",`#${l.property_id}`],["Agent",l.agent_id?`#${l.agent_id}`:"—"],["Price",fmtPrice(l.price)],["Negotiable",l.negotiable?"Yes":"No"],["Status","badge"],["Created",fmtDateTime(l.created_at)],["Updated",fmtDateTime(l.updated_at)]].map(([label,val])=>(
          <div key={label}>
            <p style={{ fontSize:10, color:"#b0a890", textTransform:"uppercase", letterSpacing:"0.8px", margin:"0 0 3px", fontFamily:"'DM Sans',sans-serif" }}>{label}</p>
            {val==="badge"?<Badge label={l.status}/>:<p style={{ fontSize:14, fontWeight:500, margin:0, color:"#1a1714", fontFamily:"'Cormorant Garamond',serif" }}>{val}</p>}
          </div>
        ))}
      </div>
      {l.description && <div style={{ marginBottom:12 }}><p style={{ fontSize:10, color:"#b0a890", textTransform:"uppercase", letterSpacing:"0.8px", margin:"0 0 5px" }}>Description</p><p style={{ fontSize:13, color:"#4a4438", lineHeight:1.6, margin:0 }}>{l.description}</p></div>}
      {l.highlights  && <div><p style={{ fontSize:10, color:"#b0a890", textTransform:"uppercase", letterSpacing:"0.8px", margin:"0 0 5px" }}>Highlights</p><p style={{ fontSize:13, color:"#4a4438", lineHeight:1.6, margin:0 }}>{l.highlights}</p></div>}
    </Modal>
  );
}
 