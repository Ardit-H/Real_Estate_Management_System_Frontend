import { Modal, PBadge, SBadge } from "./MaintenanceBadges";
import { CAT_EMOJI, C, fmtMoney, fmtDT, fmtRel } from "./maintenanceHelpers";

export default function ClientDetailModal({item,onClose}){
  const progressSteps=[{key:"OPEN",label:"Submitted",icon:"📬"},{key:"IN_PROGRESS",label:"In Progress",icon:"⚙️"},{key:"COMPLETED",label:"Completed",icon:"✅"}];
  const currentIdx=progressSteps.findIndex(s=>s.key===item.status);
  const isCancelled=item.status==="CANCELLED";
  return(<Modal title={`Request #${item.id}`} sub={item.title} onClose={onClose} wide>
    {/* Progress tracker */}
    {!isCancelled&&(<div style={{marginBottom:24,padding:"18px 20px",background:"#f5f0e8",borderRadius:12}}>
      <p style={{margin:"0 0 14px",fontSize:10,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:"1px"}}>Request Progress</p>
      <div style={{display:"flex",alignItems:"center",gap:0}}>
        {progressSteps.map((step,i)=>{
          const done=i<=currentIdx;
          return(<div key={step.key} style={{display:"flex",alignItems:"center",flex:i<progressSteps.length-1?1:"auto"}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:done?C.gold:"#e8e2d6",border:`2px solid ${done?"#b0983e":"#d4cfc3"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,transition:"all .3s"}}>{step.icon}</div>
              <p style={{margin:0,fontSize:10.5,fontWeight:done?600:400,color:done?C.textSub:C.textMut,whiteSpace:"nowrap"}}>{step.label}</p>
            </div>
            {i<progressSteps.length-1&&<div style={{flex:1,height:2,background:i<currentIdx?C.gold:"#e8e2d6",margin:"0 8px",marginBottom:20,transition:"all .3s"}}/>}
          </div>);
        })}
      </div>
    </div>)}
    {isCancelled&&(<div style={{background:"#f1f5f9",border:"1px solid #cbd5e1",borderRadius:10,padding:"12px 16px",marginBottom:18,fontSize:13,color:"#64748b"}}>❌ This request has been cancelled.</div>)}

    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}><PBadge p={item.priority}/><SBadge s={item.status}/><span style={{background:"#f0ece3",color:C.textSub,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600}}>{CAT_EMOJI[item.category]} {item.category}</span></div>
    {item.description&&<div style={{background:"#f5f0e8",borderRadius:10,padding:"14px 16px",marginBottom:16}}><p style={{margin:"0 0 4px",fontSize:10,fontWeight:600,color:C.textMut,textTransform:"uppercase",letterSpacing:"0.7px"}}>Your Description</p><p style={{margin:0,fontSize:13.5,color:C.textSub,lineHeight:1.7}}>{item.description}</p></div>}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
      {[["Property",`#${item.property_id}`],["Lease",item.lease_id?`#${item.lease_id}`:"—"],["Assigned To",item.assigned_to?`Technician #${item.assigned_to}`:"Pending assignment"],["Estimated Cost",fmtMoney(item.estimated_cost)],["Actual Cost",fmtMoney(item.actual_cost)],["Submitted",fmtDT(item.created_at)],["Completed",item.completed_at?fmtDT(item.completed_at):"—"],["Last Updated",fmtRel(item.updated_at)]].map(([l,v])=>(<div key={l} style={{background:"#f5f0e8",borderRadius:10,padding:"10px 14px"}}><p style={{margin:0,fontSize:10,fontWeight:600,color:C.textMut,textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:4}}>{l}</p><p style={{margin:0,fontSize:13.5,fontWeight:500,color:C.text}}>{v}</p></div>))}
    </div>
  </Modal>);
}