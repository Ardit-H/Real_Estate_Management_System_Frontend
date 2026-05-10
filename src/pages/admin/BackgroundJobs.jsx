import { useState, useEffect, useCallback } from "react";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";

const JOBS = [
  {
    id: "overdue-payments",
    name: "Mark Overdue Payments",
    schedule: "Daily at 00:00",
    icon: "💳",
    description: "Marks PENDING payments with past due_date as OVERDUE.",
    color: "#ef4444",
    bg: "#fef2f2",
  },
  {
    id: "expiring-contracts",
    name: "Check Expiring Contracts",
    schedule: "Daily at 08:00",
    icon: "📄",
    description: "Finds leases expiring within 30 days and sends alerts.",
    color: "#f59e0b",
    bg: "#fffbeb",
  },
  {
    id: "system-stats",
    name: "Log System Stats",
    schedule: "Every 6 hours",
    icon: "📊",
    description: "Logs active lease count per tenant for monitoring.",
    color: "#6366f1",
    bg: "#eef2ff",
  },
  {
    id: "health-check",
    name: "Health Check",
    schedule: "Every 60 seconds",
    icon: "🩺",
    description: "Verifies active schemas are reachable.",
    color: "#10b981",
    bg: "#ecfdf5",
  },
  {
    id: "weekly-report",
    name: "Weekly Admin Report",
    schedule: "Mondays at 09:00",
    icon: "📈",
    description: "Generates weekly summary: overdue, expiring, unassigned leads.",
    color: "#8b5cf6",
    bg: "#f5f3ff",
  },
];

function JobCard({ job, stats }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #e8edf4",
      borderRadius: 14, padding: "20px 22px",
      borderLeft: `4px solid ${job.color}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: 10,
          background: job.bg, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 20 }}>
          {job.icon}
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#0f172a" }}>
            {job.name}
          </h3>
          <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
            🕐 {job.schedule}
          </p>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <span style={{ background: "#ecfdf5", color: "#059669",
            padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
            ● Active
          </span>
        </div>
      </div>
      <p style={{ fontSize: 13, color: "#475569", margin: "0 0 12px", lineHeight: 1.6 }}>
        {job.description}
      </p>
      {stats && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {Object.entries(stats).map(([k, v]) => (
            <div key={k} style={{ background: "#f8fafc", borderRadius: 8,
              padding: "6px 12px", fontSize: 12 }}>
              <span style={{ color: "#94a3b8" }}>{k}: </span>
              <strong style={{ color: "#0f172a" }}>{v}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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
        overdueCount:   overdueRes.status   === "fulfilled" ? (overdueRes.value.data?.length   ?? 0) : "—",
        expiringCount:  contractsRes.status === "fulfilled" ? (contractsRes.value.data?.length  ?? 0) : "—",
        unassignedLeads: leadsRes.status    === "fulfilled" ? (leadsRes.value.data?.length      ?? 0) : "—",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const jobStats = systemData ? {
    "overdue-payments":   { "Overdue now": systemData.overdueCount },
    "expiring-contracts": { "Expiring in 30d": systemData.expiringCount },
    "system-stats":       { "Monitored":  "All schemas" },
    "health-check":       { "Status": "Running" },
    "weekly-report":      { "Unassigned leads": systemData.unassignedLeads },
  } : {};

  return (
    <MainLayout role="admin">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, margin: "0 0 4px" }}>
          Background Jobs
        </h1>
        <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>
          Spring Scheduler jobs — ekzekutohen automatikisht për çdo tenant schema.
          Live data nga sistemi.
        </p>
      </div>

      {/* Multi-tenancy note */}
      <div style={{ background: "#f0f4ff", border: "1px solid #c7d7fe",
        borderRadius: 10, padding: "12px 18px", marginBottom: 24,
        fontSize: 13, color: "#3730a3" }}>
        ⚙️ <strong>Multi-tenancy:</strong> Çdo job iterron të gjitha tenant schemata
        automatikisht — pa kod të veçantë për secilën kompani.
      </div>

      {/* Live stats */}
      {!loading && systemData && (
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          {[
            { label: "Overdue Payments",    value: systemData.overdueCount,    color: "#ef4444", icon: "💳" },
            { label: "Expiring Contracts",  value: systemData.expiringCount,   color: "#f59e0b", icon: "📄" },
            { label: "Unassigned Leads",    value: systemData.unassignedLeads, color: "#6366f1", icon: "🎯" },
          ].map(s => (
            <div key={s.label} style={{ background: "#fff", borderRadius: 12,
              border: "1px solid #e8edf4", padding: "14px 18px", flex: "1 1 150px" }}>
              <p style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase",
                letterSpacing: "0.06em", margin: "0 0 4px" }}>{s.icon} {s.label}</p>
              <p style={{ fontSize: 26, fontWeight: 700, color: s.color,
                margin: 0, letterSpacing: "-0.02em" }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div style={{ width: 28, height: 28, margin: "0 auto",
            border: "3px solid #e8edf4", borderTop: "3px solid #6366f1",
            borderRadius: "50%", animation: "spin .7s linear infinite" }} />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {JOBS.map(job => (
            <JobCard key={job.id} job={job} stats={jobStats[job.id]} />
          ))}
        </div>
      )}
    </MainLayout>
  );
}