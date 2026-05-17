import { useState, useEffect, useCallback } from "react";
import api from "../../../api/axios";
import { CURRENCIES, fmtPrice, fmtDate, fmtDateTime, inputSt, selectSt, primaryBtn, secondaryBtn, dangerBtn, btnSm, pillGold, card, cardHeader, cardTitle, TH, TD } from "./salesConstants.js";
import { Badge, Modal, Field, Row, Empty, Loader, Pagination } from "./SalesUI.jsx";
 
export function ContractsSection({ prefill, onGoPayment, notify }) {
  const [rows, setRows]          = useState([]);
  const [loading, setLoading]    = useState(true);
  const [page, setPage]          = useState(0);
  const [totalPages, setTotalPg] = useState(0);
  const [total, setTotal]        = useState(0);
  const [createOpen, setCreateOpen]   = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [detailTarget, setDetail]     = useState(null);
  const [statusTarget, setStatusTgt]  = useState(null);
 
  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/sales/contracts?page=${page}&size=10`);
      const d = res.data;
      setRows(d.content || []);
      setTotalPg(d.totalPages || 0);
      setTotal(d.totalElements || 0);
    } catch (err) { notify(err.response?.data?.message||"Error loading contracts","error"); }
    finally { setLoading(false); }
  }, [page, notify]);
 
  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => { if (prefill?.listingId) { setEditTarget(null); setCreateOpen(true); } }, [prefill]);
 
  return (
    <>
      <div style={card}>
        <div style={cardHeader}>
          <div>
            <h2 style={cardTitle}>Sale Contracts</h2>
            <p style={{ fontSize:12, color:"#b0a890", margin:0, fontFamily:"'DM Sans',sans-serif" }}>{total} contracts total</p>
          </div>
          <button onClick={()=>{ setEditTarget(null); setCreateOpen(true); }} style={primaryBtn}>+ New Contract</button>
        </div>
 
        {loading ? <Loader /> : rows.length === 0 ? <Empty icon="📄" text="No sale contracts." /> : (
          <>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", minWidth:800 }}>
                <thead><tr>{["#ID","Property","Listing","Buyer","Agent","Sale Price","Contract Date","Handover","Status","Actions"].map((h)=><th key={h} style={TH}>{h}</th>)}</tr></thead>
                <tbody>
                  {rows.map((c)=>(
                    <tr key={c.id} className="as-row">
                      <td style={{ ...TD, fontFamily:"monospace", color:"#b0a890", fontSize:11.5 }}>{c.id}</td>
                      <td style={TD}><span style={pillGold}>#{c.property_id}</span></td>
                      <td style={{ ...TD, color:"#8a7d5e" }}>{c.listing_id?`#${c.listing_id}`:"—"}</td>
                      <td style={TD}>{c.buyer_id?`#${c.buyer_id}`:"—"}</td>
                      <td style={{ ...TD, color:"#8a7d5e" }}>{c.agent_id?`#${c.agent_id}`:"—"}</td>
                      <td style={{ ...TD, fontWeight:600 }}>{fmtPrice(c.sale_price)}</td>
                      <td style={{ ...TD, color:"#8a7d5e" }}>{fmtDate(c.contract_date)}</td>
                      <td style={{ ...TD, color:"#8a7d5e" }}>{fmtDate(c.handover_date)}</td>
                      <td style={TD}><Badge label={c.status} /></td>
                      <td style={TD}>
                        <div style={{ display:"flex", gap:5, flexWrap:"nowrap" }}>
                          <button className="as-btn" style={btnSm("rgba(201,184,122,0.08)","#c9b87a","rgba(201,184,122,0.25)")} onClick={()=>setDetail(c)}>Detail</button>
                          {c.status==="PENDING"&&<><button className="as-btn" style={btnSm("rgba(29,158,117,0.08)","#1D9E75","rgba(29,158,117,0.25)")} onClick={()=>setEditTarget(c)}>Edit</button><button className="as-btn" style={btnSm("rgba(201,184,122,0.08)","#c9b87a","rgba(201,184,122,0.25)")} onClick={()=>setStatusTgt(c)}>Status</button></>}
                          <button className="as-btn" style={btnSm("rgba(55,138,221,0.08)","#378ADD","rgba(55,138,221,0.25)")} onClick={()=>onGoPayment({ contractId:c.id, salePrice:c.sale_price })}>Payments →</button>
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
 
      {createOpen && <ContractFormModal prefill={prefill} onClose={()=>setCreateOpen(false)} onSuccess={()=>{ setCreateOpen(false); fetch(); notify("Contract created successfully"); }} notify={notify} />}
      {editTarget && <ContractFormModal initial={editTarget} onClose={()=>setEditTarget(null)} onSuccess={()=>{ setEditTarget(null); fetch(); notify("Contract updated"); }} notify={notify} />}
      {detailTarget && <ContractDetailModal contract={detailTarget} onClose={()=>setDetail(null)} />}
      {statusTarget && <ContractStatusModal contract={statusTarget} onClose={()=>setStatusTgt(null)} onSuccess={()=>{ setStatusTgt(null); fetch(); notify("Contract status changed"); }} notify={notify} />}
    </>
  );
}
 
