import { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "../../components/layout/Layout";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";

import "../../styles/agent/AgentContracts.css";

import { daysUntil } from "../../components/agent/contracts/contractHelpers";
import { Toast, Pagination } from "../../components/agent/contracts/ContractBadges";
import ContractCard from "../../components/agent/contracts/ContractCard";
import ContractModal from "../../components/agent/contracts/ContractModal";
import StatusModal from "../../components/agent/contracts/StatusModal";
import ContractDetailModal from "../../components/agent/contracts/ContractDetailModal";

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
    }catch{ notify("Gabim gjatë ngarkimit","error"); }
    finally{ setLoading(false); }
  },[tab,page,user?.id,notify]);

  useEffect(()=>{ fetchContracts(); },[fetchContracts]);

  const goToPayments=(contractId)=>{ navigate("/agent/payments",{state:{fromContractId:contractId}}); };
  const handleSuccess=(msg)=>{ setCreateOpen(false);setEditTarget(null);setStatusTarget(null);setDetailTarget(null);fetchContracts();notify(msg); };

  const stats={
    active:   contracts.filter(c=>c.status==="ACTIVE").length,
    expiring: contracts.filter(c=>{ const d=daysUntil(c.end_date); return d!==null&&d<=30&&d>0&&c.status==="ACTIVE"; }).length,
  };

  const tabs=[
    {id:"my",      label:"My Contracts",  icon:"📋"},
    {id:"all",     label:"All Active",    icon:"🗂️"},
    {id:"expiring",label:"Expiring Soon", icon:"⚠️"},
  ];

  return (
    <MainLayout role="agent">
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
                {[
                  {label:"Total",    value:contracts.length, dot:"#c9b87a"},
                  {label:"Active",   value:stats.active,     dot:"#7eb8a4"},
                  {label:"Expiring", value:stats.expiring,   dot:"#d4855a"},
                ].map(s=>(
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
              <button key={t.id} onClick={()=>{setTab(t.id);setPage(0);}}
                style={{padding:"0 16px",height:46,border:"none",borderBottom:tab===t.id?"2.5px solid #c9b87a":"2.5px solid transparent",background:"none",color:tab===t.id?"#1a1714":"#9a8c6e",fontWeight:tab===t.id?600:400,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:5,transition:"color .15s"}}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
          {stats.expiring>0&&<span style={{fontSize:12,color:"#c9b87a",fontWeight:600,display:"flex",alignItems:"center",gap:4}}>⚠️ {stats.expiring} expiring soon</span>}
        </div>

        {/* ── Content ── */}
        <div style={{padding:"20px 24px",maxWidth:1100,margin:"0 auto"}}>
          {stats.expiring>0&&(
            <div style={{background:"rgba(201,184,122,0.08)",border:"1.5px solid rgba(201,184,122,0.22)",borderRadius:12,padding:"13px 18px",marginBottom:18,fontSize:13,color:"#c9b87a",display:"flex",alignItems:"center",gap:8}}>
              ⚠️ Keni <strong>{stats.expiring}</strong> kontratë{stats.expiring!==1?"a":""} që skadojnë brenda 30 ditësh. Kontaktoni agjentin për rinovim.
            </div>
          )}

          {loading ? (
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {Array.from({length:3}).map((_,i)=>(
                <div key={i} style={{background:"linear-gradient(90deg,#ede9df 25%,#e4ddd0 50%,#ede9df 75%)",backgroundSize:"800px 100%",borderRadius:14,height:140,animation:"ac-shimmer 1.6s ease-in-out infinite"}}/>
              ))}
            </div>
          ) : contracts.length===0 ? (
            <div style={{textAlign:"center",padding:"80px 32px",color:"#b0a890",fontFamily:"'DM Sans',sans-serif"}}>
              <div style={{fontSize:48,marginBottom:16}}>📄</div>
              <p style={{fontSize:20,fontWeight:700,color:"#6b6340",marginBottom:6,fontFamily:"'Cormorant Garamond',Georgia,serif"}}>
                {tab==="expiring"?"Nuk ka kontrata që skadojnë":"Nuk ka kontrata"}
              </p>
              <p style={{fontSize:13,color:"#b0a890"}}>Kontratat do të shfaqen këtu pasi të krijohen.</p>
            </div>
          ) : (
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

      {createOpen&&(
        <ContractModal
          initial={editTarget||null}
          initialPropertyId={fromPropertyId}
          initialListingId={fromListingId}
          initialClientId={fromClientId}
          onClose={()=>{setCreateOpen(false);setEditTarget(null);}}
          onSuccess={()=>handleSuccess(editTarget?"Kontrata u ndryshua":"Kontrata u krijua")}
          notify={notify}
        />
      )}
      {editTarget&&!createOpen&&(
        <ContractModal
          initial={editTarget}
          onClose={()=>setEditTarget(null)}
          onSuccess={()=>handleSuccess("Kontrata u ndryshua")}
          notify={notify}
        />
      )}
      {statusTarget&&(
        <StatusModal
          contract={statusTarget}
          onClose={()=>setStatusTarget(null)}
          onSuccess={()=>handleSuccess("Statusi u ndryshua")}
          notify={notify}
        />
      )}
      {detailTarget&&(
        <ContractDetailModal
          contract={detailTarget}
          onClose={()=>setDetailTarget(null)}
          onEdit={c=>{setDetailTarget(null);setEditTarget(c);}}
          onStatusChange={c=>{setDetailTarget(null);setStatusTarget(c);}}
          onGoToPayments={goToPayments}
        />
      )}
      {toast&&<Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}
    </MainLayout>
  );
}