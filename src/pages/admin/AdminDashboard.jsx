import MainLayout from "../../components/layout/Layout";
import { useDashboardStats } from "../../hooks/usePropertyCache";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  dark: "#1a1714", gold: "#c9b87a", goldL: "#e8d9a0",
  border: "#e8e2d6", surface: "#faf7f2", muted: "#9a8c6e",
  text: "#1a1714", textMut: "#b0a890", textSub: "#6b6340",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
  .ad *{box-sizing:border-box}
  .ad{font-family:'DM Sans',system-ui,sans-serif;background:#f2ede4;min-height:100vh}
  .ad-btn{transition:all .17s ease;cursor:pointer;font-family:'DM Sans',sans-serif;border:none}
  .ad-btn:hover{opacity:.85;transform:translateY(-1px)}
  .ad-card{background:#faf7f2;border:1.5px solid #e8e2d6;border-radius:14px;box-shadow:0 2px 16px rgba(20,16,10,.06);overflow:hidden}
  .ad-row{transition:background .15s}
  .ad-row:hover{background:#f5f0e8!important}
  @keyframes ad-fade-up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes ad-spin{to{transform:rotate(360deg)}}
  @keyframes ad-pulse{0%,100%{opacity:.38}50%{opacity:.82}}
  .ad-card{animation:ad-fade-up .35s ease both}
  .ad-stat{background:#faf7f2;border:1.5px solid #e8e2d6;border-radius:14px;box-shadow:0 2px 16px rgba(20,16,10,.06);padding:18px 20px;transition:box-shadow .2s,transform .2s;animation:ad-fade-up .35s ease both}
  .ad-stat:hover{box-shadow:0 6px 28px rgba(20,16,10,.10);transform:translateY(-2px)}
  .ad-skeleton{background:#ede9df;border-radius:10px;animation:ad-pulse 1.5s ease infinite}
  .risk-input{width:100%;padding:9px 13px;border:1.5px solid #e8e2d6;border-radius:9px;font-size:13px;color:#1a1714;background:#faf7f2;font-family:'DM Sans',sans-serif;outline:none;transition:border-color .2s}
  .risk-input:focus{border-color:#8a7d5e;box-shadow:0 0 0 3px rgba(138,125,94,.13)}
`;

const PROP_EMOJI = {
  APARTMENT:"🏢", HOUSE:"🏠", VILLA:"🏡",
  LAND:"🌿", COMMERCIAL:"🏬", OFFICE:"🏛️",
};

const LISTING_BADGE = {
  SALE: { bg:"#eff6ff", color:"#2563eb" },
  RENT: { bg:"#f5f3ff", color:"#7c3aed" },
  BOTH: { bg:"#ecfdf5", color:"#059669" },
};

const STATUS_BADGE = {
  AVAILABLE: { bg:"#ecfdf5", color:"#059669" },
  SOLD:      { bg:"#f0ece3", color:"#6b6340" },
  RENTED:    { bg:"#eff6ff", color:"#2563eb" },
  PENDING:   { bg:"#fffbeb", color:"#d97706" },
  INACTIVE:  { bg:"#f1f5f9", color:"#64748b" },
};

const RISK_CFG = {
  LOW:      { color:"#059669", bg:"#ecfdf5", bar:"#059669" },
  MEDIUM:   { color:"#d97706", bg:"#fffbeb", bar:"#d97706" },
  HIGH:     { color:"#ea580c", bg:"#fff7ed", bar:"#ea580c" },
  CRITICAL: { color:"#dc2626", bg:"#fef2f2", bar:"#dc2626" },
};

const fmtMoney = v => v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";
const fmtDate  = d => d ? new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }) : "—";

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ rows=4, h=44 }) {
  return (
    <div style={{padding:"14px 16px",display:"flex",flexDirection:"column",gap:8}}>
      {Array.from({length:rows}).map((_,i)=>(
        <div key={i} className="ad-skeleton" style={{height:h,opacity:1-i*0.15}}/>
      ))}
    </div>
  );
}

function EmptyRow({ icon, text }) {
  return (
    <div style={{padding:"36px 20px",textAlign:"center",color:C.textMut}}>
      <div style={{fontSize:30,marginBottom:8}}>{icon}</div>
      <p style={{fontSize:13,margin:0}}>{text}</p>
    </div>
  );
}

// ─── AI Payment Risk Panel ────────────────────────────────────────────────────
function PaymentRiskPanel({ clientId }) {
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

function AiPaymentRiskClientSearch() {
  const [inputVal, setInputVal] = useState("");
  const [clientId, setClientId] = useState(null);

  const handleAnalyze = () => {
    const id = parseInt(inputVal, 10);
    if (id > 0) setClientId(id);
  };

  return (
    <div>
      <div style={{display:"flex",gap:10,marginBottom:16,maxWidth:420}}>
        <input
          className="risk-input"
          type="number" min="1"
          placeholder="Enter client ID..."
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAnalyze()}
        />
        <button className="ad-btn" onClick={handleAnalyze} disabled={!inputVal}
          style={{padding:"9px 18px",borderRadius:9,background:inputVal?C.dark:"#e8e2d6",color:inputVal?C.goldL:C.textMut,fontSize:13,fontWeight:600,border:`1px solid ${inputVal?C.gold+"40":"transparent"}`,flexShrink:0}}>
          ✨ Analyze
        </button>
        {clientId && (
          <button className="ad-btn" onClick={() => { setClientId(null); setInputVal(""); }}
            style={{padding:"9px 14px",borderRadius:9,border:`1.5px solid ${C.border}`,background:"transparent",color:C.textSub,fontSize:13,fontWeight:500,flexShrink:0}}>
            Clear
          </button>
        )}
      </div>
      {clientId && <PaymentRiskPanel key={clientId} clientId={clientId} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data: apiStats, isLoading } = useDashboardStats();

  const [recentProps,    setRecentProps]    = useState([]);
  const [propsLoading,   setPropsLoading]   = useState(true);

  // Fetch recent properties nga API
  useEffect(() => {
    setPropsLoading(true);
    api.get("/api/properties/filter?page=0&size=5&status=AVAILABLE&sort=createdAt,desc")
      .then(r => setRecentProps(r.data.content || []))
      .catch(() => setRecentProps([]))
      .finally(() => setPropsLoading(false));
  }, []);

  const stats = apiStats ? [
    {
      label: "Total Properties",
      value: String((apiStats.available_properties ?? 0) + (apiStats.sold_properties ?? 0) + (apiStats.rented_properties ?? 0)),
      delta: "+live", up: true,
      accent: "#7c3aed", accentBg: "#f5f3ff",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    },
    {
      label: "Active Leases",
      value: String(apiStats.active_leases ?? 0),
      delta: "live", up: true,
      accent: "#2563eb", accentBg: "#eff6ff",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2 10.58 12.42M13 7l3 3M18 2l3 3-6 6-3-3"/></svg>,
    },
    {
      label: "Total Revenue",
      value: `€${Number(apiStats.total_revenue ?? 0).toLocaleString("de-DE")}`,
      delta: "PAID", up: true,
      accent: "#059669", accentBg: "#ecfdf5",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
    },
    {
      label: "Open Leads",
      value: String(apiStats.pending_leads ?? 0),
      delta: "NEW", up: true,
      accent: "#d97706", accentBg: "#fffbeb",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
    },
  ] : [];

  if (isLoading) {
    return (
      <MainLayout role="admin">
        <style>{CSS}</style>
        <div className="ad">
          <div style={{background:"linear-gradient(160deg,#1a1714 0%,#1e1a14 50%,#241e16 100%)",minHeight:180,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,.018) 1px,transparent 1px)",backgroundSize:"22px 22px",pointerEvents:"none"}}/>
            <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:`linear-gradient(90deg,transparent,${C.gold} 30%,${C.gold} 70%,transparent)`}}/>
            <div style={{width:28,height:28,border:`2.5px solid rgba(201,184,122,.3)`,borderTop:`2.5px solid ${C.gold}`,borderRadius:"50%",animation:"ad-spin .7s linear infinite",position:"relative",zIndex:1}}/>
          </div>
          <div style={{textAlign:"center",padding:"48px 0"}}>
            <p style={{color:C.textMut,fontSize:13,fontFamily:"'DM Sans',sans-serif"}}>Duke ngarkuar dashboard...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout role="admin">
      <style>{CSS}</style>
      <div className="ad">

        {/* ── HERO ── */}
        <div style={{background:"linear-gradient(160deg,#1a1714 0%,#1e1a14 50%,#241e16 100%)",minHeight:180,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"36px 32px",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,.018) 1px,transparent 1px)",backgroundSize:"22px 22px",pointerEvents:"none"}}/>
          <div style={{position:"absolute",top:"-60px",left:"10%",width:300,height:300,borderRadius:"50%",background:"radial-gradient(circle,rgba(201,184,122,0.07) 0%,transparent 70%)",pointerEvents:"none"}}/>
          <div style={{position:"absolute",bottom:"-40px",right:"10%",width:240,height:240,borderRadius:"50%",background:"radial-gradient(circle,rgba(126,184,164,0.05) 0%,transparent 70%)",pointerEvents:"none"}}/>
          <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:`linear-gradient(90deg,transparent,${C.gold} 30%,${C.gold} 70%,transparent)`}}/>
          <div style={{position:"relative",zIndex:1,textAlign:"center",flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",width:"100%"}}>
            <p style={{margin:"0 0 8px",fontSize:10,fontWeight:600,color:C.gold,textTransform:"uppercase",letterSpacing:"2.5px"}}>Admin · Overview</p>
            <h1 style={{margin:"0 0 8px",fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"clamp(24px,3vw,36px)",fontWeight:700,color:"#f5f0e8",letterSpacing:"-0.4px"}}>
              Admin{" "}
              <span style={{background:`linear-gradient(90deg,${C.gold},${C.goldL})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Dashboard</span>
            </h1>
            <p style={{margin:"0 0 20px",fontSize:13,color:"rgba(245,240,232,.38)"}}>Welcome back — here's what's happening today.</p>
            <div style={{display:"flex",gap:10}}>
              <button className="ad-btn"
                onClick={() => navigate("/admin/properties")}
                style={{padding:"8px 18px",borderRadius:9,background:C.gold,color:C.dark,fontSize:13,fontWeight:600,border:"none"}}>
                + Add Property
              </button>
              <button className="ad-btn"
                onClick={() => navigate("/admin/agents")}
                style={{padding:"8px 18px",borderRadius:9,background:"rgba(245,240,232,0.08)",color:"rgba(245,240,232,0.6)",fontSize:13,fontWeight:500,border:"1px solid rgba(201,184,122,0.16)"}}>
                👤 Agents
              </button>
              <button className="ad-btn"
                onClick={() => navigate("/admin/clients")}
                style={{padding:"8px 18px",borderRadius:9,background:"rgba(245,240,232,0.08)",color:"rgba(245,240,232,0.6)",fontSize:13,fontWeight:500,border:"1px solid rgba(201,184,122,0.16)"}}>
                🤝 Clients
              </button>
            </div>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div style={{padding:"24px 28px",maxWidth:1200,margin:"0 auto"}}>

          {/* Stat cards */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:14,marginBottom:24}}>
            {stats.map((s,i) => (
              <div key={s.label} className="ad-stat" style={{animationDelay:`${i*0.06}s`}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                  <div style={{width:38,height:38,borderRadius:10,background:s.accentBg,border:`1.5px solid ${s.accent}28`,display:"flex",alignItems:"center",justifyContent:"center"}}>{s.icon}</div>
                  <span style={{fontSize:10,fontWeight:600,color:s.up?"#059669":"#dc2626",background:s.up?"#ecfdf5":"#fef2f2",padding:"2px 8px",borderRadius:20}}>{s.delta}</span>
                </div>
                <p style={{margin:"0 0 3px",fontSize:9.5,fontWeight:600,color:C.textMut,textTransform:"uppercase",letterSpacing:"0.8px"}}>{s.label}</p>
                <p style={{margin:0,fontSize:22,fontWeight:700,color:C.text,fontFamily:"'Cormorant Garamond',Georgia,serif",lineHeight:1}}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Recent Properties — nga API */}
          <div className="ad-card" style={{marginBottom:24}}>
            <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.border}`,background:"#fdf9f4",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <p style={{margin:0,fontSize:15,fontWeight:700,color:C.text,fontFamily:"'Cormorant Garamond',Georgia,serif"}}>Recent Properties</p>
             
            </div>

            {propsLoading ? <Skeleton rows={5} h={48}/> :
             recentProps.length === 0 ? <EmptyRow icon="🏠" text="No properties found"/> : (
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontFamily:"'DM Sans',sans-serif"}}>
                  <thead>
                    <tr style={{background:"#f0ece3",borderBottom:`1px solid ${C.border}`}}>
                      {["Title","Type","Listing","Status","Price","Agent","Created"].map(h=>(
                        <th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:10,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:"0.7px",whiteSpace:"nowrap"}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentProps.map(p => {
                      const listBadge = LISTING_BADGE[p.listing_type || p.listingType] || {bg:"#f0ece3",color:C.textSub};
                      const statBadge = STATUS_BADGE[p.status] || {bg:"#f1f5f9",color:"#64748b"};
                      return (
                        <tr key={p.id} className="ad-row" style={{borderBottom:`1px solid ${C.border}`}}>
                          <td style={{padding:"12px 14px",fontWeight:500,fontSize:13,color:C.text,maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                            <span style={{marginRight:6}}>{PROP_EMOJI[p.type]||"🏠"}</span>
                            {p.title}
                          </td>
                          <td style={{padding:"12px 14px",fontSize:12.5,color:C.textSub}}>{p.type}</td>
                          <td style={{padding:"12px 14px"}}>
                            <span style={{background:listBadge.bg,color:listBadge.color,padding:"2px 9px",borderRadius:20,fontSize:10,fontWeight:600}}>
                              {p.listing_type || p.listingType}
                            </span>
                          </td>
                          <td style={{padding:"12px 14px"}}>
                            <span style={{background:statBadge.bg,color:statBadge.color,padding:"2px 9px",borderRadius:20,fontSize:10,fontWeight:600}}>
                              {p.status}
                            </span>
                          </td>
                          <td style={{padding:"12px 14px",fontWeight:600,fontSize:13,color:C.text}}>{fmtMoney(p.price)}</td>
                          <td style={{padding:"12px 14px",fontSize:12.5,color:C.textSub}}>
                            {p.agent_id || p.agentId ? `#${p.agent_id || p.agentId}` : "—"}
                          </td>
                          <td style={{padding:"12px 14px",fontSize:12,color:C.textMut}}>{fmtDate(p.created_at || p.createdAt)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* AI Payment Risk */}
          <div className="ad-card">
            <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.border}`,background:"#fdf9f4",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <p style={{margin:0,fontSize:15,fontWeight:700,color:C.text,fontFamily:"'Cormorant Garamond',Georgia,serif"}}>AI Payment Risk Analysis</p>
              <span style={{fontSize:11,color:C.textMut,background:`${C.gold}22`,padding:"2px 9px",borderRadius:20,fontWeight:500}}>AI · Beta</span>
            </div>
            <div style={{padding:"16px 20px"}}>
              <p style={{fontSize:13,color:C.textSub,marginBottom:16,lineHeight:1.6}}>
                Enter a client ID to analyze their payment behavior and risk score using AI.
              </p>
              <AiPaymentRiskClientSearch />
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}