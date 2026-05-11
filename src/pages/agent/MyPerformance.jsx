import { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/Layout";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";
 
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
 
  .mp * { box-sizing: border-box; }
  .mp { font-family: 'DM Sans', system-ui, sans-serif; background: #f2ede4; min-height: 100vh; }
 
  .mp-card {
    background: #faf7f2;
    border: 1.5px solid #e8e2d6;
    border-radius: 14px;
    box-shadow: 0 2px 16px rgba(20,16,10,0.06);
    overflow: hidden;
  }
 
  .mp-btn {
    transition: all 0.17s ease;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    border: none;
  }
  .mp-btn:hover { opacity: 0.85; transform: translateY(-1px); }
 
  @keyframes mp-fade-up  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes mp-spin     { to{transform:rotate(360deg)} }
  @keyframes mp-pulse    { 0%,100%{opacity:.4} 50%{opacity:.85} }
  @keyframes mp-toast    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
 
  .mp-stat { animation: mp-fade-up 0.4s ease both; }
  .mp-stat:nth-child(1) { animation-delay: 0.05s; }
  .mp-stat:nth-child(2) { animation-delay: 0.10s; }
  .mp-stat:nth-child(3) { animation-delay: 0.15s; }
  .mp-stat:nth-child(4) { animation-delay: 0.20s; }
  .mp-stat:nth-child(5) { animation-delay: 0.25s; }
  .mp-stat:nth-child(6) { animation-delay: 0.30s; }
 
  .mp-section { animation: mp-fade-up 0.5s ease 0.2s both; }
  .mp-row:hover { background: #f5f0e8 !important; }
 
  .mp-skeleton {
    background: #ede9df;
    border-radius: 10px;
    animation: mp-pulse 1.5s ease infinite;
  }
 
  .mp-bar-wrap {
    background: #ede9df;
    border-radius: 99px;
    overflow: hidden;
    height: 8px;
  }
  .mp-bar-fill {
    height: 100%;
    border-radius: 99px;
    transition: width 0.6s cubic-bezier(0.4,0,0.2,1);
  }
 
  .mp-progress-ring {
    transition: stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1);
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
 
const fmtMoney = (v) =>
  v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
 
const LEAD_STATUS_COLOR = {
  NEW:         "#d97706",
  IN_PROGRESS: "#2563eb",
  DONE:        "#059669",
  REJECTED:    "#dc2626",
  DECLINED:    "#64748b",
};
const CONTRACT_STATUS_COLOR = {
  PENDING_SIGNATURE: "#d97706",
  ACTIVE:            "#059669",
  ENDED:             "#64748b",
  CANCELLED:         "#dc2626",
};
const PAYMENT_STATUS_COLOR = {
  PENDING:  "#d97706",
  PAID:     "#059669",
  OVERDUE:  "#dc2626",
  FAILED:   "#dc2626",
  REFUNDED: "#64748b",
};
 
function StatCard({ icon, label, value, accent = C.gold, sub, delta }) {
  return (
    <div className="mp-stat mp-card mp-btn"
      style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{
        width: 46, height: 46, borderRadius: 12, flexShrink: 0,
        background: `${accent}18`, border: `1.5px solid ${accent}28`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 10, fontWeight: 600, color: C.textMut, textTransform: "uppercase", letterSpacing: "0.9px", marginBottom: 3 }}>{label}</p>
        <p style={{ margin: 0, fontSize: 26, fontWeight: 700, color: C.text, fontFamily: "'Cormorant Garamond',Georgia,serif", letterSpacing: "-0.5px", lineHeight: 1 }}>{value ?? "—"}</p>
        {sub && <p style={{ margin: "4px 0 0", fontSize: 11, color: C.muted }}>{sub}</p>}
        {delta != null && (
          <p style={{ margin: "4px 0 0", fontSize: 11, color: delta >= 0 ? "#059669" : "#dc2626", fontWeight: 600 }}>
            {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}% vs last month
          </p>
        )}
      </div>
    </div>
  );
}
 
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
        <button className="mp-btn" onClick={onAction}
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
        <div key={i} className="mp-skeleton" style={{ height: h, opacity: 1 - i * 0.15 }} />
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
      fontFamily: "'DM Sans',sans-serif", animation: "mp-toast 0.2s ease",
      display: "flex", alignItems: "center", gap: 8,
    }}>
      {type === "error" ? "⚠️" : "✅"} {msg}
    </div>
  );
}
 
