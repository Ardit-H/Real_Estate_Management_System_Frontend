import { useState } from "react";
import api from "../../../api/axios";
import Modal from "./Modal";
import { Field, Row2 } from "./MaintenanceBadges";
import { CATEGORIES, PRIORITIES, C } from "./maintenanceHelpers";

export default function CreateModal({onClose,onSuccess,notify}){
  const [form,setForm]=useState({property_id:"",lease_id:"",title:"",description:"",category:"OTHER",priority:"MEDIUM",estimated_cost:""});
  const [saving,setSaving]=useState(false);
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  const submit=async()=>{
    if(!form.property_id||!form.title.trim()){notify("Property ID and title are required","error");return}
    setSaving(true);
    try{await api.post("/api/maintenance",{property_id:Number(form.property_id),lease_id:form.lease_id?Number(form.lease_id):null,title:form.title.trim(),description:form.description||null,category:form.category,priority:form.priority,estimated_cost:form.estimated_cost?Number(form.estimated_cost):null});onSuccess()}
    catch(err){notify(err.response?.data?.message||"Error","error")}
    finally{setSaving(false)}
  };
  return(<Modal title="New Maintenance Request" onClose={onClose} wide>
    <Row2><Field label="Property ID" required><input className="mn-in" type="number" min="1" placeholder="42" value={form.property_id} onChange={e=>set("property_id",e.target.value)}/></Field><Field label="Lease ID (optional)"><input className="mn-in" type="number" placeholder="Optional" value={form.lease_id} onChange={e=>set("lease_id",e.target.value)}/></Field></Row2>
    <Field label="Title" required><input className="mn-in" placeholder="e.g. Broken pipe in bathroom" value={form.title} onChange={e=>set("title",e.target.value)} maxLength={255}/></Field>
    <Field label="Description"><textarea className="mn-in" rows={3} placeholder="Describe the issue..." value={form.description} onChange={e=>set("description",e.target.value)} style={{resize:"vertical"}}/></Field>
    <Row2><Field label="Category"><select className="mn-in" value={form.category} onChange={e=>set("category",e.target.value)}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></Field><Field label="Priority"><select className="mn-in" value={form.priority} onChange={e=>set("priority",e.target.value)}>{PRIORITIES.map(p=><option key={p}>{p}</option>)}</select></Field></Row2>
    <Field label="Estimated Cost (€)"><input className="mn-in" type="number" min="0" step="0.01" placeholder="0.00" value={form.estimated_cost} onChange={e=>set("estimated_cost",e.target.value)}/></Field>
    <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:8}}>
      <button className="mn-btn" onClick={onClose} style={{padding:"10px 18px",borderRadius:10,border:"1.5px solid #e4ddd0",background:"transparent",color:C.textSub,fontSize:13}}>Cancel</button>
      <button className="mn-btn" onClick={submit} disabled={saving} style={{padding:"10px 22px",borderRadius:10,background:`linear-gradient(135deg,${C.gold},#b0983e)`,color:C.dark,fontSize:13,fontWeight:700}}>{saving?"Creating...":"Create Request"}</button>
    </div>
  </Modal>);
}