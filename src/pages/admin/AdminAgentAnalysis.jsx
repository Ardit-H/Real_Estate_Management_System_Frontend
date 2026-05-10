import { useState, useEffect, useCallback } from "react";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";

const LEVEL_CFG = {
  EXCELLENT:         { color: "#059669", bg: "#ecfdf5", bar: "#059669" },
  GOOD:              { color: "#0ea5e9", bg: "#f0f9ff", bar: "#0ea5e9" },
  AVERAGE:           { color: "#f59e0b", bg: "#fffbeb", bar: "#f59e0b" },
  NEEDS_IMPROVEMENT: { color: "#ef4444", bg: "#fef2f2", bar: "#ef4444" },
};

export default function AdminAgentAnalysis() {
  const [agents,    setAgents]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [results,   setResults]   = useState({});
  const [analyzing, setAnalyzing] = useState({});

  useEffect(() => {
    const loadAgents = async () => {
      try {
        const profilesRes = await api.get("/api/users/agents");
        const profiles    = profilesRes.data || [];

        const usersRes = await api.get("/api/users");
        const users    = usersRes.data || [];

        const merged = profiles.map(p => {
          const user = users.find(u => u.id === p.user_id);
          return {
            ...p,
            full_name: user
              ? `${user.first_name} ${user.last_name}`.trim()
              : `Agent #${p.user_id}`,
          };
        });

        setAgents(merged);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadAgents();
  }, []);

  // ── Ky funksion mungonte ────────────────────────────────────
  const analyze = useCallback(async (agentId) => {
    setAnalyzing(p => ({ ...p, [agentId]: true }));
    try {
      const r = await api.get(`/api/admin/ai/agent/${agentId}/performance`);
      setResults(p => ({ ...p, [agentId]: r.data }));
    } catch (e) {
      setResults(p => ({
        ...p,
        [agentId]: { error: e.response?.data?.message || "AI error" },
      }));
    } finally {
      setAnalyzing(p => ({ ...p, [agentId]: false }));
    }
  }, []);
  // ────────────────────────────────────────────────────────────

  return (
    <MainLayout role="admin">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, margin: "0 0 4px" }}>
          🤖 AI Agent Performance Analysis
        </h1>
        <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>
          Analizë AI e performancës bazuar tek leads, kontratat dhe pagesat e çdo agjenti.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div style={{ width: 28, height: 28, margin: "0 auto",
            border: "3px solid #e8edf4", borderTop: "3px solid #6366f1",
            borderRadius: "50%", animation: "spin .7s linear infinite" }} />
        </div>
      ) : agents.length === 0 ? (
        <div style={{ textAlign: "center", padding: "52px 0", color: "#94a3b8" }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>👤</div>
          <p>Nuk ka agjentë me profil.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 16 }}>
          {agents.map(agent => {
            const result = results[agent.user_id];
            const busy   = analyzing[agent.user_id];
            const cfg    = result && !result.error
              ? (LEVEL_CFG[result.level] || LEVEL_CFG.AVERAGE)
              : null;
            const initials = (agent.full_name || `A${agent.user_id}`)
              .split(" ").slice(0, 2).map(w => w[0]?.toUpperCase()).join("");

            return (
              <div key={agent.user_id} style={{
                background: "#fff", border: "1px solid #e8edf4",
                borderRadius: 14, overflow: "hidden",
              }}>
                {/* Header */}
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #e8edf4",
                  display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%",
                    background: "linear-gradient(135deg,#6366f1,#818cf8)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                    {initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#0f172a",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {agent.full_name || `Agent #${agent.user_id}`}
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
                      #{agent.user_id}
                      {agent.specialization && ` · ${agent.specialization}`}
                      {agent.rating > 0 && ` · ★ ${Number(agent.rating).toFixed(1)}`}
                    </p>
                  </div>
                  {cfg && (
                    <span style={{ background: cfg.bg, color: cfg.color,
                      padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                      {result.level}
                    </span>
                  )}
                </div>

                {/* Result area */}
                <div style={{ padding: "16px 20px" }}>
                  {!result && !busy && (
                    <button onClick={() => analyze(agent.user_id)} style={{
                      width: "100%", padding: "10px", borderRadius: 8, border: "none",
                      background: "#6366f1", color: "#fff", cursor: "pointer",
                      fontSize: 13, fontWeight: 500,
                    }}>
                      ✨ Analyze Performance
                    </button>
                  )}

                  {busy && (
                    <div style={{ textAlign: "center", padding: "16px 0" }}>
                      <div style={{ width: 24, height: 24, margin: "0 auto 8px",
                        border: "3px solid #e8edf4", borderTop: "3px solid #6366f1",
                        borderRadius: "50%", animation: "spin .7s linear infinite" }} />
                      <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
                        AI is analyzing...
                      </p>
                    </div>
                  )}

                  {result?.error && (
                    <div style={{ background: "#fef2f2", border: "1px solid #fecaca",
                      borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#b91c1c" }}>
                      ⚠️ {result.error}
                    </div>
                  )}

                  {result && !result.error && cfg && (
                    <div>
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 12, color: "#64748b" }}>Performance Score</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: cfg.color }}>
                            {result.score}/10
                          </span>
                        </div>
                        <div style={{ height: 6, background: "#e8edf4", borderRadius: 999, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${result.score * 10}%`,
                            background: cfg.bar, borderRadius: 999, transition: "width .5s" }} />
                        </div>
                      </div>

                      <div style={{ background: "#f0fdf4", borderRadius: 8,
                        padding: "10px 12px", marginBottom: 8 }}>
                        <p style={{ margin: "0 0 3px", fontSize: 10, fontWeight: 600,
                          color: "#059669", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          Strengths
                        </p>
                        <p style={{ margin: 0, fontSize: 12.5, color: "#374151", lineHeight: 1.5 }}>
                          {result.strengths}
                        </p>
                      </div>

                      <div style={{ background: "#eff6ff", borderRadius: 8, padding: "10px 12px" }}>
                        <p style={{ margin: "0 0 3px", fontSize: 10, fontWeight: 600,
                          color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          Recommendation
                        </p>
                        <p style={{ margin: 0, fontSize: 12.5, color: "#374151", lineHeight: 1.5 }}>
                          {result.recommendation}
                        </p>
                      </div>

                      <button
                        onClick={() => setResults(p => {
                          const n = { ...p };
                          delete n[agent.user_id];
                          return n;
                        })}
                        style={{ marginTop: 10, fontSize: 11, padding: "4px 10px",
                          borderRadius: 6, border: "1px solid #e8edf4",
                          background: "transparent", color: "#94a3b8", cursor: "pointer" }}>
                        Re-analyze
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </MainLayout>
  );
}