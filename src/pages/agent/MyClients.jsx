import { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/Layout";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";
 
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
 
  .mc * { box-sizing: border-box; }
  .mc { font-family: 'DM Sans', system-ui, sans-serif; background: #f2ede4; min-height: 100vh; }
 
  .mc-card {
    background: #faf7f2;
    border: 1.5px solid #e8e2d6;
    border-radius: 14px;
    box-shadow: 0 2px 16px rgba(20,16,10,0.06);
    overflow: hidden;
  }
 
  .mc-btn {
    transition: all 0.17s ease;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    border: none;
  }
  .mc-btn:hover { opacity: 0.85; transform: translateY(-1px); }
 
  @keyframes mc-fade-up  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes mc-pulse    { 0%,100%{opacity:.4} 50%{opacity:.85} }
  @keyframes mc-toast    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
 
  .mc-section { animation: mc-fade-up 0.5s ease 0.15s both; }
  .mc-row:hover { background: #f5f0e8 !important; }
 
  .mc-skeleton {
    background: #ede9df;
    border-radius: 10px;
    animation: mc-pulse 1.5s ease infinite;
  }
 
  .mc-search-wrap {
    display: flex; align-items: center; gap: 8px;
    background: #f0ece3;
    border: 1.5px solid #e0dbd0;
    border-radius: 10px;
    padding: 0 12px;
    height: 38px;
    transition: border-color 0.17s;
  }
  .mc-search-wrap:focus-within {
    border-color: #c9b87a;
    background: #faf7f2;
  }
  .mc-search-input {
    flex: 1; border: none; background: transparent; outline: none;
    font-size: 13px; color: #1a1714; font-family: 'DM Sans', sans-serif;
  }
  .mc-search-input::placeholder { color: #b0a890; }
 
  .mc-tab {
    padding: 7px 16px;
    border-radius: 9px;
    font-size: 12.5px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
    font-family: 'DM Sans', sans-serif;
    border: 1.5px solid transparent;
  }
  .mc-tab.active {
    background: #1a1714;
    color: #f5f0e8;
    border-color: #1a1714;
  }
  .mc-tab:not(.active) {
    background: #faf7f2;
    color: #6b6340;
    border-color: #e8e2d6;
  }
  .mc-tab:not(.active):hover {
    background: #f0ece3;
    border-color: #c9b87a;
    color: #1a1714;
  }
 
  .mc-modal-overlay {
    position: fixed; inset: 0; z-index: 8000;
    background: rgba(20,16,10,0.55);
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .mc-modal {
    background: #faf7f2;
    border: 1.5px solid #e8e2d6;
    border-radius: 18px;
    box-shadow: 0 24px 60px rgba(0,0,0,0.28);
    width: 100%;
    max-width: 500px;
    max-height: 82vh;
    overflow-y: auto;
    animation: mc-fade-up 0.22s ease;
  }
 
  .mc-avatar-circle {
    width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 700; letter-spacing: 0.3px;
  }
`;
 
const C = {
  bg:      "#f2ede4",
  surface: "#faf7f2",
  dark:    "#1a1714",
  gold:    "#c9b87a",
  goldL:   "#e8d9a0",
  muted:   "#9a8c6e",
  border:  "#e8e2d6",
  text:    "#1a1714",
  textSub: "#6b6340",
  textMut: "#b0a890",
};
 
const AVATAR_COLORS = [
  { bg: "rgba(201,184,122,0.18)", color: "#7a6a3a" },
  { bg: "rgba(94,164,164,0.18)",  color: "#2a6464" },
  { bg: "rgba(160,126,184,0.18)", color: "#5a3a7a" },
  { bg: "rgba(90,170,128,0.18)",  color: "#2a6a50" },
  { bg: "rgba(200,100,100,0.18)", color: "#8a3030" },
  { bg: "rgba(100,140,200,0.18)", color: "#2a4080" },
];
 
const LEAD_STATUS_CFG = {
  NEW:         { color: "#d97706", bg: "#fffbeb" },
  IN_PROGRESS: { color: "#2563eb", bg: "#eff6ff" },
  DONE:        { color: "#059669", bg: "#ecfdf5" },
  REJECTED:    { color: "#dc2626", bg: "#fef2f2" },
  DECLINED:    { color: "#64748b", bg: "#f1f5f9" },
};
const CONTRACT_STATUS_CFG = {
  PENDING_SIGNATURE: { color: "#d97706", bg: "#fffbeb" },
  ACTIVE:            { color: "#059669", bg: "#ecfdf5" },
  ENDED:             { color: "#64748b", bg: "#f1f5f9" },
  CANCELLED:         { color: "#dc2626", bg: "#fef2f2" },
};
 
function getInitials(name) {
  if (!name) return "?";
  return name.trim().split(" ").filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("");
}
function getAvatarColor(id) {
  return AVATAR_COLORS[(id || 0) % AVATAR_COLORS.length];
}
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtMoney = (v) =>
  v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";
 
function SectionHeader({ title, count, children }) {
  return (
    <div style={{
      padding: "14px 20px", borderBottom: `1px solid ${C.border}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: "#fdf9f4", flexWrap: "wrap", gap: 10,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text, fontFamily: "'Cormorant Garamond',Georgia,serif" }}>{title}</p>
        {count != null && (
          <span style={{ background: `${C.gold}22`, color: C.textSub, padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{count}</span>
        )}
      </div>
      {children}
    </div>
  );
}
 
function Skeleton({ rows = 4, h = 68 }) {
  return (
    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="mc-skeleton" style={{ height: h, opacity: 1 - i * 0.15 }} />
      ))}
    </div>
  );
}
 
