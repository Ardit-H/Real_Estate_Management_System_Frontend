import MainLayout from "../../components/layout/Layout";
import { useDashboardStats } from "../../hooks/usePropertyCache";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { C, PROP_EMOJI, LISTING_BADGE, STATUS_BADGE, fmtMoney, fmtDate } from "../../components/admin/dashboard/dashboardConstants";
import { CSS } from "../../components/admin/dashboard/dashboardStyles";
import { Skeleton, EmptyRow } from "../../components/admin/dashboard/dashboardComponents";
import AiPaymentRiskClientSearch from "../../components/admin/dashboard/AiPaymentRiskClientSearch";

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
                onClick={() => navigate("/admin/AllProperties")}
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