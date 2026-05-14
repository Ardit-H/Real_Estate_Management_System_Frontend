import { useState, useEffect, useCallback } from "react";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";

// ─── Same palette & CSS as Notifications page ─────────────────────────────────
const C = {
  dark: "#1a1714", gold: "#c9b87a", goldL: "#e8d9a0",
  border: "#e8e2d6", surface: "#faf7f2", muted: "#9a8c6e",
  text: "#1a1714", textMut: "#b0a890", textSub: "#6b6340",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
  .bj *{box-sizing:border-box}
  .bj{font-family:'DM Sans',system-ui,sans-serif;background:#f2ede4;min-height:100vh}
  .bj-btn{transition:all .17s ease;cursor:pointer;font-family:'DM Sans',sans-serif;border:none}
  .bj-btn:hover{opacity:.85;transform:translateY(-1px)}
  .bj-card{background:#faf7f2;border:1.5px solid #e8e2d6;border-radius:14px;box-shadow:0 2px 16px rgba(20,16,10,.06);overflow:hidden}
  @keyframes bj-fade-up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes bj-spin{to{transform:rotate(360deg)}}
  .bj-card{animation:bj-fade-up .35s ease both}
  .bj-job-card{background:#faf7f2;border:1.5px solid #e8e2d6;border-radius:14px;box-shadow:0 2px 16px rgba(20,16,10,.06);padding:20px 22px;transition:box-shadow .2s,transform .2s}
  .bj-job-card:hover{box-shadow:0 6px 28px rgba(20,16,10,.10);transform:translateY(-2px)}
`;

// ─── Constants ────────────────────────────────────────────────────────────────
const JOBS = [
  {
    id: "overdue-payments",
    name: "Mark Overdue Payments",
    schedule: "Daily at 00:00",
    icon: "💳",
    description: "Marks PENDING payments with past due_date as OVERDUE.",
    color: "#dc2626",
    bg: "#fef2f2",
  },
  {
    id: "expiring-contracts",
    name: "Check Expiring Contracts",
    schedule: "Daily at 08:00",
    icon: "📄",
    description: "Finds leases expiring within 30 days and sends alerts.",
    color: "#d97706",
    bg: "#fffbeb",
  },
  {
    id: "system-stats",
    name: "Log System Stats",
    schedule: "Every 6 hours",
    icon: "📊",
    description: "Logs active lease count per tenant for monitoring.",
    color: "#7c3aed",
    bg: "#f5f3ff",
  },
  {
    id: "health-check",
    name: "Health Check",
    schedule: "Every 60 seconds",
    icon: "🩺",
    description: "Verifies active schemas are reachable.",
    color: "#059669",
    bg: "#ecfdf5",
  },
  {
    id: "weekly-report",
    name: "Weekly Admin Report",
    schedule: "Mondays at 09:00",
    icon: "📈",
    description: "Generates weekly summary: overdue, expiring, unassigned leads.",
    color: "#2563eb",
    bg: "#eff6ff",
  },
];

// ─── Loader (same as Notifications) ──────────────────────────────────────────
function Loader() {
  return (
    <div style={{ textAlign: "center", padding: "52px 0" }}>
      <div style={{ width: 28, height: 28, margin: "0 auto", border: "2.5px solid #e8e2d6", borderTop: `2.5px solid ${C.gold}`, borderRadius: "50%", animation: "bj-spin .7s linear infinite" }} />
    </div>
  );
}

// ─── Job Card (restyled, funksionaliteti i njëjtë) ────────────────────────────
function JobCard({ job, stats }) {
  return (
    <div className="bj-job-card" style={{ borderLeft: `3px solid ${job.color}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
        {/* Icon bubble — same style as NotifRow type icon */}
        <div style={{
          width: 44, height: 44, borderRadius: 11,
          background: job.bg, border: `1.5px solid ${job.color}28`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, flexShrink: 0,
        }}>
          {job.icon}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <p style={{
              margin: 0, fontSize: 14, fontWeight: 600, color: C.text,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              fontFamily: "'DM Sans',sans-serif",
            }}>
              {job.name}
            </p>
            {/* Active badge — gold tint like unread dot accent */}
            <span style={{
              background: "#ecfdf5", color: "#059669",
              padding: "2px 9px", borderRadius: 20, fontSize: 10, fontWeight: 600, flexShrink: 0,
            }}>
              ● Active
            </span>
          </div>
          <p style={{ margin: "3px 0 0", fontSize: 12, color: C.textMut }}>
            🕐 {job.schedule}
          </p>
        </div>
      </div>

      <p style={{ fontSize: 13, color: C.textSub, margin: "0 0 12px", lineHeight: 1.6 }}>
        {job.description}
      </p>

      {stats && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {Object.entries(stats).map(([k, v]) => (
            <div key={k} style={{
              background: "#f0ece3", borderRadius: 8, padding: "5px 12px", fontSize: 12,
              border: `1px solid ${C.border}`,
            }}>
              <span style={{ color: C.textMut }}>{k}: </span>
              <strong style={{ color: C.text }}>{v}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE — funksionaliteti identik, vetëm stili ndryshon
// ═══════════════════════════════════════════════════════════════════════════════
export default function BackgroundJobs() {
  const [systemData, setSystemData] = useState(null);
  const [loading, setLoading]       = useState(true);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const [overdueRes, contractsRes, leadsRes] = await Promise.allSettled([
        api.get("/api/payments/overdue"),
        api.get("/api/contracts/lease/expiring"),
        api.get("/api/leads/unassigned"),
      ]);

      setSystemData({
        overdueCount:    overdueRes.status   === "fulfilled" ? (overdueRes.value.data?.length   ?? 0) : "—",
        expiringCount:   contractsRes.status === "fulfilled" ? (contractsRes.value.data?.length  ?? 0) : "—",
        unassignedLeads: leadsRes.status     === "fulfilled" ? (leadsRes.value.data?.length      ?? 0) : "—",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const jobStats = systemData ? {
    "overdue-payments":   { "Overdue now": systemData.overdueCount },
    "expiring-contracts": { "Expiring in 30d": systemData.expiringCount },
    "system-stats":       { "Monitored": "All schemas" },
    "health-check":       { "Status": "Running" },
    "weekly-report":      { "Unassigned leads": systemData.unassignedLeads },
  } : {};

  return (
    <MainLayout role="admin">
      <style>{CSS}</style>
      <div className="bj">

        {/* ── HERO — identik me Notifications ── */}
        <div style={{
          background: "linear-gradient(160deg,#1a1714 0%,#1e1a14 50%,#241e16 100%)",
          minHeight: 180, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "36px 32px", position: "relative", overflow: "hidden",
        }}>
          {/* dot grid */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.018) 1px,transparent 1px)", backgroundSize: "22px 22px", pointerEvents: "none" }} />
          {/* gold top line */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg,transparent,${C.gold} 30%,${C.gold} 70%,transparent)` }} />

          <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
            <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 600, color: C.gold, textTransform: "uppercase", letterSpacing: "2.5px" }}>
              Admin · System
            </p>
            <h1 style={{
              margin: "0 0 8px",
              fontFamily: "'Cormorant Garamond',Georgia,serif",
              fontSize: "clamp(24px,3vw,36px)", fontWeight: 700,
              color: "#f5f0e8", letterSpacing: "-0.4px",
            }}>
              Background{" "}
              <span style={{ background: `linear-gradient(90deg,${C.gold},${C.goldL})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Jobs
              </span>
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(245,240,232,.38)" }}>
              Spring Scheduler jobs — ekzekutohen automatikisht për çdo tenant schema
            </p>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div style={{ padding: "24px 28px", maxWidth: 860, margin: "0 auto" }}>

          {/* Multi-tenancy note — styled si nt-card me accent */}
          <div className="bj-card" style={{
            marginBottom: 22, padding: "13px 18px",
            borderLeft: `3px solid ${C.gold}`,
            display: "flex", alignItems: "flex-start", gap: 10,
          }}>
            <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>⚙️</span>
            <p style={{ margin: 0, fontSize: 13, color: C.textSub, lineHeight: 1.6 }}>
              <strong style={{ color: C.text }}>Multi-tenancy:</strong>{" "}
              Çdo job iterron të gjitha tenant schemata automatikisht — pa kod të veçantë për secilën kompani.
            </p>
          </div>

          {/* Live stats — same grid as Notifications stats row */}
          {!loading && systemData && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 12, marginBottom: 22 }}>
              {[
                { icon: "💳", label: "Overdue Payments",   value: systemData.overdueCount,    accent: "#dc2626" },
                { icon: "📄", label: "Expiring Contracts",  value: systemData.expiringCount,   accent: "#d97706" },
                { icon: "🎯", label: "Unassigned Leads",    value: systemData.unassignedLeads, accent: "#7c3aed" },
              ].map(s => (
                <div key={s.label} className="bj-card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 9,
                    background: `${s.accent}18`, border: `1.5px solid ${s.accent}28`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, flexShrink: 0,
                  }}>
                    {s.icon}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 9.5, fontWeight: 600, color: C.textMut, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 2 }}>
                      {s.label}
                    </p>
                    <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.text, fontFamily: "'Cormorant Garamond',Georgia,serif", lineHeight: 1 }}>
                      {s.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Jobs list header — same si card header në Notifications */}
          <div className="bj-card" style={{ marginBottom: 0 }}>
            <div style={{
              padding: "14px 20px", borderBottom: `1px solid ${C.border}`,
              background: "#fdf9f4", display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text, fontFamily: "'Cormorant Garamond',Georgia,serif" }}>
                Scheduled Jobs
              </p>
              <span style={{ background: `${C.gold}22`, color: C.textSub, padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                {JOBS.length}
              </span>
            </div>

            <div style={{ padding: "16px" }}>
              {loading ? (
                <Loader />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {JOBS.map((job, i) => (
                    <div key={job.id} style={{ animationDelay: `${i * 0.06}s` }}>
                      <JobCard job={job} stats={jobStats[job.id]} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Legend — same si type legend në Notifications */}
          <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            {[
              { icon: "💳", label: "Payments",  color: "#dc2626", bg: "#fef2f2" },
              { icon: "📄", label: "Contracts", color: "#d97706", bg: "#fffbeb" },
              { icon: "📊", label: "Stats",     color: "#7c3aed", bg: "#f5f3ff" },
              { icon: "🩺", label: "Health",    color: "#059669", bg: "#ecfdf5" },
              { icon: "📈", label: "Reports",   color: "#2563eb", bg: "#eff6ff" },
            ].map(l => (
              <span key={l.label} style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                background: l.bg, color: l.color,
                padding: "4px 12px", borderRadius: 20, fontSize: 11.5, fontWeight: 500,
              }}>
                {l.icon} {l.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}