function EmptyState({ icon, title, sub }) {
  return (
    <div style={{ padding: "48px 20px", textAlign: "center", color: C.textMut }}>
      <div style={{ fontSize: 38, marginBottom: 10 }}>{icon}</div>
      <p style={{ fontSize: 14, fontWeight: 600, color: C.textSub, margin: "0 0 4px", fontFamily: "'Cormorant Garamond',Georgia,serif" }}>{title}</p>
      {sub && <p style={{ fontSize: 12, margin: 0 }}>{sub}</p>}
    </div>
  );
}
 
function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position: "fixed", bottom: 26, right: 26, zIndex: 9999,
      background: C.dark, color: type === "error" ? "#f09090" : "#90c8a8",
      padding: "11px 18px", borderRadius: 12, fontSize: 13,
      boxShadow: "0 10px 36px rgba(0,0,0,0.32)",
      border: `1px solid ${type === "error" ? "rgba(240,128,128,0.15)" : "rgba(144,200,168,0.15)"}`,
      fontFamily: "'DM Sans',sans-serif", animation: "mc-toast 0.2s ease",
      display: "flex", alignItems: "center", gap: 8,
    }}>
      {type === "error" ? "⚠️" : "✅"} {msg}
    </div>
  );
}
 
// ── Client detail modal ────────────────────────────────────────────────────────
function ClientModal({ client, profile, leads, contracts, loading, onClose }) {
  const av = getAvatarColor(client.clientId);
 
  return (
    <div className="mc-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mc-modal">
 
        {/* Header */}
        <div style={{
          padding: "18px 22px 14px", borderBottom: `1px solid ${C.border}`,
          background: "#fdf9f4",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ ...av, width: 46, height: 46, borderRadius: 12, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
              {getInitials(client.clientName)}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.text, fontFamily: "'Cormorant Garamond',Georgia,serif" }}>
                {client.clientName}
              </p>
              <p style={{ margin: 0, fontSize: 12, color: C.muted }}>
                {client.leadCount} lead{client.leadCount !== 1 ? "s" : ""} assigned to you
              </p>
            </div>
          </div>
          <button className="mc-btn" onClick={onClose}
            style={{ width: 30, height: 30, borderRadius: 8, background: "#f0ece3", border: `1px solid ${C.border}`, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted }}>
            ×
          </button>
        </div>
 
        <div style={{ padding: "18px 22px" }}>
 
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[80, 60, 80].map((h, i) => (
                <div key={i} className="mc-skeleton" style={{ height: h }} />
              ))}
            </div>
          ) : (
            <>
              {/* Client profile */}
              <p style={{ margin: "0 0 10px", fontSize: 10, fontWeight: 600, color: C.textMut, textTransform: "uppercase", letterSpacing: "0.9px" }}>
                Client Profile
              </p>
              {profile ? (
                <div style={{ background: "#f5f0e8", borderRadius: 10, padding: "12px 14px", marginBottom: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px" }}>
                  {[
                    ["Phone",        profile.phone || "—"],
                    ["Contact via",  profile.preferred_contact || "—"],
                    ["Budget min",   fmtMoney(profile.budget_min)],
                    ["Budget max",   fmtMoney(profile.budget_max)],
                    ["Pref. type",   profile.preferred_type || "—"],
                    ["Pref. city",   profile.preferred_city || "—"],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <p style={{ margin: 0, fontSize: 10, color: C.textMut, textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 2 }}>{k}</p>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: C.text }}>{v}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ background: "#f5f0e8", borderRadius: 10, padding: "12px 14px", marginBottom: 18 }}>
                  <p style={{ margin: 0, fontSize: 12.5, color: C.textMut }}>This client has not set up their profile yet.</p>
                </div>
              )}
 
              {/* Leads */}
              <p style={{ margin: "0 0 10px", fontSize: 10, fontWeight: 600, color: C.textMut, textTransform: "uppercase", letterSpacing: "0.9px" }}>
                Leads ({leads.length})
              </p>
              {leads.length === 0 ? (
                <div style={{ background: "#f5f0e8", borderRadius: 10, padding: "12px 14px", marginBottom: 18 }}>
                  <p style={{ margin: 0, fontSize: 12.5, color: C.textMut }}>No leads found.</p>
                </div>
              ) : (
                <div style={{ background: "#f5f0e8", borderRadius: 10, overflow: "hidden", marginBottom: 18 }}>
                  {leads.slice(0, 6).map((l, i) => {
                    const s = LEAD_STATUS_CFG[l.status] || LEAD_STATUS_CFG.DECLINED;
                    return (
                      <div key={l.id} style={{
                        padding: "10px 14px",
                        borderBottom: i < Math.min(leads.length, 6) - 1 ? `1px solid ${C.border}` : "none",
                        display: "flex", alignItems: "center", gap: 10,
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: 12.5, fontWeight: 500, color: C.text }}>
                            {l.type}{l.property_title ? ` · ${l.property_title}` : ""}
                          </p>
                          <p style={{ margin: "2px 0 0", fontSize: 11, color: C.textMut }}>
                            {l.source} · {fmtDate(l.created_at)}
                            {l.budget ? ` · ${fmtMoney(l.budget)}` : ""}
                          </p>
                        </div>
                        <span style={{
                          background: s.bg, color: s.color,
                          padding: "2px 9px", borderRadius: 20, fontSize: 10.5, fontWeight: 600,
                        }}>
                          {l.status?.replace(/_/g, " ")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
 
              {/* Lease contracts */}
              <p style={{ margin: "0 0 10px", fontSize: 10, fontWeight: 600, color: C.textMut, textTransform: "uppercase", letterSpacing: "0.9px" }}>
                Contracts ({contracts.length})
              </p>
              {contracts.length === 0 ? (
                <div style={{ background: "#f5f0e8", borderRadius: 10, padding: "12px 14px" }}>
                  <p style={{ margin: 0, fontSize: 12.5, color: C.textMut }}>No lease contracts found for this client.</p>
                </div>
              ) : (
                <div style={{ background: "#f5f0e8", borderRadius: 10, overflow: "hidden" }}>
                  {contracts.slice(0, 4).map((c, i) => {
                    const s = CONTRACT_STATUS_CFG[c.status] || CONTRACT_STATUS_CFG.PENDING_SIGNATURE;
                    return (
                      <div key={c.id} style={{
                        padding: "10px 14px",
                        borderBottom: i < Math.min(contracts.length, 4) - 1 ? `1px solid ${C.border}` : "none",
                        display: "flex", alignItems: "center", gap: 10,
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: 12.5, fontWeight: 500, color: C.text }}>
                            Contract #{c.id} · {fmtMoney(c.rent)}/mo
                          </p>
                          <p style={{ margin: "2px 0 0", fontSize: 11, color: C.textMut }}>
                            {fmtDate(c.start_date)} → {fmtDate(c.end_date)}
                          </p>
                        </div>
                        <span style={{
                          background: s.bg, color: s.color,
                          padding: "2px 9px", borderRadius: 20, fontSize: 10.5, fontWeight: 600,
                        }}>
                          {c.status?.replace(/_/g, " ")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
 
// ═══════════════════════════════════════════════════════════════════════════════
export default function MyClients() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
 
  const [search, setSearch]             = useState("");
  const [tab, setTab]                   = useState("all");
  const [loading, setLoading]           = useState(true);
 
  const [clients, setClients]           = useState([]);   // unique clients derived from leads
  const [leadsMap, setLeadsMap]         = useState({});   // clientId → lead[]
 
  const [contractsMap, setContractsMap] = useState({});   // clientId → contract[]
  const [profilesMap, setProfilesMap]   = useState({});   // clientId → profile | null
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
 
  const notify = useCallback((msg, type = "success") =>
    setToast({ msg, type, key: Date.now() }), []);
 
  // ── Load leads → derive unique clients ──────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    api.get("/api/leads/my/agent?page=0&size=200")
      .then(r => {
        const allLeads = r.data.content || [];
 
        // Group by clientId
        const byClient = {};
        allLeads.forEach(lead => {
          const cid = lead.client_id;
          if (!cid) return;
          if (!byClient[cid]) byClient[cid] = [];
          byClient[cid].push(lead);
        });
 
        setLeadsMap(byClient);
 
        // Build unique client list
        const uniqueClients = Object.entries(byClient).map(([cid, leads]) => {
          const sorted = [...leads].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          const latest = sorted[0];
          return {
            clientId:   parseInt(cid, 10),
            clientName: latest.client_name || `Client #${cid}`,
            leadCount:  leads.length,
            lastLead:   latest.created_at,
            statuses:   [...new Set(leads.map(l => l.status))],
          };
        });
 
        uniqueClients.sort((a, b) => new Date(b.lastLead) - new Date(a.lastLead));
        setClients(uniqueClients);
      })
      .catch(() => notify("Could not load clients", "error"))
      .finally(() => setLoading(false));
  }, []);
 
  // ── Open modal → lazy load profile + contracts ──────────────────────────────
  const openModal = async (client) => {
    setSelectedClient(client);
 
    // Skip if already loaded
    if (profilesMap.hasOwnProperty(client.clientId)) return;
 
    setModalLoading(true);
    try {
      const [profileRes, contractsRes] = await Promise.allSettled([
        api.get(`/api/users/clients/${client.clientId}`),
        api.get(`/api/contracts/lease/client/${client.clientId}?page=0&size=10`),
      ]);
 
      setProfilesMap(p => ({
        ...p,
        [client.clientId]: profileRes.status === "fulfilled" ? profileRes.value.data : null,
      }));
      setContractsMap(p => ({
        ...p,
        [client.clientId]: contractsRes.status === "fulfilled"
          ? (contractsRes.value.data.content || [])
          : [],
      }));
    } catch {
      setProfilesMap(p => ({ ...p, [client.clientId]: null }));
      setContractsMap(p => ({ ...p, [client.clientId]: [] }));
    } finally {
      setModalLoading(false);
    }
  };
 
  // ── Filtering ────────────────────────────────────────────────────────────────
  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q
      || (c.clientName || "").toLowerCase().includes(q)
      || String(c.clientId).includes(q);
 
    const hasActive   = c.statuses.some(s => s === "IN_PROGRESS" || s === "NEW");
    const hasComplete = c.statuses.includes("DONE");
    const matchTab =
      tab === "all"    ? true :
      tab === "active" ? hasActive :
      tab === "done"   ? hasComplete :
      true;
 
    return matchSearch && matchTab;
  });
 
  const activeCount = clients.filter(c => c.statuses.some(s => s === "IN_PROGRESS" || s === "NEW")).length;
  const doneCount   = clients.filter(c => c.statuses.includes("DONE")).length;
 
  // Lead status summary chips for a client row
  function StatusChips({ statuses }) {
    const counts = {};
    statuses.forEach(s => { counts[s] = (counts[s] || 0) + 1; });
    return (
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "flex-end" }}>
        {Object.entries(counts).map(([status, count]) => {
          const s = LEAD_STATUS_CFG[status] || LEAD_STATUS_CFG.DECLINED;
          return (
            <span key={status} style={{
              background: s.bg, color: s.color,
              padding: "2px 8px", borderRadius: 20,
              fontSize: 10.5, fontWeight: 600, whiteSpace: "nowrap",
            }}>
              {status.replace(/_/g, " ")}{count > 1 ? ` ×${count}` : ""}
            </span>
          );
        })}
      </div>
    );
  }
 
  return (
    <MainLayout role="agent">
      <style>{CSS}</style>
      <div className="mc">
 
        {/* ── HERO ── */}
        <div style={{
          background: `linear-gradient(160deg, ${C.dark} 0%, #1e1a14 50%, #241e16 100%)`,
          minHeight: 190, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "36px 32px", position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.018) 1px,transparent 1px)", backgroundSize: "22px 22px", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "-60px", right: "5%", width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle,rgba(201,184,122,0.07) 0%,transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg,transparent,${C.gold} 30%,${C.gold} 70%,transparent)` }} />
 
          <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 680, width: "100%" }}>
            <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 600, color: C.gold, textTransform: "uppercase", letterSpacing: "2.5px", fontFamily: "'DM Sans',sans-serif" }}>
              My Clients
            </p>
            <h1 style={{
              margin: "0 0 8px",
              fontFamily: "'Cormorant Garamond',Georgia,serif",
              fontSize: "clamp(22px,3.2vw,34px)",
              fontWeight: 700, color: "#f5f0e8", letterSpacing: "-0.4px", lineHeight: 1.1,
            }}>
              Client{" "}
              <span style={{
                background: `linear-gradient(90deg,${C.gold},${C.goldL},${C.gold})`,
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
                Directory
              </span>
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(245,240,232,0.38)", fontFamily: "'DM Sans',sans-serif" }}>
              Clients who have submitted leads to you — with profiles and contract history
            </p>
 
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 18, flexWrap: "wrap" }}>
              {[
                { label: `${clients.length} Total`,           color: C.gold    },
                { label: `${activeCount} With active leads`,  color: "#5aaa80" },
                { label: `${doneCount} Completed`,            color: "#9a8c6e" },
              ].map(({ label, color }) => (
                <span key={label} style={{
                  padding: "5px 14px", borderRadius: 999, fontSize: 11.5, fontWeight: 600,
                  background: `${color}18`, color: "rgba(245,240,232,0.6)",
                  border: `1px solid ${color}28`,
                }}>{label}</span>
              ))}
            </div>
          </div>
        </div>
 
        <div style={{ padding: "24px 28px", maxWidth: 1400, margin: "0 auto" }}>
 
          {/* Toolbar */}
          <div className="mc-section" style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: 12, marginBottom: 20,
          }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { key: "all",    label: `All (${clients.length})`          },
                { key: "active", label: `Active leads (${activeCount})`    },
                { key: "done",   label: `Completed (${doneCount})`         },
              ].map(t => (
                <button key={t.key} className={`mc-tab${tab === t.key ? " active" : ""}`}
                  onClick={() => setTab(t.key)}>
                  {t.label}
                </button>
              ))}
            </div>
 
            <div className="mc-search-wrap" style={{ width: 260 }}>
              <span style={{ fontSize: 14, color: C.textMut }}>🔍</span>
              <input
                className="mc-search-input"
                type="text"
                placeholder="Search by name or ID…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className="mc-btn" onClick={() => setSearch("")}
                  style={{ background: "none", color: C.textMut, fontSize: 18, padding: 0, lineHeight: 1 }}>
                  ×
                </button>
              )}
            </div>
          </div>
 
          {/* Client list */}
          <div className="mc-card mc-section">
            <SectionHeader title="Clients from My Leads" count={filtered.length} />
 
            {loading ? <Skeleton rows={5} h={72} /> :
             clients.length === 0 ? (
               <EmptyState
                 icon="🎯"
                 title="No clients yet"
                 sub="Clients will appear here once you have assigned leads"
               />
             ) : filtered.length === 0 ? (
               <EmptyState
                 icon="🔍"
                 title="No clients match your search"
                 sub="Try a different name or client ID"
               />
             ) : (
              <div>
                {filtered.map((client, i) => {
                  const av = getAvatarColor(client.clientId);
                  const allStatuses = leadsMap[client.clientId]?.map(l => l.status) || [];
                  return (
                    <div
                      key={client.clientId}
                      className="mc-row"
                      onClick={() => openModal(client)}
                      style={{
                        padding: "14px 20px",
                        borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : "none",
                        display: "flex", alignItems: "center", gap: 14,
                        cursor: "pointer", transition: "background 0.15s",
                      }}
                    >
                      <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: av.bg, color: av.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>
                        {getInitials(client.clientName)}
                      </div>
 
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {client.clientName}
                        </p>
                        <p style={{ margin: "3px 0 0", fontSize: 11.5, color: C.muted }}>
                          {client.leadCount} lead{client.leadCount !== 1 ? "s" : ""} · Last activity: {fmtDate(client.lastLead)}
                        </p>
                      </div>
 
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                        <StatusChips statuses={allStatuses} />
                        <span style={{
                          background: `${C.gold}22`, color: C.textSub,
                          padding: "2px 9px", borderRadius: 20, fontSize: 10.5, fontWeight: 500,
                        }}>
                          View profile →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
 
          {/* Quick actions */}
          <div className="mc-section" style={{ marginTop: 24 }}>
            <p style={{ margin: "0 0 14px", fontSize: 10, fontWeight: 600, color: C.textMut, textTransform: "uppercase", letterSpacing: "1.2px" }}>
              Quick Actions
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(155px,1fr))", gap: 12 }}>
              {[
                { icon: "🎯", label: "All My Leads",   path: "/agent/leads",        accent: "#7eb8d4" },
                { icon: "📋", label: "Applications",   path: "/agent/applications", accent: "#5aaa80" },
                { icon: "📄", label: "Contracts",      path: "/agent/contracts",    accent: C.gold    },
                { icon: "💳", label: "Payments",       path: "/agent/payments",     accent: "#a07eb8" },
                { icon: "📈", label: "My Performance", path: "/agent/my-stats",     accent: "#c9a87a" },
                { icon: "🤖", label: "AI Assistant",   path: "/agent/ai-assistant", accent: "#9a8c6e" },
              ].map(({ icon, label, path, accent }) => (
                <button key={path} className="mc-btn" onClick={() => navigate(path)}
                  style={{
                    padding: "16px 14px", background: C.surface,
                    border: `1.5px solid ${C.border}`, borderRadius: 12,
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                    boxShadow: "0 2px 10px rgba(20,16,10,0.05)",
                  }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: `${accent}18`, border: `1px solid ${accent}28`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                  }}>{icon}</div>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: C.textSub }}>{label}</p>
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
 