import { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "../../components/layout/Layout";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";
import { AiContractSummaryButton } from "../shared/AiFeatures";
 
// ── Constants & helpers (pa ndryshim) ─────────────────────────────────────────
const LEASE_STATUSES = ["ACTIVE","ENDED","CANCELLED","PENDING_SIGNATURE"];
const CURRENCIES     = ["EUR","USD","ALL"];
 
const fmtDate  = (d) => d ? new Date(d).toLocaleDateString("sq-AL") : "—";
const fmtDT    = (d) => d ? new Date(d).toLocaleString("sq-AL",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}) : "—";
const fmtMoney = (v,cur="EUR") => v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";
 
function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr)-new Date())/(1000*60*60*24));
}
 
function validateContractForm(form,notify) {
  if(!form.property_id||isNaN(Number(form.property_id))||Number(form.property_id)<=0){notify("Property ID duhet të jetë numër pozitiv","error");return false;}
  if(form.listing_id&&(isNaN(Number(form.listing_id))||Number(form.listing_id)<=0)){notify("Listing ID duhet të jetë numër pozitiv","error");return false;}
  if(!form.client_id||isNaN(Number(form.client_id))||Number(form.client_id)<=0){notify("Client ID duhet të jetë numër pozitiv","error");return false;}
  if(!form.start_date){notify("Data e fillimit është e detyrueshme","error");return false;}
  if(!form.end_date){notify("Data e mbarimit është e detyrueshme","error");return false;}
  if(new Date(form.end_date)<=new Date(form.start_date)){notify("Data e mbarimit duhet të jetë pas datës së fillimit","error");return false;}
  if(!form.rent||isNaN(Number(form.rent))||Number(form.rent)<=0){notify("Qiraja mujore duhet të jetë më e madhe se 0","error");return false;}
  if(Number(form.rent)>999999999){notify("Qiraja është shumë e madhe","error");return false;}
  if(form.deposit&&(isNaN(Number(form.deposit))||Number(form.deposit)<0)){notify("Depozita nuk mund të jetë negative","error");return false;}
  if(form.contract_file_url&&form.contract_file_url.length>500){notify("URL nuk mund të kalojë 500 karaktere","error");return false;}
  if(form.contract_file_url&&!form.contract_file_url.startsWith("http")){notify("URL duhet të fillojë me http/https","error");return false;}
  return true;
}
 
