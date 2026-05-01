import { useState, useEffect, useCallback } from "react";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";

const CATEGORIES = ["PLUMBING","ELECTRICAL","HVAC","STRUCTURAL","CLEANING","OTHER"];
const PRIORITIES = ["LOW","MEDIUM","HIGH","URGENT"];
const CAT_EMOJI  = { PLUMBING:"🔧",ELECTRICAL:"⚡",HVAC:"❄️",STRUCTURAL:"🏗️",CLEANING:"🧹",OTHER:"🔩" };
const PRI_CFG    = { LOW:{color:"#059669",bg:"#ecfdf5",dot:"#059669",label:"Low"}, MEDIUM:{color:"#d97706",bg:"#fffbeb",dot:"#d97706",label:"Medium"}, HIGH:{color:"#ea580c",bg:"#fff7ed",dot:"#ea580c",label:"High"}, URGENT:{color:"#dc2626",bg:"#fef2f2",dot:"#dc2626",label:"Urgent"} };
const STA_CFG    = { OPEN:{color:"#2563eb",bg:"#eff6ff",label:"Open"}, IN_PROGRESS:{color:"#d97706",bg:"#fffbeb",label:"In Progress"}, COMPLETED:{color:"#059669",bg:"#ecfdf5",label:"Completed"}, CANCELLED:{color:"#64748b",bg:"#f1f5f9",label:"Cancelled"} };
const C = { dark:"#1a1714",gold:"#c9b87a",goldL:"#e8d9a0",border:"#e8e2d6",surface:"#faf7f2",muted:"#9a8c6e",text:"#1a1714",textMut:"#b0a890",textSub:"#6b6340" };
const CSS = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
.cl*{box-sizing:border-box}.cl{font-family:'DM Sans',system-ui,sans-serif;background:#f2ede4;min-height:100vh}
.cl-btn{transition:all .17s ease;cursor:pointer;font-family:'DM Sans',sans-serif;border:none}.cl-btn:hover{opacity:.85;transform:translateY(-1px)}
.cl-card{background:#faf7f2;border:1.5px solid #e8e2d6;border-radius:14px;box-shadow:0 2px 16px rgba(20,16,10,.06);overflow:hidden}
.cl-row{transition:background .15s;cursor:pointer}.cl-row:hover{background:#f5f0e8!important}
.cl-in{width:100%;padding:10px 13px;border:1.5px solid #e4ddd0;border-radius:10px;font-size:13.5px;color:#1a1714;background:#fff;font-family:'DM Sans',sans-serif;outline:none;transition:border-color .2s}
.cl-in:focus{border-color:#8a7d5e;box-shadow:0 0 0 3px rgba(138,125,94,.12)}
@keyframes cl-fade-up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes cl-scale-in{from{opacity:0;transform:scale(.95) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes cl-toast{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes cl-spin{to{transform:rotate(360deg)}}`;

const fmtMoney = v => v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";
const fmtDate  = d => d ? new Date(d).toLocaleDateString("en-GB") : "—";
const fmtDT    = d => d ? new Date(d).toLocaleString("en-GB",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}) : "—";
const fmtRel   = d => { if(!d)return"—"; const diff=Date.now()-new Date(d).getTime(); const m=Math.floor(diff/60000),h=Math.floor(diff/3600000),days=Math.floor(diff/86400000); if(m<60)return`${m}m ago`; if(h<24)return`${h}h ago`; return`${days}d ago`; };

function Toast({msg,type="success",onDone}){useEffect(()=>{const t=setTimeout(onDone,3200);return()=>clearTimeout(t)},[onDone]);return(<div style={{position:"fixed",bottom:26,right:26,zIndex:9999,background:C.dark,color:type==="error"?"#f09090":"#90c8a8",padding:"11px 18px",borderRadius:12,fontSize:13,boxShadow:"0 10px 36px rgba(0,0,0,.32)",border:`1px solid ${type==="error"?"rgba(240,128,128,.15)":"rgba(144,200,168,.15)"}`,fontFamily:"'DM Sans',sans-serif",animation:"cl-toast .2s ease",display:"flex",alignItems:"center",gap:8}}>{type==="error"?"⚠️":"✅"} {msg}</div>)}
function Loader(){return(<div style={{textAlign:"center",padding:"52px 0"}}><div style={{width:28,height:28,margin:"0 auto",border:"2.5px solid #e8e2d6",borderTop:`2.5px solid ${C.gold}`,borderRadius:"50%",animation:"cl-spin .7s linear infinite"}}/></div>)}
function Empty({icon,text,sub,action,onAction}){return(<div style={{textAlign:"center",padding:"52px 20px",color:C.textMut}}><div style={{fontSize:40,marginBottom:10}}>{icon}</div><p style={{fontSize:14,fontWeight:600,color:C.textSub,margin:"0 0 6px",fontFamily:"'Cormorant Garamond',Georgia,serif"}}>{text}</p>{sub&&<p style={{fontSize:13,margin:"0 0 16px",color:C.textMut}}>{sub}</p>}{action&&<button className="cl-btn" onClick={onAction} style={{padding:"9px 20px",borderRadius:10,background:`linear-gradient(135deg,${C.gold},#b0983e)`,color:C.dark,fontSize:13,fontWeight:700}}>{action}</button>}</div>)}
function PBadge({p}){const c=PRI_CFG[p]||PRI_CFG.MEDIUM;return(<span style={{background:c.bg,color:c.color,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,display:"inline-flex",alignItems:"center",gap:4}}><span style={{width:5,height:5,borderRadius:"50%",background:c.dot,display:"inline-block"}}/>{c.label}</span>)}
function SBadge({s}){const c=STA_CFG[s]||STA_CFG.OPEN;return(<span style={{background:c.bg,color:c.color,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600}}>{c.label}</span>)}
function Pager({page,totalPages,onChange}){if(totalPages<=1)return null;return(<div style={{display:"flex",alignItems:"center",gap:6,justifyContent:"flex-end",padding:"14px 18px"}}><button className="cl-btn" disabled={page===0} onClick={()=>onChange(page-1)} style={{padding:"6px 14px",borderRadius:9,border:"1.5px solid #e4ddd0",background:"transparent",color:C.textSub,fontSize:13,opacity:page===0?.4:1}}>Prev</button><span style={{fontSize:12.5,color:C.muted,padding:"0 8px"}}>{page+1}/{totalPages}</span><button className="cl-btn" disabled={page>=totalPages-1} onClick={()=>onChange(page+1)} style={{padding:"6px 14px",borderRadius:9,border:"1.5px solid #e4ddd0",background:"transparent",color:C.textSub,fontSize:13,opacity:page>=totalPages-1?.4:1}}>Next</button></div>)}
function Field({label,required,hint,children}){return(<div style={{marginBottom:14}}><label style={{display:"block",fontSize:10.5,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:6}}>{label}{required&&<span style={{color:"#ef4444",marginLeft:2}}>*</span>}</label>{children}{hint&&<p style={{fontSize:11.5,color:C.textMut,marginTop:4}}>{hint}</p>}</div>)}
function Row2({children}){return<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>{children}</div>}
function Modal({title,sub,onClose,children,wide=false}){useEffect(()=>{const h=e=>e.key==="Escape"&&onClose();window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h)},[onClose]);return(<div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(8,6,4,.72)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={e=>e.target===e.currentTarget&&onClose()}><div style={{width:"100%",maxWidth:wide?640:520,background:C.surface,borderRadius:16,boxShadow:"0 32px 80px rgba(0,0,0,.35)",maxHeight:"90vh",overflowY:"auto",animation:"cl-scale-in .22s ease"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 24px",borderBottom:`1px solid ${C.border}`,background:"#fdf9f4"}}><div><p style={{margin:0,fontSize:16,fontWeight:700,color:C.text,fontFamily:"'Cormorant Garamond',Georgia,serif"}}>{title}</p>{sub&&<p style={{margin:"2px 0 0",fontSize:12,color:C.muted}}>{sub}</p>}</div><button onClick={onClose} style={{width:30,height:30,border:"none",background:"none",color:C.muted,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button></div><div style={{padding:"22px 24px"}}>{children}</div></div></div>)}

// Create Modal for Client
function CreateModal({onClose,onSuccess,notify}){
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

// Detail View for Client (read-only)
function ClientDetailModal({item,onClose}){
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

export default function ClientMaintenance(){
  const [items,setItems]=useState([]);
  const [loading,setLoading]=useState(true);
  const [page,setPage]=useState(0);
  const [totalPages,setTotalPages]=useState(0);
  const [createOpen,setCreateOpen]=useState(false);
  const [selected,setSelected]=useState(null);
  const [toast,setToast]=useState(null);
  const notify=useCallback((msg,type="success")=>setToast({msg,type,key:Date.now()}),[]);

  const fetchAll=useCallback(async()=>{
    setLoading(true);
    try{const r=await api.get(`/api/maintenance/my?page=${page}&size=10`);setItems(r.data.content||[]);setTotalPages(r.data.totalPages||0)}
    catch{notify("Error loading requests","error")}
    finally{setLoading(false)}
  },[page,notify]);

  useEffect(()=>{fetchAll()},[fetchAll]);

  const open=items.filter(i=>i.status==="OPEN").length;
  const inProgress=items.filter(i=>i.status==="IN_PROGRESS").length;
  const completed=items.filter(i=>i.status==="COMPLETED").length;

  return(<MainLayout role="client">
    <style>{CSS}</style>
    <div className="cl">
      {/* HERO */}
      <div style={{background:"linear-gradient(160deg,#1a1714 0%,#1e1a14 50%,#241e16 100%)",minHeight:200,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"36px 32px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,.018) 1px,transparent 1px)",backgroundSize:"22px 22px",pointerEvents:"none"}}/>
        <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:`linear-gradient(90deg,transparent,${C.gold} 30%,${C.gold} 70%,transparent)`}}/>
        <div style={{position:"relative",zIndex:1,textAlign:"center",maxWidth:580}}>
          <p style={{margin:"0 0 8px",fontSize:10,fontWeight:600,color:C.gold,textTransform:"uppercase",letterSpacing:"2.5px"}}>My Maintenance Requests</p>
          <h1 style={{margin:"0 0 10px",fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"clamp(24px,3vw,36px)",fontWeight:700,color:"#f5f0e8",letterSpacing:"-0.4px"}}>Property <span style={{background:`linear-gradient(90deg,${C.gold},${C.goldL})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Maintenance</span></h1>
          <p style={{margin:"0 0 22px",fontSize:13,color:"rgba(245,240,232,.38)"}}>Report issues, track repair status, and stay updated on your property maintenance</p>
          <button className="cl-btn" onClick={()=>setCreateOpen(true)}
            style={{padding:"11px 28px",borderRadius:11,background:`linear-gradient(135deg,${C.gold},#b0983e)`,color:C.dark,fontSize:13.5,fontWeight:700,boxShadow:`0 6px 24px ${C.gold}30`,display:"inline-flex",alignItems:"center",gap:8}}>
            🔧 Report an Issue
          </button>
        </div>
      </div>

      <div style={{padding:"24px 28px",maxWidth:1100,margin:"0 auto"}}>
        {/* Stats */}
        {items.length>0&&(<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:24}}>
          {[{icon:"📬",label:"Open",value:open,accent:"#2563eb"},{icon:"⚙️",label:"In Progress",value:inProgress,accent:"#d97706"},{icon:"✅",label:"Completed",value:completed,accent:"#059669"}].map(s=><div key={s.label} className="cl-card" style={{padding:"16px 18px",display:"flex",alignItems:"center",gap:12}}><div style={{width:38,height:38,borderRadius:10,background:`${s.accent}18`,border:`1.5px solid ${s.accent}28`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>{s.icon}</div><div><p style={{margin:0,fontSize:10,fontWeight:600,color:C.textMut,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:3}}>{s.label}</p><p style={{margin:0,fontSize:22,fontWeight:700,color:C.text,fontFamily:"'Cormorant Garamond',Georgia,serif",lineHeight:1}}>{s.value}</p></div></div>)}
        </div>)}

        {/* Cards View */}
        <div className="cl-card">
          <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.border}`,background:"#fdf9f4",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <p style={{margin:0,fontSize:15,fontWeight:700,color:C.text,fontFamily:"'Cormorant Garamond',Georgia,serif"}}>My Requests</p>
            {items.length>0&&<span style={{background:`${C.gold}22`,color:C.textSub,padding:"2px 9px",borderRadius:20,fontSize:11,fontWeight:600}}>{items.length} total</span>}
          </div>

          {loading?<Loader/>:items.length===0?(<Empty icon="🏠" text="No maintenance requests yet" sub="Report issues with your property and we'll get them fixed quickly." action="Report First Issue" onAction={()=>setCreateOpen(true)}/>):(
            <><div style={{padding:"10px 0"}}>
              {items.map((item,i)=>{
                const sc=STA_CFG[item.status]||STA_CFG.OPEN;
                const pc=PRI_CFG[item.priority]||PRI_CFG.MEDIUM;
                return(<div key={item.id} className="cl-row" onClick={()=>setSelected(item)} style={{padding:"16px 20px",borderBottom:i<items.length-1?`1px solid ${C.border}`:"none",display:"flex",alignItems:"center",gap:14}}>
                  {/* Category icon */}
                  <div style={{width:44,height:44,borderRadius:11,background:`${pc.dot}14`,border:`1.5px solid ${pc.dot}28`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{CAT_EMOJI[item.category]}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                      <p style={{margin:0,fontSize:14,fontWeight:600,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:300}}>{item.title}</p>
                      <PBadge p={item.priority}/>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                      <SBadge s={item.status}/>
                      <span style={{fontSize:11.5,color:C.textMut}}>{item.category}</span>
                      <span style={{fontSize:11.5,color:C.textMut}}>Property #{item.property_id}</span>
                      <span style={{fontSize:11.5,color:C.textMut}}>{fmtRel(item.created_at)}</span>
                      {item.assigned_to&&<span style={{fontSize:11.5,color:"#059669"}}>✓ Assigned</span>}
                    </div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    {item.estimated_cost&&<p style={{margin:0,fontSize:13,fontWeight:600,color:C.text}}>{fmtMoney(item.estimated_cost)}</p>}
                    <p style={{margin:"4px 0 0",fontSize:11,color:C.textMut}}>est. cost</p>
                  </div>
                  <div style={{color:C.textMut,fontSize:18,flexShrink:0}}>›</div>
                </div>);
              })}
            </div><Pager page={page} totalPages={totalPages} onChange={setPage}/></>
          )}
        </div>

        {/* Info box */}
        <div style={{marginTop:20,background:`${C.gold}10`,border:`1.5px solid ${C.gold}30`,borderRadius:12,padding:"16px 20px",display:"flex",gap:12,alignItems:"flex-start"}}>
          <span style={{fontSize:20,flexShrink:0}}>💡</span>
          <div>
            <p style={{margin:"0 0 4px",fontSize:13,fontWeight:600,color:C.textSub}}>How it works</p>
            <p style={{margin:0,fontSize:12.5,color:C.muted,lineHeight:1.7}}>Submit a request → Our team reviews it → A technician is assigned → Work is completed. For emergencies, mark priority as <strong>URGENT</strong> and we'll respond immediately.</p>
          </div>
        </div>
      </div>

      {createOpen&&<CreateModal onClose={()=>setCreateOpen(false)} onSuccess={()=>{setCreateOpen(false);fetchAll();notify("Request submitted ✓ Our team will review it shortly.")}} notify={notify}/>}
      {selected&&<ClientDetailModal item={selected} onClose={()=>setSelected(null)}/>}
      {toast&&<Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}
    </div>
  </MainLayout>);
}