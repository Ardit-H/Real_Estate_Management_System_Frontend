import { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/Layout";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";
import { 
  fmtPrice, fmtDate, isPaymentOverdue, TYPE_ICON, LEAD_STATUS_CFG, 
  CONTRACT_STATUS_CFG, PAY_STATUS_CFG, STATUS_CFG_APP, daysUntil 
} from "../../components/client/dashboard/dashboardConstants";
import { CSS } from "../../components/client/dashboard/dashboardStyles";
import { 
  Toast, Shimmer, Pill, SectionHead, Ring, MiniBar, 
  StatCard, PropCard, QuickAction 
} from "../../components/client/dashboard/dashboardComponents";
import ProfileModal from "../../components/client/dashboard/ProfileModal";

// ═══════════════════════════════════════════════════════════════════════════════
export default function ClientDashboard() {
  const { user }  = useContext(AuthContext);
  const navigate  = useNavigate();

  const [clientProfile, setClientProfile] = useState(null);
  const [savedProps,    setSavedProps]    = useState([]);
  const [leads,         setLeads]         = useState([]);
  const [contracts,     setContracts]     = useState([]);
  const [payments,      setPayments]      = useState([]);
  const [saleApps,      setSaleApps]      = useState([]);
  const [rentalApps,    setRentalApps]    = useState([]);
  const [featuredProps, setFeaturedProps] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [profileOpen,   setProfileOpen]   = useState(false);
  const [toast,         setToast]         = useState(null);
  const [greeting,      setGreeting]      = useState("Good morning");

  const notify = useCallback((msg,type="success")=>setToast({msg,type,key:Date.now()}),[]);

  useEffect(()=>{
    const h = new Date().getHours();
    if (h<12) setGreeting("Good morning");
    else if (h<17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  },[]);

  const loadAll = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        api.get("/api/users/clients/me"),                                                          // 0
        api.get("/api/properties/saved?page=0&size=6"),                                            // 1
        api.get("/api/leads/my/client?page=0&size=10"),                                            // 2
        api.get(`/api/contracts/lease/client/${user.id}?page=0&size=10`),                         // 3
        api.get("/api/rentals/applications/my?page=0&size=5"),                                     // 4
        api.get("/api/sales/applications/my?page=0&size=5"),                                       // 5
        api.get("/api/properties/filter?page=0&size=6&status=AVAILABLE&isFeatured=true"),          // 6
      ]);

      if (results[0].status==="fulfilled") setClientProfile(results[0].value.data);
      if (results[1].status==="fulfilled") setSavedProps(results[1].value.data?.content||[]);
      if (results[2].status==="fulfilled") setLeads(results[2].value.data?.content||[]);

      if (results[3].status==="fulfilled") {
        const list = results[3].value.data?.content || results[3].value.data || [];
        setContracts(Array.isArray(list) ? list : []);

        const activeContracts = (Array.isArray(list)?list:[]).filter(c =>
          c.status === "ACTIVE" || c.status === "PENDING_SIGNATURE"
        );
        const allPayments = [];
        await Promise.allSettled(
          activeContracts.map(c =>
            api.get(`/api/payments/contract/${c.id}`)
              .then(r => { if (Array.isArray(r.data)) allPayments.push(...r.data); })
              .catch(()=>{})
          )
        );
        setPayments(allPayments);
      }

      if (results[4].status==="fulfilled") setRentalApps(results[4].value.data?.content||[]);
      if (results[5].status==="fulfilled") setSaleApps(results[5].value.data?.content||[]);
      if (results[6].status==="fulfilled") setFeaturedProps(results[6].value.data?.content||[]);
    } catch {}
    finally { setLoading(false); }
  }, [user?.id]);

  useEffect(()=>{ loadAll(); },[loadAll]);

  // ── Computed ──
  const activeContractsList = contracts.filter(c => c.status === "ACTIVE");
  const activeContractsCount = activeContractsList.length;
  const pendingLeads    = leads.filter(l => l.status==="NEW" || l.status==="IN_PROGRESS").length;
  const overduePayments = payments.filter(p => isPaymentOverdue(p)).length;
  const pendingApps     = [...rentalApps,...saleApps].filter(a => a.status==="PENDING").length;
  const totalRent       = activeContractsList.reduce((s,c) => s + Number(c.rent||0), 0);
  const activeContract  = activeContractsList[0] || null;

  const nextPayment = payments
    .filter(p => p.status === "PENDING" || p.status === "OVERDUE")
    .sort((a,b) => new Date(a.due_date||0) - new Date(b.due_date||0))[0] || null;

  const contractPct = activeContract
    ? Math.max(0, Math.min(100, Math.round(
        ((new Date() - new Date(activeContract.start_date)) /
         (new Date(activeContract.end_date) - new Date(activeContract.start_date))) * 100
      )))
    : 0;
  const days = activeContract ? daysUntil(activeContract.end_date) : null;

  const sparkPayments = (() => {
    const months = Array.from({length:6},(_,i)=>{
      const d = new Date(); d.setMonth(d.getMonth()-5+i);
      return { label:d.toLocaleDateString("en-GB",{month:"short"}), value:0, key:`${d.getFullYear()}-${d.getMonth()}` };
    });
    payments.filter(p=>p.status==="PAID"&&p.paid_date).forEach(p=>{
      const d = new Date(p.paid_date);
      const k = `${d.getFullYear()}-${d.getMonth()}`;
      const m = months.find(m=>m.key===k);
      if (m) m.value += Number(p.amount||0);
    });
    return months;
  })();

  const activities = [
    ...leads.slice(0,3).map(l=>({
      icon: TYPE_ICON[l.type]||"📋",
      title: `${l.type} request — ${LEAD_STATUS_CFG[l.status]?.label||l.status}`,
      sub: `Lead #${l.id}${l.agent_name?` · Agent: ${l.agent_name}`:""}`,
      time: fmtDate(l.created_at),
      dot: LEAD_STATUS_CFG[l.status]?.dot||"#c9b87a",
    })),
    ...rentalApps.slice(0,2).map(a=>({
      icon:"🔑",
      title:`Rental application — ${STATUS_CFG_APP[a.status]?.label||a.status}`,
      sub:`Listing #${a.listing_id}`,
      time:fmtDate(a.created_at),
      dot: STATUS_CFG_APP[a.status]?.dot||"#c9b87a",
    })),
    ...saleApps.slice(0,2).map(a=>({
      icon:"🏠",
      title:`Purchase application — ${STATUS_CFG_APP[a.status]?.label||a.status}`,
      sub:`Listing #${a.listing_id || a.property_id || ""}`,
      time:fmtDate(a.created_at),
      dot: STATUS_CFG_APP[a.status]?.dot||"#c9b87a",
    })),
  ].slice(0,6);

  const firstName = user?.first_name || "there";

  return (
    <MainLayout role="client">
      <style>{CSS}</style>
      <div className="cd">

        {/* ── Hero ── */}
        <div style={{ background:"linear-gradient(160deg,#141210 0%,#1e1a14 45%,#241e16 100%)", minHeight:280, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"36px 32px", position:"relative", overflow:"hidden" }}>
          <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,0.018) 1px,transparent 1px)",backgroundSize:"22px 22px",pointerEvents:"none"}}/>
          <div style={{position:"absolute",top:"-60px",left:"8%",width:320,height:320,borderRadius:"50%",background:"radial-gradient(circle,rgba(201,184,122,0.07) 0%,transparent 70%)",pointerEvents:"none",animation:"cd-glow 4s ease-in-out infinite"}}/>
          <div style={{position:"absolute",bottom:"-40px",right:"8%",width:260,height:260,borderRadius:"50%",background:"radial-gradient(circle,rgba(126,184,164,0.05) 0%,transparent 70%)",pointerEvents:"none"}}/>
          <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:"linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)"}}/>

          <button onClick={()=>setProfileOpen(true)} className="cd-btn"
            style={{ position:"absolute", top:18, right:24, padding:"7px 14px", background:"rgba(201,184,122,0.08)", color:"rgba(245,240,232,0.55)", border:"1px solid rgba(201,184,122,0.15)", borderRadius:9, fontSize:11.5, fontWeight:500, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", gap:6, zIndex:2 }}>
            ✏️ Edit Profile
          </button>

          <div style={{ position:"relative", zIndex:1, maxWidth:700, width:"100%", textAlign:"center" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(201,184,122,0.1)", border:"1px solid rgba(201,184,122,0.18)", borderRadius:999, padding:"5px 16px 5px 8px", marginBottom:16 }}>
              <div style={{ width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg,#c9b87a,#b0983e)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"#1a1714" }}>
                {firstName[0]?.toUpperCase()}
              </div>
              <span style={{ fontSize:11, fontWeight:600, color:"#c9b87a", letterSpacing:"0.8px" }}>{greeting}, {firstName}</span>
            </div>

            <h1 style={{ margin:"0 0 10px", fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"clamp(26px,3.5vw,42px)", fontWeight:700, color:"#f5f0e8", letterSpacing:"-0.7px", lineHeight:1.1 }}>
              Your{" "}
              <span style={{ background:"linear-gradient(90deg,#c9b87a,#e8d9a0,#c9b87a)", backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>Real Estate</span>
              {" "}Dashboard
            </h1>
            <p style={{ margin:"0 auto 28px", fontSize:13.5, color:"rgba(245,240,232,0.38)", lineHeight:1.6 }}>
              Everything about your properties, contracts and applications — at a glance.
            </p>

            {/* Quick pills */}
            {!loading && (
              <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
                {[
                  { label:"Saved",     value:savedProps.length,     dot:"#c9b87a" },
                  { label:"Requests",  value:leads.length,          dot:"#a4b07e" },
                  { label:"Contracts", value:contracts.length,      dot:"#7eb8a4" },
                  { label:"Overdue",   value:overduePayments,       dot:overduePayments>0?"#d4855a":"#a0997e" },
                ].map(s=>(
                  <div key={s.label} style={{ background:"rgba(245,240,232,0.06)", backdropFilter:"blur(10px)", borderRadius:12, padding:"9px 16px", border:"1px solid rgba(245,240,232,0.1)", display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                    <span style={{ fontSize:20, fontWeight:700, color:s.dot, fontFamily:"'Cormorant Garamond',Georgia,serif", lineHeight:1 }}>{s.value}</span>
                    <span style={{ fontSize:10, color:"rgba(245,240,232,0.35)", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.8px" }}>{s.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Content ── */}
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"24px 24px 48px" }}>

          {/* Stat cards */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(175px,1fr))", gap:12, marginBottom:28 }}>
            <StatCard icon="❤️"  label="Saved Properties"    value={savedProps.length}       color="#d4855a"                             loading={loading} onClick={()=>navigate("/client/savedproperties")}/>
            <StatCard icon="📋"  label="Active Requests"     value={pendingLeads}            sub={`${leads.length} total`} color="#c9b87a" loading={loading} onClick={()=>navigate("/client/leads")}/>
            <StatCard icon="📄"  label="Active Contracts"    value={activeContractsCount}    sub={totalRent>0?`€${totalRent.toLocaleString("de-DE")}/mo`:undefined} color="#7eb8a4" loading={loading} onClick={()=>navigate("/client/mycontracts")}/>
            <StatCard icon="💳"  label="Overdue Payments"    value={overduePayments}         color={overduePayments>0?"#d4855a":"#a4b07e"} loading={loading} onClick={()=>navigate("/client/mypayments")}/>
            <StatCard icon="✉️"  label="Pending Applications" value={pendingApps}            color="#a4b07e"                             loading={loading}/>
          </div>

          {/* Contract + Payment widgets */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:28 }}>

            {/* Active Contract */}
            <div style={{ background:"#fff", borderRadius:14, border:"1.5px solid #ece6da", padding:"18px 20px", boxShadow:"0 2px 16px rgba(20,16,10,0.07)" }}>
              <p style={{ fontSize:10, fontWeight:700, color:"#b0a890", textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:12 }}>📄 Active Contract</p>
              {loading ? (<><Shimmer h={20} r={6}/><div style={{marginTop:8}}/><Shimmer h={20} r={6} w="70%"/></>) :
               activeContract ? (
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                    <Ring pct={contractPct} size={60} color="#7eb8a4">
                      <span style={{ fontSize:11, fontWeight:700, color:"#2a6049" }}>{contractPct}%</span>
                    </Ring>
                    <div>
                      <p style={{ margin:"0 0 3px", fontSize:15, fontWeight:700, color:"#1a1714", fontFamily:"'Cormorant Garamond',Georgia,serif" }}>Property #{activeContract.property_id}</p>
                      <p style={{ margin:0, fontSize:12, color:"#9a8c6e" }}>{fmtDate(activeContract.start_date)} → {fmtDate(activeContract.end_date)}</p>
                    </div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    {[
                      { label:"Monthly Rent", value:fmtPrice(activeContract.rent) },
                      { label:"Deposit",      value:fmtPrice(activeContract.deposit) },
                      { label:"Days Left",    value:days!=null?`${days}d`:"—" },
                      { label:"Status",       value:<Pill status={activeContract.status} cfg={CONTRACT_STATUS_CFG}/> },
                    ].map(({label,value})=>(
                      <div key={label} style={{ background:"#f8f5f0", borderRadius:8, padding:"9px 11px" }}>
                        <p style={{ fontSize:9.5, color:"#b0a890", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.7px", marginBottom:3 }}>{label}</p>
                        <div style={{ fontSize:13, fontWeight:700, color:"#1a1714", fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{value}</div>
                      </div>
                    ))}
                  </div>
                  {days!=null && days<=30 && days>0 && (
                    <div style={{ marginTop:12, background:"rgba(201,184,122,0.08)", border:"1.5px solid rgba(201,184,122,0.22)", borderRadius:9, padding:"8px 12px", fontSize:12, color:"#c9b87a", display:"flex", alignItems:"center", gap:6 }}>
                      ⚠️ Contract expires in <strong>{days} days</strong>
                    </div>
                  )}
                  {activeContractsCount > 1 && (
                    <button className="cd-btn" onClick={()=>navigate("/client/mycontracts")}
                      style={{ marginTop:12, fontSize:11.5, color:"#8a7d5e", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", textDecoration:"underline" }}>
                      +{activeContractsCount-1} more contract{activeContractsCount-1>1?"s":""}
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ textAlign:"center", padding:"24px 0", color:"#b0a890" }}>
                  <p style={{ fontSize:13.5, fontFamily:"'Cormorant Garamond',Georgia,serif", color:"#8a7d5e", fontStyle:"italic" }}>No active contracts</p>
                  <button className="cd-btn" onClick={()=>navigate("/client/browseproperties")}
                    style={{ marginTop:10, background:"linear-gradient(135deg,#c9b87a,#b0983e)", color:"#1a1714", border:"none", borderRadius:9, padding:"7px 16px", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                    Browse Properties →
                  </button>
                </div>
              )}
            </div>

            {/* Payment Overview */}
            <div style={{ background:"#fff", borderRadius:14, border:"1.5px solid #ece6da", padding:"18px 20px", boxShadow:"0 2px 16px rgba(20,16,10,0.07)" }}>
              <p style={{ fontSize:10, fontWeight:700, color:"#b0a890", textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:12 }}>💳 Payment Overview</p>
              {loading ? (<><Shimmer h={20} r={6}/><div style={{marginTop:8}}/><Shimmer h={40} r={6}/></>) : (
                <div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:14 }}>
                    {[
                      { label:"Total",   value:payments.length,                                  color:"#1a1714" },
                      { label:"Pending", value:payments.filter(p=>p.status==="PENDING").length,  color:"#9a7a30" },
                      { label:"Overdue", value:overduePayments,                                  color:overduePayments>0?"#8b4513":"#2a6049" },
                    ].map(s=>(
                      <div key={s.label} style={{ background:"#f8f5f0", borderRadius:8, padding:"9px 11px", textAlign:"center" }}>
                        <p style={{ fontSize:9.5, color:"#b0a890", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.7px", marginBottom:3 }}>{s.label}</p>
                        <p style={{ margin:0, fontSize:20, fontWeight:700, color:s.color, fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{s.value}</p>
                      </div>
                    ))}
                  </div>

                  {nextPayment ? (
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14, padding:"12px 14px", background:isPaymentOverdue(nextPayment)?"rgba(212,133,90,0.08)":"rgba(201,184,122,0.08)", borderRadius:10, border:`1.5px solid ${isPaymentOverdue(nextPayment)?"rgba(212,133,90,0.25)":"rgba(201,184,122,0.22)"}` }}>
                      <div>
                        <p style={{ margin:"0 0 2px", fontSize:11, color:"#b0a890", textTransform:"uppercase", letterSpacing:"0.6px", fontWeight:600 }}>Next Due</p>
                        <p style={{ margin:0, fontSize:20, fontWeight:700, color:"#1a1714", fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{fmtPrice(nextPayment.amount)}</p>
                        <p style={{ margin:"2px 0 0", fontSize:12, color:"#9a8c6e" }}>{fmtDate(nextPayment.due_date)}</p>
                      </div>
                      <div style={{ marginLeft:"auto" }}>
                        <Pill status={isPaymentOverdue(nextPayment)?"OVERDUE":nextPayment.status} cfg={PAY_STATUS_CFG}/>
                      </div>
                    </div>
                  ) : payments.length > 0 ? (
                    <div style={{ padding:"10px 14px", background:"rgba(126,184,164,0.08)", borderRadius:10, border:"1.5px solid rgba(126,184,164,0.22)", fontSize:12.5, color:"#2a6049", display:"flex", alignItems:"center", gap:6, marginBottom:14 }}>
                      ✅ No pending or overdue payments
                    </div>
                  ) : (
                    <p style={{ fontSize:13.5, fontFamily:"'Cormorant Garamond',Georgia,serif", color:"#8a7d5e", fontStyle:"italic", marginBottom:14 }}>No payments found</p>
                  )}

                  {sparkPayments.some(s=>s.value>0) && (
                    <div>
                      <p style={{ fontSize:10, color:"#b0a890", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.7px", marginBottom:8 }}>Payment Trend (6mo)</p>
                      <MiniBar data={sparkPayments} color="#7eb8a4"/>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ marginBottom:28 }}>
            <SectionHead title="Quick Actions" sub="Jump to any section"/>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:12 }}>
              <QuickAction icon="🏠" label="Browse"    desc="Find properties"  color="#c9b87a" onClick={()=>navigate("/client/browseproperties")}/>
              <QuickAction icon="❤️" label="Saved"     desc="Your favourites"  color="#d4855a" onClick={()=>navigate("/client/savedproperties")}/>
              <QuickAction icon="📋" label="Requests"  desc="Lead requests"    color="#a4b07e" onClick={()=>navigate("/client/leads")}/>
              <QuickAction icon="📄" label="Contracts" desc="Lease agreements" color="#7eb8a4" onClick={()=>navigate("/client/mycontracts")}/>
              <QuickAction icon="💳" label="Payments"  desc="Payment history"  color="#c9b87a" onClick={()=>navigate("/client/mypayments")}/>
            </div>
          </div>

          {/* Featured Properties */}
          <div style={{ marginBottom:28 }}>
            <SectionHead title="Featured Properties" sub="Handpicked listings for you" action="Browse All" onAction={()=>navigate("/client/browseproperties")}/>
            {loading ? (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:14 }}>
                {[0,1,2,3].map(i=><Shimmer key={i} h={260} r={14}/>)}
              </div>
            ) : featuredProps.length===0 ? (
              <div style={{ background:"#fff", borderRadius:14, border:"1.5px solid #ece6da", padding:"40px 20px", textAlign:"center", color:"#b0a890" }}>
                <p style={{ fontSize:13.5, fontFamily:"'Cormorant Garamond',Georgia,serif", color:"#8a7d5e", fontStyle:"italic" }}>No featured properties at the moment.</p>
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:14 }}>
                {featuredProps.map((p,i)=>(
                  <PropCard key={p.id} item={p} idx={i} onClick={()=>navigate("/client/browseproperties")}/>
                ))}
              </div>
            )}
          </div>

          {/* Requests + Applications */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:28 }}>

            {/* My Requests */}
            <div>
              <SectionHead title="My Requests" sub={`${leads.length} total`} action="View All" onAction={()=>navigate("/client/leads")}/>
              {loading ? <div style={{display:"flex",flexDirection:"column",gap:8}}>{[0,1,2].map(i=><Shimmer key={i} h={60} r={11}/>)}</div> :
               leads.length===0 ? (
                <div style={{ background:"#fff", borderRadius:12, border:"1.5px solid #ece6da", padding:"28px 20px", textAlign:"center" }}>
                  <p style={{ fontSize:13.5, fontFamily:"'Cormorant Garamond',Georgia,serif", color:"#8a7d5e", fontStyle:"italic" }}>No requests yet.</p>
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {leads.slice(0,4).map((l,i) => {
                    const s = LEAD_STATUS_CFG[l.status]||LEAD_STATUS_CFG.NEW;
                    return (
                      <div key={l.id} style={{ background:"#fff", borderRadius:11, border:"1.5px solid #ece6da", padding:"11px 14px", display:"flex", alignItems:"center", gap:11, animation:`cd-fade-in 0.35s ease ${i*0.06}s both` }}>
                        <div style={{ width:36, height:36, borderRadius:10, background:`${s.dot}18`, border:`1.5px solid ${s.dot}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, flexShrink:0 }}>{TYPE_ICON[l.type]||"📋"}</div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ margin:"0 0 2px", fontSize:13, fontWeight:700, color:"#1a1714", fontFamily:"'Cormorant Garamond',Georgia,serif", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{l.type}</p>
                          <p style={{ margin:0, fontSize:11, color:"#b0a890" }}>#{l.id} · {fmtDate(l.created_at)}</p>
                        </div>
                        <Pill status={l.status} cfg={LEAD_STATUS_CFG}/>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Applications */}
            <div>
              <SectionHead title="Applications" sub="Rental & purchase"/>
              {loading ? <div style={{display:"flex",flexDirection:"column",gap:8}}>{[0,1,2].map(i=><Shimmer key={i} h={60} r={11}/>)}</div> : (
                (() => {
                  const apps = [
                    ...rentalApps.slice(0,2).map(a=>({...a, _type:"rental"})),
                    ...saleApps.slice(0,2).map(a=>({...a, _type:"sale"})),
                  ];
                  return apps.length===0 ? (
                    <div style={{ background:"#fff", borderRadius:12, border:"1.5px solid #ece6da", padding:"28px 20px", textAlign:"center" }}>
                      <p style={{ fontSize:13.5, fontFamily:"'Cormorant Garamond',Georgia,serif", color:"#8a7d5e", fontStyle:"italic" }}>No applications yet.</p>
                    </div>
                  ) : (
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      {apps.map((a,i) => (
                        <div key={`${a._type}-${a.id}`} style={{ background:"#fff", borderRadius:11, border:"1.5px solid #ece6da", padding:"11px 14px", display:"flex", alignItems:"center", gap:11, animation:`cd-fade-in 0.3s ease ${i*0.05}s both` }}>
                          <span style={{ fontSize:17, flexShrink:0 }}>{a._type==="rental"?"🔑":"🏠"}</span>
                          <div style={{ flex:1, minWidth:0 }}>
                            <p style={{ margin:"0 0 2px", fontSize:13, fontWeight:700, color:"#1a1714", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                              {a._type==="rental" ? `Listing #${a.listing_id}` : `Listing #${a.listing_id||a.property_id||""}`}
                            </p>
                            <p style={{ margin:0, fontSize:11, color:"#b0a890" }}>{a._type==="rental"?"Rental":"Purchase"} · {fmtDate(a.created_at)}</p>
                          </div>
                          <Pill status={a.status} cfg={STATUS_CFG_APP}/>
                        </div>
                      ))}
                    </div>
                  );
                })()
              )}
            </div>
          </div>

          {/* Activity Feed */}
          <div>
            <SectionHead title="Recent Activity" sub="Latest updates across your account"/>
            {loading ? (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {[0,1,2].map(i=><Shimmer key={i} h={56} r={10}/>)}
              </div>
            ) : activities.length===0 ? (
              <div style={{ background:"#fff", borderRadius:14, border:"1.5px solid #ece6da", padding:"40px 20px", textAlign:"center" }}>
                <p style={{ fontSize:13.5, fontFamily:"'Cormorant Garamond',Georgia,serif", color:"#8a7d5e", fontStyle:"italic" }}>No recent activity yet.</p>
              </div>
            ) : (
              <div style={{ background:"#fff", borderRadius:14, border:"1.5px solid #ece6da", overflow:"hidden", boxShadow:"0 2px 16px rgba(20,16,10,0.07)" }}>
                {activities.map((a,i)=>(
                  <div key={i}>
                    <div className="cd-item" style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"11px 14px", borderRadius:0, animation:`cd-fade-in 0.35s ease ${i*0.06}s both` }}>
                      <div style={{ width:34, height:34, borderRadius:10, background:`${a.dot}18`, border:`1.5px solid ${a.dot}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>{a.icon}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ margin:"0 0 2px", fontSize:13, fontWeight:600, color:"#1a1714", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.title}</p>
                        <p style={{ margin:0, fontSize:11.5, color:"#9a8c6e" }}>{a.sub}</p>
                      </div>
                      <span style={{ fontSize:11, color:"#b0a890", whiteSpace:"nowrap", flexShrink:0 }}>{a.time}</span>
                    </div>
                    {i<activities.length-1 && <div style={{ height:1, background:"#f0ece3", margin:"0 14px" }}/>}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {profileOpen && (
        <ProfileModal user={user} profile={clientProfile} onClose={()=>setProfileOpen(false)}
          onSuccess={()=>{ setProfileOpen(false); loadAll(); notify("Profile updated ✓"); }}
          notify={notify}/>
      )}
      {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}
    </MainLayout>
  );
}