// ── Design ────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
  .ac * { box-sizing: border-box; }
  .ac { font-family: 'DM Sans', system-ui, sans-serif; background: #f2ede4; min-height: 100vh; }
  .ac-card { transition: transform 0.22s cubic-bezier(0.25,0.46,0.45,0.94),box-shadow 0.22s ease; }
  .ac-card:hover { transform: translateY(-4px); box-shadow: 0 20px 48px rgba(20,16,10,0.12) !important; }
  .ac-btn { transition: all 0.17s ease; }
  .ac-btn:hover:not(:disabled) { opacity: 0.86; transform: translateY(-1px); }
  .ac-in:focus { border-color: #8a7d5e !important; box-shadow: 0 0 0 3px rgba(138,125,94,0.13) !important; outline: none; }
  @keyframes ac-scale-in { from{opacity:0;transform:scale(0.95) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes ac-card-in  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes ac-spin     { to{transform:rotate(360deg)} }
  @keyframes ac-toast    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes ac-glow     { 0%,100%{opacity:0.07} 50%{opacity:0.14} }
  @keyframes ac-shimmer  { 0%{background-position:-800px 0} 100%{background-position:800px 0} }
`;
 
const STATUS_CFG = {
  ACTIVE:            { strip:"#7eb8a4", pill:"rgba(126,184,164,0.1)",  pillBorder:"rgba(126,184,164,0.25)", color:"#2a6049",  label:"Active" },
  ENDED:             { strip:"#a0997e", pill:"rgba(160,153,126,0.1)",  pillBorder:"rgba(160,153,126,0.22)", color:"#6b6248",  label:"Ended" },
  CANCELLED:         { strip:"#d4855a", pill:"rgba(212,133,90,0.1)",   pillBorder:"rgba(212,133,90,0.25)",  color:"#8b4513",  label:"Cancelled" },
  PENDING_SIGNATURE: { strip:"#c9b87a", pill:"rgba(201,184,122,0.12)", pillBorder:"rgba(201,184,122,0.28)", color:"#9a7a30",  label:"Pending Signature" },
};
 
function StatusBadge({ status }) {
  const s = STATUS_CFG[status]||{ pill:"#f0ece3", pillBorder:"#e0d8c8", color:"#6b6248", label:status, strip:"#a0997e" };
  return (
    <span style={{background:s.pill,color:s.color,border:`1.5px solid ${s.pillBorder}`,padding:"3px 11px",borderRadius:999,fontSize:10.5,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.3px",display:"inline-flex",alignItems:"center",gap:5}}>
      <span style={{width:5,height:5,borderRadius:"50%",background:s.strip,display:"inline-block",boxShadow:`0 0 4px ${s.strip}`}}/>
      {s.label}
    </span>
  );
}
 
const INP_S = {width:"100%",padding:"10px 13px",border:"1.5px solid #e4ddd0",borderRadius:10,fontSize:13.5,color:"#1a1714",background:"#fff",fontFamily:"'DM Sans',sans-serif",boxSizing:"border-box",outline:"none",transition:"border-color 0.2s"};
const SEL_S = {...INP_S,cursor:"pointer"};
const BTN_PRI = {padding:"10px 22px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#c9b87a,#b0983e)",color:"#1a1714",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"};
const BTN_SEC = {padding:"10px 18px",borderRadius:10,border:"1.5px solid #e4ddd0",background:"transparent",color:"#6b6248",fontWeight:500,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"};
 
function Toast({ msg, type="success", onDone }) {
  useEffect(()=>{ const t=setTimeout(onDone,3200); return()=>clearTimeout(t); },[onDone]);
  return <div style={{position:"fixed",bottom:26,right:26,zIndex:9999,background:"#1a1714",color:type==="error"?"#f09090":"#90c8a8",padding:"11px 18px",borderRadius:12,fontSize:13,boxShadow:"0 10px 36px rgba(0,0,0,0.32)",border:`1px solid ${type==="error"?"rgba(240,128,128,0.15)":"rgba(144,200,168,0.15)"}`,maxWidth:320,fontFamily:"'DM Sans',sans-serif",animation:"ac-toast 0.2s ease",display:"flex",alignItems:"center",gap:8}}><span>{type==="error"?"⚠️":"✅"}</span>{msg}</div>;
}
function Loader() { return <div style={{textAlign:"center",padding:"52px 0"}}><div style={{width:26,height:26,margin:"0 auto",border:"2px solid #e8e2d6",borderTop:"2px solid #c9b87a",borderRadius:"50%",animation:"ac-spin 0.8s linear infinite"}}/></div>; }
function EmptyState({ icon, text }) { return <div style={{textAlign:"center",padding:"52px 20px",color:"#b0a890",fontFamily:"'DM Sans',sans-serif"}}><div style={{fontSize:36,marginBottom:10}}>{icon}</div><p style={{fontSize:14}}>{text}</p></div>; }
 
function Pagination({ page, totalPages, onChange }) {
  if(totalPages<=1)return null;
  return <div style={{display:"flex",alignItems:"center",gap:6,justifyContent:"flex-end",padding:"14px 16px"}}><button disabled={page===0} onClick={()=>onChange(page-1)} style={{...BTN_SEC,padding:"6px 14px",fontSize:12.5,opacity:page===0?0.4:1}}>← Prev</button><span style={{fontSize:13,color:"#9a8c6e",padding:"0 8px"}}>{page+1} / {totalPages}</span><button disabled={page>=totalPages-1} onClick={()=>onChange(page+1)} style={{...BTN_SEC,padding:"6px 14px",fontSize:12.5,opacity:page>=totalPages-1?0.4:1}}>Next →</button></div>;
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
  useEffect(()=>{
    const h=e=>e.key==="Escape"&&onClose();
    window.addEventListener("keydown",h);
    document.body.style.overflow="hidden";
    return()=>{ window.removeEventListener("keydown",h); document.body.style.overflow=""; };
  },[onClose]);
  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(8,6,4,0.84)",backdropFilter:"blur(14px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{width:"100%",maxWidth:wide?700:520,background:"#faf7f2",borderRadius:18,boxShadow:"0 44px 100px rgba(0,0,0,0.55)",maxHeight:"92vh",overflowY:"auto",animation:"ac-scale-in 0.26s ease"}}>
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
 
// ── Contract Modal (logjika identike) ─────────────────────────────────────────
function ContractModal({ initial, initialPropertyId, initialListingId, initialClientId, onClose, onSuccess, notify }) {
  const [form,setForm]=useState({property_id:initial?.property_id?String(initial.property_id):(initialPropertyId||""),listing_id:initial?.listing_id?String(initial.listing_id):(initialListingId||""),client_id:initial?.client_id?String(initial.client_id):(initialClientId||""),start_date:initial?.start_date??"",end_date:initial?.end_date??"",rent:initial?.rent?String(initial.rent):"",deposit:initial?.deposit?String(initial.deposit):"",currency:initial?.currency??"EUR",contract_file_url:initial?.contract_file_url??""});
  const [saving,setSaving]=useState(false);
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
 
  const handleSubmit=async()=>{
    if(!validateContractForm(form,notify))return;
    setSaving(true);
    try{
      const payload={property_id:Number(form.property_id),listing_id:form.listing_id?Number(form.listing_id):null,client_id:Number(form.client_id),start_date:form.start_date,end_date:form.end_date,rent:Number(form.rent),deposit:form.deposit?Number(form.deposit):null,currency:form.currency,contract_file_url:form.contract_file_url||null};
      initial?await api.put(`/api/contracts/lease/${initial.id}`,payload):await api.post("/api/contracts/lease",payload);
      onSuccess();
    }catch(err){notify(err.response?.data?.message||"Gabim gjatë ruajtjes","error");}
    finally{setSaving(false);}
  };
 
  const minEndDate=form.start_date?new Date(new Date(form.start_date).getTime()+86400000).toISOString().split("T")[0]:undefined;
 
  return (
    <Modal title={initial?`Edit Kontratë #${initial.id}`:"New Lease Contract"} onClose={onClose} wide>
      {(initialPropertyId||initialListingId)&&!initial&&(
        <div style={{background:"rgba(201,184,122,0.07)",border:"1.5px solid rgba(201,184,122,0.2)",borderRadius:10,padding:"10px 14px",marginBottom:16,fontSize:13,color:"#a8923e"}}>
          📋 Po krijon kontratë{initialPropertyId&&` për Property #${initialPropertyId}`}{initialListingId&&` · Listing #${initialListingId}`}{initialClientId&&` · Client #${initialClientId}`}
        </div>
      )}
      <Row2>
        <Field label="Property ID" required hint="ID numerike e pronës"><input className="ac-in" style={INP_S} type="number" min="1" value={form.property_id} onChange={e=>set("property_id",e.target.value)} placeholder="42"/></Field>
        <Field label="Listing ID" hint="Opcionale"><input className="ac-in" style={INP_S} type="number" min="1" value={form.listing_id} onChange={e=>set("listing_id",e.target.value)} placeholder="(opcional)"/></Field>
      </Row2>
      <Field label="Client ID" required><input className="ac-in" style={INP_S} type="number" min="1" value={form.client_id} onChange={e=>set("client_id",e.target.value)} placeholder="ID e klientit"/></Field>
      <Row2>
        <Field label="Data fillimit" required><input className="ac-in" style={INP_S} type="date" value={form.start_date} onChange={e=>set("start_date",e.target.value)}/></Field>
        <Field label="Data mbarimit" required><input className="ac-in" style={INP_S} type="date" value={form.end_date} onChange={e=>set("end_date",e.target.value)} min={minEndDate}/></Field>
      </Row2>
      <Row2>
        <Field label="Qiraja mujore" required><input className="ac-in" style={INP_S} type="number" min="0.01" step="0.01" value={form.rent} onChange={e=>set("rent",e.target.value)} placeholder="450"/></Field>
        <Field label="Depozita"><input className="ac-in" style={INP_S} type="number" min="0" step="0.01" value={form.deposit} onChange={e=>set("deposit",e.target.value)} placeholder="900"/></Field>
      </Row2>
      <Row2>
        <Field label="Monedha"><select className="ac-in" style={SEL_S} value={form.currency} onChange={e=>set("currency",e.target.value)}>{CURRENCIES.map(c=><option key={c}>{c}</option>)}</select></Field>
        <Field label="URL Kontratë" hint="Duhet të fillojë me http/https"><input className="ac-in" style={INP_S} value={form.contract_file_url} onChange={e=>set("contract_file_url",e.target.value)} placeholder="https://..." maxLength={500}/></Field>
      </Row2>
      <div style={{display:"flex",gap:9,justifyContent:"flex-end",marginTop:6}}>
        <button style={BTN_SEC} onClick={onClose}>Anulo</button>
        <button style={BTN_PRI} onClick={handleSubmit} disabled={saving}>{saving?"Duke ruajtur...":initial?"Ruaj ndryshimet":"Krijo kontratë"}</button>
      </div>
    </Modal>
  );
}
 
// ── Status Modal ──────────────────────────────────────────────────────────────
function StatusModal({ contract, onClose, onSuccess, notify }) {
  const [status,setStatus]=useState("ACTIVE");
  const [saving,setSaving]=useState(false);
  const handleSubmit=async()=>{
    setSaving(true);
    try{await api.patch(`/api/contracts/lease/${contract.id}/status`,{status});onSuccess();}
    catch(err){notify(err.response?.data?.message||"Gabim","error");}
    finally{setSaving(false);}
  };
  const commissionTotal=contract.rent?(Number(contract.rent)*0.03).toLocaleString("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}):null;
  return (
    <Modal title={`Ndrysho statusin — Kontratë #${contract.id}`} onClose={onClose}>
      <p style={{fontSize:13.5,color:"#6b6248",marginBottom:16}}>Statusi aktual: <StatusBadge status={contract.status}/></p>
      <Field label="Statusi i ri">
        <select className="ac-in" style={SEL_S} value={status} onChange={e=>setStatus(e.target.value)}>
          {LEASE_STATUSES.filter(s=>s!==contract.status).map(s=><option key={s}>{s}</option>)}
        </select>
      </Field>
      {status==="ACTIVE"&&contract.status==="PENDING_SIGNATURE"&&(
        <div style={{background:"rgba(126,184,164,0.08)",border:"1.5px solid rgba(126,184,164,0.22)",borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:13,color:"#2a6049"}}>💡 Duke shënuar ACTIVE, sistemi do të krijojë automatikisht pagesat e komisionit (3% e qirasë mujore{commissionTotal?` = €${commissionTotal}`:""}).</div>
      )}
      {(status==="CANCELLED"||status==="ENDED")&&(
        <div style={{background:"rgba(201,184,122,0.07)",border:"1.5px solid rgba(201,184,122,0.2)",borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:13,color:"#a8923e"}}>⚠️ Ky veprim nuk mund të kthehet pas konfirmimit.</div>
      )}
      <div style={{display:"flex",gap:9,justifyContent:"flex-end"}}>
        <button style={BTN_SEC} onClick={onClose}>Anulo</button>
        <button style={{...BTN_PRI,...(status==="CANCELLED"?{background:"#8b3a1c"}:{})}} onClick={handleSubmit} disabled={saving}>{saving?"Duke ndryshuar...":`Konfirmo — ${status}`}</button>
      </div>
    </Modal>
  );
}
 
// ── Contract Detail Modal ─────────────────────────────────────────────────────
function ContractDetailModal({ contract, onClose, onEdit, onStatusChange, onGoToPayments }) {
  const days=daysUntil(contract.end_date);
  const expiring=days!==null&&days<=30&&days>0&&contract.status==="ACTIVE";
  const s=STATUS_CFG[contract.status]||STATUS_CFG.ENDED;
  return (
    <Modal title={`Kontratë #${contract.id}`} onClose={onClose} wide>
      {expiring&&<div style={{background:"rgba(201,184,122,0.08)",border:"1.5px solid rgba(201,184,122,0.22)",borderRadius:10,padding:"10px 14px",marginBottom:16,fontSize:13,color:"#c9b87a"}}>⚠️ Kjo kontratë skadon pas <strong>{days}</strong> ditësh!</div>}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:s.pill,border:`1.5px solid ${s.pillBorder}`,borderRadius:11,padding:"12px 16px",marginBottom:18}}>
        <StatusBadge status={contract.status}/>
        {contract.status==="ACTIVE"&&days!==null&&<span style={{fontSize:12.5,fontWeight:600,color:expiring?"#c9b87a":"#9a8c6e"}}>{expiring?`⚠️ ${days} days remaining`:`${days} days remaining`}</span>}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:18}}>
        {[{label:"Property",value:`#${contract.property_id}`},{label:"Client",value:`#${contract.client_id}`},{label:"Agjent",value:contract.agent_id?`#${contract.agent_id}`:"—"},{label:"Data fillimit",value:fmtDate(contract.start_date)},{label:"Data mbarimit",value:fmtDate(contract.end_date)},{label:"Qiraja",value:fmtMoney(contract.rent)},{label:"Depozita",value:fmtMoney(contract.deposit)},{label:"Krijuar",value:fmtDT(contract.created_at)}].map(({label,value})=>(
          <div key={label} style={{background:"#fff",borderRadius:10,padding:"10px 14px",border:"1.5px solid #e8e2d6"}}>
            <p style={{fontSize:9.5,color:"#b0a890",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:4}}>{label}</p>
            <p style={{fontSize:13.5,fontWeight:600,color:"#1a1714",margin:0,fontFamily:"'Cormorant Garamond',Georgia,serif"}}>{value}</p>
          </div>
        ))}
      </div>
      {contract.contract_file_url&&<div style={{background:"rgba(201,184,122,0.06)",border:"1.5px solid rgba(201,184,122,0.18)",borderRadius:10,padding:"10px 14px",marginBottom:16}}><a href={contract.contract_file_url} target="_blank" rel="noopener noreferrer" style={{color:"#c9b87a",fontSize:13.5,fontWeight:600,textDecoration:"none"}}>📄 Hap fajllin e kontratës ↗</a></div>}
      <div style={{background:"rgba(201,184,122,0.06)",border:"1.5px solid rgba(201,184,122,0.18)",borderRadius:10,padding:"12px 16px",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{fontSize:13,color:"#a8923e",fontWeight:500}}>💳 Pagesat e kësaj kontrate</span>
        <button className="ac-btn" onClick={()=>onGoToPayments(String(contract.id))} style={{...BTN_PRI,padding:"6px 14px",fontSize:12}}>Shiko Pagesat →</button>
      </div>
      <div style={{display:"flex",gap:9,justifyContent:"flex-end",borderTop:"1.5px solid #e8e2d6",paddingTop:16}}>
        {contract.status!=="ENDED"&&contract.status!=="CANCELLED"&&(
          <>
            <button style={BTN_SEC} onClick={()=>onEdit(contract)}>Edit</button>
            <button style={BTN_PRI} onClick={()=>onStatusChange(contract)}>Ndrysho statusin</button>
          </>
        )}
      </div>
    </Modal>
  );
}
 
