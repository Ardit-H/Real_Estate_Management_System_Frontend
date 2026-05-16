import { STATUS_CFG, fmtMoney, fmtDate, daysUntil } from "./contractsHelpers";
import { StatusBadge } from "./ContractsBadges";

export default function ContractCard({ contract, onDetail, onPayments, idx }) {
  const days     = daysUntil(contract.end_date);
  const expiring = days !== null && days <= 30 && days > 0 && contract.status === "ACTIVE";
  const s        = STATUS_CFG[contract.status] || STATUS_CFG.ENDED;

  return (
    <div className="cc-card"
      style={{
        background:"#fff", borderRadius:14, overflow:"hidden",
        boxShadow:"0 2px 16px rgba(20,16,10,0.08)", border:"1.5px solid #ece6da",
        display:"flex", fontFamily:"'DM Sans',sans-serif",
        animation:`cc-card-in 0.38s ease ${Math.min(idx*0.06,0.4)}s both`,
      }}>

      {/* Status strip */}
      <div style={{ width:4, background:`linear-gradient(to bottom,${s.strip},${s.strip}66)`, flexShrink:0 }}/>

      {/* Icon col */}
      <div style={{
        width:64, flexShrink:0, display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center", gap:6, padding:"16px 10px",
        background:`linear-gradient(135deg,${s.strip}08,transparent)`,
        borderRight:"1.5px solid #f0ece3",
      }}>
        <span style={{ fontSize:26 }}>📄</span>
        <span style={{ fontSize:9, fontWeight:700, color:s.dot, textTransform:"uppercase", letterSpacing:"0.5px", textAlign:"center", lineHeight:1.3, background:`${s.strip}15`, padding:"3px 6px", borderRadius:6, border:`1px solid ${s.strip}30` }}>
          #{contract.id}
        </span>
      </div>

      {/* Content */}
      <div style={{ flex:1, padding:"14px 20px", display:"flex", flexDirection:"column", justifyContent:"space-between", minWidth:0 }}>
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, marginBottom:10 }}>
            <div style={{ minWidth:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                <span style={{ fontSize:9.5, fontWeight:700, color:"#b0a890", textTransform:"uppercase", letterSpacing:"0.8px" }}>Contract #{contract.id}</span>
                <span style={{ background:"rgba(201,184,122,0.1)", color:"#c9b87a", border:"1px solid rgba(201,184,122,0.22)", borderRadius:999, padding:"2px 10px", fontSize:10.5, fontWeight:700 }}>
                  Property #{contract.property_id}
                </span>
              </div>
              <div style={{ fontSize:19, fontWeight:700, color:"#1a1714", fontFamily:"'Cormorant Garamond',Georgia,serif", letterSpacing:"-0.3px" }}>
                {fmtMoney(contract.rent)}<span style={{ fontSize:13, fontWeight:400, color:"#b0a890", marginLeft:4 }}>/month</span>
              </div>
            </div>
            <div style={{ flexShrink:0 }}>
              <StatusBadge status={contract.status}/>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:7, marginBottom:expiring?10:0 }}>
            {[
              { label:"Deposit",    value:fmtMoney(contract.deposit) },
              { label:"Start Date", value:fmtDate(contract.start_date) },
              { label:"End Date",   value:fmtDate(contract.end_date) },
            ].map(({ label, value }) => (
              <div key={label} style={{ background:"#f8f5f0", borderRadius:8, padding:"8px 11px", border:"1.5px solid #ede9df" }}>
                <div style={{ fontSize:9.5, color:"#b0a890", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.7px", marginBottom:3 }}>{label}</div>
                <div style={{ fontSize:13, fontWeight:700, color:"#1a1714", fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Expiring banner */}
        {expiring && (
          <div style={{ background:"rgba(201,184,122,0.08)", border:"1.5px solid rgba(201,184,122,0.22)", borderRadius:8, padding:"8px 12px", marginTop:10, marginBottom:10, fontSize:12, color:"#c9b87a", display:"flex", alignItems:"center", gap:6 }}>
            ⚠️ Expires in <strong>{days} days</strong> — contact your agent to renew
          </div>
        )}

        {/* Actions */}
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", paddingTop:12, borderTop:"1.5px solid #f0ece3", marginTop:expiring?0:10 }}>
          <button onClick={() => onDetail(contract)} className="cc-btn"
            style={{ padding:"8px 16px", borderRadius:9, border:"1.5px solid #e4ddd0", background:"transparent", color:"#6b6248", fontSize:12.5, fontWeight:500, cursor:"pointer", fontFamily:"inherit" }}>
            View Details
          </button>
          {contract.status === "ACTIVE" && (
            <button onClick={() => onPayments(contract)} className="cc-btn"
              style={{ padding:"8px 16px", borderRadius:9, border:"none", background:"linear-gradient(135deg,#c9b87a,#b0983e)", color:"#1a1714", fontSize:12.5, fontWeight:700, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:5 }}>
              💳 Payments
            </button>
          )}
        </div>
      </div>
    </div>
  );
}