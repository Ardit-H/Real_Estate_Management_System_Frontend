import { STATUS_CFG, fmtDate, fmtDT, fmtMoney, daysUntil } from "./contractsHelpers";
import { ModalWrap, ModalHeader, StatusBadge } from "./ContractsBadges";

export default function ContractDetailModal({ contract, onClose, onViewPayments }) {
  const days     = daysUntil(contract.end_date);
  const expiring = days !== null && days <= 30 && days > 0 && contract.status === "ACTIVE";
  const expired  = days !== null && days <= 0;
  const s        = STATUS_CFG[contract.status] || STATUS_CFG.ENDED;

  return (
    <ModalWrap onClose={onClose} maxW={620}>
      <ModalHeader icon="📄" title={`Contract #${contract.id}`} sub={`Property #${contract.property_id}`} onClose={onClose}/>
      <div style={{ padding:"22px 26px" }}>

        {/* Status + days row */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:s.pill, border:`1.5px solid ${s.pillBorder}`, borderRadius:12, padding:"12px 16px", marginBottom:20 }}>
          <StatusBadge status={contract.status}/>
          {contract.status === "ACTIVE" && days !== null && (
            <span style={{ fontSize:12.5, fontWeight:600, color:expiring?"#c9b87a":expired?"#d4855a":"#9a8c6e", display:"flex", alignItems:"center", gap:5 }}>
              {expiring ? `⚠️ Expires in ${days} days` : expired ? "⚠️ Contract has expired" : `${days} days remaining`}
            </span>
          )}
        </div>

        {expiring && (
          <div style={{ background:"rgba(201,184,122,0.08)", border:"1.5px solid rgba(201,184,122,0.22)", borderRadius:10, padding:"10px 14px", marginBottom:18, fontSize:13, color:"#c9b87a", display:"flex", alignItems:"center", gap:8 }}>
            ⚠️ Your contract expires in <strong>{days} days</strong>. Contact your agent to arrange renewal.
          </div>
        )}

        {/* Details grid */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:20 }}>
          {[
            { label:"Property",    value:`#${contract.property_id}` },
            { label:"Agent",       value:contract.agent_id?`#${contract.agent_id}`:"—" },
            { label:"Start Date",  value:fmtDate(contract.start_date) },
            { label:"End Date",    value:fmtDate(contract.end_date) },
            { label:"Monthly Rent",value:fmtMoney(contract.rent) },
            { label:"Deposit",     value:fmtMoney(contract.deposit) },
            { label:"Created",     value:fmtDT(contract.created_at) },
            { label:"Updated",     value:fmtDT(contract.updated_at) },
          ].map(({ label, value }) => (
            <div key={label} style={{ background:"#fff", borderRadius:11, padding:"11px 14px", border:"1.5px solid #e8e2d6" }}>
              <p style={{ fontSize:9.5, color:"#b0a890", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:5 }}>{label}</p>
              <p style={{ fontSize:13.5, fontWeight:600, color:"#1a1714", margin:0, fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{value}</p>
            </div>
          ))}
        </div>

        {contract.contract_file_url && (
          <div style={{ background:"rgba(201,184,122,0.06)", border:"1.5px solid rgba(201,184,122,0.18)", borderRadius:11, padding:"12px 16px", marginBottom:20 }}>
            <a href={contract.contract_file_url} target="_blank" rel="noopener noreferrer"
              style={{ color:"#c9b87a", fontSize:13.5, fontWeight:600, textDecoration:"none", display:"flex", alignItems:"center", gap:7 }}>
              📄 View Contract Document ↗
            </a>
          </div>
        )}

        <div style={{ borderTop:"1px solid #e8e2d6", paddingTop:18, display:"flex", gap:9, justifyContent:"flex-end" }}>
          <button onClick={onClose} className="cc-btn"
            style={{ padding:"10px 20px", borderRadius:10, border:"1.5px solid #e4ddd0", background:"transparent", color:"#6b6248", fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit" }}>
            Close
          </button>
          {contract.status === "ACTIVE" && (
            <button onClick={()=>{ onClose(); onViewPayments(contract); }} className="cc-btn"
              style={{ padding:"10px 20px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#c9b87a,#b0983e)", color:"#1a1714", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:6 }}>
              💳 View Payments
            </button>
          )}
        </div>
      </div>
    </ModalWrap>
  );
}