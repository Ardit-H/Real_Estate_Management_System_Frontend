import { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/Layout";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";
 
import { CSS, C, fmtMoney, fmtDate, LEAD_STATUS_COLOR, CONTRACT_STATUS_COLOR, PAYMENT_STATUS_COLOR } from "../../components/agent/performance/performanceConstants.js";
import { Toast, Skeleton, EmptyRow, StatCard, SectionHeader, ProgressRing, BarRow } from "../../components/agent/performance/PerformanceUI.jsx";
 
export default function MyPerformance() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
 
  const [stats, setStats] = useState({ totalProperties:null, activeContracts:null, totalRevenue:null, pendingLeads:null, doneLeads:null, totalLeads:null, activeLeads:null, expiringSoon:null });
  const [leads,          setLeads]          = useState([]);
  const [leadsLoading,   setLeadsLoading]   = useState(true);
  const [contracts,      setContracts]      = useState([]);
  const [contractsLoading, setContractsLoading] = useState(true);
  const [payments,       setPayments]       = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [saleContracts,  setSaleContracts]  = useState([]);
  const [saleLoading,    setSaleLoading]    = useState(true);
 
  const notify = useCallback((msg, type="success") => setToast({ msg, type, key:Date.now() }), []);
 
  useEffect(() => {
    if (!user?.id) return;
 
    api.get(`/api/properties/agent/${user.id}?page=0&size=1`)
      .then(r => setStats(s => ({ ...s, totalProperties:r.data.totalElements ?? (r.data.content||[]).length })))
      .catch(() => {});
 
    setLeadsLoading(true);
    api.get("/api/leads/my/agent?page=0&size=50")
      .then(r => {
        const list = r.data.content || [];
        setLeads(list.slice(0,6));
        setStats(s => ({ ...s, totalLeads:list.length, pendingLeads:list.filter(l=>l.status==="NEW").length, activeLeads:list.filter(l=>l.status==="IN_PROGRESS").length, doneLeads:list.filter(l=>l.status==="DONE").length }));
      })
      .catch(() => {})
      .finally(() => setLeadsLoading(false));
 
    setContractsLoading(true);
    api.get(`/api/contracts/lease/agent/${user.id}?page=0&size=50`)
      .then(r => {
        const list = r.data.content || [];
        setContracts(list.slice(0,5));
        setStats(s => ({ ...s, activeContracts:list.filter(c=>c.status==="ACTIVE").length }));
      })
      .catch(() => {})
      .finally(() => setContractsLoading(false));
 
    api.get("/api/payments/revenue").then(r => setStats(s => ({ ...s, totalRevenue:r.data }))).catch(() => {});
    api.get("/api/contracts/lease/expiring").then(r => setStats(s => ({ ...s, expiringSoon:Array.isArray(r.data)?r.data.length:0 }))).catch(() => {});
 
    setPaymentsLoading(true);
    api.get("/api/payments/status/PAID?page=0&size=5").then(r => setPayments(r.data.content||[])).catch(() => {}).finally(() => setPaymentsLoading(false));
 
    setSaleLoading(true);
    api.get(`/api/sales/contracts/agent/${user.id}?page=0&size=5`).then(r => setSaleContracts(r.data.content||[])).catch(() => {}).finally(() => setSaleLoading(false));
  }, [user?.id]);
 
  const conversionRate = stats.totalLeads > 0 ? Math.round((stats.doneLeads / stats.totalLeads) * 100) : 0;
 
  return (
    <MainLayout role="agent">
      <style>{CSS}</style>
      <div className="mp">
 
        {/* ── HERO ── */}
        <div style={{ background:`linear-gradient(160deg, ${C.dark} 0%, #1e1a14 50%, #241e16 100%)`, minHeight:190, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"36px 32px", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(rgba(255,255,255,0.018) 1px,transparent 1px)", backgroundSize:"22px 22px", pointerEvents:"none" }} />
          <div style={{ position:"absolute", top:"-60px", right:"8%", width:280, height:280, borderRadius:"50%", background:"radial-gradient(circle,rgba(201,184,122,0.07) 0%,transparent 70%)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:`linear-gradient(90deg,transparent,${C.gold} 30%,${C.gold} 70%,transparent)` }} />
          <div style={{ position:"relative", zIndex:1, textAlign:"center", maxWidth:680, width:"100%" }}>
            <p style={{ margin:"0 0 8px", fontSize:10, fontWeight:600, color:C.gold, textTransform:"uppercase", letterSpacing:"2.5px", fontFamily:"'DM Sans',sans-serif" }}>My Performance</p>
            <h1 style={{ margin:"0 0 8px", fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"clamp(22px,3.2vw,34px)", fontWeight:700, color:"#f5f0e8", letterSpacing:"-0.4px", lineHeight:1.1 }}>
              Agent Statistics &{" "}
              <span style={{ background:`linear-gradient(90deg,${C.gold},${C.goldL},${C.gold})`, backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>Activity Overview</span>
            </h1>
            <p style={{ margin:0, fontSize:13, color:"rgba(245,240,232,0.38)", fontFamily:"'DM Sans',sans-serif" }}>
              Full breakdown of your leads, contracts, revenue, and conversion performance
            </p>
          </div>
        </div>
 
        <div style={{ padding:"24px 28px", maxWidth:1400, margin:"0 auto" }}>
 
          {/* KPI Grid */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(175px,1fr))", gap:14, marginBottom:28 }}>
            <StatCard icon="🏠" label="My Properties"   value={stats.totalProperties ?? "—"} accent={C.gold}   />
            <StatCard icon="📋" label="Active Contracts" value={stats.activeContracts ?? "—"} accent="#5aaa80"  />
            <StatCard icon="🎯" label="Total Leads"      value={stats.totalLeads ?? "—"}       accent="#7eb8d4"  />
            <StatCard icon="✅" label="Leads Completed"  value={stats.doneLeads ?? "—"}        accent="#059669"  sub={`${conversionRate}% conversion rate`} />
            <StatCard icon="⏳" label="Pending Leads"    value={stats.pendingLeads ?? "—"}     accent="#c9a87a"  sub={stats.pendingLeads > 0 ? "Waiting for review" : undefined} />
            <StatCard icon="💰" label="Total Revenue"    value={stats.totalRevenue != null ? fmtMoney(stats.totalRevenue) : "—"} accent="#a07eb8" />
          </div>
 
          {/* Lead Funnel + Conversion */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
            <div className="mp-card mp-section">
              <SectionHeader title="Lead Funnel" />
              <div style={{ padding:"20px 22px" }}>
                <BarRow label="Total leads"          value={stats.totalLeads ?? 0}  max={stats.totalLeads || 1} accent={C.gold}    />
                <BarRow label="Active (In Progress)" value={stats.activeLeads ?? 0} max={stats.totalLeads || 1} accent="#2563eb"  />
                <BarRow label="Completed (Done)"     value={stats.doneLeads ?? 0}   max={stats.totalLeads || 1} accent="#059669"  />
                <BarRow label="Pending (New)"        value={stats.pendingLeads ?? 0} max={stats.totalLeads || 1} accent="#d97706" />
              </div>
            </div>
            <div className="mp-card mp-section">
              <SectionHeader title="Conversion Overview" />
              <div style={{ padding:"24px 22px", display:"flex", justifyContent:"space-around", alignItems:"center", flexWrap:"wrap", gap:16 }}>
                {[
                  { value:conversionRate, max:100, color:"#059669", label:"Lead conversion", display:`${conversionRate}%` },
                  { value:stats.activeContracts??0, max:Math.max(stats.activeContracts??0,10), color:"#5aaa80", label:"Active contracts", display:stats.activeContracts??"—" },
                  { value:stats.totalProperties??0, max:Math.max(stats.totalProperties??0,20), color:C.gold, label:"Properties", display:stats.totalProperties??"—" },
                ].map(ring => (
                  <div key={ring.label} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                    <ProgressRing value={ring.value} max={ring.max} size={84} color={ring.color} label={ring.label} />
                    <p style={{ margin:0, fontSize:22, fontWeight:700, color:C.text, fontFamily:"'Cormorant Garamond',Georgia,serif", lineHeight:1 }}>{ring.display}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
 
          {/* Leads + Contracts */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
            <div className="mp-card mp-section">
              <SectionHeader title="Recent Leads" count={stats.totalLeads} action="View all →" onAction={() => navigate("/agent/leads")} />
              {leadsLoading ? <Skeleton rows={5} h={52} /> : leads.length === 0 ? <EmptyRow icon="🎯" text="No leads assigned to you" /> : (
                <div>
                  {leads.map((lead, i) => {
                    const color = LEAD_STATUS_COLOR[lead.status] || "#64748b";
                    return (
                      <div key={lead.id} className="mp-row" style={{ padding:"12px 18px", borderBottom:i<leads.length-1?`1px solid ${C.border}`:"none", display:"flex", alignItems:"center", gap:12, transition:"background 0.15s" }}>
                        <div style={{ width:8, height:8, borderRadius:"50%", background:color, flexShrink:0 }} />
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ margin:0, fontSize:13, fontWeight:500, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                            {lead.client_name || `Client #${lead.client_id}`}
                            {lead.property_title && <span style={{ fontWeight:400, color:C.muted }}> · {lead.property_title}</span>}
                          </p>
                          <p style={{ margin:"2px 0 0", fontSize:11, color:C.textMut }}>{lead.type} · {lead.source}</p>
                        </div>
                        <span style={{ background:`${color}15`, color, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600, whiteSpace:"nowrap" }}>{lead.status?.replace("_"," ")}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="mp-card mp-section">
              <SectionHeader title="Lease Contracts" count={contracts.length} action="View all →" onAction={() => navigate("/agent/contracts")} />
              {contractsLoading ? <Skeleton rows={5} h={52} /> : contracts.length === 0 ? <EmptyRow icon="📋" text="No contracts found" /> : (
                <div>
                  {contracts.map((c, i) => {
                    const color = CONTRACT_STATUS_COLOR[c.status] || "#64748b";
                    return (
                      <div key={c.id} className="mp-row" style={{ padding:"12px 18px", borderBottom:i<contracts.length-1?`1px solid ${C.border}`:"none", display:"flex", alignItems:"center", gap:12, transition:"background 0.15s" }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ margin:0, fontSize:13, fontWeight:500, color:C.text }}>Contract #{c.id}<span style={{ fontWeight:400, color:C.muted }}> · {fmtMoney(c.rent)}/mo</span></p>
                          <p style={{ margin:"2px 0 0", fontSize:11, color:C.textMut }}>{fmtDate(c.start_date)} → {fmtDate(c.end_date)}</p>
                        </div>
                        <span style={{ background:`${color}15`, color, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600, whiteSpace:"nowrap" }}>{c.status?.replace("_"," ")}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
 
          {/* Payments + Sale contracts */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:28 }}>
            <div className="mp-card mp-section">
              <SectionHeader title="Recent Paid Payments" count={payments.length} action="View all →" onAction={() => navigate("/agent/payments")} />
              {paymentsLoading ? <Skeleton rows={4} h={52} /> : payments.length === 0 ? <EmptyRow icon="💳" text="No payments found" /> : (
                <div>
                  {payments.map((p, i) => {
                    const color = PAYMENT_STATUS_COLOR[p.status] || "#64748b";
                    return (
                      <div key={p.id} className="mp-row" style={{ padding:"12px 18px", borderBottom:i<payments.length-1?`1px solid ${C.border}`:"none", display:"flex", alignItems:"center", gap:12, transition:"background 0.15s" }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ margin:0, fontSize:13, fontWeight:500, color:C.text }}>{fmtMoney(p.amount)}<span style={{ fontWeight:400, color:C.muted }}> · {p.payment_type||p.paymentType}</span></p>
                          <p style={{ margin:"2px 0 0", fontSize:11, color:C.textMut }}>Contract #{p.contract_id} · Paid: {fmtDate(p.paid_date||p.paidDate)}</p>
                        </div>
                        <span style={{ background:`${color}15`, color, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600 }}>{p.status}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="mp-card mp-section">
              <SectionHeader title="Sale Contracts" count={saleContracts.length} action="View all →" onAction={() => navigate("/agent/sales")} />
              {saleLoading ? <Skeleton rows={4} h={52} /> : saleContracts.length === 0 ? <EmptyRow icon="🤝" text="No sale contracts found" /> : (
                <div>
                  {saleContracts.map((c, i) => {
                    const color = c.status==="COMPLETED" ? "#059669" : c.status==="CANCELLED" ? "#dc2626" : "#d97706";
                    return (
                      <div key={c.id} className="mp-row" style={{ padding:"12px 18px", borderBottom:i<saleContracts.length-1?`1px solid ${C.border}`:"none", display:"flex", alignItems:"center", gap:12, transition:"background 0.15s" }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ margin:0, fontSize:13, fontWeight:500, color:C.text }}>Sale #{c.id}<span style={{ fontWeight:400, color:C.muted }}> · {fmtMoney(c.sale_price||c.salePrice)}</span></p>
                          <p style={{ margin:"2px 0 0", fontSize:11, color:C.textMut }}>Buyer #{c.buyer_id} · {fmtDate(c.contract_date||c.contractDate)}</p>
                        </div>
                        <span style={{ background:`${color}15`, color, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600 }}>{c.status}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
 
          {/* Expiring alert */}
          {stats.expiringSoon > 0 && (
            <div className="mp-section" style={{ background:"#fff8f0", border:"1.5px solid #f5c6a0", borderRadius:14, padding:"14px 20px", marginBottom:20, display:"flex", alignItems:"center", justifyContent:"space-between", gap:14 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ fontSize:22 }}>⚠️</span>
                <div>
                  <p style={{ margin:0, fontSize:14, fontWeight:700, color:"#7a3a1a", fontFamily:"'Cormorant Garamond',Georgia,serif" }}>
                    {stats.expiringSoon} contract{stats.expiringSoon > 1 ? "s" : ""} expiring within 30 days
                  </p>
                  <p style={{ margin:"2px 0 0", fontSize:12, color:"#a05a2a" }}>Review and renew before expiry</p>
                </div>
              </div>
              <button className="mp-btn" onClick={() => navigate("/agent/contracts")} style={{ padding:"7px 16px", borderRadius:9, background:"#7a3a1a", color:"#fff", fontSize:12, fontWeight:600, flexShrink:0 }}>Review →</button>
            </div>
          )}
 
          {/* Quick actions */}
          <div className="mp-section">
            <p style={{ margin:"0 0 14px", fontSize:10, fontWeight:600, color:C.textMut, textTransform:"uppercase", letterSpacing:"1.2px" }}>Quick Actions</p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))", gap:12 }}>
              {[
                { icon:"🎯", label:"All My Leads",  path:"/agent/leads",      accent:"#7eb8d4" },
                { icon:"📋", label:"My Contracts",  path:"/agent/contracts",  accent:"#5aaa80" },
                { icon:"💳", label:"Payments",      path:"/agent/payments",   accent:"#a07eb8" },
                { icon:"🏠", label:"My Properties", path:"/agent/properties", accent:C.gold    },
                { icon:"🤝", label:"Sales",         path:"/agent/sales",      accent:"#c9a87a" },
              ].map(({ icon, label, path, accent }) => (
                <button key={path} className="mp-btn" onClick={() => navigate(path)}
                  style={{ padding:"16px 14px", background:C.surface, border:`1.5px solid ${C.border}`, borderRadius:12, display:"flex", flexDirection:"column", alignItems:"center", gap:8, boxShadow:"0 2px 10px rgba(20,16,10,0.05)" }}>
                  <div style={{ width:38, height:38, borderRadius:10, background:`${accent}18`, border:`1px solid ${accent}28`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{icon}</div>
                  <p style={{ margin:0, fontSize:12, fontWeight:500, color:C.textSub }}>{label}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
 
        {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      </div>
    </MainLayout>
  );
}
 