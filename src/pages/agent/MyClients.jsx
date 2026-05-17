import { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/Layout";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";
 
import { CSS, C, LEAD_STATUS_CFG, getInitials, getAvatarColor, fmtDate } from "../../components/agent/clients/clientsConstants.js";
import { Toast, Skeleton, EmptyState, SectionHeader, StatusChips, ClientModal } from "../../components/agent/clients/ClientsUI.jsx";
 
export default function MyClients() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
 
  const [search,  setSearch]  = useState("");
  const [tab,     setTab]     = useState("all");
  const [loading, setLoading] = useState(true);
 
  const [clients,      setClients]      = useState([]);
  const [leadsMap,     setLeadsMap]     = useState({});
  const [contractsMap, setContractsMap] = useState({});
  const [profilesMap,  setProfilesMap]  = useState({});
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
 
  const notify = useCallback((msg, type = "success") => setToast({ msg, type, key: Date.now() }), []);
 
  useEffect(() => {
    setLoading(true);
    api.get("/api/leads/my/agent?page=0&size=200")
      .then(r => {
        const allLeads = r.data.content || [];
        const byClient = {};
        allLeads.forEach(lead => {
          const cid = lead.client_id;
          if (!cid) return;
          if (!byClient[cid]) byClient[cid] = [];
          byClient[cid].push(lead);
        });
        setLeadsMap(byClient);
        const uniqueClients = Object.entries(byClient).map(([cid, leads]) => {
          const sorted = [...leads].sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
          const latest = sorted[0];
          return { clientId:parseInt(cid,10), clientName:latest.client_name || `Client #${cid}`, leadCount:leads.length, lastLead:latest.created_at, statuses:[...new Set(leads.map(l => l.status))] };
        });
        uniqueClients.sort((a,b) => new Date(b.lastLead) - new Date(a.lastLead));
        setClients(uniqueClients);
      })
      .catch(() => notify("Could not load clients", "error"))
      .finally(() => setLoading(false));
  }, []);
 
  const openModal = async (client) => {
    setSelectedClient(client);
    if (profilesMap.hasOwnProperty(client.clientId)) return;
    setModalLoading(true);
    try {
      const [profileRes, contractsRes] = await Promise.allSettled([
        api.get(`/api/users/clients/${client.clientId}`),
        api.get(`/api/contracts/lease/client/${client.clientId}?page=0&size=10`),
      ]);
      setProfilesMap(p => ({ ...p, [client.clientId]: profileRes.status === "fulfilled" ? profileRes.value.data : null }));
      setContractsMap(p => ({ ...p, [client.clientId]: contractsRes.status === "fulfilled" ? (contractsRes.value.data.content || []) : [] }));
    } catch {
      setProfilesMap(p => ({ ...p, [client.clientId]: null }));
      setContractsMap(p => ({ ...p, [client.clientId]: [] }));
    } finally { setModalLoading(false); }
  };
 
  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || (c.clientName || "").toLowerCase().includes(q) || String(c.clientId).includes(q);
    const hasActive   = c.statuses.some(s => s === "IN_PROGRESS" || s === "NEW");
    const hasComplete = c.statuses.includes("DONE");
    const matchTab = tab === "all" ? true : tab === "active" ? hasActive : tab === "done" ? hasComplete : true;
    return matchSearch && matchTab;
  });
 
  const activeCount = clients.filter(c => c.statuses.some(s => s === "IN_PROGRESS" || s === "NEW")).length;
  const doneCount   = clients.filter(c => c.statuses.includes("DONE")).length;
 
  return (
    <MainLayout role="agent">
      <style>{CSS}</style>
      <div className="mc">
 
        {/* ── HERO ── */}
        <div style={{ background:`linear-gradient(160deg, ${C.dark} 0%, #1e1a14 50%, #241e16 100%)`, minHeight:190, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"36px 32px", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(rgba(255,255,255,0.018) 1px,transparent 1px)", backgroundSize:"22px 22px", pointerEvents:"none" }} />
          <div style={{ position:"absolute", top:"-60px", right:"5%", width:260, height:260, borderRadius:"50%", background:"radial-gradient(circle,rgba(201,184,122,0.07) 0%,transparent 70%)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:`linear-gradient(90deg,transparent,${C.gold} 30%,${C.gold} 70%,transparent)` }} />
          <div style={{ position:"relative", zIndex:1, textAlign:"center", maxWidth:680, width:"100%" }}>
            <p style={{ margin:"0 0 8px", fontSize:10, fontWeight:600, color:C.gold, textTransform:"uppercase", letterSpacing:"2.5px", fontFamily:"'DM Sans',sans-serif" }}>My Clients</p>
            <h1 style={{ margin:"0 0 8px", fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"clamp(22px,3.2vw,34px)", fontWeight:700, color:"#f5f0e8", letterSpacing:"-0.4px", lineHeight:1.1 }}>
              Client{" "}
              <span style={{ background:`linear-gradient(90deg,${C.gold},${C.goldL},${C.gold})`, backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>Directory</span>
            </h1>
            <p style={{ margin:0, fontSize:13, color:"rgba(245,240,232,0.38)", fontFamily:"'DM Sans',sans-serif" }}>
              Clients who have submitted leads to you — with profiles and contract history
            </p>
            <div style={{ display:"flex", gap:10, justifyContent:"center", marginTop:18, flexWrap:"wrap" }}>
              {[
                { label:`${clients.length} Total`,          color:C.gold    },
                { label:`${activeCount} With active leads`, color:"#5aaa80" },
                { label:`${doneCount} Completed`,           color:"#9a8c6e" },
              ].map(({ label, color }) => (
                <span key={label} style={{ padding:"5px 14px", borderRadius:999, fontSize:11.5, fontWeight:600, background:`${color}18`, color:"rgba(245,240,232,0.6)", border:`1px solid ${color}28` }}>{label}</span>
              ))}
            </div>
          </div>
        </div>
 
        <div style={{ padding:"24px 28px", maxWidth:1400, margin:"0 auto" }}>
 
          {/* Toolbar */}
          <div className="mc-section" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12, marginBottom:20 }}>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {[
                { key:"all",    label:`All (${clients.length})`       },
                { key:"active", label:`Active leads (${activeCount})` },
                { key:"done",   label:`Completed (${doneCount})`      },
              ].map(t => (
                <button key={t.key} className={`mc-tab${tab === t.key ? " active" : ""}`} onClick={() => setTab(t.key)}>{t.label}</button>
              ))}
            </div>
            <div className="mc-search-wrap" style={{ width:260 }}>
              <span style={{ fontSize:14, color:C.textMut }}>🔍</span>
              <input className="mc-search-input" type="text" placeholder="Search by name or ID…" value={search} onChange={e => setSearch(e.target.value)} />
              {search && <button className="mc-btn" onClick={() => setSearch("")} style={{ background:"none", color:C.textMut, fontSize:18, padding:0, lineHeight:1 }}>×</button>}
            </div>
          </div>
 
          {/* Client list */}
          <div className="mc-card mc-section">
            <SectionHeader title="Clients from My Leads" count={filtered.length} />
            {loading ? <Skeleton rows={5} h={72} /> :
             clients.length === 0 ? <EmptyState icon="🎯" title="No clients yet" sub="Clients will appear here once you have assigned leads" /> :
             filtered.length === 0 ? <EmptyState icon="🔍" title="No clients match your search" sub="Try a different name or client ID" /> : (
              <div>
                {filtered.map((client, i) => {
                  const av = getAvatarColor(client.clientId);
                  const allStatuses = leadsMap[client.clientId]?.map(l => l.status) || [];
                  return (
                    <div key={client.clientId} className="mc-row" onClick={() => openModal(client)}
                      style={{ padding:"14px 20px", borderBottom:i < filtered.length-1 ? `1px solid ${C.border}` : "none", display:"flex", alignItems:"center", gap:14, cursor:"pointer", transition:"background 0.15s" }}>
                      <div style={{ width:40, height:40, borderRadius:10, flexShrink:0, background:av.bg, color:av.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700 }}>
                        {getInitials(client.clientName)}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ margin:0, fontSize:13.5, fontWeight:600, color:C.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{client.clientName}</p>
                        <p style={{ margin:"3px 0 0", fontSize:11.5, color:C.muted }}>{client.leadCount} lead{client.leadCount !== 1 ? "s" : ""} · Last activity: {fmtDate(client.lastLead)}</p>
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6, flexShrink:0 }}>
                        <StatusChips statuses={allStatuses} />
                        <span style={{ background:`${C.gold}22`, color:C.textSub, padding:"2px 9px", borderRadius:20, fontSize:10.5, fontWeight:500 }}>View profile →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
 
          {/* Quick actions */}
          <div className="mc-section" style={{ marginTop:24 }}>
            <p style={{ margin:"0 0 14px", fontSize:10, fontWeight:600, color:C.textMut, textTransform:"uppercase", letterSpacing:"1.2px" }}>Quick Actions</p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))", gap:12 }}>
              {[
                { icon:"🎯", label:"All My Leads",   path:"/agent/leads",        accent:"#7eb8d4" },
                { icon:"📋", label:"Applications",   path:"/agent/applications", accent:"#5aaa80" },
                { icon:"📄", label:"Contracts",      path:"/agent/contracts",    accent:C.gold    },
                { icon:"💳", label:"Payments",       path:"/agent/payments",     accent:"#a07eb8" },
                { icon:"📈", label:"My Performance", path:"/agent/my-stats",     accent:"#c9a87a" },
              ].map(({ icon, label, path, accent }) => (
                <button key={path} className="mc-btn" onClick={() => navigate(path)}
                  style={{ padding:"16px 14px", background:C.surface, border:`1.5px solid ${C.border}`, borderRadius:12, display:"flex", flexDirection:"column", alignItems:"center", gap:8, boxShadow:"0 2px 10px rgba(20,16,10,0.05)" }}>
                  <div style={{ width:38, height:38, borderRadius:10, background:`${accent}18`, border:`1px solid ${accent}28`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{icon}</div>
                  <p style={{ margin:0, fontSize:12, fontWeight:500, color:C.textSub }}>{label}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
 
        {selectedClient && (
          <ClientModal
            client={selectedClient}
            profile={profilesMap[selectedClient.clientId]}
            leads={leadsMap[selectedClient.clientId] || []}
            contracts={contractsMap[selectedClient.clientId] || []}
            loading={modalLoading && !profilesMap.hasOwnProperty(selectedClient.clientId)}
            onClose={() => setSelectedClient(null)}
          />
        )}
        {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      </div>
    </MainLayout>
  );
}
 