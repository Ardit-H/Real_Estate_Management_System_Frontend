import { useState } from "react";
import { C, LEVEL_CFG } from "./agentAnalysisConstants.js";
 
export function Loader() {
  return (
    <div style={{ textAlign: "center", padding: "52px 0" }}>
      <div style={{ width: 28, height: 28, margin: "0 auto", border: "2.5px solid #e8e2d6", borderTop: `2.5px solid ${C.gold}`, borderRadius: "50%", animation: "aa-spin .7s linear infinite" }} />
    </div>
  );
}
 
export function Empty() {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: C.textMut }}>
      <div style={{ fontSize: 44, marginBottom: 12 }}>👤</div>
      <p style={{ fontSize: 16, fontWeight: 700, color: C.textSub, margin: "0 0 6px", fontFamily: "'Cormorant Garamond',Georgia,serif" }}>
        No agents with a profile
      </p>
    </div>
  );
}
 
// ─── Avatar — shows photo if available, falls back to initials ───────────────
function AgentAvatar({ agent, size = 44 }) {
  const [imgError, setImgError] = useState(false);
 
  // photo_url comes from AgentProfile entity (merged in AdminAgentAnalysis.jsx)
  const photoUrl = agent.photo_url || agent.photoUrl || null;
 
  const initials = (agent.full_name || `A${agent.user_id}`)
    .split(" ").filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join("");
 
  if (photoUrl && !imgError) {
    return (
      <img
        src={photoUrl}
        alt={agent.full_name || "Agent"}
        onError={() => setImgError(true)}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
          border: `2px solid ${C.gold}55`,
          boxShadow: `0 0 0 2px ${C.gold}1a`,
        }}
      />
    );
  }
 
  // Fallback: gradient circle with initials
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: `linear-gradient(135deg,${C.gold},${C.goldL})`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: C.dark,
      fontWeight: 700,
      fontSize: Math.round(size * 0.32),
      flexShrink: 0,
      fontFamily: "'Cormorant Garamond',Georgia,serif",
      border: `2px solid ${C.gold}55`,
    }}>
      {initials}
    </div>
  );
}
 
export function AgentCard({ agent, result, busy, onAnalyze, onClear }) {
  const cfg = result && !result.error ? (LEVEL_CFG[result.level] || LEVEL_CFG.AVERAGE) : null;
 
  return (
    <div className="aa-card">
      {/* Card Header */}
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, background: "#fdf9f4", display: "flex", alignItems: "center", gap: 14 }}>
        <AgentAvatar agent={agent} size={44} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {agent.full_name || `Agent #${agent.user_id}`}
          </p>
          <p style={{ margin: 0, fontSize: 12, color: C.textMut }}>
            #{agent.user_id}
            {agent.specialization && ` · ${agent.specialization}`}
            {agent.rating > 0 && ` · ★ ${Number(agent.rating).toFixed(1)}`}
          </p>
        </div>
        {cfg && (
          <span style={{ background: cfg.bg, color: cfg.color, padding: "2px 9px", borderRadius: 20, fontSize: 10, fontWeight: 600, flexShrink: 0 }}>
            {result.level}
          </span>
        )}
      </div>
 
      {/* Result area */}
      <div style={{ padding: "16px 20px" }}>
        {!result && !busy && (
          <button className="aa-btn" onClick={() => onAnalyze(agent.user_id)} style={{
            width: "100%", padding: "10px", borderRadius: 9,
            background: C.dark, color: C.goldL,
            fontSize: 13, fontWeight: 500,
            border: `1px solid ${C.gold}40`,
            letterSpacing: "0.3px",
          }}>
            ✨ Analyze Performance
          </button>
        )}
 
        {busy && (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ width: 24, height: 24, margin: "0 auto 8px", border: `2.5px solid ${C.border}`, borderTop: `2.5px solid ${C.gold}`, borderRadius: "50%", animation: "aa-spin .7s linear infinite" }} />
            <p style={{ fontSize: 12, color: C.textMut, margin: 0 }}>AI is analyzing...</p>
          </div>
        )}
 
        {result?.error && (
          <div style={{ background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 9, padding: "10px 14px", fontSize: 13, color: "#dc2626" }}>
            ⚠️ {result.error}
          </div>
        )}
 
        {result && !result.error && cfg && (
          <div>
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
 
            <div style={{ background: "#ecfdf5", borderRadius: 9, border: "1.5px solid #05996928", padding: "10px 12px", marginBottom: 8 }}>
              <p style={{ margin: "0 0 3px", fontSize: 9.5, fontWeight: 600, color: "#059669", textTransform: "uppercase", letterSpacing: "0.8px" }}>Strengths</p>
              <p style={{ margin: 0, fontSize: 12.5, color: C.textSub, lineHeight: 1.6 }}>{result.strengths}</p>
            </div>
 
            <div style={{ background: "#eff6ff", borderRadius: 9, border: "1.5px solid #2563eb28", padding: "10px 12px" }}>
              <p style={{ margin: "0 0 3px", fontSize: 9.5, fontWeight: 600, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.8px" }}>Recommendation</p>
              <p style={{ margin: 0, fontSize: 12.5, color: C.textSub, lineHeight: 1.6 }}>{result.recommendation}</p>
            </div>
 
            <button className="aa-btn" onClick={() => onClear(agent.user_id)} style={{
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
}
 