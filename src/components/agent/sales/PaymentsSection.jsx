import { useState, useEffect } from "react";
import api from "../../../api/axios";
import { PAYMENT_METHODS, MANUAL_PAYMENT_TYPES, TYPE_COLORS, fmtPrice, fmtDate, INP_S, SEL_S, BTN_PRI, BTN_SEC } from "./salesConstants.js";
import { Badge, Modal, Field, FormRow, Loader, EmptyState, AgentTable, TableHead } from "./SalesUI.jsx";
 
export function PaymentsSection({ prefill, notify }) {
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
    }catch{notify("Error loading payments","error");}
    finally{setLoading(false);}
  };
 
  const handleMarkPaid=async(data)=>{
    try{await api.patch(`/api/sales/payments/${payTarget.id}/pay`,data);notify("Payment marked as PAID");setPayTarget(null);fetchPayments();}
    catch(err){notify(err.response?.data?.message||"Error","error");}
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
              <span style={{fontSize:11.5,color:"#2a6049",fontWeight:600,background:"rgba(126,184,164,0.1)",padding:"4px 12px",borderRadius:999,border:"1px solid rgba(126,184,164,0.25)"}}>✓ Finalized automatically</span>
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
 
        {!contractId ? <EmptyState icon="💳" text="Enter Contract ID and click Load."/> : loading ? <Loader/> : payments.length===0 ? <EmptyState icon="💳" text="No payments for this contract."/> : (
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
                      <td style={{padding:"12px 16px",fontSize:12.5,color:"#6b6248"}}>{p.recipient_name?p.recipient_name:<span style={{color:"#2a6049",fontSize:11.5,background:"rgba(126,184,164,0.1)",padding:"2px 8px",borderRadius:999}}>🏢 Company</span>}</td>
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
 
      {createOpen&&<PaymentCreateModal contractId={contractId} onClose={() => setCreateOpen(false)} onSuccess={() => { setCreateOpen(false); fetchPayments(); notify("Payment created"); }} notify={notify}/>}
      {payTarget&&<MarkPaidModal payment={payTarget} onClose={() => setPayTarget(null)} onSubmit={handleMarkPaid} notify={notify}/>}
    </>
  );
}
 
export function PaymentCreateModal({ contractId, onClose, onSuccess, notify }) {
  const [form,setForm]=useState({amount:"",currency:"EUR",payment_type:"DEPOSIT",payment_method:"BANK_TRANSFER"});
  const [saving,setSaving]=useState(false);
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  const handleSubmit=async()=>{
    if(!form.amount){notify("Amount is required","error");return;}
    setSaving(true);
    try{await api.post("/api/sales/payments",{contract_id:Number(contractId),amount:Number(form.amount),currency:form.currency,payment_type:form.payment_type,payment_method:form.payment_method});onSuccess();}
    catch(err){notify(err.response?.data?.message||"Error","error");}
    finally{setSaving(false);}
  };
  return (
    <Modal title={`New Payment — Contract #${contractId}`} onClose={onClose}>
      <div style={{background:"rgba(201,184,122,0.07)",border:"1.5px solid rgba(201,184,122,0.2)",borderRadius:10,padding:"10px 14px",marginBottom:16,fontSize:13,color:"#8a7230"}}>💡 Register only advance payments here (deposit or installment). FULL and COMMISSION payments are created automatically.</div>
      <FormRow><Field label="Amount" required><input className="as-in" style={INP_S} type="number" value={form.amount} onChange={e=>set("amount",e.target.value)} placeholder="ex: 14500"/></Field><Field label="Currency"><select className="as-in" style={SEL_S} value={form.currency} onChange={e=>set("currency",e.target.value)}><option>EUR</option><option>USD</option><option>ALL</option></select></Field></FormRow>
      <FormRow><Field label="Payment Type"><select className="as-in" style={SEL_S} value={form.payment_type} onChange={e=>set("payment_type",e.target.value)}>{MANUAL_PAYMENT_TYPES.map(t=><option key={t}>{t}</option>)}</select></Field><Field label="Payment Method"><select className="as-in" style={SEL_S} value={form.payment_method} onChange={e=>set("payment_method",e.target.value)}>{PAYMENT_METHODS.map(m=><option key={m}>{m}</option>)}</select></Field></FormRow>
      <div style={{display:"flex",gap:9,justifyContent:"flex-end",marginTop:6}}><button style={BTN_SEC} onClick={onClose}>Cancel</button><button style={BTN_PRI} onClick={handleSubmit} disabled={saving}>{saving?"Creating...":"Create payment"}</button></div>
    </Modal>
  );
}
 
export function MarkPaidModal({ payment, onClose, onSubmit, notify }) {
  const [form,setForm]=useState({payment_method:payment.payment_method||"BANK_TRANSFER",transaction_ref:"",paid_date:new Date().toISOString().split("T")[0]});
  const [saving,setSaving]=useState(false);
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  const handleSubmit=async()=>{setSaving(true);try{await onSubmit({payment_method:form.payment_method,transaction_ref:form.transaction_ref||null,paid_date:form.paid_date});}finally{setSaving(false);}};
  return (
    <Modal title={`Mark Payment #${payment.id} as PAID`} onClose={onClose}>
      <div style={{background:"rgba(126,184,164,0.08)",border:"1.5px solid rgba(126,184,164,0.22)",borderRadius:10,padding:"10px 14px",marginBottom:16,fontSize:13,color:"#2a6049"}}>Amount: <strong>€{Number(payment.amount).toLocaleString("de-DE")}</strong></div>
      <Field label="Payment Method"><select className="as-in" style={SEL_S} value={form.payment_method} onChange={e=>set("payment_method",e.target.value)}>{PAYMENT_METHODS.map(m=><option key={m}>{m}</option>)}</select></Field>
      <FormRow><Field label="Transaction Ref"><input className="as-in" style={INP_S} value={form.transaction_ref} onChange={e=>set("transaction_ref",e.target.value)} placeholder="TXN-12345"/></Field><Field label="Paid Date"><input className="as-in" style={INP_S} type="date" value={form.paid_date} onChange={e=>set("paid_date",e.target.value)}/></Field></FormRow>
      <div style={{display:"flex",gap:9,justifyContent:"flex-end",marginTop:6}}><button style={BTN_SEC} onClick={onClose}>Cancel</button><button style={BTN_PRI} onClick={handleSubmit} disabled={saving}>{saving?"Confirming...":"✓ Confirm PAID"}</button></div>
    </Modal>
  );
}
 