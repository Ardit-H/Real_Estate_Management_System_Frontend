import { useState } from "react";
import api from "../../../api/axios";
import Modal from "./Modal";
import { Field, Row2, PBadge, SBadge } from "./MaintenanceBadges";
import { CATEGORIES, PRIORITIES, STATUSES, CAT_EMOJI, C, fmtMoney, fmtDT } from "./maintenanceHelpers";

export default function DetailModal({item,onClose,onRefresh,notify}){
  const [tab,setTab]=useState("details");
  const [stForm,setStForm]=useState({status:item.status,actual_cost:item.actual_cost||""});
  const [editF,setEditF]=useState({title:item.title,description:item.description||"",category:item.category,priority:item.priority,estimated_cost:item.estimated_cost||"",actual_cost:item.actual_cost||""});
  const [saving,setSaving]=useState(false);
  const done=(msg)=>{notify(msg);onRefresh();onClose()};

  const updateStatus=async()=>{setSaving(true);try{await api.patch(`/api/maintenance/${item.id}/status`,{status:stForm.status,actual_cost:stForm.actual_cost?Number(stForm.actual_cost):null});done("Status updated ✓")}catch(err){notify(err.response?.data?.message||"Error","error")}finally{setSaving(false)}};
  const edit=async()=>{setSaving(true);try{await api.put(`/api/maintenance/${item.id}`,{title:editF.title,description:editF.description||null,category:editF.category,priority:editF.priority,estimated_cost:editF.estimated_cost?Number(editF.estimated_cost):null,actual_cost:editF.actual_cost?Number(editF.actual_cost):null});done("Saved ✓")}catch(err){notify(err.response?.data?.message||"Error","error")}finally{setSaving(false)}};

  const tabs=[{id:"details",label:"Details"},{id:"status",label:"Update Status"},{id:"edit",label:"Edit"}];
  return(<Modal title={`Request #${item.id}`} onClose={onClose} wide>
    <div style={{display:"flex",gap:2,borderBottom:`1px solid ${C.border}`,marginBottom:20,marginTop:-4}}>
      {tabs.map(t=><button key={t.id} className="mn-btn" onClick={()=>setTab(t.id)} style={{padding:"8px 14px",background:"none",color:tab===t.id?C.dark:C.muted,fontWeight:tab===t.id?600:400,fontSize:13,borderBottom:tab===t.id?`2px solid ${C.gold}`:"2px solid transparent",marginBottom:-1}}>{t.label}</button>)}
    </div>
    {tab==="details"&&(<div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}><PBadge p={item.priority}/><SBadge s={item.status}/><span style={{background:"#f0ece3",color:C.textSub,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600}}>{CAT_EMOJI[item.category]} {item.category}</span></div>
      <h3 style={{margin:"0 0 8px",fontSize:19,fontWeight:700,color:C.text,fontFamily:"'Cormorant Garamond',Georgia,serif"}}>{item.title}</h3>
      {item.description&&<p style={{fontSize:13.5,color:C.textSub,lineHeight:1.7,marginBottom:16}}>{item.description}</p>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {[["Property ID",`#${item.property_id}`],["Lease ID",item.lease_id?`#${item.lease_id}`:"—"],["Requested By",item.requested_by?`User #${item.requested_by}`:"—"],["Assigned To",item.assigned_to?`User #${item.assigned_to}`:"Unassigned"],["Estimated Cost",fmtMoney(item.estimated_cost)],["Actual Cost",fmtMoney(item.actual_cost)],["Created",fmtDT(item.created_at)],["Completed",fmtDT(item.completed_at)]].map(([l,v])=>(<div key={l} style={{background:"#f5f0e8",borderRadius:10,padding:"10px 14px"}}><p style={{margin:0,fontSize:10,fontWeight:600,color:C.textMut,textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:4}}>{l}</p><p style={{margin:0,fontSize:13.5,fontWeight:500,color:C.text}}>{v}</p></div>))}
      </div>
    </div>)}
    {tab==="status"&&(<div>
      <Field label="New Status"><select className="mn-in" value={stForm.status} onChange={e=>setStForm(p=>({...p,status:e.target.value}))}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></Field>
      <Field label="Actual Cost (€)"><input className="mn-in" type="number" min="0" step="0.01" placeholder="0.00" value={stForm.actual_cost} onChange={e=>setStForm(p=>({...p,actual_cost:e.target.value}))}/></Field>
      <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}><button className="mn-btn" onClick={onClose} style={{padding:"10px 18px",borderRadius:10,border:"1.5px solid #e4ddd0",background:"transparent",color:C.textSub,fontSize:13}}>Cancel</button><button className="mn-btn" onClick={updateStatus} disabled={saving} style={{padding:"10px 22px",borderRadius:10,background:`linear-gradient(135deg,${C.gold},#b0983e)`,color:C.dark,fontSize:13,fontWeight:700}}>{saving?"Updating...":"Update Status"}</button></div>
    </div>)}
    {tab==="edit"&&(<div>
      <Field label="Title" required><input className="mn-in" value={editF.title} onChange={e=>setEditF(p=>({...p,title:e.target.value}))} maxLength={255}/></Field>
      <Field label="Description"><textarea className="mn-in" rows={3} value={editF.description} onChange={e=>setEditF(p=>({...p,description:e.target.value}))} style={{resize:"vertical"}}/></Field>
      <Row2><Field label="Category"><select className="mn-in" value={editF.category} onChange={e=>setEditF(p=>({...p,category:e.target.value}))}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></Field><Field label="Priority"><select className="mn-in" value={editF.priority} onChange={e=>setEditF(p=>({...p,priority:e.target.value}))}>{PRIORITIES.map(p=><option key={p}>{p}</option>)}</select></Field></Row2>
      <Row2><Field label="Estimated Cost (€)"><input className="mn-in" type="number" min="0" step="0.01" value={editF.estimated_cost} onChange={e=>setEditF(p=>({...p,estimated_cost:e.target.value}))}/></Field><Field label="Actual Cost (€)"><input className="mn-in" type="number" min="0" step="0.01" value={editF.actual_cost} onChange={e=>setEditF(p=>({...p,actual_cost:e.target.value}))}/></Field></Row2>
      <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}><button className="mn-btn" onClick={onClose} style={{padding:"10px 18px",borderRadius:10,border:"1.5px solid #e4ddd0",background:"transparent",color:C.textSub,fontSize:13}}>Cancel</button><button className="mn-btn" onClick={edit} disabled={saving} style={{padding:"10px 22px",borderRadius:10,background:`linear-gradient(135deg,${C.gold},#b0983e)`,color:C.dark,fontSize:13,fontWeight:700}}>{saving?"Saving...":"Save Changes"}</button></div>
    </div>)}
  </Modal>);
}