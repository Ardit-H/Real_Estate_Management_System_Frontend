import { useState, useCallback, useContext } from "react";
import { AuthContext } from "../../context/AuthProvider";
import MainLayout from "../../components/layout/Layout";
import { CSS } from "../../components/agent/sales/salesConstants.js";
import { Toast, SectionTabs } from "../../components/agent/sales/SalesUI.jsx";
import { ListingsSection } from "../../components/agent/sales/ListingsSection.jsx";
import { ContractsSection } from "../../components/agent/sales/ContractsSection.jsx";
import { PaymentsSection } from "../../components/agent/sales/PaymentsSection.jsx";
 
export default function AgentSales() {
  const { user } = useContext(AuthContext);
  const [tab, setTab] = useState("listings");
  const [toast, setToast] = useState(null);
  const [contractPrefill, setContractPrefill] = useState(null);
  const [paymentPrefill,  setPaymentPrefill]  = useState(null);
 
  const notify = useCallback((msg, type="success") => setToast({ msg, type, key:Date.now() }), []);
  const goToContract = (prefill) => { setContractPrefill(prefill); setTab("contracts"); };
  const goToPayment  = (prefill) => { setPaymentPrefill(prefill); setTab("payments"); };
 
  return (
    <MainLayout role="agent">
      <style>{CSS}</style>
      <div className="as">
 
        {/* ── Hero ── */}
        <div style={{background:"linear-gradient(160deg,#141210 0%,#1e1a14 45%,#241e16 100%)",minHeight:220,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 32px",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,0.018) 1px,transparent 1px)",backgroundSize:"22px 22px",pointerEvents:"none"}}/>
          <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:"linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)"}}/>
          <div style={{position:"relative",zIndex:1,maxWidth:700,width:"100%",textAlign:"center"}}>
            <h1 style={{margin:"0 0 8px",fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"clamp(24px,4vw,38px)",fontWeight:700,color:"#f5f0e8",letterSpacing:"-0.5px"}}>
              Sales{" "}
              <span style={{background:"linear-gradient(90deg,#c9b87a,#e8d9a0,#c9b87a)",backgroundSize:"200% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Management</span>
            </h1>
            <p style={{margin:0,fontSize:13,color:"rgba(245,240,232,0.38)"}}>Listing → Contract → Payment</p>
          </div>
        </div>
 
        {/* ── Workflow breadcrumb ── */}
        <div style={{background:"#f5f0e6",borderBottom:"1.5px solid #e8dfc8",padding:"10px 28px",display:"flex",alignItems:"center",gap:6,fontSize:13,flexWrap:"wrap"}}>
          {[{id:"listings",label:"1. Listing"},{id:"contracts",label:"2. Contract"},{id:"payments",label:"3. Payment"}].map((s,i) => (
            <span key={s.id} style={{display:"flex",alignItems:"center",gap:6}}>
              {i>0&&<span style={{color:"#c9b87a",fontWeight:300}}>────</span>}
              <span style={{
                fontWeight:tab===s.id?700:500,
                color:tab===s.id?"#8a6a10":"#9a8c6e",
                background:tab===s.id?"rgba(201,184,122,0.18)":"transparent",
                padding:tab===s.id?"3px 10px":"0",
                borderRadius:tab===s.id?999:0,
                border:tab===s.id?"1.5px solid rgba(201,184,122,0.35)":"none",
              }}>{s.label}</span>
            </span>
          ))}
          <span style={{marginLeft:"auto",fontSize:11.5,color:"#b0a080"}}>Click "Contract →" or "Payments →" for quick workflow</span>
        </div>
 
        {/* ── Content ── */}
        <div style={{padding:"22px 24px",maxWidth:1440,margin:"0 auto"}}>
          <SectionTabs active={tab} onChange={setTab}/>
 
          {tab==="listings"&&<ListingsSection onSelectContract={goToContract} notify={notify} currentUserId={user?.id}/>}
          {tab==="contracts"&&<ContractsSection prefill={contractPrefill} onSelectPayment={goToPayment} notify={notify} currentUserId={user?.id}/>}
          {tab==="payments"&&<PaymentsSection prefill={paymentPrefill} notify={notify}/>}
        </div>
      </div>
 
      {toast&&<Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)}/>}
    </MainLayout>
  );
}
