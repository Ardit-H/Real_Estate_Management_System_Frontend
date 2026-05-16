import { AiContractSummaryButton } from "../../../pages/shared/AiFeatures";
import { StatusBadge } from "./ContractBadges";
import { STATUS_CFG, BTN_SEC, fmtDate, fmtMoney, daysUntil } from "./contractHelpers";

export default function ContractCard({ contract, onDetail, onPayments, idx }) {
  const days=daysUntil(contract.end_date);
  const expiring=days!==null&&days<=30&&days>0&&contract.status==="ACTIVE";
  const s=STATUS_CFG[contract.status]||STATUS_CFG.ENDED;

  return (
    <div className="ac-card" style={{background:"#fff",borderRadius:14,overflow:"hidden",boxShadow:"0 2px 16px rgba(20,16,10,0.08)",border:"1.5px solid #ece6da",display:"flex",fontFamily:"'DM Sans',sans-serif",animation:`ac-card-in 0.35s ease ${Math.min(idx*0.06,0.4)}s both`}}>
      <div style={{width:4,background:`linear-gradient(to bottom,${s.strip},${s.strip}66)`,flexShrink:0}}/>
      <div style={{width:62,flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:5,padding:"14px 8px",background:`${s.strip}07`,borderRight:"1.5px solid #f0ece3"}}>
        <span style={{fontSize:24}}>📄</span>
        <span style={{fontSize:8.5,fontWeight:700,color:s.color,textTransform:"uppercase",letterSpacing:"0.4px",textAlign:"center",background:`${s.strip}14`,padding:"2px 5px",borderRadius:4,border:`1px solid ${s.strip}28`}}>#{contract.id}</span>
      </div>
      <div style={{flex:1,padding:"13px 18px",display:"flex",flexDirection:"column",justifyContent:"space-between",minWidth:0}}>
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,marginBottom:10}}>
            <div style={{minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5,flexWrap:"wrap"}}>
                <span style={{fontSize:9.5,fontWeight:700,color:"#b0a890",textTransform:"uppercase",letterSpacing:"0.8px"}}>Contract #{contract.id}</span>
                <span style={{background:"rgba(201,184,122,0.1)",color:"#c9b87a",border:"1px solid rgba(201,184,122,0.22)",borderRadius:999,padding:"2px 9px",fontSize:10.5,fontWeight:600}}>Prop #{contract.property_id}</span>
                <span style={{background:"rgba(126,184,164,0.1)",color:"#2a6049",border:"1px solid rgba(126,184,164,0.22)",borderRadius:999,padding:"2px 9px",fontSize:10.5,fontWeight:600}}>Client #{contract.client_id}</span>
              </div>
              <div style={{fontSize:20,fontWeight:700,color:"#1a1714",fontFamily:"'Cormorant Garamond',Georgia,serif",letterSpacing:"-0.3px"}}>
                {fmtMoney(contract.rent)}<span style={{fontSize:13,fontWeight:400,color:"#b0a890",marginLeft:4}}>/month</span>
              </div>
            </div>
            <StatusBadge status={contract.status}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:7}}>
            {[
              {label:"Deposit", value:fmtMoney(contract.deposit)},
              {label:"Start",   value:fmtDate(contract.start_date)},
              {label:"End",     value:fmtDate(contract.end_date)},
            ].map(({label,value})=>(
              <div key={label} style={{background:"#f8f5f0",borderRadius:8,padding:"7px 11px",border:"1.5px solid #ede9df"}}>
                <div style={{fontSize:9.5,color:"#b0a890",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:2}}>{label}</div>
                <div style={{fontSize:13,fontWeight:700,color:"#1a1714",fontFamily:"'Cormorant Garamond',Georgia,serif"}}>{value}</div>
              </div>
            ))}
          </div>
        </div>
        {expiring&&(
          <div style={{background:"rgba(201,184,122,0.08)",border:"1.5px solid rgba(201,184,122,0.22)",borderRadius:8,padding:"7px 12px",marginTop:10,fontSize:12,color:"#c9b87a"}}>
            ⚠️ Expires in <strong>{days} days</strong>
          </div>
        )}
        <div style={{display:"flex",gap:7,flexWrap:"wrap",paddingTop:10,borderTop:"1.5px solid #f0ece3",marginTop:10}}>
          <button className="ac-btn" onClick={()=>onDetail(contract)} style={{...BTN_SEC,padding:"7px 14px",fontSize:12.5}}>View Details</button>
          <AiContractSummaryButton contract={contract}/>
          <button className="ac-btn" onClick={()=>onPayments(contract.id)} style={{padding:"7px 14px",borderRadius:9,border:"1.5px solid rgba(201,184,122,0.3)",background:"rgba(201,184,122,0.08)",color:"#8a7230",fontSize:12.5,cursor:"pointer",fontFamily:"inherit"}}>💳 Payments</button>
        </div>
      </div>
    </div>
  );
}