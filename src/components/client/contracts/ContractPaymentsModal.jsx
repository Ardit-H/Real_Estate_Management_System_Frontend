import { useState, useEffect } from "react";
import api from "../../../api/axios";
import { PAY_STATUS_CFG, fmtMoney, fmtDate, daysUntil } from "./contractsHelpers";
import { ModalWrap, ModalHeader } from "./ContractsBadges";

export default function ContractPaymentsModal({ contract, onClose, notify }) {
  const [payments, setPayments] = useState([]);
  const [summary,  setSummary]  = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [listRes, sumRes] = await Promise.all([
          api.get(`/api/payments/contract/${contract.id}`),
          api.get(`/api/payments/contract/${contract.id}/summary`),
        ]);
        setPayments(Array.isArray(listRes.data) ? listRes.data : []);
        setSummary(sumRes.data);
      } catch { notify("Failed to load payments","error"); }
      finally   { setLoading(false); }
    })();
  }, [contract.id, notify]);

  return (
    <ModalWrap onClose={onClose} maxW={700}>
      <ModalHeader icon="💳" title={`Payments — Contract #${contract.id}`} sub={`Rent: ${fmtMoney(contract.rent)} / month`} onClose={onClose}/>
      <div style={{ padding:"22px 26px" }}>

        {summary && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))", gap:9, marginBottom:20 }}>
            {[
              { label:"Total",   value:summary.total_payments,                            dot:"#c9b87a",  bg:"rgba(201,184,122,0.08)",  border:"rgba(201,184,122,0.2)"  },
              { label:"Paid",    value:fmtMoney(summary.total_paid||0),                   dot:"#7eb8a4",  bg:"rgba(126,184,164,0.08)",  border:"rgba(126,184,164,0.2)"  },
              { label:"Pending", value:fmtMoney(summary.total_pending||0),                dot:"#c9b87a",  bg:"rgba(201,184,122,0.06)",  border:"rgba(201,184,122,0.15)" },
              ...(summary.overdue_count>0?[{ label:"Overdue", value:summary.overdue_count, dot:"#d4855a", bg:"rgba(212,133,90,0.08)",   border:"rgba(212,133,90,0.22)"  }]:[]),
            ].map(({ label, value, dot, bg, border }) => (
              <div key={label} style={{ background:bg, borderRadius:11, padding:"12px 14px", border:`1.5px solid ${border}` }}>
                <p style={{ fontSize:9.5, color:"#b0a890", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:5 }}>{label}</p>
                <p style={{ fontSize:18, fontWeight:700, color:dot, margin:0, fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{value}</p>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign:"center", padding:"48px 0" }}>
            <div style={{ width:26, height:26, margin:"0 auto", border:"2px solid #e8e2d6", borderTop:"2px solid #c9b87a", borderRadius:"50%", animation:"cc-spin .8s linear infinite" }}/>
          </div>
        ) : payments.length === 0 ? (
          <div style={{ textAlign:"center", padding:"48px 20px", color:"#b0a890" }}>
            <div style={{ fontSize:44, marginBottom:12 }}>💳</div>
            <p style={{ fontSize:14, fontFamily:"'Cormorant Garamond',Georgia,serif", color:"#6b6340" }}>No payments found for this contract.</p>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {payments.map(p => {
              const overdue = p.status==="OVERDUE" || (p.status==="PENDING" && p.due_date && new Date(p.due_date)<new Date());
              const key     = overdue ? "OVERDUE" : p.status;
              const s       = PAY_STATUS_CFG[key] || PAY_STATUS_CFG.PENDING;
              return (
                <div key={p.id} style={{
                  display:"flex", justifyContent:"space-between", alignItems:"center",
                  padding:"13px 16px", background:"#fff", borderRadius:11,
                  border:`1.5px solid ${overdue?"rgba(212,133,90,0.25)":"#e8e2d6"}`,
                }}>
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
                      <span style={{ fontWeight:700, fontSize:15, color:"#1a1714", fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{fmtMoney(p.amount)}</span>
                      <span style={{ background:"#f0ece3", color:"#6b5f45", border:"1px solid #e0d8c8", padding:"2px 9px", borderRadius:999, fontSize:10.5, fontWeight:600, textTransform:"uppercase" }}>{p.payment_type}</span>
                    </div>
                    <p style={{ fontSize:12, color:"#b0a890", margin:0 }}>
                      Due: {fmtDate(p.due_date)}{p.paid_date&&` · Paid: ${fmtDate(p.paid_date)}`}{p.payment_method&&` · ${p.payment_method}`}
                    </p>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:7, flexShrink:0 }}>
                    {overdue && <span style={{ fontSize:11.5, color:"#d4855a", fontWeight:700 }}>Overdue</span>}
                    <span style={{ background:s.bg, color:s.color, border:`1.5px solid ${s.border}`, padding:"3px 12px", borderRadius:999, fontSize:11, fontWeight:700, textTransform:"uppercase" }}>{key}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ borderTop:"1px solid #e8e2d6", paddingTop:16, marginTop:20, display:"flex", justifyContent:"flex-end" }}>
          <button onClick={onClose} className="cc-btn"
            style={{ padding:"10px 22px", borderRadius:10, border:"1.5px solid #e4ddd0", background:"transparent", color:"#6b6248", fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit" }}>
            Close
          </button>
        </div>
      </div>
    </ModalWrap>
  );
}