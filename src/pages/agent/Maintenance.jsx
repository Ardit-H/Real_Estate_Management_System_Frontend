import { useState, useEffect, useCallback } from "react";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";
import { CSS, C, CAT_EMOJI, fmtDate } from "../../components/agent/maintenance/maintenanceHelpers";
import { Toast, Loader, Empty, PBadge, SBadge, Pager } from "../../components/agent/maintenance/MaintenanceBadges";
import CreateModal from "../../components/agent/maintenance/CreateMaintenanceModal";
import DetailModal from "../../components/agent/maintenance/DetailMaintenanceModal";

export default function AgentMaintenance(){
  const [tab,setTab]=useState("all");
  const [items,setItems]=useState([]);
  const [loading,setLoading]=useState(true);
  const [page,setPage]=useState(0);
  const [totalPages,setTotalPages]=useState(0);
  const [statusFilter,setStatusFilter]=useState("OPEN");
  const [createOpen,setCreateOpen]=useState(false);
  const [selected,setSelected]=useState(null);
  const [toast,setToast]=useState(null);
  const [urgentCount,setUrgentCount]=useState(0);
  const notify=useCallback((msg,type="success")=>setToast({msg,type,key:Date.now()}),[]);

  const fetchAll=useCallback(async()=>{
    setLoading(true);
    try{
      if(tab==="all"){const r=await api.get(`/api/maintenance?status=${statusFilter}&page=${page}&size=12`);setItems(r.data.content||[]);setTotalPages(r.data.totalPages||0)}
      else if(tab==="assigned"){const r=await api.get(`/api/maintenance/assigned?page=${page}&size=12`);setItems(r.data.content||[]);setTotalPages(r.data.totalPages||0)}
      else{const r=await api.get("/api/maintenance/urgent");setItems(Array.isArray(r.data)?r.data:[]);setTotalPages(1)}
    }catch{notify("Error loading","error")}finally{setLoading(false)}
  },[tab,statusFilter,page,notify]);

  useEffect(()=>{api.get("/api/maintenance/urgent").then(r=>setUrgentCount(Array.isArray(r.data)?r.data.length:0)).catch(()=>{})},[]);
  useEffect(()=>{fetchAll()},[fetchAll]);

  const stats=[{icon:"📬",label:"Open",value:items.filter(i=>i.status==="OPEN").length,accent:"#2563eb"},{icon:"⚙️",label:"In Progress",value:items.filter(i=>i.status==="IN_PROGRESS").length,accent:"#d97706"},{icon:"✅",label:"Completed",value:items.filter(i=>i.status==="COMPLETED").length,accent:"#059669"},{icon:"🚨",label:"Urgent Open",value:urgentCount,accent:"#dc2626"}];
  const tabs=[{id:"all",label:"All Requests",icon:"🔧"},{id:"assigned",label:"Assigned to Me",icon:"👤"},{id:"urgent",label:"Urgent",icon:"🚨",badge:urgentCount}];

  return(<MainLayout role="agent">
    <style>{CSS}</style>
    <div className="mn">
      {/* HERO */}
      <div style={{background:"linear-gradient(160deg,#1a1714 0%,#1e1a14 50%,#241e16 100%)",minHeight:180,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"36px 32px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,.018) 1px,transparent 1px)",backgroundSize:"22px 22px",pointerEvents:"none"}}/>
        <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:`linear-gradient(90deg,transparent,${C.gold} 30%,${C.gold} 70%,transparent)`}}/>
        <div style={{position:"relative",zIndex:1,textAlign:"center"}}>
          <p style={{margin:"0 0 8px",fontSize:10,fontWeight:600,color:C.gold,textTransform:"uppercase",letterSpacing:"2.5px"}}>Agent · Maintenance</p>
          <h1 style={{margin:"0 0 8px",fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"clamp(24px,3vw,36px)",fontWeight:700,color:"#f5f0e8",letterSpacing:"-0.4px"}}>Maintenance <span style={{background:`linear-gradient(90deg,${C.gold},${C.goldL})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Requests</span></h1>
          <p style={{margin:0,fontSize:13,color:"rgba(245,240,232,.38)"}}>Manage, assign and track maintenance work across all properties</p>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{padding:"24px 28px",maxWidth:1400,margin:"0 auto"}}>
        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:14,marginBottom:24}}>
          {stats.map(s=><div key={s.label} className="mn-card" style={{padding:"16px 18px",display:"flex",alignItems:"center",gap:12}}><div style={{width:40,height:40,borderRadius:10,background:`${s.accent}18`,border:`1.5px solid ${s.accent}28`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{s.icon}</div><div><p style={{margin:0,fontSize:10,fontWeight:600,color:C.textMut,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:3}}>{s.label}</p><p style={{margin:0,fontSize:24,fontWeight:700,color:C.text,fontFamily:"'Cormorant Garamond',Georgia,serif",lineHeight:1}}>{s.value}</p></div></div>)}
        </div>

        {/* Toolbar */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:10}}>
          <div style={{display:"flex",gap:2,borderBottom:`1px solid ${C.border}`}}>
            {tabs.map(t=><button key={t.id} className="mn-btn" onClick={()=>{setTab(t.id);setPage(0)}} style={{padding:"9px 16px",background:"none",color:tab===t.id?C.dark:C.muted,fontWeight:tab===t.id?600:400,fontSize:13.5,borderBottom:tab===t.id?`2px solid ${C.gold}`:"2px solid transparent",marginBottom:-1,display:"flex",alignItems:"center",gap:6}}>{t.icon} {t.label}{t.badge>0&&<span style={{background:"#dc2626",color:"#fff",borderRadius:"50%",width:18,height:18,fontSize:10,display:"inline-flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{t.badge}</span>}</button>)}
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {tab==="all"&&<select className="mn-in" value={statusFilter} onChange={e=>{setStatusFilter(e.target.value);setPage(0)}} style={{width:150,height:36,padding:"0 10px",fontSize:13}}>{["OPEN","IN_PROGRESS","COMPLETED","CANCELLED"].map(s=><option key={s}>{s}</option>)}</select>}
            <button className="mn-btn" onClick={()=>setCreateOpen(true)} style={{padding:"8px 18px",borderRadius:10,background:`linear-gradient(135deg,${C.gold},#b0983e)`,color:C.dark,fontSize:13,fontWeight:700}}>+ New Request</button>
          </div>
        </div>

        {/* Table Card */}
        <div className="mn-card">
          <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.border}`,background:"#fdf9f4",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <p style={{margin:0,fontSize:15,fontWeight:700,color:C.text,fontFamily:"'Cormorant Garamond',Georgia,serif"}}>{tab==="all"?`All Requests — ${statusFilter}`:tab==="assigned"?"Assigned to Me":"Urgent Open"}</p>
            {items.length>0&&<span style={{background:`${C.gold}22`,color:C.textSub,padding:"2px 9px",borderRadius:20,fontSize:11,fontWeight:600}}>{items.length}</span>}
          </div>
          {loading?<Loader/>:items.length===0?<Empty icon="🔧" text="No maintenance requests found"/>:(
            <><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontFamily:"'DM Sans',sans-serif"}}>
              <thead><tr style={{background:"#f5f0e8"}}>{["#","Title","Category","Priority","Status","Property","Assigned To","Created","Actions"].map(h=><th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:10.5,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:"0.7px",whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
              <tbody>{items.map((item,i)=><tr key={item.id} className="mn-row" style={{borderBottom:i<items.length-1?`1px solid ${C.border}`:"none"}}>
                <td style={{padding:"12px 14px",color:C.textMut,fontSize:12}}>{item.id}</td>
                <td style={{padding:"12px 14px",maxWidth:200}}><p style={{margin:0,fontWeight:500,fontSize:13.5,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.title}</p></td>
                <td style={{padding:"12px 14px",fontSize:13}}>{CAT_EMOJI[item.category]} {item.category}</td>
                <td style={{padding:"12px 14px"}}><PBadge p={item.priority}/></td>
                <td style={{padding:"12px 14px"}}><SBadge s={item.status}/></td>
                <td style={{padding:"12px 14px"}}><span style={{background:"#eef2ff",color:"#6366f1",padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:500}}>#{item.property_id}</span></td>
                <td style={{padding:"12px 14px",fontSize:12.5,color:C.textSub}}>{item.assigned_to?`User #${item.assigned_to}`:<span style={{color:C.textMut,fontStyle:"italic"}}>Unassigned</span>}</td>
                <td style={{padding:"12px 14px",fontSize:12,color:C.textMut,whiteSpace:"nowrap"}}>{fmtDate(item.created_at)}</td>
                <td style={{padding:"12px 14px"}}><button className="mn-btn" onClick={()=>setSelected(item)} style={{padding:"5px 13px",borderRadius:8,background:C.dark,color:"#f5f0e8",fontSize:11.5,fontWeight:500}}>Manage</button></td>
               </tr>)}</tbody>
             </table></div><Pager page={page} totalPages={totalPages} onChange={setPage}/></>
          )}
        </div>
      </div>

      {createOpen&&<CreateModal onClose={()=>setCreateOpen(false)} onSuccess={()=>{setCreateOpen(false);fetchAll();notify("Request created ✓")}} notify={notify}/>}
      {selected&&<DetailModal item={selected} onClose={()=>setSelected(null)} onRefresh={fetchAll} notify={notify}/>}
      {toast&&<Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}
    </div>
  </MainLayout>);
}