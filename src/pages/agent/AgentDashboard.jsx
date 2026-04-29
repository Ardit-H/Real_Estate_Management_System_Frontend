import { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/Layout";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";

// ─── Global CSS ───────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  .ad * { box-sizing: border-box; }
  .ad { font-family: 'DM Sans', system-ui, sans-serif; background: #f2ede4; min-height: 100vh; }

  .ad-card {
    background: #faf7f2;
    border: 1.5px solid #e8e2d6;
    border-radius: 14px;
    box-shadow: 0 2px 16px rgba(20,16,10,0.06);
    overflow: hidden;
  }

  .ad-btn {
    transition: all 0.17s ease;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    border: none;
  }
  .ad-btn:hover { opacity: 0.85; transform: translateY(-1px); }

  @keyframes ad-fade-up  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes ad-scale-in { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
  @keyframes ad-toast    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes ad-spin     { to{transform:rotate(360deg)} }
  @keyframes ad-pulse    { 0%,100%{opacity:.4} 50%{opacity:.85} }

  .ad-stat { animation: ad-fade-up 0.4s ease both; }
  .ad-stat:nth-child(1) { animation-delay: 0.05s; }
  .ad-stat:nth-child(2) { animation-delay: 0.10s; }
  .ad-stat:nth-child(3) { animation-delay: 0.15s; }
  .ad-stat:nth-child(4) { animation-delay: 0.20s; }
  .ad-stat:nth-child(5) { animation-delay: 0.25s; }
  .ad-stat:nth-child(6) { animation-delay: 0.30s; }

  .ad-section { animation: ad-fade-up 0.5s ease 0.2s both; }
  .ad-row:hover { background: #f5f0e8 !important; }

  .ad-skeleton {
    background: #ede9df;
    border-radius: 10px;
    animation: ad-pulse 1.5s ease infinite;
  }
`;

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg:      "#f2ede4",
  surface: "#faf7f2",
  dark:    "#1a1714",
  gold:    "#c9b87a",
  goldL:   "#e8d9a0",
  green:   "#8a7d5e",
  muted:   "#9a8c6e",
  border:  "#e8e2d6",
  text:    "#1a1714",
  textSub: "#6b6340",
  textMut: "#b0a890",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtMoney = (v) =>
  v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";
const fmtRelative = (d) => {
  if (!d) return "—";
  const diff  = Date.now() - new Date(d).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

// ─── Status configs ───────────────────────────────────────────────────────────
const LEAD_STATUS = {
  NEW:         { color: "#d97706", bg: "#fffbeb", dot: "#d97706" },
  IN_PROGRESS: { color: "#2563eb", bg: "#eff6ff", dot: "#2563eb" },
  DONE:        { color: "#059669", bg: "#ecfdf5", dot: "#059669" },
  REJECTED:    { color: "#dc2626", bg: "#fef2f2", dot: "#dc2626" },
  DECLINED:    { color: "#64748b", bg: "#f1f5f9", dot: "#64748b" },
};
const CONTRACT_STATUS = {
  PENDING_SIGNATURE: { color: "#d97706", bg: "#fffbeb" },
  ACTIVE:            { color: "#059669", bg: "#ecfdf5" },
  ENDED:             { color: "#64748b", bg: "#f1f5f9" },
  CANCELLED:         { color: "#dc2626", bg: "#fef2f2" },
};
const APP_STATUS = {
  PENDING:   { color: "#d97706", bg: "#fffbeb" },
  APPROVED:  { color: "#059669", bg: "#ecfdf5" },
  REJECTED:  { color: "#dc2626", bg: "#fef2f2" },
  CANCELLED: { color: "#64748b", bg: "#f1f5f9" },
};
const PROP_EMOJI = {
  APARTMENT: "🏢", HOUSE: "🏠", VILLA: "🏡",
  LAND: "🌿", COMMERCIAL: "🏬", OFFICE: "🏛️",
};

function StatusPill({ label, config }) {
  const s = config || { color: "#64748b", bg: "#f1f5f9" };
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: "3px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 600, letterSpacing: "0.3px", whiteSpace: "nowrap",
    }}>{label}</span>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, accent = C.gold, sub, onClick }) {
  return (
    <div className="ad-stat ad-card ad-btn" onClick={onClick}
      style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 14, cursor: onClick ? "pointer" : "default" }}>
      <div style={{
        width: 46, height: 46, borderRadius: 12, flexShrink: 0,
        background: `${accent}18`, border: `1.5px solid ${accent}28`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 10, fontWeight: 600, color: C.textMut, textTransform: "uppercase", letterSpacing: "0.9px", marginBottom: 3 }}>{label}</p>
        <p style={{ margin: 0, fontSize: 26, fontWeight: 700, color: C.text, fontFamily: "'Cormorant Garamond',Georgia,serif", letterSpacing: "-0.5px", lineHeight: 1 }}>{value ?? "—"}</p>
        {sub && <p style={{ margin: "4px 0 0", fontSize: 11, color: C.muted }}>{sub}</p>}
      </div>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title, count, action, onAction }) {
  return (
    <div style={{
      padding: "14px 20px", borderBottom: `1px solid ${C.border}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: "#fdf9f4",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text, fontFamily: "'Cormorant Garamond',Georgia,serif" }}>{title}</p>
        {count != null && (
          <span style={{ background: `${C.gold}22`, color: C.textSub, padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{count}</span>
        )}
      </div>
      {action && (
        <button className="ad-btn" onClick={onAction}
          style={{ padding: "6px 14px", borderRadius: 9, background: C.dark, color: "#f5f0e8", fontSize: 11.5, fontWeight: 500 }}>
          {action}
        </button>
      )}
    </div>
  );
}

function EmptyRow({ icon, text }) {
  return (
    <div style={{ padding: "36px 20px", textAlign: "center", color: C.textMut }}>
      <div style={{ fontSize: 30, marginBottom: 8 }}>{icon}</div>
      <p style={{ fontSize: 13, margin: 0 }}>{text}</p>
    </div>
  );
}

function Skeleton({ rows = 3, h = 44 }) {
  return (
    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="ad-skeleton" style={{ height: h, opacity: 1 - i * 0.15 }} />
      ))}
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
      fontFamily: "'DM Sans',sans-serif", animation: "ad-toast 0.2s ease",
      display: "flex", alignItems: "center", gap: 8,
    }}>
      {type === "error" ? "⚠️" : "✅"} {msg}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function AgentDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [toast, setToast]                         = useState(null);
  const [propCount, setPropCount]                 = useState(null);
  const [activeContracts, setActiveContracts]     = useState(null);
  const [totalRevenue, setTotalRevenue]           = useState(null);
  const [myLeads, setMyLeads]                     = useState([]);
  const [leadsLoading, setLeadsLoading]           = useState(true);
  const [myProps, setMyProps]                     = useState([]);
  const [propsLoading, setPropsLoading]           = useState(true);
  const [contracts, setContracts]                 = useState([]);
  const [contractsLoading, setContractsLoading]   = useState(true);
  const [rentApps, setRentApps]                   = useState([]);
  const [rentAppsLoading, setRentAppsLoading]     = useState(true);
  const [expiring, setExpiring]                   = useState([]);
  const [expiringLoading, setExpiringLoading]     = useState(true);

  const notify = useCallback((msg, type = "success") =>
    setToast({ msg, type, key: Date.now() }), []);

  useEffect(() => {
    if (!user?.id) return;

    // Properties
    setPropsLoading(true);
    api.get(`/api/properties/agent/${user.id}?page=0&size=5`)
      .then(r => { setMyProps(r.data.content || []); setPropCount(r.data.totalElements ?? (r.data.content || []).length); })
      .catch(() => {}).finally(() => setPropsLoading(false));

    // My leads
    setLeadsLoading(true);
    api.get("/api/leads/my/agent?page=0&size=6")
      .then(r => setMyLeads(r.data.content || []))
      .catch(() => {}).finally(() => setLeadsLoading(false));

    // Lease contracts
    setContractsLoading(true);
    api.get(`/api/contracts/lease/agent/${user.id}?page=0&size=5`)
      .then(r => {
        const list = r.data.content || [];
        setContracts(list);
        setActiveContracts(list.filter(c => c.status === "ACTIVE").length);
      })
      .catch(() => {}).finally(() => setContractsLoading(false));

    // Revenue
    api.get("/api/payments/revenue").then(r => setTotalRevenue(r.data)).catch(() => {});

    // Expiring
    setExpiringLoading(true);
    api.get("/api/contracts/lease/expiring")
      .then(r => setExpiring(Array.isArray(r.data) ? r.data : []))
      .catch(() => {}).finally(() => setExpiringLoading(false));

    // Pending rental applications
    setRentAppsLoading(true);
    api.get("/api/rentals/listings?page=0&size=1")
      .then(async r => {
        const listings = r.data.content || [];
        if (listings.length > 0) {
          const res = await api.get(`/api/rentals/applications/listing/${listings[0].id}`);
          setRentApps((res.data || []).filter(a => a.status === "PENDING").slice(0, 5));
        }
      })
      .catch(() => {}).finally(() => setRentAppsLoading(false));

  }, [user?.id]);

  const handleAcceptLead = async (leadId) => {
    try {
      await api.patch(`/api/leads/${leadId}/status`, { status: "IN_PROGRESS" });
      setMyLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: "IN_PROGRESS" } : l));
      notify("Lead accepted ✓");
    } catch (err) {
      notify(err.response?.data?.message || "Error", "error");
    }
  };

  const pendingLeads = myLeads.filter(l => l.status === "NEW").length;
  const activeLeads  = myLeads.filter(l => l.status === "IN_PROGRESS").length;

  return (
    <MainLayout role="agent">
      <style>{CSS}</style>
      <div className="ad">

        {/* ── HERO ── */}
        <div style={{
          background: `linear-gradient(160deg, ${C.dark} 0%, #1e1a14 50%, #241e16 100%)`,
          minHeight: 200, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "40px 32px", position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.018) 1px,transparent 1px)", backgroundSize: "22px 22px", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "-60px", left: "8%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(201,184,122,0.07) 0%,transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "-40px", right: "8%", width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle,rgba(126,184,164,0.05) 0%,transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg,transparent,${C.gold} 30%,${C.gold} 70%,transparent)` }} />

          <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 680, width: "100%" }}>
            <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 600, color: C.gold, textTransform: "uppercase", letterSpacing: "2.5px", fontFamily: "'DM Sans',sans-serif" }}>
              Agent Dashboard
            </p>
            <h1 style={{
              margin: "0 0 8px",
              fontFamily: "'Cormorant Garamond',Georgia,serif",
              fontSize: "clamp(24px,3.5vw,38px)",
              fontWeight: 700, color: "#f5f0e8", letterSpacing: "-0.4px", lineHeight: 1.1,
            }}>
              Welcome,{" "}
              <span style={{
                background: `linear-gradient(90deg,${C.gold},${C.goldL},${C.gold})`,
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
                {user?.firstName || "Agent"}
              </span>
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(245,240,232,0.38)", fontFamily: "'DM Sans',sans-serif" }}>
              Complete overview of your activity — leads, properties, contracts and payments
            </p>

            {/* Quick nav */}
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginTop: 20 }}>
              {[
                { label: "🏠 Properties", path: "/agent/properties" },
                { label: "🔑 Rentals",    path: "/agent/rentals"    },
                { label: "📋 Contracts",  path: "/agent/contracts"  },
                { label: "💳 Payments",   path: "/agent/payments"   },
                { label: "🤝 Sales",      path: "/agent/sales"      },
              ].map(({ label, path }) => (
                <button key={path} className="ad-btn" onClick={() => navigate(path)}
                  style={{
                    padding: "6px 14px", borderRadius: 999,
                    background: "rgba(201,184,122,0.08)",
                    color: "rgba(245,240,232,0.55)",
                    border: "1px solid rgba(201,184,122,0.16)",
                    fontSize: 11.5, fontWeight: 500,
                  }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div style={{ padding: "24px 28px", maxWidth: 1400, margin: "0 auto" }}>

          {/* KPI Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(175px,1fr))", gap: 14, marginBottom: 28 }}>
            <StatCard icon="🏠" label="My Properties"      value={propCount ?? "—"}       accent={C.gold}   onClick={() => navigate("/agent/properties")} />
            <StatCard icon="📋" label="Active Contracts"   value={activeContracts ?? "—"} accent="#5aaa80"  onClick={() => navigate("/agent/contracts")} />
            <StatCard icon="🤝" label="Active Leads"       value={activeLeads}             accent="#7eb8d4"  onClick={() => navigate("/agent/leads")} />
            <StatCard icon="⏳" label="Pending Leads"      value={pendingLeads}            accent="#c9a87a"  sub={pendingLeads > 0 ? "Need attention" : undefined} />
            <StatCard icon="⚠️" label="Expiring Contracts" value={expiring.length}         accent="#e07070"  sub={expiring.length > 0 ? "Within 30 days" : undefined} />
            <StatCard icon="💰" label="Total Revenue"      value={totalRevenue != null ? fmtMoney(totalRevenue) : "—"} accent="#a07eb8" onClick={() => navigate("/agent/payments")} />
          </div>

          {/* Main grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>

            {/* My Leads */}
            <div className="ad-card ad-section">
              <SectionHeader title="My Leads" count={myLeads.length} action="View all →" onAction={() => navigate("/agent/leads")} />
              {leadsLoading ? <Skeleton rows={4} h={52} /> :
               myLeads.length === 0 ? <EmptyRow icon="🤝" text="No leads assigned to you" /> : (
                <div>
                  {myLeads.map((lead, i) => {
                    const s = LEAD_STATUS[lead.status] || LEAD_STATUS.NEW;
                    return (
                      <div key={lead.id} className="ad-row" style={{
                        padding: "12px 18px",
                        borderBottom: i < myLeads.length - 1 ? `1px solid ${C.border}` : "none",
                        display: "flex", alignItems: "center", gap: 12, transition: "background 0.15s",
                      }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {lead.client_name || `Client #${lead.client_id}`}
                            {lead.property_title && <span style={{ fontWeight: 400, color: C.muted }}> · {lead.property_title}</span>}
                          </p>
                          <p style={{ margin: "2px 0 0", fontSize: 11, color: C.textMut }}>
                            {lead.type} · {fmtRelative(lead.created_at)}
                          </p>
                        </div>
                        <StatusPill label={lead.status} config={s} />
                        {lead.status === "NEW" && (
                          <button className="ad-btn" onClick={() => handleAcceptLead(lead.id)}
                            style={{ padding: "4px 11px", borderRadius: 8, background: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0", fontSize: 11, fontWeight: 600 }}>
                            Accept
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* My Properties */}
            <div className="ad-card ad-section">
              <SectionHeader title="My Properties" count={propCount} action="Manage →" onAction={() => navigate("/agent/properties")} />
              {propsLoading ? <Skeleton rows={4} h={52} /> :
               myProps.length === 0 ? <EmptyRow icon="🏠" text="No properties registered" /> : (
                <div>
                  {myProps.map((p, i) => (
                    <div key={p.id} className="ad-row" style={{
                      padding: "12px 18px",
                      borderBottom: i < myProps.length - 1 ? `1px solid ${C.border}` : "none",
                      display: "flex", alignItems: "center", gap: 12, transition: "background 0.15s",
                    }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 9, flexShrink: 0,
                        background: `${C.gold}18`, border: `1px solid ${C.gold}28`,
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17,
                      }}>
                        {PROP_EMOJI[p.type] || "🏠"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {p.title}
                        </p>
                        <p style={{ margin: "2px 0 0", fontSize: 11, color: C.textMut }}>
                          {p.city || "—"} · {fmtMoney(p.price)}
                        </p>
                      </div>
                      <span style={{
                        background: p.status === "AVAILABLE" ? "#ecfdf5" : p.status === "SOLD" ? "#f0fdf4" : "#f1f5f9",
                        color: p.status === "AVAILABLE" ? "#059669" : p.status === "SOLD" ? "#166534" : "#64748b",
                        padding: "3px 9px", borderRadius: 20, fontSize: 10.5, fontWeight: 600,
                      }}>{p.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Second row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>

            {/* Lease Contracts */}
            <div className="ad-card ad-section">
              <SectionHeader title="Lease Contracts" count={contracts.length} action="View all →" onAction={() => navigate("/agent/contracts")} />
              {contractsLoading ? <Skeleton rows={4} h={52} /> :
               contracts.length === 0 ? <EmptyRow icon="📋" text="No contracts found" /> : (
                <div>
                  {contracts.map((c, i) => {
                    const s = CONTRACT_STATUS[c.status] || CONTRACT_STATUS.PENDING_SIGNATURE;
                    return (
                      <div key={c.id} className="ad-row" style={{
                        padding: "12px 18px",
                        borderBottom: i < contracts.length - 1 ? `1px solid ${C.border}` : "none",
                        display: "flex", alignItems: "center", gap: 12, transition: "background 0.15s",
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: C.text }}>
                            Contract #{c.id}
                            <span style={{ fontWeight: 400, color: C.muted }}> · Client #{c.client_id}</span>
                          </p>
                          <p style={{ margin: "2px 0 0", fontSize: 11, color: C.textMut }}>
                            {fmtMoney(c.rent)}/month · {fmtDate(c.start_date)} → {fmtDate(c.end_date)}
                          </p>
                        </div>
                        <StatusPill label={c.status?.replace("_", " ")} config={s} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pending Rental Applications */}
            <div className="ad-card ad-section">
              <SectionHeader title="Pending Rental Applications" count={rentApps.length} action="View →" onAction={() => navigate("/agent/rentals")} />
              {rentAppsLoading ? <Skeleton rows={4} h={52} /> :
               rentApps.length === 0 ? <EmptyRow icon="📝" text="No pending applications" /> : (
                <div>
                  {rentApps.map((app, i) => (
                    <div key={app.id} className="ad-row" style={{
                      padding: "12px 18px",
                      borderBottom: i < rentApps.length - 1 ? `1px solid ${C.border}` : "none",
                      display: "flex", alignItems: "center", gap: 12, transition: "background 0.15s",
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: C.text }}>
                          Application #{app.id}
                          <span style={{ fontWeight: 400, color: C.muted }}> · Client #{app.client_id}</span>
                        </p>
                        <p style={{ margin: "2px 0 0", fontSize: 11, color: C.textMut }}>
                          Listing #{app.listing_id} · {fmtRelative(app.created_at)}
                          {app.income && ` · €${Number(app.income).toLocaleString()}/month`}
                        </p>
                      </div>
                      <StatusPill label={app.status} config={APP_STATUS[app.status]} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Expiring contracts alert */}
          {!expiringLoading && expiring.length > 0 && (
            <div className="ad-section" style={{
              background: "#fff8f0", border: "1.5px solid #f5c6a0",
              borderRadius: 14, overflow: "hidden", marginBottom: 20,
            }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #f5c6a0", background: "#fff3e8", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 18 }}>⚠️</span>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#7a3a1a", fontFamily: "'Cormorant Garamond',Georgia,serif" }}>
                    Contracts Expiring Within 30 Days
                  </p>
                  <span style={{ background: "#f5c6a0", color: "#7a3a1a", padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{expiring.length}</span>
                </div>
                <button className="ad-btn" onClick={() => navigate("/agent/contracts")}
                  style={{ padding: "5px 13px", borderRadius: 8, background: "#7a3a1a", color: "#fff", fontSize: 11.5 }}>
                  View →
                </button>
              </div>
              <div>
                {expiring.slice(0, 4).map((c, i) => (
                  <div key={c.id} className="ad-row" style={{
                    padding: "11px 20px",
                    borderBottom: i < Math.min(expiring.length, 4) - 1 ? "1px solid #f5c6a0" : "none",
                    display: "flex", alignItems: "center", gap: 14, transition: "background 0.15s",
                  }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "#7a3a1a" }}>
                        Contract #{c.id} · Property #{c.property_id}
                      </p>
                      <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "#a05a2a" }}>
                        Expires: <strong>{fmtDate(c.end_date)}</strong> · {fmtMoney(c.rent)}/month
                      </p>
                    </div>
                    <span style={{ fontSize: 12, color: "#c05a1a", fontWeight: 600, background: "#fde8d0", padding: "3px 10px", borderRadius: 20 }}>
                      Expiring soon
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="ad-section">
            <p style={{ margin: "0 0 14px", fontSize: 10, fontWeight: 600, color: C.textMut, textTransform: "uppercase", letterSpacing: "1.2px" }}>
              Quick Actions
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 12 }}>
              {[
                { icon: "➕", label: "Add Property",    path: "/agent/properties", accent: C.gold    },
                { icon: "🔑", label: "Rental Listing",  path: "/agent/rentals",    accent: "#7eb8d4" },
                { icon: "📋", label: "New Contract",    path: "/agent/contracts",  accent: "#5aaa80" },
                { icon: "💳", label: "Payments",        path: "/agent/payments",   accent: "#a07eb8" },
                { icon: "🤝", label: "Sales",           path: "/agent/sales",      accent: "#c9a87a" },
                { icon: "👤", label: "My Profile",      path: "/agent/profile",    accent: "#9a8c6e" },
              ].map(({ icon, label, path, accent }) => (
                <button key={path} className="ad-btn" onClick={() => navigate(path)}
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

        {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      </div>
    </MainLayout>
  );
}