import { useState } from "react";
import api from "../../../api/axios";
import { Modal, Field, Row2 } from "./MaintenanceBadges";
import { CATEGORIES, PRIORITIES, CAT_EMOJI, C } from "./maintenanceHelpers";

export default function CreateModal({onClose,onSuccess,notify}){
  const [form,setForm]=useState({property_id:"",lease_id:"",title:"",description:"",category:"OTHER",priority:"MEDIUM",estimated_cost:""});
  const [saving,setSaving]=useState(false);
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  const submit=async()=>{
    if(!form.property_id){notify("Property ID is required","error");return}
    if(!form.title.trim()){notify("Title is required","error");return}
    setSaving(true);
    try{await api.post("/api/maintenance",{property_id:Number(form.property_id),lease_id:form.lease_id?Number(form.lease_id):null,title:form.title.trim(),description:form.description||null,category:form.category,priority:form.priority,estimated_cost:form.estimated_cost?Number(form.estimated_cost):null});onSuccess()}
    catch(err){notify(err.response?.data?.message||"Error submitting request","error")}
    finally{setSaving(false)}
  };
  return(<Modal title="Submit Maintenance Request" sub="Report an issue with your property" onClose={onClose} wide>
    <div style={{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:10,padding:"12px 14px",marginBottom:18,fontSize:13,color:"#1d4ed8",display:"flex",alignItems:"flex-start",gap:8}}>
      <span style={{fontSize:16,flexShrink:0}}>ℹ️</span>
      <span>Your request will be reviewed by the agent and assigned to a technician. You'll be able to track the status here.</span>
    </div>
    <Row2><Field label="Property ID" required hint="The ID of the property with the issue"><input className="cl-in" type="number" min="1" placeholder="e.g. 42" value={form.property_id} onChange={e=>set("property_id",e.target.value)}/></Field><Field label="Lease ID" hint="Optional — your lease contract ID"><input className="cl-in" type="number" placeholder="Optional" value={form.lease_id} onChange={e=>set("lease_id",e.target.value)}/></Field></Row2>
    <Field label="Issue Title" required hint="Brief description of the problem">
      <input className="cl-in" placeholder="e.g. Broken pipe in bathroom, No hot water..." value={form.title} onChange={e=>set("title",e.target.value)} maxLength={255}/>
    </Field>
    <Field label="Detailed Description" hint="The more detail you provide, the faster we can help">
      <textarea className="cl-in" rows={4} placeholder="Describe when it started, how severe it is, any relevant details..." value={form.description} onChange={e=>set("description",e.target.value)} style={{resize:"vertical"}}/>
    </Field>
    <Row2>
      <Field label="Issue Category">
        <select className="cl-in" value={form.category} onChange={e=>set("category",e.target.value)}>
          {CATEGORIES.map(c=><option key={c} value={c}>{CAT_EMOJI[c]} {c}</option>)}
        </select>
      </Field>
      <Field label="Priority Level" hint="How urgent is this issue?">
        <select className="cl-in" value={form.priority} onChange={e=>set("priority",e.target.value)}>
          {PRIORITIES.map(p=><option key={p}>{p}</option>)}
        </select>
      </Field>
    </Row2>
    <Field label="Estimated Cost (€)" hint="Optional — your estimate of repair cost">
      <input className="cl-in" type="number" min="0" step="0.01" placeholder="0.00" value={form.estimated_cost} onChange={e=>set("estimated_cost",e.target.value)}/>
    </Field>
    <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:8}}>
      <button className="cl-btn" onClick={onClose} style={{padding:"10px 18px",borderRadius:10,border:"1.5px solid #e4ddd0",background:"transparent",color:C.textSub,fontSize:13}}>Cancel</button>
      <button className="cl-btn" onClick={submit} disabled={saving} style={{padding:"10px 24px",borderRadius:10,background:`linear-gradient(135deg,${C.gold},#b0983e)`,color:C.dark,fontSize:13,fontWeight:700}}>{saving?"Submitting...":"Submit Request"}</button>
    </div>
  </Modal>);
}