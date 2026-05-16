import { useState, useEffect } from "react";
import api from "../../../api/axios";
import { C, RISK_CFG } from "./dashboardConstants";

export default function PaymentRiskPanel({ clientId }) {
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    const analyze = async () => {
      setLoading(true); setError(null);
      try {
        const r = await api.get(`/api/ai/payments/risk/${clientId}`);
        if (!cancelled) setResult(r.data);
      } catch(e) {
        if (!cancelled) setError(e.response?.data?.message || "Error analyzing risk");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    analyze();
    return () => { cancelled = true; };
  }, [clientId]);

  const cfg = result ? (RISK_CFG[result.risk_level] || RISK_CFG.MEDIUM) : null;

  if (loading) return (
    <div style={{textAlign:"center",padding:"24px 0",color:C.textMut,fontSize:13}}>
      <div style={{width:20,height:20,border:"2px solid #e8e2d6",borderTop:`2px solid ${C.gold}`,borderRadius:"50%",animation:"ad-spin .7s linear infinite",margin:"0 auto 10px"}}/>
      Analyzing payment risk...
    </div>
  );

  if (error) return (
    <div style={{padding:"12px 14px",background:"#fef2f2",border:"1.5px solid #fca5a5",borderRadius:10,fontSize:13,color:"#dc2626",marginTop:8}}>
      ⚠️ {error}
    </div>
  );

  if (!result) return null;

  return (
    <div style={{marginTop:4,animation:"ad-fade-up .3s ease"}}>
      <div style={{marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
          <span style={{fontSize:13,fontWeight:600,color:C.text}}>Risk Score</span>
          <span style={{background:cfg.bg,color:cfg.color,padding:"3px 12px",borderRadius:20,fontSize:12,fontWeight:700}}>
            {result.risk_level} ({result.risk_score}/10)
          </span>
        </div>
        <div style={{height:8,background:"#e8e2d6",borderRadius:10,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${result.risk_score*10}%`,background:cfg.bar,borderRadius:10,transition:"width .5s ease"}}/>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        <div style={{background:"#f5f0e8",borderRadius:10,padding:"10px 14px",textAlign:"center"}}>
          <p style={{margin:0,fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:3}}>Total Payments</p>
          <p style={{margin:0,fontSize:20,fontWeight:700,color:C.text,fontFamily:"'Cormorant Garamond',Georgia,serif"}}>{result.total_payments}</p>
        </div>
        <div style={{background:"#fef2f2",borderRadius:10,padding:"10px 14px",textAlign:"center"}}>
          <p style={{margin:0,fontSize:10,color:"#9a3412",textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:3}}>Overdue</p>
          <p style={{margin:0,fontSize:20,fontWeight:700,color:"#dc2626",fontFamily:"'Cormorant Garamond',Georgia,serif"}}>{result.overdue_payments}</p>
        </div>
      </div>
      <div style={{background:cfg.bg,borderRadius:10,padding:"10px 14px",marginBottom:10}}>
        <p style={{margin:"0 0 4px",fontSize:10.5,color:cfg.color,fontWeight:600,textTransform:"uppercase"}}>Analysis</p>
        <p style={{margin:0,fontSize:13,color:C.text}}>{result.reasoning}</p>
      </div>
      <div style={{background:"#eff6ff",borderRadius:10,padding:"10px 14px"}}>
        <p style={{margin:"0 0 4px",fontSize:10.5,color:"#2563eb",fontWeight:600,textTransform:"uppercase"}}>Recommendation</p>
        <p style={{margin:0,fontSize:13,color:C.text}}>{result.recommendation}</p>
      </div>
    </div>
  );
}