export function ContractFormModal({ initial, prefill, onClose, onSuccess, notify }) {
  const [form, setForm] = useState({ property_id:initial?.property_id??prefill?.propertyId??"", listing_id:initial?.listing_id??prefill?.listingId??"", buyer_id:initial?.buyer_id??"", sale_price:initial?.sale_price??prefill?.price??"", currency:initial?.currency??"EUR", contract_date:initial?.contract_date??"", handover_date:initial?.handover_date??"", contract_file_url:initial?.contract_file_url??"" });
  const [saving, setSaving] = useState(false);
 
  const set = (k, v) => setForm((p) => {
    const next = { ...p, [k]: v };
    if (k === "contract_date" && next.handover_date && next.handover_date < v) next.handover_date = "";
    return next;
  });
 
  const dateError = form.contract_date && form.handover_date && form.handover_date < form.contract_date
    ? "Handover date cannot be before contract date." : null;
 
  const handleSubmit = async () => {
    if (!form.property_id || !form.buyer_id || !form.sale_price) { notify("Property ID, Buyer ID and price are required","error"); return; }
    if (dateError) { notify(dateError,"error"); return; }
    setSaving(true);
    try {
      const payload = { property_id:Number(form.property_id), listing_id:form.listing_id?Number(form.listing_id):null, buyer_id:Number(form.buyer_id), sale_price:Number(form.sale_price), currency:form.currency, contract_date:form.contract_date||null, handover_date:form.handover_date||null, contract_file_url:form.contract_file_url||null };
      if (initial) { await api.put(`/api/sales/contracts/${initial.id}`, payload); } else { await api.post("/api/sales/contracts", payload); }
      onSuccess();
    } catch (err) { notify(err.response?.data?.message||"Error saving","error"); }
    finally { setSaving(false); }
  };
 
  return (
    <Modal title={initial?`Edit Contract #${initial.id}`:"New Sale Contract"} onClose={onClose} maxWidth={620}>
      <Row><Field label="Property ID" required><input style={inputSt} type="number" value={form.property_id} onChange={(e)=>set("property_id",e.target.value)} disabled={!!initial} placeholder="ex: 42" /></Field><Field label="Listing ID"><input style={inputSt} type="number" value={form.listing_id} onChange={(e)=>set("listing_id",e.target.value)} placeholder="(optional)" /></Field></Row>
      <Row><Field label="Buyer ID" required><input style={inputSt} type="number" value={form.buyer_id} onChange={(e)=>set("buyer_id",e.target.value)} disabled={!!initial} placeholder="Buyer ID" /></Field><Field label="Sale Price (€)" required><input style={inputSt} type="number" value={form.sale_price} onChange={(e)=>set("sale_price",e.target.value)} placeholder="ex: 145000" /></Field></Row>
      <Row><Field label="Currency"><select style={selectSt} value={form.currency} onChange={(e)=>set("currency",e.target.value)}>{CURRENCIES.map((c)=><option key={c}>{c}</option>)}</select></Field><Field label="Contract Date"><input style={inputSt} type="date" value={form.contract_date} onChange={(e)=>set("contract_date",e.target.value)} /></Field></Row>
      <Row>
        <Field label="Handover Date"><input style={{ ...inputSt, borderColor:dateError?"#D85A30":"rgba(138,125,94,0.25)", background:dateError?"rgba(216,90,48,0.04)":"#fff" }} type="date" value={form.handover_date} min={form.contract_date||undefined} onChange={(e)=>{ const val=e.target.value; if(form.contract_date&&val&&val<form.contract_date){notify("Handover date cannot be before contract date.","error");return;} set("handover_date",val); }} />{dateError&&<p style={{ fontSize:11, color:"#D85A30", margin:"4px 0 0" }}>⚠ {dateError}</p>}</Field>
        <Field label="Contract File URL"><input style={inputSt} value={form.contract_file_url} onChange={(e)=>set("contract_file_url",e.target.value)} placeholder="https://..." /></Field>
      </Row>
      {form.contract_date && form.handover_date && !dateError && (
        <div style={{ display:"flex", alignItems:"center", background:"rgba(29,158,117,0.06)", border:"1px solid rgba(29,158,117,0.2)", borderRadius:10, padding:"12px 18px", marginTop:4, marginBottom:4 }}>
          <div style={{ textAlign:"center", flexShrink:0 }}><div style={{ fontSize:20, marginBottom:2 }}>📝</div><div style={{ fontWeight:600, fontSize:12, color:"#1D9E75" }}>Contract</div><div style={{ fontSize:12, color:"#8a7d5e" }}>{fmtDate(form.contract_date)}</div></div>
          <div style={{ flex:1, height:2, background:"linear-gradient(90deg,#1D9E75,#c9b87a)", margin:"0 14px", borderRadius:999 }} />
          <div style={{ textAlign:"center", flexShrink:0 }}><div style={{ fontSize:20, marginBottom:2 }}>🏠</div><div style={{ fontWeight:600, fontSize:12, color:"#1D9E75" }}>Handover</div><div style={{ fontSize:12, color:"#8a7d5e" }}>{fmtDate(form.handover_date)}</div></div>
        </div>
      )}
      <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:12 }}>
        <button style={secondaryBtn} onClick={onClose}>Cancel</button>
        <button style={{ ...primaryBtn, opacity:dateError?.55:1, cursor:dateError?"not-allowed":"pointer" }} onClick={handleSubmit} disabled={saving||!!dateError}>{saving?"Saving...":initial?"Save changes":"Create contract"}</button>
      </div>
    </Modal>
  );
}
 
