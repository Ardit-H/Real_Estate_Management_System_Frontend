import MainLayout from "../../components/layout/Layout";
import { useDashboardStats } from "../../hooks/usePropertyCache";
import { AiPaymentRiskPanel } from "../shared/AiFeatures";
import { useState } from "react";

// ─── Palette (same as Notifications) ─────────────────────────────────────────
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
  .ad-card{animation:ad-fade-up .35s ease both}
  .ad-stat{background:#faf7f2;border:1.5px solid #e8e2d6;border-radius:14px;box-shadow:0 2px 16px rgba(20,16,10,.06);padding:18px 20px;transition:box-shadow .2s,transform .2s;animation:ad-fade-up .35s ease both}
  .ad-stat:hover{box-shadow:0 6px 28px rgba(20,16,10,.10);transform:translateY(-2px)}
`;

// ─── Status badge styles — beige-compatible ───────────────────────────────────
const STATUS_STYLE = {
  "For Sale": { bg: "#eff6ff", color: "#2563eb" },
  "For Rent": { bg: "#f5f3ff", color: "#7c3aed" },
  "Rented":   { bg: "#ecfdf5", color: "#059669" },
  "Sold":     { bg: "#f0ece3", color: C.textSub },
  "Pending":  { bg: "#fffbeb", color: "#d97706" },
};

const recentProperties = [
  { id: 1, address: "Rr. Nënë Tereza 14, Prishtinë", type: "Apartment",  status: "For Sale", price: "€145,000", agent: "Argjend M." },
  { id: 2, address: "Rr. Dardania 5, Prizren",        type: "House",      status: "For Rent", price: "€450/mo",  agent: "Vjosa K."   },
  { id: 3, address: "Rr. Adem Jashari 22, Mitrovicë", type: "Commercial", status: "For Sale", price: "€380,000", agent: "Blerim S."  },
  { id: 4, address: "Rr. Skënderbeu 8, Pejë",         type: "Apartment",  status: "Rented",   price: "€320/mo",  agent: "Argjend M." },
  { id: 5, address: "Rr. UÇK 3, Gjakovë",             type: "Land",       status: "For Sale", price: "€95,000",  agent: "Zana B."    },
];

// ─── AI Search (funksionalitet identik) ──────────────────────────────────────
function AiPaymentRiskClientSearch() {
  const [clientId,  setClientId]  = useState("");
  const [submitted, setSubmitted] = useState(null);

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, maxWidth: 400 }}>
        <input
          type="number" min="1" placeholder="Enter client ID..."
          value={clientId} onChange={e => setClientId(e.target.value)}
          style={{ flex: 1, padding: "9px 13px", border: `1.5px solid ${C.border}`, borderRadius: 9, fontSize: 13, outline: "none", background: C.surface, color: C.text, fontFamily: "'DM Sans',sans-serif" }}
        />
        <button className="ad-btn" onClick={() => setSubmitted(clientId ? Number(clientId) : null)} disabled={!clientId}
          style={{ padding: "9px 18px", borderRadius: 9, background: C.dark, color: C.goldL, fontSize: 13, fontWeight: 500, border: `1px solid ${C.gold}40`, opacity: !clientId ? .5 : 1 }}>
          Analyze
        </button>
        {submitted && (
          <button className="ad-btn" onClick={() => { setSubmitted(null); setClientId(""); }}
            style={{ padding: "9px 14px", borderRadius: 9, border: `1.5px solid ${C.border}`, background: "transparent", color: C.textSub, fontSize: 13, fontWeight: 500 }}>
            Clear
          </button>
        )}
      </div>
      {submitted && <AiPaymentRiskPanel clientId={submitted} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const { data: apiStats, isLoading } = useDashboardStats();

  const stats = apiStats ? [
    {
      label: "Total Properties",
      value: String((apiStats.available_properties ?? 0) + (apiStats.sold_properties ?? 0) + (apiStats.rented_properties ?? 0)),
      delta: "+live", up: true,
      accent: "#7c3aed", accentBg: "#f5f3ff",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
    },
    {
      label: "Active Leases",
      value: String(apiStats.active_leases ?? 0),
      delta: "live", up: true,
      accent: "#2563eb", accentBg: "#eff6ff",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="7.5" cy="15.5" r="5.5"/>
          <path d="M21 2 10.58 12.42M13 7l3 3M18 2l3 3-6 6-3-3"/>
        </svg>
      ),
    },
    {
      label: "Overdue Payments",
      value: String(apiStats.overdue_payments ?? 0),
      delta: (apiStats.overdue_payments ?? 0) > 0 ? "⚠️" : "✓",
      up:    (apiStats.overdue_payments ?? 0) === 0,
      accent:   (apiStats.overdue_payments ?? 0) > 0 ? "#dc2626" : "#059669",
      accentBg: (apiStats.overdue_payments ?? 0) > 0 ? "#fef2f2" : "#ecfdf5",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke={(apiStats.overdue_payments ?? 0) > 0 ? "#dc2626" : "#059669"}
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      ),
    },
    {
      label: "Total Revenue",
      value: `€${Number(apiStats.total_revenue ?? 0).toLocaleString("de-DE")}`,
      delta: "PAID", up: true,
      accent: "#059669", accentBg: "#ecfdf5",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
          <polyline points="17 6 23 6 23 12"/>
        </svg>
      ),
    },
    {
      label: "Open Leads",
      value: String(apiStats.pending_leads ?? 0),
      delta: "NEW", up: true,
      accent: "#d97706", accentBg: "#fffbeb",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="6"/>
          <circle cx="12" cy="12" r="2"/>
        </svg>
      ),
    },
  ] : [];

  // ── Loading state ──
  if (isLoading) {
    return (
      <MainLayout role="admin">
        <style>{CSS}</style>
        <div className="ad">
          {/* Hero shell while loading */}
          <div style={{ background: "linear-gradient(160deg,#1a1714 0%,#1e1a14 50%,#241e16 100%)", minHeight: 180, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.018) 1px,transparent 1px)", backgroundSize: "22px 22px", pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg,transparent,${C.gold} 30%,${C.gold} 70%,transparent)` }} />
            <div style={{ width: 28, height: 28, border: `2.5px solid rgba(201,184,122,.3)`, borderTop: `2.5px solid ${C.gold}`, borderRadius: "50%", animation: "ad-spin .7s linear infinite", position: "relative", zIndex: 1 }} />
          </div>
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <p style={{ color: C.textMut, fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}>Duke ngarkuar dashboard...</p>
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
        <div style={{ background: "linear-gradient(160deg,#1a1714 0%,#1e1a14 50%,#241e16 100%)", minHeight: 180, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "36px 32px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.018) 1px,transparent 1px)", backgroundSize: "22px 22px", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg,transparent,${C.gold} 30%,${C.gold} 70%,transparent)` }} />

          <div style={{ position: "relative", zIndex: 1, textAlign: "center", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%" }}>
            <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 600, color: C.gold, textTransform: "uppercase", letterSpacing: "2.5px" }}>Admin · Overview</p>
            <h1 style={{ margin: "0 0 8px", fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "clamp(24px,3vw,36px)", fontWeight: 700, color: "#f5f0e8", letterSpacing: "-0.4px" }}>
              Admin{" "}
              <span style={{ background: `linear-gradient(90deg,${C.gold},${C.goldL})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Dashboard</span>
            </h1>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: "rgba(245,240,232,.38)" }}>Welcome back — here's what's happening today.</p>

            {/* Action buttons in hero */}
            <div style={{ display: "flex", gap: 10 }}>
              <button className="ad-btn" style={{ padding: "8px 18px", borderRadius: 9, background: C.gold, color: C.dark, fontSize: 13, fontWeight: 600, border: "none" }}>
                + Add Property
              </button>
            </div>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div style={{ padding: "24px 28px", maxWidth: 1100, margin: "0 auto" }}>

          {/* ── Stat cards grid ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 14, marginBottom: 24 }}>
            {stats.map((s, i) => (
              <div key={s.label} className="ad-stat" style={{ animationDelay: `${i * 0.06}s` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  {/* Icon bubble */}
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: s.accentBg, border: `1.5px solid ${s.accent}28`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {s.icon}
                  </div>
                  {/* Delta badge */}
                  <span style={{ fontSize: 10, fontWeight: 600, color: s.up ? "#059669" : "#dc2626", background: s.up ? "#ecfdf5" : "#fef2f2", padding: "2px 8px", borderRadius: 20 }}>
                    {s.delta}
                  </span>
                </div>
                <p style={{ margin: "0 0 3px", fontSize: 9.5, fontWeight: 600, color: C.textMut, textTransform: "uppercase", letterSpacing: "0.8px" }}>{s.label}</p>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.text, fontFamily: "'Cormorant Garamond',Georgia,serif", lineHeight: 1 }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* ── Recent Properties ── */}
          <div className="ad-card" style={{ marginBottom: 24 }}>
            <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, background: "#fdf9f4", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text, fontFamily: "'Cormorant Garamond',Georgia,serif" }}>Recent Properties</p>
              <button className="ad-btn" style={{ padding: "5px 12px", borderRadius: 7, border: `1.5px solid ${C.border}`, background: "transparent", color: C.textSub, fontSize: 12, fontWeight: 500 }}>
                View all →
              </button>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'DM Sans',sans-serif" }}>
                <thead>
                  <tr style={{ background: "#f0ece3", borderBottom: `1px solid ${C.border}` }}>
                    {["Address", "Type", "Status", "Price", "Agent", "Actions"].map(h => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.7px", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentProperties.map(p => {
                    const ss = STATUS_STYLE[p.status] || { bg: "#f0ece3", color: C.textSub };
                    return (
                      <tr key={p.id} className="ad-row" style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: "13px 14px", fontWeight: 500, fontSize: 13, color: C.text }}>{p.address}</td>
                        <td style={{ padding: "13px 14px", fontSize: 12.5, color: C.textSub }}>{p.type}</td>
                        <td style={{ padding: "13px 14px" }}>
                          <span style={{ background: ss.bg, color: ss.color, padding: "2px 9px", borderRadius: 20, fontSize: 10, fontWeight: 600 }}>{p.status}</span>
                        </td>
                        <td style={{ padding: "13px 14px", fontWeight: 500, fontSize: 13, color: C.text }}>{p.price}</td>
                        <td style={{ padding: "13px 14px", fontSize: 12.5, color: C.textSub }}>{p.agent}</td>
                        <td style={{ padding: "13px 14px" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button className="ad-btn" style={{ padding: "5px 12px", borderRadius: 7, border: `1.5px solid ${C.border}`, background: "transparent", color: C.textSub, fontSize: 12, fontWeight: 500 }}>View</button>
                            <button className="ad-btn" style={{ padding: "5px 12px", borderRadius: 7, border: `1.5px solid ${C.border}`, background: C.surface, color: C.textSub, fontSize: 12, fontWeight: 500 }}>Edit</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── AI Payment Risk ── */}
          <div className="ad-card">
            <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, background: "#fdf9f4", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text, fontFamily: "'Cormorant Garamond',Georgia,serif" }}>
                AI Payment Risk Analysis
              </p>
              <span style={{ fontSize: 11, color: C.textMut, background: `${C.gold}22`, padding: "2px 9px", borderRadius: 20, fontWeight: 500 }}>
                AI · Beta
              </span>
            </div>
            <div style={{ padding: "16px 20px" }}>
              <p style={{ fontSize: 13, color: C.textSub, marginBottom: 16, lineHeight: 1.6 }}>
                Enter a client ID to analyze their payment risk score using AI.
              </p>
              <AiPaymentRiskClientSearch />
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}