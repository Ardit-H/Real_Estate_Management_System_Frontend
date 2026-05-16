import { PAY_STATUS_CFG, TYPE_ICON, fmtMoney, fmtDate, isOverdue } from "./paymentsHelpers";

export default function PaymentRow({ payment, idx }) {
  const overdue       = isOverdue(payment);
  const displayStatus = (overdue && payment.status==="PENDING") ? "OVERDUE" : payment.status;
  const s             = PAY_STATUS_CFG[displayStatus] || PAY_STATUS_CFG.PENDING;
  const icon          = payment.status==="PAID" ? "✓" : overdue ? "⚠" : (TYPE_ICON[payment.payment_type]||"💳");

  return (
    <div className="cp-pay-row"
      style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"13px 16px", background:"#fff", borderRadius:12,
        border:`1.5px solid ${overdue?"rgba(212,133,90,0.22)":"#ece6da"}`,
        animation:`cp-card-in 0.3s ease ${Math.min(idx*0.04,0.3)}s both`,
      }}>

      {/* Icon */}
      <div style={{ width:38, height:38, borderRadius:10, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", background:s.bg, border:`1.5px solid ${s.border}`, fontSize:16, marginRight:14 }}>
        {icon}
      </div>

      {/* Info */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:4, flexWrap:"wrap" }}>
          <span style={{ fontWeight:700, fontSize:15, color:"#1a1714", fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{fmtMoney(payment.amount)}</span>
          <span style={{ background:"#f0ece3", color:"#6b5f45", border:"1px solid #e0d8c8", padding:"2px 9px", borderRadius:999, fontSize:10.5, fontWeight:600, textTransform:"uppercase" }}>{payment.payment_type}</span>
          <span style={{ background:"rgba(201,184,122,0.1)", color:"#c9b87a", border:"1px solid rgba(201,184,122,0.22)", padding:"2px 9px", borderRadius:999, fontSize:10.5, fontWeight:600 }}>#{payment.contract_id}</span>
        </div>
        <p style={{ fontSize:12, color:"#b0a890", margin:0 }}>
          Due: {fmtDate(payment.due_date)}
          {payment.paid_date && ` · Paid: ${fmtDate(payment.paid_date)}`}
          {payment.payment_method && ` · ${payment.payment_method}`}
          {payment.transaction_ref && ` · Ref: ${payment.transaction_ref}`}
        </p>
        {payment.notes && <p style={{ fontSize:11.5, color:"#b0a890", margin:"3px 0 0", fontStyle:"italic", fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{payment.notes}</p>}
      </div>

      {/* Status badge */}
      <div style={{ display:"flex", alignItems:"center", gap:7, flexShrink:0, marginLeft:12 }}>
        {overdue && <span style={{ fontSize:11.5, color:"#d4855a", fontWeight:700 }}>Overdue</span>}
        <span style={{ background:s.bg, color:s.color, border:`1.5px solid ${s.border}`, padding:"3px 12px", borderRadius:999, fontSize:10.5, fontWeight:700, textTransform:"uppercase" }}>{s.label}</span>
      </div>
    </div>
  );
}