export function ContractDetailModal({ contract: c, onClose }) {
  return (
    <Modal title={`Contract #${c.id} — Details`} onClose={onClose} maxWidth={560}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px 20px", marginBottom:16 }}>
        {[["ID",`#${c.id}`],["Property",`#${c.property_id}`],["Listing",c.listing_id?`#${c.listing_id}`:"—"],["Buyer",c.buyer_id?`#${c.buyer_id}`:"—"],["Agent",c.agent_id?`#${c.agent_id}`:"—"],["Sale Price",fmtPrice(c.sale_price)],["Contract Date",fmtDate(c.contract_date)],["Handover Date",fmtDate(c.handover_date)],["Status","badge"],["Created",fmtDateTime(c.created_at)],["Updated",fmtDateTime(c.updated_at)]].map(([label,val])=>(
          <div key={label}><p style={{ fontSize:10, color:"#b0a890", textTransform:"uppercase", letterSpacing:"0.8px", margin:"0 0 3px" }}>{label}</p>{val==="badge"?<Badge label={c.status}/>:<p style={{ fontSize:14, fontWeight:500, margin:0, color:"#1a1714", wordBreak:"break-all", fontFamily:"'Cormorant Garamond',serif" }}>{val}</p>}</div>
        ))}
      </div>
      {c.contract_file_url && <div><p style={{ fontSize:10, color:"#b0a890", textTransform:"uppercase", letterSpacing:"0.8px", margin:"0 0 5px" }}>Contract File</p><a href={c.contract_file_url} target="_blank" rel="noreferrer" style={{ fontSize:13, color:"#c9b87a", fontFamily:"'DM Sans',sans-serif" }}>📎 Open file</a></div>}
    </Modal>
  );
}
 
export function ContractStatusModal({ contract, onClose, onSuccess, notify }) {
  const [status, setStatus] = useState("COMPLETED");
  const [saving, setSaving] = useState(false);
 
  const handleSubmit = async () => {
    setSaving(true);
    try { await api.patch(`/api/sales/contracts/${contract.id}/status`, { status }); onSuccess(); }
    catch (err) { notify(err.response?.data?.message||"Error changing status","error"); }
    finally { setSaving(false); }
  };
 
  const isCancel = status === "CANCELLED";
  return (
    <Modal title={`Change Status — Contract #${contract.id}`} onClose={onClose}>
      <p style={{ fontSize:13, color:"#8a7d5e", marginBottom:16 }}>Current status: <Badge label={contract.status} /></p>
      <Field label="New status" required>
        <select style={selectSt} value={status} onChange={(e)=>setStatus(e.target.value)}><option value="COMPLETED">COMPLETED</option><option value="CANCELLED">CANCELLED</option></select>
      </Field>
      <div style={{ background:isCancel?"rgba(216,90,48,0.06)":"rgba(29,158,117,0.06)", border:`1px solid ${isCancel?"rgba(216,90,48,0.2)":"rgba(29,158,117,0.2)"}`, borderRadius:10, padding:"10px 14px", marginBottom:20, fontSize:13, color:isCancel?"#D85A30":"#1D9E75" }}>
        {isCancel?"⚠️ Cancelling the contract is irreversible.":"✓ The contract will be marked as successfully completed."}
      </div>
      <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
        <button style={secondaryBtn} onClick={onClose}>Cancel</button>
        <button style={isCancel?dangerBtn:primaryBtn} onClick={handleSubmit} disabled={saving}>{saving?"Changing...":`Confirm — ${status}`}</button>
      </div>
    </Modal>
  );
}
 