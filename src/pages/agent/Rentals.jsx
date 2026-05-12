import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";
 
// ── Constants (pa ndryshim) ───────────────────────────────────────────────────
const LISTING_STATUSES = ["ACTIVE","INACTIVE","EXPIRED","RENTED"];
const PRICE_PERIODS    = ["DAILY","WEEKLY","MONTHLY","YEARLY"];
const CURRENCIES       = ["EUR","USD","ALL"];
 
// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtPrice = (v, cur="EUR", period="MONTHLY") => v != null ? `€${Number(v).toLocaleString("de-DE")} / ${period.toLowerCase()}` : "—";
const fmtDate  = (d) => d ? new Date(d).toLocaleDateString("sq-AL") : "—";
const fmtMoney = (v) => v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";
 
function validateListingForm(form, notify) {
  if (!form.property_id||isNaN(Number(form.property_id))||Number(form.property_id)<=0){notify("Property ID duhet të jetë numër pozitiv","error");return false;}
  if (!form.price||isNaN(Number(form.price))||Number(form.price)<=0){notify("Çmimi duhet të jetë më i madh se 0","error");return false;}
  if (Number(form.price)>999999999){notify("Çmimi është shumë i madh","error");return false;}
  if (form.deposit&&(isNaN(Number(form.deposit))||Number(form.deposit)<0)){notify("Depozita nuk mund të jetë negative","error");return false;}
  if (form.min_lease_months&&Number(form.min_lease_months)<1){notify("Minimumi i muajve duhet të jetë së paku 1","error");return false;}
  if (form.min_lease_months&&Number(form.min_lease_months)>120){notify("Minimumi i muajve nuk mund të kalojë 120","error");return false;}
  if (form.available_from&&form.available_until&&new Date(form.available_until)<=new Date(form.available_from)){notify("Data 'deri' duhet të jetë pas datës 'nga'","error");return false;}
  if (form.title&&form.title.length>255){notify("Titulli nuk mund të kalojë 255 karaktere","error");return false;}
  if (form.description&&form.description.length>2000){notify("Përshkrimi nuk mund të kalojë 2000 karaktere","error");return false;}
  return true;
}
 
