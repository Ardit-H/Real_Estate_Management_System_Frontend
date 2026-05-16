import Modal from "./Modal";
import { StatusBadge } from "./ContractBadges";
import { STATUS_CFG, BTN_PRI, BTN_SEC, fmtDate, fmtDT, fmtMoney, daysUntil } from "./contractHelpers";

export default function ContractDetailModal({ contract, onClose, onEdit, onStatusChange, onGoToPayments }) {
  const days=daysUntil(contract.end_date);
  const expiring=days!==null&&days<=30&&days>0&&contract.status==="ACTIVE";
  const s=STATUS_CFG[contract.status]||STATUS_CFG.ENDED;

  return (
    <Modal title={`Kontratë #${contract.id}`} onClose={onClose} wide>
      {expiring&&(
        <div style={{background:"rgba(201,184,122,0.08)",border:"1.5px solid rgba(201,184,122,0.22)",borderRadius:10,padding:"10px 14px",marginBottom:16,fontSize:13,color:"#c9b87a"}}>
          ⚠️ Kjo kontratë skadon pas <strong>{days}</strong> ditësh!
        </div>
      )}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:s.pill,border:`1.5px solid ${s.pillBorder}`,borderRadius:11,padding:"12px 16px",marginBottom:18}}>
        <StatusBadge status={contract.status}/>
        {contract.status==="ACTIVE"&&days!==null&&(
          <span style={{fontSize:12.5,fontWeight:600,color:expiring?"#c9b87a":"#9a8c6e"}}>
            {expiring?`⚠️ ${days} days remaining`:`${days} days remaining`}
          </span>
        )}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:18}}>
        {[
          {label:"Property",    value:`#${contract.property_id}`},
          {label:"Client",      value:`#${contract.client_id}`},
          {label:"Agjent",      value:contract.agent_id?`#${contract.agent_id}`:"—"},
          {label:"Data fillimit",value:fmtDate(contract.start_date)},
          {label:"Data mbarimit",value:fmtDate(contract.end_date)},
          {label:"Qiraja",      value:fmtMoney(contract.rent)},
          {label:"Depozita",    value:fmtMoney(contract.deposit)},
          {label:"Krijuar",     value:fmtDT(contract.created_at)},
        ].map(({label,value})=>(
          <div key={label} style={{background:"#fff",borderRadius:10,padding:"10px 14px",border:"1.5px solid #e8e2d6"}}>
            <p style={{fontSize:9.5,color:"#b0a890",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:4}}>{label}</p>
            <p style={{fontSize:13.5,fontWeight:600,color:"#1a1714",margin:0,fontFamily:"'Cormorant Garamond',Georgia,serif"}}>{value}</p>
          </div>
        ))}
      </div>
      {contract.contract_file_url&&(
        <div style={{background:"rgba(201,184,122,0.06)",border:"1.5px solid rgba(201,184,122,0.18)",borderRadius:10,padding:"10px 14px",marginBottom:16}}>
          <a href={contract.contract_file_url} target="_blank" rel="noopener noreferrer" style={{color:"#c9b87a",fontSize:13.5,fontWeight:600,textDecoration:"none"}}>
            📄 Hap fajllin e kontratës ↗
          </a>
        </div>
      )}
      <div style={{background:"rgba(201,184,122,0.06)",border:"1.5px solid rgba(201,184,122,0.18)",borderRadius:10,padding:"12px 16px",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{fontSize:13,color:"#a8923e",fontWeight:500}}>💳 Pagesat e kësaj kontrate</span>
        <button className="ac-btn" onClick={()=>onGoToPayments(String(contract.id))} style={{...BTN_PRI,padding:"6px 14px",fontSize:12}}>Shiko Pagesat →</button>
      </div>
      <div style={{display:"flex",gap:9,justifyContent:"flex-end",borderTop:"1.5px solid #e8e2d6",paddingTop:16}}>
        {contract.status!=="ENDED"&&contract.status!=="CANCELLED"&&(
          <>
            <button style={BTN_SEC} onClick={()=>onEdit(contract)}>Edit</button>
            <button style={BTN_PRI} onClick={()=>onStatusChange(contract)}>Ndrysho statusin</button>
          </>
        )}
      </div>
    </Modal>
  );
}