import { useState, useEffect, useCallback } from "react";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";

const CATEGORIES = ["PLUMBING","ELECTRICAL","HVAC","STRUCTURAL","CLEANING","OTHER"];
const PRIORITIES = ["LOW","MEDIUM","HIGH","URGENT"];
const STATUSES   = ["OPEN","IN_PROGRESS","COMPLETED","CANCELLED"];
const CAT_EMOJI  = { PLUMBING:"🔧",ELECTRICAL:"⚡",HVAC:"❄️",STRUCTURAL:"🏗️",CLEANING:"🧹",OTHER:"🔩" };
const PRI_CFG    = { LOW:{color:"#059669",bg:"#ecfdf5",dot:"#059669",label:"Low"}, MEDIUM:{color:"#d97706",bg:"#fffbeb",dot:"#d97706",label:"Medium"}, HIGH:{color:"#ea580c",bg:"#fff7ed",dot:"#ea580c",label:"High"}, URGENT:{color:"#dc2626",bg:"#fef2f2",dot:"#dc2626",label:"Urgent"} };
const STA_CFG    = { OPEN:{color:"#2563eb",bg:"#eff6ff",label:"Open"}, IN_PROGRESS:{color:"#d97706",bg:"#fffbeb",label:"In Progress"}, COMPLETED:{color:"#059669",bg:"#ecfdf5",label:"Completed"}, CANCELLED:{color:"#64748b",bg:"#f1f5f9",label:"Cancelled"} };
const C = { dark:"#1a1714",gold:"#c9b87a",goldL:"#e8d9a0",border:"#e8e2d6",surface:"#faf7f2",muted:"#9a8c6e",text:"#1a1714",textMut:"#b0a890",textSub:"#6b6340" };
const CSS = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
.ad*{box-sizing:border-box}.ad{font-family:'DM Sans',system-ui,sans-serif;background:#f2ede4;min-height:100vh}
.ad-btn{transition:all .17s ease;cursor:pointer;font-family:'DM Sans',sans-serif;border:none}.ad-btn:hover{opacity:.85;transform:translateY(-1px)}
.ad-card{background:#faf7f2;border:1.5px solid #e8e2d6;border-radius:14px;box-shadow:0 2px 16px rgba(20,16,10,.06);overflow:hidden}
.ad-row{transition:background .15s}.ad-row:hover{background:#f5f0e8!important}
.ad-in{width:100%;padding:10px 13px;border:1.5px solid #e4ddd0;border-radius:10px;font-size:13.5px;color:#1a1714;background:#fff;font-family:'DM Sans',sans-serif;outline:none;transition:border-color .2s}
.ad-in:focus{border-color:#8a7d5e;box-shadow:0 0 0 3px rgba(138,125,94,.12)}
@keyframes ad-fade-up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes ad-scale-in{from{opacity:0;transform:scale(.95) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes ad-toast{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes ad-spin{to{transform:rotate(360deg)}}`;

const fmtMoney = v => v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";
const fmtDate  = d => d ? new Date(d).toLocaleDateString("en-GB") : "—";
const fmtDT    = d => d ? new Date(d).toLocaleString("en-GB",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}) : "—";

function Toast({msg,type="success",onDone}){useEffect(()=>{const t=setTimeout(onDone,3200);return()=>clearTimeout(t)},[onDone]);return(<div style={{position:"fixed",bottom:26,right:26,zIndex:9999,background:C.dark,color:type==="error"?"#f09090":"#90c8a8",padding:"11px 18px",borderRadius:12,fontSize:13,boxShadow:"0 10px 36px rgba(0,0,0,.32)",border:`1px solid ${type==="error"?"rgba(240,128,128,.15)":"rgba(144,200,168,.15)"}`,fontFamily:"'DM Sans',sans-serif",animation:"ad-toast .2s ease",display:"flex",alignItems:"center",gap:8}}>{type==="error"?"⚠️":"✅"} {msg}</div>)}
function Loader(){return(<div style={{textAlign:"center",padding:"52px 0"}}><div style={{width:28,height:28,margin:"0 auto",border:"2.5px solid #e8e2d6",borderTop:`2.5px solid ${C.gold}`,borderRadius:"50%",animation:"ad-spin .7s linear infinite"}}/></div>)}
function Empty({icon,text}){return(<div style={{textAlign:"center",padding:"52px 20px",color:C.textMut}}><div style={{fontSize:36,marginBottom:10}}>{icon}</div><p style={{fontSize:13.5,margin:0}}>{text}</p></div>)}
function PBadge({p}){const c=PRI_CFG[p]||PRI_CFG.MEDIUM;return(<span style={{background:c.bg,color:c.color,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,display:"inline-flex",alignItems:"center",gap:4}}><span style={{width:5,height:5,borderRadius:"50%",background:c.dot,display:"inline-block"}}/>{c.label}</span>)}
function SBadge({s}){const c=STA_CFG[s]||STA_CFG.OPEN;return(<span style={{background:c.bg,color:c.color,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600}}>{c.label}</span>)}
function Pager({page,totalPages,onChange}){if(totalPages<=1)return null;return(<div style={{display:"flex",alignItems:"center",gap:6,justifyContent:"flex-end",padding:"14px 18px"}}><button className="ad-btn" disabled={page===0} onClick={()=>onChange(page-1)} style={{padding:"6px 14px",borderRadius:9,border:"1.5px solid #e4ddd0",background:"transparent",color:C.textSub,fontSize:13,opacity:page===0?.4:1}}>Prev</button><span style={{fontSize:12.5,color:C.muted,padding:"0 8px"}}>{page+1}/{totalPages}</span><button className="ad-btn" disabled={page>=totalPages-1} onClick={()=>onChange(page+1)} style={{padding:"6px 14px",borderRadius:9,border:"1.5px solid #e4ddd0",background:"transparent",color:C.textSub,fontSize:13,opacity:page>=totalPages-1?.4:1}}>Next</button></div>)}
function Field({label,required,children}){return(<div style={{marginBottom:14}}><label style={{display:"block",fontSize:10.5,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:6}}>{label}{required&&<span style={{color:"#ef4444",marginLeft:2}}>*</span>}</label>{children}</div>)}
function Row2({children}){return<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>{children}</div>}
function Modal({title,onClose,children,wide=false}){useEffect(()=>{const h=e=>e.key==="Escape"&&onClose();window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h)},[onClose]);return(<div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(8,6,4,.72)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={e=>e.target===e.currentTarget&&onClose()}><div style={{width:"100%",maxWidth:wide?720:540,background:C.surface,borderRadius:16,boxShadow:"0 32px 80px rgba(0,0,0,.35)",maxHeight:"90vh",overflowY:"auto",animation:"ad-scale-in .22s ease"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 24px",borderBottom:`1px solid ${C.border}`,background:"#fdf9f4"}}><p style={{margin:0,fontSize:16,fontWeight:700,color:C.text,fontFamily:"'Cormorant Garamond',Georgia,serif"}}>{title}</p><button onClick={onClose} style={{width:30,height:30,border:"none",background:"none",color:C.muted,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button></div><div style={{padding:"22px 24px"}}>{children}</div></div></div>)}

function AdminDetailModal({item,onClose,onRefresh,notify}){
  const [tab,setTab]=useState("details");
  const [stForm,setStForm]=useState({status:item.status,actual_cost:item.actual_cost||""});
  const [assignId,setAssignId]=useState(item.assigned_to||"");
  const [editF,setEditF]=useState({title:item.title,description:item.description||"",category:item.category,priority:item.priority,estimated_cost:item.estimated_cost||"",actual_cost:item.actual_cost||""});
  const [saving,setSaving]=useState(false);
  const done=(msg)=>{notify(msg);onRefresh();onClose()};

  const updateStatus=async()=>{setSaving(true);try{await api.patch(`/api/maintenance/${item.id}/status`,{status:stForm.status,actual_cost:stForm.actual_cost?Number(stForm.actual_cost):null});done("Status updated ✓")}catch(err){notify(err.response?.data?.message||"Error","error")}finally{setSaving(false)}};
  const assign=async()=>{if(!assignId){notify("Enter user ID","error");return}setSaving(true);try{await api.patch(`/api/maintenance/${item.id}/assign`,{assigned_to:Number(assignId)});done("Assigned ✓")}catch(err){notify(err.response?.data?.message||"Error","error")}finally{setSaving(false)}};
  const edit=async()=>{setSaving(true);try{await api.put(`/api/maintenance/${item.id}`,{title:editF.title,description:editF.description||null,category:editF.category,priority:editF.priority,estimated_cost:editF.estimated_cost?Number(editF.estimated_cost):null,actual_cost:editF.actual_cost?Number(editF.actual_cost):null});done("Saved ✓")}catch(err){notify(err.response?.data?.message||"Error","error")}finally{setSaving(false)}};

  const tabs=[{id:"details",label:"Details"},{id:"status",label:"Update Status"},{id:"assign",label:"Assign"},{id:"edit",label:"Edit"}];
  return(<Modal title={`Request #${item.id} — ${item.title}`} onClose={onClose} wide>
    <div style={{display:"flex",gap:2,borderBottom:`1px solid ${C.border}`,marginBottom:20,marginTop:-4}}>
      {tabs.map(t=><button key={t.id} className="ad-btn" onClick={()=>setTab(t.id)} style={{padding:"8px 14px",background:"none",color:tab===t.id?C.dark:C.muted,fontWeight:tab===t.id?600:400,fontSize:13,borderBottom:tab===t.id?`2px solid ${C.gold}`:"2px solid transparent",marginBottom:-1}}>{t.label}</button>)}
    </div>
    {tab==="details"&&(<div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}><PBadge p={item.priority}/><SBadge s={item.status}/><span style={{background:"#f0ece3",color:C.textSub,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600}}>{CAT_EMOJI[item.category]} {item.category}</span></div>
      {item.description&&<p style={{fontSize:13.5,color:C.textSub,lineHeight:1.7,marginBottom:16,padding:"12px 14px",background:"#f5f0e8",borderRadius:10}}>{item.description}</p>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {[["Property ID",`#${item.property_id}`],["Lease ID",item.lease_id?`#${item.lease_id}`:"—"],["Requested By",item.requested_by?`User #${item.requested_by}`:"—"],["Assigned To",item.assigned_to?`User #${item.assigned_to}`:"Unassigned"],["Estimated Cost",fmtMoney(item.estimated_cost)],["Actual Cost",fmtMoney(item.actual_cost)],["Created",fmtDT(item.created_at)],["Completed",fmtDT(item.completed_at)]].map(([l,v])=>(<div key={l} style={{background:"#f5f0e8",borderRadius:10,padding:"10px 14px"}}><p style={{margin:0,fontSize:10,fontWeight:600,color:C.textMut,textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:4}}>{l}</p><p style={{margin:0,fontSize:13.5,fontWeight:500,color:C.text}}>{v}</p></div>))}
      </div>
    </div>)}
    {tab==="status"&&(<div>
      <Field label="New Status"><select className="ad-in" value={stForm.status} onChange={e=>setStForm(p=>({...p,status:e.target.value}))}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></Field>
      <Field label="Actual Cost (€)"><input className="ad-in" type="number" min="0" step="0.01" value={stForm.actual_cost} onChange={e=>setStForm(p=>({...p,actual_cost:e.target.value}))}/></Field>
      <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}><button className="ad-btn" onClick={onClose} style={{padding:"10px 18px",borderRadius:10,border:"1.5px solid #e4ddd0",background:"transparent",color:C.textSub,fontSize:13}}>Cancel</button><button className="ad-btn" onClick={updateStatus} disabled={saving} style={{padding:"10px 22px",borderRadius:10,background:`linear-gradient(135deg,${C.gold},#b0983e)`,color:C.dark,fontSize:13,fontWeight:700}}>{saving?"Updating...":"Update Status"}</button></div>
    </div>)}
    {tab==="assign"&&(<div>
      <div style={{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:10,padding:"12px 14px",marginBottom:16,fontSize:13,color:"#1d4ed8"}}>💡 Admin can assign any user. Assigning sets status to IN_PROGRESS automatically.</div>
      <Field label="Assign to User ID"><input className="ad-in" type="number" min="1" placeholder="User ID" value={assignId} onChange={e=>setAssignId(e.target.value)}/></Field>
      <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}><button className="ad-btn" onClick={onClose} style={{padding:"10px 18px",borderRadius:10,border:"1.5px solid #e4ddd0",background:"transparent",color:C.textSub,fontSize:13}}>Cancel</button><button className="ad-btn" onClick={assign} disabled={saving} style={{padding:"10px 22px",borderRadius:10,background:C.dark,color:"#f5f0e8",fontSize:13,fontWeight:600}}>{saving?"Assigning...":"Assign"}</button></div>
    </div>)}
    {tab==="edit"&&(<div>
      <Field label="Title" required><input className="ad-in" value={editF.title} onChange={e=>setEditF(p=>({...p,title:e.target.value}))} maxLength={255}/></Field>
      <Field label="Description"><textarea className="ad-in" rows={3} value={editF.description} onChange={e=>setEditF(p=>({...p,description:e.target.value}))} style={{resize:"vertical"}}/></Field>
      <Row2><Field label="Category"><select className="ad-in" value={editF.category} onChange={e=>setEditF(p=>({...p,category:e.target.value}))}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></Field><Field label="Priority"><select className="ad-in" value={editF.priority} onChange={e=>setEditF(p=>({...p,priority:e.target.value}))}>{PRIORITIES.map(p=><option key={p}>{p}</option>)}</select></Field></Row2>
      <Row2><Field label="Estimated Cost (€)"><input className="ad-in" type="number" min="0" step="0.01" value={editF.estimated_cost} onChange={e=>setEditF(p=>({...p,estimated_cost:e.target.value}))}/></Field><Field label="Actual Cost (€)"><input className="ad-in" type="number" min="0" step="0.01" value={editF.actual_cost} onChange={e=>setEditF(p=>({...p,actual_cost:e.target.value}))}/></Field></Row2>
      <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}><button className="ad-btn" onClick={onClose} style={{padding:"10px 18px",borderRadius:10,border:"1.5px solid #e4ddd0",background:"transparent",color:C.textSub,fontSize:13}}>Cancel</button><button className="ad-btn" onClick={edit} disabled={saving} style={{padding:"10px 22px",borderRadius:10,background:`linear-gradient(135deg,${C.gold},#b0983e)`,color:C.dark,fontSize:13,fontWeight:700}}>{saving?"Saving...":"Save Changes"}</button></div>
    </div>)}
  </Modal>);
}

export default function AdminMaintenance(){
  const [tab,setTab]=useState("all");
  const [items,setItems]=useState([]);
  const [loading,setLoading]=useState(true);
  const [page,setPage]=useState(0);
  const [totalPages,setTotalPages]=useState(0);
  const [statusFilter,setStatusFilter]=useState("OPEN");
  const [priorityFilter,setPriorityFilter]=useState("");
  const [propertySearch,setPropertySearch]=useState("");
  const [selected,setSelected]=useState(null);
  const [toast,setToast]=useState(null);
  const [counts,setCounts]=useState({open:0,inProgress:0,completed:0,urgent:0});
  const notify=useCallback((msg,type="success")=>setToast({msg,type,key:Date.now()}),[]);

  // Load global counts
  useEffect(()=>{
    Promise.all([
      api.get("/api/maintenance?status=OPEN&page=0&size=1"),
      api.get("/api/maintenance?status=IN_PROGRESS&page=0&size=1"),
      api.get("/api/maintenance?status=COMPLETED&page=0&size=1"),
      api.get("/api/maintenance/urgent"),
    ]).then(([o,ip,c,u])=>setCounts({open:o.data.totalElements||0,inProgress:ip.data.totalElements||0,completed:c.data.totalElements||0,urgent:Array.isArray(u.data)?u.data.length:0})).catch(()=>{});
  },[]);

  const fetchAll=useCallback(async()=>{
    setLoading(true);
    try{
      if(tab==="all"){
        const r=await api.get(`/api/maintenance?status=${statusFilter}&page=${page}&size=15`);
        setItems(r.data.content||[]);setTotalPages(r.data.totalPages||0);
      } else if(tab==="urgent"){
        const r=await api.get("/api/maintenance/urgent");setItems(Array.isArray(r.data)?r.data:[]);setTotalPages(1);
      } else if(tab==="property"&&propertySearch){
        const r=await api.get(`/api/maintenance/property/${propertySearch}`);setItems(Array.isArray(r.data)?r.data:[]);setTotalPages(1);
      }
    }catch{notify("Error loading","error")}finally{setLoading(false)}
  },[tab,statusFilter,page,propertySearch,notify]);

  useEffect(()=>{fetchAll()},[fetchAll]);

  const filteredItems = priorityFilter ? items.filter(i=>i.priority===priorityFilter) : items;

  const tabs=[{id:"all",label:"All Requests",icon:"📋"},{id:"urgent",label:"Urgent",icon:"🚨",badge:counts.urgent},{id:"property",label:"By Property",icon:"🏠"}];

  return(<MainLayout role="admin">
    <style>{CSS}</style>
    <div className="ad">
      {/* HERO */}
      <div style={{background:"linear-gradient(160deg,#1a1714 0%,#1e1a14 50%,#241e16 100%)",minHeight:190,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"36px 32px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,.018) 1px,transparent 1px)",backgroundSize:"22px 22px",pointerEvents:"none"}}/>
        <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:`linear-gradient(90deg,transparent,${C.gold} 30%,${C.gold} 70%,transparent)`}}/>
        <div style={{position:"relative",zIndex:1,textAlign:"center"}}>
          <p style={{margin:"0 0 8px",fontSize:10,fontWeight:600,color:C.gold,textTransform:"uppercase",letterSpacing:"2.5px"}}>Admin · Maintenance</p>
          <h1 style={{margin:"0 0 8px",fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"clamp(24px,3vw,38px)",fontWeight:700,color:"#f5f0e8",letterSpacing:"-0.4px"}}>Maintenance <span style={{background:`linear-gradient(90deg,${C.gold},${C.goldL})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Control Center</span></h1>
          <p style={{margin:0,fontSize:13,color:"rgba(245,240,232,.38)"}}>Full oversight — manage, assign and close all maintenance requests across the platform</p>
        </div>
      </div>

      <div style={{padding:"24px 28px",maxWidth:1400,margin:"0 auto"}}>
        {/* KPI Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:14,marginBottom:24}}>
          {[{icon:"📬",label:"Open",value:counts.open,accent:"#2563eb"},{icon:"⚙️",label:"In Progress",value:counts.inProgress,accent:"#d97706"},{icon:"✅",label:"Completed",value:counts.completed,accent:"#059669"},{icon:"🚨",label:"Urgent",value:counts.urgent,accent:"#dc2626"}].map(s=><div key={s.label} className="ad-card" style={{padding:"16px 18px",display:"flex",alignItems:"center",gap:12}}><div style={{width:40,height:40,borderRadius:10,background:`${s.accent}18`,border:`1.5px solid ${s.accent}28`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{s.icon}</div><div><p style={{margin:0,fontSize:10,fontWeight:600,color:C.textMut,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:3}}>{s.label}</p><p style={{margin:0,fontSize:24,fontWeight:700,color:C.text,fontFamily:"'Cormorant Garamond',Georgia,serif",lineHeight:1}}>{s.value}</p></div></div>)}
        </div>

        {/* Urgent Banner */}
        {counts.urgent>0&&tab!=="urgent"&&(<div style={{background:"#fff8f0",border:"1.5px solid #f5c6a0",borderRadius:12,padding:"12px 18px",marginBottom:18,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:20}}>🚨</span>
            <p style={{margin:0,fontSize:13.5,fontWeight:600,color:"#7a3a1a"}}>{counts.urgent} urgent open request{counts.urgent!==1?"s":""} need immediate attention</p>
          </div>
          <button className="ad-btn" onClick={()=>setTab("urgent")} style={{padding:"6px 14px",borderRadius:8,background:"#7a3a1a",color:"#fff",fontSize:12,fontWeight:600}}>View Urgent →</button>
        </div>)}

        {/* Toolbar */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:10}}>
          <div style={{display:"flex",gap:2,borderBottom:`1px solid ${C.border}`}}>
            {tabs.map(t=><button key={t.id} className="ad-btn" onClick={()=>{setTab(t.id);setPage(0)}} style={{padding:"9px 16px",background:"none",color:tab===t.id?C.dark:C.muted,fontWeight:tab===t.id?600:400,fontSize:13.5,borderBottom:tab===t.id?`2px solid ${C.gold}`:"2px solid transparent",marginBottom:-1,display:"flex",alignItems:"center",gap:6}}>{t.icon} {t.label}{t.badge>0&&<span style={{background:"#dc2626",color:"#fff",borderRadius:"50%",width:18,height:18,fontSize:10,display:"inline-flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{t.badge}</span>}</button>)}
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
            {tab==="all"&&<select className="ad-in" value={statusFilter} onChange={e=>{setStatusFilter(e.target.value);setPage(0)}} style={{width:150,height:36,padding:"0 10px",fontSize:13}}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select>}
            {tab==="property"&&(<div style={{display:"flex",gap:6}}><input className="ad-in" type="number" placeholder="Property ID..." value={propertySearch} onChange={e=>setPropertySearch(e.target.value)} style={{width:160,height:36,padding:"0 10px",fontSize:13}}/><button className="ad-btn" onClick={fetchAll} style={{padding:"0 14px",height:36,borderRadius:9,background:C.dark,color:"#f5f0e8",fontSize:13}}>Search</button></div>)}
            <select className="ad-in" value={priorityFilter} onChange={e=>setPriorityFilter(e.target.value)} style={{width:140,height:36,padding:"0 10px",fontSize:13}}><option value="">All Priorities</option>{PRIORITIES.map(p=><option key={p}>{p}</option>)}</select>
          </div>
        </div>

        {/* Table */}
        <div className="ad-card">
          <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.border}`,background:"#fdf9f4",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <p style={{margin:0,fontSize:15,fontWeight:700,color:C.text,fontFamily:"'Cormorant Garamond',Georgia,serif"}}>{tab==="all"?`All Requests — ${statusFilter}`:tab==="urgent"?"Urgent Open Requests":"Requests for Property"}</p>
            {filteredItems.length>0&&<span style={{background:`${C.gold}22`,color:C.textSub,padding:"2px 9px",borderRadius:20,fontSize:11,fontWeight:600}}>{filteredItems.length}</span>}
          </div>
          {loading?<Loader/>:filteredItems.length===0?<Empty icon="🔧" text={tab==="property"&&!propertySearch?"Enter a property ID to search":"No maintenance requests found"}/>:(
            <><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontFamily:"'DM Sans',sans-serif"}}>
              <thead><tr style={{background:"#f5f0e8"}}>{["#","Title","Category","Priority","Status","Property","Requested By","Assigned To","Est. Cost","Created","Actions"].map(h=><th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:10.5,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:"0.7px",whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
              <tbody>{filteredItems.map((item,i)=><tr key={item.id} className="ad-row" style={{borderBottom:i<filteredItems.length-1?`1px solid ${C.border}`:"none",background:item.priority==="URGENT"&&item.status==="OPEN"?"#fff9f9":undefined}}>
                <td style={{padding:"12px 14px",color:C.textMut,fontSize:12}}>{item.id}</td>
                <td style={{padding:"12px 14px",maxWidth:180}}><p style={{margin:0,fontWeight:500,fontSize:13.5,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.title}</p></td>
                <td style={{padding:"12px 14px",fontSize:13,whiteSpace:"nowrap"}}>{CAT_EMOJI[item.category]} {item.category}</td>
                <td style={{padding:"12px 14px"}}><PBadge p={item.priority}/></td>
                <td style={{padding:"12px 14px"}}><SBadge s={item.status}/></td>
                <td style={{padding:"12px 14px"}}><span style={{background:"#eef2ff",color:"#6366f1",padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:500}}>#{item.property_id}</span></td>
                <td style={{padding:"12px 14px",fontSize:12.5,color:C.textSub}}>{item.requested_by?`#${item.requested_by}`:"—"}</td>
                <td style={{padding:"12px 14px",fontSize:12.5,color:item.assigned_to?C.textSub:C.textMut,fontStyle:item.assigned_to?"normal":"italic"}}>{item.assigned_to?`User #${item.assigned_to}`:"Unassigned"}</td>
                <td style={{padding:"12px 14px",fontSize:12.5,color:C.textSub}}>{fmtMoney(item.estimated_cost)}</td>
                <td style={{padding:"12px 14px",fontSize:12,color:C.textMut,whiteSpace:"nowrap"}}>{fmtDate(item.created_at)}</td>
                <td style={{padding:"12px 14px"}}><button className="ad-btn" onClick={()=>setSelected(item)} style={{padding:"5px 13px",borderRadius:8,background:C.dark,color:"#f5f0e8",fontSize:11.5,fontWeight:500}}>Manage</button></td>
              </tr>)}</tbody>
            </table></div><Pager page={page} totalPages={totalPages} onChange={setPage}/></>
          )}
        </div>
      </div>

      {selected&&<AdminDetailModal item={selected} onClose={()=>setSelected(null)} onRefresh={fetchAll} notify={notify}/>}
      {toast&&<Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}
    </div>
  </MainLayout>);
}