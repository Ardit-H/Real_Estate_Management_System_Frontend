import { useState, useEffect, useCallback } from "react";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";
 
import { C, CSS, JOBS, LEGEND } from "../../components/admin/backgroundjobs/backgroundJobsConstants.js";
import { Loader, StatCards, JobCard } from "../../components/admin/backgroundjobs/BackgroundJobsUI.jsx";
 
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
 
        {/* ── HERO ── */}
        <div style={{ background: "linear-gradient(160deg,#1a1714 0%,#1e1a14 50%,#241e16 100%)", minHeight: 180, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "36px 32px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.018) 1px,transparent 1px)", backgroundSize: "22px 22px", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg,transparent,${C.gold} 30%,${C.gold} 70%,transparent)` }} />
          <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
            <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 600, color: C.gold, textTransform: "uppercase", letterSpacing: "2.5px" }}>Admin · System</p>
            <h1 style={{ margin: "0 0 8px", fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "clamp(24px,3vw,36px)", fontWeight: 700, color: "#f5f0e8", letterSpacing: "-0.4px" }}>
              Background{" "}
              <span style={{ background: `linear-gradient(90deg,${C.gold},${C.goldL})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Jobs</span>
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(245,240,232,.38)" }}>
              Spring Scheduler jobs — run automatically for your company
            </p>
          </div>
        </div>
 
        {/* ── CONTENT ── */}
        <div style={{ padding: "24px 28px", maxWidth: 860, margin: "0 auto" }}>
 
          {/* Live stats */}
          {!loading && <StatCards systemData={systemData} />}
 
          {/* Jobs list */}
          <div className="bj-card" style={{ marginBottom: 0 }}>
            <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, background: "#fdf9f4", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text, fontFamily: "'Cormorant Garamond',Georgia,serif" }}>Scheduled Jobs</p>
              <span style={{ background: `${C.gold}22`, color: C.textSub, padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{JOBS.length}</span>
            </div>
            <div style={{ padding: "16px" }}>
              {loading ? <Loader /> : (
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
 
          {/* Legend */}
          <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            {LEGEND.map(l => (
              <span key={l.label} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: l.bg, color: l.color, padding: "4px 12px", borderRadius: 20, fontSize: 11.5, fontWeight: 500 }}>
                {l.icon} {l.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
 