// ── Design ────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
  .ar * { box-sizing: border-box; }
  .ar { font-family: 'DM Sans', system-ui, sans-serif; background: #f2ede4; min-height: 100vh; }
  .ar-btn { transition: all 0.17s ease; }
  .ar-btn:hover:not(:disabled) { opacity: 0.86; transform: translateY(-1px); }
  .ar-in:focus { border-color: #8a7d5e !important; box-shadow: 0 0 0 3px rgba(138,125,94,0.13) !important; outline: none; }
  @keyframes ar-scale-in { from{opacity:0;transform:scale(0.95) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes ar-spin      { to{transform:rotate(360deg)} }
  @keyframes ar-toast     { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes ar-glow      { 0%,100%{opacity:0.07} 50%{opacity:0.14} }
`;
 
const STATUS_CFG = {
  ACTIVE:   { bg:"rgba(126,184,164,0.12)", color:"#2a6049",  border:"rgba(126,184,164,0.25)" },
  INACTIVE: { bg:"#f0ece3",                color:"#6b6248",  border:"#e0d8c8" },
  EXPIRED:  { bg:"rgba(201,184,122,0.1)",  color:"#a8923e",  border:"rgba(201,184,122,0.22)" },
  RENTED:   { bg:"rgba(201,184,122,0.12)", color:"#8a7230",  border:"rgba(201,184,122,0.25)" },
  PENDING:  { bg:"rgba(201,184,122,0.1)",  color:"#a8923e",  border:"rgba(201,184,122,0.2)"  },
  APPROVED: { bg:"rgba(126,184,164,0.12)", color:"#2a6049",  border:"rgba(126,184,164,0.25)" },
  REJECTED: { bg:"rgba(212,133,90,0.1)",   color:"#8b4013",  border:"rgba(212,133,90,0.2)"   },
  CANCELLED:{ bg:"#f0ece3",                color:"#6b6248",  border:"#e0d8c8" },
};
 
function StatusBadge({ status }) {
  const s = STATUS_CFG[status]||{ bg:"#f0ece3", color:"#6b6248", border:"#e0d8c8" };
  return <span style={{background:s.bg,color:s.color,border:`1px solid ${s.border}`,padding:"3px 11px",borderRadius:999,fontSize:10.5,fontWeight:700,letterSpacing:"0.3px",textTransform:"uppercase"}}>{status}</span>;
}
 
const INP_S = {width:"100%",padding:"10px 13px",border:"1.5px solid #e4ddd0",borderRadius:10,fontSize:13.5,color:"#1a1714",background:"#fff",fontFamily:"'DM Sans',sans-serif",boxSizing:"border-box",outline:"none",transition:"border-color 0.2s"};
const SEL_S = {...INP_S,cursor:"pointer"};
const BTN_PRI = {padding:"10px 22px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#c9b87a,#b0983e)",color:"#1a1714",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"};
const BTN_SEC = {padding:"10px 18px",borderRadius:10,border:"1.5px solid #e4ddd0",background:"transparent",color:"#6b6248",fontWeight:500,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"};
const PGB=(active,disabled)=>({padding:"6px 14px",borderRadius:9,border:`1.5px solid ${active?"#1a1714":"#e4ddd0"}`,background:active?"#1a1714":"transparent",color:active?"#f5f0e8":disabled?"#d4ccbe":"#6b6248",cursor:disabled?"not-allowed":"pointer",fontSize:12.5,fontFamily:"'DM Sans',sans-serif",opacity:disabled?0.5:1,transition:"all 0.14s"});
 
function Toast({ msg, type="success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return <div style={{position:"fixed",bottom:26,right:26,zIndex:9999,background:"#1a1714",color:type==="error"?"#f09090":"#90c8a8",padding:"11px 18px",borderRadius:12,fontSize:13,boxShadow:"0 10px 36px rgba(0,0,0,0.32)",border:`1px solid ${type==="error"?"rgba(240,128,128,0.15)":"rgba(144,200,168,0.15)"}`,maxWidth:320,fontFamily:"'DM Sans',sans-serif",animation:"ar-toast 0.2s ease",display:"flex",alignItems:"center",gap:8}}><span>{type==="error"?"⚠️":"✅"}</span>{msg}</div>;
}
 
function Loader() {
  return <div style={{textAlign:"center",padding:"48px 0"}}><div style={{width:26,height:26,margin:"0 auto",border:"2px solid #e8e2d6",borderTop:"2px solid #c9b87a",borderRadius:"50%",animation:"ar-spin 0.8s linear infinite"}}/></div>;
}
 
function EmptyState({ icon, text }) {
  return <div style={{textAlign:"center",padding:"52px 20px",color:"#b0a890",fontFamily:"'DM Sans',sans-serif"}}><div style={{fontSize:32,marginBottom:10}}>{icon}</div><p style={{fontSize:14}}>{text}</p></div>;
}
 
function Pagination({ page, totalPages, onChange }) {
  if (totalPages<=1) return null;
  return <div style={{display:"flex",alignItems:"center",gap:6,justifyContent:"flex-end",padding:"14px 16px"}}><button disabled={page===0} onClick={()=>onChange(page-1)} style={PGB(false,page===0)}>← Prev</button><span style={{fontSize:13,color:"#9a8c6e",padding:"0 8px"}}>{page+1} / {totalPages}</span><button disabled={page>=totalPages-1} onClick={()=>onChange(page+1)} style={PGB(false,page>=totalPages-1)}>Next →</button></div>;
}
 
function Field({ label, children, required, hint }) {
  return (
    <div style={{marginBottom:14}}>
      <label style={{display:"block",fontSize:10.5,fontWeight:600,color:"#9a8c6e",textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:6,fontFamily:"'DM Sans',sans-serif"}}>{label}{required&&<span style={{color:"#c0392b",marginLeft:2}}>*</span>}</label>
      {children}
      {hint&&<p style={{fontSize:11.5,color:"#b0a890",marginTop:4}}>{hint}</p>}
    </div>
  );
}
 
function Row2({ children }) { return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>{children}</div>; }
 
function Modal({ title, onClose, children, wide=false }) {
  useEffect(() => {
    const h = e => e.key==="Escape"&&onClose();
    window.addEventListener("keydown",h);
    document.body.style.overflow="hidden";
    return () => { window.removeEventListener("keydown",h); document.body.style.overflow=""; };
  }, [onClose]);
  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(8,6,4,0.84)",backdropFilter:"blur(14px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{width:"100%",maxWidth:wide?700:520,background:"#faf7f2",borderRadius:18,boxShadow:"0 44px 100px rgba(0,0,0,0.55)",maxHeight:"92vh",overflowY:"auto",animation:"ar-scale-in 0.26s ease"}}>
        <div style={{background:"linear-gradient(160deg,#141210 0%,#1e1a14 45%,#241e16 100%)",padding:"18px 24px",borderBottom:"1px solid rgba(201,184,122,0.14)",display:"flex",alignItems:"center",justifyContent:"space-between",position:"relative",borderRadius:"18px 18px 0 0"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:"linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)",borderRadius:"18px 18px 0 0"}}/>
          <span style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontWeight:700,fontSize:17,color:"#f5f0e8"}}>{title}</span>
          <button onClick={onClose} style={{background:"rgba(245,240,232,0.08)",border:"1px solid rgba(245,240,232,0.12)",borderRadius:8,width:30,height:30,cursor:"pointer",color:"rgba(245,240,232,0.6)",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
        <div style={{padding:"22px 24px"}}>{children}</div>
      </div>
    </div>
  );
}
 
// ── Listing Form Modal (logjika identike) ─────────────────────────────────────
function ListingModal({ initial, onClose, onSuccess, notify }) {
  const [form,setForm]=useState({property_id:initial?.property_id??"",title:initial?.title??"",description:initial?.description??"",available_from:initial?.available_from??"",available_until:initial?.available_until??"",price:initial?.price??"",currency:initial?.currency??"EUR",deposit:initial?.deposit??"",price_period:initial?.price_period??"MONTHLY",min_lease_months:initial?.min_lease_months??12,status:initial?.status??"ACTIVE"});
  const [saving,setSaving]=useState(false);
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  const handleSubmit=async()=>{
    if(!validateListingForm(form,notify))return;
    setSaving(true);
    try{
      const payload={property_id:Number(form.property_id),title:form.title.trim()||null,description:form.description||null,available_from:form.available_from||null,available_until:form.available_until||null,price:Number(form.price),currency:form.currency,deposit:form.deposit?Number(form.deposit):null,price_period:form.price_period,min_lease_months:Number(form.min_lease_months),...(initial&&{status:form.status})};
      initial?await api.put(`/api/rentals/listings/${initial.id}`,payload):await api.post("/api/rentals/listings",payload);
      onSuccess();
    }catch(err){notify(err.response?.data?.message||"Gabim gjatë ruajtjes","error");}
    finally{setSaving(false);}
  };
  return (
    <Modal title={initial?`Edit Listing #${initial.id}`:"New Rental Listing"} onClose={onClose} wide>
      <Row2>
        <Field label="Property ID" required hint="ID numerike e pronës"><input className="ar-in" style={INP_S} type="number" min="1" value={form.property_id} onChange={e=>set("property_id",e.target.value)} disabled={!!initial} placeholder="42"/></Field>
        <Field label="Titull"><input className="ar-in" style={INP_S} value={form.title} onChange={e=>set("title",e.target.value)} placeholder="2BR Apartment" maxLength={255}/></Field>
      </Row2>
      <Row2>
        <Field label="Çmimi" required hint="Duhet të jetë > 0"><input className="ar-in" style={INP_S} type="number" min="1" step="0.01" value={form.price} onChange={e=>set("price",e.target.value)} placeholder="450"/></Field>
        <Field label="Periudha"><select className="ar-in" style={SEL_S} value={form.price_period} onChange={e=>set("price_period",e.target.value)}>{PRICE_PERIODS.map(p=><option key={p}>{p}</option>)}</select></Field>
      </Row2>
      <Row2>
        <Field label="Depozita" hint="Opcionale"><input className="ar-in" style={INP_S} type="number" min="0" step="0.01" value={form.deposit} onChange={e=>set("deposit",e.target.value)} placeholder="900"/></Field>
        <Field label="Monedha"><select className="ar-in" style={SEL_S} value={form.currency} onChange={e=>set("currency",e.target.value)}>{CURRENCIES.map(c=><option key={c}>{c}</option>)}</select></Field>
      </Row2>
      <Row2>
        <Field label="Disponueshëm nga"><input className="ar-in" style={INP_S} type="date" value={form.available_from} onChange={e=>set("available_from",e.target.value)}/></Field>
        <Field label="Disponueshëm deri"><input className="ar-in" style={INP_S} type="date" value={form.available_until} onChange={e=>set("available_until",e.target.value)} min={form.available_from||undefined}/></Field>
      </Row2>
      <Row2>
        <Field label="Min. muaj qira" hint="1—120 muaj"><input className="ar-in" style={INP_S} type="number" min="1" max="120" value={form.min_lease_months} onChange={e=>set("min_lease_months",e.target.value)}/></Field>
        {initial&&<Field label="Statusi"><select className="ar-in" style={SEL_S} value={form.status} onChange={e=>set("status",e.target.value)}>{LISTING_STATUSES.map(s=><option key={s}>{s}</option>)}</select></Field>}
      </Row2>
      <Field label="Përshkrim" hint="Max 2000 karaktere">
        <textarea className="ar-in" value={form.description} onChange={e=>set("description",e.target.value)} rows={3} placeholder="Përshkrim i apartamentit..." maxLength={2000} style={{...INP_S,resize:"vertical"}}/>
        <p style={{fontSize:11,color:"#b0a890",textAlign:"right",marginTop:2}}>{form.description.length}/2000</p>
      </Field>
      <div style={{display:"flex",justifyContent:"flex-end",gap:9,marginTop:6}}>
        <button style={BTN_SEC} onClick={onClose}>Anulo</button>
        <button style={BTN_PRI} onClick={handleSubmit} disabled={saving}>{saving?"Duke ruajtur...":initial?"Ruaj ndryshimet":"Krijo listing"}</button>
      </div>
    </Modal>
  );
}
 
// ── Applications Panel (logjika identike) ─────────────────────────────────────
function ApplicationsPanel({ listing, onClose, notify }) {
  const navigate = useNavigate();
  const [apps,setApps]=useState([]);
  const [loading,setLoading]=useState(true);
  const [reviewing,setReviewing]=useState(null);
 
  useEffect(() => {
    (async()=>{
      setLoading(true);
      try{const res=await api.get(`/api/rentals/applications/listing/${listing.id}`);setApps(res.data||[]);}
      catch{notify("Gabim gjatë ngarkimit","error");}
      finally{setLoading(false);}
    })();
  }, [listing.id, notify]);
 
  const handleReview=async(appId,status,reason=null)=>{
    try{
      await api.patch(`/api/rentals/applications/${appId}/review`,{status,rejection_reason:reason});
      setApps(prev=>prev.map(a=>a.id===appId?{...a,status}:a));
      notify(`Aplikimi #${appId} → ${status}`);setReviewing(null);
    }catch(err){notify(err.response?.data?.message||"Gabim","error");}
  };
 
  const goToCreateContract=(app)=>{
    navigate("/agent/contracts",{state:{fromPropertyId:String(listing.property_id),fromListingId:String(listing.id),fromClientId:String(app.client_id)}});
  };
 
  return (
    <Modal title={`Aplikimet — Listing #${listing.id}`} onClose={onClose} wide>
      {loading?<Loader/>:apps.length===0?<EmptyState icon="📭" text="Nuk ka aplikime për këtë listing"/>:(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {apps.map(app=>{
            const s=STATUS_CFG[app.status]||STATUS_CFG.CANCELLED;
            return(
              <div key={app.id} style={{background:"#fff",border:"1.5px solid #e8e2d6",borderRadius:12,padding:"14px 16px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                  <div>
                    <p style={{fontWeight:600,fontSize:14,marginBottom:3,color:"#1a1714",fontFamily:"'Cormorant Garamond',Georgia,serif"}}>Aplikim #{app.id} — Client #{app.client_id}</p>
                    <p style={{fontSize:12,color:"#9a8c6e",margin:0}}>{new Date(app.created_at).toLocaleDateString("sq-AL")}{app.income&&` · Të ardhura: €${Number(app.income).toLocaleString()}`}{app.move_in_date&&` · Move-in: ${fmtDate(app.move_in_date)}`}</p>
                  </div>
                  <StatusBadge status={app.status}/>
                </div>
                {app.message&&<p style={{fontSize:13,color:"#6b6248",marginBottom:10,fontStyle:"italic",fontFamily:"'Cormorant Garamond',Georgia,serif"}}>"{app.message}"</p>}
                {app.status==="APPROVED"&&(
                  <div style={{background:"rgba(201,184,122,0.07)",border:"1.5px solid rgba(201,184,122,0.2)",borderRadius:10,padding:"10px 14px",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div>
                      <span style={{fontSize:13,color:"#c9b87a",fontWeight:500}}>✓ Aprovuar — gati për kontratë</span>
                      <p style={{fontSize:11.5,color:"#8a7230",marginTop:2}}>Client #{app.client_id} · Listing #{listing.id} · Property #{listing.property_id}</p>
                    </div>
                    <button className="ar-btn" onClick={() => goToCreateContract(app)} style={{...BTN_PRI,padding:"7px 14px",fontSize:12}}>📋 Krijo Kontratë →</button>
                  </div>
                )}
                {app.status==="PENDING"&&(
                  <div style={{display:"flex",gap:8}}>
                    <button className="ar-btn" onClick={() => handleReview(app.id,"APPROVED")} style={{padding:"6px 14px",borderRadius:9,border:"1.5px solid rgba(126,184,164,0.3)",background:"rgba(126,184,164,0.1)",color:"#2a6049",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>✓ Aprovo</button>
                    <button className="ar-btn" onClick={() => setReviewing(app)} style={{padding:"6px 14px",borderRadius:9,border:"1.5px solid rgba(212,133,90,0.3)",background:"rgba(212,133,90,0.08)",color:"#8b4013",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>✕ Refuzo</button>
                  </div>
                )}
                {app.rejection_reason&&<p style={{fontSize:12,color:"#8b4013",marginTop:6}}>Arsyeja: {app.rejection_reason}</p>}
              </div>
            );
          })}
        </div>
      )}
      {reviewing&&<RejectDialog app={reviewing} onConfirm={reason=>handleReview(reviewing.id,"REJECTED",reason)} onClose={()=>setReviewing(null)}/>}
    </Modal>
  );
}
 
function RejectDialog({ app, onConfirm, onClose }) {
  const [reason,setReason]=useState("");
  return (
    <div style={{position:"fixed",inset:0,zIndex:2000,background:"rgba(8,6,4,0.7)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"#faf7f2",borderRadius:14,padding:24,maxWidth:420,width:"100%",boxShadow:"0 24px 64px rgba(0,0,0,0.4)"}}>
        <h3 style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontWeight:700,fontSize:17,marginBottom:14,color:"#1a1714"}}>Refuzo aplikimin #{app.id}</h3>
        <div style={{marginBottom:14}}>
          <label style={{display:"block",fontSize:10.5,fontWeight:600,color:"#9a8c6e",textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:6}}>Arsyeja e refuzimit</label>
          <textarea value={reason} onChange={e=>setReason(e.target.value)} rows={3} placeholder="Shkruaj arsyen..." maxLength={500} style={{...INP_S,resize:"vertical"}}/>
          <p style={{fontSize:11,color:"#b0a890",textAlign:"right",marginTop:2}}>{reason.length}/500</p>
        </div>
        <div style={{display:"flex",gap:9,justifyContent:"flex-end"}}>
          <button style={BTN_SEC} onClick={onClose}>Anulo</button>
          <button style={{...BTN_PRI,background:"#8b3a1c"}} onClick={() => onConfirm(reason||null)}>Konfirmo refuzimin</button>
        </div>
      </div>
    </div>
  );
}
 
// ═════════════════════════════════════════════════════════════════════════════
export default function AgentRentals() {
  const [listings,setListings]=useState([]);
  const [loading,setLoading]=useState(true);
  const [page,setPage]=useState(0);
  const [totalPages,setTotalPages]=useState(0);
  const [modalOpen,setModalOpen]=useState(false);
  const [editTarget,setEditTarget]=useState(null);
  const [deleteId,setDeleteId]=useState(null);
  const [appsTarget,setAppsTarget]=useState(null);
  const [toast,setToast]=useState(null);
 
  const notify=useCallback((msg,type="success")=>setToast({msg,type,key:Date.now()}),[]);
 
  const fetchListings=useCallback(async()=>{
    setLoading(true);
    try{const res=await api.get(`/api/rentals/listings?page=${page}&size=12&sortBy=createdAt&sortDir=desc`);setListings(res.data.content||[]);setTotalPages(res.data.totalPages||0);}
    catch{notify("Gabim gjatë ngarkimit","error");}
    finally{setLoading(false);}
  },[page,notify]);
 
  useEffect(()=>{fetchListings();},[fetchListings]);
 
  const handleDelete=async()=>{
    try{await api.delete(`/api/rentals/listings/${deleteId}`);notify("Listing u fshi me sukses");setDeleteId(null);fetchListings();}
    catch(err){notify(err.response?.data?.message||"Gabim gjatë fshirjes","error");}
  };
 
  return (
    <MainLayout role="agent">
      <style>{CSS}</style>
      <div className="ar">
 
        {/* ── Hero ── */}
        <div style={{background:"linear-gradient(160deg,#141210 0%,#1e1a14 45%,#241e16 100%)",minHeight:260,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"36px 32px",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,0.018) 1px,transparent 1px)",backgroundSize:"22px 22px",pointerEvents:"none"}}/>
          <div style={{position:"absolute",top:"-60px",left:"10%",width:260,height:260,borderRadius:"50%",background:"radial-gradient(circle,rgba(126,184,164,0.07) 0%,transparent 70%)",pointerEvents:"none",animation:"ar-glow 4s ease-in-out infinite"}}/>
          <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:"linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)"}}/>
          <div style={{position:"relative",zIndex:1,maxWidth:700,width:"100%",textAlign:"center"}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(126,184,164,0.1)",border:"1px solid rgba(126,184,164,0.2)",borderRadius:999,padding:"4px 14px",marginBottom:14}}>
              <span style={{width:5,height:5,borderRadius:"50%",background:"#7eb8a4",display:"inline-block"}}/>
              <span style={{fontSize:10.5,fontWeight:600,color:"#7eb8a4",letterSpacing:"1.2px",textTransform:"uppercase"}}>Rental Management</span>
            </div>
            <h1 style={{margin:"0 0 10px",fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"clamp(26px,4vw,42px)",fontWeight:700,color:"#f5f0e8",letterSpacing:"-0.7px"}}>
              Rental{" "}
              <span style={{background:"linear-gradient(90deg,#7eb8a4,#a4d4c0,#7eb8a4)",backgroundSize:"200% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Listings</span>
            </h1>
            <p style={{margin:"0 auto 22px",fontSize:13.5,color:"rgba(245,240,232,0.38)"}}>Menaxho listat e qirasë dhe aplikimet e klientëve</p>
            <button className="ar-btn" onClick={() => { setEditTarget(null); setModalOpen(true); }}
              style={{display:"inline-flex",alignItems:"center",gap:8,background:"linear-gradient(135deg,#c9b87a,#b0983e)",color:"#1a1714",border:"none",borderRadius:11,padding:"11px 24px",fontSize:13.5,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 6px 22px rgba(201,184,122,0.2)"}}>
              + New Listing
            </button>
            {!loading&&listings.length>0&&(
              <div style={{marginTop:18}}>
                <span style={{background:"rgba(245,240,232,0.06)",backdropFilter:"blur(10px)",borderRadius:12,padding:"8px 16px",border:"1px solid rgba(245,240,232,0.09)",fontSize:13,color:"rgba(245,240,232,0.5)",fontFamily:"'DM Sans',sans-serif"}}>
                  {listings.length} listings
                </span>
              </div>
            )}
          </div>
        </div>
 
        {/* ── Toolbar ── */}
        <div style={{background:"#fff",borderBottom:"1.5px solid #e8e2d6",padding:"0 28px",height:46,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,fontFamily:"'DM Sans',sans-serif",position:"sticky",top:0,zIndex:100,boxShadow:"0 1px 10px rgba(20,16,10,0.05)"}}>
          <p style={{margin:0,fontSize:12.5,color:"#9a8c6e"}}>{loading?"Loading…":`${listings.length} listings`}</p>
          <button className="ar-btn" onClick={() => { setEditTarget(null); setModalOpen(true); }}
            style={{...BTN_PRI,padding:"5px 14px",fontSize:12}}>+ New Listing</button>
        </div>
 
        {/* ── Content ── */}
        <div style={{padding:"20px 24px",maxWidth:1440,margin:"0 auto"}}>
          <div style={{background:"#fff",borderRadius:14,border:"1.5px solid #ece6da",boxShadow:"0 2px 16px rgba(20,16,10,0.07)",overflow:"hidden"}}>
            <div style={{padding:"14px 20px",borderBottom:"1.5px solid #e8e2d6",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontWeight:700,fontSize:17,color:"#1a1714"}}>Të gjitha Rental Listings</span>
              {listings.length>0&&<span style={{background:"rgba(201,184,122,0.1)",color:"#c9b87a",border:"1px solid rgba(201,184,122,0.22)",borderRadius:999,padding:"2px 10px",fontSize:10.5,fontWeight:700}}>{listings.length} listings</span>}
            </div>
 
            {loading?<Loader/>:listings.length===0?<EmptyState icon="🔑" text="Nuk ka rental listings. Krijo listingun e parë."/>:(
              <>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead>
                      <tr style={{background:"#faf7f2"}}>
                        {["#","Titull / Property","Çmimi","Depozita","Disponueshëm","Min. muaj","Statusi","Veprime"].map(h=>(
                          <th key={h} style={{textAlign:"left",fontSize:10.5,fontWeight:600,color:"#b0a890",textTransform:"uppercase",letterSpacing:"0.8px",padding:"10px 16px",borderBottom:"1.5px solid #e8e2d6",whiteSpace:"nowrap"}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {listings.map(l=>(
                        <tr key={l.id} style={{borderBottom:"1px solid #f0ece3",transition:"background 0.12s"}} onMouseEnter={e=>e.currentTarget.style.background="#faf7f2"} onMouseLeave={e=>e.currentTarget.style.background=""}>
                          <td style={{padding:"12px 16px",color:"#b0a890",fontSize:12}}>{l.id}</td>
                          <td style={{padding:"12px 16px"}}>
                            <p style={{fontWeight:500,fontSize:13.5,margin:"0 0 3px",color:"#1a1714"}}>{l.title||`Listing #${l.id}`}</p>
                            <span style={{background:"rgba(201,184,122,0.1)",color:"#c9b87a",border:"1px solid rgba(201,184,122,0.22)",padding:"1px 7px",borderRadius:999,fontSize:10.5,fontWeight:600}}>prop #{l.property_id}</span>
                          </td>
                          <td style={{padding:"12px 16px",fontWeight:700,fontSize:13.5,color:"#1a1714",fontFamily:"'Cormorant Garamond',Georgia,serif"}}>{fmtPrice(l.price,l.currency,l.price_period)}</td>
                          <td style={{padding:"12px 16px",fontSize:13,color:"#6b6248"}}>{fmtMoney(l.deposit)}</td>
                          <td style={{padding:"12px 16px"}}>
                            <p style={{fontSize:12,color:"#9a8c6e",margin:"0 0 2px"}}>{fmtDate(l.available_from)} →</p>
                            <p style={{fontSize:12,color:"#9a8c6e",margin:0}}>{fmtDate(l.available_until)}</p>
                          </td>
                          <td style={{padding:"12px 16px",textAlign:"center",fontSize:13,color:"#6b6248"}}>{l.min_lease_months||"—"}</td>
                          <td style={{padding:"12px 16px"}}><StatusBadge status={l.status}/></td>
                          <td style={{padding:"12px 16px"}}>
                            <div style={{display:"flex",gap:5}}>
                              <button className="ar-btn" onClick={() => setAppsTarget(l)} style={{padding:"5px 11px",borderRadius:9,border:"1.5px solid rgba(201,184,122,0.3)",background:"rgba(201,184,122,0.08)",color:"#8a7230",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Aplikimet</button>
                              <button className="ar-btn" onClick={() => { setEditTarget(l); setModalOpen(true); }} style={{...BTN_SEC,padding:"5px 11px",fontSize:12}}>Edit</button>
                              <button className="ar-btn" onClick={() => setDeleteId(l.id)} style={{padding:"5px 11px",borderRadius:9,border:"1.5px solid rgba(212,133,90,0.3)",background:"rgba(212,133,90,0.08)",color:"#8b4013",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Del</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination page={page} totalPages={totalPages} onChange={setPage}/>
              </>
            )}
          </div>
        </div>
      </div>
 
      {modalOpen&&<ListingModal initial={editTarget} onClose={()=>setModalOpen(false)} onSuccess={()=>{setModalOpen(false);fetchListings();notify(editTarget?"Listing u ndryshua":"Listing u krijua");}} notify={notify}/>}
      {deleteId&&(
        <Modal title="Konfirmo fshirjen" onClose={() => setDeleteId(null)}>
          <p style={{fontSize:14,color:"#6b6248",marginBottom:20}}>A jeni i sigurt që dëshironi të fshini listing <strong style={{color:"#1a1714"}}>#{deleteId}</strong>?</p>
          <div style={{display:"flex",gap:9,justifyContent:"flex-end"}}><button style={BTN_SEC} onClick={()=>setDeleteId(null)}>Anulo</button><button style={{...BTN_PRI,background:"#8b3a1c"}} onClick={handleDelete}>Fshi</button></div>
        </Modal>
      )}
      {appsTarget&&<ApplicationsPanel listing={appsTarget} onClose={()=>setAppsTarget(null)} notify={notify}/>}
      {toast&&<Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}
    </MainLayout>
  );
}
 