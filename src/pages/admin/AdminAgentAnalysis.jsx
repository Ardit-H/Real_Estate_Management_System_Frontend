import { useState, useEffect, useCallback } from "react";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";
 
import { C, CSS, LEVEL_CFG } from "../../components/admin/agentanalysis/agentAnalysisConstants.js";
import { Loader, Empty, AgentCard } from "../../components/admin/agentanalysis/AgentAnalysisUI.jsx";
 
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
 
  const clearResult = useCallback((agentId) => {
    setResults(p => { const n = { ...p }; delete n[agentId]; return n; });
  }, []);
 
  return (
    <MainLayout role="admin">
      <style>{CSS}</style>
      <div className="aa">
 
        {/* ── HERO ── */}
        <div style={{
          background: "linear-gradient(160deg,#1a1714 0%,#1e1a14 50%,#241e16 100%)",
          minHeight: 180, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "36px 32px", position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.018) 1px,transparent 1px)", backgroundSize: "22px 22px", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg,transparent,${C.gold} 30%,${C.gold} 70%,transparent)` }} />
          <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
            <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 600, color: C.gold, textTransform: "uppercase", letterSpacing: "2.5px" }}>
              Admin · AI Analysis
            </p>
            <h1 style={{ margin: "0 0 8px", fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "clamp(24px,3vw,36px)", fontWeight: 700, color: "#f5f0e8", letterSpacing: "-0.4px" }}>
              Agent{" "}
              <span style={{ background: `linear-gradient(90deg,${C.gold},${C.goldL})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Performance
              </span>
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(245,240,232,.38)" }}>
              AI-powered performance analysis based on leads, contracts and payments for each agent
            </p>
          </div>
        </div>
 
        {/* ── CONTENT ── */}
        <div style={{ padding: "24px 28px", maxWidth: 1060, margin: "0 auto" }}>
          {loading ? <Loader /> : agents.length === 0 ? <Empty /> : (
            <>
              <div style={{
                padding: "14px 20px", marginBottom: 18,
                background: "#fdf9f4", border: `1.5px solid ${C.border}`,
                borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text, fontFamily: "'Cormorant Garamond',Georgia,serif" }}>
                  AI Agent Performance Analysis
                </p>
                <span style={{ background: `${C.gold}22`, color: C.textSub, padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                  {agents.length} agents
                </span>
              </div>
 
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 16 }}>
                {agents.map((agent, i) => (
                  <div key={agent.user_id} style={{ animationDelay: `${i * 0.05}s` }}>
                    <AgentCard
                      agent={agent}
                      result={results[agent.user_id]}
                      busy={analyzing[agent.user_id]}
                      onAnalyze={analyze}
                      onClear={clearResult}
                    />
                  </div>
                ))}
              </div>
 
              <div style={{ marginTop: 24, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                {Object.entries(LEVEL_CFG).map(([key, c]) => (
                  <span key={key} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: c.bg, color: c.color, padding: "4px 12px", borderRadius: 20, fontSize: 11.5, fontWeight: 500 }}>
                    {key.replace("_", " ")}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
 