// ── Contract Card (new visual) ─────────────────────────────────────────────────
function ContractCard({ contract, onDetail, onPayments, idx }) {
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
            {[{label:"Deposit",value:fmtMoney(contract.deposit)},{label:"Start",value:fmtDate(contract.start_date)},{label:"End",value:fmtDate(contract.end_date)}].map(({label,value})=>(
              <div key={label} style={{background:"#f8f5f0",borderRadius:8,padding:"7px 11px",border:"1.5px solid #ede9df"}}>
                <div style={{fontSize:9.5,color:"#b0a890",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:2}}>{label}</div>
                <div style={{fontSize:13,fontWeight:700,color:"#1a1714",fontFamily:"'Cormorant Garamond',Georgia,serif"}}>{value}</div>
              </div>
            ))}
          </div>
        </div>
        {expiring&&<div style={{background:"rgba(201,184,122,0.08)",border:"1.5px solid rgba(201,184,122,0.22)",borderRadius:8,padding:"7px 12px",marginTop:10,fontSize:12,color:"#c9b87a"}}>⚠️ Expires in <strong>{days} days</strong></div>}
        <div style={{display:"flex",gap:7,flexWrap:"wrap",paddingTop:10,borderTop:"1.5px solid #f0ece3",marginTop:10}}>
          <button className="ac-btn" onClick={()=>onDetail(contract)} style={{...BTN_SEC,padding:"7px 14px",fontSize:12.5}}>View Details</button>
          <AiContractSummaryButton contract={contract}/>
          <button className="ac-btn" onClick={()=>onPayments(contract.id)} style={{padding:"7px 14px",borderRadius:9,border:"1.5px solid rgba(201,184,122,0.3)",background:"rgba(201,184,122,0.08)",color:"#8a7230",fontSize:12.5,cursor:"pointer",fontFamily:"inherit"}}>💳 Payments</button>
        </div>
      </div>
    </div>
  );
}
 