function ProgressRing({ value = 0, max = 100, size = 80, color = C.gold, label }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const offset = circ * (1 - pct);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#ede9df" strokeWidth={8} />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={8}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="mp-progress-ring"
        />
      </svg>
      <span style={{ fontSize: 11, color: C.textSub, fontWeight: 500 }}>{label}</span>
    </div>
  );
}
 
function BarRow({ label, value, max, accent, formatVal }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 12, color: C.textSub, fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>{formatVal ? formatVal(value) : value}</span>
      </div>
      <div className="mp-bar-wrap">
        <div className="mp-bar-fill" style={{ width: `${pct}%`, background: accent || C.gold }} />
      </div>
    </div>
  );
}
 
export default function MyPerformance() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
 
  const [stats, setStats] = useState({
    totalProperties: null,
    activeContracts: null,
    totalRevenue: null,
    pendingLeads: null,
    doneLeads: null,
    totalLeads: null,
    activeLeads: null,
    expiringSoon: null,
  });
 
  const [leads, setLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [contracts, setContracts] = useState([]);
  const [contractsLoading, setContractsLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [saleContracts, setSaleContracts] = useState([]);
  const [saleLoading, setSaleLoading] = useState(true);
 
  const notify = useCallback((msg, type = "success") =>
    setToast({ msg, type, key: Date.now() }), []);
 
  useEffect(() => {
    if (!user?.id) return;
 
    // Properties count
    api.get(`/api/properties/agent/${user.id}?page=0&size=1`)
      .then(r => setStats(s => ({ ...s, totalProperties: r.data.totalElements ?? (r.data.content || []).length })))
      .catch(() => {});
 
    // My leads
    setLeadsLoading(true);
    api.get("/api/leads/my/agent?page=0&size=50")
      .then(r => {
        const list = r.data.content || [];
        setLeads(list.slice(0, 6));
        setStats(s => ({
          ...s,
          totalLeads: list.length,
          pendingLeads: list.filter(l => l.status === "NEW").length,
          activeLeads:  list.filter(l => l.status === "IN_PROGRESS").length,
          doneLeads:    list.filter(l => l.status === "DONE").length,
        }));
      })
      .catch(() => {})
      .finally(() => setLeadsLoading(false));
 
    // Lease contracts
    setContractsLoading(true);
    api.get(`/api/contracts/lease/agent/${user.id}?page=0&size=50`)
      .then(r => {
        const list = r.data.content || [];
        setContracts(list.slice(0, 5));
        setStats(s => ({
          ...s,
          activeContracts: list.filter(c => c.status === "ACTIVE").length,
        }));
      })
      .catch(() => {})
      .finally(() => setContractsLoading(false));
 
    // Revenue
    api.get("/api/payments/revenue")
      .then(r => setStats(s => ({ ...s, totalRevenue: r.data })))
      .catch(() => {});
 
    // Expiring contracts
    api.get("/api/contracts/lease/expiring")
      .then(r => setStats(s => ({ ...s, expiringSoon: Array.isArray(r.data) ? r.data.length : 0 })))
      .catch(() => {});
 
    // Recent payments
    setPaymentsLoading(true);
    api.get("/api/payments/status/PAID?page=0&size=5")
      .then(r => setPayments(r.data.content || []))
      .catch(() => {})
      .finally(() => setPaymentsLoading(false));
 
    // Sale contracts
    setSaleLoading(true);
    api.get(`/api/sales/contracts/agent/${user.id}?page=0&size=5`)
      .then(r => setSaleContracts(r.data.content || []))
      .catch(() => {})
      .finally(() => setSaleLoading(false));
 
  }, [user?.id]);
 
  const leadsTotal = stats.totalLeads || 1;
  const conversionRate = stats.totalLeads > 0
    ? Math.round((stats.doneLeads / stats.totalLeads) * 100)
    : 0;
 
  return (
    <MainLayout role="agent">
      <style>{CSS}</style>
      <div className="mp">
 
        {/* ── HERO ── */}
        <div style={{
          background: `linear-gradient(160deg, ${C.dark} 0%, #1e1a14 50%, #241e16 100%)`,
          minHeight: 190, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "36px 32px", position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.018) 1px,transparent 1px)", backgroundSize: "22px 22px", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "-60px", right: "8%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle,rgba(201,184,122,0.07) 0%,transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg,transparent,${C.gold} 30%,${C.gold} 70%,transparent)` }} />
 
          <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 680, width: "100%" }}>
            <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 600, color: C.gold, textTransform: "uppercase", letterSpacing: "2.5px", fontFamily: "'DM Sans',sans-serif" }}>
              My Performance
            </p>
            <h1 style={{
              margin: "0 0 8px",
              fontFamily: "'Cormorant Garamond',Georgia,serif",
              fontSize: "clamp(22px,3.2vw,34px)",
              fontWeight: 700, color: "#f5f0e8", letterSpacing: "-0.4px", lineHeight: 1.1,
            }}>
              Agent Statistics &{" "}
              <span style={{
                background: `linear-gradient(90deg,${C.gold},${C.goldL},${C.gold})`,
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
                Activity Overview
              </span>
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(245,240,232,0.38)", fontFamily: "'DM Sans',sans-serif" }}>
              Full breakdown of your leads, contracts, revenue, and conversion performance
            </p>
          </div>
        </div>
 
        <div style={{ padding: "24px 28px", maxWidth: 1400, margin: "0 auto" }}>
 
          {/* KPI Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(175px,1fr))", gap: 14, marginBottom: 28 }}>
            <StatCard icon="🏠" label="My Properties"      value={stats.totalProperties ?? "—"} accent={C.gold}   />
            <StatCard icon="📋" label="Active Contracts"   value={stats.activeContracts ?? "—"} accent="#5aaa80"  />
            <StatCard icon="🎯" label="Total Leads"        value={stats.totalLeads ?? "—"}       accent="#7eb8d4"  />
            <StatCard icon="✅" label="Leads Completed"    value={stats.doneLeads ?? "—"}        accent="#059669"  sub={`${conversionRate}% conversion rate`} />
            <StatCard icon="⏳" label="Pending Leads"      value={stats.pendingLeads ?? "—"}     accent="#c9a87a"  sub={stats.pendingLeads > 0 ? "Waiting for review" : undefined} />
            <StatCard icon="💰" label="Total Revenue"      value={stats.totalRevenue != null ? fmtMoney(stats.totalRevenue) : "—"} accent="#a07eb8" />
          </div>
 
          {/* Conversion + Lead Breakdown */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
 
            {/* Lead funnel */}
            <div className="mp-card mp-section">
              <SectionHeader title="Lead Funnel" />
              <div style={{ padding: "20px 22px" }}>
                <BarRow
                  label="Total leads"
                  value={stats.totalLeads ?? 0}
                  max={stats.totalLeads || 1}
                  accent={C.gold}
                />
                <BarRow
                  label="Active (In Progress)"
                  value={stats.activeLeads ?? 0}
                  max={stats.totalLeads || 1}
                  accent="#2563eb"
                />
                <BarRow
                  label="Completed (Done)"
                  value={stats.doneLeads ?? 0}
                  max={stats.totalLeads || 1}
                  accent="#059669"
                />
                <BarRow
                  label="Pending (New)"
                  value={stats.pendingLeads ?? 0}
                  max={stats.totalLeads || 1}
                  accent="#d97706"
                />
              </div>
            </div>
 
            {/* Performance rings */}
            <div className="mp-card mp-section">
              <SectionHeader title="Conversion Overview" />
              <div style={{ padding: "24px 22px", display: "flex", justifyContent: "space-around", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <ProgressRing value={conversionRate} max={100} size={84} color="#059669" label="Lead conversion" />
                  <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.text, fontFamily: "'Cormorant Garamond',Georgia,serif", lineHeight: 1 }}>
                    {conversionRate}%
                  </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <ProgressRing
                    value={stats.activeContracts ?? 0}
                    max={Math.max(stats.activeContracts ?? 0, 10)}
                    size={84}
                    color="#5aaa80"
                    label="Active contracts"
                  />
                  <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.text, fontFamily: "'Cormorant Garamond',Georgia,serif", lineHeight: 1 }}>
                    {stats.activeContracts ?? "—"}
                  </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <ProgressRing
                    value={stats.totalProperties ?? 0}
                    max={Math.max(stats.totalProperties ?? 0, 20)}
                    size={84}
                    color={C.gold}
                    label="Properties"
                  />
                  <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.text, fontFamily: "'Cormorant Garamond',Georgia,serif", lineHeight: 1 }}>
                    {stats.totalProperties ?? "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
 
          {/* Leads + Contracts */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
 
            {/* My recent leads */}
            <div className="mp-card mp-section">
              <SectionHeader title="Recent Leads" count={stats.totalLeads} action="View all →" onAction={() => navigate("/agent/leads")} />
              {leadsLoading ? <Skeleton rows={5} h={52} /> :
               leads.length === 0 ? <EmptyRow icon="🎯" text="No leads assigned to you" /> : (
                <div>
                  {leads.map((lead, i) => {
                    const color = LEAD_STATUS_COLOR[lead.status] || "#64748b";
                    return (
                      <div key={lead.id} className="mp-row" style={{
                        padding: "12px 18px",
                        borderBottom: i < leads.length - 1 ? `1px solid ${C.border}` : "none",
                        display: "flex", alignItems: "center", gap: 12, transition: "background 0.15s",
                      }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {lead.client_name || `Client #${lead.client_id}`}
                            {lead.property_title && <span style={{ fontWeight: 400, color: C.muted }}> · {lead.property_title}</span>}
                          </p>
                          <p style={{ margin: "2px 0 0", fontSize: 11, color: C.textMut }}>
                            {lead.type} · {lead.source}
                          </p>
                        </div>
                        <span style={{
                          background: `${color}15`, color,
                          padding: "3px 10px", borderRadius: 20,
                          fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
                        }}>{lead.status?.replace("_", " ")}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
 
            {/* Lease contracts */}
            <div className="mp-card mp-section">
              <SectionHeader title="Lease Contracts" count={contracts.length} action="View all →" onAction={() => navigate("/agent/contracts")} />
              {contractsLoading ? <Skeleton rows={5} h={52} /> :
               contracts.length === 0 ? <EmptyRow icon="📋" text="No contracts found" /> : (
                <div>
                  {contracts.map((c, i) => {
                    const color = CONTRACT_STATUS_COLOR[c.status] || "#64748b";
                    return (
                      <div key={c.id} className="mp-row" style={{
                        padding: "12px 18px",
                        borderBottom: i < contracts.length - 1 ? `1px solid ${C.border}` : "none",
                        display: "flex", alignItems: "center", gap: 12, transition: "background 0.15s",
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: C.text }}>
                            Contract #{c.id}
                            <span style={{ fontWeight: 400, color: C.muted }}> · {fmtMoney(c.rent)}/mo</span>
                          </p>
                          <p style={{ margin: "2px 0 0", fontSize: 11, color: C.textMut }}>
                            {fmtDate(c.start_date)} → {fmtDate(c.end_date)}
                          </p>
                        </div>
                        <span style={{
                          background: `${color}15`, color,
                          padding: "3px 10px", borderRadius: 20,
                          fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
                        }}>{c.status?.replace("_", " ")}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
 
          {/* Payments + Sale contracts */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
 
            {/* Recent payments */}
            <div className="mp-card mp-section">
              <SectionHeader title="Recent Paid Payments" count={payments.length} action="View all →" onAction={() => navigate("/agent/payments")} />
              {paymentsLoading ? <Skeleton rows={4} h={52} /> :
               payments.length === 0 ? <EmptyRow icon="💳" text="No payments found" /> : (
                <div>
                  {payments.map((p, i) => {
                    const color = PAYMENT_STATUS_COLOR[p.status] || "#64748b";
                    return (
                      <div key={p.id} className="mp-row" style={{
                        padding: "12px 18px",
                        borderBottom: i < payments.length - 1 ? `1px solid ${C.border}` : "none",
                        display: "flex", alignItems: "center", gap: 12, transition: "background 0.15s",
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: C.text }}>
                            {fmtMoney(p.amount)}
                            <span style={{ fontWeight: 400, color: C.muted }}> · {p.payment_type || p.paymentType}</span>
                          </p>
                          <p style={{ margin: "2px 0 0", fontSize: 11, color: C.textMut }}>
                            Contract #{p.contract_id} · Paid: {fmtDate(p.paid_date || p.paidDate)}
                          </p>
                        </div>
                        <span style={{
                          background: `${color}15`, color,
                          padding: "3px 10px", borderRadius: 20,
                          fontSize: 11, fontWeight: 600,
                        }}>{p.status}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
 
            {/* Sale contracts */}
            <div className="mp-card mp-section">
              <SectionHeader title="Sale Contracts" count={saleContracts.length} action="View all →" onAction={() => navigate("/agent/sales")} />
              {saleLoading ? <Skeleton rows={4} h={52} /> :
               saleContracts.length === 0 ? <EmptyRow icon="🤝" text="No sale contracts found" /> : (
                <div>
                  {saleContracts.map((c, i) => {
                    const color = c.status === "COMPLETED" ? "#059669" : c.status === "CANCELLED" ? "#dc2626" : "#d97706";
                    return (
                      <div key={c.id} className="mp-row" style={{
                        padding: "12px 18px",
                        borderBottom: i < saleContracts.length - 1 ? `1px solid ${C.border}` : "none",
                        display: "flex", alignItems: "center", gap: 12, transition: "background 0.15s",
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: C.text }}>
                            Sale #{c.id}
                            <span style={{ fontWeight: 400, color: C.muted }}> · {fmtMoney(c.sale_price || c.salePrice)}</span>
                          </p>
                          <p style={{ margin: "2px 0 0", fontSize: 11, color: C.textMut }}>
                            Buyer #{c.buyer_id} · {fmtDate(c.contract_date || c.contractDate)}
                          </p>
                        </div>
                        <span style={{
                          background: `${color}15`, color,
                          padding: "3px 10px", borderRadius: 20,
                          fontSize: 11, fontWeight: 600,
                        }}>{c.status}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
 
          {/* Expiring alert */}
          {stats.expiringSoon > 0 && (
            <div className="mp-section" style={{
              background: "#fff8f0", border: "1.5px solid #f5c6a0",
              borderRadius: 14, padding: "14px 20px", marginBottom: 20,
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 22 }}>⚠️</span>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#7a3a1a", fontFamily: "'Cormorant Garamond',Georgia,serif" }}>
                    {stats.expiringSoon} contract{stats.expiringSoon > 1 ? "s" : ""} expiring within 30 days
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "#a05a2a" }}>Review and renew before expiry</p>
                </div>
              </div>
              <button className="mp-btn" onClick={() => navigate("/agent/contracts")}
                style={{ padding: "7px 16px", borderRadius: 9, background: "#7a3a1a", color: "#fff", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
                Review →
              </button>
            </div>
          )}
 
          {/* Quick actions */}
          <div className="mp-section">
            <p style={{ margin: "0 0 14px", fontSize: 10, fontWeight: 600, color: C.textMut, textTransform: "uppercase", letterSpacing: "1.2px" }}>
              Quick Actions
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(155px,1fr))", gap: 12 }}>
              {[
                { icon: "🎯", label: "All My Leads",    path: "/agent/leads",      accent: "#7eb8d4" },
                { icon: "📋", label: "My Contracts",    path: "/agent/contracts",  accent: "#5aaa80" },
                { icon: "💳", label: "Payments",        path: "/agent/payments",   accent: "#a07eb8" },
                { icon: "🏠", label: "My Properties",   path: "/agent/properties", accent: C.gold    },
                { icon: "🤝", label: "Sales",           path: "/agent/sales",      accent: "#c9a87a" },
                { icon: "🤖", label: "AI Assistant",    path: "/agent/ai-assistant", accent: "#9a8c6e" },
              ].map(({ icon, label, path, accent }) => (
                <button key={path} className="mp-btn" onClick={() => navigate(path)}
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
 