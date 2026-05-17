import { useState, useEffect, useCallback } from "react";
import api from "../../../api/axios";
import { PAYMENT_TYPES, PAYMENT_METHODS, CURRENCIES, fmtPrice, fmtDate, inputSt, selectSt, primaryBtn, secondaryBtn, btnSm, card, cardHeader, cardTitle, TH, TD } from "./salesConstants.js";
import { Badge, Modal, Field, Row, Empty, Loader } from "./SalesUI.jsx";
 
export function PaymentsSection({ prefill, notify }) {
  const [contractId, setContractId] = useState(prefill?.contractId ?? "");
  const [inputId, setInputId]       = useState(prefill?.contractId ? String(prefill.contractId) : "");
  const [payments, setPayments]     = useState([]);
  const [summary, setSummary]       = useState(null);
  const [loading, setLoading]       = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [payTarget, setPayTarget]   = useState(null);
 
  const fetchPayments = useCallback(async () => {
    if (!contractId) return;
    setLoading(true);
    try {
      const [listRes, sumRes] = await Promise.all([
        api.get(`/api/sales/payments/contract/${contractId}`),
        api.get(`/api/sales/payments/contract/${contractId}/summary`),
      ]);
      setPayments(listRes.data || []);
      setSummary(sumRes.data);
    } catch (err) { notify(err.response?.data?.message||"Error loading payments","error"); }
    finally { setLoading(false); }
  }, [contractId, notify]);
 
  useEffect(() => { fetchPayments(); }, [fetchPayments]);
  useEffect(() => { if (prefill?.contractId) { setInputId(String(prefill.contractId)); setContractId(prefill.contractId); } }, [prefill]);
 
  const handleMarkPaid = async (data) => {
    try {
      await api.patch(`/api/sales/payments/${payTarget.id}/pay`, data);
      notify("Payment marked as PAID");
      setPayTarget(null);
      fetchPayments();
    } catch (err) { notify(err.response?.data?.message||"Error","error"); }
  };
 
  const totalPaid  = summary ? Number(summary.total_paid) : 0;
  const salePrice  = prefill?.salePrice ? Number(prefill.salePrice) : 0;
  const paidPct    = salePrice > 0 ? Math.min(100, Math.round((totalPaid / salePrice) * 100)) : null;
  const pendingCount = payments.filter((p) => p.status === "PENDING").length;
  const paidCount    = payments.filter((p) => p.status === "PAID").length;
 
  return (
    <>
      <div style={card}>
        <div style={cardHeader}>
          <div>
            <h2 style={cardTitle}>Sale Payments</h2>
            {summary && <p style={{ fontSize:12, color:"#b0a890", margin:0, fontFamily:"'DM Sans',sans-serif" }}>{summary.total_payments} payments · {paidCount} PAID · {pendingCount} PENDING</p>}
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
            <label style={{ fontSize:13, color:"#8a7d5e", fontFamily:"'DM Sans',sans-serif" }}>Contract #</label>
            <input type="number" value={inputId} onChange={(e)=>setInputId(e.target.value)} placeholder="ID..." style={{ ...inputSt, width:100, height:36, padding:"0 10px" }} />
            <button style={secondaryBtn} onClick={()=>setContractId(inputId?Number(inputId):"")}>Load</button>
            {contractId && <button style={primaryBtn} onClick={()=>setCreateOpen(true)}>+ Add Payment</button>}
          </div>
        </div>
 
        {summary && contractId && (
          <div style={{ display:"flex", gap:16, padding:"14px 20px", background:"rgba(138,125,94,0.04)", borderBottom:"1px solid rgba(138,125,94,0.1)", alignItems:"center", flexWrap:"wrap" }}>
            <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
              <span style={{ fontSize:10, color:"#b0a890", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.8px", fontFamily:"'DM Sans',sans-serif" }}>Total Payments</span>
              <span style={{ fontSize:22, fontWeight:700, color:"#1a1714", letterSpacing:"-0.03em", fontFamily:"'Cormorant Garamond',serif" }}>{summary.total_payments}</span>
            </div>
            <div style={{ width:1, height:36, background:"rgba(138,125,94,0.15)" }} />
            <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
              <span style={{ fontSize:10, color:"#b0a890", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.8px", fontFamily:"'DM Sans',sans-serif" }}>Total Paid</span>
              <span style={{ fontSize:22, fontWeight:700, color:"#1D9E75", letterSpacing:"-0.03em", fontFamily:"'Cormorant Garamond',serif" }}>€{totalPaid.toLocaleString("de-DE")}</span>
            </div>
            {paidPct !== null && (<>
              <div style={{ width:1, height:36, background:"rgba(138,125,94,0.15)" }} />
              <div style={{ flex:1, minWidth:160 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:10, color:"#b0a890", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.8px", fontFamily:"'DM Sans',sans-serif" }}>Paid of price</span>
                  <span style={{ fontSize:13, fontWeight:700, color:"#c9b87a", fontFamily:"'DM Sans',sans-serif" }}>{paidPct}%</span>
                </div>
                <div style={{ height:6, background:"rgba(138,125,94,0.1)", borderRadius:999 }}>
                  <div style={{ height:"100%", borderRadius:999, width:`${paidPct}%`, background:paidPct===100?"#1D9E75":"linear-gradient(90deg,#8a7d5e,#c9b87a)", transition:"width .4s" }} />
                </div>
              </div>
            </>)}
          </div>
        )}
 
        {!contractId ? <Empty icon="💳" text="Enter Contract ID and click Load to view payments." /> :
         loading ? <Loader /> :
         payments.length === 0 ? <Empty icon="💳" text="No payments for this contract." /> : (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", minWidth:700 }}>
              <thead><tr>{["#ID","Amount","Type","Method","Paid Date","Ref","Status","Actions"].map((h)=><th key={h} style={TH}>{h}</th>)}</tr></thead>
              <tbody>
                {payments.map((p)=>(
                  <tr key={p.id} className="as-row">
                    <td style={{ ...TD, fontFamily:"monospace", color:"#b0a890", fontSize:11.5 }}>{p.id}</td>
                    <td style={{ ...TD, fontWeight:600 }}>{fmtPrice(p.amount)}</td>
                    <td style={TD}><span style={{ background:"rgba(138,125,94,0.08)", color:"#8a7d5e", border:"1px solid rgba(138,125,94,0.15)", padding:"2px 8px", borderRadius:999, fontSize:11, fontWeight:600, fontFamily:"'DM Sans',sans-serif" }}>{p.payment_type}</span></td>
                    <td style={{ ...TD, color:"#8a7d5e" }}>{p.payment_method||"—"}</td>
                    <td style={{ ...TD, color:"#8a7d5e" }}>{fmtDate(p.paid_date)}</td>
                    <td style={{ ...TD, fontSize:12, color:"#b0a890", maxWidth:120 }} title={p.transaction_ref||""}>{p.transaction_ref||"—"}</td>
                    <td style={TD}><Badge label={p.status} /></td>
                    <td style={TD}>{p.status==="PENDING"&&<button className="as-btn" style={btnSm("rgba(29,158,117,0.08)","#1D9E75","rgba(29,158,117,0.25)")} onClick={()=>setPayTarget(p)}>Mark Paid</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
 
      {createOpen && <PaymentCreateModal contractId={contractId} onClose={()=>setCreateOpen(false)} onSuccess={()=>{ setCreateOpen(false); fetchPayments(); notify("Payment created"); }} notify={notify} />}
      {payTarget && <MarkPaidModal payment={payTarget} onClose={()=>setPayTarget(null)} onSubmit={handleMarkPaid} notify={notify} />}
    </>
  );
}
 
export function PaymentCreateModal({ contractId, onClose, onSuccess, notify }) {
  const [form, setForm] = useState({ amount:"", currency:"EUR", payment_type:"FULL", payment_method:"BANK_TRANSFER" });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
 
  const handleSubmit = async () => {
    if (!form.amount) { notify("Amount is required","error"); return; }
    setSaving(true);
    try { await api.post("/api/sales/payments", { contract_id:Number(contractId), amount:Number(form.amount), currency:form.currency, payment_type:form.payment_type, payment_method:form.payment_method }); onSuccess(); }
    catch (err) { notify(err.response?.data?.message||"Error creating","error"); }
    finally { setSaving(false); }
  };
 
  return (
    <Modal title={`New Payment — Contract #${contractId}`} onClose={onClose}>
      <Row><Field label="Amount (€)" required><input style={inputSt} type="number" value={form.amount} onChange={(e)=>set("amount",e.target.value)} placeholder="ex: 14500" /></Field><Field label="Currency"><select style={selectSt} value={form.currency} onChange={(e)=>set("currency",e.target.value)}>{CURRENCIES.map((c)=><option key={c}>{c}</option>)}</select></Field></Row>
      <Row><Field label="Payment Type"><select style={selectSt} value={form.payment_type} onChange={(e)=>set("payment_type",e.target.value)}>{PAYMENT_TYPES.map((t)=><option key={t}>{t}</option>)}</select></Field><Field label="Payment Method"><select style={selectSt} value={form.payment_method} onChange={(e)=>set("payment_method",e.target.value)}>{PAYMENT_METHODS.map((m)=><option key={m}>{m}</option>)}</select></Field></Row>
      <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:6 }}><button style={secondaryBtn} onClick={onClose}>Cancel</button><button style={primaryBtn} onClick={handleSubmit} disabled={saving}>{saving?"Creating...":"Create payment"}</button></div>
    </Modal>
  );
}
 
export function MarkPaidModal({ payment, onClose, onSubmit, notify }) {
  const [form, setForm] = useState({ payment_method:payment.payment_method||"BANK_TRANSFER", transaction_ref:"", paid_date:new Date().toISOString().split("T")[0] });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const handleSubmit = async () => { setSaving(true); try { await onSubmit({ payment_method:form.payment_method, transaction_ref:form.transaction_ref||null, paid_date:form.paid_date }); } finally { setSaving(false); } };
 
  return (
    <Modal title={`Mark Payment #${payment.id} as PAID`} onClose={onClose}>
      <div style={{ background:"rgba(29,158,117,0.06)", border:"1px solid rgba(29,158,117,0.2)", borderRadius:10, padding:"10px 14px", marginBottom:18, fontSize:13, color:"#1D9E75" }}>Amount: <strong>{fmtPrice(payment.amount)}</strong></div>
      <Field label="Payment Method"><select style={selectSt} value={form.payment_method} onChange={(e)=>set("payment_method",e.target.value)}>{PAYMENT_METHODS.map((m)=><option key={m}>{m}</option>)}</select></Field>
      <Row><Field label="Transaction Ref"><input style={inputSt} value={form.transaction_ref} onChange={(e)=>set("transaction_ref",e.target.value)} placeholder="TXN-12345" /></Field><Field label="Paid Date"><input style={inputSt} type="date" value={form.paid_date} onChange={(e)=>set("paid_date",e.target.value)} /></Field></Row>
      <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:6 }}><button style={secondaryBtn} onClick={onClose}>Cancel</button><button style={primaryBtn} onClick={handleSubmit} disabled={saving}>{saving?"Confirming...":"✓ Confirm PAID"}</button></div>
    </Modal>
  );
}
 