// ═════════════════════════════════════════════════════════════════════════════
export default function AgentContracts() {
  const { user }  = useContext(AuthContext);
  const navigate  = useNavigate();
  const location  = useLocation();
 
  const fromPropertyId=location.state?.fromPropertyId||null;
  const fromListingId=location.state?.fromListingId||null;
  const fromClientId=location.state?.fromClientId||null;
 
  const [tab,setTab]=useState("my");
  const [contracts,setContracts]=useState([]);
  const [loading,setLoading]=useState(true);
  const [page,setPage]=useState(0);
  const [totalPages,setTotalPages]=useState(0);
  const [createOpen,setCreateOpen]=useState(!!(fromPropertyId||fromListingId));
  const [editTarget,setEditTarget]=useState(null);
  const [statusTarget,setStatusTarget]=useState(null);
  const [detailTarget,setDetailTarget]=useState(null);
  const [toast,setToast]=useState(null);
 
  const notify=useCallback((msg,type="success")=>setToast({msg,type,key:Date.now()}),[]);
 
  const fetchContracts=useCallback(async()=>{
    setLoading(true);
    try{
      let res;
      if(tab==="my"&&user?.id){res=await api.get(`/api/contracts/lease/agent/${user.id}?page=${page}&size=10`);setContracts(res.data.content||[]);setTotalPages(res.data.totalPages||0);}
      else if(tab==="all"){res=await api.get(`/api/contracts/lease?page=${page}&size=10`);setContracts(res.data.content||[]);setTotalPages(res.data.totalPages||0);}
      else if(tab==="expiring"){res=await api.get("/api/contracts/lease/expiring");setContracts(Array.isArray(res.data)?res.data:[]);setTotalPages(1);}
    }catch{notify("Gabim gjatë ngarkimit","error");}
    finally{setLoading(false);}
  },[tab,page,user?.id,notify]);
 
  useEffect(()=>{fetchContracts();},[fetchContracts]);
 
  const goToPayments=(contractId)=>{navigate("/agent/payments",{state:{fromContractId:contractId}});};
  const handleSuccess=(msg)=>{setCreateOpen(false);setEditTarget(null);setStatusTarget(null);setDetailTarget(null);fetchContracts();notify(msg);};
 
  const stats={active:contracts.filter(c=>c.status==="ACTIVE").length,expiring:contracts.filter(c=>{const d=daysUntil(c.end_date);return d!==null&&d<=30&&d>0&&c.status==="ACTIVE";}).length};
 
  const tabs=[{id:"my",label:"My Contracts",icon:"📋"},{id:"all",label:"All Active",icon:"🗂️"},{id:"expiring",label:"Expiring Soon",icon:"⚠️"}];
 
  return (
    <MainLayout role="agent">
      <style>{CSS}</style>
      <div className="ac">
 
        {/* ── Hero ── */}
        <div style={{background:"linear-gradient(160deg,#141210 0%,#1e1a14 45%,#241e16 100%)",minHeight:280,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"36px 32px",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,0.018) 1px,transparent 1px)",backgroundSize:"22px 22px",pointerEvents:"none"}}/>
          <div style={{position:"absolute",top:"-60px",left:"10%",width:260,height:260,borderRadius:"50%",background:"radial-gradient(circle,rgba(201,184,122,0.07) 0%,transparent 70%)",pointerEvents:"none",animation:"ac-glow 4s ease-in-out infinite"}}/>
          <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:"linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)"}}/>
          <div style={{position:"relative",zIndex:1,maxWidth:700,width:"100%",textAlign:"center"}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(201,184,122,0.1)",border:"1px solid rgba(201,184,122,0.18)",borderRadius:999,padding:"4px 14px",marginBottom:14}}>
              <span style={{width:5,height:5,borderRadius:"50%",background:"#c9b87a",display:"inline-block",boxShadow:"0 0 6px #c9b87a"}}/>
              <span style={{fontSize:10.5,fontWeight:600,color:"#c9b87a",letterSpacing:"1.2px",textTransform:"uppercase"}}>My Contracts</span>
            </div>
            <h1 style={{margin:"0 0 10px",fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"clamp(26px,4vw,42px)",fontWeight:700,color:"#f5f0e8",letterSpacing:"-0.7px"}}>
              Lease{" "}
              <span style={{background:"linear-gradient(90deg,#c9b87a,#e8d9a0,#c9b87a)",backgroundSize:"200% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Agreements</span>
            </h1>
            <p style={{margin:"0 auto 22px",fontSize:13.5,color:"rgba(245,240,232,0.38)"}}>Menaxho kontratat e qirasë dhe gjurmo afatet</p>
            <button className="ac-btn" onClick={()=>setCreateOpen(true)}
              style={{display:"inline-flex",alignItems:"center",gap:7,background:"linear-gradient(135deg,#c9b87a,#b0983e)",color:"#1a1714",border:"none",borderRadius:11,padding:"11px 22px",fontSize:13.5,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 6px 22px rgba(201,184,122,0.22)"}}>
              + New Contract
            </button>
            {!loading&&contracts.length>0&&(
              <div style={{display:"flex",gap:8,maxWidth:400,margin:"18px auto 0",justifyContent:"center",flexWrap:"wrap"}}>
                {[{label:"Total",value:contracts.length,dot:"#c9b87a"},{label:"Active",value:stats.active,dot:"#7eb8a4"},{label:"Expiring",value:stats.expiring,dot:"#d4855a"}].map(s=>(
                  <div key={s.label} style={{background:"rgba(245,240,232,0.06)",backdropFilter:"blur(10px)",borderRadius:12,padding:"9px 16px",border:"1px solid rgba(245,240,232,0.09)",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                    <span style={{fontSize:22,fontWeight:700,color:s.dot,lineHeight:1,fontFamily:"'Cormorant Garamond',Georgia,serif"}}>{s.value}</span>
                    <span style={{fontSize:9.5,color:"rgba(245,240,232,0.3)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.8px"}}>{s.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
 
        {/* ── Toolbar ── */}
        <div style={{background:"#fff",borderBottom:"1.5px solid #e8e2d6",padding:"0 28px",height:46,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,fontFamily:"'DM Sans',sans-serif",position:"sticky",top:0,zIndex:100,boxShadow:"0 1px 10px rgba(20,16,10,0.05)"}}>
          <div style={{display:"flex",gap:0}}>
            {tabs.map(t=>(
              <button key={t.id} onClick={()=>{setTab(t.id);setPage(0);}} style={{padding:"0 16px",height:46,border:"none",borderBottom:tab===t.id?"2.5px solid #c9b87a":"2.5px solid transparent",background:"none",color:tab===t.id?"#1a1714":"#9a8c6e",fontWeight:tab===t.id?600:400,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:5,transition:"color .15s"}}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
          {stats.expiring>0&&<span style={{fontSize:12,color:"#c9b87a",fontWeight:600,display:"flex",alignItems:"center",gap:4}}>⚠️ {stats.expiring} expiring soon</span>}
        </div>
 
        {/* ── Content ── */}
        <div style={{padding:"20px 24px",maxWidth:1100,margin:"0 auto"}}>
          {stats.expiring>0&&<div style={{background:"rgba(201,184,122,0.08)",border:"1.5px solid rgba(201,184,122,0.22)",borderRadius:12,padding:"13px 18px",marginBottom:18,fontSize:13,color:"#c9b87a",display:"flex",alignItems:"center",gap:8}}>⚠️ Keni <strong>{stats.expiring}</strong> kontratë{stats.expiring!==1?"a":""} që skadojnë brenda 30 ditësh. Kontaktoni agjentin për rinovim.</div>}
 
          {loading?(
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {Array.from({length:3}).map((_,i)=>(
                <div key={i} style={{background:"linear-gradient(90deg,#ede9df 25%,#e4ddd0 50%,#ede9df 75%)",backgroundSize:"800px 100%",borderRadius:14,height:140,animation:"ac-shimmer 1.6s ease-in-out infinite"}}/>
              ))}
            </div>
          ):contracts.length===0?(
            <div style={{textAlign:"center",padding:"80px 32px",color:"#b0a890",fontFamily:"'DM Sans',sans-serif"}}>
              <div style={{fontSize:48,marginBottom:16}}>📄</div>
              <p style={{fontSize:20,fontWeight:700,color:"#6b6340",marginBottom:6,fontFamily:"'Cormorant Garamond',Georgia,serif"}}>
                {tab==="expiring"?"Nuk ka kontrata që skadojnë":"Nuk ka kontrata"}
              </p>
              <p style={{fontSize:13,color:"#b0a890"}}>Kontratat do të shfaqen këtu pasi të krijohen.</p>
            </div>
          ):(
            <>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {contracts.map((c,i)=>(
                  <ContractCard key={c.id} contract={c} idx={i} onDetail={setDetailTarget} onPayments={goToPayments}/>
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} onChange={setPage}/>
            </>
          )}
        </div>
      </div>
 
      {createOpen&&<ContractModal initial={editTarget||null} initialPropertyId={fromPropertyId} initialListingId={fromListingId} initialClientId={fromClientId} onClose={()=>{setCreateOpen(false);setEditTarget(null);}} onSuccess={()=>handleSuccess(editTarget?"Kontrata u ndryshua":"Kontrata u krijua")} notify={notify}/>}
      {editTarget&&!createOpen&&<ContractModal initial={editTarget} onClose={()=>setEditTarget(null)} onSuccess={()=>handleSuccess("Kontrata u ndryshua")} notify={notify}/>}
      {statusTarget&&<StatusModal contract={statusTarget} onClose={()=>setStatusTarget(null)} onSuccess={()=>handleSuccess("Statusi u ndryshua")} notify={notify}/>}
      {detailTarget&&<ContractDetailModal contract={detailTarget} onClose={()=>setDetailTarget(null)} onEdit={c=>{setDetailTarget(null);setEditTarget(c);}} onStatusChange={c=>{setDetailTarget(null);setStatusTarget(c);}} onGoToPayments={goToPayments}/>}
      {toast&&<Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}
    </MainLayout>
  );
}
 