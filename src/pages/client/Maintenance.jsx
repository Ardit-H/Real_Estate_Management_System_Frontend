import { useState, useEffect, useCallback } from "react";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";
import { CSS, C, CAT_EMOJI, STA_CFG, PRI_CFG, fmtMoney, fmtRel } from "../../components/client/maintenance/maintenanceHelpers";
import { Toast, Loader, Empty, PBadge, SBadge, Pager } from "../../components/client/maintenance/MaintenanceBadges";
import CreateModal from "../../components/client/maintenance/CreateMaintenanceModal";
import ClientDetailModal from "../../components/client/maintenance/ClientDetailModal";

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