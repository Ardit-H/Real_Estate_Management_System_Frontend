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
  .aa *{box-sizing:border-box}
  .aa{font-family:'DM Sans',system-ui,sans-serif;background:#f2ede4;min-height:100vh}
  .aa-card{background:#faf7f2;border:1.5px solid #e8e2d6;border-radius:14px;box-shadow:0 2px 16px rgba(20,16,10,.06);overflow:hidden;transition:box-shadow .2s,transform .2s}
  .aa-card:hover{box-shadow:0 6px 28px rgba(20,16,10,.11);transform:translateY(-2px)}
  .aa-btn{transition:all .17s ease;cursor:pointer;font-family:'DM Sans',sans-serif;border:none}
  .aa-btn:hover{opacity:.85;transform:translateY(-1px)}
  @keyframes aa-fade-up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes aa-spin{to{transform:rotate(360deg)}}
  @keyframes aa-pulse{0%,100%{opacity:.35}50%{opacity:.8}}
  .aa-card{animation:aa-fade-up .35s ease both}
`;

// ─── Level config — same semantic colors as Notifications TYPE_CFG ────────────
const LEVEL_CFG = {
  EXCELLENT:         { color: "#059669", bg: "#ecfdf5", bar: "#059669" },
  GOOD:              { color: "#0ea5e9", bg: "#f0f9ff", bar: "#0ea5e9" },
  AVERAGE:           { color: "#d97706", bg: "#fffbeb", bar: "#d97706" },
  NEEDS_IMPROVEMENT: { color: "#dc2626", bg: "#fef2f2", bar: "#dc2626" },
};

// ─── Loader (same as Notifications) ──────────────────────────────────────────
function Loader() {
  return (
    <div style={{ textAlign: "center", padding: "52px 0" }}>
      <div style={{ width: 28, height: 28, margin: "0 auto", border: "2.5px solid #e8e2d6", borderTop: `2.5px solid ${C.gold}`, borderRadius: "50%", animation: "aa-spin .7s linear infinite" }} />
    </div>
  );
}

// ─── Empty state (same as Notifications) ─────────────────────────────────────
function Empty() {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: C.textMut }}>
      <div style={{ fontSize: 44, marginBottom: 12 }}>👤</div>
      <p style={{ fontSize: 16, fontWeight: 700, color: C.textSub, margin: "0 0 6px", fontFamily: "'Cormorant Garamond',Georgia,serif" }}>
        Nuk ka agjentë me profil
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE — funksionaliteti identik, vetëm stili ndryshon
// ═══════════════════════════════════════════════════════════════════════════════
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

  return (
    <MainLayout role="admin">
      <style>{CSS}</style>
      <div className="aa">

        {/* ── HERO — identik me Notifications ── */}
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
            <h1 style={{
              margin: "0 0 8px",
              fontFamily: "'Cormorant Garamond',Georgia,serif",
              fontSize: "clamp(24px,3vw,36px)", fontWeight: 700,
              color: "#f5f0e8", letterSpacing: "-0.4px",
            }}>
              Agent{" "}
              <span style={{ background: `linear-gradient(90deg,${C.gold},${C.goldL})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Performance
              </span>
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(245,240,232,.38)" }}>
              Analizë AI e performancës bazuar tek leads, kontratat dhe pagesat e çdo agjenti
            </p>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div style={{ padding: "24px 28px", maxWidth: 1060, margin: "0 auto" }}>

          {loading ? <Loader /> : agents.length === 0 ? <Empty /> : (
            <>
              {/* List header — same si card header në Notifications */}
              <div style={{
                padding: "14px 20px", marginBottom: 18,
                background: "#fdf9f4", border: `1.5px solid ${C.border}`,
                borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text, fontFamily: "'Cormorant Garamond',Georgia,serif" }}>
                  AI Agent Performance Analysis
                </p>
                <span style={{ background: `${C.gold}22`, color: C.textSub, padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                  {agents.length} agjentë
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 16 }}>
                {agents.map((agent, i) => {
                  const result = results[agent.user_id];
                  const busy   = analyzing[agent.user_id];
                  const cfg    = result && !result.error
                    ? (LEVEL_CFG[result.level] || LEVEL_CFG.AVERAGE)
                    : null;
                  const initials = (agent.full_name || `A${agent.user_id}`)
                    .split(" ").slice(0, 2).map(w => w[0]?.toUpperCase()).join("");

                  return (
                    <div key={agent.user_id} className="aa-card" style={{ animationDelay: `${i * 0.05}s` }}>

                      {/* ── Card Header ── */}
                      <div style={{
                        padding: "16px 20px", borderBottom: `1px solid ${C.border}`,
                        background: "#fdf9f4", display: "flex", alignItems: "center", gap: 14,
                      }}>
                        {/* Avatar bubble — gold tint instead of indigo gradient */}
                        <div style={{
                          width: 44, height: 44, borderRadius: "50%",
                          background: `linear-gradient(135deg,${C.gold},${C.goldL})`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: C.dark, fontWeight: 700, fontSize: 14, flexShrink: 0,
                          fontFamily: "'Cormorant Garamond',Georgia,serif",
                        }}>
                          {initials}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            margin: 0, fontWeight: 600, fontSize: 14, color: C.text,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>
                            {agent.full_name || `Agent #${agent.user_id}`}
                          </p>
                          <p style={{ margin: 0, fontSize: 12, color: C.textMut }}>
                            #{agent.user_id}
                            {agent.specialization && ` · ${agent.specialization}`}
                            {agent.rating > 0 && ` · ★ ${Number(agent.rating).toFixed(1)}`}
                          </p>
                        </div>

                        {cfg && (
                          <span style={{
                            background: cfg.bg, color: cfg.color,
                            padding: "2px 9px", borderRadius: 20, fontSize: 10, fontWeight: 600, flexShrink: 0,
                          }}>
                            {result.level}
                          </span>
                        )}
                      </div>

                      {/* ── Result area ── */}
                      <div style={{ padding: "16px 20px" }}>

                        {/* Analyze button */}
                        {!result && !busy && (
                          <button className="aa-btn" onClick={() => analyze(agent.user_id)} style={{
                            width: "100%", padding: "10px", borderRadius: 9,
                            background: C.dark, color: C.goldL,
                            fontSize: 13, fontWeight: 500,
                            border: `1px solid ${C.gold}40`,
                            letterSpacing: "0.3px",
                          }}>
                            ✨ Analyze Performance
                          </button>
                        )}

                        {/* Analyzing spinner */}
                        {busy && (
                          <div style={{ textAlign: "center", padding: "16px 0" }}>
                            <div style={{ width: 24, height: 24, margin: "0 auto 8px", border: `2.5px solid ${C.border}`, borderTop: `2.5px solid ${C.gold}`, borderRadius: "50%", animation: "aa-spin .7s linear infinite" }} />
                            <p style={{ fontSize: 12, color: C.textMut, margin: 0 }}>AI is analyzing...</p>
                          </div>
                        )}

                        {/* Error state */}
                        {result?.error && (
                          <div style={{
                            background: "#fef2f2", border: "1.5px solid #fecaca",
                            borderRadius: 9, padding: "10px 14px",
                            fontSize: 13, color: "#dc2626",
                          }}>
                            ⚠️ {result.error}
                          </div>
                        )}

                        {/* Result */}
                        {result && !result.error && cfg && (
                          <div>
                            {/* Score bar */}
                            <div style={{ marginBottom: 12 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                                <span style={{ fontSize: 11.5, color: C.textMut, textTransform: "uppercase", letterSpacing: "0.6px", fontWeight: 600 }}>
                                  Performance Score
                                </span>
                                <span style={{ fontSize: 13, fontWeight: 700, color: cfg.color, fontFamily: "'Cormorant Garamond',Georgia,serif" }}>
                                  {result.score}/10
                                </span>
                              </div>
                              <div style={{ height: 6, background: C.border, borderRadius: 999, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${result.score * 10}%`, background: cfg.bar, borderRadius: 999, transition: "width .5s" }} />
                              </div>
                            </div>

                            {/* Strengths */}
                            <div style={{
                              background: "#ecfdf5", borderRadius: 9, border: "1.5px solid #059669"+"28",
                              padding: "10px 12px", marginBottom: 8,
                            }}>
                              <p style={{ margin: "0 0 3px", fontSize: 9.5, fontWeight: 600, color: "#059669", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                                Strengths
                              </p>
                              <p style={{ margin: 0, fontSize: 12.5, color: C.textSub, lineHeight: 1.6 }}>
                                {result.strengths}
                              </p>
                            </div>

                            {/* Recommendation */}
                            <div style={{
                              background: "#eff6ff", borderRadius: 9, border: "1.5px solid #2563eb"+"28",
                              padding: "10px 12px",
                            }}>
                              <p style={{ margin: "0 0 3px", fontSize: 9.5, fontWeight: 600, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                                Recommendation
                              </p>
                              <p style={{ margin: 0, fontSize: 12.5, color: C.textSub, lineHeight: 1.6 }}>
                                {result.recommendation}
                              </p>
                            </div>

                            {/* Re-analyze */}
                            <button
                              className="aa-btn"
                              onClick={() => setResults(p => {
                                const n = { ...p };
                                delete n[agent.user_id];
                                return n;
                              })}
                              style={{
                                marginTop: 10, fontSize: 11, padding: "4px 12px",
                                borderRadius: 7, border: `1px solid ${C.border}`,
                                background: "transparent", color: C.textMut, cursor: "pointer",
                              }}>
                              Re-analyze
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Level legend — same si type legend në Notifications */}
              <div style={{ marginTop: 24, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                {Object.entries(LEVEL_CFG).map(([key, c]) => (
                  <span key={key} style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    background: c.bg, color: c.color,
                    padding: "4px 12px", borderRadius: 20, fontSize: 11.5, fontWeight: 500,
                  }}>
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